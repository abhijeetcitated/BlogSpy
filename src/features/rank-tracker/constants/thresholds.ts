// ============================================
// RANK TRACKER - Rank Thresholds & Weights
// ============================================

/**
 * Rank position thresholds
 */
export const RANK_THRESHOLDS = {
  TOP_3: 3,
  TOP_10: 10,
  TOP_20: 20,
  TOP_100: 100,
} as const

/**
 * Visibility score weights based on rank position
 */
export const VISIBILITY_WEIGHTS = {
  TOP_3: 10,
  TOP_10: 5,
  TOP_20: 2,
  DEFAULT: 1,
} as const

/**
 * Click-through rate estimates by position
 */
export const CTR_ESTIMATES = {
  POSITION_1: 0.30,
  TOP_3: 0.15,
  TOP_10: 0.05,
  DEFAULT: 0.01,
} as const

/**
 * Pagination defaults
 */
export const PAGINATION_DEFAULTS = {
  ITEMS_PER_PAGE: 10,
  ITEMS_PER_PAGE_OPTIONS: [10, 25, 50, 100],
} as const

/**
 * Auto-refresh intervals in minutes
 */
export const AUTO_REFRESH_INTERVALS = {
  ONE_MIN: 1,
  FIVE_MINS: 5,
  FIFTEEN_MINS: 15,
  THIRTY_MINS: 30,
} as const

/**
 * Debounce delay in milliseconds
 */
export const DEBOUNCE_MS = {
  SEARCH: 300,
  RESIZE: 150,
} as const

/**
 * Toast notification messages
 */
export const TOAST_MESSAGES = {
  REFRESH_SUCCESS: "Rankings refreshed successfully",
  ALERT_SAVED: "Alert settings saved!",
  KEYWORD_DELETED: (keyword: string) => `Deleted "${keyword}" from tracking`,
  KEYWORDS_DELETED: (count: number) => `Deleted ${count} keyword(s) from tracking`,
  KEYWORD_UPDATED: (keyword: string) => `Updated keyword to "${keyword}"`,
  KEYWORDS_ADDED: (count: number) => `Added ${count} keyword(s) to tracking. Refreshing data...`,
  EXPORT_SUCCESS: (count: number) => `Exported ${count} keywords to CSV`,
  AUTO_REFRESH_ENABLED: (mins: number) => `Auto-refresh enabled: every ${mins} minute(s)`,
  AUTO_REFRESH_DISABLED: "Auto-refresh disabled",
  SELECT_KEYWORDS: "Please select keywords to export",
  ENTER_KEYWORD: "Please enter at least one keyword",
} as const

/**
 * Alert threshold for significant rank changes
 */
export const ALERT_THRESHOLDS = {
  SIGNIFICANT_CHANGE: 3,
} as const
