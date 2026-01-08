// ============================================
// VIDEO HIJACK - TikTok API Route (Refactored)
// ============================================
// Clean, maintainable API using route helpers
// ============================================

import { z } from "zod"
import { createProtectedHandler, ApiError } from "@/lib/api"

// ============================================
// TYPES
// ============================================

interface TikTokVideoItem {
  aweme_id?: string
  id?: string
  desc?: string
  create_time?: number
  video?: {
    cover?: string
    origin_cover?: string
    play_addr?: { url_list?: string[] }
    duration?: number
  }
  author?: {
    uid?: string
    unique_id?: string
    nickname?: string
    avatar_thumb?: { url_list?: string[] }
    follower_count?: number
    verification_type?: number
  }
  statistics?: {
    play_count?: number
    digg_count?: number
    comment_count?: number
    share_count?: number
  }
  music?: {
    title?: string
    author?: string
  }
}

// ============================================
// CONFIGURATION
// ============================================

const TIKTOK_API_HOST = "tiktok-scraper7.p.rapidapi.com"
const TIKTOK_API_BASE = `https://${TIKTOK_API_HOST}`

// ============================================
// SCHEMAS
// ============================================

const TikTokSearchSchema = z.object({
  query: z.string().min(1, "Query is required").max(200, "Query too long"),
  count: z.coerce.number().int().min(1).max(50).default(30),
  cursor: z.string().optional(),
  region: z.string().length(2).default("US"),
})

const TikTokAnalyticsSchema = z.object({
  hashtag: z.string().min(1, "Hashtag is required").max(100, "Hashtag too long"),
})

type TikTokSearchInput = z.infer<typeof TikTokSearchSchema>
type TikTokAnalyticsInput = z.infer<typeof TikTokAnalyticsSchema>

// ============================================
// GET - Search TikTok Videos
// ============================================

export const GET = createProtectedHandler<TikTokSearchInput>({
  rateLimit: "search",
  schema: TikTokSearchSchema,
  handler: async ({ data }) => {
    const { query, count, cursor, region } = data
    
    // Check for API key
    const TIKTOK_API_KEY = process.env.RAPIDAPI_KEY

    if (!TIKTOK_API_KEY) {
      // Return mock data if no API key configured
      return {
        items: generateMockTikTokResults(query, count),
        hasMore: true,
        cursor: "mock_cursor_next",
        source: "mock" as const,
      }
    }

    // Fetch from TikTok API via RapidAPI
    const searchUrl = new URL(`${TIKTOK_API_BASE}/feed/search`)
    searchUrl.searchParams.set("keywords", query)
    searchUrl.searchParams.set("count", count.toString())
    searchUrl.searchParams.set("region", region)
    if (cursor) searchUrl.searchParams.set("cursor", cursor)

    const response = await fetch(searchUrl.toString(), {
      method: "GET",
      headers: {
        "X-RapidAPI-Key": TIKTOK_API_KEY,
        "X-RapidAPI-Host": TIKTOK_API_HOST,
      },
    })

    const data_response = await response.json()

    if (!response.ok) {
      console.error("[TikTok API] Error:", data_response.message || "Unknown error")
      throw ApiError.badRequest("Failed to fetch TikTok data")
    }

    // Transform API response
    const videos = (data_response.data || []).map((item: TikTokVideoItem) => transformTikTokVideo(item))

    return {
      items: videos,
      hasMore: data_response.has_more || false,
      cursor: data_response.cursor || null,
      source: "api" as const,
    }
  },
})

// ============================================
// POST - Hashtag Analytics
// ============================================

export const POST = createProtectedHandler<TikTokAnalyticsInput>({
  rateLimit: "strict", // Analytics is expensive
  schema: TikTokAnalyticsSchema,
  handler: async ({ data }) => {
    const { hashtag } = data
    
    const TIKTOK_API_KEY = process.env.RAPIDAPI_KEY

    if (!TIKTOK_API_KEY) {
      // Return mock analytics
      return generateMockHashtagAnalytics(hashtag)
    }

    // TODO: Implement real hashtag analytics when API is available
    // RapidAPI TikTok endpoint for hashtag info can be added here
    return generateMockHashtagAnalytics(hashtag)
  },
})

// ============================================
// HELPER FUNCTIONS
// ============================================

