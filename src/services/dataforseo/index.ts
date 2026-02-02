// ============================================
// DATAFORSEO SERVICE - BARREL EXPORT
// ============================================
// All DataForSEO API methods in one place
// ============================================

export { dataForSEOClient, DataForSEOClient } from "./client"
export type { ApiResponse, DataForSEOConfig } from "./client"

export { keywordsApi } from "./keywords"
export { serpApi } from "./serp"

// Convenience re-exports
export {
  getSearchVolume,
  getKeywordSuggestions,
  getKeywordsForSite,
  getRelatedKeywords,
} from "./keywords"

export {
  getGoogleOrganicResults,
  getBatchSerpResults,
  getRankingPosition,
  checkBulkRankings,
} from "./serp"
