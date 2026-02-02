// ============================================
// KEYWORD RESEARCH - Social Insights Service
// ============================================
// Fetches:
// - YouTube SERP results (DataForSEO SERP: /v3/serp/youtube/organic/live/advanced)
// - Reddit threads (DataForSEO Social: /v3/business_data/social_media/reddit/live)
// - Pinterest pins (DataForSEO Social: /v3/business_data/social_media/pinterest/live)
//
// Supports mock mode: NEXT_PUBLIC_USE_MOCK_DATA=true
// ============================================

import "server-only"

import { dataForSEOClient } from "@/services/dataforseo/client"

import { getDataForSEOLocationCode } from "@/lib/dataforseo/locations"
import type { CommunityResult, DrawerDataResponse, YouTubeResult } from "../types"

type DataForSEOSerpResultItem = {
  title?: string
  description?: string
  url?: string
  // best-effort fields (varies by endpoint)
  thumbnail_url?: string
  thumbnail?: string
  views?: number
  views_count?: number
  channel?: string
  channel_name?: string
  published?: string
  date?: string
}

type DataForSEOSerpResult = {
  items?: DataForSEOSerpResultItem[]
}

type DataForSEORedditItem = {
  title?: string
  url?: string
  subreddit?: string
  subreddit_members?: number
  score?: number
  comments?: number
  author?: string
}

type DataForSEORedditResult = {
  items?: DataForSEORedditItem[]
}

type DataForSEOPinterestItem = {
  title?: string
  url?: string
  image_url?: string
  thumbnail_url?: string
  saves?: number
  pins_count?: number
}

type DataForSEOPinterestResult = {
  items?: DataForSEOPinterestItem[]
  pins_count?: number
}

export interface RedditThread {
  title: string
  url: string
  subreddit?: string
  subredditMembers?: number
  score?: number
  comments?: number
  author?: string
  createdAt?: string | null
  ageDays?: number | null
}

export interface RedditInsight {
  threads: RedditThread[]
  heatIndex: number
  topSubreddit?: string
  topSubredditMembers?: number
}

export interface PinterestInsight {
  pins: CommunityResult[]
  totalPins: number
  viralityScore: number
}

export interface QuoraDiscussion {
  title: string
  url: string
  snippet?: string
  answersCount?: number | null
  upvotes?: number | null
  date?: string | null
  answerRecencyDays: number | null
}

export interface QuoraInsight {
  discussions: QuoraDiscussion[]
  presenceScore: number
}

export interface SocialIntelPayload {
  youtube: YouTubeResult[]
  reddit: RedditInsight
  pinterest: PinterestInsight
  quora: QuoraInsight
}

function isMockMode(): boolean {
  const hasCredentials = Boolean(process.env.DATAFORSEO_LOGIN && process.env.DATAFORSEO_PASSWORD)
  return process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true" && !hasCredentials
}

function stableHash(input: string): number {
  let h = 0
  for (let i = 0; i < input.length; i++) {
    h = (h * 31 + input.charCodeAt(i)) >>> 0
  }
  return h
}

function formatK(num: number): string {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`
  return `${num}`
}

function toIsoDaysAgo(days: number): string {
  const date = new Date()
  date.setDate(date.getDate() - Math.max(0, Math.floor(days)))
  return date.toISOString()
}

function ageDaysFromIso(value?: string | null): number | null {
  if (!value) return null
  const parsed = Date.parse(value)
  if (Number.isNaN(parsed)) return null
  const diffMs = Date.now() - parsed
  return Math.max(0, Math.round(diffMs / (1000 * 60 * 60 * 24)))
}

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)))
}

function calculateHeatIndex(threads: RedditThread[]): number {
  if (threads.length === 0) return 0
  const totalComments = threads.reduce((sum, t) => sum + (t.comments ?? 0), 0)
  const score = threads.length * 2 + totalComments / 10
  return clampScore(score)
}

function calculatePinterestVirality(totalPins: number): number {
  if (!Number.isFinite(totalPins) || totalPins <= 0) return 0
  const scaled = totalPins / 10
  return clampScore(scaled)
}

function calculateQuoraPresence(discussions: QuoraDiscussion[]): number {
  if (discussions.length === 0) return 0
  const recencyBonus = discussions.some((d) => (d.answerRecencyDays ?? 999) <= 30) ? 15 : 0
  return clampScore(discussions.length * 12 + recencyBonus)
}

function pickFirstResult<T>(data: T | T[] | undefined): T | undefined {
  if (!data) return undefined
  return Array.isArray(data) ? data[0] : data
}

function mockYouTube(keyword: string): YouTubeResult[] {
  const h = stableHash(keyword)
  const titles = ["Complete Guide", "Honest Review", "Best Tools & Workflow", "Beginner Tutorial", "Top 10 Mistakes"]
  const recency = ["2 days ago", "2 weeks ago", "2 months ago", "8 months ago", "1 year ago"]

  return Array.from({ length: 12 }, (_, i) => {
    const views = 5_000 + ((h + i * 97) % 2_000_000)
    const vid = `${(h + i * 17).toString(16)}${i}`

    return {
      title: `${keyword} — ${titles[(h + i) % titles.length]}`,
      url: `https://www.youtube.com/watch?v=${vid}`,
      thumbnailUrl: `https://i.ytimg.com/vi/${vid}/hqdefault.jpg`,
      views,
      viewsLabel: `${formatK(views)} views`,
      channel: ["Ozmeum", "CreatorLab", "SEO Playbook", "GrowthBytes"][((h >>> 5) + i) % 4],
      published: recency[(h + i) % recency.length],
    }
  })
}

