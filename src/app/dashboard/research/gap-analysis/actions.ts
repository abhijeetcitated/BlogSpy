"use server"

import "server-only"

import { createHash } from "crypto"
import { authAction, z } from "@/lib/safe-action"
import { createClient } from "@/lib/supabase/server"
import { creditBanker } from "@/lib/services/credit-banker.service"
import {
  runGapAnalysis,
  verifyGapKeywords as verifyGapKeywordsLive,
  type GapAnalysisMode,
} from "@/features/competitor-gap/services/gap-analysis.service"
import {
  acquireGapInFlightLock,
  releaseGapInFlightLock,
  reserveProviderBudget,
} from "@/features/competitor-gap/services/gap-runtime-guard.service"
import { GapProviderError } from "@/lib/seo/dataforseo-gap"
import type { GapKeyword, GapType, Intent } from "@/features/competitor-gap/types"

const DOMAIN_REGEX = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/
const GAP_ANALYSIS_CREDIT_COST = 10
const GAP_VERIFY_CREDIT_COST = 1
const GAP_CACHE_TTL_MINUTES = 30

const GAP_MODE_VALUES = ["missing-only", "full-gap"] as const

type GapActionCode =
  | "GAP_QUEUED"
  | "GAP_IN_PROGRESS"
  | "INSUFFICIENT_CREDITS"
  | "GAP_PROVIDER_RATE_LIMIT"
  | "GAP_PROVIDER_BUSY"
  | "GAP_PROVIDER_SPEND_BLOCK"
  | "GAP_PROVIDER_UNAVAILABLE"
  | "GAP_VERIFY_FAILED"
  | "GAP_ANALYSIS_FAILED"

interface GapRunSummary {
  total: number
  missing: number
  weak: number
  strong: number
  shared: number
  totalVolume: number
  avgKD: number
}

type RunGapData = {
  runId: string
  mode: GapAnalysisMode
  source: "live" | "cache"
  summary: GapRunSummary
  keywords: GapKeyword[]
  remainingCredits: number | null
}

export type RunGapAnalysisResponse = {
  success: boolean
  code?: GapActionCode
  error?: string
  retryAfterSeconds?: number
  data?: RunGapData
}

export type GetGapRunResponse = {
  success: boolean
  error?: string
  data?: RunGapData
}

export type VerifyGapKeywordsResponse = {
  success: boolean
  error?: string
  code?: GapActionCode
  data?: {
    runId: string
    updatedKeywords: GapKeyword[]
    remainingCredits: number | null
  }
}

type GapRunRow = {
  id: string
  user_id: string
  mode: GapAnalysisMode
  status: "queued" | "running" | "completed" | "failed"
  your_domain: string
  competitor1_domain: string
  competitor2_domain: string | null
  location_code: number
  language_code: string
  cache_key: string
  cache_expires_at: string | null
  summary: GapRunSummary | null
  upstream_calls_used: number
  provider_cost_estimate: number
  retries_used: number
  queue_wait_ms: number
  request_id: string
  error_code: string | null
  error_message: string | null
  created_at: string
  updated_at: string
}

type GapResultRow = {
  id: string
  run_id: string
  user_id: string
  keyword: string
  intent: Intent
  gap_type: GapType
  has_zero_click_risk: boolean
  your_rank: number | null
  comp1_rank: number | null
  comp2_rank: number | null
  volume: number
  kd: number
  cpc: number
  trend: string
  source: "comp1" | "comp2" | "both"
  your_url: string | null
  comp1_url: string | null
  comp2_url: string | null
  created_at: string
  updated_at: string
}

function normalizeDomain(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .split("/")[0]
    .split("?")[0]
    .split("#")[0]
}

function ensureDomain(value: string): string {
  const normalized = normalizeDomain(value)
  if (!DOMAIN_REGEX.test(normalized)) {
    throw new Error("INVALID_DOMAIN")
  }
  return normalized
}

