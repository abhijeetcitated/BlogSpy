"use client"

// ============================================
// KD COLUMN - Keyword difficulty display
// ============================================

import { cn } from "@/lib/utils"
import { Progress } from "@/components/ui/progress"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface KdColumnProps {
  kd: number
  showLabel?: boolean
  showProgress?: boolean
  className?: string
}

const getKdLevel = (kd: number): { label: string; color: string; bgColor: string } => {
  if (kd <= 14) return { label: "Very Easy", color: "text-emerald-600", bgColor: "bg-emerald-500" }
  if (kd <= 29) return { label: "Easy", color: "text-green-600", bgColor: "bg-green-500" }
  if (kd <= 49) return { label: "Moderate", color: "text-yellow-600", bgColor: "bg-yellow-500" }
  if (kd <= 69) return { label: "Difficult", color: "text-orange-600", bgColor: "bg-orange-500" }
  if (kd <= 84) return { label: "Hard", color: "text-red-500", bgColor: "bg-red-500" }
  return { label: "Very Hard", color: "text-red-700", bgColor: "bg-red-700" }
}

export function KdColumn({
  kd,
  showLabel = false,
  showProgress = true,
  className,
}: KdColumnProps) {
  const { label, color, bgColor } = getKdLevel(kd)

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className={cn("flex items-center gap-2 min-w-[60px]", className)}>
          <span className={cn("font-medium tabular-nums", color)}>{kd}</span>
          {showProgress && (
            <Progress
              value={kd}
              className="h-1.5 w-12"
              // @ts-expect-error - Custom color prop
              indicatorClassName={bgColor}
            />
          )}
          {showLabel && (
            <span className={cn("text-xs", color)}>{label}</span>
          )}
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <p>Keyword Difficulty: {kd}%</p>
        <p className="text-muted-foreground">{label}</p>
      </TooltipContent>
    </Tooltip>
  )
}
