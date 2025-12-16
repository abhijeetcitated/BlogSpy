// Video Hijack Utility Functions

import { HIJACK_SCORE_THRESHOLDS, HIJACK_SCORE_COLORS } from "../constants"
import type { 
  VideoPresence, 
  VideoOpportunityLevel, 
  VideoPlatform, 
  VideoHijackKeyword,
  VideoSerpPosition,
  SortByOption,
  SortOrder,
  VideoROI 
} from "../types"

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

export function getOpportunityColor(level: VideoOpportunityLevel): string {
  switch (level) {
    case "high": return "text-emerald-500"
    case "medium": return "text-yellow-500"
    case "low": return "text-orange-500"
    case "none": return "text-gray-500"
    default: return "text-gray-500"
  }
}

export function getOpportunityBgColor(level: VideoOpportunityLevel): string {
  switch (level) {
    case "high": return "bg-emerald-500/10"
    case "medium": return "bg-yellow-500/10"
    case "low": return "bg-orange-500/10"
    case "none": return "bg-gray-500/10"
    default: return "bg-gray-500/10"
  }
}

export function getOpportunityLevelFromScore(score: number): VideoOpportunityLevel {
  if (score >= 70) return "high"
  if (score >= 50) return "medium"
  if (score >= 30) return "low"
  return "none"
}

// ============================================
// PLATFORM HELPERS
// ============================================

export function getPlatformColor(platform: VideoPlatform): string {
  switch (platform) {
    case "youtube": return "text-red-500"
    case "tiktok": return "text-cyan-400"
    case "vimeo": return "text-blue-500"
    case "instagram": return "text-pink-500"
    default: return "text-gray-500"
  }
}

// ============================================
// HIJACK SCORE HELPERS
// ============================================

export function getHijackScoreColor(score: number): string {
  if (score >= HIJACK_SCORE_THRESHOLDS.high) return "text-red-500"
  if (score >= HIJACK_SCORE_THRESHOLDS.medium) return "text-orange-500"
  if (score >= HIJACK_SCORE_THRESHOLDS.low) return "text-yellow-500"
  return "text-emerald-500"
}

export function getHijackScoreRingColor(score: number): string {
  if (score >= HIJACK_SCORE_THRESHOLDS.high) return HIJACK_SCORE_COLORS.high
  if (score >= HIJACK_SCORE_THRESHOLDS.medium) return HIJACK_SCORE_COLORS.medium
  if (score >= HIJACK_SCORE_THRESHOLDS.low) return HIJACK_SCORE_COLORS.low
  return HIJACK_SCORE_COLORS.safe
}

export function calculateHijackScore(serpPosition: VideoSerpPosition, presence: VideoPresence): number {
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
// FORMAT HELPERS
// ============================================

export function formatViews(views: number): string {
  if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`
  if (views >= 1000) return `${(views / 1000).toFixed(1)}K`
  return views.toString()
}

export function getTrendColor(trend: "up" | "down" | "stable"): string {
  switch (trend) {
    case "up": return "text-emerald-500"
    case "down": return "text-red-500"
    case "stable": return "text-gray-500"
  }
}

// ============================================
// SORTING & FILTERING
// ============================================

export function sortKeywords(
  keywords: VideoHijackKeyword[],
  sortBy: SortByOption,
  sortOrder: SortOrder
): VideoHijackKeyword[] {
  return [...keywords].sort((a, b) => {
    let comparison = 0
    switch (sortBy) {
      case "hijackScore":
        comparison = a.hijackScore - b.hijackScore
        break
      case "opportunityScore":
        comparison = a.opportunityScore - b.opportunityScore
        break
      case "volume":
        comparison = a.searchVolume - b.searchVolume
        break
      case "clicksLost":
        comparison = a.estimatedClicksLost - b.estimatedClicksLost
        break
    }
    return sortOrder === "desc" ? -comparison : comparison
  })
}

export function filterKeywords(
  keywords: VideoHijackKeyword[],
  searchQuery: string,
  presenceFilter: VideoPresence[],
  opportunityFilter: VideoOpportunityLevel[],
  showOnlyWithoutVideo: boolean
): VideoHijackKeyword[] {
  let result = keywords

  if (searchQuery) {
    const query = searchQuery.toLowerCase()
    result = result.filter((k) => k.keyword.toLowerCase().includes(query))
  }

  if (presenceFilter.length > 0) {
    result = result.filter((k) => presenceFilter.includes(k.videoPresence))
  }

  if (opportunityFilter.length > 0) {
    result = result.filter((k) => opportunityFilter.includes(k.opportunityLevel))
  }

  if (showOnlyWithoutVideo) {
    result = result.filter((k) => !k.hasOwnVideo)
  }

  return result
}

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

export function calculateVideoROI(keyword: VideoHijackKeyword): VideoROI {
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
// RECOMMENDATIONS
// ============================================

export function getVideoRecommendations(keyword: VideoHijackKeyword): string[] {
  const recommendations: string[] = []

  if (keyword.hasOwnVideo) {
    recommendations.push("You already have a video ranking - optimize thumbnail and title for better CTR")
    if (keyword.hijackScore >= 50) {
      recommendations.push("Consider creating additional video content to capture more carousel positions")
    }
  } else {
    if (keyword.opportunityLevel === "high") {
      recommendations.push("🔥 High opportunity - Create video content to capture this traffic")
      recommendations.push("Focus on tutorial/how-to format for informational queries")
    }
    if (keyword.serpPosition.position <= 3) {
      recommendations.push("Video appears early in SERP - prioritize this keyword for video creation")
    }
    if (keyword.estimatedClicksLost > 500) {
      recommendations.push(`Potential to recover ${keyword.estimatedClicksLost.toLocaleString()} monthly clicks`)
    }
  }

  if (keyword.competingVideos.length > 0) {
    const avgViews = keyword.competingVideos.reduce((sum, v) => sum + v.views, 0) / keyword.competingVideos.length
    if (avgViews < 50000) {
      recommendations.push("Competition is relatively weak - good time to enter")
    }
    
    const topChannel = keyword.competingVideos[0]?.channel
    if (topChannel) {
      recommendations.push(`Study ${topChannel}'s video strategy for this topic`)
    }
  }

  if (keyword.difficulty < 40) {
    recommendations.push("Low video ranking difficulty - easier to compete")
  }

  return recommendations.slice(0, 4)
}
