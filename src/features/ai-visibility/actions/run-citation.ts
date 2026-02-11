/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════
 * 🔍 RUN CITATION — Platform Visibility Check via DataForSEO
 * ═══════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Quick checks for individual or batch platform visibility.
 * Uses DataForSEO LLM Mentions + Google AI Mode APIs.
 *
 * Cost: 2 credits for single check, 5 credits for batch (up to 10 keywords)
 * Uses authAction for auth + rate limiting.
 */

"use server"

import { authAction, z } from "@/lib/safe-action"
import { createAdminClient } from "@/lib/supabase/server"
import { creditBanker } from "@/lib/services/credit-banker.service"
import {
  checkSinglePlatform,
  runVisibilityScan,
} from "../services/dataforseo-visibility.service"
import type {
  VisibilityCheckResult,
  FullVisibilityCheckResult,
  AIPlatform,
} from "../types"

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════════════════════

const SINGLE_CHECK_COST = 2
const BATCH_CHECK_COST = 5

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// SCHEMAS
// ═══════════════════════════════════════════════════════════════════════════════════════════════

const platformEnum = z.enum([
  "chatgpt",
  "claude",
  "perplexity",
  "gemini",
  "google-aio",
  "google-ai-mode",
])

const runVisibilityCheckSchema = z.object({
  query: z.string().min(3, "Query must be at least 3 characters"),
  configId: z.string().min(1, "Config ID is required"),
  platforms: z.array(platformEnum).optional(),
})

const checkPlatformSchema = z.object({
  platform: platformEnum,
  query: z.string().min(3, "Query must be at least 3 characters"),
  configId: z.string().min(1, "Config ID is required"),
})

