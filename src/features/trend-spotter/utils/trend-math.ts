/**
 * Trend Spotter Math Engine
 *
 * Pure functions only.
 * - No network calls
 * - No UI
 * - Deterministic outputs
 */

/**
 * Simple linear regression (least squares) for y = m*x + b.
 *
 * @returns slope m and intercept b
 */
function linearRegression(x: number[], y: number[]): { m: number; b: number } {
  if (x.length !== y.length) {
    throw new Error("x and y must have the same length")
  }
  if (x.length === 0) {
    return { m: 0, b: 0 }
  }

  const n = x.length

  let sumX = 0
  let sumY = 0
  let sumXX = 0
  let sumXY = 0

  for (let i = 0; i < n; i += 1) {
    const xi = x[i] ?? 0
    const yi = y[i] ?? 0

    sumX += xi
    sumY += yi
    sumXX += xi * xi
    sumXY += xi * yi
  }

  const denom = n * sumXX - sumX * sumX
  if (denom === 0) {
    // All x are the same (shouldn't happen with a normal sequence), fallback to flat line at avg(y)
    const avgY = sumY / n
    return { m: 0, b: avgY }
  }

  const m = (n * sumXY - sumX * sumY) / denom
  const b = (sumY - m * sumX) / n

  return { m, b }
}

/**
 * Predicts the next `monthsAhead` data points.
 *
 * Spec:
 * - Use Linear Regression
 * - Fit using the last 6 points (or fewer if not available)
 * - Predict the next 3 points (callers can pass 3; monthsAhead is configurable)
 *
 * @example
 * const forecast = calculateForecast([10,12,15,18,22,28], 3)
 */
export function calculateForecast(dataPoints: number[], monthsAhead: number): number[] {
  const ahead = Math.max(0, Math.floor(monthsAhead))
  if (ahead === 0) return []

  const cleaned = dataPoints.filter((v) => Number.isFinite(v))
  if (cleaned.length === 0) {
    return Array.from({ length: ahead }, () => 0)
  }

  const windowSize = Math.min(6, cleaned.length)
  const yWindow = cleaned.slice(cleaned.length - windowSize)

  // x indices are 0..windowSize-1
  const xWindow = yWindow.map((_, idx) => idx)

  const { m, b } = linearRegression(xWindow, yWindow)

  const startX = windowSize
  const forecast: number[] = []

  for (let i = 0; i < ahead; i += 1) {
    const x = startX + i
    const y = m * x + b

    // Defensive: Google Trends is 0..100; callers may want raw.
    // Here we clamp at 0 to avoid negative predictions.
    forecast.push(Math.max(0, y))
  }

  return forecast
}

/**
 * Virality score:
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
    // If baseline is 0, treat any positive last as a 100%+ style breakout.
    // Return 0 for last=0, else 100.
    return last === 0 ? 0 : 100
  }

  return ((last - avgPrev) / avgPrev) * 100
}
