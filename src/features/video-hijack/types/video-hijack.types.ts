/**
 * ============================================
 * VIDEO HIJACK - TYPES
 * ============================================
 * 
 * Type definitions for Video Hijack feature
 */

export type SearchMode = "domain" | "keyword"
export type Platform = "youtube" | "tiktok"
export type SortOption = "views" | "engagement" | "recent" | "hijackScore"

export interface VideoResult {
  id: string
  title: string
  channel: string
  channelUrl: string
  subscribers: string
  views: number
  likes: number
  comments: number
  publishedAt: string
  duration: string
  thumbnailUrl: string
  videoUrl: string
  engagement: number
  tags: string[]
  hijackScore: number // 0-100 - How easy to hijack
  viralPotential: "low" | "medium" | "high"
  contentAge: "fresh" | "aging" | "outdated"
}

export interface TikTokResult {
  id: string
  description: string
  creator: string
  creatorUrl: string
  followers: string
  views: number
  likes: number
  shares: number
  comments: number
  publishedAt: string
  duration: string
  videoUrl: string
  engagement: number
  hashtags: string[]
  hijackScore: number
  viralPotential: "low" | "medium" | "high"
  soundTrending: boolean
}

export interface KeywordStats {
  keyword: string
  platform: Platform
  totalVideos: number
  totalViews: number
  avgViews: number
  avgEngagement: number
  topChannels: { name: string; videos: number }[]
  trendScore: number
  competition: "low" | "medium" | "high"
  // New fields
  hijackOpportunity: number // 0-100
  monetizationScore: number // 0-100 CPM potential
  seasonality: "evergreen" | "seasonal" | "trending"
  avgVideoLength: string
  bestUploadDay: string
  bestUploadTime: string
  searchVolume: number
  volumeTrend: "up" | "stable" | "down"
  contentTypes: { type: string; percentage: number }[]
  audienceAge: { range: string; percentage: number }[]
}

export interface VideoSuggestion {
  titleFormats: string[]
  recommendedTags: string[]
  recommendedHashtags: string[]
  optimalLength: { youtube: string; tiktok: string }
  contentGaps: string[]
  bestTimeToPost: string
  difficulty?: "easy" | "medium" | "hard"
}
