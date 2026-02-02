// ============================================
// KEYWORD RESEARCH - Mock Keywords Data
// ============================================
// Realistic mock data for development/testing
// Pre-enriched via data mapper + calculators
// ============================================

import "server-only"

import type { Keyword, SERPFeature } from "../types"
import type { DataForSEOOrganicSerpItem, DataForSEOOrganicSerpResult } from "../types/api.types"
import { mapKeywordData } from "../utils/data-mapper"

/**
 * Raw mock keyword data (without RTV)
 */
const RAW_MOCK_KEYWORDS: Omit<Keyword, "rtv" | "rtvBreakdown">[] = [
  {
    id: 1,
    keyword: "best seo tools",
    intent: ["C", "I"],
    volume: 74500,
    trend: [65, 68, 72, 75, 78, 82, 85, 88, 90, 92, 94, 95],
    weakSpots: { reddit: 7, quora: 9, pinterest: 3 },
    kd: 42,
    cpc: 4.2,
    serpFeatures: ["video_pack", "featured_snippet", "ai_overview"],
    geoScore: 78,
    hasAio: true,
    dataSource: "mock",
  },
  {
    id: 2,
    keyword: "how to start a blog",
    intent: ["I"],
    volume: 165000,
    trend: [70, 72, 75, 78, 80, 82, 85, 87, 88, 90, 91, 92],
    weakSpots: { reddit: null, quora: 5, pinterest: 9 },
    kd: 35,
    cpc: 2.8,
    serpFeatures: ["featured_snippet", "people_also_ask", "video_pack"],
    geoScore: 85,
    hasAio: true,
    dataSource: "mock",
  },
  {
    id: 3,
    keyword: "ai writing tools",
    intent: ["C", "T"],
    volume: 45600,
    trend: [25, 35, 45, 55, 65, 72, 78, 82, 85, 88, 90, 92],
    weakSpots: { reddit: null, quora: null, pinterest: null },
    kd: 58,
    cpc: 5.5,
    serpFeatures: ["shopping_ads", "ai_overview", "reviews"],
    geoScore: 72,
    hasAio: true,
    dataSource: "mock",
  },
  {
    id: 4,
    keyword: "keyword research guide",
    intent: ["I"],
    volume: 22400,
    trend: [60, 62, 65, 68, 70, 72, 75, 78, 80, 82, 84, 85],
    weakSpots: { reddit: 9, quora: 6, pinterest: null },
    kd: 28,
    cpc: 1.9,
    serpFeatures: ["featured_snippet", "people_also_ask", "ai_overview"],
    geoScore: 92,
    hasAio: true,
    dataSource: "mock",
  },
  {
    id: 5,
    keyword: "content marketing strategy",
    intent: ["I", "C"],
    volume: 33200,
    trend: [55, 58, 60, 62, 65, 68, 70, 72, 74, 76, 78, 80],
    weakSpots: { reddit: 8, quora: 4, pinterest: null },
    kd: 45,
    cpc: 6.8,
    serpFeatures: ["video_pack", "featured_snippet"],
    geoScore: 65,
    hasAio: false,
    dataSource: "mock",
  },
  {
    id: 6,
    keyword: "affiliate marketing for beginners",
    intent: ["I", "T"],
    volume: 28100,
    trend: [40, 45, 50, 55, 60, 65, 70, 75, 78, 80, 82, 85],
    weakSpots: { reddit: 6, quora: null, pinterest: 10 },
    kd: 38,
    cpc: 3.2,
    serpFeatures: ["video_pack", "people_also_ask", "ai_overview"],
    geoScore: 88,
    hasAio: true,
    dataSource: "mock",
  },
  {
    id: 7,
    keyword: "social media management tools",
    intent: ["C"],
    volume: 18700,
    trend: [50, 52, 55, 58, 60, 62, 65, 68, 70, 72, 74, 75],
    weakSpots: { reddit: null, quora: null, pinterest: null },
    kd: 52,
    cpc: 8.9,
    serpFeatures: ["shopping_ads", "reviews"],
    geoScore: 55,
    hasAio: false,
    dataSource: "mock",
  },
  {
    id: 8,
    keyword: "email marketing best practices",
    intent: ["I"],
    volume: 14200,
    trend: [45, 48, 50, 52, 55, 58, 60, 62, 65, 68, 70, 72],
    weakSpots: { reddit: 5, quora: 7, pinterest: 8 },
    kd: 32,
    cpc: 4.5,
    serpFeatures: ["featured_snippet", "people_also_ask"],
    geoScore: 75,
    hasAio: true,
    dataSource: "mock",
  },
  {
    id: 9,
    keyword: "free keyword research tools",
    intent: ["T", "I"],
    volume: 12100,
    trend: [55, 58, 62, 65, 68, 72, 75, 78, 80, 82, 84, 86],
    weakSpots: { reddit: 3, quora: null, pinterest: null },
    kd: 25,
    cpc: 2.1,
    serpFeatures: ["video_pack", "featured_snippet", "ai_overview"],
    geoScore: 90,
    hasAio: true,
    dataSource: "mock",
  },
  {
    id: 10,
    keyword: "seo audit checklist",
    intent: ["I"],
    volume: 9800,
    trend: [40, 42, 45, 48, 50, 52, 55, 58, 60, 62, 64, 65],
    weakSpots: { reddit: null, quora: 7, pinterest: null },
    kd: 35,
    cpc: 3.8,
    serpFeatures: ["featured_snippet", "people_also_ask"],
    geoScore: 68,
    hasAio: false,
    dataSource: "mock",
  },
  {
    id: 11,
    keyword: "backlink building strategies",
    intent: ["I", "C"],
    volume: 8400,
    trend: [35, 38, 42, 45, 48, 52, 55, 58, 60, 62, 65, 68],
    weakSpots: { reddit: null, quora: null, pinterest: null },
    kd: 55,
    cpc: 5.2,
    serpFeatures: ["video_pack", "reviews"],
    geoScore: 42,
    hasAio: false,
    dataSource: "mock",
  },
  {
    id: 12,
    keyword: "local seo tips",
    intent: ["I"],
    volume: 7200,
    trend: [50, 52, 55, 58, 60, 62, 65, 68, 70, 72, 74, 75],
    weakSpots: { reddit: 5, quora: 9, pinterest: null },
    kd: 30,
    cpc: 2.5,
    serpFeatures: ["local_pack", "featured_snippet", "people_also_ask"],
    geoScore: 82,
    hasAio: true,
    dataSource: "mock",
  },
  {
    id: 13,
    keyword: "google analytics tutorial",
    intent: ["I"],
    volume: 19800,
    trend: [60, 62, 65, 68, 70, 72, 74, 76, 78, 80, 82, 84],
    weakSpots: { reddit: null, quora: null, pinterest: null },
    kd: 40,
    cpc: 3.4,
    serpFeatures: ["video_pack", "featured_snippet", "ai_overview"],
    geoScore: 78,
    hasAio: true,
    dataSource: "mock",
  },
  {
    id: 14,
    keyword: "ecommerce seo guide",
    intent: ["I", "C"],
    volume: 6100,
    trend: [30, 35, 40, 45, 50, 55, 60, 65, 68, 70, 72, 75],
    weakSpots: { reddit: null, quora: 10, pinterest: 6 },
    kd: 48,
    cpc: 7.2,
    serpFeatures: ["shopping_ads", "reviews"],
    geoScore: 58,
    hasAio: false,
    dataSource: "mock",
  },
  {
    id: 15,
    keyword: "wordpress seo plugins",
    intent: ["C", "T"],
    volume: 5400,
    trend: [45, 48, 50, 52, 55, 58, 60, 62, 64, 66, 68, 70],
    weakSpots: { reddit: 4, quora: null, pinterest: null },
    kd: 38,
    cpc: 4.8,
    serpFeatures: ["shopping_ads", "reviews", "featured_snippet"],
    geoScore: 72,
    hasAio: false,
    dataSource: "mock",
  },
]

