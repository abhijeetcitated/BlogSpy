// ============================================
// AI OVERVIEW CITATION ANALYZER
// ============================================
// Analyze AI Overview citations
// Generate optimization recommendations
// Calculate citation opportunity scores
// ============================================

import {
  type AIOverviewAnalysis,
  type AICitationSource,
  type AIEntity,
  type AIOptimizationRecommendation,
  type YourContentAnalysis,
  type CitationGap,
  type CitedContentType,
  type EntityType,
  type CitationPosition,
  calculateAIOpportunityScore,
  getAIOpportunityLevel,
  isWeakSourceDomain,
} from "@/types/ai-overview.types"

// ============================================
// MAIN ANALYSIS FUNCTION
// ============================================

/**
 * Analyze AI Overview for a keyword
 */
export function analyzeAIOverview(
  keyword: string,
  citations: AICitationSource[],
  entities: AIEntity[],
  yourRankPosition: number | null = null,
  yourCitationPosition: CitationPosition | null = null
): AIOverviewAnalysis {
  // Build your content analysis
  const yourContent = analyzeYourContent(
    citations,
    entities,
    yourRankPosition,
    yourCitationPosition
  )

  // Calculate opportunity score
  const opportunityScore = calculateAIOpportunityScore(citations, yourContent)
  const opportunityLevel = getAIOpportunityLevel(opportunityScore)

  // Generate recommendations
  const recommendations = generateRecommendations(
    citations,
    entities,
    yourContent,
    opportunityScore
  )

  // Determine overview type
  const overviewType = determineOverviewType(entities)

  // Generate answer snippet (mock for demo)
  const answerSnippet = generateMockAnswerSnippet(keyword)

  return {
    keyword,
    hasAIOverview: true,
    overviewType,
    answerSnippet,
    answerWordCount: answerSnippet.split(" ").length,
    citations,
    citationCount: citations.length,
    entities,
    hasVideo: citations.some(c => c.contentType === "video"),
    hasImages: Math.random() > 0.5,
    hasProductCarousel: entities.some(e => e.type === "product"),
    yourContent,
    opportunityScore,
    opportunityLevel,
    recommendations,
    analyzedAt: new Date().toISOString(),
  }
}

// ============================================
// ANALYZE YOUR CONTENT
// ============================================

function analyzeYourContent(
  citations: AICitationSource[],
  entities: AIEntity[],
  yourRankPosition: number | null,
  yourCitationPosition: CitationPosition | null
): YourContentAnalysis {
  const isCited = yourCitationPosition !== null
  
  // Entities your content uses
  const entitiesUsed = entities
    .filter(e => e.isFromYourContent)
    .map(e => e.name)
  
  // Entities missing from your content
  const entitiesMissing = entities
    .filter(e => !e.isFromYourContent && e.frequency >= 2)
    .map(e => e.name)
  
  // Identify content gaps
  const contentGaps = identifyContentGaps(citations, entities, isCited, yourRankPosition)
  
  // Calculate content match score
  const contentMatchScore = calculateContentMatchScore(entities, isCited)

  return {
    rankPosition: yourRankPosition,
    isCited,
    citationPosition: yourCitationPosition,
    entitiesUsed,
    entitiesMissing,
    contentGaps,
    contentMatchScore,
  }
}

// ============================================
// IDENTIFY CONTENT GAPS
// ============================================

function identifyContentGaps(
  citations: AICitationSource[],
  entities: AIEntity[],
  isCited: boolean,
  yourRankPosition: number | null
): CitationGap[] {
  const gaps: CitationGap[] = []

  // Check for entity gaps
  const missingEntities = entities.filter(e => !e.isFromYourContent && e.frequency >= 2)
  if (missingEntities.length > 0) {
    gaps.push({
      type: "entity",
      description: `Missing ${missingEntities.length} key entities that AI frequently mentions`,
      recommendation: `Add these entities to your content: ${missingEntities.slice(0, 3).map(e => e.name).join(", ")}`,
      priority: 1,
      impact: "high",
    })
  }

  // Check for content freshness
  const avgAge = citations.reduce((sum, c) => sum + c.contentAge, 0) / citations.length
  if (avgAge > 180) {
    gaps.push({
      type: "freshness",
      description: "Current citations are outdated (avg " + Math.round(avgAge) + " days old)",
      recommendation: "Publish fresh, updated content with recent data and examples",
      priority: 2,
      impact: "high",
    })
  }

  // Check for format gaps
  const hasListContent = entities.some(e => e.type === "step")
  if (hasListContent && !citations.some(c => c.hasStructuredData)) {
    gaps.push({
      type: "format",
      description: "AI Overview uses list format but sources lack structured data",
      recommendation: "Add HowTo or FAQ schema markup to your content",
      priority: 2,
      impact: "medium",
    })
  }

  // Check for depth gaps
  const avgWordCount = citations.reduce((sum, c) => sum + (c.wordCount || 1500), 0) / citations.length
  gaps.push({
    type: "depth",
    description: `Average cited content is ${Math.round(avgWordCount)} words`,
    recommendation: avgWordCount > 2000 
      ? "Create comprehensive content (2500+ words) to compete"
      : "Focus on quality and depth rather than length",
    priority: 3,
    impact: "medium",
  })

  // Check if ranking but not cited
  if (!isCited && yourRankPosition && yourRankPosition <= 10) {
    gaps.push({
      type: "content_type",
      description: `You rank #${yourRankPosition} but aren't cited in AI Overview`,
      recommendation: "Restructure content to directly answer the query in first paragraph",
      priority: 1,
      impact: "high",
    })
  }

  return gaps.sort((a, b) => a.priority - b.priority)
}

