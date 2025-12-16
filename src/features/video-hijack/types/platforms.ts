// ============================================
// VIDEO HIJACK - Platform Types
// ============================================

/**
 * Video Platforms
 */
export type VideoPlatformType = "youtube" | "tiktok"

/**
 * Platform Configuration
 */
export interface VideoPlatformConfig {
  id: VideoPlatformType
  name: string
  icon: string
  color: string
  bgColor: string
  creditCost: number
  apiSource: string
  description: string
  maxDuration: string
  avgViews: string
}

/**
 * Platform-specific Video Data
 */
export interface PlatformVideoData {
  platform: VideoPlatformType
  videos: VideoItem[]
  totalResults: number
  avgPosition: number
  dominantChannels: string[]
}

/**
 * Video Item (cross-platform)
 */
export interface VideoItem {
  id: string
  title: string
  channel: string
  platform: VideoPlatformType
  views: number
  likes: number
  duration: string
  publishDate: string
  thumbnailUrl: string
  videoUrl: string
  position: number
  engagement: number
}

/**
 * TikTok specific data
 */
export interface TikTokVideoData {
  id: string
  title: string
  creator: string
  followers: number
  views: number
  likes: number
  comments: number
  shares: number
  duration: string
  hashtags: string[]
  sounds: string[]
  publishDate: string
  thumbnailUrl: string
  videoUrl: string
}

/**
 * Combined Hijack Analysis
 */
export interface CombinedHijackAnalysis {
  keyword: string
  youtube: {
    hijackScore: number
    topVideos: number
    clicksLost: number
  }
  tiktok: {
    hijackScore: number
    topVideos: number
    viewsLost: number
  }
  totalOpportunity: number
  recommendedPlatform: VideoPlatformType
}
