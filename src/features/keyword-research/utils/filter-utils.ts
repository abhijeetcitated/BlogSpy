// ============================================
// KEYWORD MAGIC - Filter Utilities
// ============================================

import type { Keyword, MatchType, Country, SERPFeature } from "../types"

/**
 * Filter keywords based on search text and match type
 */
export function filterBySearchText(
  keywords: Keyword[],
  filterText: string,
  matchType: MatchType
): Keyword[] {
  if (!filterText.trim()) return keywords

  const searchTerm = filterText.toLowerCase()

  return keywords.filter((keyword) => {
    const keywordText = keyword.keyword.toLowerCase()

    switch (matchType) {
      case "exact":
        return keywordText === searchTerm
      case "phrase":
        return keywordText.includes(searchTerm)
      case "questions":
        const questionWords = ["how", "what", "why", "when", "where", "which", "who", "can", "does", "is"]
        const startsWithQuestion = questionWords.some((q) => keywordText.startsWith(q))
        return startsWithQuestion && keywordText.includes(searchTerm)
      case "related":
        const searchWords = searchTerm.split(" ")
        return searchWords.some((word) => keywordText.includes(word))
      case "broad":
      default:
        const words = searchTerm.split(" ")
        return words.some((word) => keywordText.includes(word))
    }
  })
}

/**
 * Filter keywords by volume range
 */
export function filterByVolume(
  keywords: Keyword[],
  volumeRange: [number, number]
): Keyword[] {
  if (volumeRange[0] === 0 && volumeRange[1] >= 500000) return keywords
  return keywords.filter(
    (k) => k.volume >= volumeRange[0] && k.volume <= volumeRange[1]
  )
}

/**
 * Filter keywords by KD range
 */
export function filterByKD(
  keywords: Keyword[],
  kdRange: [number, number]
): Keyword[] {
  if (kdRange[0] === 0 && kdRange[1] >= 100) return keywords
  return keywords.filter((k) => k.kd >= kdRange[0] && k.kd <= kdRange[1])
}

/**
 * Filter keywords by CPC range
 */
export function filterByCPC(
  keywords: Keyword[],
  cpcRange: [number, number]
): Keyword[] {
  if (cpcRange[0] === 0 && cpcRange[1] >= 50) return keywords
  return keywords.filter((k) => k.cpc >= cpcRange[0] && k.cpc <= cpcRange[1])
}

/**
 * Filter keywords by GEO score range
 */
export function filterByGeoScore(
  keywords: Keyword[],
  geoRange: [number, number]
): Keyword[] {
  if (geoRange[0] === 0 && geoRange[1] >= 100) return keywords
  return keywords.filter((k) => {
    const score = k.geoScore ?? 50 // Default to 50 if not set
    return score >= geoRange[0] && score <= geoRange[1]
  })
}

/**
 * Filter keywords by selected intents
 */
export function filterByIntent(
  keywords: Keyword[],
  selectedIntents: string[]
): Keyword[] {
  if (selectedIntents.length === 0) return keywords
  return keywords.filter((k) =>
    k.intent.some((i) => selectedIntents.includes(i))
  )
}

/**
 * Filter keywords by weak spot (has Reddit/Quora ranking)
 */
export function filterByWeakSpot(
  keywords: Keyword[],
  hasWeakSpot: boolean | null,
  weakSpotTypes: string[]
): Keyword[] {
  // null = show all
  if (hasWeakSpot === null) return keywords
  
  if (hasWeakSpot === false) {
    // Show only keywords WITHOUT weak spots
    return keywords.filter((k) => k.weakSpot.type === null)
  }
  
  // Show only keywords WITH weak spots
  if (weakSpotTypes.length === 0) {
    // Any weak spot type
    return keywords.filter((k) => k.weakSpot.type !== null)
  }
  
  // Specific weak spot types
  return keywords.filter((k) => 
    k.weakSpot.type !== null && weakSpotTypes.includes(k.weakSpot.type)
  )
}

/**
 * Filter keywords by SERP features
 */
export function filterBySerpFeatures(
  keywords: Keyword[],
  selectedFeatures: SERPFeature[]
): Keyword[] {
  if (selectedFeatures.length === 0) return keywords
  return keywords.filter((k) =>
    selectedFeatures.some((feature) => k.serpFeatures.includes(feature))
  )
}

/**
 * Filter keywords by trend direction
 */
