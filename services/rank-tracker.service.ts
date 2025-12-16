/**
 * Rank Tracker Service - Multi-platform rank tracking and management
 * Comprehensive API service for rank tracking feature
 * 
 * Supports: Google, YouTube, Amazon, Bing, Reddit, TikTok, LinkedIn, Pinterest
 */

import { apiClient } from "./api-client"

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

export type Platform = 
  | "google" 
  | "youtube" 
  | "amazon" 
  | "bing" 
  | "reddit" 
  | "tiktok" 
  | "linkedin" 
  | "pinterest"

export type SerpFeature = 
  | "featured_snippet" 
  | "people_also_ask" 
  | "local_pack" 
  | "shopping" 
  | "video" 
  | "images" 
  | "knowledge_panel"
  | "site_links"
  | "top_stories"
  | "reviews"
  | "ads"

export type AIOverviewPosition = "cited" | "mentioned" | "not_included"

export interface AIOverviewData {
  inOverview: boolean
  position: AIOverviewPosition
  citationUrl?: string
  competitors: string[]
  recommendation?: string
}

export interface TrackedKeyword {
  id: string
  keyword: string
  platform: Platform
  country: string
  rank: number
  previousRank: number | null
  change: number
  volume: number
  url: string
  serpFeatures: SerpFeature[]
  aiOverview?: AIOverviewData
  pixelRank?: number
  trendHistory: number[]
  createdAt: string
  updatedAt: string
  lastChecked: string
}

export interface PlatformStats {
  avgRank: number
  keywords: number
  improved: number
  declined: number
  stable: number
  top3: number
  top10: number
  top100: number
  notRanking: number
}

export interface CountryStats {
  [countryCode: string]: number
}

export interface RankTrackerSummary {
  totalKeywords: number
  avgPosition: number
  improved: number
  declined: number
  stable: number
  totalTraffic: number
  top3: number
  top10: number
  top100: number
  lastUpdated: string
  platformBreakdown: Record<Platform, PlatformStats>
}

// =============================================================================
// API RESPONSE TYPES
// =============================================================================

interface GetKeywordsResponse {
  success: boolean
  data: TrackedKeyword[]
  summary: RankTrackerSummary
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

interface AddKeywordResponse {
  success: boolean
  data: TrackedKeyword
  message: string
}

interface UpdateKeywordResponse {
  success: boolean
  data: TrackedKeyword
  message: string
}

interface DeleteKeywordResponse {
  success: boolean
  message: string
  deletedId: string
}

interface BulkDeleteResponse {
  success: boolean
  message: string
  deletedCount: number
  deletedIds: string[]
}

interface RefreshRankingsResponse {
  success: boolean
  data: TrackedKeyword[]
  updatedCount: number
  message: string
}

interface ExportResponse {
  success: boolean
  downloadUrl: string
  format: "csv" | "xlsx" | "json"
  expiresAt: string
}

interface RankHistoryResponse {
  success: boolean
  data: {
    keywordId: string
    keyword: string
    history: {
      date: string
      rank: number
      platform: Platform
      country: string
      serpFeatures: SerpFeature[]
      aiOverview?: AIOverviewData
    }[]
  }
}

// =============================================================================
// REQUEST PARAMS
// =============================================================================

export interface GetKeywordsParams {
  platform?: Platform | "all"
  country?: string
  page?: number
  limit?: number
  sortBy?: "keyword" | "rank" | "change" | "volume" | "lastChecked"
  sortOrder?: "asc" | "desc"
  search?: string
  dateRange?: "7d" | "30d" | "90d" | "all"
  filter?: "all" | "improved" | "declined" | "stable" | "top3" | "top10" | "notRanking"
}

export interface AddKeywordParams {
  keyword: string
  platform: Platform
  country: string
  url?: string
  targetRank?: number
}

export interface UpdateKeywordParams {
  keyword?: string
  country?: string
  url?: string
  targetRank?: number
}

export interface BulkAddParams {
  keywords: Array<{
    keyword: string
    platform?: Platform
    country?: string
    url?: string
  }>
  defaultPlatform?: Platform
  defaultCountry?: string
}

export interface ExportParams {
  format: "csv" | "xlsx" | "json"
  keywordIds?: string[]
  platform?: Platform | "all"
  country?: string
  dateRange?: "7d" | "30d" | "90d" | "all"
  includeHistory?: boolean
}

// =============================================================================
// RANK TRACKER SERVICE CLASS
// =============================================================================

// Helper type for API params
type ApiParams = Record<string, string | number | boolean | undefined>

// Alert Settings type
interface AlertSettings {
  rankDrops: boolean
  rankImprovements: boolean
  top3Entry: boolean
  top10Entry: boolean
  aiOverviewChanges: boolean
  emailNotifications: boolean
  slackIntegration: boolean
  threshold: number
}

class RankTrackerService {
  private baseUrl = "/api/rank-tracker"

