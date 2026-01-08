"use client"

// ============================================
// REFRESH CELL - Table Column Component
// ============================================
// Shows data freshness with refresh capability
// Handles loading states and optimistic updates
// ============================================

import { useState, useCallback } from "react"
import { RefreshCw, Check, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import { refreshKeywordAction } from "../../../../actions/refresh-keyword"
import { useKeywordStore } from "../../../../store"
import { getFreshnessColor, timeAgo } from "@/src/utils/date-utils"
import type { Keyword } from "../../../../types"

// ============================================
// TYPES
// ============================================

interface RefreshCellProps {
  keywordId: string
  keyword: string
  lastUpdated: string | Date | null | undefined
  country?: string
  intent?: Keyword["intent"]
}

type RefreshState = "idle" | "loading" | "success" | "error"

// ============================================
// COMPONENT
// ============================================

export function RefreshCell({
  keywordId,
  keyword,
  lastUpdated,
  country = "US",
  intent,
}: RefreshCellProps) {
  const [state, setState] = useState<RefreshState>("idle")
  
  // Zustand store for optimistic updates
  const updateRow = useKeywordStore((state) => state.updateRow)
  const setCredits = useKeywordStore((state) => state.setCredits)
  const numericId = Number(keywordId)
  const keywordRow = useKeywordStore((state) =>
    state.keywords.find((row) => row.id === numericId)
  )

  // Format date for display
  const dateString = lastUpdated 
    ? (typeof lastUpdated === "string" ? lastUpdated : lastUpdated.toISOString())
    : null
  
  const freshnessColor = getFreshnessColor(dateString)
  const timeAgoText = timeAgo(dateString)

  // Handle refresh click
  const handleRefresh = useCallback(async () => {
    if (state === "loading") return

    setState("loading")

    try {
      const result = await refreshKeywordAction({
        keyword: keywordRow?.keyword ?? keyword,
        keywordId: Number.isFinite(numericId) ? numericId : undefined,
        country,
        volume: keywordRow?.volume ?? 0,
        cpc: keywordRow?.cpc ?? 0,
        intent: keywordRow?.intent ?? intent,
      })

      if (result?.data?.success) {
        setState("success")
        
        // Optimistic UI update - use new response structure
        const data = result.data.data
        const newBalance = result.data.newBalance
        updateRow(keywordId, {
          weakSpots: data.serpData.weakSpots,
          weakSpot: data.keyword.weakSpot,
          serpFeatures: data.serpData.serpFeatures,
          geoScore: data.keyword.geoScore ?? data.serpData.geoScore,
          hasAio: data.serpData.hasAio,
          rtv: data.rtvData.rtv,
          rtvBreakdown: data.rtvData.breakdown,
          lastUpdated: new Date(data.lastUpdated),
        })

        if (typeof newBalance === "number") {
          setCredits(newBalance)
        }

        toast.success(`Refreshed "${keyword}"`, {
          description: "Data updated successfully. 1 credit used.",
        })

        // Reset to idle after showing success
        setTimeout(() => setState("idle"), 2000)
      } else {
        setState("error")
        toast.error("Refresh failed", {
          description: "Please try again",
        })
        setTimeout(() => setState("idle"), 2000)
      }
    } catch (error) {
      console.error("[RefreshCell] Error:", error)
      setState("error")
      toast.error("Refresh Failed")
      setTimeout(() => setState("idle"), 2000)
    }
  }, [country, intent, keyword, keywordId, keywordRow, numericId, setCredits, state, updateRow])

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={handleRefresh}
          disabled={state === "loading"}
          className={cn(
            "flex flex-col items-center gap-0.5 px-2 py-1 rounded-md transition-all",
            "hover:bg-muted/50 focus:outline-none focus:ring-1 focus:ring-primary/50",
            state === "loading" && "cursor-wait",
            state === "success" && "bg-emerald-500/10",
            state === "error" && "bg-red-500/10"
          )}
        >
          {/* Icon */}
          <div className="flex items-center justify-center h-5 w-5">
            {state === "loading" && (
              <RefreshCw className="h-4 w-4 text-amber-500 animate-spin" />
            )}
            {state === "success" && (
              <Check className="h-4 w-4 text-emerald-500 animate-in zoom-in duration-200" />
            )}
            {state === "error" && (
              <AlertCircle className="h-4 w-4 text-red-500 animate-in zoom-in duration-200" />
            )}
            {state === "idle" && (
              <RefreshCw className={cn("h-3.5 w-3.5", freshnessColor)} />
            )}
          </div>

          {/* Time ago text */}
          <span className={cn(
            "text-[10px] font-medium transition-colors",
            state === "success" ? "text-emerald-500" : freshnessColor
          )}>
            {state === "loading" ? "..." : 
             state === "success" ? "Done!" :
             state === "error" ? "Failed" :
             timeAgoText}
          </span>
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-[200px]">
        <div className="text-xs space-y-1">
          <p className="font-medium">
            Data updated {timeAgoText}
          </p>
          <p className="text-muted-foreground">
            Click to refresh for ⚡ 1 Credit
          </p>
        </div>
      </TooltipContent>
    </Tooltip>
  )
}

export default RefreshCell
