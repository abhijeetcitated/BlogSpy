"use client"

import { cn } from "@/lib/utils"

// ============================================
// DECAY SCORE RING
// ============================================

export interface CommunityDecayRingProps {
  score: number
  size?: "sm" | "md" | "lg"
  showLabel?: boolean
  className?: string
}

const sizes = {
  sm: { width: 48, height: 48, stroke: 4, fontSize: "text-xs" },
  md: { width: 72, height: 72, stroke: 6, fontSize: "text-lg" },
  lg: { width: 96, height: 96, stroke: 8, fontSize: "text-2xl" },
}

// Color based on score (higher = more decayed = more opportunity)
const getScoreColor = (s: number) => {
  if (s >= 70) return "#10b981" // Emerald - High opportunity
  if (s >= 50) return "#f59e0b" // Amber - Good opportunity
  if (s >= 30) return "#f97316" // Orange - Some decay
  return "#6b7280" // Gray - Fresh content
}

export function CommunityDecayRing({
  score,
  size = "md",
  showLabel = true,
  className,
}: CommunityDecayRingProps) {
  const config = sizes[size]
  const radius = (config.width - config.stroke) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference
  const color = getScoreColor(score)

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg width={config.width} height={config.height} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={config.width / 2}
          cy={config.height / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={config.stroke}
          className="text-slate-700"
        />
        {/* Progress circle */}
        <circle
          cx={config.width / 2}
          cy={config.height / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={config.stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-500 ease-out"
        />
      </svg>
      {showLabel && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn("font-bold", config.fontSize)} style={{ color }}>
            {score}
          </span>
          {size !== "sm" && (
            <span className="text-[10px] text-slate-400 uppercase tracking-wider">
              Decay
            </span>
          )}
        </div>
      )}
    </div>
  )
}
