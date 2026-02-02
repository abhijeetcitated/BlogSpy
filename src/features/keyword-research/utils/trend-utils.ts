export type TrendStatus = "rising" | "falling" | "stable"
export type TrendMomentum = { status: TrendStatus; percent: number }

function toNumber(value: number | null | undefined): number {
  if (typeof value === "number" && Number.isFinite(value)) return value
  return 0
}

/**
 * Normalize a 12-month trend series using Min-Max scaling (0-100).
 * Adds a 5% vertical padding so lines never hit the absolute top/bottom.
 * If all values are identical, return a flat line at 50.
 */
export function normalizeTrend(values: number[]): number[] {
  const safe = Array.isArray(values) ? values.map((value) => toNumber(value)) : []
  if (safe.length === 0) return []

  const hasAnyData = safe.some((value) => value !== 0)
  if (!hasAnyData) {
    return safe.map(() => 0)
  }

  let min = safe[0]
  let max = safe[0]

  for (let i = 1; i < safe.length; i++) {
    const v = safe[i]
    if (v < min) min = v
    if (v > max) max = v
  }

  if (max === min) {
    return safe.map(() => 50)
  }

  const range = max - min
  const padding = 5
  const scale = 100 - padding * 2

  return safe.map((v) => {
    const normalized = ((v - min) / range) * scale + padding
    return Math.min(100, Math.max(0, normalized))
  })
}

/**
 * Calculate growth percentage from first to last month.
 * Expects values ordered oldest -> newest for visual consistency.
 */
function calculateTrendGrowth(values: number[]): number {
  const safe = Array.isArray(values) ? values.map((value) => toNumber(value)) : []
  if (safe.length < 2) return 0

  const first = safe[0] ?? 0
  const last = safe[safe.length - 1] ?? 0
  return ((last - first) / Math.max(1, first)) * 100
}

/**
 * Determine trend status from first-to-last growth.
 * Expects values ordered oldest -> newest for visual consistency.
 */
export function calculateMomentum(values: number[]): TrendMomentum {
  const growth = calculateTrendGrowth(values)
  const percent = Number.isFinite(growth) ? growth : 0

  let status: TrendStatus = "stable"
  if (percent > 1) status = "rising"
  else if (percent < -1) status = "falling"

  return { status, percent }
}
