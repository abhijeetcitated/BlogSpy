"use client"

// ============================================
// KEYWORD DATA TABLE - TanStack Table v8
// ============================================
// Modern table with sorting, pagination, selection
// Connected to Zustand store (useKeywordStore)
// ============================================

import { useMemo, useCallback } from "react"
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  flexRender,
  SortingState,
  RowSelectionState,
  PaginationState,
} from "@tanstack/react-table"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"
import { cn } from "@/lib/utils"

import { useKeywordStore } from "../../store"
import { createColumns } from "./columns/columns"
import { applyFilters } from "../../utils/filter-utils"
import type { Keyword } from "../../types"

// ============================================
// PROPS INTERFACE
// ============================================

export interface KeywordDataTableProps {
  /** Override keywords (if not using store) */
  keywords?: Keyword[]
  /** Country code for data context */
  country?: string
  /** Callback when keyword row is clicked */
  onKeywordClick?: (keyword: Keyword) => void
  /** Whether user is guest (gates actions) */
  isGuest?: boolean
  /** Rows per page (default: 20) */
  pageSize?: number
}

// ============================================
// MAIN COMPONENT
// ============================================

export function KeywordDataTable({
  keywords: keywordsProp,
  country: _country = "US",
  onKeywordClick,
  isGuest = false,
  pageSize: defaultPageSize = 20,
}: KeywordDataTableProps) {
  // Reserved for future use
  void _country
  
  // ─────────────────────────────────────────
  // ZUSTAND STORE CONNECTION
  // ─────────────────────────────────────────
  const storeKeywords = useKeywordStore((state) => state.keywords)
  const filters = useKeywordStore((state) => state.filters)
  const selectedIds = useKeywordStore((state) => state.selectedIds)
  const selectKeyword = useKeywordStore((state) => state.selectKeyword)
  const deselectKeyword = useKeywordStore((state) => state.deselectKeyword)
  const _selectAll = useKeywordStore((state) => state.selectAll)
  const deselectAll = useKeywordStore((state) => state.deselectAll)
  const updateKeyword = useKeywordStore((state) => state.updateKeyword)
  const sort = useKeywordStore((state) => state.sort)
  const setSort = useKeywordStore((state) => state.setSort)
  
  // Reserved for future use
  void _selectAll

  // Use prop keywords or store keywords
  const rawKeywords = keywordsProp ?? storeKeywords

  // ─────────────────────────────────────────
  // APPLY FILTERS (Client-side filtering)
  // ─────────────────────────────────────────
  const filteredKeywords = useMemo(() => {
    return applyFilters(rawKeywords, filters)
  }, [rawKeywords, filters])

  // ─────────────────────────────────────────
  // TANSTACK TABLE STATE
  // ─────────────────────────────────────────
  
  // Sorting state (sync with Zustand)
  const sorting: SortingState = useMemo(() => {
    if (!sort.field) return []
    return [{ id: sort.field, desc: sort.direction === "desc" }]
  }, [sort])

  const onSortingChange = useCallback(
    (updater: SortingState | ((old: SortingState) => SortingState)) => {
      const newSorting = typeof updater === "function" ? updater(sorting) : updater
      if (newSorting.length > 0) {
        const { id, desc } = newSorting[0]
        setSort(id as typeof sort.field, desc ? "desc" : "asc")
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sorting, setSort]
  )

  // Row selection state (sync with Zustand)
  const rowSelection: RowSelectionState = useMemo(() => {
    const selection: RowSelectionState = {}
    filteredKeywords.forEach((k, index) => {
      if (selectedIds.has(k.id)) {
        selection[index] = true
      }
    })
    return selection
  }, [selectedIds, filteredKeywords])

  const onRowSelectionChange = useCallback(
    (updater: RowSelectionState | ((old: RowSelectionState) => RowSelectionState)) => {
      const newSelection = typeof updater === "function" ? updater(rowSelection) : updater
      
      // Sync with Zustand store
      filteredKeywords.forEach((k, index) => {
        const isSelected = newSelection[index] === true
        const wasSelected = selectedIds.has(k.id)
        
        if (isSelected && !wasSelected) {
          selectKeyword(k.id)
        } else if (!isSelected && wasSelected) {
          deselectKeyword(k.id)
        }
      })
    },
    [rowSelection, filteredKeywords, selectedIds, selectKeyword, deselectKeyword]
  )

  // Pagination state
  const pagination: PaginationState = useMemo(
    () => ({
      pageIndex: 0,
      pageSize: defaultPageSize,
    }),
    [defaultPageSize]
  )

  // ─────────────────────────────────────────
  // HANDLERS
  // ─────────────────────────────────────────
  const handleRefresh = useCallback(
    (id: number) => {
      if (isGuest) {
        // TODO: Show login prompt
        return
      }
      
      // Set refreshing state
      updateKeyword(id, { isRefreshing: true })
      
      // Simulate API call (replace with real call later)
      setTimeout(() => {
        updateKeyword(id, {
          isRefreshing: false,
          lastUpdated: new Date(),
          // Mock: slightly change volume
          volume: rawKeywords.find((k) => k.id === id)?.volume ?? 0 + Math.floor(Math.random() * 100 - 50),
        })
      }, 1500)
    },
    [isGuest, updateKeyword, rawKeywords]
  )

  const isRefreshing = useCallback(
    (id: number) => {
      return rawKeywords.find((k) => k.id === id)?.isRefreshing ?? false
    },
    [rawKeywords]
  )

  // ─────────────────────────────────────────
  // CREATE COLUMNS
  // ─────────────────────────────────────────
  const columns = useMemo(
    () =>
      createColumns({
        onKeywordClick,
        onRefresh: handleRefresh,
        isRefreshing,
      }),
    [onKeywordClick, handleRefresh, isRefreshing]
  )

  // ─────────────────────────────────────────
  // TANSTACK TABLE INSTANCE
  // ─────────────────────────────────────────
  const table = useReactTable({
    data: filteredKeywords,
    columns,
    state: {
      sorting,
      rowSelection,
      pagination,
    },
    onSortingChange,
    onRowSelectionChange,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    enableRowSelection: true,
    getRowId: (row) => String(row.id),
  })

  // ─────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────
  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex flex-col h-full w-full">
        {/* Selection Info Bar */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-muted/30 shrink-0">
          <span className="text-xs text-muted-foreground">
            {table.getFilteredSelectedRowModel().rows.length > 0
              ? `${table.getFilteredSelectedRowModel().rows.length} of ${filteredKeywords.length} keywords selected`
              : `${filteredKeywords.length} keywords`}
          </span>
          {table.getFilteredSelectedRowModel().rows.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-xs"
              onClick={() => deselectAll()}
            >
              Clear selection
            </Button>
          )}
        </div>

        {/* TABLE */}
        <div className="flex-1 overflow-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-background z-10">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className={cn(
                        "text-xs font-medium text-muted-foreground whitespace-nowrap",
                        (header.column.columnDef.meta as { headerClassName?: string })?.headerClassName
                      )}
                      style={{ width: header.getSize() }}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className={cn(
                      "hover:bg-muted/50 cursor-pointer",
                      row.getIsSelected() && "bg-primary/5"
                    )}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className={cn(
                          "py-2.5",
                          (cell.column.columnDef.meta as { className?: string })?.className
                        )}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                      <span>No keywords found</span>
                      <span className="text-xs">Try adjusting your filters or search query</span>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Footer */}
        <div className="flex items-center justify-between px-3 py-2 border-t border-border bg-muted/30 shrink-0">
          <div className="text-xs text-muted-foreground">
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
            {" · "}
            {filteredKeywords.length} total keywords
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronsLeft className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            <span className="px-2 text-xs tabular-nums">
              {table.getState().pagination.pageIndex + 1}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <ChevronsRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}

export default KeywordDataTable
