// ============================================
// GEO SCORE TYPES
// ============================================
// Types for Generative Engine Optimization scoring
// Measures AI citation vulnerability & opportunity
// ============================================

/**
 * GEO Score Components
 * Each component contributes to the overall GEO Score (0-100)
 */
export interface GEOScoreComponents {
  /** Citation Freshness Score (0-25) - How old are AI's current citations? */
  citationFreshness: number
  /** Authority Weakness Score (0-25) - Are weak sources (Reddit/Quora) being cited? */
  authorityWeakness: number
  /** Media Gap Score (0-25) - Is video/image content missing? */
  mediaGap: number
  /** Text Quality Score (0-25) - Is the AI answer short/generic? */
  textQuality: number
}

/**
 * Citation Source Types
 */
export type CitationSourceType = 
  | "blog" 
  | "news" 
  | "forum" 
  | "reddit" 
  | "quora" 
  | "official" 
  | "wikipedia" 
  | "pdf" 
  | "video" 
  | "unknown"

/**
 * GEO Opportunity Level
 */
export type GEOOpportunityLevel = "high" | "medium" | "low" | "none"

/**
 * Citation Source Details
 */
export interface CitationSource {
  domain: string
  type: CitationSourceType
  age: number // days since last update
  position: number // 1-5 in citation stack
  title?: string
  url?: string
}

/**
 * Complete GEO Analysis for a keyword
 */
export interface GEOAnalysis {
  /** Overall GEO Score (0-100) */
  score: number
  /** Individual component scores */
  components: GEOScoreComponents
  /** Opportunity level based on score */
  opportunity: GEOOpportunityLevel
  /** AI Overview presence */
  hasAIOverview: boolean
  /** Citation sources in AI Overview */
  citationSources: CitationSource[]
  /** Average age of citations (days) */
  avgCitationAge: number
  /** Has video in AI Overview? */
  hasVideoInOverview: boolean
  /** Has image in AI Overview? */
  hasImageInOverview: boolean
  /** Recommendations for improvement */
  recommendations: string[]
  /** Last analyzed timestamp */
  analyzedAt: string
}

/**
 * GEO Score Display Props
 */
export interface GEOScoreDisplayProps {
  score: number
  size?: "sm" | "md" | "lg"
  showLabel?: boolean
  showTooltip?: boolean
  className?: string
}

/**
 * GEO Score Ring Props
 */
export interface GEOScoreRingProps extends GEOScoreDisplayProps {
  components?: GEOScoreComponents
  animated?: boolean
}

/**
 * GEO Score Breakdown Props
 */
export interface GEOScoreBreakdownProps {
  components: GEOScoreComponents
  citationSources?: CitationSource[]
  recommendations?: string[]
}

/**
 * Weight configuration for GEO score calculation
 * Sum of all weights should equal 1.0
 */
export interface GEOWeights {
  citationFreshness: number // default 0.30
  authorityWeakness: number // default 0.30
  mediaGap: number          // default 0.20
  textQuality: number       // default 0.20
}

/**
 * Default GEO weights
 */
export const DEFAULT_GEO_WEIGHTS: GEOWeights = {
  citationFreshness: 0.30,
  authorityWeakness: 0.30,
  mediaGap: 0.20,
  textQuality: 0.20
}

/**
 * GEO Score thresholds for opportunity levels
 */
export const GEO_SCORE_THRESHOLDS = {
  HIGH: 70,    // 70-100 = High opportunity
  MEDIUM: 45,  // 45-69 = Medium opportunity
  LOW: 20,     // 20-44 = Low opportunity
  NONE: 0      // 0-19 = No opportunity
} as const

/**
 * Get opportunity level from score
 */
export function getGEOOpportunityLevel(score: number): GEOOpportunityLevel {
  if (score >= GEO_SCORE_THRESHOLDS.HIGH) return "high"
  if (score >= GEO_SCORE_THRESHOLDS.MEDIUM) return "medium"
  if (score >= GEO_SCORE_THRESHOLDS.LOW) return "low"
  return "none"
}

/**
 * Get color class based on GEO score
 */
export function getGEOScoreColor(score: number): string {
  if (score >= 70) return "text-emerald-400"
  if (score >= 45) return "text-amber-400"
  if (score >= 20) return "text-orange-400"
  return "text-red-400"
}

/**
 * Get background color class based on GEO score
 */
export function getGEOScoreBgColor(score: number): string {
  if (score >= 70) return "bg-emerald-500/20"
  if (score >= 45) return "bg-amber-500/20"
  if (score >= 20) return "bg-orange-500/20"
  return "bg-red-500/20"
}

/**
 * Get ring stroke color based on GEO score
 */
export function getGEOScoreStrokeColor(score: number): string {
  if (score >= 70) return "stroke-emerald-400"
  if (score >= 45) return "stroke-amber-400"
  if (score >= 20) return "stroke-orange-400"
  return "stroke-red-400"
}

/**
 * Get glow effect class based on GEO score
 */
export function getGEOScoreGlow(score: number): string {
  if (score >= 70) return "shadow-emerald-500/30"
  if (score >= 45) return "shadow-amber-500/30"
  if (score >= 20) return "shadow-orange-500/30"
  return "shadow-red-500/30"
}
