// ============================================
// AI OVERVIEW CITATION TYPES
// ============================================
// Track and analyze AI Overview citations
// Identify opportunities to get cited by AI
// Provide optimization recommendations
// ============================================

/**
 * Citation Position in AI Overview
 */
export type CitationPosition = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8

/**
 * Content Type that AI cites
 */
export type CitedContentType =
  | "article"        // Blog post / article
  | "video"          // YouTube video
  | "forum"          // Reddit / Quora
  | "news"           // News article
  | "product"        // Product page
  | "documentation"  // Technical docs
  | "wikipedia"      // Wikipedia
  | "social"         // Social media
  | "pdf"            // PDF document
  | "image"          // Image source
  | "unknown"

/**
 * Entity Type mentioned in AI Overview
 */
export type EntityType =
  | "brand"          // Brand/Company name
  | "product"        // Product name
  | "person"         // Person name
  | "feature"        // Feature/capability
  | "price"          // Pricing info
  | "statistic"      // Numbers/stats
  | "comparison"     // Comparison point
  | "step"           // How-to step
  | "benefit"        // Benefit/advantage
  | "limitation"     // Limitation/drawback

/**
 * AI Overview Citation Source
 */
export interface AICitationSource {
  /** Position in citation list (1-8) */
  position: CitationPosition
  /** Domain of source */
  domain: string
  /** Full URL */
  url: string
  /** Page title */
  title: string
  /** Type of content */
  contentType: CitedContentType
  /** Domain authority estimate */
  domainAuthority: number
  /** Age in days since last update */
  contentAge: number
  /** Is this a weak source (Reddit, Quora, etc.)? */
  isWeakSource: boolean
  /** Word count estimate */
  wordCount?: number
  /** Has structured data? */
  hasStructuredData?: boolean
  /** Snippet shown in AI Overview */
  citedSnippet?: string
}

/**
 * Entity Mentioned in AI Overview
 */
export interface AIEntity {
  /** Entity name */
  name: string
  /** Entity type */
  type: EntityType
  /** How many times mentioned */
  frequency: number
  /** Is this entity from your content? */
  isFromYourContent: boolean
  /** Sources mentioning this entity */
  sources: string[]
}

/**
 * Citation Gap Analysis
 */
export interface CitationGap {
  /** Gap type */
  type: "entity" | "content_type" | "freshness" | "depth" | "format"
  /** Gap description */
  description: string
  /** How to fix this gap */
  recommendation: string
  /** Priority (1-5, 1 is highest) */
  priority: number
  /** Estimated impact */
  impact: "high" | "medium" | "low"
}

/**
 * Your Content Analysis vs AI Overview
 */
export interface YourContentAnalysis {
  /** Your current ranking position */
  rankPosition: number | null
  /** Are you cited in AI Overview? */
  isCited: boolean
  /** Citation position if cited */
  citationPosition: CitationPosition | null
  /** Entities from your content used */
  entitiesUsed: string[]
  /** Entities missing that competitors have */
  entitiesMissing: string[]
  /** Content gaps identified */
  contentGaps: CitationGap[]
  /** Match score with AI Overview answer */
  contentMatchScore: number
}

/**
 * Full AI Overview Analysis
 */
export interface AIOverviewAnalysis {
  /** Keyword analyzed */
  keyword: string
  /** Does this SERP have AI Overview? */
  hasAIOverview: boolean
  /** AI Overview type */
  overviewType: "paragraph" | "list" | "table" | "steps" | "comparison" | "mixed"
  /** AI answer snippet */
  answerSnippet: string
  /** Word count of AI answer */
  answerWordCount: number
  /** Citation sources */
  citations: AICitationSource[]
  /** Number of citations */
  citationCount: number
  /** Entities mentioned */
  entities: AIEntity[]
  /** Has video in Overview? */
  hasVideo: boolean
  /** Has images in Overview? */
  hasImages: boolean
  /** Has product carousel? */
  hasProductCarousel: boolean
  /** Your content analysis */
  yourContent: YourContentAnalysis
  /** Citation opportunity score (0-100) */
  opportunityScore: number
  /** Opportunity level */
  opportunityLevel: "excellent" | "high" | "medium" | "low" | "very_low"
  /** Top recommendations */
  recommendations: AIOptimizationRecommendation[]
  /** Analysis timestamp */
  analyzedAt: string
}

/**
 * AI Optimization Recommendation
 */
export interface AIOptimizationRecommendation {
  /** Recommendation ID */
  id: string
  /** Category */
  category: "content" | "structure" | "entity" | "format" | "freshness" | "authority"
  /** Priority (1-5) */
  priority: number
  /** Short title */
  title: string
  /** Detailed description */
  description: string
  /** Specific action to take */
  action: string
  /** Estimated impact */
  impact: "high" | "medium" | "low"
  /** Estimated effort */
  effort: "quick" | "medium" | "significant"
  /** Example if applicable */
  example?: string
}

/**
 * AI Overview Trend over time
 */
