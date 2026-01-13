"use server"

// ============================================
// KEYWORD RESEARCH - Refresh Keyword Action
// ============================================
// The Orchestrator: Deducts credits, fetches live SERP,
// calculates RTV, and updates the database.
// ============================================

import { z } from "zod"
import { authAction } from "@/src/lib/safe-action"
import { createServerClient } from "@/src/lib/supabase/server"
import { getDataForSEOLocationCode } from "../../../lib/dataforseo/locations"
import { normalizeCountryCode } from "../utils/country-normalizer"
import { liveSerpService } from "../services/live-serp"
import { calculateRtv } from "../utils/rtv-calculator"
import type { Keyword, SERPFeature } from "../types"

const RefreshKeywordSchema = z.object({
  keyword: z.string().min(1, "Keyword is required").max(200, "Keyword too long"),
  keywordId: z.number().optional(), // Optional: If provided, updates existing keyword in DB
  country: z.string().default("US").transform(normalizeCountryCode),
  volume: z.number().default(0), // Existing volume for RTV calculation
  cpc: z.number().default(0), // Existing CPC for RTV calculation
  intent: z.array(z.enum(["I", "C", "T", "N"])).optional(), // User intent for GEO score
})

export type RefreshKeywordResponse =
  | {
      success: true
      data: {
        keyword: Partial<Keyword>
        serpData: {
          weakSpots: {
            reddit: number | null
            quora: number | null
            pinterest: number | null
          }
          serpFeatures: SERPFeature[]
          hasAio: boolean
          hasSnippet: boolean
          geoScore: number
        }
        rtvData: {
          rtv: number
          lossPercentage: number
          breakdown: Array<{ label: string; value: number }>
        }
        lastUpdated: string
      }
      newBalance: number
    }
  | {
      error: "API_ERROR"
      refunded: true
    }

export type RefreshKeywordActionResult = {
  data?: RefreshKeywordResponse
  serverError?: string
}

function isServerMockMode(): boolean {
  return process.env.USE_MOCK_DATA === "true" || process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true"
}

async function fetchUserCreditsRemaining(userId: string): Promise<number> {
  if (isServerMockMode()) {
    return 77
  }

  const supabase = await createServerClient()
  const { data: credits, error } = await supabase
    .from("user_credits")
    .select("credits_total, credits_used")
    .eq("user_id", userId)
    .single()

  if (error || !credits) return 0
  const total = credits.credits_total ?? 0
  const used = credits.credits_used ?? 0
  return Math.max(0, total - used)
}

/**
 * Step 1: Deduct 1 credit via Supabase RPC
 * Primary: `deduct_credits` (per spec), fallback: `use_credits`
 */
async function deductCredit(userId: string, amount: number = 1, reason: string = "keyword_refresh"): Promise<void> {
  if (isServerMockMode()) {
    console.log("[RefreshKeyword] Mock mode - skipping credit deduction")
    return
  }

  const supabase = await createServerClient()

  const attemptRpc = async (rpcName: string): Promise<boolean> => {
    // Supabase type defs may not include custom RPCs like `deduct_credits`.
    const { data, error } = await (supabase as typeof supabase & {
      rpc: (fn: string, args: Record<string, unknown>) => Promise<{ data: unknown; error: { message: string } | null }>
    }).rpc(rpcName, {
      p_user_id: userId,
      p_amount: amount,
      p_feature: reason,
      p_description:
        amount < 0
          ? "Refund for failed live SERP refresh"
          : "Live SERP refresh",
    })

    if (error) {
      console.error(`[RefreshKeyword] ${rpcName} RPC error:`, error.message)
      return false
    }

    const result = Array.isArray(data) ? data[0] : data
    if (result?.success === false || result === false) {
      throw new Error(result?.message || "Insufficient credits")
    }

    return true
  }

  const deducted = await attemptRpc("deduct_credits")
  if (deducted) return

  const used = await attemptRpc("use_credits")
  if (used) return

  await fallbackDeductCredit(userId, supabase, amount)
}

/**
 * Fallback credit deduction when RPC fails
 */