function computeSummary(keywords: GapKeyword[]): GapRunSummary {
  const total = keywords.length
  const missing = keywords.filter((keyword) => keyword.gapType === "missing").length
  const weak = keywords.filter((keyword) => keyword.gapType === "weak").length
  const strong = keywords.filter((keyword) => keyword.gapType === "strong").length
  const shared = keywords.filter((keyword) => keyword.gapType === "shared").length
  const totalVolume = keywords.reduce((sum, keyword) => sum + keyword.volume, 0)
  const avgKD = total === 0
    ? 0
    : Math.round(keywords.reduce((sum, keyword) => sum + keyword.kd, 0) / total)

  return {
    total,
    missing,
    weak,
    strong,
    shared,
    totalVolume,
    avgKD,
  }
}

function estimateUpstreamCalls(mode: GapAnalysisMode, competitorCount: number): number {
  if (mode === "missing-only") {
    return competitorCount
  }
  return competitorCount * 2
}

function mapProviderError(error: GapProviderError): { code: GapActionCode; message: string; retryAfterSeconds?: number } {
  if (error.providerCode === 40202) {
    return {
      code: "GAP_PROVIDER_RATE_LIMIT",
      message: "High traffic detected. Analysis is delayed, please retry in a few seconds.",
      retryAfterSeconds: 5,
    }
  }

  if (error.providerCode === 40209) {
    return {
      code: "GAP_PROVIDER_BUSY",
      message: "Provider is handling many queries. Please retry shortly.",
      retryAfterSeconds: 5,
    }
  }

  if (error.providerCode === 40203 || error.providerCode === 40210) {
    return {
      code: "GAP_PROVIDER_SPEND_BLOCK",
      message: "Provider account is temporarily unavailable. Please try again later.",
    }
  }

  return {
    code: "GAP_PROVIDER_UNAVAILABLE",
    message: "Gap analysis service is temporarily unavailable.",
  }
}

function buildCacheKey(input: {
  yourDomain: string
  competitorDomains: string[]
  mode: GapAnalysisMode
  locationCode: number
  languageCode: string
  minVolume?: number
  maxKD?: number
}): string {
  const payload = JSON.stringify({
    yourDomain: input.yourDomain,
    competitors: [...input.competitorDomains].sort(),
    mode: input.mode,
    locationCode: input.locationCode,
    languageCode: input.languageCode,
    minVolume: input.minVolume ?? null,
    maxKD: input.maxKD ?? null,
  })

  return createHash("sha256").update(payload).digest("hex")
}

function mapResultRows(rows: GapResultRow[]): GapKeyword[] {
  return rows.map((row) => ({
    id: row.id,
    keyword: row.keyword,
    intent: row.intent,
    gapType: row.gap_type,
    hasZeroClickRisk: row.has_zero_click_risk,
    yourRank: row.your_rank,
    comp1Rank: row.comp1_rank,
    comp2Rank: row.comp2_rank,
    volume: row.volume,
    kd: row.kd,
    cpc: row.cpc,
    trend: (row.trend as GapKeyword["trend"]) ?? "stable",
    yourUrl: row.your_url ?? undefined,
    comp1Url: row.comp1_url ?? undefined,
    comp2Url: row.comp2_url ?? undefined,
    source: row.source,
  }))
}

function classifyGapType(yourRank: number | null, comp1Rank: number | null, comp2Rank: number | null): GapType {
  const competitorRanks = [comp1Rank, comp2Rank].filter((rank): rank is number => typeof rank === "number")
  const bestCompetitor = competitorRanks.length > 0 ? Math.min(...competitorRanks) : null

  if (yourRank === null && bestCompetitor !== null) {
    return "missing"
  }

  if (yourRank !== null && bestCompetitor !== null) {
    if (yourRank > bestCompetitor + 5) {
      return "weak"
    }
    if (yourRank < bestCompetitor - 5) {
      return "strong"
    }
  }

  return "shared"
}

const runGapAnalysisSchema = z.object({
  yourDomain: z.string().min(3).max(253),
  competitor1: z.string().min(3).max(253),
  competitor2: z.string().max(253).optional(),
  mode: z.enum(GAP_MODE_VALUES).default("missing-only"),
  locationCode: z.number().int().positive().default(2840),
  languageCode: z.string().min(2).max(8).default("en"),
  minVolume: z.number().int().min(0).optional(),
  maxKD: z.number().int().min(0).max(100).optional(),
  idempotency_key: z.string().min(8).optional(),
  forceRefresh: z.boolean().optional(),
})

const getGapRunSchema = z.object({
  runId: z.string().uuid("Invalid run ID"),
})

