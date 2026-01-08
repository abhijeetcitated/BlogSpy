// ============================================
// SERP PARSER UTILITIES
// ============================================
// Logic for parsing SERP results to detect weak spots and features
// ============================================

import type { WeakSpots, SERPFeature } from "../types"

/**
 * Canonical weak domains used across the Keyword Explorer.
 *
 * Kept as a simple constant so other modules (UI/services) can reuse the same
 * allowlist without importing regex patterns.
 */
export const WEAK_DOMAINS = ["reddit.com", "quora.com", "pinterest.com"] as const

export type WeakDomain = (typeof WEAK_DOMAINS)[number]

export interface RankedWeakSpot {
  platform: "reddit" | "quora" | "pinterest"
  rank: number
  url: string
}

/**
 * Lightweight weak spot detector that returns a ranked list (top 10 only).
 *
 * This complements [`detectWeakSpots()`](src/features/keyword-research/utils/serp-parser.ts:86)
 * which returns the legacy object shape ({ reddit, quora, pinterest }).
 */
export function detectWeakSpotsRanked(items: unknown[]): RankedWeakSpot[] {
  const out: RankedWeakSpot[] = []
  if (!Array.isArray(items)) return out

  for (const raw of items.slice(0, 10)) {
    if (!raw || typeof raw !== "object") continue

    const item = raw as { domain?: unknown; url?: unknown; rank_absolute?: unknown; rank_group?: unknown; position?: unknown }

    const url = typeof item.url === "string" ? item.url : ""
    const domain = typeof item.domain === "string" ? item.domain : extractDomain(url)
    if (!domain) continue

    const rank =
      (typeof item.rank_group === "number" ? item.rank_group : undefined) ??
      (typeof item.rank_absolute === "number" ? item.rank_absolute : undefined) ??
      (typeof item.position === "number" ? item.position : undefined) ??
      0

    if (rank < 1 || rank > 10) continue

    const lower = domain.toLowerCase()
    const platform =
      lower.includes("reddit.com") ? "reddit" :
      lower.includes("quora.com") ? "quora" :
      lower.includes("pinterest.") ? "pinterest" :
      null

    if (!platform) continue

    // Keep only best (lowest rank) per platform.
    if (out.some((x) => x.platform === platform)) continue

    out.push({ platform, rank, url })
  }

  return out.sort((a, b) => a.rank - b.rank)
}

/**
 * Minimal SERP feature detector for call sites that only need a boolean matrix.
 *
 * Checks:
 * - itemTypes array (DataForSEO `serp_item_types`)
 * - items array (DataForSEO `items`, using `type`)
 */
export function detectSerpFeaturesSimple(
  items: unknown[],
  itemTypes: string[]
): { video: boolean; snippet: boolean; shopping: boolean; ai_overview: boolean } {
  const types = (Array.isArray(itemTypes) ? itemTypes : [])
    .filter((t): t is string => typeof t === "string")
    .map((t) => t.toLowerCase())

  const itemTypeSet = new Set(types)

  let video = itemTypeSet.has("video")
  let snippet = itemTypeSet.has("featured_snippet") || itemTypeSet.has("snippet")
  let shopping = itemTypeSet.has("shopping")
  let ai_overview = itemTypeSet.has("ai_overview")

  if (Array.isArray(items)) {
    for (const raw of items) {
      if (!raw || typeof raw !== "object") continue
      const item = raw as { type?: unknown }
      const t = typeof item.type === "string" ? item.type.toLowerCase() : ""

      if (!video && (t === "video" || t.includes("video"))) video = true
      if (!snippet && (t === "featured_snippet" || t.includes("snippet"))) snippet = true
      if (!shopping && (t === "shopping" || t.includes("shopping") || t.includes("product"))) shopping = true
      if (!ai_overview && (t === "ai_overview" || t.includes("ai_"))) ai_overview = true

      if (video && snippet && shopping && ai_overview) break
    }
  }

  return { video, snippet, shopping, ai_overview }
}

/**
 * Platform types for weak spot detection
 */
export type WeakSpotPlatform = "reddit" | "quora" | "pinterest"

/**
 * Individual weak spot with rank
 */
export interface WeakSpotItem {
  platform: WeakSpotPlatform
  rank: number
  url?: string
  title?: string
}

/**
 * Raw SERP item from DataForSEO API
 */
