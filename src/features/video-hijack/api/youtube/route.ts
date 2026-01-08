// ============================================
// VIDEO HIJACK - YouTube API Route (Refactored)
// ============================================
// Clean, maintainable API using route helpers
// ============================================

import { z } from "zod"
import { createProtectedHandler, ApiError } from "@/lib/api"

// ============================================
// TYPES
// ============================================

interface YouTubeSearchItem {
  id: { videoId: string }
  snippet: {
    title: string
    description: string
    channelId: string
    channelTitle: string
    publishedAt: string
    thumbnails: {
      default?: { url: string }
      high?: { url: string }
    }
  }
}

interface YouTubeVideoStats {
  id: string
  statistics: {
    viewCount: string
    likeCount: string
    commentCount: string
  }
  contentDetails: {
    duration: string
  }
}

interface YouTubeChannel {
  id: string
  snippet: {
    thumbnails: {
      default?: { url: string }
    }
  }
  statistics: {
    subscriberCount: string
  }
}

// ============================================
// CONFIGURATION
// ============================================

const YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3"

// ============================================
// SCHEMAS
// ============================================

const YouTubeSearchSchema = z.object({
  query: z.string().min(1, "Query is required").max(200, "Query too long"),
  maxResults: z.coerce.number().int().min(1).max(50).default(25),
  pageToken: z.string().optional(),
  order: z.enum(["relevance", "date", "viewCount", "rating"]).default("relevance"),
  regionCode: z.string().length(2).default("US"),
})

const YouTubeAnalyticsSchema = z.object({
  keyword: z.string().min(1, "Keyword is required").max(200, "Keyword too long"),
})

type YouTubeSearchInput = z.infer<typeof YouTubeSearchSchema>
type YouTubeAnalyticsInput = z.infer<typeof YouTubeAnalyticsSchema>

// ============================================
// GET - Search YouTube Videos
// ============================================

export const GET = createProtectedHandler<YouTubeSearchInput>({
  rateLimit: "search",
  schema: YouTubeSearchSchema,
  handler: async ({ data }) => {
    const { query, maxResults, pageToken, order, regionCode } = data
    
    // Check for API key
    const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY

    if (!YOUTUBE_API_KEY) {
      // Return mock data if no API key configured
      return {
        items: generateMockYouTubeResults(query, maxResults),
        pageInfo: { totalResults: 100, resultsPerPage: maxResults },
        nextPageToken: "mock_next_page",
        source: "mock" as const,
      }
    }

    // Fetch from YouTube API
    const searchUrl = new URL(`${YOUTUBE_API_BASE}/search`)
    searchUrl.searchParams.set("part", "snippet")
    searchUrl.searchParams.set("q", query)
    searchUrl.searchParams.set("type", "video")
    searchUrl.searchParams.set("maxResults", maxResults.toString())
    searchUrl.searchParams.set("order", order)
    searchUrl.searchParams.set("regionCode", regionCode)
    searchUrl.searchParams.set("key", YOUTUBE_API_KEY)
    if (pageToken) searchUrl.searchParams.set("pageToken", pageToken)

    const searchResponse = await fetch(searchUrl.toString())
    const searchData = await searchResponse.json()

    if (!searchResponse.ok) {
      console.error("[YouTube API] Search Error:", searchData.error)
      throw ApiError.badRequest("Failed to fetch video data")
    }

    // Get video statistics
    const videoIds = (searchData.items as YouTubeSearchItem[]).map((item) => item.id.videoId).join(",")
    
    if (!videoIds) {
      return {
        items: [],
        pageInfo: { totalResults: 0, resultsPerPage: maxResults },
        nextPageToken: null,
        source: "api" as const,
      }
    }

    const [statsData, channelData] = await Promise.all([
      fetchVideoStats(videoIds, YOUTUBE_API_KEY),
      fetchChannelStats(searchData.items as YouTubeSearchItem[], YOUTUBE_API_KEY),
    ])

    // Merge data
    const channelMap = new Map<string, YouTubeChannel>(
      (channelData.items as YouTubeChannel[] || []).map((ch) => [ch.id, ch])
    )
    const statsMap = new Map<string, YouTubeVideoStats>(
      (statsData.items as YouTubeVideoStats[] || []).map((st) => [st.id, st])
    )

    const videos = (searchData.items as YouTubeSearchItem[]).map((item) => {
      const stats = statsMap.get(item.id.videoId)
      const channel = channelMap.get(item.snippet.channelId)

      return transformVideoData(item, stats, channel)
    })

    return {
      items: videos,
      pageInfo: searchData.pageInfo,
      nextPageToken: searchData.nextPageToken || null,
      source: "api" as const,
    }
  },
})

// ============================================
// POST - Keyword Analytics
// ============================================

export const POST = createProtectedHandler<YouTubeAnalyticsInput>({
  rateLimit: "strict", // Analytics is expensive
  schema: YouTubeAnalyticsSchema,
  handler: async ({ data }) => {
    const { keyword } = data
    
    const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY

    if (!YOUTUBE_API_KEY) {
      // Return mock analytics
      return generateMockAnalytics(keyword)
    }

    // TODO: Implement real analytics when API key is available
    // For now, return mock data that matches the expected structure
    return generateMockAnalytics(keyword)
  },
})

// ============================================
// HELPER FUNCTIONS
// ============================================

