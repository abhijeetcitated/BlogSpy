"use client"

import { cn } from "@/lib/utils"

interface KDRingProps {
  value: number
  size?: number
}

export function KDRing({ value, size = 28 }: KDRingProps) {
  const strokeWidth = 3
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const progress = (value / 100) * circumference
  const offset = circumference - progress

  // Color based on difficulty
  const getColor = (kd: number) => {
    if (kd <= 30) return { stroke: "#22c55e", text: "text-green-600 dark:text-green-400" } // Easy - Green
    if (kd <= 50) return { stroke: "#eab308", text: "text-yellow-600 dark:text-yellow-400" } // Medium - Yellow
    if (kd <= 70) return { stroke: "#f97316", text: "text-orange-600 dark:text-orange-400" } // Hard - Orange
    return { stroke: "#ef4444", text: "text-red-600 dark:text-red-400" } // Very Hard - Red
  }

  const colors = getColor(value)

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted/50"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={colors.stroke}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-300"
        />
      </svg>
      {/* Center text */}
      <span className={cn("absolute font-mono text-[10px] font-semibold", colors.text)}>{value}</span>
    </div>
  )
}
