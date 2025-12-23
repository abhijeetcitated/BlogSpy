// Video Search & Results Types

export type SearchMode = "domain" | "keyword"
export type Platform = "youtube" | "tiktok"
export type SortOption = "views" | "engagement" | "recent" | "hijackScore"
export type ViralPotential = "low" | "medium" | "high"
export type ContentAge = "fresh" | "aging" | "outdated"
export type Seasonality = "evergreen" | "seasonal" | "trending"
export type VolumeTrend = "up" | "stable" | "down"
export type Competition = "low" | "medium" | "high"
export type Difficulty = "easy" | "medium" | "hard"

export interface VideoResult {
  id: string
  title: string
  channel: string
  channelUrl: string
  subscribers: string
  views: number
  likes: number
  comments: number
  publishedAt: string
  duration: string
  thumbnailUrl: string
  videoUrl: string
  engagement: number
  tags: string[]
  hijackScore: number
  viralPotential: ViralPotential
  contentAge: ContentAge
}

export interface TikTokResult {
  id: string
  description: string
  creator: string
  creatorUrl: string
  followers: string
  views: number
  likes: number
  shares: number
  comments: number
  publishedAt: string
  duration: string
  videoUrl: string
  engagement: number
  hashtags: string[]
  hijackScore: number
  viralPotential: ViralPotential
  soundTrending: boolean
}

export interface ContentTypeDistribution {
  type: string
  percentage: number
}

export interface AudienceAgeDistribution {
  range: string
  percentage: number
}

export interface TopChannel {
  name: string
  videos: number
}

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

export interface VideoSuggestion {
  titleFormats: string[]
  recommendedTags: string[]
  recommendedHashtags: string[]
  optimalLength: { youtube: string; tiktok: string }
  contentGaps: string[]
  bestTimeToPost: string
  difficulty: Difficulty
}
