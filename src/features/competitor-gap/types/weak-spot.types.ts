// ============================================
// WEAK SPOT TYPES
// ============================================

import type { SortDirection as SharedSortDirection, SearchIntent } from "@/types/shared"

// Re-export shared types
export type SortDirection = SharedSortDirection

export type WeakSpotType = "reddit" | "quora" | "linkedin" | "medium" | "forum"
export type Intent = SearchIntent
export type WeakSpotSortField = "volume" | "kd" | "weakSpotRank" | "trafficPotential" | null
export type SortField = WeakSpotSortField

export interface WeakSpotKeyword {
  id: string
  keyword: string
  volume: number
  kd: number
  intent: Intent
  weakSpotType: WeakSpotType
  weakSpotRank: number
  weakSpotUrl: string
  weakSpotTitle: string
  yourRank: number | null
  opportunity: "high" | "medium" | "low"
  trafficPotential: number
}
