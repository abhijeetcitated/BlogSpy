// ============================================
// KEYWORD MAGIC - API Types
// ============================================
// Types for API integration
// ============================================

import type { Keyword, MatchType, Country } from "./index"

/**
 * API Request for keyword research
 */
export interface KeywordResearchRequest {
  // Main search
  seedKeyword: string
  country: string // ISO country code
  language?: string // ISO language code
  database?: "google" | "bing" | "youtube" | "amazon"
  
  // Match type
  matchType: MatchType
  
  // Filters
  filters: KeywordFilters
  
  // Pagination
  page: number
  limit: number
  
  // Sorting
  sortBy: SortableField
  sortOrder: "asc" | "desc"
}

/**
 * Filter parameters
 */
export interface KeywordFilters {
  volumeMin?: number
  volumeMax?: number
  kdMin?: number
  kdMax?: number
  cpcMin?: number
  cpcMax?: number
  intents?: ("I" | "C" | "T" | "N")[]
  includeTerms?: string[]
  excludeTerms?: string[]
  
  // Advanced filters
  hasWeakSpot?: boolean
  serpFeatures?: string[]
  minTrendGrowth?: number // Minimum % growth in trend
  minGeoScore?: number
  hasAIOverview?: boolean
  minDecayScore?: number
}

/**
 * Sortable fields
 */
export type SortableField = 
  | "keyword"
  | "volume"
  | "rtv"
  | "trend"
  | "kd"
  | "cpc"
  | "geo"
  | "geoScore"
  | "aioScore"
  | "decayScore"
  | "relevance"

/**
 * DataForSEO Organic SERP item (minimal subset for analysis)
 */
export interface DataForSEOOrganicSerpItem {
  type?: string
  rank_group?: number
  rank_absolute?: number
  position?: number
  domain?: string
  url?: string
  title?: string
}

/**
 * DataForSEO Organic SERP result (minimal subset for analysis)
 */
export interface DataForSEOOrganicSerpResult {
  keyword?: string
  item_types?: string[]
  items?: DataForSEOOrganicSerpItem[]
  cpc?: number | null
  intent?: string
}

/**
 * Clean keyword payload for the analytical engine
 */
/**
 * Clean keyword payload for the analytical engine.
 * Uses the UI-ready Keyword shape (with weakSpots.ranked as the array).
 */
export type CleanKeyword = Keyword

/**
 * API Response for keyword research
 */
export interface KeywordResearchResponse {
  success: boolean
  data: {
    keywords: APIKeyword[]
    pagination: {
      page: number
      limit: number
      total: number
      totalPages: number
      hasMore: boolean
    }
    meta: {
      seedKeyword: string
      country: string
      matchType: MatchType
      creditsUsed: number
      generatedAt: string
    }
  }
  error?: {
    code: string
    message: string
  }
}

/**
 * Full keyword data from API
 */
export interface APIKeyword {
  id: string // UUID from API
  keyword: string
  
  // Search metrics
  volume: number
  trend: TrendData
  
  // Competition
  kd: number
  cpc: number
  competition: "low" | "medium" | "high"
  
  // Intent
  intent: IntentData
  
  // SERP Analysis
  serp: SERPData
  
  // BlogSpy Exclusive Metrics
  rtv: RTVData
  geoScore: GEOScoreData
  aioAnalysis: AIOAnalysisData
  communityDecay: CommunityDecayData
  weakSpot: WeakSpotData
  
  // Timestamps
  lastUpdated: string
  dataFreshness: "fresh" | "stale" | "outdated"
}

/**
 * Trend data
 */
export interface TrendData {
  values: number[] // 12 months
  labels: string[] // Month names
  growthPercent: number
  direction: "up" | "down" | "stable"
  seasonality: "seasonal" | "evergreen" | "trending"
}

/**
 * Intent classification
 */
