/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════
 * 🔍 DATAFORSEO CLIENT
 * ═══════════════════════════════════════════════════════════════════════════════════════════════
 * 
 * Global SEO data client using DataForSEO API.
 * Provides keyword research, SERP tracking, backlink analysis, and more.
 * 
 * API Documentation: https://docs.dataforseo.com/v3/
 * 
 * @example
 * ```ts
 * import { dataforseo } from "@/lib/seo/dataforseo"
 * 
 * const response = await dataforseo.post("/keywords_data/google/search_volume/live", [
 *   { keywords: ["best seo tools", "keyword research"], location_code: 2840 }
 * ])
 * ```
 */

import axios, { AxiosInstance, AxiosError, AxiosResponse } from "axios"

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// ENVIRONMENT VALIDATION
// ═══════════════════════════════════════════════════════════════════════════════════════════════

interface DataForSEOCredentials {
  login: string
  password: string
}

/**
 * Check if mock mode is enabled.
 * In mock mode, we don't need real credentials.
 */
function isMockMode(): boolean {
  return process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true"
}

function getDataForSEOCredentials(): DataForSEOCredentials {
  // In mock mode, return dummy credentials (they won't be used)
  if (isMockMode()) {
    return { login: "mock", password: "mock" }
  }

  const login = process.env.DATAFORSEO_LOGIN
  const password = process.env.DATAFORSEO_PASSWORD

  if (!login) {
    throw new Error(
      "❌ Missing DATAFORSEO_LOGIN environment variable. " +
      "Get your credentials from https://app.dataforseo.com/api-dashboard"
    )
  }

  if (!password) {
    throw new Error(
      "❌ Missing DATAFORSEO_PASSWORD environment variable. " +
      "Get your credentials from https://app.dataforseo.com/api-dashboard"
    )
  }

  return { login, password }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// API ENDPOINTS
// ═══════════════════════════════════════════════════════════════════════════════════════════════

/**
 * DataForSEO API endpoints for quick reference.
 */
export const DATAFORSEO_ENDPOINTS = {
  // Keywords Data
  KEYWORD_SEARCH_VOLUME: "/keywords_data/google/search_volume/live",
  KEYWORD_SUGGESTIONS: "/keywords_data/google/keywords_for_site/live",
  KEYWORD_IDEAS: "/keywords_data/google/keyword_ideas/live",
  
  // SERP API
  SERP_LIVE: "/serp/google/organic/live/regular",
  SERP_TASK_POST: "/serp/google/organic/task_post",
  SERP_TASK_GET: "/serp/google/organic/task_get/regular",
  
  // Backlinks
  BACKLINKS_SUMMARY: "/backlinks/summary/live",
  BACKLINKS_LIST: "/backlinks/backlinks/live",
  REFERRING_DOMAINS: "/backlinks/referring_domains/live",
  
  // On-Page SEO
  ONPAGE_TASK_POST: "/on_page/task_post",
  ONPAGE_SUMMARY: "/on_page/summary",
  ONPAGE_PAGES: "/on_page/pages",
  
  // Domain Analytics
  DOMAIN_OVERVIEW: "/domain_analytics/overview/live",
  DOMAIN_TECHNOLOGIES: "/domain_analytics/technologies/live",
  
  // Content Analysis
  CONTENT_ANALYSIS: "/content_analysis/search/live",
} as const

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// CLIENT CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════════════════════

/**
 * DataForSEO client configuration options.
 */
interface DataForSEOConfig {
  /** Request timeout in milliseconds (default: 30000) */
  timeout?: number
  /** Base URL (default: https://api.dataforseo.com/v3) */
  baseURL?: string
}

/**
 * Creates a DataForSEO Axios client instance.
 */
function createDataForSEOClient(config: DataForSEOConfig = {}): AxiosInstance {
  const { timeout = 30000, baseURL = "https://api.dataforseo.com/v3" } = config
  const { login, password } = getDataForSEOCredentials()

  // Create Base64 encoded credentials for Basic Auth
  const credentials = Buffer.from(`${login}:${password}`).toString("base64")

  const client = axios.create({
    baseURL,
    timeout,
    headers: {
      "Authorization": `Basic ${credentials}`,
      "Content-Type": "application/json",
    },
  })

  // Response interceptor for error handling
  client.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error: AxiosError) => {
      if (error.response) {
        const status = error.response.status
        const data = error.response.data as Record<string, unknown>

        // Handle specific DataForSEO error codes
        switch (status) {
          case 401:
            throw new Error("❌ DataForSEO: Invalid credentials. Check your login/password.")
          case 402:
            throw new Error("❌ DataForSEO: Insufficient balance. Top up your account.")
          case 403:
            throw new Error("❌ DataForSEO: Access forbidden. Check your API permissions.")
          case 429:
            throw new Error("❌ DataForSEO: Rate limit exceeded. Slow down requests.")
          case 500:
            throw new Error("❌ DataForSEO: Server error. Try again later.")
          default:
            throw new Error(
              `❌ DataForSEO Error (${status}): ${data?.status_message || "Unknown error"}`
            )
        }
      }

      if (error.code === "ECONNABORTED") {
        throw new Error("❌ DataForSEO: Request timeout. Try again.")
      }

      throw error
    }
  )

  return client
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// SINGLETON INSTANCE
// ═══════════════════════════════════════════════════════════════════════════════════════════════

