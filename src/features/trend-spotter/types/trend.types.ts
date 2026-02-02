// ============================================
// TREND TYPES
// ============================================
// Types for trend spotter feature
// Matches trend-spotter-content.tsx
// ============================================

// Trending Topic
export interface TrendingTopic {
  topic: string
  category: string
  growth: number // percentage
  volume: string // formatted string like "2.4M"
}

// News Item
export interface NewsItem {
  source: string
  logo: string
  headline: string
  time: string
  sentiment: "Positive" | "Negative" | "Neutral"
}

// Region Data (for geo distribution)
export interface RegionData {
  rank: number
  name: string
  value: number // percentage
}

// Time Range Options
export interface TimeRange {
  label: string
  value: "4h" | "24h" | "7d" | "30d"
}

// Hotspot Marker (for map)
export interface HotspotMarker {
  name: string
  coordinates: [number, number]
  intensity: number // 0-1 scale
}

// Trend Analysis
export interface TrendAnalysis {
  topic: string
  keyword: string
  currentVolume: number
  peakVolume: number
  growthRate: number
  trendData: number[]
  relatedKeywords: string[]
  topRegions: RegionData[]
  newsItems: NewsItem[]
  sentiment: {
    positive: number
    negative: number
    neutral: number
  }
}

// Trend Alert
export interface TrendAlert {
  id: string
  topic: string
  type: "breakout" | "rising" | "declining"
  growth: number
  timestamp: string
  read: boolean
}

// Trend Category
export type TrendCategory = 
  | "Tech" 
  | "Health" 
  | "Business" 
  | "Finance" 
  | "Entertainment" 
  | "Sports" 
  | "Politics" 
  | "Science"
  | "Other"

// Trend Filters
export interface TrendFilters {
  timeRange: TimeRange["value"]
  categories: TrendCategory[]
  minGrowth: number
  region: string
}
