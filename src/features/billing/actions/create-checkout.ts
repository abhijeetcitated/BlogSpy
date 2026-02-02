"use server"
import "server-only"

import { z } from "zod"
import { authenticatedAction } from "@/lib/safe-action"
import { createCheckout } from "@/lib/payments/lemonsqueezy"

const CreateCheckoutSchema = z.object({
  variantId: z.string().min(1, "Variant ID is required"),
  credits: z.number().int().positive("Credits must be a positive integer"),
  purchaseType: z.string().optional(),
  successUrl: z.string().url().optional(),
  cancelUrl: z.string().url().optional(),
  redirectUrl: z.string().url().optional(),
})

export const createCheckoutSession = authenticatedAction
  .schema(CreateCheckoutSchema)
  .action(async ({ parsedInput, ctx }) => {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    const redirectUrl =
      parsedInput.redirectUrl ?? parsedInput.successUrl ?? parsedInput.cancelUrl ?? appUrl

    const checkoutUrl = await createCheckout({
      variantId: parsedInput.variantId,
      email: ctx.email,
      customData: {
        userId: ctx.userId,
        userEmail: ctx.email,
        total_credits: String(parsedInput.credits),
        type: parsedInput.purchaseType ?? "plan",
      },
      returnUrl: redirectUrl,
    })

    return { url: checkoutUrl }
  })
