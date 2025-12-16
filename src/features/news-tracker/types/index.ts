// ============================================
// NEWS TRACKER - Type Definitions
// ============================================

// Re-export all types from sub-modules
export * from "./credits.types"
export * from "./api.types"

/**
 * News Platforms
 */
export type NewsPlatform = "google-news" | "google-discover"

/**
 * Platform Configuration
 */
export interface NewsPlatformConfig {
  id: NewsPlatform
  name: string
  icon: string
  color: string
  bgColor: string
  creditCost: number
  apiSource: string
  description: string
}

/**
 * News Article
 */
export interface NewsArticle {
  id: string
  title: string
  url: string
  source: string
  publishDate: string
  thumbnail?: string
  position: number
  category: string
  isTopStory: boolean
}

/**
 * Discover Card
 */
export interface DiscoverCard {
  id: string
  title: string
  url: string
  image?: string
  estimatedImpressions: number
  ctr: number
  clicks: number
  category: string
  isPersonalized: boolean
}

/**
 * News Keyword Tracking
 */
export interface NewsKeyword {
  id: string
  keyword: string
  searchVolume: number
  platforms: {
    "google-news": NewsRankData | null
    "google-discover": DiscoverRankData | null
  }
  newsIntent: "breaking" | "evergreen" | "trending" | "local"
  lastUpdated: string
}

/**
 * News Rank Data
 */
export interface NewsRankData {
  position: number | null
  previousPosition: number | null
  change: number
  isTopStory: boolean
  category: string
  articles: NewsArticle[]
}

/**
 * Discover Rank Data
 */
export interface DiscoverRankData {
  impressions: number
  clicks: number
  ctr: number
  avgPosition: number
  trend: "up" | "down" | "stable"
  cards: DiscoverCard[]
}

/**
 * News Summary Stats
 */
export interface NewsSummary {
  totalKeywords: number
  newsRanking: number
  discoverImpressions: number
  topStories: number
  avgCTR: number
  trendingCount: number
}

/**
 * Sort Options
 */
export type NewsSortBy = "keyword" | "position" | "impressions" | "ctr" | "volume"
export type SortOrder = "asc" | "desc"

/**
 * Filter Options
 */
export type NewsIntentFilter = "all" | "breaking" | "evergreen" | "trending" | "local"
