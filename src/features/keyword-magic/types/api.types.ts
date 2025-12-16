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
  | "geoScore"
  | "aioScore"
  | "decayScore"
  | "relevance"

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
  features: SERPFeature[]
  organicResults: number
  adsCount: number
  paaQuestions: string[]
  relatedSearches: string[]
}

export interface SERPFeature {
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
  type: "reddit" | "quora" | "forum" | "ugc" | null
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
export function transformAPIKeyword(apiKeyword: APIKeyword): Keyword {
  return {
    id: parseInt(apiKeyword.id, 10) || Math.random() * 1000000,
    keyword: apiKeyword.keyword,
    intent: apiKeyword.intent.all,
    volume: apiKeyword.volume,
    trend: apiKeyword.trend.values,
    weakSpot: {
      type: apiKeyword.weakSpot.type as "reddit" | "quora" | null,
      rank: apiKeyword.weakSpot.rank ?? undefined,
    },
    kd: apiKeyword.kd,
    cpc: apiKeyword.cpc,
    serpFeatures: apiKeyword.serp.features.map((f) => f.type),
    geoScore: apiKeyword.geoScore.score,
  }
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
  return {
    seedKeyword,
    country: country?.code || "US",
    matchType,
    filters: {
      volumeMin: filters.volumeRange[0],
      volumeMax: filters.volumeRange[1],
      kdMin: filters.kdRange[0],
      kdMax: filters.kdRange[1],
      cpcMin: filters.cpcRange[0],
      cpcMax: filters.cpcRange[1],
      intents: filters.selectedIntents.length > 0 
        ? filters.selectedIntents as ("I" | "C" | "T" | "N")[] 
        : undefined,
      includeTerms: filters.includeTerms.length > 0 ? filters.includeTerms : undefined,
      excludeTerms: filters.excludeTerms.length > 0 ? filters.excludeTerms : undefined,
    },
    page,
    limit,
    sortBy,
    sortOrder,
  }
}
