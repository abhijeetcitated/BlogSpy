// ============================================
// API CONFIG - Keyword Magic API Configuration
// ============================================

/**
 * API configuration for keyword magic feature
 */
export const keywordMagicApiConfig = {
  // Base endpoints
  endpoints: {
    search: "/api/keyword-magic/search",
    suggestions: "/api/keyword-magic/suggestions",
    details: "/api/keyword-magic/details",
    export: "/api/keyword-magic/export",
    bulk: "/api/keyword-magic/bulk",
    refresh: "/api/keyword-magic/refresh",
  },

  // Request limits
  limits: {
    maxKeywords: 10000,
    maxBulkKeywords: 100,
    maxExportRows: 50000,
    requestsPerMinute: 30,
  },

  // Cache settings
  cache: {
    defaultTtl: 1000 * 60 * 60, // 1 hour
    suggestionsTtl: 1000 * 60 * 5, // 5 minutes
    detailsTtl: 1000 * 60 * 30, // 30 minutes
  },

  // Retry configuration
  retry: {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 10000,
  },

  // Pagination defaults
  pagination: {
    defaultPageSize: 50,
    pageSizeOptions: [25, 50, 100, 250],
    maxPageSize: 500,
  },

  // Rate limiting
  rateLimit: {
    windowMs: 60000, // 1 minute
    maxRequests: 30,
  },
} as const

export type KeywordMagicApiConfig = typeof keywordMagicApiConfig

/**
 * Get API endpoint URL
 */
export function getEndpoint(
  endpoint: keyof typeof keywordMagicApiConfig.endpoints
): string {
  return keywordMagicApiConfig.endpoints[endpoint]
}

/**
 * Build URL with query params
 */
export function buildApiUrl(
  endpoint: keyof typeof keywordMagicApiConfig.endpoints,
  params?: Record<string, string | number | boolean | undefined>
): string {
  const url = new URL(getEndpoint(endpoint), window.location.origin)
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.append(key, String(value))
      }
    })
  }
  
  return url.toString()
}
