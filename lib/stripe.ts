/**
 * Stripe Client Configuration
 * Handles Stripe initialization and helpers
 * 
 * NOTE: Currently using MOCK implementation
 * Real Stripe integration will be added later:
 * 1. npm install stripe
 * 2. Set up STRIPE_SECRET_KEY in .env
 * 3. Replace mock functions with real Stripe imports
 */

// Mock Stripe types for development
interface MockStripe {
  customers: {
    create: (params: unknown) => Promise<{ id: string }>;
    retrieve: (id: string) => Promise<{ id: string; email: string }>;
  };
  subscriptions: {
    create: (params: unknown) => Promise<{ id: string; status: string }>;
    retrieve: (id: string) => Promise<{ id: string; status: string }>;
  };
  checkout: {
    sessions: {
      create: (params: unknown) => Promise<{ id: string; url: string }>;
    };
  };
  billingPortal: {
    sessions: {
      create: (params: unknown) => Promise<{ id: string; url: string }>;
    };
  };
}

// Mock Stripe instance for development
const mockStripeInstance: MockStripe = {
  customers: {
    create: async () => ({ id: "cus_mock_123" }),
    retrieve: async (id) => ({ id, email: "demo@blogspy.io" }),
  },
  subscriptions: {
    create: async () => ({ id: "sub_mock_123", status: "active" }),
    retrieve: async (id) => ({ id, status: "active" }),
  },
  checkout: {
    sessions: {
      create: async () => ({ 
        id: "cs_mock_123", 
        url: "https://checkout.stripe.com/mock" 
      }),
    },
  },
  billingPortal: {
    sessions: {
      create: async () => ({ 
        id: "bps_mock_123", 
        url: "https://billing.stripe.com/mock" 
      }),
    },
  },
}

/**
 * Get Stripe server instance
 * Use this in API routes and server actions
 * 
 * TODO: Replace with real Stripe when installed:
 * import Stripe from "stripe"
 * stripeInstance = new Stripe(secretKey, { apiVersion: "2024-11-20.acacia" })
 */
export function getStripe(): MockStripe {
  // Mock: Return mock instance
  // In production: Initialize real Stripe SDK
  return mockStripeInstance
}

/**
 * Price IDs for subscription plans
 */
export const STRIPE_PRICE_IDS = {
  PRO_MONTHLY: process.env.STRIPE_PRICE_PRO_MONTHLY || "price_mock_pro_monthly",
  PRO_YEARLY: process.env.STRIPE_PRICE_PRO_YEARLY || "price_mock_pro_yearly",
  ENTERPRISE_MONTHLY: process.env.STRIPE_PRICE_ENTERPRISE_MONTHLY || "price_mock_ent_monthly",
  ENTERPRISE_YEARLY: process.env.STRIPE_PRICE_ENTERPRISE_YEARLY || "price_mock_ent_yearly",
} as const

/**
 * Get price ID for a plan
 */
export function getPriceId(plan: "pro" | "enterprise", interval: "monthly" | "yearly"): string {
  const key = `${plan.toUpperCase()}_${interval.toUpperCase()}` as keyof typeof STRIPE_PRICE_IDS
  return STRIPE_PRICE_IDS[key]
}

/**
 * Format amount for display
 */
export function formatStripeAmount(amount: number, currency = "usd"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount / 100)
}

/**
 * Webhook event types we handle
 */
export const STRIPE_WEBHOOK_EVENTS = [
  "checkout.session.completed",
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
  "invoice.payment_succeeded",
  "invoice.payment_failed",
] as const

export type StripeWebhookEvent = (typeof STRIPE_WEBHOOK_EVENTS)[number]
