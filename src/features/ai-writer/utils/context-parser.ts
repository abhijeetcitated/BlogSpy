// ============================================
// AI WRITER - Context Parser Utility
// ============================================
// Parses URL parameters from different features
// and creates a unified WriterContext

import type { 
  WriterContext, 
  SourceFeature, 
  SearchIntent, 
  ContentType,
  SERPFeatures,
  InternalLinkInstruction,
  ClusterOverviewContext
} from "../types"

/**
 * Parse URL search params into WriterContext
 */
export function parseWriterContext(searchParams: URLSearchParams): WriterContext | null {
  // Demo mode for testing - shows mock context banner
  const demoMode = searchParams.get("demo")
  if (demoMode === "context" || demoMode === "pillar") {
    return getDemoPillarContext()
  }
  if (demoMode === "cluster") {
    return getDemoClusterContext()
  }
  
  const source = searchParams.get("source") as SourceFeature || "direct"
  const keyword = searchParams.get("keyword") || searchParams.get("topic") || ""
  
  // If no keyword, return null (direct access without context)
  if (!keyword && source === "direct") {
    return null
  }
  
  // Parse secondary keywords (important for pillar detection)
  const secondaryKeywords = searchParams.get("secondary")?.split(",").filter(Boolean) || []
  const hasSecondaryKeywords = secondaryKeywords.length > 0
  
  // Parse numeric values
  const volume = searchParams.get("volume") ? parseInt(searchParams.get("volume")!) : undefined
  const difficulty = searchParams.get("difficulty") ? parseInt(searchParams.get("difficulty")!) : undefined
  const cpc = searchParams.get("cpc") ? parseFloat(searchParams.get("cpc")!) : undefined
  
  // Parse intent
  const intentParam = searchParams.get("intent") as SearchIntent
  const intent = intentParam || detectIntent(keyword, volume, cpc)
  
  // Parse parent pillar (for cluster articles - important for detection)
  const parentPillar = searchParams.get("parent_pillar") || undefined
  const hasParentPillar = !!parentPillar
  
  // Parse content type - use explicit type if provided, else detect
  const typeParam = searchParams.get("type") as ContentType
  const contentType = typeParam || detectContentType(
    keyword, 
    volume, 
    source, 
    hasSecondaryKeywords, 
    hasParentPillar
  )
  
  // Parse SERP features
  const serpFeaturesParam = searchParams.get("serp_features")?.split(",") || []
  const serpFeatures: SERPFeatures = {
    featuredSnippet: serpFeaturesParam.includes("featured_snippet"),
    peopleAlsoAsk: serpFeaturesParam.includes("paa"),
    videoCarousel: serpFeaturesParam.includes("video"),
    imagesPack: serpFeaturesParam.includes("images"),
    localPack: serpFeaturesParam.includes("local"),
    knowledgePanel: serpFeaturesParam.includes("knowledge"),
  }
  
  // Parse competitor data
  const competitorData = parseCompetitorData(searchParams)
  
  // Parse revival mode (from Content Decay)
  const revivalMode = parseRevivalMode(searchParams)
  
  // Parse trend data (from Trend Spotter)
  const trendData = parseTrendData(searchParams)
  
  // Parse pillar-specific data
  const pillarData = contentType === "pillar" ? parsePillarData(searchParams) : undefined
  
  // Parse cluster-specific data
  const clusterData = contentType === "cluster" ? parseClusterData(searchParams, parentPillar) : undefined
  
  // Parse internal links (from Topic Clusters linking matrix)
  const internalLinks = parseInternalLinks(searchParams)
  
  // Parse cluster overview (when "Load Entire Cluster" is used)
  const clusterOverview = parseClusterOverview(searchParams)
  
  return {
    source,
    keyword,
    secondaryKeywords,
    volume,
    difficulty,
    cpc,
    intent,
    contentType,
    parentPillar,
    pillarData,
    clusterData,
    serpFeatures,
    competitorData,
    revivalMode,
    trendData,
    internalLinks,
    clusterOverview,
  }
}

