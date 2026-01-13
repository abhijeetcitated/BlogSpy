"use client"

// ============================================
// REFRESH CREDITS HEADER - Column Header with Bulk Refresh
// ============================================
// Shows selected count and allows bulk refresh of selected keywords.
// ============================================

import { useMemo, useState, useCallback } from "react"
import { RefreshCw, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

import { useKeywordStore } from "../../../../store"
import { refreshKeywordAction, type RefreshKeywordResponse, type RefreshKeywordActionResult } from "../../../../actions/refresh-keyword"

interface RefreshCreditsHeaderProps {
  isGuest?: boolean
}

type BulkRefreshCounters = {
  successCount: number
  failCount: number
}

export function RefreshCreditsHeader({ isGuest = false }: RefreshCreditsHeaderProps) {
  const keywords = useKeywordStore((state) => state.keywords)
  const selectedIds = useKeywordStore((state) => state.selectedIds)
  const updateKeyword = useKeywordStore((state) => state.updateKeyword)
  const setCredits = useKeywordStore((state) => state.setCredits)
  const country = useKeywordStore((state) => state.search.country)

  const selectedKeywords = useMemo(() => keywords.filter((k) => selectedIds.has(k.id)), [keywords, selectedIds])
  const selectedCount = selectedKeywords.length

  const [isBulkRefreshing, setIsBulkRefreshing] = useState(false)

  const handleBulkRefresh = useCallback(async () => {
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

    setIsBulkRefreshing(true)

    const counters: BulkRefreshCounters = { successCount: 0, failCount: 0 }
    let stoppedForInsufficientCredits = false

    toast.info(`Refreshing ${selectedCount} keywords...`, {
      description: "This may take a moment",
    })

    const isInsufficientCreditsError = (message: string | undefined): boolean => {
      if (!message) return false
      return message.toLowerCase().includes("insufficient")
    }

    // Process in small batches to avoid overwhelming the API
    for (let i = 0; i < selectedKeywords.length; i += 3) {
      if (stoppedForInsufficientCredits) break

      const batch = selectedKeywords.slice(i, i + 3)

      const results = await Promise.allSettled(
        batch.map(async (kw) => {
          const result: RefreshKeywordActionResult | RefreshKeywordResponse = await refreshKeywordAction({
            keyword: kw.keyword,
            keywordId: kw.id,
            country: country || "US",
            volume: kw.volume,
            cpc: kw.cpc,
            intent: kw.intent,
          })

          return { kw, result }
        })
      )

      for (const settled of results) {
        if (settled.status === "rejected") {
          counters.failCount += 1
          // If we got a thrown Error, inspect message for insufficient credits.
          const reason = settled.reason
          const msg = reason instanceof Error ? reason.message : String(reason)
          if (isInsufficientCreditsError(msg)) {
            stoppedForInsufficientCredits = true
            break
          }
          continue
        }

        const { kw, result } = settled.value

        const serverError =
          typeof result === "object" &&
          result !== null &&
          "serverError" in result &&
          typeof (result as { serverError?: unknown }).serverError === "string"
            ? (result as { serverError: string }).serverError
            : undefined

        const actionPayload: unknown =
          typeof result === "object" && result !== null && "data" in result
            ? (result as { data?: unknown }).data
            : result

        // Structured API error path (refund-on-failure)
        if (
          actionPayload &&
          typeof actionPayload === "object" &&
          "error" in actionPayload &&
          (actionPayload as { error?: unknown }).error === "API_ERROR"
        ) {
          counters.failCount += 1
          continue
        }

        if (!actionPayload || typeof actionPayload !== "object") {
          counters.failCount += 1
          if (isInsufficientCreditsError(serverError)) {
            stoppedForInsufficientCredits = true
            break
          }
          continue
        }

        if (!("success" in actionPayload) || (actionPayload as { success?: unknown }).success !== true) {
          counters.failCount += 1
          if (isInsufficientCreditsError(serverError)) {
            stoppedForInsufficientCredits = true
            break
          }
          continue
        }

        const actionData = actionPayload as Extract<RefreshKeywordResponse, { success: true }>
        const payload = actionData.data
        const newBalance = actionData.newBalance

        counters.successCount += 1

        updateKeyword(kw.id, {
          weakSpots: payload.serpData.weakSpots,
          weakSpot: payload.keyword.weakSpot,
          serpFeatures: payload.serpData.serpFeatures,
          geoScore: payload.keyword.geoScore ?? payload.serpData.geoScore,
          hasAio: payload.serpData.hasAio,
          rtv: payload.rtvData.rtv,
          rtvBreakdown: payload.rtvData.breakdown,
          lastUpdated: new Date(payload.lastUpdated),
        })

        if (typeof newBalance === "number") {
          setCredits(newBalance)
        }
      }
    }

    setIsBulkRefreshing(false)

    if (stoppedForInsufficientCredits) {
      toast.error("Process stopped. Insufficient credits.")
      return
    }

    if (counters.successCount > 0) {
      toast.success(`Refreshed ${counters.successCount} keywords`, {
        description: counters.failCount > 0 ? `${counters.failCount} failed` : "All keywords updated",
      })
      return
    }

    toast.error("Bulk refresh failed", {
      description: "Please try again later",
    })
  }, [country, isBulkRefreshing, isGuest, selectedCount, selectedKeywords, setCredits, updateKeyword])

  return (
    <div className="flex flex-col items-center gap-0.5">
      {selectedCount > 0 ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={handleBulkRefresh}
              disabled={isBulkRefreshing}
              className={cn(
                "inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium",
                "bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 transition-colors",
                "cursor-pointer disabled:cursor-not-allowed",
                isBulkRefreshing && "opacity-50 cursor-wait"
              )}
            >
              {isBulkRefreshing ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
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
