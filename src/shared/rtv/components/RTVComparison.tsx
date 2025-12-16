"use client"

import { cn } from "@/lib/utils"
import {
  type RTVOpportunityLevel,
  getRTVColor,
  formatVolume,
} from "@/types/rtv.types"
import { ArrowRight } from "lucide-react"

// ============================================
// RTV COMPARISON
// ============================================
// Shows raw volume vs RTV side by side

interface RTVComparisonProps {
  rtv: number
  rawVolume: number
  opportunityLevel: RTVOpportunityLevel
  className?: string
}

export function RTVComparison({
  rtv,
  rawVolume,
  opportunityLevel,
  className,
}: RTVComparisonProps) {
  const loss = rawVolume - rtv

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className="text-muted-foreground font-mono text-sm">
        {formatVolume(rawVolume)}
      </span>
      <ArrowRight className="h-3 w-3 text-muted-foreground" />
      <span className={cn("font-mono text-sm font-bold", getRTVColor(opportunityLevel))}>
        {formatVolume(rtv)}
      </span>
      <span className="text-xs text-red-400">
        (-{formatVolume(loss)})
      </span>
    </div>
  )
}
