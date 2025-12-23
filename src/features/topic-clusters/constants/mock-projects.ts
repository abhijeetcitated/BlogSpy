// ============================================
// MOCK DATA FOR TOPIC PROJECTS
// ============================================
// This file contains mock data for development
// Replace with real API calls later

import { 
  TopicProject, 
  ProjectKeyword, 
  PillarResult,
  ProjectStatus,
  KeywordSource,
  IntentType,
  TrendDirection,
  SerpFeature 
} from "../types/project.types"

// Helper to generate unique IDs
const generateId = () => Math.random().toString(36).substring(2, 15)

// ============================================
// MOCK KEYWORDS FOR SEO PROJECT
// ============================================
const seoKeywords: Omit<ProjectKeyword, "id" | "projectId" | "createdAt" | "updatedAt">[] = [
  // Pillar Candidates (short, high volume)
  {
    keyword: "seo guide",
    volume: 12100,
    kd: 58,
    cpc: 2.50,
    intent: "informational",
    trend: "stable",
    trendPercent: 5,
    serpFeatures: ["featured_snippet", "paa", "video"],
    position: null,
    positionChange: null,
    rankingUrl: null,
    source: "keyword_magic",
    keywordType: null,
    parentPillarId: null,
    confidenceScore: null,
    wordCount: 2
  },
  {
    keyword: "link building",
    volume: 8100,
    kd: 52,
    cpc: 3.20,
    intent: "informational",
    trend: "up",
    trendPercent: 12,
    serpFeatures: ["featured_snippet", "paa"],
    position: null,
    positionChange: null,
    rankingUrl: null,
    source: "keyword_magic",
    keywordType: null,
    parentPillarId: null,
    confidenceScore: null,
    wordCount: 2
  },
  // Supporting Keywords (define/explain pillar)
  {
    keyword: "what is seo",
    volume: 8100,
    kd: 45,
    cpc: 1.80,
    intent: "informational",
    trend: "stable",
    trendPercent: 2,
    serpFeatures: ["featured_snippet", "paa", "knowledge_panel"],
    position: null,
    positionChange: null,
    rankingUrl: null,
    source: "keyword_magic",
    keywordType: null,
    parentPillarId: null,
    confidenceScore: null,
    wordCount: 3
  },
  {
    keyword: "seo meaning",
    volume: 5400,
    kd: 38,
    cpc: 1.20,
    intent: "informational",
    trend: "stable",
    trendPercent: 0,
    serpFeatures: ["featured_snippet", "knowledge_panel"],
    position: null,
    positionChange: null,
    rankingUrl: null,
    source: "keyword_magic",
    keywordType: null,
    parentPillarId: null,
    confidenceScore: null,
    wordCount: 2
  },
  {
    keyword: "how does seo work",
    volume: 3600,
    kd: 42,
    cpc: 1.50,
    intent: "informational",
    trend: "up",
    trendPercent: 8,
    serpFeatures: ["featured_snippet", "paa", "video"],
    position: null,
    positionChange: null,
    rankingUrl: null,
    source: "keyword_magic",
    keywordType: null,
    parentPillarId: null,
    confidenceScore: null,
    wordCount: 4
  },
  {
    keyword: "what is link building",
    volume: 2900,
    kd: 35,
    cpc: 2.10,
    intent: "informational",
    trend: "stable",
    trendPercent: 3,
    serpFeatures: ["featured_snippet", "paa"],
    position: null,
    positionChange: null,
    rankingUrl: null,
    source: "keyword_magic",
    keywordType: null,
    parentPillarId: null,
    confidenceScore: null,
    wordCount: 4
  },
  // Cluster Keywords (long-tail, specific)
  {
    keyword: "seo for beginners 2024",
    volume: 2100,
    kd: 28,
    cpc: 1.80,
    intent: "informational",
    trend: "up",
    trendPercent: 25,
    serpFeatures: ["paa", "video"],
    position: null,
    positionChange: null,
    rankingUrl: null,
    source: "keyword_magic",
    keywordType: null,
    parentPillarId: null,
    confidenceScore: null,
    wordCount: 4
  },
  {
    keyword: "how to do seo step by step",
    volume: 1800,
    kd: 32,
    cpc: 2.00,
    intent: "informational",
    trend: "stable",
    trendPercent: 5,
    serpFeatures: ["featured_snippet", "paa"],
    position: null,
    positionChange: null,
    rankingUrl: null,
    source: "keyword_magic",
    keywordType: null,
    parentPillarId: null,
    confidenceScore: null,
    wordCount: 6
  },
  {
    keyword: "seo tutorial for beginners",
    volume: 1500,
    kd: 25,
    cpc: 1.50,
    intent: "informational",
    trend: "up",
    trendPercent: 15,
    serpFeatures: ["video", "paa"],
    position: null,
    positionChange: null,
    rankingUrl: null,
    source: "keyword_magic",
    keywordType: null,
    parentPillarId: null,
    confidenceScore: null,
    wordCount: 4
  },
  {
    keyword: "learn seo free online",
    volume: 1200,
    kd: 22,
    cpc: 1.20,
    intent: "informational",
    trend: "up",
    trendPercent: 18,
    serpFeatures: ["paa"],
    position: null,
    positionChange: null,
    rankingUrl: null,
    source: "keyword_magic",
    keywordType: null,
    parentPillarId: null,
    confidenceScore: null,
    wordCount: 4
  },
  {
    keyword: "seo basics for small business",
    volume: 900,
    kd: 20,
    cpc: 2.50,
    intent: "informational",
    trend: "stable",
    trendPercent: 3,
    serpFeatures: ["paa"],
    position: null,
    positionChange: null,
    rankingUrl: null,
    source: "keyword_magic",
    keywordType: null,
    parentPillarId: null,
    confidenceScore: null,
    wordCount: 5
  },
  {
    keyword: "on page seo techniques",
    volume: 1400,
    kd: 35,
    cpc: 1.80,
    intent: "informational",
    trend: "stable",
    trendPercent: 2,
    serpFeatures: ["featured_snippet", "paa"],
    position: null,
    positionChange: null,
    rankingUrl: null,
    source: "keyword_magic",
    keywordType: null,
    parentPillarId: null,
    confidenceScore: null,
    wordCount: 4
  },
  {
    keyword: "off page seo strategies",
    volume: 1100,
    kd: 38,
    cpc: 2.20,
    intent: "informational",
    trend: "up",
    trendPercent: 10,
    serpFeatures: ["paa"],
    position: null,
    positionChange: null,
    rankingUrl: null,
    source: "keyword_magic",
    keywordType: null,
    parentPillarId: null,
    confidenceScore: null,
    wordCount: 4
  },
  // Link Building Clusters
  {
    keyword: "how to build backlinks",
    volume: 2400,
    kd: 42,
    cpc: 2.80,
    intent: "informational",
    trend: "stable",
    trendPercent: 5,
    serpFeatures: ["featured_snippet", "paa", "video"],
    position: null,
    positionChange: null,
    rankingUrl: null,
    source: "keyword_magic",
    keywordType: null,
    parentPillarId: null,
    confidenceScore: null,
    wordCount: 4
  },
  {
    keyword: "guest posting for seo",
    volume: 1300,
    kd: 30,
    cpc: 2.50,
    intent: "informational",
    trend: "down",
    trendPercent: -8,
    serpFeatures: ["paa"],
    position: null,
    positionChange: null,
    rankingUrl: null,
    source: "keyword_magic",
    keywordType: null,
    parentPillarId: null,
    confidenceScore: null,
    wordCount: 4
  },
  {
    keyword: "broken link building strategy",
    volume: 800,
    kd: 25,
    cpc: 1.90,
    intent: "informational",
    trend: "stable",
    trendPercent: 2,
    serpFeatures: ["paa"],
    position: null,
    positionChange: null,
    rankingUrl: null,
    source: "keyword_magic",
    keywordType: null,
    parentPillarId: null,
    confidenceScore: null,
    wordCount: 4
  },
  {
    keyword: "link building tools free",
    volume: 600,
    kd: 18,
    cpc: 1.50,
    intent: "commercial",
    trend: "up",
    trendPercent: 12,
    serpFeatures: ["paa", "shopping"],
    position: null,
    positionChange: null,
    rankingUrl: null,
    source: "keyword_magic",
    keywordType: null,
    parentPillarId: null,
    confidenceScore: null,
    wordCount: 4
  },
  {
    keyword: "white hat link building techniques",
    volume: 500,
    kd: 22,
    cpc: 2.00,
    intent: "informational",
    trend: "stable",
    trendPercent: 0,
    serpFeatures: ["paa"],
    position: null,
    positionChange: null,
    rankingUrl: null,
    source: "keyword_magic",
    keywordType: null,
    parentPillarId: null,
    confidenceScore: null,
    wordCount: 5
  }
]

