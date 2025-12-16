// ============================================
// "AM I CITED?" ANALYZER
// ============================================
// Checks if domain is being cited in AI Overviews
// Bulk keyword citation checker
// ============================================

import {
  CitationAnalysis,
  CitationSummary,
  Citation,
  CitationStatus,
  CitationPosition,
  CitationTrendPoint,
} from "@/types/citation.types"

// ============================================
// MOCK DATA
// ============================================

const MOCK_COMPETITOR_DOMAINS = [
  "ahrefs.com",
  "semrush.com",
  "moz.com",
  "backlinko.com",
  "neilpatel.com",
  "searchenginejournal.com",
  "searchengineland.com",
  "wordstream.com",
  "hubspot.com",
  "contentmarketinginstitute.com",
]

const MOCK_KEYWORDS = [
  { keyword: "what is seo", volume: 110000, aiChance: 0.95 },
  { keyword: "how to do keyword research", volume: 22000, aiChance: 0.88 },
  { keyword: "best seo tools", volume: 33000, aiChance: 0.75 },
  { keyword: "on-page seo techniques", volume: 8100, aiChance: 0.82 },
  { keyword: "link building strategies", volume: 14800, aiChance: 0.78 },
  { keyword: "content marketing tips", volume: 12100, aiChance: 0.85 },
  { keyword: "google ranking factors", volume: 6600, aiChance: 0.92 },
  { keyword: "technical seo checklist", volume: 4400, aiChance: 0.80 },
  { keyword: "seo for beginners", volume: 27000, aiChance: 0.90 },
  { keyword: "local seo guide", volume: 9900, aiChance: 0.72 },
  { keyword: "ecommerce seo strategy", volume: 5400, aiChance: 0.68 },
  { keyword: "mobile seo best practices", volume: 3600, aiChance: 0.75 },
  { keyword: "voice search optimization", volume: 2400, aiChance: 0.88 },
  { keyword: "featured snippets guide", volume: 4800, aiChance: 0.85 },
  { keyword: "seo audit template", volume: 8200, aiChance: 0.65 },
  { keyword: "backlink analysis", volume: 5100, aiChance: 0.70 },
  { keyword: "competitor analysis seo", volume: 4200, aiChance: 0.78 },
  { keyword: "site speed optimization", volume: 7300, aiChance: 0.82 },
  { keyword: "schema markup guide", volume: 6100, aiChance: 0.88 },
  { keyword: "core web vitals", volume: 18100, aiChance: 0.92 },
]

const AI_OVERVIEW_SNIPPETS = [
  "SEO (Search Engine Optimization) is the practice of optimizing websites to rank higher in search engine results...",
  "Keyword research involves finding and analyzing search terms that people enter into search engines...",
  "On-page SEO refers to the practice of optimizing web page content for search engines...",
  "Link building is the process of acquiring hyperlinks from other websites to your own...",
  "Technical SEO focuses on improving the technical aspects of a website to increase its ranking...",
]

// ============================================
// GENERATOR FUNCTIONS
// ============================================

