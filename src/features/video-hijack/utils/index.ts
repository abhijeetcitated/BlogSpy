// ============================================
// VIDEO HIJACK - Utils Barrel Export
// ============================================

// Common utilities used by both platforms
export * from "./common.utils"

// Platform-specific utilities with explicit naming to avoid conflicts
export {
  formatDuration as formatYouTubeDuration,
  formatSubscribers,
  formatYouTubeViews,
  getYouTubeVideoUrl,
  getYouTubeChannelUrl,
  getYouTubeHijackScoreColor,
  getYouTubeHijackScoreBg,
  getYouTubeViralPotentialColor,
  getYouTubeContentAgeColor,
  sortYouTubeResults,
  filterYouTubeResults,
  generateYouTubeTitleSuggestions,
  generateYouTubeTagSuggestions,
} from "./youtube.utils"

export {
  formatDuration as formatTikTokDuration,
  formatFollowers,
  formatTikTokViews,
  getTikTokVideoUrl,
  getTikTokProfileUrl,
  generateTikTokHashtags,
  getTikTokHijackScoreColor,
  getTikTokHijackScoreBg,
  getTikTokViralPotentialColor,
  sortTikTokResults,
  filterTikTokResults,
  generateTikTokCaptionSuggestions,
} from "./tiktok.utils"

// Legacy utilities (explicit exports to avoid conflicts)
export {
  getPresenceColor,
  getPresenceBgColor,
  getPresenceLabel,
  getPlatformColor,
  getHijackScoreRingColor,
  sortKeywords,
  filterKeywords,
  getSortLabel,
  calculateVideoROI,
  getVideoRecommendations,
} from "./video-utils"

export * from "./mock-generators"
