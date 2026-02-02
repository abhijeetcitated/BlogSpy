"use server"
import "server-only"

// ============================================
// KEYWORD RESEARCH - Refresh Keyword Action
// ============================================

import { z } from "zod"
import { headers } from "next/headers"
import { Redis } from "@upstash/redis"

import { publicAction } from "@/lib/safe-action"
import { createAdminClient, createClient } from "@/lib/supabase/server"
import { enforceKeywordRateLimit } from "@/lib/ratelimit"
import { getNumericLocationCode } from "@/config/locations"
import { keywordService } from "../services/keyword.service"
import { liveSerpService } from "../services/live-serp"
import { buildCacheSlug, sanitizeKeywordInput } from "../utils/input-parser"
import { calculateRTV } from "../utils/rtv-calculator"
import type { Keyword, MatchType } from "../types"

const RefreshKeywordSchema = z.object({
  keywordId: z.number(),
  keyword: z.string().min(1, "Keyword is required"),
  country: z.string().default("US"),
  languageCode: z.string().optional(),
  deviceType: z.string().optional(),
  idempotency_key: z.string().min(1, "Idempotency key is required"),
  current_balance: z.number().int().nonnegative().optional(),
  count: z.number().int().nonnegative().optional(),
  traffic: z.number().int().nonnegative().optional(),
  user_system_priority: z.string().optional(),
  admin_validation_token: z.string().optional(),
})

export type RefreshKeywordResponse = {
  success: true
  data: Keyword
  balance: number | null
  fromCache?: boolean
  message?: string
  lastRefreshedAt?: string | null
  status?: "pending" | "completed"
}

export type RefreshKeywordActionResult = {
  data?: RefreshKeywordResponse
  serverError?: string
  validationErrors?: Record<string, { _errors?: string[] }>
}

const HONEYPOT_FIELDS = ["user_system_priority", "admin_validation_token"] as const
const BANNED_SET_KEY = "banned_ips"
const BAN_TTL_SECONDS = 24 * 60 * 60

const penaltyRedis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

const LABS_TTL_MS = 30 * 24 * 60 * 60 * 1000
const COOLDOWN_WINDOW_MS = 5 * 60 * 1000

function getClientIpFromHeaders(requestHeaders: Headers): string {
  const forwardedFor = requestHeaders.get("x-forwarded-for")
  if (forwardedFor) {
    const [first] = forwardedFor.split(",")
    if (first) return first.trim()
  }

  const realIp = requestHeaders.get("x-real-ip")
  return realIp ?? "unknown"
}

function getFingerprint(requestHeaders: Headers): string | null {
  return (
    requestHeaders.get("x-client-fingerprint") ??
    requestHeaders.get("x-fingerprint") ??
    requestHeaders.get("x-device-fingerprint")
  )
}

function isBotRequest(parsedInput: Record<string, unknown> | null): boolean {
  if (!parsedInput) return false
  return HONEYPOT_FIELDS.some((field) => {
    const value = parsedInput[field]
    if (value === null || value === undefined) return false
    return String(value).trim().length > 0
  })
}

async function addToBanList(ip: string): Promise<void> {
  await penaltyRedis.sadd(BANNED_SET_KEY, ip)
  await penaltyRedis.expire(BANNED_SET_KEY, BAN_TTL_SECONDS)
}

function parseCachedKeywords(data: unknown): Keyword[] {
  return Array.isArray(data) ? (data as Keyword[]) : []
}

