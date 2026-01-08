"use server"

import { z } from "zod"
import { authAction } from "@/src/lib/safe-action"
import { refreshLiveSerp, type RefreshLiveSerpResult } from "../services/live-serp"

const RefreshRowSchema = z.object({
  keyword: z.string().min(1).max(256),
  country: z.string().length(2).default("US"),
})

export type RefreshRowResponse = {
  success: true
  data: Pick<RefreshLiveSerpResult, "weakSpot" | "hasAio" | "checkedAt">
}

export const refreshRow = authAction
  .schema(RefreshRowSchema)
  .action(async ({ parsedInput, ctx }): Promise<RefreshRowResponse> => {
    const { keyword, country } = parsedInput

    console.log(`[refreshRow] user=${ctx.userId} country=${country}`)

    const data = await refreshLiveSerp({
      keyword,
      country,
    })

    return {
      success: true,
      data: {
        weakSpot: data.weakSpot,
        hasAio: data.hasAio,
        checkedAt: data.checkedAt,
      },
    }
  })
