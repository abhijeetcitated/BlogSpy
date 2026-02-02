// ============================================
// CANNIBALIZATION DETECTOR TYPES
// ============================================
// Detect keyword cannibalization across your site
// Multiple pages competing for same keywords = bad
// Find and fix internal competition
// ============================================

/**
 * Severity level of cannibalization
 */
export type CannibalizationSeverity = "critical" | "high" | "medium" | "low"

/**
 * Type of cannibalization issue
 */
export type CannibalizationType = 
  | "same_keyword"        // Exact same target keyword
  | "similar_keyword"     // Very similar keywords (semantic)
  | "title_overlap"       // Title tags targeting same terms
  | "content_overlap"     // Similar content themes
  | "ranking_split"       // Rankings split between pages

/**
 * Recommended action to fix cannibalization
 */
export type CannibalizationAction = 
  | "merge"               // Merge pages into one
  | "redirect"            // 301 redirect one to other
  | "differentiate"       // Make content more distinct
  | "canonical"           // Add canonical tag
  | "noindex"             // Noindex weaker page
  | "reoptimize"          // Change target keyword

/**
 * Individual page involved in cannibalization
 */
export interface CannibalizingPage {
  /** Page URL */
  url: string
  /** Page title */
  title: string
  /** Target keyword */
  targetKeyword: string
  /** Current rank for keyword */
  currentRank: number | null
  /** Historical best rank */
  bestRank: number | null
  /** Monthly organic traffic */
  traffic: number
  /** Last updated date */
  lastUpdated: string
  /** Content word count */
  wordCount: number
  /** Page authority score */
  pageAuthority: number
  /** Number of backlinks */
  backlinks: number
  /** Is this the primary/stronger page? */
  isPrimary: boolean
}

/**
 * Cannibalization issue between pages
 */
export interface CannibalizationIssue {
  /** Unique issue ID */
  id: string
  /** Primary keyword being cannibalized */
  keyword: string
  /** Monthly search volume */
  searchVolume: number
  /** Keyword difficulty */
  keywordDifficulty: number
  /** Pages involved in cannibalization */
  pages: CannibalizingPage[]
  /** Type of cannibalization */
  type: CannibalizationType
  /** Severity level */
  severity: CannibalizationSeverity
  /** Overlap score (0-100) */
  overlapScore: number
  /** Estimated traffic loss due to cannibalization */
  trafficLoss: number
  /** Recommended action */
  recommendedAction: CannibalizationAction
  /** Detailed recommendation */
  recommendation: string
  /** Potential traffic gain if fixed */
  potentialGain: number
  /** First detected date */
  detectedAt: string
}

/**
 * Overall site cannibalization analysis
 */
export interface CannibalizationAnalysis {
  /** Domain analyzed */
  domain: string
  /** Total pages analyzed */
  totalPagesAnalyzed: number
  /** Total keywords analyzed */
  totalKeywordsAnalyzed: number
  /** Number of cannibalization issues */
  issueCount: number
  /** Issues by severity */
  issuesBySeverity: {
    critical: number
    high: number
    medium: number
    low: number
  }
  /** Total estimated traffic loss */
  totalTrafficLoss: number
  /** Total potential gain if all fixed */
  totalPotentialGain: number
  /** Health score (0-100, higher = less cannibalization) */
  healthScore: number
  /** All cannibalization issues */
  issues: CannibalizationIssue[]
  /** Analysis timestamp */
  analyzedAt: string
}

/**
 * Cannibalization trend over time
 */
export interface CannibalizationTrend {
  date: string
  issueCount: number
  trafficLoss: number
  healthScore: number
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get color class based on severity
 */
export function getSeverityColor(severity: CannibalizationSeverity): string {
  switch (severity) {
    case "critical": return "text-red-400"
    case "high": return "text-orange-400"
    case "medium": return "text-amber-400"
    case "low": return "text-yellow-400"
    default: return "text-slate-400"
  }
}

/**
 * Get background color class based on severity
 */
export function getSeverityBgColor(severity: CannibalizationSeverity): string {
  switch (severity) {
    case "critical": return "bg-red-500/20 border-red-500/30"
    case "high": return "bg-orange-500/20 border-orange-500/30"
    case "medium": return "bg-amber-500/20 border-amber-500/30"
    case "low": return "bg-yellow-500/20 border-yellow-500/30"
    default: return "bg-slate-500/20 border-slate-500/30"
  }
}

/**
 * Get action label
 */
export function getActionLabel(action: CannibalizationAction): string {
  const labels: Record<CannibalizationAction, string> = {
    merge: "Merge Pages",
    redirect: "301 Redirect",
    differentiate: "Differentiate Content",
    canonical: "Add Canonical",
    noindex: "Noindex Page",
    reoptimize: "Change Target Keyword"
  }
  return labels[action]
}

/**
 * Get action description
 */
export function getActionDescription(action: CannibalizationAction): string {
  const descriptions: Record<CannibalizationAction, string> = {
    merge: "Combine both pages into a single, comprehensive article",
    redirect: "Redirect the weaker page to the stronger one with 301",
    differentiate: "Make the content focus on different aspects of the topic",
    canonical: "Point canonical tag to the primary page",
    noindex: "Remove weaker page from index while keeping it live",
    reoptimize: "Change one page to target a different keyword"
  }
  return descriptions[action]
}

/**
 * Get type label
 */
export function getTypeLabel(type: CannibalizationType): string {
  const labels: Record<CannibalizationType, string> = {
    same_keyword: "Same Keyword",
    similar_keyword: "Similar Keywords",
    title_overlap: "Title Overlap",
    content_overlap: "Content Overlap",
    ranking_split: "Ranking Split"
  }
  return labels[type]
}

/**
 * Calculate severity based on metrics
 */
export function calculateSeverity(
  overlapScore: number,
  trafficLoss: number,
  pagesCount: number
): CannibalizationSeverity {
  const score = (overlapScore * 0.4) + (Math.min(trafficLoss / 100, 100) * 0.4) + (pagesCount * 10 * 0.2)
  
  if (score >= 70) return "critical"
  if (score >= 50) return "high"
  if (score >= 30) return "medium"
  return "low"
}

/**
 * Get health score color
 */
export function getHealthScoreColor(score: number): string {
  if (score >= 80) return "text-emerald-400"
  if (score >= 60) return "text-yellow-400"
  if (score >= 40) return "text-orange-400"
  return "text-red-400"
}

/**
 * Get health score label
 */
export function getHealthScoreLabel(score: number): string {
  if (score >= 80) return "Excellent"
  if (score >= 60) return "Good"
  if (score >= 40) return "Needs Attention"
  return "Critical"
}
