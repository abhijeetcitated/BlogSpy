import type { CommercePlatform, CommercePlatformConfig, CommerceIntent } from "../types"

// Commerce Platforms
export const COMMERCE_PLATFORMS: CommercePlatform[] = ["amazon"]

// Platform Configuration
export const COMMERCE_PLATFORM_CONFIG: Record<CommercePlatform, CommercePlatformConfig> = {
  amazon: {
    name: "Amazon",
    icon: "ShoppingCart",
    color: "#FF9900",
    bgColor: "bg-amber-500/20",
    apiSource: "Amazon API + Scraping",
    creditCost: 5,
    features: [
      "Product ranking tracking",
      "BSR monitoring",
      "Review velocity",
      "Price tracking",
      "Competition analysis"
    ]
  },
}

// Commerce Intent Colors
export const COMMERCE_INTENT_COLORS: Record<CommerceIntent, { bg: string; text: string; label: string }> = {
  transactional: { bg: "bg-emerald-500/20", text: "text-emerald-400", label: "Transactional" },
  comparison: { bg: "bg-blue-500/20", text: "text-blue-400", label: "Comparison" },
  informational: { bg: "bg-purple-500/20", text: "text-purple-400", label: "Informational" },
  branded: { bg: "bg-amber-500/20", text: "text-amber-400", label: "Branded" },
}

// Amazon Tips
export const AMAZON_TIPS: string[] = [
  "Target keywords with low sponsored competition",
  "Monitor BSR trends for demand validation",
  "Watch review velocity for trending products",
  "Prime eligibility increases visibility 2-3x",
  "Target comparison keywords for higher conversions",
  "Optimize bullet points with top keywords",
]

// Opportunity Thresholds
export const OPPORTUNITY_THRESHOLDS = {
  high: {
    minSearchVolume: 5000,
    maxDifficulty: 30,
    minPriceMargin: 15,
  },
  medium: {
    minSearchVolume: 1000,
    maxDifficulty: 50,
    minPriceMargin: 8,
  },
}

// Amazon Categories
export const AMAZON_CATEGORIES = [
  "Electronics",
  "Home & Kitchen",
  "Sports & Outdoors",
  "Beauty & Personal Care",
  "Clothing & Accessories",
  "Health & Household",
  "Toys & Games",
  "Books",
  "Garden & Outdoor",
  "Tools & Home Improvement",
]
