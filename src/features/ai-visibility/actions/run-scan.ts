/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════
 * 🚀 RUN FULL SCAN - Server Action for Complete AI Visibility Check
 * ═══════════════════════════════════════════════════════════════════════════════════════════════
 * 
 * Production-grade Server Action that:
 * 1. Authenticates user via Supabase
 * 2. Deducts credits (5 credits per scan) using existing `use_credits` RPC
 * 3. Runs parallel API calls to Google + 4 AI platforms
 * 4. Calculates virtual platforms (SearchGPT, Siri)
 * 5. Saves results to `ai_visibility_keywords.last_results`
 * 6. Handles errors with automatic refund
 * 
 * @module runFullScan
 * @see _INTEGRATION_GUIDE.ts for architecture details
 */

"use server"

import { createServerClient } from "@/src/lib/supabase/server"
import { createScanService, type FullScanResult, type TechAuditData } from "../services/scan.service"
import { AuditService } from "../services/audit.service"
import { revalidatePath } from "next/cache"
import type { Json } from "@/types/supabase"
import { createMockScanResult, mockScanDelay } from "../data/mock-scan-results"

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════════════

export interface RunScanInput {
  keyword: string
  brandName: string
  brandDomain: string
  keywordId?: string // Optional - if scanning for a saved keyword
}

export interface RunScanResult {
  success: boolean
  data?: FullScanResult
  creditsUsed: number
  creditsRemaining?: number
  error?: string
  partialResults?: boolean
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════════════════════

const SCAN_CREDIT_COST = 5
const CACHE_DURATION_HOURS = 1 // Check cache within 1 hour

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// MAIN SERVER ACTION
// ═══════════════════════════════════════════════════════════════════════════════════════════════

/**
 * Run a full AI visibility scan for a keyword
 * 
 * @param input - Keyword, brand name, and domain to scan
 * @returns Scan results with visibility data across 7 platforms
 * 
 * @example
 * ```tsx
 * const result = await runFullScan({
 *   keyword: "best seo tools 2025",
 *   brandName: "BlogSpy",
 *   brandDomain: "blogspy.io"
 * })
 * ```
 */
export async function runFullScan(input: RunScanInput): Promise<RunScanResult> {
  const { keyword, brandName, brandDomain, keywordId } = input
  
  // Validate input
  if (!keyword?.trim()) {
    return { success: false, creditsUsed: 0, error: "Keyword is required" }
  }
  if (!brandName?.trim()) {
    return { success: false, creditsUsed: 0, error: "Brand name is required" }
  }
  if (!brandDomain?.trim()) {
    return { success: false, creditsUsed: 0, error: "Brand domain is required" }
  }

  // ═══════════════════════════════════════════════════════════════════════════════════════════
  // 🎭 MOCK MODE - Return mock data without real API calls or credit deduction
  // ═══════════════════════════════════════════════════════════════════════════════════════════
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true") {
    console.log("[runFullScan] 🎭 MOCK MODE - Returning mock data")
    
    // Simulate network delay (2 seconds)
    await mockScanDelay()
    
    // Generate mock result
    const mockResult = createMockScanResult(keyword, brandName)
    
    return {
      success: true,
      data: mockResult,
      creditsUsed: 0, // No credits in mock mode
      creditsRemaining: 999, // Mock unlimited credits
      partialResults: false,
    }
  }

  try {
    // ─────────────────────────────────────────────────────────────────────────────────────────
    // STEP 1: Auth Check
    // ─────────────────────────────────────────────────────────────────────────────────────────
    const supabase = await createServerClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return { 
        success: false, 
        creditsUsed: 0, 
        error: "Authentication required. Please sign in." 
      }
    }

    const userId = user.id

    // ─────────────────────────────────────────────────────────────────────────────────────────
    // STEP 2: Check Cache (from ai_visibility_keywords.last_results)
    // ─────────────────────────────────────────────────────────────────────────────────────────
    if (keywordId) {
      const cachedResult = await checkKeywordCache(supabase, userId, keywordId)
      if (cachedResult) {
        return {
          success: true,
          data: cachedResult,
          creditsUsed: 0, // No credits charged for cached result
          partialResults: false,
        }
      }
    }

    // ─────────────────────────────────────────────────────────────────────────────────────────
    // STEP 3: Deduct Credits using existing RPC
    // ─────────────────────────────────────────────────────────────────────────────────────────
    const creditResult = await deductCredits(supabase, userId, SCAN_CREDIT_COST)

    if (!creditResult.success) {
      return {
        success: false,
        creditsUsed: 0,
        error: creditResult.error || "Insufficient credits. Please upgrade your plan.",
      }
    }

    // ─────────────────────────────────────────────────────────────────────────────────────────
    // STEP 4: Run Tech Audit (for Siri calculation)
    // ─────────────────────────────────────────────────────────────────────────────────────────
    let techAuditData: TechAuditData = {
      applebot_allowed: true, // Default to true if audit fails
      gptbot_allowed: true,
      googlebot_allowed: true,
    }