async function fallbackDeductCredit(
  userId: string,
  supabase: Awaited<ReturnType<typeof createServerClient>>,
  amount: number
): Promise<void> {
  const { data: credits, error: creditsError } = await supabase
    .from("user_credits")
    .select("credits_total, credits_used")
    .eq("user_id", userId)
    .single()

  if (creditsError || !credits) {
    throw new Error("Unable to verify credits")
  }

  const creditsRemaining = (credits.credits_total ?? 0) - (credits.credits_used ?? 0)

  if (amount > 0 && creditsRemaining < amount) {
    throw new Error("Insufficient credits")
  }

  // Refunds are represented as negative amounts, meaning we subtract from credits_used.
  const nextUsed = Math.max(0, (credits.credits_used ?? 0) + amount)

  const { error: updateError } = await supabase
    .from("user_credits")
    .update({ credits_used: nextUsed })
    .eq("user_id", userId)

  if (updateError) {
    throw new Error("Unable to deduct credits")
  }
}

/**
 * Step 4: Update keywords table with new SERP data and RTV
 * NOTE: `keywords` table with serp_data JSONB column is assumed per spec
 * If table doesn't exist, this is a no-op (schema migration pending)
 */
type SerpDataPayload = {
  weakSpots: {
    reddit: number | null
    quora: number | null
    pinterest: number | null
  }
  serpFeatures: SERPFeature[]
  hasAio: boolean
  hasSnippet: boolean
  geoScore: number
}

function resolveWeakSpot(weakSpots: SerpDataPayload["weakSpots"]): {
  type: "reddit" | "quora" | "pinterest" | null
  rank?: number
} {
  if (typeof weakSpots.reddit === "number") {
    return { type: "reddit", rank: weakSpots.reddit }
  }
  if (typeof weakSpots.quora === "number") {
    return { type: "quora", rank: weakSpots.quora }
  }
  if (typeof weakSpots.pinterest === "number") {
    return { type: "pinterest", rank: weakSpots.pinterest }
  }
  return { type: null }
}

async function updateKeywordInDb(
  input: { keywordId: number; keywordText: string; countryCode: string },
  serpData: SerpDataPayload,
  rtvData: { rtv: number; lossPercentage: number; breakdown: Array<{ label: string; value: number }> },
  lastUpdated: string
): Promise<void> {
  if (isServerMockMode()) {
    console.log("[RefreshKeyword] Mock mode - skipping DB update")
    return
  }

  const supabase = await createServerClient()
  const weakSpot = resolveWeakSpot(serpData.weakSpots)

  const payload = {
    serp_data: serpData,
    serp_features: serpData.serpFeatures,
    weak_spots: serpData.weakSpots,
    weak_spot: weakSpot,
    geo_score: serpData.geoScore,
    has_aio: serpData.hasAio,
    rtv: rtvData.rtv,
    rtv_breakdown: rtvData.breakdown,
    rtv_data: rtvData,
    last_updated: lastUpdated,
  }

  // Best-effort: prefer composite key (keyword_text + country_code) for strict country isolation.
  // If schema doesn't support it, fall back to id-based update.
  type KeywordsTableUpdate = (values: Record<string, unknown>) => {
    eq: (column: string, value: string | number) => {
      eq: (column: string, value: string | number) => Promise<{ error: { message: string } | null }>
    }
  }

  type KeywordsTableUpdateSingleEq = (values: Record<string, unknown>) => {
    eq: (column: string, value: string | number) => Promise<{ error: { message: string } | null }>
  }

  const keywordsTable = (supabase as typeof supabase & {
    from: (table: string) => {
      update: KeywordsTableUpdate & KeywordsTableUpdateSingleEq
    }
  }).from("keywords")

  let error: { message: string } | null = null

  try {
    const res = await (keywordsTable.update as KeywordsTableUpdate)(payload)
      .eq("keyword_text", input.keywordText)
      .eq("country_code", input.countryCode)

    error = res.error
  } catch {
    // Ignore and fall back
    error = null
  }

  if (!error) {
    // Either composite succeeded or nothing to do.
    // However, if composite matched 0 rows, Supabase doesn't surface as error; still fall back to id if present.
    if (!input.keywordId) return
  }

  const fallback = await (keywordsTable.update as KeywordsTableUpdateSingleEq)(payload).eq("id", input.keywordId)
  if (fallback.error) {
    console.error("[RefreshKeyword] DB update failed:", fallback.error.message)
  }
}

