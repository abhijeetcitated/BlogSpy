"use client"

import { cn } from "@/lib/utils"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  GEOScoreRingProps,
  getGEOScoreColor,
  getGEOScoreStrokeColor,
  getGEOScoreGlow,
  getGEOOpportunityLevel,
} from "@/types/geo.types"
import { GEOScoreTooltipContent } from "./GEOScoreTooltipContent"

// ============================================
// GEO SCORE RING COMPONENT
// ============================================
// Visual ring showing GEO Score (0-100)
// Color-coded: Green (High) → Yellow (Medium) → Orange (Low) → Red (None)
// ============================================

/**
 * Size configurations for the ring
 */
const SIZE_CONFIG = {
  sm: { 
    size: 32, 
    strokeWidth: 3, 
    fontSize: "text-xs",
    radius: 12 
  },
  md: { 
    size: 48, 
    strokeWidth: 4, 
    fontSize: "text-sm",
    radius: 18 
  },
  lg: { 
    size: 64, 
    strokeWidth: 5, 
    fontSize: "text-base",
    radius: 24 
  },
}

/**
 * GEO Score Ring - Main visual component
 */
export function GEOScoreRing({
  score,
  size = "md",
  showLabel = false,
  showTooltip = true,
  components,
  animated = true,
  className,
}: GEOScoreRingProps) {
  const config = SIZE_CONFIG[size]
  const circumference = 2 * Math.PI * config.radius
  const strokeDashoffset = circumference - (score / 100) * circumference
  const opportunity = getGEOOpportunityLevel(score)

  const ringContent = (
    <div
      className={cn(
        "relative flex items-center justify-center rounded-full",
        "bg-slate-900/50 backdrop-blur-sm",
        `shadow-lg ${getGEOScoreGlow(score)}`,
        className
      )}
      style={{ width: config.size, height: config.size }}
    >
      {/* Background Circle */}
      <svg
        className="absolute inset-0 -rotate-90"
        width={config.size}
        height={config.size}
      >
        <circle
          cx={config.size / 2}
          cy={config.size / 2}
          r={config.radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={config.strokeWidth}
          className="text-slate-700"
        />
        {/* Progress Circle */}
        <circle
          cx={config.size / 2}
          cy={config.size / 2}
          r={config.radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={config.strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className={cn(
            getGEOScoreStrokeColor(score),
            animated && "transition-all duration-1000 ease-out"
          )}
        />
      </svg>
      
      {/* Score Text */}
      <span className={cn("font-bold", config.fontSize, getGEOScoreColor(score))}>
        {score}
      </span>
    </div>
  )

  // With tooltip
  if (showTooltip) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="inline-flex items-center gap-2 cursor-help">
              {ringContent}
              {showLabel && (
                <div className="flex flex-col">
                  <span className="text-xs text-slate-400">GEO Score</span>
                  <span className={cn("text-xs font-medium capitalize", getGEOScoreColor(score))}>
                    {opportunity} Opportunity
                  </span>
                </div>
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent 
            side="top" 
            className="max-w-xs bg-slate-900 border-slate-700 p-3"
          >
            <GEOScoreTooltipContent score={score} components={components} />
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  // Without tooltip
  return (
    <div className="inline-flex items-center gap-2">
      {ringContent}
      {showLabel && (
        <div className="flex flex-col">
          <span className="text-xs text-slate-400">GEO Score</span>
          <span className={cn("text-xs font-medium capitalize", getGEOScoreColor(score))}>
            {opportunity} Opportunity
          </span>
        </div>
      )}
    </div>
  )
}

export default GEOScoreRing
