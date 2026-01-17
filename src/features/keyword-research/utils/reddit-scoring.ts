import { differenceInDays, parseISO } from "date-fns"

export type HeatLabel = "Atomic" | "Hot" | "Cold"

export type HeatScore = {
  heatScore: number
  label: HeatLabel
}

/**
 * Calculates heat index for community threads.
 *
 * Math:
 * - daysOld = days since post date
 * - heatScore = comments / (daysOld + 1)^1.5
 */
export function calculateHeatIndex(comments: number, date: string): HeatScore {
  const parsed = parseISO(date)
  const daysOld = Number.isFinite(parsed.getTime())
    ? Math.max(0, differenceInDays(new Date(), parsed))
    : 0

  const heatScore = comments / Math.pow(daysOld + 1, 1.5)

  let label: HeatLabel = "Cold"
  if (heatScore > 10) label = "Atomic"
  else if (heatScore > 2) label = "Hot"

  return { heatScore, label }
}
