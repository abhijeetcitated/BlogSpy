// ============================================
// KEYWORD MAGIC - Suggestions Service
// ============================================
// Handles keyword suggestions and trending
// ============================================

import "server-only"

import type { APIKeyword } from "../types/api.types"
import { MOCK_KEYWORDS } from "../__mocks__"
import { simulateNetworkDelay } from "./api-base"
import { convertToAPIKeyword } from "./mock-utils"

// ============================================
// SUGGESTIONS SERVICE
// ============================================

export const suggestionsService = {
  /**
   * Get keyword suggestions (autocomplete)
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getSuggestions(
    query: string,
    _country: string = "US",
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getTrendingKeywords(
    _country: string = "US",
    _category?: string,
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
}
