/**
 * Trend Spotter Transformers
 *
 * Pure functions that adapt external API shapes into UI-friendly data.
 * - No network calls
 * - No DOM
 */

import type { VelocityDataPoint } from "../types"

export type DataForSEOTrendsItem = {
  time?: string
  date?: string
  value?: number
  values?: number[]
}

function toFiniteNumber(value: unknown): number | null {
  if (typeof value !== "number") return null
  if (!Number.isFinite(value)) return null
  return value
}

function shortLabel(raw: string): string {
  const trimmed = raw.trim()
  if (trimmed.length === 0) return ""

  // Preserve ISO-like labels so the chart can format them per timeframe.
  // - YYYY-MM-DD
  // - YYYY-MM-DDTHH:mm:ssZ
  // - YYYY-MM
  if (/^\d{4}-\d{2}-\d{2}(T|\s)?/.test(trimmed)) return trimmed
  if (/^\d{4}-\d{2}$/.test(trimmed)) return trimmed

  return trimmed.length > 32 ? trimmed.slice(0, 32) : trimmed
}

/**
 * Extracts a single-keyword numeric series from DataForSEO Google Trends explore items.
 *
 * Supports both:
 * - { value: number }
 * - { values: number[] } (takes values[0])
 */
export function extractTrendSeries(items: DataForSEOTrendsItem[]): {
  labels: string[]
  values: number[]
} {
  const labels: string[] = []
  const values: number[] = []

  for (let i = 0; i < items.length; i += 1) {
    const item = items[i]
    if (!item) continue

    const rawLabel = item.date ?? item.time ?? String(i + 1)

    const direct = toFiniteNumber(item.value)
    const fromArray = Array.isArray(item.values) ? toFiniteNumber(item.values[0]) : null
    const v = direct ?? fromArray

    if (v === null) continue

    labels.push(shortLabel(rawLabel))
    values.push(v)
  }

  return { labels, values }
}

/**
 * Builds the VelocityChart dataset.
 *
 * - Actual: plotted for the extracted series.
 * - Forecast: anchored at the last actual point, then continues for the forecast points.
 */
export function buildVelocityChartData(
  labels: string[],
  values: number[],
  forecast: number[]
): VelocityDataPoint[] {
  const points: VelocityDataPoint[] = []

  for (let i = 0; i < values.length; i += 1) {
    const month = labels[i] ?? String(i + 1)
    const actual = values[i] ?? null

    // Anchor forecast at the last actual point so the dashed line connects.
    const isLastActual = i === values.length - 1
    const anchoredForecast = isLastActual ? actual : null

    points.push({ month, actual, forecast: anchoredForecast })
  }

  const lastLabel = labels[labels.length - 1] ?? ""

  for (let i = 0; i < forecast.length; i += 1) {
    const month = lastLabel ? `+${i + 1}` : String(values.length + i + 1)
    points.push({ month, actual: null, forecast: forecast[i] ?? null })
  }

  return points
}
