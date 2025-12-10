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