function transformTikTokVideo(item: TikTokVideoItem) {
  const views = item.statistics?.play_count || 0
  const likes = item.statistics?.digg_count || 0
  const comments = item.statistics?.comment_count || 0
  const shares = item.statistics?.share_count || 0
  const followers = item.author?.follower_count || 0
  const engagement = calculateEngagement(likes, comments, shares, views)

  return {
    id: item.aweme_id || item.id,
    caption: item.desc || "",
    thumbnail: item.video?.cover || item.video?.origin_cover || "",
    videoUrl: item.video?.play_addr?.url_list?.[0] || "",
    creatorId: item.author?.uid || "",
    creatorUsername: item.author?.unique_id || "",
    creatorName: item.author?.nickname || "",
    creatorAvatar: item.author?.avatar_thumb?.url_list?.[0] || "",
    creatorFollowers: followers,
    creatorVerified: (item.author?.verification_type ?? 0) > 0,
    publishedAt: new Date((item.create_time || 0) * 1000).toISOString(),
    views,
    likes,
    comments,
    shares,
    plays: views,
    duration: item.video?.duration || 0,
    url: `https://www.tiktok.com/@${item.author?.unique_id}/video/${item.aweme_id}`,
    hashtags: extractHashtags(item.desc || ""),
    soundName: item.music?.title || "",
    soundAuthor: item.music?.author || "",
    engagementRate: engagement,
    opportunityScore: calculateOpportunityScore(views, followers, engagement),
  }
}

function extractHashtags(text: string): string[] {
  const matches = text.match(/#[\w\u0080-\uFFFF]+/g) || []
  return matches.map((tag) => tag.slice(1)) // Remove # prefix
}

function calculateEngagement(likes: number, comments: number, shares: number, views: number): number {
  if (views === 0) return 0
  return Math.round(((likes + comments * 2 + shares * 3) / views) * 100 * 100) / 100
}

function calculateOpportunityScore(views: number, followers: number, engagement: number): number {
  // High views + low followers + high engagement = high opportunity
  const viewScore = Math.min(views / 100000, 100) * 0.35
  const followerScore = (1 - Math.min(followers / 1000000, 1)) * 100 * 0.25
  const engageScore = Math.min(engagement * 5, 100) * 0.4
  return Math.round(viewScore + followerScore + engageScore)
}

function generateMockHashtagAnalytics(hashtag: string) {
  return {
    hashtag,
    viewCount: Math.floor(Math.random() * 1000000000) + 10000000,
    videoCount: Math.floor(Math.random() * 500000) + 10000,
    averageViews: Math.floor(Math.random() * 500000) + 50000,
    averageEngagement: Math.round((Math.random() * 15 + 5) * 100) / 100,
    topCreators: [
      { username: "creator1", followers: 1500000, videos: 45 },
      { username: "creator2", followers: 890000, videos: 38 },
      { username: "creator3", followers: 650000, videos: 32 },
    ],
    relatedHashtags: [
      `${hashtag}challenge`,
      `${hashtag}tips`,
      `${hashtag}tutorial`,
      `viral${hashtag}`,
      `${hashtag}2026`,
    ],
    trendingStatus: ["rising", "stable", "viral"][Math.floor(Math.random() * 3)] as "rising" | "stable" | "viral",
  }
}

function generateMockTikTokResults(query: string, count: number) {
  const results = []
  const hashtag = query.replace(/\s+/g, "").toLowerCase()
  
  for (let i = 0; i < count; i++) {
    const views = Math.floor(Math.random() * 5000000) + 50000
    const likes = Math.floor(views * (Math.random() * 0.15 + 0.05))
    const comments = Math.floor(likes * (Math.random() * 0.08 + 0.02))
    const shares = Math.floor(likes * (Math.random() * 0.05 + 0.01))
    const followers = Math.floor(Math.random() * 2000000) + 10000
    const engagement = calculateEngagement(likes, comments, shares, views)

    results.push({
      id: `mock_tt_${i}_${Date.now()}`,
      caption: `${["🔥", "✨", "💯", "🚀", "⭐"][i % 5]} Check out this ${query} content! #${hashtag} #fyp #viral`,
      thumbnail: `https://picsum.photos/seed/tt${query}${i}/405/720`,
      videoUrl: "",
      creatorId: `user_${i}`,
      creatorUsername: `creator_${i}`,
      creatorName: `${["Creative", "Trending", "Viral", "Popular", "Rising"][i % 5]} Creator ${i + 1}`,
      creatorAvatar: `https://picsum.photos/seed/avatar${i}/100/100`,
      creatorFollowers: followers,
      creatorVerified: followers > 500000,
      publishedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      views,
      likes,
      comments,
      shares,
      plays: views,
      duration: Math.floor(Math.random() * 55) + 5,
      url: `https://www.tiktok.com/@creator_${i}/video/mock_${i}`,
      hashtags: [hashtag, "fyp", "viral", "trending", query.split(" ")[0]?.toLowerCase() || "content"],
      soundName: `${["Trending Sound", "Original Audio", "Viral Beat", "Popular Track"][i % 4]} ${i + 1}`,
      soundAuthor: `artist_${i}`,
      engagementRate: engagement,
      opportunityScore: calculateOpportunityScore(views, followers, engagement),
    })
  }
  return results.sort((a, b) => b.opportunityScore - a.opportunityScore)
}
