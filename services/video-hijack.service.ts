/**
 * Video Hijack Service
 * API integration for YouTube and TikTok video research
 * 
 * APIs Used:
 * - YouTube Data API v3 (search, videos, channels)
 * - TikTok API (unofficial/RapidAPI endpoints)
 * - DataForSEO API (for SERP video data)
 */

import { apiClient } from "./api-client"

// ============================================
// Types
// ============================================

export type Platform = "youtube" | "tiktok"
export type SearchMode = "keyword" | "domain"
export type SortOption = "hijackScore" | "views" | "engagement" | "recent"
export type Competition = "low" | "medium" | "high"
export type ViralPotential = "low" | "medium" | "high"
export type ContentAge = "fresh" | "aging" | "outdated"
export type Seasonality = "evergreen" | "seasonal" | "trending"
export type VolumeTrend = "up" | "stable" | "down"
export type Difficulty = "easy" | "medium" | "hard"

export interface YouTubeVideo {
  id: string
  videoId: string
  title: string
  description: string
  channel: {
    id: string
    name: string
    url: string
    subscribers: number
    subscribersFormatted: string
  }
  thumbnail: {
    url: string
    width: number
    height: number
  }
  stats: {
    views: number
    likes: number
    comments: number
    engagement: number
  }
  duration: string
  durationSeconds: number
  publishedAt: string
  publishedDate: Date
  url: string
  tags: string[]
  // Calculated fields
  hijackScore: number
  viralPotential: ViralPotential
  contentAge: ContentAge
}

export interface TikTokVideo {
  id: string
  videoId: string
  description: string
  creator: {
    id: string
    username: string
    nickname: string
    url: string
    followers: number
    followersFormatted: string
    verified: boolean
  }
  stats: {
    views: number
    likes: number
    shares: number
    comments: number
    engagement: number
  }
  duration: string
  durationSeconds: number
  publishedAt: string
  url: string
  hashtags: string[]
  sound: {
    id: string
    name: string
    author: string
    isTrending: boolean
  }
  // Calculated fields
  hijackScore: number
  viralPotential: ViralPotential
}

export interface KeywordAnalytics {
  keyword: string
  platform: Platform
  overview: {
    totalVideos: number
    totalViews: number
    avgViews: number
    avgEngagement: number
    competition: Competition
    trendScore: number
  }
  opportunity: {
    hijackScore: number
    monetizationScore: number
    difficulty: Difficulty
  }
  timing: {
    bestUploadDay: string
    bestUploadTime: string
    avgVideoLength: string
    seasonality: Seasonality
  }
  volume: {
    searchVolume: number
    trend: VolumeTrend
    trendPercentage: number
  }
  topCreators: {
    name: string
    id: string
    videos: number
    totalViews: number
  }[]
  contentTypes: {
    type: string
    percentage: number
  }[]
  audienceAge: {
    range: string
    percentage: number
  }[]
}

export interface VideoSuggestions {
  titles: {
    text: string
    type: "tutorial" | "listicle" | "how-to" | "review" | "story"
  }[]
  tags: string[]
  hashtags: string[]
  optimalLength: {
    youtube: { min: number; max: number; formatted: string }
    tiktok: { min: number; max: number; formatted: string }
  }
  contentGaps: {
    topic: string
    opportunity: "high" | "medium" | "low"
    description: string
  }[]
  bestTimeToPost: {
    day: string
    time: string
    timezone: string
  }
  difficulty: Difficulty
}

export interface VideoSearchParams {
  query: string
  mode: SearchMode
  platform: Platform
  limit?: number
  page?: number
  sortBy?: SortOption
  filters?: {
    minViews?: number
    maxViews?: number
    minEngagement?: number
    publishedAfter?: Date
    publishedBefore?: Date
    duration?: "short" | "medium" | "long"
  }
}

export interface VideoSearchResponse {
  success: boolean
  data: {
    youtube: YouTubeVideo[]
    tiktok: TikTokVideo[]
    analytics: KeywordAnalytics
    suggestions: VideoSuggestions
  }
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  meta: {
    searchId: string
    timestamp: Date
    processingTime: number
  }
}

// ============================================
// API Endpoints
// ============================================

const API_ENDPOINTS = {
  // YouTube Data API v3
  YOUTUBE_SEARCH: "https://www.googleapis.com/youtube/v3/search",
  YOUTUBE_VIDEOS: "https://www.googleapis.com/youtube/v3/videos",
  YOUTUBE_CHANNELS: "https://www.googleapis.com/youtube/v3/channels",
  
  // TikTok (via RapidAPI or similar)
  TIKTOK_SEARCH: "/api/tiktok/search",
  TIKTOK_VIDEO: "/api/tiktok/video",
  TIKTOK_HASHTAG: "/api/tiktok/hashtag",
  
  // Internal API
  VIDEO_HIJACK_SEARCH: "/api/video-hijack/search",
  VIDEO_HIJACK_ANALYTICS: "/api/video-hijack/analytics",
  VIDEO_HIJACK_SUGGESTIONS: "/api/video-hijack/suggestions",
}

