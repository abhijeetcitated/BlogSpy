/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════
 * 📊 RUN TRACKER - Server Action for Google AIO & Rankings
 * ═══════════════════════════════════════════════════════════════════════════════════════════════
 * 
 * Next.js Server Action to track Google rankings via DataForSEO
 * 
 * Usage:
 * ```tsx
 * const { checkGoogleAIO, getRankings } = await import("@/features/ai-visibility/actions/run-tracker")
 * const result = await checkGoogleAIO("blogspy.io", "best SEO tools")
 * ```
 */

"use server"

import { createTrackerService } from "../services/tracker.service"
import type { GoogleAIOResult, RankingResult, CitationResult } from "../types"

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// GET API CREDENTIALS (from env)
// ═══════════════════════════════════════════════════════════════════════════════════════════════

function getDataForSEOCredentials(): { login: string; password: string } {
  const login = process.env.DATAFORSEO_LOGIN
  const password = process.env.DATAFORSEO_PASSWORD
  if (!login || !password) {
    throw new Error("DATAFORSEO_LOGIN and DATAFORSEO_PASSWORD not configured")
  }
  return { login, password }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// SERVER ACTIONS
// ═══════════════════════════════════════════════════════════════════════════════════════════════

/**
 * Check if brand appears in Google AI Overview
 */
export async function checkGoogleAIO(
  brandDomain: string,
  query: string
): Promise<GoogleAIOResult> {
  try {
    const credentials = getDataForSEOCredentials()
    const trackerService = createTrackerService(credentials, brandDomain)
    return await trackerService.checkGoogleAIO(query)
  } catch (error) {
    console.error("[checkGoogleAIO] Error:", error)
    throw new Error("Failed to check Google AIO")
  }
}

/**
 * Get Google ranking for a single query
 */
export async function getRanking(
  brandDomain: string,
  query: string
): Promise<RankingResult> {
  try {
    const credentials = getDataForSEOCredentials()
    const trackerService = createTrackerService(credentials, brandDomain)
    return await trackerService.getRanking(query)
  } catch (error) {
    console.error("[getRanking] Error:", error)
    throw new Error("Failed to get ranking")
  }
}

/**
 * Get Google rankings for multiple queries
 */
export async function getRankings(
  brandDomain: string,
  queries: string[]
): Promise<RankingResult[]> {
  try {
    const credentials = getDataForSEOCredentials()
    const trackerService = createTrackerService(credentials, brandDomain)
    return await trackerService.getRankings(queries)
  } catch (error) {
    console.error("[getRankings] Error:", error)
    throw new Error("Failed to get rankings")
  }
}

/**
 * Check citations across multiple queries
 */
export async function checkCitations(
  brandDomain: string,
  queries: string[]
): Promise<CitationResult[]> {
  try {
    const credentials = getDataForSEOCredentials()
    const trackerService = createTrackerService(credentials, brandDomain)
    return await trackerService.checkCitations(queries)
  } catch (error) {
    console.error("[checkCitations] Error:", error)
    throw new Error("Failed to check citations")
  }
}

/**
 * Calculate Apple Siri readiness
 */
export async function checkSiriReadiness(
  brandDomain: string,
  query: string,
  applebotAllowed: boolean
): Promise<{ status: "ready" | "at-risk" | "not-ready"; score: number }> {
  try {
    const credentials = getDataForSEOCredentials()
    const trackerService = createTrackerService(credentials, brandDomain)
    return await trackerService.calculateSiriReadiness(query, applebotAllowed)
  } catch (error) {
    console.error("[checkSiriReadiness] Error:", error)
    throw new Error("Failed to check Siri readiness")
  }
}
