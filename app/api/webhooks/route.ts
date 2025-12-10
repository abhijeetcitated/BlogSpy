import { NextRequest, NextResponse } from "next/server"

// Webhook types
type WebhookEvent = {
  id: string
  type: string
  data: Record<string, unknown>
  timestamp: string
}

// Mock webhook storage (in production, use database)
const webhookLogs: WebhookEvent[] = []

// POST /api/webhooks - Receive webhooks
export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get("x-webhook-signature")
    const webhookType = request.headers.get("x-webhook-type") || "generic"
    
    const body = await request.json()

    // Log webhook (in production, verify signature first)
    const event: WebhookEvent = {
      id: `wh_${Date.now()}`,
      type: webhookType,
      data: body,
      timestamp: new Date().toISOString(),
    }

    webhookLogs.push(event)

    // Handle different webhook types
    switch (webhookType) {
      case "stripe.checkout.completed":
        // Handle successful payment
        console.log("Payment completed:", body)
        // Update user subscription in database
        break

      case "stripe.subscription.updated":
        // Handle subscription change
        console.log("Subscription updated:", body)
        break

      case "stripe.subscription.deleted":
        // Handle subscription cancellation
        console.log("Subscription cancelled:", body)
        break

      case "clerk.user.created":
        // Handle new user registration
        console.log("New user created:", body)
        // Create user record in database
        break

      case "clerk.user.updated":
        // Handle user profile update
        console.log("User updated:", body)
        break

      case "dataforseo.task.completed":
        // Handle DataForSEO task completion
        console.log("DataForSEO task completed:", body)
        // Process and store results
        break

      default:
        console.log("Unknown webhook type:", webhookType, body)
    }

    return NextResponse.json({
      success: true,
      received: true,
      eventId: event.id,
    })
  } catch (error) {
    console.error("Webhook Error:", error)
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    )
  }
}

// GET /api/webhooks - Get webhook logs (for debugging)
export async function GET(request: NextRequest) {
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
