// ============================================
// VIDEO HIJACK - YouTube Utilities
// ============================================

import type { YouTubeVideoResult } from "../types/youtube.types"
import type { ViralPotential, ContentAge } from "../types/common.types"

/**
 * Format YouTube ISO 8601 duration (PT1H2M30S) to readable format (1:02:30)
 */
export function formatDuration(duration: string): string {
  if (!duration || !duration.startsWith("PT")) return "0:00"
  
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
  if (!match) return "0:00"
  
  const hours = parseInt(match[1] || "0")
  const minutes = parseInt(match[2] || "0")
  const seconds = parseInt(match[3] || "0")
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
  }
  return `${minutes}:${seconds.toString().padStart(2, "0")}`
}

/**
 * Format YouTube subscriber count
 */
export function formatSubscribers(count: number): string {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`
  return count.toString()
}

/**
 * Format YouTube view count
 */
export function formatYouTubeViews(views: number): string {
  if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`
  if (views >= 1000) return `${(views / 1000).toFixed(1)}K`
  return views.toString()
}

/**
 * Get YouTube video URL
 */
export function getYouTubeVideoUrl(videoId: string): string {
  return `https://youtube.com/watch?v=${videoId}`
}

/**
 * Get YouTube channel URL
 */
export function getYouTubeChannelUrl(channelId: string): string {
  return `https://youtube.com/channel/${channelId}`
}

/**
 * Get hijack score color for YouTube
 */
export function getYouTubeHijackScoreColor(score: number): string {
  if (score >= 80) return "text-emerald-500"
  if (score >= 60) return "text-amber-500"
  return "text-red-500"
}

/**
 * Get hijack score background for YouTube
 */
export function getYouTubeHijackScoreBg(score: number): string {
  if (score >= 80) return "bg-emerald-500"
  if (score >= 60) return "bg-amber-500"
  return "bg-red-500"
}

/**
 * Get viral potential color for YouTube
 */
export function getYouTubeViralPotentialColor(potential: ViralPotential): string {
  switch (potential) {
    case "high": return "text-emerald-500 bg-emerald-500/10"
    case "medium": return "text-amber-500 bg-amber-500/10"
    case "low": return "text-slate-500 bg-slate-500/10"
    default: return "text-muted-foreground"
  }
}

/**
 * Get content age color for YouTube
 */
export function getYouTubeContentAgeColor(age: ContentAge): string {
  switch (age) {
    case "fresh": return "text-emerald-500"
    case "aging": return "text-amber-500"
    case "outdated": return "text-red-500"
    default: return "text-muted-foreground"
  }
}

/**
 * Format YouTube duration for display
 */
export function formatYouTubeDuration(duration: string): string {
  // Use the main formatDuration function
  return formatDuration(duration)
}

/**
 * Sort YouTube results by option
 */
export function sortYouTubeResults(
  results: YouTubeVideoResult[],
  sortBy: "hijackScore" | "views" | "engagement" | "recent"
): YouTubeVideoResult[] {
  const sorted = [...results]
  switch (sortBy) {
    case "hijackScore":
      return sorted.sort((a, b) => b.hijackScore - a.hijackScore)
    case "views":
      return sorted.sort((a, b) => b.views - a.views)
    case "engagement":
      return sorted.sort((a, b) => b.engagement - a.engagement)
    case "recent":
      return sorted.sort(
        (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      )
    default:
      return sorted
  }
}

/**
 * Filter YouTube results
 */
export function filterYouTubeResults(
  results: YouTubeVideoResult[],
  options: {
    minViews?: number
    maxViews?: number
    minHijackScore?: number
    viralPotential?: ViralPotential[]
    contentAge?: ContentAge[]
  }
): YouTubeVideoResult[] {
  let filtered = [...results]

  if (options.minViews !== undefined) {
    filtered = filtered.filter((r) => r.views >= options.minViews!)
  }
  if (options.maxViews !== undefined) {
    filtered = filtered.filter((r) => r.views <= options.maxViews!)
  }
  if (options.minHijackScore !== undefined) {
    filtered = filtered.filter((r) => r.hijackScore >= options.minHijackScore!)
  }
  if (options.viralPotential?.length) {
    filtered = filtered.filter((r) => options.viralPotential!.includes(r.viralPotential))
  }
  if (options.contentAge?.length) {
    filtered = filtered.filter((r) => options.contentAge!.includes(r.contentAge))
  }

  return filtered
}

/**
 * Generate YouTube video title suggestions
 */
export function generateYouTubeTitleSuggestions(keyword: string): string[] {
  const year = new Date().getFullYear()
  return [
    `${keyword} - Complete Beginner's Guide [${year}]`,
    `How to ${keyword} in 10 Minutes (Step by Step)`,
    `${keyword} Tutorial: Everything You Need to Know`,
    `I Tried ${keyword} for 30 Days - Here's What Happened`,
    `${keyword} Explained Simply | No BS Guide`,
    `Top 10 ${keyword} Tips You Need to Know`,
    `${keyword} for Beginners | Ultimate ${year} Guide`,
  ]
}

/**
 * Generate YouTube tag suggestions
 */
export function generateYouTubeTagSuggestions(keyword: string): string[] {
  return [
    keyword.toLowerCase(),
    `${keyword} tutorial`,
    `${keyword} guide`,
    `how to ${keyword}`,
    `${keyword} for beginners`,
    `${keyword} tips`,
    `${keyword} ${new Date().getFullYear()}`,
    `learn ${keyword}`,
    `${keyword} explained`,
    `best ${keyword}`,
  ]
}
