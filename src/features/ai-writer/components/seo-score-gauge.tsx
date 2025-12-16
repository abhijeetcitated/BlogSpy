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
    <div className="flex items-center gap-3">
      <span className="text-sm text-muted-foreground">SEO Score</span>
      <div
        className={cn(
          "relative flex items-center justify-center w-14 h-14 rounded-full bg-slate-900 shadow-lg",
          getScoreGlow(score)
        )}
      >
        <svg className="absolute inset-0 w-14 h-14 -rotate-90">
          <circle
            cx="28"
            cy="28"
            r="24"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            className="text-slate-700"
          />
          <circle
            cx="28"
            cy="28"
            r="24"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            strokeDasharray={`${(score / 100) * 150.8} 150.8`}
            strokeLinecap="round"
            className={getScoreColor(score)}
          />
        </svg>
        <span className={cn("text-sm font-bold", getScoreColor(score))}>{score}</span>
      </div>
    </div>
  )
}