// ============================================
// GENERATE MOCK PROJECTS
// ============================================
const createMockKeywords = (projectId: string, keywordsData: typeof seoKeywords): ProjectKeyword[] => {
  return keywordsData.map(kw => ({
    ...kw,
    id: generateId(),
    projectId,
    createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
    updatedAt: new Date()
  }))
}

// ============================================
// MOCK PROJECTS DATABASE
// ============================================
export const MOCK_PROJECTS: TopicProject[] = [
  {
    id: "proj_seo_guide",
    userId: "user_demo_123",
    name: "SEO Guide 2024",
    description: "Complete SEO strategy for my blog",
    status: "draft",
    keywords: createMockKeywords("proj_seo_guide", seoKeywords),
    keywordCount: seoKeywords.length,
    pillars: [],
    uncategorizedKeywordIds: [],
    totalVolume: seoKeywords.reduce((acc, k) => acc + (k.volume || 0), 0),
    avgKd: Math.round(seoKeywords.reduce((acc, k) => acc + (k.kd || 0), 0) / seoKeywords.length),
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    clusteredAt: null
  },
  {
    id: "proj_email_marketing",
    userId: "user_demo_123",
    name: "Email Marketing Strategy",
    description: "Email marketing content cluster",
    status: "draft",
    keywords: [],
    keywordCount: 0,
    pillars: [],
    uncategorizedKeywordIds: [],
    totalVolume: 0,
    avgKd: 0,
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    clusteredAt: null
  }
]

