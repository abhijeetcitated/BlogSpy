"use client"

import { cn } from "@/lib/utils"
import {
  type RTVOpportunityLevel,
  getRTVColor,
  getRTVBgColor,
  formatVolume,
} from "@/types/rtv.types"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Activity } from "lucide-react"

// ============================================
// RTV BADGE
// ============================================
// Compact badge showing RTV with comparison to raw volume

interface RTVBadgeProps {
  rtv: number
  rawVolume: number
  opportunityLevel: RTVOpportunityLevel
  showComparison?: boolean
  size?: "sm" | "md" | "lg"
  className?: string
}

export function RTVBadge({
  rtv,
  rawVolume,
  opportunityLevel,
  showComparison = true,
  size = "md",
  className,
}: RTVBadgeProps) {
  const percentage = Math.round((rtv / rawVolume) * 100)
  
  const sizeClasses = {
    sm: "text-xs px-1.5 py-0.5 gap-1",
    md: "text-xs px-2 py-1 gap-1.5",
    lg: "text-sm px-2.5 py-1.5 gap-2",
  }

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className={cn(
              "inline-flex items-center rounded-md border font-medium cursor-default",
              sizeClasses[size],
              getRTVBgColor(opportunityLevel),
              className
            )}
          >
            <Activity className={cn("shrink-0", size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5", getRTVColor(opportunityLevel))} />
            <span className={getRTVColor(opportunityLevel)}>{formatVolume(rtv)}</span>
            {showComparison && (
              <span className="text-muted-foreground text-[10px]">
                ({percentage}%)
              </span>
            )}
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs p-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-medium">Realizable Traffic Volume</span>
            </div>
            <div className="text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Raw Volume:</span>
                <span>{rawVolume.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">RTV:</span>
                <span className={getRTVColor(opportunityLevel)}>{rtv.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">SERP Feature Loss:</span>
                <span className="text-red-400">-{(rawVolume - rtv).toLocaleString()}</span>
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground border-t border-border pt-2">
              RTV accounts for CTR stolen by AI Overview, Featured Snippets, Ads, etc.
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
