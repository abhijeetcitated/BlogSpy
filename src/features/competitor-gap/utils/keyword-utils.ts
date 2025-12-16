// ============================================
// COMPETITOR GAP - Utility Functions
// ============================================

import type { Intent, GapKeyword, GapStats } from "../types"
import { INTENT_STYLES, QUICK_FILTERS } from "../constants"

/**
 * Get styling classes for intent badges
 */
export function getIntentStyle(intent: Intent): string {
  return INTENT_STYLES[intent] || "bg-slate-500/20 text-slate-400 border-slate-500/30"
}

/**
 * Calculate gap statistics from keyword data
 */
export function calculateGapStats(keywords: GapKeyword[]): GapStats {
  return {
    missing: keywords.filter((k) => k.gapType === "missing").length,
    weak: keywords.filter((k) => k.gapType === "weak").length,
    strong: keywords.filter((k) => k.gapType === "strong").length,
    shared: keywords.filter((k) => k.gapType === "shared").length,
  }
}

/**
 * Export keywords to CSV format
 */
export function exportKeywordsToCSV(
  keywords: GapKeyword[],
  gapType: string
): void {
  const headers = [
    "Keyword",
    "Competitor Rank",
    "Your Rank",
    "Volume",
    "KD",
    "Intent",
    "Gap Type",
    "Competitor URL",
  ]
  
  const csvRows = [headers.join(",")]

  keywords.forEach((kw) => {
    const row = [
      `"${kw.keyword}"`,
      kw.competitorRank ?? "N/A",
      kw.yourRank ?? "Not Ranking",
      kw.volume,
      kw.kd,
      kw.intent,
      kw.gapType,
      `"${kw.competitorUrl}"`,
    ]
    csvRows.push(row.join(","))
  })

  const csvContent = csvRows.join("\n")
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = `competitor-gap-${gapType}-keywords.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Filter keywords based on criteria
 */
export function filterKeywords(
  keywords: GapKeyword[],
  options: {
    gapType: string
    showComp1: boolean
    showComp2: boolean
    hasCompetitor2: boolean
    volumeRange: [number, number]
    kdRange: [number, number]
    activeQuickFilters: string[]
    searchQuery: string
  }
): GapKeyword[] {
  return keywords.filter((kw) => {
    // 1. Filter by Gap Type
    if (kw.gapType !== options.gapType) return false

    // 2. Filter by Competitor Source (if 2 competitors)
    if (options.hasCompetitor2) {
      if (!options.showComp1 && !options.showComp2) return false
      if (!options.showComp1 && kw.source === "comp1") return false
      if (!options.showComp2 && kw.source === "comp2") return false
    }

    // 3. Filter by Volume Range
    if (kw.volume < options.volumeRange[0] || kw.volume > options.volumeRange[1])
      return false

    // 4. Filter by KD Range
    if (kw.kd < options.kdRange[0] || kw.kd > options.kdRange[1]) return false

    // 5. Apply Quick Filters (if any active)
    if (options.activeQuickFilters.length > 0) {
      const passesQuickFilters = options.activeQuickFilters.every((filterId) => {
        const quickFilter = QUICK_FILTERS.find((f) => f.id === filterId)
        return quickFilter ? quickFilter.filter(kw) : true
      })
      if (!passesQuickFilters) return false
    }

    // 6. Search query
    if (options.searchQuery.trim()) {
      if (!kw.keyword.toLowerCase().includes(options.searchQuery.toLowerCase()))
        return false
    }

    return true
  })
}

/**
 * Sort keywords by field
 */
export function sortKeywords(
  keywords: GapKeyword[],
  sortField: "volume" | "kd" | "competitorRank" | "yourRank" | null,
  sortDirection: "asc" | "desc"
): GapKeyword[] {
  if (!sortField) return keywords

  return [...keywords].sort((a, b) => {
    let comparison = 0

    switch (sortField) {
      case "volume":
        comparison = a.volume - b.volume
        break
      case "kd":
        comparison = a.kd - b.kd
        break
      case "competitorRank":
        // Handle nulls - push to end
        const aRank = a.competitorRank ?? 999
        const bRank = b.competitorRank ?? 999
        comparison = aRank - bRank
        break
      case "yourRank":
        // Handle nulls - push to end
        const aYourRank = a.yourRank ?? 999
        const bYourRank = b.yourRank ?? 999
        comparison = aYourRank - bYourRank
        break
    }

    return sortDirection === "asc" ? comparison : -comparison
  })
}
