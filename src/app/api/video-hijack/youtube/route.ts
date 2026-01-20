// ============================================
// VIDEO HIJACK - YouTube API Route
// ============================================
// GET: existing YouTube search handler
// POST: DataForSEO YouTube Organic handler
// ============================================

import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { searchYouTubeVideos } from "@/src/features/video-hijack/services/youtube.service"

export { GET } from "@/src/features/video-hijack/api/youtube/route"

type YouTubeRequestPayload = {
  keyword?: string
}

function isServerMockMode(): boolean {
  return process.env.USE_MOCK_DATA === "true" || process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true"
}

async function deductCredits(userId: string, amount: number, reason: string): Promise<boolean> {
  if (isServerMockMode()) {
    console.log("[YouTube Organic] Mock mode - skipping credit deduction")
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
      p_description: "YouTube organic search",
    })

    if (error) {
      console.error(`[YouTube Organic] ${rpcName} RPC error:`, error.message)
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
  try {
    const supabase = await createServerClient()
    const { data: authData } = await supabase.auth.getUser()
    const user = authData?.user

    if (!user) {
      return NextResponse.json({ success: false, error: "Authentication required." }, { status: 401 })
    }

    const body = (await request.json()) as YouTubeRequestPayload
    const keyword = body.keyword?.trim() ?? ""

    if (!keyword) {
      return NextResponse.json({ success: false, error: "Keyword is required." }, { status: 400 })
    }

    const creditOk = await deductCredits(user.id, 1, "youtube_organic_search")
    if (!creditOk) {
      return NextResponse.json({ success: false, error: "Insufficient credits." }, { status: 402 })
    }

    const results = await searchYouTubeVideos(keyword)
    return NextResponse.json({ success: true, data: results })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch YouTube results."
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
