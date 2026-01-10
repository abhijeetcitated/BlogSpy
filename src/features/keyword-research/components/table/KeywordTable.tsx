"use client"

// ============================================
// KEYWORD TABLE - TanStack Table v8 Refactor
// ============================================
// Logic: TanStack Table v8 (sorting, selection, pagination)
// UI: Preserved exactly from legacy implementation
// ============================================

import { useState, useCallback, useMemo, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  type SortingState,
  type RowSelectionState,
  createColumnHelper,
} from "@tanstack/react-table"
import { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Sparkline, KDRing } from "@/components/charts"
import {
  Download,
  Copy,
  Check,
  Share2,
  Lock,
  Bot,
  Video,
  FileText,
  ImageIcon,
  ShoppingCart,
  MapPin,
  Newspaper,
  HelpCircle,
  Star,
  Megaphone,
  ArrowUpRight,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

import type { Keyword } from "../../types"
import { MOCK_KEYWORDS } from "../../__mocks__/keyword-data"
import { INTENT_CONFIG } from "../../constants/table-config"
import { CreditBalance } from "../header/CreditBalance"
import { downloadKeywordsCSV } from "../../utils/export-utils"
import { WeakSpotColumn } from "./columns/weak-spot/weak-spot-column"
import { RefreshColumn } from "./columns/refresh"
import { RefreshCreditsHeader } from "./columns/refresh/RefreshCreditsHeader"

export interface KeywordTableProps {
  keywords?: Keyword[]
  onKeywordClick?: (keyword: Keyword) => void
  onSelectionChange?: (selectedIds: number[]) => void
  isGuest?: boolean
}

const PAGE_SIZE = 50

// Column helper for type-safe column definitions
const columnHelper = createColumnHelper<Keyword>()

export function KeywordTable({
  keywords: keywordsProp,
  onKeywordClick,
  onSelectionChange,
  isGuest = false,
}: KeywordTableProps) {
  // Router for navigation
  const router = useRouter()

  // ============================================
  // GUEST ACTION GUARD
  // ============================================
  const guardAction = useCallback(
    (actionName: string, callback: () => void) => {
      if (isGuest) {
        toast.error(`Sign up to ${actionName}`, {
          description: "Create a free account to unlock export, refresh, and more.",
          action: {
            label: "Sign Up Free",
            onClick: () => router.push("/register"),
          },
          duration: 5000,
        })
        return
      }
      callback()
    },
    [isGuest, router]
  )

  // Use prop data directly - no local state copy (fixes infinite loop)
  const data = keywordsProp ?? MOCK_KEYWORDS

  // UI State
  const [isExporting, setIsExporting] = useState(false)
  const [isCopied, setIsCopied] = useState(false)

  // Timer refs for export/copy feedback
  const exportTimerRef = useRef<NodeJS.Timeout | null>(null)
  const copyTimerRef = useRef<NodeJS.Timeout | null>(null)

  // ============================================
  // TANSTACK TABLE: SORTING STATE
  // ============================================
  const [sorting, setSorting] = useState<SortingState>([])

  // ============================================
  // TANSTACK TABLE: ROW SELECTION STATE
  // ============================================
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})

  // Reset selection when data changes (prevents stale selections across searches/filters)
  useEffect(() => {
    setRowSelection({})
  }, [data])

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (exportTimerRef.current) {
        clearTimeout(exportTimerRef.current)
      }
      if (copyTimerRef.current) {
        clearTimeout(copyTimerRef.current)
      }
    }
  }, [])

  // ============================================
  // COLUMN DEFINITIONS (with exact legacy JSX)
  // ============================================
  const columns = useMemo(
    () => [
      // 1. Checkbox
      columnHelper.display({
        id: "select",
        header: ({ table }) => (
          <div className="flex items-center justify-center">
            <Checkbox
              checked={
                table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")
              }
              onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
              aria-label="Select all"
            />
          </div>
        ),
        cell: ({ row }) => (
          <div
            className="flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <Checkbox
              checked={row.getIsSelected()}
              onCheckedChange={(value) => row.toggleSelected(!!value)}
              aria-label={`Select ${row.original.keyword}`}
            />
          </div>
        ),
        size: 40,
      }),

      // 2. Keyword
      columnHelper.accessor("keyword", {
        header: "Keyword",
        cell: ({ row }) => (
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold group-hover:text-amber-400 transition-colors">
            {row.original.keyword}
            <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:text-amber-400 transition-all" />
          </span>
        ),
        size: 220,
      }),

      // 3. Intent
      columnHelper.accessor("intent", {
        header: "Intent",
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
        enableSorting: false,
        size: 70,
      }),

      // 4. Volume
      columnHelper.accessor("volume", {
        header: ({ column }) => (
          <button
            className="flex items-center gap-1 hover:text-foreground transition-colors"
            onClick={column.getToggleSortingHandler()}
          >
            Volume
            {column.getIsSorted() === "asc" ? (
              <ArrowUp className="h-3 w-3" />
            ) : column.getIsSorted() === "desc" ? (
              <ArrowDown className="h-3 w-3" />
            ) : (
              <ArrowUpDown className="h-3 w-3 opacity-50" />
            )}
          </button>
        ),
        cell: ({ row }) => (
          <div className="flex items-center justify-center font-mono text-sm tabular-nums">
            {row.original.volume.toLocaleString()}
          </div>
        ),
        size: 80,
      }),

      // 5. Trend
      columnHelper.accessor("trend", {
        header: "Trend",
        cell: ({ row }) => (
          <div className="flex items-center justify-center">
            <Sparkline data={row.original.trend} />
          </div>
        ),
        enableSorting: false,
        size: 80,
      }),

      // 6. KD
      columnHelper.accessor("kd", {
        header: ({ column }) => (
          <button
            className="flex items-center gap-1 hover:text-foreground transition-colors"
            onClick={column.getToggleSortingHandler()}
          >
            KD
            {column.getIsSorted() === "asc" ? (
              <ArrowUp className="h-3 w-3" />
            ) : column.getIsSorted() === "desc" ? (
              <ArrowDown className="h-3 w-3" />
            ) : (
              <ArrowUpDown className="h-3 w-3 opacity-50" />
            )}
          </button>
        ),
        cell: ({ row }) => (
          <div className="flex items-center justify-center">
            <KDRing value={row.original.kd} />
          </div>
        ),
        size: 60,
      }),

      // 7. CPC
      columnHelper.accessor("cpc", {
        header: ({ column }) => (
          <button
            className="flex items-center gap-1 hover:text-foreground transition-colors"
            onClick={column.getToggleSortingHandler()}
          >
            CPC
            {column.getIsSorted() === "asc" ? (
              <ArrowUp className="h-3 w-3" />
            ) : column.getIsSorted() === "desc" ? (
              <ArrowDown className="h-3 w-3" />
            ) : (
              <ArrowUpDown className="h-3 w-3 opacity-50" />
            )}
          </button>
        ),
        cell: ({ row }) => (
          <div className="flex items-center justify-center font-mono text-sm tabular-nums">
            ${row.original.cpc.toFixed(2)}
          </div>
        ),
        size: 60,
      }),

      // 8. Weak Spot
      columnHelper.accessor("weakSpots", {
        header: "Weak Spot",
        cell: ({ row }) => (
          <div className="flex items-center justify-center">
            <WeakSpotColumn weakSpots={row.original.weakSpots} />
          </div>
        ),
        enableSorting: false,
        size: 180,
      }),

      // 9. GEO Score
      columnHelper.accessor("geoScore", {
        header: ({ column }) => (
          <button
            className="flex items-center gap-1 hover:text-foreground transition-colors"
            onClick={column.getToggleSortingHandler()}
          >
            GEO
            {column.getIsSorted() === "asc" ? (
              <ArrowUp className="h-3 w-3" />
            ) : column.getIsSorted() === "desc" ? (
              <ArrowDown className="h-3 w-3" />
            ) : (
              <ArrowUpDown className="h-3 w-3 opacity-50" />
            )}
          </button>
        ),
        cell: ({ row }) => {
          const hasAio = row.original.hasAio ?? row.original.serpFeatures?.includes("ai_overview")
          const geoScore = row.original.geoScore

          return (
            <div className="flex items-center justify-center">
              {geoScore !== undefined && geoScore > 0 ? (
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
                <span className="text-muted-foreground/50 text-xs">—</span>
              )}
            </div>
          )
        },
        size: 60,
      }),

      // 10. SERP Features
      columnHelper.accessor("serpFeatures", {
        header: "SERP",
        cell: ({ row }) => {
          const displaySerpFeatures = row.original.serpFeatures || []

          const getFeatureIcon = (feature: string) => {
            switch (feature) {
              case "ai_overview":
                return <Bot className="h-3.5 w-3.5" />
              case "video":
                return <Video className="h-3.5 w-3.5" />
              case "snippet":
              case "featured_snippet":
                return <FileText className="h-3.5 w-3.5" />
              case "image":
                return <ImageIcon className="h-3.5 w-3.5" />
              case "shopping":
                return <ShoppingCart className="h-3.5 w-3.5" />
              case "local":
                return <MapPin className="h-3.5 w-3.5" />
              case "news":
                return <Newspaper className="h-3.5 w-3.5" />
              case "faq":
                return <HelpCircle className="h-3.5 w-3.5" />
              case "reviews":
                return <Star className="h-3.5 w-3.5" />
              case "ad":
                return <Megaphone className="h-3.5 w-3.5" />
              default:
                return <FileText className="h-3.5 w-3.5" />
            }
          }

          const getFeatureColor = (feature: string) => {
            switch (feature) {
              case "ai_overview":
                return "text-indigo-400"
              case "video":
                return "text-red-500"
              case "snippet":
              case "featured_snippet":
                return "text-amber-500"
              case "image":
                return "text-pink-400"
              case "shopping":
                return "text-green-400"
              case "local":
                return "text-orange-400"
              case "news":
                return "text-cyan-400"
              case "faq":
                return "text-blue-400"
              case "reviews":
                return "text-yellow-400"
              case "ad":
                return "text-yellow-500"
              default:
                return "text-muted-foreground"
            }
          }

          const getFeatureLabel = (feature: string) => {
            switch (feature) {
              case "ai_overview":
                return "AI Overview"
              case "snippet":
              case "featured_snippet":
                return "Featured Snippet"
              case "faq":
                return "FAQ / PAA"
              default:
                return feature.charAt(0).toUpperCase() + feature.slice(1)
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
                    <span className="text-[10px] text-muted-foreground">
                      +{displaySerpFeatures.length - 3}
                    </span>
                  )}
                </div>
              ) : (
                <span className="text-muted-foreground/50 text-xs">—</span>
              )}
            </div>
          )
        },
        enableSorting: false,
        size: 100,
      }),

      // 11. Refresh
      columnHelper.display({
        id: "refresh",
        header: () => <RefreshCreditsHeader />,
        cell: ({ row }) => (
          <div onClick={(e) => e.stopPropagation()}>
            <RefreshColumn
              id={String(row.original.id)}
              keyword={row.original.keyword}
              lastUpdated={
                row.original.lastUpdated instanceof Date
                  ? row.original.lastUpdated.toISOString()
                  : row.original.lastUpdated ?? null
              }
            />
          </div>
        ),
        size: 50,
      }),
    ],
    []
  )

  // ============================================
  // TANSTACK TABLE INSTANCE
  // ============================================
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      rowSelection,
    },
    initialState: {
      pagination: {
        pageSize: PAGE_SIZE,
      },
    },
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    enableRowSelection: true,
    getRowId: (row) => String(row.id),
  })

  // Get selected row IDs
  const selectedRowIds = useMemo(() => {
    return Object.keys(rowSelection).map((id) => parseInt(id, 10))
  }, [rowSelection])

  // Sync selection changes to parent
  useEffect(() => {
    onSelectionChange?.(selectedRowIds)
  }, [selectedRowIds, onSelectionChange])

  // ============================================
  // PAGINATION (TanStack Table)
  // ============================================
  const totalRows = table.getPrePaginationRowModel().rows.length
  const pageRows = table.getRowModel().rows
  const pageRowCount = pageRows.length

  const pagination = table.getState().pagination
  const pageIndex = pagination.pageIndex
  const pageCount = table.getPageCount()

  // Reset to first page when dataset changes (prevents landing on an out-of-range page)
  useEffect(() => {
    table.setPageIndex(0)
  }, [data, table])

  // ============================================
  // HANDLERS (Preserved from legacy)
  // ============================================
  const handleCopy = useCallback(() => {
    guardAction("copy keywords", () => {
      const keywordsToCopy = selectedRowIds.length > 0
        ? data.filter((k) => selectedRowIds.includes(k.id))
        : []

      if (keywordsToCopy.length === 0) return

      const header = "Keyword\tIntent\tVolume\tKD%\tCPC\tGEO\tSERP Features"
      const rows = keywordsToCopy.map((k) => {
        const serpFeatures = k.serpFeatures?.join(", ") || "-"
        return `${k.keyword}\t${k.intent || "-"}\t${k.volume}\t${k.kd}%\t$${k.cpc.toFixed(2)}\t${k.geoScore || "-"}\t${serpFeatures}`
      })

      const copyText = [header, ...rows].join("\n")

      navigator.clipboard.writeText(copyText).then(() => {
        setIsCopied(true)
        copyTimerRef.current = setTimeout(() => setIsCopied(false), 2000)
      })
    })
  }, [guardAction, selectedRowIds, data, setIsCopied])

  const handleExportToTopicCluster = useCallback(() => {
    guardAction("export to Topic Clusters", () => {
      const keywordsToExport = selectedRowIds.length > 0
        ? data.filter((k) => selectedRowIds.includes(k.id))
        : data

      const exportData = keywordsToExport.map((k) => ({
        keyword: k.keyword,
        volume: k.volume,
        kd: k.kd,
        cpc: k.cpc,
        intent: k.intent,
        geoScore: k.geoScore,
        serpFeatures: k.serpFeatures,
      }))

      localStorage.setItem("keyword-explorer-export", JSON.stringify(exportData))
      localStorage.setItem("keyword-explorer-export-time", new Date().toISOString())

      router.push("/topic-clusters")
    })
  }, [guardAction, selectedRowIds, data, router])

  const handleExportCSV = useCallback(() => {
    guardAction("export CSV", () => {
      setIsExporting(true)
      downloadKeywordsCSV(data, new Set(selectedRowIds))
      exportTimerRef.current = setTimeout(() => setIsExporting(false), 500)
    })
  }, [guardAction, data, selectedRowIds, setIsExporting])

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex flex-col h-full w-full">
        {/* Export Bar - PRESERVED EXACTLY */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between px-3 py-2 border-b border-border bg-muted/50 shrink-0">
          {/* Left Child (Selection Text Only) */}
          <div className="text-sm text-muted-foreground">
            {selectedRowIds.length > 0
              ? `${selectedRowIds.length} keywords selected`
              : "Select keywords to export"}
          </div>

          {/* Right Child (Actions + Credits) */}
          <div className="grid grid-cols-2 gap-2 w-full md:flex md:w-auto md:items-center md:gap-2">
            {/* Group 1: Copy/Export (stable top row on mobile) */}
            <div className="col-span-2 w-full md:col-span-auto md:w-auto md:flex md:items-center md:gap-2">
              {selectedRowIds.length > 0 ? (
                <div className="grid grid-cols-2 gap-2 w-full md:flex md:w-auto md:gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopy}
                    className={cn(
                      "h-7 gap-1.5 text-xs transition-all",
                      isCopied && "text-emerald-600 border-emerald-500"
                    )}
                  >
                    {isCopied ? (
                      <>
                        <Check className="h-3.5 w-3.5" />
                        Copied!
                      </>
                    ) : (
                      <>
                        {isGuest && <Lock className="h-3 w-3 text-muted-foreground" />}
                        <Copy className="h-3.5 w-3.5" />
                        Copy {selectedRowIds.length}
                      </>
                    )}
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExportCSV}
                    disabled={isExporting}
                    className="h-7 gap-1.5 text-xs"
                  >
                    {isGuest && <Lock className="h-3 w-3 text-muted-foreground" />}
                    <Download className={cn("h-3.5 w-3.5", isExporting && "animate-pulse")} />
                    {`Export ${selectedRowIds.length} Selected`}
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportCSV}
                  disabled={isExporting}
                  className="h-7 gap-1.5 text-xs w-full md:w-auto"
                >
                  {isGuest && <Lock className="h-3 w-3 text-muted-foreground" />}
                  <Download className={cn("h-3.5 w-3.5", isExporting && "animate-pulse")} />
                  Export All CSV
                </Button>
              )}
            </div>

            {/* Group 2: To Clusters (bottom-left on mobile) */}
            <Button
              variant="default"
              size="sm"
              onClick={handleExportToTopicCluster}
              className="col-span-1 md:w-auto h-7 gap-1.5 text-xs bg-violet-600 hover:bg-violet-700"
            >
              {isGuest && <Lock className="h-3 w-3" />}
              <Share2 className="h-3.5 w-3.5" />
              {selectedRowIds.length > 0
                ? `To Clusters (${selectedRowIds.length})`
                : "To Topic Clusters"}
            </Button>

            {/* Group 3: Credits (bottom-right on mobile) */}
            <div className="col-span-1 md:w-auto flex justify-end md:justify-start border-l border-border pl-2 ml-1 md:ml-0">
              <CreditBalance />
            </div>
          </div>
        </div>

        {/* TABLE WRAPPER - PRESERVED STYLING */}
        <div className="max-h-[calc(100vh-180px)] overflow-x-auto overflow-y-auto">
          <table
            className="w-full text-sm table-fixed min-w-[1200px]"
            style={{ borderCollapse: "separate", borderSpacing: 0 }}
          >
            {/* Column widths - PRESERVED */}
            <colgroup>
              <col style={{ width: "40px" }} />   {/* 1. Checkbox */}
              <col style={{ width: "220px" }} />  {/* 2. Keyword */}
              <col style={{ width: "70px" }} />   {/* 3. Intent */}
              <col style={{ width: "80px" }} />   {/* 4. Volume */}
              <col style={{ width: "80px" }} />   {/* 5. Trend */}
              <col style={{ width: "60px" }} />   {/* 6. KD */}
              <col style={{ width: "60px" }} />   {/* 7. CPC */}
              <col style={{ width: "180px" }} />  {/* 8. Weak Spot */}
              <col style={{ width: "60px" }} />   {/* 9. GEO */}
              <col style={{ width: "100px" }} />  {/* 10. SERP */}
              <col style={{ width: "50px" }} />   {/* 11. Refresh */}
            </colgroup>

            {/* HEADER - Using TanStack but with legacy styling */}
            <thead className="sticky top-0 z-10 bg-muted">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-2 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wide text-center border-b border-border"
                    >
                      {header.isPlaceholder
                        ? null
                        : typeof header.column.columnDef.header === "function"
                          ? header.column.columnDef.header(header.getContext())
                          : header.column.columnDef.header}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>

            {/* BODY - Using TanStack but with legacy row styling */}
            <tbody>
              {pageRows.map((row, index) => (
                <tr
                  key={row.id}
                  onClick={() => onKeywordClick?.(row.original)}
                  className={cn(
                    "border-b border-border transition-colors cursor-pointer group",
                    index % 2 === 1 && "bg-muted/10",
                    row.getIsSelected() && "bg-amber-500/10"
                  )}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className={cn(
                        "px-2 py-2 align-middle",
                        cell.column.id === "keyword" ? "text-left font-medium text-foreground" : "text-center"
                      )}
                    >
                      {typeof cell.column.columnDef.cell === "function"
                        ? cell.column.columnDef.cell(cell.getContext())
                        : cell.getValue()}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex items-center justify-between py-4 border-t border-white/10 px-3">
          <div className="text-sm text-muted-foreground">
            Showing <span className="text-foreground font-medium">{pageRowCount}</span> of{" "}
            <span className="text-foreground font-medium">{totalRows}</span> keywords
          </div>

          <div className="flex items-center gap-4">
            <div className="text-sm text-muted-foreground">
              Page <span className="text-foreground font-medium">{pageCount === 0 ? 0 : pageIndex + 1}</span> of{" "}
              <span className="text-foreground font-medium">{pageCount}</span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="h-8"
              >
                Previous
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="h-8"
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
