/**
 * Google API Configuration
 * @description OAuth and API configuration for Google services
 */

// ============================================
// OAuth Configuration
// ============================================

export const GOOGLE_OAUTH_CONFIG = {
  clientId: process.env.GOOGLE_CLIENT_ID || '',
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  redirectUri: process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/integrations/google/callback',
};

// ============================================
// API Scopes
// ============================================

export const GOOGLE_SCOPES = {
  // Google Search Console
  GSC: [
    'https://www.googleapis.com/auth/webmasters.readonly',
  ],
  
  // Google Analytics 4
  GA4: [
    'https://www.googleapis.com/auth/analytics.readonly',
  ],
  
  // Combined scopes for full integration
  ALL: [
    'https://www.googleapis.com/auth/webmasters.readonly',
    'https://www.googleapis.com/auth/analytics.readonly',
  ],
};

// ============================================
// API Endpoints
// ============================================

export const GOOGLE_API_ENDPOINTS = {
  // OAuth
  AUTH: 'https://accounts.google.com/o/oauth2/v2/auth',
  TOKEN: 'https://oauth2.googleapis.com/token',
  REVOKE: 'https://oauth2.googleapis.com/revoke',
  USERINFO: 'https://www.googleapis.com/oauth2/v2/userinfo',
  
  // Google Search Console
  GSC_BASE: 'https://www.googleapis.com/webmasters/v3',
  GSC_SITES: 'https://www.googleapis.com/webmasters/v3/sites',
  GSC_SEARCH_ANALYTICS: (siteUrl: string) => 
    `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`,
  GSC_SITEMAPS: (siteUrl: string) =>
    `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/sitemaps`,
  
  // Google Analytics 4 (GA4 Data API)
  GA4_ADMIN: 'https://analyticsadmin.googleapis.com/v1beta',
  GA4_DATA: 'https://analyticsdata.googleapis.com/v1beta',
  GA4_ACCOUNTS: 'https://analyticsadmin.googleapis.com/v1beta/accounts',
  GA4_PROPERTIES: (accountId: string) =>
    `https://analyticsadmin.googleapis.com/v1beta/accounts/${accountId}/properties`,
  GA4_RUN_REPORT: (propertyId: string) =>
    `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
  GA4_BATCH_RUN_REPORTS: (propertyId: string) =>
    `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:batchRunReports`,
};

// ============================================
// Rate Limiting
// ============================================

export const GOOGLE_RATE_LIMITS = {
  GSC: {
    requestsPerSecond: 5,
    requestsPerDay: 25000,
  },
  GA4: {
    requestsPerSecond: 10,
    tokensPerDay: 200000,
    tokensPerHour: 40000,
  },
};

// ============================================
// Default Query Parameters
// ============================================

export const DEFAULT_GSC_QUERY = {
  rowLimit: 25000,
  startRow: 0,
  dataState: 'final' as const,
};

export const DEFAULT_GA4_QUERY = {
  limit: '10000',
  keepEmptyRows: false,
};

// ============================================
// Helper Functions
// ============================================

/**
 * Build OAuth authorization URL
 */
export function buildAuthUrl(scopes: string[], state: string): string {
  const params = new URLSearchParams({
    client_id: GOOGLE_OAUTH_CONFIG.clientId,
    redirect_uri: GOOGLE_OAUTH_CONFIG.redirectUri,
    response_type: 'code',
    scope: scopes.join(' '),
    access_type: 'offline',
    prompt: 'consent',
    state,
  });
  
  return `${GOOGLE_API_ENDPOINTS.AUTH}?${params.toString()}`;
}

/**
 * Format date for GSC/GA4 API (YYYY-MM-DD)
 */
export function formatDateForAPI(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Get date range for comparison
 */
export function getComparisonDateRanges(currentDays: number = 30, previousDays: number = 30) {
  const now = new Date();
  const currentEnd = new Date(now);
  currentEnd.setDate(currentEnd.getDate() - 2); // GSC has 2-day delay
  
  const currentStart = new Date(currentEnd);
  currentStart.setDate(currentStart.getDate() - currentDays);
  
  const previousEnd = new Date(currentStart);
  previousEnd.setDate(previousEnd.getDate() - 1);
  
  const previousStart = new Date(previousEnd);
  previousStart.setDate(previousStart.getDate() - previousDays);
  
  return {
    current: {
      start: formatDateForAPI(currentStart),
      end: formatDateForAPI(currentEnd),
    },
    previous: {
      start: formatDateForAPI(previousStart),
      end: formatDateForAPI(previousEnd),
    },
  };
}
