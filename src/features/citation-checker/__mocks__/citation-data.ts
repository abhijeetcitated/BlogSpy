// Citation Checker Mock Data Generator

import { COMPETITOR_DOMAINS, MOCK_KEYWORDS, AI_OVERVIEW_SNIPPETS } from "../constants"
import type { Citation, CitationStatus, CitationPosition, CitationSummary, CitationAnalysis, CitationTrendPoint } from "../types"

function generateMockCitations(domain: string): Citation[] {
  return MOCK_KEYWORDS.map((kw, index) => {
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

    const citationRoll = Math.random()
    let citationStatus: CitationStatus
    let position: CitationPosition | undefined
    let yourPosition: number | undefined

    if (citationRoll < 0.35) {
      citationStatus = "cited"
      position = ["top", "middle", "bottom", "inline"][Math.floor(Math.random() * 4)] as CitationPosition
      yourPosition = Math.floor(Math.random() * 3) + 1
    } else if (citationRoll < 0.45) {
      citationStatus = "partial"
      position = "inline"
      yourPosition = Math.floor(Math.random() * 3) + 2
    } else {
      citationStatus = "not-cited"
      position = undefined
      yourPosition = undefined
    }

    const totalCitations = Math.floor(Math.random() * 5) + 2
    const shuffledCompetitors = [...COMPETITOR_DOMAINS].sort(() => Math.random() - 0.5)
    const competitorsCited = shuffledCompetitors.slice(0, totalCitations - (citationStatus === "cited" ? 1 : 0))

    const citedDomains = citationStatus === "cited" || citationStatus === "partial"
      ? [domain, ...competitorsCited].slice(0, totalCitations)
      : competitorsCited.slice(0, totalCitations)

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

function calculateSummary(citations: Citation[]): CitationSummary {
  const keywordsWithAI = citations.filter((c) => c.aiOverviewPresent)
  const cited = citations.filter((c) => c.citationStatus === "cited")
  const partialCited = citations.filter((c) => c.citationStatus === "partial")
  const notCited = citations.filter((c) => c.citationStatus === "not-cited")
  const opportunityKeywords = keywordsWithAI.filter((c) => c.citationStatus === "not-cited")

  const citedWithPosition = cited.filter((c) => c.yourPosition)
  const avgPosition = citedWithPosition.length > 0
    ? citedWithPosition.reduce((sum, c) => sum + (c.yourPosition || 0), 0) / citedWithPosition.length
    : 0

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

export function generateCitationAnalysis(domain: string): CitationAnalysis {
  const citations = generateMockCitations(domain)
  const summary = calculateSummary(citations)

  const topCitedKeywords = citations
    .filter((c) => c.citationStatus === "cited" || c.citationStatus === "partial")
    .sort((a, b) => b.searchVolume - a.searchVolume)
    .slice(0, 5)

  const missedOpportunities = citations
    .filter((c) => c.aiOverviewPresent && c.citationStatus === "not-cited")
    .sort((a, b) => b.searchVolume - a.searchVolume)
    .slice(0, 5)

  const competitorComparison = COMPETITOR_DOMAINS.slice(0, 5).map((compDomain) => {
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

export function generateCitationTrend(months: number = 6): CitationTrendPoint[] {
  const trend: CitationTrendPoint[] = []
  const now = new Date()

  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(now)
    date.setMonth(date.getMonth() - i)
    
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
