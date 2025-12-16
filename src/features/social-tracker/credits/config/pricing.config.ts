/**
 * ============================================
 * SOCIAL TRACKER - CREDIT PRICING CONFIG
 * ============================================
 * 
 * Production-ready pricing configuration
 * Based on API cost analysis with 85-98% profit margin
 * 
 * API Provider: EnsembleData (Bronze Plan)
 * Monthly Cost: $200 (~₹16,800)
 * Daily Limit: 5,000 units
 * 
 * @version 1.0.0
 * @lastUpdated 2025-12-15
 */

import type { CreditPackage, CreditTier, PlatformCreditConfig, CurrencyConfig } from "../types"

// ============================================
// CURRENCY CONFIGURATION
// ============================================

export const CURRENCY_CONFIG: CurrencyConfig = {
  code: "INR",
  symbol: "₹",
  locale: "en-IN",
  decimalPlaces: 0,
  // For USD conversion (if needed)
  usdRate: 84, // 1 USD = ₹84
} as const

// ============================================
// CREDIT COST ANALYSIS
// ============================================

/**
 * API Cost Breakdown (EnsembleData Bronze @ $200/mo)
 * 
 * Platform API Unit Costs:
 * - Pinterest: ~4 units/request → ₹0.54/request
 * - Twitter/X: ~4 units/request → ₹0.54/request  
 * - Instagram: ~4 units/request → ₹0.54/request
 * 
 * Our Sell Price: ₹2/credit
 * Margin: 73-85%+
 */

export const API_COST_PER_UNIT = {
  ensembleData: {
    costPerUnit: 0.00133, // USD per unit
    costPerUnitINR: 0.11,  // ₹ per unit (at 84 INR/USD)
  },
} as const

// ============================================
// PLATFORM CREDIT COSTS
// ============================================

export const PLATFORM_CREDIT_COSTS: Record<string, PlatformCreditConfig> = {
  pinterest: {
    platformId: "pinterest",
    platformName: "Pinterest",
    creditsPerKeyword: 3,
    creditsPerRefresh: 1,
    creditsPerCompetitor: 5,
    apiUnitsRequired: 4,
    estimatedCostPerRequest: 0.54, // ₹
    description: "Pin search & board analytics",
  },
  twitter: {
    platformId: "twitter",
    platformName: "X (Twitter)",
    creditsPerKeyword: 5,
    creditsPerRefresh: 2,
    creditsPerCompetitor: 8,
    apiUnitsRequired: 4,
    estimatedCostPerRequest: 0.54, // ₹
    description: "Tweet search & trend analysis",
  },
  instagram: {
    platformId: "instagram",
    platformName: "Instagram",
    creditsPerKeyword: 3,
    creditsPerRefresh: 1,
    creditsPerCompetitor: 5,
    apiUnitsRequired: 4,
    estimatedCostPerRequest: 0.54, // ₹
    description: "Hashtag & post analytics",
  },
  tiktok: {
    platformId: "tiktok",
    platformName: "TikTok",
    creditsPerKeyword: 4,
    creditsPerRefresh: 2,
    creditsPerCompetitor: 6,
    apiUnitsRequired: 2, // TikTok uses less units
    estimatedCostPerRequest: 0.27, // ₹
    description: "Video search & trend tracking",
  },
} as const

// ============================================
// CREDIT PACKAGES
// ============================================

/**
 * Credit Packages with 85%+ profit margin
 * 
 * Pricing Formula:
 * - Cost per credit: ~₹0.18 (API cost)
 * - Sell price: ₹2-8 per credit
 * - Margin: 85-98%
 */
export const CREDIT_PACKAGES: CreditPackage[] = [
  {
    id: "starter",
    name: "Starter",
    credits: 50,
    price: 399,
    pricePerCredit: 7.98,
    originalPrice: 500,
    savings: 20,
    popular: false,
    badge: null,
    color: "blue",
    features: [
      "50 premium credits",
      "Track ~16 keywords",
      "Never expires",
      "All platforms",
    ],
    estimatedKeywords: {
      pinterest: 16,
      twitter: 10,
      instagram: 16,
    },
  },
  {
    id: "growth",
    name: "Growth",
    credits: 150,
    price: 999,
    pricePerCredit: 6.66,
    originalPrice: 1200,
    savings: 17,
    popular: true,
    badge: "Best Value",
    color: "pink",
    features: [
      "150 premium credits",
      "Track ~50 keywords",
      "Never expires",
      "All platforms",
      "Priority support",
    ],
    estimatedKeywords: {
      pinterest: 50,
      twitter: 30,
      instagram: 50,
    },
  },
  {
    id: "pro",
    name: "Pro",
    credits: 500,
    price: 2999,
    pricePerCredit: 5.99,
    originalPrice: 4000,
    savings: 25,
    popular: false,
    badge: "Pro",
    color: "purple",
    features: [
      "500 premium credits",
      "Track ~166 keywords",
      "Never expires",
      "All platforms",
      "Priority support",
      "API access (coming)",
    ],
    estimatedKeywords: {
      pinterest: 166,
      twitter: 100,
      instagram: 166,
    },
  },
  {
    id: "agency",
    name: "Agency",
    credits: 2000,
    price: 9999,
    pricePerCredit: 5.00,
    originalPrice: 16000,
    savings: 38,
    popular: false,
    badge: "Agency",
    color: "amber",
    features: [
      "2000 premium credits",
      "Track ~666 keywords",
      "Never expires",
      "All platforms",
      "Dedicated support",
      "API access (coming)",
      "White-label ready",
    ],
    estimatedKeywords: {
      pinterest: 666,
      twitter: 400,
      instagram: 666,
    },
  },
] as const

