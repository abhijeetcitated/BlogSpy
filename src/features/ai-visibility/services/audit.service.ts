/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════
 * 🛡️ AI TECH AUDIT SERVICE - Production-Grade Implementation
 * ═══════════════════════════════════════════════════════════════════════════════════════════════
 * 
 * Scans websites for AI Agent (ChatGPT, Claude, Apple Siri) crawlability.
 * 
 * Checks performed:
 * 1. robots.txt - AI Bot access (GPTBot, ClaudeBot, Applebot, CCBot)
 * 2. llms.txt - 2026 AI Standard for LLM instructions
 * 3. Schema.org - JSON-LD structured data validation
 * 
 * @module AuditService
 * @see https://platform.openai.com/docs/bots/gptbot - GPTBot documentation
 * @see https://docs.anthropic.com/en/docs/user-agents - ClaudeBot documentation
 * @see https://support.apple.com/en-us/HT204683 - Applebot documentation
 */

import robotsParser from "robots-parser"
import * as cheerio from "cheerio"
import type { TechAuditResult, BotAccessStatus, SchemaValidation } from "../types"

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════════════════════

/**
 * User-Agent header for ethical crawling.
 * Identifies BlogSpy as the requester so site owners can see who's checking.
 */
const USER_AGENT = "BlogSpy-AuditBot/1.0 (+https://blogspy.io/bot)"

/**
 * Request timeout in milliseconds.
 * 5 seconds is industry standard to prevent hanging on slow sites.
 */
const FETCH_TIMEOUT_MS = 5000

/**
 * AI Bots to check in robots.txt.
 * 
 * - GPTBot: OpenAI's crawler for training and web browsing
 * - ClaudeBot: Anthropic's Claude web browsing agent
 * - Applebot: Apple's crawler for Siri, Spotlight, Safari (critical for iOS users)
 * - CCBot: Common Crawl bot (used by many AI training datasets)
 * - PerplexityBot: Perplexity AI's crawler for real-time search
 * - Google-Extended: Google's AI training crawler (Gemini)
 */
const AI_BOTS = [
  { 
    id: "gptbot", 
    name: "GPTBot", 
    userAgent: "GPTBot",
    platform: "ChatGPT/OpenAI",
    description: "OpenAI's web crawler for ChatGPT browsing and model training"
  },
  { 
    id: "claudebot", 
    name: "ClaudeBot", 
    userAgent: "ClaudeBot",
    platform: "Claude/Anthropic",
    description: "Anthropic's crawler for Claude web browsing features"
  },
  { 
    id: "applebot", 
    name: "Applebot", 
    userAgent: "Applebot",
    platform: "Apple Siri/Spotlight",
    description: "Apple's crawler for Siri answers and Safari suggestions"
  },
  { 
    id: "ccbot", 
    name: "CCBot", 
    userAgent: "CCBot",
    platform: "Common Crawl/AI Training",
    description: "Common Crawl bot used in AI training datasets"
  },
  { 
    id: "perplexitybot", 
    name: "PerplexityBot", 
    userAgent: "PerplexityBot",
    platform: "Perplexity AI",
    description: "Perplexity's crawler for real-time AI search"
  },
  { 
    id: "google-extended", 
    name: "Google-Extended", 
    userAgent: "Google-Extended",
    platform: "Google Gemini",
    description: "Google's AI training crawler for Gemini models"
  },
] as const

/**
 * Important Schema.org types for AI visibility.
 * These help AI systems understand content context.
 */
const IMPORTANT_SCHEMA_TYPES = [
  "Organization",      // Company info for business queries
  "Product",           // E-commerce listings
  "SoftwareApplication", // SaaS products
  "Article",           // Blog posts, news
  "FAQPage",           // FAQ content (great for AI answers)
  "HowTo",             // Tutorial content
  "Review",            // Reviews and ratings
  "LocalBusiness",     // Local SEO
  "Person",            // Personal brands
  "WebSite",           // Site-level info
  "BreadcrumbList",    // Navigation context
] as const

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════════════════════