function generateMockCitations(domain: string): Citation[] {
  return MOCK_KEYWORDS.map((kw, index) => {
    // Determine if AI Overview is present
    const aiOverviewPresent = Math.random() < kw.aiChance

    if (!aiOverviewPresent) {
      return {
        id: `citation-${index}`,
        keyword: kw.keyword,
        searchVolume: kw.volume,
        aiOverviewPresent: false,
        citationStatus: "unknown" as CitationStatus,
        citedDomains: [],
        totalCitations: 0,
        competitorsCited: [],
        lastChecked: new Date().toISOString(),
        trend: "stable" as const,
      }
    }

    // Determine citation status
    const citationRoll = Math.random()
    let citationStatus: CitationStatus
    let position: CitationPosition | undefined
    let yourPosition: number | undefined

    if (citationRoll < 0.35) {
      // 35% chance of being cited
      citationStatus = "cited"
      position = ["top", "middle", "bottom", "inline"][Math.floor(Math.random() * 4)] as CitationPosition
      yourPosition = Math.floor(Math.random() * 3) + 1
    } else if (citationRoll < 0.45) {
      // 10% chance of partial citation
      citationStatus = "partial"
      position = "inline"
      yourPosition = Math.floor(Math.random() * 3) + 2
    } else {
      // 55% chance of not being cited
      citationStatus = "not-cited"
      position = undefined
      yourPosition = undefined
    }

    // Generate random cited domains
    const totalCitations = Math.floor(Math.random() * 5) + 2
    const shuffledCompetitors = [...MOCK_COMPETITOR_DOMAINS].sort(() => Math.random() - 0.5)
    const competitorsCited = shuffledCompetitors.slice(0, totalCitations - (citationStatus === "cited" ? 1 : 0))

    const citedDomains = citationStatus === "cited" || citationStatus === "partial"
      ? [domain, ...competitorsCited].slice(0, totalCitations)
      : competitorsCited.slice(0, totalCitations)

    // Determine trend
    const trendRoll = Math.random()
    let trend: Citation["trend"]
    if (trendRoll < 0.2) trend = "improving"
    else if (trendRoll < 0.35) trend = "declining"
    else if (trendRoll < 0.45) trend = "new"
    else trend = "stable"

    return {
      id: `citation-${index}`,
      keyword: kw.keyword,
      searchVolume: kw.volume,
      aiOverviewPresent,
      citationStatus,
      citedDomains,
      position,
      snippetPreview: AI_OVERVIEW_SNIPPETS[Math.floor(Math.random() * AI_OVERVIEW_SNIPPETS.length)],
      yourPosition,
      totalCitations,
      competitorsCited,
      lastChecked: new Date().toISOString(),
      trend,
    }
  })
}

