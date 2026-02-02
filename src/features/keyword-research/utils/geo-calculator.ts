import "server-only"

// ============================================
// GEO SCORE CALCULATOR (Pure Utility)
// ============================================
// Formula:
// Score = AIO_Bonus + Snippet_Bonus + Intent_Bonus + Length_Bonus
// AIO (+40), Snippet (+30), Informational (+20), Keyword length > 3 (+10)
// Max score = 100
// ============================================

export type IntentCode = "I" | "C" | "T" | "N"

/**
 * Calculate GEO Score.
 *
 * Formula: Score = AIO_Bonus + Snippet_Bonus + Intent_Bonus + Length_Bonus
 *
 * Returns: number in [0, 100]
 */
export function calculateGEOScore(
  hasAIO: boolean,
  hasSnippet: boolean,
  intent: string,
  wordCount: number
): number {
  return calculateGeoScore(hasAIO, hasSnippet, intent, wordCount)
}

/**
 * Backward-compatible helper used across the codebase.
 *
 * Accepts either:
 * - intent label: "informational" | "commercial" | "transactional" | "navigational"
 * - intent codes array: ("I"|"C"|"T"|"N")[]
 */
export function calculateGeoScore(
  hasAIO: boolean,
  hasSnippet: boolean,
  intent: string | IntentCode[],
  wordCount: number
): number {
  const intentScore = scoreIntent(intent)
  const aioScore = hasAIO ? 40 : 0
  const snippetScore = hasSnippet ? 30 : 0
  const lengthScore = wordCount > 3 ? 10 : 0

  const score = intentScore + aioScore + snippetScore + lengthScore
  return clamp(score, 0, 100)
}

export function scoreIntent(intent: string | IntentCode[]): number {
  if (typeof intent === "string") {
    const normalized = intent.trim().toLowerCase()

    if (normalized === "informational" || normalized === "i") return 20
    if (normalized === "transactional" || normalized === "t") return 0
    if (normalized === "navigational" || normalized === "n") return 0

    return 0
  }

  return intent.includes("I") ? 20 : 0
}

/**
 * Convenience helper for callers that only have the keyword string.
 */
export function countKeywordWords(keyword: string): number {
  return keyword.trim().split(/\s+/).filter(Boolean).length
}

export function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n))
}
