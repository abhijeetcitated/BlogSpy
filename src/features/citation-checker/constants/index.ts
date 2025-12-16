// Citation Checker Constants

import type { CitationStatus } from "../types"

export const SCORE_THRESHOLDS = {
  excellent: 50,
  good: 30,
  fair: 15,
} as const

export const SCORE_COLORS = {
  excellent: "#22c55e",
  good: "#eab308",
  fair: "#f97316",
  poor: "#ef4444",
} as const

export const SCORE_LABELS = {
  excellent: "Excellent",
  good: "Good",
  fair: "Fair",
  poor: "Poor",
} as const

export const STATUS_ORDER: Record<CitationStatus, number> = {
  cited: 1,
  partial: 2,
  "not-cited": 3,
  unknown: 4,
}

export const COMPETITOR_DOMAINS = [
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

export const MOCK_KEYWORDS = [
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

export const AI_OVERVIEW_SNIPPETS = [
  "SEO (Search Engine Optimization) is the practice of optimizing websites to rank higher in search engine results...",
  "Keyword research involves finding and analyzing search terms that people enter into search engines...",
  "On-page SEO refers to the practice of optimizing web page content for search engines...",
  "Link building is the process of acquiring hyperlinks from other websites to your own...",
  "Technical SEO focuses on improving the technical aspects of a website to increase its ranking...",
]

export const CTR_MULTIPLIERS: Record<string, number> = {
  top: 0.15,
  middle: 0.08,
  bottom: 0.04,
  inline: 0.06,
  default: 0.05,
}
