// ============================================
// COMPETITOR GAP - Forum Intel Math & Parsing
// ============================================

export type OpportunityLabel = "High" | "Medium" | "Low"

export function parseSnippet(text: string): { upvotes: number; comments: number; date: string | null } {
  const engagement = parseEngagement(text)
  const date = parseDate(text)
  return { ...engagement, date }
}

export function parseEngagement(snippet: string): { upvotes: number; comments: number } {
  const normalized = snippet.toLowerCase()
  const votesMatch = normalized.match(/(\d+)\s+votes?/)
  const commentsMatch = normalized.match(/(\d+)\s+comments?/)
  const answersMatch = normalized.match(/(\d+)\s+answers?/)

  const upvotes = votesMatch ? Number(votesMatch[1]) : 0
  const comments = commentsMatch
    ? Number(commentsMatch[1])
    : answersMatch
      ? Number(answersMatch[1])
      : 0

  return {
    upvotes: Number.isNaN(upvotes) ? 0 : upvotes,
    comments: Number.isNaN(comments) ? 0 : comments,
  }
}

export function calculateTraffic(volume: number, rank: number): number {
  return calculateEstTraffic(rank, volume)
}

export function calculateEstTraffic(rank: number, volume: number): number {
  let ctr = 0.01
  if (rank === 1) ctr = 0.3
  else if (rank === 2) ctr = 0.15
  else if (rank === 3) ctr = 0.1
  else if (rank >= 4 && rank <= 10) ctr = 0.05
  return Math.max(0, Math.round(volume * ctr))
}

export function calculateOpportunityScore(
  rank: number,
  engagement: number
): { score: number; label: OpportunityLabel } {
  return calculateOpportunity(rank, 0, engagement)
}

export function calculateOpportunity(
  rank: number,
  daysOld: number,
  engagement: number
): { score: number; label: OpportunityLabel } {
  let score = (11 - rank) * 10
  if (daysOld < 180) {
    score += 20
  }
  if (engagement > 10) {
    score += 10
  }

  score = Math.max(0, Math.min(100, score))

  let label: OpportunityLabel = "Low"
  if (score >= 70) label = "High"
  else if (score >= 40) label = "Medium"

  return { score, label }
}

export function parseDate(snippet: string, apiDate?: string): string | null {
  if (apiDate) {
    const date = new Date(apiDate)
    if (!Number.isNaN(date.getTime())) {
      return date.toISOString()
    }
  }

  const normalized = snippet.trim()
  if (!normalized) return null

  const isoMatch = normalized.match(/\b\d{4}-\d{2}-\d{2}\b/)
  if (isoMatch) {
    const date = new Date(isoMatch[0])
    return Number.isNaN(date.getTime()) ? null : date.toISOString()
  }

  const monthMatch = normalized.match(
    /\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)[a-z]*\s+\d{1,2},\s+\d{4}\b/i
  )
  if (monthMatch) {
    const date = new Date(monthMatch[0])
    return Number.isNaN(date.getTime()) ? null : date.toISOString()
  }

  const relativeMatch = normalized.match(/\b(\d+)\s+(day|week|month|year)s?\s+ago\b/i)
  if (relativeMatch) {
    const value = Number(relativeMatch[1])
    const unit = relativeMatch[2].toLowerCase()
    if (!Number.isNaN(value)) {
      const date = new Date()
      if (unit === "day") date.setDate(date.getDate() - value)
      if (unit === "week") date.setDate(date.getDate() - value * 7)
      if (unit === "month") date.setMonth(date.getMonth() - value)
      if (unit === "year") date.setFullYear(date.getFullYear() - value)
      return date.toISOString()
    }
  }

  return null
}
