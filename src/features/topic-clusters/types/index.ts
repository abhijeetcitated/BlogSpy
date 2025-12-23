// Topic Clusters Types
// ============================================
// Enhanced with Pillar/Cluster structure and Internal Linking Matrix

// Re-export main types (selectively to avoid conflicts)
export * from "./cluster-builder.types"

// Export from project.types (primary source for project-related types)
export * from "./project.types"

// Export from content-brief.types
export * from "./content-brief.types"

// Selective exports from keyword-pool.types to avoid conflicts
export type {
  KeywordData,
  TrendData,
  SearchIntent,
  IntentIndicators,
  SerpFeatures,
  KeywordCharacteristics,
  KeywordSourceConfig,
  KeywordFilters,
  SortConfig,
  KeywordAnalysisResult,
  KOSFactors,
  BulkAction,
  ImportConfig,
  ExportConfig,
} from "./keyword-pool.types"
export {
  INTENT_INDICATORS,
  KEYWORD_SOURCE_CONFIGS,
  DEFAULT_FILTERS,
  KOS_WEIGHTS,
} from "./keyword-pool.types"

// Selective exports from cluster-analysis.types to avoid conflicts
export type {
  PillarCandidate,
  PillarScoring,
  ScoreBreakdown,
  SubKeywordPlacement,
  ChildKeyword,
  PlacementRules,
  PlacementRule,
  ClusterReason,
  ClusterRelationType,
  ClusterArticleType,
  InternalLink,
  ClusterBuildConfig,
  PillarWeights,
  AnalysisClusterBuildResult,
  UnassignedKeyword,
  FilteredKeyword,
  BuildQualityMetrics,
  QualityWarning,
  LinkingSuggestion,
  CannibalizationRisk,
} from "./cluster-analysis.types"
export {
  ANALYSIS_DEFAULT_PILLAR_WEIGHTS,
  ANALYSIS_DEFAULT_CLUSTER_CONFIG,
} from "./cluster-analysis.types"

export type ViewMode = "graph" | "list"
export type ColorMode = "kd" | "volume" | "intent"
export type ArticleStatus = "planned" | "draft" | "published"

export interface ClusterKeyword {
  keyword: string
  volume: string
  kd?: number
  intent?: "informational" | "commercial" | "transactional" | "navigational"
}

// Legacy ClusterData for backward compatibility
export interface ClusterData {
  id: string
  name: string
  fullName: string
  volume: string
  kd: number
  keywords: ClusterKeyword[]
}

// ============================================
// NEW: Enhanced Topic Cluster Structure
// ============================================

// Sub-keyword for pillar articles
export interface PillarSubKeyword {
  keyword: string
  volume: number
  placement: "h2" | "h3" | "body" | "faq"
  importance: "primary" | "secondary"
}

// Pillar Article (Main hub)
export interface PillarArticle {
  id: string
  keyword: string
  fullTitle: string
  volume: number
  kd: number
  intent: "informational" | "commercial" | "transactional"
  status: ArticleStatus
  url?: string  // If published
  subKeywords: PillarSubKeyword[]
  clusterIds: string[]  // IDs of cluster articles
  recommendedWordCount: number
  recommendedHeadings: number
}

// Cluster Article (Supporting content)
export interface ClusterArticle {
  id: string
  keyword: string
  fullTitle: string
  volume: number
  kd: number
  intent: "informational" | "commercial" | "transactional"
  status: ArticleStatus
  url?: string  // If published
  pillarId: string  // Parent pillar ID
  recommendedWordCount: number
  recommendedHeadings: number
}

// Internal Link Recommendation (AI-generated)
export interface InternalLinkRecommendation {
  id: string
  fromId: string  // Article ID (pillar or cluster)
  fromKeyword: string
  toId: string
  toKeyword: string
  toUrl?: string
  anchorText: string
  placementHint: string  // Where to place in article
  relevanceScore: number  // 0-100
  isRequired: boolean  // Must link (pillar) vs optional
}

// Complete Topic Cluster with linking matrix
export interface TopicClusterFull {
  id: string
  name: string  // Cluster topic name
  description: string
  createdAt: string
  
  // Pillars and Clusters
  pillars: PillarArticle[]
  clusters: ClusterArticle[]
  
  // AI-Generated Internal Linking Matrix
  linkingMatrix: InternalLinkRecommendation[]
  
  // Stats
  totalVolume: number
  avgKd: number
  articleCount: number
  publishedCount: number
}

// For AI Writer - Complete cluster context
export interface ClusterWriterContext {
  clusterName: string
  currentArticleId: string
  currentArticleType: "pillar" | "cluster"
  
  // Article being written
  keyword: string
  subKeywords?: PillarSubKeyword[]  // Only for pillar
  
  // Linking instructions for AI
  requiredLinks: InternalLinkRecommendation[]
  
  // Full cluster context (for AI understanding)
  allPillars: { keyword: string; url?: string }[]
  allClusters: { keyword: string; url?: string }[]
}

export interface RankingPotential {
  label: string
  color: string
  bg: string
  percent: number
}
