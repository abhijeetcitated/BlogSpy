// ============================================
// MOCK DATA - Complete Topic Cluster with Linking Matrix
// ============================================
// Demo data showing AI-powered internal linking recommendations

import type { TopicClusterFull, PillarArticle, ClusterArticle, InternalLinkRecommendation } from "../types"

// ============================================
// AI Writing Tools - Complete Topic Cluster
// ============================================

const AI_WRITING_PILLARS: PillarArticle[] = [
  {
    id: "pillar-ai-writing-tools",
    keyword: "AI Writing Tools",
    fullTitle: "The Ultimate Guide to AI Writing Tools in 2025",
    volume: 45000,
    kd: 52,
    intent: "informational",
    status: "published",
    url: "/blog/ai-writing-tools-guide",
    subKeywords: [
      { keyword: "best ai writing software", volume: 8500, placement: "h2", importance: "primary" },
      { keyword: "ai content generator", volume: 12000, placement: "h2", importance: "primary" },
      { keyword: "automated content creation", volume: 3100, placement: "h3", importance: "secondary" },
      { keyword: "ai blog writer", volume: 2900, placement: "h3", importance: "secondary" },
      { keyword: "content automation tools", volume: 1800, placement: "body", importance: "secondary" },
      { keyword: "machine learning writing", volume: 2200, placement: "body", importance: "secondary" },
      { keyword: "is ai writing worth it", volume: 1500, placement: "faq", importance: "secondary" },
    ],
    clusterIds: ["cluster-chatgpt-jasper", "cluster-ai-ecommerce", "cluster-ai-blog", "cluster-ai-seo", "cluster-ai-pricing", "cluster-ai-beginners"],
    recommendedWordCount: 4500,
    recommendedHeadings: 18
  },
  {
    id: "pillar-ai-content-strategy",
    keyword: "AI Content Strategy",
    fullTitle: "AI Content Strategy: How to Scale Content Production with AI",
    volume: 28000,
    kd: 45,
    intent: "informational",
    status: "draft",
    subKeywords: [
      { keyword: "ai content planning", volume: 5200, placement: "h2", importance: "primary" },
      { keyword: "content automation workflow", volume: 3800, placement: "h2", importance: "primary" },
      { keyword: "ai editorial calendar", volume: 2100, placement: "h3", importance: "secondary" },
      { keyword: "scaling content with ai", volume: 1900, placement: "body", importance: "secondary" },
      { keyword: "ai content repurposing", volume: 2400, placement: "h3", importance: "secondary" },
    ],
    clusterIds: ["cluster-content-calendar", "cluster-content-repurpose"],
    recommendedWordCount: 4000,
    recommendedHeadings: 15
  }
]

const AI_WRITING_CLUSTERS: ClusterArticle[] = [
  {
    id: "cluster-chatgpt-jasper",
    keyword: "ChatGPT vs Jasper",
    fullTitle: "ChatGPT vs Jasper: Which AI Writer is Better in 2025?",
    volume: 18500,
    kd: 35,
    intent: "commercial",
    status: "published",
    url: "/blog/chatgpt-vs-jasper",
    pillarId: "pillar-ai-writing-tools",
    recommendedWordCount: 2500,
    recommendedHeadings: 8
  },
  {
    id: "cluster-ai-ecommerce",
    keyword: "AI Writing for E-commerce",
    fullTitle: "AI Writing for E-commerce: Automate Product Descriptions",
    volume: 8200,
    kd: 28,
    intent: "commercial",
    status: "published",
    url: "/blog/ai-writing-ecommerce",
    pillarId: "pillar-ai-writing-tools",
    recommendedWordCount: 2000,
    recommendedHeadings: 7
  },
  {
    id: "cluster-ai-blog",
    keyword: "Best AI Blog Writers",
    fullTitle: "10 Best AI Blog Writers for Content Creators",
    volume: 12500,
    kd: 42,
    intent: "commercial",
    status: "draft",
    pillarId: "pillar-ai-writing-tools",
    recommendedWordCount: 2800,
    recommendedHeadings: 12
  },
  {
    id: "cluster-ai-seo",
    keyword: "AI Writing for SEO",
    fullTitle: "How to Use AI Writing for SEO Content",
    volume: 9800,
    kd: 38,
    intent: "informational",
    status: "planned",
    pillarId: "pillar-ai-writing-tools",
    recommendedWordCount: 2200,
    recommendedHeadings: 8
  },
  {
    id: "cluster-ai-pricing",
    keyword: "AI Writing Tool Pricing",
    fullTitle: "AI Writing Tool Pricing Comparison: Free vs Paid",
    volume: 6500,
    kd: 22,
    intent: "commercial",
    status: "planned",
    pillarId: "pillar-ai-writing-tools",
    recommendedWordCount: 1800,
    recommendedHeadings: 6
  },
  {
    id: "cluster-ai-beginners",
    keyword: "AI Writing for Beginners",
    fullTitle: "AI Writing for Beginners: Getting Started Guide",
    volume: 7800,
    kd: 25,
    intent: "informational",
    status: "planned",
    pillarId: "pillar-ai-writing-tools",
    recommendedWordCount: 2000,
    recommendedHeadings: 7
  },
  {
    id: "cluster-content-calendar",
    keyword: "AI Content Calendar",
    fullTitle: "How to Create an AI-Powered Content Calendar",
    volume: 4200,
    kd: 32,
    intent: "informational",
    status: "planned",
    pillarId: "pillar-ai-content-strategy",
    recommendedWordCount: 1800,
    recommendedHeadings: 6
  },
  {
    id: "cluster-content-repurpose",
    keyword: "AI Content Repurposing",
    fullTitle: "AI Content Repurposing: Turn 1 Blog into 10 Pieces",
    volume: 3800,
    kd: 28,
    intent: "informational",
    status: "planned",
    pillarId: "pillar-ai-content-strategy",
    recommendedWordCount: 1600,
    recommendedHeadings: 5
  }
]

