/**
 * Trend Spotter Math Engine
 *
 * Pure functions only.
 * - No network calls
 * - No UI
 * - Deterministic outputs
 */

export type ViralityResult = {
  percentChange: number
  label: "Breakout" | "Rising" | "Stable"
}

export type GeoVolumeInput = {
  id: string
  value: number
}

export type GeoVolumeOutput = GeoVolumeInput & {
  estimated_volume: number
}

/**
 * Forecasts the next N values using least-squares regression
 * on the last 50% of data points.
 */
export function calculateForecast(data: number[], monthsAhead: number): number[] {
  const cleaned = data.filter((v) => Number.isFinite(v))
  if (cleaned.length === 0 || monthsAhead <= 0) return []

  const start = Math.floor(cleaned.length / 2)
  const recent = cleaned.slice(start)
  if (recent.length === 0) return []

  let sumX = 0
  let sumY = 0
  let sumXX = 0
  let sumXY = 0

  for (let i = 0; i < recent.length; i += 1) {
    const x = i
    const y = recent[i] ?? 0
    sumX += x
    sumY += y
    sumXX += x * x
    sumXY += x * y
  }

  const denom = recent.length * sumXX - sumX * sumX
  const slope = denom === 0 ? 0 : (recent.length * sumXY - sumX * sumY) / denom
  const intercept = (sumY - slope * sumX) / recent.length

  return Array.from({ length: monthsAhead }, (_, i) => {
    const x = recent.length + i
    const value = slope * x + intercept
    return Number.isFinite(value) ? value : 0
  })
}

/**
 * Distributes total volume proportionally to geo scores.
 *
 * Math:
 * - TotalScore = sum(values)
 * - estimated_volume = (value / TotalScore) * totalVolume
 */
export function distributeVolume(
  geoData: GeoVolumeInput[],
  totalVolume: number
): GeoVolumeOutput[] {
  if (!Number.isFinite(totalVolume) || totalVolume <= 0) {
    return geoData.map((item) => ({ ...item, estimated_volume: 0 }))
  }

  const totalScore = geoData.reduce((sum, item) => {
    return sum + (Number.isFinite(item.value) ? item.value : 0)
  }, 0)

  if (totalScore <= 0) {
    return geoData.map((item) => ({ ...item, estimated_volume: 0 }))
  }

  return geoData.map((item) => {
    const ratio = Number.isFinite(item.value) ? item.value / totalScore : 0
    return { ...item, estimated_volume: Math.round(ratio * totalVolume) }
  })
}

/**
 * Virality:
 * Percentage growth of the current value vs an average baseline.
 *
 * percentChange = ((current - avg) / avg) * 100
 */
export function calculateVirality(current: number, avg: number): ViralityResult {
  if (!Number.isFinite(current) || !Number.isFinite(avg) || avg === 0) {
    return { percentChange: 0, label: "Stable" }
  }

  const percentChange = ((current - avg) / avg) * 100

  let label: ViralityResult["label"] = "Stable"
  if (percentChange > 50) label = "Breakout"
  else if (percentChange > 20) label = "Rising"

  return { percentChange, label }
}

/**
 * Legacy virality score:
 * Percentage growth of the last point vs the average of the previous 3.
 *
 * score = ((last - avg(prev3)) / avg(prev3)) * 100
 */
export function calculateViralityScore(dataPoints: number[]): number {
  const cleaned = dataPoints.filter((v) => Number.isFinite(v))
  if (cleaned.length < 2) return 0

  const last = cleaned[cleaned.length - 1] ?? 0
  const prev = cleaned.slice(Math.max(0, cleaned.length - 4), cleaned.length - 1)

  if (prev.length === 0) return 0

  const avgPrev = prev.reduce((acc, v) => acc + v, 0) / prev.length
  if (avgPrev === 0) {
    return last === 0 ? 0 : 100
  }

  return ((last - avgPrev) / avgPrev) * 100
}
