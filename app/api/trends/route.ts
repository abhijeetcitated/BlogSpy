import { NextRequest, NextResponse } from "next/server"

// Mock trending topics
const mockTrends = [
  {
    id: "trend_1",
    topic: "AI SEO Tools",
    volume: 125000,
    growth: 340,
    velocity: 89,
    category: "technology",
    region: "global",
    relatedQueries: ["ai seo software", "chatgpt seo", "ai content optimization"],
    newsCount: 45,
    socialMentions: 12500,
    peakDate: "2025-12-08",
  },
  {
    id: "trend_2",
    topic: "Voice Search Optimization",
    volume: 45000,
    growth: 120,
    velocity: 72,
    category: "seo",
    region: "us",
    relatedQueries: ["voice seo", "alexa seo", "voice search ranking"],
    newsCount: 23,
    socialMentions: 5600,
    peakDate: "2025-12-05",
  },
  {
    id: "trend_3",
    topic: "Core Web Vitals Update",
    volume: 89000,
    growth: 85,
    velocity: 65,
    category: "google",
    region: "global",
    relatedQueries: ["cwv update", "page experience", "lcp optimization"],
    newsCount: 67,
    socialMentions: 8900,
    peakDate: "2025-12-07",
  },
  {
    id: "trend_4",
    topic: "Zero Click Searches",
    volume: 32000,
    growth: 95,
    velocity: 58,
    category: "seo",
    region: "global",
    relatedQueries: ["featured snippets", "serp features", "position zero"],
    newsCount: 18,
    socialMentions: 3400,
    peakDate: "2025-12-06",
  },
  {
    id: "trend_5",
    topic: "E-E-A-T Guidelines",
    volume: 67000,
    growth: 45,
    velocity: 42,
    category: "google",
    region: "global",
    relatedQueries: ["expertise authority trust", "google eeat", "content quality"],
    newsCount: 34,
    socialMentions: 7200,
    peakDate: "2025-12-03",
  },
]

// Mock trend history (for charts)
const generateTrendHistory = (baseVolume: number) => {
  const history = []
  let volume = baseVolume * 0.3

  for (let i = 30; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    
    // Add some random variation with upward trend
    volume = volume * (1 + (Math.random() * 0.1))
    
    history.push({
      date: date.toISOString().split("T")[0],
      volume: Math.round(volume),
    })
  }

  return history
}

// GET /api/trends - Get trending topics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category") || "all"
    const region = searchParams.get("region") || "global"
    const timeframe = searchParams.get("timeframe") || "7d"
    const limit = parseInt(searchParams.get("limit") || "10")

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 400))

    let filteredTrends = [...mockTrends]

    // Filter by category
    if (category !== "all") {
      filteredTrends = filteredTrends.filter((t) => t.category === category)
    }

    // Filter by region
    if (region !== "global" && region !== "all") {
      filteredTrends = filteredTrends.filter(
        (t) => t.region === region || t.region === "global"
      )
    }

    // Sort by velocity (hottest first)
    filteredTrends.sort((a, b) => b.velocity - a.velocity)

    // Limit results
    const limitedTrends = filteredTrends.slice(0, limit)

    // Add history to each trend
    const trendsWithHistory = limitedTrends.map((trend) => ({
      ...trend,
      history: generateTrendHistory(trend.volume),
    }))

    // Summary stats
    const summary = {
      totalTrends: mockTrends.length,
      avgGrowth: Math.round(
        mockTrends.reduce((sum, t) => sum + t.growth, 0) / mockTrends.length
      ),
      hottestTopic: mockTrends.reduce((prev, curr) =>
        curr.velocity > prev.velocity ? curr : prev
      ).topic,
      categories: [...new Set(mockTrends.map((t) => t.category))],
    }

    return NextResponse.json({
      success: true,
      data: trendsWithHistory,
      summary,
      meta: {
        total: filteredTrends.length,
        timeframe,
        region,
        category,
      },
    })
  } catch (error) {
    console.error("Trends API Error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// POST /api/trends - Analyze trend for keyword
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { keyword, region = "global" } = body

    if (!keyword) {
      return NextResponse.json(
        { error: "Keyword is required" },
        { status: 400 }
      )
    }

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 800))

    // Generate mock trend analysis
    const analysis = {
      keyword,
      region,
      currentVolume: Math.floor(Math.random() * 100000) + 10000,
      growth: Math.floor(Math.random() * 200) - 50,
      seasonality: {
        peak: ["January", "September"][Math.floor(Math.random() * 2)],
        low: ["June", "July"][Math.floor(Math.random() * 2)],
        pattern: "seasonal",
      },
      history: generateTrendHistory(50000),
      forecast: {
        nextMonth: Math.floor(Math.random() * 20) - 10,
        next3Months: Math.floor(Math.random() * 40) - 10,
        confidence: Math.floor(Math.random() * 20) + 70,
      },
      relatedRising: [
        { keyword: `${keyword} 2025`, growth: 250 },
        { keyword: `best ${keyword}`, growth: 180 },
        { keyword: `${keyword} tips`, growth: 120 },
      ],
      geographicInterest: [
        { region: "United States", interest: 100 },
        { region: "United Kingdom", interest: 78 },
        { region: "India", interest: 65 },
        { region: "Canada", interest: 58 },
        { region: "Australia", interest: 52 },
      ],
    }

    return NextResponse.json({
      success: true,
      data: analysis,
    })
  } catch (error) {
    console.error("Trends API Error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
