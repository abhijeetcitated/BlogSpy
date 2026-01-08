// Video Hijack Mock Data Generator

import { MOCK_CHANNELS, MOCK_KEYWORDS_BASE, VIDEO_TITLE_TEMPLATES } from "../constants"
import { calculateHijackScore, getOpportunityLevelFromScore } from "../utils/video-utils"
import type { 
  VideoHijackAnalysis, 
  VideoHijackKeyword, 
  VideoHijackSummary,
  CompetingVideo,
  VideoPresence,
  VideoSerpPosition,
  VideoPlatform,
  VideoTrend
} from "../types"

function generateVideoTitle(keyword: string, index: number): string {
  const template = VIDEO_TITLE_TEMPLATES[index % VIDEO_TITLE_TEMPLATES.length]
  return template(keyword)
}

function generateMockVideos(count: number, keyword: string): CompetingVideo[] {
  const videos: CompetingVideo[] = []
  const shuffledChannels = [...MOCK_CHANNELS].sort(() => Math.random() - 0.5)

  for (let i = 0; i < count; i++) {
    const channel = shuffledChannels[i % shuffledChannels.length]
    const daysAgo = Math.floor(Math.random() * 730)
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
      hasOwnSiteVideo: false,
    })
  }

  return videos
}

function generateMockKeywords(): VideoHijackKeyword[] {
  return MOCK_KEYWORDS_BASE.map((base, index) => {
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

    const serpPosition: VideoSerpPosition = { position, aboveTheFold, carouselSize }
    const hijackScore = presence === "none" ? 0 : calculateHijackScore(serpPosition, presence)
    const hasOwnVideo = Math.random() > 0.85
    const difficulty = Math.floor(Math.random() * 60) + 20
    const opportunityScore = hasOwnVideo 
      ? Math.max(0, hijackScore - 40)
      : Math.min(100, hijackScore + Math.floor(Math.random() * 20))
    const estimatedClicksLost = Math.floor((base.volume * hijackScore) / 100 * 0.15)

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
      trend: ["up", "down", "stable"][Math.floor(Math.random() * 3)] as VideoTrend,
      lastChecked: new Date().toISOString(),
    }
  })
}

export function generateVideoHijackAnalysis(): VideoHijackAnalysis {
  const keywords = generateMockKeywords()

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

  const topOpportunityKeywords = [...keywords]
    .filter((k) => k.opportunityLevel !== "none" && !k.hasOwnVideo)
    .sort((a, b) => b.opportunityScore - a.opportunityScore)
    .slice(0, 5)

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
