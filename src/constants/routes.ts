// ============================================
// APPLICATION ROUTES
// ============================================
// All route paths defined in one place
// ============================================

export const ROUTES = {
  // Public Routes
  HOME: "/",
  PRICING: "/pricing",
  LOGIN: "/login",
  REGISTER: "/register",
  FORGOT_PASSWORD: "/forgot-password",

  // Dashboard
  DASHBOARD: "/dashboard",
  
  // Research Tools
  RESEARCH: {
    ROOT: "/dashboard/research",
    KEYWORD_MAGIC: "/dashboard/research/keyword-magic",
    KEYWORD_OVERVIEW: (keyword: string) => `/dashboard/research/overview/${encodeURIComponent(keyword)}`,
    GAP_ANALYSIS: "/dashboard/research/gap-analysis",
    TRENDS: "/dashboard/research/trends",
  },

  // Creation Tools
  CREATION: {
    ROOT: "/dashboard/creation",
    AI_WRITER: "/dashboard/creation/ai-writer",
    ON_PAGE: "/dashboard/creation/on-page",
    SNIPPET_STEALER: "/dashboard/creation/snippet-stealer",
  },

  // Tracking Tools
  TRACKING: {
    ROOT: "/dashboard/tracking",
    RANK_TRACKER: "/dashboard/tracking/rank-tracker",
    CONTENT_DECAY: "/dashboard/tracking/decay",
  },

  // Strategy Tools
  STRATEGY: {
    ROOT: "/dashboard/strategy",
    TOPIC_CLUSTERS: "/dashboard/strategy/topic-clusters",
    ROADMAP: "/dashboard/strategy/roadmap",
  },

  // Settings
  SETTINGS: {
    ROOT: "/settings",
    PROFILE: "/settings/profile",
    BILLING: "/settings/billing",
    API_KEYS: "/settings/api-keys",
  },

  // API Routes
  API: {
    KEYWORDS: "/api/keywords",
    RANKINGS: "/api/rankings",
    COMPETITORS: "/api/competitors",
    CONTENT: "/api/content",
    ANALYZE: "/api/analyze",
    AI_GENERATE: "/api/ai/generate",
  },
} as const

export type Routes = typeof ROUTES
