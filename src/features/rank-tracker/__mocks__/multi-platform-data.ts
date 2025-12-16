// ============================================
// RANK TRACKER - Mock Multi-Platform Data
// ============================================

import type { SearchPlatform, MultiPlatformKeyword, PlatformRankData } from "../types/platforms"
import { SEARCH_PLATFORMS } from "../constants/platforms"

// Countries pool for mock data
const COUNTRIES_POOL = [
  "US", "US", "US",  // More US keywords (higher weight)
  "IN", "IN", "IN",  // More India keywords
  "GB", "GB",        // UK
  "CA",              // Canada
  "AU",              // Australia
  "DE",              // Germany
  "FR",              // France
  "worldwide",       // Global
]

// Generate random country
const getRandomCountry = (): string => {
  return COUNTRIES_POOL[Math.floor(Math.random() * COUNTRIES_POOL.length)]
}

// Generate random rank with variance
const generateRank = (baseRank: number, variance: number = 5): number | null => {
  if (Math.random() < 0.1) return null // 10% chance of not ranking
  return Math.max(1, Math.min(100, baseRank + Math.floor((Math.random() - 0.5) * variance * 2)))
}

// Generate platform-specific rank data
const generatePlatformRank = (
  platform: SearchPlatform,
  baseRank: number
): PlatformRankData => {
  const rank = generateRank(baseRank, platform === "google" ? 3 : 8)
  const previousRank = rank ? generateRank(rank, 5) : null
  
  return {
    platform,
    rank,
    previousRank,
    change: rank && previousRank ? previousRank - rank : 0,
    url: rank ? `/blog/article-${Math.floor(Math.random() * 100)}` : null,
    lastUpdated: "2 hours ago",
    serpFeatures: rank && rank <= 10 
      ? generateRandomSerpFeatures()
      : [],
  }
}

// Generate random SERP features for variety
const SERP_FEATURE_POOL = [
  "snippet", "video", "image", "faq", "local_pack", 
  "shopping", "reviews", "site_links", "knowledge_panel", "top_stories"
] as const

function generateRandomSerpFeatures(): string[] {
  const count = Math.floor(Math.random() * 4) + 1 // 1-4 features
  const shuffled = [...SERP_FEATURE_POOL].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}

// Generate trend history
const generateTrendHistory = (currentRank: number | null): number[] => {
  if (!currentRank) return Array(10).fill(0)
  return Array(10).fill(0).map((_, i) => {
    const variance = Math.floor((Math.random() - 0.5) * 10)
    return Math.max(1, Math.min(100, currentRank + variance))
  })
}

// Sample keywords with country assignments
const SAMPLE_KEYWORDS = [
  { keyword: "best seo tools 2024", volume: 22000, baseRank: 5, country: "US" },
  { keyword: "how to do keyword research", volume: 18500, baseRank: 8, country: "US" },
  { keyword: "on page seo guide", volume: 12000, baseRank: 3, country: "IN" },
  { keyword: "backlink building strategies", volume: 9800, baseRank: 12, country: "GB" },
  { keyword: "technical seo checklist", volume: 7500, baseRank: 6, country: "US" },
  { keyword: "content marketing tips", volume: 15000, baseRank: 15, country: "IN" },
  { keyword: "local seo ranking factors", volume: 6200, baseRank: 9, country: "CA" },
  { keyword: "seo for beginners", volume: 28000, baseRank: 18, country: "worldwide" },
  { keyword: "link building tools", volume: 5400, baseRank: 4, country: "AU" },
  { keyword: "seo audit template", volume: 8900, baseRank: 7, country: "US" },
  { keyword: "rank tracking software", volume: 4500, baseRank: 2, country: "IN" },
  { keyword: "serp analysis tool", volume: 3200, baseRank: 11, country: "DE" },
  { keyword: "keyword difficulty checker", volume: 6800, baseRank: 14, country: "GB" },
  { keyword: "website traffic analyzer", volume: 11000, baseRank: 22, country: "IN" },
  { keyword: "competitor analysis seo", volume: 7200, baseRank: 8, country: "FR" },
  { keyword: "google ranking factors 2024", volume: 19000, baseRank: 6, country: "US" },
  { keyword: "seo tools comparison", volume: 8500, baseRank: 9, country: "IN" },
  { keyword: "free keyword research tool", volume: 32000, baseRank: 12, country: "worldwide" },
  { keyword: "organic traffic growth", volume: 5800, baseRank: 15, country: "GB" },
  { keyword: "blog seo optimization", volume: 7400, baseRank: 7, country: "CA" },
]

