"use server"

// ============================================
// 🔐 FETCH KEYWORDS - Secured Server Action
// ============================================
// Bridge between UI and DataForSEO Labs API
// Supports mock mode for development/testing
// ============================================

import { z } from "zod"
import { action } from "@/lib/safe-action"  // Using public action for dev/testing
import type { Keyword, SERPFeature } from "../types"

// ============================================
// ZOD VALIDATION SCHEMA
// ============================================

const FetchKeywordsSchema = z.object({
  query: z.string().min(1, "Query is required").max(200, "Query too long"),
  country: z.string().length(2, "Country must be 2-letter code").default("US"),
})

// ============================================
// RESPONSE TYPE
// ============================================

export interface FetchKeywordsResponse {
  success: true
  data: Keyword[]
  meta?: {
    total: number
    source: "mock" | "dataforseo"
    query: string
    country: string
    timestamp: string
  }
}

// ============================================
// HELPER: Calculate GEO Score
// ============================================
// GEO Score = likelihood of ranking based on regional competition
// Higher = easier to rank in that region

function calculateGEOScore(
  volume: number,
  kd: number,
  cpc: number,
  hasLocalIntent: boolean
): number {
  // Base score from KD (inverted - lower KD = higher score)
  let score = Math.max(0, 100 - kd)

  // Adjust by volume (high volume = slightly harder)
  if (volume > 100000) score -= 10
  else if (volume > 50000) score -= 5
  else if (volume < 1000) score += 10

  // CPC indicates commercial value (higher = more competitive)
  if (cpc > 5) score -= 10
  else if (cpc > 3) score -= 5
  else if (cpc < 1) score += 5

  // Local intent bonus
  if (hasLocalIntent) score += 15

  // Clamp to 0-100
  return Math.max(0, Math.min(100, Math.round(score)))
}

// ============================================
// HELPER: Detect Weak Spot from SERP
// ============================================
// Weak Spot = Reddit/Quora/Pinterest ranking in top 10

interface WeakSpotResult {
  type: "reddit" | "quora" | null
  rank?: number
}

function detectWeakSpot(
  items: Array<{ domain?: string; rank_absolute?: number }>
): WeakSpotResult {
  const weakDomains = [
    { pattern: /reddit\.com/i, type: "reddit" as const },
    { pattern: /quora\.com/i, type: "quora" as const },
  ]

  for (const item of items || []) {
    if (!item.domain) continue
    
    for (const { pattern, type } of weakDomains) {
      if (pattern.test(item.domain)) {
        return {
          type,
          rank: item.rank_absolute,
        }
      }
    }
  }

  return { type: null }
}

// ============================================
// HELPER: Map Intent from DataForSEO
// ============================================

function mapIntent(
  intentInfo: { intent?: string; main_intent?: string } | null | undefined
): ("I" | "C" | "T" | "N")[] {
  if (!intentInfo) return ["I"]

  const intentMap: Record<string, "I" | "C" | "T" | "N"> = {
    informational: "I",
    commercial: "C",
    transactional: "T",
    navigational: "N",
  }

  const main = intentInfo.main_intent?.toLowerCase() || intentInfo.intent?.toLowerCase()
  const mapped = intentMap[main || "informational"] || "I"

  return [mapped]
}

// ============================================
// HELPER: Map SERP Features
// ============================================

function mapSerpFeatures(features: string[] | null | undefined): SERPFeature[] {
  if (!features || features.length === 0) return []

  const featureMap: Record<string, SERPFeature> = {
    featured_snippet: "snippet",
    ai_overview: "ai_overview",
    people_also_ask: "faq",
    reviews: "reviews",
    images: "image",
    video: "video",
    shopping_results: "shopping",
    ads: "ad",
    local_pack: "local",
    top_stories: "news",
    knowledge_panel: "knowledge_panel",
    video_carousel: "video",
    image_pack: "image",
  }

  return features
    .map((f) => featureMap[f.toLowerCase()] || null)
    .filter((f): f is SERPFeature => f !== null)
}

// ============================================
// MOCK DATA GENERATOR
// ============================================

