// Citation Checker Utility Functions

import { SCORE_THRESHOLDS, SCORE_COLORS, SCORE_LABELS, CTR_MULTIPLIERS, STATUS_ORDER } from "../constants"
import type { CitationStatus, CitationPosition, CitationTrend, Citation, CitationSummary, SortByOption, SortOrder } from "../types"

// ============================================
// STATUS HELPERS
// ============================================

export function getStatusColor(status: CitationStatus): string {
  switch (status) {
    case "cited": return "text-emerald-500"
    case "partial": return "text-yellow-500"
    case "not-cited": return "text-red-500"
    case "unknown": return "text-gray-500"
    default: return "text-gray-500"
  }
}

export function getStatusBgColor(status: CitationStatus): string {
  switch (status) {
    case "cited": return "bg-emerald-500/10"
    case "partial": return "bg-yellow-500/10"
    case "not-cited": return "bg-red-500/10"
    case "unknown": return "bg-gray-500/10"
    default: return "bg-gray-500/10"
  }
}

export function getStatusLabel(status: CitationStatus): string {
  switch (status) {
    case "cited": return "Cited"
    case "partial": return "Partial"
    case "not-cited": return "Not Cited"
    case "unknown": return "Unknown"
    default: return "Unknown"
  }
}

// ============================================
// POSITION HELPERS
// ============================================

export function getPositionLabel(position?: CitationPosition): string {
  if (!position) return "N/A"
  switch (position) {
    case "top": return "Top Citation"
    case "middle": return "Middle"
    case "bottom": return "Bottom"
    case "inline": return "Inline"
    default: return "Unknown"
  }
}

export function getPositionColor(position?: CitationPosition): string {
  if (!position) return "text-gray-500"
  switch (position) {
    case "top": return "text-emerald-500"
    case "middle": return "text-blue-500"
    case "bottom": return "text-yellow-500"
    case "inline": return "text-purple-500"
    default: return "text-gray-500"
  }
}

// ============================================
// TREND HELPERS
// ============================================

export function getTrendColor(trend: CitationTrend): string {
  switch (trend) {
    case "improving": return "text-emerald-500"
    case "declining": return "text-red-500"
    case "stable": return "text-blue-500"
    case "new": return "text-purple-500"
    default: return "text-gray-500"
  }
}

// ============================================
// CITATION RATE HELPERS
// ============================================

export function getCitationRateColor(rate: number): string {
  if (rate >= 50) return "text-emerald-500"
  if (rate >= 30) return "text-yellow-500"
  if (rate >= 15) return "text-orange-500"
  return "text-red-500"
}

export function getCitationRateBgColor(rate: number): string {
  if (rate >= 50) return "bg-emerald-500"
  if (rate >= 30) return "bg-yellow-500"
  if (rate >= 15) return "bg-orange-500"
  return "bg-red-500"
}

// ============================================
// SCORE HELPERS
// ============================================

export function getScoreColor(score: number): string {
  if (score >= SCORE_THRESHOLDS.excellent) return SCORE_COLORS.excellent
  if (score >= SCORE_THRESHOLDS.good) return SCORE_COLORS.good
  if (score >= SCORE_THRESHOLDS.fair) return SCORE_COLORS.fair
  return SCORE_COLORS.poor
}

export function getScoreLabel(score: number): string {
  if (score >= SCORE_THRESHOLDS.excellent) return SCORE_LABELS.excellent
  if (score >= SCORE_THRESHOLDS.good) return SCORE_LABELS.good
  if (score >= SCORE_THRESHOLDS.fair) return SCORE_LABELS.fair
  return SCORE_LABELS.poor
}

export function calculateCitationScore(summary: CitationSummary): number {
  const rateScore = summary.citationRate * 0.7
  const positionScore = Math.max(0, (5 - summary.avgPosition) / 5) * 30
  return Math.round(rateScore + positionScore)
}

// ============================================
// TRAFFIC VALUE
// ============================================

export function calculateCitationValue(citation: Citation): number {
  if (!citation.aiOverviewPresent || citation.citationStatus === "not-cited") {
    return 0
  }
  
  const ctrMultiplier = citation.position 
    ? CTR_MULTIPLIERS[citation.position] 
    : CTR_MULTIPLIERS.default
    
  return Math.floor(citation.searchVolume * ctrMultiplier)
}

// ============================================
// SORTING & FILTERING
// ============================================

export function sortCitations(
  citations: Citation[],
  sortBy: SortByOption,
  sortOrder: SortOrder
): Citation[] {
  return [...citations].sort((a, b) => {
    let comparison = 0
    switch (sortBy) {
      case "volume":
        comparison = a.searchVolume - b.searchVolume
        break
      case "status":
        comparison = STATUS_ORDER[a.citationStatus] - STATUS_ORDER[b.citationStatus]
        break
      case "position":
        comparison = (a.yourPosition || 99) - (b.yourPosition || 99)
        break
      case "traffic":
        comparison = calculateCitationValue(a) - calculateCitationValue(b)
        break
    }
    return sortOrder === "desc" ? -comparison : comparison
  })
}

export function filterCitations(
  citations: Citation[],
  searchQuery: string,
  statusFilter: CitationStatus[],
  showOnlyWithAI: boolean
): Citation[] {
  let result = citations

  if (searchQuery) {
    const query = searchQuery.toLowerCase()
    result = result.filter((c) => c.keyword.toLowerCase().includes(query))
  }

  if (statusFilter.length > 0) {
    result = result.filter((c) => statusFilter.includes(c.citationStatus))
  }

  if (showOnlyWithAI) {
    result = result.filter((c) => c.aiOverviewPresent)
  }

  return result
}

// ============================================
// SORT LABEL
// ============================================

export function getSortLabel(sortBy: SortByOption): string {
  switch (sortBy) {
    case "volume": return "Volume"
    case "status": return "Status"
    case "position": return "Position"
    case "traffic": return "Traffic"
  }
}
