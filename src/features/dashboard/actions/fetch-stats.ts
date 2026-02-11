"use server"

import "server-only"

import { z, authenticatedAction } from "@/lib/safe-action"
import { prisma } from "@/lib/prisma"
import { content_status } from "@prisma/client"
import type { DashboardStats } from "@/features/dashboard/types/dashboard-stats"

const FetchStatsSchema = z.object({
  projectId: z.string().uuid("Project ID must be a valid UUID"),
})


async function safeRankCount(projectId: string): Promise<number> {
  try {
    return await prisma.ranking.count({
      where: {
        project_id: projectId,
      },
    })
  } catch {
    return 0
  }
}

/**
 * Compute average rank position and week-over-week delta.
 * Uses the latest check per keyword to compute current average,
 * then compares with checks from ~7 days ago for delta.
 */
async function safeAvgRankAndDelta(projectId: string): Promise<{ avgRank: number; rankDelta: number }> {
  try {
    // Current average: avg(position) of the latest check per keyword
    const currentAvg = await prisma.ranking.aggregate({
      where: { project_id: projectId },
      _avg: { position: true },
    })

    const avg = currentAvg._avg.position ?? 0
    if (avg === 0) return { avgRank: 0, rankDelta: 0 }

    // Previous week average for delta
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const previousAvg = await prisma.ranking.aggregate({
      where: {
        project_id: projectId,
        checked_at: { lt: oneWeekAgo },
      },
      _avg: { position: true },
    })

    const prevAvg = previousAvg._avg.position ?? avg
    // Positive delta = improved (position number went down = better)
    const delta = prevAvg - avg

    return { avgRank: avg, rankDelta: delta }
  } catch {
    return { avgRank: 0, rankDelta: 0 }
  }
}

async function safeDecayCount(projectId: string): Promise<number> {
  try {
    return await prisma.contentPerformance.count({
      where: {
        project_id: projectId,
        status: content_status.DECAYING,
      },
    })
  } catch {
    return 0
  }
}

async function safeTrend(projectId: string) {
  try {
    return await prisma.trendWatchlist.findFirst({
      where: { project_id: projectId },
      orderBy: { growth_percent: "desc" },
      select: { topic: true, growth_percent: true },
    })
  } catch {
    return null
  }
}

async function safeCredits(userId: string) {
  try {
    return await prisma.billCredit.findFirst({
      where: { user_id: userId },
      select: { credits_used: true, credits_total: true },
    })
  } catch {
    return null
  }
}

async function safeRecentLogs(projectId: string): Promise<DashboardStats["recentLogs"]> {
  try {
    const logs = await prisma.activityLog.findMany({
      where: { project_id: projectId },
      orderBy: { created_at: "desc" },
      take: 5,
      select: {
        id: true,
        action_type: true,
        description: true,
        created_at: true,
      },
    })

    return logs.map((log) => ({
      id: log.id,
      actionType: log.action_type,
      description: log.description,
      createdAt: log.created_at.toISOString(),
    }))
  } catch {
    return []
  }
}

export const fetchStats = authenticatedAction
  .schema(FetchStatsSchema)
  .action(async ({ parsedInput, ctx }): Promise<DashboardStats> => {
    const userId = ctx.userId

    const ownsProject = await prisma.userProject.findFirst({
      where: {
        id: parsedInput.projectId,
        userid: userId,
      },
      select: { id: true },
    })

    if (!ownsProject) {
      return {
        rankCount: 0,
        avgRank: 0,
        rankDelta: 0,
        decayCount: 0,
        creditUsed: 0,
        creditTotal: 0,
        trendName: "No Trends",
        trendGrowth: 0,
        recentLogs: [],
      }
    }

    const [rankCount, avgRankData, decayCount, trend, credits, recentLogs] = await Promise.all([
      safeRankCount(parsedInput.projectId),
      safeAvgRankAndDelta(parsedInput.projectId),
      safeDecayCount(parsedInput.projectId),
      safeTrend(parsedInput.projectId),
      safeCredits(userId),
      safeRecentLogs(parsedInput.projectId),
    ])

    return {
      rankCount,
      avgRank: avgRankData.avgRank,
      rankDelta: avgRankData.rankDelta,
      decayCount,
      creditUsed: credits?.credits_used ?? 0,
      creditTotal: credits?.credits_total ?? 0,
      trendName: trend?.topic ?? "No Trends",
      trendGrowth: trend?.growth_percent ?? 0,
      recentLogs,
    }
  })

