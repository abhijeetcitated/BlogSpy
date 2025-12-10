"use client"

interface SparklineProps {
  data: number[]
  width?: number
  height?: number
}

export function Sparkline({ data, width = 50, height = 20 }: SparklineProps) {
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1

  const points = data
    .map((value, index) => {
      const x = (index / (data.length - 1)) * width
      const y = height - ((value - min) / range) * (height - 4) - 2
      return `${x},${y}`
    })
    .join(" ")

  const isPositive = data[data.length - 1] >= data[0]

  return (
    <svg width={width} height={height} className="overflow-visible" viewBox={`0 0 ${width} ${height}`}>
      <polyline
        points={points}
        fill="none"
        stroke={isPositive ? "#22c55e" : "#ef4444"}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