export interface AIOverviewTrend {
  date: string
  hasCitation: boolean
  citationPosition: CitationPosition | null
  opportunityScore: number
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get color for opportunity level
 */
export function getAIOpportunityColor(level: AIOverviewAnalysis["opportunityLevel"]): string {
  const colors = {
    excellent: "text-emerald-400",
    high: "text-green-400",
    medium: "text-amber-400",
    low: "text-orange-400",
    very_low: "text-red-400",
  }
  return colors[level]
}

/**
 * Get background color for opportunity level
 */
export function getAIOpportunityBgColor(level: AIOverviewAnalysis["opportunityLevel"]): string {
  const colors = {
    excellent: "bg-emerald-500/20 border-emerald-500/30",
    high: "bg-green-500/20 border-green-500/30",
    medium: "bg-amber-500/20 border-amber-500/30",
    low: "bg-orange-500/20 border-orange-500/30",
    very_low: "bg-red-500/20 border-red-500/30",
  }
  return colors[level]
}

/**
 * Get icon name for content type
 */
export function getContentTypeIcon(type: CitedContentType): string {
  const icons = {
    article: "FileText",
    video: "Video",
    forum: "MessageSquare",
    news: "Newspaper",
    product: "ShoppingBag",
    documentation: "Book",
    wikipedia: "Globe",
    social: "Share2",
    pdf: "FileText",
    image: "Image",
    unknown: "File",
  }
  return icons[type]
}

/**
 * Get label for content type
 */
export function getContentTypeLabel(type: CitedContentType): string {
  const labels = {
    article: "Article",
    video: "Video",
    forum: "Forum",
    news: "News",
    product: "Product",
    documentation: "Docs",
    wikipedia: "Wikipedia",
    social: "Social",
    pdf: "PDF",
    image: "Image",
    unknown: "Other",
  }
  return labels[type]
}

/**
 * Get label for entity type
 */
export function getEntityTypeLabel(type: EntityType): string {
  const labels = {
    brand: "Brand",
    product: "Product",
    person: "Person",
    feature: "Feature",
    price: "Price",
    statistic: "Statistic",
    comparison: "Comparison",
    step: "Step",
    benefit: "Benefit",
    limitation: "Limitation",
  }
  return labels[type]
}

/**
 * Calculate opportunity score from analysis
 */
export function calculateAIOpportunityScore(
  citations: AICitationSource[],
  yourContent: YourContentAnalysis
): number {
  let score = 0
  
  // Weak sources present = opportunity
  const weakSourceCount = citations.filter(c => c.isWeakSource).length
  score += weakSourceCount * 15 // 15 points per weak source
  
  // Old content = opportunity
  const avgAge = citations.reduce((sum, c) => sum + c.contentAge, 0) / citations.length
  if (avgAge > 365) score += 25
  else if (avgAge > 180) score += 20
  else if (avgAge > 90) score += 10
  
  // Not cited but ranking = opportunity
  if (!yourContent.isCited && yourContent.rankPosition && yourContent.rankPosition <= 10) {
    score += 20
  }
  
  // Missing entities = opportunity to add them
  score += Math.min(yourContent.entitiesMissing.length * 5, 25)
  
  // Content gaps = opportunity
  score += Math.min(yourContent.contentGaps.length * 5, 15)
  
  return Math.min(score, 100)
}

/**
 * Get opportunity level from score
 */
export function getAIOpportunityLevel(score: number): AIOverviewAnalysis["opportunityLevel"] {
  if (score >= 80) return "excellent"
  if (score >= 60) return "high"
  if (score >= 40) return "medium"
  if (score >= 20) return "low"
  return "very_low"
}

/**
 * Format domain for display
 */
export function formatDomain(url: string): string {
  try {
    const domain = new URL(url).hostname.replace("www.", "")
    return domain
  } catch {
    return url
  }
}

/**
 * Check if domain is weak source
 */
export function isWeakSourceDomain(domain: string): boolean {
  const weakDomains = [
    "reddit.com",
    "quora.com",
    "medium.com",
    "twitter.com",
    "x.com",
    "facebook.com",
    "linkedin.com",
    "pinterest.com",
  ]
  return weakDomains.some(weak => domain.includes(weak))
}

/**
 * Get priority label
 */
export function getPriorityLabel(priority: number): string {
  const labels = ["", "Critical", "High", "Medium", "Low", "Optional"]
  return labels[priority] || "Unknown"
}

/**
 * Get impact color
 */
export function getImpactColor(impact: "high" | "medium" | "low"): string {
  const colors = {
    high: "text-emerald-400",
    medium: "text-amber-400",
    low: "text-slate-400",
  }
  return colors[impact]
}

/**
 * Get effort label
 */
export function getEffortLabel(effort: "quick" | "medium" | "significant"): string {
  const labels = {
    quick: "⚡ Quick Win",
    medium: "🔧 Some Work",
    significant: "🏗️ Major Effort",
  }
  return labels[effort]
}