  // -------------------------------------------------------------------------
  // GET OPERATIONS
  // -------------------------------------------------------------------------

  /**
   * Get all tracked keywords with optional filtering
   */
  async getKeywords(params: GetKeywordsParams = {}): Promise<GetKeywordsResponse> {
    const response = await apiClient.get<GetKeywordsResponse>(
      `${this.baseUrl}/keywords`,
      { params: params as unknown as ApiParams }
    )
    return response.data
  }

  /**
   * Get a single keyword by ID
   */
  async getKeyword(keywordId: string): Promise<TrackedKeyword> {
    const response = await apiClient.get<{ success: boolean; data: TrackedKeyword }>(
      `${this.baseUrl}/keywords/${keywordId}`
    )
    return response.data.data
  }

  /**
   * Get ranking history for a keyword
   */
  async getKeywordHistory(
    keywordId: string, 
    dateRange: "7d" | "30d" | "90d" | "all" = "30d"
  ): Promise<RankHistoryResponse> {
    const response = await apiClient.get<RankHistoryResponse>(
      `${this.baseUrl}/keywords/${keywordId}/history`,
      { params: { dateRange } }
    )
    return response.data
  }

  /**
   * Get summary/dashboard stats
   */
  async getSummary(platform?: Platform | "all", country?: string): Promise<RankTrackerSummary> {
    const response = await apiClient.get<{ success: boolean; data: RankTrackerSummary }>(
      `${this.baseUrl}/summary`,
      { params: { platform, country } }
    )
    return response.data.data
  }

  /**
   * Get platform-specific stats
   */
  async getPlatformStats(platform: Platform, country?: string): Promise<PlatformStats> {
    const response = await apiClient.get<{ success: boolean; data: PlatformStats }>(
      `${this.baseUrl}/platforms/${platform}/stats`,
      { params: { country } }
    )
    return response.data.data
  }

  /**
   * Get country stats (keyword count per country)
   */
  async getCountryStats(platform?: Platform | "all"): Promise<CountryStats> {
    const response = await apiClient.get<{ success: boolean; data: CountryStats }>(
      `${this.baseUrl}/countries/stats`,
      { params: { platform } }
    )
    return response.data.data
  }

  // -------------------------------------------------------------------------
  // CREATE OPERATIONS
  // -------------------------------------------------------------------------

  /**
   * Add a single keyword to tracking
   */
  async addKeyword(params: AddKeywordParams): Promise<TrackedKeyword> {
    const response = await apiClient.post<AddKeywordResponse>(
      `${this.baseUrl}/keywords`,
      params
    )
    return response.data.data
  }

  /**
   * Bulk add multiple keywords
   */
  async bulkAddKeywords(params: BulkAddParams): Promise<TrackedKeyword[]> {
    const response = await apiClient.post<{ success: boolean; data: TrackedKeyword[]; count: number }>(
      `${this.baseUrl}/keywords/bulk`,
      params
    )
    return response.data.data
  }

  // -------------------------------------------------------------------------
  // UPDATE OPERATIONS
  // -------------------------------------------------------------------------

  /**
   * Update a keyword
   */
  async updateKeyword(keywordId: string, params: UpdateKeywordParams): Promise<TrackedKeyword> {
    const response = await apiClient.patch<UpdateKeywordResponse>(
      `${this.baseUrl}/keywords/${keywordId}`,
      params
    )
    return response.data.data
  }

  /**
   * Refresh rankings for specific keywords
   */
  async refreshRankings(keywordIds?: string[]): Promise<RefreshRankingsResponse> {
    const response = await apiClient.post<RefreshRankingsResponse>(
      `${this.baseUrl}/refresh`,
      { keywordIds }
    )
    return response.data
  }

