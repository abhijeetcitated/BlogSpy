"use server"
import "server-only"

import { z } from "zod"
import { headers } from "next/headers"

import { authenticatedAction } from "@/lib/safe-action"
import { createAdminClient, createClient } from "@/lib/supabase/server"
import { getNumericLocationCode } from "@/config/locations"
import { getDataForSEOClient, DATAFORSEO_ENDPOINTS, type DataForSEOResponse } from "@/lib/seo/dataforseo"

import { keywordService } from "../services/keyword.service"
import { liveSerpService } from "../services/live-serp"
import { buildCacheSlug, sanitizeKeywordInput } from "../utils/input-parser"
import { calculateRTV } from "../utils/rtv-calculator"
import type { Keyword, MatchType } from "../types"

const RefreshBulkSchema = z.object({
  keywords: z
    .array(
      z.object({
        id: z.number().int().positive(),
        keyword: z.string().min(1),
      })
    )
    .min(1, "At least one keyword is required"),
  country: z.string().default("US"),
  languageCode: z.string().optional(),
  deviceType: z.string().optional(),
  idempotency_key: z.string().min(1, "Idempotency key is required"),
})

export type RefreshBulkKeywordsResponse = {
  success: true
  data: Keyword[]
  balance: number
  skipped?: Array<{ id: number; reason: string }>
}

type CacheRow = {
  slug: string
  raw_data: unknown
  analysis_data: unknown
  last_labs_update: string | null
  last_serp_update: string | null
}

const LABS_TTL_MS = 30 * 24 * 60 * 60 * 1000
const COOLDOWN_WINDOW_MS = 5 * 60 * 1000

function parseCachedKeywords(data: unknown): Keyword[] {
  return Array.isArray(data) ? (data as Keyword[]) : []
}

function normalizeKeywordKey(keyword: string): string {
  return keyword.trim().toLowerCase()
}

