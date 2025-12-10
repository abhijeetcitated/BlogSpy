import { NextRequest, NextResponse } from "next/server"

// Mock content data
const mockContent = [
  {
    id: "content_1",
    title: "Complete Guide to SEO in 2025",
    url: "/blog/seo-guide-2025",
    status: "published",
    score: 85,
    wordCount: 3500,
    lastUpdated: "2025-11-15",
    traffic: 12500,
    decay: false,
    decayRisk: "low",
    keywords: ["seo guide", "seo 2025", "search engine optimization"],
  },
  {
    id: "content_2",
    title: "Keyword Research: The Ultimate Guide",
    url: "/blog/keyword-research-guide",
    status: "published",
    score: 78,
    wordCount: 4200,
    lastUpdated: "2025-08-20",
    traffic: 8900,
    decay: true,
    decayRisk: "high",
    keywords: ["keyword research", "keyword tools", "keyword strategy"],
  },
  {
    id: "content_3",
    title: "On-Page SEO Checklist",
    url: "/blog/on-page-seo-checklist",
    status: "published",
    score: 92,
    wordCount: 2800,
    lastUpdated: "2025-12-01",
    traffic: 6700,
    decay: false,
    decayRisk: "low",
    keywords: ["on-page seo", "seo checklist", "page optimization"],
  },
  {
    id: "content_4",
    title: "Link Building Strategies That Work",
    url: "/blog/link-building-strategies",
    status: "published",
    score: 65,
    wordCount: 3100,
    lastUpdated: "2025-05-10",
    traffic: 3200,
    decay: true,
    decayRisk: "critical",
    keywords: ["link building", "backlinks", "link strategy"],
  },
  {
    id: "content_5",
    title: "Technical SEO Audit Guide",
    url: "/blog/technical-seo-audit",
    status: "draft",
    score: 45,
    wordCount: 1500,
    lastUpdated: "2025-12-08",
    traffic: 0,
    decay: false,
    decayRisk: "none",
    keywords: ["technical seo", "seo audit", "site audit"],
  },
]

// Mock on-page analysis
const generateOnPageAnalysis = (url: string) => ({
  url,
  score: Math.floor(Math.random() * 30) + 70,
  title: {
    content: "Best SEO Tools for 2025 - Complete Guide",
    length: 42,
    score: 95,
    issues: [],
    suggestions: ["Consider adding power words"],
  },
  metaDescription: {
    content: "Discover the best SEO tools for 2025. Compare features, pricing, and find the perfect tool for your needs.",
    length: 120,
    score: 88,
    issues: [],
    suggestions: ["Add a call-to-action"],
  },
  headings: {
    h1Count: 1,
    h2Count: 8,
    h3Count: 15,
    score: 92,
    structure: [
      { tag: "h1", text: "Best SEO Tools for 2025" },
      { tag: "h2", text: "What to Look for in SEO Tools" },
      { tag: "h2", text: "Top 10 SEO Tools Compared" },
      { tag: "h2", text: "Pricing Comparison" },
    ],
    issues: [],
  },
  content: {
    wordCount: 3500,
    readingTime: "14 min",
    readabilityScore: 72,
    keywordDensity: 2.1,
    score: 85,
    issues: ["Some paragraphs are too long"],
    suggestions: ["Break up long paragraphs", "Add more subheadings"],
  },
  images: {
    total: 12,
    withAlt: 10,
    optimized: 8,
    score: 78,
    issues: ["2 images missing alt text", "4 images not optimized"],
  },
  links: {
    internal: 15,
    external: 8,
    broken: 0,
    score: 95,
    issues: [],
  },
  technical: {
    loadTime: 2.1,
    mobileScore: 88,
    coreWebVitals: {
      lcp: 2.3,
      fid: 50,
      cls: 0.05,
    },
    score: 82,
    issues: ["LCP could be improved"],
  },
})

// GET /api/content - Get content list
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const status = searchParams.get("status") || "all"
    const decay = searchParams.get("decay")

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 300))

    let filteredContent = [...mockContent]

    // Filter by status
    if (status !== "all") {
      filteredContent = filteredContent.filter((c) => c.status === status)
    }

    // Filter by decay
    if (decay === "true") {
      filteredContent = filteredContent.filter((c) => c.decay)
    }

    // Paginate
    const start = (page - 1) * limit
    const paginatedContent = filteredContent.slice(start, start + limit)

    // Summary stats
    const summary = {
      total: mockContent.length,
      published: mockContent.filter((c) => c.status === "published").length,
      draft: mockContent.filter((c) => c.status === "draft").length,
      decaying: mockContent.filter((c) => c.decay).length,
      avgScore: Math.round(
        mockContent.reduce((sum, c) => sum + c.score, 0) / mockContent.length
      ),
    }

    return NextResponse.json({
      success: true,
      data: paginatedContent,
      summary,
      meta: {
        total: filteredContent.length,
        page,
        limit,
        totalPages: Math.ceil(filteredContent.length / limit),
      },
    })
  } catch (error) {
    console.error("Content API Error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// POST /api/content - Analyze content/URL
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, url, content, keyword } = body

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    switch (action) {
      case "analyze-url": {
        if (!url) {
          return NextResponse.json(
            { error: "URL is required" },
            { status: 400 }
          )
        }

        const analysis = generateOnPageAnalysis(url)
        return NextResponse.json({
          success: true,
          data: analysis,
        })
      }

      case "generate-suggestions": {
        if (!keyword) {
          return NextResponse.json(
            { error: "Keyword is required" },
            { status: 400 }
          )
        }

        const suggestions = {
          keyword,
          titleSuggestions: [
            `${keyword}: Complete Guide for 2025`,
            `The Ultimate ${keyword} Strategy`,
            `How to Master ${keyword} in 7 Steps`,
          ],
          outlineSuggestions: [
            `What is ${keyword}?`,
            `Why ${keyword} Matters`,
            `Step-by-Step ${keyword} Guide`,
            `Common ${keyword} Mistakes`,
            `${keyword} Best Practices`,
            `Tools for ${keyword}`,
            `Conclusion & Next Steps`,
          ],
          relatedTopics: [
            `${keyword} tools`,
            `${keyword} examples`,
            `${keyword} tips`,
            `${keyword} strategies`,
          ],
        }

        return NextResponse.json({
          success: true,
          data: suggestions,
        })
      }

      default:
        return NextResponse.json(
          { error: "Invalid action" },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error("Content API Error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
