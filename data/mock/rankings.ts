/**
 * Mock Rankings Data
 * Sample ranking data for development and testing
 */

export interface MockRanking {
  id: string
  keyword: string
  url: string
  position: number
  previousPosition: number | null
  change: number
  volume: number
  traffic: number
  difficulty: number
  lastUpdated: string
  history: number[]
}

export interface MockCompetitor {
  id: string
  domain: string
  commonKeywords: number
  avgPosition: number
  visibility: number
  traffic: number
}

export const mockRankings: MockRanking[] = [
  {
    id: "rank_1",
    keyword: "best seo tools 2024",
    url: "https://blogspy.io/blog/best-seo-tools",
    position: 3,
    previousPosition: 5,
    change: 2,
    volume: 12500,
    traffic: 2350,
    difficulty: 67,
    lastUpdated: new Date().toISOString(),
    history: [12, 10, 8, 7, 6, 5, 5, 4, 4, 3, 3, 3],
  },
  {
    id: "rank_2",
    keyword: "how to improve website seo",
    url: "https://blogspy.io/blog/improve-seo-guide",
    position: 7,
    previousPosition: 6,
    change: -1,
    volume: 8900,
    traffic: 890,
    difficulty: 45,
    lastUpdated: new Date().toISOString(),
    history: [15, 12, 10, 9, 8, 7, 6, 6, 6, 7, 7, 7],
  },
  {
    id: "rank_3",
    keyword: "keyword research tool free",
    url: "https://blogspy.io/tools/keyword-research",
    position: 12,
    previousPosition: 17,
    change: 5,
    volume: 6700,
    traffic: 340,
    difficulty: 52,
    lastUpdated: new Date().toISOString(),
    history: [25, 22, 20, 18, 17, 17, 16, 15, 14, 13, 12, 12],
  },
  {
    id: "rank_4",
    keyword: "content marketing strategy",
    url: "https://blogspy.io/blog/content-marketing-guide",
    position: 5,
    previousPosition: 6,
    change: 1,
    volume: 14200,
    traffic: 1560,
    difficulty: 73,
    lastUpdated: new Date().toISOString(),
    history: [18, 15, 12, 10, 8, 7, 6, 6, 5, 5, 5, 5],
  },
  {
    id: "rank_5",
    keyword: "blog post seo checklist",
    url: "https://blogspy.io/resources/seo-checklist",
    position: 2,
    previousPosition: 2,
    change: 0,
    volume: 4500,
    traffic: 1080,
    difficulty: 38,
    lastUpdated: new Date().toISOString(),
    history: [8, 6, 5, 4, 3, 3, 2, 2, 2, 2, 2, 2],
  },
  {
    id: "rank_6",
    keyword: "backlink checker",
    url: "https://blogspy.io/tools/backlink-checker",
    position: 18,
    previousPosition: 15,
    change: -3,
    volume: 22000,
    traffic: 660,
    difficulty: 81,
    lastUpdated: new Date().toISOString(),
    history: [10, 11, 12, 13, 14, 14, 15, 15, 16, 17, 18, 18],
  },
  {
    id: "rank_7",
    keyword: "google analytics setup",
    url: "https://blogspy.io/blog/ga4-setup-guide",
    position: 8,
    previousPosition: 10,
    change: 2,
    volume: 9800,
    traffic: 780,
    difficulty: 42,
    lastUpdated: new Date().toISOString(),
    history: [20, 18, 15, 13, 12, 11, 10, 10, 9, 9, 8, 8],
  },
  {
    id: "rank_8",
    keyword: "long tail keyword generator",
    url: "https://blogspy.io/tools/long-tail-generator",
    position: 4,
    previousPosition: 7,
    change: 3,
    volume: 3200,
    traffic: 480,
    difficulty: 35,
    lastUpdated: new Date().toISOString(),
    history: [15, 13, 11, 10, 9, 8, 7, 6, 5, 5, 4, 4],
  },
  {
    id: "rank_9",
    keyword: "technical seo audit",
    url: "https://blogspy.io/blog/technical-seo-audit",
    position: 6,
    previousPosition: 10,
    change: 4,
    volume: 5600,
    traffic: 670,
    difficulty: 58,
    lastUpdated: new Date().toISOString(),
    history: [22, 19, 16, 14, 12, 11, 10, 9, 8, 7, 6, 6],
  },
  {
    id: "rank_10",
    keyword: "competitor analysis tool",
    url: "https://blogspy.io/tools/competitor-analysis",
    position: 11,
    previousPosition: 11,
    change: 0,
    volume: 7800,
    traffic: 470,
    difficulty: 64,
    lastUpdated: new Date().toISOString(),
    history: [14, 13, 12, 12, 11, 11, 11, 11, 11, 11, 11, 11],
  },
  {
    id: "rank_11",
    keyword: "meta description best practices",
    url: "https://blogspy.io/blog/meta-description-guide",
    position: 1,
    previousPosition: 1,
    change: 0,
    volume: 2800,
    traffic: 890,
    difficulty: 32,
    lastUpdated: new Date().toISOString(),
    history: [5, 4, 3, 2, 2, 1, 1, 1, 1, 1, 1, 1],
  },
  {
    id: "rank_12",
    keyword: "internal linking strategy",
    url: "https://blogspy.io/blog/internal-linking",
    position: 3,
    previousPosition: 5,
    change: 2,
    volume: 4100,
    traffic: 770,
    difficulty: 41,
    lastUpdated: new Date().toISOString(),
    history: [12, 10, 8, 7, 6, 5, 5, 4, 4, 3, 3, 3],
  },
]

export const mockCompetitors: MockCompetitor[] = [
  {
    id: "comp_1",
    domain: "ahrefs.com",
    commonKeywords: 156,
    avgPosition: 4.2,
    visibility: 89,
    traffic: 2450000,
  },
  {
    id: "comp_2",
    domain: "semrush.com",
    commonKeywords: 142,
    avgPosition: 3.8,
    visibility: 92,
    traffic: 3120000,
  },
  {
    id: "comp_3",
    domain: "moz.com",
    commonKeywords: 98,
    avgPosition: 6.1,
    visibility: 76,
    traffic: 890000,
  },
  {
    id: "comp_4",
    domain: "backlinko.com",
    commonKeywords: 67,
    avgPosition: 5.4,
    visibility: 68,
    traffic: 520000,
  },
  {
    id: "comp_5",
    domain: "neilpatel.com",
    commonKeywords: 89,
    avgPosition: 7.2,
    visibility: 71,
    traffic: 780000,
  },
]

export const mockRankingSummary = {
  totalKeywords: mockRankings.length,
  avgPosition: Math.round(mockRankings.reduce((sum, r) => sum + r.position, 0) / mockRankings.length * 10) / 10,
  improved: mockRankings.filter(r => r.change > 0).length,
  declined: mockRankings.filter(r => r.change < 0).length,
  stable: mockRankings.filter(r => r.change === 0).length,
  totalTraffic: mockRankings.reduce((sum, r) => sum + r.traffic, 0),
  top3: mockRankings.filter(r => r.position <= 3).length,
  top10: mockRankings.filter(r => r.position <= 10).length,
  top100: mockRankings.filter(r => r.position <= 100).length,
}

export default mockRankings
