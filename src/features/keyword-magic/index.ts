// ============================================
// KEYWORD MAGIC - Feature Barrel Export
// ============================================

// Main component
export { KeywordMagicContent } from "./keyword-magic-content"

// Types
export type {
  Keyword,
  Country,
  KDLevel,
  IntentOption,
  VolumePreset,
  MatchType,
  BulkMode,
  FilterState,
  // API Types
  KeywordResearchRequest,
  KeywordResearchResponse,
  APIKeyword,
  BulkAnalysisRequest,
  BulkAnalysisResponse,
  SortableField,
  KeywordFilters,
  TrendData,
  IntentData,
  SERPData,
  RTVData,
  GEOScoreData,
  AIOAnalysisData,
  CommunityDecayData,
  WeakSpotData,
  ExportOptions,
} from "./types"

// API utility functions
export { transformAPIKeyword, buildAPIRequest } from "./types/api.types"

// Constants
export {
  POPULAR_COUNTRIES,
  ALL_COUNTRIES,
  KD_LEVELS,
  INTENT_OPTIONS,
  VOLUME_PRESETS,
  DEFAULT_VOLUME_RANGE,
  DEFAULT_KD_RANGE,
  DEFAULT_CPC_RANGE,
  MAX_BULK_KEYWORDS,
} from "./constants"

// Utils
export {
  filterBySearchText,
  filterByVolume,
  filterByKD,
  filterByCPC,
  filterByIntent,
  filterByIncludeTerms,
  filterByExcludeTerms,
  applyAllFilters,
  filterCountries,
  parseBulkKeywords,
  formatVolume,
  formatCPC,
} from "./utils"

// Services
export { keywordMagicAPI, KeywordAPIError } from "./services"

// Hooks - Not exported from barrel to avoid Server Component issues
// Import directly from "@/src/features/keyword-magic/hooks" when needed
// export {
//   useKeywordFilters,
//   useKeywordData,
//   useBulkAnalysis,
//   useCountrySelector,
//   type UseKeywordFiltersReturn,
//   type UseKeywordDataReturn,
//   type UseBulkAnalysisReturn,
//   type UseCountrySelectorReturn,
// } from "./hooks"

// Components
export {
  CountrySelector,
  VolumeFilter,
  KDFilter,
  IntentFilter,
  CPCFilter,
  IncludeExcludeFilter,
  MatchTypeToggle,
  BulkModeToggle,
  BulkKeywordsInput,
  KeywordMagicTool,
  KeywordTable,
} from "./components"

// Additional types from components
export type { KeywordTableProps } from "./components"
