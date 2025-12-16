// ============================================
// VIDEO HIJACK - TikTok Mock Data
// ============================================

import type { TikTokVideoData } from "../types/platforms"

// Sample TikTok creators
const TIKTOK_CREATORS = [
  { name: "seoexpert_official", followers: 125000 },
  { name: "marketingtips", followers: 890000 },
  { name: "digitalgrowth", followers: 456000 },
  { name: "biztok", followers: 234000 },
  { name: "contentcreator101", followers: 567000 },
  { name: "rankingmaster", followers: 189000 },
  { name: "seohacks", followers: 345000 },
  { name: "growyourbusiness", followers: 678000 },
]

// Generate random TikTok video
const generateTikTokVideo = (keyword: string, index: number): TikTokVideoData => {
  const creator = TIKTOK_CREATORS[Math.floor(Math.random() * TIKTOK_CREATORS.length)]
  const views = Math.floor(Math.random() * 500000) + 10000
  const engagement = 0.05 + Math.random() * 0.15
  
  return {
    id: `tt-${index}-${Date.now()}`,
    title: `${keyword} - Quick Tips That Actually Work! 🚀 #${keyword.replace(/\s+/g, "")}`,
    creator: creator.name,
    followers: creator.followers,
    views,
    likes: Math.floor(views * engagement),
    comments: Math.floor(views * engagement * 0.1),
    shares: Math.floor(views * engagement * 0.05),
    duration: `${Math.floor(Math.random() * 55) + 15}s`,
    hashtags: [
      keyword.replace(/\s+/g, ""),
      "seo",
      "marketing",
      "business",
      "fyp",
      "viral",
    ],
    sounds: ["Original Sound - " + creator.name],
    publishDate: `${Math.floor(Math.random() * 30) + 1}d ago`,
    thumbnailUrl: "/placeholder.svg",
    videoUrl: `https://tiktok.com/@${creator.name}/video/${index}`,
  }
}

// TikTok keywords with hijack data
export interface TikTokHijackKeyword {
  id: string
  keyword: string
  searchVolume: number
  hijackScore: number
  topVideos: TikTokVideoData[]
  totalViews: number
  avgEngagement: number
  trending: boolean
  difficulty: "easy" | "medium" | "hard"
  recommendedHashtags: string[]
}

// Sample keywords for TikTok
const TIKTOK_KEYWORDS = [
  { keyword: "seo tips", volume: 45000, trending: true },
  { keyword: "how to rank on google", volume: 32000, trending: false },
  { keyword: "keyword research tutorial", volume: 28000, trending: true },
  { keyword: "backlinks explained", volume: 18000, trending: false },
  { keyword: "content marketing", volume: 56000, trending: true },
  { keyword: "grow website traffic", volume: 24000, trending: false },
  { keyword: "seo for beginners", volume: 67000, trending: true },
  { keyword: "rank higher on google", volume: 41000, trending: false },
  { keyword: "digital marketing tips", volume: 89000, trending: true },
  { keyword: "seo mistakes to avoid", volume: 19000, trending: false },
]

// Generate TikTok hijack analysis
export const generateTikTokHijackData = (): TikTokHijackKeyword[] => {
  return TIKTOK_KEYWORDS.map((kw, index) => {
    const hijackScore = Math.floor(Math.random() * 60) + 30
    const topVideos = Array(5).fill(null).map((_, i) => generateTikTokVideo(kw.keyword, i))
    const totalViews = topVideos.reduce((sum, v) => sum + v.views, 0)
    
    return {
      id: `tiktok-kw-${index}`,
      keyword: kw.keyword,
      searchVolume: kw.volume,
      hijackScore,
      topVideos,
      totalViews,
      avgEngagement: 0.08 + Math.random() * 0.1,
      trending: kw.trending,
      difficulty: hijackScore >= 70 ? "hard" : hijackScore >= 50 ? "medium" : "easy",
      recommendedHashtags: [
        kw.keyword.replace(/\s+/g, ""),
        "fyp",
        "viral",
        "learnontiktok",
        "business",
      ],
    }
  })
}

// Platform summary
export const generateTikTokSummary = (data: TikTokHijackKeyword[]) => {
  return {
    totalKeywords: data.length,
    avgHijackScore: Math.round(data.reduce((sum, k) => sum + k.hijackScore, 0) / data.length),
    trendingCount: data.filter((k) => k.trending).length,
    highOpportunity: data.filter((k) => k.hijackScore >= 70).length,
    totalViews: data.reduce((sum, k) => sum + k.totalViews, 0),
    avgEngagement: data.reduce((sum, k) => sum + k.avgEngagement, 0) / data.length,
  }
}

// Pre-generated data
export const MOCK_TIKTOK_HIJACK_DATA = generateTikTokHijackData()
export const MOCK_TIKTOK_SUMMARY = generateTikTokSummary(MOCK_TIKTOK_HIJACK_DATA)
