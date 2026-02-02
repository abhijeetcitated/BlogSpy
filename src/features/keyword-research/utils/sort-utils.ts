// ============================================
// KEYWORD MAGIC - Sort Utilities
// ============================================

import type { Keyword, SortField, SortDirection } from "../types"

const INTENT_PRIORITY: Record<"T" | "C" | "I" | "N", number> = {
  // Higher number = higher priority so DESC matches T > C > I > N
  T: 4,
  C: 3,
  I: 2,
  N: 1,
}

export function getNumericSortValue(
  value: number | null | undefined
): number | undefined {
  if (value === null || value === undefined) return undefined
  if (Number.isNaN(value) || value === 0) return undefined
  return value
}

export function getIntentSortValue(
  intent: Keyword["intent"] | null | undefined
): number | undefined {
  if (!intent || intent.length === 0) return undefined

  let best = Number.NEGATIVE_INFINITY
  for (const code of intent) {
    const priority = INTENT_PRIORITY[code] ?? Number.NEGATIVE_INFINITY
    if (priority > best) best = priority
  }

  return Number.isFinite(best) ? best : undefined
}

export function getWeakSpotSortValue(
  weakSpots: Keyword["weakSpots"] | null | undefined
): number | undefined {
  const ranked = weakSpots?.ranked
  if (ranked && ranked.length > 0) {
    const uniquePlatforms = new Set(ranked.map((entry) => entry.platform))
    return uniquePlatforms.size > 0 ? uniquePlatforms.size : undefined
  }

  const legacyCount = [
    weakSpots?.reddit,
    weakSpots?.quora,
    weakSpots?.pinterest,
  ].filter((value) => typeof value === "number" && value !== null).length

  return legacyCount > 0 ? legacyCount : undefined
}

function compareNullableNumbers(
  aValue: number | null | undefined,
  bValue: number | null | undefined,
  direction: SortDirection
): number {
  const aNumber = getNumericSortValue(aValue)
  const bNumber = getNumericSortValue(bValue)
  const aMissing = aNumber === undefined
  const bMissing = bNumber === undefined

  if (aMissing && bMissing) return 0
  if (aMissing) return 1
  if (bMissing) return -1

  const diff = aNumber - bNumber
  return direction === "asc" ? diff : -diff
}

/**
 * Sort keywords by field
 */
export function sortKeywords(
  keywords: Keyword[],
  field: SortField,
  direction: SortDirection
): Keyword[] {
  if (!field) return keywords

  const numericValue = (keyword: Keyword): number | undefined => {
    switch (field) {
      case "volume":
        return getNumericSortValue(keyword.volume)
      case "kd":
        return getNumericSortValue(keyword.kd)
      case "cpc":
        return getNumericSortValue(keyword.cpc)
      case "rtv":
        return getNumericSortValue(keyword.rtv)
      case "geo":
      case "geoScore":
        return getNumericSortValue(keyword.geoScore)
      default:
        return undefined
    }
  }

  const trendValue = (keyword: Keyword): number => {
    if (!keyword.trend || keyword.trend.length < 2 || keyword.trend[0] <= 0) return 0
    return (keyword.trend[keyword.trend.length - 1] - keyword.trend[0]) / keyword.trend[0]
  }

  const sortValueCache = new Map<number, string | number | undefined>()
  const getSortValue = (keyword: Keyword): string | number | undefined => {
    const key = keyword.id
    if (sortValueCache.has(key)) return sortValueCache.get(key)

    let value: string | number | undefined
    switch (field) {
      case "keyword":
        value = keyword.keyword
        break
      case "intent":
        value = getIntentSortValue(keyword.intent)
        break
      case "trend":
        value = trendValue(keyword)
        break
      default:
        value = numericValue(keyword)
        break
    }

    sortValueCache.set(key, value)
    return value
  }

  return [...keywords].sort((a, b) => {
    if (field === "keyword") {
      const aValue = String(getSortValue(a) ?? "")
      const bValue = String(getSortValue(b) ?? "")
      const comparison = aValue.localeCompare(bValue)
      return direction === "asc" ? comparison : -comparison
    }

    if (field === "intent") {
      return compareNullableNumbers(
        getSortValue(a) as number | undefined,
        getSortValue(b) as number | undefined,
        direction
      )
    }

    if (field === "trend") {
      const comparison = (getSortValue(a) as number) - (getSortValue(b) as number)
      return direction === "asc" ? comparison : -comparison
    }

    return compareNullableNumbers(
      getSortValue(a) as number | undefined,
      getSortValue(b) as number | undefined,
      direction
    )
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
