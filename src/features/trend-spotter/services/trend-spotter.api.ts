import { api } from "@/lib/api-client"

export type TrendSpotterPlatformType = "web" | "youtube" | "news" | "shopping"

export type TrendSpotterAnalyzeRequest = {
  keyword: string
  location?: string
  type: TrendSpotterPlatformType
  timeframe: string
}

export type DataForSEOTrendsItem = {
  time?: string
  date?: string
  value?: number
  values?: number[]
}

export type TrendSpotterMapEntry = {
  geo_id: number | string
  values: number[]
  estimated_volume?: number | null
}

export type TrendSpotterRelatedTopic = { title?: string; type?: string; value?: number }
export type TrendSpotterRelatedQuery = { query?: string; value?: number | string }

export type TrendSpotterRelated = {
  topics: { top: TrendSpotterRelatedTopic[]; rising: TrendSpotterRelatedTopic[] }
  queries: { top: TrendSpotterRelatedQuery[]; rising: TrendSpotterRelatedQuery[] }
}

export type TrendSpotterPlatformPayload = {
  chart: { values: number[]; items: DataForSEOTrendsItem[] }
  map: TrendSpotterMapEntry[]
  related: TrendSpotterRelated
}

export type TrendSpotterAnalyzeResponse = {
  keyword: string
  location: string
  timeframe: string
  global_volume?: number | null
  platforms?: Record<TrendSpotterPlatformType, TrendSpotterPlatformPayload>
  type?: TrendSpotterPlatformType
  items?: DataForSEOTrendsItem[]
}

export async function analyzeTrendSpotter(request: TrendSpotterAnalyzeRequest) {
  const res = await api.post<TrendSpotterAnalyzeResponse>(
    "/api/trend-spotter/analyze",
    request
  )

  if (!res.success) {
    return {
      success: false,
      error: res.error?.message || "Failed to analyze trend",
    }
  }

  return { success: true, data: res.data }
}
