import "server-only"

import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server"
import { verifyWebhookSignature, type WebhookPayload } from "@/lib/billing/lemonsqueezy"

function toNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value
  if (typeof value === "string") {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
  }
  return null
}

function toStringId(value: unknown): string | null {
  if (typeof value === "string" && value.trim().length > 0) return value.trim()
  if (typeof value === "number" && Number.isFinite(value)) return String(value)
  return null
}

type PlanTier = "free" | "pro" | "enterprise"

const PLAN_CREDITS: Record<Exclude<PlanTier, "free">, number> = {
  pro: 1000,
  enterprise: 5000,
}

const PRO_VARIANTS = new Set(
  [
    process.env.NEXT_PUBLIC_LS_PRO_VARIANT_ID,
    process.env.NEXT_PUBLIC_LS_PRO_YEARLY_VARIANT_ID,
  ].filter(Boolean)
)

const ENTERPRISE_VARIANTS = new Set(
  [
    process.env.NEXT_PUBLIC_LS_AGENCY_VARIANT_ID,
    process.env.NEXT_PUBLIC_LS_AGENCY_YEARLY_VARIANT_ID,
  ].filter(Boolean)
)

function resolvePlanFromVariant(variantId: string | null): { tier: PlanTier; credits: number } | null {
  if (!variantId) return null
  if (PRO_VARIANTS.has(variantId)) {
    return { tier: "pro", credits: PLAN_CREDITS.pro }
  }
  if (ENTERPRISE_VARIANTS.has(variantId)) {
    return { tier: "enterprise", credits: PLAN_CREDITS.enterprise }
  }
  return null
}

async function resolveUserIdFromPayload({
  admin,
  custom,
  attributes,
}: {
  admin: ReturnType<typeof createAdminClient>
  custom: Record<string, unknown>
  attributes: Record<string, unknown>
}): Promise<string | null> {
  const customUserId =
    (custom.userId as string | undefined) ??
    (custom.user_id as string | undefined) ??
    null

  if (customUserId) return customUserId

  const email =
    (custom.userEmail as string | undefined) ??
    (custom.email as string | undefined) ??
    (attributes.user_email as string | undefined) ??
    (attributes.customer_email as string | undefined) ??
    null

  if (!email) return null

  const { data: profile } = await admin
    .from("core_profiles")
    .select("id")
    .eq("email", email)
    .maybeSingle()

  return profile?.id ?? null
}

async function ensureBillCreditsRow(admin: ReturnType<typeof createAdminClient>, userId: string) {
  await admin.from("bill_credits").upsert(
    {
      user_id: userId,
      credits_total: 0,
      credits_used: 0,
    },
    { onConflict: "user_id" }
  )
}

async function logBillTransaction({
  admin,
  userId,
  amount,
  idempotencyKey,
  type,
  description,
  lemonsqueezyOrderId,
}: {
  admin: ReturnType<typeof createAdminClient>
  userId: string
  amount: number
  idempotencyKey: string
  type: string
  description: string
  lemonsqueezyOrderId?: string | null
}) {
  const { error } = await admin.from("bill_transactions").insert({
    user_id: userId,
    amount,
    type,
    description,
    idempotency_key: idempotencyKey,
    lemonsqueezy_order_id: lemonsqueezyOrderId ?? null,
  })

  if (error && error.code !== "23505") {
    throw error
  }
}

