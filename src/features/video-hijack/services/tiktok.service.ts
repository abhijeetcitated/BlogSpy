// ============================================
// VIDEO HIJACK - TikTok Service
// ============================================
// Handles all TikTok API calls (via RapidAPI/Apify)
// ============================================

import type {
  TikTokVideo,
  TikTokSearchOptions,
  TikTokRawVideo,
  TikTokKeywordAnalytics,
  TikTokHashtag,
  TikTokTrendingSound,
} from "../types/tiktok.types"
import type { ViralPotential } from "../types/common.types"

// API Endpoints (via internal API routes)
const TIKTOK_API = {
  SEARCH: "/api/v1/video-hijack/tiktok/search",
  VIDEO: "/api/v1/video-hijack/tiktok/video",
  HASHTAG: "/api/v1/video-hijack/tiktok/hashtag",
  TRENDING: "/api/v1/video-hijack/tiktok/trending",
}

// ============================================
// Helper Functions
// ============================================

/**
 * Calculate hijack score for TikTok video
 * Higher score = easier to outrank
 */
export function calculateTikTokHijackScore(video: {
  views: number
  likes: number
  shares: number
  comments: number
  daysOld: number
  followerCount: number
}): number {
  const { views, likes, shares, comments, daysOld, followerCount } = video

  // Engagement rate (TikTok has higher engagement typically)
  const engagementRate = views > 0 ? ((likes + shares + comments) / views) * 100 : 0
  const engagementScore = Math.max(0, 100 - engagementRate * 5) // Less penalty than YouTube

  // Age factor (TikTok content ages faster)
  const ageScore = Math.min(100, daysOld / 1.825) // Max at 6 months

  // Follower factor (lower = easier to hijack)
  const followerScore = Math.max(0, 100 - followerCount / 50000)

  // Viral velocity (TikTok is more viral-dependent)
  const viewsPerDay = views / Math.max(1, daysOld)
  const velocityScore = Math.max(0, 100 - viewsPerDay / 500)

  // Weighted average (TikTok values engagement more)
  const score =
    engagementScore * 0.2 +
    ageScore * 0.35 +
    followerScore * 0.2 +
    velocityScore * 0.25

  return Math.round(Math.max(0, Math.min(100, score)))
}

/**
 * Determine viral potential for TikTok
 */
export function calculateTikTokViralPotential(
  engagement: number,
  viewsPerDay: number,
  soundTrending: boolean
): ViralPotential {
  let score = engagement * 8 + viewsPerDay / 500
  if (soundTrending) score += 20 // Trending sound bonus
  
  if (score > 60) return "high"
  if (score > 25) return "medium"
  return "low"
}

/**
 * Format large numbers
 */
export function formatTikTokNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
  return num.toString()
}

/**
 * Format TikTok duration
 */
export function formatTikTokDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, "0")}`
}

/**
 * Transform raw TikTok video to our format
 */
function transformTikTokVideo(raw: TikTokRawVideo): TikTokVideo {
  const views = raw.stats.playCount
  const likes = raw.stats.diggCount
  const shares = raw.stats.shareCount
  const comments = raw.stats.commentCount
  const daysOld = Math.floor((Date.now() / 1000 - raw.createTime) / 86400)
  const engagement = views > 0 ? ((likes + shares + comments) / views) * 100 : 0
  const viewsPerDay = daysOld > 0 ? views / daysOld : views
  
  // Check if sound might be trending (placeholder logic)
  const soundTrending = raw.music?.title ? raw.music.title.length < 30 : false

  return {
    id: raw.id,
    videoId: raw.id,
    description: raw.desc,
    creator: {
      id: raw.author.id,
      username: raw.author.uniqueId,
      nickname: raw.author.nickname,
      url: `https://tiktok.com/@${raw.author.uniqueId}`,
      followers: raw.author.followerCount,
      followersFormatted: formatTikTokNumber(raw.author.followerCount),
      verified: raw.author.verified,
    },
    stats: {
      views,
      likes,
      shares,
      comments,
      engagement,
    },
    duration: formatTikTokDuration(raw.video.duration),
    durationSeconds: raw.video.duration,
    publishedAt: new Date(raw.createTime * 1000).toISOString(),
    url: `https://tiktok.com/@${raw.author.uniqueId}/video/${raw.id}`,
    hashtags: raw.challenges?.map((c) => c.title) || [],
    sound: {
      id: raw.music?.id || "",
      name: raw.music?.title || "Original Sound",
      author: raw.music?.authorName || raw.author.nickname,
      isTrending: soundTrending,
    },
    hijackScore: calculateTikTokHijackScore({
      views,
      likes,
      shares,
      comments,
      daysOld,
      followerCount: raw.author.followerCount,
    }),
    viralPotential: calculateTikTokViralPotential(engagement, viewsPerDay, soundTrending),
  }
}

