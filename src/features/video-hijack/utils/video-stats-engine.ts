// ============================================
// VIDEO HIJACK - Video Stats Engine
// ============================================

import type { YouTubeVideo } from "../types/youtube.types"
import type {
  KeywordStats,
  ContentTypeDistribution,
  AudienceAgeDistribution,
  Competition,
  Seasonality,
  VolumeTrend,
} from "../types/common.types"

type ContentTypeCounts = {
  tutorial: number
  review: number
  comparison: number
  other: number
}

const DEFAULT_TIME_WINDOW = "2 PM - 6 PM"

const AUDIENCE_PROFILES: Record<string, AudienceAgeDistribution[]> = {
  tech: [
    { range: "18-24", percentage: 18 },
    { range: "25-34", percentage: 42 },
    { range: "35-44", percentage: 24 },
    { range: "45-54", percentage: 10 },
    { range: "55+", percentage: 6 },
  ],
  gaming: [
    { range: "18-24", percentage: 45 },
    { range: "25-34", percentage: 30 },
    { range: "35-44", percentage: 15 },
    { range: "45-54", percentage: 7 },
    { range: "55+", percentage: 3 },
  ],
  default: [
    { range: "18-24", percentage: 20 },
    { range: "25-34", percentage: 35 },
    { range: "35-44", percentage: 25 },
    { range: "45-54", percentage: 12 },
    { range: "55+", percentage: 8 },
  ],
}

function parseIsoDurationToSeconds(duration: string): number {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
  if (!match) return 0
  const hours = parseInt(match[1] || "0", 10)
  const minutes = parseInt(match[2] || "0", 10)
  const seconds = parseInt(match[3] || "0", 10)
  return hours * 3600 + minutes * 60 + seconds
}

function formatDuration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) return "0:00"
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, "0")}`
}

function guessCategory(videos: YouTubeVideo[]): string {
  const combined = videos.map((video) => video.title.toLowerCase()).join(" ")
  if (/(game|gaming|fortnite|minecraft|roblox)/i.test(combined)) return "gaming"
  if (/(tech|ai|seo|software|saas|automation)/i.test(combined)) return "tech"
  return "default"
}

function getBestUploadDay(videos: YouTubeVideo[]): string {
  const topTen = [...videos]
    .sort((a, b) => (b.stats?.views ?? 0) - (a.stats?.views ?? 0))
    .slice(0, 10)
  const counts = new Map<string, number>()
  topTen.forEach((video) => {
    const date = new Date(video.publishedAt)
    if (Number.isNaN(date.getTime())) return
    const day = date.toLocaleDateString("en-US", { weekday: "long" })
    counts.set(day, (counts.get(day) ?? 0) + 1)
  })
  let bestDay = "Tuesday"
  let bestCount = 0
  counts.forEach((count, day) => {
    if (count > bestCount) {
      bestDay = day
      bestCount = count
    }
  })
  return bestDay
}

function getContentTypeBreakdown(videos: YouTubeVideo[]): ContentTypeDistribution[] {
  const counts: ContentTypeCounts = {
    tutorial: 0,
    review: 0,
    comparison: 0,
    other: 0,
  }

  videos.forEach((video) => {
    const title = video.title.toLowerCase()
    if (/(how to|guide|tutorial)/i.test(title)) {
      counts.tutorial += 1
      return
    }
    if (/(review|test)/i.test(title)) {
      counts.review += 1
      return
    }
    if (/(vs|versus|compare)/i.test(title)) {
      counts.comparison += 1
      return
    }
    counts.other += 1
  })

  const total = videos.length || 1
  return [
    { type: "Tutorial", percentage: Math.round((counts.tutorial / total) * 100) },
    { type: "Review", percentage: Math.round((counts.review / total) * 100) },
    { type: "Comparison", percentage: Math.round((counts.comparison / total) * 100) },
    { type: "Other", percentage: Math.round((counts.other / total) * 100) },
  ]
}

function getCompetitionLevel(avgViews: number): Competition {
  if (avgViews >= 500000) return "high"
  if (avgViews >= 100000) return "medium"
  return "low"
}

export function calculateVideoStats(videos: YouTubeVideo[], keywordCPC: number): KeywordStats {
  const totalVideos = videos.length
  const totalViews = videos.reduce((sum, video) => sum + (video.stats?.views ?? 0), 0)
  const avgViews = totalVideos > 0 ? totalViews / totalVideos : 0
  const avgEngagement =
    totalVideos > 0
      ? videos.reduce((sum, video) => sum + (video.stats?.engagement ?? 0), 0) / totalVideos
      : 0
  const avgHijackScore =
    totalVideos > 0
      ? videos.reduce((sum, video) => sum + (video.hijackScore ?? 0), 0) / totalVideos
      : 0

  const durationSeconds = videos.map((video) =>
    typeof video.durationSeconds === "number"
      ? video.durationSeconds
      : parseIsoDurationToSeconds(video.duration)
  )
  const avgDurationSeconds =
    durationSeconds.length > 0
      ? durationSeconds.reduce((sum, value) => sum + value, 0) / durationSeconds.length
      : 0

  const channelCounts = new Map<string, number>()
  videos.forEach((video) => {
    const name = video.channel?.name ?? "Unknown"
    channelCounts.set(name, (channelCounts.get(name) ?? 0) + 1)
  })
  const topChannels = Array.from(channelCounts.entries())
    .map(([name, videosCount]) => ({ name, videos: videosCount }))
    .sort((a, b) => b.videos - a.videos)
    .slice(0, 5)

  const cpc = Number.isFinite(keywordCPC) ? keywordCPC : 0.5
  const cpm = Math.min(100, cpc * 1000 * 0.4)

  const category = guessCategory(videos)
  const audienceAge = AUDIENCE_PROFILES[category] ?? AUDIENCE_PROFILES.default
  const contentTypes = getContentTypeBreakdown(videos)

  const competition = getCompetitionLevel(avgViews)
  const seasonality: Seasonality = "evergreen"
  const volumeTrend: VolumeTrend = "stable"

  return {
    keyword: videos[0]?.title ?? "",
    platform: "youtube",
    totalVideos,
    totalViews,
    avgViews: Math.round(avgViews),
    avgEngagement,
    topChannels,
    trendScore: Math.min(100, Math.round(avgEngagement * 10)),
    competition,
    hijackOpportunity: Math.round(avgHijackScore),
    monetizationScore: Math.round(cpm),
    seasonality,
    avgVideoLength: formatDuration(avgDurationSeconds),
    bestUploadDay: getBestUploadDay(videos),
    bestUploadTime: DEFAULT_TIME_WINDOW,
    searchVolume: Math.round(avgViews),
    volumeTrend,
    contentTypes,
    audienceAge,
  }
}
