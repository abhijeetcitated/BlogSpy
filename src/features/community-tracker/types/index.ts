// ============================================
// COMMUNITY TRACKER - Type Definitions
// ============================================

/**
 * Community Platforms
 */
export type CommunityPlatform = "reddit" | "quora"

/**
 * Platform Configuration
 */
export interface CommunityPlatformConfig {
  id: CommunityPlatform
  name: string
  icon: string
  color: string
  bgColor: string
  creditCost: number
  apiSource: string
  description: string
}

/**
 * Reddit Post
 */
export interface RedditPost {
  id: string
  title: string
  subreddit: string
  author: string
  upvotes: number
  comments: number
  url: string
  position: number
  isOurs: boolean
  createdAt: string
}

/**
 * Quora Answer
 */
export interface QuoraAnswer {
  id: string
  question: string
  author: string
  views: number
  upvotes: number
  url: string
  position: number
  isOurs: boolean
  createdAt: string
}

/**
 * Community Keyword Tracking
 */
export interface CommunityKeyword {
  id: string
  keyword: string
  searchVolume: number
  platforms: {
    reddit: RedditRankData | null
    quora: QuoraRankData | null
  }
  communityIntent: "discussion" | "question" | "recommendation" | "comparison"
  lastUpdated: string
}

/**
 * Reddit Rank Data
 */
export interface RedditRankData {
  position: number | null
  subreddits: string[]
  topPosts: RedditPost[]
  totalMentions: number
  avgUpvotes: number
  hasOurContent: boolean
}

/**
 * Quora Rank Data
 */
export interface QuoraRankData {
  position: number | null
  topAnswers: QuoraAnswer[]
  totalQuestions: number
  avgViews: number
  hasOurContent: boolean
}

/**
 * Community Summary Stats
 */
export interface CommunitySummary {
  totalKeywords: number
  redditRanking: number
  quoraRanking: number
  totalMentions: number
  avgPosition: number
  opportunityScore: number
}

/**
 * Sort Options
 */
export type CommunitySortBy = "keyword" | "position" | "upvotes" | "views" | "volume"
export type SortOrder = "asc" | "desc"
