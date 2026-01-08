/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════
 * 🔍 RUN CITATION - Server Actions for Citation Visibility Check
 * ═══════════════════════════════════════════════════════════════════════════════════════════════
 * 
 * REFACTORED: Now uses authAction wrapper for consistent auth/rate-limiting.
 * 
 * @example
 * ```tsx
 * "use client"
 * import { runVisibilityCheck, checkPlatformNow } from "@/src/features/ai-visibility/actions"
 * 
 * // Full check across all platforms
 * const result = await runVisibilityCheck({
 *   query: "best seo tools",
 *   configId: "user-config-id"
 * })
 * ```
 */

"use server"

import { authAction, z } from "@/src/lib/safe-action"
import {
  runFullVisibilityCheck,
  quickPlatformCheck,
  type FullVisibilityCheckResult
} from "../services/citation.service"
import { getVisibilityConfig } from "./save-config"
import type { VisibilityCheckResult } from "../types"

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// SCHEMAS
// ═══════════════════════════════════════════════════════════════════════════════════════════════

const platformEnum = z.enum(["chatgpt", "claude", "perplexity", "gemini", "google-aio", "searchgpt", "apple-siri"])

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
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════════════

export interface VisibilityActionResponse<T> {
  success: boolean
  data?: T
  error?: string
  creditsUsed?: number
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// SERVER ACTIONS (using authAction wrapper)
// ═══════════════════════════════════════════════════════════════════════════════════════════════

/**
 * Run visibility check across multiple AI platforms.
 * Checks if brand/domain is mentioned in AI responses.
 */
export const runVisibilityCheck = authAction
  .schema(runVisibilityCheckSchema)
  .action(async ({ parsedInput }): Promise<VisibilityActionResponse<FullVisibilityCheckResult>> => {
    try {
      const { query, configId, platforms } = parsedInput

      // Get user's visibility config
      const configResult = await getVisibilityConfig({ projectId: configId })
      
      if (!configResult?.data?.success || !configResult.data.data) {
        return {
          success: false,
          error: "Please set up your visibility configuration first",
        }
      }

      const config = configResult.data.data

      // Run visibility check across platforms
      const result = await runFullVisibilityCheck({
        query: query.trim(),
        config,
        platforms,
      })

      return {
        success: true,
        data: result,
        creditsUsed: result.summary.totalCreditsUsed,
      }
    } catch (error) {
      console.error("[runVisibilityCheck] Error:", error)
      
      const message = error instanceof Error ? error.message : "Unknown error"
      
      return {
        success: false,
        error: `Visibility check failed: ${message}`,
      }
    }
  })

/**
 * Quick check on a single AI platform.
 * Used for "Check Now" / "Refresh" button on platform cards.
 */
export const checkPlatformNow = authAction
  .schema(checkPlatformSchema)
  .action(async ({ parsedInput }): Promise<VisibilityActionResponse<VisibilityCheckResult>> => {
    try {
      const { platform, query, configId } = parsedInput

      // Get user's visibility config
      const configResult = await getVisibilityConfig({ projectId: configId })
      
      if (!configResult?.data?.success || !configResult.data.data) {
        return {
          success: false,
          error: "Please set up your visibility configuration first",
        }
      }

      const config = configResult.data.data

      // Run quick check
      const result = await quickPlatformCheck(platform, query.trim(), config)

      return {
        success: true,
        data: result,
        creditsUsed: result.creditsUsed,
      }
    } catch (error) {
      console.error("[checkPlatformNow] Error:", error)
      
      const message = error instanceof Error ? error.message : "Unknown error"
      
      return {
        success: false,
        error: `Platform check failed: ${message}`,
      }
    }
  })

/**
 * Batch check multiple keywords across all platforms.
 * Useful for scheduled/bulk checks.
 */
export const batchVisibilityCheck = authAction
  .schema(batchCheckSchema)
  .action(async ({ parsedInput }): Promise<VisibilityActionResponse<{ results: Record<string, FullVisibilityCheckResult>; totalCredits: number }>> => {
    try {
      const { keywords, configId } = parsedInput

      // Get user's visibility config
      const configResult = await getVisibilityConfig({ projectId: configId })
      
      if (!configResult?.data?.success || !configResult.data.data) {
        return {
          success: false,
          error: "Please set up your visibility configuration first",
        }
      }

      const config = configResult.data.data
      const results: Record<string, FullVisibilityCheckResult> = {}
      let totalCredits = 0

      // Run checks sequentially to avoid rate limits
      for (const keyword of keywords) {
        if (keyword.trim().length >= 3) {
          const result = await runFullVisibilityCheck({
            query: keyword.trim(),
            config,
          })
          
          results[keyword] = result
          totalCredits += result.summary.totalCreditsUsed
        }
      }

      return {
        success: true,
        data: { results, totalCredits },
        creditsUsed: totalCredits,
      }
    } catch (error) {
      console.error("[batchVisibilityCheck] Error:", error)
      
      return {
        success: false,
        error: "Batch check failed",
      }
    }
  })
