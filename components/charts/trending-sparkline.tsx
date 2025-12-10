"use client"

export function TrendingSparkline() {
  // Simulated trending data showing spike
  const data = [20, 25, 22, 30, 28, 35, 45, 65, 85, 95, 100, 98]
  const maxValue = Math.max(...data)
  const height = 40
  const width = 100

  const points = data
    .map((value, index) => {
      const x = (index / (data.length - 1)) * width
      const y = height - (value / maxValue) * height
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
