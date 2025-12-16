// Keyword Overview Utility Functions
import { CHART_DIMENSIONS, DA_THRESHOLDS } from "../constants"
import type { RadarAxis, SeasonalityData } from "../types"

/**
 * Calculate radar chart polygon points
 */
export function calculateRadarPoints(axes: RadarAxis[]) {
  const { centerX, centerY, maxRadius } = CHART_DIMENSIONS.radar
  
  return axes.map((axis) => {
    const angleRad = ((axis.angle - 90) * Math.PI) / 180
    const r = axis.value * maxRadius
    return {
      x: centerX + r * Math.cos(angleRad),
      y: centerY + r * Math.sin(angleRad),
    }
  })
}

/**
 * Calculate radar axis endpoint
 */
export function calculateAxisEndpoint(angle: number) {
  const { centerX, centerY, maxRadius } = CHART_DIMENSIONS.radar
  const angleRad = ((angle - 90) * Math.PI) / 180
  return {
    x: centerX + maxRadius * Math.cos(angleRad),
    y: centerY + maxRadius * Math.sin(angleRad),
  }
}

/**
 * Calculate label position for radar axis
 */
export function calculateLabelPosition(angle: number, offset = 18) {
  const { centerX, centerY, maxRadius } = CHART_DIMENSIONS.radar
  const angleRad = ((angle - 90) * Math.PI) / 180
  const labelR = maxRadius + offset
  return {
    x: centerX + labelR * Math.cos(angleRad),
    y: centerY + labelR * Math.sin(angleRad),
  }
}

/**
 * Calculate area chart points and paths
 */
export function calculateTrendChartPaths(data: number[]) {
  const { width, height } = CHART_DIMENSIONS.trend
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * width
    const y = height - ((value - min) / range) * (height - 20) - 10
    return { x, y }
  })

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ")
  const areaPath = `${linePath} L ${width} ${height} L 0 ${height} Z`

  return { points, linePath, areaPath, width, height }
}

/**
 * Get peak month index from seasonality data
 */
export function getPeakMonth(data: SeasonalityData): number {
  const maxValue = Math.max(...data.values)
  return data.values.indexOf(maxValue)
}

/**
 * Get bar height percentage
 */
export function getBarHeight(value: number, maxValue: number): number {
  return (value / maxValue) * 100
}

/**
 * Get DA color class
 */
export function getDAColorClass(da: number): string {
  if (da >= DA_THRESHOLDS.high) return "text-emerald-400"
  if (da >= DA_THRESHOLDS.medium) return "text-blue-400"
  return "text-slate-400"
}

/**
 * Get result type badge classes
 */
export function getTypeBadgeClasses(type: string, isWeak: boolean): string {
  if (type === "Forum") {
    return "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
  }
  if (type === "E-commerce") {
    return "bg-purple-500/20 text-purple-400 border border-purple-500/30"
  }
  return "bg-slate-700 text-slate-300"
}

/**
 * Get pixel rank status message
 */
export function getPixelRankMessage(foldStatus: "above" | "partial" | "below"): string {
  switch (foldStatus) {
    case "above":
      return "✓ Visible without scrolling - Great position!"
    case "partial":
      return "⚠️ Partially visible - Consider targeting SERP features"
    default:
      return "⬇️ Below fold - Users need to scroll to see your result"
  }
}

/**
 * Get RTV status message
 */
export function getRTVMessage(rtvPercentage: number): string {
  if (rtvPercentage >= 0.60) {
    return "✓ Good traffic potential - Most volume is realizable"
  }
  if (rtvPercentage >= 0.35) {
    return `⚠️ SERP features stealing ~${Math.round((1 - rtvPercentage) * 100)}% of clicks`
  }
  return "🔴 High CTR loss - Consider targeting SERP features or different keywords"
}

/**
 * Get decay opportunity message
 */
export function getDecayMessage(decayScore: number, hasCommunityContent: boolean): string {
  if (decayScore >= 60) {
    return "🎯 High decay score - Excellent opportunity to outrank stale UGC!"
  }
  if (hasCommunityContent) {
    return "📊 Monitor these sources as they age"
  }
  return "No UGC to outrank in this SERP"
}

/**
 * Get content age label
 */
export function getContentAgeLabel(days: number): string {
  if (days > 180) return "🔴 Very stale content - Easy to outrank"
  if (days > 90) return "🟠 Aging content - Good opportunity"
  return "🟡 Relatively fresh content"
}