/**
 * Singleton pattern for DataForSEO client.
 */
let dataforseoInstance: AxiosInstance | null = null

/**
 * Get or create the DataForSEO client instance.
 */
export function getDataForSEOClient(): AxiosInstance {
  if (!dataforseoInstance) {
    dataforseoInstance = createDataForSEOClient()
  }
  return dataforseoInstance
}

/**
 * Global DataForSEO client instance (lazy initialized).
 * Use this for all SEO data operations.
 * 
 * NOTE: In mock mode, this client should NOT be used directly.
 * Always check mock mode before making actual API calls.
 * 
 * @example
 * ```ts
 * import { getDataForSEOClient } from "@/lib/seo/dataforseo"
 * 
 * const dataforseo = getDataForSEOClient()
 * const { data } = await dataforseo.post("/keywords_data/google/search_volume/live", [
 *   { keywords: ["seo tools"], location_code: 2840 }
 * ])
 * ```
 */
// IMPORTANT: Do NOT eagerly initialize - use getDataForSEOClient() instead
// export const dataforseo = getDataForSEOClient() // This throws in mock mode!

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// RESPONSE TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════════════

/**
 * Standard DataForSEO API response structure.
 */
export interface DataForSEOResponse<T = unknown> {
  version: string
  status_code: number
  status_message: string
  time: string
  cost: number
  tasks_count: number
  tasks_error: number
  tasks: Array<{
    id: string
    status_code: number
    status_message: string
    time: string
    cost: number
    result_count: number
    path: string[]
    data: Record<string, unknown>
    result: T[]
  }>
}

/**
 * Keyword data result from search volume endpoint.
 */
export interface KeywordDataResult {
  keyword: string
  location_code: number
  language_code: string
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

/**
 * SERP result item.
 */
export interface SerpResultItem {
  type: string
  rank_group: number
  rank_absolute: number
  position: string
  title: string
  url: string
  domain: string
  description: string
  breadcrumb: string
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════════════════════

/**
 * Get search volume for keywords.
 * 
 * @param keywords - Array of keywords to check
 * @param locationCode - Location code (default: 2840 = USA)
 * @param languageCode - Language code (default: "en")
 */
export async function getKeywordSearchVolume(
  keywords: string[],
  locationCode: number = 2840,
  languageCode: string = "en"
): Promise<KeywordDataResult[]> {
  const client = getDataForSEOClient()
  const response = await client.post<DataForSEOResponse<KeywordDataResult>>(
    DATAFORSEO_ENDPOINTS.KEYWORD_SEARCH_VOLUME,
    [{ keywords, location_code: locationCode, language_code: languageCode }]
  )

  return response.data.tasks[0]?.result || []
}

/**
 * Get SERP results for a keyword.
 * 
 * @param keyword - Keyword to search
 * @param locationCode - Location code (default: 2840 = USA)
 * @param languageCode - Language code (default: "en")
 * @param depth - Number of results to fetch (default: 10)
 */
export async function getSerpResults(
  keyword: string,
  locationCode: number = 2840,
  languageCode: string = "en",
  depth: number = 10
): Promise<SerpResultItem[]> {
  const client = getDataForSEOClient()
  const response = await client.post<DataForSEOResponse<{ items: SerpResultItem[] }>>(
    DATAFORSEO_ENDPOINTS.SERP_LIVE,
    [{
      keyword,
      location_code: locationCode,
      language_code: languageCode,
      depth,
    }]
  )

  return response.data.tasks[0]?.result[0]?.items || []
}
