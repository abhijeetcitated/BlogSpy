import type { Keyword } from "../types"
import type { KeywordFilters } from "../store"

const DEFAULT_RANGES = {
  volumeRange: [0, 10000000] as [number, number],
  kdRange: [0, 100] as [number, number],
  cpcRange: [0, 1000] as [number, number],
  geoRange: [0, 100] as [number, number],
}

const SERP_FEATURE_LABELS: Record<string, string> = {
  "ai overview": "ai_overview",
  ai_overview: "ai_overview",
  "featured snippet": "featured_snippet",
  featured_snippet: "featured_snippet",
  "faq / paa": "people_also_ask",
  "people also ask": "people_also_ask",
  people_also_ask: "people_also_ask",
  video: "video_pack",
  "video pack": "video_pack",
  video_pack: "video_pack",
  image: "image_pack",
  "image pack": "image_pack",
  image_pack: "image_pack",
  shopping: "shopping_ads",
  "shopping ads": "shopping_ads",
  shopping_ads: "shopping_ads",
  ads: "ads_top",
  ads_top: "ads_top",
  "local pack": "local_pack",
  local_pack: "local_pack",
  news: "top_stories",
  "top stories": "top_stories",
  top_stories: "top_stories",
  reviews: "reviews",
}

function normalizeSerpFeature(feature: string): string {
  const normalized = feature.trim().toLowerCase()
  if (!normalized) return ""
  if (SERP_FEATURE_LABELS[normalized]) {
    return SERP_FEATURE_LABELS[normalized]
  }
  const simplified = normalized.replace(/[^a-z0-9_]+/g, " ").trim()
  if (SERP_FEATURE_LABELS[simplified]) {
    return SERP_FEATURE_LABELS[simplified]
  }
  return simplified.replace(/\s+/g, "_")
}

export function isInRange(value: number | null | undefined, min: number, max: number): boolean {
  const normalized = value ?? 0
  return normalized >= min && normalized <= max
}

export function filterByRange(
  keywords: Keyword[],
  filters: Pick<KeywordFilters, "volumeRange" | "kdRange" | "cpcRange" | "geoRange">
): Keyword[] {
  const { volumeRange, kdRange, cpcRange, geoRange } = filters
  const checkVolume =
    volumeRange[0] !== DEFAULT_RANGES.volumeRange[0] ||
    volumeRange[1] !== DEFAULT_RANGES.volumeRange[1]
  const checkKd =
    kdRange[0] !== DEFAULT_RANGES.kdRange[0] || kdRange[1] !== DEFAULT_RANGES.kdRange[1]
  const checkCpc =
    cpcRange[0] !== DEFAULT_RANGES.cpcRange[0] ||
    cpcRange[1] !== DEFAULT_RANGES.cpcRange[1]
  const checkGeo =
    geoRange[0] !== DEFAULT_RANGES.geoRange[0] || geoRange[1] !== DEFAULT_RANGES.geoRange[1]

  if (!checkVolume && !checkKd && !checkCpc && !checkGeo) {
    return keywords
  }

  const results: Keyword[] = []

  for (const keyword of keywords) {
    if (checkVolume && !isInRange(keyword.volume, volumeRange[0], volumeRange[1])) {
      continue
    }
    if (checkKd && !isInRange(keyword.kd, kdRange[0], kdRange[1])) {
      continue
    }
    if (checkCpc && !isInRange(keyword.cpc, cpcRange[0], cpcRange[1])) {
      continue
    }
    if (checkGeo && !isInRange(keyword.geoScore ?? 0, geoRange[0], geoRange[1])) {
      continue
    }

    results.push(keyword)
  }

  return results
}