// ============================================
// TikTok Service Class
// ============================================

class TikTokService {
  private apiKey: string | null = null

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_TIKTOK_API_KEY || null
  }

  /**
   * Check if API key is configured
   */
  isConfigured(): boolean {
    return !!this.apiKey
  }

  /**
   * Search TikTok videos
   */
  async searchVideos(
    query: string,
    options: TikTokSearchOptions = {}
  ): Promise<TikTokVideo[]> {
    const { maxResults = 25, sortBy = "relevance" } = options

    try {
      const response = await fetch(TIKTOK_API.SEARCH, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query,
          maxResults,
          sortBy,
          publishedAfter: options.publishedAfter?.toISOString(),
        }),
      })

      if (!response.ok) {
        throw new Error(`TikTok search failed: ${response.statusText}`)
      }

      const data = await response.json()

      if (!data.success || !data.data?.length) {
        return []
      }

      return data.data.map((raw: TikTokRawVideo) => transformTikTokVideo(raw))
    } catch (error) {
      console.error("TikTok search error:", error)
      throw error
    }
  }

  /**
   * Get video by ID
   */
  async getVideo(videoId: string): Promise<TikTokVideo | null> {
    try {
      const response = await fetch(`${TIKTOK_API.VIDEO}?id=${videoId}`)

      if (!response.ok) {
        throw new Error(`TikTok get video failed: ${response.statusText}`)
      }

      const data = await response.json()

      if (!data.success || !data.data) {
        return null
      }

      return transformTikTokVideo(data.data)
    } catch (error) {
      console.error("TikTok get video error:", error)
      throw error
    }
  }

  /**
   * Get hashtag data
   */
  async getHashtag(hashtag: string): Promise<TikTokHashtag | null> {
    try {
      const response = await fetch(
        `${TIKTOK_API.HASHTAG}?tag=${encodeURIComponent(hashtag)}`
      )

      if (!response.ok) {
        return null
      }

      const data = await response.json()
      return data.success ? data.data : null
    } catch (error) {
      console.error("TikTok hashtag error:", error)
      return null
    }
  }

  /**
   * Get trending sounds
   */
  async getTrendingSounds(): Promise<TikTokTrendingSound[]> {
    try {
      const response = await fetch(TIKTOK_API.TRENDING)

      if (!response.ok) {
        return []
      }

      const data = await response.json()
      return data.success ? data.data : []
    } catch (error) {
      console.error("TikTok trending sounds error:", error)
      return []
    }
  }

  /**
   * Get keyword analytics
   */
  async getKeywordAnalytics(keyword: string): Promise<TikTokKeywordAnalytics> {
    const videos = await this.searchVideos(keyword, { maxResults: 50 })

    const totalViews = videos.reduce((sum, v) => sum + v.stats.views, 0)
    const avgViews = videos.length > 0 ? totalViews / videos.length : 0
    const avgEngagement =
      videos.length > 0
        ? videos.reduce((sum, v) => sum + v.stats.engagement, 0) / videos.length
        : 0

    // Count videos per creator
    const creatorCounts = new Map<
      string,
      { videos: number; followers: number }
    >()
    videos.forEach((v) => {
      const existing = creatorCounts.get(v.creator.username) || {
        videos: 0,
        followers: v.creator.followers,
      }
      creatorCounts.set(v.creator.username, {
        videos: existing.videos + 1,
        followers: v.creator.followers,
      })
    })

    const topCreators = Array.from(creatorCounts.entries())
      .map(([username, data]) => ({ username, ...data }))
      .sort((a, b) => b.videos - a.videos)
      .slice(0, 5)

    // Get trending hashtags from videos
    const hashtagCounts = new Map<string, number>()
    videos.forEach((v) => {
      v.hashtags.forEach((tag) => {
        hashtagCounts.set(tag, (hashtagCounts.get(tag) || 0) + 1)
      })
    })
    const trendingHashtags = Array.from(hashtagCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([tag]) => tag)

    // Get trending sounds
    const soundCounts = new Map<string, { name: string; author: string; count: number }>()
    videos.forEach((v) => {
      if (v.sound.name) {
        const existing = soundCounts.get(v.sound.id) || {
          name: v.sound.name,
          author: v.sound.author,
          count: 0,
        }
        soundCounts.set(v.sound.id, { ...existing, count: existing.count + 1 })
      }
    })
    const trendingSounds = Array.from(soundCounts.entries())
      .map(([id, data]) => ({
        id,
        name: data.name,
        author: data.author,
        videoCount: data.count,
        isTrending: data.count >= 3,
      }))
      .sort((a, b) => b.videoCount - a.videoCount)
      .slice(0, 5)

    const avgHijackScore =
      videos.length > 0
        ? videos.reduce((sum, v) => sum + v.hijackScore, 0) / videos.length
        : 0

    const viralScore =
      videos.length > 0
        ? videos.filter((v) => v.viralPotential === "high").length / videos.length * 100
        : 0

    return {
      keyword,
      totalVideos: videos.length,
      totalViews,
      avgViews,
      avgEngagement,
      topCreators,
      trendingHashtags,
      trendingSounds,
      competition:
        avgHijackScore < 40 ? "high" : avgHijackScore < 60 ? "medium" : "low",
      viralScore: Math.round(viralScore),
      hijackOpportunity: Math.round(avgHijackScore),
    }
  }

  /**
   * Export TikTok results to CSV
   * Accepts both TikTokVideo[] (from API) or TikTokVideoResult[] (from components)
   */
  exportToCSV(videos: TikTokVideo[] | import("../types/tiktok.types").TikTokVideoResult[], filename: string): void {
    const headers = [
      "Description",
      "Creator",
      "Followers",
      "Views",
      "Likes",
      "Shares",
      "Comments",
      "Engagement %",
      "Hijack Score",
      "Viral Potential",
      "Duration",
      "Published",
      "URL",
      "Hashtags",
    ]

    const rows = videos.map((v) => {
      // Handle both TikTokVideo and TikTokVideoResult formats
      const isTikTokVideo = "creator" in v && "stats" in v
      
      if (isTikTokVideo) {
        const video = v as TikTokVideo
        return [
          `"${video.description.replace(/"/g, '""').slice(0, 100)}"`,
          video.creator.username,
          video.creator.followers,
          video.stats.views,
          video.stats.likes,
          video.stats.shares,
          video.stats.comments,
          video.stats.engagement.toFixed(2),
          video.hijackScore,
          video.viralPotential,
          video.duration,
          video.publishedAt,
          video.url,
          `"${video.hashtags.join(", ")}"`,
        ].join(",")
      } else {
        const result = v as import("../types/tiktok.types").TikTokVideoResult
        return [
          `"${(result.caption || "").replace(/"/g, '""').slice(0, 100)}"`,
          result.creatorUsername,
          result.creatorFollowers,
          result.views,
          result.likes,
          result.shares,
          result.comments,
          result.engagement.toFixed(2),
          result.hijackScore,
          result.viralPotential,
          result.duration,
          result.publishedAt,
          result.url,
          `"${(result.hashtags || []).join(", ")}"`,
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
export const tiktokService = new TikTokService()

// Export class for testing
export { TikTokService }
