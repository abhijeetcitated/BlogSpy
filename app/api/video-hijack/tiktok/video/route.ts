// ============================================
// VIDEO HIJACK - TikTok Video API Route
// ============================================

import { NextRequest, NextResponse } from "next/server"
import { buildMockTikTokVideo } from "../_helpers"

// TODO: Set RAPIDAPI_KEY in server env and replace mock fetch logic if needed.
const TIKTOK_API_KEY = process.env.RAPIDAPI_KEY

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const videoId = searchParams.get("id")

    if (!videoId) {
      return NextResponse.json(
        { error: "Video id is required" },
        { status: 400 }
      )
    }

    if (!TIKTOK_API_KEY) {
      return NextResponse.json({
        success: true,
        data: buildMockTikTokVideo(videoId),
        source: "mock",
      })
    }

    // TODO: Replace with real TikTok video detail API call when wired.
    return NextResponse.json({
      success: true,
      data: buildMockTikTokVideo(videoId),
      source: "mock",
    })
  } catch (error) {
    console.error("[TikTok Video API] Error:", error)
    return NextResponse.json(
      { error: "Failed to fetch TikTok video" },
      { status: 500 }
    )
  }
}
