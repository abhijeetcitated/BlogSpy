"use server"

import "server-only"

import { z, authenticatedAction } from "@/lib/safe-action"
import { prisma } from "@/lib/prisma"
import { content_status } from "@prisma/client"
import {
  generateSuggestions,
  type RankingWithKeyword,
  type DecayingContent,
  type TrendingTopic,
  type AIScanActivity,
} from "../services/suggestion-engine"
import type { AgenticSuggestion } from "../components/command-center-data"

// ============================================
// SCHEMA
// ============================================

const FetchAISuggestionsSchema = z.object({
  projectId: z.string().uuid("Project ID must be a valid UUID"),
})

// ============================================
// SAFE QUERY HELPERS (same pattern as fetch-stats.ts)
// ============================================

/** Get latest ranking per keyword + compare with ~7-day-old ranking to detect drops */
async function safeRankings(projectId: string): Promise<RankingWithKeyword[]> {
  try {
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    // Get the most recent ranking per keyword for this project (capped at 200)
    const latestRankings = await prisma.ranking.findMany({
      where: { project_id: projectId },
      orderBy: { checked_at: "desc" },
      distinct: ["keyword_id"],
      include: {
        keyword: {
          select: {
            id: true,
            keyword: true,
            slug: true,
            raw_data: true,
            loss_percentage: true,
            rtv_score: true,
          },
        },
      },
      take: 200,
    })

    // Batch-fetch the most recent ranking before 7 days ago for ALL keywords (single query)
    const keywordIds = latestRankings.map((r) => r.keyword_id)

    const olderRankings = keywordIds.length > 0
      ? await prisma.ranking.findMany({
          where: {
            project_id: projectId,
            keyword_id: { in: keywordIds },
            checked_at: { lte: sevenDaysAgo },
          },
          orderBy: { checked_at: "desc" },
          distinct: ["keyword_id"],
          select: { keyword_id: true, position: true },
        })
      : []

    const olderRankingMap = new Map(
      olderRankings.map((r) => [r.keyword_id, r.position])
    )

    return latestRankings.map((latest) => {
      const rawData = latest.keyword.raw_data as Record<string, unknown> | null
      const difficulty = typeof rawData?.difficulty === "number" ? rawData.difficulty : null
      const searchVolume = typeof rawData?.search_volume === "number" ? rawData.search_volume : null

      return {
        keywordId: latest.keyword_id,
        keyword: latest.keyword.keyword,
        slug: latest.keyword.slug,
        currentPosition: latest.position,
        previousPosition: olderRankingMap.get(latest.keyword_id) ?? null,
        url: latest.url,
        checkedAt: latest.checked_at.toISOString(),
        difficulty,
        searchVolume,
        lossPercentage: latest.keyword.loss_percentage,
        rtvScore: latest.keyword.rtv_score,
      }
    })
  } catch {
    return []
  }
}

async function safeDecayingContent(projectId: string): Promise<DecayingContent[]> {
  try {
    const items = await prisma.contentPerformance.findMany({
      where: {
        project_id: projectId,
        status: content_status.DECAYING,
      },
      select: {
        id: true,
        url: true,
        project_id: true,
      },
      take: 20,
    })

    return items.map((item) => ({
      id: item.id,
      url: item.url,
      projectId: item.project_id,
    }))
  } catch {
    return []
  }
}

async function safeTrendingTopics(projectId: string): Promise<TrendingTopic[]> {
  try {
    const items = await prisma.trendWatchlist.findMany({
      where: {
        project_id: projectId,
        growth_percent: { gte: 100 },
      },
      orderBy: { growth_percent: "desc" },
      select: {
        id: true,
        topic: true,
        growth_percent: true,
      },
      take: 10,
    })

    return items.map((item) => ({
      id: item.id,
      topic: item.topic,
      growthPercent: item.growth_percent,
    }))
  } catch {
    return []
  }
}

async function safeAIScans(projectId: string): Promise<AIScanActivity[]> {
  try {
    const logs = await prisma.activityLog.findMany({
      where: {
        project_id: projectId,
        action_type: "ai_scan",
      },
      orderBy: { created_at: "desc" },
      select: {
        meta_data: true,
        created_at: true,
      },
      take: 50,
    })

    return logs
      .map((log) => {
        const meta = log.meta_data as Record<string, unknown> | null
        const keyword = typeof meta?.keyword === "string" ? meta.keyword : ""
        return {
          keywordScanned: keyword,
          createdAt: log.created_at.toISOString(),
        }
      })
      .filter((s) => s.keywordScanned.length > 0)
  } catch {
    return []
  }
}

// ============================================
// SERVER ACTION
// ============================================

export const fetchAISuggestions = authenticatedAction
  .schema(FetchAISuggestionsSchema)
  .action(async ({ parsedInput, ctx }): Promise<AgenticSuggestion[]> => {
    const userId = ctx.userId

    // Verify project ownership
    const ownsProject = await prisma.userProject.findFirst({
      where: {
        id: parsedInput.projectId,
        userid: userId,
      },
      select: { id: true },
    })

    if (!ownsProject) {
      return []
    }

    // Parallel safe queries — all read-only, tenant-scoped
    const [rankings, decayingContent, trendingTopics, aiScans] = await Promise.all([
      safeRankings(parsedInput.projectId),
      safeDecayingContent(parsedInput.projectId),
      safeTrendingTopics(parsedInput.projectId),
      safeAIScans(parsedInput.projectId),
    ])

    // Run rule engine
    return generateSuggestions({
      rankings,
      decayingContent,
      trendingTopics,
      aiScans,
    })
  })
