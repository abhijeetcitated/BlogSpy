/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════
 * 🔍 RUN CITATION - Server Actions for Citation Visibility Check
 * ═══════════════════════════════════════════════════════════════════════════════════════════════
 * 
 * Server actions to check brand visibility across AI platforms.
 * Calls ChatGPT, Claude, Perplexity, Gemini via OpenRouter and checks if brand is mentioned.
 * 
 * @example
 * ```tsx
 * "use client"
 * import { runVisibilityCheck, checkPlatformNow } from "@/features/ai-visibility/actions"
 * 
 * // Full check across all platforms
 * const result = await runVisibilityCheck({
 *   query: "best seo tools",
 *   configId: "user-config-id"
 * })
 * 
 * // Quick check on single platform
 * const platformResult = await checkPlatformNow({
 *   platform: "chatgpt",
 *   query: "best seo tools",
 *   configId: "user-config-id"
 * })
 * ```
 */

"use server"

import { 
  runFullVisibilityCheck, 
  quickPlatformCheck,
  type FullVisibilityCheckResult 
} from "../services/citation.service"
import { getVisibilityConfig } from "./save-config"
import type { AIPlatform, VisibilityCheckResult } from "../types"

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════════════

export interface RunVisibilityCheckInput {
  query: string
  configId: string
  platforms?: AIPlatform[]
}

export interface CheckPlatformInput {
  platform: AIPlatform
  query: string
  configId: string
}

export interface VisibilityActionResponse<T> {
  success: boolean
  data?: T
  error?: string
  creditsUsed?: number
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// SERVER ACTIONS
// ═══════════════════════════════════════════════════════════════════════════════════════════════

/**
 * Run visibility check across multiple AI platforms.
 * Checks if brand/domain is mentioned in AI responses.
 * 
 * @param input - Query, config ID, and optional platforms list
 * @returns Full visibility results across all platforms
 */
export async function runVisibilityCheck(
  input: RunVisibilityCheckInput
): Promise<VisibilityActionResponse<FullVisibilityCheckResult>> {
  try {
    const { query, configId, platforms } = input

    if (!query || query.trim().length < 3) {
      return {
        success: false,
        error: "Query must be at least 3 characters long",
      }
    }

    // Get user's visibility config
    const configResult = await getVisibilityConfig(configId)
    
    if (!configResult.success || !configResult.data) {
      return {
        success: false,
        error: "Please set up your visibility configuration first",
      }
    }

    const config = configResult.data

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
}

/**
 * Quick check on a single AI platform.
 * Used for "Check Now" / "Refresh" button on platform cards.
 * 
 * @param input - Platform, query, and config ID
 * @returns Single platform visibility result
 */
export async function checkPlatformNow(
  input: CheckPlatformInput
): Promise<VisibilityActionResponse<VisibilityCheckResult>> {
  try {
    const { platform, query, configId } = input

    if (!query || query.trim().length < 3) {
      return {
        success: false,
        error: "Query must be at least 3 characters long",
      }
    }

    // Validate platform
    const validPlatforms: AIPlatform[] = [
      "chatgpt", "claude", "perplexity", "gemini", "google-aio", "searchgpt", "apple-siri"
    ]
    
    if (!validPlatforms.includes(platform)) {
      return {
        success: false,
        error: `Invalid platform: ${platform}`,
      }
    }

    // Get user's visibility config
    const configResult = await getVisibilityConfig(configId)
    
    if (!configResult.success || !configResult.data) {
      return {
        success: false,
        error: "Please set up your visibility configuration first",
      }
    }

    const config = configResult.data

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
}

/**
 * Batch check multiple keywords across all platforms.
 * Useful for scheduled/bulk checks.
 * 
 * @param keywords - List of keywords to check
 * @param configId - User's config ID
 * @returns Results for each keyword
 */
export async function batchVisibilityCheck(
  keywords: string[],
  configId: string
): Promise<VisibilityActionResponse<{ results: Record<string, FullVisibilityCheckResult>; totalCredits: number }>> {
  try {
    if (!keywords || keywords.length === 0) {
      return {
        success: false,
        error: "No keywords provided",
      }
    }

    if (keywords.length > 10) {
      return {
        success: false,
        error: "Maximum 10 keywords allowed per batch",
      }
    }

    // Get user's visibility config
    const configResult = await getVisibilityConfig(configId)
    
    if (!configResult.success || !configResult.data) {
      return {
        success: false,
        error: "Please set up your visibility configuration first",
      }
    }

    const config = configResult.data
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
}