  /**
   * Refresh all rankings for a platform
   */
  async refreshPlatform(platform: Platform, country?: string): Promise<RefreshRankingsResponse> {
    const response = await apiClient.post<RefreshRankingsResponse>(
      `${this.baseUrl}/platforms/${platform}/refresh`,
      { country }
    )
    return response.data
  }

  // -------------------------------------------------------------------------
  // DELETE OPERATIONS
  // -------------------------------------------------------------------------

  /**
   * Delete a single keyword
   */
  async deleteKeyword(keywordId: string): Promise<DeleteKeywordResponse> {
    const response = await apiClient.delete<DeleteKeywordResponse>(
      `${this.baseUrl}/keywords/${keywordId}`
    )
    return response.data
  }

  /**
   * Bulk delete keywords
   */
  async bulkDeleteKeywords(keywordIds: string[]): Promise<BulkDeleteResponse> {
    const response = await apiClient.post<BulkDeleteResponse>(
      `${this.baseUrl}/keywords/bulk-delete`,
      { keywordIds }
    )
    return response.data
  }

  // -------------------------------------------------------------------------
  // EXPORT OPERATIONS
  // -------------------------------------------------------------------------

  /**
   * Export keywords data
   */
  async exportKeywords(params: ExportParams): Promise<ExportResponse> {
    const response = await apiClient.post<ExportResponse>(
      `${this.baseUrl}/export`,
      params
    )
    return response.data
  }

  /**
   * Quick CSV export (downloads directly)
   */
  async downloadCsv(keywordIds?: string[], platform?: Platform, country?: string): Promise<string> {
    const response = await apiClient.get<{ success: boolean; data: string }>(
      `${this.baseUrl}/export/csv`,
      {
        params: { keywordIds: keywordIds?.join(","), platform, country } as ApiParams
      }
    )
    return response.data.data
  }

  // -------------------------------------------------------------------------
  // ALERT OPERATIONS
  // -------------------------------------------------------------------------

  /**
   * Get alert settings
   */
  async getAlertSettings(): Promise<AlertSettings> {
    const response = await apiClient.get<{ success: boolean; data: AlertSettings }>(
      `${this.baseUrl}/alerts/settings`
    )
    return response.data.data
  }

  /**
   * Update alert settings
   */
  async updateAlertSettings(settings: Partial<AlertSettings>): Promise<void> {
    await apiClient.patch(`${this.baseUrl}/alerts/settings`, settings)
  }

  // -------------------------------------------------------------------------
  // UTILITY METHODS
  // -------------------------------------------------------------------------

  /**
   * Check if API is available
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await apiClient.get<{ status: string }>(`${this.baseUrl}/health`)
      return response.data.status === "ok"
    } catch {
      return false
    }
  }

  /**
   * Get supported platforms
   */
  getSupportedPlatforms(): Platform[] {
    return ["google", "youtube", "amazon", "bing", "reddit", "tiktok", "linkedin", "pinterest"]
  }

  /**
   * Get platform display name
   */
  getPlatformDisplayName(platform: Platform): string {
    const names: Record<Platform, string> = {
      google: "Google",
      youtube: "YouTube",
      amazon: "Amazon",
      bing: "Bing",
      reddit: "Reddit",
      tiktok: "TikTok",
      linkedin: "LinkedIn",
      pinterest: "Pinterest"
    }
    return names[platform]
  }
}

// =============================================================================
// HOOKS FOR REACT INTEGRATION
// =============================================================================

// These hooks would typically be in a separate hooks file, but included here for reference
// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export const rankTrackerQueryKeys = {
  all: ["rank-tracker"] as const,
  keywords: (params?: GetKeywordsParams) => [...rankTrackerQueryKeys.all, "keywords", params] as const,
  keyword: (id: string) => [...rankTrackerQueryKeys.all, "keyword", id] as const,
  history: (id: string, dateRange?: string) => [...rankTrackerQueryKeys.all, "history", id, dateRange] as const,
  summary: (platform?: string, country?: string) => [...rankTrackerQueryKeys.all, "summary", platform, country] as const,
  platformStats: (platform: string, country?: string) => [...rankTrackerQueryKeys.all, "platformStats", platform, country] as const,
  countryStats: (platform?: string) => [...rankTrackerQueryKeys.all, "countryStats", platform] as const,
  alerts: () => [...rankTrackerQueryKeys.all, "alerts"] as const,
}

// =============================================================================
// EXPORT
// =============================================================================

export const rankTrackerService = new RankTrackerService()
export default rankTrackerService
