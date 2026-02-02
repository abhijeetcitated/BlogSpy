/**
 * Stripe Service
 * Handles all Stripe-related business logic
 * 
 * NOTE: Currently using MOCK implementation
 * Real Stripe integration will be added later
 */

import { getStripe, getPriceId, formatStripeAmount } from "@/lib/stripe"

// Mock Stripe types for development
type SubscriptionStatus = "active" | "canceled" | "past_due" | "unpaid" | "trialing" | "incomplete"

export interface CreateCheckoutParams {
  userId: string
  email: string
  plan: "pro" | "enterprise"
  interval: "monthly" | "yearly"
  successUrl: string
  cancelUrl: string
}

export interface SubscriptionInfo {
  id: string
  status: SubscriptionStatus
  plan: string
  currentPeriodEnd: Date
  cancelAtPeriodEnd: boolean
  priceId: string
  amount: number
  currency: string
}

interface MockInvoice {
  id: string
  number: string | null
  status: string
  amount_due: number
  currency: string
  created: number
  invoice_pdf: string | null
  hosted_invoice_url: string | null
}

class StripeService {
  /**
   * Create a checkout session for subscription
   */
  async createCheckoutSession(params: CreateCheckoutParams): Promise<{ url: string }> {
    const stripe = getStripe()
    const priceId = getPriceId(params.plan, params.interval)

    if (!priceId) {
      throw new Error(`Price ID not configured for ${params.plan} ${params.interval}`)
    }

    // Mock checkout session
    const session = await stripe.checkout.sessions.create({
      userId: params.userId,
      email: params.email,
      plan: params.plan,
      priceId,
    })

    // In mock, return a fake checkout URL
    return { url: session.url || `/checkout/mock?plan=${params.plan}` }
  }

  /**
   * Create a customer portal session for managing subscription
   */
  async createPortalSession(customerId: string, returnUrl: string): Promise<{ url: string }> {
    const stripe = getStripe()

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    })

    return { url: session.url || `/billing/portal/mock` }
  }

  /**
   * Get subscription by customer ID
   * Returns mock data in development
   */
  async getSubscription(customerId: string): Promise<SubscriptionInfo | null> {
    // Mock subscription data
    return {
      id: "sub_mock_123",
      status: "active",
      plan: "pro",
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      cancelAtPeriodEnd: false,
      priceId: "price_mock_pro_monthly",
      amount: 4900, // $49.00
      currency: "usd",
    }
  }

  /**
   * Cancel subscription at period end
   */
  async cancelSubscription(subscriptionId: string): Promise<void> {
    // Mock - just log
    console.log(`[MOCK] Canceling subscription: ${subscriptionId}`)
  }

  /**
   * Resume canceled subscription
   */
  async resumeSubscription(subscriptionId: string): Promise<void> {
    // Mock - just log
    console.log(`[MOCK] Resuming subscription: ${subscriptionId}`)
  }

  /**
   * Create or get Stripe customer
   */
  async getOrCreateCustomer(userId: string, email: string): Promise<string> {
    // Mock customer ID
    return `cus_mock_${userId.slice(0, 8)}`
  }

  /**
   * Get invoices for customer
   * Returns mock data
   */
  async getInvoices(customerId: string, limit = 10): Promise<MockInvoice[]> {
    // Mock invoice data
    return [
      {
        id: "inv_mock_001",
        number: "INV-001",
        status: "paid",
        amount_due: 4900,
        currency: "usd",
        created: Date.now() / 1000 - 30 * 24 * 60 * 60, // 30 days ago
        invoice_pdf: null,
        hosted_invoice_url: null,
      },
      {
        id: "inv_mock_002",
        number: "INV-002",
        status: "paid",
        amount_due: 4900,
        currency: "usd",
        created: Date.now() / 1000 - 60 * 24 * 60 * 60, // 60 days ago
        invoice_pdf: null,
        hosted_invoice_url: null,
      },
    ].slice(0, limit)
  }

  /**
   * Format invoice for display
   */
  formatInvoice(invoice: MockInvoice) {
    return {
      id: invoice.id,
      number: invoice.number,
      status: invoice.status,
      amount: formatStripeAmount(invoice.amount_due, invoice.currency),
      date: new Date(invoice.created * 1000),
      pdfUrl: invoice.invoice_pdf,
      hostedUrl: invoice.hosted_invoice_url,
    }
  }
}

// Export singleton instance
export const stripeService = new StripeService()
