// ============================================
// VIDEO HIJACK - YouTube Service
// ============================================
// Handles all YouTube Data API v3 calls
// ============================================

import type {
  YouTubeVideo,
  YouTubeSearchOptions,
  YouTubeVideoItem,
  YouTubeKeywordAnalytics,
} from "../types/youtube.types"
import type { ViralPotential, ContentAge } from "../types/common.types"

// ============================================
// Helper Functions
// ============================================

/**
 * Calculate hijack score for YouTube video
 * Higher score = easier to outrank
 */
export function calculateYouTubeHijackScore(video: {
  views: number
  likes: number
  comments: number
  daysOld: number
  subscriberCount: number
}): number {
  const { views, likes, comments, daysOld, subscriberCount } = video

  // Engagement rate (lower = easier to hijack)
  const engagementRate = views > 0 ? ((likes + comments) / views) * 100 : 0
  const engagementScore = Math.max(0, 100 - engagementRate * 10)

  // Age factor (older = easier to hijack)
  const ageScore = Math.min(100, daysOld / 3.65) // Max at 1 year

  // Subscriber factor (lower = easier to hijack)
  const subScore = Math.max(0, 100 - subscriberCount / 10000)

  // View velocity (lower = easier to hijack)
  const viewsPerDay = views / Math.max(1, daysOld)
  const velocityScore = Math.max(0, 100 - viewsPerDay / 100)

  // Weighted average
  const score =
    engagementScore * 0.25 + ageScore * 0.3 + subScore * 0.25 + velocityScore * 0.2

  return Math.round(Math.max(0, Math.min(100, score)))
}

/**
 * Determine viral potential
 */
export function calculateYouTubeViralPotential(
  engagement: number,
  viewsPerDay: number
): ViralPotential {
  const score = engagement * 10 + viewsPerDay / 1000
  if (score > 50) return "high"
  if (score > 20) return "medium"
  return "low"
}

/**
 * Determine content age category
 */
export function getYouTubeContentAge(publishedDate: Date): ContentAge {
  const daysOld = Math.floor(
    (Date.now() - publishedDate.getTime()) / (1000 * 60 * 60 * 24)
  )
  if (daysOld <= 90) return "fresh"
  if (daysOld <= 365) return "aging"
  return "outdated"
}

/**
 * Format large numbers
 */
export function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
  return num.toString()
}

/**
 * Parse YouTube duration (ISO 8601 to readable)
 */
export function parseYouTubeDuration(iso8601: string): {
  formatted: string
  seconds: number
} {
  const match = iso8601.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
  if (!match) return { formatted: "0:00", seconds: 0 }

  const hours = parseInt(match[1] || "0")
  const minutes = parseInt(match[2] || "0")
  const seconds = parseInt(match[3] || "0")

  const totalSeconds = hours * 3600 + minutes * 60 + seconds

  if (hours > 0) {
    return {
      formatted: `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`,
      seconds: totalSeconds,
    }
  }
  return {
    formatted: `${minutes}:${seconds.toString().padStart(2, "0")}`,
    seconds: totalSeconds,
  }
}

// ============================================
// DataForSEO YouTube Organic Service
// ============================================

export interface DataForSEOYouTubeItem {
  type: string
  rank_group: number
  title: string
  url: string
  views_count?: number
  publication_date?: string
  thumbnail_url?: string
  channel?: {
    name: string
    url: string
    is_verified?: boolean
  }
}

export type VideoResult = {
  id: string
  title: string
  url: string
  thumbnail: string
  views: number
  publishedAt: string
  channel: {
    name: string
    url?: string
  }
  hijackScore: number
  difficulty: string
  viralPotential: string
}

type RawYouTubeResult = {
  items?: DataForSEOYouTubeItem[]
}

type RawYouTubeTask = {
  result?: RawYouTubeResult[]
}

type RawYouTubeTaskResponse = {
  tasks?: RawYouTubeTask[]
}

function parsePublicationDate(value?: string): Date | null {
  if (!value) return null
  const parsed = new Date(value)
  if (!Number.isNaN(parsed.getTime())) {
    return parsed
  }

  const match = value.trim().match(/(\d+)\s+(year|month|week|day)s?\s+ago/i)
  if (!match) return null

  const amount = Number(match[1])
  const unit = match[2]?.toLowerCase()
  const now = new Date()

  if (unit === "year") now.setFullYear(now.getFullYear() - amount)
  if (unit === "month") now.setMonth(now.getMonth() - amount)
  if (unit === "week") now.setDate(now.getDate() - amount * 7)
  if (unit === "day") now.setDate(now.getDate() - amount)
  return now
}

