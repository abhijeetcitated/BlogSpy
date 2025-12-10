/**
 * Content Service - Content analysis and optimization
 * Handles content decay, on-page analysis, and content suggestions
 */

import { apiClient } from "./api-client"

interface Content {
  id: string
  title: string
  url: string
  status: "published" | "draft"
  score: number
  wordCount: number
  lastUpdated: string
  traffic: number
  decay: boolean
  decayRisk: "none" | "low" | "medium" | "high" | "critical"
  keywords: string[]
}

interface OnPageAnalysis {
  url: string
  score: number
  title: {
    content: string
    length: number
    score: number
    issues: string[]
    suggestions: string[]
  }
  metaDescription: {
    content: string
    length: number
    score: number
    issues: string[]
    suggestions: string[]
  }
  headings: {
    h1Count: number
    h2Count: number
    h3Count: number
    score: number
    structure: { tag: string; text: string }[]
    issues: string[]
  }
  content: {
    wordCount: number
    readingTime: string
    readabilityScore: number
    keywordDensity: number
    score: number
    issues: string[]
    suggestions: string[]
  }
  images: {
    total: number
    withAlt: number
    optimized: number
    score: number
    issues: string[]
  }
  links: {
    internal: number
    external: number
    broken: number
    score: number
    issues: string[]
  }
  technical: {
    loadTime: number
    mobileScore: number
    coreWebVitals: {
      lcp: number
      fid: number
      cls: number
    }
    score: number
    issues: string[]
  }
}

interface ContentSuggestions {
  keyword: string
  titleSuggestions: string[]
  outlineSuggestions: string[]
  relatedTopics: string[]
}

interface ContentSummary {
  total: number
  published: number
  draft: number
  decaying: number
  avgScore: number
}

interface ContentListResponse {
  success: boolean
  data: Content[]
  summary: ContentSummary
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

interface OnPageAnalysisResponse {
  success: boolean
  data: OnPageAnalysis
}

interface SuggestionsResponse {
  success: boolean
  data: ContentSuggestions
}

interface ContentParams {
  page?: number
  limit?: number
  status?: "all" | "published" | "draft"
  decay?: boolean
}

class ContentService {
  // Get content list
  async getContent(params: ContentParams = {}): Promise<ContentListResponse> {
    const response = await apiClient.get<ContentListResponse>("/api/content", {
      params: {
        page: params.page,
        limit: params.limit,
        status: params.status,
        decay: params.decay,
      },
    })

    return response.data
  }

  // Get decaying content
  async getDecayingContent(limit = 10): Promise<Content[]> {
    const response = await this.getContent({ decay: true, limit })
    return response.data
  }

  // Get content summary
  async getSummary(): Promise<ContentSummary> {
    const response = await this.getContent({ limit: 1 })
    return response.summary
  }

  // Analyze URL (on-page SEO)
  async analyzeUrl(url: string, keyword?: string): Promise<OnPageAnalysis> {
    const response = await apiClient.post<OnPageAnalysisResponse>("/api/content", {
      action: "analyze-url",
      url,
      keyword,
    })

    return response.data.data
  }

  // Get content suggestions
  async getSuggestions(keyword: string): Promise<ContentSuggestions> {
    const response = await apiClient.post<SuggestionsResponse>("/api/content", {
      action: "generate-suggestions",
      keyword,
    })

    return response.data.data
  }

  // Calculate overall content health
  calculateHealth(content: Content[]): {
    score: number
    status: "excellent" | "good" | "fair" | "poor"
    recommendations: string[]
  } {
    if (content.length === 0) {
      return { score: 0, status: "poor", recommendations: ["Add some content to your site"] }
    }

    const avgScore = content.reduce((sum, c) => sum + c.score, 0) / content.length
    const decayingPercent = (content.filter((c) => c.decay).length / content.length) * 100

    const recommendations: string[] = []

    if (avgScore < 70) {
      recommendations.push("Improve content quality - average score is below 70")
    }
    if (decayingPercent > 20) {
      recommendations.push(`${Math.round(decayingPercent)}% of content is decaying - prioritize updates`)
    }

    const lowScoreContent = content.filter((c) => c.score < 60)
    if (lowScoreContent.length > 0) {
      recommendations.push(`${lowScoreContent.length} pieces of content need immediate attention`)
    }

    let status: "excellent" | "good" | "fair" | "poor"
    if (avgScore >= 80 && decayingPercent <= 10) {
      status = "excellent"
    } else if (avgScore >= 70 && decayingPercent <= 20) {
      status = "good"
    } else if (avgScore >= 60 && decayingPercent <= 30) {
      status = "fair"
    } else {
      status = "poor"
    }

    return {
      score: Math.round(avgScore),
      status,
      recommendations,
    }
  }

  // Get content decay priority
  sortByDecayPriority(content: Content[]): Content[] {
    const priorityMap: Record<string, number> = {
      critical: 5,
      high: 4,
      medium: 3,
      low: 2,
      none: 1,
    }

    return [...content].sort((a, b) => {
      const aPriority = priorityMap[a.decayRisk] || 0
      const bPriority = priorityMap[b.decayRisk] || 0
      return bPriority - aPriority
    })
  }

  // Export content report to CSV
  exportToCSV(content: Content[]): string {
    const headers = [
      "Title",
      "URL",
      "Status",
      "Score",
      "Word Count",
      "Traffic",
      "Decay Risk",
      "Last Updated",
    ]
    const rows = content.map((c) => [
      c.title,
      c.url,
      c.status,
      c.score,
      c.wordCount,
      c.traffic,
      c.decayRisk,
      c.lastUpdated,
    ])

    return [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n")
  }
}

// Export singleton instance
export const contentService = new ContentService()

// Export types
export type {
  Content,
  OnPageAnalysis,
  ContentSuggestions,
  ContentSummary,
  ContentListResponse,
  ContentParams,
}
