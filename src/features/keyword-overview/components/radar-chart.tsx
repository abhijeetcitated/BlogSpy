"use client"

import { RADAR_AXES, CHART_DIMENSIONS } from "../constants"
import { calculateRadarPoints, calculateAxisEndpoint, calculateLabelPosition } from "../utils/overview-utils"
import type { RadarAxis } from "../types"

interface RadarChartProps {
  axes?: RadarAxis[]
}

export function RadarChart({ axes = RADAR_AXES }: RadarChartProps) {
  const { centerX, centerY, maxRadius } = CHART_DIMENSIONS.radar
  const points = calculateRadarPoints(axes)
  const polygonPoints = points.map((p) => `${p.x},${p.y}`).join(" ")

  return (
    <svg viewBox="0 0 160 160" className="w-full h-36" role="img" aria-label="Search intent profile radar chart">
      <defs>
        <linearGradient id="radarFill" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgba(16,185,129,0.3)" />
          <stop offset="100%" stopColor="rgba(6,182,212,0.3)" />
        </linearGradient>
      </defs>

      {/* Grid circles */}
      {[0.25, 0.5, 0.75, 1].map((scale, i) => (
        <circle
          key={i}
          cx={centerX}
          cy={centerY}
          r={maxRadius * scale}
          fill="none"
          stroke="rgba(148,163,184,0.2)"
          strokeWidth="1"
        />
      ))}

      {/* Axis lines */}
      {axes.map((axis, i) => {
        const endpoint = calculateAxisEndpoint(axis.angle)
        return (
          <line 
            key={i} 
            x1={centerX} 
            y1={centerY} 
            x2={endpoint.x} 
            y2={endpoint.y} 
            stroke="rgba(148,163,184,0.3)" 
            strokeWidth="1" 
          />
        )
      })}

      {/* Data polygon */}
      <polygon points={polygonPoints} fill="url(#radarFill)" stroke="#10b981" strokeWidth="2" />

      {/* Data points */}
      {points.map((point, i) => (
        <circle key={i} cx={point.x} cy={point.y} r="4" fill="#10b981" />
      ))}

      {/* Labels */}
      {axes.map((axis, i) => {
        const pos = calculateLabelPosition(axis.angle)
        return (
          <text 
            key={i} 
            x={pos.x} 
            y={pos.y} 
            textAnchor="middle" 
            dominantBaseline="middle" 
            className="fill-muted-foreground text-[8px]"
          >
            {axis.label}
          </text>
        )
      })}
    </svg>
  )
}
