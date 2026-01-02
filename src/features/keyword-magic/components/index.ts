// ============================================
// KEYWORD MAGIC - Components Barrel Export
// ============================================

// ============================================
// FILTERS
// ============================================
export { 
  VolumeFilter, 
  KDFilter, 
  IntentFilter, 
  CPCFilter, 
  GeoFilter, 
  WeakSpotFilter, 
  SerpFilter, 
  TrendFilter, 
  IncludeExcludeFilter, 
  MatchTypeToggle 
} from "./filters"

// ============================================
// HEADER
// ============================================
export { CountrySelector, PageHeader, ResultsHeader } from "./header"

// ============================================
// SEARCH
// ============================================
export { BulkModeToggle, BulkKeywordsInput, SearchInput, SearchSuggestions } from "./search"

// ============================================
// TABLE
// ============================================
export { 
  KeywordTable, 
  KeywordTableRow,
  KeywordTableHeader, 
  KeywordTableFooter, 
  sortKeywords, 
  downloadKeywordsCSV,
  generateKeywordCSV,
  // Action bar
  ActionBar,
  BulkActions,
  SelectionInfo,
  // Column components
  CheckboxColumn,
  CheckboxHeader,
  KeywordColumn,
  VolumeColumn,
  KdColumn,
  CpcColumn,
  IntentColumn,
  TrendColumn,
  SerpColumn,
  GeoColumn,
  WeakSpotColumn,
  RefreshColumn,
} from "./table"
export type { KeywordTableProps } from "./table"

// ============================================
// MODALS
// ============================================
export { ExportModal, FilterPresetsModal, KeywordDetailsModal } from "./modals"

// ============================================
// PAGE SECTIONS
// ============================================
export {
  KeywordMagicHeader,
  KeywordMagicSearch,
  KeywordMagicFilters,
  KeywordMagicResults
} from "./page-sections"

// ============================================
// SHARED
// ============================================
export {
  EmptyState,
  NoSearchState,
  NoResultsState,
  ErrorState,
  ErrorBoundary,
  LoadingSkeleton,
  TableLoadingSkeleton,
  FilterLoadingSkeleton,
  HeaderLoadingSkeleton,
} from "./shared"
