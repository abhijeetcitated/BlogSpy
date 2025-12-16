// Video Hijack Feature - Main Barrel Export

export { VideoHijackContent } from "./video-hijack-content"

// Types
export type {
  VideoPresence,
  VideoPlatform,
  VideoOpportunityLevel,
  VideoTrend,
  VideoIntent,
  VideoSerpPosition,
  CompetingVideo,
  VideoHijackKeyword,
  VideoHijackSummary,
  VideoHijackAnalysis,
  DominantChannel,
  VideoROI,
  FilterState,
  SortByOption,
  SortOrder,
} from "./types"

// Components
export {
  HijackScoreRing,
  OpportunityBadge,
  PresenceBadge,
  KeywordCard,
  PageHeader,
  SummaryCards,
  VideoFilters,
  KeywordList,
  TopOpportunities,
  DominantChannels,
  QuickTips,
  SidebarPanels,
} from "./components"

// Utils
export {
  getPresenceColor,
  getPresenceBgColor,
  getPresenceLabel,
  getOpportunityColor,
  getOpportunityBgColor,
  getOpportunityLevelFromScore,
  getPlatformColor,
  getHijackScoreColor,
  getHijackScoreRingColor,
  calculateHijackScore,
  formatViews,
  getTrendColor,
  sortKeywords,
  filterKeywords,
  getSortLabel,
  calculateVideoROI,
  getVideoRecommendations,
} from "./utils/video-utils"

// Constants
export {
  ALL_PRESENCES,
  ALL_OPPORTUNITY_LEVELS,
  HIJACK_SCORE_THRESHOLDS,
  HIJACK_SCORE_COLORS,
  VIDEO_SEO_TIPS,
  MOCK_CHANNELS,
  MOCK_KEYWORDS_BASE,
  VIDEO_TITLE_TEMPLATES,
} from "./constants"

// Mock Data
export { generateVideoHijackAnalysis } from "./__mocks__/video-data"
