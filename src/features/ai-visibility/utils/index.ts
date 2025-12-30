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
      trend: (platformCitations.length > 2 ? "rising" : platformCitations.length > 0 ? "stable" : "declining") as VisibilityTrend,
      lastUpdated: platformCitations[0]?.timestamp || "",
    }
  }).sort((a, b) => b.citations - a.citations)
}

// Generate trend data for chart (deterministic to avoid hydration mismatch)
// Updated: Added Google AIO data
export function generateTrendData(): VisibilityTrendData[] {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  
  // Use deterministic seed-based values instead of Math.random()
  const seedValues = [
    { googleAio: 2, chatgpt: 3, perplexity: 2, claude: 2, gemini: 1, appleSiri: 1 },
    { googleAio: 3, chatgpt: 4, perplexity: 3, claude: 2, gemini: 2, appleSiri: 1 },
    { googleAio: 3, chatgpt: 5, perplexity: 3, claude: 3, gemini: 2, appleSiri: 2 },
    { googleAio: 4, chatgpt: 5, perplexity: 4, claude: 3, gemini: 2, appleSiri: 2 },
    { googleAio: 5, chatgpt: 6, perplexity: 4, claude: 4, gemini: 3, appleSiri: 2 },
    { googleAio: 5, chatgpt: 7, perplexity: 5, claude: 4, gemini: 3, appleSiri: 3 },
    { googleAio: 6, chatgpt: 8, perplexity: 5, claude: 5, gemini: 4, appleSiri: 3 },
  ]
  
  return days.map((day, index) => {
    const values = seedValues[index]
    return {
      date: day,
      googleAio: values.googleAio,
      chatgpt: values.chatgpt,
      perplexity: values.perplexity,
      claude: values.claude,
      gemini: values.gemini,
      appleSiri: values.appleSiri,
      total: values.googleAio + values.chatgpt + values.perplexity + values.claude + values.gemini + values.appleSiri,
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

// NEW: Calculate Trust Metrics for CFO Header Cards
export function calculateTrustMetrics(citations: AICitation[]): TrustMetrics {
  // Demo values - in production, these would come from actual hallucination checks
  const totalChecks = citations.length + 5 // Simulating additional checks
  const correctAnswers = Math.floor(totalChecks * 0.85) // 85% accuracy demo
  const hallucinationCount = 1 // Demo: 1 hallucination detected
  
  // Trust Score: (Correct AI Answers / Total Checks) × 100
  const trustScore = Math.round((correctAnswers / totalChecks) * 100)
  
  // Hallucination Risk based on count and severity
  let hallucinationRisk: HallucinationRisk = 'low'
  if (hallucinationCount >= 3) hallucinationRisk = 'critical'
  else if (hallucinationCount >= 2) hallucinationRisk = 'high'
  else if (hallucinationCount >= 1) hallucinationRisk = 'medium'
  
  // Revenue at Risk: Traffic value from AI citations
  // Formula: (Estimated monthly traffic from AI × Avg CPC × Commercial intent %)
  const avgTrafficPerCitation = 150 // Demo value
  const avgCPC = 0.5 // Demo value
  const commercialIntentPercent = 0.4 // 40% of queries are commercial
  const revenueAtRisk = Math.round(
    citations.length * avgTrafficPerCitation * avgCPC * commercialIntentPercent
  )
  
  // AI Readiness Score: Technical checks (demo values)
  // In production: robots.txt + llms.txt + Schema + Speed
  const robotsTxtScore = 25 // 25/25 points
  const llmsTxtScore = 0 // 0/25 points (missing)
  const schemaScore = 20 // 20/25 points
  const speedScore = 23 // 23/25 points
  const aiReadinessScore = robotsTxtScore + llmsTxtScore + schemaScore + speedScore // 68%
  
  return {
    trustScore,
    hallucinationRisk,
    hallucinationCount,
    revenueAtRisk,
    aiReadinessScore,
    lastChecked: new Date().toISOString(),
  }
}