function mockReddit(keyword: string): CommunityResult[] {
  const h = stableHash(keyword)
  const subreddits = ["SEO", "marketing", "Entrepreneur", "Productivity", "SmallBusiness"]

  return Array.from({ length: 10 }, (_, i) => {
    const subreddit = subreddits[(h + i) % subreddits.length]
    const score = 10 + ((h + i * 31) % 2800)
    const comments = 2 + ((h + i * 17) % 420)

    return {
      platform: "reddit",
      title: `Discussing: ${keyword} — ${["tips", "mistakes", "tools", "case study", "help"][((h >>> 3) + i) % 5]}`,
      url: `https://www.reddit.com/r/${subreddit}/comments/${(h + i * 13).toString(16)}/`,
      subreddit,
      subredditMembers: 50_000 + ((h + i * 101) % 900_000),
      score,
      comments,
      author: `user_${(h + i * 7) % 9999}`,
    }
  })
}

function mockPinterest(keyword: string): { pins: CommunityResult[]; totalPins: number } {
  const h = stableHash(keyword)
  const totalPins = 1200 + ((h % 5000) + 250)

  const pins: CommunityResult[] = Array.from({ length: 30 }, (_, i) => ({
    platform: "pinterest",
    title: `${keyword} — ${["ideas", "templates", "checklist", "inspiration", "examples"][((h >>> 7) + i) % 5]}`,
    url: `https://www.pinterest.com/pin/${(h + i * 29) % 1_000_000_000}/`,
    imageUrl: `https://via.placeholder.com/240x240?text=${encodeURIComponent(keyword.slice(0, 18))}`,
    saves: 10 + ((h + i * 19) % 25_000),
  }))

  return { pins, totalPins }
}

function mockRedditThreads(keyword: string): RedditThread[] {
  const h = stableHash(keyword)
  const subreddits = ["SEO", "marketing", "Entrepreneur", "Productivity", "SmallBusiness"]

  return Array.from({ length: 10 }, (_, i) => {
    const subreddit = subreddits[(h + i) % subreddits.length]
    const score = 10 + ((h + i * 31) % 2800)
    const comments = 2 + ((h + i * 17) % 420)
    const ageDays = 1 + ((h + i * 13) % 120)

    return {
      title: `Discussing: ${keyword} - ${["tips", "mistakes", "tools", "case study", "help"][((h >>> 3) + i) % 5]}`,
      url: `https://www.reddit.com/r/${subreddit}/comments/${(h + i * 13).toString(16)}/`,
      subreddit,
      subredditMembers: 50_000 + ((h + i * 101) % 900_000),
      score,
      comments,
      author: `user_${(h + i * 7) % 9999}`,
      createdAt: toIsoDaysAgo(ageDays),
      ageDays,
    }
  })
}

function mockQuoraDiscussions(keyword: string): QuoraDiscussion[] {
  const h = stableHash(keyword)
  return Array.from({ length: 6 }, (_, i) => {
    const ageDays = 3 + ((h + i * 19) % 240)
    return {
      title: `What is the best way to ${keyword}? (${i + 1})`,
      url: `https://www.quora.com/${encodeURIComponent(keyword)}-discussion-${(h + i * 11).toString(16)}`,
      snippet: "23 Answers · 156 Upvotes",
      answersCount: 23 + ((h + i) % 15),
      upvotes: 40 + ((h + i * 7) % 500),
      date: toIsoDaysAgo(ageDays),
      answerRecencyDays: ageDays,
    }
  })
}

