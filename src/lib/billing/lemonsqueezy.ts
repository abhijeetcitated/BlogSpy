import crypto from "crypto"
import {
  createCheckout as createCheckoutSession,
  getCustomerPortalUrlByEmail,
  type WebhookPayload,
} from "@/lib/payments/lemonsqueezy"

type CheckoutInput = {
  variantId: string
  userId: string
  email?: string
  returnUrl?: string
  customData?: Record<string, string | number | undefined>
}

export async function createCheckout({
  variantId,
  userId,
  email,
  returnUrl,
  customData,
}: CheckoutInput): Promise<string> {
  const payload: Record<string, string> = {
    userId,
  }

  if (customData) {
    Object.entries(customData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        payload[key] = String(value)
      }
    })
  }

  return createCheckoutSession({
    variantId,
    email,
    customData: payload,
    returnUrl,
  })
}

export async function getPortalUrlByEmail(email?: string): Promise<string | null> {
  if (!email) return null
  return getCustomerPortalUrlByEmail(email)
}

export function verifyWebhookSignature(rawBody: string, signature: string): boolean {
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET
  if (!secret) {
    throw new Error("Missing LEMONSQUEEZY_WEBHOOK_SECRET")
  }

  const digest = crypto.createHmac("sha256", secret).update(rawBody).digest("hex")
  const signatureBuffer = Buffer.from(signature)
  const digestBuffer = Buffer.from(digest)

  if (signatureBuffer.length !== digestBuffer.length) {
    return false
  }

  return crypto.timingSafeEqual(signatureBuffer, digestBuffer)
}

export type { WebhookPayload }
