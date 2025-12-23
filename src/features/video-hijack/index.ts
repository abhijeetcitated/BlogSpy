// ============================================
// VIDEO HIJACK FEATURE - Main Barrel Export
// ============================================
// Clean Architecture: Organized by domain
// ============================================

// Page Components
export { VideoHijackContent } from "./video-hijack-content"
export { VideoHijackContentRefactored } from "./video-hijack-content-refactored"

// ============================================
// HOOKS
// ============================================
export { useVideoSearch } from "./hooks"
// New platform-specific hooks
export { useYouTubeSearch, useTikTokSearch, useVideoHijack } from "./hooks"

// ============================================
// SERVICES
// ============================================
export { youtubeService, tiktokService } from "./services"

// ============================================
// TYPES
// ============================================
export type {
  // Legacy Types
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
  // Video Search Types (refactored)
  SearchMode,
  Platform,
  SortOption,
  ViralPotential,
  ContentAge,
  Seasonality,
  VolumeTrend,
  Competition,
  Difficulty,
  VideoResult,
  TikTokResult,
  KeywordStats,
  VideoSuggestion,
  // New Platform-Specific Types
  YouTubeVideoResult,
  YouTubeVideo,
  YouTubeChannel,
  YouTubeSearchOptions,
  YouTubeKeywordAnalytics,
  TikTokVideoResult,
  TikTokVideo,
  TikTokCreator,
  TikTokSearchOptions,
  TikTokKeywordAnalytics,
  TikTokHashtag,
  TikTokTrendingSound,
} from "./types"

// ============================================
// COMPONENTS
// ============================================
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

// New organized components
export {
  // Shared
  VideoSearchBox,
  VideoStatsPanel,
  VideoResultsSidebar,
  VideoSuggestionPanel,
  // YouTube
  YouTubeResultCard,
  YouTubeResultsList,
  // TikTok
  TikTokResultCard,
  TikTokResultsList,
} from "./components"

// ============================================
// UTILS
// ============================================
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

// New utils
export {
  formatDate,
  getEngagementColor,
  getCompetitionColor,
  getVolumeTrendIcon,
} from "./utils/common.utils"

export {
  formatDuration as formatYouTubeDuration,
  formatSubscribers,
  getYouTubeVideoUrl,
  getYouTubeChannelUrl,
} from "./utils/youtube.utils"

export {
  formatDuration as formatTikTokDuration,
  formatFollowers,
  getTikTokVideoUrl,
  getTikTokProfileUrl,
  generateTikTokHashtags,
} from "./utils/tiktok.utils"

// ============================================
// CONSTANTS
// ============================================
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

// ============================================
// MOCK DATA
// ============================================
export { generateVideoHijackAnalysis } from "./__mocks__/video-data"
