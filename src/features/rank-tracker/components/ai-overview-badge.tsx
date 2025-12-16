// ============================================
// RANK TRACKER - AI Overview Badge Component
// ============================================

"use client"

import { Eye } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import type { AIOverviewStatus } from "../types"

interface AIOverviewBadgeProps {
  status: AIOverviewStatus
}

/**
 * Gets display label for AI Overview position
 */
function getPositionLabel(position: AIOverviewStatus["position"]): string {
  switch (position) {
    case "cited":
      return "Cited"
    case "mentioned":
      return "Mentioned"
    case "not_included":
      return "Not In AI"
  }
}

/**
 * Displays AI Overview status with tooltip
 */
export function AIOverviewBadge({ status }: AIOverviewBadgeProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              "inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium",
              status.position === "cited" && "bg-emerald-500/20 text-emerald-400",
              status.position === "mentioned" && "bg-amber-500/20 text-amber-400",
              status.position === "not_included" && "bg-red-500/20 text-red-400",
              !status.inOverview && "bg-muted/50 text-muted-foreground"
            )}
          >
            <Eye className="w-3 h-3" />
            {getPositionLabel(status.position)}
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs max-w-56">
          {status.position === "cited" && (
            <div>
              <p className="font-medium text-emerald-400">✓ Your site is cited!</p>
              {status.citationUrl && <p>URL: {status.citationUrl}</p>}
              {status.competitors.length > 0 && (
                <p className="mt-1 text-muted-foreground">
                  Also showing: {status.competitors.join(", ")}
                </p>
              )}
            </div>
          )}
          {status.position === "mentioned" && (
            <div>
              <p className="font-medium text-amber-400">Brand mentioned</p>
              {status.recommendation && (
                <p className="mt-1 text-muted-foreground">{status.recommendation}</p>
              )}
            </div>
          )}
          {status.position === "not_included" && (
            <div>
              <p className="font-medium text-red-400">Not in AI Overview</p>
              {status.competitors.length > 0 && (
                <p className="mt-1">Competitors shown: {status.competitors.join(", ")}</p>
              )}
              {status.recommendation && (
                <p className="mt-1 text-muted-foreground">{status.recommendation}</p>
              )}
            </div>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