    try {
      const auditService = new AuditService(brandDomain)
      const auditResult = await auditService.runFullAudit()
      
      // Extract bot permissions from audit
      const findBotStatus = (botId: string) => 
        auditResult.robotsTxt.find(b => b.botId.toLowerCase() === botId.toLowerCase())

      techAuditData = {
        applebot_allowed: findBotStatus("applebot")?.isAllowed ?? true,
        gptbot_allowed: findBotStatus("gptbot")?.isAllowed ?? true,
        googlebot_allowed: findBotStatus("googlebot")?.isAllowed ?? true,
      }
    } catch (auditError) {
      console.warn("[runFullScan] Tech audit failed, using defaults:", auditError)
      // Continue with default values - don't fail the scan
    }

    // ─────────────────────────────────────────────────────────────────────────────────────────
    // STEP 5: Run Full Scan (Parallel API Calls)
    // ─────────────────────────────────────────────────────────────────────────────────────────
    const scanService = createScanService(brandName, brandDomain)
    
    let scanResult: FullScanResult
    let allApisFailed = false

    try {
      scanResult = await scanService.runFullScan(keyword, techAuditData)
      
      // Check if ALL APIs failed (should refund)
      const hasAnySuccess = 
        scanResult.google.status !== "hidden" ||
        !scanResult.chatgpt.error ||
        !scanResult.claude.error ||
        !scanResult.gemini.error ||
        !scanResult.perplexity.error

      allApisFailed = !hasAnySuccess
      
    } catch (scanError) {
      console.error("[runFullScan] Scan failed completely:", scanError)
      allApisFailed = true
      
      // Refund credits on complete failure
      await refundCredits(supabase, userId, SCAN_CREDIT_COST)
      
      return {
        success: false,
        creditsUsed: 0, // Refunded
        error: `Scan failed: ${scanError instanceof Error ? scanError.message : "Unknown error"}. Credits have been refunded.`,
      }
    }

    // If ALL APIs failed, refund
    if (allApisFailed) {
      await refundCredits(supabase, userId, SCAN_CREDIT_COST)
      
      return {
        success: false,
        creditsUsed: 0,
        error: "All API calls failed. Credits have been refunded. Please try again later.",
      }
    }

    // ─────────────────────────────────────────────────────────────────────────────────────────
    // STEP 6: Save Results to ai_visibility_keywords (if keywordId provided)
    // ─────────────────────────────────────────────────────────────────────────────────────────
    if (keywordId) {
      await saveKeywordResults(supabase, keywordId, userId, scanResult)
    }

    // ─────────────────────────────────────────────────────────────────────────────────────────
    // STEP 7: Check for Partial Failures
    // ─────────────────────────────────────────────────────────────────────────────────────────
    const hasPartialFailures = 
      !!scanResult.chatgpt.error ||
      !!scanResult.claude.error ||
      !!scanResult.gemini.error ||
      !!scanResult.perplexity.error

    // Revalidate pages
    revalidatePath("/dashboard/ai-visibility")
    revalidatePath("/dashboard")

