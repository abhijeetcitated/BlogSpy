// ============================================
// GEO SCORE CALCULATOR
// ============================================
// Calculates Generative Engine Optimization score
// Measures AI citation vulnerability & opportunity
// Formula: GEO = w1(C_age) + w2(C_auth) + w3(M_gap) + w4(T_quality)
// ============================================

import {
  GEOScoreComponents,
  GEOAnalysis,
  GEOWeights,
  CitationSource,
  CitationSourceType,
  DEFAULT_GEO_WEIGHTS,
  getGEOOpportunityLevel,
} from "@/types/geo.types"

/**
 * Domain to citation type mapping
 */
const DOMAIN_TYPE_MAP: Record<string, CitationSourceType> = {
  // Forums
  "reddit.com": "reddit",
  "quora.com": "quora",
  "stackoverflow.com": "forum",
  "discord.com": "forum",
  
  // Official
  "wikipedia.org": "wikipedia",
  ".gov": "official",
  ".edu": "official",
  
  // News
  "techcrunch.com": "news",
  "theverge.com": "news",
  "wired.com": "news",
  "forbes.com": "news",
  "bloomberg.com": "news",
  
  // Video
  "youtube.com": "video",
  "vimeo.com": "video",
}

/**
 * Authority scores for different source types
 * Lower score = easier to beat = higher GEO opportunity
 */
const AUTHORITY_SCORES: Record<CitationSourceType, number> = {
  reddit: 85,      // Very weak - easy to beat
  quora: 80,       // Weak - easy to beat
  forum: 75,       // Weak - relatively easy
  pdf: 70,         // Medium-weak - often outdated
  blog: 50,        // Medium - depends on quality
  unknown: 45,     // Unknown - could be weak
  video: 40,       // Medium-strong - harder to beat
  news: 30,        // Strong - harder to beat
  official: 15,    // Very strong - hard to beat
  wikipedia: 10,   // Very strong - very hard to beat
}

/**
 * Detect citation source type from domain
 */
export function detectCitationSourceType(domain: string): CitationSourceType {
  const lowerDomain = domain.toLowerCase()
  
  for (const [pattern, type] of Object.entries(DOMAIN_TYPE_MAP)) {
    if (lowerDomain.includes(pattern)) {
      return type
    }
  }
  
  // Check for common blog patterns
  if (lowerDomain.includes("blog") || lowerDomain.includes("medium.com")) {
    return "blog"
  }
  
  return "unknown"
}

/**
 * Calculate Citation Freshness Score (0-25)
 * Older citations = Higher score (more opportunity)
 */
export function calculateCitationFreshnessScore(avgAgeDays: number): number {
  // Scoring based on average citation age
  // > 365 days = 25 points (very stale)
  // 180-365 days = 20 points (stale)
  // 90-180 days = 15 points (aging)
  // 30-90 days = 10 points (recent)
  // < 30 days = 5 points (fresh)
  
  if (avgAgeDays > 365) return 25
  if (avgAgeDays > 180) return 20
  if (avgAgeDays > 90) return 15
  if (avgAgeDays > 30) return 10
  return 5
}

/**
 * Calculate Authority Weakness Score (0-25)
 * Weaker sources in AI = Higher score (more opportunity)
 */
export function calculateAuthorityWeaknessScore(sources: CitationSource[]): number {
  if (sources.length === 0) return 15 // No sources = medium opportunity
  
  // Calculate average authority score
  const avgAuthority = sources.reduce((sum, source) => {
    return sum + AUTHORITY_SCORES[source.type]
  }, 0) / sources.length
  
  // Convert to 0-25 scale (higher authority weakness = more opportunity)
  return Math.min(25, Math.round(avgAuthority / 4))
}

/**
 * Calculate Media Gap Score (0-25)
 * Missing video/images = Higher score (more opportunity)
 */
export function calculateMediaGapScore(
  hasVideo: boolean,
  hasImage: boolean,
  queryIntent: "how-to" | "visual" | "informational" | "other"
): number {
  let score = 0
  
  // For how-to and visual queries, missing media is a big opportunity
  if (queryIntent === "how-to" || queryIntent === "visual") {
    if (!hasVideo) score += 15
    if (!hasImage) score += 10
  } else {
    // For other queries, missing media is smaller opportunity
    if (!hasVideo) score += 8
    if (!hasImage) score += 5
  }
  
  return Math.min(25, score)
}

/**
 * Calculate Text Quality Score (0-25)
 * Short/generic AI answers = Higher score (more opportunity)
 */
export function calculateTextQualityScore(
  aiAnswerLength: number,
  hasSpecificData: boolean,
  hasUncertainPhrases: boolean
): number {
  let score = 0
  
  // Short answers = more opportunity
  if (aiAnswerLength < 100) score += 12
  else if (aiAnswerLength < 200) score += 8
  else if (aiAnswerLength < 300) score += 5
  
  // Generic answer (no specific data)
  if (!hasSpecificData) score += 8
  
  // Uncertain phrases ("opinions vary", "some believe")
  if (hasUncertainPhrases) score += 5
  
  return Math.min(25, score)
}

/**
 * Calculate complete GEO Score
 */
