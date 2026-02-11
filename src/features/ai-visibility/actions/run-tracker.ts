/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════
 * 📊 RUN TRACKER - Server Action for Google AIO & Rankings
 * ═══════════════════════════════════════════════════════════════════════════════════════════════
 * 
 * REFACTORED (v2): Now uses shared getDataForSEOClient() instead of manual credentials.
 * TrackerService still handles the DataForSEO SERP logic.
 * 
 * Usage:
 * ```tsx
 * const result = await checkGoogleAIO({ brandDomain: "blogspy.io", query: "best SEO tools" })
 * ```
 */

"use server"

import { authAction, z } from "@/lib/safe-action"
import { createTrackerService } from "../services/tracker.service"
import type { GoogleAIOResult, RankingResult, CitationResult } from "../types"

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// SCHEMAS
// ═══════════════════════════════════════════════════════════════════════════════════════════════

const singleQuerySchema = z.object({
  brandDomain: z.string().min(1, "Brand domain is required"),
  query: z.string().min(1, "Query is required"),
})

const multiQuerySchema = z.object({
  brandDomain: z.string().min(1, "Brand domain is required"),
  queries: z.array(z.string()).min(1, "At least one query is required"),
})


// ═══════════════════════════════════════════════════════════════════════════════════════════════
// RESPONSE TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════════════

interface TrackerActionResponse<T> {
  success: boolean
  data?: T
  error?: string
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// HELPER: Create tracker service using shared client credentials from env
// ═══════════════════════════════════════════════════════════════════════════════════════════════

function createTracker(brandDomain: string) {
  const login = process.env.DATAFORSEO_LOGIN
  const password = process.env.DATAFORSEO_PASSWORD
  if (!login || !password) {
    throw new Error("DATAFORSEO_LOGIN and DATAFORSEO_PASSWORD not configured")
  }
  return createTrackerService({ login, password }, brandDomain)
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// SERVER ACTIONS (using authAction wrapper)
// ═══════════════════════════════════════════════════════════════════════════════════════════════

/**
 * Check if brand appears in Google AI Overview
 */
export const checkGoogleAIO = authAction
  .schema(singleQuerySchema)
  .action(async ({ parsedInput }): Promise<TrackerActionResponse<GoogleAIOResult>> => {
    try {
      const tracker = createTracker(parsedInput.brandDomain)
      const result = await tracker.checkGoogleAIO(parsedInput.query)
      return { success: true, data: result }
    } catch (error) {
      console.error("[checkGoogleAIO] Error:", error)
      return { success: false, error: "Failed to check Google AIO" }
    }
  })

/**
 * Get Google ranking for a single query
 */
export const getRanking = authAction
  .schema(singleQuerySchema)
  .action(async ({ parsedInput }): Promise<TrackerActionResponse<RankingResult>> => {
    try {
      const tracker = createTracker(parsedInput.brandDomain)
      const result = await tracker.getRanking(parsedInput.query)
      return { success: true, data: result }
    } catch (error) {
      console.error("[getRanking] Error:", error)
      return { success: false, error: "Failed to get ranking" }
    }
  })

/**
 * Get Google rankings for multiple queries
 */
export const getRankings = authAction
  .schema(multiQuerySchema)
  .action(async ({ parsedInput }): Promise<TrackerActionResponse<RankingResult[]>> => {
    try {
      const tracker = createTracker(parsedInput.brandDomain)
      const result = await tracker.getRankings(parsedInput.queries)
      return { success: true, data: result }
    } catch (error) {
      console.error("[getRankings] Error:", error)
      return { success: false, error: "Failed to get rankings" }
    }
  })

/**
 * Check citations across multiple queries
 */
export const checkCitations = authAction
  .schema(multiQuerySchema)
  .action(async ({ parsedInput }): Promise<TrackerActionResponse<CitationResult[]>> => {
    try {
      const tracker = createTracker(parsedInput.brandDomain)
      const result = await tracker.checkCitations(parsedInput.queries)
      return { success: true, data: result }
    } catch (error) {
      console.error("[checkCitations] Error:", error)
      return { success: false, error: "Failed to check citations" }
    }
  })


