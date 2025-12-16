/**
 * ============================================
 * NEWS & DISCOVER TRACKER - API PRICING CONFIG
 * ============================================
 * 
 * Deep Research on Google News/Discover API Providers
 * Research Date: January 2025
 * 
 * IMPORTANT: Google does NOT provide official public API for:
 * - Google News (deprecated in 2011)
 * - Google Discover (no public API exists)
 * 
 * Solution: Use third-party SERP scraping APIs
 * 
 * ============================================
 */

// ============================================
// OFFICIAL GOOGLE APIs (LIMITED)
// ============================================

export const GOOGLE_OFFICIAL_APIS = {
  customSearch: {
    name: "Google Custom Search JSON API",
    url: "https://developers.google.com/custom-search/v1/overview",
    pricing: {
      free: 100, // queries per day
      paid: 5, // $ per 1000 queries
      perQuery: 0.005, // $0.005 per query
    },
    supports: {
      webSearch: true,
      imageSearch: true,
      newsSearch: false, // NOT SUPPORTED
      discoverSearch: false, // NOT SUPPORTED
    },
    note: "Only for web/image search, NOT for News or Discover",
  },
  searchConsole: {
    name: "Google Search Console API",
    url: "https://developers.google.com/webmaster-tools",
    pricing: {
      cost: "FREE",
      limit: "Own sites only",
    },
    supports: {
      discoverPerformance: true, // impressions, clicks for your site
      newsPerformance: true, // if site is in Google News
    },
    note: "Only shows performance data for sites you own, not competitor tracking",
  },
} as const

// ============================================
// THIRD-PARTY API PROVIDERS (RECOMMENDED)
// ============================================

export const API_PROVIDERS = {
  // 🥇 RECOMMENDED - CHEAPEST
  dataForSEO: {
    name: "DataForSEO",
    website: "https://dataforseo.com",
    docsUrl: "https://docs.dataforseo.com/v3/serp/google/news/overview/",
    pricingModel: "PAYG", // Pay-as-you-go
    minimumDeposit: 50, // USD
    minimumDepositINR: 4200,
    freeTrial: true,
    apiLimits: {
      requestsPerMinute: 2000,
      maxResults: 100,
    },
    pricing: {
      // Per SERP request (10 results)
      standard: {
        perRequest: 0.0006, // USD
        per1000: 0.60,
        perRequestINR: 0.05,
        per1000INR: 50,
        description: "Standard Queue - Results within seconds",
      },
      priority: {
        perRequest: 0.0012, // USD
        per1000: 1.20,
        perRequestINR: 0.10,
        per1000INR: 100,
        description: "Priority Queue - Faster processing",
      },
      live: {
        perRequest: 0.002, // USD
        per1000: 2.00,
        perRequestINR: 0.17,
        per1000INR: 167,
        description: "Live Mode - Real-time results",
      },
    },
    endpoints: {
      googleNews: "/v3/serp/google/news",
      features: [
        "Top 100 Google News results",
        "Title, URL, source, date",
        "Thumbnail images",
        "Publisher info",
        "JSON/XML output",
      ],
    },
    recommended: true,
    recommendedReason: "Cheapest option at ₹0.05/keyword, PAYG model, free trial",
  },

  // 🥈 PREMIUM - MONTHLY PLANS
  serpAPI: {
    name: "SerpAPI",
    website: "https://serpapi.com",
    docsUrl: "https://serpapi.com/google-news-api",
    pricingModel: "MONTHLY",
    freeTier: true,
    plans: {
      free: {
        searches: 250,
        price: 0,
        priceINR: 0,
        perSearch: 0,
        perSearchINR: 0,
      },
      developer: {
        searches: 5000,
        price: 75, // USD/month
        priceINR: 6250,
        perSearch: 0.015,
        perSearchINR: 1.25,
      },
      production: {
        searches: 15000,
        price: 150, // USD/month
        priceINR: 12500,
        perSearch: 0.01,
        perSearchINR: 0.83,
      },
      bigData: {
        searches: 30000,
        price: 275, // USD/month
        priceINR: 23000,
        perSearch: 0.0092,
        perSearchINR: 0.77,
      },
      enterprise: {
        searches: "Custom",
        price: "Custom",
        note: "Contact for pricing",
      },
    },
    endpoints: {
      googleNews: "/google_news",
      parameters: ["q", "topic_token", "publication_token", "story_token", "kgmid"],
      features: [
        "Full Google News results",
        "Cached searches are FREE",
        "no_cache for fresh results",
        "Topic-based tracking",
        "Publisher filtering",
      ],
    },
    recommended: false,
    recommendedReason: "Good for reliability, but more expensive than DataForSEO",
  },

  // 🥉 ENTERPRISE GRADE
  brightData: {
    name: "Bright Data",
    website: "https://brightdata.com",
    docsUrl: "https://brightdata.com/products/serp-api/google/news",
    pricingModel: "HYBRID", // PAYG + Monthly
    freeTrial: true,
    plans: {
      payAsYouGo: {
        per1000Results: 1.50, // USD
        per1000ResultsINR: 125,
        perResult: 0.0015,
        perResultINR: 0.125,
        commitment: "None",
      },
      plan380K: {
        results: 380000,
        price: 499, // USD/month
        priceINR: 41600,
        per1000: 1.30,
        per1000INR: 108,
      },
      plan900K: {
        results: 900000,
        price: 999, // USD/month
        priceINR: 83300,
        per1000: 1.10,
        per1000INR: 92,
      },
      plan2M: {
        results: 2000000,
        price: 1999, // USD/month
        priceINR: 166600,
        per1000: 1.00,
        per1000INR: 83,
      },
    },
    features: [
      "Sub-1-second response time",
      "99.9% uptime SLA",
      "JSON/HTML/Markdown output",
      "Global geo-targeting (195 countries)",
      "tbm=nws for Google News",
    ],
    recommended: false,
    recommendedReason: "Best for enterprise, but overkill for BlogSpy initially",
  },
} as const