/**
 * Creates a fetch request with timeout support.
 * Uses AbortController for clean cancellation.
 */
async function fetchWithTimeout(
  url: string, 
  options: RequestInit = {},
  timeoutMs: number = FETCH_TIMEOUT_MS
): Promise<Response> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        "User-Agent": USER_AGENT,
        ...options.headers,
      },
    })
    return response
  } finally {
    clearTimeout(timeoutId)
  }
}

/**
 * Normalizes a domain string for consistent processing.
 * Removes protocol, www, trailing slashes, and paths.
 * 
 * @example
 * normalizeDomain("https://www.example.com/page") // "example.com"
 */
function normalizeDomain(input: string): string {
  let domain = input.trim().toLowerCase()
  
  // Remove protocol
  domain = domain.replace(/^https?:\/\//, "")
  
  // Remove www
  domain = domain.replace(/^www\./, "")
  
  // Remove paths and query strings
  domain = domain.split("/")[0]
  domain = domain.split("?")[0]
  domain = domain.split("#")[0]
  
  return domain
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// AUDIT SERVICE CLASS
// ═══════════════════════════════════════════════════════════════════════════════════════════════

export class AuditService {
  private readonly domain: string
  private readonly baseUrl: string

  constructor(domain: string) {
    this.domain = normalizeDomain(domain)
    this.baseUrl = `https://${this.domain}`
  }

  // ─────────────────────────────────────────────────────────────────────────────────────────────
  // PUBLIC METHODS
  // ─────────────────────────────────────────────────────────────────────────────────────────────

  /**
   * Runs complete AI Tech Audit.
   * Executes all checks in parallel for speed.
   * 
   * @returns Complete audit result with readiness score
   */
  async runFullAudit(): Promise<TechAuditResult> {
    // Run all checks in parallel for performance
    const [robotsResult, llmsTxtResult, schemaResult] = await Promise.all([
      this.checkRobotsTxt(),
      this.checkLlmsTxt(),
      this.checkSchemaOrg(),
    ])

    // Calculate overall AI readiness score
    const overallScore = this.calculateReadinessScore(
      robotsResult,
      llmsTxtResult,
      schemaResult
    )

    return {
      domain: this.domain,
      timestamp: new Date().toISOString(),
      robotsTxt: robotsResult,
      llmsTxt: llmsTxtResult,
      schema: schemaResult,
      overallScore,
    }
  }

  /**
   * Checks robots.txt for AI bot access permissions.
   * 
   * Uses robots-parser library for RFC 9309 compliant parsing.
   * Treats 404/errors as "allowed" (web standard).
   * 
   * @see https://www.rfc-editor.org/rfc/rfc9309.html
   */
  async checkRobotsTxt(): Promise<BotAccessStatus[]> {
    const robotsUrl = `${this.baseUrl}/robots.txt`

    try {
      const response = await fetchWithTimeout(robotsUrl)

      // No robots.txt = all bots allowed (web standard)
      if (response.status === 404) {
        return this.createBotStatusList(true, "No robots.txt found - all bots allowed by default")
      }

      if (!response.ok) {
        return this.createBotStatusList(true, `robots.txt returned ${response.status} - treating as allowed`)
      }

      const robotsTxtContent = await response.text()
      return this.parseRobotsTxt(robotsUrl, robotsTxtContent)

    } catch (error) {
      // Network errors = assume allowed (be optimistic)
      const message = error instanceof Error ? error.message : "Unknown error"
      
      if (message.includes("abort")) {
        return this.createBotStatusList(true, "Request timed out - assuming allowed")
      }
      
      return this.createBotStatusList(true, `Could not fetch robots.txt: ${message}`)
    }
  }

  /**
   * Checks for llms.txt file (emerging 2026 standard).
   * 
   * llms.txt is a proposed standard for giving instructions to LLMs about how to
   * interpret and represent your content. Similar to robots.txt but for AI behavior.
   * 
   * Checks two locations:
   * - /llms.txt (common location)
   * - /.well-known/llms.txt (RFC 8615 compliant location)
   * 
   * Uses HEAD request for speed - we only need to know if it exists.
   * 
   * @see https://llmstxt.org/ - The llms.txt proposal
   */
  async checkLlmsTxt(): Promise<{ exists: boolean; content: string | null; location?: string | null }> {
    const locations = [
      `${this.baseUrl}/llms.txt`,
      `${this.baseUrl}/.well-known/llms.txt`,
    ]

    for (const url of locations) {
      try {
        // First, do a HEAD request to check existence (faster)
        const headResponse = await fetchWithTimeout(url, { method: "HEAD" })
        
        if (headResponse.ok) {
          // File exists, now fetch content
          const getResponse = await fetchWithTimeout(url)
          
          if (getResponse.ok) {
            const content = await getResponse.text()
            return {
              exists: true,
              content: content.slice(0, 1000), // Limit content size
              location: url.replace(this.baseUrl, ""),
            }
          }
        }
      } catch {
        // Continue to next location
        continue
      }
    }

    return {
      exists: false,
      content: null,
      location: null,
    }
  }

  /**
   * Checks homepage for Schema.org JSON-LD structured data.
   * 
   * Schema.org markup helps AI systems understand:
   * - What type of content/business this is (Organization, Product)
   * - Key facts (pricing, features, FAQs)
   * - Relationships between entities
   * 
   * Uses Cheerio for fast HTML parsing without browser overhead.
   * 
   * @see https://schema.org/docs/gs.html - Schema.org getting started
   */
  async checkSchemaOrg(): Promise<SchemaValidation> {
    try {
      const response = await fetchWithTimeout(this.baseUrl, {
        headers: {
          "Accept": "text/html",
        },
      })

      if (!response.ok) {
        return {
          hasSchema: false,
          schemas: [],
          errors: [`Homepage returned ${response.status}`],
        }
      }

      const html = await response.text()
      return this.extractSchemas(html)

    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error"
      
      if (message.includes("abort")) {
        return {
          hasSchema: false,
          schemas: [],
          errors: ["Request timed out while fetching homepage"],
        }
      }
      
      return {
        hasSchema: false,
        schemas: [],
        errors: [`Could not fetch homepage: ${message}`],
      }
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────────────────────
  // PRIVATE METHODS
  // ─────────────────────────────────────────────────────────────────────────────────────────────

  /**
   * Parses robots.txt content using robots-parser library.
   * RFC 9309 compliant parsing.
   */
  private parseRobotsTxt(robotsUrl: string, content: string): BotAccessStatus[] {
    const robots = robotsParser(robotsUrl, content)
    const results: BotAccessStatus[] = []

    for (const bot of AI_BOTS) {
      // Check if bot is allowed to access root path
      const isAllowed = robots.isAllowed("/", bot.userAgent) ?? true
      
      // Get the line that affects this bot (for debugging)
      const line = robots.getMatchingLineNumber("/", bot.userAgent)
      
      let reason: string
      if (isAllowed) {
        reason = line ? `Allowed (line ${line})` : "No blocking rules found"
      } else {
        reason = line ? `Blocked (line ${line})` : "Blocked by catch-all rule"
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
   * Creates a status list with same status for all bots.
   * Used for error cases and missing robots.txt.
   */
  private createBotStatusList(isAllowed: boolean, reason: string): BotAccessStatus[] {
    return AI_BOTS.map((bot) => ({
      botId: bot.id,
      botName: bot.name,
      platform: bot.platform,
      isAllowed,
      reason,
    }))
  }

  /**
   * Extracts Schema.org JSON-LD from HTML using Cheerio.
   * Handles both single objects and arrays of schemas.
   */
  private extractSchemas(html: string): SchemaValidation {
    const $ = cheerio.load(html)
    const schemas: string[] = []
    const errors: string[] = []

    // Find all JSON-LD script tags
    $('script[type="application/ld+json"]').each((_, element) => {
      try {
        const jsonContent = $(element).html()
        
        if (!jsonContent) return

        const parsed = JSON.parse(jsonContent)
        
        // Handle single schema object
        if (parsed["@type"]) {
          const types = Array.isArray(parsed["@type"]) 
            ? parsed["@type"] 
            : [parsed["@type"]]
          schemas.push(...types)
        }
        
        // Handle @graph array (common in WordPress/Yoast)
        if (parsed["@graph"] && Array.isArray(parsed["@graph"])) {
          for (const item of parsed["@graph"]) {
            if (item["@type"]) {
              const types = Array.isArray(item["@type"]) 
                ? item["@type"] 
                : [item["@type"]]
              schemas.push(...types)
            }
          }
        }
        
        // Handle top-level array
        if (Array.isArray(parsed)) {
          for (const item of parsed) {
            if (item["@type"]) {
              const types = Array.isArray(item["@type"]) 
                ? item["@type"] 
                : [item["@type"]]
              schemas.push(...types)
            }
          }
        }
      } catch {
        errors.push("Invalid JSON-LD syntax detected")
      }
    })

    // Deduplicate schemas
    const uniqueSchemas = [...new Set(schemas)]

    return {
      hasSchema: uniqueSchemas.length > 0,
      schemas: uniqueSchemas,
      errors: errors.length > 0 ? [...new Set(errors)] : [],
    }
  }

  /**
   * Calculates overall AI Readiness Score (0-100).
   * 
   * Scoring breakdown:
   * - robots.txt (50 points): Bot access permissions
   * - llms.txt (15 points): Forward-thinking AI instructions
   * - Schema.org (35 points): Structured data quality
   */
  private calculateReadinessScore(
    robots: BotAccessStatus[],
    llms: { exists: boolean; content: string | null },
    schema: SchemaValidation
  ): number {
    let score = 0

    // ─────────────────────────────────────────
    // robots.txt Scoring (50 points max)
    // ─────────────────────────────────────────
    // Each allowed bot = points proportional to its importance
    const botWeights: Record<string, number> = {
      gptbot: 12,           // ChatGPT is most used
      claudebot: 10,        // Claude is second
      applebot: 10,         // Siri reaches billions of iOS users
      perplexitybot: 8,     // Growing fast
      "google-extended": 6, // Important for Gemini
      ccbot: 4,             // Training data
    }

    for (const bot of robots) {
      if (bot.isAllowed && botWeights[bot.botId]) {
        score += botWeights[bot.botId]
      }
    }

    // ─────────────────────────────────────────
    // llms.txt Scoring (15 points)
    // ─────────────────────────────────────────
    // Having llms.txt shows forward-thinking approach
    if (llms.exists) {
      score += 15
    }

    // ─────────────────────────────────────────
    // Schema.org Scoring (35 points max)
    // ─────────────────────────────────────────
    if (schema.hasSchema) {
      // Base points for having any schema
      score += 10

      // Bonus for important schema types
      const foundImportant = schema.schemas.filter((s) =>
        IMPORTANT_SCHEMA_TYPES.includes(s as typeof IMPORTANT_SCHEMA_TYPES[number])
      )
      
      // Up to 25 more points based on schema diversity
      const schemaBonus = Math.min(foundImportant.length * 5, 25)
      score += schemaBonus
    }

    // Ensure score is within bounds
    return Math.min(Math.max(Math.round(score), 0), 100)
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// FACTORY FUNCTION
// ═══════════════════════════════════════════════════════════════════════════════════════════════

/**
 * Creates a new AuditService instance.
 * Factory pattern for clean instantiation.
 * 
 * @param domain - Website domain to audit (with or without protocol)
 * @returns AuditService instance
 * 
 * @example
 * const service = createAuditService("example.com")
 * const result = await service.runFullAudit()
 */
export function createAuditService(domain: string): AuditService {
  return new AuditService(domain)
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// DEFAULT EXPORT
// ═══════════════════════════════════════════════════════════════════════════════════════════════

export default AuditService
