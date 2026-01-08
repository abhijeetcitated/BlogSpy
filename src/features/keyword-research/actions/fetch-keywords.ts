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
import { fetchBulkKeywords } from "../services/keyword-discovery"
import { keywordService } from "../services/keyword.service"
import type { Keyword } from "../types"

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// ZOD SCHEMA
// ═══════════════════════════════════════════════════════════════════════════════════════════════

const FetchKeywordsSchema = z.object({
  query: z.string().min(1, "Query is required"),
  country: z.string().default("us"),
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

    // NOTE: For authenticated users, deduct credits in a separate auth-gated action
    // This public action returns mock data for demo mode

    const data = await keywordService.fetchKeywords(query, country)

    return {
      success: true,
      data,
    }
  })

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// SERVER ACTION (Authenticated - With Credits)
// ═══════════════════════════════════════════════════════════════════════════════════════════════

const BulkSearchSchema = z.object({
  query: z.string().min(1, "Query is required").max(256),
  country: z.string().length(2).default("US"),
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

    // Call DataForSEO Labs API via new service layer
    const response = await fetchBulkKeywords(query, country.toUpperCase())

    if (!response.success) {
      throw new Error(response.error ?? "Failed to fetch keywords")
    }

    // TODO: Deduct 1 Credit here
    // await deductCredit(ctx.userId, 1, "bulk_keyword_search")

    return {
      success: true,
      data: response.keywords,
      totalCount: response.totalCount,
    }
  })
