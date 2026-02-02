// ============================================
// DATA MAPPER - Keyword Data Standardizer
// ============================================
// Transforms raw API responses into standardized Keyword format
// Handles both LABS (historical) and SERP (live) data sources
// ============================================

import "server-only"

import type { Keyword, WeakSpots, SERPFeature, WeakSpotEntry } from "../types"
import { calculateGeoScore, countKeywordWords } from "./geo-calculator"
import { analyzeSerpForWeakSpots, detectWeakSpots, detectWeakSpotsRanked, detectSerpFeatures, type RawSerpItem } from "./serp-parser"
import { calculateRTV } from "./rtv-calculator"
import { calculateMomentum, normalizeTrend } from "./trend-utils"
import { normalizeSerpFeatureTypes } from "./serp-feature-normalizer"
import type { CleanKeyword, DataForSEOOrganicSerpResult } from "../types/api.types"
import type { CommunityResult } from "../types"
import type { SocialIntelPayload } from "../services/social.service"
import type { SocialIntelMetrics } from "./social-mapper"

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
  countryCode?: string
  country?: string
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
function extractTrend(monthlySearches?: Array<{ search_volume?: number }>): number[] {
  if (!monthlySearches || !Array.isArray(monthlySearches)) {
    return Array.from({ length: 12 }, () => 0)
  }

  // DataForSEO returns most recent months first; reverse to chronological order.
  const values = monthlySearches
    .slice(0, 12)
    .map((m) => m.search_volume ?? 0)
    .reverse()

  while (values.length < 12) {
    values.unshift(0)
  }

  return values
}

/**
 * Map SERP item types to SERPFeature array
 */
function mapSerpTypes(types?: string[]): SERPFeature[] {
  return normalizeSerpFeatureTypes(types)
}

function toNumber(value: unknown, fallback: number): number {
  const n = typeof value === "number" ? value : Number(value)
  return Number.isFinite(n) ? n : fallback
}

function normalizeKeyword(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ")
}

function normalizeCountryCode(value: string | undefined): string {
  const normalized = value?.trim().toUpperCase()
  return normalized && normalized.length > 0 ? normalized : "US"
}

