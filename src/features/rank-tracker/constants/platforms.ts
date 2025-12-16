// ============================================
// RANK TRACKER - Platform Constants
// ============================================

import type { PlatformConfig, SearchPlatform } from "../types/platforms"

/**
 * All Search Platforms
 */
export const SEARCH_PLATFORMS: SearchPlatform[] = ["google", "bing", "yahoo", "duckduckgo"]

/**
 * Platform Configurations
 */
export const PLATFORM_CONFIG: Record<SearchPlatform, PlatformConfig> = {
  google: {
    id: "google",
    name: "Google",
    icon: "🔍",
    color: "#4285F4",
    bgColor: "bg-blue-500/10",
    creditCost: 1,
    apiSource: "DataForSEO",
    description: "World's largest search engine (92% market share)",
  },
  bing: {
    id: "bing",
    name: "Bing",
    icon: "🅱️",
    color: "#00809D",
    bgColor: "bg-cyan-500/10",
    creditCost: 1,
    apiSource: "DataForSEO",
    description: "Microsoft's search engine (3% market share)",
  },
  yahoo: {
    id: "yahoo",
    name: "Yahoo",
    icon: "📧",
    color: "#6001D2",
    bgColor: "bg-purple-500/10",
    creditCost: 1,
    apiSource: "DataForSEO",
    description: "Classic search engine (1.5% market share)",
  },
  duckduckgo: {
    id: "duckduckgo",
    name: "DuckDuckGo",
    icon: "🦆",
    color: "#DE5833",
    bgColor: "bg-orange-500/10",
    creditCost: 1,
    apiSource: "Serper.dev",
    description: "Privacy-focused search engine (0.5% market share)",
  },
}

/**
 * Platform Tab Order
 */
export const PLATFORM_TAB_ORDER: SearchPlatform[] = ["google", "bing", "yahoo", "duckduckgo"]

/**
 * Platform Colors for Charts
 */
export const PLATFORM_CHART_COLORS: Record<SearchPlatform, string> = {
  google: "#4285F4",
  bing: "#00809D",
  yahoo: "#6001D2",
  duckduckgo: "#DE5833",
}

/**
 * Default Platform
 */
export const DEFAULT_PLATFORM: SearchPlatform = "google"

/**
 * Credits per check
 */
export const PLATFORM_CREDITS: Record<SearchPlatform, number> = {
  google: 1,
  bing: 1,
  yahoo: 1,
  duckduckgo: 1,
}

/**
 * API Rate Limits (per minute)
 */
export const PLATFORM_RATE_LIMITS: Record<SearchPlatform, number> = {
  google: 100,
  bing: 100,
  yahoo: 50,
  duckduckgo: 30,
}