export function calculateGEOScore(
  components: GEOScoreComponents,
  weights: GEOWeights = DEFAULT_GEO_WEIGHTS
): number {
  const rawScore = 
    (components.citationFreshness / 25) * 100 * weights.citationFreshness +
    (components.authorityWeakness / 25) * 100 * weights.authorityWeakness +
    (components.mediaGap / 25) * 100 * weights.mediaGap +
    (components.textQuality / 25) * 100 * weights.textQuality
  
  return Math.round(Math.min(100, Math.max(0, rawScore)))
}

/**
 * Generate GEO recommendations based on analysis
 */
export function generateGEORecommendations(
  components: GEOScoreComponents,
  sources: CitationSource[],
  hasVideo: boolean,
  hasImage: boolean
): string[] {
  const recommendations: string[] = []
  
  // Citation freshness recommendations
  if (components.citationFreshness >= 20) {
    recommendations.push("AI is citing outdated content (12+ months old). Create fresh, updated content to get cited.")
  } else if (components.citationFreshness >= 15) {
    recommendations.push("Some AI citations are aging. Update with recent data and statistics.")
  }
  
  // Authority weakness recommendations
  const weakSources = sources.filter(s => 
    s.type === "reddit" || s.type === "quora" || s.type === "forum"
  )
  if (weakSources.length > 0) {
    recommendations.push(`AI is citing ${weakSources.length} forum/Reddit sources. Create authoritative content to replace them.`)
  }
  
  // Media gap recommendations
  if (!hasVideo && components.mediaGap >= 15) {
    recommendations.push("🎬 HIGH VIDEO OPPORTUNITY: Create a video to get featured in AI Overview.")
  }
  if (!hasImage && components.mediaGap >= 10) {
    recommendations.push("Add infographics or diagrams to increase citation chances.")
  }
  
  // Text quality recommendations
  if (components.textQuality >= 15) {
    recommendations.push("AI answer is short/generic. Create comprehensive, definitive content.")
  }
  
  return recommendations
}

/**
 * Perform complete GEO Analysis for a keyword
 */
export function analyzeGEO(
  hasAIOverview: boolean,
  citationSources: CitationSource[],
  hasVideoInOverview: boolean,
  hasImageInOverview: boolean,
  aiAnswerLength: number,
  hasSpecificData: boolean,
  hasUncertainPhrases: boolean,
  queryIntent: "how-to" | "visual" | "informational" | "other" = "informational"
): GEOAnalysis {
  // Calculate average citation age
  const avgCitationAge = citationSources.length > 0
    ? citationSources.reduce((sum, s) => sum + s.age, 0) / citationSources.length
    : 180 // Default to 6 months if no data
  
  // Calculate component scores
  const components: GEOScoreComponents = {
    citationFreshness: calculateCitationFreshnessScore(avgCitationAge),
    authorityWeakness: calculateAuthorityWeaknessScore(citationSources),
    mediaGap: calculateMediaGapScore(hasVideoInOverview, hasImageInOverview, queryIntent),
    textQuality: calculateTextQualityScore(aiAnswerLength, hasSpecificData, hasUncertainPhrases)
  }
  
  // Calculate overall score
  const score = calculateGEOScore(components)
  
  // Generate recommendations
  const recommendations = generateGEORecommendations(
    components,
    citationSources,
    hasVideoInOverview,
    hasImageInOverview
  )
  
  return {
    score,
    components,
    opportunity: getGEOOpportunityLevel(score),
    hasAIOverview,
    citationSources,
    avgCitationAge: Math.round(avgCitationAge),
    hasVideoInOverview,
    hasImageInOverview,
    recommendations,
    analyzedAt: new Date().toISOString()
  }
}

/**
 * Generate mock GEO analysis for demo/testing
 */
export function generateMockGEOAnalysis(seed?: number): GEOAnalysis {
  const random = seed !== undefined 
    ? () => ((seed * 9301 + 49297) % 233280) / 233280
    : Math.random
  
  const hasAIOverview = random() > 0.3
  const hasVideoInOverview = random() > 0.6
  const hasImageInOverview = random() > 0.4
  
  const sourceTypes: CitationSourceType[] = ["reddit", "quora", "blog", "news", "forum", "official"]
  const numSources = Math.floor(random() * 4) + 1
  
  const citationSources: CitationSource[] = Array.from({ length: numSources }, (_, i) => ({
    domain: `source${i + 1}.com`,
    type: sourceTypes[Math.floor(random() * sourceTypes.length)],
    age: Math.floor(random() * 500) + 30,
    position: i + 1
  }))
  
  return analyzeGEO(
    hasAIOverview,
    citationSources,
    hasVideoInOverview,
    hasImageInOverview,
    Math.floor(random() * 400) + 50,
    random() > 0.5,
    random() > 0.7
  )
}

/**
 * Generate mock GEO score for keyword data
 */
export function generateMockGEOScore(keywordId: number | string): number {
  // Create deterministic but varied scores based on keyword ID
  const seed = typeof keywordId === 'string' 
    ? keywordId.split('').reduce((a, b) => a + b.charCodeAt(0), 0)
    : keywordId
  
  const baseScore = (seed * 17 + 23) % 100
  return Math.max(15, Math.min(95, baseScore))
}
