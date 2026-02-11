/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════
 * 🔍 RUN SCAN — Full AI Visibility Scan via DataForSEO
 * ═══════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Orchestrates a full visibility scan:
 * 1. Validate input + auth
 * 2. Deduct credits via CreditBanker
 * 3. Run visibility scan via DataForSEO service
 * 4. Save results + citations to DB
 * 5. Refund on failure
 *
 * Cost: 5 credits per scan (~$0.11 DataForSEO cost)
 * Uses authAction for auth + rate limiting.
 */

"use server"

import { authAction, z } from "@/lib/safe-action"
import { createAdminClient } from "@/lib/supabase/server"
import { creditBanker } from "@/lib/services/credit-banker.service"
import { runVisibilityScan, type VisibilityScanResult } from "../services/dataforseo-visibility.service"
import { getCountryByCode } from "../config/countries"
import type { FullScanResult, AICitation } from "../types"

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════════════════════

const SCAN_CREDIT_COST = 5
const SCAN_COOLDOWN_MS = 5 * 60 * 1000 // 5 minutes between same-keyword scans

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// TYPES (preserved for barrel exports)
// ═══════════════════════════════════════════════════════════════════════════════════════════════

export interface RunScanInput {
  keyword: string
  brandName: string
  targetDomain: string
  configId: string
  brandKeywords?: string[]
  competitorDomains?: string[]
  /** ISO alpha-2 country code (e.g. "US", "IN") or "WW" for worldwide */
  countryCode?: string
}

export type RunScanResult = FullScanResult

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// SCHEMAS
// ═══════════════════════════════════════════════════════════════════════════════════════════════

const runScanSchema = z.object({
  keyword: z.string().min(2, "Keyword must be at least 2 characters").max(200),
  brandName: z.string().min(1, "Brand name is required").max(100),
  targetDomain: z.string().min(3, "Domain is required").max(253),
  configId: z.string().uuid("Config ID is required for project-scoped scans"),
  brandKeywords: z.array(z.string()).max(20).optional(),
  competitorDomains: z.array(z.string()).max(10).optional(),
  countryCode: z.string().max(2).optional(),
})

const scanHistorySchema = z.object({
  configId: z.string().uuid("Config ID is required for project-scoped history"),
  limit: z.number().min(1).max(100).optional(),
})