// ============================================
// Helper Functions
// ============================================

/**
 * Calculate hijack score based on video metrics
 * Higher score = easier to outrank
 */
export function calculateHijackScore(video: {
  views: number
  likes: number
  comments: number
  daysOld: number
  subscriberCount: number
}): number {
  const { views, likes, comments, daysOld, subscriberCount } = video
  
  // Engagement rate (lower = easier to hijack)
  const engagementRate = ((likes + comments) / views) * 100
  const engagementScore = Math.max(0, 100 - engagementRate * 10)
  
  // Age factor (older = easier to hijack)
  const ageScore = Math.min(100, daysOld / 3.65) // Max at 1 year
  
  // Subscriber factor (lower = easier to hijack)
  const subScore = Math.max(0, 100 - (subscriberCount / 10000))
  
  // View velocity (lower = easier to hijack)
  const viewsPerDay = views / Math.max(1, daysOld)
  const velocityScore = Math.max(0, 100 - (viewsPerDay / 100))
  
  // Weighted average
  const score = (
    engagementScore * 0.25 +
    ageScore * 0.30 +
    subScore * 0.25 +
    velocityScore * 0.20
  )
  
  return Math.round(Math.max(0, Math.min(100, score)))
}

/**
 * Determine viral potential
 */
export function calculateViralPotential(
  engagement: number,
  viewsPerDay: number
): ViralPotential {
  const score = (engagement * 10) + (viewsPerDay / 1000)
  if (score > 50) return "high"
  if (score > 20) return "medium"
  return "low"
}

/**
 * Determine content age category
 */