function normalizeKeywordKey(keyword: string): string {
  return keyword.trim().toLowerCase()
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

function isFreshTimestamp(timestamp: string | null | undefined, ttlMs: number): boolean {
  if (!timestamp) return false
  const time = new Date(timestamp).getTime()
  if (Number.isNaN(time)) return false
  return Date.now() - time < ttlMs
}

export const refreshKeyword = publicAction
  .schema(RefreshKeywordSchema)
  .action(async ({ parsedInput }): Promise<RefreshKeywordResponse> => {
    if (isBotRequest(parsedInput)) {
      const requestHeaders = await headers()
      const clientIp = getClientIpFromHeaders(requestHeaders)
      const userAgent = requestHeaders.get("user-agent") ?? "unknown"
      const fingerprint = getFingerprint(requestHeaders)

      try {
        await addToBanList(clientIp)
      } catch (error) {
        console.warn("[SECURITY] Failed to add IP to ban list", {
          ip: clientIp,
          error: error instanceof Error ? error.message : "unknown error",
        })
      }

      try {
        const admin = createAdminClient()
        await admin.from("core_security_violations").insert({
          ip_address: clientIp,
          user_agent: userAgent,
          violation_type: "bot_trap",
          metadata: { fingerprint },
        })
      } catch (error) {
        console.warn("[SECURITY] Failed to log security violation", {
          ip: clientIp,
          error: error instanceof Error ? error.message : "unknown error",
        })
      }

      throw new Error("An unexpected error occurred")
    }

    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      throw new Error("PLG_LOGIN_REQUIRED")
    }

    const { data: billingProfile } = await supabase
      .from("core_profiles")
      .select("billing_tier")
      .eq("id", user.id)
      .maybeSingle()

    const requestHeaders = await headers()
    const rateLimitResult = await enforceKeywordRateLimit({
      userId: user.id,
      plan: billingProfile?.billing_tier ?? "free",
      ip: getClientIpFromHeaders(requestHeaders),
      userAgent: requestHeaders.get("user-agent") ?? "unknown",
      route: "keyword-research:refresh",
    })
    if (!rateLimitResult.success) {
      const rateError = new Error("RATE_LIMITED")
      ;(rateError as Error & { status?: number }).status = 429
      throw rateError
    }

    const idempotencyKey = parsedInput.idempotency_key?.trim()
    if (!idempotencyKey) {
      throw new Error("MISSING_IDEMPOTENCY_KEY")
    }

    const keywordText = sanitizeKeywordInput(parsedInput.keyword)
    const country = parsedInput.country || "US"
    const languageCode = parsedInput.languageCode?.trim().toLowerCase() || "en"
    const deviceType = parsedInput.deviceType?.trim().toLowerCase() || "desktop"
    const slug = buildCacheSlug(keywordText, country, languageCode, deviceType)
    const numericLocationCode = getNumericLocationCode(country)
    const matchType: MatchType = "broad"
    const nowIso = new Date().toISOString()

    const { data: cooldownRow } = await supabase
      .from("kw_cache")
      .select("last_serp_update")
      .eq("slug", slug)
      .maybeSingle()

    if (cooldownRow?.last_serp_update) {
      const lastSerpTime = new Date(cooldownRow.last_serp_update).getTime()
      if (!Number.isNaN(lastSerpTime) && Date.now() - lastSerpTime < COOLDOWN_WINDOW_MS) {
        throw new Error("COOLDOWN_ACTIVE")
      }
    }

    const { data, error } = await supabase.rpc("deduct_credits_atomic", {
      p_user_id: user.id,
      p_amount: 1,
      p_idempotency_key: idempotencyKey,
      p_description: `Keyword Refresh: ${keywordText}`,
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
      const { data: cacheRow } = await supabase
        .from("kw_cache")
        .select("raw_data, analysis_data, last_labs_update, last_serp_update")
        .eq("slug", slug)
        .maybeSingle()

      const cachedLabs = parseCachedKeywords(cacheRow?.raw_data)
      const labsFresh =
        cachedLabs.length > 0 && isFreshTimestamp(cacheRow?.last_labs_update, LABS_TTL_MS)

      let labsData = cachedLabs
      let labsUpdatedAt = cacheRow?.last_labs_update ?? null

      if (!labsFresh) {
        labsData = await keywordService.fetchKeywords(
          keywordText,
          numericLocationCode,
          matchType,
          country,
          languageCode,
          deviceType
        )
        labsUpdatedAt = nowIso
      }

      const baseKeyword =
        labsData.find((item) => normalizeKeywordKey(item.keyword) === normalizeKeywordKey(keywordText)) ??
        labsData[0] ??
        {
          id: parsedInput.keywordId,
          keyword: keywordText,
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

      const serpData = await liveSerpService.fetchLiveSerp(
        keywordText,
        numericLocationCode,
        languageCode,
        deviceType
      )
      const rtvResult = calculateRTV(
        baseKeyword.volume ?? 0,
        serpData.rawItems ?? [],
        baseKeyword.cpc ?? 0
      )

      const updatedKeyword: Keyword = {
        ...baseKeyword,
        id: parsedInput.keywordId,
        keyword: keywordText,
        weakSpots: {
          reddit: serpData.weakSpots.reddit ?? null,
          quora: serpData.weakSpots.quora ?? null,
          pinterest: serpData.weakSpots.pinterest ?? null,
          ranked: baseKeyword.weakSpots?.ranked ?? [],
        },
        serpFeatures: serpData.serpFeatures ?? [],
        geoScore: serpData.geoScore ?? null,
        hasAio: serpData.hasAio ?? false,
        rtv: rtvResult.rtv,
        rtvBreakdown: rtvResult.breakdown,
        serpStatus: "completed",
        lastUpdated: new Date(),
        lastRefreshedAt: nowIso,
        lastLabsUpdate: labsUpdatedAt ?? nowIso,
        lastSerpUpdate: nowIso,
      }

      const admin = createAdminClient()
      await admin
        .from("kw_cache")
        .upsert(
          {
            slug,
            keyword: keywordText,
            country_code: country,
            language_code: languageCode,
            device_type: deviceType,
            match_type: matchType,
            raw_data: labsData.length > 0 ? labsData : null,
            analysis_data: [updatedKeyword],
            last_labs_update: labsUpdatedAt ?? nowIso,
            last_serp_update: nowIso,
            last_accessed_at: nowIso,
          },
          { onConflict: "slug" }
        )

      return {
        success: true,
        data: updatedKeyword,
        balance,
        lastRefreshedAt: nowIso,
        status: "completed",
      }
    } catch (error) {
      try {
        await supabase.rpc("refund_credits_atomic", {
          p_user_id: user.id,
          p_amount: 1,
          p_idempotency_key: idempotencyKey,
        })
      } catch (refundError) {
        console.warn(
          "[RefreshKeyword] Failed to refund credits after API failure",
          refundError instanceof Error ? refundError.message : "unknown error"
        )
      }

      throw new Error("GOOGLE_BUSY_REFUNDED")
    }
  })

export interface UserCreditsResponse {
  credits: number
  used: number
  remaining: number
}

export const getUserCreditsAction = publicAction
  .schema(z.object({}))
  .action(async (): Promise<UserCreditsResponse> => {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      throw new Error("Authentication required")
    }

    const { data, error } = await supabase
      .from("user_credits")
      .select("credits_total, credits_used")
      .eq("user_id", user.id)
      .single()

    if (error) {
      // No credits record yet - return 0
      if (error.code === "PGRST116") {
        return { credits: 0, used: 0, remaining: 0 }
      }
      throw new Error("Failed to fetch credits")
    }

    const creditsTotal = data.credits_total ?? 0
    const creditsUsed = data.credits_used ?? 0
    const remaining = Math.max(0, creditsTotal - creditsUsed)

    return {
      credits: creditsTotal,
      used: creditsUsed,
      remaining,
    }
  })
