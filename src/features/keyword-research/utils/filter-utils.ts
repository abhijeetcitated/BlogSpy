// ============================================
// 🔍 KEYWORD EXPLORER - FILTER UTILITIES
// ============================================
// Production-Ready Filtering Engine
// Handles DataForSEO Labs (Bulk) + SERP API (Live)
// Author: Senior Algorithm Engineer
// Performance: O(n) single pass where possible
// ============================================

import type { Keyword, MatchType, Country, SERPFeature } from "../types"

// ============================================
// TYPE DEFINITIONS
// ============================================

/**
 * Complete filter state interface
 * Compatible with Zustand store
 */
export interface FilterState {
  // Text search
  searchText: string
  matchType: MatchType
  
  // Range filters (all use [min, max] tuple)
  volumeRange: [number, number]
  kdRange: [number, number]
  cpcRange: [number, number]
  geoRange: [number, number]
  
  // Multi-select filters
  selectedIntents: string[]
  selectedSerpFeatures: SERPFeature[]
  
  // Include/Exclude terms (comma-separated → array)
  includeTerms: string[]
  excludeTerms: string[]
  
  // Weak Spot filter
  weakSpotToggle: "all" | "with" | "without"
  weakSpotTypes: string[] // ['reddit', 'quora', 'medium']
  
  // Trend filter
  trendDirection: "up" | "down" | "stable" | null
  minTrendGrowth: number | null
  
  // AIO filter (AI Overview presence)
  onlyAIO?: boolean
}

/**
 * Legacy filter options (backward compatibility)
 */