// ============================================
// BLOGSPY SELECTED CONFIGURATION
// ============================================

export const BLOGSPY_API_CONFIG = {
  // Selected Provider
  provider: "DataForSEO" as const,
  providerKey: "dataForSEO" as const,
  
  // Selected Tier
  tier: "standard" as const,
  
  // Cost Configuration (in INR)
  costPerKeyword: 0.05, // ₹0.05 per keyword check
  costPerKeywordUSD: 0.0006,
  
  // Credit System
  creditSystem: {
    // 1 credit = 1 keyword check on 1 platform
    creditPerKeywordSinglePlatform: 1,
    // Checking both News + Discover = 2 credits
    creditPerKeywordBothPlatforms: 2,
  },
  
  // Pricing Tiers for Users (Market Competitive - 93-97% Margin)
  userPricing: {
    starter: {
      id: "starter",
      credits: 100,
      price: 199, // INR
      pricePerCredit: 1.99,
      ourCost: 5, // ₹0.05 × 100
      profit: 194,
      profitMargin: 97.5, // %
      features: [
        "100 keyword tracks",
        "News + Discover both",
        "7-day data history",
        "Email alerts",
      ],
      popular: false,
      badge: null,
    },
    pro: {
      id: "pro",
      credits: 300,
      price: 399, // INR
      pricePerCredit: 1.33,
      ourCost: 15, // ₹0.05 × 300
      profit: 384,
      profitMargin: 96.2, // %
      features: [
        "300 keyword tracks",
        "News + Discover both",
        "30-day data history",
        "Priority refresh",
        "Slack integration",
        "CSV export",
      ],
      popular: true,
      badge: "BEST VALUE",
    },
    business: {
      id: "business",
      credits: 750,
      price: 799, // INR
      pricePerCredit: 1.07,
      ourCost: 37.5, // ₹0.05 × 750
      profit: 761.5,
      profitMargin: 95.3, // %
      features: [
        "750 keyword tracks",
        "News + Discover both",
        "90-day data history",
        "Export CSV/PDF",
        "Team access (3 users)",
        "API access (limited)",
        "Priority support",
      ],
      popular: false,
      badge: "TEAMS",
    },
    enterprise: {
      id: "enterprise",
      credits: 2000,
      price: 1499, // INR
      pricePerCredit: 0.75,
      ourCost: 100, // ₹0.05 × 2000
      profit: 1399,
      profitMargin: 93.3, // %
      features: [
        "2000 keyword tracks",
        "News + Discover both",
        "1-year data history",
        "Full API access",
        "Unlimited team",
        "White-label reports",
        "Dedicated support",
        "Custom integrations",
      ],
      popular: false,
      badge: "ENTERPRISE",
    },
  },
  
  // Rate Limits
  rateLimits: {
    requestsPerMinute: 2000,
    requestsPerDay: 100000,
    maxKeywordsPerBatch: 100,
  },
  
  // Features by Platform
  platformFeatures: {
    "google-news": {
      maxResults: 100,
      dataPoints: ["title", "url", "source", "date", "thumbnail", "snippet"],
      updateFrequency: "daily",
    },
    "google-discover": {
      maxResults: 100,
      dataPoints: ["title", "url", "source", "date", "thumbnail"],
      updateFrequency: "daily",
      note: "Scraped via SERP API - no official Google API exists",
    },
  },
}

