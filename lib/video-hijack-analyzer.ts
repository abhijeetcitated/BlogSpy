// ============================================
// VIDEO HIJACK ANALYZER
// ============================================
// Analyzes SERP for video carousel presence
// Calculates opportunity scores for video content
// ============================================

import {
  VideoHijackAnalysis,
  VideoHijackKeyword,
  VideoHijackSummary,
  VideoPresence,
  CompetingVideo,
  VideoSerpPosition,
  VideoPlatform,
  VideoOpportunityLevel,
  calculateHijackScore,
  getOpportunityLevelFromScore,
} from "@/types/video-hijack.types"

// ============================================
// MOCK DATA - COMPETING VIDEOS
// ============================================

const MOCK_CHANNELS = [
  { name: "Ahrefs", subscribers: 452000 },
  { name: "Semrush", subscribers: 287000 },
  { name: "Moz", subscribers: 156000 },
  { name: "Neil Patel", subscribers: 1200000 },
  { name: "Brian Dean", subscribers: 523000 },
  { name: "Matt Diggity", subscribers: 198000 },
  { name: "Income School", subscribers: 891000 },
  { name: "Surfside PPC", subscribers: 245000 },
  { name: "WPBeginner", subscribers: 312000 },
  { name: "Authority Hacker", subscribers: 167000 },
]

function generateMockVideos(count: number, keyword: string): CompetingVideo[] {
  const videos: CompetingVideo[] = []
  const shuffledChannels = [...MOCK_CHANNELS].sort(() => Math.random() - 0.5)

  for (let i = 0; i < count; i++) {
    const channel = shuffledChannels[i % shuffledChannels.length]
    const daysAgo = Math.floor(Math.random() * 730) // 0-2 years
    const publishDate = new Date()
    publishDate.setDate(publishDate.getDate() - daysAgo)

    videos.push({
      id: `video-${i + 1}-${Date.now()}`,
      title: generateVideoTitle(keyword, i),
      channel: channel.name,
      channelSubscribers: channel.subscribers,
      platform: Math.random() > 0.15 ? "youtube" : (["tiktok", "vimeo", "instagram"][Math.floor(Math.random() * 3)] as VideoPlatform),
      views: Math.floor(Math.random() * 500000) + 10000,
      duration: `${Math.floor(Math.random() * 20) + 5}:${String(Math.floor(Math.random() * 60)).padStart(2, "0")}`,
      publishDate: publishDate.toISOString().split("T")[0],
      videoUrl: `https://youtube.com/watch?v=mock-${i}`,
      position: i + 1,
      hasOwnSiteVideo: false, // Will be set dynamically
    })
  }

  return videos
}

function generateVideoTitle(keyword: string, index: number): string {
  const templates = [
    `${keyword} - Complete Guide (${new Date().getFullYear()})`,
    `How to Master ${keyword} in 10 Minutes`,
    `${keyword}: Everything You Need to Know`,
    `Top ${Math.floor(Math.random() * 10) + 5} ${keyword} Tips`,
    `${keyword} Tutorial for Beginners`,
    `The Ultimate ${keyword} Strategy`,
    `${keyword} Explained (Step by Step)`,
    `Why ${keyword} Matters for Your Business`,
  ]
  return templates[index % templates.length]
}

// ============================================
// MOCK KEYWORDS WITH VIDEO DATA
// ============================================

const MOCK_KEYWORDS_BASE = [
  { keyword: "seo tutorial", volume: 22000, intent: "informational" as const },
  { keyword: "keyword research", volume: 33000, intent: "informational" as const },
  { keyword: "how to rank on google", volume: 12500, intent: "informational" as const },
  { keyword: "backlink building", volume: 8900, intent: "informational" as const },
  { keyword: "seo tools comparison", volume: 6700, intent: "commercial" as const },
  { keyword: "on-page seo guide", volume: 5400, intent: "informational" as const },
  { keyword: "technical seo audit", volume: 4200, intent: "informational" as const },
  { keyword: "content marketing strategy", volume: 18000, intent: "informational" as const },
  { keyword: "local seo tips", volume: 7800, intent: "informational" as const },
  { keyword: "seo for beginners", volume: 27000, intent: "informational" as const },
  { keyword: "link building strategies", volume: 9100, intent: "informational" as const },
  { keyword: "wordpress seo plugin", volume: 14500, intent: "commercial" as const },
  { keyword: "google analytics tutorial", volume: 19000, intent: "informational" as const },
  { keyword: "seo checklist", volume: 8300, intent: "informational" as const },
  { keyword: "ecommerce seo guide", volume: 5600, intent: "informational" as const },
]

