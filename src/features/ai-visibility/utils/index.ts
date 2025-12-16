// AI Visibility Tracker Utilities

import { 
  AICitation,
  AIPlatform,
  AIVisibilityStats,
  PlatformStats,
  VisibilityTrendData,
  ContentVisibility,
  QueryAnalysis,
  CitationType,
} from "../types"
import { 
  SAMPLE_CITATIONS, 
  AI_PLATFORMS, 
  CITATION_TYPES,
  VISIBILITY_TIERS,
} from "../constants"

// Generate citations data
export function generateCitations(): AICitation[] {
  return SAMPLE_CITATIONS
}

// Calculate overall visibility stats
export function calculateVisibilityStats(citations: AICitation[]): AIVisibilityStats {
  if (citations.length === 0) {
    return {
      totalCitations: 0,
      uniqueQueries: 0,
      avgPosition: 0,
      visibilityScore: 0,
      platformLeader: "chatgpt",
      topCitedContent: "",
      weekOverWeekChange: 0,
      competitorComparison: 0,
    }
  }

  const uniqueQueries = new Set(citations.map(c => c.query)).size
  const avgPosition = citations.reduce((sum, c) => sum + c.position, 0) / citations.length
  
  // Count by platform
  const platformCounts: Record<string, number> = {}
  citations.forEach(c => {
    platformCounts[c.platform] = (platformCounts[c.platform] || 0) + 1
  })
  const platformLeader = Object.entries(platformCounts)
    .sort((a, b) => b[1] - a[1])[0]?.[0] as AIPlatform || "chatgpt"

  // Count by content
  const contentCounts: Record<string, number> = {}
  citations.forEach(c => {
    contentCounts[c.citedTitle] = (contentCounts[c.citedTitle] || 0) + 1
  })
  const topCitedContent = Object.entries(contentCounts)
    .sort((a, b) => b[1] - a[1])[0]?.[0] || ""

  // Calculate visibility score (0-100)
  const citationScore = Math.min(40, citations.length * 5)
  const positionScore = Math.max(0, 30 - (avgPosition - 1) * 10)
  const diversityScore = Math.min(30, Object.keys(platformCounts).length * 10)
  const visibilityScore = Math.round(citationScore + positionScore + diversityScore)

  return {
    totalCitations: citations.length,
    uniqueQueries,
    avgPosition: Math.round(avgPosition * 10) / 10,
    visibilityScore,
    platformLeader,
    topCitedContent,
    weekOverWeekChange: 15, // Demo value
    competitorComparison: 23, // Demo: 23% above industry avg
  }
}

// Get platform-specific stats
export function getPlatformStats(citations: AICitation[]): PlatformStats[] {
  const platformMap: Record<string, AICitation[]> = {}
  
  citations.forEach(c => {
    if (!platformMap[c.platform]) {
      platformMap[c.platform] = []
    }
    platformMap[c.platform].push(c)
  })

  return Object.entries(AI_PLATFORMS).map(([id, config]) => {
    const platformCitations = platformMap[id] || []
    const avgPos = platformCitations.length > 0
      ? platformCitations.reduce((sum, c) => sum + c.position, 0) / platformCitations.length
      : 0

    const queries = [...new Set(platformCitations.map(c => c.query))].slice(0, 3)

    return {
      platform: id as AIPlatform,
      citations: platformCitations.length,
      avgPosition: Math.round(avgPos * 10) / 10,
      topQueries: queries,
      trend: platformCitations.length > 2 ? "rising" : platformCitations.length > 0 ? "stable" : "declining",
      lastUpdated: platformCitations[0]?.timestamp || "",
    }
  }).sort((a, b) => b.citations - a.citations)
}

// Generate trend data for chart
export function generateTrendData(): VisibilityTrendData[] {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  
  return days.map((day, index) => {
    const base = 2 + Math.floor(index / 2)
    return {
      date: day,
      chatgpt: base + Math.floor(Math.random() * 3),
      claude: Math.floor(base * 0.6) + Math.floor(Math.random() * 2),
      perplexity: Math.floor(base * 0.8) + Math.floor(Math.random() * 2),
      gemini: Math.floor(base * 0.5) + Math.floor(Math.random() * 2),
      total: 0, // Will calculate below
    }
  }).map(d => ({
    ...d,
    total: d.chatgpt + d.claude + d.perplexity + d.gemini,
  }))
}

// Analyze queries for opportunities
export function analyzeQueries(citations: AICitation[]): QueryAnalysis[] {
  const queryMap: Record<string, AICitation[]> = {}
  
  citations.forEach(c => {
    if (!queryMap[c.query]) {
      queryMap[c.query] = []
    }
    queryMap[c.query].push(c)
  })

  return Object.entries(queryMap).map(([query, cits]) => {
    const platforms = [...new Set(cits.map(c => c.platform))]
    const avgPos = cits.reduce((sum, c) => sum + c.position, 0) / cits.length
    const topCompetitor = cits[0]?.competitors[0] || "N/A"
    
    // Opportunity based on position and frequency
    const opportunity = avgPos <= 1.5 ? "low" : avgPos <= 2.5 ? "medium" : "high"

    return {
      query,
      frequency: cits.length,
      platforms,
      yourPosition: Math.round(avgPos * 10) / 10,
      topCompetitor,
      competitorPosition: Math.round((avgPos + Math.random()) * 10) / 10,
      opportunity: opportunity as "high" | "medium" | "low",
    }
  }).sort((a, b) => b.frequency - a.frequency)
}

// Get visibility tier
export function getVisibilityTier(score: number) {
  if (score >= VISIBILITY_TIERS.excellent.min) return VISIBILITY_TIERS.excellent
  if (score >= VISIBILITY_TIERS.good.min) return VISIBILITY_TIERS.good
  if (score >= VISIBILITY_TIERS.moderate.min) return VISIBILITY_TIERS.moderate
  if (score >= VISIBILITY_TIERS.low.min) return VISIBILITY_TIERS.low
  return VISIBILITY_TIERS.minimal
}

// Get citation type config
export function getCitationTypeConfig(type: CitationType) {
  return CITATION_TYPES[type]
}

// Format relative time
export function formatRelativeTime(timestamp: string): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return "Today"
  if (diffDays === 1) return "Yesterday"
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  return `${Math.floor(diffDays / 30)} months ago`
}

// Format number with suffix
export function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
  return num.toString()
}
