// ============================================
// RANKING TYPES
// ============================================
// Types for rank tracker feature
// Matches rank-tracker-content.tsx
// ============================================

// SERP Features for Rankings
export type RankSerpFeature = "video" | "snippet" | "ad" | "image" | "faq" | "shopping"

// Main Rank Data Interface
export interface RankData {
  id: string
  keyword: string
  rank: number
  previousRank: number
  change: number
  serpFeatures: RankSerpFeature[]
  volume: number
  url: string
  trendHistory: number[]
  lastUpdated: string
}

// Rank Overview Stats
export interface RankOverview {
  totalKeywords: number
  avgPosition: number
  top3Count: number
  top10Count: number
  top100Count: number
  improvedCount: number
  declinedCount: number
  noChangeCount: number
}

// Filter Tabs
export type RankFilterTab = "All" | "Top 3" | "Top 10" | "Top 100" | "Improved" | "Declined"

// Sort Options
export type RankSortField = "keyword" | "rank" | "change" | "volume" | null

export interface RankSortOptions {
  field: RankSortField
  direction: "asc" | "desc"
}

// Rank History Point
export interface RankHistoryPoint {
  date: string
  position: number
}

// Keyword to Track (for adding new keywords)
export interface KeywordToTrack {
  keyword: string
  url?: string
  tags?: string[]
}

// Rank Alert
export interface RankAlert {
  id: string
  keywordId: string
  keyword: string
  type: "improved" | "declined" | "entered_top10" | "left_top10"
  previousRank: number
  newRank: number
  timestamp: string
  read: boolean
}
