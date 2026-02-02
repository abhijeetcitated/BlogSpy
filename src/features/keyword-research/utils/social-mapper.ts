import "server-only"

import type { YouTubeResult } from "../types"
import type { PinterestInsight, RedditInsight, SocialIntelPayload } from "../services/social.service"

export type YouTubeWinProbability = {
  score: number
  label: "High" | "Medium" | "Low"
  avgAgeDays: number | null
  avgViewsPerSubscriber: number | null
}

export type SocialIntelMetrics = {
  youtubeWinProbability: YouTubeWinProbability
  redditHeatIndex: number
  pinterestVirality: number
}

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)))
}

function stableHash(input: string): number {
  let h = 0
  for (let i = 0; i < input.length; i++) {
    h = (h * 31 + input.charCodeAt(i)) >>> 0
  }
  return h
}

function parseVideoAge(published?: string | null): number | null {
  if (!published) return null
  const lower = published.toLowerCase()

  const yearMatch = lower.match(/(\d+)\s*years?\s*ago/i)
  if (yearMatch) return parseInt(yearMatch[1], 10) * 365

  const monthMatch = lower.match(/(\d+)\s*months?\s*ago/i)
  if (monthMatch) return parseInt(monthMatch[1], 10) * 30

  const weekMatch = lower.match(/(\d+)\s*weeks?\s*ago/i)
  if (weekMatch) return parseInt(weekMatch[1], 10) * 7

  const dayMatch = lower.match(/(\d+)\s*days?\s*ago/i)
  if (dayMatch) return parseInt(dayMatch[1], 10)

  const parsed = Date.parse(published)
  if (!Number.isNaN(parsed)) {
    const diffMs = Date.now() - parsed
    return Math.max(0, Math.round(diffMs / (1000 * 60 * 60 * 24)))
  }

  return null
}

function estimateSubscriberCount(video: YouTubeResult, seed: number): number | null {
  const views = video.views ?? 0
  if (!Number.isFinite(views) || views <= 0) return null
  const divisor = 6 + (seed % 10)
  return Math.max(1, Math.round(views / divisor))
}

export function calculateYouTubeWinProbability(
  videos: YouTubeResult[],
  keyword: string
): YouTubeWinProbability {
  if (videos.length === 0) {
    return {
      score: 0,
      label: "Low",
      avgAgeDays: null,
      avgViewsPerSubscriber: null,
    }
  }

  const seed = stableHash(keyword)
  const topVideo = videos[0]
  const topAgeDays = topVideo ? parseVideoAge(topVideo.published ?? null) : null

  const subsRaw = topVideo ? (topVideo as { subscriberCount?: number | null }).subscriberCount : null
  const subscriberCount =
    typeof subsRaw === "number" && subsRaw > 0
      ? subsRaw
      : topVideo
        ? estimateSubscriberCount(topVideo, seed)
        : null

  const views = topVideo?.views ?? 0
  const ratio = subscriberCount && subscriberCount > 0 ? views / subscriberCount : null

  let score = ratio ? ratio * 100 : 0

  if (topAgeDays !== null && topAgeDays > 730) {
    score += 30
  }

  const normalizedTitle = (topVideo?.title ?? "").trim().toLowerCase()
  const normalizedKeyword = keyword.trim().toLowerCase()
  if (normalizedTitle && normalizedTitle !== normalizedKeyword) {
    score += 20
  }

  score = clampScore(score)

  const label = score >= 70 ? "High" : score >= 40 ? "Medium" : "Low"

  return {
    score,
    label,
    avgAgeDays: topAgeDays ?? null,
    avgViewsPerSubscriber: ratio ? Math.round(ratio * 10) / 10 : null,
  }
}

export function calculateRedditHeatIndex(reddit: RedditInsight): number {
  const threads = reddit.threads ?? []
  if (threads.length === 0) return 0

  const totalComments = threads.reduce((sum, t) => sum + (t.comments ?? 0), 0)
  const score = threads.length * 2 + totalComments / 10
  return clampScore(score)
}

export function calculatePinterestVirality(pinterest: PinterestInsight): number {
  const totalPins = Number.isFinite(pinterest.totalPins) ? pinterest.totalPins : pinterest.pins.length
  if (totalPins <= 0) return 0
  const scaled = totalPins / 10
  return clampScore(scaled)
}

export function mapSocialIntel(
  payload: SocialIntelPayload,
  keyword: string
): SocialIntelMetrics {
  return {
    youtubeWinProbability: calculateYouTubeWinProbability(payload.youtube, keyword),
    redditHeatIndex: calculateRedditHeatIndex(payload.reddit),
    pinterestVirality: calculatePinterestVirality(payload.pinterest),
  }
}