const PLATFORM_DOMAINS: Record<"reddit" | "quora" | "pinterest", string> = {
  reddit: "reddit.com",
  quora: "quora.com",
  pinterest: "pinterest.com",
}

function intentToLabel(intent: Keyword["intent"]): string {
  if (intent.includes("I")) return "informational"
  if (intent.includes("C")) return "commercial"
  if (intent.includes("T")) return "transactional"
  if (intent.includes("N")) return "navigational"
  return "informational"
}

function buildMockSerp(item: Omit<Keyword, "rtv" | "rtvBreakdown">): DataForSEOOrganicSerpResult {
  const items: DataForSEOOrganicSerpItem[] = []

  const pushWeakSpot = (platform: keyof typeof PLATFORM_DOMAINS, rank: number | null) => {
    if (typeof rank !== "number") return
    const domain = PLATFORM_DOMAINS[platform]
    items.push({
      type: "organic",
      rank_group: rank,
      rank_absolute: rank,
      domain,
      url: `https://${domain}/thread/${rank}`,
    })
  }

  pushWeakSpot("reddit", item.weakSpots.reddit)
  pushWeakSpot("quora", item.weakSpots.quora)
  pushWeakSpot("pinterest", item.weakSpots.pinterest)

  return {
    keyword: item.keyword,
    item_types: item.serpFeatures as SERPFeature[],
    items,
    cpc: item.cpc,
    intent: intentToLabel(item.intent),
  }
}

function buildMockKeyword(item: Omit<Keyword, "rtv" | "rtvBreakdown">): Keyword {
  const serp = buildMockSerp(item)
  const computed = mapKeywordData(serp, {
    id: item.id,
    keyword: item.keyword,
    volume: item.volume,
    cpc: item.cpc,
    kd: item.kd,
    trend: item.trend,
    trendOrder: "oldest-first",
    intent: item.intent,
    countryCode: item.countryCode ?? "US",
  })

  return {
    ...computed,
    dataSource: "mock",
  }
}

/**
 * Pre-enriched mock keywords with calculator-driven metrics
 */
export const MOCK_KEYWORDS: Keyword[] = RAW_MOCK_KEYWORDS.map(buildMockKeyword)
