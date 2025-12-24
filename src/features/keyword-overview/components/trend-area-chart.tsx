"use client"

import { TREND_DATA } from "../constants"
import { calculateTrendChartPaths } from "../utils/overview-utils"

interface TrendAreaChartProps {
  data?: number[]
}

export function TrendAreaChart({ data = TREND_DATA }: TrendAreaChartProps) {
  const { points, linePath, areaPath, width, height } = calculateTrendChartPaths(data)

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-28" role="img" aria-label="Search trend over time">
      <defs>
        <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="rgba(16,185,129,0.4)" />
          <stop offset="100%" stopColor="rgba(16,185,129,0)" />
        </linearGradient>
      </defs>

      {/* Grid lines */}
      {[0, 25, 50, 75, 100].map((_, i) => (
        <line
          key={i}
          x1="0"
          y1={height - (i * (height - 20)) / 4 - 10}
          x2={width}
          y2={height - (i * (height - 20)) / 4 - 10}
          stroke="rgba(148,163,184,0.1)"
          strokeWidth="1"
        />
      ))}

      <path d={areaPath} fill="url(#areaGradient)" />
      <path d={linePath} fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" />

      {/* End point */}
      <circle cx={points[points.length - 1].x} cy={points[points.length - 1].y} r="4" fill="#10b981" />
    </svg>
  )
}
