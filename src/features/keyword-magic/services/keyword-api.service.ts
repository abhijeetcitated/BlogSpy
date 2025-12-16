// ============================================
// KEYWORD MAGIC - API Service
// ============================================
// Centralized API calls for keyword research
// Replace mock implementations with real API calls
// ============================================

import type {
  KeywordResearchRequest,
  KeywordResearchResponse,
  BulkAnalysisRequest,
  BulkAnalysisResponse,
  APIKeyword,
  ExportOptions,
} from "../types/api.types"
import { MOCK_KEYWORDS } from "../__mocks__"
import type { Keyword } from "../types"

// Base API URL - configure in environment
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api"

/**
 * API Error class
 */
export class KeywordAPIError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode?: number
  ) {
    super(message)
    this.name = "KeywordAPIError"
  }
}

/**
 * Keyword Magic API Service
 */
export const keywordMagicAPI = {
  /**
   * Research keywords based on seed keyword and filters
   * 
   * @example
   * const response = await keywordMagicAPI.researchKeywords({
   *   seedKeyword: "ai tools",
   *   country: "US",
   *   matchType: "broad",
   *   filters: { volumeMin: 1000, kdMax: 50 },
   *   page: 1,
   *   limit: 20,
   *   sortBy: "volume",
   *   sortOrder: "desc"
   * })
   */
  async researchKeywords(
    request: KeywordResearchRequest
  ): Promise<KeywordResearchResponse> {
    // TODO: Replace with real API call
    // const response = await fetch(`${API_BASE_URL}/keywords/research`, {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //     "Authorization": `Bearer ${getAuthToken()}`
    //   },
    //   body: JSON.stringify(request)
    // })
    // if (!response.ok) {
    //   const error = await response.json()
    //   throw new KeywordAPIError(error.code, error.message, response.status)
    // }
    // return response.json()

    // Mock implementation
    await simulateNetworkDelay()
    
    // Apply filters to mock data
    let filtered = filterMockData(MOCK_KEYWORDS, request)
    
    // Sort
    filtered = sortMockData(filtered, request.sortBy, request.sortOrder)
    
    // Paginate
    const startIndex = (request.page - 1) * request.limit
    const paginated = filtered.slice(startIndex, startIndex + request.limit)
    
    return {
      success: true,
      data: {
        keywords: paginated.map(convertToAPIKeyword),
        pagination: {
          page: request.page,
          limit: request.limit,
          total: filtered.length,
          totalPages: Math.ceil(filtered.length / request.limit),
          hasMore: startIndex + request.limit < filtered.length,
        },
        meta: {
          seedKeyword: request.seedKeyword,
          country: request.country,
          matchType: request.matchType,
          creditsUsed: 1,
          generatedAt: new Date().toISOString(),
        },
      },
    }
  },

  /**
   * Bulk analyze multiple keywords at once
   */
  async bulkAnalyze(
    request: BulkAnalysisRequest
  ): Promise<BulkAnalysisResponse> {
    // TODO: Replace with real API call
    // const response = await fetch(`${API_BASE_URL}/keywords/bulk-analyze`, {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //     "Authorization": `Bearer ${getAuthToken()}`
    //   },
    //   body: JSON.stringify(request)
    // })
    // if (!response.ok) {
    //   const error = await response.json()
    //   throw new KeywordAPIError(error.code, error.message, response.status)
    // }
    // return response.json()

    await simulateNetworkDelay(1500)
    
    const results: APIKeyword[] = []
    const notFound: string[] = []
    
    for (const keyword of request.keywords) {
      const found = MOCK_KEYWORDS.find(
        (k) => k.keyword.toLowerCase() === keyword.toLowerCase()
      )
      if (found) {
        results.push(convertToAPIKeyword(found))
      } else {
        // Generate mock data for unknown keywords
        results.push(generateMockAPIKeyword(keyword))
      }
    }
    
    return {
      success: true,
      data: {
        results,
        notFound,
        errors: [],
        creditsUsed: request.keywords.length,
      },
    }
  },

  /**
   * Get single keyword details
   */
  async getKeywordDetails(
    keyword: string,
    country: string = "US"
  ): Promise<APIKeyword> {
    // TODO: Replace with real API call
    await simulateNetworkDelay(500)
    
    const found = MOCK_KEYWORDS.find(
      (k) => k.keyword.toLowerCase() === keyword.toLowerCase()
    )
    
    if (found) {
      return convertToAPIKeyword(found)
    }
    
    return generateMockAPIKeyword(keyword)
  },

  /**
   * Export keywords to file
   */
  async exportKeywords(
    keywords: Keyword[],
    options: ExportOptions
  ): Promise<Blob> {
    // Generate export based on format
    switch (options.format) {
      case "csv":
        return generateCSV(keywords, options)
      case "xlsx":
        // TODO: Implement XLSX export with library
        return generateCSV(keywords, options)
      case "json":
        return new Blob(
          [JSON.stringify(keywords, null, 2)],
          { type: "application/json" }
        )
      default:
        return generateCSV(keywords, options)
    }
  },

  /**
   * Get keyword suggestions (autocomplete)
   */
  async getSuggestions(
    query: string,
    country: string = "US",
    limit: number = 10
  ): Promise<string[]> {
    // TODO: Replace with real API call
    await simulateNetworkDelay(200)
    
    return MOCK_KEYWORDS
      .filter((k) => k.keyword.toLowerCase().includes(query.toLowerCase()))
      .slice(0, limit)
      .map((k) => k.keyword)
  },

  /**
   * Get trending keywords
   */
  async getTrendingKeywords(
    country: string = "US",
    category?: string,
    limit: number = 20
  ): Promise<APIKeyword[]> {
    // TODO: Replace with real API call
    await simulateNetworkDelay(800)
    
    // Return keywords with highest trend growth
    return MOCK_KEYWORDS
      .sort((a, b) => {
        const aTrend = a.trend[a.trend.length - 1] - a.trend[0]
        const bTrend = b.trend[b.trend.length - 1] - b.trend[0]
        return bTrend - aTrend
      })
      .slice(0, limit)
      .map(convertToAPIKeyword)
  },

  /**
   * Get keyword history (for rank tracking)
   */
  async getKeywordHistory(
    keyword: string,
    country: string = "US",
    days: number = 30
  ): Promise<{ date: string; rank: number; volume: number }[]> {
    // TODO: Replace with real API call
    await simulateNetworkDelay(500)
    
    // Generate mock history
    const history: { date: string; rank: number; volume: number }[] = []
    const baseRank = Math.floor(Math.random() * 50) + 1
    const baseVolume = Math.floor(Math.random() * 50000) + 1000
    
    for (let i = days; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      history.push({
        date: date.toISOString().split("T")[0],
        rank: Math.max(1, baseRank + Math.floor(Math.random() * 10) - 5),
        volume: Math.max(100, baseVolume + Math.floor(Math.random() * 5000) - 2500),
      })
    }
    
    return history
  },
}