// ============================================
// AI-GENERATED INTERNAL LINKING MATRIX
// ============================================
// This is what AI would recommend based on semantic relevance

const AI_WRITING_LINKS: InternalLinkRecommendation[] = [
  // Pillar 1: AI Writing Tools -> Clusters
  {
    id: "link-1",
    fromId: "pillar-ai-writing-tools",
    fromKeyword: "AI Writing Tools",
    toId: "cluster-chatgpt-jasper",
    toKeyword: "ChatGPT vs Jasper",
    toUrl: "/blog/chatgpt-vs-jasper",
    anchorText: "ChatGPT vs Jasper comparison",
    placementHint: "In the 'Best AI Writing Software' section",
    relevanceScore: 95,
    isRequired: true
  },
  {
    id: "link-2",
    fromId: "pillar-ai-writing-tools",
    fromKeyword: "AI Writing Tools",
    toId: "cluster-ai-ecommerce",
    toKeyword: "AI Writing for E-commerce",
    toUrl: "/blog/ai-writing-ecommerce",
    anchorText: "AI writing for e-commerce",
    placementHint: "In the 'Use Cases' section",
    relevanceScore: 88,
    isRequired: true
  },
  {
    id: "link-3",
    fromId: "pillar-ai-writing-tools",
    fromKeyword: "AI Writing Tools",
    toId: "cluster-ai-blog",
    toKeyword: "Best AI Blog Writers",
    anchorText: "best AI blog writing tools",
    placementHint: "In the introduction or 'AI Content Generator' section",
    relevanceScore: 92,
    isRequired: true
  },
  {
    id: "link-4",
    fromId: "pillar-ai-writing-tools",
    fromKeyword: "AI Writing Tools",
    toId: "cluster-ai-pricing",
    toKeyword: "AI Writing Tool Pricing",
    anchorText: "AI writing tool pricing guide",
    placementHint: "In the conclusion or 'How to Choose' section",
    relevanceScore: 85,
    isRequired: false
  },
  
  // Cluster -> Pillar (Required backlinks)
  {
    id: "link-5",
    fromId: "cluster-chatgpt-jasper",
    fromKeyword: "ChatGPT vs Jasper",
    toId: "pillar-ai-writing-tools",
    toKeyword: "AI Writing Tools",
    toUrl: "/blog/ai-writing-tools-guide",
    anchorText: "comprehensive guide to AI writing tools",
    placementHint: "In the introduction paragraph",
    relevanceScore: 100,
    isRequired: true
  },
  {
    id: "link-6",
    fromId: "cluster-ai-ecommerce",
    fromKeyword: "AI Writing for E-commerce",
    toId: "pillar-ai-writing-tools",
    toKeyword: "AI Writing Tools",
    toUrl: "/blog/ai-writing-tools-guide",
    anchorText: "AI writing tools guide",
    placementHint: "In the conclusion",
    relevanceScore: 100,
    isRequired: true
  },
  {
    id: "link-7",
    fromId: "cluster-ai-blog",
    fromKeyword: "Best AI Blog Writers",
    toId: "pillar-ai-writing-tools",
    toKeyword: "AI Writing Tools",
    toUrl: "/blog/ai-writing-tools-guide",
    anchorText: "complete AI writing tools guide",
    placementHint: "In the introduction",
    relevanceScore: 100,
    isRequired: true
  },
  
  // Cluster -> Cluster (Semantic connections)
  {
    id: "link-8",
    fromId: "cluster-chatgpt-jasper",
    fromKeyword: "ChatGPT vs Jasper",
    toId: "cluster-ai-pricing",
    toKeyword: "AI Writing Tool Pricing",
    anchorText: "pricing comparison",
    placementHint: "In the 'Pricing' section when comparing costs",
    relevanceScore: 90,
    isRequired: false
  },
  {
    id: "link-9",
    fromId: "cluster-chatgpt-jasper",
    fromKeyword: "ChatGPT vs Jasper",
    toId: "cluster-ai-blog",
    toKeyword: "Best AI Blog Writers",
    anchorText: "other top AI blog writers",
    placementHint: "In the conclusion for alternatives",
    relevanceScore: 82,
    isRequired: false
  },
  {
    id: "link-10",
    fromId: "cluster-ai-ecommerce",
    fromKeyword: "AI Writing for E-commerce",
    toId: "cluster-chatgpt-jasper",
    toKeyword: "ChatGPT vs Jasper",
    toUrl: "/blog/chatgpt-vs-jasper",
    anchorText: "ChatGPT vs Jasper for e-commerce",
    placementHint: "When mentioning tool options",
    relevanceScore: 78,
    isRequired: false
  },
  {
    id: "link-11",
    fromId: "cluster-ai-beginners",
    fromKeyword: "AI Writing for Beginners",
    toId: "cluster-ai-pricing",
    toKeyword: "AI Writing Tool Pricing",
    anchorText: "AI writing tool costs",
    placementHint: "In the 'Getting Started' or budget section",
    relevanceScore: 85,
    isRequired: false
  },
  {
    id: "link-12",
    fromId: "cluster-ai-beginners",
    fromKeyword: "AI Writing for Beginners",
    toId: "cluster-chatgpt-jasper",
    toKeyword: "ChatGPT vs Jasper",
    toUrl: "/blog/chatgpt-vs-jasper",
    anchorText: "popular AI writing tools compared",
    placementHint: "When recommending first tools to try",
    relevanceScore: 88,
    isRequired: false
  },
  
  // Cross-pillar connections
  {
    id: "link-13",
    fromId: "pillar-ai-writing-tools",
    fromKeyword: "AI Writing Tools",
    toId: "pillar-ai-content-strategy",
    toKeyword: "AI Content Strategy",
    anchorText: "AI content strategy guide",
    placementHint: "In the 'Scaling Content' section",
    relevanceScore: 75,
    isRequired: false
  },
  {
    id: "link-14",
    fromId: "pillar-ai-content-strategy",
    fromKeyword: "AI Content Strategy",
    toId: "pillar-ai-writing-tools",
    toKeyword: "AI Writing Tools",
    toUrl: "/blog/ai-writing-tools-guide",
    anchorText: "best AI writing tools",
    placementHint: "In the tools recommendation section",
    relevanceScore: 80,
    isRequired: false
  }
]

