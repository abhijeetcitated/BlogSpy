// ============================================
// API ENDPOINTS
// ============================================
// External API endpoints (DataForSEO, etc.)
// ============================================

// DataForSEO API Configuration
export const DATAFORSEO = {
  BASE_URL: "https://api.dataforseo.com/v3",
  
  // SERP API
  SERP: {
    GOOGLE_ORGANIC: "/serp/google/organic/live/advanced",
    GOOGLE_MAPS: "/serp/google/maps/live/advanced",
    GOOGLE_NEWS: "/serp/google/news/live/advanced",
  },

  // Keywords Data API
  KEYWORDS: {
    SEARCH_VOLUME: "/keywords_data/google/search_volume/live",
    KEYWORDS_FOR_SITE: "/keywords_data/google/keywords_for_site/live",
    KEYWORD_SUGGESTIONS: "/keywords_data/google/keyword_suggestions/live",
    KEYWORDS_FOR_KEYWORDS: "/keywords_data/google/keywords_for_keywords/live",
  },

  // Backlinks API
  BACKLINKS: {
    SUMMARY: "/backlinks/summary/live",
    BACKLINKS: "/backlinks/backlinks/live",
    ANCHORS: "/backlinks/anchors/live",
    REFERRING_DOMAINS: "/backlinks/referring_domains/live",
  },

  // On-Page API
  ON_PAGE: {
    TASK_POST: "/on_page/task_post",
    SUMMARY: "/on_page/summary",
    PAGES: "/on_page/pages",
    RESOURCES: "/on_page/resources",
  },

  // Content Analysis API
  CONTENT: {
    SEARCH: "/content_analysis/search/live",
    SUMMARY: "/content_analysis/summary/live",
  },

  // Domain Analytics
  DOMAIN: {
    TECHNOLOGIES: "/domain_analytics/technologies/domain_technologies/live",
    WHOIS: "/domain_analytics/whois/overview/live",
  },
} as const

// Rate Limits (requests per minute)
export const RATE_LIMITS = {
  DATAFORSEO: {
    DEFAULT: 2000,
    SERP: 2000,
    KEYWORDS: 2000,
    BACKLINKS: 2000,
  },
} as const

// API Response Codes
export const API_STATUS = {
  SUCCESS: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  RATE_LIMITED: 429,
  SERVER_ERROR: 500,
} as const
