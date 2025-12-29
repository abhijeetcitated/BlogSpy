/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════
 * 🛡️ RUN DEFENSE - Server Action for Hallucination Detection
 * ═══════════════════════════════════════════════════════════════════════════════════════════════
 * 
 * Next.js Server Action to trigger defense check from client components
 * 
 * Usage:
 * ```tsx
 * const { runDefenseCheck } = await import("@/features/ai-visibility/actions/run-defense")
 * const result = await runDefenseCheck({
 *   brandName: "BlogSpy",
 *   brandFacts: { pricing: "$29/mo", features: ["AI Writer", "SEO Tools"] }
 * })
 * ```
 */

"use server"

import { createDefenseService, type BrandFacts } from "../services/defense.service"
import type { DefenseResult, PlatformVisibility } from "../types"

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════════════

interface DefenseCheckInput {
  brandName: string
  brandFacts: BrandFacts
}

interface VisibilityCheckInput {
  brandName: string
  brandFacts: BrandFacts
  platform: "chatgpt" | "claude" | "gemini" | "perplexity"
  query: string
}

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
// SERVER ACTIONS
// ═══════════════════════════════════════════════════════════════════════════════════════════════

/**
 * Run complete defense check across all AI platforms
 */
export async function runDefenseCheck(
  input: DefenseCheckInput
): Promise<DefenseResult> {
  try {
    const apiKey = getOpenRouterApiKey()
    const defenseService = createDefenseService(
      apiKey,
      input.brandName,
      input.brandFacts
    )
    return await defenseService.runDefenseCheck()
  } catch (error) {
    console.error("[runDefenseCheck] Error:", error)
    throw new Error("Failed to run defense check")
  }
}

/**
 * Check visibility on a specific platform
 */
export async function checkPlatformVisibility(
  input: VisibilityCheckInput
): Promise<PlatformVisibility> {
  try {
    const apiKey = getOpenRouterApiKey()
    const defenseService = createDefenseService(
      apiKey,
      input.brandName,
      input.brandFacts
    )
    return await defenseService.checkVisibility(input.platform, input.query)
  } catch (error) {
    console.error("[checkPlatformVisibility] Error:", error)
    throw new Error("Failed to check platform visibility")
  }
}

/**
 * Check visibility across multiple queries
 */
export async function batchCheckVisibility(input: {
  brandName: string
  brandFacts: BrandFacts
  platform: "chatgpt" | "claude" | "gemini" | "perplexity"
  queries: string[]
}): Promise<PlatformVisibility[]> {
  try {
    const apiKey = getOpenRouterApiKey()
    const defenseService = createDefenseService(
      apiKey,
      input.brandName,
      input.brandFacts
    )
    
    const results = await Promise.all(
      input.queries.map((query) =>
        defenseService.checkVisibility(input.platform, query)
      )
    )
    
    return results
  } catch (error) {
    console.error("[batchCheckVisibility] Error:", error)
    throw new Error("Failed to batch check visibility")
  }
}
