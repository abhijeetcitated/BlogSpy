// ============================================
// FEATURE CONFIG - Keyword Magic Feature Configuration
// ============================================

/**
 * Feature configuration for keyword magic
 */
export const FEATURE_CONFIG = {
  // Feature metadata
  name: "Keyword Magic",
  slug: "keyword-magic",
  description: "Discover keyword opportunities with comprehensive metrics",
  
  // Feature flags
  flags: {
    enableBulkMode: true,
    enableExport: true,
    enableFilters: true,
    enableWeakSpots: true,
    enableTrends: true,
    enableSerpFeatures: true,
  },

  // UI settings
  ui: {
    defaultCountry: "us",
    defaultMatchType: "broad" as const,
    defaultMode: "single" as const,
    showTutorial: true,
    enableKeyboardShortcuts: true,
  },

  // Filter defaults
  filters: {
    volume: { min: 0, max: null },
    kd: { min: 0, max: 100 },
    cpc: { min: 0, max: null },
    wordCount: { min: 1, max: 10 },
  },

  // Data display
  display: {
    defaultColumns: [
      "checkbox",
      "keyword", 
      "volume",
      "kd",
      "cpc",
      "intent",
      "trend",
    ] as const,
    optionalColumns: [
      "serp",
      "geo",
      "weakSpot",
      "refresh",
    ] as const,
  },

  // Export options
  export: {
    formats: ["csv", "json", "xlsx"] as const,
    maxRows: 50000,
  },
} as const

export type FeatureConfig = typeof FEATURE_CONFIG
