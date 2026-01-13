"use server"

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════
 * ⚡ FETCH KEYWORDS - Server Action (PLG-Enabled)
 * ═══════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Connects Frontend to Keyword Service securely.
 * Uses publicAction for PLG demo mode (guests can explore).
 * Uses authAction for authenticated bulk search with credits.
 * Rate-limited by IP address.
 */

import { z } from "zod"
import { publicAction, authAction } from "@/src/lib/safe-action"
import { createServerClient } from "@/src/lib/supabase/server"
import { rateLimiter } from "@/src/features/news-tracker/services/rate-limiter.service"
import { normalizeCountryCode } from "../utils/country-normalizer"
import { fetchBulkKeywords } from "../services/keyword-discovery"
import { MOCK_KEYWORDS } from "../data/mock-keywords"
import type { Keyword } from "../types"

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// ZOD SCHEMA
// ═══════════════════════════════════════════════════════════════════════════════════════════════

const FetchKeywordsSchema = z.object({
  query: z.string().min(1, "Query is required"),
  country: z.string().default("US").transform(normalizeCountryCode),
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// RESPONSE TYPE
// ═══════════════════════════════════════════════════════════════════════════════════════════════

export interface FetchKeywordsResult {
  success: true
  data: Keyword[]
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// SERVER ACTION (Public - PLG Demo Mode)
// ═══════════════════════════════════════════════════════════════════════════════════════════════

export const fetchKeywords = publicAction
  .schema(FetchKeywordsSchema)
  .action(async ({ parsedInput }): Promise<FetchKeywordsResult> => {
    const { query, country } = parsedInput

    console.log(`[fetchKeywords] query="${query}" country=${country}`)

    // Enforce strict rate limit for authenticated users too: 10 requests / minute.
    // NOTE: even though this is a publicAction, if the request has a valid session we still apply limits.
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user?.id) {
      const rateLimitCheck = await rateLimiter.checkLimit(user.id, "keywordResearchSearch")
      if (!rateLimitCheck.allowed) {
        throw new Error("Rate limit exceeded")
      }
    }

    // HARDENING: Public keyword search is demo-only. Prevent unauthenticated abuse.
    // If you need full results, use the auth+credit-gated [`bulkSearchKeywords()`](src/features/keyword-research/actions/fetch-keywords.ts:155).

    // In explicit mock mode, return the demo dataset (fast/local).
    if (isServerMockMode()) {
      return {
        success: true,
        data: MOCK_KEYWORDS.map((kw) => ({
          ...kw,
          countryCode: country,
        })),
      }
    }

    // In non-mock mode, do NOT call external services from public action.
    // Keep response shape stable for guest/demo UI.
    const filtered = MOCK_KEYWORDS.filter((k) =>
      k.keyword.toLowerCase().includes(query.trim().toLowerCase())
    ).slice(0, 50)

    return {
      success: true,
      data: filtered.map((kw) => ({
        ...kw,
        countryCode: country,
      })),
    }
  })

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// CREDIT DEDUCTION (Batch Processing Fee)
// ═══════════════════════════════════════════════════════════════════════════════════════════════

function isServerMockMode(): boolean {
  return process.env.USE_MOCK_DATA === "true" || process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true"
}

/**
 * Deduct credits for a keyword research action.
 *
 * Requirement: `await deductCredit(userId, 1, 'bulk_search')`.
 * Returns `true` when deducted, `false` when insufficient/unavailable.
 */
async function deductCredit(userId: string, amount: 1, reason: "bulk_search"): Promise<boolean> {
  if (isServerMockMode()) {
    console.log("[bulkSearchKeywords] Mock mode - skipping credit deduction")
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
      p_description: "Bulk keyword search processing fee",
    })

    if (error) {
      console.error(`[bulkSearchKeywords] ${rpcName} RPC error:`, error.message)
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

  // Fallback: verify + update user_credits directly (best-effort, keeps feature unblocked)
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

  if (updateError) {
    return false
  }

  return true
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// SERVER ACTION (Authenticated - With Credits)
// ═══════════════════════════════════════════════════════════════════════════════════════════════

const BulkSearchSchema = z.object({
  query: z.string().min(1, "Query is required").max(256),
  country: z.string().default("US").transform(normalizeCountryCode),
})

export interface BulkSearchResult {
  success: true
  data: Keyword[]
  totalCount: number
}

export const bulkSearchKeywords = authAction
  .schema(BulkSearchSchema)
  .action(async ({ parsedInput, ctx }): Promise<BulkSearchResult> => {
    const { query, country } = parsedInput

    console.log(`[bulkSearchKeywords] user=${ctx.userId} query="${query}" country=${country}`)

    // Step 0: Deduct EXACTLY 1 credit for the entire batch BEFORE any fetch.
    const deducted = await deductCredit(ctx.userId, 1, "bulk_search")
    if (!deducted) {
      // Requirement: if deduction fails, throw EXACT error string and do NOT fetch.
      throw new Error("Insufficient Credits")
    }

    // Call DataForSEO Labs API via new service layer
    const response = await fetchBulkKeywords(query, country)

    if (!response.success) {
      throw new Error(response.error ?? "Failed to fetch keywords")
    }

    return {
      success: true,
      data: response.keywords.map((kw) => ({
        ...kw,
        countryCode: country,
      })),
      totalCount: response.totalCount,
    }
  })
