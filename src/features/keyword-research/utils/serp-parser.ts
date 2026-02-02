import "server-only"

// ============================================
// SERP PARSER UTILITIES
// ============================================
// Logic for parsing SERP results to detect weak spots and features
// ============================================

import { normalizeSerpFeatureType } from "./serp-feature-normalizer"
import type { WeakSpots, SERPFeature, WeakSpotEntry, WeakSpotPlatform } from "../types"

/**
 * Canonical weak domains used across the Keyword Explorer.
 *
 * Kept as a simple constant so other modules (UI/services) can reuse the same
 * allowlist without importing regex patterns.
 */
export const WEAK_DOMAINS = [
  "reddit.com",
  "quora.com",
  "pinterest.com",
  "pinterest.co.uk",
  "medium.com",
  "forums",
] as const

export type WeakDomain = (typeof WEAK_DOMAINS)[number]

const WEAK_DOMAIN_PATTERNS: Record<WeakSpotPlatform, RegExp> = {
  reddit: /(^|\.)reddit\.com$/i,
  quora: /(^|\.)quora\.com$/i,
  pinterest: /(^|\.)pinterest\./i,
  medium: /(^|\.)medium\.com$/i,
  forums: /(^|\.)forums?\./i,
}

/**
 * Lightweight weak spot detector that returns a ranked list (top 10 only).
 *
 * This complements [`detectWeakSpots()`](src/features/keyword-research/utils/serp-parser.ts:86)
 * which returns the legacy object shape ({ reddit, quora, pinterest }).
 */
export function detectWeakSpotsRanked(items: unknown[]): WeakSpotEntry[] {
  const out: WeakSpotEntry[] = []
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

    const platform = (Object.entries(WEAK_DOMAIN_PATTERNS).find(([, pattern]) =>
      pattern.test(domain)
    )?.[0] ?? null) as WeakSpotPlatform | null

    const isForum =
      !platform &&
      (domain.toLowerCase().includes("forum") ||
        url.toLowerCase().includes("/forum") ||
        url.toLowerCase().includes("/forums"))

    if (!platform && !isForum) continue

    const resolvedPlatform = (isForum ? "forums" : platform) as WeakSpotPlatform

    // Keep only best (lowest rank) per platform.
    if (out.some((x) => x.platform === resolvedPlatform)) continue

    out.push({ platform: resolvedPlatform, rank, url, icon: resolvedPlatform })
  }

  return out.sort((a, b) => a.rank - b.rank)
}

/**
 * Analyze SERP items and return weak-spot hits (ranked, top 10 only).
 */