// ============================================
// GENERATE RECOMMENDATIONS
// ============================================

function generateRecommendations(
  citations: AICitationSource[],
  entities: AIEntity[],
  yourContent: YourContentAnalysis,
  opportunityScore: number
): AIOptimizationRecommendation[] {
  const recommendations: AIOptimizationRecommendation[] = []
  let idCounter = 1

  // Check for weak sources to target
  const weakSources = citations.filter(c => c.isWeakSource)
  if (weakSources.length > 0) {
    recommendations.push({
      id: `rec_${idCounter++}`,
      category: "authority",
      priority: 1,
      title: "Replace Weak Citation Sources",
      description: `AI is citing ${weakSources.length} weak source(s): ${weakSources.map(w => w.domain).join(", ")}`,
      action: "Create authoritative content that directly answers the query better than these forum posts",
      impact: "high",
      effort: "medium",
      example: weakSources[0] 
        ? `Outperform ${weakSources[0].domain}'s content which has ${weakSources[0].wordCount || "~1000"} words`
        : undefined,
    })
  }

  // Check for old content opportunity
  const oldCitations = citations.filter(c => c.contentAge > 180)
  if (oldCitations.length > 0) {
    recommendations.push({
      id: `rec_${idCounter++}`,
      category: "freshness",
      priority: 1,
      title: "Capitalize on Outdated Citations",
      description: `${oldCitations.length} citation(s) are 6+ months old. Fresh content can displace them.`,
      action: "Publish updated content with 2024/2025 data, recent examples, and current best practices",
      impact: "high",
      effort: "medium",
    })
  }

  // Missing entities recommendation
  if (yourContent.entitiesMissing.length > 0) {
    recommendations.push({
      id: `rec_${idCounter++}`,
      category: "entity",
      priority: 2,
      title: "Add Missing Key Entities",
      description: `Your content is missing ${yourContent.entitiesMissing.length} entities that AI frequently mentions`,
      action: `Add these to your content: "${yourContent.entitiesMissing.slice(0, 5).join('", "')}"`,
      impact: "high",
      effort: "quick",
    })
  }

  // Structured data recommendation
  const hasNoStructuredData = citations.filter(c => !c.hasStructuredData).length > citations.length / 2
  if (hasNoStructuredData) {
    recommendations.push({
      id: `rec_${idCounter++}`,
      category: "structure",
      priority: 2,
      title: "Add Structured Data Markup",
      description: "Most cited sources lack structured data - opportunity to stand out",
      action: "Add FAQ schema, HowTo schema, or Article schema to your content",
      impact: "medium",
      effort: "quick",
      example: `<script type="application/ld+json">{"@type":"FAQPage",...}</script>`,
    })
  }

  // Video content recommendation
  const hasVideoSource = citations.some(c => c.contentType === "video")
  if (!hasVideoSource) {
    recommendations.push({
      id: `rec_${idCounter++}`,
      category: "format",
      priority: 3,
      title: "Create Video Content",
      description: "No video sources in current AI Overview - video opportunity exists",
      action: "Create a YouTube video covering this topic to get video citation",
      impact: "medium",
      effort: "significant",
    })
  }

  // Direct answer recommendation
  if (!yourContent.isCited && yourContent.rankPosition && yourContent.rankPosition <= 5) {
    recommendations.push({
      id: `rec_${idCounter++}`,
      category: "content",
      priority: 1,
      title: "Optimize for Direct Answer",
      description: `You rank #${yourContent.rankPosition} but aren't cited. Restructure for AI extraction.`,
      action: "Add a clear, concise answer in the first 100 words. Use definition format: '[Topic] is...'",
      impact: "high",
      effort: "quick",
      example: `Start with: "AI agents are autonomous software programs that can perceive, reason, and take actions..."`,
    })
  }

  // Comparison/Table recommendation
  const hasComparisonEntity = entities.some(e => e.type === "comparison")
  if (hasComparisonEntity) {
    recommendations.push({
      id: `rec_${idCounter++}`,
      category: "format",
      priority: 3,
      title: "Add Comparison Table",
      description: "AI Overview includes comparison elements - tables get preferential citation",
      action: "Add a clear comparison table with pros/cons or feature matrix",
      impact: "medium",
      effort: "quick",
    })
  }

  // Statistics recommendation
  const hasStatEntity = entities.some(e => e.type === "statistic")
  if (hasStatEntity) {
    recommendations.push({
      id: `rec_${idCounter++}`,
      category: "entity",
      priority: 3,
      title: "Include Statistics & Data",
      description: "AI Overview cites statistics - include recent data points",
      action: "Add relevant statistics with sources (e.g., '78% of marketers use AI tools in 2024 [Source]')",
      impact: "medium",
      effort: "medium",
    })
  }

  // Content depth recommendation
  const avgWordCount = citations.reduce((sum, c) => sum + (c.wordCount || 1500), 0) / citations.length
  if (avgWordCount < 2000) {
    recommendations.push({
      id: `rec_${idCounter++}`,
      category: "content",
      priority: 4,
      title: "Maintain Optimal Content Depth",
      description: `Current citations average ${Math.round(avgWordCount)} words`,
      action: "Create comprehensive content (1500-2500 words) covering all aspects",
      impact: "low",
      effort: "medium",
    })
  }

  return recommendations.sort((a, b) => a.priority - b.priority).slice(0, 6)
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function determineOverviewType(entities: AIEntity[]): AIOverviewAnalysis["overviewType"] {
  const hasSteps = entities.some(e => e.type === "step")
  const hasComparison = entities.some(e => e.type === "comparison")
  const hasProduct = entities.some(e => e.type === "product")
  
  if (hasSteps) return "steps"
  if (hasComparison) return "comparison"
  if (hasProduct) return "list"
  
  // Random for demo
  const types: AIOverviewAnalysis["overviewType"][] = ["paragraph", "list", "mixed"]
  return types[Math.floor(Math.random() * types.length)]
}

function calculateContentMatchScore(entities: AIEntity[], isCited: boolean): number {
  if (isCited) return 85 + Math.floor(Math.random() * 15)
  
  const fromYourContent = entities.filter(e => e.isFromYourContent).length
  const total = entities.length || 1
  const entityMatch = (fromYourContent / total) * 60
  
  return Math.round(entityMatch + Math.random() * 25)
}

function generateMockAnswerSnippet(keyword: string): string {
  const snippets = [
    `${keyword} refers to advanced technology solutions that help users accomplish tasks more efficiently. Key features include automation, intelligent processing, and seamless integration with existing workflows.`,
    `When evaluating ${keyword}, consider factors like ease of use, pricing, integrations, and specific features that match your needs. The best options typically offer a balance of functionality and affordability.`,
    `${keyword} has evolved significantly in recent years, with new solutions offering improved performance, better user experiences, and more competitive pricing. Popular options include both established players and innovative newcomers.`,
  ]
  return snippets[Math.floor(Math.random() * snippets.length)]
}

// ============================================
// MOCK DATA GENERATORS
// ============================================

/**
 * Generate mock AI Overview analysis for demo
 */
export function generateMockAIOverviewAnalysis(
  keyword: string,
  hasWeakSources: boolean = true
): AIOverviewAnalysis {
  // Generate mock citations
  const citations = generateMockCitations(hasWeakSources)
  
  // Generate mock entities
  const entities = generateMockEntities(keyword)
  
  // Random rank position
  const yourRankPosition = Math.floor(Math.random() * 10) + 1
  
  // Random citation status
  const yourCitationPosition = Math.random() > 0.6 
    ? (Math.floor(Math.random() * 3) + 1) as CitationPosition
    : null

  return analyzeAIOverview(
    keyword,
    citations,
    entities,
    yourRankPosition,
    yourCitationPosition
  )
}

function generateMockCitations(hasWeakSources: boolean): AICitationSource[] {
  const sources: AICitationSource[] = [
    {
      position: 1,
      domain: "techcrunch.com",
      url: "https://techcrunch.com/article",
      title: "Complete Guide to AI Tools in 2024",
      contentType: "news",
      domainAuthority: 92,
      contentAge: 45,
      isWeakSource: false,
      wordCount: 2400,
      hasStructuredData: true,
    },
    {
      position: 2,
      domain: hasWeakSources ? "reddit.com" : "forbes.com",
      url: hasWeakSources ? "https://reddit.com/r/technology/post" : "https://forbes.com/article",
      title: hasWeakSources ? "r/technology - Best AI tools discussion" : "Forbes Tech Guide",
      contentType: hasWeakSources ? "forum" : "news",
      domainAuthority: hasWeakSources ? 91 : 94,
      contentAge: hasWeakSources ? 280 : 60,
      isWeakSource: hasWeakSources,
      wordCount: hasWeakSources ? 850 : 3200,
      hasStructuredData: !hasWeakSources,
    },
    {
      position: 3,
      domain: "hubspot.com",
      url: "https://hubspot.com/blog/ai-guide",
      title: "The Ultimate AI Guide for Businesses",
      contentType: "article",
      domainAuthority: 89,
      contentAge: 120,
      isWeakSource: false,
      wordCount: 4500,
      hasStructuredData: true,
    },
    {
      position: 4,
      domain: hasWeakSources ? "quora.com" : "gartner.com",
      url: hasWeakSources ? "https://quora.com/answer" : "https://gartner.com/research",
      title: hasWeakSources ? "What are the best AI tools? - Quora" : "Gartner AI Research",
      contentType: hasWeakSources ? "forum" : "documentation",
      domainAuthority: hasWeakSources ? 88 : 90,
      contentAge: hasWeakSources ? 320 : 90,
      isWeakSource: hasWeakSources,
      wordCount: hasWeakSources ? 620 : 2800,
      hasStructuredData: !hasWeakSources,
    },
  ]

  // Randomly add a 5th source
  if (Math.random() > 0.3) {
    sources.push({
      position: 5,
      domain: "youtube.com",
      url: "https://youtube.com/watch?v=example",
      title: "AI Tools Explained - Video Guide",
      contentType: "video",
      domainAuthority: 99,
      contentAge: 180,
      isWeakSource: false,
      wordCount: 0,
      hasStructuredData: true,
    })
  }

  return sources
}

function generateMockEntities(keyword: string): AIEntity[] {
  const baseEntities: AIEntity[] = [
    {
      name: "ChatGPT",
      type: "product",
      frequency: 4,
      isFromYourContent: Math.random() > 0.3,
      sources: ["techcrunch.com", "hubspot.com"],
    },
    {
      name: "Claude",
      type: "product",
      frequency: 3,
      isFromYourContent: Math.random() > 0.4,
      sources: ["forbes.com", "hubspot.com"],
    },
    {
      name: "OpenAI",
      type: "brand",
      frequency: 5,
      isFromYourContent: Math.random() > 0.2,
      sources: ["techcrunch.com", "forbes.com", "gartner.com"],
    },
    {
      name: "pricing",
      type: "price",
      frequency: 3,
      isFromYourContent: Math.random() > 0.5,
      sources: ["hubspot.com"],
    },
    {
      name: "automation",
      type: "feature",
      frequency: 4,
      isFromYourContent: Math.random() > 0.3,
      sources: ["techcrunch.com", "hubspot.com"],
    },
    {
      name: "78% adoption rate",
      type: "statistic",
      frequency: 2,
      isFromYourContent: Math.random() > 0.6,
      sources: ["gartner.com"],
    },
    {
      name: "integration",
      type: "feature",
      frequency: 3,
      isFromYourContent: Math.random() > 0.4,
      sources: ["hubspot.com", "forbes.com"],
    },
    {
      name: "vs competitors",
      type: "comparison",
      frequency: 2,
      isFromYourContent: Math.random() > 0.5,
      sources: ["techcrunch.com"],
    },
  ]

  // Add some keyword-specific entities
  const words = keyword.toLowerCase().split(" ")
  if (words.includes("ai") || words.includes("artificial")) {
    baseEntities.push({
      name: "machine learning",
      type: "feature",
      frequency: 3,
      isFromYourContent: Math.random() > 0.4,
      sources: ["techcrunch.com", "gartner.com"],
    })
  }

  return baseEntities
}

/**
 * Compare your content against AI Overview
 */
export function getAICitationStatus(
  analysis: AIOverviewAnalysis
): {
  status: "cited" | "not_cited" | "no_ai_overview"
  message: string
  color: string
} {
  if (!analysis.hasAIOverview) {
    return {
      status: "no_ai_overview",
      message: "No AI Overview for this keyword",
      color: "text-slate-400",
    }
  }

  if (analysis.yourContent.isCited) {
    return {
      status: "cited",
      message: `Cited at position #${analysis.yourContent.citationPosition}`,
      color: "text-emerald-400",
    }
  }

  return {
    status: "not_cited",
    message: analysis.yourContent.rankPosition 
      ? `Rank #${analysis.yourContent.rankPosition} but not cited`
      : "Not ranking or cited",
    color: "text-amber-400",
  }
}
