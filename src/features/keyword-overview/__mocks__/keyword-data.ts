// Keyword Overview Mock Data
import type { SERPResult } from "../types"
import type { GEOScoreComponents, CitationSource } from "@/types/geo.types"

export const MOCK_KEYWORD_METRICS = {
  keyword: "AI Agents",
  volume: "90K",
  kd: 78,
  kdLabel: "Hard",
  cpc: "$4.50",
  geoScore: 72,
}

export const MOCK_GEO_COMPONENTS: GEOScoreComponents = {
  citationFreshness: 18,
  authorityWeakness: 20,
  mediaGap: 15,
  textQuality: 14,
}

export const MOCK_CITATION_SOURCES: CitationSource[] = [
  { domain: "reddit.com", type: "reddit", age: 245, position: 1 },
  { domain: "medium.com", type: "blog", age: 180, position: 2 },
  { domain: "forbes.com", type: "news", age: 120, position: 3 },
]

export const MOCK_GEO_RECOMMENDATIONS = [
  "AI is citing a Reddit thread that's 8+ months old. Create fresh, comprehensive content.",
  "🎬 HIGH VIDEO OPPORTUNITY: Create a video to get featured in AI Overview.",
  "Add structured data (FAQ, HowTo schema) to increase citation chances.",
]

export const MOCK_SERP_RESULTS: SERPResult[] = [
  {
    rank: 1,
    title: "What are AI Agents? Complete Guide 2024",
    domain: "ibm.com",
    da: 92,
    backlinks: 245,
    wordCount: 3200,
    type: "Blog",
    isWeak: false,
  },
  {
    rank: 2,
    title: "AI Agents Explained - How They Work",
    domain: "microsoft.com",
    da: 96,
    backlinks: 189,
    wordCount: 2800,
    type: "Blog",
    isWeak: false,
  },
  {
    rank: 3,
    title: "Building AI Agents with LangChain",
    domain: "langchain.com",
    da: 78,
    backlinks: 156,
    wordCount: 4100,
    type: "Blog",
    isWeak: false,
  },
  {
    rank: 4,
    title: "r/MachineLearning - AI Agents Discussion",
    domain: "reddit.com",
    da: 91,
    backlinks: 12,
    wordCount: 850,
    type: "Forum",
    isWeak: true,
  },
  {
    rank: 5,
    title: "Top 10 AI Agent Frameworks",
    domain: "towardsdatascience.com",
    da: 85,
    backlinks: 98,
    wordCount: 2400,
    type: "Blog",
    isWeak: false,
  },
  {
    rank: 6,
    title: "AI Agents vs Chatbots: Key Differences",
    domain: "forbes.com",
    da: 94,
    backlinks: 67,
    wordCount: 1800,
    type: "Blog",
    isWeak: false,
  },
  {
    rank: 7,
    title: "What is an AI Agent? - Quora",
    domain: "quora.com",
    da: 89,
    backlinks: 8,
    wordCount: 620,
    type: "Forum",
    isWeak: true,
  },
  {
    rank: 8,
    title: "Autonomous AI Agents Tutorial",
    domain: "huggingface.co",
    da: 82,
    backlinks: 134,
    wordCount: 3600,
    type: "Blog",
    isWeak: false,
  },
  {
    rank: 9,
    title: "AI Agents in Enterprise Applications",
    domain: "gartner.com",
    da: 90,
    backlinks: 78,
    wordCount: 2100,
    type: "E-commerce",
    isWeak: false,
  },
  {
    rank: 10,
    title: "The Future of AI Agents",
    domain: "wired.com",
    da: 93,
    backlinks: 45,
    wordCount: 1950,
    type: "Blog",
    isWeak: false,
  },
]
