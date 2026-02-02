"use client"

// ============================================
// KEYWORD TABLE - TanStack Table v8 Refactor
// ============================================
// Logic: TanStack Table v8 (sorting, selection, pagination)
// UI: Preserved exactly from legacy implementation
// ============================================

import { useState, useCallback, useMemo, useRef, useEffect, memo } from "react"
import { useRouter } from "next/navigation"
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  type SortingState,
  type Row,
} from "@tanstack/react-table"
import { Check, Copy, Download, Loader2, Share2 } from "lucide-react"
import { useAction } from "next-safe-action/hooks"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { createBrowserClient } from "@/lib/supabase/client"
import { toast } from "sonner"

import type { Keyword } from "../../types"
import { CreditBalance } from "../header/CreditBalance"
import { copyToClipboard, downloadAsCSV } from "../../utils/export-utils"
import { bulkSearchKeywords } from "../../actions/fetch-keywords"
import { checkTaskStatus } from "../../actions/check-task-status"
import { useKeywordStore } from "../../store"
import { useUIStore } from "@/store/ui-store"
import { createKeywordColumns } from "./columns/columns"
import { usePaginationUrlSync } from "../../hooks/use-pagination-url-sync"
import { buildCacheSlug } from "../../utils/input-parser"

export interface KeywordTableProps {
  keywords?: Keyword[]
  onKeywordClick?: (keyword: Keyword) => void
  onSelectionChange?: (selectedIds: number[]) => void
  isGuest?: boolean
}

const PAGE_SIZE = 50


