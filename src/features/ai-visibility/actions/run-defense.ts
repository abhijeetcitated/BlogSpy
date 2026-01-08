/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════
 * 🛡️ RUN DEFENSE - Server Action for Hallucination Detection
 * ═══════════════════════════════════════════════════════════════════════════════════════════════
 * 
 * REFACTORED: Now uses authAction wrapper for consistent auth/rate-limiting.
 * 
 * Usage:
 * ```tsx
 * const result = await runDefenseCheck({
 *   brandName: "BlogSpy",
 *   brandFacts: { pricing: "$29/mo", features: ["AI Writer", "SEO Tools"] }
 * })
 * ```
 */

"use server"

import { authAction, z } from "@/src/lib/safe-action"
import { createDefenseService, type BrandFacts } from "../services/defense.service"
import type { DefenseResult, PlatformVisibility } from "../types"

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// SCHEMAS
// ═══════════════════════════════════════════════════════════════════════════════════════════════

const defenseCheckSchema = z.object({
  brandName: z.string().min(1, "Brand name is required"),
  brandFacts: z.record(z.string(), z.unknown()),
})

const visibilityCheckSchema = z.object({
  brandName: z.string().min(1, "Brand name is required"),
  brandFacts: z.record(z.string(), z.unknown()),
  platform: z.enum(["chatgpt", "claude", "gemini", "perplexity"]),
  query: z.string().min(1, "Query is required"),
})

const batchVisibilitySchema = z.object({
  brandName: z.string().min(1, "Brand name is required"),
  brandFacts: z.record(z.string(), z.unknown()),
  platform: z.enum(["chatgpt", "claude", "gemini", "perplexity"]),
  queries: z.array(z.string()).min(1, "At least one query is required"),
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// GET API KEY (from env)
// ═══════════════════════════════════════════════════════════════════════════════════════════════

function getOpenRouterApiKey(): string {
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY not configured")
  }
  return apiKey
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// SERVER ACTIONS (using authAction wrapper)
// ═══════════════════════════════════════════════════════════════════════════════════════════════

/**
 * Run complete defense check across all AI platforms
 */
export const runDefenseCheck = authAction
  .schema(defenseCheckSchema)
  .action(async ({ parsedInput }): Promise<{ success: boolean; data?: DefenseResult; error?: string }> => {
    try {
      const apiKey = getOpenRouterApiKey()
      const defenseService = createDefenseService(
        apiKey,
        parsedInput.brandName,
        parsedInput.brandFacts as BrandFacts
      )
      const result = await defenseService.runDefenseCheck()
      return { success: true, data: result }
    } catch (error) {
      console.error("[runDefenseCheck] Error:", error)
      return { success: false, error: "Failed to run defense check" }
    }
  })

/**
 * Check visibility on a specific platform
 */
export const checkPlatformVisibility = authAction
  .schema(visibilityCheckSchema)
  .action(async ({ parsedInput }): Promise<{ success: boolean; data?: PlatformVisibility; error?: string }> => {
    try {
      const apiKey = getOpenRouterApiKey()
      const defenseService = createDefenseService(
        apiKey,
        parsedInput.brandName,
        parsedInput.brandFacts as BrandFacts
      )
      const result = await defenseService.checkVisibility(parsedInput.platform, parsedInput.query)
      return { success: true, data: result }
    } catch (error) {
      console.error("[checkPlatformVisibility] Error:", error)
      return { success: false, error: "Failed to check platform visibility" }
    }
  })

/**
 * Check visibility across multiple queries
 */
export const batchCheckVisibility = authAction
  .schema(batchVisibilitySchema)
  .action(async ({ parsedInput }): Promise<{ success: boolean; data?: PlatformVisibility[]; error?: string }> => {
    try {
      const apiKey = getOpenRouterApiKey()
      const defenseService = createDefenseService(
        apiKey,
        parsedInput.brandName,
        parsedInput.brandFacts as BrandFacts
      )
      
      const results = await Promise.all(
        parsedInput.queries.map((query) =>
          defenseService.checkVisibility(parsedInput.platform, query)
        )
      )
      
      return { success: true, data: results }
    } catch (error) {
      console.error("[batchCheckVisibility] Error:", error)
      return { success: false, error: "Failed to batch check visibility" }
    }
  })
