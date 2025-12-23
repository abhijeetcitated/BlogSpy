// ============================================
// VIDEO HIJACK - YouTube Service
// ============================================
// Handles all YouTube Data API v3 calls
// ============================================

import type {
  YouTubeVideo,
  YouTubeSearchOptions,
  YouTubeVideoItem,
  YouTubeChannelItem,
  YouTubeKeywordAnalytics,
} from "../types/youtube.types"
import type { ViralPotential, ContentAge } from "../types/common.types"

// API Endpoints
const YOUTUBE_API = {
  SEARCH: "https://www.googleapis.com/youtube/v3/search",
  VIDEOS: "https://www.googleapis.com/youtube/v3/videos",
  CHANNELS: "https://www.googleapis.com/youtube/v3/channels",
}

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
  private apiKey: string | null = null

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY || null
  }

  /**
   * Check if API key is configured
   */
  isConfigured(): boolean {
    return !!this.apiKey
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

    if (!this.apiKey) {
      throw new Error("YouTube API key not configured")
    }

    try {
      // Step 1: Search for video IDs
      const searchParams = new URLSearchParams({
        part: "snippet",
        q: query,
        type: "video",
        maxResults: maxResults.toString(),
        order,
        key: this.apiKey,
      })

      if (publishedAfter) {
        searchParams.append("publishedAfter", publishedAfter.toISOString())
      }
      if (videoDuration) {
        searchParams.append("videoDuration", videoDuration)
      }

      const searchResponse = await fetch(
        `${YOUTUBE_API.SEARCH}?${searchParams.toString()}`
      )
      
      if (!searchResponse.ok) {
        throw new Error(`YouTube search failed: ${searchResponse.statusText}`)
      }
      
      const searchData = await searchResponse.json()

      if (!searchData.items?.length) return []

      // Step 2: Get video details (stats)
      const videoIds = searchData.items
        .map((item: { id: { videoId: string } }) => item.id.videoId)
        .join(",")

      const videosParams = new URLSearchParams({
        part: "snippet,statistics,contentDetails",
        id: videoIds,
        key: this.apiKey,
      })

      const videosResponse = await fetch(
        `${YOUTUBE_API.VIDEOS}?${videosParams.toString()}`
      )
      const videosData = await videosResponse.json()

      // Step 3: Get channel details
      const channelIds = [
        ...new Set(
          videosData.items.map(
            (item: { snippet: { channelId: string } }) => item.snippet.channelId
          )
        ),
      ].join(",")

      const channelsParams = new URLSearchParams({
        part: "snippet,statistics",
        id: channelIds,
        key: this.apiKey,
      })

      const channelsResponse = await fetch(
        `${YOUTUBE_API.CHANNELS}?${channelsParams.toString()}`
      )
      const channelsData = await channelsResponse.json()

      const channelMap = new Map<string, { name: string; subscribers: number }>(
        channelsData.items.map((ch: YouTubeChannelItem) => [
          ch.id,
          {
            name: ch.snippet.title,
            subscribers: parseInt(ch.statistics.subscriberCount || "0"),
          },
        ])
      )

      // Step 4: Transform to our format
      return videosData.items.map((video: YouTubeVideoItem) => {
        const views = parseInt(video.statistics.viewCount || "0")
        const likes = parseInt(video.statistics.likeCount || "0")
        const comments = parseInt(video.statistics.commentCount || "0")
        const publishedDate = new Date(video.snippet.publishedAt)
        const daysOld = Math.floor(
          (Date.now() - publishedDate.getTime()) / (1000 * 60 * 60 * 24)
        )
        const channel = channelMap.get(video.snippet.channelId) || {
          name: video.snippet.channelTitle,
          subscribers: 0,
        }
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
            name: channel.name,
            url: `https://youtube.com/channel/${video.snippet.channelId}`,
            subscribers: channel.subscribers,
            subscribersFormatted: formatNumber(channel.subscribers),
          },
          thumbnail: {
            url: video.snippet.thumbnails.high.url,
            width: video.snippet.thumbnails.high.width,
            height: video.snippet.thumbnails.high.height,
          },
          stats: {
            views,
            likes,
            comments,
            engagement,
          },
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
            subscriberCount: channel.subscribers,
          }),
          viralPotential: calculateYouTubeViralPotential(engagement, viewsPerDay),
          contentAge: getYouTubeContentAge(publishedDate),
        } as YouTubeVideo
      })
    } catch (error) {
      console.error("YouTube search error:", error)
      throw error
    }
  }

  /**
   * Get video by ID
   */
  async getVideo(videoId: string): Promise<YouTubeVideo | null> {
    if (!this.apiKey) {
      throw new Error("YouTube API key not configured")
    }

    try {
      const params = new URLSearchParams({
        part: "snippet,statistics,contentDetails",
        id: videoId,
        key: this.apiKey,
      })

      const response = await fetch(`${YOUTUBE_API.VIDEOS}?${params.toString()}`)
      const data = await response.json()

      if (!data.items?.length) return null

      const video = data.items[0]
      // Transform similar to searchVideos...
      return this.transformVideoItem(video)
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
