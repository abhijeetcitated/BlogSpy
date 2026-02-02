"use client"

import { cn } from "@/lib/utils"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react"

// ============================================
// AI OVERVIEW STATUS BADGE
// ============================================

export interface AIOverviewStatusBadgeProps {
  hasAIOverview: boolean
  isCited: boolean
  citationPosition?: number | null
  size?: "sm" | "md" | "lg"
  className?: string
}

const sizeClasses = {
  sm: "text-xs px-1.5 py-0.5 gap-1",
  md: "text-xs px-2 py-1 gap-1.5",
  lg: "text-sm px-3 py-1.5 gap-2",
}

export function AIOverviewStatusBadge({
  hasAIOverview,
  isCited,
  citationPosition,
  size = "md",
  className,
}: AIOverviewStatusBadgeProps) {
  if (!hasAIOverview) {
    return (
      <span className={cn(
        "inline-flex items-center rounded-full font-medium",
        "bg-slate-500/20 text-slate-400 border border-slate-500/30",
        sizeClasses[size],
        className
      )}>
        <XCircle className="h-3 w-3" />
        No AI Overview
      </span>
    )
  }

  if (isCited) {
    return (
      <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className={cn(
              "inline-flex items-center rounded-full font-medium",
              "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
              sizeClasses[size],
              className
            )}>
              <CheckCircle className="h-3 w-3" />
              Cited #{citationPosition}
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <p>Your content is cited at position #{citationPosition} in AI Overview</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={cn(
            "inline-flex items-center rounded-full font-medium",
            "bg-amber-500/20 text-amber-400 border border-amber-500/30",
            sizeClasses[size],
            className
          )}>
            <AlertTriangle className="h-3 w-3" />
            Not Cited
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <p>AI Overview exists but your content is not cited</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
