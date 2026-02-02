"use client"

import {
  type Column,
  type ColumnDef,
  type Table,
  createColumnHelper,
} from "@tanstack/react-table"
import type { MouseEvent } from "react"
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ArrowUpRight,
  Bot,
  FileText,
  HelpCircle,
  ImageIcon,
  Loader2,
  MapPin,
  Megaphone,
  Newspaper,
  ShoppingCart,
  Star,
  Video,
  Zap,
} from "lucide-react"
import { useAction } from "next-safe-action/hooks"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { KDRing } from "@/components/charts"
import { useUIStore } from "@/store/ui-store"

import { INTENT_CONFIG } from "../../../constants/table-config"
import type { Keyword } from "../../../types"
import { useKeywordStore } from "../../../store"
import {
  getIntentSortValue,
  getNumericSortValue,
  getWeakSpotSortValue,
} from "../../../utils/sort-utils"
import { WeakSpotColumn } from "./weak-spot/weak-spot-column"
import { RefreshColumn } from "./refresh"
import { RefreshCreditsHeader } from "./refresh/RefreshCreditsHeader"
import { TrendSparkline } from "./TrendSparkline"
import { refreshKeyword } from "../../../actions/refresh-keyword"

const columnHelper = createColumnHelper<Keyword>()

function RowSelectionCheckbox({ id, label }: { id: number; label: string }) {
  const selectedIds = useKeywordStore((state) => state.selectedIds)
  const toggleSelection = useKeywordStore((state) => state.toggleSelection)

  const key = String(id)
  const isChecked = Boolean(selectedIds[key])

  return (
    <div className="flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
      <Checkbox
        checked={isChecked}
        onCheckedChange={() => {
          if (!key) return
          toggleSelection(key)
        }}
        aria-label={label}
      />
    </div>
  )
}

function HeaderSelectionCheckbox({ table }: { table: Table<Keyword> }) {
  const selectedIds = useKeywordStore((state) => state.selectedIds)
  const pagination = useKeywordStore((state) => state.pagination)
  const selectVisible = useKeywordStore((state) => state.selectVisible)
  const toggleSelection = useKeywordStore((state) => state.toggleSelection)

  const sortedRows = table.getSortedRowModel().rows
  const start = pagination.pageIndex * pagination.pageSize
  const end = start + pagination.pageSize
  const pageRowIds = sortedRows
    .slice(start, end)
    .map((row) => Number(row.original.id))
    .filter((id) => Number.isFinite(id))

  const allSelected =
    pageRowIds.length > 0 && pageRowIds.every((id) => selectedIds[String(id)])
  const someSelected = pageRowIds.some((id) => selectedIds[String(id)])

  return (
    <div className="flex items-center justify-center">
      <Checkbox
        checked={allSelected || (someSelected && "indeterminate")}
        onCheckedChange={(value) => {
          if (!pageRowIds.length) return
          if (value) {
            selectVisible(pageRowIds.map((id) => String(id)))
          } else {
            pageRowIds.forEach((id) => {
              const key = String(id)
              if (selectedIds[key]) {
                toggleSelection(key)
              }
            })
          }
        }}
        aria-label="Select page"
      />
    </div>
  )
}

