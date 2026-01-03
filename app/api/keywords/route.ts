import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth-utils"

// Mock keyword data
const mockKeywords = [
  {
    id: "kw_1",
    keyword: "best seo tools 2025",
    volume: 12500,
    difficulty: 45,
    cpc: 4.2,
    trend: "up",
    intent: "commercial",
    position: 8,
    change: 3,
    serpFeatures: ["featured_snippet", "people_also_ask", "video"],
  },
  {
    id: "kw_2",
    keyword: "keyword research guide",
    volume: 8900,
    difficulty: 38,
    cpc: 3.5,
    trend: "stable",
    intent: "informational",
    position: 5,
    change: -1,
    serpFeatures: ["featured_snippet", "images"],
  },
  {
    id: "kw_3",
    keyword: "content optimization tips",
    volume: 6700,
    difficulty: 32,
    cpc: 2.8,
    trend: "up",
    intent: "informational",
    position: 12,
    change: 5,
    serpFeatures: ["people_also_ask"],
  },
  {
    id: "kw_4",
    keyword: "rank tracker software",
    volume: 4500,
    difficulty: 52,
    cpc: 6.5,
    trend: "up",
    intent: "transactional",
    position: 3,
    change: 2,
    serpFeatures: ["ads", "featured_snippet"],
  },
  {
    id: "kw_5",
    keyword: "seo competitor analysis",
    volume: 3200,
    difficulty: 41,
    cpc: 5.1,
    trend: "stable",
    intent: "commercial",
    position: 15,
    change: -3,
    serpFeatures: ["people_also_ask", "video"],
  },
]

// GET /api/keywords - Get keywords list
export async function GET(request: NextRequest) {
  // Auth check
  const auth = await requireAuth()
  if (!auth.success) return auth.response

  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q") || ""
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const sortBy = searchParams.get("sortBy") || "volume"
    const sortOrder = searchParams.get("sortOrder") || "desc"

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 300))

    let filteredKeywords = [...mockKeywords]

    // Filter by search query
    if (query) {
      filteredKeywords = filteredKeywords.filter((kw) =>
        kw.keyword.toLowerCase().includes(query.toLowerCase())
      )
    }

    // Sort
    filteredKeywords.sort((a, b) => {
      const aVal = a[sortBy as keyof typeof a]
      const bVal = b[sortBy as keyof typeof b]
      
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortOrder === "desc" ? bVal - aVal : aVal - bVal
      }
      return 0
    })

    // Paginate
    const start = (page - 1) * limit
    const paginatedKeywords = filteredKeywords.slice(start, start + limit)

    return NextResponse.json({
      success: true,
      data: paginatedKeywords,
      meta: {
        total: filteredKeywords.length,
        page,
        limit,
        totalPages: Math.ceil(filteredKeywords.length / limit),
      },
    })
  } catch (error) {
    console.error("Keywords API Error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// POST /api/keywords - Analyze keyword
export async function POST(request: NextRequest) {
  // Auth check
  const auth = await requireAuth()
  if (!auth.success) return auth.response

  try {
    const body = await request.json()
    const { keyword, location = "US", language = "en" } = body

    if (!keyword) {
      return NextResponse.json(
        { error: "Keyword is required" },
        { status: 400 }
      )
    }

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 800))

    // Generate mock analysis
    const analysis = {
      keyword,
      location,
      language,
      metrics: {
        volume: Math.floor(Math.random() * 50000) + 1000,
        difficulty: Math.floor(Math.random() * 100),
        cpc: parseFloat((Math.random() * 10).toFixed(2)),
        competition: parseFloat((Math.random()).toFixed(2)),
      },
      trends: {
        monthly: Array.from({ length: 12 }, () =>
          Math.floor(Math.random() * 20000) + 5000
        ),
        change: Math.floor(Math.random() * 40) - 20,
      },
      relatedKeywords: [
        { keyword: `${keyword} guide`, volume: 2500, difficulty: 35 },
        { keyword: `best ${keyword}`, volume: 4200, difficulty: 42 },
        { keyword: `${keyword} tips`, volume: 1800, difficulty: 28 },
        { keyword: `how to ${keyword}`, volume: 3100, difficulty: 31 },
        { keyword: `${keyword} tools`, volume: 2900, difficulty: 45 },
      ],
      questions: [
        `What is ${keyword}?`,
        `How does ${keyword} work?`,
        `Why is ${keyword} important?`,
        `What are the best ${keyword} strategies?`,
      ],
      serpFeatures: ["featured_snippet", "people_also_ask", "video", "images"],
      intent: ["informational", "commercial", "transactional", "navigational"][
        Math.floor(Math.random() * 4)
      ],
    }

    return NextResponse.json({
      success: true,
      data: analysis,
    })
  } catch (error) {
    console.error("Keywords API Error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
