// AI Visibility Tracker Utilities

import { 
  AICitation,
  AIPlatform,
  AIVisibilityStats,
  PlatformStats,
  VisibilityTrendData,
  VisibilityTrend,
  ContentVisibility,
  QueryAnalysis,
  CitationType,
  TrustMetrics,
  HallucinationRisk,
  NetSentiment,
  CompetitorBenchmark,
  DashboardMetrics,
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

  // Calculate real week-over-week change from citation timestamps
  const now = new Date()
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)

  const thisWeekCitations = citations.filter(c => {
    const ts = new Date(c.timestamp)
    return ts >= oneWeekAgo && ts <= now
  }).length
  const lastWeekCitations = citations.filter(c => {
    const ts = new Date(c.timestamp)
    return ts >= twoWeeksAgo && ts < oneWeekAgo
  }).length

  const weekOverWeekChange = lastWeekCitations > 0
    ? Math.round(((thisWeekCitations - lastWeekCitations) / lastWeekCitations) * 100)
    : thisWeekCitations > 0 ? 100 : 0

  // Competitor comparison: your mentions vs avg competitor mentions
  const totalCompetitorMentions = citations.reduce((sum, c) => sum + c.competitors.length, 0)
  const uniqueCompetitors = new Set(citations.flatMap(c => c.competitors)).size
  const avgCompetitorMentions = uniqueCompetitors > 0 ? totalCompetitorMentions / uniqueCompetitors : 0
  const competitorComparison = avgCompetitorMentions > 0
    ? Math.round(((citations.length - avgCompetitorMentions) / avgCompetitorMentions) * 100)
    : citations.length > 0 ? 100 : 0

  return {
    totalCitations: citations.length,
    uniqueQueries,
    avgPosition: Math.round(avgPosition * 10) / 10,
    visibilityScore,
    platformLeader,
    topCitedContent,
    weekOverWeekChange,
    competitorComparison,
  }
}

// Get platform-specific stats
export function getPlatformStats(citations: AICitation[]): PlatformStats[] {
  // Deduplicate: keep only the LATEST citation per (query + platform) combination
  // This prevents citation counts from inflating when same keyword is scanned multiple times
  const latestCitations = new Map<string, AICitation>()
  citations.forEach(c => {
    const key = `${c.platform}::${c.query}`
    const existing = latestCitations.get(key)
    if (!existing || c.timestamp > existing.timestamp) {
      latestCitations.set(key, c)
    }
  })
  const dedupedCitations = Array.from(latestCitations.values())

  const platformMap: Record<string, AICitation[]> = {}
  
  dedupedCitations.forEach(c => {
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
      trend: (platformCitations.length > 2 ? "rising" : platformCitations.length > 0 ? "stable" : "declining") as VisibilityTrend,
      lastUpdated: platformCitations[0]?.timestamp || "",
    }
  }).sort((a, b) => b.citations - a.citations)
}

