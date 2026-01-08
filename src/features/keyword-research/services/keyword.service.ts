/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════
 * 🧠 KEYWORD SERVICE - Keyword Explorer Backend
 * ═══════════════════════════════════════════════════════════════════════════════════════════════
 * 
 * Core data fetching logic for Keyword Explorer.
 * - Mock mode: Returns realistic test data
 * - Real mode: Calls DataForSEO Labs API
 */

import "server-only"

import { getDataForSEOClient, type DataForSEOResponse } from "@/src/lib/seo/dataforseo"
import { mapKeywordData, type RawRelatedKeywordItem } from "../utils/data-mapper"
import type { Keyword } from "../types"
import { MOCK_KEYWORDS } from "../data/mock-keywords"

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════════════════════════

function isMockMode(): boolean {
  return process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true"
}

function getLocationCode(country: string): number {
  const locationMap: Record<string, number> = {
    us: 2840,
    gb: 2826,
    ca: 2124,
    au: 2036,
    de: 2276,
    fr: 2250,
    in: 2356,
    br: 2076,
    es: 2724,
    it: 2380,
  }
  return locationMap[country.toLowerCase()] || 2840
}

// Mapping logic lives in [`mapKeywordData()`](src/features/keyword-research/utils/data-mapper.ts:187)
// so the service stays thin and type-safe.

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// DATAFORSEO TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════════════

interface RelatedKeywordsResult {
  items?: RawRelatedKeywordItem[]
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// MAIN SERVICE FUNCTION
// ═══════════════════════════════════════════════════════════════════════════════════════════════

/**
 * Fetch keywords for a given query and country.
 * 
 * @param query - Seed keyword to research
 * @param country - 2-letter country code (default: "us")
 * @returns Array of Keyword objects
 */
export async function fetchKeywords(
  query: string,
  country: string = "us"
): Promise<Keyword[]> {
  // ─────────────────────────────────────────
  // MOCK MODE
  // ─────────────────────────────────────────
  if (isMockMode()) {
    console.log("[KeywordService] Mock mode enabled, returning all mock keywords")
    
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 800))

