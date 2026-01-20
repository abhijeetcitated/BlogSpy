// ============================================
// COMPETITOR GAP - Forum Intel Action
// ============================================

"use server"

import { authAction, z } from "@/src/lib/safe-action"
import { createServerClient } from "@/src/lib/supabase/server"
import { rateLimiter } from "@/src/lib/rate-limit"
import { fetchForumIntel as fetchForumIntelService } from "../services/gap-api"
import { getDataForSEOLocationCode } from "@/src/lib/dataforseo/locations"

const FORUM_CREDIT_COST = 1
const FetchForumSchema = z.object({
  keyword: z.string().trim().min(1),
  volume: z.number().nonnegative().default(0),
  countryCode: z.string().trim().default("US"),
})

function isServerMockMode(): boolean {
  return process.env.USE_MOCK_DATA === "true" || process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true"
}

async function deductCredits(userId: string, amount: number, reason: "forum_intel"): Promise<boolean> {
  if (isServerMockMode()) {
    console.log("[fetchForumIntel] Mock mode - skipping credit deduction")
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
      p_description: "Forum intel lookup",
    })

    if (error) {
      console.error(`[fetchForumIntel] ${rpcName} RPC error:`, error.message)
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

export const fetchForumIntel = authAction
  .schema(FetchForumSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { keyword, volume, countryCode } = parsedInput
    const rateLimit = await rateLimiter.limit(ctx.userId)
    if (!rateLimit.success) {
      throw new Error("Rate limit exceeded. Slow down.")
    }

    const creditOk = await deductCredits(ctx.userId, FORUM_CREDIT_COST, "forum_intel")
    if (!creditOk) {
      throw new Error("Insufficient credits")
    }

    const locationCode = getDataForSEOLocationCode(countryCode)
    const posts = await fetchForumIntelService(keyword, volume, locationCode)

    return {
      success: true,
      data: posts,
    }
  })

export const fetchForumAction = fetchForumIntel
