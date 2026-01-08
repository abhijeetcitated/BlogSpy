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
import { liveSerpService } from "../services/live-serp"
import { calculateRtv } from "../utils/rtv-calculator"
import type { Keyword, SERPFeature } from "../types"

const RefreshKeywordSchema = z.object({
  keyword: z.string().min(1, "Keyword is required").max(200, "Keyword too long"),
  keywordId: z.number().optional(), // Optional: If provided, updates existing keyword in DB
  country: z.string().length(2, "Country must be 2-letter code").default("US"),
  volume: z.number().default(0), // Existing volume for RTV calculation
  cpc: z.number().default(0), // Existing CPC for RTV calculation
  intent: z.array(z.enum(["I", "C", "T", "N"])).optional(), // User intent for GEO score
})

export interface RefreshKeywordResponse {
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
async function deductCredit(userId: string): Promise<void> {
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
      p_amount: 1,
      p_feature: "keyword_refresh",
      p_description: "Live SERP refresh",
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

  await fallbackDeductCredit(userId, supabase)
}

/**
 * Fallback credit deduction when RPC fails
 */
async function fallbackDeductCredit(
  userId: string,
  supabase: Awaited<ReturnType<typeof createServerClient>>
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
  if (creditsRemaining < 1) {
    throw new Error("Insufficient credits")
  }

  const { error: updateError } = await supabase
    .from("user_credits")
    .update({ credits_used: (credits.credits_used ?? 0) + 1 })
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
  keywordId: number,
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

  const { error } = await (supabase as typeof supabase & {
    from: (table: string) => {
      update: (values: Record<string, unknown>) => { eq: (column: string, value: number) => Promise<{ error: { message: string } | null }> }
    }
  })
    .from("keywords")
    .update({
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
    })
    .eq("id", keywordId)

  if (error) {
    console.error("[RefreshKeyword] DB update failed:", error.message)
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
    await deductCredit(ctx.userId)

    const newBalance = await fetchUserCreditsRemaining(ctx.userId)

    // Step 2: Fetch live SERP data
    const locationCode = getLocationCode(country)
    const serpResult = await liveSerpService.fetchLiveSerp(keyword, locationCode)

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

    // Step 4: Update database if keywordId provided
    if (keywordId) {
      await updateKeywordInDb(keywordId, serpData, rtvData, lastUpdated)
    }

    const weakSpot = resolveWeakSpot(serpData.weakSpots)

    // Step 5: Return updated Keyword object to frontend
    return {
      success: true,
      data: {
        keyword: {
          id: keywordId,
          keyword,
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
// LOCATION CODE HELPER
// ============================================

function getLocationCode(country: string): number {
  const locationMap: Record<string, number> = {
    us: 2840,
    gb: 2826,
    ca: 2124,
    au: 2036,
    de: 2276,
    fr: 2250,
    in: 2356,
    br: 2076,
    es: 2724,
    it: 2380,
  }
  return locationMap[country.toLowerCase()] || 2840
}

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
