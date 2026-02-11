"use server"
import "server-only"

// ============================================
// KEYWORD RESEARCH ACTIONS (BlogSpy 2.0 reset)
// ============================================

import { z } from "zod"
import { headers } from "next/headers"
import arcjet, { detectBot, shield, type ArcjetWellKnownBot } from "@arcjet/next"
import { Redis } from "@upstash/redis"
import { publicAction, authenticatedAction } from "@/lib/safe-action"
import { createAdminClient, createClient } from "@/lib/supabase/server"
import { creditBanker } from "@/lib/services/credit-banker.service"
import { getDataForSEOClient, DATAFORSEO_ENDPOINTS, type DataForSEOResponse } from "@/lib/seo/dataforseo"
import { keywordService } from "../services/keyword.service"
import { liveSerpService } from "../services/live-serp"
import { enforceKeywordRateLimit } from "@/lib/ratelimit"
import { buildCacheSlug, sanitizeKeywordInput } from "../utils/input-parser"
import { calculateRTV } from "../utils/rtv-calculator"
import { buildKwCachePayload } from "../utils/data-mapper"
import type { Keyword, MatchType } from "../types"
import { getNumericLocationCode } from "@/config/locations"

const FetchKeywordsSchema = z.object({
  query: z.string().min(1, "Query is required"),
  country: z.string().default("US"),
  languageCode: z.string().optional(),
  deviceType: z.string().optional(),
  matchType: z.string().optional(),
})

export interface FetchKeywordsResult {
  success: true
  data: Keyword[]
}

export const fetchKeywords = publicAction
  .schema(FetchKeywordsSchema)
  .action(async ({ parsedInput }): Promise<FetchKeywordsResult> => {
    const matchType = (parsedInput.matchType ?? "broad").toString()
    const country = parsedInput.country || "US"
    const languageCode = parsedInput.languageCode?.trim().toLowerCase() || "en"
    const deviceType = normalizeDeviceType(parsedInput.deviceType)
    const numericLocationCode = getNumericLocationCode(country)
    const keyword = sanitizeKeywordInput(parsedInput.query)

    if (!keyword) {
      throw new Error("KEYWORD_REQUIRED")
    }

    if (!process.env.DATAFORSEO_LOGIN || !process.env.DATAFORSEO_PASSWORD) {
      throw new Error("MISSING_API_CREDENTIALS")
    }

    const supabase = await createClient()
    const splitResult = await runSplitTimingSearch({
      supabase,
      keywords: [keyword],
      country,
      languageCode,
      deviceType,
      matchType,
      numericLocationCode,
      forensicRequested: false,
      depth: 0,
      serpDispatchMode: "skip",
    })

    return { success: true, data: splitResult.data }
  })

const BulkSearchSchema = z
  .object({
    keyword: z.string().min(1).optional(),
    keywords: z.array(z.string().min(1)).optional(),
    country: z.string().default("US"),
    languageCode: z.string().optional(),
    deviceType: z.string().optional(),
    matchType: z.string().optional(),
    idempotency_key: z.string().min(1, "Idempotency key is required"),
    user_system_priority: z.string().optional(),
    admin_validation_token: z.string().optional(),
    isForensic: z.boolean().optional(),
    depth: z.union([z.literal(5), z.literal(10), z.number().int()]).optional(),
    forensic_enabled: z.union([z.boolean(), z.string()]).optional(),
    forensic_depth: z.string().optional(),
  })
  .superRefine((value, ctx) => {
    if (!value.keyword && !value.keywords) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Keyword is required",
        path: ["keyword"],
      })
    }
  })

export interface BulkSearchResult {
  success: true
  data: Keyword[]
  balance: number
  newBalance?: number
  fromCache?: boolean
  forensicError?: boolean
  forensicRefund?: number
}

const LABS_TTL_MS = 30 * 24 * 60 * 60 * 1000
const SERP_TTL_MS = 7 * 24 * 60 * 60 * 1000
const CACHE_DELAY_MS = 1500
const SEO_BOT_ALLOW = ["GOOGLE_SEO", "BING_SEO"] as unknown as ArcjetWellKnownBot[]
const HONEYPOT_FIELDS = ["user_system_priority", "admin_validation_token"] as const
const rateLimitRedis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})
const SERP_LIVE_TRAFFIC_KEY = "blogspy:serp:live"
const SERP_LIVE_WINDOW_SEC = 60

const aj = arcjet({
  key: process.env.NEXT_PUBLIC_ARCJET_KEY!,
  rules: [
    shield({ mode: "LIVE" }),
    detectBot({
      mode: "LIVE",
      allow: SEO_BOT_ALLOW,
    }),
  ],
})

