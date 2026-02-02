"use server"

import { z } from "zod"
import { publicAction } from "@/lib/safe-action"

const FetchAmazonDataSchema = z.object({
  keyword: z.string().min(1, "Keyword is required"),
  country: z.string().default("US"),
})

export type FetchAmazonDataAction = {
  success: boolean
  data?: unknown
  error?: string
}

export const fetchAmazonData = publicAction
  .schema(FetchAmazonDataSchema)
  .action(async (): Promise<FetchAmazonDataAction> => {
    return {
      success: false,
      error: "This feature is being rebuilt in V2",
    }
  })
