// ============================================
// AI WRITER - Type Definitions
// ============================================

// Re-export NLP Terms types (Feature #1)
export type {
  NLPTerm,
  NLPTermPriority,
  NLPTermStatus,
  NLPTermSource,
  NLPTermCategory,
  NLPOptimizationScore,
  NLPRecommendation,
  NLPPanelFilters,
  TermPosition,
  NLPAnalysisResult,
  NLPConfig
} from './nlp-terms.types'
export { DEFAULT_NLP_CONFIG } from './nlp-terms.types'

// Re-export GEO & AEO types (Feature #2 & #3)
export type {
  GEOScore,
  GEORecommendation,
  AEOScore,
  AEORecommendation,
  SnippetOpportunity,
  SEOIntelligenceScore,
  GEOConfig,
  AEOConfig
} from './geo-aeo.types'
export { DEFAULT_GEO_CONFIG, DEFAULT_AEO_CONFIG } from './geo-aeo.types'

// Re-export Term Highlight types (Feature #4)
export type {
  TermHighlightStyle,
  HighlightConfig,
  TermHighlight,
  HighlightDecoration,
  HighlightPanelState
} from './term-highlight.types'
export { HIGHLIGHT_COLORS, INTENSITY_MULTIPLIERS, DEFAULT_HIGHLIGHT_STATE } from './term-highlight.types'

// Re-export Content Targets types (Feature #5 & #6)
export type {
  WordCountTarget,
  HeadingTarget,
  HeadingTargets,
  ParagraphTarget,
  ImageTarget,
  LinkTarget,
  ContentTargets,
  TargetStatus,
  TargetProgress
} from './content-targets.types'
export { DEFAULT_CONTENT_TARGETS, CONTENT_TYPE_TARGETS } from './content-targets.types'

// NLP Keywords for SEO optimization (legacy - will be replaced by NLPTerm)
export interface NLPKeyword {
  text: string
  used: boolean
}

// Critical SEO issue configuration
export interface CriticalIssue {
  id: string
  text: string
  check: (stats: EditorStats) => boolean
}

// Editor statistics for SEO analysis
export interface EditorStats {
  wordCount: number
  characterCount: number
  headingCount: { h1: number; h2: number; h3: number }
  paragraphCount: number
  imageCount: number
  linkCount: number
  keywordDensity: number
  keywordCount: number
  content: string
}

// AI Action types
export type AIAction = "faq" | "conclusion" | "expand" | "rewrite" | "shorten" | null

// Competitor data
export interface CompetitorData {
  rank: number
  title: string
  domain: string
  wordCount: number
  headerCount: number
}

// ============================================
// SMART CONTEXT SYSTEM - New Types
// ============================================

// Source feature that redirected to AI Writer
export type SourceFeature = 
  | "keyword-magic"
  | "competitor-gap"
  | "content-decay"
  | "topic-clusters"
  | "trend-spotter"
  | "content-roadmap"
  | "snippet-stealer"
  | "command-center"
  | "direct"

// Search Intent types
export type SearchIntent = 
  | "informational"
  | "commercial"
  | "transactional"
  | "navigational"

// Content Type
export type ContentType = "pillar" | "cluster" | "standalone"

// Sub-keyword with placement info (for pillar articles)
export interface SubKeyword {
  keyword: string
  volume?: number
  placement: "h2" | "h3" | "body" | "faq"  // Where to use in article
  importance: "primary" | "secondary"
}

// SERP Features that can be targeted
export interface SERPFeatures {
  featuredSnippet: boolean
  peopleAlsoAsk: boolean
  videoCarousel: boolean
  imagesPack: boolean
  localPack: boolean
  knowledgePanel: boolean
}

// Pillar-specific context data
export interface PillarData {
  subKeywords: SubKeyword[]
  clusterCount: number  // How many cluster articles exist
  recommendedLength: number  // 3000-5000 for pillar
  recommendedHeadings: number  // 12-20 for pillar
  coverageTopics: string[]  // Topics to cover
}

// Cluster-specific context data
export interface ClusterData {
  pillarKeyword: string  // Parent pillar keyword
  pillarUrl?: string  // URL to link back
  linkAnchor: string  // Anchor text for internal link
  recommendedLength: number  // 1500-2500 for cluster
  recommendedHeadings: number  // 5-8 for cluster
  supportingKeywords?: SubKeyword[]  // Supporting keywords for this cluster article
}

