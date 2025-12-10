// ============================================
// DATAFORSEO KEYWORDS API
// ============================================
// Keyword research API methods
// ============================================

import { dataForSEOClient, type ApiResponse } from "./client"
import { DATAFORSEO } from "@/constants/api-endpoints"

// ============ TYPES ============

interface KeywordSearchVolume {
  keyword: string
  search_volume: number
  competition: number
  competition_level: "LOW" | "MEDIUM" | "HIGH"
  cpc: number
  monthly_searches: Array<{
    year: number
    month: number
    search_volume: number
  }>
}

interface KeywordSuggestion {
  keyword: string
  search_volume: number
  competition: number
  cpc: number
  keyword_difficulty: number
}

interface KeywordForSite {
  keyword: string
  search_volume: number
  cpc: number
  competition: number
  impressions_info: {
    last_month: number
    bid: number
  }
}

// ============ API METHODS ============

/**
 * Get search volume for keywords
 */
export async function getSearchVolume(
  keywords: string[],
  location_code: number = 2840, // US
  language_code: string = "en"
): Promise<ApiResponse<KeywordSearchVolume[]>> {
  const data = [
    {
      keywords,
      location_code,
      language_code,
    },
  ]

  return dataForSEOClient.request<KeywordSearchVolume[]>(
    DATAFORSEO.KEYWORDS.SEARCH_VOLUME,
    data
  )
}

/**
 * Get keyword suggestions for a seed keyword
 */
export async function getKeywordSuggestions(
  keyword: string,
  location_code: number = 2840,
  language_code: string = "en",
  limit: number = 100
): Promise<ApiResponse<KeywordSuggestion[]>> {
  const data = [
    {
      keyword,
      location_code,
      language_code,
      limit,
      include_seed_keyword: true,
      include_serp_info: true,
    },
  ]

  return dataForSEOClient.request<KeywordSuggestion[]>(
    DATAFORSEO.KEYWORDS.KEYWORD_SUGGESTIONS,
    data
  )
}

/**
 * Get keywords for a domain/site
 */
export async function getKeywordsForSite(
  target: string, // domain like "example.com"
  location_code: number = 2840,
  language_code: string = "en",
  limit: number = 100
): Promise<ApiResponse<KeywordForSite[]>> {
  const data = [
    {
      target,
      location_code,
      language_code,
      limit,
    },
  ]

  return dataForSEOClient.request<KeywordForSite[]>(
    DATAFORSEO.KEYWORDS.KEYWORDS_FOR_SITE,
    data
  )
}

/**
 * Get related keywords for a list of keywords
 */
export async function getRelatedKeywords(
  keywords: string[],
  location_code: number = 2840,
  language_code: string = "en",
  limit: number = 50
): Promise<ApiResponse<KeywordSuggestion[]>> {
  const data = [
    {
      keywords,
      location_code,
      language_code,
      limit,
    },
  ]

  return dataForSEOClient.request<KeywordSuggestion[]>(
    DATAFORSEO.KEYWORDS.KEYWORDS_FOR_KEYWORDS,
    data
  )
}

// Export all methods
export const keywordsApi = {
  getSearchVolume,
  getKeywordSuggestions,
  getKeywordsForSite,
  getRelatedKeywords,
}
