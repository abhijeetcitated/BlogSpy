// Cannibalization Constants

import type { CannibalizingPage } from "../types"

export const SEVERITY_ORDER = { critical: 0, high: 1, medium: 2, low: 3 } as const

export const ALL_SEVERITIES = ["all", "critical", "high", "medium", "low"] as const

export const SORT_OPTIONS = [
  { field: "severity" as const, label: "Severity" },
  { field: "trafficLoss" as const, label: "Traffic Loss" },
  { field: "overlapScore" as const, label: "Overlap" },
  { field: "pages" as const, label: "Pages" },
]

export const SEMANTIC_GROUPS: Record<string, string[]> = {
  "seo": ["seo tools", "seo software", "search engine optimization"],
  "keyword": ["keyword research", "keyword analysis", "keyword tool"],
  "content": ["content marketing", "content strategy", "content writing"],
  "ai writing": ["ai writing", "ai content", "ai writer"],
  "link": ["link building", "backlinks", "link strategy"]
}

export const KEYWORD_VOLUMES: Record<string, number> = {
  "best seo tools": 22000,
  "keyword research": 33000,
  "ai writing tools": 18000,
  "content marketing": 27000,
  "link building": 14000,
}

export const MOCK_PAGES: CannibalizingPage[] = [
  {
    url: "/blog/best-seo-tools-2024",
    title: "Best SEO Tools 2024: Complete Guide",
    targetKeyword: "best seo tools",
    currentRank: 8,
    bestRank: 4,
    traffic: 2500,
    lastUpdated: "2024-09-15",
    wordCount: 3200,
    pageAuthority: 45,
    backlinks: 23,
    isPrimary: true
  },
  {
    url: "/blog/top-seo-software-review",
    title: "Top SEO Software Review & Comparison",
    targetKeyword: "best seo tools",
    currentRank: 15,
    bestRank: 12,
    traffic: 800,
    lastUpdated: "2024-06-20",
    wordCount: 2100,
    pageAuthority: 32,
    backlinks: 8,
    isPrimary: false
  },
  {
    url: "/guides/keyword-research-guide",
    title: "Complete Keyword Research Guide 2024",
    targetKeyword: "keyword research",
    currentRank: 5,
    bestRank: 3,
    traffic: 4200,
    lastUpdated: "2024-10-01",
    wordCount: 4500,
    pageAuthority: 52,
    backlinks: 45,
    isPrimary: true
  },
  {
    url: "/blog/how-to-do-keyword-research",
    title: "How to Do Keyword Research for Beginners",
    targetKeyword: "keyword research",
    currentRank: 22,
    bestRank: 18,
    traffic: 650,
    lastUpdated: "2024-03-10",
    wordCount: 1800,
    pageAuthority: 28,
    backlinks: 5,
    isPrimary: false
  },
  {
    url: "/tutorials/keyword-research-tutorial",
    title: "Keyword Research Tutorial: Step by Step",
    targetKeyword: "keyword research tutorial",
    currentRank: 12,
    bestRank: 8,
    traffic: 1200,
    lastUpdated: "2024-07-22",
    wordCount: 2800,
    pageAuthority: 38,
    backlinks: 12,
    isPrimary: false
  },
  {
    url: "/blog/ai-content-writing-tools",
    title: "AI Content Writing Tools: The Ultimate List",
    targetKeyword: "ai writing tools",
    currentRank: 6,
    bestRank: 4,
    traffic: 3800,
    lastUpdated: "2024-11-05",
    wordCount: 3600,
    pageAuthority: 48,
    backlinks: 34,
    isPrimary: true
  },
  {
    url: "/reviews/ai-writing-software-review",
    title: "AI Writing Software Review 2024",
    targetKeyword: "ai writing tools",
    currentRank: 18,
    bestRank: 14,
    traffic: 920,
    lastUpdated: "2024-05-18",
    wordCount: 2400,
    pageAuthority: 35,
    backlinks: 11,
    isPrimary: false
  },
  {
    url: "/blog/content-marketing-strategy",
    title: "Content Marketing Strategy Guide",
    targetKeyword: "content marketing",
    currentRank: 11,
    bestRank: 7,
    traffic: 2100,
    lastUpdated: "2024-08-30",
    wordCount: 3100,
    pageAuthority: 42,
    backlinks: 28,
    isPrimary: true
  },
  {
    url: "/guides/content-marketing-tips",
    title: "Content Marketing Tips for 2024",
    targetKeyword: "content marketing tips",
    currentRank: 9,
    bestRank: 6,
    traffic: 1850,
    lastUpdated: "2024-09-25",
    wordCount: 2600,
    pageAuthority: 40,
    backlinks: 19,
    isPrimary: false
  },
  {
    url: "/blog/link-building-strategies",
    title: "Link Building Strategies That Work in 2024",
    targetKeyword: "link building",
    currentRank: 7,
    bestRank: 5,
    traffic: 3200,
    lastUpdated: "2024-10-15",
    wordCount: 4200,
    pageAuthority: 50,
    backlinks: 56,
    isPrimary: true
  }
]