// ============================================
// Helper Functions
// ============================================

function simulateNetworkDelay(ms: number = 300): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function filterMockData(
  keywords: Keyword[],
  request: KeywordResearchRequest
): Keyword[] {
  let result = [...keywords]
  
  // Filter by search text and match type
  if (request.seedKeyword) {
    const search = request.seedKeyword.toLowerCase()
    result = result.filter((k) => {
      const text = k.keyword.toLowerCase()
      switch (request.matchType) {
        case "exact":
          return text === search
        case "phrase":
          return text.includes(search)
        case "questions":
          const qWords = ["how", "what", "why", "when", "where", "which", "who"]
          return qWords.some((q) => text.startsWith(q)) && text.includes(search)
        case "related":
        case "broad":
        default:
          return search.split(" ").some((w) => text.includes(w))
      }
    })
  }
  
  // Volume filter
  if (request.filters.volumeMin !== undefined) {
    result = result.filter((k) => k.volume >= request.filters.volumeMin!)
  }
  if (request.filters.volumeMax !== undefined) {
    result = result.filter((k) => k.volume <= request.filters.volumeMax!)
  }
  
  // KD filter
  if (request.filters.kdMin !== undefined) {
    result = result.filter((k) => k.kd >= request.filters.kdMin!)
  }
  if (request.filters.kdMax !== undefined) {
    result = result.filter((k) => k.kd <= request.filters.kdMax!)
  }
  
  // CPC filter
  if (request.filters.cpcMin !== undefined) {
    result = result.filter((k) => k.cpc >= request.filters.cpcMin!)
  }
  if (request.filters.cpcMax !== undefined) {
    result = result.filter((k) => k.cpc <= request.filters.cpcMax!)
  }
  
  // Intent filter
  if (request.filters.intents && request.filters.intents.length > 0) {
    result = result.filter((k) =>
      k.intent.some((i) => request.filters.intents!.includes(i))
    )
  }
  
  // Include terms
  if (request.filters.includeTerms && request.filters.includeTerms.length > 0) {
    result = result.filter((k) =>
      request.filters.includeTerms!.every((t) =>
        k.keyword.toLowerCase().includes(t.toLowerCase())
      )
    )
  }
  
  // Exclude terms
  if (request.filters.excludeTerms && request.filters.excludeTerms.length > 0) {
    result = result.filter((k) =>
      !request.filters.excludeTerms!.some((t) =>
        k.keyword.toLowerCase().includes(t.toLowerCase())
      )
    )
  }
  
  // Weak spot filter
  if (request.filters.hasWeakSpot) {
    result = result.filter((k) => k.weakSpot.type !== null)
  }
  
  return result
}

