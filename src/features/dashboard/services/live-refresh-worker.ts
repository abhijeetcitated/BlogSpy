import "server-only"

import { prisma } from "@/lib/prisma"
import type { Prisma } from "@prisma/client"
import { content_status } from "@prisma/client"
import { creditBanker } from "@/lib/services/credit-banker.service"
import { fetchLiveSerp } from "@/features/keyword-research/services/live-serp"
import { getDataForSEOLocationCode } from "@/lib/dataforseo/locations"
import { fetchTrendAnalysis } from "@/features/trend-spotter/services/trend-api"

const MAX_KEYWORDS_PER_JOB = 8
const MAX_TREND_UPSERTS_PER_JOB = 4

type WeakSpotPayload = {
  type: "reddit" | "quora" | "pinterest"
  rank: number
} | null

function toWeakSpotPayload(weakSpots: {
  reddit: number | null
  quora: number | null
  pinterest: number | null
}): WeakSpotPayload {
  if (weakSpots.reddit !== null) return { type: "reddit", rank: weakSpots.reddit }
  if (weakSpots.quora !== null) return { type: "quora", rank: weakSpots.quora }
  if (weakSpots.pinterest !== null) return { type: "pinterest", rank: weakSpots.pinterest }
  return null
}

function toKeywordSlug(keyword: string): string {
  return keyword
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80)
}

