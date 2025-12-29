/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════
 * 📊 TRACKER SERVICE - Google AIO & Rankings via Serper.dev
 * ═══════════════════════════════════════════════════════════════════════════════════════════════
 * 
 * This service handles:
 * - Google AI Overview detection
 * - Search rankings tracking
 * - Citation extraction from search results
 * 
 * @see _INTEGRATION_GUIDE.ts for full architecture
 */

import { GoogleAIOResult, RankingResult, CitationResult } from "../types"

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// TRACKER SERVICE CLASS
// ═══════════════════════════════════════════════════════════════════════════════════════════════

export class TrackerService {
  private apiKey: string
  private brandDomain: string

  constructor(apiKey: string, brandDomain: string) {
    this.apiKey = apiKey
    this.brandDomain = brandDomain
      .replace(/^https?:\/\//, "")
      .replace(/\/$/, "")
  }

  /**
   * Search Google via Serper.dev
   */
  private async search(query: string): Promise<SerperResponse> {
    try {
      const response = await fetch("https://google.serper.dev/search", {
        method: "POST",
        headers: {
          "X-API-KEY": this.apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          q: query,
          gl: "us", // United States
          hl: "en", // English
          num: 10, // Top 10 results
        }),
      })

      if (!response.ok) {
        throw new Error(`Serper API error: ${response.status}`)
      }

      return response.json()
    } catch (error) {
      console.error("Serper search error:", error)
      return { organic: [] }
    }
  }

  /**
   * Check if brand appears in Google AI Overview
   */
  async checkGoogleAIO(query: string): Promise<GoogleAIOResult> {
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
    return Promise.all(queries.map((q) => this.getRanking(q)))
  }

  /**
   * Check citations across multiple queries
   */
  async checkCitations(queries: string[]): Promise<CitationResult[]> {
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
// TYPES (Serper Response)
// ═══════════════════════════════════════════════════════════════════════════════════════════════

interface SerperResponse {
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

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// FACTORY EXPORT
// ═══════════════════════════════════════════════════════════════════════════════════════════════

export function createTrackerService(
  apiKey: string,
  brandDomain: string
): TrackerService {
  return new TrackerService(apiKey, brandDomain)
}