// ============================================
// COMPARISON SUMMARY
// ============================================

export const API_COMPARISON = {
  cheapest: {
    provider: "DataForSEO",
    costPer1000Keywords: 50, // INR
    model: "PAYG",
  },
  mostReliable: {
    provider: "SerpAPI",
    costPer1000Keywords: 770, // INR (Big Data plan)
    model: "Monthly",
  },
  enterprise: {
    provider: "Bright Data",
    costPer1000Keywords: 83, // INR (2M plan)
    model: "Monthly",
  },
  recommendation: {
    forStartup: "DataForSEO",
    forScaling: "DataForSEO → Bright Data",
    forEnterprise: "Bright Data",
  },
}

// ============================================
// EXPORT HELPER FUNCTIONS
// ============================================

/**
 * Calculate API cost for a given number of keywords
 */
export function calculateAPICost(keywords: number, provider: keyof typeof API_PROVIDERS = "dataForSEO"): {
  costUSD: number
  costINR: number
  provider: string
} {
  const providerConfig = API_PROVIDERS[provider]
  
  if (provider === "dataForSEO") {
    const costUSD = keywords * 0.0006
    return {
      costUSD,
      costINR: costUSD * 83, // Approximate USD to INR
      provider: providerConfig.name,
    }
  }
  
  // Add more providers as needed
  return {
    costUSD: keywords * 0.001, // default
    costINR: keywords * 0.083,
    provider: "Unknown",
  }
}

/**
 * Calculate profit margin for selling credits
 */
export function calculateProfitMargin(
  creditsToSell: number,
  sellPrice: number, // INR
  costPerCredit: number = BLOGSPY_API_CONFIG.costPerKeyword
): {
  totalCost: number
  profit: number
  marginPercentage: number
} {
  const totalCost = creditsToSell * costPerCredit
  const profit = sellPrice - totalCost
  const marginPercentage = ((profit / totalCost) * 100)
  
  return {
    totalCost,
    profit,
    marginPercentage: Math.round(marginPercentage),
  }
}

/**
 * Get recommended plan based on usage
 */
export function getRecommendedPlan(monthlyKeywords: number): keyof typeof BLOGSPY_API_CONFIG.userPricing {
  if (monthlyKeywords <= 100) return "starter"
  if (monthlyKeywords <= 300) return "pro"
  if (monthlyKeywords <= 750) return "business"
  return "enterprise"
}
