// ============================================
// KEYWORD MAGIC - Mock Data
// ============================================

import "server-only"

import type { Keyword, SERPFeature, WeakSpotEntry } from "../types"
import type { DataForSEOOrganicSerpItem, DataForSEOOrganicSerpResult } from "../types/api.types"
import { mapKeywordData } from "../utils/data-mapper"

const RAW_MOCK_KEYWORDS: Keyword[] = [
  {
    id: 1,
    keyword: "best ai tools 2024",
    intent: ["C", "I"],
    volume: 74500,
    trend: [20, 35, 28, 45, 52, 58, 65, 72, 80, 85, 90, 95],
    weakSpots: { reddit: 7, quora: null, pinterest: 4 }, // Reddit #7, Pinterest #4 in SERP
    kd: 42,
    cpc: 4.2,
    serpFeatures: ["video_pack", "featured_snippet", "ai_overview"],
    geoScore: 78,
  },
  {
    id: 2,
    keyword: "ai writing tools free",
    intent: ["T"],
    volume: 33200,
    trend: [30, 35, 40, 45, 50, 55, 58, 62, 65, 70, 72, 75],
    weakSpots: { reddit: null, quora: 5, pinterest: null },
    kd: 35,
    cpc: 2.8,
    serpFeatures: ["featured_snippet", "people_also_ask"],
    geoScore: 65,
  },
  {
    id: 3,
    keyword: "chatgpt alternatives",
    intent: ["C", "T"],
    volume: 28100,
    trend: [15, 25, 40, 55, 60, 58, 55, 52, 50, 48, 45, 42],
    weakSpots: { reddit: 3, quora: null, pinterest: 8 }, // Reddit #3, Pinterest #8 in SERP
    kd: 58,
    cpc: 3.5,
    serpFeatures: ["shopping_ads", "ai_overview"],
    geoScore: 82,
  },
  {
    id: 4,
    keyword: "what is generative ai",
    intent: ["I"],
    volume: 22400,
    trend: [25, 30, 35, 40, 45, 48, 52, 55, 58, 60, 62, 65],
    weakSpots: { reddit: 9, quora: null, pinterest: null },
    kd: 28,
    cpc: 1.9,
    serpFeatures: ["featured_snippet", "people_also_ask", "ai_overview"],
    geoScore: 92,
  },
  {
    id: 5,
    keyword: "ai image generator",
    intent: ["T"],
    volume: 165000,
    trend: [40, 50, 60, 70, 75, 80, 82, 85, 88, 90, 92, 95],
    weakSpots: { reddit: null, quora: null, pinterest: 2 }, // Pinterest #2 - visual keyword!
    kd: 62,
    cpc: 3.2,
    serpFeatures: ["video_pack", "image_pack"],
    geoScore: 45,
  },
  {
    id: 6,
    keyword: "best ai for coding",
    intent: ["C", "I"],
    volume: 18700,
    trend: [10, 15, 22, 30, 38, 45, 52, 58, 65, 70, 75, 80],
    weakSpots: { reddit: 6, quora: 8, pinterest: null }, // Reddit #6, Quora #8
    kd: 45,
    cpc: 5.5,
    serpFeatures: ["reviews", "ai_overview"],
    geoScore: 71,
  },
  {
    id: 7,
    keyword: "ai tools for business",
    intent: ["C"],
    volume: 14200,
    trend: [35, 38, 42, 45, 48, 50, 52, 55, 58, 60, 62, 65],
    weakSpots: { reddit: 3, quora: 5, pinterest: 7 }, // ALL 3 PLATFORMS - High opportunity!
    kd: 52,
    cpc: 6.8,
    serpFeatures: ["reviews", "shopping_ads"],
    geoScore: 55,
  },
  {
    id: 8,
    keyword: "claude vs chatgpt",
    intent: ["C"],
    volume: 12100,
    trend: [5, 10, 18, 28, 40, 55, 65, 72, 78, 82, 85, 88],
    weakSpots: { reddit: 2, quora: 4, pinterest: null }, // Reddit #2, Quora #4
    kd: 38,
    cpc: 4.2,
    serpFeatures: ["video_pack", "reviews", "ai_overview"],
    geoScore: 88,
  },
  {
    id: 9,
    keyword: "ai productivity tools",
    intent: ["C", "T"],
    volume: 9800,
    trend: [20, 25, 30, 35, 40, 45, 50, 55, 58, 62, 65, 68],
    weakSpots: { reddit: 4, quora: null, pinterest: null },
    kd: 32,
    cpc: 3.8,
    serpFeatures: ["featured_snippet"],
    geoScore: 48,
  },
  {
    id: 10,
    keyword: "ai content generator",
    intent: ["T"],
    volume: 8400,
    trend: [30, 35, 38, 42, 45, 48, 50, 52, 55, 58, 60, 62],
    weakSpots: { reddit: null, quora: null, pinterest: null },
    kd: 55,
    cpc: 4.8,
    serpFeatures: ["reviews"],
    geoScore: 35,
  },
  {
    id: 11,
    keyword: "free ai tools online",
    intent: ["T", "I"],
    volume: 7200,
    trend: [40, 45, 48, 52, 55, 58, 60, 62, 65, 68, 70, 72],
    weakSpots: { reddit: null, quora: 3, pinterest: null },
    kd: 25,
    cpc: 1.5,
    serpFeatures: ["video_pack", "featured_snippet"],
    geoScore: 52,
  },
  {
    id: 12,
    keyword: "ai seo tools",
    intent: ["C"],
    volume: 6100,
    trend: [15, 20, 28, 35, 42, 48, 55, 60, 65, 70, 75, 80],
    weakSpots: { reddit: 10, quora: null, pinterest: null },
    kd: 48,
    cpc: 7.2,
    serpFeatures: ["shopping_ads", "reviews"],
    geoScore: 42,
  },
  {
    id: 13,
    keyword: "how to use midjourney",
    intent: ["I"],
    volume: 45600,
    trend: [50, 55, 60, 65, 68, 72, 75, 78, 80, 82, 85, 88],
    weakSpots: { reddit: 3, quora: null, pinterest: null },
    kd: 18,
    cpc: 2.1,
    serpFeatures: ["video_pack", "featured_snippet", "people_also_ask", "ai_overview"],
    geoScore: 85,
  },
  {
    id: 14,
    keyword: "ai marketing automation",
    intent: ["C", "T"],
    volume: 5400,
    trend: [20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75],
    weakSpots: { reddit: null, quora: null, pinterest: null },
    kd: 68,
    cpc: 12.5,
    serpFeatures: ["shopping_ads", "reviews"],
    geoScore: 28,
  },
  {
    id: 15,
    keyword: "ai chatbot for website",
    intent: ["T", "C"],
    volume: 4800,
    trend: [35, 40, 45, 48, 52, 55, 58, 60, 62, 65, 68, 70],
    weakSpots: { reddit: null, quora: 6, pinterest: null },
    kd: 41,
    cpc: 8.9,
    serpFeatures: ["shopping_ads"],
    geoScore: 38,
  },
  {
    id: 16,
    keyword: "openai api tutorial",
    intent: ["I"],
    volume: 3200,
    trend: [10, 15, 22, 30, 40, 50, 58, 65, 72, 78, 82, 85],
    weakSpots: { reddit: 2, quora: null, pinterest: null },
    kd: 22,
    cpc: 3.4,
    serpFeatures: ["video_pack", "featured_snippet", "ai_overview"],
    geoScore: 75,
  },
  {
    id: 17,
    keyword: "ai video editing software",
    intent: ["T"],
    volume: 19800,
    trend: [45, 50, 55, 60, 62, 65, 68, 70, 72, 75, 78, 80],
    weakSpots: { reddit: null, quora: null, pinterest: null },
    kd: 72,
    cpc: 5.6,
    serpFeatures: ["video_pack", "shopping_ads", "reviews"],
    geoScore: 32,
  },
  {
    id: 18,
    keyword: "machine learning course free",
    intent: ["N", "T"],
    volume: 28500,
    trend: [60, 62, 65, 68, 70, 72, 74, 76, 78, 80, 82, 84],
    weakSpots: { reddit: 5, quora: null, pinterest: null },
    kd: 35,
    cpc: 4.2,
    serpFeatures: ["people_also_ask", "reviews", "ai_overview"],
    geoScore: 68,
  },
]