// Smart Context collected from URL params
export interface WriterContext {
  // Source info
  source: SourceFeature
  
  // Keyword data
  keyword: string
  secondaryKeywords: string[]
  volume?: number
  difficulty?: number
  cpc?: number
  
  // Content classification
  intent: SearchIntent
  contentType: ContentType
  parentPillar?: string // If cluster, link to parent (legacy support)
  
  // NEW: Pillar-specific data (when contentType === "pillar")
  pillarData?: PillarData
  
  // NEW: Cluster-specific data (when contentType === "cluster")
  clusterData?: ClusterData
  
  // SERP data
  serpFeatures: SERPFeatures
  
  // Competitor data (from source)
  competitorData?: {
    avgWordCount: number
    avgHeadings: number
    avgImages: number
    topDomains: string[]
  }
  
  // Revival mode (from Content Decay)
  revivalMode?: {
    articleId: string
    oldUrl: string
    decayReason: string
    originalTraffic: number
    currentTraffic: number
  }
  
  // Trend data (from Trend Spotter)
  trendData?: {
    velocity: "rising" | "stable" | "declining"
    score: number
    newsAngle: boolean
  }
  
  // NEW: Internal linking instructions from Topic Clusters
  internalLinks?: InternalLinkInstruction[]
  
  // NEW: Cluster overview data (when loading entire cluster)
  clusterOverview?: ClusterOverviewContext
}

// ============================================
// INTERNAL LINKING TYPES (for AI Instructions)
// ============================================

// Internal link instruction for AI model
export interface InternalLinkInstruction {
  toKeyword: string
  toUrl?: string
  anchorText: string
  placementHint: string
  isRequired: boolean
  relevanceScore: number
}

// Cluster overview when "Load Entire Cluster" is used
export interface ClusterOverviewContext {
  clusterName: string
  pillars: { keyword: string; status: string; url?: string }[]
  clusters: { keyword: string; status: string; url?: string }[]
}

// Content Blueprint - Pre-generation analysis
export interface ContentBlueprint {
  // Recommendations
  recommendedWordCount: number
  recommendedHeadings: number
  recommendedImages: number
  
  // Structure
  suggestedOutline: OutlineItem[]
  
  // SEO
  metaTitle: string
  metaDescription: string
  slug: string
  
  // Schema types to include
  schemaTypes: ("Article" | "FAQ" | "HowTo" | "Review" | "BreadcrumbList")[]
  
  // Internal linking opportunities
  internalLinks: {
    anchor: string
    url: string
    relevance: number
  }[]
  
  // Featured snippet opportunity
  snippetOpportunity?: {
    type: "definition" | "list" | "table" | "steps"
    targetQuestion: string
  }
}

// Outline item for structure
export interface OutlineItem {
  id: string
  level: "h1" | "h2" | "h3"
  text: string
  hasImage: boolean
  imageType?: "hero" | "screenshot" | "infographic" | "diagram" | "chart"
  children?: OutlineItem[]
}

// Smart Image Placeholder data
export interface SmartImagePlaceholder {
  id: string
  position: number // Order in article
  type: "hero" | "screenshot" | "infographic" | "diagram" | "chart" | "comparison" | "process"
  
  // AI-generated suggestions
  prompt: string // For Midjourney/DALL-E
  altText: string
  seoKeywords: string[]
  suggestedFilename: string
  
  // Dimensions
  width: number
  height: number
  
  // User uploaded image
  uploadedUrl?: string
}

// Meta settings
export interface MetaSettings {
  title: string
  titleLength: number
  description: string
  descriptionLength: number
  slug: string
  focusKeyword: string
  secondaryKeywords: string[]
  
  // Validation
  isTitleValid: boolean
  isDescriptionValid: boolean
  isSlugValid: boolean
}

// ============================================
// DRAFT & PERSISTENCE TYPES
// ============================================

// Draft status
export type DraftStatus = 'draft' | 'in-progress' | 'ready-for-review' | 'published'

// Draft interface
export interface Draft {
  id: string
  title: string
  content: string
  keyword: string
  secondaryKeywords: string[]
  metaSettings: MetaSettings
  
  // Timestamps
  createdAt: string
  updatedAt: string
  lastAutoSaveAt?: string
  
