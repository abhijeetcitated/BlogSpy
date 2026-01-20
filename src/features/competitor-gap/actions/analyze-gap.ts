// ============================================
// COMPETITOR GAP - Analyze Action
// ============================================

"use server"

import { authAction, z } from "@/src/lib/safe-action"
import { createServerClient } from "@/src/lib/supabase/server"
import { rateLimiter } from "@/src/lib/rate-limit"
import { classifyGap, calculateTrafficPotential } from "../utils/gap-logic"
import { analyzeGap as analyzeGapApi } from "../services/gap-api"
import { normalizeCountryCode } from "@/src/features/keyword-research/utils/country-normalizer"

const CACHE_TTL_DAYS = 7
const GAP_CREDIT_COST = 10

const DomainSchema = z
  .string()
  .trim()
  .min(1)
  .transform((value) => {
    const normalized = value
      .replace(/^https?:\/\//, "")
      .replace(/^www\./, "")
      .split("/")[0]
      .toLowerCase()
    return normalized
  })
  .refine((value) => /^[a-z0-9-]+(\.[a-z0-9-]+)+$/.test(value), {
    message: "Invalid domain format",
  })

const AnalyzeGapSchema = z.object({
  targets: z.array(DomainSchema).min(2).max(3),
  countryCode: z.string().trim().min(2).max(2).transform(normalizeCountryCode),
})

type AnalyzeGapInput = z.infer<typeof AnalyzeGapSchema>

type GapReportItem = {
  keyword: string
  volume: number
  kd: number
  cpc: number
  myRank: number | null
  compRanks: Array<number | null>
  gapType: ReturnType<typeof classifyGap>
  estimatedTraffic: number
}

function isServerMockMode(): boolean {
  return process.env.USE_MOCK_DATA === "true" || process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true"
}

async function deductCredits(
  userId: string,
  amount: number,
  reason: "gap_analysis"
): Promise<boolean> {
  if (isServerMockMode()) {
    console.log("[analyzeGap] Mock mode - skipping credit deduction")
    return true
  }

  const supabase = await createServerClient()

  const attemptRpc = async (rpcName: string): Promise<boolean> => {
    const { data, error } = await (supabase as typeof supabase & {
      rpc: (fn: string, args: Record<string, unknown>) => Promise<{ data: unknown; error: { message: string } | null }>
    }).rpc(rpcName, {
      p_user_id: userId,
      p_amount: amount,
      p_feature: reason,
      p_description: "Competitor Gap Analysis",
    })

    if (error) {
      console.error(`[analyzeGap] ${rpcName} RPC error:`, error.message)
      return false
    }

    const result = Array.isArray(data) ? data[0] : data
    if (result?.success === false || result === false) {
      return false
    }

    return true
  }

  const deducted = await attemptRpc("deduct_credits")
  if (deducted) return true

  const used = await attemptRpc("use_credits")
  if (used) return true

  const { data: credits, error: creditsError } = await supabase
    .from("user_credits")
    .select("credits_total, credits_used")
    .eq("user_id", userId)
    .single()

  if (creditsError || !credits) {
    return false
  }

  const remaining = (credits.credits_total ?? 0) - (credits.credits_used ?? 0)
  if (remaining < amount) {
    return false
  }

  const { error: updateError } = await supabase
    .from("user_credits")
    .update({ credits_used: (credits.credits_used ?? 0) + amount })
    .eq("user_id", userId)

  return !updateError
}

export const analyzeGap = authAction
  .schema(AnalyzeGapSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { targets, countryCode } = parsedInput
    const supabase = await createServerClient()
    const now = new Date()
    const expiresAt = new Date(now.getTime() + CACHE_TTL_DAYS * 24 * 60 * 60 * 1000)
    const targetsKey = targets.join("|")

    const rateLimit = await rateLimiter.limit(ctx.userId)
    if (!rateLimit.success) {
      return {
        success: false,
        error: "Rate limit exceeded. Slow down.",
      }
    }

    const gapReports = (supabase as unknown as { from: (table: string) => any }).from("gap_reports")
    const { data: cached, error: cacheError } = await gapReports
      .select("report_data, expires_at")
      .eq("user_id", ctx.userId)
      .eq("target_domain", targetsKey)
      .eq("country_code", countryCode)
      .gt("expires_at", now.toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()

    if (!cacheError && cached?.report_data) {
      return {
        success: true,
        source: "cache",
        data: cached.report_data,
      }
    }

    const creditOk = await deductCredits(ctx.userId, GAP_CREDIT_COST, "gap_analysis")
    if (!creditOk) {
      return {
        success: false,
        error: "Insufficient credits.",
      }
    }

    try {
      const intersection = await analyzeGapApi(targets[0], targets.slice(1), countryCode)
      const items: GapReportItem[] = intersection.map((entry) => {
        const allRanks = [entry.myRank, ...entry.compRanks].filter((rank): rank is number => Number.isFinite(rank))
        const bestRank = allRanks.length > 0 ? Math.min(...allRanks) : null
        const bestCompRank = entry.compRanks
          .filter((rank): rank is number => Number.isFinite(rank))
          .reduce((best, rank) => {
            if (best === null) return rank
            return Math.min(best, rank)
          }, null as number | null)
        return {
          ...entry,
          gapType: classifyGap(entry.myRank, entry.compRanks),
          estimatedTraffic: calculateTrafficPotential(entry.volume, bestRank),
        }
      })

    const reportPayload = {
      targets,
      countryCode,
      generatedAt: now.toISOString(),
      items,
    }

    const { error: insertError } = await gapReports.insert({
      user_id: ctx.userId,
      target_domain: targetsKey,
      targets,
      country_code: countryCode,
      report_data: reportPayload,
      expires_at: expiresAt.toISOString(),
      })

      if (insertError) {
        console.error("[analyzeGap] Failed to store report:", insertError.message)
      }

      return {
        success: true,
        source: "live",
        data: reportPayload,
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to fetch gap analysis."
      return {
        success: false,
        error: message,
      }
    }
  })

export const analyzeGapAction = analyzeGap
