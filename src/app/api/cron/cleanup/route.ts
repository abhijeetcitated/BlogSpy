import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET
  const authHeader = request.headers.get("authorization") || ""
  if (!secret || authHeader !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const supabase = createAdminClient() as unknown as {
    from: (table: string) => any
  }
  const now = new Date().toISOString()

  const [trendResult, serpResult] = await Promise.all([
    supabase
      .from("trend_cache")
      .delete({ count: "exact" })
      .lt("expires_at", now),
    supabase
      .from("serp_snapshots")
      .delete({ count: "exact" })
      .lt("expires_at", now),
  ])

  if (trendResult.error || serpResult.error) {
    return NextResponse.json(
      {
        error: "Cleanup failed",
        details: {
          trend_cache: trendResult.error?.message ?? null,
          serp_snapshots: serpResult.error?.message ?? null,
        },
      },
      { status: 500 }
    )
  }

  return NextResponse.json({ success: true, message: "Cleanup complete" })
}
