// ============================================
// RANK TRACKER - Platform Types
// ============================================

/**
 * Search Engine Platforms
 */
export type SearchPlatform = "google" | "bing" | "yahoo" | "duckduckgo"

/**
 * Platform Configuration
 */
export interface PlatformConfig {
  id: SearchPlatform
  name: string
  icon: string
  color: string
  bgColor: string
  creditCost: number
  apiSource: string
  description: string
}

/**
 * Platform-specific Rank Data
 */
export interface PlatformRankData {
  platform: SearchPlatform
  rank: number | null
  previousRank: number | null
  change: number
  url: string | null
  lastUpdated: string
  serpFeatures: string[]
}

/**
 * Multi-Platform Keyword Data
 */
export interface MultiPlatformKeyword {
  id: string
  keyword: string
  volume: number
  country: string // Country code (e.g., "US", "IN", "worldwide")
  platforms: Record<SearchPlatform, PlatformRankData>
  trendHistory: Record<SearchPlatform, number[]>
  bestRank: {
    platform: SearchPlatform
    rank: number
  } | null
  worstRank: {
    platform: SearchPlatform
    rank: number
  } | null
}

/**
 * Platform Stats Summary
 */
export interface PlatformStats {
  platform: SearchPlatform
  avgPosition: number
  top3Count: number
  top10Count: number
  improvedCount: number
  declinedCount: number
  totalTracked: number
}

/**
 * Platform Comparison Data
 */
export interface PlatformComparison {
  keyword: string
  google: number | null
  bing: number | null
  yahoo: number | null
  duckduckgo: number | null
  variance: number
  bestPlatform: SearchPlatform
}