function calculateHijackScore(video: {
  views?: number
  date?: string
  title?: string
}): { score: number; label: string; viral: boolean } {
  let score = 50
  const views = Number(video.views ?? 0)

  if (views < 5000) {
    score += 20
  } else if (views > 1000000) {
    score -= 20
  }

  const publicationDate = parsePublicationDate(video.date)
  if (publicationDate) {
    const daysOld = Math.floor(
      (Date.now() - publicationDate.getTime()) / (1000 * 60 * 60 * 24)
    )
    if (daysOld > 365) {
      score += 20
    } else if (daysOld < 30) {
      score -= 10
    }
  }

  if (/vevo|official/i.test(video.title ?? "")) {
    score -= 10
  }

  const clamped = Math.max(0, Math.min(100, score))
  return {
    score: clamped,
    label: clamped >= 70 ? "Easy" : "Hard",
    viral: clamped >= 70,
  }
}

function extractVideoId(url: string): string | null {
  const match = url.match(/[?&]v=([^&]+)/i)
  if (match?.[1]) return match[1]
  const shortMatch = url.match(/youtu\.be\/([^?&]+)/i)
  if (shortMatch?.[1]) return shortMatch[1]
  return null
}

export async function searchYouTubeVideos(keyword: string): Promise<VideoResult[]> {
  const trimmed = keyword.trim()
  if (!trimmed) return []

  const { dataForSEOClient } = await import("@/services/dataforseo/client")

  const response = await dataForSEOClient.request<RawYouTubeResult[]>(
    "/v3/serp/youtube/organic/live/advanced",
    [
      {
        keyword: trimmed,
        location_code: 2840,
        language_code: "en",
        device: "desktop",
        os: "windows",
      },
    ]
  )

  if (!response.success || !response.data) {
    throw new Error(response.error || "Failed to fetch YouTube results")
  }

  const results = Array.isArray(response.data) ? response.data : [response.data]
  const taskItems = (response as RawYouTubeTaskResponse).tasks?.[0]?.result?.[0]?.items
  // Raw Item DataForSEO se aya
  const rawItems = taskItems ?? results[0]?.items ?? []

  // Hamara Filter & Map Logic
  const cleanVideos = rawItems
    // 1. FILTER: Sirf Videos chahiye, Channel/Playlist nahi
    .filter((item: DataForSEOYouTubeItem) => item.type === "youtube_video")
    // 2. MAP: Sirf kaam ka data nikalo
    .map((item: DataForSEOYouTubeItem) => {
      const scoreData = calculateHijackScore({
        views: item.views_count,
        date: item.publication_date,
        title: item.title,
      })

      const fallbackId = extractVideoId(item.url)
      return {
        id: item.url,
        title: item.title,
        url: item.url,
        thumbnail:
          item.thumbnail_url ||
          (fallbackId ? `https://i.ytimg.com/vi/${fallbackId}/hqdefault.jpg` : ""),
        views: item.views_count || 0,
        publishedAt: item.publication_date || "Unknown",
        channel: {
          name: item.channel?.name || "Unknown",
          url: item.channel?.url,
        },
        hijackScore: scoreData.score,
        difficulty: scoreData.label,
        viralPotential: scoreData.viral ? "High" : "Low",
      }
    })

  return cleanVideos
}

// ============================================
// YouTube Service Class
// ============================================

class YouTubeService {

  /**
   * Check if API key is configured
   */
  isConfigured(): boolean {
    // API keys are stored server-side; client assumes the proxy is available.
    return true
  }

