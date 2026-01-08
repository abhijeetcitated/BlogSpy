// ============================================
// KEYWORD POOL - Professional Data Types
// ============================================
// Complete metrics like Ahrefs/SEMrush

import type { SortDirection as SharedSortDirection } from "@/types/shared"

// Re-export shared types for convenience
export type SortDirection = SharedSortDirection

// ============================================
// CORE KEYWORD DATA (All Metrics)
// ============================================

export interface KeywordData {
  id: string
  keyword: string
  
  // PRIMARY METRICS
  volume: number                    // Monthly search volume
  kd: number                        // Keyword Difficulty 0-100
  cpc: number                       // Cost per click ($)
  competition: number               // Competition index 0-1
  trafficPotential: number          // Estimated monthly traffic
  clickRate: number                 // % of searches that get clicks
  
  // TREND DATA
  trend: TrendData
  
  // INTENT
  intent: SearchIntent
  intentScore: number               // Confidence 0-100
  
  // SERP FEATURES
  serpFeatures: SerpFeatures
  
  // KEYWORD CHARACTERISTICS
  characteristics: KeywordCharacteristics
  
  // SOURCE INFO
  source: KeywordSource
  sourceDetails?: string
  
  // ANALYSIS (calculated)
  analysis?: KeywordAnalysisResult
  
  // UI STATE
  isSelected: boolean
  addedAt: Date
}

// ============================================
// TREND DATA
// ============================================

export interface TrendData {
  direction: "up" | "down" | "stable"
  changePercent: number             // e.g., +15% or -8%
  seasonality: "seasonal" | "evergreen" | "trending"
  peakMonths?: number[]             // 1-12 for seasonal keywords
  historicalVolume?: number[]       // Last 12 months data
}

// ============================================
// SEARCH INTENT
// ============================================

export type SearchIntent = 
  | "informational"    // How to, What is, Guide, Tutorial
  | "commercial"       // Best, Top, Review, Comparison, vs
  | "transactional"    // Buy, Price, Discount, Deal, Order
  | "navigational"     // Brand name, Login, Official

export interface IntentIndicators {
  informational: string[]  // how, what, why, guide, tutorial, learn
  commercial: string[]     // best, top, review, comparison, vs, alternative
  transactional: string[]  // buy, price, discount, deal, cheap, order, purchase
  navigational: string[]   // login, official, website, brand names
}

export const INTENT_INDICATORS: IntentIndicators = {
  informational: ["how", "what", "why", "when", "where", "guide", "tutorial", "learn", "tips", "examples", "meaning", "definition"],
  commercial: ["best", "top", "review", "comparison", "vs", "versus", "alternative", "compare", "recommended", "rated"],
  transactional: ["buy", "price", "pricing", "discount", "deal", "cheap", "order", "purchase", "cost", "free", "trial", "download"],
  navigational: ["login", "sign in", "official", "website", "app", "dashboard"]
}

// ============================================
// SERP FEATURES
// ============================================

export interface SerpFeatures {
  featuredSnippet: boolean
  peopleAlsoAsk: boolean
  imagesPack: boolean
  videoResults: boolean
  localPack: boolean
  knowledgePanel: boolean
  shoppingAds: boolean
  topAdsCount: number              // 0-4
  bottomAdsCount: number           // 0-3
  organicResults: number           // Usually 10
  
  // Opportunity scores
  snippetOpportunity: number       // 0-100, chance to win snippet
  rankingOpportunity: number       // 0-100, overall opportunity
}

// ============================================
// KEYWORD CHARACTERISTICS
// ============================================

export interface KeywordCharacteristics {
  wordCount: number
  charLength: number
  hasQuestionWord: boolean
  hasModifier: boolean
  hasYear: boolean
  hasLocation: boolean
  hasNumber: boolean
  
  // Extracted parts
  rootTopic: string               // Main topic without modifiers
  modifiers: string[]             // best, top, how to, etc.
  questionWord?: string           // how, what, why, etc.
  year?: number                   // 2024, 2025
  location?: string               // city, country
}

// ============================================
// KEYWORD SOURCE
// ============================================

export type KeywordSource = 
  | "keyword-explorer"
  | "competitor-gap"
  | "content-decay"
  | "rank-tracker"
  | "snippet-stealer"
  | "trend-spotter"
  | "manual"
  | "imported"

export interface KeywordSourceConfig {
  type: KeywordSource
  label: string
  icon: string
  color: string
  description: string
}

