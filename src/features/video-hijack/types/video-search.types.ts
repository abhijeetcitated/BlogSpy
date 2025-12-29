import type {
  ViralPotential,
  ContentAge,
} from "./common.types"

// Re-export common types for convenience
export type {
  SearchMode,
  Platform,
  SortOption,
  ViralPotential,
  ContentAge,
  Seasonality,
  VolumeTrend,
  Competition,
  Difficulty,
  ContentTypeDistribution,
  AudienceAgeDistribution,
  TopChannel,
  KeywordStats,
  VideoSuggestion,
} from "./common.types"

// Video Search & Results Types (refactored)

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