function calculateSummary(citations: Citation[], domain: string): CitationSummary {
  const keywordsWithAI = citations.filter((c) => c.aiOverviewPresent)
  const cited = citations.filter((c) => c.citationStatus === "cited")
  const partialCited = citations.filter((c) => c.citationStatus === "partial")
  const notCited = citations.filter((c) => c.citationStatus === "not-cited")
  const opportunityKeywords = keywordsWithAI.filter((c) => c.citationStatus === "not-cited")

  // Calculate average position for cited keywords
  const citedWithPosition = cited.filter((c) => c.yourPosition)
  const avgPosition = citedWithPosition.length > 0
    ? citedWithPosition.reduce((sum, c) => sum + (c.yourPosition || 0), 0) / citedWithPosition.length
    : 0

  // Calculate top competitors
  const competitorCount = new Map<string, number>()
  citations.forEach((c) => {
    c.competitorsCited.forEach((comp) => {
      competitorCount.set(comp, (competitorCount.get(comp) || 0) + 1)
    })
  })

  const topCompetitors = Array.from(competitorCount.entries())
    .map(([domain, count]) => ({ domain, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  const citationRate = keywordsWithAI.length > 0
    ? Math.round(((cited.length + partialCited.length * 0.5) / keywordsWithAI.length) * 100)
    : 0

  return {
    totalKeywordsChecked: citations.length,
    keywordsWithAIOverview: keywordsWithAI.length,
    keywordsCited: cited.length,
    keywordsPartialCited: partialCited.length,
    keywordsNotCited: notCited.length,
    citationRate,
    avgPosition: Math.round(avgPosition * 10) / 10,
    topCompetitors,
    opportunityKeywords: opportunityKeywords.length,
  }
}

// ============================================
// PUBLIC FUNCTIONS
// ============================================

/**
 * Generate citation analysis for a domain
 */
export function generateCitationAnalysis(domain: string): CitationAnalysis {
  const citations = generateMockCitations(domain)
  const summary = calculateSummary(citations, domain)

  // Top cited keywords (sorted by volume)
  const topCitedKeywords = citations
    .filter((c) => c.citationStatus === "cited" || c.citationStatus === "partial")
    .sort((a, b) => b.searchVolume - a.searchVolume)
    .slice(0, 5)

  // Missed opportunities (not cited but high volume)
  const missedOpportunities = citations
    .filter((c) => c.aiOverviewPresent && c.citationStatus === "not-cited")
    .sort((a, b) => b.searchVolume - a.searchVolume)
    .slice(0, 5)

  // Competitor comparison
  const competitorComparison = MOCK_COMPETITOR_DOMAINS.slice(0, 5).map((compDomain) => {
    const cited = citations.filter((c) => c.citedDomains.includes(compDomain)).length
    const aiKeywords = citations.filter((c) => c.aiOverviewPresent).length
    return {
      domain: compDomain,
      citedCount: cited,
      notCitedCount: aiKeywords - cited,
      citationRate: aiKeywords > 0 ? Math.round((cited / aiKeywords) * 100) : 0,
    }
  }).sort((a, b) => b.citationRate - a.citationRate)

  return {
    domain,
    summary,
    citations,
    topCitedKeywords,
    missedOpportunities,
    competitorComparison,
    lastAnalyzed: new Date().toISOString(),
  }
}

/**
 * Generate citation trend data
 */
export function generateCitationTrend(months: number = 6): CitationTrendPoint[] {
  const trend: CitationTrendPoint[] = []
  const now = new Date()

  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(now)
    date.setMonth(date.getMonth() - i)
    
    // Simulate gradual improvement
    const baseRate = 20 + (months - i) * 3 + Math.random() * 10
    const totalAI = 15 + Math.floor(Math.random() * 5)
    const citedCount = Math.floor((baseRate / 100) * totalAI)

    trend.push({
      date: date.toISOString().split("T")[0],
      citedCount,
      totalAIOverviews: totalAI,
      citationRate: Math.round((citedCount / totalAI) * 100),
    })
  }

  return trend
}

/**
 * Get recommendations based on citation analysis
 */
export function getCitationRecommendations(analysis: CitationAnalysis): string[] {
  const recommendations: string[] = []
  const { summary, missedOpportunities } = analysis

  if (summary.citationRate < 20) {
    recommendations.push("🚨 Your citation rate is low. Focus on creating comprehensive, authoritative content.")
  } else if (summary.citationRate < 40) {
    recommendations.push("📈 Good progress! Target specific missed opportunity keywords to improve citation rate.")
  }

  if (missedOpportunities.length > 0) {
    const topMissed = missedOpportunities[0]
    recommendations.push(
      `💡 "${topMissed.keyword}" (${topMissed.searchVolume.toLocaleString()} vol) has AI Overview but you're not cited - high priority!`
    )
  }

  if (summary.avgPosition > 2) {
    recommendations.push("🎯 Work on improving citation position - aim for top 2 citations.")
  }

  if (summary.topCompetitors.length > 0) {
    const topComp = summary.topCompetitors[0]
    recommendations.push(
      `🔍 Study ${topComp.domain}'s content strategy - they're cited ${topComp.count} times in your keywords.`
    )
  }

  recommendations.push("📝 Add FAQ sections and structured data to improve AI Overview inclusion.")
  recommendations.push("🔗 Build topical authority with internal linking between related content.")

  return recommendations.slice(0, 5)
}

/**
 * Filter citations by criteria
 */
export function filterCitations(
  citations: Citation[],
  filters: {
    status?: CitationStatus[]
    hasAIOverview?: boolean
    minVolume?: number
    trend?: Citation["trend"][]
  }
): Citation[] {
  return citations.filter((c) => {
    if (filters.status?.length && !filters.status.includes(c.citationStatus)) return false
    if (filters.hasAIOverview !== undefined && c.aiOverviewPresent !== filters.hasAIOverview) return false
    if (filters.minVolume !== undefined && c.searchVolume < filters.minVolume) return false
    if (filters.trend?.length && !filters.trend.includes(c.trend)) return false
    return true
  })
}

/**
 * Calculate citation value (potential traffic)
 */
export function calculateCitationValue(citation: Citation): number {
  if (!citation.aiOverviewPresent || citation.citationStatus === "not-cited") {
    return 0
  }
  
  // Estimate CTR based on position
  let ctrMultiplier = 0
  switch (citation.position) {
    case "top":
      ctrMultiplier = 0.15
      break
    case "middle":
      ctrMultiplier = 0.08
      break
    case "bottom":
      ctrMultiplier = 0.04
      break
    case "inline":
      ctrMultiplier = 0.06
      break
    default:
      ctrMultiplier = 0.05
  }

  return Math.floor(citation.searchVolume * ctrMultiplier)
}
