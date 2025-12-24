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
