// Snippet Stealer Service - API Integration Layer
import { apiClient } from "@/services/api-client"
import type { SnippetOpportunity } from "../types"

/**
 * Snippet Stealer Service
 * Handles all API operations for snippet management
 */

export interface SaveSnippetRequest {
  snippetId: string
  content: string
  keyword: string
  metadata?: Record<string, unknown>
}

export interface SaveSnippetResponse {
  success: boolean
  id: string
  savedAt: string
}

export interface GenerateSnippetRequest {
  keyword: string
  targetKeywords: string[]
  snippetType: "paragraph" | "list" | "table"
  competitorContent?: string
}

export interface GenerateSnippetResponse {
  content: string
  wordCount: number
  keywordsUsed: number
}

export interface GetSavedSnippetsResponse {
  snippets: Array<{
    id: string
    snippetId: string
    content: string
    keyword: string
    savedAt: string
  }>
  total: number
}

export interface SnippetOpportunitiesResponse {
  opportunities: SnippetOpportunity[]
  total: number
  hasMore: boolean
}

interface AnalyzeCompetitorResponse {
  content: string
  wordCount: number
  structure: "paragraph" | "list" | "table"
}

interface TrackRankingResponse {
  hasFeaturedSnippet: boolean
  isOwned: boolean
  currentPosition: number | null
}

class SnippetStealerService {
  private readonly basePath = "/api/snippet-stealer"

  /**
   * Save a user-created or AI-generated snippet
   */
  async saveSnippet(request: SaveSnippetRequest): Promise<SaveSnippetResponse> {
    const response = await apiClient.post<SaveSnippetResponse>(
      `${this.basePath}/snippets`,
      request
    )
    return response.data
  }

  /**
   * Get all saved snippets for the user
   */
  async getSavedSnippets(page = 1, limit = 20): Promise<GetSavedSnippetsResponse> {
    const response = await apiClient.get<GetSavedSnippetsResponse>(
      `${this.basePath}/snippets`,
      { params: { page, limit } }
    )
    return response.data
  }

  /**
   * Delete a saved snippet
   */
  async deleteSnippet(snippetId: string): Promise<{ success: boolean }> {
    const response = await apiClient.delete<{ success: boolean }>(
      `${this.basePath}/snippets/${snippetId}`
    )
    return response.data
  }

  /**
   * Generate AI snippet for a given keyword
   */
  async generateAISnippet(request: GenerateSnippetRequest): Promise<GenerateSnippetResponse> {
    const response = await apiClient.post<GenerateSnippetResponse>(
      `${this.basePath}/generate`,
      request
    )
    return response.data
  }

  /**
   * Fetch snippet opportunities (keywords with featured snippets to target)
   */
  async getOpportunities(
    page = 1,
    limit = 20,
    filter?: "all" | "paragraph" | "list" | "table"
  ): Promise<SnippetOpportunitiesResponse> {
    const response = await apiClient.get<SnippetOpportunitiesResponse>(
      `${this.basePath}/opportunities`,
      { params: { page, limit, filter } }
    )
    return response.data
  }

  /**
   * Analyze competitor's featured snippet
   */
  async analyzeCompetitor(url: string): Promise<AnalyzeCompetitorResponse> {
    const response = await apiClient.post<AnalyzeCompetitorResponse>(
      `${this.basePath}/analyze`,
      { url }
    )
    return response.data
  }

  /**
   * Track snippet ranking changes
   */
  async trackSnippetRanking(keyword: string): Promise<TrackRankingResponse> {
    const response = await apiClient.get<TrackRankingResponse>(
      `${this.basePath}/track`,
      { params: { keyword } }
    )
    return response.data
  }
}

// Export singleton instance
export const snippetStealerService = new SnippetStealerService()

// Export class for testing
export { SnippetStealerService }
