// ============================================
// VIDEO HIJACK - Platform Constants
// ============================================

import type { VideoPlatformConfig, VideoPlatformType } from "../types/platforms"

/**
 * All Video Platforms
 */
export const VIDEO_PLATFORMS: VideoPlatformType[] = ["youtube", "tiktok"]

/**
 * Platform Configurations
 */
export const VIDEO_PLATFORM_CONFIG: Record<VideoPlatformType, VideoPlatformConfig> = {
  youtube: {
    id: "youtube",
    name: "YouTube",
    icon: "📺",
    color: "#FF0000",
    bgColor: "bg-red-500/10",
    creditCost: 1,
    apiSource: "YouTube Data API",
    description: "World's largest video platform (2B+ monthly users)",
    maxDuration: "Unlimited",
    avgViews: "10K-1M",
  },
  tiktok: {
    id: "tiktok",
    name: "TikTok",
    icon: "🎵",
    color: "#00F2EA",
    bgColor: "bg-cyan-500/10",
    creditCost: 3,
    apiSource: "Apify Scraper",
    description: "Short-form video platform (1B+ monthly users)",
    maxDuration: "10 minutes",
    avgViews: "1K-100K",
  },
}

/**
 * Platform Tab Order
 */
export const VIDEO_PLATFORM_TAB_ORDER: VideoPlatformType[] = ["youtube", "tiktok"]

/**
 * Platform Colors for Charts
 */
export const VIDEO_PLATFORM_COLORS: Record<VideoPlatformType, string> = {
  youtube: "#FF0000",
  tiktok: "#00F2EA",
}

/**
 * Default Platform
 */
export const DEFAULT_VIDEO_PLATFORM: VideoPlatformType = "youtube"

/**
 * TikTok Hashtag Categories
 */
export const TIKTOK_HASHTAG_CATEGORIES = [
  "seo",
  "digitalmarketing", 
  "marketing",
  "business",
  "entrepreneur",
  "contentcreator",
  "socialmedia",
  "growth",
  "tips",
  "tutorial",
]

/**
 * TikTok Sound Trends (Mock)
 */
export const TIKTOK_TRENDING_SOUNDS = [
  "Original Sound - Creator",
  "Aesthetic - Tollan Kim",
  "Monkeys Spinning Monkeys",
  "Oh No - Kreepa",
  "BACKGROUND MUSIC",
]