// ============================================
// COMPLETE TOPIC CLUSTER
// ============================================

export const MOCK_TOPIC_CLUSTER_FULL: TopicClusterFull = {
  id: "tc-ai-writing",
  name: "AI Writing & Content Strategy",
  description: "Complete content hub covering AI writing tools, content automation, and AI-powered content strategy",
  createdAt: "2025-01-15",
  
  pillars: AI_WRITING_PILLARS,
  clusters: AI_WRITING_CLUSTERS,
  linkingMatrix: AI_WRITING_LINKS,
  
  // Calculated stats
  totalVolume: AI_WRITING_PILLARS.reduce((sum, p) => sum + p.volume, 0) + 
               AI_WRITING_CLUSTERS.reduce((sum, c) => sum + c.volume, 0),
  avgKd: Math.round(
    (AI_WRITING_PILLARS.reduce((sum, p) => sum + p.kd, 0) + 
     AI_WRITING_CLUSTERS.reduce((sum, c) => sum + c.kd, 0)) / 
    (AI_WRITING_PILLARS.length + AI_WRITING_CLUSTERS.length)
  ),
  articleCount: AI_WRITING_PILLARS.length + AI_WRITING_CLUSTERS.length,
  publishedCount: AI_WRITING_PILLARS.filter(p => p.status === "published").length +
                  AI_WRITING_CLUSTERS.filter(c => c.status === "published").length
}