async function getSerpLiveTrafficCount(): Promise<number> {
  try {
    const value = await rateLimitRedis.get<number>(SERP_LIVE_TRAFFIC_KEY)
    return typeof value === "number" ? value : 0
  } catch (error) {
    console.warn("[SERP] Failed to read live traffic count", error)
    return 0
  }
}

function isBotRequest(parsedInput: Record<string, unknown> | null): boolean {
  if (!parsedInput) return false
  return HONEYPOT_FIELDS.some((field) => {
    const value = parsedInput[field]
    if (value === null || value === undefined) return false
    return String(value).trim().length > 0
  })
}

function getClientIp(requestHeaders: Headers): string {
  const forwardedFor = requestHeaders.get("x-forwarded-for")
  if (forwardedFor) {
    const [first] = forwardedFor.split(",")
    if (first) return first.trim()
  }

  const realIp = requestHeaders.get("x-real-ip")
  return realIp ?? "unknown"
}

async function bumpSerpLiveTraffic(count: number): Promise<void> {
  if (!count || count <= 0) return
  try {
    const pipeline = rateLimitRedis.pipeline()
    pipeline.incrby(SERP_LIVE_TRAFFIC_KEY, count)
    pipeline.expire(SERP_LIVE_TRAFFIC_KEY, SERP_LIVE_WINDOW_SEC)
    await pipeline.exec()
  } catch (error) {
    console.warn("[SERP] Failed to bump live traffic counter", error)
  }
}

type CacheRow = {
  slug: string
  raw_data: unknown
  analysis_data: unknown
  last_labs_update: string | null
  last_serp_update: string | null
}

type SerpDispatchMode = "skip" | "live" | "queue"

type QueueMeta = {
  userId: string
  idempotencyKey: string
  refundAmount: number
  postbackUrl: string | null
}

type SerpQueueRequest = {
  keyword: string
  cacheSlug: string
}

function isFreshTimestamp(timestamp: string | null | undefined, ttlMs: number): boolean {
  if (!timestamp) return false
  const time = new Date(timestamp).getTime()
  if (Number.isNaN(time)) return false
  return Date.now() - time < ttlMs
}

function normalizeKeywordKey(keyword: string): string {
  return keyword.trim().toLowerCase()
}

const DEVICE_TYPES = new Set(["desktop", "mobile", "tablet"] as const)
type DeviceType = "desktop" | "mobile" | "tablet"

function normalizeDeviceType(value?: string): DeviceType {
  const normalized = value?.trim().toLowerCase()
  if (normalized && DEVICE_TYPES.has(normalized as DeviceType)) {
    return normalized as DeviceType
  }
  return "desktop"
}

function resolvePostbackUrl(requestHeaders: Headers): string | null {
  const explicit =
    process.env.DATAFORSEO_POSTBACK_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_SITE_URL

  if (explicit) {
    return `${explicit.replace(/\/$/, "")}/api/webhooks/serp`
  }

  const host = requestHeaders.get("x-forwarded-host") || requestHeaders.get("host")
  if (!host) return null

  const proto = requestHeaders.get("x-forwarded-proto") || "https"
  return `${proto}://${host}/api/webhooks/serp`
}

function parseCachedKeywords(data: unknown): Keyword[] {
  return Array.isArray(data) ? (data as Keyword[]) : []
}

function applyCacheMetadata(
  keywords: Keyword[],
  labsUpdatedAt: string | null,
  serpUpdatedAt: string | null
): Keyword[] {
  return keywords.map((keyword) => ({
    ...keyword,
    lastLabsUpdate: labsUpdatedAt ?? keyword.lastLabsUpdate ?? null,
    lastSerpUpdate: serpUpdatedAt ?? keyword.lastSerpUpdate ?? null,
  }))
}

function markFromCache(keywords: Keyword[], fromCache: boolean): Keyword[] {
  return keywords.map((keyword) => ({
    ...keyword,
    fromCache,
  }))
}

function stripSerpAnalysis(keywords: Keyword[], labsUpdatedAt: string | null): Keyword[] {
  return keywords.map((keyword) => {
    const rtvResult = calculateRTV(keyword.volume ?? 0, [], keyword.cpc ?? 0)
    return {
      ...keyword,
      geoScore: null,
      weakSpots: { reddit: null, quora: null, pinterest: null, ranked: [] },
      serpFeatures: [],
      hasAio: false,
      rtv: rtvResult.rtv,
      rtvBreakdown: rtvResult.breakdown,
      lastLabsUpdate: labsUpdatedAt ?? keyword.lastLabsUpdate ?? null,
      lastSerpUpdate: null,
    }
  })
}