function ForensicScanInline({ id, keyword }: { id: number; keyword: string }) {
  const country = useKeywordStore((state) => state.search.country)
  const updateKeyword = useKeywordStore((state) => state.updateKeyword)
  const setCredits = useKeywordStore((state) => state.setCredits)
  const currentBalance = useKeywordStore((state) => state.credits)
  const openPricingModal = useUIStore((state) => state.openPricingModal)
  const { executeAsync, status } = useAction(refreshKeyword)
  const isExecuting = status === "executing"

  const handleClick = async (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()
    if (!Number.isFinite(id) || isExecuting) return

    const idempotencyKey = crypto.randomUUID()
    console.log("[CLIENT] Generated Key:", idempotencyKey)

    updateKeyword(id, { isRefreshing: true })

    try {
      const result = await executeAsync({
        keywordId: id,
        keyword,
        country: country || "US",
        idempotency_key: idempotencyKey,
        current_balance: typeof currentBalance === "number" ? currentBalance : undefined,
      })

      const serverError = typeof result?.serverError === "string" ? result.serverError : undefined
      if (serverError) {
        if (serverError.includes("COOLDOWN_ACTIVE")) {
          updateKeyword(id, { lastRefreshedAt: new Date(), isRefreshing: false })
          return
        }
        if (serverError.includes("INSUFFICIENT_CREDITS")) {
          openPricingModal()
          toast.error("Insufficient credits", { description: "Upgrade to run a forensic scan." })
          return
        }
        throw new Error(serverError)
      }

      if (!result?.data || result.data.success !== true) {
        throw new Error("Refresh failed")
      }

      const updated = result.data.data
      const balance = result.data.balance
      const lastRefreshedAt = updated.lastRefreshedAt ?? result.data.lastRefreshedAt ?? null
      const parsedLastRefreshedAt =
        lastRefreshedAt instanceof Date
          ? lastRefreshedAt
          : typeof lastRefreshedAt === "string"
            ? new Date(lastRefreshedAt)
            : null

      updateKeyword(id, {
        ...updated,
        lastUpdated: updated.lastUpdated ? new Date(updated.lastUpdated) : new Date(),
        lastRefreshedAt: parsedLastRefreshedAt,
        isRefreshing: false,
      } as Partial<Keyword>)

      if (typeof balance === "number") {
        setCredits(balance)
      }

      toast.success("Forensic scan complete")
    } catch (error) {
      console.error("[ForensicScan] ERROR:", error)
      const message = error instanceof Error ? error.message : "Please try again."
      toast.error("Scan failed", { description: message })
    } finally {
      updateKeyword(id, { isRefreshing: false })
    }
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="h-7 px-2 text-xs text-amber-400 hover:text-amber-300 hover:bg-amber-400/10"
      onClick={handleClick}
      disabled={isExecuting}
    >
      {isExecuting ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <Zap className="h-3.5 w-3.5" />
      )}
      <span className="ml-1">Forensic Scan</span>
    </Button>
  )
}

const EDUCATIONAL_TOOLTIPS: Record<
  "volume" | "trend" | "kd" | "cpc" | "weakSpots" | "geoScore",
  string
> = {
  volume: "Average monthly search volume over the last 12 months.",
  trend: "Search interest trend over the last 12 months.",
  kd: "Keyword Difficulty (0-100). Higher means harder to rank.",
  cpc: "Cost Per Click. Estimated price advertisers pay for this keyword.",
  weakSpots:
    "Community Forums (Reddit/Quora) or Visuals (Pinterest) ranking in the Top 10. Indicates specific SEO opportunities.",
  geoScore: "Generative Engine Optimization Score. Visibility in AI Overviews.",
}

function TableColumnHeader({
  label,
  tooltip,
  column,
  align = "center",
  minWidthClassName,
}: {
  label: string
  tooltip?: string
  column?: Column<Keyword, unknown>
  align?: "center" | "right"
  minWidthClassName?: string
}) {
  const sorted = column?.getIsSorted()

  const sortIcon = !column
    ? null
    : sorted === "asc"
      ? <ArrowUp className="h-3 w-3" />
      : sorted === "desc"
        ? <ArrowDown className="h-3 w-3" />
        : <ArrowUpDown className="h-3 w-3 opacity-50" />

  const headerButton = (
    <button
      type="button"
      onClick={column ? column.getToggleSortingHandler() : undefined}
      className={cn(
        "group relative flex w-full items-center",
        align === "center" ? "justify-center" : "justify-end text-right",
        "text-xs font-medium text-muted-foreground uppercase tracking-wide",
        (column || tooltip) && "hover:text-foreground transition-colors",
        column ? "cursor-pointer" : tooltip ? "cursor-help" : "cursor-default",
        // Reserve space for the sort icon so header text stays centered and never overlaps.
        sortIcon && "pr-5",
        minWidthClassName
      )}
      aria-label={tooltip ? `${label}: ${tooltip}` : label}
    >
      <span className="pointer-events-none">{label}</span>

      {sortIcon && (
        <span className="absolute right-1 top-1/2 -translate-y-1/2 inline-flex items-center">
          {sortIcon}
        </span>
      )}
    </button>
  )

  if (!tooltip) return headerButton

  return (
    <Tooltip>
      <TooltipTrigger asChild>{headerButton}</TooltipTrigger>
      <TooltipContent side="top" sideOffset={6} className="max-w-[280px]">
        {tooltip}
      </TooltipContent>
    </Tooltip>
  )
}