  /**
   * Search YouTube videos
   */
  async searchVideos(
    query: string,
    options: YouTubeSearchOptions = {}
  ): Promise<YouTubeVideo[]> {
    const {
      maxResults = 25,
      order = "relevance",
      publishedAfter,
      videoDuration,
    } = options

    if (!query.trim()) {
      return []
    }

    try {
      const params = new URLSearchParams({
        query,
        maxResults: maxResults.toString(),
        order,
      })

      if (publishedAfter) {
        params.set("publishedAfter", publishedAfter.toISOString())
      }
      if (videoDuration) {
        params.set("videoDuration", videoDuration)
      }

      const response = await fetch(`/api/video-hijack/youtube?${params.toString()}`)

      if (!response.ok) {
        throw new Error(`YouTube search failed: ${response.statusText}`)
      }

      const data = await response.json()
      const items = data?.data?.items || []

      if (!data.success || !items.length) {
        return []
      }

      return items.map((video: any) => this.transformApiVideo(video))
    } catch (error) {
      console.error("YouTube search error:", error)
      throw error
    }
  }

  /**
   * Get video by ID
   */
  async getVideo(videoId: string): Promise<YouTubeVideo | null> {
    try {
      if (!videoId.trim()) {
        return null
      }

      const params = new URLSearchParams({
        videoId,
      })

      const response = await fetch(`/api/video-hijack/youtube?${params.toString()}`)
      const data = await response.json()

      if (!data.success || !data?.data?.items?.length) return null

      const video = data.data.items[0]
      return this.transformApiVideo(video)
    } catch (error) {
      console.error("YouTube get video error:", error)
      throw error
    }
  }

  /**
   * Get keyword analytics
   */
  async getKeywordAnalytics(keyword: string): Promise<YouTubeKeywordAnalytics> {
    const videos = await this.searchVideos(keyword, { maxResults: 50 })

    const totalViews = videos.reduce((sum, v) => sum + v.stats.views, 0)
    const avgViews = videos.length > 0 ? totalViews / videos.length : 0
    const avgEngagement =
      videos.length > 0
        ? videos.reduce((sum, v) => sum + v.stats.engagement, 0) / videos.length
        : 0

    // Count videos per channel
    const channelCounts = new Map<string, { videos: number; subscribers: number }>()
    videos.forEach((v) => {
      const existing = channelCounts.get(v.channel.name) || {
        videos: 0,
        subscribers: v.channel.subscribers,
      }
      channelCounts.set(v.channel.name, {
        videos: existing.videos + 1,
        subscribers: v.channel.subscribers,
      })
    })

    const topChannels = Array.from(channelCounts.entries())
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.videos - a.videos)
      .slice(0, 5)

    const avgHijackScore =
      videos.length > 0
        ? videos.reduce((sum, v) => sum + v.hijackScore, 0) / videos.length
        : 0

