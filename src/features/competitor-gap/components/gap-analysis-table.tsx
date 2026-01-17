"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Target } from "lucide-react"
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  type RowSelectionState,
  type SortingState,
} from "@tanstack/react-table"
import { cn } from "@/lib/utils"
import { Checkbox } from "@/components/ui/checkbox"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import type { GapKeyword, SortField, SortDirection } from "../types"
import {
  IntentBadge,
  GapBadge,
  TrendIndicator,
  RanksDisplay,
  KDBar,
  SortHeader,
  AITipButton,
  ActionsDropdown,
  BulkActionsBar,
} from "./gap-analysis-table/index"

interface GapAnalysisTableProps {
  keywords: GapKeyword[]
  selectedRows: Set<string>
  addedKeywords: Set<string>
  sortField: SortField
  sortDirection: SortDirection
  onSort: (field: SortField) => void
  onSelectAll: (checked: boolean) => void
  onSelectRow: (id: string, checked: boolean) => void
  onAddToRoadmap: (keyword: GapKeyword) => void
  onBulkAddToRoadmap: () => void
  onClearSelection: () => void
  onWriteArticle?: (keyword: GapKeyword) => void
}

type ColumnMeta = {
  headerClassName?: string
  cellClassName?: string
}

const columnHelper = createColumnHelper<GapKeyword>()

