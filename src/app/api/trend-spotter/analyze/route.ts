import { z } from "zod"
import { NextResponse } from "next/server"

import { createApiHandler, ApiError } from "@/lib/api/route-helpers"
import { creditService } from "@/lib/credits"
import { createServerClient } from "@/src/lib/supabase/server"
import {
  fetchTrendAnalysis,
  type TrendAnalysisResult,
  type TrendPlatform,
} from "@/src/features/trend-spotter/services/trend-api"
import { calculateForecast, calculateVirality, type ViralityResult } from "@/src/features/trend-spotter/utils/trend-math"
import { buildCacheTimeframeKey, getCacheExpiry } from "@/src/features/trend-spotter/utils/cache-logic"
import { rateLimiter } from "@/src/lib/rate-limit"

const AnalyzeTrendSpotterSchema = z.object({
  keyword: z.string().min(1).max(200),
  country: z.string().max(100).optional().default("US"),
  location: z.string().max(100).optional(),
  timeframe: z.string().min(1).max(40),
  type: z.enum(["web", "youtube", "news", "shopping"]).optional(),
  force_refresh: z.boolean().optional(),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
})

type CachedChartData = Record<
  TrendPlatform,
  {
    values: number[]
    items: Array<{ time?: string; date?: string; value?: number; values?: number[] }>
    forecast_values?: number[]
    virality?: ViralityResult
    related?: {
      topics: { top: unknown[]; rising: unknown[] }
      queries: { top: unknown[]; rising: unknown[] }
    }
  }
>

type CachedMapEntry = {
  geo_id: number | string
  values: number[]
  estimated_volume: number | null
}

type CachedMapData = Record<TrendPlatform, CachedMapEntry[]>

type TrendSpotterAnalyzeResponse = {
  keyword: string
  location: string
  timeframe: string
  global_volume: number | null
  isStale?: boolean
  platforms: Record<
    TrendPlatform,
    {
      chart: CachedChartData[TrendPlatform]
      map: CachedMapData[TrendPlatform]
      related: { topics: { top: unknown[]; rising: unknown[] }; queries: { top: unknown[]; rising: unknown[] } }
    }
  >
  items?: Array<{ time?: string; date?: string; value?: number; values?: number[] }>
}

type TrendCacheRecord = {
  chart_data: CachedChartData
  map_data: CachedMapData
  total_volume: number | null
  expires_at: string
}

async function refundOneCreditBestEffort(userId: string, reason: string) {
  try {
    await creditService.useCredits(userId, -1, "trend_spotter_refund", reason)
  } catch {
    // best-effort only
  }
}

async function deductCredits(userId: string, keyword: string) {
  return creditService.useCredits(userId, 1, "trend_spotter", `Trend Spotter analyze: ${keyword}`)
}

function isMockMode(): boolean {
  return process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true"
}

function calculateAverage(values: number[]): number {
  if (values.length === 0) return 0
  const sum = values.reduce((acc, value) => acc + value, 0)
  return sum / values.length
}

function buildResponseFromAnalysis(
  analysis: TrendAnalysisResult,
  keyword: string,
  countryCode: string,
  timeframe: string
): {
  response: TrendSpotterAnalyzeResponse
  chart_data: CachedChartData
  map_data: CachedMapData
} {
  const chart_data = {} as CachedChartData
  const map_data = {} as CachedMapData
  const related = {
    topics: { top: [], rising: analysis.relatedTopics ?? [] },
    queries: { top: [], rising: [] },
  }
  const platformValues: Record<TrendPlatform, number[]> = {
    web: [],
    youtube: [],
    news: [],
    shopping: [],
  }

  analysis.timeline.forEach((point) => {
    platformValues.web.push(typeof point.web === "number" ? point.web : 0)
    platformValues.youtube.push(typeof point.youtube === "number" ? point.youtube : 0)
    platformValues.news.push(typeof point.news === "number" ? point.news : 0)
    platformValues.shopping.push(typeof point.shopping === "number" ? point.shopping : 0)
  })

  const baseMap: CachedMapEntry[] = analysis.map.map((entry) => ({
    geo_id: entry.id,
    values: [entry.value],
    estimated_volume: Number.isFinite(entry.estimated_volume) ? entry.estimated_volume : null,
  }))

  const platforms = (Object.keys(platformValues) as TrendPlatform[]).reduce(
    (acc, platform) => {
      const values = platformValues[platform]
      const items = analysis.timeline.map((point) => ({
        date: point.date,
        value:
          platform === "web"
            ? point.web ?? 0
            : platform === "youtube"
              ? point.youtube ?? 0
              : platform === "news"
                ? point.news ?? 0
                : point.shopping ?? 0,
      }))

      const avg = calculateAverage(values)
      const current = values[values.length - 1] ?? 0
      const virality = calculateVirality(current, avg)
      const forecastValues = calculateForecast(values, 3)

      chart_data[platform] = {
        values,
        items,
        forecast_values: forecastValues,
        virality,
        related,
      }

      map_data[platform] = baseMap

      acc[platform] = {
        chart: chart_data[platform],
        map: baseMap,
        related,
      }
      return acc
    },
    {} as TrendSpotterAnalyzeResponse["platforms"]
  )

  return {
    response: {
      keyword,
      location: countryCode,
      timeframe,
      global_volume: analysis.globalVolume ?? null,
      platforms,
    },
    chart_data,
    map_data,
  }
}

