// ============================================
// VIDEO HIJACK - TikTok Utilities
// ============================================

import type { TikTokVideoResult } from "../types/tiktok.types"
import type { ViralPotential } from "../types/common.types"

/**
 * Format TikTok video duration (seconds to MM:SS)
 */
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, "0")}`
}

/**
 * Format TikTok followers count
 */
export function formatFollowers(count: number): string {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`
  return count.toString()
}

/**
 * Format TikTok view count
 */
export function formatTikTokViews(views: number): string {
  if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`
  if (views >= 1000) return `${(views / 1000).toFixed(1)}K`
  return views.toString()
}

/**
 * Get TikTok profile URL
 */
export function getTikTokProfileUrl(username: string): string {
  return `https://tiktok.com/@${username}`
}

/**
 * Get hijack score color for TikTok
 */
export function getTikTokHijackScoreColor(score: number): string {
  if (score >= 80) return "text-emerald-500"
  if (score >= 60) return "text-amber-500"
  return "text-red-500"
}

/**
 * Get hijack score background for TikTok
 */
export function getTikTokHijackScoreBg(score: number): string {
  if (score >= 80) return "bg-emerald-500"
  if (score >= 60) return "bg-amber-500"
  return "bg-red-500"
}

/**
 * Get viral potential color for TikTok
 */
export function getTikTokViralPotentialColor(potential: ViralPotential): string {
  switch (potential) {
    case "high": return "text-emerald-500 bg-emerald-500/10"
    case "medium": return "text-amber-500 bg-amber-500/10"
    case "low": return "text-slate-500 bg-slate-500/10"
    default: return "text-muted-foreground"
  }
}

/**
 * Get sound trending badge color
 */
export function getTikTokSoundTrendingColor(isTrending: boolean): string {
  return isTrending 
    ? "text-pink-500 bg-pink-500/10" 
    : "text-muted-foreground bg-muted/30"
}

/**
 * Get TikTok creator URL
 */
export function getTikTokCreatorUrl(username: string): string {
  return `https://tiktok.com/@${username}`
}

/**
 * Get TikTok video URL
 */
export function getTikTokVideoUrl(username: string, videoId: string): string {
  return `https://tiktok.com/@${username}/video/${videoId}`
}

/**
 * Sort TikTok results by option
 */
export function sortTikTokResults(
  results: TikTokVideoResult[],
  sortBy: "hijackScore" | "views" | "engagement" | "recent"
): TikTokVideoResult[] {
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
 * Filter TikTok results
 */
export function filterTikTokResults(
  results: TikTokVideoResult[],
  options: {
    minViews?: number
    maxViews?: number
    minHijackScore?: number
    viralPotential?: ViralPotential[]
    soundTrending?: boolean
  }
): TikTokVideoResult[] {
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
  if (options.soundTrending !== undefined) {
    filtered = filtered.filter((r) => r.soundTrending === options.soundTrending)
  }

  return filtered
}

/**
 * Generate TikTok hashtag suggestions
 */
export function generateTikTokHashtags(keyword: string): string[] {
  const cleanKeyword = keyword.replace(/\s+/g, "").toLowerCase()
  return [
    cleanKeyword,
    `${cleanKeyword}tips`,
    `${cleanKeyword}tutorial`,
    `${cleanKeyword}hack`,
    "viral",
    "fyp",
    "foryou",
    "trending",
    "learnontiktok",
    "tiktokteaches",
  ]
}

/**
 * Generate TikTok caption suggestions
 */
export function generateTikTokCaptionSuggestions(keyword: string): string[] {
  return [
    `${keyword} tips you NEED to know 🔥 #${keyword.replace(/\s+/g, "")} #viral`,
    `This ${keyword} hack changed everything 🤯 #fyp`,
    `POV: you finally learned ${keyword} 📚 #learnontiktok`,
    `Wait for it... best ${keyword} tip ever! #trending`,
    `Replying to @user: how I learned ${keyword} in 1 day 💡`,
  ]
}

/**
 * Get optimal TikTok video length recommendation
 */
export function getTikTokOptimalLength(): { min: number; max: number; formatted: string } {
  return {
    min: 30,
    max: 60,
    formatted: "30-60 seconds",
  }
}

/**
 * Check if hashtag is trending (placeholder)
 */
export function isTikTokHashtagTrending(hashtag: string): boolean {
  const trendingTags = [
    "fyp",
    "foryou",
    "viral",
    "trending",
    "learnontiktok",
    "tiktokteaches",
  ]
  return trendingTags.includes(hashtag.toLowerCase())
}