const batchCheckSchema = z.object({
  keywords: z.array(z.string()).min(1, "At least one keyword required").max(10, "Maximum 10 keywords allowed"),
  configId: z.string().min(1, "Config ID is required"),
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// TYPES (preserved for barrel exports)
// ═══════════════════════════════════════════════════════════════════════════════════════════════

export interface VisibilityActionResponse<T> {
  success: boolean
  data?: T
  error?: string
  creditsUsed?: number
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════════════════════════

/**
 * Load config from DB to get brand keywords and domain.
 */
async function loadConfig(configId: string, userId: string) {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("ai_visibility_configs")
    .select("tracked_domain, brand_keywords, competitor_domains")
    .eq("id", configId)
    .eq("user_id", userId)
    .single()

  if (error || !data) return null
  return {
    trackedDomain: data.tracked_domain as string,
    brandKeywords: data.brand_keywords as string[],
    competitorDomains: (data.competitor_domains as string[]) ?? [],
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// SERVER ACTIONS
// ═══════════════════════════════════════════════════════════════════════════════════════════════

/**
 * Run a full visibility check across all platforms for a query.
 */
export const runVisibilityCheck = authAction
  .schema(runVisibilityCheckSchema)
  .action(async ({ parsedInput, ctx }): Promise<VisibilityActionResponse<FullVisibilityCheckResult>> => {
    const config = await loadConfig(parsedInput.configId, ctx.userId)
    if (!config) {
      return { success: false, error: "Configuration not found" }
    }

    // Deduct credits
    const idempKey = `viz:${ctx.userId}:${parsedInput.query}:${Date.now()}`
    const deduct = await creditBanker.deduct(
      ctx.userId,
      SINGLE_CHECK_COST,
      "ai_visibility_check",
      `Visibility check: "${parsedInput.query}"`,
      { query: parsedInput.query },
      idempKey
    )

    if (!deduct.success) {
      return { success: false, error: "Insufficient credits" }
    }

    try {
      const scanResult = await runVisibilityScan({
        keyword: parsedInput.query,
        brandDomain: config.trackedDomain,
        brandKeywords: config.brandKeywords,
        competitorDomains: config.competitorDomains,
      })

      // Map to FullVisibilityCheckResult format
      const now = new Date().toISOString()
      const platforms: AIPlatform[] = ["google-aio", "google-ai-mode", "chatgpt", "claude", "gemini", "perplexity"]
      const results: Record<string, VisibilityCheckResult> = {}

      for (const platform of platforms) {
        const key = platform === "google-aio"
          ? "google"
          : platform === "google-ai-mode"
            ? "googleAiMode"
            : platform
        const platformData = platform === "google-aio"
          ? scanResult.scan.google
          : platform === "google-ai-mode"
            ? scanResult.scan.googleAiMode
            : scanResult.scan[key as keyof typeof scanResult.scan]

        if (!platformData || typeof platformData !== "object") continue

        const isVisible = "status" in platformData && platformData.status === "visible"

        results[platform] = {
          platform,
          isVisible,
          mentionType: isVisible ? "brand-name" : undefined,
          aiResponse: ("snippet" in platformData ? (platformData.snippet as string) : "") || "",
          sentiment: "sentiment" in platformData ? (platformData.sentiment as "positive" | "neutral" | "negative") : "neutral",
          creditsUsed: 0,
          checkedAt: now,
        }
      }

      const visibleCount = Object.values(results).filter((r) => r.isVisible).length

      const fullResult: FullVisibilityCheckResult = {
        query: parsedInput.query,
        results: results as Record<AIPlatform, VisibilityCheckResult>,
        summary: {
          totalPlatforms: platforms.length,
          visibleOn: visibleCount,
          visibilityRate: Math.round((visibleCount / platforms.length) * 100),
          totalCreditsUsed: SINGLE_CHECK_COST,
        },
        timestamp: now,
      }

      return { success: true, data: fullResult, creditsUsed: SINGLE_CHECK_COST }
    } catch (error) {
      await creditBanker.refund(ctx.userId, SINGLE_CHECK_COST, idempKey, "Visibility check failed")
      return {
        success: false,
        error: error instanceof Error ? error.message : "Check failed",
        creditsUsed: 0,
      }
    }
  })

/**
 * Quick check on a single AI platform (used by PlatformCheckButton).
 */
export const checkPlatformNow = authAction
  .schema(checkPlatformSchema)
  .action(async ({ parsedInput, ctx }): Promise<VisibilityActionResponse<VisibilityCheckResult>> => {
    const config = await loadConfig(parsedInput.configId, ctx.userId)
    if (!config) {
      return { success: false, error: "Configuration not found" }
    }

    // Deduct 1 credit for single platform check
    const idempKey = `plat:${ctx.userId}:${parsedInput.platform}:${Date.now()}`
    const deduct = await creditBanker.deduct(
      ctx.userId,
      1,
      "ai_visibility_platform_check",
      `${parsedInput.platform} check: "${parsedInput.query}"`,
      { platform: parsedInput.platform, query: parsedInput.query },
      idempKey
    )

    if (!deduct.success) {
      return { success: false, error: "Insufficient credits" }
    }

    try {
      const result = await checkSinglePlatform(
        parsedInput.platform as AIPlatform,
        parsedInput.query,
        config.trackedDomain,
        config.brandKeywords
      )

      const now = new Date().toISOString()

      return {
        success: true,
        data: {
          platform: parsedInput.platform as AIPlatform,
          isVisible: result.status === "visible",
          mentionType: result.status === "visible" ? "brand-name" : undefined,
          aiResponse: result.snippet,
          sentiment: result.sentiment,
          creditsUsed: 1,
          checkedAt: now,
        },
        creditsUsed: 1,
      }
    } catch (error) {
      await creditBanker.refund(ctx.userId, 1, idempKey, "Platform check failed")
      return {
        success: false,
        error: error instanceof Error ? error.message : "Platform check failed",
        creditsUsed: 0,
      }
    }
  })

/**
 * Batch visibility check across multiple keywords.
 */
export const batchVisibilityCheck = authAction
  .schema(batchCheckSchema)
  .action(async ({ parsedInput, ctx }): Promise<VisibilityActionResponse<{
    results: Record<string, FullVisibilityCheckResult>
    totalCredits: number
  }>> => {
    const config = await loadConfig(parsedInput.configId, ctx.userId)
    if (!config) {
      return { success: false, error: "Configuration not found" }
    }

    const totalCost = BATCH_CHECK_COST * parsedInput.keywords.length

    // Deduct credits for batch
    const idempKey = `batch:${ctx.userId}:${Date.now()}`
    const deduct = await creditBanker.deduct(
      ctx.userId,
      totalCost,
      "ai_visibility_batch",
      `Batch visibility check: ${parsedInput.keywords.length} keywords`,
      { keywordCount: parsedInput.keywords.length },
      idempKey
    )

    if (!deduct.success) {
      return { success: false, error: `Insufficient credits. Need ${totalCost} credits.` }
    }

    try {
      const results: Record<string, FullVisibilityCheckResult> = {}

      // Run scans sequentially to avoid rate limits
      for (const keyword of parsedInput.keywords) {
        const scanResult = await runVisibilityScan({
          keyword,
          brandDomain: config.trackedDomain,
          brandKeywords: config.brandKeywords,
          competitorDomains: config.competitorDomains,
        })

        const platforms: AIPlatform[] = ["google-aio", "google-ai-mode", "chatgpt", "claude", "gemini", "perplexity"]
        const platformResults: Record<string, VisibilityCheckResult> = {}
        const now = new Date().toISOString()

        for (const platform of platforms) {
          const key = platform === "google-aio"
            ? "google"
            : platform === "google-ai-mode"
              ? "googleAiMode"
              : platform
          const platformData = platform === "google-aio"
            ? scanResult.scan.google
            : platform === "google-ai-mode"
              ? scanResult.scan.googleAiMode
              : scanResult.scan[key as keyof typeof scanResult.scan]

          if (!platformData || typeof platformData !== "object") continue

          const isVisible = "status" in platformData && platformData.status === "visible"
          platformResults[platform] = {
            platform,
            isVisible,
            aiResponse: ("snippet" in platformData ? (platformData.snippet as string) : "") || "",
            sentiment: "neutral",
            creditsUsed: 0,
            checkedAt: now,
          }
        }

        const visibleCount = Object.values(platformResults).filter((r) => r.isVisible).length

        results[keyword] = {
          query: keyword,
          results: platformResults as Record<AIPlatform, VisibilityCheckResult>,
          summary: {
            totalPlatforms: platforms.length,
            visibleOn: visibleCount,
            visibilityRate: Math.round((visibleCount / platforms.length) * 100),
            totalCreditsUsed: BATCH_CHECK_COST,
          },
          timestamp: now,
        }
      }

      return { success: true, data: { results, totalCredits: totalCost }, creditsUsed: totalCost }
    } catch (error) {
      await creditBanker.refund(ctx.userId, totalCost, idempKey, "Batch check failed")
      return {
        success: false,
        error: error instanceof Error ? error.message : "Batch check failed",
        creditsUsed: 0,
      }
    }
  })