function isFreshTimestamp(timestamp: string | null | undefined, ttlMs: number): boolean {
  if (!timestamp) return false
  const time = new Date(timestamp).getTime()
  if (Number.isNaN(time)) return false
  return Date.now() - time < ttlMs
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

export const refreshBulkKeywords = authenticatedAction
  .schema(RefreshBulkSchema)
  .action(async ({ parsedInput }): Promise<RefreshBulkKeywordsResponse> => {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      throw new Error("PLG_LOGIN_REQUIRED")
    }

    const country = parsedInput.country || "US"
    const languageCode = parsedInput.languageCode?.trim().toLowerCase() || "en"
    const deviceType = parsedInput.deviceType?.trim().toLowerCase() || "desktop"
    const numericLocationCode = getNumericLocationCode(country)
    const matchType: MatchType = "broad"
    const nowIso = new Date().toISOString()

    const normalizedKeywords = parsedInput.keywords
      .map((entry) => ({
        id: entry.id,
        keyword: sanitizeKeywordInput(entry.keyword),
      }))
      .filter((entry) => entry.keyword.length > 0)

    if (normalizedKeywords.length === 0) {
      throw new Error("KEYWORD_REQUIRED")
    }

    const requests = normalizedKeywords.map((entry) => ({
      ...entry,
      slug: buildCacheSlug(entry.keyword, country, languageCode, deviceType),
    }))

    const admin = createAdminClient()
    const slugs = requests.map((request) => request.slug)
    const { data: cacheRows, error: cacheError } = await admin
      .from("kw_cache")
      .select("slug, raw_data, analysis_data, last_labs_update, last_serp_update")
      .in("slug", slugs)

    if (cacheError) {
      throw new Error(cacheError.message)
    }

    const cacheBySlug = new Map<string, CacheRow>()
    ;(cacheRows as CacheRow[] | null)?.forEach((row) => cacheBySlug.set(row.slug, row))

    const cooldownSkipped: Array<{ id: number; reason: string }> = []
    const refreshRequests = requests.filter((request) => {
      const row = cacheBySlug.get(request.slug)
      if (!row?.last_serp_update) return true
      const lastSerpTime = new Date(row.last_serp_update).getTime()
      if (Number.isNaN(lastSerpTime)) return true
      if (Date.now() - lastSerpTime < COOLDOWN_WINDOW_MS) {
        cooldownSkipped.push({ id: request.id, reason: "COOLDOWN_ACTIVE" })
        return false
      }
      return true
    })

    if (refreshRequests.length === 0) {
      throw new Error("COOLDOWN_ACTIVE")
    }

    const descriptionParts = [
      `Bulk Refresh: ${refreshRequests[0]?.keyword ?? "keyword"}`,
      refreshRequests.length > 1 ? `(+${refreshRequests.length - 1} more)` : null,
    ].filter(Boolean)
    const description = descriptionParts.join(" ")

    const { data, error } = await supabase.rpc("deduct_credits_atomic", {
      p_user_id: user.id,
      p_amount: refreshRequests.length,
      p_idempotency_key: parsedInput.idempotency_key,
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
    const balance =
      rpcResult && typeof rpcResult.balance === "number" ? rpcResult.balance : null

    if (balance === null) {
      throw new Error("CREDITS_BALANCE_UNAVAILABLE")
    }

    try {
      const labsResults = await Promise.all(
        refreshRequests.map(async (request) => {
          const cacheRow = cacheBySlug.get(request.slug)
          const cachedLabs = parseCachedKeywords(cacheRow?.raw_data)
          const labsFresh =
            cachedLabs.length > 0 && isFreshTimestamp(cacheRow?.last_labs_update, LABS_TTL_MS)

          let labsData = cachedLabs
          let labsUpdatedAt = cacheRow?.last_labs_update ?? null

          if (!labsFresh) {
            labsData = await keywordService.fetchKeywords(
              request.keyword,
              numericLocationCode,
              matchType,
              country,
              languageCode,
              deviceType
            )
            labsUpdatedAt = nowIso
          }

          const baseKeyword =
            labsData.find((item) => normalizeKeywordKey(item.keyword) === request.keyword) ??
            labsData[0] ?? {
              id: request.id,
              keyword: request.keyword,
              countryCode: country,
              intent: ["I"],
              volume: 0,
              trend: Array.from({ length: 12 }, () => 0),
              kd: 0,
              cpc: 0,
              weakSpots: { reddit: null, quora: null, pinterest: null, ranked: [] },
              serpFeatures: [],
              geoScore: null,
              hasAio: false,
            }

          return {
            request,
            baseKeyword: { ...baseKeyword, id: request.id, keyword: request.keyword },
            labsData,
            labsUpdatedAt,
            cacheRow,
          }
        })
      )

      const shouldQueue = refreshRequests.length > 1

      if (shouldQueue) {
        const requestHeaders = await headers()
        const postbackUrl = resolvePostbackUrl(requestHeaders)
        if (!postbackUrl) {
          throw new Error("MISSING_SERP_POSTBACK_URL")
        }

        const dataforseo = getDataForSEOClient()
        const normalizedDevice = deviceType?.trim().toLowerCase()

        const payload = labsResults.map(({ request }) => {
          const tag = JSON.stringify({
            idempotencyKey: `${parsedInput.idempotency_key}:${request.slug}`,
            refundAmount: 1,
          })

          const base: Record<string, unknown> = {
            keyword: request.keyword,
            location_code: numericLocationCode,
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

        const { data: queueResponse } = await dataforseo.post<DataForSEOResponse<unknown>>(
          DATAFORSEO_ENDPOINTS.SERP_TASK_POST,
          payload
        )

        const tasks = queueResponse.tasks ?? []
        if (tasks.length === 0) {
          throw new Error("SERP_TASK_QUEUE_EMPTY")
        }

        const queueRows = tasks
          .map((task, index) => {
            const request = labsResults[index]?.request
            if (!request || !task?.id) return null
            return {
              task_id: task.id,
              user_id: user.id,
              keyword_slug: request.slug,
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
          await admin.from("kw_serp_tasks").insert(queueRows)
        }

        const failedTask = tasks.find((task) => task.status_code !== 20000)
        if (failedTask) {
          throw new Error(failedTask.status_message || "SERP_TASK_QUEUE_FAILED")
        }

        await admin
          .from("kw_cache")
          .upsert(
            labsResults.map((entry) => ({
              slug: entry.request.slug,
              keyword: entry.request.keyword,
              country_code: country,
              language_code: languageCode,
              device_type: deviceType,
              match_type: matchType,
              raw_data: entry.labsData.length > 0 ? entry.labsData : null,
              analysis_data: entry.cacheRow?.analysis_data ?? null,
              last_labs_update: entry.labsUpdatedAt ?? nowIso,
              last_serp_update: entry.cacheRow?.last_serp_update ?? null,
              last_accessed_at: nowIso,
            })),
            { onConflict: "slug" }
          )

        const pendingKeywords = labsResults.map((entry) => ({
          ...entry.baseKeyword,
          lastUpdated: new Date(),
          lastLabsUpdate: entry.labsUpdatedAt ?? nowIso,
          lastSerpUpdate: entry.cacheRow?.last_serp_update ?? null,
          serpStatus: "pending" as const,
          isRefreshing: true,
        }))

        return {
          success: true,
          data: pendingKeywords,
          balance,
          skipped: cooldownSkipped.length > 0 ? cooldownSkipped : undefined,
        }
      }

      const updatedKeywords = await Promise.all(
        labsResults.map(async (entry) => {
          const serpData = await liveSerpService.fetchLiveSerp(
            entry.request.keyword,
            numericLocationCode,
            languageCode,
            deviceType
          )
          const rtvResult = calculateRTV(
            entry.baseKeyword.volume ?? 0,
            serpData.rawItems ?? [],
            entry.baseKeyword.cpc ?? 0
          )

          const updatedKeyword: Keyword = {
            ...entry.baseKeyword,
            weakSpots: {
              reddit: serpData.weakSpots.reddit ?? null,
              quora: serpData.weakSpots.quora ?? null,
              pinterest: serpData.weakSpots.pinterest ?? null,
              ranked: entry.baseKeyword.weakSpots?.ranked ?? [],
            },
            serpFeatures: serpData.serpFeatures ?? [],
            geoScore: serpData.geoScore ?? null,
            hasAio: serpData.hasAio ?? false,
            rtv: rtvResult.rtv,
            rtvBreakdown: rtvResult.breakdown,
            serpStatus: "completed",
            lastUpdated: new Date(),
            lastRefreshedAt: nowIso,
            lastLabsUpdate: entry.labsUpdatedAt ?? nowIso,
            lastSerpUpdate: nowIso,
            isRefreshing: false,
          }

          return updatedKeyword
        })
      )

      await admin
        .from("kw_cache")
        .upsert(
          updatedKeywords.map((keyword) => ({
            slug: buildCacheSlug(keyword.keyword, country, languageCode, deviceType),
            keyword: keyword.keyword,
            country_code: country,
            language_code: languageCode,
            device_type: deviceType,
            match_type: matchType,
            raw_data: null,
            analysis_data: [keyword],
            last_labs_update: nowIso,
            last_serp_update: nowIso,
            last_accessed_at: nowIso,
          })),
          { onConflict: "slug" }
        )

      return {
        success: true,
        data: updatedKeywords,
        balance,
        skipped: cooldownSkipped.length > 0 ? cooldownSkipped : undefined,
      }
    } catch (error) {
      try {
        await supabase.rpc("refund_credits_atomic", {
          p_user_id: user.id,
          p_amount: refreshRequests.length,
          p_idempotency_key: parsedInput.idempotency_key,
        })
      } catch (refundError) {
        console.warn(
          "[RefreshBulk] Failed to refund credits after API failure",
          refundError instanceof Error ? refundError.message : "unknown error"
        )
      }

      throw new Error("GOOGLE_BUSY_REFUNDED")
    }
  })
