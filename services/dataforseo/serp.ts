// ============================================
// DATAFORSEO SERP API
// ============================================
// Search results and ranking data
// ============================================

import { dataForSEOClient, type ApiResponse } from "./client"
import { DATAFORSEO } from "@/constants/api-endpoints"

// ============ TYPES ============

interface SerpResult {
  type: string
  rank_group: number
  rank_absolute: number
  domain: string
  title: string
  description: string
  url: string
  breadcrumb: string
}

interface SerpData {
  keyword: string
  se_domain: string
  location_code: number
  language_code: string
  items_count: number
  items: SerpResult[]
  check_url: string
}

interface SerpFeature {
  type: string
  position: number[]
  xpath: string
  items?: unknown[]
}

// ============ API METHODS ============

/**
 * Get Google organic SERP results
 */
export async function getGoogleOrganicResults(
  keyword: string,
  location_code: number = 2840, // US
  language_code: string = "en",
  depth: number = 100
): Promise<ApiResponse<SerpData>> {
  const data = [
    {
      keyword,
      location_code,
      language_code,
      depth,
      calculate_rectangles: false,
    },
  ]

  return dataForSEOClient.request<SerpData>(
    DATAFORSEO.SERP.GOOGLE_ORGANIC,
    data
  )
}

/**
 * Get SERP for multiple keywords (batch)
 */
export async function getBatchSerpResults(
  keywords: string[],
  location_code: number = 2840,
  language_code: string = "en",
  depth: number = 10
): Promise<ApiResponse<SerpData[]>> {
  const data = keywords.map((keyword) => ({
    keyword,
    location_code,
    language_code,
    depth,
  }))

  return dataForSEOClient.request<SerpData[]>(
    DATAFORSEO.SERP.GOOGLE_ORGANIC,
    data
  )
}

/**
 * Get current ranking position for a domain/keyword
 */
export async function getRankingPosition(
  keyword: string,
  targetDomain: string,
  location_code: number = 2840,
  language_code: string = "en"
): Promise<ApiResponse<{ position: number | null; url: string | null }>> {
  const response = await getGoogleOrganicResults(
    keyword,
    location_code,
    language_code,
    100
  )

  if (!response.success || !response.data) {
    return { success: false, error: response.error }
  }

  const items = response.data.items || []
  const found = items.find((item) => 
    item.domain?.includes(targetDomain) || item.url?.includes(targetDomain)
  )

  return {
    success: true,
    data: {
      position: found?.rank_absolute || null,
      url: found?.url || null,
    },
  }
}

/**
 * Check rankings for multiple keywords
 */
export async function checkBulkRankings(
  keywords: string[],
  targetDomain: string,
  location_code: number = 2840
): Promise<
  ApiResponse<
    Array<{
      keyword: string
      position: number | null
      url: string | null
    }>
  >
> {
  const results: Array<{
    keyword: string
    position: number | null
    url: string | null
  }> = []

  // Process in batches to avoid rate limits
  for (const keyword of keywords) {
    const result = await getRankingPosition(keyword, targetDomain, location_code)
    results.push({
      keyword,
      position: result.data?.position || null,
      url: result.data?.url || null,
    })
  }

  return { success: true, data: results }
}

// Export all methods
export const serpApi = {
  getGoogleOrganicResults,
  getBatchSerpResults,
  getRankingPosition,
  checkBulkRankings,
}