function sortMockData(
  keywords: Keyword[],
  sortBy: string,
  sortOrder: "asc" | "desc"
): Keyword[] {
  const sorted = [...keywords].sort((a, b) => {
    let comparison = 0
    
    switch (sortBy) {
      case "keyword":
        comparison = a.keyword.localeCompare(b.keyword)
        break
      case "volume":
        comparison = a.volume - b.volume
        break
      case "kd":
        comparison = a.kd - b.kd
        break
      case "cpc":
        comparison = a.cpc - b.cpc
        break
      case "trend":
        const aTrend = a.trend[a.trend.length - 1] - a.trend[0]
        const bTrend = b.trend[b.trend.length - 1] - b.trend[0]
        comparison = aTrend - bTrend
        break
      case "geoScore":
        comparison = (a.geoScore ?? 50) - (b.geoScore ?? 50)
        break
      default:
        comparison = 0
    }
    
    return sortOrder === "asc" ? comparison : -comparison
  })
  
  return sorted
}

function convertToAPIKeyword(keyword: Keyword): APIKeyword {
  const trendGrowth = keyword.trend.length >= 2
    ? ((keyword.trend[keyword.trend.length - 1] - keyword.trend[0]) / keyword.trend[0]) * 100
    : 0
  
  return {
    id: keyword.id.toString(),
    keyword: keyword.keyword,
    volume: keyword.volume,
    trend: {
      values: keyword.trend,
      labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].slice(0, keyword.trend.length),
      growthPercent: Math.round(trendGrowth),
      direction: trendGrowth > 5 ? "up" : trendGrowth < -5 ? "down" : "stable",
      seasonality: "evergreen",
    },
    kd: keyword.kd,
    cpc: keyword.cpc,
    competition: keyword.kd < 30 ? "low" : keyword.kd < 60 ? "medium" : "high",
    intent: {
      primary: keyword.intent[0],
      secondary: keyword.intent.slice(1),
      confidence: 85,
      all: keyword.intent,
    },
    serp: {
      features: keyword.serpFeatures.map((f, i) => ({
        type: f,
        position: i + 1,
        clickShare: 10,
      })),
      organicResults: 10,
      adsCount: 4,
      paaQuestions: [],
      relatedSearches: [],
    },
    rtv: {
      value: Math.round(keyword.volume * 0.6),
      percentage: 60,
      opportunityLevel: "good",
      ctrStealers: [],
    },
    geoScore: {
      score: keyword.geoScore ?? 50,
      level: (keyword.geoScore ?? 50) >= 70 ? "excellent" : (keyword.geoScore ?? 50) >= 50 ? "good" : "moderate",
      factors: {
        contentClarity: 70,
        structuredData: 60,
        authoritySignals: 65,
        freshnessSignals: 55,
        citationPotential: 75,
      },
      tips: [],
    },
    aioAnalysis: {
      hasAIOverview: Math.random() > 0.3,
      yourCitation: {
        isCited: Math.random() > 0.5,
        position: Math.random() > 0.5 ? Math.floor(Math.random() * 3) + 1 : null,
        snippet: null,
      },
      opportunityScore: Math.floor(Math.random() * 100),
      competitors: [],
      optimizationTips: [],
    },
    communityDecay: {
      hasContent: keyword.weakSpot.type !== null,
      decayScore: keyword.weakSpot.type !== null ? Math.floor(Math.random() * 50) + 50 : 0,
      platforms: [],
      bestOpportunity: keyword.weakSpot.type ? {
        platform: keyword.weakSpot.type,
        reason: "Outdated content in SERP",
      } : null,
    },
    weakSpot: {
      hasWeakSpot: keyword.weakSpot.type !== null,
      type: keyword.weakSpot.type,
      rank: keyword.weakSpot.rank ?? null,
      url: null,
      age: null,
      quality: null,
      opportunity: keyword.weakSpot.type ? `${keyword.weakSpot.type} content is outdated` : null,
    },
    lastUpdated: new Date().toISOString(),
    dataFreshness: "fresh",
  }
}

