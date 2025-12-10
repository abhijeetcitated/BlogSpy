/**
 * Mock Trends Data
 * Sample trending topics data for development and testing
 */

export interface MockTrend {
  id: string
  topic: string
  category: string
  volume: number
  growth: number
  sentiment: "positive" | "negative" | "neutral"
  relatedKeywords: string[]
  sources: string[]
  firstSeen: string
  peakTime: string | null
}

export const mockTrends: MockTrend[] = [
  {
    id: "trend_1",
    topic: "AI SEO Tools",
    category: "Technology",
    volume: 45000,
    growth: 234,
    sentiment: "positive",
    relatedKeywords: ["ai content writing", "chatgpt seo", "ai keyword research", "automated seo"],
    sources: ["Google Trends", "Twitter", "Reddit"],
    firstSeen: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    peakTime: null,
  },
  {
    id: "trend_2",
    topic: "Google Algorithm Update March 2024",
    category: "SEO News",
    volume: 89000,
    growth: 456,
    sentiment: "neutral",
    relatedKeywords: ["core update", "google ranking changes", "serp volatility", "algorithm penalty"],
    sources: ["Google", "Search Engine Journal", "Twitter"],
    firstSeen: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    peakTime: null,
  },
  {
    id: "trend_3",
    topic: "SGE (Search Generative Experience)",
    category: "Technology",
    volume: 32000,
    growth: 178,
    sentiment: "positive",
    relatedKeywords: ["google sge", "ai search", "generative ai search", "search experience"],
    sources: ["Google Trends", "LinkedIn", "Tech blogs"],
    firstSeen: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
    peakTime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "trend_4",
    topic: "Zero-Click Searches",
    category: "SEO Strategy",
    volume: 18500,
    growth: 89,
    sentiment: "negative",
    relatedKeywords: ["featured snippets", "knowledge panel", "serp features", "organic traffic decline"],
    sources: ["SparkToro", "Moz", "Twitter"],
    firstSeen: new Date(Date.now() - 168 * 60 * 60 * 1000).toISOString(),
    peakTime: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "trend_5",
    topic: "E-E-A-T Guidelines",
    category: "Content Quality",
    volume: 24000,
    growth: 67,
    sentiment: "positive",
    relatedKeywords: ["experience expertise authority trust", "content quality", "google guidelines", "quality rater"],
    sources: ["Google", "Search Engine Land", "SEO blogs"],
    firstSeen: new Date(Date.now() - 336 * 60 * 60 * 1000).toISOString(),
    peakTime: null,
  },
  {
    id: "trend_6",
    topic: "Programmatic SEO",
    category: "SEO Strategy",
    volume: 12000,
    growth: 145,
    sentiment: "positive",
    relatedKeywords: ["automated content", "landing page generation", "scalable seo", "template seo"],
    sources: ["Twitter", "LinkedIn", "Growth blogs"],
    firstSeen: new Date(Date.now() - 96 * 60 * 60 * 1000).toISOString(),
    peakTime: null,
  },
  {
    id: "trend_7",
    topic: "Voice Search Optimization",
    category: "Technology",
    volume: 15600,
    growth: 45,
    sentiment: "positive",
    relatedKeywords: ["voice seo", "conversational search", "alexa seo", "google assistant"],
    sources: ["Google Trends", "Tech publications"],
    firstSeen: new Date(Date.now() - 504 * 60 * 60 * 1000).toISOString(),
    peakTime: new Date(Date.now() - 240 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "trend_8",
    topic: "Helpful Content Update Recovery",
    category: "SEO News",
    volume: 28000,
    growth: 312,
    sentiment: "neutral",
    relatedKeywords: ["hcu recovery", "google penalty", "content recovery", "traffic recovery"],
    sources: ["Google", "SEO forums", "Twitter"],
    firstSeen: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    peakTime: null,
  },
  {
    id: "trend_9",
    topic: "Core Web Vitals 2024",
    category: "Technical SEO",
    volume: 21000,
    growth: 78,
    sentiment: "positive",
    relatedKeywords: ["page speed", "lcp", "inp", "cls", "performance metrics"],
    sources: ["Google", "Web.dev", "Chrome team"],
    firstSeen: new Date(Date.now() - 720 * 60 * 60 * 1000).toISOString(),
    peakTime: new Date(Date.now() - 168 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "trend_10",
    topic: "Reddit SEO Strategy",
    category: "Platform SEO",
    volume: 8500,
    growth: 198,
    sentiment: "positive",
    relatedKeywords: ["reddit marketing", "reddit seo", "social seo", "community marketing"],
    sources: ["Twitter", "SEO blogs", "Reddit"],
    firstSeen: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
    peakTime: null,
  },
]

export const mockTrendCategories = [
  "Technology",
  "SEO News",
  "SEO Strategy",
  "Content Quality",
  "Technical SEO",
  "Platform SEO",
  "Local SEO",
  "E-commerce",
]

export const mockTrendHistory = [
  { date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], topTrends: ["AI SEO Tools", "SGE", "Core Web Vitals"] },
  { date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], topTrends: ["Google Update", "AI SEO Tools", "E-E-A-T"] },
  { date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], topTrends: ["Google Update", "HCU Recovery", "AI SEO Tools"] },
  { date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], topTrends: ["Google Update", "HCU Recovery", "Programmatic SEO"] },
  { date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], topTrends: ["Google Update", "AI SEO Tools", "Reddit SEO"] },
  { date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], topTrends: ["Google Update", "AI SEO Tools", "Reddit SEO"] },
  { date: new Date().toISOString().split("T")[0], topTrends: ["Google Update", "AI SEO Tools", "HCU Recovery"] },
]

export default mockTrends
