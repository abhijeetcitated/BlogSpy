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

export type TrendSpotterAnalyzeResponse = {
  keyword: string
  location: string
  type: TrendSpotterPlatformType
  timeframe: string
  items?: DataForSEOTrendsItem[]
  raw?: unknown
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
