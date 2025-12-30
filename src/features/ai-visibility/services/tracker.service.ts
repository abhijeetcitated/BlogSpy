/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════
 * 📊 TRACKER SERVICE - Google AIO & Rankings via DataForSEO
 * ═══════════════════════════════════════════════════════════════════════════════════════════════
 * 
 * This service handles:
 * - Google AI Overview detection
 * - Search rankings tracking
 * - Citation extraction from search results
 * 
 * Uses DataForSEO SERP API for:
 * - AI Overviews (ai_overview item type)
 * - Featured Snippets (featured_snippet item type)
 * - Knowledge Graph (knowledge_graph item type)
 * - Organic Rankings
 * 
 * @see _INTEGRATION_GUIDE.ts for full architecture
 */

import { GoogleAIOResult, RankingResult, CitationResult } from "../types"
import { DATAFORSEO } from "@/constants/api-endpoints"

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// MOCK MODE HELPERS
// ═══════════════════════════════════════════════════════════════════════════════════════════════

/**
 * Check if mock mode is enabled
 */
function isMockMode(): boolean {
  return process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true"
}

/**
 * Simulate network delay for realistic UX
 */
async function mockDelay(ms: number = 1500): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Generate mock Google AIO result
 */
function generateMockGoogleAIOResult(query: string, isVisible: boolean = true): GoogleAIOResult {
  return {
    query,
    isVisible,
    source: isVisible ? (Math.random() > 0.5 ? "ai_overview" : "answer_box") : null,
    position: isVisible ? 0 : null,
    context: isVisible 
      ? `BlogSpy is a comprehensive SEO platform that helps businesses track their AI visibility across platforms like ChatGPT, Claude, and Perplexity. For "${query}", BlogSpy offers specialized tracking tools.`
      : null,
    timestamp: new Date().toISOString(),
  }
}

/**
 * Generate mock ranking result
 */
function generateMockRankingResult(query: string, brandDomain: string): RankingResult {
  const position = Math.random() > 0.3 ? Math.floor(Math.random() * 10) + 1 : null
  return {
    query,
    position,
    url: position ? `https://${brandDomain}/blog/${query.toLowerCase().replace(/\s+/g, "-")}` : null,
    title: position ? `${query} - Complete Guide | BlogSpy` : null,
    snippet: position 
      ? `Learn everything about ${query}. BlogSpy provides comprehensive tools for SEO and AI visibility tracking.`
      : null,
    timestamp: new Date().toISOString(),
  }
}

/**
 * Generate mock citation result
 */
