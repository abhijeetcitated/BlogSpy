// ============================================
// KEYWORD DISCOVERY SERVICE - Labs API
// ============================================
// Server-only service for fetching bulk keyword data
// from DataForSEO Labs API (historical data)
// ============================================

import "server-only"

import { dataForSEOClient, type ApiResponse } from "@/services/dataforseo/client"
import { mapKeywordData, mapBulkKeywords, type RawLabsKeyword } from "../utils/data-mapper"
import type { Keyword } from "../types"

/**
 * DataForSEO Labs API endpoints
 */
const LABS_ENDPOINTS = {
  RELATED_KEYWORDS: "/v3/dataforseo_labs/google/related_keywords/live",
  KEYWORD_SUGGESTIONS: "/v3/dataforseo_labs/google/keyword_suggestions/live",
  BULK_KEYWORD_DIFFICULTY: "/v3/dataforseo_labs/google/bulk_keyword_difficulty/live",
  KEYWORDS_FOR_SITE: "/v3/dataforseo_labs/google/keywords_for_site/live",
} as const

/**
 * Request options for keyword discovery
 */
export interface KeywordDiscoveryOptions {
  /** Target keyword or seed keyword */
  keyword: string
  /** Country code (e.g., "US", "GB", "IN") */
  country?: string
  /** Language code (e.g., "en") */
  language?: string
  /** Maximum results to return */
  limit?: number
  /** Include search volume data */
  includeVolume?: boolean
  /** Include CPC data */
  includeCpc?: boolean
  /** Minimum search volume filter */
  minVolume?: number
  /** Maximum keyword difficulty filter */
  maxKd?: number
}

/**
 * Labs API response structure
 */
interface LabsApiResult {
  keyword?: string
  items?: RawLabsKeyword[]
  items_count?: number
  total_count?: number
}

/**
 * Keyword discovery response
 */
export interface KeywordDiscoveryResponse {
  success: boolean
  keywords: Keyword[]
  totalCount: number
  error?: string
  cost?: number
}

/**
 * Build request payload for Labs API
 */
function buildLabsPayload(options: KeywordDiscoveryOptions): object[] {
  const {
    keyword,
    country = "US",
    language = "en",
    limit = 100,
    minVolume,
    maxKd,
  } = options

  const payload: Record<string, unknown> = {
    keyword,
    location_code: getLocationCode(country),
    language_code: language,
    limit,
    include_serp_info: true,
    include_seed_keyword: true,
    include_clickstream_data: true,
  }

  // Add filters if specified
  const filters: Array<unknown> = []
  
  if (minVolume !== undefined && minVolume > 0) {
    filters.push(["keyword_info.search_volume", ">=", minVolume])
  }
  
  if (maxKd !== undefined && maxKd < 100) {
    if (filters.length > 0) filters.push("and")
    filters.push(["keyword_info.competition", "<=", maxKd / 100])
  }

  if (filters.length > 0) {
    payload.filters = filters
  }

  return [payload]
}

/**
 * Map country code to DataForSEO location code
 */
function getLocationCode(country: string): number {
  const locationMap: Record<string, number> = {
    US: 2840,  // United States
    GB: 2826,  // United Kingdom
    CA: 2124,  // Canada
    AU: 2036,  // Australia
    IN: 2356,  // India
    DE: 2276,  // Germany
    FR: 2250,  // France
    ES: 2724,  // Spain
    IT: 2380,  // Italy
    BR: 2076,  // Brazil
  }

  return locationMap[country.toUpperCase()] ?? 2840 // Default to US
}

/**
 * Fetch bulk keywords using DataForSEO Labs API
 * Returns historical keyword data (Volume, CPC, KD, Trends)
 * 
 * @param query - Search query or seed keyword
 * @param country - Target country code
 * @param options - Additional options
 * @returns KeywordDiscoveryResponse with standardized keywords
 */
