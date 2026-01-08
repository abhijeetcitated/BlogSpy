/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════
 * 🔍 RUN AUDIT - Server Actions for AI Tech Audit
 * ═══════════════════════════════════════════════════════════════════════════════════════════════
 * 
 * Next.js Server Actions to trigger AI Tech Audit from client components.
 * Uses the AuditService to check website AI-readiness.
 * 
 * REFACTORED: Now uses authAction wrapper for consistent auth/rate-limiting.
 * 
 * @example
 * ```tsx
 * "use client"
 * import { runTechAudit } from "@/src/features/ai-visibility/actions/run-audit"
 * 
 * const result = await runTechAudit({ domain: "example.com" })
 * if (result?.data?.success) {
 *   console.log(result.data.data.overallScore)
 * }
 * ```
 */

"use server"

import { authAction, z } from "@/src/lib/safe-action"
import { createAuditService } from "../services/audit.service"
import type { TechAuditResult, BotAccessStatus, SchemaValidation } from "../types"

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// SCHEMAS
// ═══════════════════════════════════════════════════════════════════════════════════════════════

const domainSchema = z.object({
  domain: z.string().min(1, "Domain is required"),
})

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
// SERVER ACTIONS (using authAction wrapper)
// ═══════════════════════════════════════════════════════════════════════════════════════════════

/**
 * Runs complete AI Tech Audit for a domain.
 * 
 * Checks:
 * - robots.txt for AI bot access (GPTBot, ClaudeBot, Applebot, etc.)
 * - llms.txt for AI instructions file
 * - Schema.org JSON-LD structured data
 * 
 * @example
 * const result = await runTechAudit({ domain: "example.com" })
 * if (result?.data?.success) {
 *   console.log(`AI Readiness Score: ${result.data.data.overallScore}%`)
 * }
 */
export const runTechAudit = authAction
  .schema(domainSchema)
  .action(async ({ parsedInput }): Promise<AuditActionResponse<TechAuditResult>> => {
    try {
      // Validate and normalize domain
      const domain = validateAndNormalizeDomain(parsedInput.domain)

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
  })

/**
 * Checks only robots.txt for AI bot access.
 * Useful for quick bot-specific checks.
 */
export const checkRobotsTxt = authAction
  .schema(domainSchema)
  .action(async ({ parsedInput }): Promise<AuditActionResponse<BotAccessStatus[]>> => {
    try {
      const domain = validateAndNormalizeDomain(parsedInput.domain)
      
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
  })

/**
 * Checks only llms.txt file existence.
 * Useful for checking AI instruction file compliance.
 */
export const checkLlmsTxt = authAction
  .schema(domainSchema)
  .action(async ({ parsedInput }): Promise<AuditActionResponse<{ exists: boolean; content: string | null; location?: string | null }>> => {
    try {
      const domain = validateAndNormalizeDomain(parsedInput.domain)
      
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
  })

/**
 * Checks only Schema.org structured data.
 * Useful for checking JSON-LD implementation.
 */
export const checkSchemaOrg = authAction
  .schema(domainSchema)
  .action(async ({ parsedInput }): Promise<AuditActionResponse<SchemaValidation>> => {
    try {
      const domain = validateAndNormalizeDomain(parsedInput.domain)
      
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
  })
