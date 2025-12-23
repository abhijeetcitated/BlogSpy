// ============================================
// VIDEO HIJACK - YouTube Specific Types
// ============================================

import type { 
  BaseVideoResult, 
  ViralPotential, 
  ContentAge 
} from "./common.types"

/**
 * YouTube Video Result (for UI display)
 */
export interface YouTubeVideoResult extends BaseVideoResult {
  title: string
  channel: string
  channelName: string
  channelUrl: string
  channelThumbnail: string
  channelVerified: boolean
  channelSubs: number
  subscribers: string
  thumbnail: string
  thumbnailUrl: string
  videoUrl: string
  tags: string[]
  contentAge: ContentAge
  opportunityScore: number
}

/**
 * YouTube Video (Full API response)
 */
export interface YouTubeVideo {
  id: string
  videoId: string
  title: string
  description: string
  channel: YouTubeChannel
  thumbnail: YouTubeThumbnail
  stats: YouTubeStats
  duration: string
  durationSeconds: number
  publishedAt: string
  publishedDate: Date
  url: string
  tags: string[]
  // Calculated fields
  hijackScore: number
  viralPotential: ViralPotential
  contentAge: ContentAge
}

/**
 * YouTube Channel
 */
export interface YouTubeChannel {
  id: string
  name: string
  url: string
  subscribers: number
  subscribersFormatted: string
}

/**
 * YouTube Thumbnail
 */
export interface YouTubeThumbnail {
  url: string
  width: number
  height: number
}

/**
 * YouTube Video Stats
 */
export interface YouTubeStats {
  views: number
  likes: number
  comments: number
  engagement: number
}

/**
 * YouTube Search Options
 */
export interface YouTubeSearchOptions {
  maxResults?: number
  order?: "relevance" | "date" | "viewCount" | "rating"
  publishedAfter?: Date
  videoDuration?: "short" | "medium" | "long"
}

/**
 * YouTube API Raw Response Types
 */
export interface YouTubeSearchItem {
  id: { videoId: string }
  snippet: {
    title: string
    description: string
    channelId: string
    channelTitle: string
    publishedAt: string
    thumbnails: {
      default: YouTubeThumbnail
      medium: YouTubeThumbnail
      high: YouTubeThumbnail
    }
    tags?: string[]
  }
}

export interface YouTubeVideoItem {
  id: string
  snippet: {
    title: string
    description: string
    channelId: string
    channelTitle: string
    publishedAt: string
    thumbnails: {
      high: { url: string; width: number; height: number }
    }
    tags?: string[]
  }
  statistics: {
    viewCount: string
    likeCount: string
    commentCount: string
  }
  contentDetails: {
    duration: string
  }
}

export interface YouTubeChannelItem {
  id: string
  snippet: { title: string }
  statistics: { subscriberCount: string }
}

/**
 * YouTube Keyword Analytics
 */
export interface YouTubeKeywordAnalytics {
  keyword: string
  totalVideos: number
  totalViews: number
  avgViews: number
  avgEngagement: number
  topChannels: { name: string; videos: number; subscribers: number }[]
  competition: "low" | "medium" | "high"
  trendScore: number
  hijackOpportunity: number
}