async function fetchVideoStats(videoIds: string, apiKey: string) {
  const statsUrl = new URL(`${YOUTUBE_API_BASE}/videos`)
  statsUrl.searchParams.set("part", "statistics,contentDetails")
  statsUrl.searchParams.set("id", videoIds)
  statsUrl.searchParams.set("key", apiKey)

  const response = await fetch(statsUrl.toString())
  return response.json()
}

async function fetchChannelStats(items: YouTubeSearchItem[], apiKey: string) {
  const channelIds = [...new Set(items.map((item) => item.snippet.channelId))].join(",")
  
  const channelUrl = new URL(`${YOUTUBE_API_BASE}/channels`)
  channelUrl.searchParams.set("part", "statistics,snippet")
  channelUrl.searchParams.set("id", channelIds)
  channelUrl.searchParams.set("key", apiKey)

  const response = await fetch(channelUrl.toString())
  return response.json()
}

function transformVideoData(item: YouTubeSearchItem, stats: YouTubeVideoStats | undefined, channel: YouTubeChannel | undefined) {
  const views = parseInt(stats?.statistics?.viewCount || "0")
  const likes = parseInt(stats?.statistics?.likeCount || "0")
  const comments = parseInt(stats?.statistics?.commentCount || "0")
  const subs = parseInt(channel?.statistics?.subscriberCount || "0")
  const engagement = calculateEngagement(likes, comments, views)

  return {
    id: item.id.videoId,
    title: item.snippet.title,
    description: item.snippet.description,
    thumbnail: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url,
    channelId: item.snippet.channelId,
    channelName: item.snippet.channelTitle,
    channelThumbnail: channel?.snippet?.thumbnails?.default?.url || "",
    channelSubs: subs,
    channelVerified: subs > 100000,
    publishedAt: item.snippet.publishedAt,
    views,
    likes,
    comments,
    duration: stats?.contentDetails?.duration || "PT0S",
    url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
    engagementRate: engagement,
    opportunityScore: calculateOpportunityScore(views, subs, engagement),
    tags: [],
  }
}

function calculateEngagement(likes: number, comments: number, views: number): number {
  if (views === 0) return 0
  return Math.round(((likes + comments * 2) / views) * 100 * 100) / 100
}

function calculateOpportunityScore(views: number, subs: number, engagement: number): number {
  // High views + low subs + low engagement = high opportunity
  const viewScore = Math.min(views / 100000, 100) * 0.3
  const subScore = (1 - Math.min(subs / 1000000, 1)) * 100 * 0.3
  const engageScore = (10 - Math.min(engagement, 10)) * 10 * 0.4
  return Math.round(viewScore + subScore + engageScore)
}

function generateMockAnalytics(keyword: string) {
  return {
    keyword,
    searchVolume: Math.floor(Math.random() * 50000) + 10000,
    competition: ["low", "medium", "high"][Math.floor(Math.random() * 3)] as "low" | "medium" | "high",
    averageViews: Math.floor(Math.random() * 500000) + 50000,
    averageEngagement: Math.round((Math.random() * 8 + 2) * 100) / 100,
    topChannels: [
      { name: "Tech Channel", videos: 45, avgViews: 250000 },
      { name: "Tutorial Hub", videos: 38, avgViews: 180000 },
      { name: "Pro Tips", videos: 32, avgViews: 150000 },
    ],
    contentGaps: [
      "No recent tutorials in last 30 days",
      "Lack of beginner-friendly content",
      "Missing comparison videos",
    ],
    recommendedTags: [
      keyword.toLowerCase(),
      `${keyword} tutorial`,
      `${keyword} guide`,
      `how to ${keyword}`,
      `${keyword} 2026`,
    ],
  }
}

function generateMockYouTubeResults(query: string, count: number) {
  const results = []
  const titles = ["Complete Guide", "Tutorial", "Tips & Tricks", "For Beginners", "2026 Edition"]
  const channels = ["Tech", "Tutorial", "Pro", "Expert", "Learn"]
  
  for (let i = 0; i < count; i++) {
    const views = Math.floor(Math.random() * 1000000) + 10000
    const likes = Math.floor(views * (Math.random() * 0.05 + 0.01))
    const comments = Math.floor(likes * (Math.random() * 0.1 + 0.02))
    const subs = Math.floor(Math.random() * 500000) + 1000
    const engagement = calculateEngagement(likes, comments, views)

    results.push({
      id: `mock_yt_${i}_${Date.now()}`,
      title: `${query} - ${titles[i % titles.length]}`,
      description: `Learn everything about ${query} in this comprehensive video.`,
      thumbnail: `https://picsum.photos/seed/${encodeURIComponent(query)}${i}/640/360`,
      channelId: `channel_${i}`,
      channelName: `${channels[i % channels.length]} Channel ${i + 1}`,
      channelThumbnail: `https://picsum.photos/seed/ch${i}/100/100`,
      channelSubs: subs,
      channelVerified: subs > 100000,
      publishedAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
      views,
      likes,
      comments,
      duration: `PT${Math.floor(Math.random() * 20) + 5}M${Math.floor(Math.random() * 59)}S`,
      url: `https://www.youtube.com/watch?v=mock_${i}`,
      engagementRate: engagement,
      opportunityScore: calculateOpportunityScore(views, subs, engagement),
      tags: [query.toLowerCase(), "tutorial", "guide", "2026"],
    })
  }
  return results.sort((a, b) => b.opportunityScore - a.opportunityScore)
}
