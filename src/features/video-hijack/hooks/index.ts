// ============================================
// VIDEO HIJACK - Hooks Barrel Export
// ============================================

// Legacy combined hook (backward compatible)
export { useVideoSearch } from "./useVideoSearch"
export type { UseVideoSearchResult } from "./useVideoSearch"

// New platform-specific hooks
export { useYouTubeSearch } from "./use-youtube-search"
export type { UseYouTubeSearchResult } from "./use-youtube-search"

export { useTikTokSearch } from "./use-tiktok-search"
export type { UseTikTokSearchResult } from "./use-tiktok-search"

// Combined hook with platform support
export { useVideoHijack } from "./use-video-hijack"
export type { UseVideoHijackResult } from "./use-video-hijack"
