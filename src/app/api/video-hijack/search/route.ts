// ============================================
// VIDEO HIJACK - YouTube Search Cache Route
// ============================================

import { NextResponse } from "next/server"
import { z } from "zod"
import { rateLimiter } from "@/src/lib/rate-limit"
import { createServerClient } from "@/lib/supabase/server"
import { searchYouTubeVideos } from "@/src/features/video-hijack/services/youtube.service"

const CACHE_TTL_MS = 24 * 60 * 60 * 1000
const CREDIT_COST = 1

const SearchSchema = z.object({
  keyword: z.string().trim().min(1).max(200),
})

type CacheRow = {
  data: unknown
  created_at: string
}

function isServerMockMode(): boolean {
  return process.env.USE_MOCK_DATA === "true" || process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true"
}

async function deductCredits(userId: string, amount: number, reason: string): Promise<boolean> {
  if (isServerMockMode()) {
    console.log("[Video Hijack] Mock mode - skipping credit deduction")
    return true
  }

  const supabase = await createServerClient()

  const attemptRpc = async (rpcName: string): Promise<boolean> => {
    const { data, error } = await (supabase as typeof supabase & {
      rpc: (fn: string, args: Record<string, unknown>) => Promise<{ data: unknown; error: { message: string } | null }>
    }).rpc(rpcName, {
      p_user_id: userId,
      p_amount: amount,
      p_feature: reason,
      p_description: "YouTube video search",
    })

    if (error) {
      console.error(`[Video Hijack] ${rpcName} RPC error:`, error.message)
      return false
    }

    const result = Array.isArray(data) ? data[0] : data
    if (result?.success === false || result === false) {
      return false
    }

    return true
  }

  const deducted = await attemptRpc("deduct_credits")
  if (deducted) return true

  const used = await attemptRpc("use_credits")
  if (used) return true

  const { data: credits, error: creditsError } = await supabase
    .from("user_credits")
    .select("credits_total, credits_used")
    .eq("user_id", userId)
    .single()

  if (creditsError || !credits) {
    return false
  }

  const remaining = (credits.credits_total ?? 0) - (credits.credits_used ?? 0)
  if (remaining < amount) {
    return false
  }

  const { error: updateError } = await supabase
    .from("user_credits")
    .update({ credits_used: (credits.credits_used ?? 0) + amount })
    .eq("user_id", userId)

  return !updateError
}

export async function POST(request: Request) {
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true") {
    console.log("⚠️ Video Hijack: Serving Mock Data")
    await new Promise((resolve) => setTimeout(resolve, 1500))
    return NextResponse.json({
      items: [
        {
          id: "mock-1",
          title: "AI Agents Tutorial 2026 (Mock)",
          views: 150000,
          subscribers: 2000,
          publishedAt: "2023-05-01",
          channel: "Tech Mock Channel",
          url: "https://youtube.com",
          hijackScore: 95,
          viralPotential: "high",
        },
        {
          id: "mock-2",
          title: "Automations That Save 10 Hours/Week (Mock)",
          views: 4200,
          subscribers: 800,
          publishedAt: "2022-11-15",
          channel: "Workflow Hacks",
          url: "https://youtube.com",
          hijackScore: 88,
          viralPotential: "medium",
        },
        {
          id: "mock-3",
          title: "Build a No-Code Agent in 20 Minutes (Mock)",
          views: 68000,
          subscribers: 15000,
          publishedAt: "2024-01-12",
          channel: "NoCode Labs",
          url: "https://youtube.com",
          hijackScore: 62,
          viralPotential: "medium",
        },
      ],
      creditsUsed: 0,
    })
  }

  try {
    const supabase = await createServerClient()
    const { data: authData } = await supabase.auth.getUser()
    const user = authData?.user

    if (!user) {
      return NextResponse.json({ success: false, error: "Authentication required." }, { status: 401 })
    }

    const body = await request.json()
    const parsed = SearchSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: "Keyword is required." }, { status: 400 })
    }

    const keyword = parsed.data.keyword.trim()
    const cacheKey = keyword.toLowerCase()

    const { success: rateOk } = await rateLimiter.limit(user.id)
    if (!rateOk) {
      return NextResponse.json({ success: false, error: "Rate limit exceeded." }, { status: 429 })
    }

    const cacheTable = (supabase as unknown as { from: (table: string) => any }).from("video_search_cache")
    const { data: cached } = await cacheTable
      .select("data, created_at")
      .eq("keyword", cacheKey)
      .eq("platform", "youtube")
      .maybeSingle()

    if (cached?.data && cached.created_at) {
      const createdAt = new Date(cached.created_at).getTime()
      if (!Number.isNaN(createdAt) && Date.now() - createdAt < CACHE_TTL_MS) {
        return NextResponse.json({ success: true, source: "cache", data: cached.data })
      }
    }

    const creditOk = await deductCredits(user.id, CREDIT_COST, "youtube_search")
    if (!creditOk) {
      return NextResponse.json({ success: false, error: "Insufficient credits." }, { status: 402 })
    }

    const results = await searchYouTubeVideos(keyword)

    await cacheTable.upsert(
      {
        keyword: cacheKey,
        platform: "youtube",
        data: results,
        created_at: new Date().toISOString(),
      },
      { onConflict: "keyword,platform" }
    )

    const historyTable = (supabase as unknown as { from: (table: string) => any }).from("video_search_history")
    const { data: lastHistory } = await historyTable
      .select("keyword")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()

    if (lastHistory?.keyword !== keyword) {
      await historyTable.insert({ user_id: user.id, keyword })
    }

    return NextResponse.json({ success: true, source: "live", data: results })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch YouTube results."
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

export async function GET() {
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true") {
    return NextResponse.json({
      history: ["ai agents", "seo tips", "youtube growth", "content strategy", "video marketing"],
    })
  }

  const supabase = await createServerClient()
  const { data: authData } = await supabase.auth.getUser()
  const user = authData?.user

  if (!user) {
    return NextResponse.json({ history: [] }, { status: 401 })
  }

  const historyTable = (supabase as unknown as { from: (table: string) => any }).from("video_search_history")
  const { data } = await historyTable
    .select("keyword, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20)

  const unique = new Set<string>()
  const history: string[] = []

  ;(data ?? []).forEach((row: { keyword?: string }) => {
    if (!row.keyword || unique.has(row.keyword)) return
    unique.add(row.keyword)
    if (history.length < 5) history.push(row.keyword)
  })

  return NextResponse.json({ history })
}
