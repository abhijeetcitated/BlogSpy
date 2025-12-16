// ============================================
// CONTENT DECAY - Utility Functions
// ============================================

import type { DecayArticle, MatrixPoint, MatrixZone, DecayReason, DecayStatus, SortField, SortDirection } from "../types"
import { DECAY_REASON_DISPLAY } from "../constants"

/**
 * Generate matrix points from article data for visualization
 */
export function generateMatrixPoints(articles: DecayArticle[]): MatrixPoint[] {
  return articles.map((article) => {
    // Determine zone based on decay rate and traffic value
    let zone: MatrixZone
    if (article.trafficValue > 0.5 && article.decayRate > 0.5) {
      zone = "critical"
    } else if (article.trafficValue > 0.5 && article.decayRate <= 0.5) {
      zone = "watch"
    } else if (article.trafficValue <= 0.5 && article.decayRate > 0.5) {
      zone = "low"
    } else {
      zone = "stable"
    }

    return {
      x: article.trafficValue * 100,
      y: article.decayRate * 100,
      id: `matrix-${article.id}`,
      zone,
      articleId: article.id,
    }
  })
}

/**
 * Get display text for decay reason
 */
export function getDecayReasonDisplay(reason: DecayReason): string {
  return DECAY_REASON_DISPLAY[reason]
}

/**
 * Filter critical articles
 */
export function filterCriticalArticles(articles: DecayArticle[]): DecayArticle[] {
  return articles.filter((a) => a.status === "critical")
}

/**
 * Filter watch list articles
 */
export function filterWatchArticles(articles: DecayArticle[]): DecayArticle[] {
  return articles.filter((a) => a.status === "watch")
}

/**
 * Calculate total traffic at risk
 */
export function calculateTotalTrafficAtRisk(articles: DecayArticle[]): number {
  return articles.reduce((sum, a) => sum + Math.abs(a.trafficLoss), 0)
}

/**
 * Find article by ID
 */
export function findArticleById(
  articles: DecayArticle[],
  articleId: string
): DecayArticle | undefined {
  return articles.find((a) => a.id === articleId)
}

/**
 * Get decay zone for an article
 */
export function getDecayZone(article: DecayArticle): MatrixZone {
  if (article.status === "critical") return "critical"
  if (article.status === "watch") return "watch"
  
  // Fallback based on metrics
  if (article.decayRate > 15 || article.trafficLoss > 500) return "critical"
  if (article.decayRate > 8 || article.trafficLoss > 200) return "watch"
  if (article.decayRate > 3) return "low"
  return "stable"
}

/**
 * Filter articles by search query, reason, and status
 */
export function filterArticles(
  articles: DecayArticle[],
  searchQuery: string,
  filterReason: DecayReason | "all",
  filterStatus: DecayStatus | "all",
  ignoredIds: Set<string>,
  fixedIds: Set<string>
): DecayArticle[] {
  return articles.filter((article) => {
    // Exclude ignored articles unless specifically filtering for them
    if (filterStatus !== "ignored" && ignoredIds.has(article.id)) return false
    
    // If filtering for fixed status
    if (filterStatus === "fixed" && !fixedIds.has(article.id)) return false
    
    // If filtering for ignored status
    if (filterStatus === "ignored" && !ignoredIds.has(article.id)) return false
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      const matchesTitle = article.title.toLowerCase().includes(query)
      const matchesUrl = article.url.toLowerCase().includes(query)
      if (!matchesTitle && !matchesUrl) return false
    }
    
    // Filter by decay reason
    if (filterReason !== "all" && article.decayReason !== filterReason) return false
    
    // Filter by status (critical/watch)
    if (filterStatus !== "all" && filterStatus !== "fixed" && filterStatus !== "ignored") {
      if (article.status !== filterStatus) return false
    }
    
    return true
  })
}

/**
 * Sort articles by specified field
 */
export function sortArticles(
  articles: DecayArticle[],
  sortField: SortField,
  sortDirection: SortDirection
): DecayArticle[] {
  return [...articles].sort((a, b) => {
    let comparison = 0
    
    switch (sortField) {
      case "trafficLoss":
        comparison = Math.abs(b.trafficLoss) - Math.abs(a.trafficLoss)
        break
      case "rankDrop":
        comparison = (b.currentRank - b.previousRank) - (a.currentRank - a.previousRank)
        break
      case "decayRate":
        comparison = b.decayRate - a.decayRate
        break
      case "title":
        comparison = a.title.localeCompare(b.title)
        break
    }
    
    return sortDirection === "asc" ? comparison : -comparison
  })
}
