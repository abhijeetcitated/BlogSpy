import { differenceInYears, parseISO } from "date-fns"

export type ViralBadge = "Unicorn" | "Viral" | "Normal"

export type ViralScore = {
  score: number
  badge: ViralBadge
}

export type VideoAgeInput = {
  publishedAt: string
}

export type FGIResult = {
  fgiScore: number
  isRipeForSnipe: boolean
}

/**
 * Calculates a simple virality score based on views to subscriber ratio.
 *
 * Math:
 * - subs defaults to 1000 to avoid division by zero.
 * - score = views / subs
 */
export function calculateViralScore(views: number, subs: number): ViralScore {
  const safeSubs = subs === 0 ? 1000 : subs
  const score = safeSubs > 0 ? views / safeSubs : 0

  let badge: ViralBadge = "Normal"
  if (score > 50) badge = "Unicorn"
  else if (score > 10) badge = "Viral"

  return { score, badge }
}

/**
 * Freshness Gap Index (FGI):
 * percentage of videos older than 2 years.
 */
export function calculateFGI(videos: VideoAgeInput[]): FGIResult {
  if (videos.length === 0) {
    return { fgiScore: 0, isRipeForSnipe: false }
  }

  const now = new Date()
  const outdatedCount = videos.reduce((count, video) => {
    const parsed = parseISO(video.publishedAt)
    if (!Number.isFinite(parsed.getTime())) return count
    return differenceInYears(now, parsed) > 2 ? count + 1 : count
  }, 0)

  const fgiScore = Math.round((outdatedCount / videos.length) * 100)
  const isRipeForSnipe = fgiScore >= 50

  return { fgiScore, isRipeForSnipe }
}