function generateMockKeywords(): VideoHijackKeyword[] {
  return MOCK_KEYWORDS_BASE.map((base, index) => {
    // Randomize video presence
    const presenceRoll = Math.random()
    let presence: VideoPresence
    let position: number
    let carouselSize: number
    let aboveTheFold: boolean

    if (presenceRoll < 0.2) {
      presence = "dominant"
      position = Math.floor(Math.random() * 3) + 1
      carouselSize = Math.floor(Math.random() * 4) + 5
      aboveTheFold = true
    } else if (presenceRoll < 0.45) {
      presence = "significant"
      position = Math.floor(Math.random() * 3) + 2
      carouselSize = Math.floor(Math.random() * 3) + 4
      aboveTheFold = Math.random() > 0.3
    } else if (presenceRoll < 0.7) {
      presence = "moderate"
      position = Math.floor(Math.random() * 4) + 4
      carouselSize = Math.floor(Math.random() * 2) + 3
      aboveTheFold = Math.random() > 0.6
    } else if (presenceRoll < 0.9) {
      presence = "minimal"
      position = Math.floor(Math.random() * 3) + 7
      carouselSize = Math.floor(Math.random() * 2) + 2
      aboveTheFold = false
    } else {
      presence = "none"
      position = 0
      carouselSize = 0
      aboveTheFold = false
    }

    const serpPosition: VideoSerpPosition = {
      position,
      aboveTheFold,
      carouselSize,
    }

    const hijackScore = presence === "none" ? 0 : calculateHijackScore(serpPosition, presence)
    
    // Calculate opportunity score (inverse - high hijack = high opportunity if no own video)
    const hasOwnVideo = Math.random() > 0.85
    const difficulty = Math.floor(Math.random() * 60) + 20
    const opportunityScore = hasOwnVideo 
      ? Math.max(0, hijackScore - 40) // Lower if already have video
      : Math.min(100, hijackScore + Math.floor(Math.random() * 20))

    const estimatedClicksLost = Math.floor((base.volume * hijackScore) / 100 * 0.15) // ~15% of volume affected

    return {
      id: `kw-${index + 1}`,
      keyword: base.keyword,
      searchVolume: base.volume,
      currentRank: Math.random() > 0.3 ? Math.floor(Math.random() * 20) + 1 : undefined,
      videoPresence: presence,
      serpPosition,
      hijackScore,
      opportunityScore,
      opportunityLevel: getOpportunityLevelFromScore(opportunityScore),
      competingVideos: presence !== "none" ? generateMockVideos(carouselSize, base.keyword) : [],
      estimatedClicksLost,
      hasOwnVideo,
      difficulty,
      intent: base.intent,
      trend: ["up", "down", "stable"][Math.floor(Math.random() * 3)] as "up" | "down" | "stable",
      lastChecked: new Date().toISOString(),
    }
  })
}

// ============================================
// ANALYZER FUNCTIONS
// ============================================

/**
 * Generate complete video hijack analysis
 */
