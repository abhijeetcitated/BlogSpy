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
} from "@tanstack/react-table"
import { Check, Copy, Download, Lock, Share2 } from "lucide-react"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

import type { Keyword } from "../../types"
import { CreditBalance } from "../header/CreditBalance"
import { downloadKeywordsCSV } from "../../utils/export-utils"
import { useKeywordStore } from "../../store"
import { createKeywordColumns } from "./columns/columns"

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

  // Keep Zustand selection in sync (used by RefreshCreditsHeader)
  const setSelectedIds = useKeywordStore((state) => state.setSelectedIds)

  // Reset selection when data changes (prevents stale selections across searches/filters)
  useEffect(() => {
    setRowSelection({})
    setSelectedIds([])
  }, [data, setSelectedIds])

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
  // COLUMN DEFINITIONS
  // ============================================
  const columns = useMemo(() => createKeywordColumns({ isGuest }), [isGuest])

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

  // Sync TanStack selection -> Zustand selection (for bulk refresh header)
  useEffect(() => {
    setSelectedIds(selectedRowIds)
  }, [selectedRowIds, setSelectedIds])

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
    // Requirement: route differs by auth (guest vs authenticated)
    const destination = isGuest ? "/topic-clusters" : "/dashboard/strategy/topic-clusters"

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

      router.push(destination)
    })
  }, [data, guardAction, isGuest, router, selectedRowIds])

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
              className={cn(
                "col-span-1 md:w-auto h-7 gap-1.5 text-xs",
                "bg-[#F59E0B] hover:bg-[#D97706] text-black font-bold",
                "border border-[#B45309] shadow-sm transition-all active:scale-95"
              )}
            >
              {isGuest && <Lock className="h-3 w-3 text-black" />}
              <Share2 className="h-3.5 w-3.5 text-black" />
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
                <tr
                  key={row.id}
                  onClick={() => onKeywordClick?.(row.original)}
                  className={cn(
                    "border-b border-border cursor-pointer group",
                    index % 2 === 1 && "bg-muted/10",
                    row.getIsSelected() && "bg-amber-500/10"
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
