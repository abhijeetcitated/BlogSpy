/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════
 * 🔍 SCAN SERVICE - Full AI Visibility Scan Engine
 * ═══════════════════════════════════════════════════════════════════════════════════════════════
 * 
 * Production-grade service for scanning keywords across 7 AI platforms:
 * 
 * REAL APIs:
 * 1. Google AIO → DataForSEO SERP API
 * 2. ChatGPT → OpenRouter (gpt-4o-mini)
 * 3. Claude → OpenRouter (claude-3-haiku)
 * 4. Gemini → OpenRouter (gemini-flash-1.5)
 * 5. Perplexity → OpenRouter (perplexity/sonar)
 * 
 * VIRTUAL LOGIC:
 * 6. SearchGPT → Copy from Perplexity (proxy logic)
 * 7. Apple Siri → Calculated from Google rank + ChatGPT + Applebot status
 * 
 * @module ScanService
 * @see _INTEGRATION_GUIDE.ts for full architecture
 */

import { getOpenRouter, MODELS } from "@/src/lib/ai/openrouter"
import { getDataForSEOClient } from "@/src/lib/seo/dataforseo"
import { env } from "@/config/env"
import type { AIPlatform } from "../types"
import { 
  getMockGoogleData, 
  mockDelay,
} from "../mocks/scan.mock"
import { createMockScanResult, mockScanDelay } from "../data/mock-scan-results"

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════════════

/**
 * Result from Google AIO/SERP check
 */
export interface GoogleDataResult {
  status: "visible" | "hidden"
  rank: number | null
  snippet: string | null
  source: "ai_overview" | "featured_snippet" | "knowledge_graph" | "organic" | null
}

/**
 * Result from AI platform check (ChatGPT, Claude, Gemini, Perplexity)
 */
export interface AIResponseResult {
  platform: AIPlatform
  status: "visible" | "hidden"
  snippet: string
  mentionContext: string | null
  sentiment: "positive" | "neutral" | "negative"
  error?: string
}

/**
 * Result from virtual platform calculation
 */
export interface VirtualPlatformResult {
  searchgpt: {
    status: "visible" | "hidden"
    snippet: string
    note: string
  }
  siri: {
    status: "ready" | "at-risk" | "not-ready"
    score: number
    factors: string[]
  }
}

/**
 * Complete scan result for a keyword
 */
export interface FullScanResult {
  keyword: string
  brandName: string
  timestamp: string
  google: GoogleDataResult
  chatgpt: AIResponseResult
  claude: AIResponseResult
  gemini: AIResponseResult
  perplexity: AIResponseResult
  searchgpt: VirtualPlatformResult["searchgpt"]
  siri: VirtualPlatformResult["siri"]
  overallScore: number
  visiblePlatforms: number
  totalPlatforms: number
}

/**
 * Tech audit data needed for Siri calculation
 */
export interface TechAuditData {
  applebot_allowed: boolean
  gptbot_allowed: boolean
  googlebot_allowed: boolean
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════════════════════

/**
 * OpenRouter model mapping for each platform
 */
const PLATFORM_MODELS: Record<string, string> = {
  chatgpt: MODELS.GPT4O_MINI,
  claude: MODELS.CLAUDE_3_HAIKU,
  gemini: MODELS.GEMINI_FLASH,
  perplexity: MODELS.PERPLEXITY_SONAR,
}

/**
 * System prompt for AI visibility check
 */
const VISIBILITY_PROMPT = `You are a helpful AI assistant acting as a search engine. 
Provide recommendations and information naturally, citing sources where relevant.
If you mention specific products, services, or websites, do so naturally in context.`

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// SCAN SERVICE CLASS
// ═══════════════════════════════════════════════════════════════════════════════════════════════

export class ScanService {
  private brandName: string
  private brandDomain: string