    // Return ALL mock keywords for demo - no filtering
    // This ensures users always see results in the UI
    return MOCK_KEYWORDS
  }

  // ─────────────────────────────────────────
  // REAL API: DataForSEO Labs
  // ─────────────────────────────────────────
  try {
    const dataforseo = getDataForSEOClient()
    const locationCode = getLocationCode(country)

    const { data } = await dataforseo.post<DataForSEOResponse<RelatedKeywordsResult>>(
      "/dataforseo_labs/google/related_keywords/live",
      [
        {
          keyword: query.trim().toLowerCase(),
          location_code: locationCode,
          language_code: "en",
          depth: 2,
          limit: 100,
          include_seed_keyword: true,
          include_serp_info: true,
        },
      ]
    )

    const task = data.tasks?.[0]
    if (!task || task.status_code !== 20000) {
      throw new Error(task?.status_message || "DataForSEO API error")
    }

    const items = task.result?.[0]?.items ?? []

    // Transform API response to Keyword type (centralized mapping for type safety)
    return items.map((item, index) => mapKeywordData(item, index + 1))
  } catch (error) {
    console.error("[KeywordService] Error fetching keywords:", error)
    throw new Error(
      error instanceof Error ? error.message : "Failed to fetch keywords"
    )
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// SERVICE EXPORT (Object Pattern)
// ═══════════════════════════════════════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// RESEARCH KEYWORDS (Full API Response Structure)
// ═══════════════════════════════════════════════════════════════════════════════════════════════

import type {
  KeywordResearchRequest,
  KeywordResearchResponse,
  APIKeyword,
} from "../types/api.types"

/**
 * Convert internal Keyword to API format
 */
function toAPIKeyword(kw: Keyword, index: number): APIKeyword {
  return {
    id: String(kw.id || index + 1),
    keyword: kw.keyword,
    volume: kw.volume,
    trend: {
      values: kw.trend,
      labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].slice(0, kw.trend.length),
      growthPercent: kw.trend.length >= 2 ? Math.round(((kw.trend[kw.trend.length - 1] - kw.trend[0]) / Math.max(kw.trend[0], 1)) * 100) : 0,
      direction: kw.trend.length >= 2 ? (kw.trend[kw.trend.length - 1] > kw.trend[0] ? "up" : kw.trend[kw.trend.length - 1] < kw.trend[0] ? "down" : "stable") : "stable",
      seasonality: "evergreen",
    },
    kd: kw.kd,
    cpc: kw.cpc,
    competition: kw.kd < 30 ? "low" : kw.kd < 60 ? "medium" : "high",
    intent: {
      primary: kw.intent[0] || "I",
      secondary: kw.intent.slice(1),
      confidence: 85,
      all: kw.intent,
    },
    serp: {
      features: kw.serpFeatures.map((f, i) => ({
        type: f,
        position: i + 1,
        clickShare: Math.round(Math.random() * 30),
      })),
      organicResults: 10,
      adsCount: 2,
      paaQuestions: [],
      relatedSearches: [],
    },
    rtv: {
      value: Math.round(kw.volume * 0.6),
      percentage: 60,
      opportunityLevel: kw.kd < 30 ? "excellent" : kw.kd < 50 ? "good" : "moderate",
      ctrStealers: [],
    },
    geoScore: {
      score: kw.geoScore || 50,
      level: (kw.geoScore || 50) >= 80 ? "excellent" : (kw.geoScore || 50) >= 60 ? "good" : (kw.geoScore || 50) >= 40 ? "moderate" : "low",
      factors: {
        contentClarity: 70,
        structuredData: 60,
        authoritySignals: 65,
        freshnessSignals: 75,
        citationPotential: 70,
      },
      tips: [],
    },
    aioAnalysis: {
      hasAIOverview: kw.hasAio || false,
      yourCitation: { isCited: false, position: null, snippet: null },
      opportunityScore: kw.hasAio ? 80 : 20,
      competitors: [],
      optimizationTips: [],
    },
    communityDecay: {
      hasContent: kw.weakSpots.reddit !== null || kw.weakSpots.quora !== null || kw.weakSpots.pinterest !== null,
      decayScore: (kw.weakSpots.reddit !== null || kw.weakSpots.quora !== null || kw.weakSpots.pinterest !== null) ? 65 : 0,
      platforms: [],
      bestOpportunity: kw.weakSpots.reddit !== null ? { platform: "reddit", reason: "Outdated content opportunity" } :
                       kw.weakSpots.quora !== null ? { platform: "quora", reason: "Outdated content opportunity" } :
                       kw.weakSpots.pinterest !== null ? { platform: "pinterest", reason: "Outdated content opportunity" } : null,
    },
    weakSpot: {
      hasWeakSpot: kw.weakSpots.reddit !== null || kw.weakSpots.quora !== null || kw.weakSpots.pinterest !== null,
      type: kw.weakSpots.reddit !== null ? "reddit" : kw.weakSpots.quora !== null ? "quora" : kw.weakSpots.pinterest !== null ? "pinterest" : null,
      rank: kw.weakSpots.reddit ?? kw.weakSpots.quora ?? kw.weakSpots.pinterest ?? null,
      url: null,
      age: null,
      quality: (kw.weakSpots.reddit !== null || kw.weakSpots.quora !== null || kw.weakSpots.pinterest !== null) ? "medium" : null,
      opportunity: kw.weakSpots.reddit !== null ? `Outrank reddit result` :
                   kw.weakSpots.quora !== null ? `Outrank quora result` :
                   kw.weakSpots.pinterest !== null ? `Outrank pinterest result` : null,
    },
    lastUpdated: kw.updatedAt || new Date().toISOString(),
    dataFreshness: "fresh",
  }
}

/**
 * Research keywords with full API response structure
 */