  // Status
  status: DraftStatus
  wordCount: number
  completionPercentage: number
  
  // Context
  sourceFeature?: string
  clusterId?: string
  pillarId?: string
  
  // Flags
  isAutoSave: boolean
  isLocked: boolean
}

// ============================================
// VERSION HISTORY TYPES
// ============================================

export interface ContentVersion {
  id: string
  draftId: string
  version: number
  
  // Content snapshot
  content: string
  wordCount: number
  
  // Metadata
  title: string
  metaTitle: string
  metaDescription: string
  
  // Change info
  changeType: 'manual' | 'auto-save' | 'ai-generated' | 'restore'
  changeDescription?: string
  changedSections?: string[]
  
  // Timestamps
  createdAt: string
  createdBy?: string
}

// ============================================
// CREDITS SYSTEM TYPES
// ============================================

export interface CreditPlan {
  id: string
  name: string
  credits: number
  price: number
  features: string[]
  isPopular?: boolean
}

export interface CreditBalance {
  total: number
  used: number
  remaining: number
  resetDate: string
  plan: CreditPlan
}

export interface CreditTransaction {
  id: string
  operation: string
  creditsUsed: number
  timestamp: string
  details?: string
}

// ============================================
// EXPORT TYPES
// ============================================

export type ExportFormat = 'html' | 'markdown' | 'wordpress' | 'json' | 'docx'

export interface ExportResult {
  success: boolean
  content: string
  filename: string
  mimeType: string
  size: number
  error?: string
}

// ============================================
// SCHEMA TYPES
// ============================================

export type SchemaType = 
  | 'Article' 
  | 'FAQPage' 
  | 'HowTo' 
  | 'Review' 
  | 'BreadcrumbList'

export interface FAQSchemaItem {
  question: string
  answer: string
}

export interface HowToStep {
  name: string
  text: string
  image?: string
  url?: string
}

export interface GeneratedSchema {
  type: SchemaType
  script: string
  json: Record<string, unknown>
  isValid: boolean
  warnings: string[]
}

// ============================================
// READABILITY TYPES
// ============================================

export interface ReadabilityScore {
  fleschReadingEase: number
  fleschKincaidGrade: number
  averageGradeLevel: number
  readingLevel: 'very-easy' | 'easy' | 'fairly-easy' | 'standard' | 'fairly-difficult' | 'difficult' | 'very-difficult'
  targetAudience: string
  isGood: boolean
  recommendations: string[]
}

export interface ReadabilityStats {
  characterCount: number
  wordCount: number
  sentenceCount: number
  paragraphCount: number
  avgWordsPerSentence: number
  readingTimeMinutes: number
  speakingTimeMinutes: number
}

// ============================================
// CLUSTER WRITING MODE TYPES
// ============================================

export interface ClusterArticle {
  id: string
  keyword: string
  type: 'pillar' | 'cluster'
  status: 'pending' | 'in-progress' | 'completed' | 'skipped'
  content?: string
  metaSettings?: MetaSettings
  wordCount: number
  completionPercentage: number
  parentPillarId?: string
}

export interface ClusterQueue {
  id: string
  name: string
  articles: ClusterArticle[]
  currentIndex: number
  totalArticles: number
  completedArticles: number
  createdAt: string
  updatedAt: string
}

// ============================================
// INTERNAL LINKING TYPES
// ============================================

export interface InternalLinkSuggestion {
  keyword: string
  url: string
  anchorText: string
  relevanceScore: number
  position: 'beginning' | 'middle' | 'end'
  isInserted: boolean
}

// ============================================
// AI OPERATION TYPES
// ============================================

export type AIOperationType = 
  | 'generate-faq'
  | 'generate-conclusion'
  | 'generate-intro'
  | 'generate-outline'
  | 'generate-full-article'
  | 'expand-text'
  | 'rewrite-text'
  | 'shorten-text'
  | 'fix-grammar'
  | 'draft-definition'

export interface AIOperationRequest {
  operation: AIOperationType
  content?: string
  keyword?: string
  secondaryKeywords?: string[]
  context?: Record<string, unknown>
}

export interface AIOperationResponse {
  success: boolean
  content: string
  tokens?: {
    input: number
    output: number
    total: number
  }
  error?: string
  cached?: boolean
}

