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

import { createServerClient } from "@/src/lib/supabase/server"
import { createTrackerService } from "../services/tracker.service"
import type { GoogleAIOResult, RankingResult, CitationResult } from "../types"

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// RESPONSE TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════════════

interface TrackerActionResponse<T> {
  success: boolean
  data?: T
  error?: string
}

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
): Promise<TrackerActionResponse<GoogleAIOResult>> {
  try {
    // 🔒 AUTH CHECK: Verify user is logged in
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return {
        success: false,
        error: "Unauthorized: Please login to use this feature.",
      }
    }

    const credentials = getDataForSEOCredentials()
    const trackerService = createTrackerService(credentials, brandDomain)
    const result = await trackerService.checkGoogleAIO(query)
    return { success: true, data: result }
  } catch (error) {
    console.error("[checkGoogleAIO] Error:", error)
    return { success: false, error: "Failed to check Google AIO" }
  }
}

/**
 * Get Google ranking for a single query
 */
export async function getRanking(
  brandDomain: string,
  query: string
): Promise<TrackerActionResponse<RankingResult>> {
  try {
    // 🔒 AUTH CHECK: Verify user is logged in
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return {
        success: false,
        error: "Unauthorized: Please login to use this feature.",
      }
    }

    const credentials = getDataForSEOCredentials()
    const trackerService = createTrackerService(credentials, brandDomain)
    const result = await trackerService.getRanking(query)
    return { success: true, data: result }
  } catch (error) {
    console.error("[getRanking] Error:", error)
    return { success: false, error: "Failed to get ranking" }
  }
}

/**
 * Get Google rankings for multiple queries
 */
export async function getRankings(
  brandDomain: string,
  queries: string[]
): Promise<TrackerActionResponse<RankingResult[]>> {
  try {
    // 🔒 AUTH CHECK: Verify user is logged in
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return {
        success: false,
        error: "Unauthorized: Please login to use this feature.",
      }
    }

    const credentials = getDataForSEOCredentials()
    const trackerService = createTrackerService(credentials, brandDomain)
    const result = await trackerService.getRankings(queries)
    return { success: true, data: result }
  } catch (error) {
    console.error("[getRankings] Error:", error)
    return { success: false, error: "Failed to get rankings" }
  }
}

/**
 * Check citations across multiple queries
 */
export async function checkCitations(
  brandDomain: string,
  queries: string[]
): Promise<TrackerActionResponse<CitationResult[]>> {
  try {
    // 🔒 AUTH CHECK: Verify user is logged in
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return {
        success: false,
        error: "Unauthorized: Please login to use this feature.",
      }
    }

    const credentials = getDataForSEOCredentials()
    const trackerService = createTrackerService(credentials, brandDomain)
    const result = await trackerService.checkCitations(queries)
    return { success: true, data: result }
  } catch (error) {
    console.error("[checkCitations] Error:", error)
    return { success: false, error: "Failed to check citations" }
  }
}

/**
 * Calculate Apple Siri readiness
 */
export async function checkSiriReadiness(
  brandDomain: string,
  query: string,
  applebotAllowed: boolean
): Promise<TrackerActionResponse<{ status: "ready" | "at-risk" | "not-ready"; score: number }>> {
  try {
    // 🔒 AUTH CHECK: Verify user is logged in
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return {
        success: false,
        error: "Unauthorized: Please login to use this feature.",
      }
    }

    const credentials = getDataForSEOCredentials()
    const trackerService = createTrackerService(credentials, brandDomain)
    const result = await trackerService.calculateSiriReadiness(query, applebotAllowed)
    return { success: true, data: result }
  } catch (error) {
    console.error("[checkSiriReadiness] Error:", error)
    return { success: false, error: "Failed to check Siri readiness" }
  }
}
