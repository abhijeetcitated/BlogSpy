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

import { dataForSEOClient } from "@/services/dataforseo/client"

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

function isMockMode(): boolean {
  return process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true"
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

function getLocationCode(countryCode: string): number {
  const locationMap: Record<string, number> = {
    US: 2840,
    GB: 2826,
    CA: 2124,
    AU: 2036,
    DE: 2276,
    FR: 2250,
    IN: 2356,
    BR: 2076,
    ES: 2724,
    IT: 2380,
    NL: 2528,
    JP: 2392,
    MX: 2484,
    SG: 2702,
    AE: 2784,
    ZA: 2710,
  }

  return locationMap[countryCode.toUpperCase()] ?? 2840
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
        location_code: getLocationCode(country),
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