function generateMockKeywords(query: string, count: number = 50): Keyword[] {
  const baseKeywords = [
    `${query}`,
    `best ${query}`,
    `${query} free`,
    `${query} online`,
    `${query} 2025`,
    `${query} for beginners`,
    `how to use ${query}`,
    `what is ${query}`,
    `${query} vs alternative`,
    `${query} review`,
    `${query} tutorial`,
    `${query} pricing`,
    `${query} alternatives`,
    `${query} features`,
    `${query} benefits`,
    `cheap ${query}`,
    `${query} download`,
    `${query} app`,
    `${query} software`,
    `${query} tool`,
    `${query} platform`,
    `${query} service`,
    `${query} comparison`,
    `${query} guide`,
    `top ${query}`,
    `${query} examples`,
    `${query} templates`,
    `${query} tips`,
    `${query} tricks`,
    `${query} hacks`,
    `${query} for business`,
    `${query} for students`,
    `${query} for professionals`,
    `enterprise ${query}`,
    `${query} api`,
    `${query} integration`,
    `${query} automation`,
    `${query} workflow`,
    `${query} strategy`,
    `${query} best practices`,
    `${query} mistakes to avoid`,
    `why use ${query}`,
    `when to use ${query}`,
    `${query} case study`,
    `${query} success stories`,
    `${query} roi`,
    `${query} cost`,
    `${query} free trial`,
    `${query} demo`,
    `${query} login`,
  ]

  const intents: ("I" | "C" | "T" | "N")[][] = [
    ["I"],
    ["C"],
    ["T"],
    ["N"],
    ["I", "C"],
    ["C", "T"],
  ]

  const serpFeatureOptions: SERPFeature[][] = [
    ["snippet"],
    ["video", "image"],
    ["faq", "snippet"],
    ["shopping", "reviews"],
    ["ai_overview"],
    ["local"],
    ["news"],
    ["snippet", "faq", "ai_overview"],
    [],
  ]

  const weakSpotOptions: WeakSpotResult[] = [
    { type: null },
    { type: null },
    { type: null },
    { type: "reddit", rank: Math.floor(Math.random() * 10) + 1 },
    { type: "quora", rank: Math.floor(Math.random() * 10) + 1 },
    { type: null },
    { type: "reddit", rank: Math.floor(Math.random() * 5) + 3 },
  ]

  return baseKeywords.slice(0, count).map((keyword, idx) => {
    const volume = Math.floor(Math.random() * 150000) + 100
    const kd = Math.floor(Math.random() * 100)
    const cpc = parseFloat((Math.random() * 10).toFixed(2))
    const hasLocalIntent = keyword.includes("near me") || keyword.includes("local")

    // Generate realistic 12-month trend
    const baseTrend = Math.floor(Math.random() * 50) + 20
    const trendDirection = Math.random() > 0.5 ? 1 : -1
    const trend = Array.from({ length: 12 }, (_, i) => {
      const variation = Math.floor(Math.random() * 15) - 7
      return Math.max(0, baseTrend + trendDirection * i * 3 + variation)
    })

    return {
      id: idx + 1,
      keyword,
      intent: intents[idx % intents.length],
      volume,
      trend,
      weakSpot: weakSpotOptions[idx % weakSpotOptions.length],
      kd,
      cpc,
      serpFeatures: serpFeatureOptions[idx % serpFeatureOptions.length],
      geoScore: calculateGEOScore(volume, kd, cpc, hasLocalIntent),
      dataSource: "mock" as const,
      updatedAt: new Date().toISOString(),
    }
  })
}

// ============================================
// � PUBLIC SERVER ACTION (Dev Mode)
// ============================================
// TODO: Switch back to authAction for production

