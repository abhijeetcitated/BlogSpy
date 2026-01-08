// ============================================
// KEYWORD RESEARCH - Mock Helpers
// ============================================
// Filter/sort helpers used ONLY for mock-mode simulation.
// Real API data filtering happens client-side.
// ============================================

import type { KeywordResearchRequest } from "../types/api.types"
import type { Keyword } from "../types"

// ============================================
// FILTER & SORT HELPERS (MOCK MODE ONLY)
// ============================================

export function filterMockData(
  keywords: Keyword[],
  request: KeywordResearchRequest
): Keyword[] {
  let result = [...keywords]

  // Filter by search text and match type
  if (request.seedKeyword) {
    const search = request.seedKeyword.toLowerCase()
    result = result.filter((k) => {
      const text = k.keyword.toLowerCase()
      switch (request.matchType) {
        case "exact":
          return text === search
        case "phrase":
          return text.includes(search)
        case "questions": {
          const qWords = ["how", "what", "why", "when", "where", "which", "who"]
          return qWords.some((q) => text.startsWith(q)) && text.includes(search)
        }
        case "related":
        case "broad":
        default:
          return search.split(" ").some((w) => text.includes(w))
      }
    })
  }

  // Volume filter
  if (request.filters.volumeMin !== undefined) {
    result = result.filter((k) => k.volume >= request.filters.volumeMin!)
  }
  if (request.filters.volumeMax !== undefined) {
    result = result.filter((k) => k.volume <= request.filters.volumeMax!)
  }

  // KD filter
  if (request.filters.kdMin !== undefined) {
    result = result.filter((k) => k.kd >= request.filters.kdMin!)
  }
  if (request.filters.kdMax !== undefined) {
    result = result.filter((k) => k.kd <= request.filters.kdMax!)
  }

  // CPC filter
  if (request.filters.cpcMin !== undefined) {
    result = result.filter((k) => k.cpc >= request.filters.cpcMin!)
  }
  if (request.filters.cpcMax !== undefined) {
    result = result.filter((k) => k.cpc <= request.filters.cpcMax!)
  }

  // Intent filter
  if (request.filters.intents && request.filters.intents.length > 0) {
    result = result.filter((k) =>
      k.intent.some((i) => request.filters.intents!.includes(i))
    )
  }

  // Include terms
  if (request.filters.includeTerms && request.filters.includeTerms.length > 0) {
    result = result.filter((k) =>
      request.filters.includeTerms!.every((t) =>
        k.keyword.toLowerCase().includes(t.toLowerCase())
      )
    )
  }

  // Exclude terms
  if (request.filters.excludeTerms && request.filters.excludeTerms.length > 0) {
    result = result.filter((k) =>
      !request.filters.excludeTerms!.some((t) =>
        k.keyword.toLowerCase().includes(t.toLowerCase())
      )
    )
  }

  // Weak spot filter - now uses weakSpots object with reddit/quora/pinterest
  if (request.filters.hasWeakSpot) {
    result = result.filter((k) =>
      k.weakSpots && (
        k.weakSpots.reddit !== null ||
        k.weakSpots.quora !== null ||
        k.weakSpots.pinterest !== null
      )
    )
  }

  return result
}

export function sortMockData(
  keywords: Keyword[],
  sortBy: string,
  sortOrder: "asc" | "desc"
): Keyword[] {
  const sorted = [...keywords].sort((a, b) => {
    let comparison = 0

    switch (sortBy) {
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
      case "trend": {
        const aTrend = a.trend[a.trend.length - 1] - a.trend[0]
        const bTrend = b.trend[b.trend.length - 1] - b.trend[0]
        comparison = aTrend - bTrend
        break
      }
      case "geoScore":
        comparison = (a.geoScore ?? 50) - (b.geoScore ?? 50)
        break
      default:
        comparison = 0
    }

    return sortOrder === "asc" ? comparison : -comparison
  })

  return sorted
}
