"use client"

import React from "react"

export type TrendStatus = "rising" | "falling" | "stable"

interface TrendSparklineProps {
  trend: number[]
  status: TrendStatus
}

const STATUS_COLOR: Record<TrendStatus, string> = {
  rising: "#10b981",
  falling: "#f43f5e",
  stable: "#f59e0b",
}

type Point = { x: number; y: number }

function buildCoordinates(values: number[]): Point[] {
  const length = values.length
  if (length === 0) return []

  const maxPoints = 12
  const trimmed = length > maxPoints ? values.slice(-maxPoints) : values
  const width = 100
  const height = 30
  const step = trimmed.length > 1 ? width / (trimmed.length - 1) : width

  return trimmed.map((value, index) => {
    const x = index * step
    const clamped = Math.max(0, Math.min(100, value))
    const y = height - (clamped / 100) * height
    return { x, y }
  })
}

function buildPolyline(points: Point[]): string {
  if (points.length === 0) return ""
  return points.map((point) => `${point.x.toFixed(2)},${point.y.toFixed(2)}`).join(" ")
}

export const TrendSparkline = React.memo(function TrendSparkline({
  trend,
  status,
}: TrendSparklineProps) {
  const points = buildCoordinates(trend)
  const polylinePoints = buildPolyline(points)
  const stroke = STATUS_COLOR[status] ?? STATUS_COLOR.stable
  const hasData = points.length > 0 && !trend.every((value) => value === 0)

  if (!hasData) {
    return (
      <svg viewBox="0 0 100 30" className="h-4 w-16">
        <line
          x1="0"
          y1="15"
          x2="100"
          y2="15"
          stroke="#94a3b8"
          strokeWidth={1.5}
          strokeDasharray="3 3"
          strokeLinecap="round"
        />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 100 30" className="h-4 w-16">
      <polyline
        points={polylinePoints}
        fill="none"
        stroke={stroke}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
})
