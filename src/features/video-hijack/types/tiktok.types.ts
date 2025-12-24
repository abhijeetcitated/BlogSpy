// ============================================
// VIDEO HIJACK - TikTok Specific Types
// ============================================

import type { BaseVideoResult, ViralPotential } from "./common.types"

/**
 * TikTok Video Result (for UI display)
 */
export interface TikTokVideoResult extends BaseVideoResult {
  // Video info
  caption: string
  description: string
  thumbnail: string
  videoUrl: string
  
  // Creator info
  creator: string
  creatorId: string
  creatorUsername: string
  creatorName: string
  creatorUrl: string
  creatorAvatar: string
  creatorFollowers: number
  creatorVerified: boolean
  followers: string
  
  // Stats
  shares: number
  plays: number
  comments: number
  
  // Metadata
  hashtags: string[]
  soundName?: string
  soundAuthor?: string
  soundTrending: boolean
  
  // Scores
  opportunityScore: number
}

/**
 * TikTok Video (Full API response)
 */
export interface TikTokVideo {
  id: string
  videoId: string
  description: string
  creator: TikTokCreator
  stats: TikTokStats
  duration: string
  durationSeconds: number
  publishedAt: string
  url: string
  hashtags: string[]
  sound: TikTokSound
  // Calculated fields
  hijackScore: number
  viralPotential: ViralPotential
}

/**
 * TikTok Creator
 */
export interface TikTokCreator {
  id: string
  username: string
  nickname: string
  url: string
  followers: number
  followersFormatted: string
  verified: boolean
}

/**
 * TikTok Video Stats
 */
export interface TikTokStats {
  views: number
  likes: number
  shares: number
  comments: number
  engagement: number
}

/**
 * TikTok Sound
 */
export interface TikTokSound {
  id: string
  name: string
  author: string
  isTrending: boolean
}

/**
 * TikTok Search Options
 */
export interface TikTokSearchOptions {
  maxResults?: number
  sortBy?: "relevance" | "likes" | "date"
  publishedAfter?: Date
}

/**
 * TikTok API Raw Response Types (RapidAPI/Apify format)
 */
export interface TikTokRawVideo {
  id: string
  desc: string
  author: {
    id: string
    uniqueId: string
    nickname: string
    followerCount: number
    verified: boolean
  }
  stats: {
    playCount: number
    diggCount: number
    shareCount: number
    commentCount: number
  }
  video: {
    duration: number
    cover?: string
    originCover?: string
    playAddr?: {
      urlList: string[]
    }
  }
  createTime: number
  music?: {
    id: string
    title: string
    authorName: string
  }
  challenges?: { title: string }[]
}

/**
 * TikTok Hashtag Data
 */
export interface TikTokHashtag {
  id: string
  name: string
  videoCount: number
  viewCount: number
  isTrending: boolean
}

/**
 * TikTok Trending Sound
 */
export interface TikTokTrendingSound {
  id: string
  name: string
  author: string
  videoCount: number
  isTrending: boolean
}

/**
 * TikTok Keyword Analytics
 */
export interface TikTokKeywordAnalytics {
  keyword: string
  totalVideos: number
  totalViews: number
  avgViews: number
  avgEngagement: number
  topCreators: { username: string; videos: number; followers: number }[]
  trendingHashtags: string[]
  trendingSounds: TikTokTrendingSound[]
  competition: "low" | "medium" | "high"
  viralScore: number
  hijackOpportunity: number
}