function buildRedditInsight(threads: RedditThread[]): RedditInsight {
  const top = threads.reduce<RedditThread | null>((best, current) => {
    if (!best) return current
    const bestMembers = best.subredditMembers ?? 0
    const currentMembers = current.subredditMembers ?? 0
    return currentMembers > bestMembers ? current : best
  }, null)

  return {
    threads,
    heatIndex: calculateHeatIndex(threads),
    topSubreddit: top?.subreddit,
    topSubredditMembers: top?.subredditMembers,
  }
}

function buildPinterestInsight(keyword: string): PinterestInsight {
  const { pins, totalPins } = mockPinterest(keyword)
  return {
    pins,
    totalPins,
    viralityScore: calculatePinterestVirality(totalPins),
  }
}

function buildQuoraInsight(keyword: string): QuoraInsight {
  const discussions = mockQuoraDiscussions(keyword)
  return {
    discussions,
    presenceScore: calculateQuoraPresence(discussions),
  }
}

function parseQuoraSnippet(snippet?: string | null): {
  answersCount?: number | null
  upvotes?: number | null
} {
  if (!snippet) return {}
  const parseMetric = (pattern: RegExp) => {
    const match = snippet.match(pattern)
    if (!match) return undefined
    const raw = match[1].replace(/,/g, "")
    const value = Number.parseFloat(raw)
    if (Number.isNaN(value)) return undefined
    const suffix = match[2]?.toLowerCase()
    if (suffix === "k") return Math.round(value * 1000)
    if (suffix === "m") return Math.round(value * 1_000_000)
    return Math.round(value)
  }

  const answersCount = parseMetric(/(\d+(?:[.,]\d+)?)(k|m)?\s+Answers?/i)
  const upvotes = parseMetric(/(\d+(?:[.,]\d+)?)(k|m)?\s+Upvotes?/i)

  return { answersCount, upvotes }
}

export async function fetchQuoraForensic(
  keyword: string,
  country: string = "US",
  forceMock: boolean = false
): Promise<QuoraInsight> {
  if (!keyword.trim()) {
    return { discussions: [], presenceScore: 0 }
  }

  if (forceMock || isMockMode()) {
    return buildQuoraInsight(keyword)
  }

  try {
    const endpoint = "/v3/serp/google/organic/live/advanced"
    const payload = [
      {
        keyword: `site:quora.com \"${keyword}\"`,
        location_code: getDataForSEOLocationCode(country),
        language_code: "en",
        depth: 10,
        se_domain: "google.com",
      },
    ]

    const res = await dataForSEOClient.request<DataForSEOSerpResult[]>(endpoint, payload)
    if (!res.success) {
      return { discussions: [], presenceScore: 0 }
    }

    const first = pickFirstResult(res.data)
    const items = (first as DataForSEOSerpResult | undefined)?.items ?? []

    const discussions: QuoraDiscussion[] = items
      .filter((item) => typeof item.url === "string" && item.url.includes("quora.com"))
      .map((item) => {
        const snippet = item.description?.trim() || undefined
        const { answersCount, upvotes } = parseQuoraSnippet(snippet)

        return {
          title: item.title?.trim() || "Quora discussion",
          url: item.url ?? "",
          snippet,
          answersCount: typeof answersCount === "number" ? answersCount : null,
          upvotes: typeof upvotes === "number" ? upvotes : null,
          date: item.date ?? item.published ?? null,
          answerRecencyDays: ageDaysFromIso(item.date ?? item.published ?? null),
        }
      })
      .filter((item) => item.url)
      .slice(0, 5)

    return {
      discussions,
      presenceScore: calculateQuoraPresence(discussions),
    }
  } catch {
    return { discussions: [], presenceScore: 0 }
  }
}

function toYouTubeResult(item: DataForSEOSerpResultItem): YouTubeResult | null {
  const title = item.title?.trim()
  const url = item.url?.trim()
  if (!title || !url) return null

  const thumbnailUrl = item.thumbnail_url || item.thumbnail
  const views =
    typeof item.views === "number" ? item.views : typeof item.views_count === "number" ? item.views_count : undefined

  const published = item.published?.trim() || item.date?.trim() || undefined

  return {
    title,
    url,
    thumbnailUrl,
    views,
    viewsLabel: typeof views === "number" ? `${formatK(views)} views` : undefined,
    channel: item.channel_name || item.channel,
    published,
  }
}