export function GapAnalysisTable({
  keywords,
  selectedRows,
  addedKeywords,
  sortField,
  sortDirection,
  onSort,
  onSelectAll,
  onSelectRow,
  onAddToRoadmap,
  onBulkAddToRoadmap,
  onClearSelection,
  onWriteArticle,
}: GapAnalysisTableProps) {
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: Math.max(keywords.length, 1),
  })

  const handleWrite = useCallback((keyword: GapKeyword) => {
    if (onWriteArticle) {
      onWriteArticle(keyword)
    } else {
      console.log("Write article for:", keyword.keyword)
    }
  }, [onWriteArticle])

  useEffect(() => {
    setPagination((prev) => ({
      ...prev,
      pageIndex: 0,
      pageSize: Math.max(keywords.length, 1),
    }))
  }, [keywords.length])

  const volumeFormatter = useMemo(
    () =>
      new Intl.NumberFormat("en-US", {
        notation: "compact",
        maximumFractionDigits: 1,
      }),
    []
  )

  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
    []
  )

  const rowSelection = useMemo<RowSelectionState>(() => {
    const selection: RowSelectionState = {}
    selectedRows.forEach((id) => {
      selection[id] = true
    })
    return selection
  }, [selectedRows])

  const sortingState = useMemo<SortingState>(() => {
    if (!sortField) return []
    return [{ id: sortField, desc: sortDirection === "desc" }]
  }, [sortField, sortDirection])

  const columns = useMemo(
    () => [
      columnHelper.display({
        id: "select",
        header: () => null,
        cell: () => null,
        meta: {
          headerClassName: "w-12 pl-3 sm:pl-4 md:pl-6 pr-2 py-4",
          cellClassName: "pl-3 sm:pl-4 md:pl-6 pr-2 py-4",
        },
      }),
      columnHelper.accessor("keyword", {
        header: () => (
          <SortHeader
            label="Keyword"
            field="keyword"
            currentField={sortField}
            direction={sortDirection}
            onSort={onSort}
          />
        ),
        cell: ({ row }) => (
          <div className="space-y-1.5">
            <span className="text-sm font-medium text-foreground">
              {row.original.keyword}
            </span>
            <div>
              <IntentBadge intent={row.original.intent} />
            </div>
          </div>
        ),
        meta: {
          headerClassName: "px-4 py-4 text-left",
          cellClassName: "px-4 py-4",
        },
      }),
      columnHelper.display({
        id: "status",
        header: () => (
          <span className="text-xs font-semibold text-muted-foreground">Gap Status</span>
        ),
        cell: ({ row }) => (
          <div className="flex justify-center">
            <GapBadge gapType={row.original.gapType} />
          </div>
        ),
        meta: {
          headerClassName: "w-28 px-4 py-4 text-center",
          cellClassName: "px-4 py-4",
        },
      }),
      columnHelper.display({
        id: "rankings",
        header: () => (
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="text-xs font-semibold text-muted-foreground cursor-help border-b border-dashed border-muted-foreground/50">
                Rankings
              </span>
            </TooltipTrigger>
            <TooltipContent className="text-xs">
              <div className="space-y-1">
                <p>
                  <span className="text-emerald-600 dark:text-emerald-400">You</span>{" "}
                  / <span className="text-red-600 dark:text-red-400">C1</span> /{" "}
                  <span className="text-orange-600 dark:text-orange-400">C2</span>
                </p>
              </div>
            </TooltipContent>
          </Tooltip>
        ),
        cell: ({ row }) => (
          <div className="flex justify-center">
            <RanksDisplay
              yourRank={row.original.yourRank}
              comp1Rank={row.original.comp1Rank}
              comp2Rank={row.original.comp2Rank}
            />
          </div>
        ),
        meta: {
          headerClassName: "w-36 px-4 py-4 text-center",
          cellClassName: "px-4 py-4",
        },
      }),
      columnHelper.accessor("volume", {
        header: () => (
          <SortHeader
            label="Volume"
            field="volume"
            currentField={sortField}
            direction={sortDirection}
            onSort={onSort}
            className="justify-center"
          />
        ),
        cell: ({ row }) => (
          <span className="text-sm font-bold text-foreground tabular-nums">
            {volumeFormatter.format(row.original.volume)}
          </span>
        ),
        meta: {
          headerClassName: "w-24 px-4 py-4",
          cellClassName: "px-4 py-4 text-center",
        },
      }),
      columnHelper.accessor("cpc", {
        header: () => (
          <SortHeader
            label="CPC"
            field="cpc"
            currentField={sortField}
            direction={sortDirection}
            onSort={onSort}
            className="justify-center"
          />
        ),
        cell: ({ row }) => (
          <span className="text-sm font-semibold text-foreground tabular-nums">
            {currencyFormatter.format(row.original.cpc ?? 0)}
          </span>
        ),
        meta: {
          headerClassName: "w-24 px-4 py-4",
          cellClassName: "px-4 py-4 text-center",
        },
      }),
      columnHelper.accessor("kd", {
        header: () => (
          <SortHeader
            label="Difficulty"
            field="kd"
            currentField={sortField}
            direction={sortDirection}
            onSort={onSort}
            className="justify-center"
          />
        ),
        cell: ({ row }) => (
          <div className="flex justify-center">
            <KDBar kd={row.original.kd} />
          </div>
        ),
        meta: {
          headerClassName: "w-32 px-4 py-4",
          cellClassName: "px-4 py-4",
        },
      }),
      columnHelper.accessor("trend", {
        header: () => (
          <SortHeader
            label="Trend"
            field="trend"
            currentField={sortField}
            direction={sortDirection}
            onSort={onSort}
            className="justify-center"
          />
        ),
        cell: ({ row }) => (
          <div className="flex justify-center">
            <TrendIndicator trend={row.original.trend} />
          </div>
        ),
        meta: {
          headerClassName: "w-20 px-4 py-4",
          cellClassName: "px-4 py-4",
        },
      }),
      columnHelper.display({
        id: "actions",
        header: () => (
          <span className="text-xs font-semibold text-muted-foreground">Actions</span>
        ),
        cell: ({ row }) => (
          <div className="flex items-center justify-center gap-1">
            <AITipButton tip={row.original.aiTip} onWrite={() => handleWrite(row.original)} />
            <ActionsDropdown
              keyword={row.original}
              isAdded={addedKeywords.has(row.original.id)}
              onWrite={() => handleWrite(row.original)}
              onAddToCalendar={() => onAddToRoadmap(row.original)}
              onViewSerp={() =>
                window.open(
                  `https://google.com/search?q=${encodeURIComponent(row.original.keyword)}`,
                  "_blank"
                )
              }
              onCopy={() => navigator.clipboard.writeText(row.original.keyword)}
            />
          </div>
        ),
        meta: {
          headerClassName: "w-28 pl-4 pr-3 sm:pr-4 md:pr-6 py-4 text-center",
          cellClassName: "pl-4 pr-3 sm:pr-4 md:pr-6 py-4",
        },
      }),
    ],
    [
      addedKeywords,
      currencyFormatter,
      handleWrite,
      onAddToRoadmap,
      onSort,
      sortDirection,
      sortField,
      volumeFormatter,
    ]
  )

  const table = useReactTable({
    data: keywords,
    columns,
    state: {
      sorting: sortingState,
      rowSelection,
      pagination,
    },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualSorting: true,
    enableRowSelection: true,
    getRowId: (row) => row.id,
  })

  const pageRows = table.getPaginationRowModel().rows
  const allPageSelected = pageRows.length > 0 && pageRows.every((row) => selectedRows.has(row.id))
  const somePageSelected = pageRows.some((row) => selectedRows.has(row.id))

  const handleSelectAll = (checked: boolean) => {
    if (pageRows.length === keywords.length) {
      onSelectAll(checked)
      return
    }
    pageRows.forEach((row) => {
      onSelectRow(row.id, checked)
    })
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden -mx-3 sm:-mx-4 md:-mx-6">
      <BulkActionsBar
        selectedCount={selectedRows.size}
        onBulkAddToRoadmap={onBulkAddToRoadmap}
        onClearSelection={onClearSelection}
      />

      <div className="flex-1 overflow-auto">
        <div className="min-w-[800px]">
          <table className="w-full">
          <thead className="sticky top-0 z-10">
            <tr className="bg-background border-b border-border">
              {table.getHeaderGroups().map((headerGroup) =>
                headerGroup.headers.map((header) => {
                  const meta = header.column.columnDef.meta as ColumnMeta | undefined
                  if (header.column.id === "select") {
                    return (
                      <th key={header.id} className={meta?.headerClassName}>
                        <Checkbox
                          checked={allPageSelected ? true : somePageSelected ? "indeterminate" : false}
                          onCheckedChange={(checked) => handleSelectAll(!!checked)}
                          className="border-amber-500/50 data-[state=checked]:bg-amber-600 data-[state=checked]:border-amber-600"
                        />
                      </th>
                    )
                  }
                  return (
                    <th key={header.id} className={meta?.headerClassName}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  )
                })
              )}
            </tr>
          </thead>

          <tbody className="divide-y divide-border">
            {pageRows.map((row) => (
              <tr
                key={row.id}
                className={cn(
                  "group transition-all duration-150",
                  selectedRows.has(row.id)
                    ? "bg-amber-500/5 dark:bg-amber-500/10"
                    : "hover:bg-muted/50"
                )}
              >
                {row.getVisibleCells().map((cell) => {
                  const meta = cell.column.columnDef.meta as ColumnMeta | undefined
                  if (cell.column.id === "select") {
                    return (
                      <td key={cell.id} className={meta?.cellClassName}>
                        <Checkbox
                          checked={selectedRows.has(row.id)}
                          onCheckedChange={(checked) => onSelectRow(row.id, !!checked)}
                          className="border-amber-500/50 data-[state=checked]:bg-amber-600 data-[state=checked]:border-amber-600"
                        />
                      </td>
                    )
                  }
                  return (
                    <td key={cell.id} className={meta?.cellClassName}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
        </div>

        {keywords.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="p-4 rounded-2xl bg-muted border border-border mb-4">
              <Target className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-foreground text-sm font-medium">No keywords found</p>
            <p className="text-muted-foreground text-xs mt-1">Try adjusting your filters</p>
          </div>
        )}
      </div>
    </div>
  )
}
