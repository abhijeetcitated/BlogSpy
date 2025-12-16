// ============================================
// COMPETITOR GAP & FORUM INTEL - Type Definitions
// ============================================

/**
 * Gap Type Classification
 * - missing: You don't rank, competitors do
 * - weak: You rank lower than competitors
 * - strong: You rank higher than competitors
 * - shared: Similar rankings between you and competitors
 */
export type GapType = "missing" | "weak" | "strong" | "shared" | "all"

/**
 * Keyword Intent Classification
 */
export type Intent = "commercial" | "informational" | "transactional" | "navigational"

/**
 * Trend Direction
 */
export type TrendDirection = "rising" | "growing" | "stable" | "declining" | "falling"

/**
 * Sorting Fields for Keywords Table
 */
export type SortField = "keyword" | "volume" | "kd" | "yourRank" | "trend" | "engagement" | "opportunity" | null

/**
 * Sort Direction
 */
export type SortDirection = "asc" | "desc"

/**
 * Forum Intel Source Platforms
 */
export type ForumSource = "reddit" | "quora" | "stackoverflow" | "hackernews" | "youtube"

/**
 * Opportunity Level
 */
export type OpportunityLevel = "high" | "medium" | "low"

/**
 * Competition Level
 */
export type CompetitionLevel = "low" | "medium" | "high"

/**
 * Competitor Source Identifier
 */
export type CompetitorSource = "comp1" | "comp2" | "both"

/**
 * Active Tab Type
 */
export type ActiveTab = "all" | "missing" | "weak" | "strong" | "forum-intel"

// ============================================
// GAP ANALYSIS TYPES
// ============================================

/**
 * Gap Keyword Data Structure (Updated with new columns)
 */
export interface GapKeyword {
  id: string
  keyword: string
  intent: Intent
  gapType: GapType
  // Ranks
  yourRank: number | null
  comp1Rank: number | null
  comp2Rank: number | null
  // Metrics
  volume: number
  kd: number
  cpc?: number
  // New USP columns
  trend: TrendDirection
  aiTip?: string
  // URLs
  yourUrl?: string
  comp1Url?: string
  comp2Url?: string
  // Source
  source: CompetitorSource
}

/**
 * AI Suggestion for a keyword
 */
export interface AISuggestion {
  tip: string
  contentType: string
  wordCount: number
  keyFeatures: string[]
}

// ============================================
// FORUM INTEL TYPES
// ============================================

/**
 * Forum Intel Post/Topic Data Structure
 */
export interface ForumIntelPost {
  id: string
  topic: string
  source: ForumSource
  subSource: string // subreddit name, tag, channel, etc.
  // Engagement
  upvotes: number
  comments: number
  // Competition
  existingArticles: number
  competitionLevel: CompetitionLevel
  // Opportunity
  opportunityScore: number
  opportunityLevel: OpportunityLevel
  // Related keywords
  relatedKeywords: RelatedKeyword[]
  // Metadata
  lastActive: Date
  url: string
}

/**
 * Related Keyword with volume
 */
export interface RelatedKeyword {
  keyword: string
  volume: number
}

/**
 * Forum Source Configuration
 */
export interface ForumSourceConfig {
  id: ForumSource
  label: string
  icon: string
  color: string
  bgColor: string
}

// ============================================
// FILTER & CONFIG TYPES
// ============================================

/**
 * Volume Preset Configuration
 */
export interface VolumePreset {
  label: string
  min: number
  max: number
}

/**
 * KD Preset Configuration
 */
export interface KDPreset {
  label: string
  min: number
  max: number
}

/**
 * Quick Filter Configuration
 */
export interface QuickFilter {
  id: string
  label: string
  filter: (kw: GapKeyword) => boolean
}

/**
 * Gap Statistics Summary
 */
export interface GapStats {
  all: number
  missing: number
  weak: number
  strong: number
  shared: number
  totalVolume: number
  avgKD: number
}

/**
 * Forum Intel Statistics
 */
export interface ForumIntelStats {
  total: number
  highOpportunity: number
  reddit: number
  quora: number
  stackoverflow: number
  hackernews: number
  youtube: number
}

/**
 * Filter State
 */
export interface FilterState {
  selectedTab: ActiveTab
  activeQuickFilters: string[]
  volumeRange: [number, number]
  kdRange: [number, number]
  intentFilter: Intent | "all"
  searchQuery: string
}

/**
 * Analysis Form State
 */
export interface AnalysisFormState {
  yourDomain: string
  competitor1: string
  competitor2: string
}

// ============================================
// ACTION TYPES
// ============================================

/**
 * Available Actions for Gap Keywords
 */
export type GapAction = "write" | "calendar" | "ai-outline" | "view-serp" | "copy"

/**
 * Available Actions for Forum Intel
 */
export type ForumAction = "write" | "calendar" | "ai-outline" | "view-source" | "extract-keywords"
