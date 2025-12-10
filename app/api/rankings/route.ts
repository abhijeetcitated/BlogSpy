import { NextRequest, NextResponse } from "next/server"

// Mock ranking data
const mockRankings = [
  {
    id: "rank_1",
    keyword: "best seo tools 2025",
    url: "https://blogspy.io/blog/best-seo-tools",
    position: 8,
    previousPosition: 11,
    change: 3,
    volume: 12500,
    traffic: 890,
    difficulty: 45,
    lastUpdated: "2025-12-09T10:30:00Z",
    history: [15, 14, 12, 11, 11, 10, 9, 8],
  },
  {
    id: "rank_2",
    keyword: "keyword research guide",
    url: "https://blogspy.io/blog/keyword-research",
    position: 5,
    previousPosition: 4,
    change: -1,
    volume: 8900,
    traffic: 1420,
    difficulty: 38,
    lastUpdated: "2025-12-09T10:30:00Z",
    history: [8, 7, 6, 5, 4, 4, 4, 5],
  },
  {
    id: "rank_3",
    keyword: "seo competitor analysis",
    url: "https://blogspy.io/blog/competitor-analysis",
    position: 3,
    previousPosition: 3,
    change: 0,
    volume: 6700,
    traffic: 2010,
    difficulty: 41,
    lastUpdated: "2025-12-09T10:30:00Z",
    history: [6, 5, 4, 4, 3, 3, 3, 3],
  },
  {
    id: "rank_4",
    keyword: "content decay prevention",
    url: "https://blogspy.io/blog/content-decay",
    position: 12,
    previousPosition: 18,
    change: 6,
    volume: 3200,
    traffic: 210,
    difficulty: 32,
    lastUpdated: "2025-12-09T10:30:00Z",
    history: [25, 22, 20, 18, 18, 15, 14, 12],
  },
  {
    id: "rank_5",
    keyword: "topic cluster strategy",
    url: "https://blogspy.io/blog/topic-clusters",
    position: 7,
    previousPosition: 9,
    change: 2,
    volume: 4500,
    traffic: 540,
    difficulty: 35,
    lastUpdated: "2025-12-09T10:30:00Z",
    history: [12, 11, 10, 9, 9, 8, 8, 7],
  },
]

// Mock competitors
const mockCompetitors = [
  {
    id: "comp_1",
    domain: "ahrefs.com",
    commonKeywords: 245,
    avgPosition: 4.2,
    visibility: 89,
    traffic: 2500000,
  },
  {
    id: "comp_2",
    domain: "semrush.com",
    commonKeywords: 312,
    avgPosition: 3.8,
    visibility: 92,
    traffic: 3100000,
  },
  {
    id: "comp_3",
    domain: "moz.com",
    commonKeywords: 189,
    avgPosition: 5.1,
    visibility: 78,
    traffic: 1800000,
  },
]

// GET /api/rankings - Get rankings list
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const domain = searchParams.get("domain") || ""
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const filter = searchParams.get("filter") || "all" // all, improved, declined, new

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 400))

    let filteredRankings = [...mockRankings]

    // Filter by change type
    if (filter === "improved") {
      filteredRankings = filteredRankings.filter((r) => r.change > 0)
    } else if (filter === "declined") {
      filteredRankings = filteredRankings.filter((r) => r.change < 0)
    } else if (filter === "stable") {
      filteredRankings = filteredRankings.filter((r) => r.change === 0)
    }

    // Paginate
    const start = (page - 1) * limit
    const paginatedRankings = filteredRankings.slice(start, start + limit)

    // Calculate summary stats
    const summary = {
      totalKeywords: mockRankings.length,
      avgPosition: parseFloat(
        (mockRankings.reduce((sum, r) => sum + r.position, 0) / mockRankings.length).toFixed(1)
      ),
      improved: mockRankings.filter((r) => r.change > 0).length,
      declined: mockRankings.filter((r) => r.change < 0).length,
      stable: mockRankings.filter((r) => r.change === 0).length,
      totalTraffic: mockRankings.reduce((sum, r) => sum + r.traffic, 0),
      top3: mockRankings.filter((r) => r.position <= 3).length,
      top10: mockRankings.filter((r) => r.position <= 10).length,
      top100: mockRankings.filter((r) => r.position <= 100).length,
    }

    return NextResponse.json({
      success: true,
      data: paginatedRankings,
      summary,
      competitors: mockCompetitors,
      meta: {
        total: filteredRankings.length,
        page,
        limit,
        totalPages: Math.ceil(filteredRankings.length / limit),
      },
    })
  } catch (error) {
    console.error("Rankings API Error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// POST /api/rankings - Add keyword to track
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { keyword, url, domain } = body

    if (!keyword) {
      return NextResponse.json(
        { error: "Keyword is required" },
        { status: 400 }
      )
    }

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 600))

    // Generate mock initial ranking
    const newRanking = {
      id: `rank_${Date.now()}`,
      keyword,
      url: url || `https://${domain}/`,
      position: Math.floor(Math.random() * 50) + 10,
      previousPosition: null,
      change: 0,
      volume: Math.floor(Math.random() * 10000) + 500,
      traffic: 0,
      difficulty: Math.floor(Math.random() * 100),
      lastUpdated: new Date().toISOString(),
      history: [],
    }

    return NextResponse.json({
      success: true,
      data: newRanking,
      message: "Keyword added to tracking",
    })
  } catch (error) {
    console.error("Rankings API Error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// DELETE /api/rankings - Remove keyword from tracking
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json(
        { error: "Ranking ID is required" },
        { status: 400 }
      )
    }

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 300))

    return NextResponse.json({
      success: true,
      message: "Keyword removed from tracking",
    })
  } catch (error) {
    console.error("Rankings API Error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
