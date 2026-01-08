"use client"

// ============================================
// REFRESH COLUMN - Semrush-style freshness + refresh
// ============================================

import { useCallback, useMemo, useState } from "react"
import {
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  differenceInMonths,
  differenceInYears,
  parseISO,
} from "date-fns"
import { RefreshCw } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

import { refreshKeywordAction } from "../../../../actions/refresh-keyword"
import { useKeywordStore } from "../../../../store"
import type { Keyword } from "../../../../types"

interface RefreshColumnProps {
  keyword: string
  id: string
  lastUpdated?: string | Date | null
  className?: string
}

type FreshnessMeta = {
  className: string
  isStale: boolean
}

function formatRelativeTime(date: Date | null): string {
  if (!date) return "Never"

  const now = new Date()
  const minutes = Math.max(0, differenceInMinutes(now, date))
  if (minutes < 1) return "Just now"
  if (minutes < 60) return `${minutes}m ago`

  const hours = Math.max(0, differenceInHours(now, date))
  if (hours < 24) return `${hours}h ago`

  const days = Math.max(0, differenceInDays(now, date))
  if (days < 30) return `${days}d ago`

  const months = Math.max(0, differenceInMonths(now, date))
  if (months < 12) return `${months}mo ago`

  const years = Math.max(0, differenceInYears(now, date))
  return `${years}y ago`
}

function getFreshnessMeta(date: Date | null): FreshnessMeta {
  if (!date) {
    return { className: "text-muted-foreground", isStale: false }
  }

  const now = new Date()
  const hours = differenceInHours(now, date)
  const days = differenceInDays(now, date)

  if (hours < 24) {
    return { className: "text-emerald-500", isStale: false }
  }

  if (days <= 7) {
    return { className: "text-muted-foreground", isStale: false }
  }

  if (days > 30) {
    return { className: "text-orange-500", isStale: true }
  }

  return { className: "text-amber-500", isStale: false }
}

export function RefreshColumn({ keyword, id, lastUpdated, className }: RefreshColumnProps) {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const updateRow = useKeywordStore((state) => state.updateRow)
  const setCredits = useKeywordStore((state) => state.setCredits)
  const country = useKeywordStore((state) => state.search.country)
  const numericId = Number(id)
  const keywordRow = useKeywordStore((state) =>
    state.keywords.find((row) => row.id === numericId)
  )
  const rowRefreshing = keywordRow?.isRefreshing ?? false
  const refreshing = isRefreshing || rowRefreshing

  const lastUpdatedDate = useMemo(() => {
    if (!lastUpdated) return null
    if (lastUpdated instanceof Date) return Number.isNaN(lastUpdated.getTime()) ? null : lastUpdated
    const parsed = parseISO(lastUpdated)
    return Number.isNaN(parsed.getTime()) ? null : parsed
  }, [lastUpdated])

  const freshness = getFreshnessMeta(lastUpdatedDate)
  const timeAgoLabel = refreshing ? "Refreshing..." : formatRelativeTime(lastUpdatedDate)

  const handleRefresh = useCallback(async () => {
    if (refreshing) return

    setIsRefreshing(true)
    updateRow(id, { isRefreshing: true })

    try {
      const result = await refreshKeywordAction({
        keyword: keywordRow?.keyword ?? keyword,
        keywordId: Number.isFinite(numericId) ? numericId : undefined,
        country: country || "US",
        volume: keywordRow?.volume ?? 0,
        cpc: keywordRow?.cpc ?? 0,
        intent: keywordRow?.intent,
      })

      const payload = result?.data?.data
      const newBalance = result?.data?.newBalance
      if (!result?.data?.success || !payload) {
        throw new Error(result?.serverError || "Refresh failed")
      }

      updateRow(id, {
        weakSpots: payload.serpData.weakSpots,
        weakSpot: payload.keyword.weakSpot,
        serpFeatures: payload.serpData.serpFeatures,
        geoScore: payload.keyword.geoScore ?? payload.serpData.geoScore,
        hasAio: payload.serpData.hasAio,
        rtv: payload.rtvData.rtv,
        rtvBreakdown: payload.rtvData.breakdown,
        lastUpdated: new Date(payload.lastUpdated),
        isRefreshing: false,
      } as Partial<Keyword>)

      if (typeof newBalance === "number") {
        setCredits(newBalance)
      }

      toast.success(`Refreshed "${keyword}"`, {
        description: "Data updated. 1 credit used.",
      })
    } catch (error) {
      updateRow(id, { isRefreshing: false })
      toast.error("Refresh failed", {
        description: error instanceof Error ? error.message : "Please try again.",
      })
    } finally {
      setIsRefreshing(false)
    }
  }, [country, id, keyword, keywordRow, numericId, refreshing, setCredits, updateRow])

  const timeLabel = (
    <span className={cn("text-[11px] font-medium tabular-nums", freshness.className)}>
      {timeAgoLabel}
    </span>
  )

  return (
    <div className={cn("flex items-center justify-end gap-2", className)}>
      {freshness.isStale ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <span>{timeLabel}</span>
          </TooltipTrigger>
          <TooltipContent side="top">Data Stale</TooltipContent>
        </Tooltip>
      ) : (
        timeLabel
      )}

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={cn("h-3.5 w-3.5", refreshing && "animate-spin")} />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top">
          {refreshing ? "Refreshing..." : "Refresh keyword"}
        </TooltipContent>
      </Tooltip>
    </div>
  )
}

export default RefreshColumn
