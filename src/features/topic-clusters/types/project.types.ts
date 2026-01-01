// ============================================
// TOPIC PROJECT TYPES
// ============================================
// Complete type definitions for Topic/Project system

// Project Status
export type ProjectStatus = "draft" | "clustered" | "archived"

// Keyword Source - Where the keyword came from
export type KeywordSource = 
  | "manual"           // User typed manually
  | "keyword_explorer" // Imported from Keyword Explorer
  | "competitor_gap"   // From Competitor Gap Analysis
  | "content_decay"    // From Content Decay
  | "rank_tracker"     // From Rank Tracker
  | "csv_import"       // CSV file import
  | "trend_spotter"    // From Trend Spotter

// Keyword Type - Determined after clustering
export type KeywordType = "pillar" | "supporting" | "cluster" | null

// Intent Type
export type IntentType = "informational" | "commercial" | "transactional" | "navigational" | null

// Trend Direction
export type TrendDirection = "up" | "down" | "stable" | null

// SERP Features
export type SerpFeature = 
  | "featured_snippet" 
  | "paa" 
  | "video" 
  | "images" 
  | "shopping" 
  | "local_pack" 
  | "reviews" 
  | "knowledge_panel"

// ============================================
// KEYWORD IN PROJECT
// ============================================
export interface ProjectKeyword {
  id: string
  projectId: string
  
  // Core Data
  keyword: string
  volume: number | null
  kd: number | null
  cpc: number | null
  
  // Intent & Trend
  intent: IntentType
  trend: TrendDirection
  trendPercent: number | null
  
  // SERP Data
  serpFeatures: SerpFeature[]
  position: number | null         // Current ranking (if any)
  positionChange: number | null   // Position change
  rankingUrl: string | null       // URL that's ranking
  
  // Source & Metadata
  source: KeywordSource
  sourceTag?: string              // e.g., "Missing", "Decaying", "Breakout"
  
  // Clustering Results (filled after clustering)
  keywordType: KeywordType        // pillar/supporting/cluster
  parentPillarId: string | null   // If supporting/cluster, which pillar
  confidenceScore: number | null  // How confident the classification is
  
  // Word count for analysis
  wordCount: number               // Number of words in keyword
  
  // Timestamps
  createdAt: Date
  updatedAt: Date
}

// ============================================
// PILLAR RESULT (After Clustering)
// ============================================
export interface PillarResult {
  id: string
  projectId: string
  
  // Pillar Keyword
  keywordId: string
  keyword: string
  volume: number
  kd: number
  
  // Confidence
  confidenceScore: number         // 0-100, how confident we are this is a pillar
  
  // Related Keywords
  supportingKeywordIds: string[]  // Keywords that support/define this pillar
  clusterKeywordIds: string[]     // Long-tail cluster keywords
  
  // Stats
  totalVolume: number             // Sum of all related keywords
  avgKd: number                   // Average KD of cluster
  keywordCount: number            // Total keywords in this pillar group
  
  // Timestamps
  createdAt: Date
}

// ============================================
// TOPIC PROJECT
// ============================================
export interface TopicProject {
  id: string
  userId: string
  
  // Project Info
  name: string
  description?: string
  status: ProjectStatus
  
  // Keywords
  keywords: ProjectKeyword[]
  keywordCount: number
  
  // Clustering Results (filled after clustering)
  pillars: PillarResult[]
  uncategorizedKeywordIds: string[]  // Keywords that don't fit any pillar
  
  // Stats
  totalVolume: number
  avgKd: number
  
  // Timestamps
  createdAt: Date
  updatedAt: Date
  clusteredAt: Date | null        // When clustering was done
}

// ============================================
// CREATE/UPDATE DTOs
// ============================================
export interface CreateProjectDto {
  name: string
  description?: string
}

export interface UpdateProjectDto {
  name?: string
  description?: string
}

export interface AddKeywordDto {
  keyword: string
  volume?: number | null
  kd?: number | null
  cpc?: number | null
  intent?: IntentType
  trend?: TrendDirection
  trendPercent?: number | null
  serpFeatures?: SerpFeature[]
  source: KeywordSource
  sourceTag?: string
}

export interface BulkAddKeywordsDto {
  keywords: AddKeywordDto[]
}

// ============================================
// API RESPONSE TYPES
// ============================================
export interface ProjectListResponse {
  projects: TopicProject[]
  total: number
}

export interface ClusteringResult {
  success: boolean
  pillars: PillarResult[]
  uncategorizedKeywordIds: string[]
  stats: {
    totalKeywords: number
    pillarCount: number
    supportingCount: number
    clusterCount: number
    uncategorizedCount: number
  }
}