/**
 * Auto-detect search intent based on keyword patterns
 */
function detectIntent(keyword: string, volume?: number, cpc?: number): SearchIntent {
  const kw = keyword.toLowerCase()
  
  // Transactional signals
  if (kw.includes("buy") || kw.includes("price") || kw.includes("discount") || 
      kw.includes("deal") || kw.includes("coupon") || kw.includes("order")) {
    return "transactional"
  }
  
  // Commercial investigation signals
  if (kw.includes("best") || kw.includes("top") || kw.includes("review") ||
      kw.includes("vs") || kw.includes("comparison") || kw.includes("alternative")) {
    return "commercial"
  }
  
  // Navigational signals
  if (kw.includes("login") || kw.includes("signup") || kw.includes("official") ||
      kw.includes(".com") || kw.includes("website")) {
    return "navigational"
  }
  
  // High CPC often indicates commercial/transactional
  if (cpc && cpc > 3) {
    return "commercial"
  }
  
  // Default to informational
  return "informational"
}

/**
 * Auto-detect content type (pillar vs cluster vs standalone)
 * 
 * DETECTION LOGIC:
 * 
 * 1. EXPLICIT TYPE (from Topic Clusters page):
 *    - URL param "type=pillar" or "type=cluster" → Use directly
 * 
 * 2. SECONDARY KEYWORDS (most reliable indicator):
 *    - Has secondary keywords → PILLAR (broad topic with sub-topics)
 *    - No secondary keywords → Could be CLUSTER or STANDALONE
 * 
 * 3. PARENT PILLAR (from Topic Clusters):
 *    - Has parent_pillar param → Definitely CLUSTER
 * 
 * 4. VOLUME + WORD COUNT (fallback detection):
 *    - High volume (>5000) + Short keyword (1-3 words) → PILLAR
 *    - Low volume (<3000) + Long-tail (4+ words) → CLUSTER
 *    - Medium volume (3000-5000) → STANDALONE
 * 
 * 5. SOURCE FEATURE hints:
 *    - topic-clusters → Check parent_pillar for cluster, else pillar
 *    - keyword-magic → Use volume/word count detection
 *    - content-decay → Usually existing content, check original type
 */
function detectContentType(
  keyword: string, 
  volume?: number, 
  source?: SourceFeature,
  hasSecondaryKeywords?: boolean,
  hasParentPillar?: boolean
): ContentType {
  
  // 1. If has parent pillar, it's definitely a cluster article
  if (hasParentPillar) {
    return "cluster"
  }
  
  // 2. If has secondary keywords, it's likely a pillar page
  if (hasSecondaryKeywords) {
    return "pillar"
  }
  
  // 3. Source-specific logic
  if (source === "topic-clusters") {
    // Topic Clusters page should always send explicit type
    // If no parent_pillar and coming from clusters, assume pillar
    return "pillar"
  }
  
  // 4. Volume-based detection
  if (volume) {
    if (volume > 5000) {
      return "pillar" // High volume = broad topic
    }
    if (volume < 2000) {
      // Low volume - check word count
      const wordCount = keyword.split(" ").length
      if (wordCount >= 4) {
        return "cluster" // Long-tail + low volume = cluster
      }
    }
  }
  
  // 5. Word count fallback
  const wordCount = keyword.split(" ").length
  if (wordCount >= 5) {
    return "cluster" // Very long-tail is usually cluster
  }
  if (wordCount <= 2) {
    return "pillar" // Very short is usually pillar
  }
  
  // 6. Default to standalone for medium keywords
  return "standalone"
}

/**
 * Parse competitor data from URL params
 */
