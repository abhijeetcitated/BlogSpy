"use client"

// ============================================
// REFRESH CREDITS HEADER - Column Header with Bulk Refresh
// ============================================
// Shows selected count and triggers bulk refresh.
// ============================================

import { useCallback } from "react"
import { Loader2, Zap } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

import { useKeywordStore } from "../../../../store"

interface RefreshCreditsHeaderProps {
  isGuest?: boolean
  isBulkRefreshing?: boolean
  onBulkRefresh?: (ids: number[]) => void
}

export function RefreshCreditsHeader({
  isGuest = false,
  isBulkRefreshing = false,
  onBulkRefresh,
}: RefreshCreditsHeaderProps) {
  const selectedIds = useKeywordStore((state) => state.selectedIds)
  const selectedCount = Object.keys(selectedIds).length

  const handleBulkRefresh = useCallback(() => {
    if (selectedCount === 0 || isBulkRefreshing) return

    if (isGuest) {
      toast.error("Sign up to bulk refresh", {
        description: "Bulk refresh uses credits and requires an account.",
        action: {
          label: "Sign Up Free",
          onClick: () => {
            window.location.href = "/register"
          },
        },
        duration: 5000,
      })
      return
    }

    const ids = Object.keys(selectedIds)
      .map((id) => Number(id))
      .filter((id) => Number.isFinite(id))
    onBulkRefresh?.(ids)
  }, [isBulkRefreshing, isGuest, onBulkRefresh, selectedCount, selectedIds])

  return (
    <div className="flex flex-col items-center gap-0.5">
      {selectedCount > 0 ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={handleBulkRefresh}
              disabled={isBulkRefreshing}
              className={cn(
                "inline-flex items-center gap-1.5 rounded px-2 py-1 text-xs font-semibold",
                "bg-[#FFD700] text-black hover:bg-[#FFC400] transition-colors",
                "disabled:opacity-60 disabled:cursor-not-allowed"
              )}
            >
              {isBulkRefreshing ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Zap className="h-3.5 w-3.5" />
              )}
              {`Scan ${selectedCount}`}
            </button>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p className="font-medium">
              Run Forensic Scan for {selectedCount} keywords ({selectedCount} Credits)
            </p>
          </TooltipContent>
        </Tooltip>
      ) : (
        <span className="cursor-default text-xs">Refresh</span>
      )}
    </div>
  )
}

export default RefreshCreditsHeader
