// ============================================
// KEYWORD MAGIC - Type Definitions
// ============================================

import type { CTRStealingFeature } from "@/types/rtv.types"

/**
 * SERP Feature type - valid values for keyword SERP features
 */
export type SERPFeature = CTRStealingFeature | "snippet" | "faq" | "reviews" | "image" | "video" | "shopping" | "ad"

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

export interface FilterState {
  volumeRange: [number, number]
  kdRange: [number, number]
  cpcRange: [number, number]
  selectedIntents: string[]
  includeTerms: string[]
  excludeTerms: string[]
}

// Re-export API types
export * from "./api.types"
