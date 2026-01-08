// ============================================
// KEYWORD MAGIC - Mock Utilities
// ============================================
// Shared mock data generators
// ============================================

import type { APIKeyword } from "../types/api.types"
import type { Keyword } from "../types"

// ============================================
// CONVERSION FUNCTIONS
// ============================================

export function convertToAPIKeyword(keyword: Keyword): APIKeyword {
  const trendGrowth = keyword.trend.length >= 2
    ? ((keyword.trend[keyword.trend.length - 1] - keyword.trend[0]) / keyword.trend[0]) * 100
    : 0
  
  return {
    id: keyword.id.toString(),
    keyword: keyword.keyword,
    volume: keyword.volume,
    trend: {
      values: keyword.trend,
      labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].slice(0, keyword.trend.length),
      growthPercent: Math.round(trendGrowth),
      direction: trendGrowth > 5 ? "up" : trendGrowth < -5 ? "down" : "stable",
      seasonality: "evergreen",
    },
    kd: keyword.kd,
    cpc: keyword.cpc,
    competition: keyword.kd < 30 ? "low" : keyword.kd < 60 ? "medium" : "high",
    intent: {
      primary: keyword.intent[0],
      secondary: keyword.intent.slice(1),
      confidence: 85,
      all: keyword.intent,
    },
    serp: {
      features: keyword.serpFeatures.map((f, i) => ({
        type: f,
        position: i + 1,
        clickShare: 10,
      })),
      organicResults: 10,
      adsCount: 4,
      paaQuestions: [],
      relatedSearches: [],
    },
    rtv: {
      value: Math.round(keyword.volume * 0.6),
      percentage: 60,
      opportunityLevel: "good",
      ctrStealers: [],
    },
    geoScore: {
      score: keyword.geoScore ?? 50,
      level: (keyword.geoScore ?? 50) >= 70 ? "excellent" : (keyword.geoScore ?? 50) >= 50 ? "good" : "moderate",
      factors: {
        contentClarity: 70,
        structuredData: 60,
        authoritySignals: 65,
        freshnessSignals: 55,
        citationPotential: 75,
      },
      tips: [],
    },
    aioAnalysis: {
      hasAIOverview: Math.random() > 0.3,
      yourCitation: {
        isCited: Math.random() > 0.5,
        position: Math.random() > 0.5 ? Math.floor(Math.random() * 3) + 1 : null,
        snippet: null,
      },
      opportunityScore: Math.floor(Math.random() * 100),
      competitors: [],
      optimizationTips: [],
    },
    communityDecay: {
      hasContent: keyword.weakSpots.reddit !== null || keyword.weakSpots.quora !== null || keyword.weakSpots.pinterest !== null,
      decayScore: (keyword.weakSpots.reddit !== null || keyword.weakSpots.quora !== null || keyword.weakSpots.pinterest !== null) ? Math.floor(Math.random() * 50) + 50 : 0,
      platforms: [],
      bestOpportunity: keyword.weakSpots.reddit !== null ? { platform: "reddit" as const, reason: "Outdated content in SERP" } :
                       keyword.weakSpots.quora !== null ? { platform: "quora" as const, reason: "Outdated content in SERP" } :
                       keyword.weakSpots.pinterest !== null ? { platform: "pinterest" as const, reason: "Outdated content in SERP" } : null,
    },
    weakSpot: {
      hasWeakSpot: keyword.weakSpots.reddit !== null || keyword.weakSpots.quora !== null || keyword.weakSpots.pinterest !== null,
      type: keyword.weakSpots.reddit !== null ? "reddit" : keyword.weakSpots.quora !== null ? "quora" : keyword.weakSpots.pinterest !== null ? "pinterest" : null,
      rank: keyword.weakSpots.reddit ?? keyword.weakSpots.quora ?? keyword.weakSpots.pinterest ?? null,
      url: null,
      age: null,
      quality: null,
      opportunity: keyword.weakSpots.reddit !== null ? "reddit content is outdated" :
                   keyword.weakSpots.quora !== null ? "quora content is outdated" :
                   keyword.weakSpots.pinterest !== null ? "pinterest content is outdated" : null,
    },
    lastUpdated: new Date().toISOString(),
    dataFreshness: "fresh",
  }
}

export function generateMockAPIKeyword(keyword: string): APIKeyword {
  const volume = Math.floor(Math.random() * 50000) + 1000
  const kd = Math.floor(Math.random() * 100)
  const cpc = Math.round((Math.random() * 10 + 0.5) * 100) / 100
  const geoScore = Math.floor(Math.random() * 100)
  
  return {
    id: Math.random().toString(36).substring(7),
    keyword,
    volume,
    trend: {
      values: Array.from({ length: 12 }, () => Math.floor(Math.random() * 100)),
      labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
      growthPercent: Math.floor(Math.random() * 50) - 10,
      direction: "stable",
      seasonality: "evergreen",
    },
    kd,
    cpc,
    competition: kd < 30 ? "low" : kd < 60 ? "medium" : "high",
    intent: {
      primary: "I",
      secondary: [],
      confidence: 80,
      all: ["I"],
    },
    serp: {
      features: [],
      organicResults: 10,
      adsCount: 2,
      paaQuestions: [],
      relatedSearches: [],
    },
    rtv: {
      value: Math.round(volume * 0.65),
      percentage: 65,
      opportunityLevel: "good",
      ctrStealers: [],
    },
    geoScore: {
      score: geoScore,
      level: geoScore >= 70 ? "excellent" : geoScore >= 50 ? "good" : "moderate",
      factors: {
        contentClarity: 70,
        structuredData: 60,
        authoritySignals: 65,
        freshnessSignals: 55,
        citationPotential: 75,
      },
      tips: [],
    },
    aioAnalysis: {
      hasAIOverview: false,
      yourCitation: { isCited: false, position: null, snippet: null },
      opportunityScore: 50,
      competitors: [],
      optimizationTips: [],
    },
    communityDecay: {
      hasContent: false,
      decayScore: 0,
      platforms: [],
      bestOpportunity: null,
    },
    weakSpot: {
      hasWeakSpot: false,
      type: null,
      rank: null,
      url: null,
      age: null,
      quality: null,
      opportunity: null,
    },
    lastUpdated: new Date().toISOString(),
    dataFreshness: "fresh",
  }
}
