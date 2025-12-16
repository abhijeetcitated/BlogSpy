// ============================================
// WEAK SPOT TYPES
// ============================================

export type WeakSpotType = "reddit" | "quora" | "linkedin" | "medium" | "forum"
export type Intent = "commercial" | "informational" | "transactional" | "navigational"
export type SortField = "volume" | "kd" | "weakSpotRank" | "trafficPotential" | null
export type SortDirection = "asc" | "desc"

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
