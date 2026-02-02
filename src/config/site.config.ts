// ============================================
// SITE CONFIGURATION
// ============================================
// Central configuration for the BlogSpy application
// ============================================

export const siteConfig = {
  name: "BlogSpy",
  description: "AI-Powered SEO Intelligence Platform",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  
  // Branding
  branding: {
    logo: "/logo.svg",
    favicon: "/favicon.ico",
    primaryColor: "#10b981", // Emerald
    accentColor: "#06b6d4", // Cyan
  },

  // Contact
  contact: {
    email: "support@blogspy.io",
    twitter: "@blogspy",
  },

  // Features Flags
  features: {
    aiWriter: true,
    rankTracker: true,
    keywordMagic: true,
    contentDecay: true,
    topicClusters: true,
    snippetStealer: true,
    trendSpotter: true,
    competitorGap: true,
  },

  // Limits (Free Plan)
  limits: {
    free: {
      keywordSearches: 10,
      rankTracking: 50,
      aiCredits: 100,
      competitors: 3,
    },
    pro: {
      keywordSearches: 500,
      rankTracking: 1000,
      aiCredits: 1000,
      competitors: 10,
    },
    agency: {
      keywordSearches: -1, // Unlimited
      rankTracking: -1,
      aiCredits: 5000,
      competitors: 50,
    },
  },

  // SEO Defaults
  seo: {
    titleTemplate: "%s | BlogSpy",
    defaultTitle: "BlogSpy - AI-Powered SEO Intelligence",
    defaultDescription: "Discover trending keywords, track rankings, analyze competitors, and create SEO-optimized content with AI.",
  },
} as const

export type SiteConfig = typeof siteConfig
