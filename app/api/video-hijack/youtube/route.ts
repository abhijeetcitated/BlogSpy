// ============================================
// VIDEO HIJACK - YouTube API Route
// ============================================
// Handles YouTube Data API v3 requests
// ============================================

import { NextRequest, NextResponse } from "next/server"

// YouTube API configuration
// TODO: Set YOUTUBE_API_KEY in server env to enable live data.
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY
const YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3"

interface YouTubeSearchParams {
  query: string
  maxResults?: number
  pageToken?: string
  order?: "relevance" | "date" | "viewCount" | "rating"
  regionCode?: string
  relevanceLanguage?: string
}

/**
 * GET /api/video-hijack/youtube
 * Search YouTube videos for a given keyword (or fetch by videoId)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const videoId = searchParams.get("videoId")
    const query = searchParams.get("query")
    const maxResults = parseInt(searchParams.get("maxResults") || "25")
    const pageToken = searchParams.get("pageToken") || undefined
    const order = searchParams.get("order") as YouTubeSearchParams["order"] || "relevance"
    const regionCode = searchParams.get("regionCode") || "US"
    const publishedAfter = searchParams.get("publishedAfter") || undefined
    const videoDuration = searchParams.get("videoDuration") || undefined

    if (!query && !videoId) {
      return NextResponse.json(
        { error: "Query or videoId parameter is required" },
        { status: 400 }
      )
    }

    if (!YOUTUBE_API_KEY) {
      const fallbackQuery = query || "video"
      const mockItems = generateMockYouTubeResults(fallbackQuery, Math.max(1, maxResults))
      const items = videoId
        ? mockItems.slice(0, 1).map((item) => ({
            ...item,
            id: videoId,
            url: `https://www.youtube.com/watch?v=${videoId}`,
          }))
        : mockItems

      // Return mock data if no API key
      return NextResponse.json({
        success: true,
        data: {
          items,
          pageInfo: { totalResults: items.length, resultsPerPage: items.length },
          nextPageToken: "mock_next_page",
        },
        source: "mock",
      })
    }

    if (videoId) {
      const videosUrl = new URL(`${YOUTUBE_API_BASE}/videos`)
      videosUrl.searchParams.set("part", "snippet,statistics,contentDetails")
      videosUrl.searchParams.set("id", videoId)
      videosUrl.searchParams.set("key", YOUTUBE_API_KEY)

      const videosResponse = await fetch(videosUrl.toString())
      const videosData = await videosResponse.json()

      if (!videosResponse.ok) {
        throw new Error(videosData.error?.message || "YouTube API error")
      }

      if (!videosData.items?.length) {
        return NextResponse.json({
          success: true,
          data: {
            items: [],
            pageInfo: { totalResults: 0, resultsPerPage: 0 },
            nextPageToken: null,
          },
          source: "api",
        })
      }

      const channelIds = [
        ...new Set(
          videosData.items.map(
            (item: { snippet: { channelId: string } }) => item.snippet.channelId
          )
        ),
      ].join(",")

      const channelsParams = new URLSearchParams({
        part: "snippet,statistics",
        id: channelIds,
        key: YOUTUBE_API_KEY,
      })

      const channelsResponse = await fetch(
        `${YOUTUBE_API_BASE}/channels?${channelsParams.toString()}`
      )
      const channelsData = await channelsResponse.json()

      const channelItems = channelsData.items || []
      const channelMap = new Map<string, { name: string; subscribers: number }>(
        channelItems.map((ch: any) => [
          ch.id,
          {
            name: ch.snippet.title,
            subscribers: parseInt(ch.statistics.subscriberCount || "0"),
          },
        ])
      )

      const videos = videosData.items.map((item: any) => {
        const channel = channelMap.get(item.snippet.channelId)
        const views = parseInt(item.statistics?.viewCount || "0")
        const likes = parseInt(item.statistics?.likeCount || "0")
        const comments = parseInt(item.statistics?.commentCount || "0")

        return {
          id: item.id,
          title: item.snippet.title,
          description: item.snippet.description,
          thumbnail: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url,
          channelId: item.snippet.channelId,
          channelName: channel?.name || item.snippet.channelTitle,
          channelThumbnail: item.snippet.thumbnails?.default?.url || "",
          channelSubs: channel?.subscribers || 0,
          channelVerified: (channel?.subscribers || 0) > 100000,
          publishedAt: item.snippet.publishedAt,
          views,
          likes,
          comments,
          duration: item.contentDetails?.duration || "PT0S",
          url: `https://www.youtube.com/watch?v=${item.id}`,
          engagementRate: calculateEngagement(likes, comments, views),
          opportunityScore: calculateOpportunityScore(
            views,
            channel?.subscribers || 0,
            calculateEngagement(likes, comments, views)
          ),
          tags: item.snippet.tags || [],
        }
      })

      return NextResponse.json({
        success: true,
        data: {
          items: videos,
          pageInfo: { totalResults: videos.length, resultsPerPage: videos.length },
          nextPageToken: null,
        },
        source: "api",
      })
    }

    // Fetch from YouTube API
    const searchUrl = new URL(`${YOUTUBE_API_BASE}/search`)
    searchUrl.searchParams.set("part", "snippet")
    searchUrl.searchParams.set("q", query || "")
    searchUrl.searchParams.set("type", "video")
    searchUrl.searchParams.set("maxResults", maxResults.toString())
    searchUrl.searchParams.set("order", order)
    searchUrl.searchParams.set("regionCode", regionCode)
    searchUrl.searchParams.set("key", YOUTUBE_API_KEY)
    if (publishedAfter) searchUrl.searchParams.set("publishedAfter", publishedAfter)
    if (videoDuration) searchUrl.searchParams.set("videoDuration", videoDuration)
    if (pageToken) searchUrl.searchParams.set("pageToken", pageToken)

    const searchResponse = await fetch(searchUrl.toString())
    const searchData = await searchResponse.json()

    if (!searchResponse.ok) {
      throw new Error(searchData.error?.message || "YouTube API error")
    }

    // Get video statistics
    const videoIds = searchData.items.map((item: any) => item.id.videoId).join(",")
    const statsUrl = new URL(`${YOUTUBE_API_BASE}/videos`)
    statsUrl.searchParams.set("part", "statistics,contentDetails")
    statsUrl.searchParams.set("id", videoIds)
    statsUrl.searchParams.set("key", YOUTUBE_API_KEY)

    const statsResponse = await fetch(statsUrl.toString())
    const statsData = await statsResponse.json()

    // Get channel statistics
    const channelIds = [...new Set(searchData.items.map((item: any) => item.snippet.channelId))].join(",")
    const channelUrl = new URL(`${YOUTUBE_API_BASE}/channels`)
    channelUrl.searchParams.set("part", "statistics,snippet")
    channelUrl.searchParams.set("id", channelIds)
    channelUrl.searchParams.set("key", YOUTUBE_API_KEY)

    const channelResponse = await fetch(channelUrl.toString())
    const channelData = await channelResponse.json()

    // Merge data
    const channelMap = new Map<string, any>(
      channelData.items?.map((ch: any) => [ch.id, ch]) || []
    )
    const statsMap = new Map<string, any>(
      statsData.items?.map((st: any) => [st.id, st]) || []
    )

    const videos = searchData.items.map((item: any) => {
      const stats = statsMap.get(item.id.videoId) as any
      const channel = channelMap.get(item.snippet.channelId) as any

      return {
        id: item.id.videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnail: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url,
        channelId: item.snippet.channelId,
        channelName: item.snippet.channelTitle,
        channelThumbnail: channel?.snippet?.thumbnails?.default?.url || "",
        channelSubs: parseInt(channel?.statistics?.subscriberCount || "0"),
        channelVerified: (channel?.statistics?.subscriberCount || 0) > 100000,
        publishedAt: item.snippet.publishedAt,
        views: parseInt(stats?.statistics?.viewCount || "0"),
        likes: parseInt(stats?.statistics?.likeCount || "0"),
        comments: parseInt(stats?.statistics?.commentCount || "0"),
        duration: stats?.contentDetails?.duration || "PT0S",
        url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
        engagementRate: calculateEngagement(
          parseInt(stats?.statistics?.likeCount || "0"),
          parseInt(stats?.statistics?.commentCount || "0"),
          parseInt(stats?.statistics?.viewCount || "1")
        ),
        opportunityScore: calculateOpportunityScore(
          parseInt(stats?.statistics?.viewCount || "0"),
          parseInt(channel?.statistics?.subscriberCount || "0"),
          calculateEngagement(
            parseInt(stats?.statistics?.likeCount || "0"),
            parseInt(stats?.statistics?.commentCount || "0"),
            parseInt(stats?.statistics?.viewCount || "1")
          )
        ),
        tags: [], // Tags require additional API call
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        items: videos,
        pageInfo: searchData.pageInfo,
        nextPageToken: searchData.nextPageToken,
      },
      source: "api",
    })
  } catch (error) {
    console.error("[YouTube API] Error:", error)
    return NextResponse.json(
      { error: "Failed to fetch YouTube data" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/video-hijack/youtube
 * Get detailed analytics for a keyword
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { keyword, videoIds } = body

    if (!keyword) {
      return NextResponse.json(
        { error: "Keyword is required" },
        { status: 400 }
      )
    }

    // Return mock analytics data
    const analytics = {
      keyword,
      searchVolume: Math.floor(Math.random() * 50000) + 10000,
      competition: ["low", "medium", "high"][Math.floor(Math.random() * 3)],
      averageViews: Math.floor(Math.random() * 500000) + 50000,
      averageEngagement: Math.random() * 8 + 2,
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
        `${keyword} 2024`,
      ],
    }

    return NextResponse.json({
      success: true,
      data: analytics,
    })
  } catch (error) {
    console.error("[YouTube API] Error:", error)
    return NextResponse.json(
      { error: "Failed to analyze keyword" },
      { status: 500 }
    )
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function calculateEngagement(likes: number, comments: number, views: number): number {
  if (views === 0) return 0
  return ((likes + comments * 2) / views) * 100
}

function calculateOpportunityScore(views: number, subs: number, engagement: number): number {
  // High views + low subs + low engagement = high opportunity
  const viewScore = Math.min(views / 100000, 100) * 0.3
  const subScore = (1 - Math.min(subs / 1000000, 1)) * 100 * 0.3
  const engageScore = (10 - Math.min(engagement, 10)) * 10 * 0.4
  return Math.round(viewScore + subScore + engageScore)
}

function generateMockYouTubeResults(query: string, count: number) {
  const results = []
  for (let i = 0; i < count; i++) {
    const views = Math.floor(Math.random() * 1000000) + 10000
    const likes = Math.floor(views * (Math.random() * 0.05 + 0.01))
    const comments = Math.floor(likes * (Math.random() * 0.1 + 0.02))
    const subs = Math.floor(Math.random() * 500000) + 1000
    const engagement = calculateEngagement(likes, comments, views)

    results.push({
      id: `mock_yt_${i}_${Date.now()}`,
      title: `${query} - ${["Complete Guide", "Tutorial", "Tips & Tricks", "For Beginners", "2024 Edition"][i % 5]}`,
      description: `Learn everything about ${query} in this comprehensive video.`,
      thumbnail: `https://picsum.photos/seed/${query}${i}/640/360`,
      channelId: `channel_${i}`,
      channelName: `${["Tech", "Tutorial", "Pro", "Expert", "Learn"][i % 5]} Channel ${i + 1}`,
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
      tags: [query.toLowerCase(), "tutorial", "guide", "2024"],
    })
  }
  return results.sort((a, b) => b.opportunityScore - a.opportunityScore)
}
