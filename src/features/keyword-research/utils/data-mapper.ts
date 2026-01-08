// ============================================
// DATA MAPPER - Keyword Data Standardizer
// ============================================
// Transforms raw API responses into standardized Keyword format
// Handles both LABS (historical) and SERP (live) data sources
// ============================================

import type { Keyword, WeakSpots, SERPFeature } from "../types"
import { calculateGeoScore, countKeywordWords } from "./geo-calculator"
import { detectWeakSpots, detectSerpFeatures, type RawSerpItem } from "./serp-parser"
import { calculateRTV } from "./rtv-calculator"

/**
 * Data source type
 */
export type DataSource = "LABS" | "SERP"

/**
 * Raw keyword data from DataForSEO Labs API
 */
export interface RawLabsKeyword {
  keyword?: string
  keyword_data?: {
    keyword?: string
    search_volume?: number
    cpc?: number
    competition?: number
    competition_level?: string
    monthly_searches?: Array<{ search_volume: number }>
  }
  keyword_info?: {
    search_volume?: number
    cpc?: number
    competition?: number
    monthly_searches?: Array<{ search_volume: number }>
  }
  search_intent_info?: {
    main_intent?: string
    foreign_intent?: string[]
  }
  serp_info?: {
    serp_item_types?: string[]
    se_results_count?: number
  }
  avg_backlinks_info?: {
    se_results_count?: number
  }
  // Direct fields (some endpoints)
  search_volume?: number
  cpc?: number
  competition?: number
}

/**
 * Raw SERP response from DataForSEO
 */
export interface RawSerpResponse {
  keyword?: string
  items?: RawSerpItem[]
  items_count?: number
  se_results_count?: number
}

/**
 * Partial update from live SERP (preserves existing data)
 */
export interface LiveSerpUpdate {
  weakSpots: WeakSpots
  geoScore: number
  hasAio: boolean
  serpFeatures: SERPFeature[]
  rtv: number
  rtvBreakdown: Array<{ label: string; value: number }>
  lastUpdated: Date
}

/**
 * Map intent string to Keyword intent format
 */
function mapIntent(intent?: string): ("I" | "C" | "T" | "N")[] {
  if (!intent) return ["I"] // Default to informational
  
  const intentMap: Record<string, "I" | "C" | "T" | "N"> = {
    informational: "I",
    commercial: "C",
    transactional: "T",
    navigational: "N",
  }

  const mapped = intentMap[intent.toLowerCase()]
  return mapped ? [mapped] : ["I"]
}

/**
 * Map competition level to KD score (0-100)
 */
function mapCompetitionToKD(competition?: number, level?: string): number {
  // If we have a direct competition value (0-1), scale to 0-100
  if (typeof competition === "number") {
    return Math.round(competition * 100)
  }

  // Map text level to approximate KD
  const levelMap: Record<string, number> = {
    low: 25,
    medium: 50,
    high: 75,
  }

  return level ? (levelMap[level.toLowerCase()] ?? 50) : 50
}

/**
 * Extract trend data from monthly searches
 */
function extractTrend(monthlySearches?: Array<{ search_volume: number }>): number[] {
  if (!monthlySearches || !Array.isArray(monthlySearches)) {
    return [0, 0, 0, 0, 0, 0] // 6 months of zeros
  }

  // Take last 6 months, reverse to chronological order
  return monthlySearches
    .slice(0, 6)
    .map(m => m.search_volume ?? 0)
    .reverse()
}

/**
 * Map SERP item types to SERPFeature array
 */
function mapSerpTypes(types?: string[]): SERPFeature[] {
  if (!types || !Array.isArray(types)) return []

  const typeMap: Record<string, SERPFeature> = {
    featured_snippet: "snippet",
    video: "video",
    ai_overview: "ai_overview",
    people_also_ask: "faq",
    local_pack: "local",
    shopping: "shopping",
    top_stories: "news",
    images: "image",
    reviews: "reviews",
  }

  const features: SERPFeature[] = []
  for (const type of types) {
    const mapped = typeMap[type.toLowerCase()]
    if (mapped && !features.includes(mapped)) {
      features.push(mapped)
    }
  }

  return features
}

