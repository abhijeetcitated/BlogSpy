import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server"
import { notificationService } from "@/lib/services/notification.service"

type RankingRow = {
  position: number
  previous_position: number | null
  change: number | null
  checked_at: string
  keyword?: { text?: string | null }
}

type EmailLayoutInput = {
  title: string
  preview?: string
  contentHtml: string
  unsubscribeUrl: string
}

type WeeklyReportPayload = {
  userId: string
}

function getAppUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
}

function buildUnsubscribeUrl(userId: string) {
  const appUrl = getAppUrl()
  return `${appUrl}/settings?tab=notifications&user=${userId}`
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

function renderEmailLayout({ title, preview, contentHtml, unsubscribeUrl }: EmailLayoutInput) {
  const safeTitle = escapeHtml(title)
  const safePreview = preview ? escapeHtml(preview) : ""
  const safeUnsubscribeUrl = escapeHtml(unsubscribeUrl)

  return `<!DOCTYPE html>
<html>
<head>
  <meta charSet="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${safeTitle}</title>
</head>
<body style="margin:0;padding:0;background:#0f172a;font-family:Arial,sans-serif;">
  ${preview ? `<span style="display:none;visibility:hidden;opacity:0;color:transparent;">${safePreview}</span>` : ""}
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
    <tr>
      <td>
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;margin:0 auto;background:#111827;border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,0.08);">
          <tr>
            <td style="background:#0b0f1a;padding:24px 32px;border-bottom:1px solid rgba(255,215,0,0.2);">
              <div style="font-size:22px;font-weight:700;letter-spacing:0.3px;">
                <span style="color:#ffffff;">Cita</span><span style="color:#FFD700;">Ted</span>
              </div>
              <h1 style="margin:12px 0 0;font-size:18px;color:#f8fafc;">${safeTitle}</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 32px;color:#e2e8f0;font-size:14px;line-height:1.6;">
              ${contentHtml}
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px 28px;color:#94a3b8;font-size:12px;text-align:center;border-top:1px solid rgba(255,255,255,0.06);">
              <p style="margin:0;">You are receiving this email because you subscribed to Citated updates.</p>
              <p style="margin:8px 0 0;">
                <a href="${safeUnsubscribeUrl}" style="color:#FFD700;text-decoration:none;">Unsubscribe</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

function resolveChange(row: RankingRow) {
  if (typeof row.change === "number") {
    return row.change
  }
  if (typeof row.previous_position === "number") {
    return row.previous_position - row.position
  }
  return 0
}

async function fetchRankSummary(
  supabase: { from: (table: string) => any },
  userId: string,
  sinceIso: string
) {
  const { data: projects, error: projectError } = await supabase
    .from("projects")
    .select("id")
    .eq("user_id", userId)

  if (projectError || !projects || projects.length === 0) {
    return { winners: [], losers: [], total: 0 }
  }

  const projectIds = projects.map((project: { id: string }) => project.id)

  const { data: rankings, error } = await supabase
    .from("rankings")
    .select("position, previous_position, change, checked_at, keyword:keywords(text)")
    .in("project_id", projectIds)
    .gte("checked_at", sinceIso)

  if (error || !rankings) {
    return { winners: [], losers: [], total: 0 }
  }

  const normalized = (rankings as RankingRow[]).map((row) => {
    const change = resolveChange(row)
    return {
      keyword: row.keyword?.text || "Unknown keyword",
      position: row.position,
      previousPosition: row.previous_position,
      change,
      checkedAt: row.checked_at,
    }
  })

  const winners = normalized
    .filter((row) => row.change > 0)
    .sort((a, b) => b.change - a.change)
    .slice(0, 5)

  const losers = normalized
    .filter((row) => row.change < 0)
    .sort((a, b) => a.change - b.change)
    .slice(0, 5)

  return { winners, losers, total: normalized.length }
}

async function logWeeklyReport(
  supabase: { from: (table: string) => any },
  userId: string,
  status: "sent" | "failed",
  metadata: Record<string, unknown>
) {
  await supabase.from("notification_history").insert({
    user_id: userId,
    type: "weekly_report",
    status,
    metadata,
    sent_at: new Date().toISOString(),
  })
}

function requireCronAuth(request: Request) {
  const secret = process.env.CRON_SECRET
  const authHeader = request.headers.get("authorization") || ""
  if (!secret) {
    return { ok: false, response: NextResponse.json({ error: "CRON_SECRET missing" }, { status: 500 }) }
  }

  if (authHeader !== `Bearer ${secret}`) {
    return { ok: false, response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) }
  }

  return { ok: true }
}

async function processWeeklyReport(userId: string) {
  const supabase = createAdminClient() as unknown as {
    from: (table: string) => any
    auth: {
      admin: {
        getUserById: (id: string) => Promise<{ data: { user: { email?: string } | null } }>
      }
    }
  }

  const { data: userData } = await supabase.auth.admin.getUserById(userId)
  const email = userData?.user?.email
  if (!email) {
    return { success: false, reason: "missing_email" }
  }

  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const summary = await fetchRankSummary(supabase, userId, since)
  if (summary.total === 0 && summary.winners.length === 0 && summary.losers.length === 0) {
    return { success: false, reason: "no_data" }
  }

  const unsubscribeUrl = buildUnsubscribeUrl(userId)
  const winnersHtml =
    summary.winners.length === 0
      ? "<li>No significant winners this week.</li>"
      : summary.winners
          .map(
            (row) =>
              `<li>${escapeHtml(row.keyword)} - +${row.change} (now #${row.position})</li>`
          )
          .join("")

  const losersHtml =
    summary.losers.length === 0
      ? "<li>No significant losers this week.</li>"
      : summary.losers
          .map(
            (row) =>
              `<li>${escapeHtml(row.keyword)} - ${row.change} (now #${row.position})</li>`
          )
          .join("")

  const contentHtml = `
    <p style="margin:0 0 16px;">Here is your weekly summary for the last 7 days.</p>
    <p style="margin:0 0 20px;">Total tracked movements: <strong>${summary.total}</strong></p>
    <h2 style="margin:0 0 8px;color:#FFD700;font-size:16px;">Top Winners</h2>
    <ul style="margin:0 0 20px;padding-left:18px;">${winnersHtml}</ul>
    <h2 style="margin:0 0 8px;color:#FFD700;font-size:16px;">Top Losers</h2>
    <ul style="margin:0;padding-left:18px;">${losersHtml}</ul>
  `

  const html = renderEmailLayout({
    title: "Citated Weekly Digest",
    preview: "Your weekly SEO performance summary",
    unsubscribeUrl,
    contentHtml,
  })

  await notificationService.queueEmail({
    to: email,
    subject: "Citated Weekly Digest",
    html,
    tags: ["weekly-digest"],
  })

  await logWeeklyReport(supabase, userId, "sent", {
    total: summary.total,
    winners: summary.winners,
    losers: summary.losers,
  })

  return { success: true }
}

export async function GET(request: Request) {
  const auth = requireCronAuth(request)
  if (!auth.ok) {
    return auth.response
  }

  const qstashUrl = process.env.QSTASH_URL
  const qstashToken = process.env.QSTASH_TOKEN
  if (!qstashUrl || !qstashToken) {
    return NextResponse.json({ error: "QSTASH_URL or QSTASH_TOKEN missing" }, { status: 500 })
  }

  const supabase = createAdminClient() as unknown as {
    from: (table: string) => any
  }

  const { data: recipients, error } = await supabase
    .from("notification_settings")
    .select("user_id, weekly_seo_report, unsubscribe_all")
    .eq("weekly_seo_report", true)
    .eq("unsubscribe_all", false)

  if (error) {
    return NextResponse.json({ error: "Failed to load notification settings" }, { status: 500 })
  }

  const targetUrl = `${getAppUrl()}/api/cron/weekly-report`
  const tasks = []

  for (const recipient of recipients ?? []) {
    const userId = recipient.user_id as string
    tasks.push(
      fetch(`${qstashUrl}/v2/publish/${encodeURIComponent(targetUrl)}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${qstashToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          body: JSON.stringify({ userId }),
          headers: {
            Authorization: `Bearer ${process.env.CRON_SECRET}`,
            "Content-Type": "application/json",
          },
        }),
      })
    )
  }

  await Promise.all(tasks)

  return NextResponse.json({ success: true, queued: tasks.length })
}

export async function POST(request: Request) {
  const auth = requireCronAuth(request)
  if (!auth.ok) {
    return auth.response
  }

  let payload: WeeklyReportPayload | null = null
  try {
    payload = (await request.json()) as WeeklyReportPayload
  } catch {
    payload = null
  }

  if (!payload?.userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 })
  }

  const result = await processWeeklyReport(payload.userId)

  return NextResponse.json({ success: result.success })
}