export const POST = createApiHandler({
  auth: "optional",
  rateLimit: "api",
  schema: AnalyzeTrendSpotterSchema,
  handler: async ({ data, user }): Promise<TrendSpotterAnalyzeResponse> => {
    const { success } = await rateLimiter.limit(user?.id ?? "anonymous")
    if (!success) {
      throw new ApiError(429, "TOO_MANY_REQUESTS", "Too many requests. Please try again in a minute.")
    }

    const mockMode = isMockMode()
    if (!user && !mockMode) {
      throw ApiError.unauthorized()
    }

    const keyword = data.keyword.trim()
    const countryCode = (data.country || data.location || "US").trim().toUpperCase()
    const timeframe = data.timeframe.trim().toUpperCase()
    const timeframeKey = buildCacheTimeframeKey(timeframe, data.start_date, data.end_date)

    if (mockMode) {
      const analysis = await fetchTrendAnalysis(keyword, countryCode, timeframe)
      return buildResponseFromAnalysis(analysis, keyword, countryCode, timeframe).response
    }

    const supabase = await createServerClient()
    const cacheTable = supabase as unknown as {
      from: (table: string) => any
    }

    const { data: cached } = await cacheTable
      .from("trend_cache")
      .select("chart_data, map_data, total_volume, expires_at")
      .eq("keyword", keyword)
      .eq("country_code", countryCode)
      .eq("timeframe", timeframeKey)
      .order("fetched_at", { ascending: false })
      .limit(1)
      .maybeSingle()

    if (cached) {
      const cache = cached as TrendCacheRecord
      const isFresh = new Date(cache.expires_at).getTime() > Date.now()
      const isStale = !isFresh

      if (isStale && !data.force_refresh) {
        const platforms = (Object.keys(cache.chart_data ?? {}) as TrendPlatform[]).reduce((acc, platform) => {
          const chart = cache.chart_data?.[platform]
          const map = cache.map_data?.[platform] ?? []
          if (!chart) return acc
          acc[platform] = {
            chart,
            map,
            related: chart.related ?? { topics: { top: [], rising: [] }, queries: { top: [], rising: [] } },
          }
          return acc
        }, {} as TrendSpotterAnalyzeResponse["platforms"])

        const response: TrendSpotterAnalyzeResponse = {
          keyword,
          location: countryCode,
          timeframe,
          global_volume: cache.total_volume ?? null,
          platforms,
          isStale: true,
        }

        if (data.type) {
          response.items = platforms[data.type]?.chart.items ?? []
        }

        return response
      }

      if (isFresh) {
        const platforms = (Object.keys(cache.chart_data ?? {}) as TrendPlatform[]).reduce((acc, platform) => {
          const chart = cache.chart_data?.[platform]
          const map = cache.map_data?.[platform] ?? []
          if (!chart) return acc
          acc[platform] = {
            chart,
            map,
            related: chart.related ?? { topics: { top: [], rising: [] }, queries: { top: [], rising: [] } },
          }
          return acc
        }, {} as TrendSpotterAnalyzeResponse["platforms"])

        const response: TrendSpotterAnalyzeResponse = {
          keyword,
          location: countryCode,
          timeframe,
          global_volume: cache.total_volume ?? null,
          platforms,
        }

        if (data.type) {
          response.items = platforms[data.type]?.chart.items ?? []
        }

        return response
      }
    }

    const authUser = user
    if (!authUser) {
      throw ApiError.unauthorized()
    }

    const creditRes = await deductCredits(authUser.id, keyword)
    if (!creditRes.success) {
      throw ApiError.forbidden(creditRes.message)
    }

    try {
      const analysis = await fetchTrendAnalysis(keyword, countryCode, timeframe)
      const { response, chart_data, map_data } = buildResponseFromAnalysis(
        analysis,
        keyword,
        countryCode,
        timeframe
      )

      if (data.type) {
        response.items = response.platforms[data.type]?.chart.items ?? []
      }

      try {
        await cacheTable
          .from("trend_cache")
          .upsert({
            keyword,
            country_code: countryCode,
            timeframe: timeframeKey,
            chart_data,
            map_data,
            total_volume: analysis.globalVolume ?? null,
            fetched_at: new Date().toISOString(),
            expires_at: getCacheExpiry(timeframe),
          })
      } catch (error) {
        console.warn("[TrendSpotter] Cache upsert failed", error)
      }

      return response
    } catch (error) {
      await refundOneCreditBestEffort(authUser.id, "Trend Spotter analyze failed")
      throw ApiError.internal("Failed to fetch Trend Spotter data")
    }
  },
})

// Next.js can treat unhandled errors differently; ensure we always return JSON.
export function OPTIONS() {
  return NextResponse.json({ ok: true })
}