/**
 * Raw related keyword item (DataForSEO Labs `related_keywords/live`)
 *
 * This is the payload shape used by the Keyword Explorer.
 */
export interface RawRelatedKeywordItem {
  keyword?: string
  keyword_info?: {
    search_volume?: number
    cpc?: number
    competition?: number
    competition_level?: number | string
    monthly_searches?: Array<{ search_volume?: number }>
    search_intent?: unknown
  }
  serp_info?: {
    serp_item_types?: string[]
    serp_items?: RawSerpItem[]
  }
}

export type KeywordIntentCode = "I" | "C" | "T" | "N"

export function mapKeywordData(rawItem: RawLabsKeyword, source: DataSource, id?: number): Keyword
export function mapKeywordData(rawItem: RawRelatedKeywordItem, id?: number): Keyword

/**
 * Map raw DataForSEO items into our standardized [`Keyword`](src/features/keyword-research/types/index.ts:1) shape.
 *
 * Supports two calling conventions:
 * 1) Labs keyword item: `mapKeywordData(rawItem, "LABS", id)`
 * 2) Related-keywords item: `mapKeywordData(rawItem, id)`
 */
export function mapKeywordData(
  rawItem: RawLabsKeyword | RawRelatedKeywordItem,
  a?: DataSource | number,
  b?: number
): Keyword {
  // Convention detection.
  const source: DataSource | undefined = typeof a === "string" ? a : undefined
  const id: number | undefined = typeof a === "number" ? a : b

  // ---------------------------------------------------------------------------
  // RELATED KEYWORDS (keyword_info + serp_info)
  // ---------------------------------------------------------------------------
  if (!source) {
    const item = rawItem as RawRelatedKeywordItem

    const keyword = typeof item.keyword === "string" ? item.keyword : ""
    const info = item.keyword_info ?? {}
    const serp = item.serp_info ?? {}

    const volume = typeof info.search_volume === "number" ? info.search_volume : 0
    const cpc = typeof info.cpc === "number" ? info.cpc : 0

    const kd =
      typeof info.competition_level === "number" ? Math.round(info.competition_level * 100) :
      typeof info.competition === "number" ? Math.round(info.competition * 100) :
      50

    const intent = mapIntent(typeof info.search_intent === "string" ? info.search_intent : undefined)

    const trend = (info.monthly_searches ?? []).map((m) => (typeof m.search_volume === "number" ? m.search_volume : 0))

    const serpTypes = Array.isArray(serp.serp_item_types) ? serp.serp_item_types : []
    const serpItems = Array.isArray(serp.serp_items) ? serp.serp_items : []

    const detected = detectSerpFeatures(serpItems)

    const serpFeatures = dedupeFeatures([
      ...mapSerpTypes(serpTypes),
      ...detected.features,
    ])

    const hasAio = serpFeatures.includes("ai_overview") || detected.hasAIO
    const hasSnippet = serpFeatures.includes("snippet") || detected.hasSnippet

    const weakSpots = detectWeakSpots(serpItems)

    const geoScore = calculateGeoScore(hasAio, hasSnippet, intent, countKeywordWords(keyword))

    // Calculate RTV using raw SERP items
    const rtvResult = calculateRTV(volume, serpItems, cpc)

    return {
      id: id ?? Math.floor(Math.random() * 1000000),
      keyword,
      intent,
      volume,
      trend,
      weakSpots,
      kd,
      cpc,
      serpFeatures,
      rtv: rtvResult.rtv,
      rtvBreakdown: rtvResult.breakdown,
      geoScore,
      hasAio,
      lastUpdated: new Date(),
      dataSource: "dataforseo",
    }
  }

  // ---------------------------------------------------------------------------
  // LABS (existing behavior)
  // ---------------------------------------------------------------------------
  const labs = rawItem as RawLabsKeyword

  // Extract keyword info from nested structure
  const keywordData = labs.keyword_data ?? labs.keyword_info
  const keyword = labs.keyword ?? labs.keyword_data?.keyword ?? ""

  // Volume and CPC
  const volume = keywordData?.search_volume ?? labs.search_volume ?? 0
  const cpc = keywordData?.cpc ?? labs.cpc ?? 0

  // KD from competition
  const kd = mapCompetitionToKD(
    keywordData?.competition ?? labs.competition,
    (labs.keyword_data as { competition_level?: string })?.competition_level
  )

  // Intent
  const intent = mapIntent(labs.search_intent_info?.main_intent)

  // Trend data
  const trend = extractTrend(keywordData?.monthly_searches)

  // SERP features from Labs data
  const serpFeatures = mapSerpTypes(labs.serp_info?.serp_item_types)

  // Check for AI Overview in SERP types
  const hasAio = serpFeatures.includes("ai_overview") ||
    (labs.serp_info?.serp_item_types?.some(t => t.toLowerCase().includes("ai")) ?? false)

  // Check for snippet
  const hasSnippet = serpFeatures.includes("snippet")

  // Calculate GEO score
  const wordCount = countKeywordWords(keyword)
  const geoScore = calculateGeoScore(hasAio, hasSnippet, intent, wordCount)

  // Default weak spots (Labs doesn't provide this - needs Live SERP)
  const weakSpots: WeakSpots = {
    reddit: null,
    quora: null,
    pinterest: null,
  }

  // Calculate RTV (Labs has no SERP items, use empty array)
  const rtvResult = calculateRTV(volume, [], cpc)

  return {
    id: id ?? Math.floor(Math.random() * 1000000),
    keyword,
    intent,
    volume,
    trend,
    weakSpots,
    kd,
    cpc,
    serpFeatures,
    rtv: rtvResult.rtv,
    rtvBreakdown: rtvResult.breakdown,
    geoScore,
    hasAio,
    lastUpdated: new Date(),
    dataSource: "dataforseo",
  }
}

