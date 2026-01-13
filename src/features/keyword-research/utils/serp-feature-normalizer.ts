// ============================================
// SERP FEATURE NORMALIZER
// ============================================
// Converts DataForSEO / legacy UI feature names into canonical keys.
// Canonical keys are used everywhere: parsing, filters, RTV, UI.
// ============================================

import type { SerpFeatureType } from "../types"

const CANONICAL_SERP_FEATURES = new Set<SerpFeatureType>([
  "ai_overview",
  "featured_snippet",
  "people_also_ask",
  "video_pack",
  "image_pack",
  "local_pack",
  "shopping_ads",
  "ads_top",
  "knowledge_panel",
  "top_stories",
  "direct_answer",
  "reviews",
])

/**
 * Normalize a single SERP feature into canonical key.
 * Returns null for unknown/unsupported values.
 */
export function normalizeSerpFeatureType(input: unknown): SerpFeatureType | null {
  if (typeof input !== "string") return null

  const raw = input.trim().toLowerCase()
  if (!raw) return null

  // Already canonical
  if (CANONICAL_SERP_FEATURES.has(raw as SerpFeatureType)) {
    return raw as SerpFeatureType
  }

  // ---------------------------------------------------------------------------
  // DataForSEO aliases / legacy UI values
  // ---------------------------------------------------------------------------

  // Featured snippet
  if (raw === "snippet") return "featured_snippet"
  if (raw === "answer_box") return "direct_answer"

  // People also ask / FAQ
  if (raw === "paa" || raw === "faq" || raw === "people_also_ask") return "people_also_ask"

  // Video
  if (raw === "video" || raw === "videos" || raw === "video_carousel") return "video_pack"

  // Images
  if (raw === "images" || raw === "image" || raw === "image_pack") return "image_pack"

  // Local / Maps
  if (raw === "local" || raw === "maps" || raw === "maps_search" || raw === "map") return "local_pack"

  // Shopping
  if (raw === "shopping" || raw === "shopping_results" || raw === "product" || raw === "product_listing") return "shopping_ads"

  // Ads
  if (raw === "paid" || raw === "ad" || raw === "ads" || raw === "top_ads") return "ads_top"

  // Knowledge panel
  if (raw === "knowledge_graph" || raw === "knowledge_panel") return "knowledge_panel"

  // News / Top stories
  if (raw === "news" || raw === "top_stories") return "top_stories"

  // Direct answer
  if (raw === "direct_answer") return "direct_answer"

  // Reviews
  if (raw === "review" || raw === "reviews") return "reviews"

  return null
}

/**
 * Normalize a list of raw SERP feature values into canonical keys.
 */
export function normalizeSerpFeatureTypes(input: unknown): SerpFeatureType[] {
  if (!Array.isArray(input)) return []

  const out: SerpFeatureType[] = []
  const seen = new Set<SerpFeatureType>()

  for (const raw of input) {
    const normalized = normalizeSerpFeatureType(raw)
    if (!normalized) continue
    if (seen.has(normalized)) continue

    out.push(normalized)
    seen.add(normalized)
  }

  return out
}
