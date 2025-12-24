// ============================================
// KEYWORD OVERVIEW FEATURE - BARREL EXPORT
// ============================================

// Main Component
export { KeywordOverviewContent } from "./keyword-overview-content"

// Skeleton & Error Components
export { KeywordOverviewSkeleton, KeywordOverviewError } from "./components"

// Types (Public API)
export type { 
  DeviceView,
  KeywordMetrics,
  SERPResult,
  GlobalVolumeData
} from "./types"

// ============================================
// INTERNAL COMPONENTS (Not recommended for external use)
// Use KeywordOverviewContent instead
// ============================================
export {
  SERPTable,
  KeywordHeader,
  SearchTrendsCard,
  AIOverviewSection,
  AIRecommendationsSection,
  GEOScoreCard,
  GlobalVolumeCard,
  IntentProfileCard,
  TrendForecastCard,
  PixelRankSection,
  RTVSection,
  DecayOpportunityCard
} from "./components"

// ============================================
// INTERNAL: Chart Components (Used by above components)
// ============================================
export {
  WorldMap,
  RadarChart,
  SeasonalityChart,
  TrendAreaChart
} from "./components"

// ============================================
// INTERNAL: Constants (For testing/customization)
// ============================================
export {
  CHART_DIMENSIONS,
  KD_THRESHOLDS,
  DA_THRESHOLDS
} from "./constants"

// ============================================
// INTERNAL: Utils (For testing)
// ============================================
export {
  getDAColorClass,
  getTypeBadgeClasses,
  getPixelRankMessage,
  getRTVMessage,
  getDecayMessage,
  getContentAgeLabel
} from "./utils/overview-utils"