export async function fetchBulkKeywords(
  query: string,
  country: string = "US",
  options: Partial<KeywordDiscoveryOptions> = {}
): Promise<KeywordDiscoveryResponse> {
  // Validate input
  if (!query || query.trim().length === 0) {
    return {
      success: false,
      keywords: [],
      totalCount: 0,
      error: "Query is required",
    }
  }

  // Check API configuration
  if (!dataForSEOClient.isConfigured()) {
    return {
      success: false,
      keywords: [],
      totalCount: 0,
      error: "DataForSEO API not configured. Add credentials to .env.local",
    }
  }

  try {
    // Build request payload
    const payload = buildLabsPayload({
      keyword: query.trim(),
      country,
      ...options,
    })

    // Make API request
    const response = await dataForSEOClient.request<LabsApiResult[]>(
      LABS_ENDPOINTS.RELATED_KEYWORDS,
      payload
    )

    if (!response.success || !response.data) {
      return {
        success: false,
        keywords: [],
        totalCount: 0,
        error: response.error ?? "Failed to fetch keywords",
      }
    }

    // Extract items from response
    const result = Array.isArray(response.data) ? response.data[0] : response.data
    const rawItems = result?.items ?? []
    
    // Map to standardized Keyword format
    const keywords = mapBulkKeywords(rawItems, "LABS")

    return {
      success: true,
      keywords,
      totalCount: result?.total_count ?? keywords.length,
      cost: response.cost,
    }
  } catch (error) {
    console.error("[KeywordDiscovery] Error fetching keywords:", error)
    return {
      success: false,
      keywords: [],
      totalCount: 0,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

/**
 * Fetch keyword suggestions (broader match)
 */
export async function fetchKeywordSuggestions(
  query: string,
  country: string = "US",
  limit: number = 50
): Promise<KeywordDiscoveryResponse> {
  if (!query || !dataForSEOClient.isConfigured()) {
    return {
      success: false,
      keywords: [],
      totalCount: 0,
      error: !query ? "Query is required" : "API not configured",
    }
  }

  try {
    const payload = [{
      keyword: query.trim(),
      location_code: getLocationCode(country),
      language_code: "en",
      limit,
      include_serp_info: true,
    }]

    const response = await dataForSEOClient.request<LabsApiResult[]>(
      LABS_ENDPOINTS.KEYWORD_SUGGESTIONS,
      payload
    )

    if (!response.success || !response.data) {
      return {
        success: false,
        keywords: [],
        totalCount: 0,
        error: response.error ?? "Failed to fetch suggestions",
      }
    }

    const result = Array.isArray(response.data) ? response.data[0] : response.data
    const rawItems = result?.items ?? []
    const keywords = mapBulkKeywords(rawItems, "LABS")

    return {
      success: true,
      keywords,
      totalCount: result?.total_count ?? keywords.length,
      cost: response.cost,
    }
  } catch (error) {
    console.error("[KeywordDiscovery] Error fetching suggestions:", error)
    return {
      success: false,
      keywords: [],
      totalCount: 0,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

/**
 * Fetch keywords for a specific site/domain
 */
export async function fetchKeywordsForSite(
  domain: string,
  country: string = "US",
  limit: number = 100
): Promise<KeywordDiscoveryResponse> {
  if (!domain || !dataForSEOClient.isConfigured()) {
    return {
      success: false,
      keywords: [],
      totalCount: 0,
      error: !domain ? "Domain is required" : "API not configured",
    }
  }

  try {
    const payload = [{
      target: domain.replace(/^https?:\/\//, "").replace(/\/$/, ""),
      location_code: getLocationCode(country),
      language_code: "en",
      limit,
      include_serp_info: true,
    }]

    const response = await dataForSEOClient.request<LabsApiResult[]>(
      LABS_ENDPOINTS.KEYWORDS_FOR_SITE,
      payload
    )

    if (!response.success || !response.data) {
      return {
        success: false,
        keywords: [],
        totalCount: 0,
        error: response.error ?? "Failed to fetch site keywords",
      }
    }

    const result = Array.isArray(response.data) ? response.data[0] : response.data
    const rawItems = result?.items ?? []
    const keywords = mapBulkKeywords(rawItems, "LABS")

    return {
      success: true,
      keywords,
      totalCount: result?.total_count ?? keywords.length,
      cost: response.cost,
    }
  } catch (error) {
    console.error("[KeywordDiscovery] Error fetching site keywords:", error)
    return {
      success: false,
      keywords: [],
      totalCount: 0,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}