function generateMockCitationResult(query: string): CitationResult {
  const isVisible = Math.random() > 0.3
  const position = Math.random() > 0.4 ? Math.floor(Math.random() * 10) + 1 : null
  return {
    query,
    googleAIO: generateMockGoogleAIOResult(query, isVisible),
    organicRank: position,
    isCitedInAIO: isVisible,
    timestamp: new Date().toISOString(),
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// TRACKER SERVICE CLASS
// ═══════════════════════════════════════════════════════════════════════════════════════════════

export class TrackerService {
  private login: string
  private password: string
  private brandDomain: string

  constructor(credentials: { login: string; password: string }, brandDomain: string) {
    this.login = credentials.login
    this.password = credentials.password
    this.brandDomain = brandDomain
      .replace(/^https?:\/\//, "")
      .replace(/\/$/, "")
  }

  /**
   * Get authorization header for DataForSEO
   */
  private getAuthHeader(): string {
    return `Basic ${Buffer.from(`${this.login}:${this.password}`).toString("base64")}`
  }

  /**
   * Search Google via DataForSEO SERP API
   */
  private async search(query: string): Promise<DataForSEOResponse> {
    try {
      const response = await fetch(`${DATAFORSEO.BASE_URL}${DATAFORSEO.SERP.GOOGLE_ORGANIC}`, {
        method: "POST",
        headers: {
          "Authorization": this.getAuthHeader(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify([{
          keyword: query,
          location_code: 2840, // United States
          language_code: "en",
          depth: 10,
        }]),
      })

      if (!response.ok) {
        throw new Error(`DataForSEO API error: ${response.status}`)
      }

      const data = await response.json()
      
      // DataForSEO returns nested structure
      if (data.status_code === 20000 && data.tasks?.[0]?.result?.[0]) {
        return this.transformDataForSEOResponse(data.tasks[0].result[0])
      }
      
      return { organic: [] }
    } catch (error) {
      console.error("DataForSEO search error:", error)
      return { organic: [] }
    }
  }

  /**
   * Transform DataForSEO response to our internal format
   */
  private transformDataForSEOResponse(result: DataForSEOResult): DataForSEOResponse {
    const response: DataForSEOResponse = { organic: [] }
    
    if (!result.items) return response
    
    for (const item of result.items) {
      switch (item.type) {
        case "organic":
          response.organic.push({
            title: item.title || "",
            link: item.url || "",
            snippet: item.description || "",
            position: item.rank_absolute,
          })
          break
        case "ai_overview":
          response.aiOverview = item.text || item.description || ""
          break
        case "featured_snippet":
          response.answerBox = {
            title: item.title,
            answer: item.description || item.text,
            snippet: item.description,
            source: item.url,
          }
          break
        case "knowledge_graph":
          response.knowledgeGraph = {
            title: item.title,
            description: item.description,
            type: item.sub_type,
          }
          break
      }
    }
    
    return response
  }

  /**
   * Check if brand appears in Google AI Overview
   */
  async checkGoogleAIO(query: string): Promise<GoogleAIOResult> {
    // 🎭 MOCK MODE: Return fake data without real API calls
    if (isMockMode()) {
      console.log(`[Mock Mode] checkGoogleAIO - ${query}`)
      await mockDelay(1200)
      return generateMockGoogleAIOResult(query, Math.random() > 0.3)
    }
    
    const data = await this.search(query)

    // Check Answer Box
    if (data.answerBox) {
      const isInAnswerBox = this.checkBrandMention(
        data.answerBox.answer || data.answerBox.snippet || ""
      )
      if (isInAnswerBox) {
        return {
          query,
          isVisible: true,
          source: "answer_box",
          position: 0, // Featured position
          context: data.answerBox.answer || data.answerBox.snippet || "",
          timestamp: new Date().toISOString(),
        }
      }
    }

    // Check Knowledge Graph
    if (data.knowledgeGraph) {
      const isInKG = this.checkBrandMention(
        data.knowledgeGraph.description || data.knowledgeGraph.title || ""
      )
      if (isInKG) {
        return {
          query,
          isVisible: true,
          source: "knowledge_graph",
          position: 0,
          context: data.knowledgeGraph.description || "",
          timestamp: new Date().toISOString(),
        }
      }
    }

    // Check AI Overview (if present)
    if (data.aiOverview) {
      const isInAIO = this.checkBrandMention(data.aiOverview)
      if (isInAIO) {
        return {
          query,
          isVisible: true,
          source: "ai_overview",
          position: 0,
          context: data.aiOverview.slice(0, 300),
          timestamp: new Date().toISOString(),
        }
      }
    }

    return {
      query,
      isVisible: false,
      source: null,
      position: null,
      context: null,
      timestamp: new Date().toISOString(),
    }
  }

  /**
   * Get Google ranking for a query
   */
  async getRanking(query: string): Promise<RankingResult> {
    // 🎭 MOCK MODE: Return fake data without real API calls
    if (isMockMode()) {
      console.log(`[Mock Mode] getRanking - ${query}`)
      await mockDelay(1000)
      return generateMockRankingResult(query, this.brandDomain)
    }
    
    const data = await this.search(query)

    const organicResults = data.organic || []
    const matchIndex = organicResults.findIndex((result) =>
      result.link?.includes(this.brandDomain)
    )

    if (matchIndex !== -1) {
      const result = organicResults[matchIndex]
      return {
        query,
        position: matchIndex + 1,
        url: result.link,
        title: result.title,
        snippet: result.snippet,
        timestamp: new Date().toISOString(),
      }
    }

    return {
      query,
      position: null, // Not in top 10
      url: null,
      title: null,
      snippet: null,
      timestamp: new Date().toISOString(),
    }
  }

  /**
   * Get multiple rankings at once
   */
  async getRankings(queries: string[]): Promise<RankingResult[]> {
    // 🎭 MOCK MODE: Return fake data without real API calls
    if (isMockMode()) {
      console.log(`[Mock Mode] getRankings - ${queries.length} queries`)
      await mockDelay(1500)
      return queries.map((q) => generateMockRankingResult(q, this.brandDomain))
    }
    
    return Promise.all(queries.map((q) => this.getRanking(q)))
  }

  /**
   * Check citations across multiple queries
   */
  async checkCitations(queries: string[]): Promise<CitationResult[]> {
    // 🎭 MOCK MODE: Return fake data without real API calls
    if (isMockMode()) {
      console.log(`[Mock Mode] checkCitations - ${queries.length} queries`)
      await mockDelay(2000)
      return queries.map((q) => generateMockCitationResult(q))
    }
    
    const results: CitationResult[] = []

    for (const query of queries) {
      const [aioResult, rankResult] = await Promise.all([
        this.checkGoogleAIO(query),
        this.getRanking(query),
      ])

      results.push({
        query,
        googleAIO: aioResult,
        organicRank: rankResult.position,
        isCitedInAIO: aioResult.isVisible,
        timestamp: new Date().toISOString(),
      })
    }

    return results
  }

  /**
   * Check if brand is mentioned in text
   */
  private checkBrandMention(text: string): boolean {
    if (!text) return false
    const lowerText = text.toLowerCase()
    const lowerDomain = this.brandDomain.toLowerCase()

    // Check for domain mention
    if (lowerText.includes(lowerDomain)) return true

    // Check for domain without TLD (e.g., "blogspy" from "blogspy.io")
    const domainWithoutTld = lowerDomain.split(".")[0]
    if (lowerText.includes(domainWithoutTld)) return true

    return false
  }

  /**
   * Calculate Siri readiness based on Google rank
   * Logic: If Google Rank <= 3 AND Applebot allowed → Ready
   */
  async calculateSiriReadiness(
    query: string,
    applebotAllowed: boolean
  ): Promise<{ status: "ready" | "at-risk" | "not-ready"; score: number }> {
    // 🎭 MOCK MODE: Return fake data without real API calls
    if (isMockMode()) {
      console.log(`[Mock Mode] calculateSiriReadiness - ${query}`)
      await mockDelay(800)
      
      const mockScore = Math.floor(Math.random() * 100)
      let status: "ready" | "at-risk" | "not-ready"
      if (mockScore >= 70) status = "ready"
      else if (mockScore >= 40) status = "at-risk"
      else status = "not-ready"
      
      return { status, score: mockScore }
    }
    
    const ranking = await this.getRanking(query)

    let score = 0

    // Google Rank factor (70 points max)
    if (ranking.position) {
      if (ranking.position <= 1) score += 70
      else if (ranking.position <= 3) score += 50
      else if (ranking.position <= 5) score += 30
      else if (ranking.position <= 10) score += 10
    }

    // Applebot factor (30 points)
    if (applebotAllowed) score += 30

    // Determine status
    let status: "ready" | "at-risk" | "not-ready"
    if (score >= 70) status = "ready"
    else if (score >= 40) status = "at-risk"
    else status = "not-ready"

    return { status, score }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// TYPES (DataForSEO Response)
// ═══════════════════════════════════════════════════════════════════════════════════════════════

interface DataForSEOResponse {
  organic: Array<{
    title: string
    link: string
    snippet: string
    position?: number
  }>
  answerBox?: {
    title?: string
    answer?: string
    snippet?: string
    source?: string
  }
  knowledgeGraph?: {
    title?: string
    description?: string
    type?: string
  }
  aiOverview?: string
}

// DataForSEO raw API response types
interface DataForSEOResult {
  keyword: string
  se_domain: string
  location_code: number
  language_code: string
  items_count: number
  items: DataForSEOItem[]
}

interface DataForSEOItem {
  type: "organic" | "featured_snippet" | "knowledge_graph" | "ai_overview" | string
  rank_group?: number
  rank_absolute?: number
  title?: string
  description?: string
  text?: string
  url?: string
  domain?: string
  sub_type?: string
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// FACTORY EXPORT
// ═══════════════════════════════════════════════════════════════════════════════════════════════

export function createTrackerService(
  credentials: { login: string; password: string },
  brandDomain: string
): TrackerService {
  return new TrackerService(credentials, brandDomain)
}
