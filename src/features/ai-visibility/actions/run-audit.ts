/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════
 * 🔍 RUN AUDIT - Server Action for Tech Audit
 * ═══════════════════════════════════════════════════════════════════════════════════════════════
 * 
 * Next.js Server Action to trigger tech audit from client components
 * 
 * Usage:
 * ```tsx
 * const { runTechAudit } = await import("@/features/ai-visibility/actions/run-audit")
 * const result = await runTechAudit("blogspy.io")
 * ```
 */

"use server"

import { createAuditService } from "../services/audit.service"
import type { TechAuditResult } from "../types"

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// SERVER ACTIONS
// ═══════════════════════════════════════════════════════════════════════════════════════════════

/**
 * Run complete tech audit for a domain
 */
export async function runTechAudit(domain: string): Promise<TechAuditResult> {
  try {
    const auditService = createAuditService(domain)
    const result = await auditService.runFullAudit()
    return result
  } catch (error) {
    console.error("[runTechAudit] Error:", error)
    throw new Error("Failed to run tech audit")
  }
}

/**
 * Check only robots.txt for AI bots
 */
export async function checkRobotsTxt(domain: string) {
  try {
    const auditService = createAuditService(domain)
    return await auditService.checkRobotsTxt()
  } catch (error) {
    console.error("[checkRobotsTxt] Error:", error)
    throw new Error("Failed to check robots.txt")
  }
}

/**
 * Check only llms.txt
 */
export async function checkLlmsTxt(domain: string) {
  try {
    const auditService = createAuditService(domain)
    return await auditService.checkLlmsTxt()
  } catch (error) {
    console.error("[checkLlmsTxt] Error:", error)
    throw new Error("Failed to check llms.txt")
  }
}

/**
 * Check only Schema.org
 */
export async function checkSchemaOrg(domain: string) {
  try {
    const auditService = createAuditService(domain)
    return await auditService.checkSchemaOrg()
  } catch (error) {
    console.error("[checkSchemaOrg] Error:", error)
    throw new Error("Failed to check Schema.org")
  }
}
