"use server"
import "server-only"

import { z } from "zod"
import { authenticatedAction } from "@/lib/safe-action"
import { getCustomerPortalUrlByEmail } from "@/lib/payments/lemonsqueezy"

const PortalSchema = z.object({
  redirectUrl: z.string().url().optional(),
})

export const getBillingPortalUrl = authenticatedAction
  .schema(PortalSchema)
  .action(async ({ parsedInput, ctx }) => {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    const fallbackUrl = parsedInput.redirectUrl ?? `${appUrl}/pricing`

    const portalUrl = await getCustomerPortalUrlByEmail(ctx.email ?? undefined)

    return {
      url: portalUrl ?? fallbackUrl,
      isFallback: !portalUrl,
    }
  })
