// ============================================
// AI WRITER - NLP Term Suggestions Types
// ============================================
// Feature #1: Production-ready NLP term tracking
// ============================================

/**
 * NLP Term priority levels for SEO optimization
 * - primary: Must use for ranking (target keyword + variants)
 * - secondary: Strong signal for topical relevance
 * - supporting: LSI keywords for semantic depth
 * - avoid: Overused/spammy terms to limit
 */
export type NLPTermPriority = 'primary' | 'secondary' | 'supporting' | 'avoid'

/**
 * Individual NLP term with usage tracking
 */
export interface NLPTerm {
  id: string
  term: string
  priority: NLPTermPriority
  
  // Usage tracking
  targetCount: number      // How many times to use (min)
  maxCount: number         // Maximum recommended usage (to avoid stuffing)
  currentCount: number     // Current usage in content
  
  // Status derived from counts
  status: NLPTermStatus
  
  // Search metrics
  volume?: number          // Monthly search volume
  difficulty?: number      // Keyword difficulty 0-100
  relevance: number        // Relevance to main topic 0-100
  
  // Source info
  source: NLPTermSource
  
  // UI state
  isExpanded?: boolean
  showInContent?: boolean  // Highlight in editor
}

/**
 * NLP term usage status
 */
export type NLPTermStatus = 
  | 'missing'      // Not used at all (red)
  | 'underused'    // Below target (yellow)
  | 'optimal'      // Within target range (green)
  | 'overused'     // Above max (red)

/**
 * Source of the NLP term
 */
export type NLPTermSource = 
  | 'target-keyword'     // Main target keyword
  | 'competitor-serp'    // From competitor analysis
  | 'related-search'     // Google related searches
  | 'paa'                // People Also Ask
  | 'lsi'                // LSI/semantic keywords
  | 'entity'             // Named entities
  | 'manual'             // User added

/**
 * NLP Term category for UI grouping
 */
export interface NLPTermCategory {
  id: string
  name: string
  description: string
  priority: NLPTermPriority
  terms: NLPTerm[]
  usedCount: number
  totalCount: number
  completionPercentage: number
  icon: string  // Lucide icon name
  color: string // Tailwind color class
}

/**
 * Overall NLP optimization score
 */
export interface NLPOptimizationScore {
  score: number           // 0-100
  grade: 'A' | 'B' | 'C' | 'D' | 'F'
  primaryCompletion: number
  secondaryCompletion: number
  supportingCompletion: number
  overusedCount: number
  missingCritical: string[]
  recommendations: NLPRecommendation[]
}

/**
 * NLP optimization recommendation
 */
export interface NLPRecommendation {
  id: string
  type: 'add' | 'reduce' | 'replace' | 'distribute'
  term: string
  message: string
  priority: 'high' | 'medium' | 'low'
  action?: {
    label: string
    handler: string  // Action identifier
  }
}

/**
 * NLP Panel filter state
 */
export interface NLPPanelFilters {
  showUsed: boolean
  showUnused: boolean
  showOverused: boolean
  searchQuery: string
  sortBy: 'priority' | 'usage' | 'relevance' | 'alphabetical'
  groupBy: 'priority' | 'status' | 'source' | 'none'
}

/**
 * Term position in content for highlighting
 */
export interface TermPosition {
  term: string
  start: number
  end: number
  context: string  // Surrounding text
  isExact: boolean // Exact match or variation
}

/**
 * NLP analysis result from content
 */
export interface NLPAnalysisResult {
  terms: NLPTerm[]
  score: NLPOptimizationScore
  termPositions: Map<string, TermPosition[]>
  analysisTimestamp: number
}

/**
 * Configuration for NLP term analysis
 */
export interface NLPConfig {
  // Target ranges by priority
  primaryTargetMin: number
  primaryTargetMax: number
  secondaryTargetMin: number
  secondaryTargetMax: number
  supportingTargetMin: number
  supportingTargetMax: number
  
  // Analysis settings
  caseSensitive: boolean
  includePlurals: boolean
  includeVariations: boolean
  minWordLength: number
  
  // UI settings
  highlightInEditor: boolean
  showTooltips: boolean
  autoRefresh: boolean
  refreshIntervalMs: number
}

/**
 * Default NLP configuration
 */
export const DEFAULT_NLP_CONFIG: NLPConfig = {
  primaryTargetMin: 3,
  primaryTargetMax: 8,
  secondaryTargetMin: 2,
  secondaryTargetMax: 5,
  supportingTargetMin: 1,
  supportingTargetMax: 3,
  caseSensitive: false,
  includePlurals: true,
  includeVariations: true,
  minWordLength: 3,
  highlightInEditor: true,
  showTooltips: true,
  autoRefresh: true,
  refreshIntervalMs: 1000
}
