"use server"

import "server-only"

import { authenticatedAction, z } from "@/lib/safe-action"
import { createServerClient } from "@/lib/supabase/server"

const OPERATION_COSTS: Record<string, number> = {
  "generate-faq": 3,
  "generate-conclusion": 2,
  "expand-text": 1,
  "rewrite-text": 1,
  "shorten-text": 1,
  outline: 2,
  "write-article": 6,
}

const ChargeCreditsSchema = z.object({
  operation: z.string().min(1, "Operation is required"),
  idempotency_key: z.string().min(1, "Idempotency key is required"),
  keyword: z.string().optional(),
})

export const chargeAiWriterCredits = authenticatedAction
  .schema(ChargeCreditsSchema)
  .action(async ({ parsedInput, ctx }) => {
    const supabase = await createServerClient()
    const cost = OPERATION_COSTS[parsedInput.operation] ?? 1
    const description = parsedInput.keyword
      ? `AI Writer: ${parsedInput.operation} - ${parsedInput.keyword}`
      : `AI Writer: ${parsedInput.operation}`

    const { data, error } = await supabase.rpc("deduct_credits_atomic", {
      p_user_id: ctx.userId,
      p_amount: cost,
      p_idempotency_key: parsedInput.idempotency_key,
      p_description: description,
    })

    if (error) {
      throw new Error(error.message)
    }

    const result = Array.isArray(data) ? data[0] : data
    if (!result || result.success !== true) {
      throw new Error("INSUFFICIENT_CREDITS")
    }

    return {
      success: true,
      balance: typeof result.balance === "number" ? result.balance : null,
    }
  })