function dedupeFeatures(features: SERPFeature[]): SERPFeature[] {
  const out: SERPFeature[] = []
  for (const f of features) {
    if (!out.includes(f)) out.push(f)
  }
  return out
}

/**
 * Map live SERP response to update existing keyword data
 * Only returns fields that need updating - preserves Volume/CPC from Labs
 *
 * @param response - Raw SERP response from DataForSEO
 * @param existingKeyword - Existing keyword data (for intent reference)
 * @returns Partial update with WeakSpots, GEO, SERP features, and RTV
 */
export function mapLiveSerpData(
  response: RawSerpResponse,
  existingKeyword?: Partial<Keyword>
): LiveSerpUpdate {
  const items = response.items ?? []
  
  // Detect weak spots from organic results
  const weakSpots = detectWeakSpots(items)
  
  // Detect SERP features
  const detected = detectSerpFeatures(items)
  
  // Calculate GEO score with live data
  const keyword = response.keyword ?? existingKeyword?.keyword ?? ""
  const intent = existingKeyword?.intent ?? ["I"]
  const wordCount = countKeywordWords(keyword)
  const geoScore = calculateGeoScore(detected.hasAIO, detected.hasSnippet, intent, wordCount)

  // Calculate RTV with live SERP items
  const volume = existingKeyword?.volume ?? 0
  const cpc = existingKeyword?.cpc ?? 0
  const rtvResult = calculateRTV(volume, items, cpc)

  return {
    weakSpots,
    geoScore,
    hasAio: detected.hasAIO,
    serpFeatures: detected.features,
    rtv: rtvResult.rtv,
    rtvBreakdown: rtvResult.breakdown,
    lastUpdated: new Date(),
  }
}

/**
 * Merge live SERP update into existing keyword
 * Preserves Volume, CPC, KD from Labs data
 */
export function mergeKeywordWithLiveData(
  existing: Keyword,
  liveUpdate: LiveSerpUpdate
): Keyword {
  return {
    ...existing,
    weakSpots: liveUpdate.weakSpots,
    geoScore: liveUpdate.geoScore,
    hasAio: liveUpdate.hasAio,
    serpFeatures: liveUpdate.serpFeatures,
    rtv: liveUpdate.rtv,
    rtvBreakdown: liveUpdate.rtvBreakdown,
    lastUpdated: liveUpdate.lastUpdated,
    isRefreshing: false,
  }
}

/**
 * Batch map multiple keywords from Labs API
 */
export function mapBulkKeywords(
  rawItems: RawLabsKeyword[],
  source: DataSource
): Keyword[] {
  return rawItems.map((item, index) => mapKeywordData(item, source, index + 1))
}
