// ============================================
// NEWS TRACKER - Mock Data
// ============================================

import type { NewsKeyword, NewsSummary, NewsArticle, DiscoverCard } from "../types"

// Sample keywords for news tracking
const SAMPLE_NEWS_KEYWORDS = [
  { keyword: "ai technology news", volume: 45000, intent: "trending" as const },
  { keyword: "cryptocurrency updates", volume: 78000, intent: "breaking" as const },
  { keyword: "climate change report", volume: 32000, intent: "evergreen" as const },
  { keyword: "startup funding news", volume: 28000, intent: "trending" as const },
  { keyword: "tech layoffs 2024", volume: 56000, intent: "breaking" as const },
  { keyword: "electric vehicle market", volume: 41000, intent: "evergreen" as const },
  { keyword: "remote work trends", volume: 38000, intent: "evergreen" as const },
  { keyword: "cybersecurity threats", volume: 29000, intent: "breaking" as const },
  { keyword: "local business news", volume: 15000, intent: "local" as const },
  { keyword: "stock market analysis", volume: 67000, intent: "trending" as const },
]

// Generate mock articles
const generateArticles = (keyword: string): NewsArticle[] => {
  const sources = ["TechCrunch", "The Verge", "Wired", "Bloomberg", "Reuters", "Forbes"]
  return Array(5).fill(null).map((_, i) => ({
    id: `article-${i}`,
    title: `${keyword} - Latest Updates and Analysis`,
    url: `https://example.com/${keyword.replace(/\s+/g, "-")}`,
    source: sources[Math.floor(Math.random() * sources.length)],
    publishDate: `${Math.floor(Math.random() * 24) + 1}h ago`,
    position: i + 1,
    category: "Technology",
    isTopStory: i === 0 && Math.random() > 0.5,
  }))
}

// Generate mock discover cards
const generateDiscoverCards = (keyword: string): DiscoverCard[] => {
  return Array(3).fill(null).map((_, i) => ({
    id: `discover-${i}`,
    title: `Everything You Need to Know About ${keyword}`,
    url: `https://example.com/${keyword.replace(/\s+/g, "-")}`,
    estimatedImpressions: Math.floor(Math.random() * 50000) + 5000,
    ctr: Math.random() * 10 + 2,
    clicks: Math.floor(Math.random() * 5000) + 500,
    category: "Technology",
    isPersonalized: Math.random() > 0.5,
  }))
}

// Generate news keywords
export const generateNewsKeywords = (): NewsKeyword[] => {
  return SAMPLE_NEWS_KEYWORDS.map((kw, index) => {
    const newsPosition = Math.random() > 0.2 ? Math.floor(Math.random() * 20) + 1 : null
    const previousPosition = newsPosition ? newsPosition + Math.floor((Math.random() - 0.5) * 10) : null
    
    return {
      id: `news-kw-${index}`,
      keyword: kw.keyword,
      searchVolume: kw.volume,
      newsIntent: kw.intent,
      platforms: {
        "google-news": newsPosition ? {
          position: newsPosition,
          previousPosition,
          change: previousPosition ? previousPosition - newsPosition : 0,
          isTopStory: newsPosition <= 3 && Math.random() > 0.5,
          category: "Technology",
          articles: generateArticles(kw.keyword),
        } : null,
        "google-discover": Math.random() > 0.3 ? {
          impressions: Math.floor(Math.random() * 100000) + 10000,
          clicks: Math.floor(Math.random() * 10000) + 1000,
          ctr: Math.random() * 8 + 2,
          avgPosition: Math.floor(Math.random() * 10) + 1,
          trend: ["up", "down", "stable"][Math.floor(Math.random() * 3)] as "up" | "down" | "stable",
          cards: generateDiscoverCards(kw.keyword),
        } : null,
      },
      lastUpdated: "2 hours ago",
    }
  })
}

// Generate summary
export const generateNewsSummary = (keywords: NewsKeyword[]): NewsSummary => {
  const newsRanking = keywords.filter(k => k.platforms["google-news"]?.position).length
  const topStories = keywords.filter(k => k.platforms["google-news"]?.isTopStory).length
  const discoverData = keywords.filter(k => k.platforms["google-discover"])
  const totalImpressions = discoverData.reduce((sum, k) => sum + (k.platforms["google-discover"]?.impressions || 0), 0)
  const avgCTR = discoverData.length > 0 
    ? discoverData.reduce((sum, k) => sum + (k.platforms["google-discover"]?.ctr || 0), 0) / discoverData.length 
    : 0
  
  return {
    totalKeywords: keywords.length,
    newsRanking,
    discoverImpressions: totalImpressions,
    topStories,
    avgCTR: Math.round(avgCTR * 10) / 10,
    trendingCount: keywords.filter(k => k.newsIntent === "trending").length,
  }
}

// Pre-generated data
export const MOCK_NEWS_KEYWORDS = generateNewsKeywords()
export const MOCK_NEWS_SUMMARY = generateNewsSummary(MOCK_NEWS_KEYWORDS)

// ============================================
// API MOCK GENERATORS (for services)
// ============================================

import type { NormalizedNewsItem } from "../types/api.types"