function toRedditResult(item: DataForSEORedditItem): CommunityResult | null {
  const title = item.title?.trim()
  const url = item.url?.trim()
  if (!title || !url) return null

  return {
    platform: "reddit",
    title,
    url,
    subreddit: item.subreddit?.trim() || undefined,
    subredditMembers: typeof item.subreddit_members === "number" ? item.subreddit_members : undefined,
    score: typeof item.score === "number" ? item.score : undefined,
    comments: typeof item.comments === "number" ? item.comments : undefined,
    author: item.author?.trim() || undefined,
  }
}

function toPinterestResult(item: DataForSEOPinterestItem): CommunityResult | null {
  const title = item.title?.trim()
  const url = item.url?.trim()
  if (!title || !url) return null

  const imageUrl = item.image_url || item.thumbnail_url

  return {
    platform: "pinterest",
    title,
    url,
    imageUrl,
    saves: typeof item.saves === "number" ? item.saves : undefined,
  }
}

export async function fetchYouTubeData(
  keyword: string,
  country: string = "US"
): Promise<DrawerDataResponse<YouTubeResult[]>> {
  if (!keyword.trim()) {
    return { success: false, error: "Keyword is required", isRetryable: false, source: "dataforseo" }
  }

  if (isMockMode()) {
    return { success: true, data: mockYouTube(keyword), source: "mock" }
  }

  try {
    const payload = [
      {
        keyword,
        location_code: getDataForSEOLocationCode(country),
        language_code: "en",
        depth: 20,
        calculate_rectangles: false,
      },
    ]

    const endpoint = "/v3/serp/youtube/organic/live/advanced"

    const res = await dataForSEOClient.request<DataForSEOSerpResult[]>(endpoint, payload)

    if (!res.success) {
      return {
        success: false,
        error: res.error || "Failed to fetch YouTube data",
        isRetryable: true,
        source: "dataforseo",
      }
    }

    const first = pickFirstResult(res.data)
    const items = (first as DataForSEOSerpResult | undefined)?.items ?? []

    const videos: YouTubeResult[] = items
      .map(toYouTubeResult)
      .filter((v): v is YouTubeResult => v !== null)
      .slice(0, 12)

    return { success: true, data: videos, source: "dataforseo" }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch YouTube data",
      isRetryable: true,
      source: "dataforseo",
    }
  }
}

export async function fetchRedditData(keyword: string): Promise<DrawerDataResponse<CommunityResult[]>> {
  if (!keyword.trim()) {
    return { success: false, error: "Keyword is required", isRetryable: false, source: "dataforseo" }
  }

  if (isMockMode()) {
    return { success: true, data: mockReddit(keyword), source: "mock" }
  }

  try {
    const endpoint = "/v3/business_data/social_media/reddit/live"
    const payload = [{ keyword, depth: 20 }]

    const res = await dataForSEOClient.request<DataForSEORedditResult[]>(endpoint, payload)

    if (!res.success) {
      return {
        success: false,
        error: res.error || "Failed to fetch Reddit data",
        isRetryable: true,
        source: "dataforseo",
      }
    }

    const first = pickFirstResult(res.data)
    const items = (first as DataForSEORedditResult | undefined)?.items ?? []

    const threads = items
      .map(toRedditResult)
      .filter((r): r is CommunityResult => r !== null)
      .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
      .slice(0, 10)

    return { success: true, data: threads, source: "dataforseo" }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch Reddit data",
      isRetryable: true,
      source: "dataforseo",
    }
  }
}

export async function fetchPinterestData(
  keyword: string
): Promise<DrawerDataResponse<{ pins: CommunityResult[]; totalPins: number }>> {
  if (!keyword.trim()) {
    return { success: false, error: "Keyword is required", isRetryable: false, source: "dataforseo" }
  }

  if (isMockMode()) {
    const { pins, totalPins } = mockPinterest(keyword)
    return { success: true, data: { pins, totalPins }, source: "mock" }
  }

  try {
    const endpoint = "/v3/business_data/social_media/pinterest/live"
    const payload = [{ keyword, depth: 20 }]

    const res = await dataForSEOClient.request<DataForSEOPinterestResult[]>(endpoint, payload)

    if (!res.success) {
      return {
        success: false,
        error: res.error || "Failed to fetch Pinterest data",
        isRetryable: true,
        source: "dataforseo",
      }
    }

    const first = pickFirstResult(res.data)
    const items = (first as DataForSEOPinterestResult | undefined)?.items ?? []
    const totalPins = (first as DataForSEOPinterestResult | undefined)?.pins_count ?? items.length

    const pins: CommunityResult[] = items
      .map(toPinterestResult)
      .filter((p): p is CommunityResult => p !== null)
      .slice(0, 30)

    return { success: true, data: { pins, totalPins }, source: "dataforseo" }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch Pinterest data",
      isRetryable: true,
      source: "dataforseo",
    }
  }
}

