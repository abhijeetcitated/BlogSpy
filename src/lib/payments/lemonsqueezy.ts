/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════
 * 💳 LEMON SQUEEZY PAYMENT CLIENT
 * ═══════════════════════════════════════════════════════════════════════════════════════════════
 * 
 * Payment processing client using Lemon Squeezy.
 * Handles subscriptions, one-time payments, and webhooks.
 * 
 * Dashboard: https://app.lemonsqueezy.com/
 * API Docs: https://docs.lemonsqueezy.com/api
 * 
 * @example
 * ```ts
 * import { lemonSqueezy, createCheckout } from "@/lib/payments/lemonsqueezy"
 * 
 * // Create a checkout session
 * const checkout = await createCheckout({
 *   variantId: "123456",
 *   email: "user@example.com",
 * })
 * ```
 */

import {
  lemonSqueezySetup,
  createCheckout as lsCreateCheckout,
  getSubscription as lsGetSubscription,
  cancelSubscription as lsCancelSubscription,
  updateSubscription as lsUpdateSubscription,
  listProducts,
  listVariants,
} from "@lemonsqueezy/lemonsqueezy.js"
import crypto from "crypto"

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// ENVIRONMENT VALIDATION
// ═══════════════════════════════════════════════════════════════════════════════════════════════

interface LemonSqueezyConfig {
  apiKey: string
  webhookSecret: string
  storeId?: string
}