export const KEYWORD_SOURCE_CONFIGS: KeywordSourceConfig[] = [
  { type: "keyword-explorer", label: "Keyword Explorer", icon: "Wand2", color: "purple", description: "AI-powered keyword suggestions" },
  { type: "competitor-gap", label: "Competitor Gap", icon: "Users", color: "blue", description: "Keywords competitors rank for" },
  { type: "content-decay", label: "Content Decay", icon: "TrendingDown", color: "red", description: "Declining keywords to refresh" },
  { type: "rank-tracker", label: "Rank Tracker", icon: "LineChart", color: "green", description: "Your tracked keywords" },
  { type: "snippet-stealer", label: "Snippet Stealer", icon: "Scissors", color: "amber", description: "Featured snippet opportunities" },
  { type: "trend-spotter", label: "Trend Spotter", icon: "Flame", color: "orange", description: "Trending keywords" },
  { type: "manual", label: "Manual Input", icon: "Keyboard", color: "zinc", description: "Add keywords manually" },
  { type: "imported", label: "CSV Import", icon: "Upload", color: "cyan", description: "Import from file" }
]

// ============================================
// FILTER & SORT OPTIONS
// ============================================

export interface KeywordFilters {
  volumeMin: number
  volumeMax: number
  kdMin: number
  kdMax: number
  cpcMin: number
  cpcMax: number
  wordCountMin: number
  wordCountMax: number
  intent: SearchIntent | "all"
  trend: "up" | "down" | "stable" | "all"
  source: KeywordSource | "all"
  hasSnippet: boolean | null
  searchQuery: string
}

export const DEFAULT_FILTERS: KeywordFilters = {
  volumeMin: 0,
  volumeMax: 1000000,
  kdMin: 0,
  kdMax: 100,
  cpcMin: 0,
  cpcMax: 100,
  wordCountMin: 1,
  wordCountMax: 10,
  intent: "all",
  trend: "all",
  source: "all",
  hasSnippet: null,
  searchQuery: ""
}

// Feature-specific sort fields
export type KeywordPoolSortField = 
  | "keyword" 
  | "volume" 
  | "kd" 
  | "cpc" 
  | "trafficPotential"
  | "trend"
  | "opportunity"

export type SortField = KeywordPoolSortField

export interface SortConfig {
  field: SortField
  direction: SortDirection
}

// ============================================
// ANALYSIS RESULT (After Processing)
// ============================================

export interface KeywordAnalysisResult {
  // Pillar potential
  pillarScore: number             // 0-100
  isPillarCandidate: boolean
  
  // Cluster assignment
  clusterId?: string
  clusterRole: "pillar" | "sub-h2" | "sub-h3" | "body" | "faq" | "cluster-article"
  
  // Semantic grouping
  semanticGroup: string
  parentKeywordId?: string
  
  // Opportunity score
  opportunityScore: number        // Composite score for prioritization
  
  // Reasons
  placementReason: string
  recommendations: string[]
}

// ============================================
// KEYWORD OPPORTUNITY SCORE (KOS)
// ============================================

export interface KOSFactors {
  volumeScore: number             // Normalized 0-100
  difficultyScore: number         // Inverted KD, easier = higher
  cpcValue: number                // Higher CPC = more valuable
  trendBonus: number              // Trending up = bonus
  serpOpportunity: number         // Featured snippet, PAA available
  competitionScore: number        // Lower competition = higher
}

// KOS Formula: Weighted combination of all factors
export const KOS_WEIGHTS = {
  volume: 0.20,
  difficulty: 0.25,
  cpcValue: 0.15,
  trend: 0.10,
  serpOpportunity: 0.15,
  competition: 0.15
}

// ============================================
// BULK OPERATIONS
// ============================================

export interface BulkAction {
  type: "select-all" | "deselect-all" | "delete-selected" | "add-to-cluster" | "change-intent"
  selectedIds?: string[]
  targetValue?: string
}

// ============================================
// IMPORT/EXPORT
// ============================================

export interface ImportConfig {
  format: "csv" | "tsv" | "json"
  hasHeaders: boolean
  columnMapping: {
    keyword: number
    volume?: number
    kd?: number
    cpc?: number
    intent?: number
  }
  delimiter: string
}

export interface ExportConfig {
  format: "csv" | "json" | "xlsx"
  includeAnalysis: boolean
  selectedOnly: boolean
  columns: (keyof KeywordData)[]
}
