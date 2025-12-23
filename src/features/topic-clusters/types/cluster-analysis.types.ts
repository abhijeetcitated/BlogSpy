// ============================================
// CLUSTER BUILDER - Analysis Engine Types
// ============================================
// Professional pillar/cluster identification logic

// ============================================
// PILLAR IDENTIFICATION
// ============================================

export interface PillarCandidate {
  id: string
  keyword: string
  volume: number
  kd: number
  cpc: number
  intent: import("./keyword-pool.types").SearchIntent
  
  // PILLAR SCORING (Each factor 0-100)
  scoring: PillarScoring
  
  // Final pillar score
  pillarScore: number             // Weighted average 0-100
  
  // Classification
  isPillar: boolean               // Score >= threshold
  pillarConfidence: "high" | "medium" | "low"
  
  // Child keywords
  childKeywords: ChildKeyword[]
  childCount: number
  
  // Content planning
  estimatedWordCount: number
  estimatedH2Count: number
  estimatedH3Count: number
  estimatedFAQCount: number
}

export interface PillarScoring {
  // Factor scores (each 0-100)
  volumeScore: number             // Higher volume = higher score
  wordCountScore: number          // 1-3 words = higher score
  childCountScore: number         // More children = higher score
  intentScore: number             // Info/Commercial = higher score
  broadnessScore: number          // Broader topic = higher score
  trafficPotentialScore: number   // Higher potential = higher score
  trendScore: number              // Rising trend = bonus
  
  // Breakdown for UI
  breakdown: ScoreBreakdown[]
}

export interface ScoreBreakdown {
  factor: string
  score: number
  weight: number
  weighted: number
  reason: string
}

// ============================================
// SUB-KEYWORD CLASSIFICATION
// ============================================

export type SubKeywordPlacement = "h2" | "h3" | "body" | "faq"

export interface ChildKeyword {
  id: string
  keyword: string
  volume: number
  kd: number
  intent: import("./keyword-pool.types").SearchIntent
  
  // Placement
  placement: SubKeywordPlacement
  placementScore: number          // Confidence 0-100
  placementReason: string
  
  // Relationship to parent
  parentPillarId: string
  semanticSimilarity: number      // 0-1
  isDirectChild: boolean          // Contains parent topic
  
  // Priority
  priority: "high" | "medium" | "low"
  priorityReason: string
}

// Placement rules configuration
export interface PlacementRules {
  h2: PlacementRule
  h3: PlacementRule
  body: PlacementRule
  faq: PlacementRule
}

export interface PlacementRule {
  minVolume: number
  maxVolume: number
  maxWordCountDiff: number        // From pillar
  requiredPatterns?: string[]     // Must match one
  excludedPatterns?: string[]     // Must not match
  intentMatch: boolean            // Same intent as pillar?
  description: string
}

export const DEFAULT_PLACEMENT_RULES: PlacementRules = {
  h2: {
    minVolume: 500,
    maxVolume: Infinity,
    maxWordCountDiff: 2,
    intentMatch: true,
    description: "High-volume subtopics for main sections"
  },
  h3: {
    minVolume: 100,
    maxVolume: 5000,
    maxWordCountDiff: 4,
    intentMatch: true,
    description: "Specific subtopics under H2 sections"
  },
  body: {
    minVolume: 50,
    maxVolume: 1000,
    maxWordCountDiff: 6,
    intentMatch: false,
    description: "Long-tail variations for natural integration"
  },
  faq: {
    minVolume: 50,
    maxVolume: Infinity,
    maxWordCountDiff: 8,
    requiredPatterns: ["how", "what", "why", "when", "where", "can", "does", "is", "should", "will"],
    intentMatch: false,
    description: "Question-based keywords for FAQ section"
  }
}

// ============================================
// CLUSTER ARTICLE IDENTIFICATION
// ============================================

export interface ClusterArticle {
  id: string
  keyword: string
  volume: number
  kd: number
  cpc: number
  intent: import("./keyword-pool.types").SearchIntent
  
  // Why it's a cluster article (not sub-keyword)
  clusterReason: ClusterReason
  
  // Parent pillar
  parentPillarId: string
  parentPillarKeyword: string
  
  // Relationship
  relationshipType: ClusterRelationType
  relationshipStrength: number    // 0-100
  
  // Content planning
  estimatedWordCount: number
  internalLinks: InternalLink[]
  
  // Article type
  articleType: ClusterArticleType
  
  // Priority
  priority: number                // 1-10, higher = more important
  priorityFactors: string[]
}

export type ClusterReason = 
  | "different-intent"            // Different search intent from pillar
  | "high-volume"                 // High enough volume for standalone
  | "specific-topic"              // Too specific for section
  | "comparison"                  // vs/comparison content
  | "transactional"               // Buy/pricing content
  | "tutorial"                    // Step-by-step how-to
  | "list-post"                   // Best/top list content

