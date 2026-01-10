"use client"

// ============================================
// REFRESH CREDITS HEADER - Column Header with Bulk Refresh
// ============================================
// Allows bulk refresh of selected keywords
// ============================================

import { useState, useCallback } from "react"
import { RefreshCw, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import { useKeywordStore } from "../../../../store"
import { refreshKeywordAction } from "../../../../actions/refresh-keyword"

// ============================================
// COMPONENT
// ============================================

interface RefreshCreditsHeaderProps {
  selectedCount?: number
}

export function RefreshCreditsHeader({ selectedCount: selectedCountProp }: RefreshCreditsHeaderProps) {
  // Zustand store
  const keywords = useKeywordStore((state) => state.keywords)
  const selectedIds = useKeywordStore((state) => state.selectedIds)
  const updateKeyword = useKeywordStore((state) => state.updateKeyword)
  const setCredits = useKeywordStore((state) => state.setCredits)

  // Use prop if provided, otherwise derive from store
  const selectedCount = selectedCountProp ?? selectedIds.size
  const [isBulkRefreshing, setIsBulkRefreshing] = useState(false)

  // Handle bulk refresh
  const handleBulkRefresh = useCallback(async () => {
    if (selectedCount === 0) return
    
    const selectedKeywords = keywords.filter((k) => selectedIds.has(k.id))

    setIsBulkRefreshing(true)
    let successCount = 0
    let failCount = 0

    toast.info(`Refreshing ${selectedKeywords.length} keywords...`, {
      description: "This may take a moment",
    })

    // Process in batches of 3 to avoid overwhelming the API
    for (let i = 0; i < selectedKeywords.length; i += 3) {
      const batch = selectedKeywords.slice(i, i + 3)
      
      await Promise.all(
        batch.map(async (kw) => {
          try {
            const result = await refreshKeywordAction({
              keyword: kw.keyword,
              country: "US",
            })

            if (result?.data?.success) {
              successCount++
              const data = result.data.data
              const newBalance = result.data.newBalance
              updateKeyword(kw.id, {
                weakSpots: data.serpData.weakSpots,
                serpFeatures: data.serpData.serpFeatures,
                geoScore: data.keyword.geoScore,
                hasAio: data.serpData.hasAio,
                lastUpdated: new Date(data.lastUpdated),
              })
              if (typeof newBalance === "number") {
                setCredits(newBalance)
              }
            } else {
              failCount++
            }
          } catch {
            failCount++
          }
        })
      )
    }

    setIsBulkRefreshing(false)

    if (successCount > 0) {
      toast.success(`Refreshed ${successCount} keywords`, {
        description: failCount > 0 ? `${failCount} failed` : "All keywords updated",
      })
    } else {
      toast.error("Bulk refresh failed", {
        description: "Please try again later",
      })
    }
  }, [selectedCount, keywords, selectedIds, updateKeyword])

  return (
    <div className="flex flex-col items-center gap-0.5">
      {/* Header Label with Bulk Refresh */}
      {selectedCount > 0 ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={handleBulkRefresh}
              disabled={isBulkRefreshing}
              className={cn(
                "inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium",
                "bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 transition-colors",
                isBulkRefreshing && "opacity-50 cursor-wait"
              )}
            >
              {isBulkRefreshing ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <RefreshCw className="h-3 w-3" />
              )}
              <span>{selectedCount}</span>
            </button>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p className="font-medium">Refresh {selectedCount} selected keywords</p>
            <p className="text-xs text-muted-foreground">Uses {selectedCount} credits</p>
          </TooltipContent>
        </Tooltip>
      ) : (
        <span className="cursor-default text-xs">Refresh</span>
      )}
    </div>
  )
}

export default RefreshCreditsHeader