/**
 * Main refresh action
 */
export const refreshKeywordAction = authAction
  .schema(RefreshKeywordSchema)
  .action(async ({ parsedInput, ctx }): Promise<RefreshKeywordResponse> => {
    const { keyword, keywordId, country, volume, cpc } = parsedInput

    // Step 1: Deduct 1 credit
    await deductCredit(ctx.userId, 1, "keyword_refresh")

    const newBalance = await fetchUserCreditsRemaining(ctx.userId)

    // Step 2: Fetch live SERP data (external API)
    const locationCode = getDataForSEOLocationCode(country)

    let serpResult: Awaited<ReturnType<(typeof liveSerpService)["fetchLiveSerp"]>>
    try {
      serpResult = await liveSerpService.fetchLiveSerp(keyword, locationCode)
    } catch (error) {
      console.error("[RefreshKeyword] External API failed:", error)

      // Refund: if API fails AFTER credit deduction.
      // Requirement: `await deductCredit(userId, -1, 'refund_api_error')`.
      try {
        await deductCredit(ctx.userId, -1, "refund_api_error")
      } catch (refundError) {
        console.error("[RefreshKeyword] Refund failed:", refundError)
      }

      return { error: "API_ERROR", refunded: true }
    }

    // Step 3: Calculate RTV with new SERP features
    const rtvResult = calculateRtv({
      volume,
      cpc,
      serpFeatures: serpResult.serpFeatures,
    })

    // Prepare data objects
    const serpData: SerpDataPayload = {
      weakSpots: serpResult.weakSpots,
      serpFeatures: serpResult.serpFeatures,
      hasAio: serpResult.hasAio,
      hasSnippet: serpResult.hasSnippet,
      geoScore: serpResult.geoScore,
    }

    const rtvData = {
      rtv: rtvResult.rtv,
      lossPercentage: rtvResult.lossPercentage,
      breakdown: rtvResult.breakdown,
    }

    const lastUpdated = new Date().toISOString()

    // Step 4: Update database (best-effort). Do not fail refresh if DB update fails.
    try {
      await updateKeywordInDb(
        { keywordId: keywordId ?? 0, keywordText: keyword, countryCode: country },
        serpData,
        rtvData,
        lastUpdated
      )
    } catch (dbError) {
      console.error("[RefreshKeyword] DB update failed:", dbError)
    }

    const weakSpot = resolveWeakSpot(serpData.weakSpots)

    // Step 5: Return updated Keyword object to frontend
    return {
      success: true,
      data: {
        keyword: {
          id: keywordId,
          keyword,
          countryCode: country,
          weakSpots: serpResult.weakSpots,
          weakSpot,
          serpFeatures: serpResult.serpFeatures,
          geoScore: serpResult.geoScore,
          hasAio: serpResult.hasAio,
          rtv: rtvResult.rtv,
          rtvBreakdown: rtvResult.breakdown,
          lastUpdated: new Date(lastUpdated),
          updatedAt: lastUpdated,
        },
        serpData,
        rtvData,
        lastUpdated,
      },
      newBalance,
    }
  })


// ============================================
// GET USER CREDITS
// ============================================

export interface UserCreditsResponse {
  credits: number
  used: number
  remaining: number
}

export const getUserCreditsAction = authAction
  .schema(z.object({}))
  .action(async ({ ctx }): Promise<UserCreditsResponse> => {
    if (isServerMockMode()) {
      return {
        credits: 100,
        used: 23,
        remaining: 77,
      }
    }

    const supabase = await createServerClient()

    const { data: credits, error } = await supabase
      .from("user_credits")
      .select("credits_total, credits_used")
      .eq("user_id", ctx.userId)
      .single()

    if (error || !credits) {
      return {
        credits: 0,
        used: 0,
        remaining: 0,
      }
    }

    const total = credits.credits_total ?? 0
    const used = credits.credits_used ?? 0

    return {
      credits: total,
      used,
      remaining: total - used,
    }
  })