// Generate mock data for all platforms
export const generateMultiPlatformData = (): MultiPlatformKeyword[] => {
  return SAMPLE_KEYWORDS.map((kw, index) => {
    const platforms: Record<SearchPlatform, PlatformRankData> = {} as Record<SearchPlatform, PlatformRankData>
    const trendHistory: Record<SearchPlatform, number[]> = {} as Record<SearchPlatform, number[]>
    
    let bestRank: { platform: SearchPlatform; rank: number } | null = null
    let worstRank: { platform: SearchPlatform; rank: number } | null = null
    
    SEARCH_PLATFORMS.forEach((platform) => {
      const rankData = generatePlatformRank(platform, kw.baseRank)
      platforms[platform] = rankData
      trendHistory[platform] = generateTrendHistory(rankData.rank)
      
      if (rankData.rank) {
        if (!bestRank || rankData.rank < bestRank.rank) {
          bestRank = { platform, rank: rankData.rank }
        }
        if (!worstRank || rankData.rank > worstRank.rank) {
          worstRank = { platform, rank: rankData.rank }
        }
      }
    })
    
    return {
      id: `kw-${index + 1}`,
      keyword: kw.keyword,
      volume: kw.volume,
      country: kw.country,
      platforms,
      trendHistory,
      bestRank,
      worstRank,
    }
  })
}

// Platform-specific stats (optionally filtered by country)
export const generatePlatformStats = (
  data: MultiPlatformKeyword[],
  countryFilter: string = "worldwide"
) => {
  // Filter by country first (worldwide shows all)
  const filteredData = countryFilter === "worldwide" 
    ? data 
    : data.filter((kw) => kw.country === countryFilter || kw.country === "worldwide")

  const stats: Record<SearchPlatform, { tracked: number; avgRank: number; top3: number; top10: number }> = {
    google: { tracked: 0, avgRank: 0, top3: 0, top10: 0 },
    bing: { tracked: 0, avgRank: 0, top3: 0, top10: 0 },
    yahoo: { tracked: 0, avgRank: 0, top3: 0, top10: 0 },
    duckduckgo: { tracked: 0, avgRank: 0, top3: 0, top10: 0 },
  }
  
  SEARCH_PLATFORMS.forEach((platform) => {
    const rankedKeywords = filteredData.filter((kw) => kw.platforms[platform].rank !== null)
    const ranks = rankedKeywords.map((kw) => kw.platforms[platform].rank!)
    
    stats[platform] = {
      tracked: rankedKeywords.length,
      avgRank: ranks.length > 0 ? Math.round(ranks.reduce((a, b) => a + b, 0) / ranks.length) : 0,
      top3: ranks.filter((r) => r <= 3).length,
      top10: ranks.filter((r) => r <= 10).length,
    }
  })
  
  return stats
}

// Pre-generated data for initial render
export const MOCK_MULTI_PLATFORM_DATA = generateMultiPlatformData()

// Get keyword counts by country
export const getCountryStats = (data: MultiPlatformKeyword[]): Record<string, number> => {
  const stats: Record<string, number> = { worldwide: data.length }
  
  data.forEach((kw) => {
    if (kw.country !== "worldwide") {
      stats[kw.country] = (stats[kw.country] || 0) + 1
    }
  })
  
  return stats
}
