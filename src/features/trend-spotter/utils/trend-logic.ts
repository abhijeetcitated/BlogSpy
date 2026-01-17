export type ForecastResult = {
  predictions: number[]
}

export type GeoVolumeInput = {
  id: string
  value: number
}

export type GeoVolumeOutput = GeoVolumeInput & {
  estimated_volume: number
}

export type ViralityResult = {
  percentChange: number
  badge: "Breakout 🚀" | "Rising 🔥" | "Cooling ❄️" | "Stable"
}

/**
 * Predicts the next 3 points using linear regression on the last 50% of data.
 *
 * Math:
 * - Take the last half of points.
 * - Fit y = m*x + b using least squares.
 * - Predict the next 3 x positions.
 */
export function calculateForecast(data: number[]): ForecastResult {
  const clean = data.filter((value) => Number.isFinite(value))
  const n = clean.length
  if (n === 0) return { predictions: [] }

  const start = Math.floor(n / 2)
  const recent = clean.slice(start)
  const mInput = recent.length
  if (mInput === 0) return { predictions: [] }

  let sumX = 0
  let sumY = 0
  let sumXX = 0
  let sumXY = 0

  for (let i = 0; i < mInput; i += 1) {
    const x = i
    const y = recent[i] ?? 0
    sumX += x
    sumY += y
    sumXX += x * x
    sumXY += x * y
  }

  const denom = mInput * sumXX - sumX * sumX
  const slope = denom === 0 ? 0 : (mInput * sumXY - sumX * sumY) / denom
  const intercept = (sumY - slope * sumX) / mInput

  const startX = mInput
  const predictions = Array.from({ length: 3 }, (_, i) => {
    const x = startX + i
    const value = slope * x + intercept
    return Number.isFinite(value) ? value : 0
  })

  return { predictions }
}

/**
 * Distributes a global volume across geo entries proportionally to their values.
 *
 * Math:
 * - TotalScore = sum(values)
 * - estimated_volume = (value / TotalScore) * globalVolume
 */
export function distributeVolume(
  geoData: GeoVolumeInput[],
  globalVolume: number
): GeoVolumeOutput[] {
  if (!Number.isFinite(globalVolume) || globalVolume <= 0) {
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
    const estimated = ratio * globalVolume
    return { ...item, estimated_volume: Math.round(estimated) }
  })
}

/**
 * Calculates percentage growth and assigns a badge.
 *
 * Math:
 * - ((current - previous) / previous) * 100
 * - Handles division by zero and non-finite values.
 */
export function calculateVirality(current: number, previous: number): ViralityResult {
  const safePrev = Number.isFinite(previous) ? previous : 0
  const safeCurrent = Number.isFinite(current) ? current : 0

  if (safePrev === 0) {
    return { percentChange: 0, badge: "Stable" }
  }

  const percentChange = ((safeCurrent - safePrev) / safePrev) * 100

  let badge: ViralityResult["badge"] = "Stable"
  if (percentChange > 50) badge = "Breakout 🚀"
  else if (percentChange > 20) badge = "Rising 🔥"
  else if (percentChange < 0) badge = "Cooling ❄️"

  return { percentChange, badge }
}
