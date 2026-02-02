/**
 * Constants Configuration
 * Application-wide constants and configuration values
 */

// Plan configurations
export const PLANS = {
  FREE: {
    id: "free",
    name: "Free",
    price: 0,
    priceYearly: 0,
    credits: 50,
    features: [
      "50 keyword searches/month",
      "5 keyword tracking",
      "Basic content analysis",
      "7-day trend data",
      "Email support",
    ],
    limits: {
      keywordSearches: 50,
      trackedKeywords: 5,
      contentAnalysis: 10,
      aiWriter: 3,
      projects: 1,
    },
  },
  PRO: {
    id: "pro",
    name: "Pro",
    price: 49,
    priceYearly: 470, // 2 months free
    credits: 500,
    features: [
      "500 keyword searches/month",
      "100 keyword tracking",
      "Advanced content analysis",
      "30-day trend data",
      "AI content writer",
      "Topic clusters",
      "Priority support",
    ],
    limits: {
      keywordSearches: 500,
      trackedKeywords: 100,
      contentAnalysis: 100,
      aiWriter: 50,
      projects: 5,
    },
  },
  ENTERPRISE: {
    id: "enterprise",
    name: "Enterprise",
    price: 199,
    priceYearly: 1910, // 2 months free
    credits: 5000,
    features: [
      "Unlimited keyword searches",
      "Unlimited keyword tracking",
      "Full content analysis suite",
      "Historical trend data",
      "Unlimited AI writer",
      "API access",
      "White-label reports",
      "Dedicated account manager",
      "Custom integrations",
    ],
    limits: {
      keywordSearches: Infinity,
      trackedKeywords: Infinity,
      contentAnalysis: Infinity,
      aiWriter: Infinity,
      projects: Infinity,
    },
  },
} as const

export type PlanId = keyof typeof PLANS

// SEO metrics thresholds
export const SEO_THRESHOLDS = {
  DIFFICULTY: {
    EASY: 30,
    MEDIUM: 50,
    HARD: 70,
    VERY_HARD: 100,
  },
  VOLUME: {
    LOW: 1000,
    MEDIUM: 10000,
    HIGH: 100000,
  },
  CPC: {
    LOW: 0.5,
    MEDIUM: 2,
    HIGH: 5,
  },
  CONTENT_SCORE: {
    POOR: 40,
    FAIR: 60,
    GOOD: 80,
    EXCELLENT: 100,
  },
  DECAY_RISK: {
    LOW: 20,
    MEDIUM: 40,
    HIGH: 60,
    CRITICAL: 80,
  },
} as const

// Search intent types
export const SEARCH_INTENTS = [
  { id: "informational", label: "Informational", icon: "📚", color: "blue" },
  { id: "navigational", label: "Navigational", icon: "🧭", color: "purple" },
  { id: "transactional", label: "Transactional", icon: "💰", color: "green" },
  { id: "commercial", label: "Commercial", icon: "🔍", color: "orange" },
] as const

// SERP features
export const SERP_FEATURES = [
  { id: "featured_snippet", label: "Featured Snippet", icon: "⭐" },
  { id: "people_also_ask", label: "People Also Ask", icon: "❓" },
  { id: "local_pack", label: "Local Pack", icon: "📍" },
  { id: "image_pack", label: "Image Pack", icon: "🖼️" },
  { id: "video", label: "Video", icon: "🎬" },
  { id: "knowledge_panel", label: "Knowledge Panel", icon: "📋" },
  { id: "shopping", label: "Shopping", icon: "🛒" },
  { id: "news", label: "News", icon: "📰" },
  { id: "site_links", label: "Site Links", icon: "🔗" },
  { id: "reviews", label: "Reviews", icon: "⭐" },
] as const

// Content decay risk colors
export const DECAY_RISK_COLORS = {
  none: { bg: "bg-slate-500/20", text: "text-slate-400", border: "border-slate-500" },
  low: { bg: "bg-green-500/20", text: "text-green-400", border: "border-green-500" },
  medium: { bg: "bg-yellow-500/20", text: "text-yellow-400", border: "border-yellow-500" },
  high: { bg: "bg-orange-500/20", text: "text-orange-400", border: "border-orange-500" },
  critical: { bg: "bg-red-500/20", text: "text-red-400", border: "border-red-500" },
} as const

// Countries/Locations for SEO data
export const LOCATIONS = [
  { code: "US", name: "United States", flag: "🇺🇸" },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧" },
  { code: "CA", name: "Canada", flag: "🇨🇦" },
  { code: "AU", name: "Australia", flag: "🇦🇺" },
  { code: "DE", name: "Germany", flag: "🇩🇪" },
  { code: "FR", name: "France", flag: "🇫🇷" },
  { code: "IN", name: "India", flag: "🇮🇳" },
  { code: "BR", name: "Brazil", flag: "🇧🇷" },
  { code: "JP", name: "Japan", flag: "🇯🇵" },
  { code: "ES", name: "Spain", flag: "🇪🇸" },
] as const

// Languages
export const LANGUAGES = [
  { code: "en", name: "English" },
  { code: "es", name: "Spanish" },
  { code: "de", name: "German" },
  { code: "fr", name: "French" },
  { code: "pt", name: "Portuguese" },
  { code: "it", name: "Italian" },
  { code: "nl", name: "Dutch" },
  { code: "ja", name: "Japanese" },
  { code: "zh", name: "Chinese" },
  { code: "ko", name: "Korean" },
] as const

// Date range presets
export const DATE_RANGES = [
  { id: "7d", label: "Last 7 days", days: 7 },
  { id: "30d", label: "Last 30 days", days: 30 },
  { id: "90d", label: "Last 90 days", days: 90 },
  { id: "6m", label: "Last 6 months", days: 180 },
  { id: "1y", label: "Last year", days: 365 },
  { id: "all", label: "All time", days: 0 },
] as const

// Pagination defaults
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
} as const

// API rate limits
export const RATE_LIMITS = {
  KEYWORDS_PER_MINUTE: 60,
  CONTENT_ANALYSIS_PER_MINUTE: 30,
  AI_WRITER_PER_MINUTE: 10,
} as const

// Animation durations (ms)
export const ANIMATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
  PAGE_TRANSITION: 200,
} as const

// Chart colors
export const CHART_COLORS = {
  primary: "#10b981", // emerald-500
  secondary: "#06b6d4", // cyan-500
  tertiary: "#8b5cf6", // violet-500
  danger: "#ef4444", // red-500
  warning: "#f59e0b", // amber-500
  success: "#22c55e", // green-500
  muted: "#64748b", // slate-500
} as const

export default {
  PLANS,
  SEO_THRESHOLDS,
  SEARCH_INTENTS,
  SERP_FEATURES,
  DECAY_RISK_COLORS,
  LOCATIONS,
  LANGUAGES,
  DATE_RANGES,
  PAGINATION,
  RATE_LIMITS,
  ANIMATION,
  CHART_COLORS,
}