// Helper to get links for a specific article
export function getLinksForArticle(articleId: string) {
  return MOCK_TOPIC_CLUSTER_FULL.linkingMatrix.filter(
    link => link.fromId === articleId
  )
}

// Helper to get articles linking to this article
export function getLinksToArticle(articleId: string) {
  return MOCK_TOPIC_CLUSTER_FULL.linkingMatrix.filter(
    link => link.toId === articleId
  )
}

// Helper to build AI Writer URL with cluster context
export function buildAIWriterUrl(
  articleId: string,
  articleType: "pillar" | "cluster"
): string {
  const cluster = MOCK_TOPIC_CLUSTER_FULL
  const article = articleType === "pillar"
    ? cluster.pillars.find(p => p.id === articleId)
    : cluster.clusters.find(c => c.id === articleId)
  
  if (!article) return "/ai-writer"
  
  const params = new URLSearchParams()
  params.set("source", "topic-clusters")
  params.set("keyword", article.keyword)
  params.set("volume", article.volume.toString())
  params.set("kd", article.kd.toString())
  params.set("intent", article.intent)
  params.set("type", articleType)
  
  // Get required links for this article
  const links = getLinksForArticle(articleId)
  const requiredLinks = links.filter(l => l.isRequired)
  
  if (articleType === "pillar") {
    const pillar = article as typeof cluster.pillars[0]
    // Encode sub-keywords
    const subKwParam = pillar.subKeywords
      .map(sk => `${sk.keyword}:${sk.placement}:${sk.volume}`)
      .join("|")
    params.set("sub_keywords", subKwParam)
    params.set("cluster_count", pillar.clusterIds.length.toString())
    params.set("rec_words", pillar.recommendedWordCount.toString())
    params.set("rec_headings", pillar.recommendedHeadings.toString())
  } else {
    const clusterArticle = article as typeof cluster.clusters[0]
    const parentPillar = cluster.pillars.find(p => p.id === clusterArticle.pillarId)
    if (parentPillar) {
      params.set("pillar_keyword", parentPillar.keyword)
      if (parentPillar.url) params.set("pillar_url", parentPillar.url)
      
      // Find the link to pillar for anchor text
      const pillarLink = requiredLinks.find(l => l.toId === parentPillar.id)
      if (pillarLink) {
        params.set("pillar_anchor", pillarLink.anchorText)
      }
    }
    params.set("rec_words", clusterArticle.recommendedWordCount.toString())
    params.set("rec_headings", clusterArticle.recommendedHeadings.toString())
  }
  
  // Encode internal links
  if (requiredLinks.length > 0) {
    const linksParam = requiredLinks
      .map(l => `${l.toKeyword}|${l.anchorText}|${l.toUrl || ""}|${l.placementHint}`)
      .join("~")
    params.set("internal_links", linksParam)
  }
  
  // Add cluster name
  params.set("cluster_name", cluster.name)
  
  return `/ai-writer?${params.toString()}`
}

// Build URL to load entire cluster overview to AI Writer
export function buildClusterOverviewUrl(): string {
  const cluster = MOCK_TOPIC_CLUSTER_FULL
  const params = new URLSearchParams()
  
  params.set("source", "topic-clusters")
  params.set("mode", "cluster-overview")
  params.set("cluster_name", cluster.name)
  params.set("cluster_id", cluster.id)
  
  // Encode pillars summary
  const pillarsParam = cluster.pillars
    .map(p => `${p.keyword}|${p.status}|${p.url || ""}`)
    .join("~")
  params.set("pillars", pillarsParam)
  
  // Encode clusters summary  
  const clustersParam = cluster.clusters
    .map(c => `${c.keyword}|${c.status}|${c.url || ""}`)
    .join("~")
  params.set("clusters", clustersParam)
  
  return `/ai-writer?${params.toString()}`
}

// Build URL for Cluster Writing Mode - Sequential article writing
export function buildClusterWritingModeUrl(): string {
  const cluster = MOCK_TOPIC_CLUSTER_FULL
  const params = new URLSearchParams()
  
  params.set("source", "topic-clusters")
  params.set("mode", "cluster-writing")
  params.set("cluster_name", cluster.name)
  params.set("cluster_id", cluster.id)
  
  return `/ai-writer?${params.toString()}`
}
