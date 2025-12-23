// ============================================
// TOPIC CLUSTER BUILDER - Type Definitions
// ============================================
// System for collecting keywords from multiple sources
// and analyzing them to create Pillar/Cluster structure

// ============================================
// KEYWORD SOURCE TYPES
// ============================================

// Where keywords can come from
export type KeywordSourceType = 
  | "keyword-magic"      // From Keyword Magic tool
  | "competitor-gap"     // From Competitor Gap analysis
  | "content-decay"      // From Content Decay detection
  | "rank-tracker"       // From Rank Tracker
  | "snippet-stealer"    // From Snippet Stealer
  | "trend-spotter"      // From Trend Spotter
  | "ai-overview"        // From AI Overview analysis
  | "manual"             // Manual bulk input
  | "imported"           // From CSV/file import

// A keyword from any source
export interface SourceKeyword {
  id: string
  keyword: string
  volume: number
  kd: number                    // Keyword Difficulty 0-100
  cpc?: number                  // Cost per click
  intent: KeywordIntent
  trend?: "up" | "down" | "stable"
  source: KeywordSourceType
  sourceDetails?: string        // e.g., "competitor: ahrefs.com"
  addedAt: Date
  // Analysis results (filled after processing)
  analysis?: KeywordAnalysis
}

export type KeywordIntent = 
  | "informational"    // How to, What is, Guide
  | "commercial"       // Best, Top, Review, Comparison
  | "transactional"    // Buy, Price, Discount, Order
  | "navigational"     // Brand name, specific site

// ============================================
// ANALYSIS ENGINE TYPES
// ============================================

// Result of analyzing a keyword
export interface KeywordAnalysis {
  // Classification
  isPillarCandidate: boolean
  pillarScore: number           // 0-100, higher = more likely pillar
  
  // Semantic analysis
  rootTopic: string             // Main topic extracted
  modifiers: string[]           // Additional words (best, how to, etc.)
  wordCount: number
  
  // Relationship detection
  potentialParentIds: string[]  // IDs of keywords this could be child of
  semanticGroup: string         // Group name for clustering
  
  // Placement suggestion (for sub-keywords)
  suggestedPlacement?: "h2" | "h3" | "body" | "faq"
  placementReason?: string
}

// Pillar identification criteria weights
export interface PillarScoringWeights {
  volumeWeight: number          // Higher volume = more pillar-like
  wordCountWeight: number       // Shorter = more pillar-like (1-3 words)
  intentWeight: number          // Informational > Commercial > others
  broadnessWeight: number       // Broader topic = more pillar-like
  childCountWeight: number      // More potential children = more pillar-like
}

// Default scoring weights
export const DEFAULT_PILLAR_WEIGHTS: PillarScoringWeights = {
  volumeWeight: 0.25,
  wordCountWeight: 0.20,
  intentWeight: 0.15,
  broadnessWeight: 0.25,
  childCountWeight: 0.15
}

// ============================================
// CLUSTER STRUCTURE TYPES
// ============================================

// A generated pillar with its sub-keywords
export interface GeneratedPillar {
  id: string
  keyword: string
  volume: number
  kd: number
  intent: KeywordIntent
  pillarScore: number
  
  // Sub-keywords organized by placement
  subKeywords: {
    h2: SubKeywordSuggestion[]
    h3: SubKeywordSuggestion[]
    body: SubKeywordSuggestion[]
    faq: SubKeywordSuggestion[]
  }
  
  // Linked clusters
  clusterIds: string[]
  
  // Content recommendations
  recommendedWordCount: number
  recommendedHeadings: number
  
  // User actions
  isConfirmed: boolean          // User confirmed this as pillar
  isEdited: boolean             // User made changes
}

// Sub-keyword with placement suggestion
export interface SubKeywordSuggestion {
  id: string
  keyword: string
  volume: number
  kd: number
  placement: "h2" | "h3" | "body" | "faq"
  placementReason: string
  importance: "primary" | "secondary"
  isConfirmed: boolean
}

// A generated cluster article
export interface GeneratedCluster {
  id: string
  keyword: string
  volume: number
  kd: number
  intent: KeywordIntent
  
  // Parent pillar relationship
  pillarId: string
  pillarKeyword: string
  relationshipStrength: number  // 0-100, how related to pillar
  
  // Content recommendations
  recommendedWordCount: number
  recommendedHeadings: number
  
  // User actions
  isConfirmed: boolean
  isEdited: boolean
}

// Complete cluster build result
export interface ClusterBuildResult {
  id: string
  name: string
  createdAt: Date
  updatedAt: Date
  
  // Source stats
  totalKeywordsInput: number
  sourceBreakdown: Record<KeywordSourceType, number>
  
  // Generated structure
  pillars: GeneratedPillar[]
  clusters: GeneratedCluster[]
  
  // Orphan keywords (couldn't be classified)
  orphanKeywords: SourceKeyword[]
  
  // Internal linking matrix
  linkingMatrix: InternalLinkSuggestion[]
  
  // Quality metrics
  qualityScore: number          // Overall cluster quality 0-100
  coverageScore: number         // How well topics are covered
  balanceScore: number          // Pillar to cluster ratio
}

// Internal linking suggestion
export interface InternalLinkSuggestion {
  fromId: string
  fromKeyword: string
  toId: string
  toKeyword: string
  anchorText: string
  placementHint: string
  relevanceScore: number
  isRequired: boolean           // Must-have link
}

// ============================================
// BUILDER STATE TYPES
// ============================================

// Steps in the cluster builder wizard
export type BuilderStep = 
  | "collect"      // Step 1: Collect keywords from sources
  | "analyze"      // Step 2: Run analysis engine
  | "review"       // Step 3: Review & edit pillars/clusters
  | "finalize"     // Step 4: Confirm and save

// Builder state
export interface ClusterBuilderState {
  step: BuilderStep
  
  // Collected keywords
  keywords: SourceKeyword[]
  selectedKeywordIds: Set<string>
  
  // Analysis status
  isAnalyzing: boolean
  analysisProgress: number      // 0-100
  analysisError?: string
  
  // Results
  result?: ClusterBuildResult
  
  // User modifications
  manualPillarIds: Set<string>  // User-forced pillars
  manualClusterIds: Set<string> // User-forced clusters
  removedKeywordIds: Set<string>// User-removed keywords
}

// ============================================
// KEYWORD SOURCE CONNECTION
// ============================================

// Data sent when "Send to Topic Clusters" is clicked
export interface KeywordTransferPayload {
  source: KeywordSourceType
  keywords: {
    keyword: string
    volume: number
    kd: number
    intent?: KeywordIntent
    cpc?: number
    trend?: "up" | "down" | "stable"
    metadata?: Record<string, unknown>
  }[]
  sourceDetails?: string        // Additional context
}

// LocalStorage key for keyword transfer
export const KEYWORD_TRANSFER_KEY = "blogspy_keyword_transfer"

// ============================================
// MANUAL INPUT TYPES
// ============================================

// Format for bulk keyword input
export interface BulkKeywordInput {
  text: string                  // Raw text input
  format: "simple" | "csv" | "tabbed"
  // simple: one keyword per line
  // csv: keyword,volume,kd,intent
  // tabbed: keyword\tvolume\tkd\tintent
}

// Parsed result from bulk input
export interface ParsedBulkKeywords {
  valid: SourceKeyword[]
  invalid: { line: number; text: string; reason: string }[]
  duplicates: string[]
}
