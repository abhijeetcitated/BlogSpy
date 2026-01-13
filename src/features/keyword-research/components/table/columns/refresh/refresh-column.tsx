"use client"

// ============================================
// REFRESH COLUMN - Semrush-style freshness + refresh
// ============================================

import { useCallback, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
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

import {
  refreshKeywordAction,
  type RefreshKeywordResponse,
  type RefreshKeywordActionResult,
} from "../../../../actions/refresh-keyword"
import { useKeywordStore } from "../../../../store"
import type { Keyword } from "../../../../types"

interface RefreshColumnProps {
  keyword: string
  id: string
  lastUpdated?: string | Date | null
  className?: string
  isGuest?: boolean
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

export function RefreshColumn({ keyword, id, lastUpdated, className, isGuest = false }: RefreshColumnProps) {
  const router = useRouter()
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

    if (isGuest) {
      toast.error("Sign up to refresh keywords", {
        description: "Demo mode shows sample data. Create a free account to refresh live SERP + RTV.",
        action: {
          label: "Sign Up Free",
          onClick: () => router.push("/register"),
        },
        duration: 5000,
      })
      return
    }

    setIsRefreshing(true)
    updateRow(id, { isRefreshing: true })

    try {
      const rawResult: RefreshKeywordActionResult | RefreshKeywordResponse = await refreshKeywordAction({
        keyword: keywordRow?.keyword ?? keyword,
        keywordId: Number.isFinite(numericId) ? numericId : undefined,
        country: country || "US",
        volume: keywordRow?.volume ?? 0,
        cpc: keywordRow?.cpc ?? 0,
        intent: keywordRow?.intent,
      })

      const serverError =
        typeof rawResult === "object" &&
        rawResult !== null &&
        "serverError" in rawResult &&
        typeof (rawResult as { serverError?: unknown }).serverError === "string"
          ? (rawResult as { serverError: string }).serverError
          : undefined

      // next-safe-action returns { data?: RefreshKeywordResponse }, but some call sites
      // may pass through RefreshKeywordResponse directly. Support both shapes.
      const actionPayload: unknown =
        typeof rawResult === "object" && rawResult !== null && "data" in rawResult
          ? (rawResult as { data?: unknown }).data
          : rawResult

      if (!actionPayload || typeof actionPayload !== "object") {
        throw new Error(serverError || "Refresh failed")
      }

      // Structured error path (refund-on-failure hardening)
      if (
        "error" in actionPayload &&
        (actionPayload as { error?: unknown }).error === "API_ERROR" &&
        (actionPayload as { refunded?: unknown }).refunded === true
      ) {
        throw new Error("API error. Credit refunded.")
      }

      // Success path
      if (!("success" in actionPayload) || (actionPayload as { success?: unknown }).success !== true) {
        throw new Error(serverError || "Refresh failed")
      }

      const actionData = actionPayload as Extract<RefreshKeywordResponse, { success: true }>
      const payload = actionData.data
      const newBalance = actionData.newBalance

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
  }, [country, id, isGuest, keyword, keywordRow, numericId, refreshing, router, setCredits, updateRow])

  const timeLabel = (
    <span
      className={cn(
        "max-w-[120px] truncate text-right text-[11px] font-medium tabular-nums",
        freshness.className
      )}
      title={timeAgoLabel}
    >
      {timeAgoLabel}
    </span>
  )

  return (
    <div className={cn("flex min-w-0 items-center justify-end gap-2 whitespace-nowrap", className)}>
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
            className="h-7 w-7 cursor-pointer disabled:cursor-not-allowed"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={cn("h-3.5 w-3.5 text-gray-500", refreshing && "animate-spin")} />
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
