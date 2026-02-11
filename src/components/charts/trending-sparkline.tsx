"use client"

/**
 * Generates a deterministic growth curve from a growth percentage.
 * - growthPercent > 0 → upward curve
 * - growthPercent < 0 → downward curve
 * - growthPercent === 0 → flat line
 */
function buildGrowthCurve(growthPercent: number): number[] {
  const POINTS = 12
  const absGrowth = Math.min(Math.abs(growthPercent), 500) // cap for rendering
  const isNegative = growthPercent < 0

  // Generate an eased curve from baseline to growth target
  const baseline = 20
  const peak = baseline + absGrowth * 0.4 // scale for visual
  const data: number[] = []

  for (let i = 0; i < POINTS; i++) {
    const t = i / (POINTS - 1) // 0..1
    // Ease-in-out curve: slow start, fast middle, slight plateau at end
    const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
    const value = baseline + eased * (peak - baseline)
    data.push(isNegative ? baseline + peak - value : value)
  }

  return data
}

interface TrendingSparklineProps {
  growthPercent?: number
}

export function TrendingSparkline({ growthPercent = 0 }: TrendingSparklineProps) {
  const data = buildGrowthCurve(growthPercent)
  const maxValue = Math.max(...data)
  const minValue = Math.min(...data)
  const range = maxValue - minValue || 1
  const height = 40
  const width = 100

  const points = data
    .map((value, index) => {
      const x = (index / (data.length - 1)) * width
      const y = height - ((value - minValue) / range) * height
      return `${x},${y}`
    })
    .join(" ")

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-10">
      <defs>
        <linearGradient id="sparklineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="rgb(16, 185, 129)" stopOpacity="0.3" />
          <stop offset="100%" stopColor="rgb(16, 185, 129)" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Area fill */}
      <polygon points={`0,${height} ${points} ${width},${height}`} fill="url(#sparklineGradient)" />
      {/* Line */}
      <polyline
        points={points}
        fill="none"
        stroke="rgb(16, 185, 129)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* End dot */}
      <circle cx={width} cy={height - (data[data.length - 1] / maxValue) * height} r="3" fill="rgb(16, 185, 129)" />
    </svg>
  )
}
