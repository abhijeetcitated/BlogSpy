"use server"

// ============================================
// 🔐 SEARCH KEYWORDS - Secured Server Action
// ============================================

import { z } from "zod"
import { authAction } from "@/lib/safe-action"
import { keywordResearchService } from "../services/keyword-research.service"
import type { Keyword, MatchType } from "../types"

// ============================================
// Zod Validation Schema
// ============================================

const SearchKeywordsSchema = z.object({
  seedKeyword: z.string().min(1, "Keyword is required").max(200),
  country: z.string().length(2).default("US"),
  matchType: z.enum(["broad", "phrase", "exact", "related", "questions"]).default("broad"),
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().min(10).max(100).default(50),
  filters: z.object({
    volumeMin: z.number().optional(),
    volumeMax: z.number().optional(),
    kdMin: z.number().optional(),
    kdMax: z.number().optional(),
    cpcMin: z.number().optional(),
    cpcMax: z.number().optional(),
    intents: z.array(z.enum(["I", "C", "T", "N"])).optional(),
    includeTerms: z.array(z.string()).optional(),
    excludeTerms: z.array(z.string()).optional(),
  }).optional(),
})

// ============================================
// Response Type
// ============================================

export interface SearchKeywordsResponse {
  keywords: Keyword[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

// ============================================
// 🔐 Secured Server Action
// ============================================

export const searchKeywords = authAction
  .schema(SearchKeywordsSchema)
  .action(async ({ parsedInput, ctx }): Promise<SearchKeywordsResponse> => {
    const { seedKeyword, country, matchType, page, pageSize, filters } = parsedInput

    // Audit log - ctx has userId from authAction middleware
    const userId = (ctx as { userId?: string }).userId || "unknown"
    console.log(`[searchKeywords] User ${userId} searching: "${seedKeyword}"`)

    // Call service
    const result = await keywordResearchService.researchKeywords({
      seedKeyword: seedKeyword.trim().toLowerCase(),
      country,
      matchType: matchType as MatchType,
      page,
      limit: pageSize,
      sortBy: "volume",
      sortOrder: "desc",
      filters: {
        volumeMin: filters?.volumeMin,
        volumeMax: filters?.volumeMax,
        kdMin: filters?.kdMin,
        kdMax: filters?.kdMax,
        cpcMin: filters?.cpcMin,
        cpcMax: filters?.cpcMax,
        intents: filters?.intents,
        includeTerms: filters?.includeTerms,
        excludeTerms: filters?.excludeTerms,
      },
    })

    // Transform API response to Keyword type
    return {
      keywords: result.data.keywords.map((k) => ({
        id: parseInt(k.id) || Math.floor(Math.random() * 1000000),
        keyword: k.keyword,
        volume: k.volume,
        kd: k.kd,
        cpc: k.cpc,
        intent: k.intent.all, // IntentData.all is the array
        trend: k.trend.values, // TrendData.values is the number array
        serpFeatures: k.serp.features.map((f) => f.type) as Keyword["serpFeatures"],
        weakSpot: {
          type: k.weakSpot.type as "reddit" | "quora" | null,
          rank: k.weakSpot.rank ?? undefined,
        },
        geoScore: k.geoScore?.score,
      })),
      total: result.data.pagination.total,
      page: result.data.pagination.page,
      pageSize: result.data.pagination.limit,
      hasMore: result.data.pagination.hasMore,
    }
  })