function markRefreshingByKeyword(keywords: Keyword[], refreshingSet: Set<string>): Keyword[] {
  if (refreshingSet.size === 0) return keywords
  return keywords.map((keyword) => ({
    ...keyword,
    isRefreshing: refreshingSet.has(normalizeKeywordKey(keyword.keyword)),
    serpStatus: refreshingSet.has(normalizeKeywordKey(keyword.keyword)) ? "pending" : keyword.serpStatus,
  }))
}

function mergeLabsWithCache(
  labsKeywords: Keyword[],
  cachedKeywords: Keyword[],
  labsUpdatedAt: string,
  serpUpdatedAt: string | null
): Keyword[] {
  const cacheMap = new Map<string, Keyword>()
  cachedKeywords.forEach((keyword) => {
    cacheMap.set(normalizeKeywordKey(keyword.keyword), keyword)
  })

  return labsKeywords.map((labsKeyword) => {
    const cached = cacheMap.get(normalizeKeywordKey(labsKeyword.keyword))
    const serpFeatures = cached?.serpFeatures ?? labsKeyword.serpFeatures
    const weakSpots = cached?.weakSpots ?? labsKeyword.weakSpots
    const geoScore = cached?.geoScore ?? labsKeyword.geoScore
    const hasAio = cached?.hasAio ?? labsKeyword.hasAio
    const rtvResult = calculateRTV(
      labsKeyword.volume,
      serpFeatures.map((feature) => ({ type: feature })),
      labsKeyword.cpc
    )

    return {
      ...labsKeyword,
      serpFeatures,
      weakSpots,
      geoScore,
      hasAio,
      rtv: rtvResult.rtv,
      rtvBreakdown: rtvResult.breakdown,
      lastUpdated: new Date(),
      lastRefreshedAt: cached?.lastRefreshedAt ?? labsKeyword.lastRefreshedAt ?? null,
      lastLabsUpdate: labsUpdatedAt,
      lastSerpUpdate: serpUpdatedAt ?? cached?.lastSerpUpdate ?? null,
    }
  })
}

async function hydrateSerpForKeywords(
  cachedKeywords: Keyword[],
  locationCode: number,
  languageCode: string,
  deviceType: string,
  serpUpdatedAt: string,
  labsUpdatedAt: string | null
): Promise<Keyword[]> {
  const updated = await Promise.all(
    cachedKeywords.map(async (keyword) => {
      const serpData = await liveSerpService.fetchLiveSerp(
        keyword.keyword,
        locationCode,
        languageCode,
        deviceType
      )
      const rtvResult = calculateRTV(
        keyword.volume,
        serpData.rawItems ?? [],
        keyword.cpc
      )

      return {
        ...keyword,
        weakSpots: {
          reddit: serpData.weakSpots.reddit ?? keyword.weakSpots.reddit ?? null,
          quora: serpData.weakSpots.quora ?? keyword.weakSpots.quora ?? null,
          pinterest: serpData.weakSpots.pinterest ?? keyword.weakSpots.pinterest ?? null,
          ranked: keyword.weakSpots.ranked ?? [],
        },
        serpFeatures: serpData.serpFeatures ?? keyword.serpFeatures,
        geoScore: serpData.geoScore ?? keyword.geoScore,
        hasAio: serpData.hasAio ?? keyword.hasAio,
        rtv: rtvResult.rtv,
        rtvBreakdown: rtvResult.breakdown,
        lastUpdated: new Date(),
        lastRefreshedAt: serpUpdatedAt,
        lastLabsUpdate: labsUpdatedAt ?? keyword.lastLabsUpdate ?? null,
        lastSerpUpdate: serpUpdatedAt,
      }
    })
  )

  return updated
}

async function hydrateSerpForTopKeywords(
  baseKeywords: Keyword[],
  limit: number,
  locationCode: number,
  languageCode: string,
  deviceType: string,
  serpUpdatedAt: string,
  labsUpdatedAt: string | null
): Promise<Keyword[]> {
  if (limit <= 0) return baseKeywords
  const targets = baseKeywords.slice(0, limit)
  if (targets.length === 0) return baseKeywords

  const updatedTargets = await hydrateSerpForKeywords(
    targets,
    locationCode,
    languageCode,
    deviceType,
    serpUpdatedAt,
    labsUpdatedAt
  )

  const updatedMap = new Map<string, Keyword>()
  updatedTargets.forEach((keyword) => {
    updatedMap.set(normalizeKeywordKey(keyword.keyword), keyword)
  })

  return baseKeywords.map((keyword) => updatedMap.get(normalizeKeywordKey(keyword.keyword)) ?? keyword)
}

