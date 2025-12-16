// ============================================
// "AM I CITED?" TOOL - TYPES
// ============================================
// Bulk checker for AI Overview citations
// Shows if your domain is being cited by Google's AI
// ============================================

/**
 * Citation status in AI Overview
 */
export type CitationStatus = "cited" | "not-cited" | "partial" | "unknown"

/**
 * Citation position in AI Overview
 */
export type CitationPosition = "top" | "middle" | "bottom" | "inline"

/**
 * Domain being checked
 */
export interface CheckedDomain {
  domain: string
  displayName?: string
  isPrimary: boolean // Is this the user's main domain?
}

/**
 * Single citation occurrence
 */
export interface Citation {
  id: string
  keyword: string
  searchVolume: number
  aiOverviewPresent: boolean
  citationStatus: CitationStatus
  citedDomains: string[] // All domains cited for this keyword
  position?: CitationPosition // Where in the AI Overview
  snippetPreview?: string // Preview of the AI Overview text
  yourPosition?: number // Position of your citation (1, 2, 3...)
  totalCitations: number // Total number of citations
  competitorsCited: string[] // Competitor domains cited
  lastChecked: string
  trend: "improving" | "declining" | "stable" | "new"
}

/**
 * Bulk check result summary
 */
export interface CitationSummary {
  totalKeywordsChecked: number
  keywordsWithAIOverview: number
  keywordsCited: number
  keywordsPartialCited: number
  keywordsNotCited: number
  citationRate: number // Percentage of AI Overview keywords where cited
  avgPosition: number
  topCompetitors: { domain: string; count: number }[]
  opportunityKeywords: number // Keywords with AI Overview but not cited
}

/**
 * Full citation analysis result
 */
export interface CitationAnalysis {
  domain: string
  summary: CitationSummary
  citations: Citation[]
  topCitedKeywords: Citation[]
  missedOpportunities: Citation[]
  competitorComparison: {
    domain: string
    citedCount: number
    notCitedCount: number
    citationRate: number
  }[]
  lastAnalyzed: string
}

/**
 * Citation trend data point
 */
export interface CitationTrendPoint {
  date: string
  citedCount: number
  totalAIOverviews: number
  citationRate: number
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get status color
 */
export function getStatusColor(status: CitationStatus): string {
  switch (status) {
    case "cited":
      return "text-emerald-500"
    case "partial":
      return "text-yellow-500"
    case "not-cited":
      return "text-red-500"
    case "unknown":
      return "text-gray-500"
    default:
      return "text-gray-500"
  }
}

/**
 * Get status background color
 */
export function getStatusBgColor(status: CitationStatus): string {
  switch (status) {
    case "cited":
      return "bg-emerald-500/10"
    case "partial":
      return "bg-yellow-500/10"
    case "not-cited":
      return "bg-red-500/10"
    case "unknown":
      return "bg-gray-500/10"
    default:
      return "bg-gray-500/10"
  }
}

/**
 * Get status label
 */
export function getStatusLabel(status: CitationStatus): string {
  switch (status) {
    case "cited":
      return "Cited"
    case "partial":
      return "Partial"
    case "not-cited":
      return "Not Cited"
    case "unknown":
      return "Unknown"
    default:
      return "Unknown"
  }
}

/**
 * Get status icon name
 */
export function getStatusIcon(status: CitationStatus): "check" | "minus" | "x" | "question" {
  switch (status) {
    case "cited":
      return "check"
    case "partial":
      return "minus"
    case "not-cited":
      return "x"
    case "unknown":
      return "question"
    default:
      return "question"
  }
}

/**
 * Get position label
 */
export function getPositionLabel(position?: CitationPosition): string {
  if (!position) return "N/A"
  switch (position) {
    case "top":
      return "Top Citation"
    case "middle":
      return "Middle"
    case "bottom":
      return "Bottom"
    case "inline":
      return "Inline"
    default:
      return "Unknown"
  }
}

/**
 * Get position color
 */
export function getPositionColor(position?: CitationPosition): string {
  if (!position) return "text-gray-500"
  switch (position) {
    case "top":
      return "text-emerald-500"
    case "middle":
      return "text-blue-500"
    case "bottom":
      return "text-yellow-500"
    case "inline":
      return "text-purple-500"
    default:
      return "text-gray-500"
  }
}

/**
 * Get trend color
 */
export function getTrendColor(trend: Citation["trend"]): string {
  switch (trend) {
    case "improving":
      return "text-emerald-500"
    case "declining":
      return "text-red-500"
    case "stable":
      return "text-blue-500"
    case "new":
      return "text-purple-500"
    default:
      return "text-gray-500"
  }
}

/**
 * Get citation rate color based on percentage
 */
export function getCitationRateColor(rate: number): string {
  if (rate >= 50) return "text-emerald-500"
  if (rate >= 30) return "text-yellow-500"
  if (rate >= 15) return "text-orange-500"
  return "text-red-500"
}

/**
 * Get citation rate background color
 */
export function getCitationRateBgColor(rate: number): string {
  if (rate >= 50) return "bg-emerald-500"
  if (rate >= 30) return "bg-yellow-500"
  if (rate >= 15) return "bg-orange-500"
  return "bg-red-500"
}

/**
 * Calculate citation score (0-100)
 */
export function calculateCitationScore(summary: CitationSummary): number {
  // Weighted score based on citation rate and average position
  const rateScore = summary.citationRate * 0.7 // 70% weight
  const positionScore = Math.max(0, (5 - summary.avgPosition) / 5) * 30 // 30% weight
  return Math.round(rateScore + positionScore)
}
