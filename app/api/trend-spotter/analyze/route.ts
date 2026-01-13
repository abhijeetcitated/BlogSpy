import { z } from "zod"
import { NextResponse } from "next/server"

import { createApiHandler, ApiError } from "@/lib/api/route-helpers"
import { creditService } from "@/lib/credits"
import { getDataForSEOClient, type DataForSEOResponse } from "@/src/lib/seo/dataforseo"
import { getDataForSEOLocationCode } from "@/src/lib/dataforseo/locations"

const AnalyzeTrendSpotterSchema = z.object({
  keyword: z.string().min(1).max(200),
  /** Optional. If omitted/empty, DataForSEO defaults to global/worldwide. */
  location: z.string().max(100).optional().default(""),
  type: z.enum(["web", "youtube", "news", "shopping"]),
  timeframe: z.string().min(1).max(40),
})

type DataForSEOTrendsItem = {
  time?: string
  date?: string
  value?: number
  values?: number[]
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

function normalizeTimeRange(timeframe: string): string {
  const tf = timeframe.trim().toLowerCase()

  switch (tf) {
    case "4h":
    case "4hr":
    case "4hrs":
    case "past_4_hours":
      return "past_4_hours"
    case "24h":
    case "24hr":
    case "24hrs":
    case "past_24_hours":
      return "past_24_hours"
    case "7d":
    case "7day":
    case "past_7_days":
      return "past_7_days"
    case "30d":
    case "30day":
    case "past_30_days":
      return "past_30_days"
    case "12m":
    case "12mo":
    case "12mon":
    case "past_12_months":
      return "past_12_months"
    default:
      // allow advanced values like "2004_present" or "past_90_days"
      return timeframe
  }
}

function parseLocation(input: string): { location_code?: number; location_name?: string } {
  const trimmed = input.trim()

  // numeric location_code
  if (/^\d+$/.test(trimmed)) {
    return { location_code: Number.parseInt(trimmed, 10) }
  }

  // ISO country code -> DataForSEO location_code (strict allowlist). If unsupported, fallback to location_name.
  if (/^[A-Za-z]{2}$/.test(trimmed)) {
    try {
      return { location_code: getDataForSEOLocationCode(trimmed) }
    } catch {
      return { location_name: trimmed }
    }
  }

  // freeform location name (DataForSEO will resolve)
  return { location_name: trimmed }
}

async function refundOneCreditBestEffort(userId: string, reason: string) {
  try {
    await creditService.useCredits(userId, -1, "trend_spotter_refund", reason)
  } catch {
    // best-effort only
  }
}

export const POST = createApiHandler({
  auth: "required",
  rateLimit: "api",
  schema: AnalyzeTrendSpotterSchema,
  handler: async ({ data, user }) => {
    if (!user) {
      throw ApiError.unauthorized()
    }

    // 1) Deduct 1 credit (CRITICAL)
    const creditRes = await creditService.useCredits(
      user.id,
      1,
      "trend_spotter",
      `Trend Spotter analyze: ${data.keyword}`
    )

    if (!creditRes.success) {
      throw ApiError.forbidden(creditRes.message)
    }

    // 2) Call DataForSEO (google_trends/explore)
    const time_range = normalizeTimeRange(data.timeframe)

    const payload: Record<string, unknown> = {
      keywords: [data.keyword],
      time_range,
      type: data.type,
    }

    const locationInput = data.location.trim()
    if (locationInput.length > 0 && locationInput.toLowerCase() !== "worldwide") {
      const { location_code, location_name } = parseLocation(locationInput)
      if (typeof location_code === "number") payload.location_code = location_code
      if (typeof location_name === "string") payload.location_name = location_name
    }

    try {
      const client = getDataForSEOClient()

      const res = await client.post<DataForSEOResponse<unknown>>(
        "/keywords_data/google_trends/explore/live",
        [payload]
      )

      const task = res.data.tasks?.[0]
      if (!task || task.status_code !== 20000) {
        await refundOneCreditBestEffort(user.id, "DataForSEO task failed")
        throw ApiError.internal(task?.status_message || "DataForSEO error")
      }

      const firstResult = task.result?.[0] as unknown

      // Prefer returning raw time-series items if available.
      if (isRecord(firstResult) && Array.isArray(firstResult.items)) {
        return {
          keyword: data.keyword,
          type: data.type,
          timeframe: time_range,
          location: data.location,
          items: firstResult.items as DataForSEOTrendsItem[],
        }
      }

      return {
        keyword: data.keyword,
        type: data.type,
        timeframe: time_range,
        location: data.location,
        raw: firstResult,
      }
    } catch (error) {
      await refundOneCreditBestEffort(user.id, "DataForSEO request failed")
      throw ApiError.internal("Failed to fetch Google Trends data")
    }
  },
})

// Next.js can treat unhandled errors differently; ensure we always return JSON.
export function OPTIONS() {
  return NextResponse.json({ ok: true })
}
