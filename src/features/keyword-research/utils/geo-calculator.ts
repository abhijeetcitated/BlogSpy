// ============================================
// GEO SCORE CALCULATOR (Pure Utility)
// ============================================

/**
 * Calculate GEO Score.
 *
 * Formula:
 * - Base: 0
 * - +40 if hasAIO
 * - +30 if hasSnippet
 * - +20 if intent === 'informational' (case-insensitive)
 * - +10 if intent === 'commercial' (case-insensitive)
 * - +10 if wordCount >= 5
 *
 * Returns: number in [0, 100]
 */
export function calculateGEOScore(
  hasAIO: boolean,
  hasSnippet: boolean,
  intent: string,
  wordCount: number
): number {
  let score = 0

  if (hasAIO) score += 40
  if (hasSnippet) score += 30

  const normalizedIntent = intent.trim().toLowerCase()
  if (normalizedIntent === "informational") score += 20
  if (normalizedIntent === "commercial") score += 10

  if (wordCount >= 5) score += 10

  return clamp(score, 0, 100)
}

export type IntentCode = "I" | "C" | "T" | "N"

/**
 * Backward-compatible helper used across the codebase.
 *
 * Accepts either:
 * - intent label: "informational" | "commercial" (case-insensitive)
 * - intent codes array: ("I"|"C"|"T"|"N")[]
 */
export function calculateGeoScore(
  hasAIO: boolean,
  hasSnippet: boolean,
  intent: string | IntentCode[],
  wordCount: number
): number {
  const intentScore = scoreIntent(intent)

  let score = 0
  if (hasAIO) score += 40
  if (hasSnippet) score += 30
  score += intentScore
  if (wordCount >= 5) score += 10

  return clamp(score, 0, 100)
}

function scoreIntent(intent: string | IntentCode[]): number {
  // String intent label (preferred by new call sites)
  if (typeof intent === "string") {
    const normalized = intent.trim().toLowerCase()

    // Allow common shorthands
    if (normalized === "i") return 20
    if (normalized === "c") return 10

    if (normalized === "informational") return 20
    if (normalized === "commercial") return 10

    return 0
  }

  // Intent codes array (used by existing codebase types)
  const hasInformational = intent.includes("I")
  const hasCommercial = intent.includes("C")

  // If multiple intents exist, accumulate (still clamped at the end).
  return (hasInformational ? 20 : 0) + (hasCommercial ? 10 : 0)
}

/**
 * Convenience helper for callers that only have the keyword string.
 */
export function countKeywordWords(keyword: string): number {
  return keyword.trim().split(/\s+/).filter(Boolean).length
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n))
}
