// ============================================
// VIDEO HIJACK - Common/Shared Types
// ============================================

/**
 * Platform Types
 */
export type Platform = "youtube" | "tiktok"
export type SearchMode = "domain" | "keyword"
export type SortOption = "views" | "engagement" | "recent" | "hijackScore" | "opportunity" | "likes"

/**
 * Score & Status Types
 */
export type ViralPotential = "low" | "medium" | "high"
export type ContentAge = "fresh" | "aging" | "outdated"
export type Seasonality = "evergreen" | "seasonal" | "trending"
export type VolumeTrend = "up" | "stable" | "down"
export type Competition = "low" | "medium" | "high"
export type Difficulty = "easy" | "medium" | "hard"

/**
 * Video Presence (for SERP analysis)
 */
export type VideoPresence = "dominant" | "significant" | "moderate" | "minimal" | "none"
export type VideoOpportunityLevel = "high" | "medium" | "low" | "none"
export type VideoTrend = "up" | "down" | "stable"
export type VideoIntent = "informational" | "commercial" | "transactional" | "navigational"

/**
 * Sorting Types
 */
export type SortByOption = "hijackScore" | "opportunityScore" | "volume" | "clicksLost"
export type SortOrder = "asc" | "desc"

/**
 * Content Type Distribution
 */
export interface ContentTypeDistribution {
  type: string
  percentage: number
}

/**
 * Audience Age Distribution
 */
export interface AudienceAgeDistribution {
  range: string
  percentage: number
}

/**
 * Top Channel/Creator
 */
export interface TopChannel {
  name: string
  videos: number
}

/**
 * Keyword Stats (shared for both platforms)
 */
export interface KeywordStats {
  keyword: string
  platform: Platform
  totalVideos: number
  totalViews: number
  avgViews: number
  avgEngagement: number
  topChannels: TopChannel[]
  trendScore: number
  competition: Competition
  hijackOpportunity: number
  monetizationScore: number
  seasonality: Seasonality
  avgVideoLength: string
  bestUploadDay: string
  bestUploadTime: string
  searchVolume: number
  volumeTrend: VolumeTrend
  contentTypes: ContentTypeDistribution[]
  audienceAge: AudienceAgeDistribution[]
}

/**
 * Video Suggestion (shared)
 */
export interface VideoSuggestion {
  titleFormats: string[]
  recommendedTags: string[]
  recommendedHashtags: string[]
  optimalLength: { youtube: string; tiktok: string }
  contentGaps: string[]
  bestTimeToPost: string
  difficulty: Difficulty
}

/**
 * Video SERP Position
 */
export interface VideoSerpPosition {
  position: number
  aboveTheFold: boolean
  carouselSize: number
}

/**
 * Filter State
 */
export interface FilterState {
  searchQuery: string
  sortBy: SortByOption
  sortOrder: SortOrder
  presenceFilter: VideoPresence[]
  opportunityFilter: VideoOpportunityLevel[]
  showOnlyWithoutVideo: boolean
}

/**
 * Video ROI Calculation
 */
export interface VideoROI {
  potentialViews: number
  estimatedValue: number
  timeToRank: string
}

/**
 * Base Video Result (common fields)
 */
export interface BaseVideoResult {
  id: string
  url: string
  views: number
  likes: number
  comments: number
  publishedAt: string
  duration: string
  engagement: number
  engagementRate: number
  hijackScore: number
  viralPotential: ViralPotential
}

/**
 * Search Parameters
 */
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

/**
 * Pagination
 */
export interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

/**
 * API Response Meta
 */
export interface ApiResponseMeta {
  searchId: string
  timestamp: Date
  processingTime: number
}