export async function POST(request: Request) {
  const signature = request.headers.get("X-Signature")
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 })
  }

  const rawBody = await request.text()
  const isValid = verifyWebhookSignature(rawBody, signature)
  if (!isValid) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
  }

  let payload: WebhookPayload
  try {
    payload = JSON.parse(rawBody) as WebhookPayload
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
  }

  const eventName = payload.meta?.event_name
  const attributes = (payload.data?.attributes ?? {}) as Record<string, unknown>
  const custom =
    payload.meta?.custom_data ??
    (attributes["custom_data"] as Record<string, unknown> | undefined) ??
    {}

  const admin = createAdminClient()
  const userId = await resolveUserIdFromPayload({ admin, custom, attributes })

  if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 })
  }

  if (eventName === "order_created") {
    const credits =
      toNumber(custom.total_credits) ??
      toNumber(custom.credits) ??
      toNumber(custom.credit_amount) ??
      null

    if (!credits) {
      return NextResponse.json({ error: "Missing credits" }, { status: 400 })
    }

    const orderId =
      toStringId(payload.data?.id) ??
      toStringId(attributes["order_id"]) ??
      toStringId(attributes["orderId"]) ??
      null

    if (!orderId) {
      return NextResponse.json({ error: "Missing order id" }, { status: 400 })
    }

    const idempotencyKey = `ls:order:${orderId}`

    await ensureBillCreditsRow(admin, userId)

    const { data: rpcData, error: rpcError } = await admin.rpc("add_credits_atomic", {
      p_user_id: userId,
      p_amount: credits,
      p_idempotency_key: idempotencyKey,
      p_description: "Billing order",
    })

    if (rpcError) {
      return NextResponse.json({ error: rpcError.message }, { status: 500 })
    }

    const rpcResult = Array.isArray(rpcData) ? rpcData[0] : rpcData
    if (!rpcResult?.success) {
      return NextResponse.json({ error: "Credit update failed" }, { status: 500 })
    }

    await admin
      .from("bill_transactions")
      .update({ lemonsqueezy_order_id: orderId })
      .eq("idempotency_key", idempotencyKey)

    return NextResponse.json({ ok: true })
  }

  if (eventName === "subscription_created" || eventName === "subscription_payment_success") {
    const variantId =
      toStringId(attributes["variant_id"]) ??
      toStringId(attributes["variant"]) ??
      toStringId(attributes["variantId"]) ??
      null

    const plan = resolvePlanFromVariant(variantId)

    if (!plan) {
      return NextResponse.json({ error: "Unknown plan variant" }, { status: 400 })
    }

    const subscriptionId = toStringId(payload.data?.id) ?? "unknown"
    const idempotencyKey = `ls:subscription:${eventName}:${subscriptionId}`

    await ensureBillCreditsRow(admin, userId)

    const { error: updateCreditsError } = await admin
      .from("bill_credits")
      .update({
        credits_total: plan.credits,
        credits_used: 0,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId)

    if (updateCreditsError) {
      return NextResponse.json({ error: updateCreditsError.message }, { status: 500 })
    }

    const { error: updateProfileError } = await admin
      .from("core_profiles")
      .update({ billing_tier: plan.tier })
      .eq("id", userId)

    if (updateProfileError) {
      return NextResponse.json({ error: updateProfileError.message }, { status: 500 })
    }

    await logBillTransaction({
      admin,
      userId,
      amount: plan.credits,
      idempotencyKey,
      type: "reset",
      description: `Subscription credits reset (${plan.tier})`,
      lemonsqueezyOrderId: subscriptionId,
    })

    return NextResponse.json({ ok: true })
  }

  if (eventName === "subscription_cancelled") {
    const variantId =
      toStringId(attributes["variant_id"]) ??
      toStringId(attributes["variant"]) ??
      toStringId(attributes["variantId"]) ??
      null
    const plan = resolvePlanFromVariant(variantId)

    const { data: profile } = await admin
      .from("core_profiles")
      .select("billing_tier")
      .eq("id", userId)
      .maybeSingle()

    const currentTier = (plan?.tier ?? profile?.billing_tier ?? "free").toString()
    const cancellingTier = currentTier.includes("cancelling")
      ? currentTier
      : `${currentTier}_cancelling`

    const { error: updateProfileError } = await admin
      .from("core_profiles")
      .update({ billing_tier: cancellingTier })
      .eq("id", userId)

    if (updateProfileError) {
      return NextResponse.json({ error: updateProfileError.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ ok: true })
}