export function applyFilters(
  keywords: Keyword[],
  filters: Pick<
    KeywordFilters,
    | "volumeRange"
    | "kdRange"
    | "cpcRange"
    | "geoRange"
    | "selectedIntents"
    | "selectedSerpFeatures"
    | "includeKeywords"
    | "excludeKeywords"
    | "weakSpotTypes"
    | "selectedTrend"
    | "minTrendGrowth"
  >
): Keyword[] {
  const {
    volumeRange,
    kdRange,
    cpcRange,
    geoRange,
    selectedIntents,
    selectedSerpFeatures,
    includeKeywords,
    excludeKeywords,
    weakSpotTypes,
    selectedTrend,
    minTrendGrowth,
  } = filters
  const checkVolume =
    volumeRange[0] !== DEFAULT_RANGES.volumeRange[0] ||
    volumeRange[1] !== DEFAULT_RANGES.volumeRange[1]
  const checkKd =
    kdRange[0] !== DEFAULT_RANGES.kdRange[0] || kdRange[1] !== DEFAULT_RANGES.kdRange[1]
  const checkCpc =
    cpcRange[0] !== DEFAULT_RANGES.cpcRange[0] ||
    cpcRange[1] !== DEFAULT_RANGES.cpcRange[1]
  const checkGeo =
    geoRange[0] !== DEFAULT_RANGES.geoRange[0] || geoRange[1] !== DEFAULT_RANGES.geoRange[1]

  const intentSet =
    selectedIntents.length > 0
      ? new Set(selectedIntents.map((intent) => intent.trim().toUpperCase()).filter(Boolean))
      : null

  const serpSet =
    selectedSerpFeatures.length > 0
      ? new Set(
          selectedSerpFeatures
            .map((feature) => normalizeSerpFeature(feature))
            .filter(Boolean)
        )
      : null

  const weakSpotSet =
    weakSpotTypes.length > 0
      ? new Set(
          weakSpotTypes
            .map((platform) => platform.trim().toLowerCase())
            .filter(Boolean)
        )
      : null

  const trendSet =
    selectedTrend.length > 0
      ? new Set(
          selectedTrend
            .map((status) => status.trim().toLowerCase())
            .filter(Boolean)
        )
      : null

  const normalizedInclude = includeKeywords
    .map((word) => word.trim().toLowerCase())
    .filter(Boolean)
  const normalizedExclude = excludeKeywords
    .map((word) => word.trim().toLowerCase())
    .filter(Boolean)
  const useInclude = normalizedInclude.length > 0
  const useExclude = normalizedExclude.length > 0

  const growthThreshold = Math.max(0, minTrendGrowth ?? 0)
  const useGrowthThreshold = growthThreshold > 0

  if (
    !checkVolume &&
    !checkKd &&
    !checkCpc &&
    !checkGeo &&
    !intentSet &&
    !serpSet &&
    !useInclude &&
    !useExclude &&
    !weakSpotSet &&
    !trendSet &&
    !useGrowthThreshold
  ) {
    return keywords
  }

  const results: Keyword[] = []

  for (const keyword of keywords) {
    if (checkVolume && !isInRange(keyword.volume, volumeRange[0], volumeRange[1])) {
      continue
    }
    if (checkKd && !isInRange(keyword.kd, kdRange[0], kdRange[1])) {
      continue
    }
    if (checkCpc && !isInRange(keyword.cpc, cpcRange[0], cpcRange[1])) {
      continue
    }
    if (checkGeo && !isInRange(keyword.geoScore ?? 0, geoRange[0], geoRange[1])) {
      continue
    }

    if (intentSet) {
      const keywordIntents = keyword.intent ?? []
      const hasIntent = keywordIntents.some((intent) =>
        intentSet.has(intent.toUpperCase())
      )
      if (!hasIntent) {
        continue
      }
    }

    if (serpSet) {
      const keywordFeatures = keyword.serpFeatures ?? []
      const hasFeature = keywordFeatures.some((feature) =>
        serpSet.has(normalizeSerpFeature(feature))
      )
      if (!hasFeature) {
        continue
      }
    }

    if (weakSpotSet) {
      const ranked = keyword.weakSpots?.ranked ?? []
      const hasWeakSpot = ranked.some((entry) => weakSpotSet.has(entry.platform))
      if (!hasWeakSpot) {
        continue
      }
    }

    if (trendSet) {
      const status = (keyword.trendStatus ?? "stable").toLowerCase()
      if (!trendSet.has(status)) {
        continue
      }
    }

    if (useGrowthThreshold) {
      const series = keyword.trend ?? []
      if (series.length < 2) {
        continue
      }
      const first = series[0] ?? 0
      const last = series[series.length - 1] ?? 0
      const growthRate = (last - first) / Math.max(1, first)
      if (growthRate < growthThreshold) {
        continue
      }
    }

    if (useInclude || useExclude) {
      const keywordText = (keyword.keyword ?? "").toLowerCase()
      if (useInclude) {
        const includesAll = normalizedInclude.every((word) => keywordText.includes(word))
        if (!includesAll) {
          continue
        }
      }
      if (useExclude) {
        const includesAny = normalizedExclude.some((word) => keywordText.includes(word))
        if (includesAny) {
          continue
        }
      }
    }

    results.push(keyword)
  }

  return results
}
