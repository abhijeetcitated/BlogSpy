// ============================================
// VIDEO HIJACK - TikTok API Route
// ============================================
// Handles TikTok API requests (via RapidAPI or Apify)
// ============================================

import { NextRequest, NextResponse } from "next/server"

// TikTok API configuration (using RapidAPI)
const TIKTOK_API_KEY = process.env.RAPIDAPI_KEY
const TIKTOK_API_HOST = "tiktok-scraper7.p.rapidapi.com"
const TIKTOK_API_BASE = `https://${TIKTOK_API_HOST}`

/**
 * GET /api/video-hijack/tiktok
 * Search TikTok videos for a given keyword/hashtag
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get("query")
    const count = parseInt(searchParams.get("count") || "30")
    const cursor = searchParams.get("cursor") || undefined
    const region = searchParams.get("region") || "US"

    if (!query) {
      return NextResponse.json(
        { error: "Query parameter is required" },
        { status: 400 }
      )
    }

    if (!TIKTOK_API_KEY) {
      // Return mock data if no API key
      return NextResponse.json({
        success: true,
        data: {
          items: generateMockTikTokResults(query, count),
          hasMore: true,
          cursor: "mock_cursor_next",
        },
        source: "mock",
      })
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

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || "TikTok API error")
    }

    // Transform API response
    const videos = (data.data || []).map((item: any) => ({
      id: item.aweme_id || item.id,
      caption: item.desc || "",
      thumbnail: item.video?.cover || item.video?.origin_cover || "",
      videoUrl: item.video?.play_addr?.url_list?.[0] || "",
      creatorId: item.author?.uid || "",
      creatorUsername: item.author?.unique_id || "",
      creatorName: item.author?.nickname || "",
      creatorAvatar: item.author?.avatar_thumb?.url_list?.[0] || "",
      creatorFollowers: item.author?.follower_count || 0,
      creatorVerified: item.author?.verification_type > 0,
      publishedAt: new Date((item.create_time || 0) * 1000).toISOString(),
      views: item.statistics?.play_count || 0,
      likes: item.statistics?.digg_count || 0,
      comments: item.statistics?.comment_count || 0,
      shares: item.statistics?.share_count || 0,
      plays: item.statistics?.play_count || 0,
      duration: item.video?.duration || 0,
      url: `https://www.tiktok.com/@${item.author?.unique_id}/video/${item.aweme_id}`,
      hashtags: extractHashtags(item.desc || ""),
      soundName: item.music?.title || "",
      soundAuthor: item.music?.author || "",
      engagementRate: calculateEngagement(
        item.statistics?.digg_count || 0,
        item.statistics?.comment_count || 0,
        item.statistics?.share_count || 0,
        item.statistics?.play_count || 1
      ),
      opportunityScore: calculateOpportunityScore(
        item.statistics?.play_count || 0,
        item.author?.follower_count || 0,
        calculateEngagement(
          item.statistics?.digg_count || 0,
          item.statistics?.comment_count || 0,
          item.statistics?.share_count || 0,
          item.statistics?.play_count || 1
        )
      ),
    }))

    return NextResponse.json({
      success: true,
      data: {
        items: videos,
        hasMore: data.has_more || false,
        cursor: data.cursor || null,
      },
      source: "api",
    })
  } catch (error) {
    console.error("[TikTok API] Error:", error)
    return NextResponse.json(
      { error: "Failed to fetch TikTok data" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/video-hijack/tiktok
 * Get hashtag analytics
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { hashtag } = body

    if (!hashtag) {
      return NextResponse.json(
        { error: "Hashtag is required" },
        { status: 400 }
      )
    }

    // Return mock analytics data
    const analytics = {
      hashtag,
      viewCount: Math.floor(Math.random() * 1000000000) + 10000000,
      videoCount: Math.floor(Math.random() * 500000) + 10000,
      averageViews: Math.floor(Math.random() * 500000) + 50000,
      averageEngagement: Math.random() * 15 + 5,
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
        `${hashtag}2024`,
      ],
      trendingStatus: ["rising", "stable", "viral"][Math.floor(Math.random() * 3)],
    }

    return NextResponse.json({
      success: true,
      data: analytics,
    })
  } catch (error) {
    console.error("[TikTok API] Error:", error)
    return NextResponse.json(
      { error: "Failed to analyze hashtag" },
      { status: 500 }
    )
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function extractHashtags(text: string): string[] {
  const matches = text.match(/#[\w\u0080-\uFFFF]+/g) || []
  return matches.map((tag) => tag.slice(1)) // Remove # prefix
}

function calculateEngagement(likes: number, comments: number, shares: number, views: number): number {
  if (views === 0) return 0
  return ((likes + comments * 2 + shares * 3) / views) * 100
}

function calculateOpportunityScore(views: number, followers: number, engagement: number): number {
  // High views + lower follower ratio + moderate engagement = opportunity
  const viewScore = Math.min(views / 500000, 100) * 0.35
  const followerScore = (1 - Math.min(followers / 5000000, 1)) * 100 * 0.25
  const engageScore = Math.min(engagement, 20) * 5 * 0.4
  return Math.round(viewScore + followerScore + engageScore)
}

function generateMockTikTokResults(query: string, count: number) {
  const results = []
  const hashtag = query.replace(/\s+/g, "").toLowerCase()
  
  for (let i = 0; i < count; i++) {
    const views = Math.floor(Math.random() * 5000000) + 50000
    const likes = Math.floor(views * (Math.random() * 0.15 + 0.05))
    const comments = Math.floor(likes * (Math.random() * 0.08 + 0.02))
    const shares = Math.floor(likes * (Math.random() * 0.05 + 0.01))
    const followers = Math.floor(Math.random() * 2000000) + 5000
    const engagement = calculateEngagement(likes, comments, shares, views)

    results.push({
      id: `mock_tt_${i}_${Date.now()}`,
      caption: `${query} ${["hack", "tutorial", "tips", "challenge", "viral"][i % 5]} 🔥 #${hashtag} #fyp #viral`,
      thumbnail: `https://picsum.photos/seed/${hashtag}${i}/360/640`,
      videoUrl: `https://example.com/video/${i}`,
      creatorId: `user_${i}`,
      creatorUsername: `${["viral", "trending", "content", "creator", "tips"][i % 5]}_${i + 1}`,
      creatorName: `${["Viral", "Trending", "Content", "Creator", "Tips"][i % 5]} Creator ${i + 1}`,
      creatorAvatar: `https://picsum.photos/seed/avatar${i}/100/100`,
      creatorFollowers: followers,
      creatorVerified: followers > 500000,
      publishedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      views,
      likes,
      comments,
      shares,
      plays: views + Math.floor(Math.random() * 10000),
      duration: Math.floor(Math.random() * 60) + 15,
      url: `https://www.tiktok.com/@user_${i}/video/mock_${i}`,
      hashtags: [hashtag, "fyp", "viral", "trending", "2024"].slice(0, Math.floor(Math.random() * 3) + 3),
      soundName: `Original Sound - Creator ${i + 1}`,
      soundAuthor: `creator_${i + 1}`,
      engagementRate: engagement,
      opportunityScore: calculateOpportunityScore(views, followers, engagement),
    })
  }
  return results.sort((a, b) => b.opportunityScore - a.opportunityScore)
}