async function queueSerpTasks({
  requests,
  locationCode,
  languageCode,
  deviceType,
  postbackUrl,
  userId,
  idempotencyKey,
  refundAmount,
}: {
  requests: SerpQueueRequest[]
  locationCode: number
  languageCode: string
  deviceType: string
  postbackUrl: string | null
  userId: string
  idempotencyKey: string
  refundAmount: number
}): Promise<void> {
  if (requests.length === 0) return
  if (!postbackUrl) {
    throw new Error("MISSING_SERP_POSTBACK_URL")
  }

  const dataforseo = getDataForSEOClient()
  const normalizedDevice = deviceType?.trim().toLowerCase()
  const tag = JSON.stringify({ idempotencyKey, refundAmount })

  const payload = requests.map((request) => {
    const taskIdempotencyKey = `${idempotencyKey}:${request.cacheSlug}`
    const tag = JSON.stringify({ idempotencyKey: taskIdempotencyKey, refundAmount: 1 })

    const base: Record<string, unknown> = {
      keyword: request.keyword,
      location_code: locationCode,
      language_code: languageCode,
      depth: 20,
      se_domain: "google.com",
      priority: 2,
      postback_url: postbackUrl,
      tag,
    }

    if (normalizedDevice && normalizedDevice !== "all") {
      base.device = normalizedDevice
    }

    return base
  })

  const { data } = await dataforseo.post<DataForSEOResponse<unknown>>(
    DATAFORSEO_ENDPOINTS.SERP_TASK_POST,
    payload
  )

  const tasks = data.tasks ?? []
  if (tasks.length === 0) {
    throw new Error("SERP_TASK_QUEUE_EMPTY")
  }

  const queueRows = tasks
    .map((task, index) => {
      const request = requests[index]
      if (!request || !task?.id) return null
      return {
        task_id: task.id,
        user_id: userId,
        keyword_slug: request.cacheSlug,
        status: task.status_code === 20000 ? "pending" : "failed",
      }
    })
    .filter(Boolean) as Array<{
    task_id: string
    user_id: string
    keyword_slug: string
    status: string
  }>

  if (queueRows.length > 0) {
    const admin = createAdminClient()
    await admin.from("kw_serp_tasks").insert(queueRows)
  }

  const failedTask = tasks.find((task) => task.status_code !== 20000)
  if (failedTask) {
    throw new Error(failedTask.status_message || "SERP_TASK_QUEUE_FAILED")
  }
}

type SplitTimingResult = {
  data: Keyword[]
  apiUsed: boolean
  fromCache: boolean
  forensicError?: boolean
  forensicErrorMessage?: string
}

