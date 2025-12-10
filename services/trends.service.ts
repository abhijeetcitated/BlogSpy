/**
 * Trends Service - Trend monitoring and analysis
 * Handles trending topics, keyword trends, and viral content detection
 */

import { apiClient } from "./api-client"

interface TrendingTopic {
  id: string
  topic: string
  category: string
  volume: number
  growth: number
  sentiment: "positive" | "negative" | "neutral"
  relatedKeywords: string[]
  sources: string[]
  firstSeen: string
  peakTime: string | null
}

interface TrendAnalysis {
  keyword: string
  currentTrend: "rising" | "stable" | "falling" | "viral"
  trendData: {
    date: string
    value: number
  }[]
  prediction: {
    next7Days: number
    next30Days: number
    confidence: number
  }
  relatedTrends: {
    keyword: string
    correlation: number
  }[]
  seasonality: {
    isSeasonable: boolean
    peakMonths: number[]
    lowMonths: number[]
  }
}

interface TrendsListResponse {
  success: boolean
  data: TrendingTopic[]
  history: {
    date: string
    topTrends: string[]
  }[]
  categories: string[]
}

interface TrendAnalysisResponse {
  success: boolean
  data: TrendAnalysis
}

interface TrendsParams {
  category?: string
  timeRange?: "24h" | "7d" | "30d"
  limit?: number
}

class TrendsService {
  // Get trending topics
  async getTrending(params: TrendsParams = {}): Promise<TrendsListResponse> {
    const response = await apiClient.get<TrendsListResponse>("/api/trends", {
      params: {
        category: params.category,
        timeRange: params.timeRange,
        limit: params.limit,
      },
    })

    return response.data
  }

  // Get trending by category
  async getTrendingByCategory(category: string, limit = 10): Promise<TrendingTopic[]> {
    const response = await this.getTrending({ category, limit })
    return response.data
  }

  // Get viral topics (high growth)
  async getViralTopics(limit = 10): Promise<TrendingTopic[]> {
    const response = await this.getTrending({ limit: 50 })
    return response.data
      .filter((t) => t.growth >= 100)
      .sort((a, b) => b.growth - a.growth)
      .slice(0, limit)
  }

  // Analyze keyword trend
  async analyzeTrend(keyword: string): Promise<TrendAnalysis> {
    const response = await apiClient.post<TrendAnalysisResponse>("/api/trends", {
      keyword,
    })

    return response.data.data
  }

  // Get trend prediction
  async getPrediction(keyword: string): Promise<TrendAnalysis["prediction"]> {
    const analysis = await this.analyzeTrend(keyword)
    return analysis.prediction
  }

  // Get seasonal patterns
  async getSeasonality(keyword: string): Promise<TrendAnalysis["seasonality"]> {
    const analysis = await this.analyzeTrend(keyword)
    return analysis.seasonality
  }

  // Compare trends
  async compareTrends(keywords: string[]): Promise<TrendAnalysis[]> {
    const results = await Promise.all(
      keywords.map((keyword) => this.analyzeTrend(keyword))
    )
    return results
  }

  // Get trend categories
  async getCategories(): Promise<string[]> {
    const response = await this.getTrending({ limit: 1 })
    return response.categories
  }

  // Calculate trend score (0-100)
  calculateTrendScore(topic: TrendingTopic): number {
    // Weight factors
    const volumeWeight = 0.3
    const growthWeight = 0.5
    const recencyWeight = 0.2

    // Normalize values
    const volumeScore = Math.min(topic.volume / 10000, 1) * 100
    const growthScore = Math.min(topic.growth / 200, 1) * 100

    // Calculate recency (hours since first seen)
    const hoursSinceFirst =
      (Date.now() - new Date(topic.firstSeen).getTime()) / (1000 * 60 * 60)
    const recencyScore = Math.max(0, 100 - hoursSinceFirst * 2)

    return Math.round(
      volumeScore * volumeWeight +
        growthScore * growthWeight +
        recencyScore * recencyWeight
    )
  }

  // Get trend direction emoji
  getTrendEmoji(growth: number): string {
    if (growth >= 100) return "🚀"
    if (growth >= 50) return "📈"
    if (growth >= 10) return "↗️"
    if (growth >= -10) return "➡️"
    if (growth >= -50) return "↘️"
    return "📉"
  }

  // Export trends to CSV
  exportToCSV(trends: TrendingTopic[]): string {
    const headers = [
      "Topic",
      "Category",
      "Volume",
      "Growth %",
      "Sentiment",
      "First Seen",
    ]
    const rows = trends.map((t) => [
      t.topic,
      t.category,
      t.volume,
      `${t.growth}%`,
      t.sentiment,
      t.firstSeen,
    ])

    return [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n")
  }
}

// Export singleton instance
export const trendsService = new TrendsService()

// Export types
export type {
  TrendingTopic,
  TrendAnalysis,
  TrendsListResponse,
  TrendsParams,
}