export interface RawSerpItem {
  type?: string
  rank_group?: number
  rank_absolute?: number
  position?: number
  domain?: string
  url?: string
  title?: string
  description?: string
  // Nested result for organic items
  items?: RawSerpItem[]
}

/**
 * Detected SERP features
 */
export interface DetectedFeatures {
  hasVideo: boolean
  hasSnippet: boolean
  hasAIO: boolean
  hasFaq: boolean
  hasLocalPack: boolean
  hasShopping: boolean
  hasNews: boolean
  hasImages: boolean
  features: SERPFeature[]
}

/**
 * Platform domain patterns for weak spot detection
 */
const PLATFORM_PATTERNS: Record<WeakSpotPlatform, RegExp> = {
  reddit: /reddit\.com/i,
  quora: /quora\.com/i,
  pinterest: /pinterest\.(com|co\.\w{2})/i,
}

/**
 * SERP type to feature mapping
 */
const SERP_TYPE_MAP: Record<string, SERPFeature> = {
  video: "video",
  featured_snippet: "snippet",
  ai_overview: "ai_overview",
  people_also_ask: "faq",
  local_pack: "local",
  shopping: "shopping",
  top_stories: "news",
  images: "image",
  reviews: "reviews",
}

/**
 * Detect weak spots (Reddit, Quora, Pinterest) in SERP results
 * Only considers top 10 organic results
 * 
 * @param items - Raw SERP items from API
 * @returns WeakSpots object with ranks (null if not in top 10)
 */
export function detectWeakSpots(items: RawSerpItem[]): WeakSpots {
  const result: WeakSpots = {
    reddit: null,
    quora: null,
    pinterest: null,
  }

  if (!items || !Array.isArray(items)) {
    return result
  }

  // Filter to organic results and limit to top 10
  const organicItems = items
    .filter(item => item.type === "organic" || !item.type)
    .slice(0, 10)

  for (const item of organicItems) {
    const domain = item.domain || extractDomain(item.url)
    if (!domain) continue

    const rank = item.rank_group ?? item.rank_absolute ?? item.position ?? 0
    if (rank < 1 || rank > 10) continue

    // Check each platform
    for (const [platform, pattern] of Object.entries(PLATFORM_PATTERNS)) {
      if (pattern.test(domain)) {
        const key = platform as WeakSpotPlatform
        // Only record first occurrence (highest rank)
        if (result[key] === null) {
          result[key] = rank
        }
      }
    }
  }

  return result
}

/**
 * Detect weak spots with full details (including URL and title)
 */
export function detectWeakSpotsDetailed(items: RawSerpItem[]): WeakSpotItem[] {
  const spots: WeakSpotItem[] = []

  if (!items || !Array.isArray(items)) {
    return spots
  }

  const organicItems = items
    .filter(item => item.type === "organic" || !item.type)
    .slice(0, 10)

  const foundPlatforms = new Set<WeakSpotPlatform>()

  for (const item of organicItems) {
    const domain = item.domain || extractDomain(item.url)
    if (!domain) continue

    const rank = item.rank_group ?? item.rank_absolute ?? item.position ?? 0
    if (rank < 1 || rank > 10) continue

    for (const [platform, pattern] of Object.entries(PLATFORM_PATTERNS)) {
      if (pattern.test(domain) && !foundPlatforms.has(platform as WeakSpotPlatform)) {
        foundPlatforms.add(platform as WeakSpotPlatform)
        spots.push({
          platform: platform as WeakSpotPlatform,
          rank,
          url: item.url,
          title: item.title,
        })
      }
    }
  }

  return spots.sort((a, b) => a.rank - b.rank)
}

/**
 * Detect SERP features from API response
 * 
 * @param items - Raw SERP items from API
 * @returns DetectedFeatures object
 */
