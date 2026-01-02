// ============================================
// KEYWORD MAGIC - Sort Utilities
// ============================================

import type { Keyword, SortField, SortDirection } from "../types"

/**
 * Sort keywords by field
 */
export function sortKeywords(
  keywords: Keyword[],
  field: SortField,
  direction: SortDirection
): Keyword[] {
  if (!field) return keywords
  
  return [...keywords].sort((a, b) => {
    let comparison = 0

    switch (field) {
      case "keyword":
        comparison = a.keyword.localeCompare(b.keyword)
        break
      case "volume":
        comparison = a.volume - b.volume
        break
      case "kd":
        comparison = a.kd - b.kd
        break
      case "cpc":
        comparison = a.cpc - b.cpc
        break
      case "trend":
        // Calculate trend growth from trend array
        const aTrendGrowth = a.trend?.length > 1 ? ((a.trend[a.trend.length - 1] - a.trend[0]) / a.trend[0]) : 0
        const bTrendGrowth = b.trend?.length > 1 ? ((b.trend[b.trend.length - 1] - b.trend[0]) / b.trend[0]) : 0
        comparison = aTrendGrowth - bTrendGrowth
        break
      case "intent":
        // Sort by first intent
        comparison = (a.intent[0] || "").localeCompare(b.intent[0] || "")
        break
      default:
        comparison = 0
    }

    return direction === "asc" ? comparison : -comparison
  })
}

/**
 * Multi-field sort for complex sorting needs
 */
export function multiSort(
  keywords: Keyword[],
  sortConfig: Array<{ field: SortField; direction: SortDirection }>
): Keyword[] {
  return [...keywords].sort((a, b) => {
    for (const { field, direction } of sortConfig) {
      if (!field) continue
      const sorted = sortKeywords([a, b], field, direction)
      if (sorted[0] !== a) return direction === "asc" ? 1 : -1
      if (sorted[0] !== b) return direction === "asc" ? -1 : 1
    }
    return 0
  })
}

/**
 * Get next sort direction
 */
export function getNextSortDirection(
  currentField: SortField | null,
  currentDirection: SortDirection,
  newField: SortField
): SortDirection {
  if (currentField !== newField) return "desc"
  return currentDirection === "desc" ? "asc" : "desc"
}

/**
 * Sort direction icon
 */
export function getSortIcon(
  field: SortField,
  currentField: SortField | null,
  currentDirection: SortDirection
): "asc" | "desc" | null {
  if (currentField !== field) return null
  return currentDirection
}