const verifyGapKeywordsSchema = z.object({
  runId: z.string().uuid("Invalid run ID"),
  keywordIds: z.array(z.string().uuid()).max(20).optional(),
  topN: z.number().int().min(1).max(20).default(5),
})

export const runGapAnalysisAction = authAction
  .schema(runGapAnalysisSchema)
  .action(async ({ parsedInput, ctx }): Promise<RunGapAnalysisResponse> => {
    const yourDomain = ensureDomain(parsedInput.yourDomain)
    const competitor1 = ensureDomain(parsedInput.competitor1)
    const competitor2 = parsedInput.competitor2 ? ensureDomain(parsedInput.competitor2) : null
    const competitors = [competitor1, competitor2].filter(Boolean) as string[]

    if (new Set([yourDomain, ...competitors]).size !== 1 + competitors.length) {
      return {
        success: false,
        code: "GAP_ANALYSIS_FAILED",
        error: "Your domain and competitor domains must be different.",
      }
    }

    const cacheKey = buildCacheKey({
      yourDomain,
      competitorDomains: competitors,
      mode: parsedInput.mode,
      locationCode: parsedInput.locationCode,
      languageCode: parsedInput.languageCode,
      minVolume: parsedInput.minVolume,
      maxKD: parsedInput.maxKD,
    })

    const requestId = crypto.randomUUID()
    const supabase = await createClient()

    if (!parsedInput.forceRefresh) {
      const { data: cachedRunData } = await supabase
        .from("competitor_gap_runs")
        .select("*")
        .eq("user_id", ctx.userId)
        .eq("cache_key", cacheKey)
        .eq("status", "completed")
        .gt("cache_expires_at", new Date().toISOString())
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle()

      const cachedRun = (cachedRunData as GapRunRow | null) ?? null

      if (cachedRun) {
        const { data: cachedResults } = await supabase
          .from("competitor_gap_results")
          .select("*")
          .eq("user_id", ctx.userId)
          .eq("run_id", cachedRun.id)
          .order("volume", { ascending: false })
          .returns<GapResultRow[]>()

        return {
          success: true,
          data: {
            runId: cachedRun.id,
            mode: cachedRun.mode,
            source: "cache",
            summary: cachedRun.summary ?? computeSummary([]),
            keywords: mapResultRows(cachedResults ?? []),
            remainingCredits: null,
          },
        }
      }
    }

    const lockAcquired = await acquireGapInFlightLock(cacheKey)
    if (!lockAcquired) {
      const { data: runningData } = await supabase
        .from("competitor_gap_runs")
        .select("id")
        .eq("user_id", ctx.userId)
        .eq("cache_key", cacheKey)
        .in("status", ["queued", "running"])
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle()

      const running = (runningData as { id: string } | null) ?? null

      return {
        success: false,
        code: "GAP_IN_PROGRESS",
        error: "Same analysis is already in progress.",
        data: running
          ? {
              runId: running.id,
              mode: parsedInput.mode,
              source: "live",
              summary: computeSummary([]),
              keywords: [],
              remainingCredits: null,
            }
          : undefined,
      }
    }

    let charged = false
    let runId: string | null = null
    let idempotencyKey: string | null = null

    try {
      const estimatedCalls = estimateUpstreamCalls(parsedInput.mode, competitors.length)
      const budget = await reserveProviderBudget(estimatedCalls)

      if (!budget.granted) {
        const { data: queuedRunData, error: queuedError } = await supabase
          .from("competitor_gap_runs")
          .insert({
            user_id: ctx.userId,
            mode: parsedInput.mode,
            status: "queued",
            your_domain: yourDomain,
            competitor1_domain: competitor1,
            competitor2_domain: competitor2,
            location_code: parsedInput.locationCode,
            language_code: parsedInput.languageCode,
            cache_key: cacheKey,
            request_id: requestId,
            queue_wait_ms: budget.retryAfterSeconds * 1000,
          })
          .select("id")
          .single()

        const queuedRun = (queuedRunData as { id: string } | null) ?? null

        if (!queuedError && queuedRun) {
          await supabase
            .from("competitor_gap_jobs")
            .insert({
              user_id: ctx.userId,
              run_id: queuedRun.id,
              status: "queued",
              dedupe_key: cacheKey,
              payload: {
                mode: parsedInput.mode,
                locationCode: parsedInput.locationCode,
                languageCode: parsedInput.languageCode,
              },
            })
        }

        return {
          success: false,
          code: "GAP_QUEUED",
          retryAfterSeconds: budget.retryAfterSeconds,
          error: "High traffic detected. Request queued, retry shortly.",
        }
      }

      idempotencyKey = ctx.idempotencyKey ?? parsedInput.idempotency_key ?? `gap:${ctx.userId}:${crypto.randomUUID()}`

      const deductResult = await creditBanker.deduct(
        ctx.userId,
        GAP_ANALYSIS_CREDIT_COST,
        "competitor_gap_analysis",
        `Competitor Gap analysis for ${yourDomain}`,
        {
          yourDomain,
          competitor1,
          competitor2,
          mode: parsedInput.mode,
          locationCode: parsedInput.locationCode,
          languageCode: parsedInput.languageCode,
        },
        idempotencyKey
      )

      if (!deductResult.success) {
        return {
          success: false,
          code: "INSUFFICIENT_CREDITS",
          error: "Insufficient credits. Gap analysis requires 10 credits.",
        }
      }

      charged = true

      const { data: runInsertData, error: runInsertError } = await supabase
        .from("competitor_gap_runs")
        .insert({
          user_id: ctx.userId,
          mode: parsedInput.mode,
          status: "running",
          your_domain: yourDomain,
          competitor1_domain: competitor1,
          competitor2_domain: competitor2,
          location_code: parsedInput.locationCode,
          language_code: parsedInput.languageCode,
          cache_key: cacheKey,
          request_id: requestId,
        })
        .select("id")
        .single()

      const runInsert = (runInsertData as { id: string } | null) ?? null

      if (runInsertError || !runInsert) {
        throw new Error("GAP_ANALYSIS_FAILED")
      }

      runId = runInsert.id

      await supabase
        .from("competitor_gap_jobs")
        .insert({
          user_id: ctx.userId,
          run_id: runId,
          status: "processing",
          dedupe_key: cacheKey,
          payload: {
            mode: parsedInput.mode,
            locationCode: parsedInput.locationCode,
            languageCode: parsedInput.languageCode,
          },
        })

      const analysis = await runGapAnalysis({
        yourDomain,
        competitor1Domain: competitor1,
        competitor2Domain: competitor2,
        locationCode: parsedInput.locationCode,
        languageCode: parsedInput.languageCode,
        mode: parsedInput.mode,
        includeSerpInfo: false,
        includeClickstreamData: false,
        includeRankedKeywordsFallback: false,
        limitPerCall: 200,
      })

      const filteredKeywords = analysis.keywords.filter((keyword) => {
        if (typeof parsedInput.minVolume === "number" && keyword.volume < parsedInput.minVolume) {
          return false
        }

        if (typeof parsedInput.maxKD === "number" && keyword.kd > parsedInput.maxKD) {
          return false
        }

        return true
      })

      const summary = computeSummary(filteredKeywords)
      const cacheExpiresAt = new Date(Date.now() + GAP_CACHE_TTL_MINUTES * 60 * 1000).toISOString()

      if (filteredKeywords.length > 0) {
        const rows = filteredKeywords.map((keyword) => ({
          run_id: runId,
          user_id: ctx.userId,
          keyword: keyword.keyword,
          intent: keyword.intent,
          gap_type: keyword.gapType,
          has_zero_click_risk: Boolean(keyword.hasZeroClickRisk),
          your_rank: keyword.yourRank,
          comp1_rank: keyword.comp1Rank,
          comp2_rank: keyword.comp2Rank,
          volume: keyword.volume,
          kd: keyword.kd,
          cpc: keyword.cpc ?? 0,
          trend: keyword.trend,
          source: keyword.source,
          your_url: keyword.yourUrl ?? null,
          comp1_url: keyword.comp1Url ?? null,
          comp2_url: keyword.comp2Url ?? null,
        }))

        const { error: insertError } = await supabase
          .from("competitor_gap_results")
          .insert(rows)

        if (insertError) {
          throw new Error("GAP_ANALYSIS_FAILED")
        }
      }

      await supabase
        .from("competitor_gap_runs")
        .update({
          status: "completed",
          summary,
          upstream_calls_used: analysis.upstreamCallsUsed,
          provider_cost_estimate: analysis.providerCostEstimate,
          retries_used: analysis.retriesUsed,
          cache_expires_at: cacheExpiresAt,
          queue_wait_ms: 0,
          error_code: null,
          error_message: null,
        })
        .eq("id", runId)
        .eq("user_id", ctx.userId)

      await supabase
        .from("competitor_gap_jobs")
        .update({
          status: "completed",
          completed_at: new Date().toISOString(),
        })
        .eq("run_id", runId)
        .eq("user_id", ctx.userId)

      const { data: persistedRows } = await supabase
        .from("competitor_gap_results")
        .select("*")
        .eq("run_id", runId)
        .eq("user_id", ctx.userId)
        .order("volume", { ascending: false })
        .returns<GapResultRow[]>()

      return {
        success: true,
        data: {
          runId,
          mode: parsedInput.mode,
          source: "live",
          summary,
          keywords: mapResultRows(persistedRows ?? []),
          remainingCredits: deductResult.remaining,
        },
      }
    } catch (error) {
      if (charged && idempotencyKey) {
        await creditBanker.refund(
          ctx.userId,
          GAP_ANALYSIS_CREDIT_COST,
          idempotencyKey,
          "Refund: competitor gap analysis failed"
        )
      }

      let mappedCode: GapActionCode = "GAP_ANALYSIS_FAILED"
      let mappedMessage = "Gap analysis failed unexpectedly."
      let retryAfterSeconds: number | undefined

      if (error instanceof GapProviderError) {
        const mapped = mapProviderError(error)
        mappedCode = mapped.code
        mappedMessage = mapped.message
        retryAfterSeconds = mapped.retryAfterSeconds
      }

      if (runId) {
        await supabase
          .from("competitor_gap_runs")
          .update({
            status: "failed",
            error_code: mappedCode,
            error_message: mappedMessage,
          })
          .eq("id", runId)
          .eq("user_id", ctx.userId)

        await supabase
          .from("competitor_gap_jobs")
          .update({
            status: "failed",
            error_code: mappedCode,
            error_message: mappedMessage,
            completed_at: new Date().toISOString(),
          })
          .eq("run_id", runId)
          .eq("user_id", ctx.userId)
      }

      return {
        success: false,
        code: mappedCode,
        error: mappedMessage,
        retryAfterSeconds,
      }
    } finally {
      await releaseGapInFlightLock(cacheKey)
    }
  })

