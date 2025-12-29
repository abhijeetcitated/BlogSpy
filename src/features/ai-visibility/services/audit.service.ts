/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════
 * 🛡️ AUDIT SERVICE - Tech Audit for AI Visibility
 * ═══════════════════════════════════════════════════════════════════════════════════════════════
 * 
 * This service handles:
 * - robots.txt parsing (GPTBot, ClaudeBot, Applebot, Google-Extended)
 * - llms.txt checking (2026 standard)
 * - Schema.org validation (JSON-LD extraction)
 * 
 * @see _INTEGRATION_GUIDE.ts for full architecture
 */

import { TechAuditResult, BotAccessStatus, SchemaValidation } from "../types"

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// BOT NAMES TO CHECK
// ═══════════════════════════════════════════════════════════════════════════════════════════════

const AI_BOTS = [
  { id: "gptbot", name: "GPTBot", platform: "ChatGPT/OpenAI" },
  { id: "claudebot", name: "ClaudeBot", platform: "Claude/Anthropic" },
  { id: "applebot", name: "Applebot", platform: "Apple Siri" },
  { id: "google-extended", name: "Google-Extended", platform: "Google AI" },
  { id: "perplexitybot", name: "PerplexityBot", platform: "Perplexity" },
] as const

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// AUDIT SERVICE CLASS
// ═══════════════════════════════════════════════════════════════════════════════════════════════

export class AuditService {
  private domain: string

  constructor(domain: string) {
    // Clean domain (remove protocol, trailing slash)
    this.domain = domain
      .replace(/^https?:\/\//, "")
      .replace(/\/$/, "")
  }

  /**
   * Run complete tech audit
   */
  async runFullAudit(): Promise<TechAuditResult> {
    const [robotsResult, llmsTxtResult, schemaResult] = await Promise.all([
      this.checkRobotsTxt(),
      this.checkLlmsTxt(),
      this.checkSchemaOrg(),
    ])

    // Calculate overall score
    const score = this.calculateAuditScore(robotsResult, llmsTxtResult, schemaResult)

    return {
      domain: this.domain,
      timestamp: new Date().toISOString(),
      robotsTxt: robotsResult,
      llmsTxt: llmsTxtResult,
      schema: schemaResult,
      overallScore: score,
    }
  }

  /**
   * Check robots.txt for AI bot access
   */
  async checkRobotsTxt(): Promise<BotAccessStatus[]> {
    try {
      const response = await fetch(`https://${this.domain}/robots.txt`, {
        next: { revalidate: 3600 }, // Cache for 1 hour
      })

      if (!response.ok) {
        // No robots.txt = all bots allowed
        return AI_BOTS.map((bot) => ({
          botId: bot.id,
          botName: bot.name,
          platform: bot.platform,
          isAllowed: true,
          reason: "No robots.txt found - all bots allowed by default",
        }))
      }

      const robotsTxt = await response.text()
      return this.parseRobotsTxt(robotsTxt)
    } catch (error) {
      console.error("Error fetching robots.txt:", error)
      return AI_BOTS.map((bot) => ({
        botId: bot.id,
        botName: bot.name,
        platform: bot.platform,
        isAllowed: true,
        reason: "Could not fetch robots.txt - assuming allowed",
      }))
    }
  }

  /**
   * Parse robots.txt content
   */
  private parseRobotsTxt(content: string): BotAccessStatus[] {
    const lines = content.split("\n").map((line) => line.trim().toLowerCase())
    const results: BotAccessStatus[] = []

    for (const bot of AI_BOTS) {
      let isAllowed = true
      let reason = "No specific rules found - allowed by default"
      let inBotSection = false

      for (const line of lines) {
        // Check for user-agent directive
        if (line.startsWith("user-agent:")) {
          const agent = line.replace("user-agent:", "").trim()
          inBotSection = agent === "*" || agent.includes(bot.name.toLowerCase())
        }

        // Check for disallow directive
        if (inBotSection && line.startsWith("disallow:")) {
          const path = line.replace("disallow:", "").trim()
          if (path === "/" || path === "/*") {
            isAllowed = false
            reason = `Blocked by "Disallow: ${path}"`
            break
          }
        }

        // Check for allow directive (overrides disallow)
        if (inBotSection && line.startsWith("allow:")) {
          const path = line.replace("allow:", "").trim()
          if (path === "/" || path === "/*") {
            isAllowed = true
            reason = `Explicitly allowed by "Allow: ${path}"`
          }
        }
      }

      results.push({
        botId: bot.id,
        botName: bot.name,
        platform: bot.platform,
        isAllowed,
        reason,
      })
    }

    return results
  }

  /**
   * Check if llms.txt exists (2026 standard)
   */
  async checkLlmsTxt(): Promise<{ exists: boolean; content: string | null }> {
    try {
      const response = await fetch(`https://${this.domain}/llms.txt`, {
        next: { revalidate: 3600 },
      })

      if (response.ok) {
        const content = await response.text()
        return { exists: true, content }
      }

      return { exists: false, content: null }
    } catch {
      return { exists: false, content: null }
    }
  }

  /**
   * Check Schema.org JSON-LD on homepage
   */
  async checkSchemaOrg(): Promise<SchemaValidation> {
    try {
      const response = await fetch(`https://${this.domain}`, {
        next: { revalidate: 3600 },
      })

      if (!response.ok) {
        return { hasSchema: false, schemas: [], errors: ["Could not fetch homepage"] }
      }

      const html = await response.text()
      return this.extractSchemas(html)
    } catch {
      return { hasSchema: false, schemas: [], errors: ["Error fetching homepage"] }
    }
  }

  /**
   * Extract JSON-LD schemas from HTML
   */
  private extractSchemas(html: string): SchemaValidation {
    const schemas: string[] = []
    const errors: string[] = []

    // Find all JSON-LD script tags
    const jsonLdRegex = /<script[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
    let match

    while ((match = jsonLdRegex.exec(html)) !== null) {
      try {
        const jsonContent = match[1].trim()
        const parsed = JSON.parse(jsonContent)

        // Extract @type
        if (parsed["@type"]) {
          schemas.push(parsed["@type"])
        } else if (Array.isArray(parsed)) {
          parsed.forEach((item) => {
            if (item["@type"]) schemas.push(item["@type"])
          })
        }
      } catch {
        errors.push("Invalid JSON-LD found")
      }
    }

    return {
      hasSchema: schemas.length > 0,
      schemas: [...new Set(schemas)], // Remove duplicates
      errors,
    }
  }

  /**
   * Calculate overall audit score (0-100)
   */
  private calculateAuditScore(
    robots: BotAccessStatus[],
    llms: { exists: boolean; content: string | null },
    schema: SchemaValidation
  ): number {
    let score = 0

    // Robots.txt scoring (50 points max)
    const allowedBots = robots.filter((r) => r.isAllowed).length
    score += (allowedBots / robots.length) * 50

    // LLMs.txt scoring (20 points)
    if (llms.exists) score += 20

    // Schema scoring (30 points)
    if (schema.hasSchema) {
      score += 15
      // Bonus for important schema types
      const importantSchemas = ["Organization", "Product", "Article", "FAQPage", "HowTo"]
      const hasImportant = schema.schemas.some((s: string) => importantSchemas.includes(s))
      if (hasImportant) score += 15
    }

    return Math.round(score)
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// SINGLETON EXPORT
// ═══════════════════════════════════════════════════════════════════════════════════════════════

export function createAuditService(domain: string): AuditService {
  return new AuditService(domain)
}
