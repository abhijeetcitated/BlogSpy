// ============================================
// KEYWORD MAGIC - Keyword Research Service
// ============================================
// Handles keyword research API calls
// ============================================

import type {
  KeywordResearchRequest,
  KeywordResearchResponse,
  APIKeyword,
} from "../types/api.types"
import { MOCK_KEYWORDS } from "../__mocks__"
import type { Keyword } from "../types"
import { simulateNetworkDelay } from "./api-base"
import { convertToAPIKeyword, generateMockAPIKeyword } from "./mock-utils"

// ============================================
// FILTER & SORT HELPERS
// ============================================

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

// ============================================
// KEYWORD RESEARCH SERVICE
// ============================================

export const keywordResearchService = {
  /**
   * Research keywords based on seed keyword and filters
   */
  async researchKeywords(
    request: KeywordResearchRequest
  ): Promise<KeywordResearchResponse> {
    // TODO: Replace with real API call
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
   * Get single keyword details
   */
  async getKeywordDetails(
    keyword: string,
    country: string = "US"
  ): Promise<APIKeyword> {
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
   * Get keyword history (for rank tracking)
   */
  async getKeywordHistory(
    keyword: string,
    country: string = "US",
    days: number = 30
  ): Promise<{ date: string; rank: number; volume: number }[]> {
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