// ============================================
// CUSTOM PRICING TIERS
// ============================================

export const CREDIT_TIERS: CreditTier[] = [
  { minCredits: 0, maxCredits: 49, pricePerCredit: 10.00, discount: 0 },
  { minCredits: 50, maxCredits: 99, pricePerCredit: 8.00, discount: 20 },
  { minCredits: 100, maxCredits: 249, pricePerCredit: 7.00, discount: 30 },
  { minCredits: 250, maxCredits: 499, pricePerCredit: 6.00, discount: 40 },
  { minCredits: 500, maxCredits: 999, pricePerCredit: 5.50, discount: 45 },
  { minCredits: 1000, maxCredits: 1999, pricePerCredit: 5.00, discount: 50 },
  { minCredits: 2000, maxCredits: 4999, pricePerCredit: 4.50, discount: 55 },
  { minCredits: 5000, maxCredits: Infinity, pricePerCredit: 4.00, discount: 60 },
] as const

// ============================================
// CUSTOM SLIDER CONFIG
// ============================================

export const CUSTOM_SLIDER_CONFIG = {
  minCredits: 25,
  maxCredits: 5000,
  step: 25,
  defaultValue: 100,
  basePricePerCredit: 10.00, // ₹ (base price for comparison)
} as const

// ============================================
// BONUS CREDITS CONFIG
// ============================================

export const BONUS_CONFIG = {
  // Bonus credits for first-time buyers
  firstPurchaseBonus: {
    enabled: true,
    bonusPercent: 10, // 10% extra credits
    maxBonus: 100, // Max 100 bonus credits
  },
  // Referral bonus
  referralBonus: {
    enabled: true,
    referrerCredits: 50,
    refereeCredits: 25,
  },
  // Bulk purchase bonus
  bulkBonus: {
    enabled: true,
    thresholds: [
      { minPurchase: 500, bonusPercent: 5 },
      { minPurchase: 1000, bonusPercent: 10 },
      { minPurchase: 2000, bonusPercent: 15 },
      { minPurchase: 5000, bonusPercent: 20 },
    ],
  },
} as const

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get price tier for given credit amount
 */
export function getPriceTier(credits: number): CreditTier {
  const tier = CREDIT_TIERS.find(
    (t) => credits >= t.minCredits && credits <= t.maxCredits
  )
  return tier || CREDIT_TIERS[0]
}

/**
 * Calculate total price for custom credit amount
 */
export function calculateCustomPrice(credits: number): {
  pricePerCredit: number
  totalPrice: number
  discount: number
  savings: number
} {
  const tier = getPriceTier(credits)
  const totalPrice = credits * tier.pricePerCredit
  const basePrice = credits * CUSTOM_SLIDER_CONFIG.basePricePerCredit
  const savings = basePrice - totalPrice

  return {
    pricePerCredit: tier.pricePerCredit,
    totalPrice: Math.round(totalPrice),
    discount: tier.discount,
    savings: Math.round(savings),
  }
}

/**
 * Calculate bonus credits
 */
export function calculateBonusCredits(
  credits: number,
  isFirstPurchase: boolean = false
): number {
  let bonus = 0

  // First purchase bonus
  if (isFirstPurchase && BONUS_CONFIG.firstPurchaseBonus.enabled) {
    const firstBonus = Math.floor(
      credits * (BONUS_CONFIG.firstPurchaseBonus.bonusPercent / 100)
    )
    bonus += Math.min(firstBonus, BONUS_CONFIG.firstPurchaseBonus.maxBonus)
  }

  // Bulk purchase bonus
  if (BONUS_CONFIG.bulkBonus.enabled) {
    const bulkTier = [...BONUS_CONFIG.bulkBonus.thresholds]
      .reverse()
      .find((t) => credits >= t.minPurchase)
    
    if (bulkTier) {
      bonus += Math.floor(credits * (bulkTier.bonusPercent / 100))
    }
  }

  return bonus
}

/**
 * Format price in INR
 */
export function formatPrice(amount: number): string {
  return new Intl.NumberFormat(CURRENCY_CONFIG.locale, {
    style: "currency",
    currency: CURRENCY_CONFIG.code,
    minimumFractionDigits: CURRENCY_CONFIG.decimalPlaces,
    maximumFractionDigits: CURRENCY_CONFIG.decimalPlaces,
  }).format(amount)
}

/**
 * Get package by ID
 */
export function getPackageById(packageId: string): CreditPackage | undefined {
  return CREDIT_PACKAGES.find((pkg) => pkg.id === packageId)
}
