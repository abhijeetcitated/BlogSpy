// ============================================
// KEYWORD MAGIC - Utils Barrel Export
// ============================================

// Filter utilities
export {
  filterBySearchText,
  filterByVolume,
  filterByKD,
  filterByCPC,
  filterByGeoScore,
  filterByIntent,
  filterByWeakSpot,
  filterBySerpFeatures,
  filterByTrend,
  filterByIncludeTerms,
  filterByExcludeTerms,
  applyAllFilters,
  filterCountries,
  parseBulkKeywords,
  formatVolume,
  formatCPC,
} from "./filter-utils"

export type { FilterOptions } from "./filter-utils"

// Sort utilities
export {
  sortKeywords,
  multiSort,
  getNextSortDirection,
  getSortIcon,
} from "./sort-utils"

// Export utilities
export {
  exportToCSV,
  exportToJSON,
  exportToTSV,
  exportToClipboard,
  exportKeywordsToCSV,
  downloadAsCSV,
  downloadExport,
  copyToClipboard,
  downloadKeywordsCSV,
} from "./export-utils"

// YouTube Intelligence Engine
export {
  // Constants
  WEAK_COMPETITOR_SUBS,
  OUTDATED_DAYS,
  VIRAL_THRESHOLD,
  AUTHORITY_THRESHOLD,
  ANGLE_CLUSTERS,
  // Analysis functions
  calculateWinProbability,
  calculateFreshnessGap,
  calculateAuthorityWall,
  assessCompetitorStrength,
  generateAngleMap,
  determineExploit,
  estimateEffort,
  // Badge generation
  generateVideoBadges,
  analyzeVideosWithBadges,
  // Main analysis
  analyzeYouTubeCompetition,
} from "./youtube-intelligence"

export type {
  AngleClusterKey,
  YouTubeVideoInput,
  WinProbabilityLabel,
  FreshnessGapLevel,
  CompetitorStrengthLabel,
  AuthorityStatus,
  EffortLevel,
  WinProbabilityResult,
  FreshnessGapResult,
  AuthorityWallResult,
  AngleMapResult,
  ExploitRecommendation,
  EffortEstimate,
  YouTubeIntelligenceResult,
  VideoBadgeType,
  VideoBadge,
  AnalyzedVideo,
} from "./youtube-intelligence"