export const fetchKeywords = action
  .schema(FetchKeywordsSchema)
  .action(async ({ parsedInput }): Promise<FetchKeywordsResponse> => {
    const { query, country } = parsedInput

    console.log(`[fetchKeywords] Searching: "${query}" in ${country}`)

    // ─────────────────────────────────────────
    // MOCK MODE (for development/testing)
    // ─────────────────────────────────────────
    if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true") {
      console.log("[fetchKeywords] Using MOCK data mode")

      // Simulate network delay (1 second)
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const mockData = generateMockKeywords(query, 50)

      return {
        success: true,
        data: mockData,
        meta: {
          total: mockData.length,
          source: "mock",
          query,
          country,
          timestamp: new Date().toISOString(),
        },
      }
    }

    // ─────────────────────────────────────────
    // REAL API MODE (DataForSEO Labs)
    // ─────────────────────────────────────────
    console.log("[fetchKeywords] Calling DataForSEO Labs API")

    const apiLogin = process.env.DATAFORSEO_LOGIN
    const apiPassword = process.env.DATAFORSEO_PASSWORD

    if (!apiLogin || !apiPassword) {
      throw new Error("DataForSEO credentials not configured")
    }

    // Prepare request body
    const requestBody = [
      {
        keyword: query.trim().toLowerCase(),
        location_code: getLocationCode(country),
        language_code: "en",
        depth: 2, // Related keywords depth
        limit: 100, // Max results
        include_seed_keyword: true,
        include_serp_info: true,
      },
    ]

    // Call DataForSEO Labs API
    const response = await fetch(
      "https://api.dataforseo.com/v3/dataforseo_labs/google/related_keywords/live",
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${Buffer.from(`${apiLogin}:${apiPassword}`).toString("base64")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      }
    )

    if (!response.ok) {
      console.error(`[fetchKeywords] API error: ${response.status} ${response.statusText}`)
      throw new Error(`DataForSEO API error: ${response.status}`)
    }

    const apiResponse = await response.json()

    // Validate response structure
    if (
      !apiResponse.tasks ||
      !apiResponse.tasks[0] ||
      apiResponse.tasks[0].status_code !== 20000
    ) {
      console.error("[fetchKeywords] Invalid API response:", apiResponse)
      throw new Error("Invalid response from DataForSEO")
    }

    const taskResult = apiResponse.tasks[0].result
    if (!taskResult || taskResult.length === 0) {
      return {
        success: true,
        data: [],
        meta: {
          total: 0,
          source: "dataforseo",
          query,
          country,
          timestamp: new Date().toISOString(),
        },
      }
    }

    // ─────────────────────────────────────────
    // TRANSFORM API RESPONSE → Keyword[]
    // ─────────────────────────────────────────
    const items = taskResult[0].items || []
    
    const keywords: Keyword[] = items.map(
      (item: DataForSEOKeywordItem, index: number) => {
        const keywordData = item.keyword_data || {}
        const serpInfo = item.serp_info || {}
        const volume = keywordData.search_volume || 0
        const kd = keywordData.keyword_difficulty || 0
        const cpc = keywordData.cpc || 0
        const hasLocalIntent = 
          (item.keyword?.includes("near me") || 
          serpInfo.serp_item_types?.includes("local_pack")) ?? false

        return {
          id: index + 1,
          keyword: item.keyword || "",
          intent: mapIntent(keywordData.keyword_info?.search_intent),
          volume,
          trend: keywordData.monthly_searches?.map((m: { search_volume: number }) => m.search_volume) || [],
          weakSpot: detectWeakSpot(serpInfo.serp_items || []),
          kd,
          cpc,
          serpFeatures: mapSerpFeatures(serpInfo.serp_item_types),
          geoScore: calculateGEOScore(volume, kd, cpc, hasLocalIntent),
          dataSource: "dataforseo" as const,
          updatedAt: new Date().toISOString(),
        }
      }
    )

    return {
      success: true,
      data: keywords,
      meta: {
        total: keywords.length,
        source: "dataforseo",
        query,
        country,
        timestamp: new Date().toISOString(),
      },
    }
  })

// ============================================
// HELPER: Country Code → Location Code
// ============================================
// DataForSEO uses numeric location codes

function getLocationCode(countryCode: string): number {
  const locationMap: Record<string, number> = {
    US: 2840, // United States
    GB: 2826, // United Kingdom
    CA: 2124, // Canada
    AU: 2036, // Australia
    DE: 2276, // Germany
    FR: 2250, // France
    IN: 2356, // India
    BR: 2076, // Brazil
    ES: 2724, // Spain
    IT: 2380, // Italy
    NL: 2528, // Netherlands
    JP: 2392, // Japan
    MX: 2484, // Mexico
    SG: 2702, // Singapore
    AE: 2784, // UAE
    ZA: 2710, // South Africa
  }

  return locationMap[countryCode.toUpperCase()] || 2840 // Default to US
}

// ============================================
// TYPE: DataForSEO API Response Item
// ============================================

interface DataForSEOKeywordItem {
  keyword: string
  keyword_data?: {
    search_volume?: number
    keyword_difficulty?: number
    cpc?: number
    monthly_searches?: Array<{ search_volume: number }>
    keyword_info?: {
      search_intent?: { intent?: string; main_intent?: string }
    }
  }
  serp_info?: {
    serp_item_types?: string[]
    serp_items?: Array<{ domain?: string; rank_absolute?: number }>
  }
}
