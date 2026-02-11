"use server"
import "server-only"

import { z } from "zod"
import { authenticatedAction } from "@/lib/safe-action"
import { createCheckout, getPortalUrlByEmail } from "@/lib/billing/lemonsqueezy"

const CheckoutSchema = z.object({
  variantId: z.string().min(1, "Variant ID is required"),
  credits: z.number().int().positive().optional(),
  purchaseType: z.string().optional(),
  redirectUrl: z.string().url().optional(),
})

export const createCheckoutAction = authenticatedAction
  .schema(CheckoutSchema)
  .action(async ({ parsedInput, ctx }) => {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    const returnUrl = parsedInput.redirectUrl ?? appUrl

    const checkoutUrl = await createCheckout({
      variantId: parsedInput.variantId,
      userId: ctx.userId,
      email: ctx.email ?? undefined,
      returnUrl,
      customData: {
        userEmail: ctx.email ?? "",
        credits: parsedInput.credits,
        purchaseType: parsedInput.purchaseType ?? "plan",
      },
    })

    return { url: checkoutUrl }
  })

const PortalSchema = z.object({
  redirectUrl: z.string().url().optional(),
})

export const getPortalUrl = authenticatedAction
  .schema(PortalSchema)
  .action(async ({ parsedInput, ctx }) => {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    const fallbackUrl = parsedInput.redirectUrl ?? `${appUrl}/pricing`

    const portalUrl = await getPortalUrlByEmail(ctx.email ?? undefined)

    return {
      url: portalUrl ?? fallbackUrl,
      isFallback: !portalUrl,
    }
  })
