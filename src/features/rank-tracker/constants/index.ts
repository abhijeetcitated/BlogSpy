// ============================================
// RANK TRACKER - Constants & Config
// ============================================

import type { FilterTab, AIOverviewStatus } from "../types"

/**
 * Filter Tab Options
 */
export const FILTER_TABS: FilterTab[] = [
  "All",
  "Top 3",
  "Top 10",
  "Top 100",
  "Improved",
  "Declined",
]

/**
 * AI Overview Status Templates
 */
export const AI_OVERVIEW_STATUSES: AIOverviewStatus[] = [
  {
    inOverview: true,
    position: "cited",
    citationUrl: "/blog/best-seo-tools",
    competitors: ["semrush.com", "ahrefs.com"],
    recommendation: null,
  },
  {
    inOverview: true,
    position: "mentioned",
    citationUrl: null,
    competitors: ["hubspot.com", "moz.com"],
    recommendation: "Add more specific examples to get cited",
  },
  {
    inOverview: false,
    position: "not_included",
    citationUrl: null,
    competitors: ["semrush.com", "ahrefs.com", "moz.com"],
    recommendation:
      "Add these entities: 'pricing comparison', 'free trial', 'enterprise features'",
  },
  {
    inOverview: true,
    position: "cited",
    citationUrl: "/tools/keyword-research",
    competitors: ["neilpatel.com", "backlinko.com"],
    recommendation: null,
  },
]

/**
 * SERP Feature Icon Config
 */
export const SERP_FEATURE_CONFIG = {
  video: { label: "Video Result", color: "text-red-400" },
  snippet: { label: "Featured Snippet", color: "text-blue-400" },
  ad: { label: "Paid Ad", color: "text-amber-400" },
  image: { label: "Image Pack", color: "text-purple-400" },
  faq: { label: "FAQ Section", color: "text-cyan-400" },
  shopping: { label: "Shopping Results", color: "text-green-400" },
} as const

/**
 * Rank Badge Styles
 */
export const RANK_BADGE_STYLES = {
  top3: "bg-linear-to-r from-amber-500 to-yellow-400 text-primary-foreground font-bold shadow-[0_0_12px_rgba(251,191,36,0.4)]",
  top10: "bg-linear-to-r from-emerald-500 to-green-400 text-primary-foreground font-bold",
  default: "bg-muted text-muted-foreground",
} as const

/**
 * AI Overview Badge Styles
 */
export const AI_OVERVIEW_STYLES = {
  cited: "bg-emerald-500/20 text-emerald-400",
  mentioned: "bg-amber-500/20 text-amber-400",
  not_included: "bg-red-500/20 text-red-400",
} as const

// Re-export platform constants
export * from "./platforms"

// Re-export country constants
export * from "./countries"

// Re-export thresholds and messages
export * from "./thresholds"
