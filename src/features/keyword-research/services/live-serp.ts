/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════
 * 🔴 LIVE SERP SERVICE - Real-time Google SERP Data Fetcher
 * ═══════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Fetches live Google SERP data via DataForSEO API and extracts:
 * - Weak spots (Reddit, Quora, Pinterest rankings in top 10)
 * - SERP features (AI Overview, Featured Snippet, Video, etc.)
 * - Recalculated GEO score
 */

import "server-only"

import { getDataForSEOClient, type DataForSEOResponse } from "@/src/lib/seo/dataforseo"
import { calculateGeoScore, countKeywordWords } from "../utils/geo-calculator"
import type { SERPFeature } from "../types"

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════════════

export interface LiveSerpResultItem {
  type: string
  rank_group: number
  rank_absolute: number
  position?: string
  title?: string
  url?: string
  domain?: string
  description?: string
}

export interface LiveSerpResult {
  items?: LiveSerpResultItem[]
  item_types?: string[]
}

export interface WeakSpots {
  reddit: number | null
  quora: number | null
  pinterest: number | null
}

export interface LiveSerpData {
  weakSpots: WeakSpots
  serpFeatures: SERPFeature[]
  geoScore: number
  hasAio: boolean
  hasSnippet: boolean
  rtv?: number
  rtvBreakdown?: Array<{ label: string; value: number }>
  rawItems?: LiveSerpResultItem[]
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════════════════════

const WEAK_SPOT_DOMAINS: Record<keyof WeakSpots, string[]> = {
  reddit: ["reddit.com", "www.reddit.com", "old.reddit.com"],
  quora: ["quora.com", "www.quora.com"],
  pinterest: ["pinterest.com", "www.pinterest.com", "in.pinterest.com"],
}

/**
 * Valid SERPFeature values for type-safe mapping
 * Maps DataForSEO item_types to our SERPFeature union type
 */
const SERP_FEATURE_MAP: Record<string, SERPFeature> = {
  // CTRStealingFeature values
  ai_overview: "ai_overview",
  featured_snippet: "featured_snippet",
  people_also_ask: "people_also_ask",
  video_carousel: "video_carousel",
  image_pack: "image_pack",
  local_pack: "local_pack",
  shopping_ads: "shopping_ads",
  top_ads: "top_ads",
  knowledge_panel: "knowledge_panel",
  knowledge_graph: "knowledge_panel",  // alias
  top_stories: "top_stories",
  direct_answer: "direct_answer",
  answer_box: "direct_answer",  // alias
  calculator: "calculator",
  weather: "weather",
  sports: "sports",
  // Additional SERPFeature values
  snippet: "snippet",
  faq: "faq",
  reviews: "reviews",
  image: "image",
  video: "video",
  shopping: "shopping",
  ad: "ad",
  paid: "ad",  // alias
  local: "local",
  news: "news",
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════════════════════

/**
 * Extract weak spots (community platforms ranking in top 10)
 */
function extractWeakSpots(items: LiveSerpResultItem[]): WeakSpots {
  const weakSpots: WeakSpots = {
    reddit: null,
    quora: null,
    pinterest: null,
  }

  // Only check top 10 organic results
  const top10 = items
    .filter((item) => item.type === "organic" && item.rank_group <= 10)
    .slice(0, 10)

  for (const item of top10) {
    const domain = (item.domain || "").toLowerCase()

    for (const [platform, domains] of Object.entries(WEAK_SPOT_DOMAINS)) {
      if (domains.some((d) => domain.includes(d))) {
        const key = platform as keyof WeakSpots
        // Only record first occurrence (highest rank)
        if (weakSpots[key] === null) {
          weakSpots[key] = item.rank_group
        }
      }
    }
  }

  return weakSpots
}

/**
 * Extract SERP features from item_types and map to valid SERPFeature values
 */
function extractSerpFeatures(itemTypes: string[]): SERPFeature[] {
  const features: SERPFeature[] = []
  const seen = new Set<SERPFeature>()

  for (const itemType of itemTypes) {
    const normalized = itemType.toLowerCase()
    const mappedFeature = SERP_FEATURE_MAP[normalized]
    
    if (mappedFeature && !seen.has(mappedFeature)) {
      features.push(mappedFeature)
      seen.add(mappedFeature)
    }
  }

  return features
}

/**
 * Check if AI Overview is present
 */
function hasAiOverview(itemTypes: string[]): boolean {
  const normalizedTypes = itemTypes.map((t) => t.toLowerCase())
  return normalizedTypes.some((t) => 
    t === "ai_overview" || 
    t.includes("ai_overview") ||
    t === "featured_snippet" && normalizedTypes.includes("ai")
  )
}

/**
 * Check if Featured Snippet is present
 */
function hasFeaturedSnippet(itemTypes: string[]): boolean {
  const normalizedTypes = itemTypes.map((t) => t.toLowerCase())
  return normalizedTypes.some((t) => 
    t === "featured_snippet" || 
    t.includes("answer_box")
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// MAIN SERVICE FUNCTION
// ═══════════════════════════════════════════════════════════════════════════════════════════════

/**
 * Fetch live SERP data from DataForSEO
 * 
 * @param keyword - The keyword to fetch SERP data for
 * @param locationCode - DataForSEO location code (default: 2840 = USA)
 * @returns LiveSerpData with weak spots, features, and GEO score
 */
export async function fetchLiveSerp(
  keyword: string,
  locationCode: number = 2840
): Promise<LiveSerpData> {
  const dataforseo = getDataForSEOClient()

  try {
    const { data } = await dataforseo.post<DataForSEOResponse<LiveSerpResult>>(
      "/v3/serp/google/organic/live/advanced",
      [
        {
          keyword: keyword.trim().toLowerCase(),
          location_code: locationCode,
          language_code: "en",
          depth: 20, // Get more results for comprehensive analysis
          se_domain: "google.com",
        },
      ]
    )

    const task = data.tasks?.[0]
    if (!task || task.status_code !== 20000) {
      throw new Error(task?.status_message || "DataForSEO SERP API error")
    }

    const result = task.result?.[0]
    const items = result?.items || []
    const itemTypes = result?.item_types || []

    // Extract weak spots
    const weakSpots = extractWeakSpots(items)

    // Extract SERP features
    const serpFeatures = extractSerpFeatures(itemTypes)

    // Check for AI Overview and Featured Snippet
    const hasAio = hasAiOverview(itemTypes)
    const hasSnippet = hasFeaturedSnippet(itemTypes)

    // Calculate GEO score
    const wordCount = countKeywordWords(keyword)
    const geoScore = calculateGeoScore(hasAio, hasSnippet, "I", wordCount)

    return {
      weakSpots,
      serpFeatures,
      geoScore,
      hasAio,
      hasSnippet,
      rawItems: items,
    }
  } catch (error) {
    console.error("[LiveSerp] Error fetching SERP data:", error)
    throw new Error(
      error instanceof Error ? error.message : "Failed to fetch live SERP data"
    )
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// LOCATION CODE HELPER
// ═══════════════════════════════════════════════════════════════════════════════════════════════

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

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// REFRESH LIVE SERP (Action-friendly wrapper)
// ═══════════════════════════════════════════════════════════════════════════════════════════════

export interface RefreshLiveSerpInput {
  keyword: string
  country?: string
  intent?: ("I" | "C" | "T" | "N")[]
}

export interface RefreshLiveSerpResult {
  weakSpot: {
    type: "reddit" | "quora" | "pinterest" | null
    rank?: number
  }
  serpFeatures: SERPFeature[]
  geoScore: number
  hasAio: boolean
  checkedAt: string
}

/**
 * Refresh live SERP data for a keyword (used by refresh-keyword action)
 */
export async function refreshLiveSerp(input: RefreshLiveSerpInput): Promise<RefreshLiveSerpResult> {
  const { keyword, country = "us", intent } = input
  const locationCode = getLocationCode(country)

  // Fetch live SERP data
  const serpData = await fetchLiveSerp(keyword, locationCode)

  // Determine primary weak spot (first found in priority order: reddit > quora > pinterest)
  let weakSpotType: "reddit" | "quora" | "pinterest" | null = null
  let weakSpotRank: number | undefined

  if (serpData.weakSpots.reddit !== null) {
    weakSpotType = "reddit"
    weakSpotRank = serpData.weakSpots.reddit
  } else if (serpData.weakSpots.quora !== null) {
    weakSpotType = "quora"
    weakSpotRank = serpData.weakSpots.quora
  } else if (serpData.weakSpots.pinterest !== null) {
    weakSpotType = "pinterest"
    weakSpotRank = serpData.weakSpots.pinterest
  }

  // Recalculate GEO score with intent if provided
  let geoScore = serpData.geoScore
  if (intent && intent.length > 0) {
    const wordCount = countKeywordWords(keyword)
    geoScore = calculateGeoScore(serpData.hasAio, serpData.hasSnippet, intent, wordCount)
  }

  return {
    weakSpot: {
      type: weakSpotType,
      rank: weakSpotRank,
    },
    serpFeatures: serpData.serpFeatures,
    geoScore,
    hasAio: serpData.hasAio,
    checkedAt: new Date().toISOString(),
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// SERVICE EXPORT (Object Pattern)
// ═══════════════════════════════════════════════════════════════════════════════════════════════

export const liveSerpService = {
  fetchLiveSerp,
  refreshLiveSerp,
}
