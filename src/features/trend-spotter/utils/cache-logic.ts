type TimeframeKey = "4H" | "24H" | "7D" | "30D" | "12M" | "CUSTOM"

const CACHE_TTL_MINUTES: Record<TimeframeKey, number> = {
  "4H": 15,
  "24H": 60,
  "7D": 360,
  "30D": 1440,
  "12M": 10080,
  CUSTOM: 360,
}

function normalizeTimeframe(timeframe: string): TimeframeKey {
  const tf = timeframe.trim().toUpperCase()
  if (tf === "4H" || tf === "24H" || tf === "7D" || tf === "30D" || tf === "12M") {
    return tf
  }
  return "CUSTOM"
}

export function buildCacheTimeframeKey(
  timeframe: string,
  startDate?: string,
  endDate?: string
): string {
  const tf = normalizeTimeframe(timeframe)
  if (tf !== "CUSTOM") return tf
  if (!startDate || !endDate) return tf
  return `${tf}:${startDate}:${endDate}`
}

export function getCacheTtlMinutes(timeframe: string): number {
  return CACHE_TTL_MINUTES[normalizeTimeframe(timeframe)]
}

export function getCacheExpiry(timeframe: string): string {
  const minutes = getCacheTtlMinutes(timeframe)
  return new Date(Date.now() + minutes * 60 * 1000).toISOString()
}