export interface IntentData {
  primary: "I" | "C" | "T" | "N"
  secondary: ("I" | "C" | "T" | "N")[]
  confidence: number // 0-100
  all: ("I" | "C" | "T" | "N")[]
}

/**
 * SERP features data
 */
export interface SERPData {
  features: APISERPFeature[]
  organicResults: number
  adsCount: number
  paaQuestions: string[]
  relatedSearches: string[]
}

/**
 * API SERP Feature (detailed object from API response)
 */
export interface APISERPFeature {
  type: string
  position: number
  clickShare: number // Estimated click share 0-100
}

/**
 * RTV (Realizable Traffic Volume) data
 */
export interface RTVData {
  value: number
  percentage: number
  opportunityLevel: "excellent" | "good" | "moderate" | "low" | "very_low"
  ctrStealers: {
    feature: string
    ctrLoss: number
  }[]
}

/**
 * GEO Score data
 */
export interface GEOScoreData {
  score: number // 0-100
  level: "excellent" | "good" | "moderate" | "low"
  factors: {
    contentClarity: number
    structuredData: number
    authoritySignals: number
    freshnessSignals: number
    citationPotential: number
  }
  tips: string[]
}

/**
 * AI Overview Analysis data
 */
export interface AIOAnalysisData {
  hasAIOverview: boolean
  yourCitation: {
    isCited: boolean
    position: number | null
    snippet: string | null
  }
  opportunityScore: number
  competitors: {
    domain: string
    position: number
  }[]
  optimizationTips: string[]
}

/**
 * Community Decay data
 */
export interface CommunityDecayData {
  hasContent: boolean
  decayScore: number // 0-100
  platforms: {
    platform: "reddit" | "quora" | "stackoverflow" | "medium"
    url: string
    age: number // days
    rank: number
    outdatedSignals: string[]
  }[]
  bestOpportunity: {
    platform: string
    reason: string
  } | null
}

/**
 * Weak Spot data
 */
export interface WeakSpotData {
  hasWeakSpot: boolean
  type: "reddit" | "quora" | "pinterest" | "forum" | "ugc" | null
  rank: number | null
  url: string | null
  age: number | null // days
  quality: "low" | "medium" | "high" | null
  opportunity: string | null
}

/**
 * Bulk analysis request
 */
export interface BulkAnalysisRequest {
  keywords: string[]
  country: string
  options?: {
    includeRTV?: boolean
    includeGEO?: boolean
    includeAIO?: boolean
    includeDecay?: boolean
  }
}

/**
 * Bulk analysis response
 */
export interface BulkAnalysisResponse {
  success: boolean
  data: {
    results: APIKeyword[]
    notFound: string[]
    errors: {
      keyword: string
      error: string
    }[]
    creditsUsed: number
  }
  error?: {
    code: string
    message: string
  }
}

/**
 * Export options
 */
export interface ExportOptions {
  format: "csv" | "xlsx" | "json"
  columns: (keyof APIKeyword)[]
  includeMetrics: boolean
  keywords: string[] | "all" | "selected"
}

/**
 * Transform API keyword to local Keyword type
 */
export function transformAPIKeyword(_apiKeyword: APIKeyword): Keyword {
  throw new Error("TRANSFORM_API_KEYWORD_NOT_IMPLEMENTED")
}

/**
 * Build API request from local filter state
 */
export function buildAPIRequest(
  seedKeyword: string,
  country: Country | null,
  matchType: MatchType,
  filters: {
    volumeRange: [number, number]
    kdRange: [number, number]
    cpcRange: [number, number]
    selectedIntents: string[]
    includeTerms: string[]
    excludeTerms: string[]
  },
  sortBy: SortableField,
  sortOrder: "asc" | "desc",
  page: number,
  limit: number
): KeywordResearchRequest {
  void seedKeyword
  void country
  void matchType
  void filters
  void sortBy
  void sortOrder
  void page
  void limit
  throw new Error("BUILD_API_REQUEST_NOT_IMPLEMENTED")
}
