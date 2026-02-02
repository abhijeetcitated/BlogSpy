"use server"

import type { AICitation, VisibilityTrendData } from "../types"

export type DashboardDataResponse = {
  success: boolean
  data?: {
    citations: AICitation[]
    trendData: VisibilityTrendData[]
  }
  error?: string
}

type ActionResponse<T> = {
  data: T
  serverError?: string
}

export async function getVisibilityDashboardData(
  _input: Record<string, unknown>
): Promise<ActionResponse<DashboardDataResponse>> {
  return {
    data: {
      success: true,
      data: {
        citations: [],
        trendData: [],
      },
    },
  }
}
