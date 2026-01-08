/**
 * ============================================
 * TOPIC CLUSTERS - KEYWORD UTILITIES
 * ============================================
 * 
 * Utility functions for keyword analysis and scoring
 */

import type { Keyword, KeywordStatus, BusinessPotential, SerpFeature } from "../types/keyword-types"
import { IMPORT_SOURCES, SOURCE_DATA_MAP, KEYWORDS_BY_SOURCE } from "../constants/keyword-pool.constants"

/**
 * Determine keyword status based on source and position
 * Status determines what action to take (new content, update, optimize)
 */
export function getKeywordStatus(kw: Keyword): KeywordStatus {
  // If ranking well (top 10), it's "ranking"
  if (kw.position !== null && kw.position <= 10) return "ranking"
  // If from Content Decay or has Traffic Loss tag, needs "update"
  if (kw.source === "Content Decay" || kw.sourceTag === "Traffic Loss") return "update"
  // If ranking but weak (11-50), needs "optimize"
  if (kw.position !== null && kw.position <= 50) return "optimize"
  // If from Competitor Gap or has Missing tag, it's "new" content needed
  if (kw.source === "Competitor Gap" || kw.sourceTag === "Missing") return "new"
  // If not ranking at all, it's "new"
  if (kw.position === null && (kw.source === "Keyword Magic" || kw.source === "Trend Spotter")) return "new"
  return null
}

/**
 * Calculate priority score for a keyword
 * Higher = Better opportunity
 * Formula: (Volume / 1000) × (100 - KD) × (CPC + 0.5) × StatusMultiplier × TrendMultiplier
 */
export function calculatePriorityScore(kw: Keyword): number {
  const volume = kw.volume || 0
  const kd = kw.kd || 50
  const cpc = kw.cpc || 0.5
  const status = getKeywordStatus(kw)
  
  // Status multiplier: Update/Optimize existing content = higher priority (quick wins)
  const statusMultiplier = 
    status === "update" ? 1.5 :      // Existing content, just refresh
    status === "optimize" ? 1.3 :    // Already ranking, improve
    status === "new" ? 1.0 :         // New content needed
    status === "ranking" ? 0.5 :     // Already doing well, low priority
    1.0
  
  // Trend multiplier
  const trendMultiplier = 
    kw.trend === "up" ? 1.2 :        // Growing topic
    kw.trend === "down" ? 0.7 :      // Declining
    1.0
  
  return Math.round((volume / 1000) * (100 - kd) * (cpc + 0.5) * statusMultiplier * trendMultiplier)
}

/**
 * Get relative time string from date
 */
export function getRelativeTime(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  const months = Math.floor(days / 30)
  
  if (seconds < 60) return "Just now"
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 30) return `${days}d ago`
  return `${months}mo ago`
}

/**
 * Get status color classes
 */
export function getStatusColor(status: KeywordStatus): string {
  switch (status) {
    case "new": return "bg-blue-500/15 text-blue-600 dark:text-blue-400"
    case "update": return "bg-amber-500/15 text-amber-600 dark:text-amber-400"
    case "optimize": return "bg-purple-500/15 text-purple-600 dark:text-purple-400"
    case "ranking": return "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
    default: return "bg-muted text-muted-foreground"
  }
}

/**
 * Get KD (keyword difficulty) color
 */
export function getKdColor(kd: number): string {
  if (kd <= 30) return "text-emerald-500"
  if (kd <= 50) return "text-amber-500"
  if (kd <= 70) return "text-orange-500"
  return "text-red-500"
}

/**
 * Get position change color
 */
export function getPositionChangeColor(change: number): string {
  if (change > 0) return "text-emerald-500"
  if (change < 0) return "text-red-500"
  return "text-muted-foreground"
}

/**
 * Format large numbers with K/M suffix
 */
export function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
  return num.toString()
}

/**
 * Generate mock keyword data for a source
 */
