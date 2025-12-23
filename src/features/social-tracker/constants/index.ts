// ============================================
// SOCIAL TRACKER - Constants & Config
// ============================================

import type { SocialPlatformConfig, SocialPlatform } from "../types"

/**
 * All Social Platforms
 */
export const SOCIAL_PLATFORMS: SocialPlatform[] = ["pinterest", "twitter", "instagram"]

/**
 * Platform Configurations
 */
export const SOCIAL_PLATFORM_CONFIG: Record<SocialPlatform, SocialPlatformConfig> = {
  pinterest: {
    id: "pinterest",
    name: "Pinterest",
    icon: "📌",
    color: "#E60023",
    bgColor: "bg-red-500/10",
    iconColor: "text-red-500",
    creditCost: 3,
    apiSource: "Apify Scraper",
    description: "Track pin rankings and visibility",
  },
  twitter: {
    id: "twitter",
    name: "X",
    icon: "𝕏",
    color: "#1a1a1a",
    bgColor: "bg-foreground/10",
    iconColor: "text-foreground",
    creditCost: 5,
    apiSource: "Apify Scraper",
    description: "Monitor tweet visibility and trends",
  },
  instagram: {
    id: "instagram",
    name: "Instagram",
    icon: "📸",
    color: "#E4405F",
    bgColor: "bg-pink-500/10",
    iconColor: "text-pink-500",
    creditCost: 5,
    apiSource: "Apify Scraper",
    description: "Track post and hashtag rankings",
  },
}

/**
 * Default Platform
 */
export const DEFAULT_SOCIAL_PLATFORM: SocialPlatform = "pinterest"

/**
 * Default Values - Avoid hardcoding in components
 */
export const SOCIAL_TRACKER_DEFAULTS = {
  /** Initial credits for new users */
  initialCredits: 100,
  /** Demo/placeholder credit balance */
  demoCredits: 125,
  /** Max keywords per platform (free tier) */
  maxKeywordsFree: 10,
  /** Max keywords per platform (paid tier) */
  maxKeywordsPaid: 100,
  /** Refresh interval in minutes */
  refreshIntervalMinutes: 60,
  /** Search debounce delay in ms */
  searchDebounceMs: 300,
  /** Virtualization threshold */
  virtualizationThreshold: 20,
} as const

/**
 * Intent Colors
 */
export const SOCIAL_INTENT_COLORS = {
  visual: { bg: "bg-pink-500/10", text: "text-pink-400", label: "Visual" },
  trending: { bg: "bg-blue-500/10", text: "text-blue-400", label: "Trending" },
  discussion: { bg: "bg-purple-500/10", text: "text-purple-400", label: "Discussion" },
  shopping: { bg: "bg-emerald-500/10", text: "text-emerald-400", label: "Shopping" },
} as const

/**
 * Pinterest Tips
 */
export const PINTEREST_TIPS = [
  "Use vertical images (2:3 ratio works best)",
  "Add keyword-rich descriptions",
  "Create boards around topic clusters",
  "Pin consistently (10-25 pins/day)",
  "Use rich pins for articles",
]

/**
 * Twitter Tips
 */
export const TWITTER_TIPS = [
  "Tweet at peak hours (9am-12pm)",
  "Use 1-2 relevant hashtags only",
  "Include images for 2x engagement",
  "Engage with replies quickly",
  "Thread long-form content",
]

/**
 * Instagram Tips
 */
export const INSTAGRAM_TIPS = [
  "Use 5-10 highly relevant hashtags",
  "Post Reels for maximum reach",
  "Write engaging captions with CTAs",
  "Use Stories for behind-the-scenes",
  "Collaborate with niche creators",
]

/**
 * Platform Audience Insights
 */
export const PLATFORM_AUDIENCE: Record<SocialPlatform, string[]> = {
  pinterest: [
    "80% female users",
    "High purchase intent",
    "Visual search dominant",
  ],
  twitter: [
    "Real-time engagement",
    "News & trending topics",
    "B2B & tech audience",
  ],
  instagram: [
    "18-34 age dominant",
    "Visual storytelling",
    "Lifestyle & product focus",
  ],
}