const keywordResultSchema = z.object({
  scanId: z.string().uuid("Invalid scan ID"),
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// MAIN: Full Visibility Scan
// ═══════════════════════════════════════════════════════════════════════════════════════════════

/**
 * Run a full AI visibility scan for a keyword.
 *
 * Flow: credits → 3 parallel API calls → save → refund on failure
 */
export const runFullScan = authAction
  .schema(runScanSchema)
  .action(async ({ parsedInput, ctx }): Promise<{
    success: boolean
    data?: RunScanResult
    error?: string
    creditsUsed: number
    platformMessages?: Record<string, string>
  }> => {
    const {
      keyword,
      brandName,
      targetDomain,
      configId,
      brandKeywords,
      competitorDomains,
      countryCode,
    } = parsedInput

    const idempotencyKey = `scan:${ctx.userId}:${keyword}:${Date.now()}`

    // ── Step 0: Cooldown check — prevent duplicate scans ──
    const supabaseCheck = createAdminClient()
    const { data: recentScan } = await supabaseCheck
      .from("ai_visibility_scans")
      .select("created_at")
      .eq("user_id", ctx.userId)
      .eq("config_id", configId)
      .eq("keyword", keyword)
      .order("created_at", { ascending: false })
      .limit(1)
      .single()

    if (recentScan?.created_at) {
      const elapsed = Date.now() - new Date(recentScan.created_at).getTime()
      if (elapsed < SCAN_COOLDOWN_MS) {
        const remainingMins = Math.ceil((SCAN_COOLDOWN_MS - elapsed) / 60000)
        return {
          success: false,
          error: `COOLDOWN: Please wait ${remainingMins} minute${remainingMins > 1 ? "s" : ""} before scanning "${keyword}" again.`,
          creditsUsed: 0,
        }
      }
    }

    // ── Step 1: Deduct credits ──
    const deductResult = await creditBanker.deduct(
      ctx.userId,
      SCAN_CREDIT_COST,
      "ai_visibility_scan",
      `AI Visibility scan: "${keyword}"`,
      { keyword, targetDomain },
      idempotencyKey
    )

    if (!deductResult.success) {
      return {
        success: false,
        error: deductResult.error === "INSUFFICIENT_CREDITS"
          ? "Insufficient credits. You need 5 credits per scan."
          : deductResult.error,
        creditsUsed: 0,
      }
    }

    try {
      // ── Step 2: Run scan ──
      const allBrandKeywords = [brandName, ...(brandKeywords ?? [])].filter(Boolean)

      // Resolve country → location/language/iso codes
      const country = countryCode ? getCountryByCode(countryCode) : null

      const scanResult: VisibilityScanResult = await runVisibilityScan({
        keyword,
        brandDomain: targetDomain,
        brandKeywords: allBrandKeywords,
        competitorDomains,
        ...(country && {
          locationCode: country.locationCode,
          languageCode: country.languageCode,
          countryIsoCode: country.isoCode,
        }),
      })

      // ── Step 3: Save scan result + citations to DB ──
      const supabase = createAdminClient()

      // Save scan result
      const { error: scanSaveError } = await supabase
        .from("ai_visibility_scans")
        .insert({
          user_id: ctx.userId,
          config_id: configId,
          keyword,
          brand_domain: targetDomain,
          scan_result: scanResult.scan,
          overall_score: scanResult.scan.overallScore,
          visible_platforms: scanResult.scan.visiblePlatforms,
          total_platforms: scanResult.scan.totalPlatforms,
          credits_used: SCAN_CREDIT_COST,
        })

      if (scanSaveError) {
        console.warn("[runScan] Failed to save scan result:", scanSaveError.message)
        // Non-fatal — scan still succeeded, data just won't be persisted
      }

      // Save citations
      if (scanResult.citations.length > 0) {
        const citationRows = scanResult.citations.map((c: AICitation) => ({
          user_id: ctx.userId,
          config_id: configId,
          platform: c.platform,
          query: c.query,
          cited_url: c.citedUrl,
          cited_title: c.citedTitle,
          context: c.context,
          position: c.position,
          citation_type: c.citationType,
          sentiment: c.sentiment,
          competitors: c.competitors,
        }))

        const { error: citeSaveError } = await supabase
          .from("ai_visibility_citations")
          .insert(citationRows)

        if (citeSaveError) {
          console.warn("[runScan] Failed to save citations:", citeSaveError.message)
        }
      }

      // ── Step 4: Upsert daily snapshot for trend charts ──
      try {
        const today = new Date().toISOString().split("T")[0] // "2026-02-09"
        const scan = scanResult.scan

        // Count sentiment from citations
        const sentimentCounts = scanResult.citations.reduce(
          (acc, c) => {
            if (c.sentiment === "positive") acc.positive++
            else if (c.sentiment === "negative") acc.negative++
            else acc.neutral++
            return acc
          },
          { positive: 0, neutral: 0, negative: 0 }
        )

        // Platform breakdown
        const platformBreakdown: Record<string, number> = {}
        for (const c of scanResult.citations) {
          platformBreakdown[c.platform] = (platformBreakdown[c.platform] || 0) + 1
        }

        await supabase
          .from("ai_visibility_snapshots")
          .upsert({
            user_id: ctx.userId,
            config_id: configId,
            date: today,
            visibility_score: scan.overallScore,
            share_of_voice: scan.visiblePlatforms > 0
              ? Math.round((scan.visiblePlatforms / scan.totalPlatforms) * 100)
              : 0,
            total_mentions: scanResult.citations.length,
            sentiment_positive: sentimentCounts.positive,
            sentiment_neutral: sentimentCounts.neutral,
            sentiment_negative: sentimentCounts.negative,
            platform_breakdown: platformBreakdown,
            competitor_data: [],
          }, {
            onConflict: "config_id,date",
          })
      } catch (snapErr) {
        console.warn("[runScan] Failed to upsert snapshot:", snapErr)
      }

      return {
        success: true,
        data: scanResult.scan,
        creditsUsed: SCAN_CREDIT_COST,
        platformMessages: scanResult.platformMessages,
      }
    } catch (error) {
      // ── Step 4: Refund on failure ──
      console.error("[runScan] Scan failed, refunding credits:", error)

      await creditBanker.refund(
        ctx.userId,
        SCAN_CREDIT_COST,
        idempotencyKey,
        `Refund: AI Visibility scan failed for "${keyword}"`
      )

      return {
        success: false,
        error: error instanceof Error ? error.message : "Scan failed unexpectedly",
        creditsUsed: 0,
      }
    }
  })

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// SCAN HISTORY
// ═══════════════════════════════════════════════════════════════════════════════════════════════

/**
 * Get scan history for the authenticated user.
 */
export const getScanHistory = authAction
  .schema(scanHistorySchema)
  .action(async ({ parsedInput, ctx }): Promise<{
    success: boolean
    data?: Array<{
      id: string
      keyword: string
      overallScore: number
      visiblePlatforms: number
      totalPlatforms: number
      creditsUsed: number
      createdAt: string
    }>
    error?: string
  }> => {
    const supabase = createAdminClient()
    const limit = parsedInput.limit ?? 20

    let query = supabase
      .from("ai_visibility_scans")
      .select("id, keyword, overall_score, visible_platforms, total_platforms, credits_used, created_at")
      .eq("user_id", ctx.userId)
      .eq("config_id", parsedInput.configId)
      .order("created_at", { ascending: false })
      .limit(limit)

    const { data, error } = await query

    if (error) {
      console.error("[getScanHistory] Query error:", error)
      return { success: false, error: "Failed to load scan history" }
    }

    return {
      success: true,
      data: (data ?? []).map((r) => ({
        id: r.id,
        keyword: r.keyword,
        overallScore: r.overall_score,
        visiblePlatforms: r.visible_platforms,
        totalPlatforms: r.total_platforms,
        creditsUsed: r.credits_used,
        createdAt: r.created_at,
      })),
    }
  })

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// SINGLE SCAN RESULT
// ═══════════════════════════════════════════════════════════════════════════════════════════════

/**
 * Get a specific scan result by ID.
 */
export const getKeywordScanResult = authAction
  .schema(keywordResultSchema)
  .action(async ({ parsedInput, ctx }): Promise<{
    success: boolean
    data?: FullScanResult
    error?: string
  }> => {
    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from("ai_visibility_scans")
      .select("scan_result")
      .eq("id", parsedInput.scanId)
      .eq("user_id", ctx.userId)
      .single()

    if (error || !data) {
      return { success: false, error: "Scan result not found" }
    }

    return { success: true, data: data.scan_result as FullScanResult }
  })

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// CREDIT BALANCE
// ═══════════════════════════════════════════════════════════════════════════════════════════════

/**
 * Get current credit balance for the authenticated user.
 */
export const getCreditBalance = authAction
  .schema(z.object({}))
  .action(async ({ ctx }): Promise<{
    success: boolean
    data?: { remaining: number; scanCost: number }
    error?: string
  }> => {
    const balance = await creditBanker.getBalance(ctx.userId)

    return {
      success: true,
      data: {
        remaining: balance?.remaining ?? 0,
        scanCost: SCAN_CREDIT_COST,
      },
    }
  })
