// ============================================
// VIDEO HIJACK - Types Barrel Export
// ============================================

// Re-export platform types
export * from "./platforms"

// Re-export video search types (refactored) - this has base types
export * from "./video-search.types"

// New platform-specific types - explicitly export non-conflicting types
export type {
  BaseVideoResult,
  VideoSearchParams,
  Pagination,
  ApiResponseMeta,
  TopChannel,
  VideoSuggestion,
  VideoROI as CommonVideoROI,
} from "./common.types"

// YouTube specific types
export * from "./youtube.types"

// TikTok specific types  
export * from "./tiktok.types"

export type VideoPresence = "dominant" | "significant" | "moderate" | "minimal" | "none"
export type VideoPlatform = "youtube" | "tiktok" | "vimeo" | "instagram" | "other"
export type VideoOpportunityLevel = "high" | "medium" | "low" | "none"
export type VideoTrend = "up" | "down" | "stable"
export type VideoIntent = "informational" | "commercial" | "transactional" | "navigational"
export type SortByOption = "hijackScore" | "opportunityScore" | "volume" | "clicksLost"
export type SortOrder = "asc" | "desc"

export interface VideoSerpPosition {
  position: number
  aboveTheFold: boolean
  carouselSize: number
}

export interface CompetingVideo {
  id: string
  title: string
  channel: string
  channelSubscribers: number
  platform: VideoPlatform
  views: number
  duration: string
  publishDate: string
  thumbnailUrl?: string
  videoUrl: string
  position: number
  hasOwnSiteVideo: boolean
}

export interface VideoHijackKeyword {
  id: string
  keyword: string
  searchVolume: number
  currentRank?: number
  videoPresence: VideoPresence
  serpPosition: VideoSerpPosition
  hijackScore: number
  opportunityScore: number
  opportunityLevel: VideoOpportunityLevel
  competingVideos: CompetingVideo[]
  estimatedClicksLost: number
  hasOwnVideo: boolean
  difficulty: number
  intent: VideoIntent
  trend: VideoTrend
  lastChecked: string
}

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

export interface DominantChannel {
  channel: string
  count: number
  avgPosition: number
}

export interface VideoHijackAnalysis {
  summary: VideoHijackSummary
  keywords: VideoHijackKeyword[]
  topOpportunityKeywords: VideoHijackKeyword[]
  dominantChannels: DominantChannel[]
  lastAnalyzed: string
}

export interface VideoROI {
  potentialViews: number
  estimatedValue: number
  timeToRank: string
}

export interface FilterState {
  searchQuery: string
  sortBy: SortByOption
  sortOrder: SortOrder
  presenceFilter: VideoPresence[]
  opportunityFilter: VideoOpportunityLevel[]
  showOnlyWithoutVideo: boolean
}
