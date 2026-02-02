// ============================================
// COMPETITOR GAP TYPES
// ============================================
// Types for competitor gap analysis
// Matches competitor-gap-content.tsx
// ============================================

// Gap Types
export type GapType = "missing" | "weak" | "strong" | "shared"

// Intent (full text version)
export type GapIntent = "commercial" | "informational" | "transactional" | "navigational"

// Gap Keyword Interface
export interface GapKeyword {
  id: string
  keyword: string
  competitorRank: number | null
  competitor2Rank: number | null
  yourRank: number | null
  volume: number
  kd: number
  intent: GapIntent
  gapType: GapType
  competitorUrl: string
  competitor2Url: string | null
  source: "comp1" | "comp2" | "both"
}

// Competitor Profile
export interface Competitor {
  id: string
  domain: string
  name?: string
  visibility: number
  visibilityChange?: number
  totalKeywords: number
  estimatedTraffic: number
  commonKeywords: number
  gapCount: number
}

// Gap Analysis Summary
export interface GapAnalysisSummary {
  yourDomain: string
  competitors: Competitor[]
  totalGaps: number
  missingCount: number
  weakCount: number
  strongCount: number
  sharedCount: number
  topOpportunities: GapKeyword[]
}

// Sort Options
export type GapSortField = "volume" | "kd" | "competitorRank" | "yourRank" | null

export interface GapSortOptions {
  field: GapSortField
  direction: "asc" | "desc"
}

// Gap Filters
export interface GapFilters {
  search: string
  gapTypes: GapType[]
  intents: GapIntent[]
  minVolume: number
  maxVolume: number
  minKd: number
  maxKd: number
  source: "all" | "comp1" | "comp2" | "both"
}

export const DEFAULT_GAP_FILTERS: GapFilters = {
  search: "",
  gapTypes: [],
  intents: [],
  minVolume: 0,
  maxVolume: 1000000,
  minKd: 0,
  maxKd: 100,
  source: "all",
}