export function detectSerpFeatures(items: RawSerpItem[]): DetectedFeatures {
  const result: DetectedFeatures = {
    hasVideo: false,
    hasSnippet: false,
    hasAIO: false,
    hasFaq: false,
    hasLocalPack: false,
    hasShopping: false,
    hasNews: false,
    hasImages: false,
    features: [],
  }

  if (!items || !Array.isArray(items)) {
    return result
  }

  const featuresSet = new Set<SERPFeature>()

  for (const item of items) {
    const itemType = item.type?.toLowerCase() || ""

    // Check direct type mapping
    const mappedFeature = SERP_TYPE_MAP[itemType]
    if (mappedFeature) {
      featuresSet.add(mappedFeature)
    }

    // Special checks for specific features
    if (itemType.includes("video") || itemType === "video") {
      result.hasVideo = true
      featuresSet.add("video")
    }

    if (itemType === "featured_snippet" || itemType.includes("snippet")) {
      result.hasSnippet = true
      featuresSet.add("snippet")
    }

    if (itemType === "ai_overview" || itemType.includes("ai_")) {
      result.hasAIO = true
      featuresSet.add("ai_overview")
    }

    if (itemType === "people_also_ask" || itemType === "faq") {
      result.hasFaq = true
      featuresSet.add("faq")
    }

    if (itemType === "local_pack" || itemType.includes("local")) {
      result.hasLocalPack = true
      featuresSet.add("local")
    }

    if (itemType === "shopping" || itemType.includes("product")) {
      result.hasShopping = true
      featuresSet.add("shopping")
    }

    if (itemType === "top_stories" || itemType === "news") {
      result.hasNews = true
      featuresSet.add("news")
    }

    if (itemType === "images" || itemType === "image_pack") {
      result.hasImages = true
      featuresSet.add("image")
    }
  }

  result.features = Array.from(featuresSet)
  return result
}

/**
 * Extract domain from URL
 */
function extractDomain(url: string | undefined): string | null {
  if (!url) return null
  try {
    const parsed = new URL(url)
    return parsed.hostname
  } catch {
    return null
  }
}

/**
 * Check if a specific platform is in weak spots
 */
export function hasWeakSpot(weakSpots: WeakSpots, platform: WeakSpotPlatform): boolean {
  return weakSpots[platform] !== null
}

/**
 * Count total weak spots detected
 */
export function countWeakSpots(weakSpots: WeakSpots): number {
  return Object.values(weakSpots).filter(v => v !== null).length
}

/**
 * Get the best (lowest rank) weak spot
 */
export function getBestWeakSpot(weakSpots: WeakSpots): { platform: WeakSpotPlatform; rank: number } | null {
  let best: { platform: WeakSpotPlatform; rank: number } | null = null

  for (const [platform, rank] of Object.entries(weakSpots)) {
    if (rank !== null && (best === null || rank < best.rank)) {
      best = { platform: platform as WeakSpotPlatform, rank }
    }
  }

  return best
}

/**
 * Traffic stealer detection result
 */
export interface TrafficStealers {
  hasAIO: boolean
  hasLocal: boolean
  hasSnippet: boolean
  hasAds: boolean
  hasVideo: boolean
  hasShopping: boolean
}

/**
 * Detect traffic-stealing SERP features from raw items array
 *
 * Used by RTV calculator to determine traffic loss
 *
 * @param items - Raw SERP items from DataForSEO API
 * @returns TrafficStealers object with boolean flags
 */
export function detectTrafficStealers(items: unknown[]): TrafficStealers {
  const result: TrafficStealers = {
    hasAIO: false,
    hasLocal: false,
    hasSnippet: false,
    hasAds: false,
    hasVideo: false,
    hasShopping: false,
  }

  if (!Array.isArray(items)) {
    return result
  }

  for (const raw of items) {
    if (!raw || typeof raw !== "object") continue

    const item = raw as { type?: unknown }
    const type = typeof item.type === "string" ? item.type.toLowerCase() : ""

    // AI Overview detection
    if (!result.hasAIO && (type === "ai_overview" || type.includes("ai_"))) {
      result.hasAIO = true
    }

    // Local Pack detection
    if (!result.hasLocal && (type === "local_pack" || type.includes("local") || type.includes("map"))) {
      result.hasLocal = true
    }

    // Featured Snippet detection
    if (!result.hasSnippet && (type === "featured_snippet" || type.includes("snippet"))) {
      result.hasSnippet = true
    }

    // Paid Ads detection
    if (!result.hasAds && (type === "paid" || type.includes("ad") || type === "top_ads")) {
      result.hasAds = true
    }

    // Video detection
    if (!result.hasVideo && (type === "video" || type === "video_carousel" || type.includes("video"))) {
      result.hasVideo = true
    }

    // Shopping detection
    if (!result.hasShopping && (type === "shopping" || type.includes("shopping") || type.includes("product"))) {
      result.hasShopping = true
    }

    // Early exit if all detected
    if (result.hasAIO && result.hasLocal && result.hasSnippet && result.hasAds && result.hasVideo && result.hasShopping) {
      break
    }
  }

  return result
}