export type ClusterRelationType =
  | "direct-child"                // Contains pillar topic
  | "semantic-sibling"            // Related topic
  | "intent-variant"              // Same topic, different intent
  | "subtopic-expansion"          // Deep dive on subtopic

export type ClusterArticleType =
  | "comprehensive-guide"         // In-depth tutorial
  | "comparison-post"             // X vs Y
  | "list-post"                   // Best/Top X
  | "case-study"                  // Real examples
  | "how-to-tutorial"             // Step-by-step
  | "review-post"                 // Product/service review
  | "resource-roundup"            // Tools/resources collection

export interface InternalLink {
  targetType: "pillar" | "cluster"
  targetId: string
  targetKeyword: string
  anchorSuggestion: string
  linkStrength: number            // How relevant 0-100
}

// ============================================
// CLUSTER BUILD CONFIGURATION
// ============================================

export interface ClusterBuildConfig {
  // Pillar thresholds
  pillarScoreThreshold: number    // Default: 70
  minChildrenForPillar: number    // Default: 3
  
  // Scoring weights
  weights: PillarWeights
  
  // Cluster article criteria
  clusterArticleMinVolume: number // Default: 1000
  clusterArticleMinCPC: number    // Default: 1.0
  
  // Quality filters
  minVolumeThreshold: number      // Ignore below this
  maxKDThreshold: number          // Ignore above this
  
  // Content settings
  targetWordCountMultiplier: number  // volume-based calculation
}

export interface PillarWeights {
  volume: number                  // Default: 0.20
  wordCount: number               // Default: 0.15
  childCount: number              // Default: 0.25
  intent: number                  // Default: 0.15
  broadness: number               // Default: 0.10
  trafficPotential: number        // Default: 0.10
  trend: number                   // Default: 0.05
}

export const ANALYSIS_DEFAULT_PILLAR_WEIGHTS: PillarWeights = {
  volume: 0.20,
  wordCount: 0.15,
  childCount: 0.25,
  intent: 0.15,
  broadness: 0.10,
  trafficPotential: 0.10,
  trend: 0.05
}

export const ANALYSIS_DEFAULT_CLUSTER_CONFIG: ClusterBuildConfig = {
  pillarScoreThreshold: 70,
  minChildrenForPillar: 3,
  weights: ANALYSIS_DEFAULT_PILLAR_WEIGHTS,
  clusterArticleMinVolume: 1000,
  clusterArticleMinCPC: 1.0,
  minVolumeThreshold: 50,
  maxKDThreshold: 80,
  targetWordCountMultiplier: 0.05
}

// ============================================
// BUILD RESULT (Analysis version)
// ============================================

export interface AnalysisClusterBuildResult {
  // Identified pillars
  pillars: PillarCandidate[]
  
  // Standalone cluster articles
  clusterArticles: ClusterArticle[]
  
  // Unassigned keywords (didn't fit anywhere)
  unassigned: UnassignedKeyword[]
  
  // Removed keywords (filtered out)
  filtered: FilteredKeyword[]
  
  // Quality metrics
  quality: BuildQualityMetrics
  
  // Internal linking suggestions
  linkingMatrix: LinkingSuggestion[]
  
  // Metadata
  buildDate: Date
  configUsed: ClusterBuildConfig
  totalKeywordsProcessed: number
}

export interface UnassignedKeyword {
  id: string
  keyword: string
  volume: number
  reason: string
  suggestions: string[]
}

export interface FilteredKeyword {
  id: string
  keyword: string
  volume: number
  filterReason: "low-volume" | "high-kd" | "duplicate" | "irrelevant"
}

export interface BuildQualityMetrics {
  overallScore: number            // 0-100
  coverageScore: number           // % keywords assigned
  balanceScore: number            // Pillar/cluster ratio
  depthScore: number              // Sub-keyword depth
  linkingScore: number            // Internal link potential
  
  warnings: QualityWarning[]
  recommendations: string[]
}

export interface QualityWarning {
  type: "low-coverage" | "unbalanced" | "thin-content" | "cannibalization" | "missing-intent"
  message: string
  severity: "high" | "medium" | "low"
  affectedKeywords?: string[]
}

export interface LinkingSuggestion {
  sourceId: string
  sourceType: "pillar" | "cluster"
  sourceKeyword: string
  targetId: string
  targetType: "pillar" | "cluster"
  targetKeyword: string
  linkType: "contextual" | "navigation" | "related"
  strength: number
  anchorSuggestions: string[]
}

// ============================================
// CANNIBALIZATION DETECTION
// ============================================

export interface CannibalizationRisk {
  keyword1Id: string
  keyword1: string
  keyword2Id: string
  keyword2: string
  riskScore: number               // 0-100
  riskLevel: "high" | "medium" | "low"
  reason: string
  recommendation: "merge" | "differentiate" | "ignore"
}
