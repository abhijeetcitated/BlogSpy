// ============================================
// COMPETITOR GAP - Public API
// ============================================

// Main Component
export { CompetitorGapContent } from "./competitor-gap-content"

// Types
export type {
  GapType,
  Intent,
  SortField,
  SortDirection,
  WeakSpotType,
  OpportunityLevel,
  CompetitorSource,
  GapKeyword,
  WeakSpotKeyword,
  VolumePreset,
  KDPreset,
  QuickFilter,
  GapStats,
  FilterState,
  AnalysisFormState,
} from "./types"

// Constants
export {
  VOLUME_PRESETS,
  KD_PRESETS,
  QUICK_FILTERS,
  DEFAULT_VOLUME_RANGE,
  DEFAULT_KD_RANGE,
  GAP_TYPE_COLORS,
  GAP_TYPE_INFO,
  INTENT_STYLES,
  SOURCE_STYLES,
} from "./constants"

// Utils
export {
  getIntentStyle,
  calculateGapStats,
  exportKeywordsToCSV,
  filterKeywords,
  sortKeywords,
} from "./utils"

// Sub-components (for advanced usage)
export {
  VennDiagram,
  GapStatsCards,
  FilterBar,
  KeywordsTable,
  AnalysisForm,
  EmptyState,
  LoadingState,
  WeakSpotDetector,
} from "./components"

// Mock Data (for testing/development)
export { MOCK_GAP_DATA, WEAK_SPOT_DATA } from "./__mocks__"
