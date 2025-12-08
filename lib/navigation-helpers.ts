/**
 * Navigation Helper Utilities
 * Tumhare project ke liye centralized navigation routes
 */

// All available routes in the app
export const routes = {
  // Main pages
  home: "/",
  dashboard: "/dashboard",
  dashboardHome: "/dashboard",
  
  // Research routes
  research: {
    keywordMagic: "/dashboard/research/keyword-magic",
    trends: "/dashboard/research/trends",
    gapAnalysis: "/dashboard/research/gap-analysis",
    overview: (keyword: string) => `/dashboard/research/overview/${keyword}`,
  },
  
  // Strategy routes
  strategy: {
    topicClusters: "/dashboard/strategy/topic-clusters",
    roadmap: "/dashboard/strategy/roadmap",
  },
  
  // Creation routes
  creation: {
    aiWriter: "/dashboard/creation/ai-writer",
    snippetStealer: "/dashboard/creation/snippet-stealer",
    onPage: "/dashboard/creation/on-page",
  },
  
  // Tracking routes
  tracking: {
    rankTracker: "/dashboard/tracking/rank-tracker",
    decay: "/dashboard/tracking/decay",
  },
} as const

// Route names for easy reference
export type RouteKey = keyof typeof routes

