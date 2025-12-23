/**
 * ============================================
 * NEWS TRACKER - CREDIT PLANS
 * ============================================
 * 
 * Credit plan definitions and pricing logic
 * Split from credit.service.ts for better maintainability
 * 
 * @version 1.0.0
 */

import type { CreditPlan, CreditPlanId } from "../types/credits.types"

// ============================================
// CREDIT PLANS DEFINITION
// ============================================

export const CREDIT_PLANS: Record<CreditPlanId, CreditPlan> = {
  starter: {
    id: "starter",
    name: "Starter",
    credits: 100,
    price: 199,
    pricePerCredit: 1.99,
    features: [
      "100 keyword tracks",
      "News + Discover both",
      "7-day data history",
      "Email alerts",
    ],
    popular: false,
    badge: null,
    dataRetentionDays: 7,
    teamMembers: 1,
    apiAccess: false,
    prioritySupport: false,
  },
  pro: {
    id: "pro",
    name: "Pro",
    credits: 300,
    price: 399,
    pricePerCredit: 1.33,
    originalPrice: 450,
    discount: 11,
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
    dataRetentionDays: 30,
    teamMembers: 1,
    apiAccess: false,
    prioritySupport: false,
  },
  business: {
    id: "business",
    name: "Business",
    credits: 750,
    price: 799,
    pricePerCredit: 1.07,
    originalPrice: 1125,
    discount: 29,
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
    dataRetentionDays: 90,
    teamMembers: 3,
    apiAccess: true,
    prioritySupport: true,
  },
  enterprise: {
    id: "enterprise",
    name: "Enterprise",
    credits: 2000,
    price: 1499,
    pricePerCredit: 0.75,
    originalPrice: 3000,
    discount: 50,
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
    dataRetentionDays: 365,
    teamMembers: -1, // Unlimited
    apiAccess: true,
    prioritySupport: true,
  },
  custom: {
    id: "custom",
    name: "Custom",
    credits: 0, // Variable
    price: 0, // Variable
    pricePerCredit: 0, // Variable
    features: ["Custom credit amount", "Flexible pricing"],
    popular: false,
    badge: null,
    dataRetentionDays: 30,
    teamMembers: 1,
    apiAccess: false,
    prioritySupport: false,
  },
}

// ============================================
// PLAN UTILITY FUNCTIONS
// ============================================

/**
 * Get all available plans (excluding custom)
 */
export function getPlans(): CreditPlan[] {
  return Object.values(CREDIT_PLANS).filter(p => p.id !== "custom")
}

/**
 * Get a specific plan by ID
 */
export function getPlan(planId: CreditPlanId): CreditPlan | null {
  return CREDIT_PLANS[planId] || null
}

/**
 * Calculate custom plan pricing based on quantity
 * Tiered pricing: more credits = lower per-credit cost
 */
export function calculateCustomPrice(credits: number): { 
  price: number
  pricePerCredit: number 
} {
  let pricePerCredit: number
  
  if (credits <= 100) {
    pricePerCredit = 2.00 // ₹2/credit
  } else if (credits <= 300) {
    pricePerCredit = 1.50 // ₹1.50/credit
  } else if (credits <= 750) {
    pricePerCredit = 1.20 // ₹1.20/credit
  } else {
    pricePerCredit = 1.00 // ₹1/credit
  }

  return {
    price: Math.round(credits * pricePerCredit),
    pricePerCredit,
  }
}

/**
 * Suggest appropriate plan based on credit deficit
 */
export function suggestPlan(creditDeficit: number): CreditPlanId {
  if (creditDeficit <= 100) return "starter"
  if (creditDeficit <= 300) return "pro"
  if (creditDeficit <= 750) return "business"
  return "enterprise"
}

/**
 * Calculate savings percentage for a plan
 */
export function calculateSavings(planId: CreditPlanId): number {
  const plan = CREDIT_PLANS[planId]
  if (!plan || !plan.originalPrice) return 0
  
  return Math.round(((plan.originalPrice - plan.price) / plan.originalPrice) * 100)
}
