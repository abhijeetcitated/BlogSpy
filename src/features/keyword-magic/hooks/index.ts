// ============================================
// KEYWORD MAGIC - Hooks Index
// ============================================

// Filter state management
export {
  useKeywordFilters,
  type UseKeywordFiltersReturn,
} from "./use-keyword-filters"

// Keyword data management
export {
  useKeywordData,
  type UseKeywordDataReturn,
  type UseKeywordDataOptions,
} from "./use-keyword-data"

// Bulk analysis
export {
  useBulkAnalysis,
  type UseBulkAnalysisReturn,
} from "./use-bulk-analysis"

// Country selection
export {
  useCountrySelector,
  type UseCountrySelectorReturn,
} from "./use-country-selector"

// Legacy all-in-one hook (use more specific hooks when possible)
export { useKeywordMagic } from "./use-keyword-magic"