export function analyzeSerpForWeakSpots(items: unknown[]): WeakSpotEntry[] {
  if (!Array.isArray(items) || items.length === 0) {
    // Empty = UI renders "-" for Weak Spot column.
    return []
  }

  const out: WeakSpotEntry[] = []
  const seen = new Set<CoreWeakSpotPlatform>()

  for (const raw of items) {
    if (!raw || typeof raw !== "object") continue

    const item = raw as {
      domain?: unknown
      url?: unknown
      rank_absolute?: unknown
      rank_group?: unknown
      position?: unknown
    }

    const rank =
      (typeof item.rank_group === "number" ? item.rank_group : undefined) ??
      (typeof item.rank_absolute === "number" ? item.rank_absolute : undefined) ??
      (typeof item.position === "number" ? item.position : undefined) ??
      0

    // Hard cap: top 10 only.
    if (rank < 1 || rank > 10) continue

    const url = typeof item.url === "string" ? item.url : undefined
    const domain = typeof item.domain === "string" ? item.domain : extractDomain(url)
    if (!domain) continue

    const platform = Object.entries(PLATFORM_PATTERNS).find(([, pattern]) =>
      pattern.test(domain)
    )?.[0] as CoreWeakSpotPlatform | undefined

    if (!platform || seen.has(platform)) continue
    seen.add(platform)

    out.push({ platform, rank, url, icon: platform })
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
  const typeFeatures = (Array.isArray(itemTypes) ? itemTypes : [])
    .map((t) => normalizeSerpFeatureType(t))
    .filter((t): t is SERPFeature => t !== null)

  const itemTypeSet = new Set(typeFeatures)

  let video = itemTypeSet.has("video_pack")
  let snippet = itemTypeSet.has("featured_snippet")
  let shopping = itemTypeSet.has("shopping_ads")
  let ai_overview = itemTypeSet.has("ai_overview")

  if (Array.isArray(items)) {
    for (const raw of items) {
      if (!raw || typeof raw !== "object") continue
      const item = raw as { type?: unknown }
      const f = normalizeSerpFeatureType(item.type)
      if (!f) continue

      if (!video && f === "video_pack") video = true
      if (!snippet && f === "featured_snippet") snippet = true
      if (!shopping && f === "shopping_ads") shopping = true
      if (!ai_overview && f === "ai_overview") ai_overview = true

      if (video && snippet && shopping && ai_overview) break
    }
  }

  return { video, snippet, shopping, ai_overview }
}

type CoreWeakSpotPlatform = "reddit" | "quora" | "pinterest"

/**
 * Individual weak spot with rank (legacy object-based model)
 */
export interface WeakSpotItem {
  platform: CoreWeakSpotPlatform
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
const PLATFORM_PATTERNS: Record<CoreWeakSpotPlatform, RegExp> = {
  reddit: /reddit\.com/i,
  quora: /quora\.com/i,
  pinterest: /pinterest\.(com|co\.\w{2})/i,
}

// Feature normalization is centralized in:
// [`normalizeSerpFeatureType`](src/features/keyword-research/utils/serp-feature-normalizer.ts:1)

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
        const key = platform as CoreWeakSpotPlatform
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

  const foundPlatforms = new Set<CoreWeakSpotPlatform>()

  for (const item of organicItems) {
    const domain = item.domain || extractDomain(item.url)
    if (!domain) continue

    const rank = item.rank_group ?? item.rank_absolute ?? item.position ?? 0
    if (rank < 1 || rank > 10) continue

    for (const [platform, pattern] of Object.entries(PLATFORM_PATTERNS)) {
      if (pattern.test(domain) && !foundPlatforms.has(platform as CoreWeakSpotPlatform)) {
        foundPlatforms.add(platform as CoreWeakSpotPlatform)
        spots.push({
          platform: platform as CoreWeakSpotPlatform,
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
    const f = normalizeSerpFeatureType(item.type)
    if (!f) continue

    featuresSet.add(f)

    if (f === "video_pack") result.hasVideo = true
    if (f === "featured_snippet") result.hasSnippet = true
    if (f === "ai_overview") result.hasAIO = true
    if (f === "people_also_ask") result.hasFaq = true
    if (f === "local_pack") result.hasLocalPack = true
    if (f === "shopping_ads") result.hasShopping = true
    if (f === "top_stories") result.hasNews = true
    if (f === "image_pack") result.hasImages = true
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
export function hasWeakSpot(weakSpots: WeakSpots, platform: CoreWeakSpotPlatform): boolean {
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
export function getBestWeakSpot(weakSpots: WeakSpots): { platform: CoreWeakSpotPlatform; rank: number } | null {
  let best: { platform: CoreWeakSpotPlatform; rank: number } | null = null

  for (const [platform, rank] of Object.entries(weakSpots)) {
    if (rank !== null && (best === null || rank < best.rank)) {
      best = { platform: platform as CoreWeakSpotPlatform, rank }
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
    const f = normalizeSerpFeatureType(item.type)
    if (!f) continue

    if (!result.hasAIO && f === "ai_overview") result.hasAIO = true
    if (!result.hasLocal && f === "local_pack") result.hasLocal = true
    if (!result.hasSnippet && f === "featured_snippet") result.hasSnippet = true
    if (!result.hasAds && f === "ads_top") result.hasAds = true
    if (!result.hasVideo && f === "video_pack") result.hasVideo = true
    if (!result.hasShopping && f === "shopping_ads") result.hasShopping = true

    // Early exit if all detected
    if (result.hasAIO && result.hasLocal && result.hasSnippet && result.hasAds && result.hasVideo && result.hasShopping) {
      break
    }
  }

  return result
}