export const getGapRunAction = authAction
  .schema(getGapRunSchema)
  .action(async ({ parsedInput, ctx }): Promise<GetGapRunResponse> => {
    const supabase = await createClient()

    const { data: runData } = await supabase
      .from("competitor_gap_runs")
      .select("*")
      .eq("id", parsedInput.runId)
      .eq("user_id", ctx.userId)
      .maybeSingle()

    const run = (runData as GapRunRow | null) ?? null

    if (!run) {
      return {
        success: false,
        error: "Analysis run not found.",
      }
    }

    const { data: rows } = await supabase
      .from("competitor_gap_results")
      .select("*")
      .eq("run_id", run.id)
      .eq("user_id", ctx.userId)
      .order("volume", { ascending: false })
      .returns<GapResultRow[]>()

    return {
      success: true,
      data: {
        runId: run.id,
        mode: run.mode,
        source: "live",
        summary: run.summary ?? computeSummary([]),
        keywords: mapResultRows(rows ?? []),
        remainingCredits: null,
      },
    }
  })

export const verifyGapKeywordsAction = authAction
  .schema(verifyGapKeywordsSchema)
  .action(async ({ parsedInput, ctx }): Promise<VerifyGapKeywordsResponse> => {
    const supabase = await createClient()

    const { data: runData } = await supabase
      .from("competitor_gap_runs")
      .select("*")
      .eq("id", parsedInput.runId)
      .eq("user_id", ctx.userId)
      .maybeSingle()

    const run = (runData as GapRunRow | null) ?? null

    if (!run) {
      return {
        success: false,
        code: "GAP_VERIFY_FAILED",
        error: "Analysis run not found.",
      }
    }

    let query = supabase
      .from("competitor_gap_results")
      .select("*")
      .eq("run_id", run.id)
      .eq("user_id", ctx.userId)
      .order("volume", { ascending: false })
      .limit(parsedInput.topN)

    if (parsedInput.keywordIds && parsedInput.keywordIds.length > 0) {
      query = supabase
        .from("competitor_gap_results")
        .select("*")
        .eq("run_id", run.id)
        .eq("user_id", ctx.userId)
        .in("id", parsedInput.keywordIds)
        .limit(20)
    }

    const { data: resultRows } = await query.returns<GapResultRow[]>()

    if (!resultRows || resultRows.length === 0) {
      return {
        success: false,
        code: "GAP_VERIFY_FAILED",
        error: "No keywords available for verification.",
      }
    }

    const budget = await reserveProviderBudget(resultRows.length)
    if (!budget.granted) {
      return {
        success: false,
        code: "GAP_PROVIDER_RATE_LIMIT",
        error: "Verification delayed due to high traffic. Please retry shortly.",
        data: {
          runId: run.id,
          updatedKeywords: [],
          remainingCredits: null,
        },
      }
    }

    const idempotencyKey = ctx.idempotencyKey ?? `gap-verify:${ctx.userId}:${crypto.randomUUID()}`
    const deductResult = await creditBanker.deduct(
      ctx.userId,
      GAP_VERIFY_CREDIT_COST,
      "competitor_gap_verify",
      `Competitor Gap verify for run ${run.id}`,
      {
        runId: run.id,
        keywordCount: resultRows.length,
      },
      idempotencyKey
    )

    if (!deductResult.success) {
      return {
        success: false,
        code: "INSUFFICIENT_CREDITS",
        error: "Insufficient credits. Verification requires 1 credit.",
      }
    }

    try {
      const verification = await verifyGapKeywordsLive({
        yourDomain: run.your_domain,
        competitor1Domain: run.competitor1_domain,
        competitor2Domain: run.competitor2_domain,
        locationCode: run.location_code,
        languageCode: run.language_code,
        keywords: resultRows.map((row) => row.keyword),
      })

      const updatesByKeyword = new Map(
        verification.updated.map((entry) => [entry.keyword.toLowerCase(), entry])
      )

      for (const row of resultRows) {
        const update = updatesByKeyword.get(row.keyword.toLowerCase())
        if (!update) {
          continue
        }

        const nextGapType = classifyGapType(update.yourRank, update.comp1Rank, update.comp2Rank)

        await supabase
          .from("competitor_gap_results")
          .update({
            your_rank: update.yourRank,
            comp1_rank: update.comp1Rank,
            comp2_rank: update.comp2Rank,
            your_url: update.yourUrl,
            comp1_url: update.comp1Url,
            comp2_url: update.comp2Url,
            has_zero_click_risk: update.hasZeroClickRisk,
            gap_type: nextGapType,
          })
          .eq("id", row.id)
          .eq("user_id", ctx.userId)
      }

      const { data: refreshedRows } = await supabase
        .from("competitor_gap_results")
        .select("*")
        .eq("run_id", run.id)
        .eq("user_id", ctx.userId)
        .order("volume", { ascending: false })
        .returns<GapResultRow[]>()

      const updatedKeywords = mapResultRows(refreshedRows ?? [])
      const summary = computeSummary(updatedKeywords)

      await supabase
        .from("competitor_gap_runs")
        .update({
          summary,
          upstream_calls_used: (run.upstream_calls_used ?? 0) + verification.upstreamCallsUsed,
          provider_cost_estimate: (run.provider_cost_estimate ?? 0) + verification.providerCostEstimate,
          retries_used: (run.retries_used ?? 0) + verification.retriesUsed,
        })
        .eq("id", run.id)
        .eq("user_id", ctx.userId)

      return {
        success: true,
        data: {
          runId: run.id,
          updatedKeywords,
          remainingCredits: deductResult.remaining,
        },
      }
    } catch (error) {
      await creditBanker.refund(
        ctx.userId,
        GAP_VERIFY_CREDIT_COST,
        idempotencyKey,
        "Refund: competitor gap verify failed"
      )

      if (error instanceof GapProviderError) {
        const mapped = mapProviderError(error)
        return {
          success: false,
          code: mapped.code,
          error: mapped.message,
        }
      }

      return {
        success: false,
        code: "GAP_VERIFY_FAILED",
        error: "Keyword verification failed.",
      }
    }
  })
