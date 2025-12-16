"use client"

import { cn } from "@/lib/utils"
import { getHealthScoreColor, getHealthScoreLabel } from "../utils/cannibalization-utils"

interface HealthScoreRingProps {
  score: number
  size?: number
}

export function HealthScoreRing({ score, size = 120 }: HealthScoreRingProps) {
  const strokeWidth = 8
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (score / 100) * circumference
  
  const colorClass = getHealthScoreColor(score)
  const label = getHealthScoreLabel(score)
  
  // Get actual color values for SVG gradients
  const getGradientColors = () => {
    if (score >= 80) return { start: '#10b981', end: '#34d399' } // emerald
    if (score >= 60) return { start: '#f59e0b', end: '#fbbf24' } // amber
    if (score >= 40) return { start: '#f97316', end: '#fb923c' } // orange
    return { start: '#ef4444', end: '#f87171' } // red
  }
  
  const gradientColors = getGradientColors()
  const gradientId = `healthGradient-${score}`
  
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={gradientColors.start} />
            <stop offset="100%" stopColor={gradientColors.end} />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          fill="none"
          className="stroke-muted/30 dark:stroke-muted/20"
        />
        
        {/* Progress circle with gradient */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          stroke={`url(#${gradientId})`}
          filter="url(#glow)"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      
      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn(
          "text-2xl sm:text-3xl font-bold tabular-nums",
          colorClass
        )}>
          {score}
        </span>
        <span className="text-[10px] sm:text-xs text-muted-foreground font-medium">
          {label}
        </span>
      </div>
    </div>
  )
}
