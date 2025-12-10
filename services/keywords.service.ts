/**
 * Keywords Service - Keyword research and analysis
 * Handles keyword data fetching, analysis, and suggestions
 */

import { apiClient } from "./api-client"

interface Keyword {
  id: string
  keyword: string
  volume: number
  difficulty: number
  cpc: number
  trend: "up" | "down" | "stable"
  intent: string
  position?: number
  change?: number
  serpFeatures?: string[]
}

interface KeywordAnalysis {
  keyword: string
  location: string
  language: string
  metrics: {
    volume: number
    difficulty: number
    cpc: number
    competition: number
  }
  trends: {
    monthly: number[]
    change: number
  }
  relatedKeywords: {
    keyword: string
    volume: number
    difficulty: number
  }[]
  questions: string[]
  serpFeatures: string[]
  intent: string
}

interface KeywordsListResponse {
  success: boolean
  data: Keyword[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

interface KeywordAnalysisResponse {
  success: boolean
  data: KeywordAnalysis
}

interface KeywordsParams {
  q?: string
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: "asc" | "desc"
}

interface AnalyzeParams {
  keyword: string
  location?: string
  language?: string
}

class KeywordsService {
  // Get keywords list
  async getKeywords(params: KeywordsParams = {}): Promise<KeywordsListResponse> {
    const response = await apiClient.get<KeywordsListResponse>("/api/keywords", {
      params: {
        q: params.q,
        page: params.page,
        limit: params.limit,
        sortBy: params.sortBy,
        sortOrder: params.sortOrder,
      },
    })

    return response.data
  }

  // Search keywords
  async searchKeywords(query: string, limit = 10): Promise<Keyword[]> {
    const response = await apiClient.get<KeywordsListResponse>("/api/keywords", {
      params: { q: query, limit },
    })

    return response.data.data
  }

  // Analyze keyword
  async analyzeKeyword(params: AnalyzeParams): Promise<KeywordAnalysis> {
    const response = await apiClient.post<KeywordAnalysisResponse>("/api/keywords", {
      keyword: params.keyword,
      location: params.location || "US",
      language: params.language || "en",
    })

    return response.data.data
  }

  // Get keyword suggestions
  async getSuggestions(seedKeyword: string, limit = 10): Promise<Keyword[]> {
    const analysis = await this.analyzeKeyword({ keyword: seedKeyword })
    
    // Return related keywords as suggestions
    return analysis.relatedKeywords.slice(0, limit).map((kw, index) => ({
      id: `suggestion_${index}`,
      keyword: kw.keyword,
      volume: kw.volume,
      difficulty: kw.difficulty,
      cpc: 0,
      trend: "stable" as const,
      intent: "informational",
    }))
  }

  // Get keyword questions (People Also Ask)
  async getQuestions(keyword: string): Promise<string[]> {
    const analysis = await this.analyzeKeyword({ keyword })
    return analysis.questions
  }

  // Get keyword trend data
  async getTrends(keyword: string): Promise<{ monthly: number[]; change: number }> {
    const analysis = await this.analyzeKeyword({ keyword })
    return analysis.trends
  }

  // Batch analyze keywords
  async batchAnalyze(keywords: string[]): Promise<KeywordAnalysis[]> {
    const results: KeywordAnalysis[] = []
    
    // Process in batches of 5
    const batchSize = 5
    for (let i = 0; i < keywords.length; i += batchSize) {
      const batch = keywords.slice(i, i + batchSize)
      const batchResults = await Promise.all(
        batch.map((keyword) => this.analyzeKeyword({ keyword }))
      )
      results.push(...batchResults)
    }

    return results
  }

  // Export keywords to CSV
  exportToCSV(keywords: Keyword[]): string {
    const headers = ["Keyword", "Volume", "Difficulty", "CPC", "Trend", "Intent"]
    const rows = keywords.map((kw) => [
      kw.keyword,
      kw.volume,
      kw.difficulty,
      kw.cpc,
      kw.trend,
      kw.intent,
    ])

    return [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n")
  }
}

// Export singleton instance
export const keywordsService = new KeywordsService()

// Export types
export type { Keyword, KeywordAnalysis, KeywordsListResponse, KeywordsParams, AnalyzeParams }
