// ============================================
// VIDEO HIJACK - Common/Shared Utilities
// ============================================

import { ArrowUp, ArrowDown, Minus } from "lucide-react"
import type {
  VideoPresence,
  VideoOpportunityLevel,
  VideoSerpPosition,
  SortByOption,
  VideoROI,
  Competition,
  VolumeTrend,
  Seasonality,
} from "../types/common.types"
import { HIJACK_SCORE_THRESHOLDS, HIJACK_SCORE_COLORS } from "../constants"

// ============================================
// FORMAT HELPERS
// ============================================

/**
 * Format view count to human readable format
 */
export function formatViews(views: number): string {
  if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`
  if (views >= 1000) return `${(views / 1000).toFixed(1)}K`
  return views.toString()
}

/**
 * Parse publish date string to timestamp for sorting.
 * Supports ISO dates and relative strings (e.g., "2 months ago", "5d ago").
 */
export function getPublishTimestamp(publishedAt: string): number {
  if (!publishedAt) return 0

  const parsed = Date.parse(publishedAt)
  if (!Number.isNaN(parsed)) return parsed

  const normalized = publishedAt.trim().toLowerCase()
  const longMatch = normalized.match(
    /^(\d+)\s*(minute|hour|day|week|month|year)s?\s*ago$/
  )
  const shortMatch = normalized.match(/^(\d+)\s*(m|h|d|w|mo|y)\s*ago$/)

  const unitsInMs: Record<string, number> = {
    minute: 60 * 1000,
    hour: 60 * 60 * 1000,
    day: 24 * 60 * 60 * 1000,
    week: 7 * 24 * 60 * 60 * 1000,
    month: 30 * 24 * 60 * 60 * 1000,
    year: 365 * 24 * 60 * 60 * 1000,
  }

  if (longMatch) {
    const value = parseInt(longMatch[1], 10)
    const unit = longMatch[2]
    return Date.now() - value * unitsInMs[unit]
  }

  if (shortMatch) {
    const value = parseInt(shortMatch[1], 10)
    const unitMap: Record<string, keyof typeof unitsInMs> = {
      m: "minute",
      h: "hour",
      d: "day",
      w: "week",
      mo: "month",
      y: "year",
    }
    const unit = unitMap[shortMatch[2]]
    return Date.now() - value * unitsInMs[unit]
  }

  return 0
}

/**
 * Escape CSV values safely.
 */
export function escapeCsvValue(value: string | number | null | undefined): string {
  const stringValue = String(value ?? "")
  if (/[",\n]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, "\"\"")}"`
  }
  return stringValue
}

/**
 * Format date to relative time (e.g., "2 days ago", "3 months ago")
 */
export function formatDate(dateString: string): string {
  const timestamp = getPublishTimestamp(dateString)
  if (!timestamp) return "Unknown"
  const date = new Date(timestamp)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) return "Just now"
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`
  if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} months ago`
  return `${Math.floor(diffInSeconds / 31536000)} years ago`
}

/**
 * Format date to short format (e.g., "Jan 15, 2024")
 */