function generateStableId(keyword: string, countryCode: string): number {
  const key = `${normalizeKeyword(keyword)}_${normalizeCountryCode(countryCode)}`
  let hash = 2166136261
  for (let i = 0; i < key.length; i++) {
    hash ^= key.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  const stable = hash >>> 0
  return stable === 0 ? 1 : stable
}

function coerceTrendValues(
  values?: number[],
  order: "latest-first" | "oldest-first" = "latest-first"
): number[] {
  const safe = Array.isArray(values)
    ? values.map((v) => toNumber(v, 0))
    : []

  const ordered = order === "latest-first" ? [...safe].reverse() : [...safe]

  if (ordered.length >= 12) {
    return ordered.slice(-12)
  }

  const padding = Array.from({ length: 12 - ordered.length }, () => 0)
  return [...padding, ...ordered]
}

function normalizeIntentCodes(intent?: string | KeywordIntentCode[] | null): KeywordIntentCode[] {
  if (Array.isArray(intent) && intent.length > 0) {
    return intent
  }

  const normalized = typeof intent === "string" ? intent.trim().toLowerCase() : ""
  if (!normalized) return ["I"]

  if (normalized === "informational" || normalized === "i") return ["I"]
  if (normalized === "commercial" || normalized === "c") return ["C"]
  if (normalized === "transactional" || normalized === "t") return ["T"]
  if (normalized === "navigational" || normalized === "n") return ["N"]

  return ["I"]
}

function resolveWeakSpotFromMap(weakSpots: WeakSpots): Keyword["weakSpot"] {
  if (typeof weakSpots.reddit === "number") return { type: "reddit", rank: weakSpots.reddit }
  if (typeof weakSpots.quora === "number") return { type: "quora", rank: weakSpots.quora }
  if (typeof weakSpots.pinterest === "number") return { type: "pinterest", rank: weakSpots.pinterest }
  return { type: null }
}

function buildWeakSpotsFromEntries(entries: WeakSpotEntry[]): WeakSpots {
  const ranked = [...entries].sort((a, b) => a.rank - b.rank)
  const findRank = (platform: "reddit" | "quora" | "pinterest") =>
    ranked.find((entry) => entry.platform === platform)?.rank ?? null

  return {
    reddit: findRank("reddit"),
    quora: findRank("quora"),
    pinterest: findRank("pinterest"),
    ranked,
  }
}

export interface LabsKeywordSnapshot {
  id?: number
  keyword?: string
  volume?: number | null
  cpc?: number | null
  kd?: number | null
  trend?: number[]
  trendOrder?: "latest-first" | "oldest-first"
  intent?: string | KeywordIntentCode[] | null
  countryCode?: string
}

/**
 * Map DataForSEO Organic SERP response into a clean, UI-ready keyword object.
 *
 * This mapper merges basic metrics (volume, CPC, trend) with deep SERP analysis
 * (RTV, GEO score, weak spots, and SERP feature detection) into a single object.
 *
 * Formula references:
 * - RTV = Volume * (1 - TotalLoss / 100)
 * - GEO = AIO_Bonus + Snippet_Bonus + Intent_Bonus + Length_Bonus
 */
export function mapKeywordData(rawSerpData: DataForSEOOrganicSerpResult, volume: number): CleanKeyword
export function mapKeywordData(
  rawSerpData: DataForSEOOrganicSerpResult,
  labsData: LabsKeywordSnapshot
): CleanKeyword
export function mapKeywordData(
  rawSerpData: DataForSEOOrganicSerpResult,
  volumeOrLabs: number | LabsKeywordSnapshot
): CleanKeyword {
  const labsData: LabsKeywordSnapshot = typeof volumeOrLabs === "number"
    ? {
        keyword: rawSerpData.keyword ?? "",
        volume: volumeOrLabs,
        cpc: rawSerpData.cpc ?? null,
        intent: rawSerpData.intent ?? null,
      }
    : volumeOrLabs

  if (process.env.NODE_ENV !== "production") {
    console.log("[DataMapper] mapKeywordData input:", {
      keyword: rawSerpData.keyword ?? labsData.keyword ?? "",
      volume: labsData.volume ?? null,
      itemCount: Array.isArray(rawSerpData.items) ? rawSerpData.items.length : 0,
    })
  }

  const keyword = labsData.keyword ?? rawSerpData.keyword ?? ""
  const countryCode = normalizeCountryCode(labsData.countryCode)
  const volume = Math.max(0, toNumber(labsData.volume, 0))
  const cpc = toNumber(labsData.cpc ?? rawSerpData.cpc, 0)
  const kd = Math.max(0, toNumber(labsData.kd, 0))
  const rawTrend = coerceTrendValues(labsData.trend, labsData.trendOrder ?? "latest-first")
  const trend = normalizeTrend(rawTrend)
  const trendStatus = calculateMomentum(rawTrend).status

  const items = Array.isArray(rawSerpData.items) ? (rawSerpData.items as RawSerpItem[]) : []
  const itemTypes = Array.isArray(rawSerpData.item_types) ? rawSerpData.item_types : []

  const hasSerpData = items.length > 0 || itemTypes.length > 0

  const detected = detectSerpFeatures(items)
  const serpFeatures = dedupeFeatures([
    ...mapSerpTypes(itemTypes),
    ...detected.features,
  ])

  const hasAio = detected.hasAIO || serpFeatures.includes("ai_overview")
  const hasSnippet = detected.hasSnippet || serpFeatures.includes("featured_snippet")
  const intentCodes = normalizeIntentCodes(labsData.intent)

  const rtvItems = [...items]
  for (const feature of serpFeatures) {
    rtvItems.push({ type: feature } as RawSerpItem)
  }

  const rtvResult = calculateRTV(volume, rtvItems, cpc)

  if (!hasSerpData) {
    const minimalWeakSpots: WeakSpots = {
      reddit: null,
      quora: null,
      pinterest: null,
      ranked: [],
    }

    const baselineRtv = calculateRTV(volume, [], cpc)

    return {
      id:
        typeof labsData.id === "number" && Number.isFinite(labsData.id) && labsData.id > 0
          ? labsData.id
          : generateStableId(keyword, countryCode),
      keyword,
      countryCode,
      intent: intentCodes,
      volume,
      trend,
      trendRaw: rawTrend,
      trendStatus,
      weakSpots: minimalWeakSpots,
      weakSpot: resolveWeakSpotFromMap(minimalWeakSpots),
      kd,
      cpc,
      serpFeatures: [],
      rtv: baselineRtv.rtv,
      rtvBreakdown: baselineRtv.breakdown,
      geoScore: null,
      hasAio: false,
      lastUpdated: new Date(),
      lastRefreshedAt: null,
      dataSource: "dataforseo",
    }
  }

  const geoScore = calculateGeoScore(hasAio, hasSnippet, intentCodes, countKeywordWords(keyword))
  const weakSpotEntries = analyzeSerpForWeakSpots(items)
  const weakSpots = buildWeakSpotsFromEntries(weakSpotEntries)

  return {
    id:
      typeof labsData.id === "number" && Number.isFinite(labsData.id) && labsData.id > 0
        ? labsData.id
        : generateStableId(keyword, countryCode),
    keyword,
    countryCode,
    intent: intentCodes,
    volume,
    trend,
    trendRaw: rawTrend,
    trendStatus,
    weakSpots,
    weakSpot: resolveWeakSpotFromMap(weakSpots),
    kd,
    cpc,
    serpFeatures,
    rtv: rtvResult.rtv,
    rtvBreakdown: rtvResult.breakdown,
    geoScore,
    hasAio,
    lastUpdated: new Date(),
    lastRefreshedAt: null,
    dataSource: "dataforseo",
  }
}

/**
 * Raw related keyword item (DataForSEO Labs `related_keywords/live`)
 *
 * This is the payload shape used by the Keyword Explorer.
 */
export interface RawRelatedKeywordItem {
  keyword?: string
  keyword_data?: {
    keyword?: string
    keyword_info?: {
      search_volume?: number
      cpc?: number
      competition?: number
      competition_level?: number | string
      monthly_searches?: Array<{ search_volume?: number }>
      search_intent?: unknown
    }
    keyword_properties?: {
      keyword_difficulty?: number
    }
    search_intent_info?: {
      main_intent?: string
      foreign_intent?: string[] | null
    }
    serp_info?: {
      serp_item_types?: string[]
      serp_items?: RawSerpItem[]
    }
  }
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
  countryCode?: string
  country?: string
}

export type KeywordIntentCode = "I" | "C" | "T" | "N"

/**
 * Build cache payloads for kw_cache writes.
 * raw_data = Labs metrics (volume/cpc/kd/trend)
 * analysis_data = SERP analysis (geo/weak-spots/serp features)
 */
const sanitizeKeywordForCache = (keyword: Keyword): Keyword => ({
  id: keyword.id,
  keyword: keyword.keyword,
  countryCode: keyword.countryCode,
  intent: keyword.intent,
  volume: keyword.volume,
  trend: keyword.trend,
  trendRaw: keyword.trendRaw,
  trendStatus: keyword.trendStatus,
  weakSpot: keyword.weakSpot,
  weakSpots: keyword.weakSpots,
  kd: keyword.kd,
  cpc: keyword.cpc,
  serpFeatures: keyword.serpFeatures,
  rtv: keyword.rtv,
  rtvBreakdown: keyword.rtvBreakdown,
  geoScore: keyword.geoScore,
  hasAio: keyword.hasAio,
  lastUpdated: keyword.lastUpdated,
  lastRefreshedAt: keyword.lastRefreshedAt,
  lastLabsUpdate: keyword.lastLabsUpdate,
  lastSerpUpdate: keyword.lastSerpUpdate,
  serpStatus: keyword.serpStatus,
  fromCache: keyword.fromCache,
  updatedAt: keyword.updatedAt,
  dataSource: keyword.dataSource,
  yourPosition: keyword.yourPosition,
})

export function buildKwCachePayload(
  labsKeywords?: Keyword[] | null,
  serpKeywords?: Keyword[] | null
): { raw_data: Keyword[] | null; analysis_data: Keyword[] | null } {
  const raw_data =
    labsKeywords && labsKeywords.length > 0
      ? labsKeywords.map((keyword) => sanitizeKeywordForCache(keyword))
      : null
  const analysis_data =
    serpKeywords && serpKeywords.length > 0
      ? serpKeywords.map((keyword) => sanitizeKeywordForCache(keyword))
      : null
  return { raw_data, analysis_data }
}

export type SocialIntelAnalysisPayload = {
  youtube: SocialIntelPayload["youtube"]
  reddit: SocialIntelPayload["reddit"]
  pinterest: SocialIntelPayload["pinterest"]
  quora: SocialIntelPayload["quora"]
  community: CommunityResult[]
  metrics?: SocialIntelMetrics
  fetchedAt?: string
  isMock?: boolean
  unlocked?: boolean
}

export function buildSocialIntelAnalysisPayload(
  payload: SocialIntelPayload,
  community: CommunityResult[],
  metrics?: SocialIntelMetrics,
  options?: { fetchedAt?: string; isMock?: boolean; unlocked?: boolean }
): SocialIntelAnalysisPayload {
  return {
    youtube: payload.youtube,
    reddit: payload.reddit,
    pinterest: payload.pinterest,
    quora: payload.quora,
    community,
    metrics,
    fetchedAt: options?.fetchedAt,
    isMock: options?.isMock,
    unlocked: options?.unlocked,
  }
}

export function mapLegacyKeywordData(rawItem: RawLabsKeyword, source: DataSource, id?: number): Keyword
export function mapLegacyKeywordData(rawItem: RawRelatedKeywordItem, id?: number): Keyword

/**
 * Map raw DataForSEO items into our standardized [`Keyword`](src/features/keyword-research/types/index.ts:1) shape.
 *
 * Supports two calling conventions:
 * 1) Labs keyword item: `mapLegacyKeywordData(rawItem, "LABS", id)`
 * 2) Related-keywords item: `mapLegacyKeywordData(rawItem, id)`
 */
export function mapLegacyKeywordData(
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
    if (process.env.NODE_ENV !== "production" && id === 1) {
      console.log(
        "[DataMapper] mapLegacyKeywordData input:",
        JSON.stringify(item, null, 2)
      )
    }

    const keywordData = item.keyword_data ?? {}
    const info = keywordData.keyword_info ?? item.keyword_info ?? {}
    const props = keywordData.keyword_properties ?? {}
    const intentInfo = keywordData.search_intent_info
    const serp = keywordData.serp_info ?? item.serp_info ?? {}

    const keyword =
      typeof keywordData.keyword === "string"
        ? keywordData.keyword
        : typeof item.keyword === "string"
          ? item.keyword
          : ""
    const countryCode = normalizeCountryCode(item.countryCode ?? item.country)

    const volume = typeof info.search_volume === "number" ? info.search_volume : 0
    const cpc = typeof info.cpc === "number" ? info.cpc : 0

    const kd =
      typeof props.keyword_difficulty === "number"
        ? Math.round(props.keyword_difficulty)
        : typeof info.competition_level === "number"
          ? Math.round(info.competition_level * 100)
          : typeof info.competition === "number"
            ? Math.round(info.competition * 100)
            : 50

    const intent = mapIntent(
      typeof intentInfo?.main_intent === "string"
        ? intentInfo.main_intent
        : typeof info.search_intent === "string"
          ? info.search_intent
          : undefined
    )

    const rawTrend = extractTrend(info.monthly_searches)
    const trend = normalizeTrend(rawTrend)
    const trendStatus = calculateMomentum(rawTrend).status

    const serpTypes = Array.isArray(serp.serp_item_types) ? serp.serp_item_types : []
    const serpItems = Array.isArray(serp.serp_items) ? serp.serp_items : []

    const detected = detectSerpFeatures(serpItems)

    const serpFeatures = dedupeFeatures([
      ...mapSerpTypes(serpTypes),
      ...detected.features,
    ])

    const hasAio = serpFeatures.includes("ai_overview") || detected.hasAIO
    const hasSnippet = serpFeatures.includes("featured_snippet") || detected.hasSnippet

    const weakSpots = {
      ...detectWeakSpots(serpItems),
      ranked: detectWeakSpotsRanked(serpItems),
    }

    const geoScore = calculateGeoScore(hasAio, hasSnippet, intent, countKeywordWords(keyword))

    // Calculate RTV using raw SERP items
    const rtvResult = calculateRTV(volume, serpItems, cpc)

    return {
      id:
        typeof id === "number" && Number.isFinite(id) && id > 0
          ? id
          : generateStableId(keyword, countryCode),
      keyword,
      countryCode,
      intent,
      volume,
      trend,
      trendRaw: rawTrend,
      trendStatus,
      weakSpots,
      kd,
      cpc,
      serpFeatures,
      rtv: rtvResult.rtv,
      rtvBreakdown: rtvResult.breakdown,
      geoScore,
      hasAio,
      lastUpdated: new Date(),
      lastRefreshedAt: null,
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
  const countryCode = normalizeCountryCode(labs.countryCode ?? labs.country)

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
  const rawTrend = extractTrend(keywordData?.monthly_searches)
  const trend = normalizeTrend(rawTrend)
  const trendStatus = calculateMomentum(rawTrend).status

  // SERP features from Labs data
  const serpFeatures = mapSerpTypes(labs.serp_info?.serp_item_types)

  // Check for AI Overview in SERP types
  const hasAio = serpFeatures.includes("ai_overview") ||
    (labs.serp_info?.serp_item_types?.some(t => t.toLowerCase().includes("ai")) ?? false)

  // Check for snippet
  const hasSnippet = serpFeatures.includes("featured_snippet")

  // Calculate GEO score
  const wordCount = countKeywordWords(keyword)
  const geoScore = calculateGeoScore(hasAio, hasSnippet, intent, wordCount)

  // Default weak spots (Labs doesn't provide this - needs Live SERP)
  const weakSpots: WeakSpots = {
    reddit: null,
    quora: null,
    pinterest: null,
    ranked: [],
  }

  // Calculate RTV (Labs has no SERP items, use empty array)
  const rtvResult = calculateRTV(volume, [], cpc)

  return {
    id:
      typeof id === "number" && Number.isFinite(id) && id > 0
        ? id
        : generateStableId(keyword, countryCode),
    keyword,
    countryCode,
    intent,
    volume,
    trend,
    trendRaw: rawTrend,
    trendStatus,
    weakSpots,
    kd,
    cpc,
    serpFeatures,
    rtv: rtvResult.rtv,
    rtvBreakdown: rtvResult.breakdown,
    geoScore,
    hasAio,
    lastUpdated: new Date(),
    lastRefreshedAt: null,
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
  const weakSpots = {
    ...detectWeakSpots(items),
    ranked: detectWeakSpotsRanked(items),
  }
  
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
  return rawItems.map((item, index) => mapLegacyKeywordData(item, source, index + 1))
}
