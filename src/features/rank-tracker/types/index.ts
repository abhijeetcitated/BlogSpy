// ============================================
// RANK TRACKER - Type Definitions
// ============================================

// Re-export platform types
export * from "./platforms"

/**
 * AI Overview Status for a keyword
 */
export interface AIOverviewStatus {
  inOverview: boolean
  position: "cited" | "mentioned" | "not_included"
  citationUrl: string | null
  competitors: string[]
  recommendation: string | null
}

/**
 * SERP Feature Types - All major Google SERP features
 */
export type SerpFeature = 
  | "snippet"        // Featured Snippet
  | "video"          // Video Carousel
  | "image"          // Image Pack
  | "faq"            // People Also Ask
  | "local_pack"     // Local 3-Pack (Map)
  | "shopping"       // Shopping Results
  | "reviews"        // Star Ratings
  | "site_links"     // Site Links
  | "knowledge_panel" // Knowledge Panel
  | "top_stories"    // News/Top Stories
  | "ad"             // Paid Ads

/**
 * Rank Data for a tracked keyword
 */
export interface RankData {
  id: string
  keyword: string
  rank: number
  previousRank: number
  change: number
  serpFeatures: SerpFeature[]
  volume: number
  url: string
  trendHistory: number[]
  lastUpdated: string
  aiOverview: AIOverviewStatus
  pixelRank?: import("@/types/pixel.types").PixelRankScore
  country?: string // Country code (e.g., "US", "IN", "worldwide") - optional for mock data
}

/**
 * Filter Tab Options
 */
export type FilterTab = "All" | "Top 3" | "Top 10" | "Top 100" | "Improved" | "Declined"

/**
 * Sortable Fields
 */
export type SortField = "keyword" | "rank" | "change" | "volume" | null

/**
 * Sort Direction
 */
export type SortDirection = "asc" | "desc"

/**
 * Statistics Summary
 */
export interface RankStats {
  visibilityScore: number
  avgPosition: string
  trafficForecast: number
  alertsCount: number
  top3Count: number
  top10Count: number
  improvedCount: number
  declinedCount: number
}

/**
 * Winner/Loser Item
 */
export interface RankChangeItem {
  keyword: string
  from: number
  to: number
}

/**
 * Pulse Stat Item for Stats Cards
 */
export interface PulseStatItem {
  label: string
  value: number | string
  type: "radial" | "number" | "alert"
  change?: string | number
  changeLabel?: string
  positive?: boolean
  subtext?: string
  icon?: React.ComponentType<{ className?: string }>
  message?: string
}
