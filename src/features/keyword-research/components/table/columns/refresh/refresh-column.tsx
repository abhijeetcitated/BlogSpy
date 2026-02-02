"use client"

// ============================================
// REFRESH COLUMN - Semrush-style freshness + refresh
// ============================================

import { useCallback, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { useAction } from "next-safe-action/hooks"
import {
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  differenceInSeconds,
  formatDistanceToNow,
  parseISO,
} from "date-fns"
import { Loader2, RefreshCw } from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { formatUserDate } from "@/lib/utils/date-formatter"
import { useUIStore } from "@/store/ui-store"

import { refreshKeyword } from "../../../../actions/refresh-keyword"
import { useKeywordStore } from "../../../../store"
import type { Keyword } from "../../../../types"

interface RefreshColumnProps {
  keyword: string
  id: string
  lastUpdated?: string | Date | null
  lastRefreshedAt?: string | Date | null
  lastSerpUpdate?: string | Date | null
  className?: string
  isGuest?: boolean
}

type FreshnessMeta = {
  className: string
  isStale: boolean
}

const COOLDOWN_WINDOW_MS = 5 * 60 * 1000
const SERP_REFRESH_TTL_MS = 7 * 24 * 60 * 60 * 1000

function formatRelativeTime(date: Date | null, now: Date): string {
  if (!date) return "Never"
  const seconds = Math.max(0, differenceInSeconds(now, date))
  if (seconds < 30) return "Just now"
  return formatDistanceToNow(date, { addSuffix: true })
}

function formatCooldown(ms: number): string {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000))
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  if (minutes === 0) return `${seconds}s`
  return `${minutes}m ${seconds}s`
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