// Generate trend data for chart (deterministic to avoid hydration mismatch)
export function generateTrendData(): VisibilityTrendData[] {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  
  // Use deterministic seed-based values instead of Math.random()
  const seedValues = [
    { googleAio: 2, googleAiMode: 1, chatgpt: 3, perplexity: 2, claude: 2, gemini: 1 },
    { googleAio: 3, googleAiMode: 2, chatgpt: 4, perplexity: 3, claude: 2, gemini: 2 },
    { googleAio: 3, googleAiMode: 2, chatgpt: 5, perplexity: 3, claude: 3, gemini: 2 },
    { googleAio: 4, googleAiMode: 3, chatgpt: 5, perplexity: 4, claude: 3, gemini: 2 },
    { googleAio: 5, googleAiMode: 3, chatgpt: 6, perplexity: 4, claude: 4, gemini: 3 },
    { googleAio: 5, googleAiMode: 4, chatgpt: 7, perplexity: 5, claude: 4, gemini: 3 },
    { googleAio: 6, googleAiMode: 5, chatgpt: 8, perplexity: 5, claude: 5, gemini: 4 },
  ]
  
  return days.map((day, index) => {
    const values = seedValues[index]
    return {
      date: day,
      googleAio: values.googleAio,
      googleAiMode: values.googleAiMode,
      chatgpt: values.chatgpt,
      perplexity: values.perplexity,
      claude: values.claude,
      gemini: values.gemini,
      total: values.googleAio + values.googleAiMode + values.chatgpt + values.perplexity + values.claude + values.gemini,
    }
  })
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
      competitorPosition: Math.round((avgPos + 0.5) * 10) / 10,
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

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// NEW: Dashboard Overview Metrics (Row 1 Cards — Visibility Score, SOV, Sentiment)
// ═══════════════════════════════════════════════════════════════════════════════════════════════

/**
 * Calculate Share of Voice: your brand mentions / total mentions (yours + competitors) × 100
 * In demo mode, uses competitor counts from citations. In production, will use real scan data.
 */
export function calculateShareOfVoice(citations: AICitation[]): number {
  if (citations.length === 0) return 0
  
  // Count total competitor mentions across all citations
  const totalCompetitorMentions = citations.reduce((sum, c) => sum + c.competitors.length, 0)
  
  // Your mentions = number of citations where YOU appear
  const yourMentions = citations.length
  
  // Total = yours + all competitor appearances
  const totalMentions = yourMentions + totalCompetitorMentions
  
  if (totalMentions === 0) return 0
  return Math.round((yourMentions / totalMentions) * 100)
}

/**
 * Calculate Net Sentiment: aggregate positive/neutral/negative across all citations.
 * Score = ((positive - negative) / total) × 100  → range: -100 to +100
 */
export function calculateNetSentiment(citations: AICitation[]): NetSentiment {
  if (citations.length === 0) {
    return { positive: 0, neutral: 0, negative: 0, total: 0, score: 0, percentage: 0 }
  }
  
  const positive = citations.filter(c => c.sentiment === 'positive').length
  const neutral = citations.filter(c => c.sentiment === 'neutral').length
  const negative = citations.filter(c => c.sentiment === 'negative').length
  const total = citations.length
  
  // Net score: -100 (all negative) to +100 (all positive)
  const score = Math.round(((positive - negative) / total) * 100)
  
  // Percentage positive (for simple card display)
  const percentage = Math.round((positive / total) * 100)
  
  return { positive, neutral, negative, total, score, percentage }
}

/**
 * Build competitor benchmarks from citation data.
 * Groups competitor appearances and calculates their mock SOV/sentiment.
 */
export function calculateCompetitorBenchmarks(citations: AICitation[]): CompetitorBenchmark[] {
  if (citations.length === 0) return []
  
  // Aggregate all competitor mentions
  const competitorMap: Record<string, {
    mentions: number
    positions: number[]
    platforms: Set<AIPlatform>
  }> = {}
  
  citations.forEach(c => {
    c.competitors.forEach(competitor => {
      if (!competitorMap[competitor]) {
        competitorMap[competitor] = { mentions: 0, positions: [], platforms: new Set() }
      }
      competitorMap[competitor].mentions++
      competitorMap[competitor].positions.push(c.position + 1) // Competitor is 1 position behind
      competitorMap[competitor].platforms.add(c.platform)
    })
  })
  
  // Calculate total for SOV
  const yourMentions = citations.length
  const allCompetitorMentions = Object.values(competitorMap).reduce((sum, c) => sum + c.mentions, 0)
  const totalPool = yourMentions + allCompetitorMentions
  
  return Object.entries(competitorMap)
    .map(([domain, data]) => ({
      domain,
      mentions: data.mentions,
      avgPosition: Math.round((data.positions.reduce((s, p) => s + p, 0) / data.positions.length) * 10) / 10,
      sentiment: 'neutral' as const,
      platforms: Array.from(data.platforms),
      shareOfVoice: totalPool > 0 ? Math.round((data.mentions / totalPool) * 100) : 0,
    }))
    .sort((a, b) => b.mentions - a.mentions)
    .slice(0, 5) // Top 5 competitors
}

/**
 * Calculate all dashboard overview metrics in one call.
 * Used by the dashboard to populate Row 1 cards + competitor chart.
 */
export function calculateDashboardMetrics(citations: AICitation[]): DashboardMetrics {
  const stats = calculateVisibilityStats(citations)
  return {
    visibilityScore: stats.visibilityScore,
    shareOfVoice: calculateShareOfVoice(citations),
    netSentiment: calculateNetSentiment(citations),
    competitors: calculateCompetitorBenchmarks(citations),
  }
}

// Calculate Trust Metrics from real citation data
export function calculateTrustMetrics(citations: AICitation[]): TrustMetrics {
  if (citations.length === 0) {
    return {
      trustScore: 0,
      hallucinationRisk: 'low',
      hallucinationCount: 0,
      revenueAtRisk: 0,
      aiReadinessScore: 0,
      lastChecked: new Date().toISOString(),
    }
  }

  // Trust Score: based on positive/neutral sentiment ratio across citations
  const positiveCitations = citations.filter(c => c.sentiment === 'positive').length
  const neutralCitations = citations.filter(c => c.sentiment === 'neutral').length
  const negativeCitations = citations.filter(c => c.sentiment === 'negative').length
  const trustScore = Math.round(((positiveCitations + neutralCitations) / citations.length) * 100)

  // Hallucination count: negative citations indicate potential inaccuracies
  const hallucinationCount = negativeCitations

  // Hallucination Risk based on negative ratio
  const negativeRatio = negativeCitations / citations.length
  let hallucinationRisk: HallucinationRisk = 'low'
  if (negativeRatio >= 0.3) hallucinationRisk = 'critical'
  else if (negativeRatio >= 0.2) hallucinationRisk = 'high'
  else if (negativeRatio >= 0.1) hallucinationRisk = 'medium'

  // Revenue at Risk: estimated from citation coverage gaps
  // Uses platform coverage ratio and citation count to estimate risk
  const platforms = new Set(citations.map(c => c.platform))
  const totalPlatforms = 6 // Total tracked platforms
  const coverageGap = totalPlatforms - platforms.size
  const avgTrafficPerCitation = 120 // Conservative estimate per citation/month
  const revenueAtRisk = Math.round(coverageGap * avgTrafficPerCitation * 0.5)

  // AI Readiness Score: based on actual platform diversity + position quality
  const platformDiversityScore = Math.round((platforms.size / totalPlatforms) * 40) // 0-40
  const avgPosition = citations.reduce((sum, c) => sum + c.position, 0) / citations.length
  const positionScore = Math.round(Math.max(0, 30 - (avgPosition - 1) * 10)) // 0-30
  const citationTypeSet = new Set(citations.map(c => c.citationType))
  const citationDiversityScore = Math.round(Math.min(30, citationTypeSet.size * 10)) // 0-30
  const aiReadinessScore = Math.min(100, platformDiversityScore + positionScore + citationDiversityScore)

  return {
    trustScore,
    hallucinationRisk,
    hallucinationCount,
    revenueAtRisk,
    aiReadinessScore,
    lastChecked: citations[0]?.timestamp || new Date().toISOString(),
  }
}
