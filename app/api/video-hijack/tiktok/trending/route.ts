// ============================================
// VIDEO HIJACK - TikTok Trending Sounds API Route
// ============================================

import { NextRequest, NextResponse } from "next/server"
import { buildMockTrendingSounds } from "../_helpers"

// TODO: Set RAPIDAPI_KEY in server env and replace mock fetch logic if needed.
const TIKTOK_API_KEY = process.env.RAPIDAPI_KEY

export async function GET(_request: NextRequest) {
  try {
    if (!TIKTOK_API_KEY) {
      return NextResponse.json({
        success: true,
        data: buildMockTrendingSounds(),
        source: "mock",
      })
    }

    // TODO: Replace with real TikTok trending sounds API call when wired.
    return NextResponse.json({
      success: true,
      data: buildMockTrendingSounds(),
      source: "mock",
    })
  } catch (error) {
    console.error("[TikTok Trending API] Error:", error)
    return NextResponse.json(
      { error: "Failed to fetch TikTok trending sounds" },
      { status: 500 }
    )
  }
}