function parseCompetitorData(searchParams: URLSearchParams) {
  const avgWordCount = searchParams.get("comp_wordcount")
  const avgHeadings = searchParams.get("comp_headings")
  const avgImages = searchParams.get("comp_images")
  const topDomains = searchParams.get("competitors")?.split(",").filter(Boolean)
  
  if (!avgWordCount && !topDomains) {
    return undefined
  }
  
  return {
    avgWordCount: avgWordCount ? parseInt(avgWordCount) : 2000,
    avgHeadings: avgHeadings ? parseInt(avgHeadings) : 10,
    avgImages: avgImages ? parseInt(avgImages) : 5,
    topDomains: topDomains || [],
  }
}

/**
 * Parse revival mode data (from Content Decay)
 */
function parseRevivalMode(searchParams: URLSearchParams) {
  const mode = searchParams.get("mode")
  if (mode !== "revival") return undefined
  
  return {
    articleId: searchParams.get("articleId") || "",
    oldUrl: searchParams.get("old_url") || "",
    decayReason: searchParams.get("decay_reason") || "outdated",
    originalTraffic: parseInt(searchParams.get("original_traffic") || "0"),
    currentTraffic: parseInt(searchParams.get("current_traffic") || "0"),
  }
}

/**
 * Parse trend data (from Trend Spotter)
 */
function parseTrendData(searchParams: URLSearchParams) {
  const velocity = searchParams.get("velocity") || searchParams.get("trend_velocity")
  if (!velocity) return undefined
  
  return {
    velocity: velocity as "rising" | "stable" | "declining",
    score: parseInt(searchParams.get("trend_score") || "75"),
    newsAngle: searchParams.get("news_angle") === "true",
  }
}

/**
 * Get source feature display name
 */
export function getSourceDisplayName(source: SourceFeature): string {
  const names: Record<SourceFeature, string> = {
    "keyword-magic": "Keyword Magic",
    "competitor-gap": "Competitor Gap",
    "content-decay": "Content Decay",
    "topic-clusters": "Topic Clusters",
    "trend-spotter": "Trend Spotter",
    "content-roadmap": "Content Roadmap",
    "snippet-stealer": "Snippet Stealer",
    "command-center": "Command Center",
    "direct": "Direct",
  }
  return names[source] || source
}

/**
 * Get intent display info
 */
export function getIntentInfo(intent: SearchIntent | undefined | null): { label: string; color: string; description: string } {
  const defaultInfo = {
    label: "Unknown",
    color: "text-slate-400",
    description: "Search intent not determined",
  }
  
  if (!intent) return defaultInfo
  
  const info: Record<SearchIntent, { label: string; color: string; description: string }> = {
    informational: {
      label: "Informational",
      color: "text-blue-400",
      description: "User wants to learn or understand something",
    },
    commercial: {
      label: "Commercial Investigation",
      color: "text-amber-400",
      description: "User wants to compare and evaluate before purchasing",
    },
    transactional: {
      label: "Transactional",
      color: "text-emerald-400",
      description: "User is ready to buy or take action",
    },
    navigational: {
      label: "Navigational",
      color: "text-purple-400",
      description: "User is looking for a specific website or page",
    },
  }
  return info[intent] || defaultInfo
}

/**
 * Get content type display info
 */
export function getContentTypeInfo(type: ContentType | undefined | null): { label: string; color: string; description: string } {
  const defaultInfo = {
    label: "Article",
    color: "text-slate-400",
    description: "Standard blog article",
  }
  
  if (!type) return defaultInfo
  
  const info: Record<ContentType, { label: string; color: string; description: string }> = {
    pillar: {
      label: "Pillar Page",
      color: "text-emerald-400",
      description: "Comprehensive guide covering broad topic",
    },
    cluster: {
      label: "Cluster Article",
      color: "text-cyan-400",
      description: "Supporting article linking to pillar",
    },
    standalone: {
      label: "Standalone",
      color: "text-slate-400",
      description: "Independent article on specific topic",
    },
  }
  return info[type] || defaultInfo
}

