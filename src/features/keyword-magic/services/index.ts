// ============================================
// KEYWORD MAGIC - Services Index
// ============================================
// 🛡️ Server-only: These services run only on the server
// ============================================

import "server-only"

// API Base
export { KeywordAPIError, simulateNetworkDelay, API_BASE_URL } from "./api-base"

// Mock utilities
export { convertToAPIKeyword, generateMockAPIKeyword } from "./mock-utils"

// Individual services
export { keywordResearchService } from "./keyword-research.service"
export { bulkAnalysisService } from "./bulk-analysis.service"
export { exportService } from "./export.service"
export { suggestionsService } from "./suggestions.service"

// Combined API (backward compatible)
import { keywordResearchService } from "./keyword-research.service"
import { bulkAnalysisService } from "./bulk-analysis.service"
import { exportService } from "./export.service"
import { suggestionsService } from "./suggestions.service"

/**
 * Combined Keyword Magic API Service
 * Maintains backward compatibility with existing code
 */
export const keywordMagicAPI = {
  // Research
  researchKeywords: keywordResearchService.researchKeywords,
  getKeywordDetails: keywordResearchService.getKeywordDetails,
  getKeywordHistory: keywordResearchService.getKeywordHistory,
  
  // Bulk
  bulkAnalyze: bulkAnalysisService.bulkAnalyze,
  
  // Export
  exportKeywords: exportService.exportKeywords,
  
  // Suggestions
  getSuggestions: suggestionsService.getSuggestions,
  getTrendingKeywords: suggestionsService.getTrendingKeywords,
}