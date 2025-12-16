// ============================================
// SOCIAL TRACKER - Type Definitions
// ============================================

/**
 * Social Platforms
 */
export type SocialPlatform = "pinterest" | "twitter" | "instagram"

/**
 * Platform Configuration
 */
export interface SocialPlatformConfig {
  id: SocialPlatform
  name: string
  icon: string
  color: string
  bgColor: string
  iconColor: string
  creditCost: number
  apiSource: string
  description: string
}

/**
 * Pinterest Pin
 */
export interface PinterestPin {
  id: string
  title: string
  imageUrl: string
  repins: number
  clicks: number
  impressions: number
  position: number
  board: string
  isOurs: boolean
}

/**
 * Tweet
 */
export interface Tweet {
  id: string
  text: string
  author: string
  likes: number
  retweets: number
  replies: number
  impressions: number
  position: number
  isOurs: boolean
  createdAt: string
}

/**
 * Instagram Post
 */
export interface InstagramPost {
  id: string
  caption: string
  imageUrl: string
  likes: number
  comments: number
  saves: number
  position: number
  author: string
  isOurs: boolean
}

/**
 * Social Keyword Tracking
 */
export interface SocialKeyword {
  id: string
  keyword: string
  searchVolume: number
  platforms: {
    pinterest: PinterestRankData | null
    twitter: TwitterRankData | null
    instagram: InstagramRankData | null
  }
  socialIntent: "visual" | "trending" | "discussion" | "shopping"
  lastUpdated: string
}

/**
 * Pinterest Rank Data
 */
export interface PinterestRankData {
  position: number | null
  topPins: PinterestPin[]
  totalPins: number
  avgRepins: number
  hasOurContent: boolean
  topBoards: string[]
}

/**
 * Twitter Rank Data
 */
export interface TwitterRankData {
  position: number | null
  topTweets: Tweet[]
  totalTweets: number
  avgEngagement: number
  hasOurContent: boolean
  trending: boolean
}

/**
 * Instagram Rank Data
 */
export interface InstagramRankData {
  position: number | null
  topPosts: InstagramPost[]
  totalPosts: number
  avgEngagement: number
  hasOurContent: boolean
  topHashtags: string[]
}

/**
 * Social Summary Stats
 */
export interface SocialSummary {
  totalKeywords: number
  pinterestRanking: number
  twitterRanking: number
  instagramRanking: number
  totalImpressions: number
  avgEngagement: number
  trendingCount: number
}

/**
 * Sort Options
 */
export type SocialSortBy = "keyword" | "position" | "engagement" | "impressions" | "volume"
export type SortOrder = "asc" | "desc"
