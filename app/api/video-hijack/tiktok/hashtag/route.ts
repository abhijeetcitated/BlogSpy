// ============================================
// VIDEO HIJACK - TikTok Hashtag API Route
// ============================================

import { NextRequest, NextResponse } from "next/server"
import { buildMockHashtag } from "../_helpers"

// TODO: Set RAPIDAPI_KEY in server env and replace mock fetch logic if needed.
const TIKTOK_API_KEY = process.env.RAPIDAPI_KEY

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const tag = searchParams.get("tag")

    if (!tag) {
      return NextResponse.json(
        { error: "Hashtag tag is required" },
        { status: 400 }
      )
    }

    if (!TIKTOK_API_KEY) {
      return NextResponse.json({
        success: true,
        data: buildMockHashtag(tag),
        source: "mock",
      })
    }

    // TODO: Replace with real TikTok hashtag analytics API call when wired.
    return NextResponse.json({
      success: true,
      data: buildMockHashtag(tag),
      source: "mock",
    })
  } catch (error) {
    console.error("[TikTok Hashtag API] Error:", error)
    return NextResponse.json(
      { error: "Failed to fetch TikTok hashtag" },
      { status: 500 }
    )
  }
}