async function runSplitTimingSearch({
  supabase,
  keywords,
  country,
  languageCode,
  deviceType,
  matchType,
  numericLocationCode,
  forensicRequested,
  depth,
  serpDispatchMode,
  queueMeta,
}: {
  supabase: Awaited<ReturnType<typeof createClient>>
  keywords: string[]
  country: string
  languageCode: string
  deviceType: string
  matchType: string
  numericLocationCode: number
  forensicRequested: boolean
  depth: number
  serpDispatchMode: SerpDispatchMode
  queueMeta?: QueueMeta
}): Promise<SplitTimingResult> {
  const admin = createAdminClient()
  const serpDispatch = serpDispatchMode ?? "skip"
  let forensicError = false
  let forensicErrorMessage: string | null = null
  const requests = keywords.map((keyword) => ({
    keyword,
    slug: buildCacheSlug(keyword, country, languageCode, deviceType),
  }))
  const serpEligibleSlugs = new Set(
    forensicRequested ? requests.slice(0, depth).map((request) => request.slug) : []
  )

  const slugs = requests.map((request) => request.slug)
  const cachedResults: Keyword[] = []
  const toFetch: Array<{
    keyword: string
    slug: string
    cachedLabs: Keyword[]
    cachedSerp: Keyword[]
    labsExpired: boolean
    serpExpired: boolean
    lastLabsUpdate: string | null
    lastSerpUpdate: string | null
    allowSerp: boolean
  }> = []

  if (slugs.length > 0) {
    const { data: cacheData, error: cacheError } = await admin
      .from("kw_cache")
      .select("slug, raw_data, analysis_data, last_labs_update, last_serp_update")
      .in("slug", slugs)

    if (cacheError) {
      throw new Error(cacheError.message)
    }

    const cacheBySlug = new Map<string, CacheRow>()
    ;(cacheData as CacheRow[] | null)?.forEach((row) => {
      cacheBySlug.set(row.slug, row)
    })

    for (const request of requests) {
      const row = cacheBySlug.get(request.slug)
      if (!row) {
        toFetch.push({
          ...request,
          cachedLabs: [],
          cachedSerp: [],
          labsExpired: true,
          serpExpired: true,
          lastLabsUpdate: null,
          lastSerpUpdate: null,
          allowSerp: serpEligibleSlugs.has(request.slug),
        })
        continue
      }

      const cachedLabs = applyCacheMetadata(
        parseCachedKeywords(row.raw_data),
        row.last_labs_update,
        row.last_serp_update
      )
      const cachedSerp = applyCacheMetadata(
        parseCachedKeywords(row.analysis_data),
        row.last_labs_update,
        row.last_serp_update
      )

      const labsFresh = isFreshTimestamp(row.last_labs_update, LABS_TTL_MS)
      const serpFresh = isFreshTimestamp(row.last_serp_update, SERP_TTL_MS)
      const hasLabsPayload = cachedLabs.length > 0
      const hasSerpPayload = cachedSerp.length > 0
      const labsExpired = !labsFresh || !hasLabsPayload
      const serpExpired = !serpFresh || !hasSerpPayload

      if (!labsExpired && !serpExpired) {
        const merged = mergeLabsWithCache(
          cachedLabs,
          cachedSerp,
          row.last_labs_update ?? new Date().toISOString(),
          row.last_serp_update
        )
        cachedResults.push(...markFromCache(merged, true))
        continue
      }

      toFetch.push({
        ...request,
        cachedLabs,
        cachedSerp,
        labsExpired,
        serpExpired,
        lastLabsUpdate: row.last_labs_update,
        lastSerpUpdate: row.last_serp_update,
        allowSerp: serpEligibleSlugs.has(request.slug),
      })
    }
  }

  if (toFetch.length === 0) {
    if (slugs.length > 0) {
      await admin
        .from("kw_cache")
        .update({ last_accessed_at: new Date().toISOString() })
        .in("slug", slugs)
    }
    await new Promise((resolve) => setTimeout(resolve, CACHE_DELAY_MS))
    return { data: cachedResults, apiUsed: false, fromCache: true }
  }

  const fetchedResults: Keyword[] = []
  const cacheRows: Array<Record<string, unknown>> = []
  const queueRequests: SerpQueueRequest[] = []
  let apiUsed = false

  const results = await Promise.all(
    toFetch.map(async (request) => {
      const nowIso = new Date().toISOString()
      const labsPromise = request.labsExpired
        ? keywordService.fetchKeywords(
          request.keyword,
          numericLocationCode,
          matchType as MatchType,
          country,
          languageCode,
          deviceType
        )
        : Promise.resolve(request.cachedLabs)

      const shouldQueueSerp =
        request.serpExpired && forensicRequested && request.allowSerp && serpDispatch === "queue"
      const shouldLiveSerp =
        request.serpExpired && forensicRequested && request.allowSerp && serpDispatch === "live"

      const labsData = await labsPromise
      let labsUpdatedAt = request.labsExpired ? nowIso : request.lastLabsUpdate ?? nowIso

      let serpUpdatedAt = request.lastSerpUpdate
      let serpKeywords: Keyword[] | null = null
      let usedApi = request.labsExpired || shouldLiveSerp || shouldQueueSerp
      let serpFailureMessage: string | null = null

      if (shouldLiveSerp) {
        const baseKeywords = labsData.length > 0 ? labsData : request.cachedLabs
        const ensuredBase = baseKeywords.length
          ? baseKeywords
          : await keywordService.fetchKeywords(
              request.keyword,
              numericLocationCode,
              matchType as MatchType,
              country,
              languageCode,
              deviceType
            )

        if (!labsUpdatedAt) labsUpdatedAt = nowIso

        try {
          serpKeywords = await hydrateSerpForTopKeywords(
            ensuredBase,
            Math.max(0, depth),
            numericLocationCode,
            languageCode,
            deviceType,
            nowIso,
            labsUpdatedAt
          )
          serpUpdatedAt = nowIso
          usedApi = true
        } catch (error) {
          serpFailureMessage = error instanceof Error ? error.message : "SERP_LIVE_FAILED"
          forensicError = true
          if (!forensicErrorMessage) {
            forensicErrorMessage = serpFailureMessage
          }
          console.error("[KeywordService] SERP live fetch failed", {
            keyword: request.keyword,
            message: serpFailureMessage,
          })
          serpKeywords = null
          serpUpdatedAt = null
        }
      } else if (shouldQueueSerp) {
        const baseKeywords = labsData.length > 0 ? labsData : request.cachedLabs
        const ensuredBase = baseKeywords.length
          ? baseKeywords
          : await keywordService.fetchKeywords(
              request.keyword,
              numericLocationCode,
              matchType as MatchType,
              country,
              languageCode,
              deviceType
            )

        const serpTargets = ensuredBase.slice(0, Math.max(0, depth))
        const serpTargetSet = new Set(serpTargets.map((target) => normalizeKeywordKey(target.keyword)))

        serpTargets.forEach((target) => {
          queueRequests.push({ keyword: target.keyword, cacheSlug: request.slug })
        })

        serpUpdatedAt = null
        usedApi = true

        serpKeywords = markRefreshingByKeyword(
          stripSerpAnalysis(ensuredBase, labsUpdatedAt ?? nowIso),
          serpTargetSet
        )
      }

      let finalKeywords: Keyword[] = []
      if (serpKeywords) {
        finalKeywords = serpKeywords
      } else if (!request.serpExpired && request.cachedSerp.length > 0) {
        const labsSource = labsData.length > 0 ? labsData : request.cachedLabs
        finalKeywords = mergeLabsWithCache(
          labsSource.length > 0 ? labsSource : request.cachedSerp,
          request.cachedSerp,
          labsUpdatedAt ?? request.lastLabsUpdate ?? nowIso,
          request.lastSerpUpdate
        )
      } else {
        const baseLabs = labsData.length > 0 ? labsData : request.cachedLabs
        const ensuredLabs = baseLabs.length
          ? baseLabs
          : await keywordService.fetchKeywords(
              request.keyword,
              numericLocationCode,
              matchType as MatchType,
              country,
              languageCode,
              deviceType
            )
        if (!labsUpdatedAt) labsUpdatedAt = nowIso
        finalKeywords = stripSerpAnalysis(ensuredLabs, labsUpdatedAt)
        serpUpdatedAt = null
      }

      const rawPayload = labsData.length > 0 ? labsData : request.cachedLabs
      const analysisPayload =
        shouldQueueSerp
          ? null
          : serpKeywords ?? (serpUpdatedAt && request.cachedSerp.length > 0 ? request.cachedSerp : null)

      const payload = buildKwCachePayload(rawPayload, analysisPayload ?? null)

      return {
        keywords: finalKeywords,
        usedApi,
        cacheRow: {
          slug: request.slug,
          keyword: request.keyword,
          country_code: country,
          location_code: numericLocationCode,
          language_code: languageCode,
          device_type: deviceType,
          match_type: matchType,
          ...payload,
          last_labs_update: labsUpdatedAt ?? request.lastLabsUpdate ?? nowIso,
          last_serp_update: serpUpdatedAt,
          last_accessed_at: nowIso,
        },
      }
    })
  )

  for (const result of results) {
    if (result.usedApi) apiUsed = true
    fetchedResults.push(...markFromCache(result.keywords, !result.usedApi))
    cacheRows.push(result.cacheRow)
  }

  let queueFailed = false
  if (serpDispatch === "queue" && queueRequests.length > 0) {
    try {
      await queueSerpTasks({
        requests: queueRequests,
        locationCode: numericLocationCode,
        languageCode,
        deviceType,
        postbackUrl: queueMeta?.postbackUrl ?? null,
        userId: queueMeta?.userId ?? "",
        idempotencyKey: queueMeta?.idempotencyKey ?? "",
        refundAmount: queueMeta?.refundAmount ?? 0,
      })

      apiUsed = true
    } catch (error) {
      queueFailed = true
      const message = error instanceof Error ? error.message : "SERP_QUEUE_FAILED"
      forensicError = true
      if (!forensicErrorMessage) {
        forensicErrorMessage = message
      }
      console.error("[KeywordService] SERP queue failed", { message })
    }
  }

  if (queueFailed) {
    for (let i = 0; i < fetchedResults.length; i += 1) {
      const keyword = fetchedResults[i]
      if (keyword?.serpStatus === "pending") {
        fetchedResults[i] = { ...keyword, serpStatus: undefined, isRefreshing: false }
      }
    }
  }

  if (cacheRows.length > 0) {
    const { error: upsertError } = await admin
      .from("kw_cache")
      .upsert(cacheRows, { onConflict: "keyword,location_code,language_code,device_type" })

    if (upsertError) {
      console.warn("[KeywordCache] Failed to persist cache rows", upsertError.message)
    }
  }

  if (slugs.length > 0) {
    await admin.from("kw_cache").update({ last_accessed_at: new Date().toISOString() }).in("slug", slugs)
  }

  if (!apiUsed) {
    await new Promise((resolve) => setTimeout(resolve, CACHE_DELAY_MS))
  }

  return {
    data: [...cachedResults, ...fetchedResults],
    apiUsed,
    fromCache: !apiUsed,
    forensicError: forensicError || undefined,
    forensicErrorMessage: forensicError ? forensicErrorMessage ?? "SERP_FETCH_FAILED" : undefined,
  }
}

