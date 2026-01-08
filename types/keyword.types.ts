// ============================================
// KEYWORD TYPES
// ============================================
// Types for keyword-related features
// Matches keyword-table.tsx & keyword-magic-content.tsx
// ============================================

import type { SortDirection as SharedSortDirection, SearchIntent } from "@/types/shared"

// Re-export shared types for convenience
export type SortDirection = SharedSortDirection

// Intent Types
export type KeywordIntent = "I" | "C" | "T" | "N"
export type IntentFull = SearchIntent

// SERP Features
export type SerpFeature = 
  | "video" 
  | "snippet" 
  | "faq" 
  | "shopping" 
  | "image" 
  | "reviews" 
  | "local" 
  | "news" 
  | "ad"

// Weak Spot (Reddit/Quora opportunity)
export interface WeakSpot {
  type: "reddit" | "quora" | null
  rank?: number
}

// Main Keyword Interface (matches keyword-table.tsx)
export interface Keyword {
  id: number
  keyword: string
  intent: KeywordIntent[]
  volume: number
  trend: number[]
  weakSpot: WeakSpot
  kd: number
  cpc: number
  serpFeatures: string[]
}

// Keyword with extended data (for overview pages)
export interface KeywordExtended extends Keyword {
  position?: number
  change?: number
  url?: string
  clicks?: number
  impressions?: number
  ctr?: number
}

// Keyword Search Result
export interface KeywordSearchResult {
  keywords: Keyword[]
  totalResults: number
  searchTime: number
}

// Keyword Filters
export interface KeywordFilters {
  search: string
  minVolume: number
  maxVolume: number
  minKd: number
  maxKd: number
  intents: KeywordIntent[]
  serpFeatures: SerpFeature[]
  hasWeakSpot: boolean | null
}

// Default Filters
export const DEFAULT_KEYWORD_FILTERS: KeywordFilters = {
  search: "",
  minVolume: 0,
  maxVolume: 1000000,
  minKd: 0,
  maxKd: 100,
  intents: [],
  serpFeatures: [],
  hasWeakSpot: null,
}

// Sort Options (SortDirection is imported from shared types above)
export type KeywordSortField = "keyword" | "volume" | "kd" | "cpc" | "trend" | null

export interface KeywordSortOptions {
  field: KeywordSortField
  direction: SortDirection
}