    return {
      success: true,
      data: scanResult,
      creditsUsed: SCAN_CREDIT_COST,
      creditsRemaining: creditResult.remaining,
      partialResults: hasPartialFailures,
    }

  } catch (error) {
    console.error("[runFullScan] Unexpected error:", error)
    return {
      success: false,
      creditsUsed: 0,
      error: `Unexpected error: ${error instanceof Error ? error.message : "Unknown error"}`,
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════════════════════

type SupabaseClient = Awaited<ReturnType<typeof createServerClient>>

/**
 * Check if we have a cached result for this keyword (within cache duration)
 */
async function checkKeywordCache(
  supabase: SupabaseClient,
  userId: string,
  keywordId: string
): Promise<FullScanResult | null> {
  try {
    const cacheThreshold = new Date()
    cacheThreshold.setHours(cacheThreshold.getHours() - CACHE_DURATION_HOURS)

    const { data, error } = await supabase
      .from("ai_visibility_keywords")
      .select("last_results, last_checked_at")
      .eq("id", keywordId)
      .eq("user_id", userId)
      .single()

    if (error || !data?.last_results || !data?.last_checked_at) {
      return null
    }

    // Check if cache is still valid
    const lastChecked = new Date(data.last_checked_at)
    if (lastChecked < cacheThreshold) {
      return null // Cache expired
    }

    return data.last_results as unknown as FullScanResult
  } catch {
    return null
  }
}

/**
 * Deduct credits using the existing use_credits RPC function
 */
async function deductCredits(
  supabase: SupabaseClient,
  userId: string,
  amount: number
): Promise<{ success: boolean; remaining?: number; error?: string }> {
  try {
    const { data, error } = await supabase.rpc("use_credits", {
      p_user_id: userId,
      p_amount: amount,
      p_feature: "ai_visibility_scan",
      p_description: `Full AI Visibility Scan (${amount} credits)`,
    })

    if (error) {
      console.error("[deductCredits] RPC error:", error.message)
      return { success: false, error: error.message }
    }

    // RPC returns array with single result
    const result = Array.isArray(data) ? data[0] : data
    
    if (!result?.success) {
      return { 
        success: false, 
        error: result?.message || "Insufficient credits" 
      }
    }

    return { 
      success: true, 
      remaining: result.remaining 
    }
    
  } catch (error) {
    console.error("[deductCredits] Error:", error)
    return { success: false, error: "Credit deduction failed" }
  }
}

/**
 * Refund credits on API failure by using negative transaction
 */
async function refundCredits(
  supabase: SupabaseClient,
  userId: string,
  amount: number
): Promise<boolean> {
  try {
    // Get current credits
    const { data: creditData, error: fetchError } = await supabase
      .from("user_credits")
      .select("credits_used")
      .eq("user_id", userId)
      .single()

    if (fetchError || !creditData) {
      console.error("[refundCredits] Failed to fetch current credits")
      return false
    }

    // Refund by reducing credits_used
    const newCreditsUsed = Math.max(0, creditData.credits_used - amount)
    
    const { error: updateError } = await supabase
      .from("user_credits")
      .update({ 
        credits_used: newCreditsUsed,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId)

    if (updateError) {
      console.error("[refundCredits] Failed to update credits:", updateError)
      return false
    }

    // Log the refund in history
    await supabase.from("credit_usage_history").insert({
      user_id: userId,
      credits_amount: amount,
      transaction_type: "refund",
      feature_used: "ai_visibility_scan",
      credits_before: creditData.credits_used,
      credits_after: newCreditsUsed,
      description: "Refund due to scan failure",
      metadata: {},
    })

    return true
  } catch (error) {
    console.error("[refundCredits] Error:", error)
    return false
  }
}

/**
 * Save scan results to the keyword record
 */
async function saveKeywordResults(
  supabase: SupabaseClient,
  keywordId: string,
  userId: string,
  scanResult: FullScanResult
): Promise<void> {
  try {
    await supabase
      .from("ai_visibility_keywords")
      .update({
        last_results: scanResult as unknown as Json,
        last_checked_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", keywordId)
      .eq("user_id", userId)
  } catch (error) {
    console.error("[saveKeywordResults] Error:", error)
    // Non-critical, don't throw
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// ADDITIONAL ACTIONS
// ═══════════════════════════════════════════════════════════════════════════════════════════════

/**
 * Get scan history from keywords that have been scanned
 */
export async function getScanHistory(limit: number = 10): Promise<{
  success: boolean
  data?: Array<{
    id: string
    keyword: string
    overallScore: number
    visiblePlatforms: number
    lastCheckedAt: string
  }>
  error?: string
}> {
  try {
    const supabase = await createServerClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return { success: false, error: "Authentication required" }
    }

    const { data, error } = await supabase
      .from("ai_visibility_keywords")
      .select("id, keyword, last_results, last_checked_at")
      .eq("user_id", user.id)
      .not("last_checked_at", "is", null)
      .order("last_checked_at", { ascending: false })
      .limit(limit)

    if (error) {
      return { success: false, error: error.message }
    }

    return {
      success: true,
      data: data
        .filter(row => row.last_results !== null)
        .map(row => {
          const results = row.last_results as unknown as FullScanResult
          return {
            id: row.id,
            keyword: row.keyword,
            overallScore: results?.overallScore ?? 0,
            visiblePlatforms: results?.visiblePlatforms ?? 0,
            lastCheckedAt: row.last_checked_at || "",
          }
        }),
    }
  } catch {
    return { success: false, error: "Failed to fetch scan history" }
  }
}

/**
 * Get a specific scan result by keyword ID
 */
export async function getKeywordScanResult(keywordId: string): Promise<{
  success: boolean
  data?: FullScanResult
  error?: string
}> {
  try {
    const supabase = await createServerClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return { success: false, error: "Authentication required" }
    }

    const { data, error } = await supabase
      .from("ai_visibility_keywords")
      .select("last_results")
      .eq("id", keywordId)
      .eq("user_id", user.id)
      .single()

    if (error) {
      return { success: false, error: "Keyword not found" }
    }

    if (!data?.last_results) {
      return { success: false, error: "No scan results available. Run a scan first." }
    }

    return {
      success: true,
      data: data.last_results as unknown as FullScanResult,
    }
  } catch {
    return { success: false, error: "Failed to fetch scan result" }
  }
}

/**
 * Get user's current credit balance
 */
export async function getCreditBalance(): Promise<{
  success: boolean
  credits?: number
  creditsUsed?: number
  creditsTotal?: number
  error?: string
}> {
  try {
    const supabase = await createServerClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return { success: false, error: "Authentication required" }
    }

    const { data, error } = await supabase
      .from("user_credits")
      .select("credits_total, credits_used")
      .eq("user_id", user.id)
      .single()

    if (error) {
      return { success: false, error: "Failed to fetch credits" }
    }

    const remaining = (data?.credits_total || 0) - (data?.credits_used || 0)

    return {
      success: true,
      credits: remaining,
      creditsUsed: data?.credits_used || 0,
      creditsTotal: data?.credits_total || 0,
    }
  } catch {
    return { success: false, error: "Failed to fetch credit balance" }
  }
}
