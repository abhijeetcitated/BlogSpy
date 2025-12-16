// ============================================
// COMMUNITY TRACKER - Constants & Config
// ============================================

import type { CommunityPlatformConfig, CommunityPlatform } from "../types"

/**
 * All Community Platforms
 */
export const COMMUNITY_PLATFORMS: CommunityPlatform[] = ["reddit", "quora"]

/**
 * Platform Configurations
 */
export const COMMUNITY_PLATFORM_CONFIG: Record<CommunityPlatform, CommunityPlatformConfig> = {
  reddit: {
    id: "reddit",
    name: "Reddit",
    icon: "🔴",
    color: "#FF4500",
    bgColor: "bg-orange-500/10",
    creditCost: 1,
    apiSource: "Google Proxy (site:reddit.com)",
    description: "Track keyword rankings in Reddit discussions",
  },
  quora: {
    id: "quora",
    name: "Quora",
    icon: "🔵",
    color: "#B92B27",
    bgColor: "bg-red-500/10",
    creditCost: 1,
    apiSource: "Google Proxy (site:quora.com)",
    description: "Monitor visibility in Quora Q&A",
  },
}

/**
 * Default Platform
 */
export const DEFAULT_COMMUNITY_PLATFORM: CommunityPlatform = "reddit"

/**
 * Popular Subreddits for SEO
 */
export const SEO_SUBREDDITS = [
  "r/SEO",
  "r/bigseo",
  "r/marketing",
  "r/digitalmarketing",
  "r/content_marketing",
  "r/blogging",
  "r/Entrepreneur",
  "r/startups",
  "r/SaaS",
  "r/webdev",
] as const

/**
 * Intent Colors (Theme-aware)
 */
export const COMMUNITY_INTENT_COLORS = {
  discussion: { bg: "bg-blue-500/10", text: "text-blue-600 dark:text-blue-400", label: "Discussion" },
  question: { bg: "bg-purple-500/10", text: "text-purple-600 dark:text-purple-400", label: "Question" },
  recommendation: { bg: "bg-emerald-500/10", text: "text-emerald-600 dark:text-emerald-400", label: "Recommendation" },
  comparison: { bg: "bg-amber-500/10", text: "text-amber-600 dark:text-amber-400", label: "Comparison" },
} as const

/**
 * Community Tips
 */
export const COMMUNITY_TIPS = [
  "Provide genuine value, don't just promote",
  "Answer questions thoroughly with examples",
  "Link to your content only when relevant",
  "Engage with comments on your posts",
  "Build karma before posting links",
  "Use relevant subreddits for your niche",
]
