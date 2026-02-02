import { subDays, subHours, subMinutes, subMonths } from "date-fns"
import { getDataForSEOLocationCode } from "@/lib/dataforseo/locations"
import { calculateForecast, distributeVolume } from "../utils/trend-math"

export type TrendPlatform = "web" | "youtube" | "news" | "shopping"

export type TrendGraphItem = {
  time?: string
  date?: string
  value?: number
  values?: number[]
}

export type TrendMapEntry = {
  geo_id: number | string
  values: number[]
}

export type DataForSEOTopicItem = {
  title?: string
  type?: string
  value?: number
}

export type DataForSEOQueryItem = {
  query?: string
  value?: number | string
}

export type TrendBatchPlatformResult = {
  platform: TrendPlatform
  chart: {
    values: number[]
    items: TrendGraphItem[]
  }
  map: TrendMapEntry[]
  related: {
    topics: { top: DataForSEOTopicItem[]; rising: DataForSEOTopicItem[] }
    queries: { top: DataForSEOQueryItem[]; rising: DataForSEOQueryItem[] }
  }
  raw: unknown
}

export type TrendBatchResult = Record<TrendPlatform, TrendBatchPlatformResult>
export type TrendBatchWithVolumeResult = {
  platforms: TrendBatchResult
  globalVolume: number | null
}

export type TrendTimelinePoint = {
  date: string
  web: number | null
  youtube: number | null
  news: number | null
  shopping: number | null
}

export type TrendForecasts = Record<TrendPlatform, number[]>

export type TrendMapVolume = {
  id: string
  value: number
  estimated_volume: number
}

export type TrendAnalysisResult = {
  timeline: TrendTimelinePoint[]
  forecasts: TrendForecasts
  map: TrendMapVolume[]
  relatedTopics: DataForSEOTopicItem[]
  globalVolume: number | null
}

type DataForSEOResponse<T> = {
  status_code: number
  status_message: string
  tasks?: Array<{
    id: string
    status_code: number
    status_message: string
    data?: Record<string, unknown>
    result?: T[]
  }>
}

type DataForSEOTrendGraphResult = {
  type: "google_trends_graph"
  items?: TrendGraphItem[]
}

type DataForSEOTrendMapResult = {
  type: "google_trends_map"
  items?: Array<{ geo_id?: number | string; values?: number[] }>
}

type DataForSEOTrendTopicsResult = {
  type: "google_trends_topics_list" | "topics_list"
  top?: DataForSEOTopicItem[]
  rising?: DataForSEOTopicItem[]
}

type DataForSEOTrendQueriesResult = {
  type: "google_trends_queries_list" | "queries_list"
  top?: DataForSEOQueryItem[]
  rising?: DataForSEOQueryItem[]
}

type DataForSEOExploreItem =
  | DataForSEOTrendGraphResult
  | DataForSEOTrendMapResult
  | DataForSEOTrendTopicsResult
  | DataForSEOTrendQueriesResult
  | { type?: string }

type DataForSEOExploreResult = {
  items?: DataForSEOExploreItem[]
}

type DataForSEOHistoryResult = {
  items?: Array<{
    search_volume?: number
    historical_search_volume?: number
  }>
  search_volume?: number
  historical_search_volume?: number
}

type TrendBatchPayload = {
  keywords: string[]
  time_range?: string
  type: TrendPlatform
  location_code?: number
  location_name?: string
}

type TrendExploreTaskPayload = {
  keywords: string[]
  time_range: string
  type: "web" | "youtube" | "news" | "froogle"
  location_code?: number
  location_name?: string
}

type TrendRegionItem = {
  name?: string
  value?: number
}

const DATAFORSEO_BASE_URL = "https://api.dataforseo.com/v3"

type DataForSEOCredentials = {
  login: string
  password: string
}

function isMockMode(): boolean {
  return process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true"
}