export const bulkSearchKeywords = authenticatedAction
  .schema(BulkSearchSchema)
  .action(async ({ parsedInput, ctx }): Promise<BulkSearchResult> => {
    const requestHeaders = await headers()

    if (isBotRequest(parsedInput as Record<string, unknown>)) {
      const clientIp = getClientIp(requestHeaders)
      const userAgent = requestHeaders.get("user-agent") ?? "unknown"

      try {
        const admin = createAdminClient()
        await admin.from("core_security_violations").insert({
          ip_address: clientIp,
          user_agent: userAgent,
          violation_type: "honeypot_triggered",
          metadata: { user_id: ctx.userId ?? null },
        })
      } catch (error) {
        console.warn(
          "[Security] Failed to log honeypot trigger",
          error instanceof Error ? error.message : "unknown error"
        )
      }

      const forbidden = new Error("FORBIDDEN")
      ;(forbidden as Error & { status?: number }).status = 403
      throw forbidden
    }

    const matchType = (parsedInput.matchType ?? "broad").toString()
    const country = parsedInput.country || "US"
    const languageCode = parsedInput.languageCode?.trim().toLowerCase() || "en"
    const deviceType = normalizeDeviceType(parsedInput.deviceType)
    const numericLocationCode = getNumericLocationCode(country)
    const keywordInputs =
      parsedInput.keywords?.length ? parsedInput.keywords : parsedInput.keyword ? [parsedInput.keyword] : []
    const sanitizedKeywords = Array.from(
      new Set(keywordInputs.map((keyword) => sanitizeKeywordInput(keyword)).filter(Boolean))
    )

    console.log("[KeywordResearch] Requested keywords:", sanitizedKeywords.length)

    if (sanitizedKeywords.length === 0) {
      throw new Error("KEYWORD_REQUIRED")
    }

    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      throw new Error("PLG_LOGIN_REQUIRED")
    }

    const arcjetDecision = await aj.protect(
      new Request("https://blogspy.local/keyword-research", { headers: requestHeaders })
    )
    if (arcjetDecision.isDenied()) {
      try {
        const admin = createAdminClient()
        const clientIp = getClientIp(requestHeaders)
        const userAgent = requestHeaders.get("user-agent") ?? "unknown"
        await admin.from("core_security_violations").insert({
          ip_address: clientIp,
          user_agent: userAgent,
          violation_type: "arcjet_blocked",
          metadata: { user_id: user.id, reason: "arcjet_denied" },
        })
      } catch (error) {
        console.warn(
          "[Security] Failed to log Arcjet denial",
          error instanceof Error ? error.message : "unknown error"
        )
      }
      throw new Error("FORBIDDEN")
    }

    const { data: billingProfile } = await supabase
      .from("core_profiles")
      .select("billing_tier")
      .eq("id", user.id)
      .maybeSingle()

    const rateLimitResult = await enforceKeywordRateLimit({
      userId: user.id,
      plan: billingProfile?.billing_tier ?? "free",
      ip: getClientIp(requestHeaders),
      userAgent: requestHeaders.get("user-agent") ?? "unknown",
      route: "keyword-research:bulk",
    })
    if (!rateLimitResult.success) {
      const rateError = new Error("RATE_LIMITED")
      ;(rateError as Error & { status?: number }).status = 429
      throw rateError
    }

    const idempotencyKey = ctx.idempotencyKey ?? parsedInput.idempotency_key
    if (!idempotencyKey) {
      throw new Error("MISSING_IDEMPOTENCY_KEY")
    }

    if (!process.env.DATAFORSEO_LOGIN || !process.env.DATAFORSEO_PASSWORD) {
      throw new Error("MISSING_API_CREDENTIALS")
    }

    const forensicRequested =
      parsedInput.isForensic === true ||
      parsedInput.forensic_enabled === true ||
      parsedInput.forensic_enabled === "true"
    const requestedDepth =
      parsedInput.depth === 10
        ? 10
        : parsedInput.depth === 5
          ? 5
          : parsedInput.forensic_depth === "top10"
            ? 10
            : parsedInput.forensic_depth === "top5"
              ? 5
              : undefined

    const depth = forensicRequested ? (requestedDepth === 10 ? 10 : 5) : 0
    // TODO: Move credit amount to a global feature-config map.
    const totalAmount = 1 + (forensicRequested ? depth : 0)
    const descriptionParts = [
      `Keyword Search: ${sanitizedKeywords[0] ?? "keyword"}`,
      sanitizedKeywords.length > 1 ? `(+${sanitizedKeywords.length - 1} more)` : null,
      forensicRequested ? `Forensic ${depth}` : null,
    ].filter(Boolean)
    const description = descriptionParts.join(" ")

    const bypassCredits = process.env.BYPASS_CREDITS === "true" && process.env.NODE_ENV !== "production"

    const featureName = forensicRequested ? "Keyword Explorer - Forensic" : "Keyword Explorer - Discovery"
    let balance: number | null = 0
    let chargeId: string | null = null
    if (!bypassCredits) {
      const { data, error } = await supabase.rpc("deduct_credits_atomic", {
        p_user_id: user.id,
        p_amount: totalAmount,
        p_idempotency_key: idempotencyKey,
        p_description: description,
      })

      if (error) {
        if (error.message.includes("INSUFFICIENT_CREDITS")) {
          const insufficientError = new Error("INSUFFICIENT_CREDITS")
          ;(insufficientError as Error & { status?: number }).status = 402
          throw insufficientError
        }
        throw new Error(error.message)
      }

      const rpcResult = Array.isArray(data) ? data[0] : data
      const remaining = rpcResult && typeof rpcResult.balance === "number" ? rpcResult.balance : null

      if (remaining === null) {
        throw new Error("CREDITS_BALANCE_UNAVAILABLE")
      }

      chargeId = idempotencyKey
      balance = remaining
    }

    let serpDispatchMode: SerpDispatchMode = "skip"
    if (forensicRequested && depth > 0) {
      const liveTrafficCount = await getSerpLiveTrafficCount()
      serpDispatchMode = depth > 1 || liveTrafficCount >= 10 ? "queue" : "live"
      if (serpDispatchMode === "live") {
        await bumpSerpLiveTraffic(depth)
      }
    }

    const postbackUrl = resolvePostbackUrl(requestHeaders)
    const serpRefundAmount = forensicRequested ? depth : 0

    let splitResult: SplitTimingResult
    try {
      splitResult = await runSplitTimingSearch({
        supabase,
        keywords: sanitizedKeywords,
        country,
        languageCode,
        deviceType,
        matchType,
        numericLocationCode,
        forensicRequested,
        depth,
        serpDispatchMode,
        queueMeta: {
          userId: user.id,
          idempotencyKey,
          refundAmount: serpRefundAmount,
          postbackUrl,
        },
      })
    } catch (error) {
      if (!bypassCredits && totalAmount > 0 && chargeId) {
        try {
          await creditBanker.refund(user.id, totalAmount, chargeId, "API failure refund")
        } catch (refundError) {
          console.warn(
            "[BulkSearch] Failed to refund credits after API failure",
            refundError instanceof Error ? refundError.message : "unknown error"
          )
        }
      }
      throw error
    }

    let finalBalance = balance ?? 0
    let forensicRefund = 0
    if (splitResult.forensicError) {
      if (!bypassCredits && serpRefundAmount > 0 && chargeId) {
        const refundResult = await creditBanker.refund(
          user.id,
          serpRefundAmount,
          chargeId,
          "Forensic SERP refund"
        )

        if (!refundResult.success) {
          console.warn("[BulkSearch] Failed to refund forensic credits", refundResult.error)
        } else {
          if (typeof refundResult.remaining === "number") {
            finalBalance = refundResult.remaining
          }
          forensicRefund = serpRefundAmount
        }
      }

      try {
        const admin = createAdminClient()
        const clientIp =
          requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"
        const userAgent = requestHeaders.get("user-agent") ?? "unknown"
        await admin.from("core_security_violations").insert({
          ip_address: clientIp,
          user_agent: userAgent,
          violation_type: "serp_forensic_failure",
          metadata: {
            user_id: user.id,
            keywords: sanitizedKeywords,
            country,
            language_code: languageCode,
            device_type: deviceType,
            match_type: matchType,
            message: splitResult.forensicErrorMessage ?? "SERP_FETCH_FAILED",
          },
        })
      } catch (logError) {
        console.warn(
          "[BulkSearch] Failed to log SERP failure",
          logError instanceof Error ? logError.message : "unknown error"
        )
      }
    }

    return {
      success: true,
      data: splitResult.data,
      balance: finalBalance,
      newBalance: finalBalance,
      fromCache: splitResult.fromCache,
      forensicError: splitResult.forensicError,
      forensicRefund: forensicRefund > 0 ? forensicRefund : undefined,
    }
  })
