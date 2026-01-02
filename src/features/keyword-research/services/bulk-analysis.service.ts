// ============================================
// KEYWORD MAGIC - Bulk Analysis Service
// ============================================
// Handles bulk keyword analysis API calls
// ============================================

import "server-only"

import type {
  BulkAnalysisRequest,
  BulkAnalysisResponse,
  APIKeyword,
} from "../types/api.types"
import { MOCK_KEYWORDS } from "../__mocks__"
import { simulateNetworkDelay } from "./api-base"
import { convertToAPIKeyword, generateMockAPIKeyword } from "./mock-utils"

// ============================================
// BULK ANALYSIS SERVICE
// ============================================

export const bulkAnalysisService = {
  /**
   * Bulk analyze multiple keywords at once
   */
  async bulkAnalyze(
    request: BulkAnalysisRequest
  ): Promise<BulkAnalysisResponse> {
    // TODO: Replace with real API call
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
}