// ============================================
// MOCK CLUSTERED PROJECT (For showing results)
// ============================================
export const MOCK_CLUSTERED_PROJECT: TopicProject = {
  id: "proj_clustered_example",
  userId: "user_demo_123",
  name: "Content Marketing (Clustered)",
  description: "Example of a clustered project",
  status: "clustered",
  keywords: [],  // Will be populated
  keywordCount: 25,
  pillars: [
    {
      id: "pillar_1",
      projectId: "proj_clustered_example",
      keywordId: "kw_content_marketing",
      keyword: "content marketing",
      volume: 14800,
      kd: 62,
      confidenceScore: 95,
      supportingKeywordIds: ["kw_1", "kw_2", "kw_3"],
      clusterKeywordIds: ["kw_4", "kw_5", "kw_6", "kw_7", "kw_8", "kw_9", "kw_10"],
      totalVolume: 45000,
      avgKd: 38,
      keywordCount: 11,
      createdAt: new Date()
    },
    {
      id: "pillar_2",
      projectId: "proj_clustered_example",
      keywordId: "kw_content_strategy",
      keyword: "content strategy",
      volume: 9900,
      kd: 55,
      confidenceScore: 88,
      supportingKeywordIds: ["kw_11", "kw_12"],
      clusterKeywordIds: ["kw_13", "kw_14", "kw_15", "kw_16", "kw_17"],
      totalVolume: 28000,
      avgKd: 35,
      keywordCount: 8,
      createdAt: new Date()
    }
  ],
  uncategorizedKeywordIds: ["kw_18", "kw_19"],
  totalVolume: 75000,
  avgKd: 42,
  createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
  updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  clusteredAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
}