const PLATFORM_DOMAINS: Record<Exclude<WeakSpotEntry["platform"], "medium" | "forums">, string> = {
  reddit: "reddit.com",
  quora: "quora.com",
  pinterest: "pinterest.com",
}

function createSeededRandom(seed: number): () => number {
  let state = seed >>> 0
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0
    return state / 4294967296
  }
}

function randomizeTrend(baseTrend: number[], seed: number): number[] {
  const rand = createSeededRandom(seed)
  const base = baseTrend.length >= 12 ? baseTrend.slice(0, 12) : [
    ...baseTrend,
    ...Array.from({ length: Math.max(0, 12 - baseTrend.length) }, () => 0),
  ]

  const scale = 0.85 + rand() * 0.4 // 0.85 - 1.25
  const offset = (rand() - 0.5) * 12 // -6 to +6
  const slope = (rand() - 0.5) * 2 // -1 to +1 per step

  return base.map((value, index) => {
    const noise = (rand() - 0.5) * 6 // -3 to +3
    const adjusted = (value + offset + slope * index) * scale + noise
    const clamped = Math.max(0, Math.min(100, Math.round(adjusted)))
    return clamped
  })
}

function intentToLabel(intent: Keyword["intent"]): string {
  if (intent.includes("I")) return "informational"
  if (intent.includes("C")) return "commercial"
  if (intent.includes("T")) return "transactional"
  if (intent.includes("N")) return "navigational"
  return "informational"
}

function buildMockSerp(item: Keyword): DataForSEOOrganicSerpResult {
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

export const MOCK_KEYWORDS: Keyword[] = RAW_MOCK_KEYWORDS.map((item) => {
  const randomizedTrend = randomizeTrend(item.trend, item.id)
  const serp = buildMockSerp(item)
  const computed = mapKeywordData(serp, {
    id: item.id,
    keyword: item.keyword,
    volume: item.volume,
    cpc: item.cpc,
    kd: item.kd,
    trend: randomizedTrend,
    trendOrder: "oldest-first",
    intent: item.intent,
    countryCode: item.countryCode ?? "US",
  })

  return {
    ...item,
    trendRaw: randomizedTrend,
    trend: computed.trend,
    trendStatus: computed.trendStatus,
    serpFeatures: computed.serpFeatures,
    rtv: computed.rtv,
    rtvBreakdown: computed.rtvBreakdown,
    geoScore: computed.geoScore,
    weakSpots: computed.weakSpots,
    weakSpot: computed.weakSpot,
    hasAio: computed.hasAio,
    dataSource: "mock",
  }
})
