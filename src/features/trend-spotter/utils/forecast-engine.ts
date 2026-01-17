/**
 * Trend Spotter Forecast Engine
 *
 * Linear regression over recent history to project future trend points.
 */

export interface DataPoint {
  date: string
  value: number
}

export interface ForecastPoint {
  date: string
  forecast: number
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

function addMonths(date: Date, months: number): Date {
  const next = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + months, 1))
  return next
}

function formatDate(date: Date, mode: "day" | "month"): string {
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, "0")
  if (mode === "month") {
    return `${year}-${month}`
  }
  const day = String(date.getUTCDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function parseDateLabel(label: string): { date: Date; mode: "day" | "month" } | null {
  if (/^\d{4}-\d{2}-\d{2}$/.test(label)) {
    return { date: new Date(`${label}T00:00:00Z`), mode: "day" }
  }
  if (/^\d{4}-\d{2}$/.test(label)) {
    return { date: new Date(`${label}-01T00:00:00Z`), mode: "month" }
  }
  return null
}

function linearRegression(y: number[]): { m: number; b: number } {
  const n = y.length
  if (n === 0) return { m: 0, b: 0 }

  let sumX = 0
  let sumY = 0
  let sumXX = 0
  let sumXY = 0

  for (let i = 0; i < n; i += 1) {
    const x = i
    const yi = y[i] ?? 0
    sumX += x
    sumY += yi
    sumXX += x * x
    sumXY += x * yi
  }

  const denom = n * sumXX - sumX * sumX
  if (denom === 0) {
    const avg = sumY / n
    return { m: 0, b: avg }
  }

  const m = (n * sumXY - sumX * sumY) / denom
  const b = (sumY - m * sumX) / n
  return { m, b }
}

export function calculateForecast(
  history: DataPoint[],
  periodsToPredict: number = 3
): ForecastPoint[] {
  const horizon = Math.max(0, Math.floor(periodsToPredict))
  if (horizon === 0) return []

  const cleaned = history.filter((point) => Number.isFinite(point.value))
  if (cleaned.length === 0) return []

  const startIndex = Math.floor(cleaned.length / 2)
  const recent = cleaned.slice(startIndex)
  const y = recent.map((point) => point.value)

  const { m, b } = linearRegression(y)

  const lastLabel = cleaned[cleaned.length - 1]?.date ?? ""
  const parsed = parseDateLabel(lastLabel)
  const dates: string[] = []

  for (let i = 0; i < horizon; i += 1) {
    if (parsed) {
      const nextDate =
        parsed.mode === "day"
          ? addDays(parsed.date, i + 1)
          : addMonths(parsed.date, i + 1)
      dates.push(formatDate(nextDate, parsed.mode))
    } else {
      dates.push(`+${i + 1}`)
    }
  }

  const startX = y.length
  const forecast: ForecastPoint[] = []

  for (let i = 0; i < horizon; i += 1) {
    const x = startX + i
    const projected = m * x + b
    forecast.push({
      date: dates[i] ?? `+${i + 1}`,
      forecast: clamp(projected, 0, 100),
    })
  }

  return forecast
}
