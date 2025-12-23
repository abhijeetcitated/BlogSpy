// ============================================
// AI WRITER - SEO Score Gauge Component
// ============================================

"use client"

import { cn } from "@/lib/utils"
import { getScoreColor, getScoreGlow } from "../utils"

interface SEOScoreGaugeProps {
  score: number
}

export function SEOScoreGauge({ score }: SEOScoreGaugeProps) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={cn(
          "relative flex items-center justify-center w-10 h-10 rounded-full bg-card shadow-md",
          getScoreGlow(score)
        )}
      >
        <svg className="absolute inset-0 w-10 h-10 -rotate-90">
          <circle
            cx="20"
            cy="20"
            r="16"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            className="text-muted-foreground/40"
          />
          <circle
            cx="20"
            cy="20"
            r="16"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeDasharray={`${(score / 100) * 100.5} 100.5`}
            strokeLinecap="round"
            className={getScoreColor(score)}
          />
        </svg>
        <span className={cn("text-xs font-bold", getScoreColor(score))}>{score}</span>
      </div>
    </div>
  )
}
