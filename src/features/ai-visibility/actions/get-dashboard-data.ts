/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════
 * 📊 GET DASHBOARD DATA — Queries Supabase for AI Visibility dashboard
 * ═══════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Returns:
 * - Recent citations from ai_visibility_citations table
 * - Trend data aggregated from ai_visibility_scans table (last 30 days)
 *
 * Uses authAction for auth + rate limiting.
 */

"use server"

import { authAction, z } from "@/lib/safe-action"
import { createAdminClient } from "@/lib/supabase/server"
import type { AICitation, VisibilityTrendData } from "../types"

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// RESPONSE TYPE (preserved for barrel exports)
// ═══════════════════════════════════════════════════════════════════════════════════════════════

export type DashboardDataResponse = {
  success: boolean
  data?: {
    citations: AICitation[]
    trendData: VisibilityTrendData[]
  }
  error?: string
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// SCHEMA
// ═══════════════════════════════════════════════════════════════════════════════════════════════

const dashboardSchema = z.object({
  configId: z.string().uuid("Config ID is required for project-scoped data"),
  days: z.number().min(7).max(90).optional(),
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// CITATION ROW → AICitation MAPPER
// ═══════════════════════════════════════════════════════════════════════════════════════════════

interface CitationRow {
  id: string
  platform: string
  query: string
  cited_url: string
  cited_title: string
  context: string | null
  position: number
  citation_type: string
  sentiment: string
  created_at: string
  competitors: string[] | null
}

function mapRowToCitation(row: CitationRow): AICitation {
  return {
    id: row.id,
    platform: row.platform as AICitation["platform"],
    query: row.query,
    citedUrl: row.cited_url,
    citedTitle: row.cited_title,
    context: row.context ?? "",
    position: row.position,
    citationType: row.citation_type as AICitation["citationType"],
    sentiment: (row.sentiment as AICitation["sentiment"]) ?? "neutral",
    timestamp: row.created_at,
    competitors: row.competitors ?? [],
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// SERVER ACTION
// ═══════════════════════════════════════════════════════════════════════════════════════════════

/**
 * Fetch dashboard data: recent citations + daily trend.
 */
export const getVisibilityDashboardData = authAction
  .schema(dashboardSchema)
  .action(async ({ parsedInput, ctx }): Promise<DashboardDataResponse> => {
    const supabase = createAdminClient()
    const days = parsedInput.days ?? 30
    const sinceDate = new Date()
    sinceDate.setDate(sinceDate.getDate() - days)
    const sinceISO = sinceDate.toISOString()

    // ── 1. Fetch recent citations ──
    let citationQuery = supabase
      .from("ai_visibility_citations")
      .select("*")
      .eq("user_id", ctx.userId)
      .eq("config_id", parsedInput.configId)
      .gte("created_at", sinceISO)
      .order("created_at", { ascending: false })
      .limit(100)

    const { data: citationRows, error: citErr } = await citationQuery

    if (citErr) {
      console.error("[getDashboardData] Citation query error:", citErr)
    }

    const citations: AICitation[] = (citationRows as CitationRow[] | null)?.map(mapRowToCitation) ?? []

    // ── 2. Fetch scan results for trend aggregation ──
    let scanQuery = supabase
      .from("ai_visibility_scans")
      .select("created_at, scan_result")
      .eq("user_id", ctx.userId)
      .eq("config_id", parsedInput.configId)
      .gte("created_at", sinceISO)
      .order("created_at", { ascending: true })

    const { data: scanRows, error: scanErr } = await scanQuery

    if (scanErr) {
      console.error("[getDashboardData] Scan query error:", scanErr)
    }

    // ── 3. Aggregate scans into daily trend data ──
    const trendMap = new Map<string, {
      googleAio: number[]
      googleAiMode: number[]
      chatgpt: number[]
      claude: number[]
      gemini: number[]
      perplexity: number[]
    }>()

    interface ScanRow {
      created_at: string
      scan_result: {
        google?: { status?: string }
        googleAiMode?: { status?: string }
        chatgpt?: { status?: string }
        claude?: { status?: string }
        gemini?: { status?: string }
        perplexity?: { status?: string }
      } | null
    }

    for (const row of (scanRows as ScanRow[] | null) ?? []) {
      const dateKey = row.created_at.slice(0, 10) // YYYY-MM-DD
      const r = row.scan_result

      if (!trendMap.has(dateKey)) {
        trendMap.set(dateKey, {
          googleAio: [], googleAiMode: [], chatgpt: [], claude: [], gemini: [], perplexity: [],
        })
      }
      const entry = trendMap.get(dateKey)!

      if (r) {
        entry.googleAio.push(r.google?.status === "visible" ? 1 : 0)
        entry.googleAiMode.push(r.googleAiMode?.status === "visible" ? 1 : 0)
        entry.chatgpt.push(r.chatgpt?.status === "visible" ? 1 : 0)
        entry.claude.push(r.claude?.status === "visible" ? 1 : 0)
        entry.gemini.push(r.gemini?.status === "visible" ? 1 : 0)
        entry.perplexity.push(r.perplexity?.status === "visible" ? 1 : 0)
      }
    }

    const avg = (arr: number[]) => arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length * 100) : 0

    const trendData: VisibilityTrendData[] = Array.from(trendMap.entries()).map(
      ([date, vals]) => ({
        date,
        googleAio: avg(vals.googleAio),
        googleAiMode: avg(vals.googleAiMode),
        chatgpt: avg(vals.chatgpt),
        perplexity: avg(vals.perplexity),
        claude: avg(vals.claude),
        gemini: avg(vals.gemini),
        total: avg([
          ...vals.googleAio,
          ...vals.googleAiMode,
          ...vals.chatgpt,
          ...vals.claude,
          ...vals.gemini,
          ...vals.perplexity,
        ]),
      })
    )

    return {
      success: true,
      data: { citations, trendData },
    }
  })
