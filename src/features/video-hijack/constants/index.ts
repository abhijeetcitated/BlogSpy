// Video Hijack Constants

import type { VideoPresence, VideoOpportunityLevel } from "../types"

// Re-export platform constants
export * from "./platforms"

// ============================================
// TikTok Feature Status (Phase 2 - Coming Soon)
// ============================================
export const TIKTOK_FEATURE_STATUS = {
  enabled: false, // Set to true when TikTok API is integrated
  phase: 2,
  label: "Coming Soon",
  message: "TikTok integration is coming in Phase 2. Stay tuned!",
  notifyEnabled: true, // Allow users to sign up for notifications
} as const

// Platform availability flags
export const PLATFORM_AVAILABILITY = {
  youtube: {
    enabled: true,
    apiProvider: "DataForSEO",
    status: "active" as const,
  },
  tiktok: {
    enabled: false, // Disabled until Phase 2
    apiProvider: null, // Will be TikAPI.io or EnsembleData
    status: "coming_soon" as const,
  },
} as const

export const ALL_PRESENCES: VideoPresence[] = ["dominant", "significant", "moderate", "minimal", "none"]
export const ALL_OPPORTUNITY_LEVELS: VideoOpportunityLevel[] = ["high", "medium", "low"]

export const HIJACK_SCORE_THRESHOLDS = {
  high: 70,
  medium: 50,
  low: 30,
} as const

export const HIJACK_SCORE_COLORS = {
  high: "#ef4444",
  medium: "#f97316",
  low: "#eab308",
  safe: "#22c55e",
} as const

export const VIDEO_SEO_TIPS = [
  "Focus on keywords with high hijack + low competition",
  "Longer videos (10-15 min) rank better for tutorials",
  "Add timestamps and chapters for better CTR",
  "Create video for queries with \"how to\" intent",
]

export const MOCK_CHANNELS = [
  { name: "Ahrefs", subscribers: 452000 },
  { name: "Semrush", subscribers: 287000 },
  { name: "Moz", subscribers: 156000 },
  { name: "Neil Patel", subscribers: 1200000 },
  { name: "Brian Dean", subscribers: 523000 },
  { name: "Matt Diggity", subscribers: 198000 },
  { name: "Income School", subscribers: 891000 },
  { name: "Surfside PPC", subscribers: 245000 },
  { name: "WPBeginner", subscribers: 312000 },
  { name: "Authority Hacker", subscribers: 167000 },
]

export const MOCK_KEYWORDS_BASE = [
  { keyword: "seo tutorial", volume: 22000, intent: "informational" as const },
  { keyword: "keyword research", volume: 33000, intent: "informational" as const },
  { keyword: "how to rank on google", volume: 12500, intent: "informational" as const },
  { keyword: "backlink building", volume: 8900, intent: "informational" as const },
  { keyword: "seo tools comparison", volume: 6700, intent: "commercial" as const },
  { keyword: "on-page seo guide", volume: 5400, intent: "informational" as const },
  { keyword: "technical seo audit", volume: 4200, intent: "informational" as const },
  { keyword: "content marketing strategy", volume: 18000, intent: "informational" as const },
  { keyword: "local seo tips", volume: 7800, intent: "informational" as const },
  { keyword: "seo for beginners", volume: 27000, intent: "informational" as const },
  { keyword: "link building strategies", volume: 9100, intent: "informational" as const },
  { keyword: "wordpress seo plugin", volume: 14500, intent: "commercial" as const },
  { keyword: "google analytics tutorial", volume: 19000, intent: "informational" as const },
  { keyword: "seo checklist", volume: 8300, intent: "informational" as const },
  { keyword: "ecommerce seo guide", volume: 5600, intent: "informational" as const },
]

export const VIDEO_TITLE_TEMPLATES = [
  (keyword: string) => `${keyword} - Complete Guide (${new Date().getFullYear()})`,
  (keyword: string) => `How to Master ${keyword} in 10 Minutes`,
  (keyword: string) => `${keyword}: Everything You Need to Know`,
  (keyword: string) => `Top ${Math.floor(Math.random() * 10) + 5} ${keyword} Tips`,
  (keyword: string) => `${keyword} Tutorial for Beginners`,
  (keyword: string) => `The Ultimate ${keyword} Strategy`,
  (keyword: string) => `${keyword} Explained (Step by Step)`,
  (keyword: string) => `Why ${keyword} Matters for Your Business`,
]