export function filterByTrend(
  keywords: Keyword[],
  trendDirection: "up" | "down" | "stable" | null,
  minGrowth: number | null
): Keyword[] {
  if (trendDirection === null) return keywords

  return keywords.filter((k) => {
    if (k.trend.length < 2) return trendDirection === "stable"
    
    const first = k.trend[0]
    const last = k.trend[k.trend.length - 1]
    const growthPercent = first > 0 ? ((last - first) / first) * 100 : 0

    switch (trendDirection) {
      case "up":
        if (growthPercent <= 5) return false // Must be growing
        if (minGrowth !== null && growthPercent < minGrowth) return false
        return true
      case "down":
        return growthPercent < -5 // Declining
      case "stable":
        return growthPercent >= -5 && growthPercent <= 5
      default:
        return true
    }
  })
}

/**
 * Filter keywords by include terms (must contain ALL)
 */
export function filterByIncludeTerms(
  keywords: Keyword[],
  includeTerms: string[]
): Keyword[] {
  if (includeTerms.length === 0) return keywords
  return keywords.filter((k) => {
    const keywordLower = k.keyword.toLowerCase()
    return includeTerms.every((term) => keywordLower.includes(term.toLowerCase()))
  })
}

/**
 * Filter keywords by exclude terms (must NOT contain ANY)
 */
export function filterByExcludeTerms(
  keywords: Keyword[],
  excludeTerms: string[]
): Keyword[] {
  if (excludeTerms.length === 0) return keywords
  return keywords.filter((k) => {
    const keywordLower = k.keyword.toLowerCase()
    return !excludeTerms.some((term) => keywordLower.includes(term.toLowerCase()))
  })
}

/**
 * Extended filter options interface
 */
export interface FilterOptions {
  filterText: string
  matchType: MatchType
  volumeRange: [number, number]
  kdRange: [number, number]
  cpcRange: [number, number]
  geoRange: [number, number]
  selectedIntents: string[]
  includeTerms: string[]
  excludeTerms: string[]
  // New advanced filters
  hasWeakSpot: boolean | null
  weakSpotTypes: string[]
  selectedSerpFeatures: SERPFeature[]
  trendDirection: "up" | "down" | "stable" | null
  minTrendGrowth: number | null
}

/**
 * Apply all filters to keywords
 */
export function applyAllFilters(
  keywords: Keyword[],
  options: Partial<FilterOptions> & {
    filterText: string
    matchType: MatchType
    volumeRange: [number, number]
    kdRange: [number, number]
    cpcRange: [number, number]
    selectedIntents: string[]
    includeTerms: string[]
    excludeTerms: string[]
  }
): Keyword[] {
  let result = keywords

  // Basic text search
  result = filterBySearchText(result, options.filterText, options.matchType)
  
  // Range filters
  result = filterByVolume(result, options.volumeRange)
  result = filterByKD(result, options.kdRange)
  result = filterByCPC(result, options.cpcRange)
  
  // GEO Score filter (optional)
  if (options.geoRange) {
    result = filterByGeoScore(result, options.geoRange)
  }
  
  // Intent filter
  result = filterByIntent(result, options.selectedIntents)
  
  // Weak spot filter (optional)
  if (options.hasWeakSpot !== undefined) {
    result = filterByWeakSpot(result, options.hasWeakSpot, options.weakSpotTypes || [])
  }
  
  // SERP features filter (optional)
  if (options.selectedSerpFeatures && options.selectedSerpFeatures.length > 0) {
    result = filterBySerpFeatures(result, options.selectedSerpFeatures)
  }
  
  // Trend filter (optional)
  if (options.trendDirection !== undefined) {
    result = filterByTrend(result, options.trendDirection, options.minTrendGrowth || null)
  }
  
  // Include/Exclude terms
  result = filterByIncludeTerms(result, options.includeTerms)
  result = filterByExcludeTerms(result, options.excludeTerms)

  return result
}

/**
 * Filter countries by search query
 */
export function filterCountries(countries: Country[], search: string): Country[] {
  if (!search.trim()) return countries
  const query = search.toLowerCase()
  return countries.filter(
    (c) =>
      c.name.toLowerCase().includes(query) ||
      c.code.toLowerCase().includes(query)
  )
}

/**
 * Parse bulk keywords input
 */
export function parseBulkKeywords(input: string): string[] {
  return input
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
}

/**
 * Format volume number for display
 */
export function formatVolume(volume: number): string {
  if (volume >= 1000000) return `${(volume / 1000000).toFixed(1)}M`
  if (volume >= 1000) return `${(volume / 1000).toFixed(1)}K`
  return volume.toString()
}

/**
 * Format CPC for display
 */
export function formatCPC(cpc: number): string {
  return `$${cpc.toFixed(2)}`
}