    return {
      keyword,
      totalVideos: videos.length,
      totalViews,
      avgViews,
      avgEngagement,
      topChannels,
      competition: avgHijackScore < 40 ? "high" : avgHijackScore < 60 ? "medium" : "low",
      trendScore: Math.round(avgEngagement * 10),
      hijackOpportunity: Math.round(avgHijackScore),
    }
  }

  /**
   * Transform internal API response to YouTubeVideo
   */
  private transformApiVideo(video: any): YouTubeVideo {
    const views = parseInt(video.views || "0")
    const likes = parseInt(video.likes || "0")
    const comments = parseInt(video.comments || "0")
    const publishedAt = video.publishedAt || new Date().toISOString()
    const publishedDate = new Date(publishedAt)
    const daysOld = Math.floor(
      (Date.now() - publishedDate.getTime()) / (1000 * 60 * 60 * 24)
    )
    const duration = parseYouTubeDuration(video.duration || "PT0S")
    const engagement = views > 0 ? ((likes + comments) / views) * 100 : 0
    const viewsPerDay = daysOld > 0 ? views / daysOld : views
    const subscribers = parseInt(video.channelSubs || "0")

    return {
      id: video.id,
      videoId: video.id,
      title: video.title || "",
      description: video.description || "",
      channel: {
        id: video.channelId || "",
        name: video.channelName || "Unknown Channel",
        url: video.channelId ? `https://youtube.com/channel/${video.channelId}` : "",
        subscribers,
        subscribersFormatted: formatNumber(subscribers),
      },
      thumbnail: {
        url: video.thumbnail || "",
        width: 0,
        height: 0,
      },
      stats: { views, likes, comments, engagement },
      duration: duration.formatted,
      durationSeconds: duration.seconds,
      publishedAt,
      publishedDate,
      url: video.url || `https://youtube.com/watch?v=${video.id}`,
      tags: video.tags || [],
      hijackScore: calculateYouTubeHijackScore({
        views,
        likes,
        comments,
        daysOld,
        subscriberCount: subscribers,
      }),
      viralPotential: calculateYouTubeViralPotential(engagement, viewsPerDay),
      contentAge: getYouTubeContentAge(publishedDate),
    }
  }

  /**
   * Transform raw video item to YouTubeVideo
   */
  private transformVideoItem(video: YouTubeVideoItem): YouTubeVideo {
    const views = parseInt(video.statistics.viewCount || "0")
    const likes = parseInt(video.statistics.likeCount || "0")
    const comments = parseInt(video.statistics.commentCount || "0")
    const publishedDate = new Date(video.snippet.publishedAt)
    const daysOld = Math.floor(
      (Date.now() - publishedDate.getTime()) / (1000 * 60 * 60 * 24)
    )
    const duration = parseYouTubeDuration(video.contentDetails.duration)
    const engagement = views > 0 ? ((likes + comments) / views) * 100 : 0
    const viewsPerDay = daysOld > 0 ? views / daysOld : views

    return {
      id: video.id,
      videoId: video.id,
      title: video.snippet.title,
      description: video.snippet.description,
      channel: {
        id: video.snippet.channelId,
        name: video.snippet.channelTitle,
        url: `https://youtube.com/channel/${video.snippet.channelId}`,
        subscribers: 0,
        subscribersFormatted: "0",
      },
      thumbnail: {
        url: video.snippet.thumbnails.high.url,
        width: video.snippet.thumbnails.high.width,
        height: video.snippet.thumbnails.high.height,
      },
      stats: { views, likes, comments, engagement },
      duration: duration.formatted,
      durationSeconds: duration.seconds,
      publishedAt: video.snippet.publishedAt,
      publishedDate,
      url: `https://youtube.com/watch?v=${video.id}`,
      tags: video.snippet.tags || [],
      hijackScore: calculateYouTubeHijackScore({
        views,
        likes,
        comments,
        daysOld,
        subscriberCount: 0,
      }),
      viralPotential: calculateYouTubeViralPotential(engagement, viewsPerDay),
      contentAge: getYouTubeContentAge(publishedDate),
    }
  }

  /**
   * Export YouTube results to CSV
   * Accepts both YouTubeVideo[] (from API) or YouTubeVideoResult[] (from components)
   */
  exportToCSV(videos: YouTubeVideo[] | import("../types/youtube.types").YouTubeVideoResult[], filename: string): void {
    const headers = [
      "Title",
      "Channel",
      "Subscribers",
      "Views",
      "Likes",
      "Comments",
      "Engagement %",
      "Hijack Score",
      "Viral Potential",
      "Content Age",
      "Duration",
      "Published",
      "URL",
      "Tags",
    ]

    const rows = videos.map((v) => {
      // Handle both YouTubeVideo and YouTubeVideoResult formats
      const isYouTubeVideo = "channel" in v && "stats" in v && typeof (v as YouTubeVideo).channel === "object"
      
      if (isYouTubeVideo) {
        const video = v as YouTubeVideo
        return [
          `"${video.title.replace(/"/g, '""')}"`,
          video.channel.name,
          video.channel.subscribers,
          video.stats.views,
          video.stats.likes,
          video.stats.comments,
          video.stats.engagement.toFixed(2),
          video.hijackScore,
          video.viralPotential,
          video.contentAge,
          video.duration,
          video.publishedAt,
          video.url,
          `"${video.tags.join(", ")}"`,
        ].join(",")
      } else {
        const result = v as import("../types/youtube.types").YouTubeVideoResult
        return [
          `"${(result.title || "").replace(/"/g, '""')}"`,
          result.channel || "",
          result.subscribers || "0",
          result.views,
          result.likes,
          result.comments,
          result.engagement.toFixed(2),
          result.hijackScore,
          result.viralPotential,
          result.contentAge || "N/A",
          result.duration,
          result.publishedAt,
          result.url || result.videoUrl || "",
          `"${(result.tags || []).join(", ")}"`,
        ].join(",")
      }
    })

    const csv = [headers.join(","), ...rows].join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `${filename}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }
}

// Export singleton instance
export const youtubeService = new YouTubeService()

// Export class for testing
export { YouTubeService }