function getDataForSEOCredentials(): DataForSEOCredentials {
  if (isMockMode()) {
    return { login: "mock", password: "mock" }
  }

  const login = process.env.DATAFORSEO_LOGIN
  const password = process.env.DATAFORSEO_PASSWORD

  if (!login) {
    throw new Error("Missing DATAFORSEO_LOGIN environment variable.")
  }

  if (!password) {
    throw new Error("Missing DATAFORSEO_PASSWORD environment variable.")
  }

  return { login, password }
}

async function dataForSEOFetch<T>(path: string, payload: unknown): Promise<DataForSEOResponse<T>> {
  const { login, password } = getDataForSEOCredentials()
  const credentials = Buffer.from(`${login}:${password}`).toString("base64")

  const response = await fetch(`${DATAFORSEO_BASE_URL}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error(`DataForSEO request failed: ${response.status}`)
  }

  const data = (await response.json()) as DataForSEOResponse<T>
  if (data.status_code !== 20000 && data.status_code !== 200) {
    throw new Error(data.status_message || "DataForSEO error")
  }

  return data
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

function mapTimeframeToApi(tf: string): string {
  switch (tf) {
    case "4H":
      return "now 4-H"
    case "24H":
      return "now 1-d"
    case "7D":
      return "now 7-d"
    case "30D":
      return "today 1-m"
    case "12M":
      return "today 12-m"
    default:
      return "today 12-m"
  }
}

function mapPlatformToApi(platform: string): TrendPlatform | "froogle" {
  if (platform === "youtube") return "youtube"
  if (platform === "news" || platform === "viral") return "news"
  if (platform === "shopping" || platform === "intent") return "froogle"
  return "web"
}

function parseLocation(input?: string): { location_code?: number; location_name?: string } {
  const trimmed = (input ?? "").trim()
  if (!trimmed) return {}

  if (/^\d+$/.test(trimmed)) {
    return { location_code: Number.parseInt(trimmed, 10) }
  }

  if (/^[A-Za-z]{2}$/.test(trimmed)) {
    try {
      return { location_code: getDataForSEOLocationCode(trimmed) }
    } catch {
      return { location_name: trimmed }
    }
  }

  return { location_name: trimmed }
}

function hashSeed(input: string): number {
  let hash = 0
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) | 0
  }
  return Math.abs(hash)
}

function getMockSeed(location?: string, country?: string): number {
  const locationSeed = location ? hashSeed(location) : 0
  const countrySeed = country ? hashSeed(country) : 0
  const seed = locationSeed + countrySeed
  return seed === 0 ? 1 : seed
}

function buildMockTimeline(timeframe: string | undefined, seed: number): TrendTimelinePoint[] {
  const tf = (timeframe ?? "12M").trim().toUpperCase()
  const now = new Date()

  let pointsCount = 12
  let makeDate: (base: Date, delta: number) => Date = (base, delta) => subMonths(base, delta)

  if (tf === "4H") {
    pointsCount = 24
    makeDate = (base, delta) => subMinutes(base, delta * 10)
  } else if (tf === "24H") {
    pointsCount = 24
    makeDate = (base, delta) => subHours(base, delta)
  } else if (tf === "7D") {
    pointsCount = 7
    makeDate = (base, delta) => subDays(base, delta)
  } else if (tf === "30D") {
    pointsCount = 30
    makeDate = (base, delta) => subDays(base, delta)
  } else if (tf === "12M") {
    pointsCount = 12
    makeDate = (base, delta) => subMonths(base, delta)
  }

  return Array.from({ length: pointsCount }).map((_, i) => {
    const delta = pointsCount - 1 - i
    const date = makeDate(now, delta).toISOString()

    const base = 50 + Math.sin(i + seed) * 30
    const noise = Math.floor(Math.random() * 20)

    const web = Math.min(100, Math.max(0, Math.floor(base + noise)))
    const youtube = Math.min(100, Math.max(0, Math.floor(base - 10 + noise)))
    const news = Math.min(100, Math.max(0, Math.floor(base / 2 + noise)))
    const shopping = Math.min(100, Math.max(0, Math.floor(base / 1.5 + noise)))

    return {
      date,
      web,
      youtube,
      news,
      shopping,
    }
  })
}

function getItemsByType(
  result: DataForSEOExploreResult | undefined,
  types: string | string[]
): unknown[] {
  const items = Array.isArray(result?.items) ? result?.items : []
  const matchTypes = Array.isArray(types) ? types : [types]
  const match = items.find((item) => isRecord(item) && matchTypes.includes(String(item.type)))
  if (!match || !isRecord(match)) return []
  const matchItems = (match as { items?: unknown[] }).items
  return Array.isArray(matchItems) ? matchItems : []
}

function getListByType<T extends DataForSEOTopicItem | DataForSEOQueryItem>(
  result: DataForSEOExploreResult | undefined,
  types: string | string[]
): { top: T[]; rising: T[] } {
  const items = Array.isArray(result?.items) ? result?.items : []
  const matchTypes = Array.isArray(types) ? types : [types]
  const match = items.find((item) => isRecord(item) && matchTypes.includes(String(item.type)))
  if (!match || !isRecord(match)) return { top: [], rising: [] }
  const top = Array.isArray((match as { top?: unknown[] }).top)
    ? ((match as { top?: unknown[] }).top as T[])
    : []
  const rising = Array.isArray((match as { rising?: unknown[] }).rising)
    ? ((match as { rising?: unknown[] }).rising as T[])
    : []
  return { top, rising }
}

function extractChartValues(items: TrendGraphItem[]): number[] {
  return items
    .map((item) => (typeof item.value === "number" ? item.value : item.values?.[0]))
    .filter((value): value is number => typeof value === "number" && Number.isFinite(value))
}

function extractSeries(items: TrendGraphItem[]): { labels: string[]; values: number[] } {
  const labels: string[] = []
  const values: number[] = []

  items.forEach((item, index) => {
    const label = item.date ?? item.time ?? String(index + 1)
    const value = typeof item.value === "number" ? item.value : item.values?.[0]
    if (typeof value !== "number" || !Number.isFinite(value)) return
    labels.push(label)
    values.push(value)
  })

  return { labels, values }
}

function mergeLabels(labelSets: string[][]): string[] {
  const seen = new Set<string>()
  const merged: string[] = []

  labelSets.forEach((labels) => {
    labels.forEach((label) => {
      if (seen.has(label)) return
      seen.add(label)
      merged.push(label)
    })
  })

  return merged
}

function mapTaskTypeToPlatform(type: string | undefined): TrendPlatform | null {
  if (!type) return null
  if (type === "froogle") return "shopping"
  if (type === "web" || type === "youtube" || type === "news") return type
  return null
}

function parseExploreResult(result: DataForSEOExploreResult | undefined, platform: TrendPlatform): TrendBatchPlatformResult {
  const graphItems = getItemsByType(result, "google_trends_graph") as TrendGraphItem[]
  const mapItems = getItemsByType(result, "google_trends_map") as Array<{ geo_id?: number | string; values?: number[] }>
  const topics = getListByType<DataForSEOTopicItem>(
    result,
    ["google_trends_topics_list", "topics_list"]
  )
  const queries = getListByType<DataForSEOQueryItem>(
    result,
    ["google_trends_queries_list", "queries_list"]
  )

  const map = mapItems
    .filter((item) => typeof item.geo_id === "number" || typeof item.geo_id === "string")
    .map((item) => ({
      geo_id: item.geo_id as number | string,
      values: Array.isArray(item.values) ? item.values.filter((v) => typeof v === "number") : [],
    }))

  const chartItems = Array.isArray(graphItems) ? graphItems : []

  return {
    platform,
    chart: {
      values: extractChartValues(chartItems),
      items: chartItems,
    },
    map,
    related: {
      topics,
      queries,
    },
    raw: result ?? null,
  }
}

function buildBatchPayloads(keyword: string, location?: string, timeframe?: string): TrendBatchPayload[] {
  const time_range = mapTimeframeToApi((timeframe ?? "12M").trim().toUpperCase())
  const locationParams = parseLocation(location)
  const base: Omit<TrendBatchPayload, "type"> = {
    keywords: [keyword],
    time_range,
    ...locationParams,
  }

  return (["web", "youtube", "news", "shopping"] as TrendPlatform[]).map((type) => ({
    ...base,
    type,
  }))
}

export async function fetchTrendBatch(
  keyword: string,
  location?: string,
  timeframe?: string
): Promise<TrendBatchWithVolumeResult> {
  if (isMockMode()) {
    const seed = getMockSeed(location, keyword)
    const timeline = buildMockTimeline(timeframe, seed)

    const makeSeries = (platform: TrendPlatform): TrendGraphItem[] =>
      timeline.map((point) => ({
        date: point.date,
        value: point[platform] ?? 0,
      }))

    const buildPlatform = (platform: TrendPlatform): TrendBatchPlatformResult => ({
      platform,
      chart: {
        values: makeSeries(platform).map((item) => item.value ?? 0),
        items: makeSeries(platform),
      },
      map: [
        { geo_id: "US", values: [92] },
        { geo_id: "IN", values: [78] },
        { geo_id: "GB", values: [64] },
      ],
      related: {
        topics: {
          top: [
            { title: "AI Agents", type: "Topic", value: 82 },
            { title: "AutoGPT", type: "Topic", value: 65 },
          ],
          rising: [
            { title: "AI Agents Framework", type: "Event", value: 120 },
            { title: "Autonomous AI", type: "Topic", value: 70 },
          ],
        },
        queries: {
          top: [
            { query: "ai agents", value: 75 },
            { query: "autogpt", value: 58 },
          ],
          rising: [
            { query: "ai agents framework", value: 140 },
            { query: "autonomous ai", value: 90 },
          ],
        },
      },
      raw: { mock: true, keyword, location, timeframe },
    })

    return {
      platforms: {
        web: buildPlatform("web"),
        youtube: buildPlatform("youtube"),
        news: buildPlatform("news"),
        shopping: buildPlatform("shopping"),
      },
      globalVolume: 500000,
    }
  }

  const payloads = buildBatchPayloads(keyword, location, timeframe)

  const [res, volumeRes] = await Promise.all([
    dataForSEOFetch<DataForSEOExploreResult>(
      "/keywords_data/google_trends/explore/live",
      payloads
    ),
    dataForSEOFetch<DataForSEOHistoryResult>(
      "/dataforseo_labs/google/historical_search_volume/live",
      [{ keyword }]
    ),
  ])

  if (!Array.isArray(res.tasks)) {
    throw new Error("DataForSEO: Invalid explore response")
  }

  const results: Partial<TrendBatchResult> = {}

  res.tasks.forEach((task, index) => {
    if (task.status_code !== 20000) {
      throw new Error(task.status_message || "DataForSEO task failed")
    }

    const platform = (task.data?.type as TrendPlatform) ?? payloads[index]?.type
    const result = (task.result?.[0] ?? {}) as DataForSEOExploreResult

    if (!platform) return
    results[platform] = parseExploreResult(result, platform)
  })

  const platforms: TrendBatchResult = {
    web: results.web ?? parseExploreResult(undefined, "web"),
    youtube: results.youtube ?? parseExploreResult(undefined, "youtube"),
    news: results.news ?? parseExploreResult(undefined, "news"),
    shopping: results.shopping ?? parseExploreResult(undefined, "shopping"),
  }

  const volumeTask = volumeRes.tasks?.[0]
  const volumeResult = volumeTask?.result?.[0]
  const volumeItem = Array.isArray(volumeResult?.items) ? volumeResult?.items?.[0] : null
  const globalVolume =
    volumeItem?.historical_search_volume ??
    volumeItem?.search_volume ??
    volumeResult?.historical_search_volume ??
    volumeResult?.search_volume ??
    null

  return {
    platforms,
    globalVolume: typeof globalVolume === "number" && Number.isFinite(globalVolume) ? globalVolume : null,
  }
}

export async function fetchTrendAnalysis(
  keyword: string,
  country: string,
  timeframe: string
): Promise<TrendAnalysisResult> {
  if (isMockMode()) {
    const seed = getMockSeed(country, keyword)
    const timeline = buildMockTimeline(timeframe, seed)
    const web = timeline.map((point) => point.web ?? 0)
    const youtube = timeline.map((point) => point.youtube ?? 0)
    const news = timeline.map((point) => point.news ?? 0)
    const shopping = timeline.map((point) => point.shopping ?? 0)

    return {
      timeline,
      forecasts: {
        web: calculateForecast(web, 3),
        youtube: calculateForecast(youtube, 3),
        news: calculateForecast(news, 3),
        shopping: calculateForecast(shopping, 3),
      },
      map: distributeVolume(
        [
          { id: "US", value: 92 },
          { id: "IN", value: 78 },
          { id: "GB", value: 64 },
        ],
        500000
      ),
      relatedTopics: [
        { title: "AI Agents Framework", type: "Event", value: 120 },
        { title: "Autonomous AI", type: "Topic", value: 70 },
        { title: "AutoGPT", type: "Topic", value: 60 },
      ],
      globalVolume: 500000,
    }
  }

  const location_code = getDataForSEOLocationCode(country)
  const time_range = mapTimeframeToApi(timeframe.trim().toUpperCase())

  const tasks: TrendExploreTaskPayload[] = [
    { type: "web", keywords: [keyword], time_range, location_code },
    { type: "youtube", keywords: [keyword], time_range, location_code },
    { type: "news", keywords: [keyword], time_range, location_code },
    { type: "froogle", keywords: [keyword], time_range, location_code },
  ]

  const [trendsResponse, volumeResponse] = await Promise.all([
    dataForSEOFetch<DataForSEOExploreResult>("/keywords_data/google_trends/explore/live", tasks),
    dataForSEOFetch<DataForSEOHistoryResult>("/dataforseo_labs/google/historical_search_volume/live", [
      { keyword },
    ]),
  ])

  return await parseTrendResponse(trendsResponse, volumeResponse)
}

export const parseTrendResponse = async (
  trendsResponse: DataForSEOResponse<DataForSEOExploreResult>,
  volumeResponse: DataForSEOResponse<DataForSEOHistoryResult>
): Promise<TrendAnalysisResult> => {
  const tasks = trendsResponse.tasks ?? []
  const platforms: Partial<Record<TrendPlatform, TrendBatchPlatformResult>> = {}

  tasks.forEach((task) => {
    if (task.status_code !== 20000) return
    const platform = mapTaskTypeToPlatform(task.data?.type as string | undefined)
    if (!platform) return
    platforms[platform] = parseExploreResult(task.result?.[0] ?? {}, platform)
  })

  const web = platforms.web ?? parseExploreResult(undefined, "web")
  const youtube = platforms.youtube ?? parseExploreResult(undefined, "youtube")
  const news = platforms.news ?? parseExploreResult(undefined, "news")
  const shopping = platforms.shopping ?? parseExploreResult(undefined, "shopping")

  const webSeries = extractSeries(web.chart.items)
  const youtubeSeries = extractSeries(youtube.chart.items)
  const newsSeries = extractSeries(news.chart.items)
  const shoppingSeries = extractSeries(shopping.chart.items)

  const labels = mergeLabels([
    webSeries.labels,
    youtubeSeries.labels,
    newsSeries.labels,
    shoppingSeries.labels,
  ])

  const webMap = new Map(webSeries.labels.map((label, index) => [label, webSeries.values[index]]))
  const youtubeMap = new Map(
    youtubeSeries.labels.map((label, index) => [label, youtubeSeries.values[index]])
  )
  const newsMap = new Map(
    newsSeries.labels.map((label, index) => [label, newsSeries.values[index]])
  )
  const shoppingMap = new Map(
    shoppingSeries.labels.map((label, index) => [label, shoppingSeries.values[index]])
  )

  const timeline = labels.map((label) => ({
    date: label,
    web: webMap.get(label) ?? null,
    youtube: youtubeMap.get(label) ?? null,
    news: newsMap.get(label) ?? null,
    shopping: shoppingMap.get(label) ?? null,
  }))

  const volumeTask = volumeResponse.tasks?.[0]
  const volumeResult = volumeTask?.result?.[0]
  const volumeItem = Array.isArray(volumeResult?.items) ? volumeResult?.items?.[0] : null
  const globalVolume =
    volumeItem?.historical_search_volume ??
    volumeItem?.search_volume ??
    volumeResult?.historical_search_volume ??
    volumeResult?.search_volume ??
    null

  const mapBreakdown = web.map.map((row) => ({
    id: String(row.geo_id),
    value: row.values[0] ?? 0,
  }))

  const map = distributeVolume(mapBreakdown, typeof globalVolume === "number" ? globalVolume : 0)

  const relatedTopics = web.related.topics.rising ?? []

  const forecasts: TrendForecasts = {
    web: calculateForecast(webSeries.values, 3),
    youtube: calculateForecast(youtubeSeries.values, 3),
    news: calculateForecast(newsSeries.values, 3),
    shopping: calculateForecast(shoppingSeries.values, 3),
  }

  return {
    timeline,
    forecasts,
    map,
    relatedTopics,
    globalVolume: typeof globalVolume === "number" && Number.isFinite(globalVolume) ? globalVolume : null,
  }
}

export async function fetchRegionData(keyword: string, countryCode: string) {
  const location_code = getDataForSEOLocationCode(countryCode)

  const payload = {
    keywords: [keyword],
    location_code,
  }

  const res = await dataForSEOFetch<{ items?: TrendRegionItem[] }>(
    "/keywords_data/google_trends/subregion_interests/live",
    [payload]
  )

  const task = res.tasks?.[0]
  if (!task || task.status_code !== 20000) {
    throw new Error(task?.status_message || "DataForSEO region interests error")
  }

  const items = Array.isArray(task.result?.[0]?.items) ? task.result?.[0]?.items : []

  return items
    .filter((item) => item && typeof item.name === "string")
    .map((item) => ({
      name: item.name ?? "Unknown",
      value: typeof item.value === "number" ? item.value : 0,
    }))
}

export async function fetchGlobalVolume(keyword: string): Promise<number | null> {
  const res = await dataForSEOFetch<DataForSEOHistoryResult>(
    "/dataforseo_labs/google/historical_search_volume/live",
    [{ keyword }]
  )

  const task = res.tasks?.[0]
  if (!task || task.status_code !== 20000) {
    throw new Error(task?.status_message || "DataForSEO historical volume error")
  }

  const result = task.result?.[0] as DataForSEOHistoryResult | undefined
  if (!result) return null

  const item = Array.isArray(result.items) ? result.items[0] : null
  const volume =
    item?.historical_search_volume ??
    item?.search_volume ??
    result.historical_search_volume ??
    result.search_volume

  return typeof volume === "number" && Number.isFinite(volume) ? volume : null
}

export async function fetchRegionInterests(country: string) {
  const locationParams = parseLocation(country)

  const payload = {
    location_code: locationParams.location_code,
    location_name: locationParams.location_name,
  }

  const res = await dataForSEOFetch<{ items?: Array<{ name?: string; value?: number }> }>(
    "/keywords_data/google_trends/subregion_interests/live",
    [payload]
  )

  const task = res.tasks?.[0]
  if (!task || task.status_code !== 20000) {
    throw new Error(task?.status_message || "DataForSEO region interests error")
  }

  const result = task.result?.[0]
  const items = Array.isArray(result?.items) ? result?.items : []

  return items
    .filter((item) => item && (typeof item.name === "string" || typeof item.value === "number"))
    .map((item) => ({
      name: item.name ?? "Unknown",
      value: typeof item.value === "number" ? item.value : 0,
    }))
}