export interface FilterOptions extends Partial<FilterState> {
  filterText: string
  matchType: MatchType
  hasWeakSpot?: boolean | null
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Safe number getter - handles null/undefined from API
 * @param value - Raw value from API
 * @param fallback - Default value if null/undefined
 */
function safeNumber(value: number | null | undefined, fallback: number = 0): number {
  if (value === null || value === undefined || isNaN(value)) {
    return fallback
  }
  return value
}

/**
 * Normalize string for case-insensitive comparison
 * Uses simple toLowerCase for performance (faster than regex)
 */
function normalize(str: string): string {
  return str.toLowerCase().trim()
}

/**
 * Check if value is within range (inclusive)
 * Handles null/undefined gracefully
 */
function isInRange(
  value: number | null | undefined,
  min: number,
  max: number,
  fallback: number = 0
): boolean {
  const safeValue = safeNumber(value, fallback)
  return safeValue >= min && safeValue <= max
}

// ============================================
// INDIVIDUAL FILTER FUNCTIONS
// ============================================

/**
 * 🔤 Filter by search text and match type
 * 
 * Match Types:
 * - broad: ANY word matches (OR logic)
 * - phrase: Exact phrase must be present
 * - exact: Keyword must equal search term exactly
 * - related: ANY word matches (semantic - same as broad for now)
 * - questions: Must start with question word + contain search term
 */
export function filterBySearchText(
  keywords: Keyword[],
  filterText: string,
  matchType: MatchType
): Keyword[] {
  const searchTerm = normalize(filterText)
  
  // Early exit: empty search = show all
  if (!searchTerm) return keywords

  // Pre-compute search words for broad/related (avoid recomputing per keyword)
  const searchWords = searchTerm.split(/\s+/).filter(w => w.length > 0)
  
  // Question words for questions filter
  const QUESTION_WORDS = ["how", "what", "why", "when", "where", "which", "who", "can", "does", "is", "are", "will", "should"]

  return keywords.filter((keyword) => {
    const keywordText = normalize(keyword.keyword)

    switch (matchType) {
      case "exact":
        // Must be exactly equal
        return keywordText === searchTerm

      case "phrase":
        // Must contain the exact phrase
        return keywordText.includes(searchTerm)

      case "questions":
        // Must start with question word AND contain search term
        const startsWithQuestion = QUESTION_WORDS.some(q => keywordText.startsWith(q))
        return startsWithQuestion && keywordText.includes(searchTerm)

      case "related":
      case "broad":
      default:
        // ANY word from search must match (OR logic)
        return searchWords.some(word => keywordText.includes(word))
    }
  })
}

/**
 * 📊 Filter by Volume Range
 * 
 * Logic: volume >= min AND volume <= max
 * Edge Case: null/undefined → treat as 0
 */
export function filterByVolume(
  keywords: Keyword[],
  volumeRange: [number, number]
): Keyword[] {
  const [min, max] = volumeRange
  
  // Optimization: if full range, skip filtering
  if (min <= 0 && max >= 10000000) return keywords

  return keywords.filter(k => isInRange(k.volume, min, max, 0))
}

/**
 * 🎯 Filter by Keyword Difficulty Range
 * 
 * Logic: kd >= min AND kd <= max
 * Range: 0-100
 * Edge Case: null/undefined → treat as 0
 */
export function filterByKD(
  keywords: Keyword[],
  kdRange: [number, number]
): Keyword[] {
  const [min, max] = kdRange
  
  // Optimization: if full range (0-100), skip filtering
  if (min <= 0 && max >= 100) return keywords

  return keywords.filter(k => isInRange(k.kd, min, max, 0))
}

/**
 * 💰 Filter by CPC Range
 * 
 * Logic: cpc >= min AND cpc <= max
 * Edge Case: null/undefined → treat as 0
 */
export function filterByCPC(
  keywords: Keyword[],
  cpcRange: [number, number]
): Keyword[] {
  const [min, max] = cpcRange
  
  // Optimization: if full range, skip filtering
  if (min <= 0 && max >= 100) return keywords

  return keywords.filter(k => isInRange(k.cpc, min, max, 0))
}

/**
 * 🌍 Filter by GEO Score Range
 * 
 * Logic: geoScore >= min AND geoScore <= max
 * Range: 0-100
 * Edge Case: null/undefined → default to 50 (neutral)
 */
export function filterByGeoScore(
  keywords: Keyword[],
  geoRange: [number, number]
): Keyword[] {
  const [min, max] = geoRange
  
  // Optimization: if full range (0-100), skip filtering
  if (min <= 0 && max >= 100) return keywords

  return keywords.filter(k => {
    const score = safeNumber(k.geoScore, 50) // Default 50 = neutral
    return score >= min && score <= max
  })
}

/**
 * 🎭 Filter by Search Intent (Multi-Select)
 * 
 * Logic: 
 * - Empty array = show ALL (no filter)
 * - Non-empty = show only keywords with matching intent
 * - Case-insensitive comparison
 * 
 * Intent Types: I (Informational), C (Commercial), T (Transactional), N (Navigational)
 */
export function filterByIntent(
  keywords: Keyword[],
  selectedIntents: string[]
): Keyword[] {
  // Empty = show all
  if (!selectedIntents || selectedIntents.length === 0) return keywords

  // Normalize selected intents for case-insensitive matching
  const normalizedIntents = selectedIntents.map(i => normalize(i))

  return keywords.filter(k => {
    // Keyword can have multiple intents, check if ANY matches
    if (!k.intent || k.intent.length === 0) return false
    
    return k.intent.some(intent => {
      const normalizedIntent = normalize(intent)
      return normalizedIntents.includes(normalizedIntent)
    })
  })
}

/**
 * 🎯 Filter by Weak Spot (USP Feature)
 * 
 * Weak Spot = Reddit/Quora/Medium ranking in top results
 * This indicates easier ranking opportunity
 * 
 * Logic:
 * - "all" = show everything
 * - "with" = show only keywords WITH weak spots
 * - "without" = show only keywords WITHOUT weak spots
 */
export function filterByWeakSpot(
  keywords: Keyword[],
  toggle: "all" | "with" | "without" | boolean | null,
  weakSpotTypes: string[] = []
): Keyword[] {
  // Handle legacy boolean/null values
  let normalizedToggle: "all" | "with" | "without"
  if (toggle === null || toggle === "all") {
    normalizedToggle = "all"
  } else if (toggle === true || toggle === "with") {
    normalizedToggle = "with"
  } else if (toggle === false || toggle === "without") {
    normalizedToggle = "without"
  } else {
    normalizedToggle = "all"
  }

  // "all" = no filtering
  if (normalizedToggle === "all") return keywords

  return keywords.filter(k => {
    const hasWeakSpot = k.weakSpot && k.weakSpot.type !== null

    if (normalizedToggle === "without") {
      // Show only keywords WITHOUT weak spots
      return !hasWeakSpot
    }

    if (normalizedToggle === "with") {
      // Show only keywords WITH weak spots
      if (!hasWeakSpot) return false
      
      // If specific types selected, filter by type
      if (weakSpotTypes.length > 0) {
        return weakSpotTypes.some(type => 
          normalize(k.weakSpot.type || "") === normalize(type)
        )
      }
      
      // Any weak spot type
      return true
    }

    return true
  })
}

/**
 * 🔍 Filter by SERP Features
 * 
 * Logic: Show keywords that have ANY of the selected SERP features
 * Empty selection = show all
 */
export function filterBySerpFeatures(
  keywords: Keyword[],
  selectedFeatures: SERPFeature[]
): Keyword[] {
  if (!selectedFeatures || selectedFeatures.length === 0) return keywords

  return keywords.filter(k => {
    if (!k.serpFeatures || k.serpFeatures.length === 0) return false
    return selectedFeatures.some(feature => k.serpFeatures.includes(feature))
  })
}

/**
 * 📈 Filter by Trend Direction
 * 
 * Calculates growth % from first to last value in trend array
 * 
 * Logic:
 * - "up" = growth > 5%
 * - "down" = growth < -5%
 * - "stable" = growth between -5% and 5%
 * - null = no filtering
 */
export function filterByTrend(
  keywords: Keyword[],
  trendDirection: "up" | "down" | "stable" | null,
  minGrowth: number | null = null
): Keyword[] {
  if (trendDirection === null) return keywords

  return keywords.filter(k => {
    // Handle missing or insufficient trend data
    if (!k.trend || k.trend.length < 2) {
      return trendDirection === "stable" // No data = stable
    }

    const first = safeNumber(k.trend[0], 0)
    const last = safeNumber(k.trend[k.trend.length - 1], 0)
    
    // Calculate growth percentage (avoid division by zero)
    const growthPercent = first > 0 ? ((last - first) / first) * 100 : 0

    switch (trendDirection) {
      case "up":
        // Must be growing (> 5%)
        if (growthPercent <= 5) return false
        // Optional: minimum growth threshold
        if (minGrowth !== null && growthPercent < minGrowth) return false
        return true

      case "down":
        // Must be declining (< -5%)
        return growthPercent < -5

      case "stable":
        // Between -5% and 5%
        return growthPercent >= -5 && growthPercent <= 5

      default:
        return true
    }
  })
}

/**
 * ✅ Filter by Include Terms (AND Logic)
 * 
 * Keyword MUST contain ALL terms
 * Terms are comma or space separated
 * Case-insensitive matching
 * 
 * Example: "best, tool" → keyword must contain "best" AND "tool"
 */
export function filterByIncludeTerms(
  keywords: Keyword[],
  includeTerms: string[]
): Keyword[] {
  // Empty = show all
  if (!includeTerms || includeTerms.length === 0) return keywords

  // Pre-normalize terms
  const normalizedTerms = includeTerms
    .map(t => normalize(t))
    .filter(t => t.length > 0)

  if (normalizedTerms.length === 0) return keywords

  return keywords.filter(k => {
    const keywordText = normalize(k.keyword)
    // AND logic: ALL terms must be present
    return normalizedTerms.every(term => keywordText.includes(term))
  })
}

/**
 * ❌ Filter by Exclude Terms (OR Logic)
 * 
 * Remove keyword if it contains ANY of the terms
 * Terms are comma or space separated
 * Case-insensitive matching
 * 
 * Example: "free, cheap" → remove if contains "free" OR "cheap"
 */
export function filterByExcludeTerms(
  keywords: Keyword[],
  excludeTerms: string[]
): Keyword[] {
  // Empty = show all
  if (!excludeTerms || excludeTerms.length === 0) return keywords

  // Pre-normalize terms
  const normalizedTerms = excludeTerms
    .map(t => normalize(t))
    .filter(t => t.length > 0)

  if (normalizedTerms.length === 0) return keywords

  return keywords.filter(k => {
    const keywordText = normalize(k.keyword)
    // OR logic: if ANY term matches, exclude the keyword
    return !normalizedTerms.some(term => keywordText.includes(term))
  })
}

/**
 * 🤖 Filter by AIO (AI Overview) Presence
 * 
 * Shows only keywords that trigger AI Overview in SERP
 * This is a premium insight for SEO
 */
export function filterByAIO(
  keywords: Keyword[],
  onlyAIO: boolean
): Keyword[] {
  if (!onlyAIO) return keywords

  return keywords.filter(k => {
    // Check if keyword has AIO/AI Overview
    // Field can be: has_aio, hasAIO, or check serpFeatures
    const hasAIO = (k as Keyword & { has_aio?: boolean; hasAIO?: boolean }).has_aio 
      || (k as Keyword & { hasAIO?: boolean }).hasAIO
      || k.serpFeatures?.includes("snippet" as SERPFeature)
    
    return hasAIO === true
  })
}

// ============================================
// MAIN FILTER FUNCTION (Zustand Compatible)
// ============================================

/**
 * 🚀 Apply All Filters (Single Pass Optimized)
 * 
 * This is the main export used by Zustand store
 * Applies all filters in optimal order (fastest eliminations first)
 * 
 * @param keywords - Raw keywords from API/mock
 * @param filters - Filter state from Zustand store
 * @returns Filtered keywords array
 */
export function applyFilters(
  keywords: Keyword[],
  filters: Partial<FilterState>
): Keyword[] {
  // Guard: empty input
  if (!keywords || keywords.length === 0) return []

  let result = keywords

  // ────────────────────────────────────────
  // PHASE 1: Quick eliminations (cheap checks first)
  // ────────────────────────────────────────

  // 1. Volume range (fastest numeric check)
  if (filters.volumeRange) {
    result = filterByVolume(result, filters.volumeRange)
  }

  // 2. KD range
  if (filters.kdRange) {
    result = filterByKD(result, filters.kdRange)
  }

  // 3. CPC range
  if (filters.cpcRange) {
    result = filterByCPC(result, filters.cpcRange)
  }

  // 4. GEO Score range
  if (filters.geoRange) {
    result = filterByGeoScore(result, filters.geoRange)
  }

  // ────────────────────────────────────────
  // PHASE 2: Categorical filters
  // ────────────────────────────────────────

  // 5. Intent filter
  if (filters.selectedIntents && filters.selectedIntents.length > 0) {
    result = filterByIntent(result, filters.selectedIntents)
  }

  // 6. Weak Spot filter
  if (filters.weakSpotToggle && filters.weakSpotToggle !== "all") {
    result = filterByWeakSpot(result, filters.weakSpotToggle, filters.weakSpotTypes || [])
  }

  // 7. SERP Features filter
  if (filters.selectedSerpFeatures && filters.selectedSerpFeatures.length > 0) {
    result = filterBySerpFeatures(result, filters.selectedSerpFeatures)
  }

  // 8. Trend filter
  if (filters.trendDirection !== undefined && filters.trendDirection !== null) {
    result = filterByTrend(result, filters.trendDirection, filters.minTrendGrowth || null)
  }

  // 9. AIO filter
  if (filters.onlyAIO) {
    result = filterByAIO(result, filters.onlyAIO)
  }

  // ────────────────────────────────────────
  // PHASE 3: Text-based filters (most expensive)
  // ────────────────────────────────────────

  // 10. Include terms (AND logic)
  if (filters.includeTerms && filters.includeTerms.length > 0) {
    result = filterByIncludeTerms(result, filters.includeTerms)
  }

  // 11. Exclude terms (OR logic)
  if (filters.excludeTerms && filters.excludeTerms.length > 0) {
    result = filterByExcludeTerms(result, filters.excludeTerms)
  }

  // 12. Search text (match type based)
  if (filters.searchText && filters.matchType) {
    result = filterBySearchText(result, filters.searchText, filters.matchType)
  }

  return result
}

/**
 * 🔄 Legacy compatibility wrapper
 * Maps old FilterOptions to new FilterState
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
  // Map legacy options to new FilterState
  const filters: Partial<FilterState> = {
    searchText: options.filterText,
    matchType: options.matchType,
    volumeRange: options.volumeRange,
    kdRange: options.kdRange,
    cpcRange: options.cpcRange,
    geoRange: options.geoRange,
    selectedIntents: options.selectedIntents,
    selectedSerpFeatures: options.selectedSerpFeatures,
    includeTerms: options.includeTerms,
    excludeTerms: options.excludeTerms,
    trendDirection: options.trendDirection,
    minTrendGrowth: options.minTrendGrowth,
    // Map legacy hasWeakSpot to new toggle
    weakSpotToggle: options.hasWeakSpot === true ? "with" 
      : options.hasWeakSpot === false ? "without" 
      : "all",
    weakSpotTypes: options.weakSpotTypes,
  }

  return applyFilters(keywords, filters)
}

// ============================================
// HELPER UTILITIES
// ============================================

/**
 * 🌍 Filter countries by search query
 */
export function filterCountries(countries: Country[], search: string): Country[] {
  if (!search.trim()) return countries
  
  const query = normalize(search)
  
  return countries.filter(c =>
    normalize(c.name).includes(query) ||
    normalize(c.code).includes(query)
  )
}

/**
 * 📝 Parse bulk keywords input
 * Handles newlines, commas, and mixed separators
 */
export function parseBulkKeywords(input: string): string[] {
  return input
    .split(/[\n,]/) // Split by newline or comma
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .filter((line, index, arr) => arr.indexOf(line) === index) // Dedupe
}

/**
 * 📊 Format volume number for display
 * 1,000 → 1K, 1,000,000 → 1M
 */
export function formatVolume(volume: number | null | undefined): string {
  const v = safeNumber(volume, 0)
  
  if (v >= 1000000) return `${(v / 1000000).toFixed(1)}M`
  if (v >= 1000) return `${(v / 1000).toFixed(1)}K`
  return v.toLocaleString()
}

/**
 * 💵 Format CPC for display
 */
export function formatCPC(cpc: number | null | undefined): string {
  const c = safeNumber(cpc, 0)
  return `$${c.toFixed(2)}`
}

/**
 * 🎯 Format KD for display with color hint
 */
export function formatKD(kd: number | null | undefined): { value: string; color: string } {
  const k = safeNumber(kd, 0)
  
  let color = "text-green-500"
  if (k >= 30) color = "text-yellow-500"
  if (k >= 50) color = "text-orange-500"
  if (k >= 70) color = "text-red-500"
  
  return { value: k.toString(), color }
}

/**
 * 📈 Calculate trend percentage
 */
export function calculateTrendPercent(trend: number[] | null | undefined): number {
  if (!trend || trend.length < 2) return 0
  
  const first = safeNumber(trend[0], 0)
  const last = safeNumber(trend[trend.length - 1], 0)
  
  if (first === 0) return 0
  return ((last - first) / first) * 100
}

/**
 * 📊 Get trend direction from data
 */
export function getTrendDirection(trend: number[] | null | undefined): "up" | "down" | "stable" {
  const percent = calculateTrendPercent(trend)
  
  if (percent > 5) return "up"
  if (percent < -5) return "down"
  return "stable"
}