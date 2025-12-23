// ============================================
// RANK TRACKER - Service Layer
// ============================================

import { apiClient } from "@/services/api-client"
import type { RankData, SearchPlatform, MultiPlatformKeyword } from "../types"

// API Endpoints
const ENDPOINTS = {
  KEYWORDS: "/api/rank-tracker/keywords",
  RANKINGS: "/api/rank-tracker/rankings",
  REFRESH: "/api/rank-tracker/refresh",
  EXPORT: "/api/rank-tracker/export",
  ALERTS: "/api/rank-tracker/alerts",
} as const

// Request/Response Types
export interface AddKeywordsRequest {
  keywords: string[]
  country?: string
  platforms?: SearchPlatform[]
}

export interface AddKeywordsResponse {
  success: boolean
  added: number
  keywords: string[]
  error?: string
}

export interface UpdateKeywordRequest {
  keywordId: string
  keyword?: string
  country?: string
}

export interface RefreshResponse {
  success: boolean
  updatedAt: string
  changesCount: number
}

export interface DeleteKeywordsResponse {
  success: boolean
  deleted: number
}

export interface AlertSettings {
  rankDrops: boolean
  rankImprovements: boolean
  top3Entry: boolean
  top10Entry: boolean
  aiOverviewChanges: boolean
  emailNotifications: boolean
  slackIntegration: boolean
}

/**
 * Rank Tracker Service
 * Handles all API calls for rank tracking functionality
 */
class RankTrackerService {
  private abortController: AbortController | null = null

  /**
   * Get all tracked keywords with rankings
   */
  async getKeywords(
    platform?: SearchPlatform,
    country?: string
  ): Promise<MultiPlatformKeyword[]> {
    try {
      const params = new URLSearchParams()
      if (platform) params.append("platform", platform)
      if (country) params.append("country", country)

      const response = await apiClient.get<MultiPlatformKeyword[]>(
        `${ENDPOINTS.KEYWORDS}?${params.toString()}`
      )
      return response.data
    } catch (error) {
      console.error("[RankTrackerService] Failed to fetch keywords:", error)
      return []
    }
  }

  /**
   * Add new keywords to track
   */
  async addKeywords(request: AddKeywordsRequest): Promise<AddKeywordsResponse> {
    try {
      const response = await apiClient.post<AddKeywordsResponse>(
        ENDPOINTS.KEYWORDS,
        request
      )
      return response.data
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to add keywords"
      return { success: false, added: 0, keywords: [], error: message }
    }
  }

  /**
   * Update a keyword
   */
  async updateKeyword(request: UpdateKeywordRequest): Promise<{ success: boolean; error?: string }> {
    try {
      await apiClient.patch(`${ENDPOINTS.KEYWORDS}/${request.keywordId}`, {
        keyword: request.keyword,
        country: request.country,
      })
      return { success: true }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update keyword"
      return { success: false, error: message }
    }
  }

  /**
   * Delete a single keyword
   */
  async deleteKeyword(keywordId: string): Promise<{ success: boolean; error?: string }> {
    try {
      await apiClient.delete(`${ENDPOINTS.KEYWORDS}/${keywordId}`)
      return { success: true }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to delete keyword"
      return { success: false, error: message }
    }
  }

  /**
   * Delete multiple keywords
   */
  async deleteKeywords(keywordIds: string[]): Promise<DeleteKeywordsResponse> {
    try {
      const response = await apiClient.post<DeleteKeywordsResponse>(
        `${ENDPOINTS.KEYWORDS}/bulk-delete`,
        { ids: keywordIds }
      )
      return response.data
    } catch (error) {
      console.error("[RankTrackerService] Failed to bulk delete:", error)
      return { success: false, deleted: 0 }
    }
  }

  /**
   * Refresh rankings data
   */
  async refreshRankings(): Promise<RefreshResponse> {
    // Cancel any existing refresh
    this.cancelRefresh()
    this.abortController = new AbortController()

    try {
      const response = await apiClient.post<RefreshResponse>(
        ENDPOINTS.REFRESH,
        {}
      )
      return response.data
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        return { success: false, updatedAt: "", changesCount: 0 }
      }
      console.error("[RankTrackerService] Failed to refresh:", error)
      return { success: false, updatedAt: "", changesCount: 0 }
    } finally {
      this.abortController = null
    }
  }

  /**
   * Cancel ongoing refresh
   */
  cancelRefresh(): void {
    if (this.abortController) {
      this.abortController.abort()
      this.abortController = null
    }
  }

  /**
   * Export rankings to CSV
   */
  async exportToCSV(
    data: RankData[],
    platform: string
  ): Promise<{ success: boolean; filename: string; content: string }> {
    const headers = [
      "Keyword",
      "Rank",
      "Previous Rank",
      "Change",
      "Volume",
      "URL",
      "SERP Features",
      "AI Overview",
      "Country",
      "Last Updated",
    ]

    const rows = data.map((item) => [
      `"${item.keyword}"`,
      item.rank,
      item.previousRank,
      item.change > 0 ? `+${item.change}` : item.change,
      item.volume,
      `"${item.url}"`,
      `"${item.serpFeatures.join(", ")}"`,
      `"${item.aiOverview?.position || "N/A"}"`,
      `"${item.country}"`,
      `"${item.lastUpdated}"`,
    ])

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n")

    const filename = `rank-tracker-${platform}-${new Date().toISOString().split("T")[0]}.csv`

    return { success: true, filename, content: csvContent }
  }

  /**
   * Download CSV file
   */
  downloadCSV(content: string, filename: string): void {
    const blob = new Blob([content], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  /**
   * Get alert settings
   */
  async getAlertSettings(): Promise<AlertSettings | null> {
    try {
      const response = await apiClient.get<AlertSettings>(ENDPOINTS.ALERTS)
      return response.data
    } catch (error) {
      console.error("[RankTrackerService] Failed to fetch alert settings:", error)
      return null
    }
  }

  /**
   * Save alert settings
   */
  async saveAlertSettings(settings: AlertSettings): Promise<{ success: boolean; error?: string }> {
    try {
      await apiClient.post(ENDPOINTS.ALERTS, settings)
      return { success: true }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to save alert settings"
      return { success: false, error: message }
    }
  }
}

// Export singleton instance
export const rankTrackerService = new RankTrackerService()