export function getContentAge(publishedDate: Date): ContentAge {
  const daysOld = Math.floor((Date.now() - publishedDate.getTime()) / (1000 * 60 * 60 * 24))
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
export function parseYouTubeDuration(iso8601: string): { formatted: string; seconds: number } {
  const match = iso8601.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
  if (!match) return { formatted: "0:00", seconds: 0 }
  
  const hours = parseInt(match[1] || "0")
  const minutes = parseInt(match[2] || "0")
  const seconds = parseInt(match[3] || "0")
  
  const totalSeconds = hours * 3600 + minutes * 60 + seconds
  
  if (hours > 0) {
    return {
      formatted: `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`,
      seconds: totalSeconds
    }
  }
  return {
    formatted: `${minutes}:${seconds.toString().padStart(2, "0")}`,
    seconds: totalSeconds
  }
}

// ============================================
// Main Service Class
// ============================================

class VideoHijackService {
  private apiKey: string | null = null
  
  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY || null
  }

  /**
   * Search videos across platforms
   */
  async searchVideos(params: VideoSearchParams): Promise<VideoSearchResponse> {
    try {
      const response = await apiClient.post<VideoSearchResponse>(
        API_ENDPOINTS.VIDEO_HIJACK_SEARCH,
        params
      )
      return response.data
    } catch (error) {
      console.error("Video search failed:", error)
      throw error
    }
  }

  /**
   * Search YouTube videos directly via API
   */
  async searchYouTube(
    query: string,
    options: {
      maxResults?: number
      order?: "relevance" | "date" | "viewCount" | "rating"
      publishedAfter?: Date
      videoDuration?: "short" | "medium" | "long"
    } = {}
  ): Promise<YouTubeVideo[]> {
    const { maxResults = 25, order = "relevance", publishedAfter, videoDuration } = options
    
    if (!this.apiKey) {
      throw new Error("YouTube API key not configured")
    }

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
      `${API_ENDPOINTS.YOUTUBE_SEARCH}?${searchParams.toString()}`
    )
    const searchData = await searchResponse.json()
    
    if (!searchData.items?.length) return []

    // Step 2: Get video details (stats)
    const videoIds = searchData.items.map((item: { id: { videoId: string } }) => item.id.videoId).join(",")
    
    const videosParams = new URLSearchParams({
      part: "snippet,statistics,contentDetails",
      id: videoIds,
      key: this.apiKey,
    })
    
    const videosResponse = await fetch(
      `${API_ENDPOINTS.YOUTUBE_VIDEOS}?${videosParams.toString()}`
    )
    const videosData = await videosResponse.json()

    // Step 3: Get channel details
    const channelIds = [...new Set(videosData.items.map(
      (item: { snippet: { channelId: string } }) => item.snippet.channelId
    ))].join(",")
    
    const channelsParams = new URLSearchParams({
      part: "snippet,statistics",
      id: channelIds,
      key: this.apiKey,
    })
    
    const channelsResponse = await fetch(
      `${API_ENDPOINTS.YOUTUBE_CHANNELS}?${channelsParams.toString()}`
    )
    const channelsData = await channelsResponse.json()
    
    const channelMap = new Map<string, { name: string; subscribers: number }>(
      channelsData.items.map((ch: {
        id: string
        snippet: { title: string }
        statistics: { subscriberCount: string }
      }) => [ch.id, {
        name: ch.snippet.title,
        subscribers: parseInt(ch.statistics.subscriberCount || "0")
      }])
    )

    // Step 4: Transform to our format
    return videosData.items.map((video: {
      id: string
      snippet: {
        title: string
        description: string
        channelId: string
        channelTitle: string
        publishedAt: string
        thumbnails: { high: { url: string; width: number; height: number } }
        tags?: string[]
      }
      statistics: {
        viewCount: string
        likeCount: string
        commentCount: string
      }
      contentDetails: {
        duration: string
      }
    }) => {
      const views = parseInt(video.statistics.viewCount || "0")
      const likes = parseInt(video.statistics.likeCount || "0")
      const comments = parseInt(video.statistics.commentCount || "0")
      const publishedDate = new Date(video.snippet.publishedAt)
      const daysOld = Math.floor((Date.now() - publishedDate.getTime()) / (1000 * 60 * 60 * 24))
      const channel = channelMap.get(video.snippet.channelId) || { name: video.snippet.channelTitle, subscribers: 0 }
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
        hijackScore: calculateHijackScore({
          views,
          likes,
          comments,
          daysOld,
          subscriberCount: channel.subscribers,
        }),
        viralPotential: calculateViralPotential(engagement, viewsPerDay),
        contentAge: getContentAge(publishedDate),
      } as YouTubeVideo
    })
  }

  /**
   * Get keyword analytics
   */
  async getKeywordAnalytics(
    keyword: string,
    platform: Platform
  ): Promise<KeywordAnalytics> {
    try {
      const response = await apiClient.get<KeywordAnalytics>(
        `${API_ENDPOINTS.VIDEO_HIJACK_ANALYTICS}?keyword=${encodeURIComponent(keyword)}&platform=${platform}`
      )
      return response.data
    } catch (error) {
      console.error("Analytics fetch failed:", error)
      throw error
    }
  }

  /**
   * Get video creation suggestions
   */
  async getSuggestions(keyword: string): Promise<VideoSuggestions> {
    try {
      const response = await apiClient.get<VideoSuggestions>(
        `${API_ENDPOINTS.VIDEO_HIJACK_SUGGESTIONS}?keyword=${encodeURIComponent(keyword)}`
      )
      return response.data
    } catch (error) {
      console.error("Suggestions fetch failed:", error)
      throw error
    }
  }

  /**
   * Export results to CSV
   */
  exportToCSV(
    videos: (YouTubeVideo | TikTokVideo)[],
    platform: Platform,
    filename: string
  ): void {
    const headers = platform === "youtube"
      ? ["Title", "Channel", "Subscribers", "Views", "Likes", "Comments", "Engagement %", "Hijack Score", "Viral Potential", "Content Age", "Duration", "Published", "URL", "Tags"]
      : ["Description", "Creator", "Followers", "Views", "Likes", "Shares", "Comments", "Engagement %", "Hijack Score", "Viral Potential", "Duration", "Published", "URL", "Hashtags"]
    
    const rows = videos.map(video => {
      if (platform === "youtube") {
        const v = video as YouTubeVideo
        return [
          `"${v.title.replace(/"/g, '""')}"`,
          v.channel.name,
          v.channel.subscribers,
          v.stats.views,
          v.stats.likes,
          v.stats.comments,
          v.stats.engagement.toFixed(2),
          v.hijackScore,
          v.viralPotential,
          v.contentAge,
          v.duration,
          v.publishedAt,
          v.url,
          `"${v.tags.join(", ")}"`,
        ].join(",")
      } else {
        const v = video as TikTokVideo
        return [
          `"${v.description.replace(/"/g, '""').slice(0, 100)}"`,
          v.creator.username,
          v.creator.followers,
          v.stats.views,
          v.stats.likes,
          v.stats.shares,
          v.stats.comments,
          v.stats.engagement.toFixed(2),
          v.hijackScore,
          v.viralPotential,
          v.duration,
          v.publishedAt,
          v.url,
          `"${v.hashtags.join(", ")}"`,
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
export const videoHijackService = new VideoHijackService()

// Export class for testing
export { VideoHijackService }
