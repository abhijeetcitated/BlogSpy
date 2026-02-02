/**
 * Mock Content Data
 * Sample content data for development and testing
 */

export interface MockContent {
  id: string
  title: string
  url: string
  status: "published" | "draft"
  score: number
  wordCount: number
  lastUpdated: string
  publishedAt: string | null
  traffic: number
  decay: boolean
  decayRisk: "none" | "low" | "medium" | "high" | "critical"
  keywords: string[]
}

export const mockContent: MockContent[] = [
  {
    id: "content_1",
    title: "The Ultimate Guide to SEO in 2024",
    url: "https://blogspy.io/blog/seo-guide-2024",
    status: "published",
    score: 92,
    wordCount: 4500,
    lastUpdated: "2024-01-15",
    publishedAt: "2023-06-20",
    traffic: 12500,
    decay: false,
    decayRisk: "none",
    keywords: ["seo guide", "seo 2024", "search engine optimization"],
  },
  {
    id: "content_2",
    title: "Best Keyword Research Tools Compared",
    url: "https://blogspy.io/blog/keyword-research-tools",
    status: "published",
    score: 85,
    wordCount: 3200,
    lastUpdated: "2024-01-10",
    publishedAt: "2023-08-15",
    traffic: 8900,
    decay: false,
    decayRisk: "low",
    keywords: ["keyword research", "seo tools", "keyword tools"],
  },
  {
    id: "content_3",
    title: "How to Build Quality Backlinks",
    url: "https://blogspy.io/blog/backlink-building",
    status: "published",
    score: 78,
    wordCount: 2800,
    lastUpdated: "2023-11-20",
    publishedAt: "2023-03-10",
    traffic: 4200,
    decay: true,
    decayRisk: "medium",
    keywords: ["backlinks", "link building", "seo backlinks"],
  },
  {
    id: "content_4",
    title: "On-Page SEO Checklist for 2024",
    url: "https://blogspy.io/blog/on-page-seo-checklist",
    status: "published",
    score: 88,
    wordCount: 2100,
    lastUpdated: "2024-01-08",
    publishedAt: "2023-09-05",
    traffic: 6700,
    decay: false,
    decayRisk: "none",
    keywords: ["on-page seo", "seo checklist", "technical seo"],
  },
  {
    id: "content_5",
    title: "Content Marketing Strategy Guide",
    url: "https://blogspy.io/blog/content-marketing-strategy",
    status: "published",
    score: 72,
    wordCount: 3800,
    lastUpdated: "2023-09-15",
    publishedAt: "2023-02-28",
    traffic: 2100,
    decay: true,
    decayRisk: "high",
    keywords: ["content marketing", "content strategy", "marketing guide"],
  },
  {
    id: "content_6",
    title: "Google Analytics 4 Setup Guide",
    url: "https://blogspy.io/blog/ga4-setup",
    status: "published",
    score: 95,
    wordCount: 2600,
    lastUpdated: "2024-01-12",
    publishedAt: "2023-07-10",
    traffic: 9800,
    decay: false,
    decayRisk: "none",
    keywords: ["google analytics", "ga4", "analytics setup"],
  },
  {
    id: "content_7",
    title: "WordPress SEO: Complete Guide",
    url: "https://blogspy.io/blog/wordpress-seo",
    status: "published",
    score: 65,
    wordCount: 4200,
    lastUpdated: "2023-06-20",
    publishedAt: "2022-11-15",
    traffic: 1500,
    decay: true,
    decayRisk: "critical",
    keywords: ["wordpress seo", "wordpress optimization", "cms seo"],
  },
  {
    id: "content_8",
    title: "Local SEO: Rank in Your City",
    url: "https://blogspy.io/blog/local-seo",
    status: "published",
    score: 82,
    wordCount: 2900,
    lastUpdated: "2023-12-05",
    publishedAt: "2023-05-20",
    traffic: 3400,
    decay: false,
    decayRisk: "low",
    keywords: ["local seo", "google my business", "local search"],
  },
  {
    id: "content_9",
    title: "E-commerce SEO Best Practices",
    url: "https://blogspy.io/blog/ecommerce-seo",
    status: "published",
    score: 76,
    wordCount: 3500,
    lastUpdated: "2023-10-10",
    publishedAt: "2023-04-12",
    traffic: 2800,
    decay: true,
    decayRisk: "medium",
    keywords: ["ecommerce seo", "product seo", "online store optimization"],
  },
  {
    id: "content_10",
    title: "Technical SEO Audit Guide",
    url: "https://blogspy.io/blog/technical-seo-audit",
    status: "published",
    score: 89,
    wordCount: 4800,
    lastUpdated: "2024-01-05",
    publishedAt: "2023-08-25",
    traffic: 5600,
    decay: false,
    decayRisk: "none",
    keywords: ["technical seo", "seo audit", "website audit"],
  },
  {
    id: "content_11",
    title: "Featured Snippets: How to Win Position Zero",
    url: "https://blogspy.io/blog/featured-snippets",
    status: "published",
    score: 84,
    wordCount: 2400,
    lastUpdated: "2023-12-20",
    publishedAt: "2023-06-15",
    traffic: 4100,
    decay: false,
    decayRisk: "low",
    keywords: ["featured snippets", "position zero", "serp features"],
  },
  {
    id: "content_12",
    title: "AI Content Writing Tools Review",
    url: "https://blogspy.io/blog/ai-writing-tools",
    status: "draft",
    score: 0,
    wordCount: 1800,
    lastUpdated: "2024-01-14",
    publishedAt: null,
    traffic: 0,
    decay: false,
    decayRisk: "none",
    keywords: ["ai writing", "content tools", "ai seo"],
  },
  {
    id: "content_13",
    title: "Video SEO: YouTube Ranking Guide",
    url: "https://blogspy.io/blog/video-seo",
    status: "draft",
    score: 0,
    wordCount: 2200,
    lastUpdated: "2024-01-13",
    publishedAt: null,
    traffic: 0,
    decay: false,
    decayRisk: "none",
    keywords: ["video seo", "youtube seo", "video optimization"],
  },
]

export const mockContentSummary = {
  total: mockContent.length,
  published: mockContent.filter(c => c.status === "published").length,
  draft: mockContent.filter(c => c.status === "draft").length,
  decaying: mockContent.filter(c => c.decay).length,
  avgScore: Math.round(
    mockContent.filter(c => c.status === "published").reduce((sum, c) => sum + c.score, 0) /
    mockContent.filter(c => c.status === "published").length
  ),
}

export default mockContent