export async function fetchYouTubeResults(
  keyword: string,
  country: string,
  forceMock: boolean
): Promise<YouTubeResult[]> {
  if (forceMock || isMockMode()) {
    return mockYouTube(keyword)
  }

  const res = await fetchYouTubeData(keyword, country)
  return res.success ? (res.data ?? []) : []
}

export async function fetchRedditInsight(
  keyword: string,
  forceMock: boolean = false
): Promise<RedditInsight> {
  if (!keyword.trim()) {
    return buildRedditInsight([])
  }

  if (forceMock || isMockMode()) {
    return buildRedditInsight(mockRedditThreads(keyword))
  }

  const res = await fetchRedditData(keyword)
  const threads: RedditThread[] = (res.success ? (res.data ?? []) : []).map((item) => ({
    title: item.title,
    url: item.url,
    subreddit: item.subreddit,
    subredditMembers: item.subredditMembers,
    score: item.score,
    comments: item.comments,
    author: item.author,
    createdAt: null,
    ageDays: null,
  }))

  return buildRedditInsight(threads)
}

export async function fetchPinterestInsight(
  keyword: string,
  forceMock: boolean = false
): Promise<PinterestInsight> {
  if (!keyword.trim()) {
    return { pins: [], totalPins: 0, viralityScore: 0 }
  }

  if (forceMock || isMockMode()) {
    return buildPinterestInsight(keyword)
  }

  const res = await fetchPinterestData(keyword)
  const pins = res.success ? (res.data?.pins ?? []) : []
  const totalPins = res.success ? (res.data?.totalPins ?? pins.length) : 0

  return {
    pins,
    totalPins,
    viralityScore: calculatePinterestVirality(totalPins),
  }
}

export async function fetchQuoraFallback(
  keyword: string,
  country: string = "US",
  forceMock: boolean = false
): Promise<QuoraInsight> {
  if (!keyword.trim()) {
    return { discussions: [], presenceScore: 0 }
  }

  if (forceMock || isMockMode()) {
    return buildQuoraInsight(keyword)
  }

  try {
    const endpoint = "/v3/serp/google/organic/live/advanced"
    const payload = [
      {
        keyword: `site:quora.com ${keyword}`,
        location_code: getDataForSEOLocationCode(country),
        language_code: "en",
        depth: 10,
        se_domain: "google.com",
      },
    ]

    const res = await dataForSEOClient.request<DataForSEOSerpResult[]>(endpoint, payload)
    if (!res.success) {
      return { discussions: [], presenceScore: 0 }
    }

    const first = pickFirstResult(res.data)
    const items = (first as DataForSEOSerpResult | undefined)?.items ?? []

    const discussions: QuoraDiscussion[] = items
      .filter((item) => typeof item.url === "string" && item.url.includes("quora.com"))
      .map((item) => ({
        title: item.title?.trim() || "Quora discussion",
        url: item.url ?? "",
        answerRecencyDays: ageDaysFromIso(item.date),
      }))
      .filter((item) => item.url)

    return {
      discussions,
      presenceScore: calculateQuoraPresence(discussions),
    }
  } catch {
    return { discussions: [], presenceScore: 0 }
  }
}

export async function fetchSocialIntel(
  keyword: string,
  country: string = "US",
  opts?: { forceMock?: boolean }
): Promise<SocialIntelPayload> {
  const forceMock = opts?.forceMock === true

  const [youtube, reddit, pinterest, quora] = await Promise.all([
    fetchYouTubeResults(keyword, country, forceMock),
    fetchRedditInsight(keyword, forceMock),
    fetchPinterestInsight(keyword, forceMock),
    fetchQuoraForensic(keyword, country, forceMock),
  ])

  return {
    youtube,
    reddit,
    pinterest,
    quora,
  }
}
