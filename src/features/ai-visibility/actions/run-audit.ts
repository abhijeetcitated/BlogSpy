/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════
 * 🔍 RUN AUDIT - Server Actions for AI Tech Audit
 * ═══════════════════════════════════════════════════════════════════════════════════════════════
 * 
 * Next.js Server Actions to trigger AI Tech Audit from client components.
 * Uses the AuditService to check website AI-readiness.
 * 
 * @example
 * ```tsx
 * "use client"
 * import { runTechAudit } from "@/features/ai-visibility/actions/run-audit"
 * 
 * const result = await runTechAudit("example.com")
 * if (result.success) {
 *   console.log(result.data.overallScore)
 * }
 * ```
 */

"use server"

import { createServerClient } from "@/src/lib/supabase/server"
import { createAuditService } from "../services/audit.service"
import type { TechAuditResult, BotAccessStatus, SchemaValidation } from "../types"

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// RESPONSE TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════════════

/**
 * Standard server action response type.
 * Always returns either success with data OR error.
 */
export interface AuditActionResponse<T> {
  success: boolean
  data?: T
  error?: string
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// DOMAIN VALIDATION
// ═══════════════════════════════════════════════════════════════════════════════════════════════

/**
 * Validates and normalizes a domain input.
 * 
 * @param input - Raw domain input from user
 * @returns Normalized domain or null if invalid
 */
function validateAndNormalizeDomain(input: string): string | null {
  if (!input || typeof input !== "string") {
    return null
  }

  // Trim and lowercase
  let domain = input.trim().toLowerCase()

  // Remove protocol
  domain = domain.replace(/^https?:\/\//, "")
  
  // Remove www
  domain = domain.replace(/^www\./, "")
  
  // Remove paths, query strings, and fragments
  domain = domain.split("/")[0]
  domain = domain.split("?")[0]
  domain = domain.split("#")[0]

  // Basic domain validation (at least one dot, no spaces)
  if (!domain || !domain.includes(".") || domain.includes(" ")) {
    return null
  }

  // Check for valid domain characters
  const domainRegex = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/
  if (!domainRegex.test(domain)) {
    return null
  }

  return domain
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// SERVER ACTIONS
// ═══════════════════════════════════════════════════════════════════════════════════════════════

/**
 * Runs complete AI Tech Audit for a domain.
 * 
 * Checks:
 * - robots.txt for AI bot access (GPTBot, ClaudeBot, Applebot, etc.)
 * - llms.txt for AI instructions file
 * - Schema.org JSON-LD structured data
 * 
 * @param rawDomain - Domain to audit (with or without protocol)
 * @returns Typed response with audit results or error message
 * 
 * @example
 * const result = await runTechAudit("https://example.com")
 * if (result.success) {
 *   console.log(`AI Readiness Score: ${result.data.overallScore}%`)
 * } else {
 *   console.error(result.error)
 * }
 */
export async function runTechAudit(
  rawDomain: string
): Promise<AuditActionResponse<TechAuditResult>> {
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

    // Validate input
    const domain = validateAndNormalizeDomain(rawDomain)
    
    if (!domain) {
      return {
        success: false,
        error: "Please enter a valid domain (e.g., example.com)",
      }
    }

    // Run the audit
    const auditService = createAuditService(domain)
    const result = await auditService.runFullAudit()

    return {
      success: true,
      data: result,
    }
  } catch (error) {
    console.error("[runTechAudit] Error:", error)
    
    // Return user-friendly error messages
    const message = error instanceof Error ? error.message : "Unknown error occurred"
    
    if (message.includes("fetch failed") || message.includes("ENOTFOUND")) {
      return {
        success: false,
        error: "Could not reach the website. Please check the URL and try again.",
      }
    }
    
    if (message.includes("abort") || message.includes("timeout")) {
      return {
        success: false,
        error: "The website took too long to respond. Please try again.",
      }
    }

    return {
      success: false,
      error: "Failed to run audit. Please try again later.",
    }
  }
}

/**
 * Checks only robots.txt for AI bot access.
 * Useful for quick bot-specific checks.
 */
export async function checkRobotsTxt(
  rawDomain: string
): Promise<AuditActionResponse<BotAccessStatus[]>> {
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

    const domain = validateAndNormalizeDomain(rawDomain)
    
    if (!domain) {
      return {
        success: false,
        error: "Please enter a valid domain",
      }
    }

    const auditService = createAuditService(domain)
    const result = await auditService.checkRobotsTxt()

    return {
      success: true,
      data: result,
    }
  } catch (error) {
    console.error("[checkRobotsTxt] Error:", error)
    return {
      success: false,
      error: "Failed to check robots.txt",
    }
  }
}

/**
 * Checks only llms.txt file existence.
 * Useful for checking AI instruction file compliance.
 */
export async function checkLlmsTxt(
  rawDomain: string
): Promise<AuditActionResponse<{ exists: boolean; content: string | null; location?: string | null }>> {
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

    const domain = validateAndNormalizeDomain(rawDomain)
    
    if (!domain) {
      return {
        success: false,
        error: "Please enter a valid domain",
      }
    }

    const auditService = createAuditService(domain)
    const result = await auditService.checkLlmsTxt()

    return {
      success: true,
      data: result,
    }
  } catch (error) {
    console.error("[checkLlmsTxt] Error:", error)
    return {
      success: false,
      error: "Failed to check llms.txt",
    }
  }
}

/**
 * Checks only Schema.org structured data.
 * Useful for checking JSON-LD implementation.
 */
export async function checkSchemaOrg(
  rawDomain: string
): Promise<AuditActionResponse<SchemaValidation>> {
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

    const domain = validateAndNormalizeDomain(rawDomain)
    
    if (!domain) {
      return {
        success: false,
        error: "Please enter a valid domain",
      }
    }

    const auditService = createAuditService(domain)
    const result = await auditService.checkSchemaOrg()

    return {
      success: true,
      data: result,
    }
  } catch (error) {
    console.error("[checkSchemaOrg] Error:", error)
    return {
      success: false,
      error: "Failed to check Schema.org",
    }
  }
}