function generateMockAPIKeyword(keyword: string): APIKeyword {
  const volume = Math.floor(Math.random() * 50000) + 1000
  const kd = Math.floor(Math.random() * 100)
  const cpc = Math.round((Math.random() * 10 + 0.5) * 100) / 100
  const geoScore = Math.floor(Math.random() * 100)
  
  return {
    id: Math.random().toString(36).substring(7),
    keyword,
    volume,
    trend: {
      values: Array.from({ length: 12 }, () => Math.floor(Math.random() * 100)),
      labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
      growthPercent: Math.floor(Math.random() * 50) - 10,
      direction: "stable",
      seasonality: "evergreen",
    },
    kd,
    cpc,
    competition: kd < 30 ? "low" : kd < 60 ? "medium" : "high",
    intent: {
      primary: "I",
      secondary: [],
      confidence: 80,
      all: ["I"],
    },
    serp: {
      features: [],
      organicResults: 10,
      adsCount: 2,
      paaQuestions: [],
      relatedSearches: [],
    },
    rtv: {
      value: Math.round(volume * 0.65),
      percentage: 65,
      opportunityLevel: "good",
      ctrStealers: [],
    },
    geoScore: {
      score: geoScore,
      level: geoScore >= 70 ? "excellent" : geoScore >= 50 ? "good" : "moderate",
      factors: {
        contentClarity: 70,
        structuredData: 60,
        authoritySignals: 65,
        freshnessSignals: 55,
        citationPotential: 75,
      },
      tips: [],
    },
    aioAnalysis: {
      hasAIOverview: false,
      yourCitation: { isCited: false, position: null, snippet: null },
      opportunityScore: 50,
      competitors: [],
      optimizationTips: [],
    },
    communityDecay: {
      hasContent: false,
      decayScore: 0,
      platforms: [],
      bestOpportunity: null,
    },
    weakSpot: {
      hasWeakSpot: false,
      type: null,
      rank: null,
      url: null,
      age: null,
      quality: null,
      opportunity: null,
    },
    lastUpdated: new Date().toISOString(),
    dataFreshness: "fresh",
  }
}

function generateCSV(keywords: Keyword[], options: ExportOptions): Blob {
  const headers = [
    "Keyword",
    "Volume",
    "KD",
    "CPC",
    "Intent",
    "GEO Score",
    "Weak Spot",
    "SERP Features",
  ]
  
  const rows = keywords.map((k) => [
    `"${k.keyword}"`,
    k.volume,
    k.kd,
    k.cpc.toFixed(2),
    `"${k.intent.join(", ")}"`,
    k.geoScore ?? "N/A",
    k.weakSpot.type ? `${k.weakSpot.type} #${k.weakSpot.rank}` : "None",
    `"${k.serpFeatures.join(", ")}"`,
  ])
  
  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.join(",")),
  ].join("\n")
  
  return new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
}

export default keywordMagicAPI