/**
 * Parse pillar-specific data from URL params
 * Format: sub_keywords=keyword1:h2,keyword2:h3,keyword3:body
 */
function parsePillarData(searchParams: URLSearchParams): PillarData | undefined {
  const subKeywordsParam = searchParams.get("sub_keywords")
  const clusterCount = parseInt(searchParams.get("cluster_count") || "0")
  const recommendedLength = parseInt(searchParams.get("recommended_length") || "3500")
  const recommendedHeadings = parseInt(searchParams.get("recommended_headings") || "15")
  const coverageTopics = searchParams.get("coverage_topics")?.split(",").filter(Boolean) || []
  
  // Parse sub_keywords format: "keyword1:h2:5000,keyword2:h3:2000"
  const subKeywords: SubKeyword[] = subKeywordsParam
    ? subKeywordsParam.split(",").map(item => {
        const [keyword, placement = "body", volume] = item.split(":")
        return {
          keyword: decodeURIComponent(keyword),
          placement: (placement as "h2" | "h3" | "body" | "faq") || "body",
          volume: volume ? parseInt(volume) : undefined,
          importance: (placement === "h2" ? "primary" : "secondary") as "primary" | "secondary"
        }
      })
    : []
  
  // If no sub_keywords but we have secondary keywords, convert them
  if (subKeywords.length === 0) {
    const secondary = searchParams.get("secondary")?.split(",").filter(Boolean) || []
    secondary.forEach((kw, idx) => {
      subKeywords.push({
        keyword: decodeURIComponent(kw),
        placement: idx < 3 ? "h2" : idx < 6 ? "h3" : "body",
        importance: idx < 3 ? "primary" : "secondary"
      })
    })
  }
  
  if (subKeywords.length === 0 && clusterCount === 0) {
    return undefined
  }
  
  return {
    subKeywords,
    clusterCount,
    recommendedLength,
    recommendedHeadings,
    coverageTopics
  }
}

/**
 * Parse cluster-specific data from URL params
 */
function parseClusterData(searchParams: URLSearchParams, parentPillar?: string): ClusterData | undefined {
  if (!parentPillar) return undefined
  
  const pillarUrl = searchParams.get("pillar_url") || undefined
  const linkAnchor = searchParams.get("link_anchor") || parentPillar
  const recommendedLength = parseInt(searchParams.get("recommended_length") || "1800")
  const recommendedHeadings = parseInt(searchParams.get("recommended_headings") || "6")
  
  return {
    pillarKeyword: parentPillar,
    pillarUrl,
    linkAnchor,
    recommendedLength,
    recommendedHeadings
  }
}

/**
 * Parse internal linking instructions from URL params
 * Format: "toKeyword|anchorText|toUrl|placementHint~toKeyword2|..."
 */
function parseInternalLinks(searchParams: URLSearchParams): InternalLinkInstruction[] | undefined {
  const linksParam = searchParams.get("internal_links")
  if (!linksParam) return undefined
  
  try {
    const links = linksParam.split("~").map(linkStr => {
      const [toKeyword, anchorText, toUrl, placementHint] = linkStr.split("|")
      return {
        toKeyword: decodeURIComponent(toKeyword || ""),
        toUrl: toUrl ? decodeURIComponent(toUrl) : undefined,
        anchorText: decodeURIComponent(anchorText || toKeyword || ""),
        placementHint: decodeURIComponent(placementHint || "In relevant section"),
        isRequired: true,
        relevanceScore: 90
      }
    }).filter(link => link.toKeyword)
    
    return links.length > 0 ? links : undefined
  } catch {
    return undefined
  }
}

/**
 * Parse cluster overview when "Load Entire Cluster" is used
 * Format for pillars: "keyword|status|url~keyword2|status2|url2"
 */