  constructor(brandName: string, brandDomain?: string) {
    this.brandName = brandName.trim()
    // Extract domain name without TLD for matching
    this.brandDomain = brandDomain
      ? brandDomain.replace(/^https?:\/\//, "").replace(/\/$/, "")
      : brandName.toLowerCase().replace(/\s+/g, "")
  }

  // ─────────────────────────────────────────────────────────────────────────────────────────────
  // PUBLIC METHODS
  // ─────────────────────────────────────────────────────────────────────────────────────────────

  /**
   * Fetch Google SERP data via DataForSEO
   * Checks for AI Overview, Featured Snippets, Knowledge Graph, and Organic rankings
   */
  async fetchGoogleData(keyword: string): Promise<GoogleDataResult> {
    // MOCK MODE: Return realistic mock data with simulated delay
    if (env.useMockData) {
      await mockDelay(800)
      return getMockGoogleData(keyword, this.brandName)
    }

    try {
      const dataforseo = getDataForSEOClient()
      
      const response = await dataforseo.post("/serp/google/organic/live/advanced", [{
        keyword,
        location_code: 2840, // United States
        language_code: "en",
        depth: 20,
        // Include AI overview and other special results
        calculate_rectangles: false,
      }])

      const data = response.data
      
      if (data.status_code !== 20000 || !data.tasks?.[0]?.result?.[0]) {
        console.error("[fetchGoogleData] DataForSEO error:", data.status_message)
        return { status: "hidden", rank: null, snippet: null, source: null }
      }

      const result = data.tasks[0].result[0]
      const items = result.items || []

      // 1. Check AI Overview first (highest priority)
      const aiOverview = items.find((item: DataForSEOItem) => item.type === "ai_overview")
      if (aiOverview) {
        const isVisible = this.checkBrandMention(aiOverview.text || aiOverview.description || "")
        if (isVisible) {
          return {
            status: "visible",
            rank: 0, // Featured position
            snippet: (aiOverview.text || aiOverview.description || "").slice(0, 500),
            source: "ai_overview",
          }
        }
      }

      // 2. Check Featured Snippet
      const featuredSnippet = items.find((item: DataForSEOItem) => item.type === "featured_snippet")
      if (featuredSnippet) {
        const isVisible = this.checkBrandMention(featuredSnippet.description || featuredSnippet.title || "")
        if (isVisible) {
          return {
            status: "visible",
            rank: 0,
            snippet: (featuredSnippet.description || "").slice(0, 500),
            source: "featured_snippet",
          }
        }
      }

      // 3. Check Knowledge Graph
      const knowledgeGraph = items.find((item: DataForSEOItem) => item.type === "knowledge_graph")
      if (knowledgeGraph) {
        const isVisible = this.checkBrandMention(knowledgeGraph.description || knowledgeGraph.title || "")
        if (isVisible) {
          return {
            status: "visible",
            rank: 0,
            snippet: (knowledgeGraph.description || "").slice(0, 500),
            source: "knowledge_graph",
          }
        }
      }

      // 4. Check Organic Results
      const organicResults = items.filter((item: DataForSEOItem) => item.type === "organic")
      for (const organic of organicResults) {
        if (this.checkDomainMatch(organic.url || organic.domain || "")) {
          return {
            status: "visible",
            rank: organic.rank_absolute || organic.rank_group || 99,
            snippet: (organic.description || "").slice(0, 500),
            source: "organic",
          }
        }
      }

      // Not found in top results
      return { status: "hidden", rank: null, snippet: null, source: null }
      
    } catch (error) {
      console.error("[fetchGoogleData] Error:", error)
      throw new Error(`Google data fetch failed: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  /**
   * Fetch AI response from ChatGPT, Claude, Gemini, or Perplexity via OpenRouter
   * Checks if brand name appears in the response
   */
  async fetchAIResponse(
    keyword: string,
    platform: "chatgpt" | "claude" | "gemini" | "perplexity"
  ): Promise<AIResponseResult> {
    const model = PLATFORM_MODELS[platform]
    
    if (!model) {
      return {
        platform: platform as AIPlatform,
        status: "hidden",
        snippet: "",
        mentionContext: null,
        sentiment: "neutral",
        error: `Unknown platform: ${platform}`,
      }
    }

    try {
      const openrouter = getOpenRouter()
      
      const userPrompt = `I am looking for information about: ${keyword}
      
Please provide your top recommendations and explain why they are good choices. 
Include specific product names, services, or websites that would be helpful.`

      const response = await openrouter.chat.completions.create({
        model,
        messages: [
          { role: "system", content: VISIBILITY_PROMPT },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      })

      const responseText = response.choices[0]?.message?.content || ""
      
      // Check if brand is mentioned (case-insensitive)
      const isVisible = this.checkBrandMention(responseText)
      const mentionContext = isVisible ? this.extractMentionContext(responseText) : null
      const sentiment = isVisible ? this.analyzeSentiment(mentionContext || "") : "neutral"

      return {
        platform: platform as AIPlatform,
        status: isVisible ? "visible" : "hidden",
        snippet: responseText.slice(0, 1000),
        mentionContext,
        sentiment,
      }
      
    } catch (error) {
      console.error(`[fetchAIResponse] ${platform} error:`, error)
      return {
        platform: platform as AIPlatform,
        status: "hidden",
        snippet: "",
        mentionContext: null,
        sentiment: "neutral",
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }

  /**
   * Calculate virtual platform statuses (SearchGPT and Siri)
   * 
   * SearchGPT: Copies from Perplexity (both use real-time Bing search)
   * Siri: Calculated based on Google rank + ChatGPT visibility + Applebot access
   */
  calculateVirtualPlatforms(
    googleResult: GoogleDataResult,
    chatgptResult: AIResponseResult,
    perplexityResult: AIResponseResult,
    techAudit: TechAuditData
  ): VirtualPlatformResult {
    // ─────────────────────────────────────────────────────────────────────────────────────────
    // SearchGPT: Proxy from Perplexity
    // Reason: Both use real-time Bing Index, ~90% accuracy
    // ─────────────────────────────────────────────────────────────────────────────────────────
    const searchgpt = {
      status: perplexityResult.status,
      snippet: perplexityResult.snippet,
      note: "Simulated via Perplexity Sonar (shared Bing index)",
    }

    // ─────────────────────────────────────────────────────────────────────────────────────────
    // Apple Siri: Calculated metric
    // Logic: (Google Rank ≤ 3 OR ChatGPT visible) AND Applebot allowed
    // ─────────────────────────────────────────────────────────────────────────────────────────
    const factors: string[] = []
    let siriScore = 0

    // Factor 1: Google Ranking (max 40 points)
    if (googleResult.rank !== null) {
      if (googleResult.rank <= 1) {
        siriScore += 40
        factors.push("✅ Google #1 position")
      } else if (googleResult.rank <= 3) {
        siriScore += 30
        factors.push("✅ Google Top 3 position")
      } else if (googleResult.rank <= 5) {
        siriScore += 20
        factors.push("⚠️ Google Top 5 position")
      } else if (googleResult.rank <= 10) {
        siriScore += 10
        factors.push("⚠️ Google Top 10 position")
      }
    } else if (googleResult.source === "ai_overview" || googleResult.source === "featured_snippet") {
      siriScore += 40
      factors.push("✅ Featured in Google AI/Snippet")
    } else {
      factors.push("❌ Not ranking in Google Top 10")
    }

    // Factor 2: ChatGPT Visibility (max 30 points)
    if (chatgptResult.status === "visible") {
      siriScore += 30
      factors.push("✅ Visible in ChatGPT responses")
    } else {
      factors.push("❌ Not visible in ChatGPT")
    }

    // Factor 3: Applebot Access (max 30 points) - CRITICAL
    if (techAudit.applebot_allowed) {
      siriScore += 30
      factors.push("✅ Applebot allowed in robots.txt")
    } else {
      // Without Applebot, Siri can't crawl - major penalty
      siriScore = Math.max(0, siriScore - 20)
      factors.push("❌ Applebot BLOCKED in robots.txt")
    }

    // Determine Siri status
    let siriStatus: "ready" | "at-risk" | "not-ready"
    
    if (!techAudit.applebot_allowed) {
      // Applebot blocked is automatic fail
      siriStatus = "not-ready"
    } else if (siriScore >= 70) {
      siriStatus = "ready"
    } else if (siriScore >= 40) {
      siriStatus = "at-risk"
    } else {
      siriStatus = "not-ready"
    }

    return {
      searchgpt,
      siri: {
        status: siriStatus,
        score: siriScore,
        factors,
      },
    }
  }

  /**
   * Run full scan across all platforms
   * Uses Promise.allSettled for maximum concurrency and fault tolerance
   * 
   * MOCK MODE: When NEXT_PUBLIC_USE_MOCK_DATA=true, returns static mock data
   * with a 2-second simulated delay. No real API calls are made.
   */
  async runFullScan(keyword: string, techAudit: TechAuditData): Promise<FullScanResult> {
    // ─────────────────────────────────────────────────────────────────────────────────────────
    // MOCK MODE: Return static mock data with simulated delay
    // ─────────────────────────────────────────────────────────────────────────────────────────
    if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true" || env.useMockData) {
      console.log("[ScanService] 🎭 MOCK MODE - Returning static mock data")
      await mockScanDelay(2000) // Simulate 2s network delay
      return createMockScanResult(keyword, this.brandName)
    }

    // ─────────────────────────────────────────────────────────────────────────────────────────
    // REAL MODE: Call actual APIs
    // ─────────────────────────────────────────────────────────────────────────────────────────
    const timestamp = new Date().toISOString()

    // Run all API calls in parallel
    const [
      googleSettled,
      chatgptSettled,
      claudeSettled,
      geminiSettled,
      perplexitySettled,
    ] = await Promise.allSettled([
      this.fetchGoogleData(keyword),
      this.fetchAIResponse(keyword, "chatgpt"),
      this.fetchAIResponse(keyword, "claude"),
      this.fetchAIResponse(keyword, "gemini"),
      this.fetchAIResponse(keyword, "perplexity"),
    ])

    // Extract results with fallbacks for failures
    const google = googleSettled.status === "fulfilled" 
      ? googleSettled.value 
      : { status: "hidden" as const, rank: null, snippet: null, source: null }
    
    const chatgpt = chatgptSettled.status === "fulfilled"
      ? chatgptSettled.value
      : this.createErrorResult("chatgpt", chatgptSettled.reason)
    
    const claude = claudeSettled.status === "fulfilled"
      ? claudeSettled.value
      : this.createErrorResult("claude", claudeSettled.reason)
    
    const gemini = geminiSettled.status === "fulfilled"
      ? geminiSettled.value
      : this.createErrorResult("gemini", geminiSettled.reason)
    
    const perplexity = perplexitySettled.status === "fulfilled"
      ? perplexitySettled.value
      : this.createErrorResult("perplexity", perplexitySettled.reason)

    // Calculate virtual platforms
    const virtualPlatforms = this.calculateVirtualPlatforms(google, chatgpt, perplexity, techAudit)

    // Calculate overall visibility score
    const visibilityResults = [
      google.status === "visible",
      chatgpt.status === "visible",
      claude.status === "visible",
      gemini.status === "visible",
      perplexity.status === "visible",
      virtualPlatforms.searchgpt.status === "visible",
      virtualPlatforms.siri.status === "ready",
    ]
    
    const visiblePlatforms = visibilityResults.filter(Boolean).length
    const totalPlatforms = 7
    const overallScore = Math.round((visiblePlatforms / totalPlatforms) * 100)

    return {
      keyword,
      brandName: this.brandName,
      timestamp,
      google,
      chatgpt,
      claude,
      gemini,
      perplexity,
      searchgpt: virtualPlatforms.searchgpt,
      siri: virtualPlatforms.siri,
      overallScore,
      visiblePlatforms,
      totalPlatforms,
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────────────────────
  // PRIVATE HELPER METHODS
  // ─────────────────────────────────────────────────────────────────────────────────────────────

  /**
   * Check if brand name or domain appears in text (case-insensitive)
   */
  private checkBrandMention(text: string): boolean {
    if (!text) return false
    
    const lowerText = text.toLowerCase()
    const lowerBrand = this.brandName.toLowerCase()
    const lowerDomain = this.brandDomain.toLowerCase()

    // Check brand name
    if (lowerText.includes(lowerBrand)) return true

    // Check domain
    if (lowerText.includes(lowerDomain)) return true

    // Check domain without TLD
    const domainWithoutTld = lowerDomain.split(".")[0]
    if (domainWithoutTld.length > 2 && lowerText.includes(domainWithoutTld)) return true

    return false
  }

  /**
   * Check if URL matches brand domain
   */
  private checkDomainMatch(url: string): boolean {
    if (!url) return false
    
    const lowerUrl = url.toLowerCase()
    const lowerDomain = this.brandDomain.toLowerCase()

    // Direct domain match
    if (lowerUrl.includes(lowerDomain)) return true

    // Without www
    const domainNoWww = lowerDomain.replace(/^www\./, "")
    if (lowerUrl.includes(domainNoWww)) return true

    return false
  }

  /**
   * Extract the context around brand mention
   */
  private extractMentionContext(text: string): string | null {
    const lowerText = text.toLowerCase()
    const lowerBrand = this.brandName.toLowerCase()
    
    const index = lowerText.indexOf(lowerBrand)
    if (index === -1) return null

    // Get surrounding context (100 chars before and after)
    const start = Math.max(0, index - 100)
    const end = Math.min(text.length, index + this.brandName.length + 100)
    
    let context = text.slice(start, end)
    
    // Add ellipsis if truncated
    if (start > 0) context = "..." + context
    if (end < text.length) context = context + "..."
    
    return context
  }

  /**
   * Simple sentiment analysis based on keywords
   */
  private analyzeSentiment(text: string): "positive" | "neutral" | "negative" {
    if (!text) return "neutral"
    
    const lowerText = text.toLowerCase()
    
    const positiveWords = [
      "excellent", "best", "great", "amazing", "outstanding", "top",
      "recommend", "popular", "leading", "trusted", "reliable", "favorite",
    ]
    
    const negativeWords = [
      "avoid", "bad", "worst", "poor", "disappointing", "issues",
      "problems", "expensive", "limited", "lacking", "outdated",
    ]

    const positiveCount = positiveWords.filter(word => lowerText.includes(word)).length
    const negativeCount = negativeWords.filter(word => lowerText.includes(word)).length

    if (positiveCount > negativeCount) return "positive"
    if (negativeCount > positiveCount) return "negative"
    return "neutral"
  }

  /**
   * Create error result for failed API calls
   */
  private createErrorResult(platform: string, reason: unknown): AIResponseResult {
    return {
      platform: platform as AIPlatform,
      status: "hidden",
      snippet: "",
      mentionContext: null,
      sentiment: "neutral",
      error: reason instanceof Error ? reason.message : "Request failed",
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// TYPES (DataForSEO Response Items)
// ═══════════════════════════════════════════════════════════════════════════════════════════════

interface DataForSEOItem {
  type: string
  rank_group?: number
  rank_absolute?: number
  title?: string
  description?: string
  text?: string
  url?: string
  domain?: string
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// FACTORY EXPORT
// ═══════════════════════════════════════════════════════════════════════════════════════════════

export function createScanService(brandName: string, brandDomain?: string): ScanService {
  return new ScanService(brandName, brandDomain)
}