async function researchKeywords(request: KeywordResearchRequest): Promise<KeywordResearchResponse> {
  const keywords = await fetchKeywords(request.seedKeyword, request.country)

  // Apply filters
  let filtered = keywords

  if (request.filters) {
    const f = request.filters
    filtered = keywords.filter((kw) => {
      if (f.volumeMin !== undefined && kw.volume < f.volumeMin) return false
      if (f.volumeMax !== undefined && kw.volume > f.volumeMax) return false
      if (f.kdMin !== undefined && kw.kd < f.kdMin) return false
      if (f.kdMax !== undefined && kw.kd > f.kdMax) return false
      if (f.cpcMin !== undefined && kw.cpc < f.cpcMin) return false
      if (f.cpcMax !== undefined && kw.cpc > f.cpcMax) return false
      if (f.intents && f.intents.length > 0) {
        if (!kw.intent.some((i) => f.intents!.includes(i))) return false
      }
      if (f.includeTerms && f.includeTerms.length > 0) {
        if (!f.includeTerms.some((t) => kw.keyword.toLowerCase().includes(t.toLowerCase()))) return false
      }
      if (f.excludeTerms && f.excludeTerms.length > 0) {
        if (f.excludeTerms.some((t) => kw.keyword.toLowerCase().includes(t.toLowerCase()))) return false
      }
      return true
    })
  }

  // Sort
  if (request.sortBy) {
    filtered.sort((a, b) => {
      let aVal: number | string = 0
      let bVal: number | string = 0

      switch (request.sortBy) {
        case "volume": aVal = a.volume; bVal = b.volume; break
        case "kd": aVal = a.kd; bVal = b.kd; break
        case "cpc": aVal = a.cpc; bVal = b.cpc; break
        case "geoScore": aVal = a.geoScore || 0; bVal = b.geoScore || 0; break
        case "keyword": aVal = a.keyword; bVal = b.keyword; break
        default: aVal = a.volume; bVal = b.volume
      }

      if (typeof aVal === "string") {
        return request.sortOrder === "asc" ? aVal.localeCompare(bVal as string) : (bVal as string).localeCompare(aVal)
      }
      return request.sortOrder === "asc" ? aVal - (bVal as number) : (bVal as number) - aVal
    })
  }

  // Paginate
  const total = filtered.length
  const startIndex = (request.page - 1) * request.limit
  const paginated = filtered.slice(startIndex, startIndex + request.limit)

  return {
    success: true,
    data: {
      keywords: paginated.map(toAPIKeyword),
      pagination: {
        page: request.page,
        limit: request.limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / request.limit)),
        hasMore: startIndex + request.limit < total,
      },
      meta: {
        seedKeyword: request.seedKeyword,
        country: request.country,
        matchType: request.matchType,
        creditsUsed: 1,
        generatedAt: new Date().toISOString(),
      },
    },
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// ADDITIONAL SERVICE METHODS
// ═══════════════════════════════════════════════════════════════════════════════════════════════

/**
 * Get single keyword details
 */
async function getKeywordDetails(keyword: string, country: string = "us"): Promise<APIKeyword> {
  const keywords = await fetchKeywords(keyword, country)
  const found = keywords.find((kw) => kw.keyword.toLowerCase() === keyword.toLowerCase())

  if (found) {
    return toAPIKeyword(found, 0)
  }

  // Generate mock keyword if not found
  return toAPIKeyword(
    {
      id: 1,
      keyword,
      intent: ["I"],
      volume: Math.floor(Math.random() * 50000) + 1000,
      trend: Array.from({ length: 12 }, () => Math.floor(Math.random() * 100)),
      weakSpots: { reddit: null, quora: null, pinterest: null },
      kd: Math.floor(Math.random() * 100),
      cpc: parseFloat((Math.random() * 10).toFixed(2)),
      serpFeatures: ["snippet"],
      geoScore: Math.floor(Math.random() * 100),
      hasAio: Math.random() > 0.5,
      dataSource: "mock",
    },
    0
  )
}

/**
 * Get keyword history (for rank tracking)
 */
async function getKeywordHistory(
  keyword: string,
  country: string = "us",
  days: number = 30
): Promise<{ date: string; rank: number; volume: number }[]> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  const history: { date: string; rank: number; volume: number }[] = []
  const baseRank = Math.floor(Math.random() * 50) + 1
  const baseVolume = Math.floor(Math.random() * 50000) + 1000

  for (let i = days; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    history.push({
      date: date.toISOString().split("T")[0],
      rank: Math.max(1, baseRank + Math.floor(Math.random() * 10) - 5),
      volume: Math.max(100, baseVolume + Math.floor(Math.random() * 5000) - 2500),
    })
  }

  return history
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// SERVICE EXPORT (Object Pattern)
// ═══════════════════════════════════════════════════════════════════════════════════════════════

export const keywordService = {
  fetchKeywords,
  researchKeywords,
  getKeywordDetails,
  getKeywordHistory,
}

// Backward compatibility alias for existing imports
export const keywordResearchService = keywordService