import "server-only"

import { createAdminClient } from "@/lib/supabase/server"
import { emailSender } from "@/lib/alerts"

type EventType = "rank_drop" | "traffic_drop"

type RankDropData = {
  keyword: string
  currentPosition: number
  previousPosition: number
  url?: string
  projectName?: string
}

type TrafficDropData = {
  url: string
  currentTraffic: number
  previousTraffic: number
  title?: string
}

type EmailLayoutInput = {
  title: string
  preview?: string
  contentHtml: string
  unsubscribeUrl: string
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

async function logNotification(
  userId: string,
  type: string,
  status: "sent" | "failed",
  metadata: Record<string, unknown>
) {
  const supabase = createAdminClient() as unknown as {
    from: (table: string) => any
  }
  await supabase.from("notification_history").insert({
    user_id: userId,
    type,
    status,
    metadata,
    sent_at: new Date().toISOString(),
  })
}

export async function triggerAlert(userId: string, eventType: EventType, data: RankDropData | TrafficDropData) {
  const supabase = createAdminClient() as unknown as {
    from: (table: string) => any
    auth: {
      admin: {
        getUserById: (id: string) => Promise<{ data: { user: { email?: string } | null } }>
      }
    }
  }

  const { data: settings, error } = await supabase
    .from("notification_settings")
    .select("weekly_seo_report, rank_alerts, decay_alerts, competitor_alerts, product_updates, unsubscribe_all")
    .eq("user_id", userId)
    .maybeSingle()

  if (error || !settings) {
    return
  }

  if (settings.unsubscribe_all) {
    return
  }

  if (eventType === "rank_drop" && !settings.rank_alerts) {
    return
  }

  if (eventType === "traffic_drop" && !settings.decay_alerts) {
    return
  }

  const { data: userData } = await supabase.auth.admin.getUserById(userId)
  const recipient = userData?.user?.email
  if (!recipient) {
    return
  }

  if (eventType === "rank_drop") {
    const rankData = data as RankDropData
    const drop = rankData.currentPosition - rankData.previousPosition
    if (drop <= 10) {
      return
    }

    const subject = `Citated Rank Alert: ${rankData.keyword}`
    const unsubscribeUrl = buildUnsubscribeUrl(userId)
    const contentHtml = `
      <p style="margin:0 0 16px;">Your keyword <strong>${escapeHtml(rankData.keyword)}</strong> dropped by ${drop} positions.</p>
      <p style="margin:0 0 16px;">Previous position: ${rankData.previousPosition} | Current position: ${rankData.currentPosition}</p>
      ${rankData.url ? `<p style="margin:0;">Tracked URL: <a href="${escapeHtml(rankData.url)}" style="color:#FFD700;">${escapeHtml(rankData.url)}</a></p>` : ""}
    `

    const html = renderEmailLayout({
      title: "Rank Drop Alert",
      preview: `${rankData.keyword} dropped by ${drop} positions`,
      unsubscribeUrl,
      contentHtml,
    })

    const result = await emailSender.send({
      to: recipient,
      subject,
      html,
      tags: ["rank-alert"],
    })

    await logNotification(userId, eventType, result.success ? "sent" : "failed", {
      keyword: rankData.keyword,
      drop,
      previousPosition: rankData.previousPosition,
      currentPosition: rankData.currentPosition,
      url: rankData.url,
      projectName: rankData.projectName,
    })

    return
  }

  const trafficData = data as TrafficDropData
  if (!trafficData.previousTraffic || trafficData.previousTraffic <= 0) {
    return
  }

  const changePercent =
    ((trafficData.currentTraffic - trafficData.previousTraffic) / trafficData.previousTraffic) * 100
  if (changePercent > -20) {
    return
  }

  const subject = `Citated Traffic Alert: ${trafficData.title ?? "Traffic Drop"}`
  const unsubscribeUrl = buildUnsubscribeUrl(userId)
  const contentHtml = `
    <p style="margin:0 0 16px;">We detected a traffic drop of ${Math.abs(changePercent).toFixed(1)}% on your page.</p>
    <p style="margin:0 0 16px;">Previous traffic: ${trafficData.previousTraffic} | Current traffic: ${trafficData.currentTraffic}</p>
    <p style="margin:0;">URL: <a href="${escapeHtml(trafficData.url)}" style="color:#FFD700;">${escapeHtml(trafficData.url)}</a></p>
  `

  const html = renderEmailLayout({
    title: "Traffic Drop Alert",
    preview: `Traffic dropped ${Math.abs(changePercent).toFixed(1)}%`,
    unsubscribeUrl,
    contentHtml,
  })

  const result = await emailSender.send({
    to: recipient,
    subject,
    html,
    tags: ["traffic-alert"],
  })

  await logNotification(userId, eventType, result.success ? "sent" : "failed", {
    url: trafficData.url,
    previousTraffic: trafficData.previousTraffic,
    currentTraffic: trafficData.currentTraffic,
    changePercent,
    title: trafficData.title,
  })
}