/**
 * Generate mock news results for API service
 */
export function generateMockNewsResults(keyword: string, count: number = 10): NormalizedNewsItem[] {
  const sources = [
    "TechCrunch", "The Verge", "Wired", "Bloomberg", "Reuters", 
    "Forbes", "CNBC", "BBC", "CNN", "The Guardian"
  ]
  
  const domains = [
    "techcrunch.com", "theverge.com", "wired.com", "bloomberg.com", 
    "reuters.com", "forbes.com", "cnbc.com", "bbc.com"
  ]

  return Array(count).fill(null).map((_, i) => {
    const sourceIndex = Math.floor(Math.random() * sources.length)
    const hoursAgo = Math.floor(Math.random() * 48) + 1
    
    return {
      id: `news_${Date.now()}_${i}`,
      position: i + 1,
      title: generateNewsTitle(keyword, i),
      url: `https://${domains[sourceIndex]}/${keyword.replace(/\s+/g, "-")}-${Date.now()}`,
      source: sources[sourceIndex],
      domain: domains[sourceIndex],
      publishedAt: new Date(Date.now() - hoursAgo * 60 * 60 * 1000).toISOString(),
      snippet: generateNewsSnippet(keyword),
      thumbnailUrl: `https://picsum.photos/seed/${keyword}-${i}/200/150`,
      isAMP: Math.random() > 0.7,
      isTopStory: i < 3 && Math.random() > 0.6,
      category: getRandomCategory(),
    }
  })
}

/**
 * Generate mock discover results for API service
 */
export function generateMockDiscoverResults(keyword: string, count: number = 10): NormalizedNewsItem[] {
  const sources = [
    "Medium", "Substack", "LinkedIn", "Dev.to", "Hacker News",
    "Product Hunt", "Indie Hackers", "TechCrunch"
  ]

  return Array(count).fill(null).map((_, i) => {
    const sourceIndex = Math.floor(Math.random() * sources.length)
    const daysAgo = Math.floor(Math.random() * 7) + 1
    
    return {
      id: `discover_${Date.now()}_${i}`,
      position: i + 1,
      title: generateDiscoverTitle(keyword, i),
      url: `https://example.com/discover/${keyword.replace(/\s+/g, "-")}-${Date.now()}`,
      source: sources[sourceIndex],
      domain: sources[sourceIndex].toLowerCase().replace(/\s+/g, "") + ".com",
      publishedAt: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString(),
      snippet: generateDiscoverSnippet(keyword),
      thumbnailUrl: `https://picsum.photos/seed/discover-${keyword}-${i}/400/250`,
      isAMP: false,
      isTopStory: false,
      category: getRandomCategory(),
    }
  })
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function generateNewsTitle(keyword: string, index: number): string {
  const templates = [
    `Breaking: ${capitalize(keyword)} Sees Major Developments Today`,
    `${capitalize(keyword)}: What You Need to Know Right Now`,
    `Latest Update: ${capitalize(keyword)} Trends and Analysis`,
    `${capitalize(keyword)} News: Industry Experts Weigh In`,
    `How ${capitalize(keyword)} Is Changing the Landscape`,
    `${capitalize(keyword)}: Top Stories and Headlines`,
    `The Future of ${capitalize(keyword)}: Predictions and Insights`,
    `${capitalize(keyword)} Report: Key Takeaways`,
  ]
  return templates[index % templates.length]
}

function generateDiscoverTitle(keyword: string, index: number): string {
  const templates = [
    `The Complete Guide to ${capitalize(keyword)}`,
    `Why ${capitalize(keyword)} Matters More Than Ever`,
    `${capitalize(keyword)}: A Deep Dive Analysis`,
    `Understanding ${capitalize(keyword)}: Expert Insights`,
    `The Rise of ${capitalize(keyword)}: What It Means`,
    `${capitalize(keyword)} Explained: Everything You Need`,
  ]
  return templates[index % templates.length]
}

function generateNewsSnippet(keyword: string): string {
  const snippets = [
    `Recent developments in ${keyword} have captured attention across the industry. Experts are closely monitoring the situation as new information emerges.`,
    `The latest news on ${keyword} reveals significant changes that could impact various sectors. Stay updated with our comprehensive coverage.`,
    `Industry analysts report major shifts related to ${keyword}. This developing story continues to evolve with new details emerging hourly.`,
  ]
  return snippets[Math.floor(Math.random() * snippets.length)]
}

function generateDiscoverSnippet(keyword: string): string {
  const snippets = [
    `Discover everything about ${keyword} in this comprehensive guide. From basics to advanced concepts, we cover it all.`,
    `Learn why ${keyword} is becoming increasingly important and how it affects your daily life and business decisions.`,
    `This in-depth analysis of ${keyword} provides valuable insights and actionable takeaways for professionals.`,
  ]
  return snippets[Math.floor(Math.random() * snippets.length)]
}

function getRandomCategory(): string {
  const categories = [
    "Technology", "Business", "Science", "Health", 
    "Entertainment", "Sports", "Politics", "World"
  ]
  return categories[Math.floor(Math.random() * categories.length)]
}

function capitalize(str: string): string {
  return str.split(" ").map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(" ")
}