function findProjectPosition(
  rawItems: Array<{ type?: string; rank_group?: number; domain?: string }>,
  projectDomain: string
): number | null {
  const normalized = projectDomain.trim().toLowerCase().replace(/^https?:\/\//, "")

  if (!normalized) return null

  const organicItems = rawItems.filter(
    (item) => item.type === "organic" && typeof item.rank_group === "number" && item.rank_group > 0
  )

  for (const item of organicItems) {
    const domain = (item.domain ?? "").toLowerCase()
    if (!domain) continue
    if (domain === normalized || domain.endsWith(`.${normalized}`) || normalized.endsWith(`.${domain}`)) {
      return item.rank_group ?? null
    }
  }

  return null
}

function computeGrowthPercent(values: number[]): number | null {
  if (values.length < 2) return null
  const first = values[0] ?? 0
  const last = values[values.length - 1] ?? 0
  if (first <= 0) return null
  const growth = ((last - first) / first) * 100
  if (!Number.isFinite(growth)) return null
  return Math.round(growth)
}

async function upsertContentPerformance(projectId: string, url: string, status: content_status) {
  const existing = await prisma.contentPerformance.findFirst({
    where: { project_id: projectId, url },
    select: { id: true },
  })

  if (existing) {
    await prisma.contentPerformance.update({
      where: { id: existing.id },
      data: { status },
    })
    return
  }

  await prisma.contentPerformance.create({
    data: {
      project_id: projectId,
      url,
      status,
    },
  })
}

async function upsertTrendWatchlist(projectId: string, topic: string, growthPercent: number) {
  const existing = await prisma.trendWatchlist.findFirst({
    where: { project_id: projectId, topic },
    select: { id: true },
  })

  if (existing) {
    await prisma.trendWatchlist.update({
      where: { id: existing.id },
      data: { growth_percent: growthPercent },
    })
    return
  }

  await prisma.trendWatchlist.create({
    data: {
      project_id: projectId,
      topic,
      growth_percent: growthPercent,
    },
  })
}

async function refundCreditsIfNeeded(job: {
  id: string
  user_id: string
  credits_charged: number
  idempotency_key: string
}) {
  if (job.credits_charged <= 0) return

  const result = await creditBanker.refund(
    job.user_id,
    job.credits_charged,
    job.idempotency_key,
    `Live refresh job ${job.id} failed — auto refund`
  )

  if (result.success) {
    console.log("[LiveRefreshWorker] Credits refunded", {
      jobId: job.id,
      amount: job.credits_charged,
      idempotencyKey: job.idempotency_key,
    })
  } else {
    console.error("[LiveRefreshWorker] Refund failed", {
      jobId: job.id,
      error: result.error,
      idempotencyKey: job.idempotency_key,
    })
  }
}

export async function processAISuggestionsLiveRefresh(jobId: string): Promise<{
  success: boolean
  refreshedKeywords: number
  error?: string
}> {
  const existingJob = await prisma.suggestionLiveRefreshJob.findUnique({
    where: { id: jobId },
    select: {
      id: true,
      user_id: true,
      project_id: true,
      status: true,
      credits_charged: true,
      idempotency_key: true,
    },
  })

  if (!existingJob) {
    console.error("[LiveRefreshWorker] Job not found", { jobId })
    return { success: false, refreshedKeywords: 0, error: "JOB_NOT_FOUND" }
  }

  // Already terminal — don't retry, don't refund again
  if (existingJob.status === "completed" || existingJob.status === "failed") {
    console.log("[LiveRefreshWorker] Job already terminal", {
      jobId,
      status: existingJob.status,
    })
    if (existingJob.status === "completed") {
      const priorCount = await prisma.suggestionLiveRefreshResult.count({
        where: { job_id: existingJob.id },
      })
      return { success: true, refreshedKeywords: priorCount }
    }
    return { success: false, refreshedKeywords: 0, error: "JOB_ALREADY_TERMINAL" }
  }

  const claimed = await prisma.suggestionLiveRefreshJob.updateMany({
    where: {
      id: existingJob.id,
      status: "queued",
    },
    data: {
      status: "processing",
      started_at: new Date(),
      error_message: null,
    },
  })

  if (claimed.count === 0) {
    // Another worker already claimed it (race condition)
    console.log("[LiveRefreshWorker] Job already claimed by another worker", { jobId })
    return { success: true, refreshedKeywords: 0 }
  }

  console.log("[LiveRefreshWorker] Job claimed", {
    jobId,
    projectId: existingJob.project_id,
    userId: existingJob.user_id,
  })

  try {
    const project = await prisma.userProject.findFirst({
      where: {
        id: existingJob.project_id,
        userid: existingJob.user_id,
      },
      select: {
        id: true,
        targetcountry: true,
        domain: true,
      },
    })

    if (!project) {
      throw new Error(`PROJECT_NOT_FOUND: projectId=${existingJob.project_id}`)
    }

    const rankings = await prisma.ranking.findMany({
      where: { project_id: project.id },
      orderBy: { checked_at: "desc" },
      distinct: ["keyword_id"],
      include: {
        keyword: {
          select: {
            keyword: true,
            slug: true,
          },
        },
      },
      take: MAX_KEYWORDS_PER_JOB,
    })

    if (rankings.length === 0) {
      await prisma.suggestionLiveRefreshJob.update({
        where: { id: existingJob.id },
        data: {
          status: "completed",
          completed_at: new Date(),
          refreshed_keywords: 0,
        },
      })
      return { success: true, refreshedKeywords: 0 }
    }

    let locationCode = 2840
    try {
      locationCode = getDataForSEOLocationCode(project.targetcountry || "US")
    } catch {
      locationCode = 2840
    }

    const resultRows: Prisma.SuggestionLiveRefreshResultCreateManyInput[] = []

    const activityRows: Prisma.ActivityLogCreateManyInput[] = []

    for (const ranking of rankings) {
      const keyword = ranking.keyword.keyword
      const keywordSlug = ranking.keyword.slug || toKeywordSlug(keyword)

      try {
        const live = await fetchLiveSerp(keyword, locationCode, "en", "desktop")
        const rawItems = Array.isArray(live.rawItems)
          ? live.rawItems.map((item) => ({
              type: item.type,
              rank_group: item.rank_group,
              domain: item.domain,
            }))
          : []

        const currentProjectPosition = findProjectPosition(rawItems, project.domain)
        const previousPosition = ranking.position

        const weakSpotPayload = toWeakSpotPayload(live.weakSpots)

        resultRows.push({
          job_id: existingJob.id,
          project_id: existingJob.project_id,
          keyword,
          keyword_slug: keywordSlug,
          source: "serp",
          has_ai_overview: live.hasAio,
          serp_features: live.serpFeatures as Prisma.InputJsonValue,
          weak_spot: weakSpotPayload ? (weakSpotPayload as Prisma.InputJsonValue) : undefined,
          metadata: {
            geoScore: live.geoScore,
            hasSnippet: live.hasSnippet,
            projectPosition: currentProjectPosition,
            previousPosition,
          } as Prisma.InputJsonValue,
        })

        if (currentProjectPosition !== null) {
          await prisma.ranking.create({
            data: {
              project_id: existingJob.project_id,
              keyword_id: ranking.keyword_id,
              position: currentProjectPosition,
              url: ranking.url,
              device: ranking.device,
            },
          })
        }

        if (ranking.url) {
          const isDecaying =
            currentProjectPosition !== null
              ? currentProjectPosition - previousPosition >= 3 || currentProjectPosition > 20
              : previousPosition > 20

          await upsertContentPerformance(
            existingJob.project_id,
            ranking.url,
            isDecaying ? content_status.DECAYING : content_status.STABLE
          )
        }

        if (resultRows.length <= MAX_TREND_UPSERTS_PER_JOB) {
          try {
            const trend = await fetchTrendAnalysis(
              keyword,
              project.targetcountry || "US",
              "30D"
            )
            const series = trend.timeline
              .map((point) => point.web)
              .filter((value): value is number => typeof value === "number")
            const growthPercent = computeGrowthPercent(series)

            if (growthPercent !== null) {
              await upsertTrendWatchlist(existingJob.project_id, keyword, growthPercent)
            }
          } catch {
            // Best-effort enrichment only. Live refresh should not fail due to trend API variance.
          }
        }

        activityRows.push({
          user_id: existingJob.user_id,
          project_id: existingJob.project_id,
          action_type: "ai_scan",
          description: `Live AI refresh scan completed for '${keyword}'`,
          meta_data: {
            keyword,
            source: "dashboard_live_refresh",
            hasAiOverview: live.hasAio,
          } as Prisma.InputJsonValue,
        })
      } catch (error) {
        resultRows.push({
          job_id: existingJob.id,
          project_id: existingJob.project_id,
          keyword,
          keyword_slug: keywordSlug,
          source: "serp",
          has_ai_overview: false,
          serp_features: [] as Prisma.InputJsonValue,
          weak_spot: undefined,
          metadata: {
            error: error instanceof Error ? error.message : "UNKNOWN_SERP_ERROR",
          } as Prisma.InputJsonValue,
        })
      }
    }

    await prisma.suggestionLiveRefreshResult.createMany({
      data: resultRows,
      skipDuplicates: true,
    })

    if (activityRows.length > 0) {
      await prisma.activityLog.createMany({
        data: activityRows,
      })
    }

    await prisma.suggestionLiveRefreshJob.update({
      where: { id: existingJob.id },
      data: {
        status: "completed",
        completed_at: new Date(),
        refreshed_keywords: resultRows.length,
      },
    })

    console.log("[LiveRefreshWorker] Job completed", {
      jobId: existingJob.id,
      refreshedKeywords: resultRows.length,
      idempotencyKey: existingJob.idempotency_key,
    })

    return {
      success: true,
      refreshedKeywords: resultRows.length,
    }
  } catch (error) {
    const message = error instanceof Error
      ? `WORKER_ERROR: ${error.message}`.slice(0, 240)
      : "WORKER_ERROR: UNKNOWN"

    console.error("[LiveRefreshWorker] Job failed", {
      jobId: existingJob.id,
      error: message,
      idempotencyKey: existingJob.idempotency_key,
    })

    await prisma.suggestionLiveRefreshJob.update({
      where: { id: existingJob.id },
      data: {
        status: "failed",
        error_message: message,
        failed_at: new Date(),
      },
    })

    await refundCreditsIfNeeded(existingJob)

    return {
      success: false,
      refreshedKeywords: 0,
      error: message,
    }
  }
}
