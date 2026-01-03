// ============================================
// KEYWORD RESEARCH - Type Definitions
// ============================================

import type { CTRStealingFeature } from "@/types/rtv.types"

/**
 * SERP Feature type - valid values for keyword SERP features
 */
export type SERPFeature = CTRStealingFeature | "snippet" | "faq" | "reviews" | "image" | "video" | "shopping" | "ad" | "local" | "news"

export interface Keyword {
  id: number
  keyword: string
  intent: ("I" | "C" | "T" | "N")[]
  volume: number
  trend: number[]
  weakSpot: { type: "reddit" | "quora" | null; rank?: number }
  kd: number
  cpc: number
  serpFeatures: SERPFeature[]
  geoScore?: number
  // Refresh tracking
  lastUpdated?: Date
  isRefreshing?: boolean
  // Future API integration fields
  updatedAt?: string
  dataSource?: "dataforseo" | "semrush" | "mock"
  yourPosition?: number
}

export interface Country {
  code: string
  name: string
  flag: string
}

export interface KDLevel {
  label: string
  range: string
  min: number
  max: number
  color: string
}

export interface IntentOption {
  value: string
  label: string
  color: string
}

export interface VolumePreset {
  label: string
  min: number
  max: number
}

export type MatchType = "broad" | "phrase" | "exact" | "related" | "questions"
export type BulkMode = "explore" | "bulk"

// Sort types - Extended for all sortable columns
export type SortField = 
  | "keyword" 
  | "volume" 
  | "rtv"
  | "kd" 
  | "cpc" 
  | "trend" 
  | "intent"
  | "geoScore" 
  | "aioScore"
  | "decayScore"
  | "videoOpp"
  | "commerceOpp"
  | "socialOpp"
  | null
export type SortDirection = "asc" | "desc"

// Range types
export type VolumeRange = [number, number]
export type KDRange = [number, number]
export type CPCRange = [number, number]

// Pagination state
export interface PaginationState {
  page: number
  pageSize: number
  totalItems: number
  totalPages: number
}

export interface FilterState {
  volumeRange: [number, number]
  kdRange: [number, number]
  cpcRange: [number, number]
  selectedIntents: string[]
  includeTerms: string[]
  excludeTerms: string[]
  filterText?: string
  searchText?: string
}

// Re-export API types
export * from "./api.types"