export function RefreshColumn({
  keyword,
  id,
  lastUpdated,
  lastRefreshedAt,
  lastSerpUpdate,
  className,
  isGuest = false,
}: RefreshColumnProps) {
  const router = useRouter()
  const openPricingModal = useUIStore((state) => state.openPricingModal)
  const country = useKeywordStore((state) => state.search.country)
  const numericId = Number(id)
  const isMockMode =
    process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true" || process.env.NEXT_PUBLIC_USE_MOCK_DATA === "1"

  const keywordRow = useKeywordStore((state) =>
    state.keywords.find((row) => row.id === numericId)
  )

  const { executeAsync, status } = useAction(refreshKeyword)
  const isExecuting = status === "executing"
  const refreshing = isExecuting || keywordRow?.isRefreshing === true

  const [timeTick, setTimeTick] = useState(0)

  const rawLastRefreshedAt = keywordRow?.lastRefreshedAt ?? lastRefreshedAt ?? null
  const lastRefreshedDate = useMemo(() => {
    if (!rawLastRefreshedAt) return null
    if (rawLastRefreshedAt instanceof Date) {
      return Number.isNaN(rawLastRefreshedAt.getTime()) ? null : rawLastRefreshedAt
    }
    const parsed = parseISO(rawLastRefreshedAt)
    return Number.isNaN(parsed.getTime()) ? null : parsed
  }, [rawLastRefreshedAt])

  const rawLastUpdated = keywordRow?.lastUpdated ?? lastUpdated ?? null
  const lastUpdatedDate = useMemo(() => {
    if (!rawLastUpdated) return null
    if (rawLastUpdated instanceof Date) {
      return Number.isNaN(rawLastUpdated.getTime()) ? null : rawLastUpdated
    }
    const parsed = parseISO(rawLastUpdated)
    return Number.isNaN(parsed.getTime()) ? null : parsed
  }, [rawLastUpdated])

  const rawLastSerpUpdate = keywordRow?.lastSerpUpdate ?? lastSerpUpdate ?? null
  const lastSerpDate = useMemo(() => {
    if (!rawLastSerpUpdate) return null
    if (rawLastSerpUpdate instanceof Date) {
      return Number.isNaN(rawLastSerpUpdate.getTime()) ? null : rawLastSerpUpdate
    }
    const parsed = parseISO(rawLastSerpUpdate)
    return Number.isNaN(parsed.getTime()) ? null : parsed
  }, [rawLastSerpUpdate])

  const displayDate = lastSerpDate ?? lastRefreshedDate ?? lastUpdatedDate

  useEffect(() => {
    if (!displayDate) return undefined
    const interval = setInterval(() => setTimeTick((value) => value + 1), 10_000)
    return () => clearInterval(interval)
  }, [displayDate])

  const now = useMemo(() => new Date(), [timeTick])
  const formattedDisplayDate = formatUserDate(displayDate ?? new Date(0))
  const formattedSerpDate = formatUserDate(lastSerpDate ?? new Date(0))

  const serpAgeMs = useMemo(() => {
    if (!lastSerpDate) return null
    return now.getTime() - lastSerpDate.getTime()
  }, [lastSerpDate, now])

  const serpAgeMinutes = serpAgeMs === null ? null : serpAgeMs / 60000
  const serpAgeHours = serpAgeMs === null ? null : serpAgeMs / 3600000
  const serpAgeDays = serpAgeMs === null ? null : serpAgeMs / 86400000

  const serpPhase = useMemo(() => {
    if (!lastSerpDate) return "stale"
    if (serpAgeMinutes !== null && serpAgeMinutes < 5) return "just"
    if (serpAgeHours !== null && serpAgeHours < 48) return "verified"
    if (serpAgeDays !== null && serpAgeDays < 7) return "aging"
    return "stale"
  }, [lastSerpDate, serpAgeMinutes, serpAgeHours, serpAgeDays])

  const isSerpStale = serpPhase === "stale"

  const cooldownRemainingMs = useMemo(() => {
    if (!lastSerpDate) return 0
    const elapsed = now.getTime() - lastSerpDate.getTime()
    return Math.max(0, COOLDOWN_WINDOW_MS - elapsed)
  }, [lastSerpDate, now])

  const isCoolingDown = serpPhase === "just"

  const timeAgoLabel = refreshing ? "Refreshing..." : formatRelativeTime(displayDate, now)
  const refreshTooltipLabel = refreshing
    ? "Refreshing..."
    : isCoolingDown
      ? `Available in ${formatCooldown(cooldownRemainingMs)}`
      : isSerpStale
        ? "Run forensic scan"
        : "Refresh keyword"
  const lastUpdatedTooltip = lastSerpDate
    ? `Last verified: ${formattedSerpDate} (${formatRelativeTime(lastSerpDate, now)})`
    : displayDate
      ? `Last refreshed: ${formattedDisplayDate}`
      : "Not verified yet"

  const handleRefresh = useCallback(async () => {
    if (refreshing || isCoolingDown) return

    if (!Number.isFinite(numericId)) {
      toast.error("Refresh failed", { description: "Invalid keyword id." })
      return
    }

    if (isGuest && !isMockMode) {
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

    const keywordText = keywordRow?.keyword ?? keyword
    const updateKeyword = useKeywordStore.getState().updateKeyword
    const setCredits = useKeywordStore.getState().setCredits
    const currentBalance = useKeywordStore.getState().credits
    const idempotencyKey = crypto.randomUUID()
    console.log("[CLIENT] Generated Key:", idempotencyKey)

    updateKeyword(numericId, { isRefreshing: true })

    let keepRefreshing = false

    try {
      const result = await executeAsync({
        keywordId: numericId,
        keyword: keywordText,
        country: country || "US",
        idempotency_key: idempotencyKey,
        current_balance: typeof currentBalance === "number" ? currentBalance : undefined,
      })

      const serverError = typeof result?.serverError === "string" ? result.serverError : undefined
      if (serverError) {
        if (serverError.includes("COOLDOWN_ACTIVE")) {
          updateKeyword(numericId, { lastRefreshedAt: new Date(), isRefreshing: false })
          return
        }
        if (serverError.includes("INSUFFICIENT_CREDITS")) {
          openPricingModal()
          toast.error("Insufficient credits", { description: "Upgrade to refresh keywords." })
          router.push("/pricing")
          return
        }
        toast.error("Refresh failed", { description: serverError })
        updateKeyword(numericId, { isRefreshing: false })
        return
      }

      const validationMessage = result?.validationErrors?.keyword?._errors?.[0]
      if (validationMessage) {
        toast.error(validationMessage)
        updateKeyword(numericId, { isRefreshing: false })
        return
      }

      if (!result?.data || result.data.success !== true) {
        toast.error("Refresh failed", { description: "Please try again." })
        updateKeyword(numericId, { isRefreshing: false })
        return
      }

      const updated = result.data.data
      const balance = result.data.balance
      const serpStatus =
        updated.serpStatus ??
        (result.data.status === "pending" ? "pending" : result.data.status === "completed" ? "completed" : undefined)
      const isPending = serpStatus === "pending"
      const lastRefreshedAt = updated.lastRefreshedAt ?? result.data.lastRefreshedAt ?? null
      const parsedLastRefreshedAt =
        lastRefreshedAt instanceof Date
          ? lastRefreshedAt
          : typeof lastRefreshedAt === "string"
            ? new Date(lastRefreshedAt)
            : null

      updateKeyword(numericId, {
        ...updated,
        lastUpdated: updated.lastUpdated ? new Date(updated.lastUpdated) : new Date(),
        lastRefreshedAt: parsedLastRefreshedAt,
        serpStatus,
        isRefreshing: isPending,
      } as Partial<Keyword>)

      keepRefreshing = isPending

      if (typeof balance === "number") {
        setCredits(balance)
      }

      toast.success("Keyword data refreshed")
    } catch (error) {
      console.warn("[KeywordRefresh] ERROR:", error)
      const message = error instanceof Error ? error.message : "Please try again."
      toast.error("Refresh failed", { description: message })
    } finally {
      if (!keepRefreshing) {
        updateKeyword(numericId, { isRefreshing: false })
      }
    }
  }, [
    country,
    executeAsync,
    isCoolingDown,
    isGuest,
    isMockMode,
    keyword,
    keywordRow,
    numericId,
    openPricingModal,
    refreshing,
    router,
  ])

  const badgeLabel = useMemo(() => {
    if (!lastSerpDate || serpPhase === "stale") return "Forensic Scan Needed"
    if (serpPhase === "verified" || serpPhase === "just") return "Verified Scanned"
    if (serpPhase === "aging" && serpAgeDays !== null) {
      const dayCount = Math.max(1, Math.floor(serpAgeDays))
      return `${dayCount} days ago`
    }
    return "Verified Scanned"
  }, [lastSerpDate, serpPhase, serpAgeDays])

  const badgeClass = cn(
    "text-[10px] font-semibold border px-2 py-0.5 rounded-full",
    serpPhase === "verified" || serpPhase === "just"
      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-500"
      : serpPhase === "aging"
        ? "border-border bg-muted/40 text-muted-foreground"
        : "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400"
  )

  const isDisabled = refreshing || isCoolingDown
  const refreshIconClass = cn(
    "h-4 w-4 transition-colors",
    isSerpStale
      ? "text-[#B8860B] dark:text-[#FFD700]"
      : "text-muted-foreground/70",
    isDisabled && "text-muted-foreground/40"
  )

  return (
    <div className={cn("flex min-w-0 items-center justify-end gap-2 whitespace-nowrap", className)}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isDisabled}
            className={cn(
              "inline-flex items-center gap-2 rounded-full transition-colors",
              "disabled:cursor-not-allowed"
            )}
          >
            <Badge className={badgeClass}>{badgeLabel}</Badge>
            {refreshing ? (
              <Loader2 className={cn(refreshIconClass, "animate-spin")} />
            ) : (
              <RefreshCw className={refreshIconClass} />
            )}
          </button>
        </TooltipTrigger>
        <TooltipContent side="top">
          <p className="font-medium">{refreshTooltipLabel}</p>
          <p className="text-xs text-muted-foreground">{lastUpdatedTooltip}</p>
        </TooltipContent>
      </Tooltip>
    </div>
  )
}

export default RefreshColumn
