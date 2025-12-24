// ============================================
// VIDEO HIJACK - TikTok Search API Route
// ============================================

import { NextRequest, NextResponse } from "next/server"
import { buildMockTikTokRawResults, mapRapidApiItemToRaw } from "../_helpers"

// TikTok API configuration (RapidAPI)
// TODO: Set RAPIDAPI_KEY in server env to enable live data.
const TIKTOK_API_KEY = process.env.RAPIDAPI_KEY
const TIKTOK_API_HOST = "tiktok-scraper7.p.rapidapi.com"
const TIKTOK_API_BASE = `https://${TIKTOK_API_HOST}`

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      query,
      maxResults = 30,
      cursor,
      region = "US",
    } = body || {}
    const count = typeof maxResults === "number"
      ? maxResults
      : parseInt(maxResults, 10) || 30

    if (!query) {
      return NextResponse.json(
        { error: "Query is required" },
        { status: 400 }
      )
    }

    if (!TIKTOK_API_KEY) {
      return NextResponse.json({
        success: true,
        data: buildMockTikTokRawResults(query, count),
        meta: {
          hasMore: true,
          cursor: "mock_cursor_next",
        },
        source: "mock",
      })
    }

    const searchUrl = new URL(`${TIKTOK_API_BASE}/feed/search`)
    searchUrl.searchParams.set("keywords", query)
    searchUrl.searchParams.set("count", count.toString())
    searchUrl.searchParams.set("region", region)
    if (cursor) searchUrl.searchParams.set("cursor", cursor)

    const response = await fetch(searchUrl.toString(), {
      method: "GET",
      headers: {
        "X-RapidAPI-Key": TIKTOK_API_KEY,
        "X-RapidAPI-Host": TIKTOK_API_HOST,
      },
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || "TikTok API error")
    }

    const items = (data.data || []).map(mapRapidApiItemToRaw)

    return NextResponse.json({
      success: true,
      data: items,
      meta: {
        hasMore: data.has_more || false,
        cursor: data.cursor || null,
      },
      source: "api",
    })
  } catch (error) {
    console.error("[TikTok Search API] Error:", error)
    return NextResponse.json(
      { error: "Failed to fetch TikTok data" },
      { status: 500 }
    )
  }
}
