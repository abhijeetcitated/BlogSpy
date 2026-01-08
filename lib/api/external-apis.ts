/**
 * ============================================
 * EXTERNAL API CONFIGURATION
 * ============================================
 * 
 * Centralized configuration for all external APIs
 * Add your API keys in .env.local file
 * 
 * Usage:
 * ```ts
 * import { YouTubeConfig, TikTokConfig, DataForSEOConfig } from "@/lib/api/external-apis"
 * 
 * if (YouTubeConfig.isConfigured) {
 *   // make API calls
 * }
 * ```
 * ============================================
 */

// ============================================
// YOUTUBE API
// ============================================

export const YouTubeConfig = {
  /** YouTube Data API v3 base URL */
  baseUrl: "https://www.googleapis.com/youtube/v3",
  
  /** API key from environment */
  get apiKey(): string | undefined {
    return process.env.YOUTUBE_API_KEY
  },
  
  /** Check if API is configured */
  get isConfigured(): boolean {
    return !!this.apiKey
  },
  
  /** Daily quota limit (default: 10,000 units) */
  quotaLimit: 10000,
  
  /** Quota costs per operation */
  quotaCosts: {
    search: 100,
    videos: 1,
    channels: 1,
    comments: 1,
    playlists: 1,
  },
} as const

// ============================================
// TIKTOK API (via RapidAPI)
// ============================================

export const TikTokConfig = {
  /** RapidAPI TikTok scraper host */
  host: "tiktok-scraper7.p.rapidapi.com",
  
  /** Base URL */
  get baseUrl(): string {
    return `https://${this.host}`
  },
  
  /** API key from environment */
  get apiKey(): string | undefined {
    return process.env.RAPIDAPI_KEY
  },
  
  /** Check if API is configured */
  get isConfigured(): boolean {
    return !!this.apiKey
  },
  
  /** Get headers for RapidAPI requests */
  get headers(): Record<string, string> {
    return {
      "X-RapidAPI-Key": this.apiKey || "",
      "X-RapidAPI-Host": this.host,
    }
  },
} as const

// ============================================
// DATAFORSEO API
// ============================================

export const DataForSEOConfig = {
  /** DataForSEO base URL */
  baseUrl: "https://api.dataforseo.com/v3",
  
  /** API credentials from environment */
  get login(): string | undefined {
    return process.env.DATAFORSEO_LOGIN
  },
  
  get password(): string | undefined {
    return process.env.DATAFORSEO_PASSWORD
  },
  
  /** Check if API is configured */
  get isConfigured(): boolean {
    return !!(this.login && this.password)
  },
  
  /** Get authorization header */
  get authHeader(): string {
    if (!this.login || !this.password) return ""
    return `Basic ${Buffer.from(`${this.login}:${this.password}`).toString("base64")}`
  },
  
  /** Get headers for requests */
  get headers(): Record<string, string> {
    return {
      "Authorization": this.authHeader,
      "Content-Type": "application/json",
    }
  },
  
  /** Available endpoints */
  endpoints: {
    serp: "/serp/google/organic/live/advanced",
    keywords: "/keywords_data/google/search_volume/live",
    keywordSuggestions: "/keywords_data/google/keywords_for_keywords/live",
    backlinks: "/backlinks/summary/live",
    domainMetrics: "/domain_analytics/technologies/domain_technologies/live",
  },
} as const

// ============================================
// GOOGLE TRENDS API (Unofficial)
// ============================================

export const GoogleTrendsConfig = {
  /** Google Trends base URL */
  baseUrl: "https://trends.google.com/trends/api",
  
  /** No API key needed - uses web scraping */
  isConfigured: true,
  
  /** Rate limit: be gentle */
  requestDelay: 1000, // 1 second between requests
} as const

// ============================================
// SUPABASE
// ============================================

export const SupabaseConfig = {
  get url(): string | undefined {
    return process.env.NEXT_PUBLIC_SUPABASE_URL
  },
  
  get anonKey(): string | undefined {
    return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  },
  
  get serviceRoleKey(): string | undefined {
    return process.env.SUPABASE_SERVICE_ROLE_KEY
  },
  
  get isConfigured(): boolean {
    return !!(this.url && this.anonKey)
  },
} as const

// ============================================
// STRIPE (Payments)
// ============================================

export const StripeConfig = {
  get secretKey(): string | undefined {
    return process.env.STRIPE_SECRET_KEY
  },
  
  get publishableKey(): string | undefined {
    return process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  },
  
  get webhookSecret(): string | undefined {
    return process.env.STRIPE_WEBHOOK_SECRET
  },
  
  get isConfigured(): boolean {
    return !!(this.secretKey && this.publishableKey)
  },
  
  /** Price IDs for subscription plans */
  prices: {
    pro: {
      monthly: process.env.STRIPE_PRO_MONTHLY_PRICE_ID || "price_pro_monthly",
      yearly: process.env.STRIPE_PRO_YEARLY_PRICE_ID || "price_pro_yearly",
    },
    enterprise: {
      monthly: process.env.STRIPE_ENTERPRISE_MONTHLY_PRICE_ID || "price_enterprise_monthly",
      yearly: process.env.STRIPE_ENTERPRISE_YEARLY_PRICE_ID || "price_enterprise_yearly",
    },
  },
} as const

// ============================================
// OPENAI (for AI features)
// ============================================

export const OpenAIConfig = {
  get apiKey(): string | undefined {
    return process.env.OPENAI_API_KEY
  },
  
  get isConfigured(): boolean {
    return !!this.apiKey
  },
  
  /** Default model */
  defaultModel: "gpt-4-turbo-preview",
  
  /** Embedding model */
  embeddingModel: "text-embedding-3-small",
} as const

// ============================================
// HELPER: Check all API configurations
// ============================================

export function getApiStatus() {
  return {
    youtube: {
      configured: YouTubeConfig.isConfigured,
      name: "YouTube Data API",
    },
    tiktok: {
      configured: TikTokConfig.isConfigured,
      name: "TikTok (RapidAPI)",
    },
    dataforseo: {
      configured: DataForSEOConfig.isConfigured,
      name: "DataForSEO",
    },
    supabase: {
      configured: SupabaseConfig.isConfigured,
      name: "Supabase",
    },
    stripe: {
      configured: StripeConfig.isConfigured,
      name: "Stripe",
    },
    openai: {
      configured: OpenAIConfig.isConfigured,
      name: "OpenAI",
    },
  }
}

/**
 * Log API configuration status (for debugging)
 */
export function logApiStatus() {
  const status = getApiStatus()
  console.log("\n🔧 API Configuration Status:")
  console.log("─".repeat(40))
  
  Object.values(status).forEach((value) => {
    const icon = value.configured ? "✅" : "❌"
    console.log(`${icon} ${value.name}: ${value.configured ? "Configured" : "Not configured"}`)
  })
  
  console.log("─".repeat(40))
}
