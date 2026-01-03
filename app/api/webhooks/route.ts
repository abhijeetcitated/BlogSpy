import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"

// ============================================
// WEBHOOK SECRETS (from environment)
// ============================================

const WEBHOOK_SECRETS = {
  stripe: process.env.STRIPE_WEBHOOK_SECRET,
  clerk: process.env.CLERK_WEBHOOK_SECRET,
  lemonsqueezy: process.env.LEMONSQUEEZY_WEBHOOK_SECRET,
  dataforseo: process.env.DATAFORSEO_WEBHOOK_SECRET,
  generic: process.env.WEBHOOK_SECRET,
} as const

type WebhookProvider = keyof typeof WEBHOOK_SECRETS

// ============================================
// SIGNATURE VERIFICATION
// ============================================

/**
 * Verify webhook signature using HMAC-SHA256 with timing-safe comparison.
 * This prevents timing attacks that could leak signature information.
 */
function verifySignature(
  rawBody: string,
  signature: string,
  secret: string
): boolean {
  try {
    // Create HMAC digest
    const hmac = crypto.createHmac("sha256", secret)
    const expectedSignature = hmac.update(rawBody, "utf8").digest("hex")

    // Ensure both signatures are same length to prevent length-based timing attacks
    const providedSigBuffer = Buffer.from(signature, "utf8")
    const expectedSigBuffer = Buffer.from(expectedSignature, "utf8")

    if (providedSigBuffer.length !== expectedSigBuffer.length) {
      return false
    }

    // Timing-safe comparison prevents timing attacks
    return crypto.timingSafeEqual(providedSigBuffer, expectedSigBuffer)
  } catch {
    return false
  }
}

/**
 * Extract provider from webhook type header.
 */
function getProviderFromType(webhookType: string): WebhookProvider {
  if (webhookType.startsWith("stripe.")) return "stripe"
  if (webhookType.startsWith("clerk.")) return "clerk"
  if (webhookType.startsWith("lemonsqueezy.")) return "lemonsqueezy"
  if (webhookType.startsWith("dataforseo.")) return "dataforseo"
  return "generic"
}

// ============================================
// WEBHOOK TYPES
// ============================================

type WebhookEvent = {
  id: string
  type: string
  provider: WebhookProvider
  data: Record<string, unknown>
  timestamp: string
  verified: boolean
}

// Mock webhook storage (in production, use database)
const webhookLogs: WebhookEvent[] = []

// ============================================
// POST /api/webhooks - Receive webhooks
// ============================================

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get("x-webhook-signature") || 
                      request.headers.get("stripe-signature") ||
                      request.headers.get("svix-signature") || ""
    const webhookType = request.headers.get("x-webhook-type") || "generic"
    const provider = getProviderFromType(webhookType)
    
    // Get raw body for signature verification
    const rawBody = await request.text()
    
    // Get the appropriate secret for this provider
    const secret = WEBHOOK_SECRETS[provider]
    
    // SECURITY: Verify signature before processing
    let verified = false
    if (secret && signature) {
      verified = verifySignature(rawBody, signature, secret)
      
      if (!verified) {
        console.error(`[Webhook] Invalid signature for provider: ${provider}`)
        return NextResponse.json(
          { error: "Invalid signature" },
          { status: 401 }
        )
      }
    } else if (process.env.NODE_ENV === "production") {
      // In production, reject webhooks without proper signature
      console.error(`[Webhook] Missing signature or secret for provider: ${provider}`)
      return NextResponse.json(
        { error: "Signature verification required" },
        { status: 401 }
      )
    }

    // Parse body after signature verification
    let body: Record<string, unknown>
    try {
      body = JSON.parse(rawBody)
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400 }
      )
    }

    // Log webhook event
    const event: WebhookEvent = {
      id: `wh_${crypto.randomUUID()}`,
      type: webhookType,
      provider,
      data: body,
      timestamp: new Date().toISOString(),
      verified,
    }

    webhookLogs.push(event)

    // Handle different webhook types
    switch (webhookType) {
      case "stripe.checkout.completed":
        // TODO: Handle successful payment - Update user subscription in database
        console.log(`[Webhook] Stripe checkout completed`, event.id)
        break

      case "stripe.subscription.updated":
        // TODO: Handle subscription change
        console.log(`[Webhook] Stripe subscription updated`, event.id)
        break

      case "stripe.subscription.deleted":
        // TODO: Handle subscription cancellation
        console.log(`[Webhook] Stripe subscription deleted`, event.id)
        break

      case "clerk.user.created":
        // TODO: Handle new user registration - Create user record in database
        console.log(`[Webhook] Clerk user created`, event.id)
        break

      case "clerk.user.updated":
        // TODO: Handle user profile update
        console.log(`[Webhook] Clerk user updated`, event.id)
        break

      case "dataforseo.task.completed":
        // TODO: Handle DataForSEO task completion - Process and store results
        console.log(`[Webhook] DataForSEO task completed`, event.id)
        break

      default:
        // Unknown webhook type - log for monitoring
        console.log(`[Webhook] Unknown type: ${webhookType}`, event.id)
        break
    }

    return NextResponse.json({
      success: true,
      received: true,
      eventId: event.id,
      verified,
    })
  } catch (error) {
    console.error("[Webhook] Error:", error)
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    )
  }
}

// ============================================
// GET /api/webhooks - Get webhook logs (for debugging)
// ============================================

export async function GET(request: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "Not available in production" },
      { status: 403 }
    )
  }

  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get("limit") || "10")
    const type = searchParams.get("type")

    let logs = [...webhookLogs].reverse()

    if (type) {
      logs = logs.filter((log) => log.type === type)
    }

    return NextResponse.json({
      success: true,
      data: logs.slice(0, limit),
      total: logs.length,
    })
  } catch (error) {
    console.error("Webhook API Error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