export function generateKeywordData(sourceId: string): Keyword[] {
  const sourceConfig = SOURCE_DATA_MAP[sourceId] || {}
  const sourceName = IMPORT_SOURCES.find(s => s.id === sourceId)?.label || (sourceId === "manual" ? "Manual Entry" : sourceId)
  
  const keywords = KEYWORDS_BY_SOURCE[sourceId] || []
  const intents: Keyword["intent"][] = ["informational", "transactional", "commercial", "navigational"]
  const trends: Keyword["trend"][] = ["up", "down", "stable"]
  const serpFeaturesList: SerpFeature[] = ["featured_snippet", "paa", "video", "images", "shopping", "reviews"]
  
  return keywords.map(({ kw, parent }) => {
    const volume = Math.floor(Math.random() * 15000) + 500
    const kd = Math.floor(Math.random() * 85) + 10
    const position = sourceConfig.position ? (Math.random() > 0.3 ? Math.floor(Math.random() * 50) + 1 : null) : null
    
    // Generate SERP features (random subset)
    const serpFeatures: SerpFeature[] = sourceConfig.serpFeatures 
      ? serpFeaturesList.filter(() => Math.random() > 0.6)
      : []
      
    // Generate Source Tag based on source
    let sourceTag = undefined
    if (sourceId === "competitor-gap") sourceTag = Math.random() > 0.5 ? "Missing" : "Weak"
    if (sourceId === "content-decay") sourceTag = "Traffic Loss"
    if (sourceId === "trend-spotter") sourceTag = "Breakout"
    if (sourceId === "snippet-stealer") sourceTag = Math.random() > 0.5 ? "List Snippet" : "Table Snippet"
    if (sourceId === "manual") sourceTag = "User Added"
    
    // Deep Dive Logic: Metrics Calculation
    // CPS (Clicks Per Search) = Clicks / Volume
    // Traffic Potential = Volume * CTR (assuming #1 ranking + long tail)
    const clickRate = Math.random() * 0.4 + 0.15 // 15% to 55% organic click rate
    const calculatedClicks = Math.floor(volume * clickRate)
      
    return {
      id: Math.random().toString(36).substring(2, 9),
      keyword: kw,
      source: sourceName,
      sourceTag,
      isSelected: false,
      
      volume: sourceConfig.volume ? volume : null,
      kd: sourceConfig.kd ? kd : null,
      cpc: sourceConfig.cpc ? Math.random() * 8 + 0.5 : null,
      
      intent: sourceConfig.intent ? intents[Math.floor(Math.random() * intents.length)] : null,
      trend: sourceConfig.trend ? trends[Math.floor(Math.random() * trends.length)] : null,
      trendPercent: sourceConfig.trendPercent || sourceConfig.trend ? Math.floor(Math.random() * 50) - 20 : null,
      
      trafficPotential: sourceConfig.trafficPotential ? Math.floor(volume * (clickRate + 0.1)) : null,
      clicks: sourceConfig.clicks ? calculatedClicks : null,
      cps: sourceConfig.cps ? parseFloat(clickRate.toFixed(2)) : null,
      businessPotential: Math.floor(Math.random() * 4) as BusinessPotential,
      
      position: position,
      positionChange: sourceConfig.positionChange && position ? Math.floor(Math.random() * 20) - 10 : null,
      rankingUrl: sourceConfig.rankingUrl && position ? `/blog/${kw.replace(/\s+/g, "-")}` : null,
      
      serpFeatures: serpFeatures,
      hasFeaturedSnippet: sourceConfig.hasFeaturedSnippet ? serpFeatures.includes("featured_snippet") || Math.random() > 0.7 : false,
      
      parentTopic: parent,
      wordCount: kw.split(" ").length,
      
      competition: sourceConfig.cpc ? (["low", "medium", "high"] as const)[Math.floor(Math.random() * 3)] : null,
      results: Math.floor(Math.random() * 500000000) + 1000000,
      
      lastUpdated: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
    }
  })
}