export function KeywordTable({
  keywords: keywordsProp,
  onKeywordClick,
  onSelectionChange,
  isGuest = false,
}: KeywordTableProps) {
  // Router for navigation
  const router = useRouter()
  const openPricingModal = useUIStore((state) => state.openPricingModal)
  const isMockMode =
    process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true" || process.env.NEXT_PUBLIC_USE_MOCK_DATA === "1"

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
  const data = keywordsProp ?? []

  // UI State
  const [isExporting, setIsExporting] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const [bulkRefreshCount] = useState(0)

  // Timer refs for export/copy feedback
  const exportTimerRef = useRef<NodeJS.Timeout | null>(null)
  const copyTimerRef = useRef<NodeJS.Timeout | null>(null)
  const failedTaskToastRef = useRef(new Set<string>())

  // ============================================
  // TANSTACK TABLE: SORTING STATE
  // ============================================
  const [sorting, setSorting] = useState<SortingState>([])

  // ============================================
  // TANSTACK TABLE: ROW SELECTION STATE
  // ============================================

  // Keep Zustand selection in sync (used by RefreshCreditsHeader)
  const selectedIds = useKeywordStore((state) => state.selectedIds)
  // Note: clearSelection and setRefreshing available via store if needed in future
  const pagination = useKeywordStore((state) => state.pagination)
  const setPageIndex = useKeywordStore((state) => state.setPageIndex)
  const setPageSize = useKeywordStore((state) => state.setPageSize)
  const storeCountry = useKeywordStore((state) => state.search.country)
  const storeLanguage = useKeywordStore((state) => state.search.languageCode)
  const storeDevice = useKeywordStore((state) => state.search.deviceType)
  const storeMatchType = useKeywordStore((state) => state.filters.matchType)
  const updateKeywordsBatch = useKeywordStore((state) => state.updateKeywordsBatch)
  const setCredits = useKeywordStore((state) => state.setCredits)
  const { executeAsync: executeBulkScan, status: bulkScanStatus } = useAction(bulkSearchKeywords)
  const { executeAsync: executeCheckTaskStatus } = useAction(checkTaskStatus)
  const isBulkRefreshing = bulkScanStatus === "executing"

  // Keep pagination in sync with URL params
  usePaginationUrlSync()
  const handleRowClick = useCallback(
    (keyword: Keyword) => {
      onKeywordClick?.(keyword)
    },
    [onKeywordClick]
  )

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
  // HANDLERS (Preserved from legacy)
  // ============================================
  // Get selected row IDs
  const selectedIdKeys = useMemo(() => Object.keys(selectedIds), [selectedIds])
  const selectedRowIdsArray = useMemo(
    () => selectedIdKeys.map((id) => Number(id)).filter((id) => Number.isFinite(id)),
    [selectedIdKeys]
  )
  const selectedCount = selectedIdKeys.length
  const selectedKeywords = useMemo(
    () => data.filter((keyword) => selectedIds[String(keyword.id)]),
    [data, selectedIds]
  )

  const pendingKeywordMap = useMemo(() => {
    const map = new Map<string, number>()
    const country = storeCountry || "US"
    const language = storeLanguage || "en"
    const device = storeDevice || "desktop"

    data.forEach((keyword) => {
      if (keyword.serpStatus !== "pending") return
      const slug = buildCacheSlug(keyword.keyword, country, language, device)
      map.set(slug, keyword.id)
    })

    return map
  }, [data, storeCountry, storeLanguage, storeDevice])

  const pendingSlugs = useMemo(() => Array.from(pendingKeywordMap.keys()), [pendingKeywordMap])

  useEffect(() => {
    onSelectionChange?.(selectedRowIdsArray)
  }, [selectedRowIdsArray, onSelectionChange])

  const handleCopy = useCallback(async () => {
    const keywordsToCopy = selectedRowIdsArray.length > 0
      ? data.filter((k) => selectedRowIdsArray.includes(k.id))
      : []

    if (keywordsToCopy.length === 0) return

    const success = await copyToClipboard(keywordsToCopy)
    if (success) {
      setIsCopied(true)
      copyTimerRef.current = setTimeout(() => setIsCopied(false), 2000)
    }
  }, [data, selectedRowIdsArray, setIsCopied])

  const handleExportToTopicCluster = useCallback(() => {
    const count = selectedRowIdsArray.length
    if (count === 0) return
    toast.success(`Sending ${count} keywords to Topic Clusters engine...`)
  }, [selectedRowIdsArray])

  const handleExportSelected = useCallback(() => {
    if (selectedRowIdsArray.length === 0) return
    setIsExporting(true)
    const selectedSet = new Set(selectedRowIdsArray)
    const exportRows = data.filter((k) => selectedSet.has(k.id))
    downloadAsCSV(exportRows)
    exportTimerRef.current = setTimeout(() => setIsExporting(false), 500)
  }, [data, selectedRowIdsArray, setIsExporting])

  const handleBulkForensicScan = useCallback(async () => {
    if (selectedCount === 0 || bulkScanStatus === "executing") return

    guardAction("run a forensic scan", async () => {
      const idempotencyKey = crypto.randomUUID()
      const keywords = selectedKeywords.map((keyword) => keyword.keyword).filter(Boolean)
      let pendingIds = new Set<number>()

      if (keywords.length === 0) {
        toast.error("Please select at least one keyword")
        return
      }

      updateKeywordsBatch(
        selectedKeywords.map((keyword) => ({
          id: keyword.id,
          updates: { isRefreshing: true },
        }))
      )

      try {
        const result = await executeBulkScan({
          keywords,
          country: storeCountry || "US",
          matchType: storeMatchType,
          idempotency_key: idempotencyKey,
          isForensic: true,
        })

        const serverError = typeof result?.serverError === "string" ? result.serverError : undefined
        if (serverError) {
          if (serverError.includes("INSUFFICIENT_CREDITS")) {
            openPricingModal()
            toast.error("Insufficient credits", {
              description: "Upgrade your plan to run a forensic scan.",
            })
            return
          }
          throw new Error(serverError)
        }

        if (!result?.data || result.data.success !== true) {
          throw new Error("Forensic scan failed")
        }

        const updatedKeywords = result.data.data
        pendingIds = new Set(
          updatedKeywords
            .filter((keyword) => keyword.serpStatus === "pending")
            .map((keyword) => keyword.id)
        )
        updateKeywordsBatch(
          updatedKeywords.map((keyword) => ({
            id: keyword.id,
            updates: {
              ...keyword,
              isRefreshing: pendingIds.has(keyword.id),
            },
          }))
        )

        if (typeof result.data.balance === "number") {
          setCredits(result.data.balance)
        }

        if (result.data.forensicError) {
          const refundAmount =
            typeof result.data.forensicRefund === "number" ? result.data.forensicRefund : 0
          const refundMessage = refundAmount
            ? `${refundAmount} credits have been refunded to your account.`
            : "Forensic credits have been refunded to your account."
          toast.warning("⚠️ Discovery data loaded, but Forensic Scan failed.", {
            description: refundMessage,
          })
        }

        toast.success("Forensic scan complete")
      } catch (error) {
        console.error("[BulkForensic] ERROR:", error)
        const message = error instanceof Error ? error.message : "Please try again."
        toast.error("Forensic scan failed", { description: message })
      } finally {
        updateKeywordsBatch(
          selectedKeywords.map((keyword) => ({
            id: keyword.id,
            updates: { isRefreshing: pendingIds.has(keyword.id) },
          }))
        )
      }
    })
  }, [
    bulkScanStatus,
    executeBulkScan,
    guardAction,
    openPricingModal,
    selectedCount,
    selectedKeywords,
    setCredits,
    storeCountry,
    storeMatchType,
    updateKeywordsBatch,
  ])

  const handleTaskStatusUpdate = useCallback(
    async (slugs: string[]) => {
      if (slugs.length === 0) return
      const result = await executeCheckTaskStatus({ slugs })
      const serverError = typeof result?.serverError === "string" ? result.serverError : undefined
      if (serverError) return
      if (!result?.data || result.data.success !== true) return

      const updatedKeywords = result.data.data ?? []
      if (updatedKeywords.length > 0) {
        updateKeywordsBatch(
          updatedKeywords.map((keyword) => ({
            id: keyword.id,
            updates: { ...keyword, isRefreshing: false, serpStatus: "completed" },
          }))
        )
      }

      const failedSlugs = result.data.failedSlugs ?? []
      if (failedSlugs.length > 0) {
        const newlyFailed = failedSlugs.filter((slug) => !failedTaskToastRef.current.has(slug))
        newlyFailed.forEach((slug) => failedTaskToastRef.current.add(slug))

        if (newlyFailed.length > 0) {
          toast.error("Partial scan failed", {
            description: `${newlyFailed.length} credit${newlyFailed.length === 1 ? "" : "s"} returned.`,
          })
        }

        updateKeywordsBatch(
          failedSlugs
            .map((slug) => {
              const id = pendingKeywordMap.get(slug)
              if (!id) return null
              return { id, updates: { isRefreshing: false, serpStatus: "failed" } }
            })
            .filter(Boolean) as Array<{ id: number; updates: Partial<Keyword> }>
        )
      }
    },
    [executeCheckTaskStatus, pendingKeywordMap, updateKeywordsBatch]
  )

  useEffect(() => {
    if (isGuest || isMockMode || pendingSlugs.length === 0) return

    let cancelled = false

    const poll = async () => {
      if (cancelled) return
      await handleTaskStatusUpdate(pendingSlugs)
    }

    poll()
    const interval = setInterval(poll, 10_000)

    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [handleTaskStatusUpdate, isGuest, isMockMode, pendingSlugs])

  useEffect(() => {
    if (isGuest || isMockMode || pendingSlugs.length === 0) return

    let supabase: ReturnType<typeof createBrowserClient> | null = null
    try {
      supabase = createBrowserClient()
    } catch (error) {
      console.warn(
        "[KeywordTable] Supabase realtime disabled",
        error instanceof Error ? error.message : "unknown error"
      )
      return
    }

    const channel = supabase
      .channel(`kw-cache-pending-${pendingSlugs.join(",")}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "kw_cache" },
        (payload) => {
          const slug = (payload.new as { slug?: string } | null)?.slug
          if (!slug || !pendingKeywordMap.has(slug)) return
          void handleTaskStatusUpdate([slug])
        }
      )
      .subscribe()

    return () => {
      supabase?.removeChannel(channel)
    }
  }, [handleTaskStatusUpdate, isGuest, isMockMode, pendingKeywordMap, pendingSlugs])

  // ============================================
  // COLUMN DEFINITIONS
  // ============================================
  const columns = useMemo(
    () =>
      createKeywordColumns({
        isGuest,
        isBulkRefreshing,
        onBulkRefresh: handleBulkForensicScan,
      }),
    [handleBulkForensicScan, isBulkRefreshing, isGuest]
  )

  // ============================================
  // TANSTACK TABLE INSTANCE
  // ============================================
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getRowId: (row) => String(row.id),
  })

  // ============================================
  // PAGINATION (TanStack Table)
  // ============================================
  const pageIndex = pagination.pageIndex
  const pageSize = pagination.pageSize

  const sortedRows = table.getSortedRowModel().rows
  const totalRows = sortedRows.length

  const start = pageIndex * pageSize
  const end = start + pageSize
  const pageRows = sortedRows.slice(start, end)
  const pageRowCount = pageRows.length

  const totalPages = totalRows === 0 ? 0 : Math.ceil(totalRows / pageSize)
  const isFirstPage = pageIndex === 0
  const isLastPage = totalPages === 0 ? true : pageIndex >= totalPages - 1
  const displayStart = totalRows === 0 ? 0 : start + 1
  const displayEnd = totalRows === 0 ? 0 : Math.min(end, totalRows)

  // Reset to first page when dataset changes (prevents landing on an out-of-range page)
  useEffect(() => {
    setPageIndex(0)
  }, [data, setPageIndex])

  useEffect(() => {
    if (totalPages === 0) {
      if (pageIndex !== 0) setPageIndex(0)
      return
    }
    if (pageIndex >= totalPages) {
      setPageIndex(0)
    }
  }, [pageIndex, setPageIndex, totalPages])

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex flex-col h-full w-full">
        {/* Export Bar - PRESERVED EXACTLY */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between px-3 py-2 border-b border-border bg-muted/50 shrink-0">
          {/* Left Child (Selection Text Only) */}
          <div className="flex flex-col gap-1 text-sm text-muted-foreground">
            <span>
              {selectedCount > 0 ? `${selectedCount} keywords selected` : "Select keywords to export"}
            </span>
            {isBulkRefreshing && bulkRefreshCount > 0 ? (
              <span className="inline-flex items-center gap-1 text-xs">
                <Loader2 className="h-3 w-3 animate-spin" />
                Refreshing {bulkRefreshCount} keywords...
              </span>
            ) : null}
          </div>

          {/* Right Child (Actions + Credits) */}
          <div className="grid grid-cols-2 gap-2 w-full md:flex md:w-auto md:items-center md:gap-2">
            {/* Group 1: Copy/Export (stable top row on mobile) */}
            <div className="col-span-2 w-full md:col-span-auto md:w-auto md:flex md:items-center md:gap-2">
              <div className="grid grid-cols-2 gap-2 w-full md:flex md:w-auto md:gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                  disabled={selectedCount === 0}
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
                      <Copy className="h-3.5 w-3.5" />
                      Copy {selectedCount}
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportSelected}
                  disabled={isExporting || selectedCount === 0}
                  className="h-7 gap-1.5 text-xs"
                >
                  <Download className={cn("h-3.5 w-3.5", isExporting && "animate-pulse")} />
                  {`Export ${selectedCount} Selected`}
                </Button>

              </div>
            </div>

            {/* Group 2: To Clusters (bottom-left on mobile) */}
            <Button
              variant="default"
              size="sm"
              onClick={handleExportToTopicCluster}
              disabled={selectedCount === 0}
              className={cn(
                "col-span-1 md:w-auto h-7 gap-1.5 text-xs",
                "bg-[#F59E0B] hover:bg-[#D97706] text-black font-bold",
                "border border-[#B45309] shadow-sm transition-all active:scale-95"
              )}
            >
              <Share2 className="h-3.5 w-3.5 text-black" />
              {selectedCount > 0
                ? `To Clusters (${selectedCount})`
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
            {/* Column widths (single source of truth: TanStack column sizing) */}
            <colgroup>
              {table.getVisibleLeafColumns().map((column) => (
                <col key={column.id} style={{ width: `${column.getSize()}px` }} />
              ))}
            </colgroup>

            {/* HEADER - Using TanStack but with legacy styling */}
            <thead className="bg-muted">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      style={{ width: `${header.getSize()}px` }}
                      className={cn(
                        "px-2 py-2 text-xs font-medium uppercase tracking-wide text-center border-b border-border",
                        "text-gray-700 dark:text-gray-400",
                        "sticky top-0 z-10 bg-muted"
                      )}
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
                <KeywordRow
                  key={row.id}
                  row={row}
                  index={index}
                  isSelected={Boolean(selectedIds[String(row.original.id)])}
                  isRefreshing={row.original.isRefreshing ?? false}
                  onRowClick={handleRowClick}
                />
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex items-center justify-between py-4 border-t border-white/10 px-3">
          <div className="text-sm text-muted-foreground">
            Showing <span className="text-foreground font-medium">{displayStart}</span>-
            <span className="text-foreground font-medium">{displayEnd}</span> of{" "}
            <span className="text-foreground font-medium">{totalRows}</span> keywords
          </div>

          <div className="flex items-center gap-4">
            <div className="text-sm text-muted-foreground">
              Page <span className="text-foreground font-medium">{totalPages === 0 ? 0 : pageIndex + 1}</span> of{" "}
              <span className="text-foreground font-medium">{totalPages}</span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setPageIndex(0)}
                disabled={isFirstPage}
                className="h-8"
              >
                First
              </Button>
              <Select value={String(pageSize)} onValueChange={(value) => setPageSize(Number(value))}>
                <SelectTrigger className="h-8 w-[92px]">
                  <SelectValue placeholder="Rows" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setPageIndex(pageIndex - 1)}
                disabled={isFirstPage}
                className="h-8"
              >
                Previous
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setPageIndex(pageIndex + 1)}
                disabled={isLastPage}
                className="h-8"
              >
                Next
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setPageIndex(totalPages > 0 ? totalPages - 1 : 0)}
                disabled={isLastPage}
                className="h-8"
              >
                Last
              </Button>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}

type TableRowProps = {
  row: Row<Keyword>
  index: number
  isSelected: boolean
  isRefreshing: boolean
  onRowClick: (keyword: Keyword) => void
}

const KeywordRow = memo(
  function KeywordRow({ row, index, isSelected, isRefreshing, onRowClick }: TableRowProps) {
    return (
      <tr
        onClick={() => onRowClick(row.original)}
        className={cn(
          "border-b border-border cursor-pointer group",
          index % 2 === 1 && "bg-muted/10",
          isSelected && "bg-amber-500/10",
          isRefreshing && "opacity-80"
        )}
      >
        {row.getVisibleCells().map((cell) => (
          <td
            key={cell.id}
            style={{ width: `${cell.column.getSize()}px` }}
            className={cn(
              "px-2 py-2 align-middle text-center",
              cell.column.id === "keyword" && "font-medium text-foreground",
              cell.column.id === "refresh" && "whitespace-nowrap"
            )}
          >
            {typeof cell.column.columnDef.cell === "function"
              ? cell.column.columnDef.cell(cell.getContext())
              : cell.getValue()}
          </td>
        ))}
      </tr>
    )
  },
  (prev, next) =>
    prev.row.id === next.row.id &&
    prev.index === next.index &&
    prev.isSelected === next.isSelected &&
    prev.isRefreshing === next.isRefreshing &&
    prev.row.original === next.row.original &&
    prev.onRowClick === next.onRowClick
)
