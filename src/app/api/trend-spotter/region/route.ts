import { z } from "zod"
import { NextResponse } from "next/server"

import { createApiHandler, ApiError } from "@/lib/api/route-helpers"
import { fetchRegionInterests } from "@/features/trend-spotter/services/trend-api"

const RegionSchema = z.object({
  country: z.string().min(2).max(100),
})

export const GET = createApiHandler({
  auth: "required",
  rateLimit: "api",
  schema: RegionSchema,
  handler: async ({ data }) => {
    try {
      const regions = await fetchRegionInterests(data.country)
      return { country: data.country, regions }
    } catch (error) {
      throw ApiError.internal("Failed to fetch region interests")
    }
  },
})

export function OPTIONS() {
  return NextResponse.json({ ok: true })
}
