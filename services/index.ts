/**
 * Services Barrel Export
 * Central export point for all services
 */

// API Client
export { apiClient, configureApiClient } from "./api-client"
export type { ApiClientConfig, RequestOptions, ApiResponse, ApiError } from "./api-client"

// Auth Service
export { authService } from "./auth.service"
export type { User, AuthResponse, LoginCredentials, RegisterCredentials } from "./auth.service"

// Keywords Service
export { keywordsService } from "./keywords.service"
export type {
  Keyword,
  KeywordAnalysis,
  KeywordsListResponse,
  KeywordsParams,
  AnalyzeParams,
} from "./keywords.service"

// Rankings Service
export { rankingsService } from "./rankings.service"
export type {
  Ranking,
  Competitor,
  RankingSummary,
  RankingsListResponse,
  RankingsParams,
} from "./rankings.service"

// Rank Tracker Service (Multi-Platform)
export { rankTrackerService, rankTrackerQueryKeys } from "./rank-tracker.service"
export type {
  Platform,
  SerpFeature,
  AIOverviewPosition,
  AIOverviewData,
  TrackedKeyword,
  PlatformStats,
  CountryStats,
  RankTrackerSummary,
  GetKeywordsParams,
  AddKeywordParams,
  UpdateKeywordParams,
  BulkAddParams,
  ExportParams,
} from "./rank-tracker.service"

// Content Service
export { contentService } from "./content.service"
export type {
  Content,
  OnPageAnalysis,
  ContentSuggestions,
  ContentSummary,
  ContentListResponse,
  ContentParams,
} from "./content.service"

// Trends Service
export { trendsService } from "./trends.service"
export type {
  TrendingTopic,
  TrendAnalysis,
  TrendsListResponse,
  TrendsParams,
} from "./trends.service"

// NOTE: Server-only services (gsc, ga4, decay-detection, alerts) 
// should be imported directly in API routes, not through this barrel export
// to prevent client bundle pollution with server-only code.
// Import them directly: import { gscService } from '@/services/gsc.service'
