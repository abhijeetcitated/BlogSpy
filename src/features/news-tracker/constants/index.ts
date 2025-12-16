// ============================================
// NEWS TRACKER - Constants & Config
// ============================================

import type { NewsPlatformConfig, NewsPlatform } from "../types"

/**
 * All News Platforms
 */
export const NEWS_PLATFORMS: NewsPlatform[] = ["google-news", "google-discover"]

/**
 * Platform Configurations
 */
export const NEWS_PLATFORM_CONFIG: Record<NewsPlatform, NewsPlatformConfig> = {
  "google-news": {
    id: "google-news",
    name: "Google News",
    icon: "📰",
    color: "#4285F4",
    bgColor: "bg-blue-500/10",
    creditCost: 1,
    apiSource: "DataForSEO",
    description: "Track rankings in Google News results",
  },
  "google-discover": {
    id: "google-discover",
    name: "Google Discover",
    icon: "✨",
    color: "#EA4335",
    bgColor: "bg-red-500/10",
    creditCost: 2,
    apiSource: "Search Console API",
    description: "Monitor visibility in Google Discover feed",
  },
}

/**
 * Default Platform
 */
export const DEFAULT_NEWS_PLATFORM: NewsPlatform = "google-news"

/**
 * News Categories
 */
export const NEWS_CATEGORIES = [
  "Technology",
  "Business",
  "Entertainment",
  "Sports",
  "Health",
  "Science",
  "World",
  "Politics",
  "Lifestyle",
] as const

/**
 * Intent Colors - Dark/Light theme compatible
 */
export const NEWS_INTENT_COLORS = {
  breaking: { bg: "bg-red-500/10 dark:bg-red-500/20", text: "text-red-600 dark:text-red-400", label: "Breaking" },
  evergreen: { bg: "bg-emerald-500/10 dark:bg-emerald-500/20", text: "text-emerald-600 dark:text-emerald-400", label: "Evergreen" },
  trending: { bg: "bg-amber-500/10 dark:bg-amber-500/20", text: "text-amber-600 dark:text-amber-400", label: "Trending" },
  local: { bg: "bg-blue-500/10 dark:bg-blue-500/20", text: "text-blue-600 dark:text-blue-400", label: "Local" },
} as const

/**
 * Discover Tips
 */
export const DISCOVER_TIPS = [
  "Use high-quality images (1200x675px minimum)",
  "Write compelling headlines under 70 characters",
  "Focus on evergreen content that stays relevant",
  "Avoid clickbait - Google penalizes misleading titles",
  "Ensure mobile-friendly page experience",
  "Update content regularly to stay in Discover",
]
