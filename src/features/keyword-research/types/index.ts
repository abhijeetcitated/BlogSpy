// ============================================
// KEYWORD RESEARCH - Type Definitions
// ============================================

import type { CTRStealingFeature } from "@/types/rtv.types"
import type { 
  SortDirection, 
  Country as SharedCountry,
  PaginationState as SharedPaginationState 
} from "@/types/shared"

// Re-export shared types for convenience
export type { SortDirection } from "@/types/shared"

/**
 * SERP Feature type - valid values for keyword SERP features
 */
export type SERPFeature = CTRStealingFeature | "snippet" | "faq" | "reviews" | "image" | "video" | "shopping" | "ad" | "local" | "news"

/**
 * WeakSpots - Ranks for Reddit, Quora, Pinterest in top 10 SERP
 * null = platform not in top 10
 */
export interface WeakSpots {
  reddit: number | null
  quora: number | null
  pinterest: number | null
}

export interface Keyword {
  id: number
  keyword: string
  intent: ("I" | "C" | "T" | "N")[]
  volume: number
  trend: number[]
  /** @deprecated Use weakSpots instead */
  weakSpot?: { type: "reddit" | "quora" | "pinterest" | null; rank?: number }
  /** Platform ranks in top 10 SERP - null means not present */
  weakSpots: WeakSpots
  kd: number
  cpc: number
  serpFeatures: SERPFeature[]
  /** Realizable Traffic Value (volume after SERP feature loss) */
  rtv?: number
  /** Breakdown of traffic loss by SERP feature */
  rtvBreakdown?: Array<{ 
    label: string
    value: number
    icon?: "bot" | "map" | "snippet" | "ad" | "video"
    color?: string
  }>
  geoScore?: number
  hasAio?: boolean
  // Refresh tracking
  lastUpdated?: Date
  isRefreshing?: boolean
  // Future API integration fields
  updatedAt?: string
  dataSource?: "dataforseo" | "semrush" | "mock"
  yourPosition?: number
}

// Use shared Country type
export type Country = SharedCountry

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

// Sort types - Extended for all sortable columns (feature-specific)
export type KeywordResearchSortField = 
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

// Legacy alias for backward compatibility
export type SortField = KeywordResearchSortField

// Range types
export type VolumeRange = [number, number]
export type KDRange = [number, number]
export type CPCRange = [number, number]

// Pagination state - use shared type
export type PaginationState = SharedPaginationState

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

// ============================================
// COMMERCE / AMAZON TYPES
// ============================================

/**
 * Amazon Product from PA-API or mock data
 */
export interface AmazonProduct {
  asin: string
  title: string
  price: number
  currency: string
  rating: number
  reviews: number
  category: string
  imageUrl?: string
  productUrl?: string
  affiliatePotential: "high" | "medium" | "low"
  isPrime?: boolean
  inStock?: boolean
}

/**
 * Amazon Data Response
 */
export interface AmazonData {
  products: AmazonProduct[]
  avgPrice: number
  avgRating: number
  totalProducts: number
  competitionLevel: "high" | "medium" | "low"
  fetchedAt: string
}

/**
 * Drawer Data State (for Commerce/Social tabs)
 */
export type DrawerDataState = "idle" | "loading" | "success" | "error"

// ============================================
// SOCIAL INSIGHTS TYPES (YouTube + Community)
// ============================================

export interface YouTubeResult {
  title: string
  url: string
  thumbnailUrl?: string
  views?: number
  /** Pre-formatted string for UI (e.g. "12.3K views") */
  viewsLabel?: string
  channel?: string
  /** Pre-formatted string for UI (e.g. "2 months ago") */
  published?: string
}

export interface CommunityResult {
  platform: "reddit" | "pinterest"
  title: string
  snippet?: string
  url: string

  // Reddit-specific (best-effort, based on DataForSEO social API)
  subreddit?: string
  subredditMembers?: number
  score?: number
  comments?: number
  author?: string

  // Pinterest-specific
  imageUrl?: string
  saves?: number
}

/**
 * Generic API Response with retry support
 */
export interface DrawerDataResponse<T> {
  success: boolean
  data?: T
  error?: string
  isRetryable?: boolean
  source?: "mock" | "amazon" | "dataforseo"
}

// Re-export API types
export * from "./api.types"