export function generateVideoHijackAnalysis(): VideoHijackAnalysis {
  const keywords = generateMockKeywords()

  // Calculate summary stats
  const keywordsWithVideo = keywords.filter((k) => k.videoPresence !== "none")
  const highHijackCount = keywords.filter((k) => k.hijackScore >= 70).length
  const significantHijackCount = keywords.filter((k) => k.hijackScore >= 50 && k.hijackScore < 70).length
  const totalClicksLost = keywords.reduce((sum, k) => sum + k.estimatedClicksLost, 0)
  const avgHijackScore = keywords.length > 0 ? Math.round(keywords.reduce((sum, k) => sum + k.hijackScore, 0) / keywords.length) : 0
  const topOpportunities = keywords.filter((k) => k.opportunityLevel === "high").length
  const hasOwnVideoCount = keywords.filter((k) => k.hasOwnVideo).length

  const summary: VideoHijackSummary = {
    totalKeywords: keywords.length,
    keywordsWithVideo: keywordsWithVideo.length,
    highHijackCount,
    significantHijackCount,
    totalClicksLost,
    avgHijackScore,
    topOpportunities,
    hasOwnVideoCount,
  }

  // Get top opportunity keywords (sorted by opportunity score)
  const topOpportunityKeywords = [...keywords]
    .filter((k) => k.opportunityLevel !== "none" && !k.hasOwnVideo)
    .sort((a, b) => b.opportunityScore - a.opportunityScore)
    .slice(0, 5)

  // Calculate dominant channels
  const channelMap = new Map<string, { count: number; positions: number[] }>()
  keywords.forEach((k) => {
    k.competingVideos.forEach((v) => {
      const existing = channelMap.get(v.channel) || { count: 0, positions: [] }
      existing.count++
      existing.positions.push(v.position)
      channelMap.set(v.channel, existing)
    })
  })

  const dominantChannels = Array.from(channelMap.entries())
    .map(([channel, data]) => ({
      channel,
      count: data.count,
      avgPosition: Math.round((data.positions.reduce((a, b) => a + b, 0) / data.positions.length) * 10) / 10,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)

  return {
    summary,
    keywords,
    topOpportunityKeywords,
    dominantChannels,
    lastAnalyzed: new Date().toISOString(),
  }
}

/**
 * Get video opportunity recommendations
 */
export function getVideoRecommendations(keyword: VideoHijackKeyword): string[] {
  const recommendations: string[] = []

  if (keyword.hasOwnVideo) {
    recommendations.push("You already have a video ranking - optimize thumbnail and title for better CTR")
    if (keyword.hijackScore >= 50) {
      recommendations.push("Consider creating additional video content to capture more carousel positions")
    }
  } else {
    if (keyword.opportunityLevel === "high") {
      recommendations.push("🔥 High opportunity - Create video content to capture this traffic")
      recommendations.push("Focus on tutorial/how-to format for informational queries")
    }
    if (keyword.serpPosition.position <= 3) {
      recommendations.push("Video appears early in SERP - prioritize this keyword for video creation")
    }
    if (keyword.estimatedClicksLost > 500) {
      recommendations.push(`Potential to recover ${keyword.estimatedClicksLost.toLocaleString()} monthly clicks`)
    }
  }

  if (keyword.competingVideos.length > 0) {
    const avgViews = keyword.competingVideos.reduce((sum, v) => sum + v.views, 0) / keyword.competingVideos.length
    if (avgViews < 50000) {
      recommendations.push("Competition is relatively weak - good time to enter")
    }
    
    const topChannel = keyword.competingVideos[0]?.channel
    if (topChannel) {
      recommendations.push(`Study ${topChannel}'s video strategy for this topic`)
    }
  }

  if (keyword.difficulty < 40) {
    recommendations.push("Low video ranking difficulty - easier to compete")
  }

  return recommendations.slice(0, 4) // Max 4 recommendations
}

/**
 * Calculate video ROI potential
 */
export function calculateVideoROI(keyword: VideoHijackKeyword): {
  potentialViews: number
  estimatedValue: number
  timeToRank: string
} {
  const potentialViews = Math.floor(keyword.searchVolume * 0.35 * 12) // 35% CTR for video, annual
  const estimatedValue = potentialViews * 0.02 // $0.02 per view average value
  
  let timeToRank: string
  if (keyword.difficulty < 30) {
    timeToRank = "1-2 months"
  } else if (keyword.difficulty < 50) {
    timeToRank = "2-4 months"
  } else if (keyword.difficulty < 70) {
    timeToRank = "4-6 months"
  } else {
    timeToRank = "6+ months"
  }

  return {
    potentialViews,
    estimatedValue: Math.round(estimatedValue),
    timeToRank,
  }
}

/**
 * Filter keywords by criteria
 */
export function filterVideoKeywords(
  keywords: VideoHijackKeyword[],
  filters: {
    presence?: VideoPresence[]
    opportunityLevel?: VideoOpportunityLevel[]
    minHijackScore?: number
    maxHijackScore?: number
    hasOwnVideo?: boolean
    minVolume?: number
    maxDifficulty?: number
  }
): VideoHijackKeyword[] {
  return keywords.filter((k) => {
    if (filters.presence?.length && !filters.presence.includes(k.videoPresence)) return false
    if (filters.opportunityLevel?.length && !filters.opportunityLevel.includes(k.opportunityLevel)) return false
    if (filters.minHijackScore !== undefined && k.hijackScore < filters.minHijackScore) return false
    if (filters.maxHijackScore !== undefined && k.hijackScore > filters.maxHijackScore) return false
    if (filters.hasOwnVideo !== undefined && k.hasOwnVideo !== filters.hasOwnVideo) return false
    if (filters.minVolume !== undefined && k.searchVolume < filters.minVolume) return false
    if (filters.maxDifficulty !== undefined && k.difficulty > filters.maxDifficulty) return false
    return true
  })
}
