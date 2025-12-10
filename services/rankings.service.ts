/**
 * Rankings Service - Rank tracking and competitor analysis
 * Handles ranking data, history, and competitor monitoring
 */

import { apiClient } from "./api-client"

interface Ranking {
  id: string
  keyword: string
  url: string
  position: number
  previousPosition: number | null
  change: number
  volume: number
  traffic: number
  difficulty: number
  lastUpdated: string
  history: number[]
}

interface Competitor {
  id: string
  domain: string
  commonKeywords: number
  avgPosition: number
  visibility: number
  traffic: number
}

interface RankingSummary {
  totalKeywords: number
  avgPosition: number
  improved: number
  declined: number
  stable: number
  totalTraffic: number
  top3: number
  top10: number
  top100: number
}

interface RankingsListResponse {
  success: boolean
  data: Ranking[]
  summary: RankingSummary
  competitors: Competitor[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

interface AddRankingResponse {
  success: boolean
  data: Ranking
  message: string
}

interface RankingsParams {
  domain?: string
  page?: number
  limit?: number
  filter?: "all" | "improved" | "declined" | "stable"
}

class RankingsService {
  // Get rankings list
  async getRankings(params: RankingsParams = {}): Promise<RankingsListResponse> {
    const response = await apiClient.get<RankingsListResponse>("/api/rankings", {
      params: {
        domain: params.domain,
        page: params.page,
        limit: params.limit,
        filter: params.filter,
      },
    })

    return response.data
  }

  // Get ranking summary
  async getSummary(): Promise<RankingSummary> {
    const response = await this.getRankings({ limit: 1 })
    return response.summary
  }

  // Get competitors
  async getCompetitors(): Promise<Competitor[]> {
    const response = await this.getRankings({ limit: 1 })
    return response.competitors
  }

  // Add keyword to tracking
  async addKeyword(keyword: string, url?: string, domain?: string): Promise<Ranking> {
    const response = await apiClient.post<AddRankingResponse>("/api/rankings", {
      keyword,
      url,
      domain,
    })

    return response.data.data
  }

  // Remove keyword from tracking
  async removeKeyword(id: string): Promise<{ success: boolean }> {
    const response = await apiClient.delete<{ success: boolean; message: string }>(
      `/api/rankings?id=${id}`
    )

    return { success: response.data.success }
  }

  // Get improved rankings
  async getImproved(limit = 10): Promise<Ranking[]> {
    const response = await this.getRankings({ filter: "improved", limit })
    return response.data
  }

  // Get declined rankings
  async getDeclined(limit = 10): Promise<Ranking[]> {
    const response = await this.getRankings({ filter: "declined", limit })
    return response.data
  }

  // Get top rankings
  async getTopRankings(maxPosition = 10): Promise<Ranking[]> {
    const response = await this.getRankings({ limit: 100 })
    return response.data.filter((r) => r.position <= maxPosition)
  }

  // Get ranking history for a keyword
  async getHistory(keywordId: string): Promise<number[]> {
    const response = await this.getRankings()
    const ranking = response.data.find((r) => r.id === keywordId)
    return ranking?.history || []
  }

  // Calculate visibility score
  calculateVisibility(rankings: Ranking[]): number {
    if (rankings.length === 0) return 0

    // Visibility calculation based on position and volume
    let totalVisibility = 0
    const ctrByPosition: Record<number, number> = {
      1: 0.317,
      2: 0.241,
      3: 0.189,
      4: 0.113,
      5: 0.089,
      6: 0.073,
      7: 0.062,
      8: 0.054,
      9: 0.047,
      10: 0.041,
    }

    rankings.forEach((ranking) => {
      const ctr = ctrByPosition[ranking.position] || 0.01
      totalVisibility += ranking.volume * ctr
    })

    // Normalize to 0-100 scale
    const maxPossible = rankings.reduce((sum, r) => sum + r.volume * 0.317, 0)
    return Math.round((totalVisibility / maxPossible) * 100)
  }

  // Export rankings to CSV
  exportToCSV(rankings: Ranking[]): string {
    const headers = [
      "Keyword",
      "URL",
      "Position",
      "Previous",
      "Change",
      "Volume",
      "Traffic",
      "Difficulty",
    ]
    const rows = rankings.map((r) => [
      r.keyword,
      r.url,
      r.position,
      r.previousPosition || "N/A",
      r.change > 0 ? `+${r.change}` : r.change,
      r.volume,
      r.traffic,
      r.difficulty,
    ])

    return [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n")
  }
}

// Export singleton instance
export const rankingsService = new RankingsService()

// Export types
export type { Ranking, Competitor, RankingSummary, RankingsListResponse, RankingsParams }