export function createKeywordColumns({
  isGuest,
  isBulkRefreshing,
  onBulkRefresh,
}: {
  isGuest: boolean
  isBulkRefreshing?: boolean
  onBulkRefresh?: (ids: number[]) => void
}): ColumnDef<Keyword, unknown>[] {
  return [
    // 1. Checkbox
    columnHelper.display({
      id: "select",
      header: ({ table }) => <HeaderSelectionCheckbox table={table} />,
      cell: ({ row }) => (
        <RowSelectionCheckbox
          id={Number(row.original.id)}
          label={`Select ${row.original.keyword}`}
        />
      ),
      size: 40,
      minSize: 40,
      maxSize: 40,
    }),

    // 2. Keyword
    columnHelper.accessor("keyword", {
      header: ({ column }) => <TableColumnHeader label="Keyword" column={column} />,
      cell: ({ row }) => (
        <span className="inline-flex items-center gap-1.5 text-sm font-semibold group-hover:text-amber-500">
          {row.original.keyword}
          <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:text-amber-500" />
        </span>
      ),
      size: 220,
      minSize: 200,
    }),

    // 3. Intent
    columnHelper.accessor((row) => getIntentSortValue(row.intent), {
      id: "intent",
      header: ({ column }) => <TableColumnHeader label="Intent" column={column} />,
      cell: ({ row }) => (
        <div className="flex items-center justify-center gap-0.5">
          {row.original.intent.map((int, idx) => (
            <Tooltip key={int + idx}>
              <TooltipTrigger asChild>
                <span
                  className={cn(
                    "inline-flex items-center justify-center w-5 h-5 rounded text-[10px] font-semibold border cursor-default",
                    INTENT_CONFIG[int].color
                  )}
                >
                  {INTENT_CONFIG[int].label}
                </span>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs">
                {INTENT_CONFIG[int].tooltip}
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      ),
      sortingFn: "basic",
      sortUndefined: "last",
      size: 70,
      minSize: 70,
      maxSize: 90,
    }),

    // 4. Volume
    columnHelper.accessor((row) => getNumericSortValue(row.volume), {
      id: "volume",
      header: ({ column }) => (
        <TableColumnHeader
          label="Volume"
          tooltip={EDUCATIONAL_TOOLTIPS.volume}
          column={column}
          align="right"
        />
      ),
      cell: ({ row }) => (
        <div className="flex items-center justify-end font-mono text-sm tabular-nums">
          {row.original.volume.toLocaleString()}
        </div>
      ),
      sortingFn: "basic",
      sortUndefined: "last",
      size: 80,
      minSize: 80,
    }),

    // 5. Trend
    columnHelper.accessor("trend", {
      header: () => <TableColumnHeader label="Trend" tooltip={EDUCATIONAL_TOOLTIPS.trend} />,
      cell: ({ row }) => (
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center justify-center">
              <TrendSparkline
                trend={row.original.trend}
                status={row.original.trendStatus ?? "stable"}
              />
            </div>
          </TooltipTrigger>
          <TooltipContent side="top" sideOffset={6}>
            {row.original.trendStatus === "rising"
              ? "Rising Trend"
              : row.original.trendStatus === "falling"
                ? "Falling Trend"
                : "Stable Trend"}
          </TooltipContent>
        </Tooltip>
      ),
      enableSorting: false,
      size: 80,
      minSize: 80,
    }),

    // 6. KD
    columnHelper.accessor((row) => getNumericSortValue(row.kd), {
      id: "kd",
      header: ({ column }) => (
        <TableColumnHeader label="KD %" tooltip={EDUCATIONAL_TOOLTIPS.kd} column={column} />
      ),
      cell: ({ row }) => (
        <div className="flex items-center justify-center">
          <KDRing value={row.original.kd} />
        </div>
      ),
      sortingFn: "basic",
      sortUndefined: "last",
      size: 60,
      minSize: 60,
    }),

    // 7. CPC
    columnHelper.accessor((row) => getNumericSortValue(row.cpc), {
      id: "cpc",
      header: ({ column }) => (
        <TableColumnHeader label="CPC" tooltip={EDUCATIONAL_TOOLTIPS.cpc} column={column} align="right" />
      ),
      cell: ({ row }) => (
        <div className="flex items-center justify-end font-mono text-sm tabular-nums">
          ${row.original.cpc.toFixed(2)}
        </div>
      ),
      sortingFn: "basic",
      sortUndefined: "last",
      size: 60,
      minSize: 60,
    }),

    // 8. Weak Spot
    columnHelper.accessor((row) => getWeakSpotSortValue(row.weakSpots), {
      id: "weakSpots",
      header: ({ column }) => (
        <TableColumnHeader label="Weak Spot" tooltip={EDUCATIONAL_TOOLTIPS.weakSpots} column={column} />
      ),
      cell: ({ row }) => {
        const geoScore = row.original.geoScore
        const numericId = Number(row.original.id)

        return (
          <div className="flex items-center justify-center">
            {geoScore == null ? (
              <ForensicScanInline id={numericId} keyword={row.original.keyword} />
            ) : (
              <WeakSpotColumn weakSpots={row.original.weakSpots} />
            )}
          </div>
        )
      },
      sortingFn: "basic",
      sortUndefined: "last",
      sortDescFirst: true,
      size: 180,
      minSize: 160,
    }),

    // 9. GEO Score
    columnHelper.accessor((row) => getNumericSortValue(row.geoScore), {
      id: "geoScore",
      header: ({ column }) => (
        <TableColumnHeader label="GEO" tooltip={EDUCATIONAL_TOOLTIPS.geoScore} column={column} />
      ),
      cell: ({ row }) => {
        const hasAio = row.original.hasAio ?? row.original.serpFeatures?.includes("ai_overview")
        const geoScore = row.original.geoScore
        const numericId = Number(row.original.id)
        return (
          <div className="flex items-center justify-center">
            {typeof geoScore === "number" && geoScore > 0 ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span
                    className={cn(
                      "inline-flex items-center justify-center gap-1 px-1.5 py-0.5 rounded text-xs font-semibold",
                      geoScore >= 70
                        ? "bg-emerald-500/20 text-emerald-500"
                        : geoScore >= 40
                          ? "bg-amber-500/20 text-amber-500"
                          : "bg-red-500/20 text-red-500"
                    )}
                  >
                    {hasAio && <Bot className="h-3 w-3" />}
                    {geoScore}
                  </span>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs">
                  <p className="font-medium">GEO Score: {geoScore}/100</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {geoScore >= 70
                      ? "High potential to appear in AI answers"
                      : geoScore >= 40
                        ? "Moderate AI visibility potential"
                        : "Low AI visibility - focus on traditional SEO"}
                  </p>
                </TooltipContent>
              </Tooltip>
              ) : (
                <span className="text-muted-foreground/50 text-xs">-</span>
              )}
          </div>
        )
      },
      sortingFn: "basic",
      sortUndefined: "last",
      size: 60,
      minSize: 60,
    }),

    // 10. SERP Features
    columnHelper.accessor("serpFeatures", {
      header: () => <TableColumnHeader label="SERP" />,
      cell: ({ row }) => {
        const displaySerpFeatures = row.original.serpFeatures || []

        const getFeatureIcon = (feature: string) => {
          switch (feature) {
            case "ai_overview":
              return <Bot className="h-3.5 w-3.5" />
            case "video_pack":
              return <Video className="h-3.5 w-3.5" />
            case "featured_snippet":
            case "direct_answer":
              return <FileText className="h-3.5 w-3.5" />
            case "image_pack":
              return <ImageIcon className="h-3.5 w-3.5" />
            case "shopping_ads":
              return <ShoppingCart className="h-3.5 w-3.5" />
            case "ads_top":
              return <Megaphone className="h-3.5 w-3.5" />
            case "local_pack":
              return <MapPin className="h-3.5 w-3.5" />
            case "top_stories":
              return <Newspaper className="h-3.5 w-3.5" />
            case "people_also_ask":
              return <HelpCircle className="h-3.5 w-3.5" />
            case "reviews":
              return <Star className="h-3.5 w-3.5" />
            default:
              return <FileText className="h-3.5 w-3.5" />
          }
        }

        const getFeatureColor = (feature: string) => {
          switch (feature) {
            case "ai_overview":
              return "text-indigo-400"
            case "video_pack":
              return "text-red-500"
            case "featured_snippet":
            case "direct_answer":
              return "text-amber-500"
            case "image_pack":
              return "text-pink-400"
            case "shopping_ads":
              return "text-green-400"
            case "ads_top":
              return "text-yellow-500"
            case "local_pack":
              return "text-orange-400"
            case "top_stories":
              return "text-cyan-400"
            case "people_also_ask":
              return "text-blue-400"
            case "reviews":
              return "text-yellow-400"
            default:
              return "text-muted-foreground"
          }
        }

        const getFeatureLabel = (feature: string) => {
          switch (feature) {
            case "ai_overview":
              return "AI Overview"
            case "featured_snippet":
              return "Featured Snippet"
            case "direct_answer":
              return "Direct Answer"
            case "people_also_ask":
              return "FAQ / PAA"
            case "local_pack":
              return "Local Pack"
            case "top_stories":
              return "Top Stories"
            case "shopping_ads":
              return "Shopping"
            case "ads_top":
              return "Ads"
            case "video_pack":
              return "Video"
            case "image_pack":
              return "Images"
            default:
              return feature
          }
        }

        return (
          <div className="flex items-center justify-center">
            {displaySerpFeatures.length > 0 ? (
              <div className="flex items-center justify-center gap-0.5 flex-wrap">
                {displaySerpFeatures.slice(0, 3).map((feature, idx) => (
                  <Tooltip key={`${feature}-${idx}`}>
                    <TooltipTrigger asChild>
                      <span
                        className={cn(
                          "inline-flex items-center justify-center w-5 h-5 cursor-default",
                          getFeatureColor(feature)
                        )}
                      >
                        {getFeatureIcon(feature)}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-xs">
                      {getFeatureLabel(feature)}
                    </TooltipContent>
                  </Tooltip>
                ))}
                {displaySerpFeatures.length > 3 && (
                  <span className="text-[10px] text-muted-foreground">+{displaySerpFeatures.length - 3}</span>
                )}
              </div>
            ) : (
              <span className="text-muted-foreground/50 text-xs">-</span>
            )}
          </div>
        )
      },
      enableSorting: false,
      size: 100,
      minSize: 90,
    }),

    // 11. Refresh
    columnHelper.display({
      id: "refresh",
      header: () => (
        <div className="min-w-[150px] flex justify-end text-right">
          <RefreshCreditsHeader
            isGuest={isGuest}
            isBulkRefreshing={isBulkRefreshing}
            onBulkRefresh={onBulkRefresh}
          />
        </div>
      ),
      cell: ({ row }) => (
        <div
          className="min-w-[150px] flex justify-end"
          onClick={(e) => e.stopPropagation()}
        >
          <RefreshColumn
            id={String(row.original.id)}
            keyword={row.original.keyword}
            lastUpdated={
              row.original.lastUpdated instanceof Date
                ? row.original.lastUpdated.toISOString()
                : row.original.lastUpdated ?? null
            }
            lastRefreshedAt={
              row.original.lastRefreshedAt instanceof Date
                ? row.original.lastRefreshedAt.toISOString()
                : row.original.lastRefreshedAt ?? null
            }
            lastSerpUpdate={
              row.original.lastSerpUpdate instanceof Date
                ? row.original.lastSerpUpdate.toISOString()
                : row.original.lastSerpUpdate ?? null
            }
            isGuest={isGuest}
          />
        </div>
      ),
      size: 170,
      minSize: 160,
      maxSize: 220,
    }),
  ] as ColumnDef<Keyword, unknown>[]
}