function getLemonSqueezyConfig(): LemonSqueezyConfig {
  const apiKey = process.env.LEMONSQUEEZY_API_KEY
  const webhookSecret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET
  const storeId = process.env.LEMONSQUEEZY_STORE_ID

  if (!apiKey) {
    throw new Error(
      "❌ Missing LEMONSQUEEZY_API_KEY environment variable. " +
      "Get your API key from https://app.lemonsqueezy.com/settings/api"
    )
  }

  if (!webhookSecret) {
    throw new Error(
      "❌ Missing LEMONSQUEEZY_WEBHOOK_SECRET environment variable. " +
      "Create a webhook at https://app.lemonsqueezy.com/settings/webhooks"
    )
  }

  return { apiKey, webhookSecret, storeId }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// SDK INITIALIZATION
// ═══════════════════════════════════════════════════════════════════════════════════════════════

let isInitialized = false

/**
 * Initialize Lemon Squeezy SDK.
 * Called automatically on first use.
 */
function initializeLemonSqueezy(): void {
  if (isInitialized) return

  const { apiKey } = getLemonSqueezyConfig()

  lemonSqueezySetup({
    apiKey,
    onError: (error: Error) => {
      console.error("❌ Lemon Squeezy Error:", error)
    },
  })

  isInitialized = true
}

/**
 * Ensure SDK is initialized before any operation.
 */
function ensureInitialized(): void {
  if (!isInitialized) {
    initializeLemonSqueezy()
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// WEBHOOK VERIFICATION
// ═══════════════════════════════════════════════════════════════════════════════════════════════

/**
 * Verify Lemon Squeezy webhook signature.
 * Call this in your webhook route handler.
 * 
 * @param rawBody - Raw request body (string)
 * @param signature - X-Signature header value
 * @returns boolean - Whether the signature is valid
 */
export function verifyWebhookSignature(rawBody: string, signature: string): boolean {
  const { webhookSecret } = getLemonSqueezyConfig()

  const hmac = crypto.createHmac("sha256", webhookSecret)
  const digest = hmac.update(rawBody).digest("hex")

  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest))
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// CHECKOUT OPERATIONS
// ═══════════════════════════════════════════════════════════════════════════════════════════════

/**
 * Checkout creation options.
 */
export interface CreateCheckoutOptions {
  /** Variant ID from Lemon Squeezy */
  variantId: string
  /** Customer email */
  email?: string
  /** Customer name */
  name?: string
  /** Custom data to pass through checkout */
  customData?: Record<string, string>
  /** URL to redirect after successful checkout */
  successUrl?: string
  /** URL to redirect after cancelled checkout */
  cancelUrl?: string
  /** Discount code to apply */
  discountCode?: string
}

/**
 * Create a checkout session.
 * Returns a URL to redirect the user to.
 */
export async function createCheckout(options: CreateCheckoutOptions): Promise<string> {
  ensureInitialized()

  const { storeId } = getLemonSqueezyConfig()

  if (!storeId) {
    throw new Error("❌ Missing LEMONSQUEEZY_STORE_ID for checkout creation.")
  }

  const response = await lsCreateCheckout(storeId, options.variantId, {
    checkoutData: {
      email: options.email,
      name: options.name,
      custom: options.customData,
      discountCode: options.discountCode,
    },
    productOptions: {
      redirectUrl: options.successUrl,
    },
  })

  if (response.error) {
    throw new Error(`❌ Checkout creation failed: ${response.error.message}`)
  }

  const checkoutUrl = response.data?.data.attributes.url

  if (!checkoutUrl) {
    throw new Error("❌ Checkout URL not returned from Lemon Squeezy.")
  }

  return checkoutUrl
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// SUBSCRIPTION OPERATIONS
// ═══════════════════════════════════════════════════════════════════════════════════════════════

/**
 * Get a subscription by ID.
 */
export async function getSubscription(subscriptionId: string) {
  ensureInitialized()

  const response = await lsGetSubscription(subscriptionId)

  if (response.error) {
    console.error("❌ Get subscription failed:", response.error.message)
    return null
  }

  return response.data?.data ?? null
}

/**
 * Cancel a subscription.
 */
export async function cancelSubscription(subscriptionId: string): Promise<boolean> {
  ensureInitialized()

  const response = await lsCancelSubscription(subscriptionId)

  if (response.error) {
    console.error("❌ Cancel subscription failed:", response.error.message)
    return false
  }

  return true
}

/**
 * Resume a paused/cancelled subscription.
 */
export async function resumeSubscription(subscriptionId: string): Promise<boolean> {
  ensureInitialized()

  const response = await lsUpdateSubscription(subscriptionId, {
    cancelled: false,
  })

  if (response.error) {
    console.error("❌ Resume subscription failed:", response.error.message)
    return false
  }

  return true
}

/**
 * Pause a subscription.
 */
export async function pauseSubscription(
  subscriptionId: string,
  mode: "void" | "free" = "void"
): Promise<boolean> {
  ensureInitialized()

  const response = await lsUpdateSubscription(subscriptionId, {
    pause: {
      mode,
    },
  })

  if (response.error) {
    console.error("❌ Pause subscription failed:", response.error.message)
    return false
  }

  return true
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// PRODUCT OPERATIONS
// ═══════════════════════════════════════════════════════════════════════════════════════════════

/**
 * Get all products from the store.
 */
export async function getProducts() {
  ensureInitialized()

  const { storeId } = getLemonSqueezyConfig()

  const response = await listProducts({
    filter: storeId ? { storeId } : undefined,
  })

  if (response.error) {
    console.error("❌ Get products failed:", response.error.message)
    return []
  }

  return response.data?.data ?? []
}

/**
 * Get all variants (pricing tiers) for a product.
 */
export async function getProductVariants(productId: string) {
  ensureInitialized()

  const response = await listVariants({
    filter: { productId },
  })

  if (response.error) {
    console.error("❌ Get variants failed:", response.error.message)
    return []
  }

  return response.data?.data ?? []
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// WEBHOOK EVENT TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════════════

/**
 * Lemon Squeezy webhook event types.
 */
export type WebhookEventType =
  | "subscription_created"
  | "subscription_updated"
  | "subscription_cancelled"
  | "subscription_resumed"
  | "subscription_expired"
  | "subscription_paused"
  | "subscription_unpaused"
  | "subscription_payment_success"
  | "subscription_payment_failed"
  | "subscription_payment_recovered"
  | "order_created"
  | "order_refunded"
  | "license_key_created"
  | "license_key_updated"

/**
 * Webhook payload structure.
 */
export interface WebhookPayload {
  meta: {
    event_name: WebhookEventType
    custom_data?: Record<string, string>
  }
  data: {
    id: string
    type: string
    attributes: Record<string, unknown>
    relationships?: Record<string, unknown>
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// SINGLETON EXPORT
// ═══════════════════════════════════════════════════════════════════════════════════════════════

/**
 * Lemon Squeezy client namespace.
 * Use this for all payment operations.
 */
export const lemonSqueezy = {
  /** Initialize the SDK (called automatically) */
  initialize: initializeLemonSqueezy,
  
  /** Verify webhook signature */
  verifyWebhook: verifyWebhookSignature,
  
  /** Create a checkout URL */
  createCheckout,
  
  /** Subscription operations */
  subscriptions: {
    get: getSubscription,
    cancel: cancelSubscription,
    resume: resumeSubscription,
    pause: pauseSubscription,
  },
  
  /** Product operations */
  products: {
    list: getProducts,
    getVariants: getProductVariants,
  },
}
