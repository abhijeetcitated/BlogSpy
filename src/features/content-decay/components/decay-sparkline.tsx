// ============================================
// CONTENT DECAY - Decay Sparkline Component
// ============================================
// SVG-based sparkline for showing decay trends

interface DecaySparklineProps {
  data: number[]
  width?: number
  height?: number
}

export function DecaySparkline({ data, width = 60, height = 20 }: DecaySparklineProps) {
  if (!data || data.length === 0) return null

  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1

  const points = data
    .map((value, index) => {
      const x = (index / (data.length - 1)) * width
      const y = height - ((value - min) / range) * height
      return `${x},${y}`
    })
    .join(" ")

  // Determine color based on trend (declining = red)
  const isDecreasing = data[data.length - 1] < data[0]
  const strokeColor = isDecreasing ? "#ef4444" : "#22c55e"

  // Generate unique ID for gradient
  const gradientId = `sparkGradient-${data.join("-")}`

  return (
    <svg width={width} height={height} className="overflow-visible">
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={strokeColor} stopOpacity="0.3" />
          <stop offset="100%" stopColor={strokeColor} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline
        points={points}
        fill="none"
        stroke={strokeColor}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
