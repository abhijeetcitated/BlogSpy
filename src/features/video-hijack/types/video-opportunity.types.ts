// ============================================
// VIDEO HIJACK INDICATOR - TYPES
// ============================================
// Detects keywords where video carousel steals clicks
// Shows opportunity score for video content creation
// ============================================

/**
 * Video presence status in SERP
 */
export type VideoPresence = "dominant" | "significant" | "moderate" | "minimal" | "none"

/**
 * Video source platform
 */
export type VideoPlatform = "youtube" | "tiktok" | "vimeo" | "instagram" | "other"

/**
 * Video opportunity level
 */
export type VideoOpportunityLevel = "high" | "medium" | "low" | "none"

/**
 * Video SERP position data
 */
export interface VideoSerpPosition {
  position: number // Where video carousel appears (1-10)
  aboveTheFold: boolean // Whether visible without scrolling
  carouselSize: number // Number of videos in carousel
}

/**
 * Competing video in SERP
 */
export interface CompetingVideo {
  id: string
  title: string
  channel: string
  channelSubscribers: number
  platform: VideoPlatform
  views: number
  duration: string // e.g., "12:34"
  publishDate: string
  thumbnailUrl?: string
  videoUrl: string
  position: number // Position within carousel
  hasOwnSiteVideo: boolean // If this is user's own video
}

/**
 * Keyword with video hijack analysis
 */
export interface VideoHijackKeyword {
  id: string
  keyword: string
  searchVolume: number
  currentRank?: number
  videoPresence: VideoPresence
  serpPosition: VideoSerpPosition
  hijackScore: number // 0-100, how much video steals clicks
  opportunityScore: number // 0-100, opportunity for video creation
  opportunityLevel: VideoOpportunityLevel
  competingVideos: CompetingVideo[]
  estimatedClicksLost: number // Monthly clicks lost to video
  hasOwnVideo: boolean // If user already has video ranking
  difficulty: number // 1-100, how hard to rank video
  intent: "informational" | "commercial" | "transactional" | "navigational"
  trend: "up" | "down" | "stable"
  lastChecked: string
}

/**
 * Video hijack summary statistics
 */
export interface VideoHijackSummary {
  totalKeywords: number
  keywordsWithVideo: number
  highHijackCount: number
  significantHijackCount: number
  totalClicksLost: number
  avgHijackScore: number
  topOpportunities: number
  hasOwnVideoCount: number
}

/**
 * Full video hijack analysis result
 */
export interface VideoHijackAnalysis {
  summary: VideoHijackSummary
  keywords: VideoHijackKeyword[]
  topOpportunityKeywords: VideoHijackKeyword[]
  dominantChannels: { channel: string; count: number; avgPosition: number }[]
  lastAnalyzed: string
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get color class for video presence
 */
export function getPresenceColor(presence: VideoPresence): string {
  switch (presence) {
    case "dominant":
      return "text-red-500"
    case "significant":
      return "text-orange-500"
    case "moderate":
      return "text-yellow-500"
    case "minimal":
      return "text-blue-500"
    case "none":
      return "text-gray-500"
    default:
      return "text-gray-500"
  }
}

/**
 * Get background color class for video presence
 */
export function getPresenceBgColor(presence: VideoPresence): string {
  switch (presence) {
    case "dominant":
      return "bg-red-500/10"
    case "significant":
      return "bg-orange-500/10"
    case "moderate":
      return "bg-yellow-500/10"
    case "minimal":
      return "bg-blue-500/10"
    case "none":
      return "bg-gray-500/10"
    default:
      return "bg-gray-500/10"
  }
}

/**
 * Get label for video presence
 */
export function getPresenceLabel(presence: VideoPresence): string {
  switch (presence) {
    case "dominant":
      return "Dominant"
    case "significant":
      return "Significant"
    case "moderate":
      return "Moderate"
    case "minimal":
      return "Minimal"
    case "none":
      return "None"
    default:
      return "Unknown"
  }
}

/**
 * Get color for opportunity level
 */
export function getVideoOpportunityColor(level: VideoOpportunityLevel): string {
  switch (level) {
    case "high":
      return "text-emerald-500"
    case "medium":
      return "text-yellow-500"
    case "low":
      return "text-orange-500"
    case "none":
      return "text-gray-500"
    default:
      return "text-gray-500"
  }
}

/**
 * Get background color for opportunity level
 */
export function getOpportunityBgColor(level: VideoOpportunityLevel): string {
  switch (level) {
    case "high":
      return "bg-emerald-500/10"
    case "medium":
      return "bg-yellow-500/10"
    case "low":
      return "bg-orange-500/10"
    case "none":
      return "bg-gray-500/10"
    default:
      return "bg-gray-500/10"
  }
}

/**
 * Get platform icon/color
 */
export function getPlatformColor(platform: VideoPlatform): string {
  switch (platform) {
    case "youtube":
      return "text-red-500"
    case "tiktok":
      return "text-cyan-400"
    case "vimeo":
      return "text-blue-500"
    case "instagram":
      return "text-pink-500"
    default:
      return "text-gray-500"
  }
}

/**
 * Calculate hijack score based on video position and presence
 */
export function calculateHijackScore(
  serpPosition: VideoSerpPosition,
  presence: VideoPresence
): number {
  let score = 0

  // Position impact (1-3 = high impact, 4-6 = medium, 7-10 = low)
  if (serpPosition.position <= 3) {
    score += 40
  } else if (serpPosition.position <= 6) {
    score += 25
  } else {
    score += 10
  }

  // Above the fold bonus
  if (serpPosition.aboveTheFold) {
    score += 20
  }

  // Carousel size impact
  if (serpPosition.carouselSize >= 5) {
    score += 20
  } else if (serpPosition.carouselSize >= 3) {
    score += 10
  }

  // Presence level impact
  switch (presence) {
    case "dominant":
      score += 20
      break
    case "significant":
      score += 15
      break
    case "moderate":
      score += 10
      break
    case "minimal":
      score += 5
      break
    default:
      break
  }

  return Math.min(score, 100)
}

/**
 * Determine opportunity level from score
 */
export function getOpportunityLevelFromScore(score: number): VideoOpportunityLevel {
  if (score >= 70) return "high"
  if (score >= 50) return "medium"
  if (score >= 30) return "low"
  return "none"
}

/**
 * Format view count
 */
export function formatViews(views: number): string {
  if (views >= 1000000) {
    return `${(views / 1000000).toFixed(1)}M`
  }
  if (views >= 1000) {
    return `${(views / 1000).toFixed(1)}K`
  }
  return views.toString()
}

/**
 * Get hijack score color
 */
export function getHijackScoreColor(score: number): string {
  if (score >= 70) return "text-red-500"
  if (score >= 50) return "text-orange-500"
  if (score >= 30) return "text-yellow-500"
  return "text-emerald-500"
}

/**
 * Get hijack score background color
 */
export function getHijackScoreBgColor(score: number): string {
  if (score >= 70) return "bg-red-500"
  if (score >= 50) return "bg-orange-500"
  if (score >= 30) return "bg-yellow-500"
  return "bg-emerald-500"
}