function parseClusterOverview(searchParams: URLSearchParams): ClusterOverviewContext | undefined {
  const mode = searchParams.get("mode")
  if (mode !== "cluster-overview") return undefined
  
  const clusterName = searchParams.get("cluster_name") || "Topic Cluster"
  const pillarsParam = searchParams.get("pillars")
  const clustersParam = searchParams.get("clusters")
  
  const parsePillarsOrClusters = (param: string | null) => {
    if (!param) return []
    return param.split("~").map(item => {
      const [keyword, status, url] = item.split("|")
      return {
        keyword: decodeURIComponent(keyword || ""),
        status: status || "planned",
        url: url ? decodeURIComponent(url) : undefined
      }
    }).filter(item => item.keyword)
  }
  
  return {
    clusterName,
    pillars: parsePillarsOrClusters(pillarsParam),
    clusters: parsePillarsOrClusters(clustersParam)
  }
}

// Import SubKeyword type
import type { SubKeyword, PillarData, ClusterData } from "../types"

/**
 * DEMO: Pillar context for testing
 * Use: /ai-writer?demo=pillar or /ai-writer?demo=context
 */
function getDemoPillarContext(): WriterContext {
  return {
    source: "topic-clusters",
    keyword: "AI Writing Tools",
    secondaryKeywords: [],
    volume: 18500,
    difficulty: 52,
    cpc: 4.80,
    intent: "commercial",
    contentType: "pillar",
    pillarData: {
      subKeywords: [
        { keyword: "best ai writing software", placement: "h2", volume: 8500, importance: "primary" },
        { keyword: "ai content generator", placement: "h2", volume: 12000, importance: "primary" },
        { keyword: "gpt writing assistant", placement: "h2", volume: 5200, importance: "primary" },
        { keyword: "automated content creation", placement: "h3", volume: 3100, importance: "secondary" },
        { keyword: "ai copywriting tools", placement: "h3", volume: 4800, importance: "secondary" },
        { keyword: "ai blog writer", placement: "body", volume: 2900, importance: "secondary" },
        { keyword: "machine learning content", placement: "faq", volume: 1200, importance: "secondary" },
      ],
      clusterCount: 8,
      recommendedLength: 3500,
      recommendedHeadings: 15,
      coverageTopics: ["What is AI Writing", "Best Tools Comparison", "How to Use", "Pricing", "Pros & Cons"]
    },
    serpFeatures: {
      featuredSnippet: true,
      peopleAlsoAsk: true,
      videoCarousel: true,
      imagesPack: false,
      localPack: false,
      knowledgePanel: false,
    },
    competitorData: {
      avgWordCount: 3200,
      avgHeadings: 15,
      avgImages: 8,
      topDomains: ["jasper.ai", "copy.ai", "writesonic.com"],
    },
  }
}

/**
 * DEMO: Cluster context for testing
 * Use: /ai-writer?demo=cluster
 */
function getDemoClusterContext(): WriterContext {
  return {
    source: "topic-clusters",
    keyword: "how to use jasper ai for blogging",
    secondaryKeywords: [],
    volume: 2400,
    difficulty: 28,
    cpc: 2.10,
    intent: "informational",
    contentType: "cluster",
    parentPillar: "AI Writing Tools",
    clusterData: {
      pillarKeyword: "AI Writing Tools",
      pillarUrl: "/blog/ai-writing-tools",
      linkAnchor: "AI writing tools guide",
      recommendedLength: 1800,
      recommendedHeadings: 6
    },
    serpFeatures: {
      featuredSnippet: false,
      peopleAlsoAsk: true,
      videoCarousel: false,
      imagesPack: false,
      localPack: false,
      knowledgePanel: false,
    },
  }
}

/**
 * DEV ONLY: Get demo context when no real context is provided
 * This makes Smart Context Banner always visible during development
 * 
 * TODO: [AUTH] Remove this function before production deployment
 * In production, return null when no context - don't show banner
 */
export function getDemoContextForDev(): WriterContext {
  // Default to pillar demo for development testing
  return getDemoPillarContext()
}