export function formatDateShort(dateString: string): string {
  const timestamp = getPublishTimestamp(dateString)
  if (!timestamp) return "Unknown"
  const date = new Date(timestamp)
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

/**
 * Get engagement rate color based on percentage
 */
export function getEngagementColor(engagement: number): string {
  if (engagement >= 8) return "text-emerald-500"
  if (engagement >= 4) return "text-amber-500"
  return "text-red-500"
}

// ============================================
// PRESENCE HELPERS
// ============================================

export function getPresenceColor(presence: VideoPresence): string {
  switch (presence) {
    case "dominant": return "text-red-500"
    case "significant": return "text-orange-500"
    case "moderate": return "text-yellow-500"
    case "minimal": return "text-blue-500"
    case "none": return "text-gray-500"
    default: return "text-gray-500"
  }
}

export function getPresenceBgColor(presence: VideoPresence): string {
  switch (presence) {
    case "dominant": return "bg-red-500/10"
    case "significant": return "bg-orange-500/10"
    case "moderate": return "bg-yellow-500/10"
    case "minimal": return "bg-blue-500/10"
    case "none": return "bg-gray-500/10"
    default: return "bg-gray-500/10"
  }
}

export function getPresenceLabel(presence: VideoPresence): string {
  switch (presence) {
    case "dominant": return "Dominant"
    case "significant": return "Significant"
    case "moderate": return "Moderate"
    case "minimal": return "Minimal"
    case "none": return "None"
    default: return "Unknown"
  }
}

// ============================================
// OPPORTUNITY HELPERS
// ============================================

export function getOpportunityColor(levelOrScore: VideoOpportunityLevel | number): string {
  // If it's a number (score), convert to level first
  if (typeof levelOrScore === "number") {
    const level = getOpportunityLevelFromScore(levelOrScore)
    return getOpportunityColor(level)
  }
  
  switch (levelOrScore) {
    case "high": return "text-emerald-500"
    case "medium": return "text-yellow-500"
    case "low": return "text-orange-500"
    case "none": return "text-gray-500"
    default: return "text-gray-500"
  }
}

export function getOpportunityLevelFromScore(score: number): VideoOpportunityLevel {
  if (score >= 70) return "high"
  if (score >= 50) return "medium"
  if (score >= 30) return "low"
  return "none"
}

export function getOpportunityBgColor(level: VideoOpportunityLevel): string {
  switch (level) {
    case "high": return "bg-emerald-500/10"
    case "medium": return "bg-amber-500/10"
    case "low": return "bg-rose-500/10"
    default: return "bg-muted"
  }
}

// ============================================
// HIJACK SCORE HELPERS
// ============================================

export function getHijackScoreColor(score: number): string {
  if (score >= 80) return "text-emerald-500"
  if (score >= 60) return "text-amber-500"
  return "text-red-500"
}

export function getHijackScoreBg(score: number): string {
  if (score >= 80) return "bg-emerald-500"
  if (score >= 60) return "bg-amber-500"
  return "bg-red-500"
}

export function getHijackScoreRingColor(score: number): string {
  if (score >= HIJACK_SCORE_THRESHOLDS.high) return HIJACK_SCORE_COLORS.high
  if (score >= HIJACK_SCORE_THRESHOLDS.medium) return HIJACK_SCORE_COLORS.medium
  if (score >= HIJACK_SCORE_THRESHOLDS.low) return HIJACK_SCORE_COLORS.low
  return HIJACK_SCORE_COLORS.safe
}

export function calculateHijackScore(
  serpPosition: VideoSerpPosition,
  presence: VideoPresence
): number {
  let score = 0

  if (serpPosition.position <= 3) score += 40
  else if (serpPosition.position <= 6) score += 25
  else score += 10

  if (serpPosition.aboveTheFold) score += 20

  if (serpPosition.carouselSize >= 5) score += 20
  else if (serpPosition.carouselSize >= 3) score += 10

  switch (presence) {
    case "dominant": score += 20; break
    case "significant": score += 15; break
    case "moderate": score += 10; break
    case "minimal": score += 5; break
  }

  return Math.min(score, 100)
}

// ============================================
// COMPETITION HELPERS
// ============================================

export function getCompetitionColor(competition: Competition | string): string {
  switch (competition) {
    case "low": return "text-emerald-500 bg-emerald-500/10 border-emerald-500/30"
    case "medium": return "text-amber-500 bg-amber-500/10 border-amber-500/30"
    case "high": return "text-red-500 bg-red-500/10 border-red-500/30"
    default: return "text-muted-foreground"
  }
}

// ============================================
// VIRAL POTENTIAL HELPERS
// ============================================

export function getViralPotentialColor(potential: string): string {
  switch (potential) {
    case "high": return "text-emerald-500 bg-emerald-500/10"
    case "medium": return "text-amber-500 bg-amber-500/10"
    case "low": return "text-slate-500 bg-slate-500/10"
    default: return "text-muted-foreground"
  }
}

// ============================================
// CONTENT AGE HELPERS
// ============================================

export function getContentAgeColor(age: string): string {
  switch (age) {
    case "fresh": return "text-emerald-500"
    case "aging": return "text-amber-500"
    case "outdated": return "text-red-500"
    default: return "text-muted-foreground"
  }
}

// ============================================
// TREND HELPERS
// ============================================

export function getTrendColor(trend: "up" | "down" | "stable"): string {
  switch (trend) {
    case "up": return "text-emerald-500"
    case "down": return "text-red-500"
    case "stable": return "text-gray-500"
  }
}

export function getVolumeTrendIcon(trend: VolumeTrend): { icon: typeof ArrowUp; color: string } {
  switch (trend) {
    case "up": return { icon: ArrowUp, color: "text-emerald-500" }
    case "down": return { icon: ArrowDown, color: "text-red-500" }
    default: return { icon: Minus, color: "text-muted-foreground" }
  }
}

// ============================================
// SEASONALITY HELPERS
// ============================================

export function getSeasonalityLabel(seasonality: Seasonality): string {
  switch (seasonality) {
    case "evergreen": return "Evergreen"
    case "seasonal": return "Seasonal"
    case "trending": return "Trending"
    default: return "Unknown"
  }
}

export function getSeasonalityColor(seasonality: Seasonality): string {
  switch (seasonality) {
    case "evergreen": return "text-emerald-500"
    case "seasonal": return "text-blue-500"
    case "trending": return "text-orange-500"
    default: return "text-muted-foreground"
  }
}

// ============================================
// SORTING HELPERS
// ============================================

export function getSortLabel(sortBy: SortByOption): string {
  switch (sortBy) {
    case "hijackScore": return "Hijack"
    case "opportunityScore": return "Opportunity"
    case "volume": return "Volume"
    case "clicksLost": return "Clicks Lost"
  }
}

// ============================================
// ROI CALCULATION
// ============================================

export function calculateVideoROI(keyword: {
  searchVolume: number
  difficulty: number
}): VideoROI {
  const potentialViews = Math.floor(keyword.searchVolume * 0.35 * 12)
  const estimatedValue = Math.round(potentialViews * 0.02)

  let timeToRank: string
  if (keyword.difficulty < 30) timeToRank = "1-2 months"
  else if (keyword.difficulty < 50) timeToRank = "2-4 months"
  else if (keyword.difficulty < 70) timeToRank = "4-6 months"
  else timeToRank = "6+ months"

  return { potentialViews, estimatedValue, timeToRank }
}

// ============================================
// PAGINATION
// ============================================

export const ITEMS_PER_PAGE = 10

export function paginate<T>(items: T[], page: number, perPage: number = ITEMS_PER_PAGE): T[] {
  const start = (page - 1) * perPage
  return items.slice(start, start + perPage)
}

export function getTotalPages(totalItems: number, perPage: number = ITEMS_PER_PAGE): number {
  return Math.ceil(totalItems / perPage)
}
