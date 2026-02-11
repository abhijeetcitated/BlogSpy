"use client"

import { useCallback, useMemo, useState } from "react"
import { Target, Bot } from "lucide-react"
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
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import type { GapKeyword, ForumIntelPost, SortField, SortDirection } from "../types"
import { handleFeatureAccess } from "@/lib/feature-guard"
import {
  IntentBadge,
  GapBadge,
  TrendIndicator,
  RanksDisplay,
  KDBar,
  SortHeader,
  AITipButton,
  ActionsDropdown,
} from "./gap-analysis-table/index"
import { ForumIntelModal } from "./forum-intel-modal"

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
  onWriteArticle,
}: GapAnalysisTableProps) {
  const [forumDialogOpen, setForumDialogOpen] = useState(false)
  const [selectedKeywordForForum, setSelectedKeywordForForum] = useState<string | null>(null)
  const [forumData, setForumData] = useState<ForumIntelPost[]>([])
  const [isForumLoading, setIsForumLoading] = useState(false)
  const [forumSortField, setForumSortField] = useState<SortField>("opportunity")
  const [forumSortDirection, setForumSortDirection] = useState<SortDirection>("desc")
  const [forumSelectedRows, setForumSelectedRows] = useState<Set<string>>(new Set())

  const handleWrite = useCallback((keyword: GapKeyword) => {
    handleFeatureAccess("AI_WRITER", () => {
      if (onWriteArticle) {
        onWriteArticle(keyword)
      } else {
        console.log("Write article for:", keyword.keyword)
      }
    })
  }, [onWriteArticle])

  const handleForumSort = (field: SortField) => {
    if (forumSortField === field) {
      setForumSortDirection((prev) => (prev === "asc" ? "desc" : "asc"))
    } else {
      setForumSortField(field)
      setForumSortDirection("desc")
    }
  }

  const handleForumSelectAll = useCallback((checked: boolean) => {
    if (checked) {
      setForumSelectedRows(new Set(forumData.map((post) => post.id)))
    } else {
      setForumSelectedRows(new Set())
    }
  }, [forumData])

  const handleForumSelectRow = (id: string, checked: boolean) => {
    setForumSelectedRows((prev) => {
      const next = new Set(prev)
      if (checked) next.add(id)
      else next.delete(id)
      return next
    })
  }

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
          headerClassName: "w-12",
          cellClassName: "w-12",
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
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-700 dark:text-zinc-300">
                {row.original.keyword}
              </span>
              {row.original.hasZeroClickRisk && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="inline-flex items-center justify-center rounded-full border border-amber-500/40 bg-amber-500/10 p-1 text-amber-600 dark:text-amber-400">
                      <Bot className="h-3 w-3" />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent className="text-xs">
                    AI/Snippet dominates this keyword. Low click potential.
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
            <div>
              <IntentBadge intent={row.original.intent} />
            </div>
          </div>
        ),
        meta: {
          headerClassName: "text-left w-[40%] min-w-[300px]",
          cellClassName: "text-left w-[40%] min-w-[300px]",
        },
      }),
      columnHelper.display({
        id: "status",
        header: () => (
          <span className="text-xs font-semibold text-slate-500 dark:text-zinc-500">Gap Status</span>
        ),
        cell: ({ row }) => (
          <div className="flex justify-center">
            <GapBadge gapType={row.original.gapType} />
          </div>
        ),
        meta: {
          headerClassName: "w-[10%] text-center",
          cellClassName: "w-[10%] text-center",
        },
      }),
      columnHelper.display({
        id: "rankings",
        header: () => (
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="text-xs font-semibold text-slate-500 dark:text-zinc-500 cursor-help border-b border-dashed border-slate-500/50 dark:border-zinc-500/50">
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
          headerClassName: "w-[10%] text-center",
          cellClassName: "w-[10%] text-center",
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
          <span className="text-sm font-bold text-slate-700 dark:text-zinc-300 tabular-nums">
            {volumeFormatter.format(row.original.volume)}
          </span>
        ),
        meta: {
          headerClassName: "w-[10%] text-center",
          cellClassName: "w-[10%] text-center",
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
          <span className="text-sm font-semibold text-slate-700 dark:text-zinc-300 tabular-nums">
            {currencyFormatter.format(row.original.cpc ?? 0)}
          </span>
        ),
        meta: {
          headerClassName: "w-[10%] text-center",
          cellClassName: "w-[10%] text-center",
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
          headerClassName: "w-[10%] text-center",
          cellClassName: "w-[10%] text-center",
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
          headerClassName: "w-[5%] text-center",
          cellClassName: "w-[5%] text-center",
        },
      }),
      columnHelper.display({
        id: "actions",
        header: () => (
          <span className="text-xs font-semibold text-slate-500 dark:text-zinc-500">Actions</span>
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
          headerClassName: "w-[5%] text-center",
          cellClassName: "w-[5%] text-center",
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
    },
    initialState: {
      pagination: {
        pageSize: 50,
      },
    },
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
      <ForumIntelModal
        isOpen={forumDialogOpen}
        onClose={() => setForumDialogOpen(false)}
        keyword={selectedKeywordForForum}
        data={forumData}
        isLoading={isForumLoading}
        selectedRows={forumSelectedRows}
        sortField={forumSortField}
        sortDirection={forumSortDirection}
        onSort={handleForumSort}
        onSelectAll={handleForumSelectAll}
        onSelectRow={handleForumSelectRow}
      />
      <div className="flex-1 overflow-auto">
        <div className="rounded-md border border-slate-200 bg-white dark:border-white/10 dark:bg-zinc-950">
          <div className="overflow-x-auto">
            <div className="min-w-[800px]">
              <table className="w-full">
                <thead className="sticky top-0 z-10">
                  <tr className="bg-slate-50 border-b border-slate-200 dark:bg-zinc-900/50 dark:border-white/5">
                    {table.getHeaderGroups().map((headerGroup) =>
                      headerGroup.headers.map((header) => {
                        const meta = header.column.columnDef.meta as ColumnMeta | undefined
                        if (header.column.id === "select") {
                          return (
                            <th
                              key={header.id}
                              className={cn(
                                "h-10 px-4 text-left align-middle font-medium text-slate-500 dark:text-zinc-500 [&:has([role=checkbox])]:pr-0 uppercase text-xs tracking-wider font-bold",
                                meta?.headerClassName
                              )}
                            >
                              <Checkbox
                                checked={allPageSelected ? true : somePageSelected ? "indeterminate" : false}
                                onCheckedChange={(checked) => handleSelectAll(!!checked)}
                                className="border-slate-500/50 data-[state=checked]:bg-slate-600 data-[state=checked]:border-slate-600"
                              />
                            </th>
                          )
                        }
                        return (
                          <th
                            key={header.id}
                            className={cn(
                              "h-10 px-4 text-left align-middle font-medium text-slate-500 dark:text-zinc-500 [&:has([role=checkbox])]:pr-0 uppercase text-xs tracking-wider font-bold",
                              meta?.headerClassName
                            )}
                          >
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
                        "border-b border-slate-200 bg-transparent transition-colors hover:bg-slate-50 data-[state=selected]:bg-slate-100 dark:border-zinc-800 dark:hover:bg-zinc-900 dark:data-[state=selected]:bg-white/5",
                        selectedRows.has(row.id)
                          ? "bg-slate-100 dark:bg-white/5"
                          : "hover:bg-slate-50 dark:hover:bg-white/5"
                      )}
                    >
                      {row.getVisibleCells().map((cell) => {
                        const meta = cell.column.columnDef.meta as ColumnMeta | undefined
                        if (cell.column.id === "select") {
                          return (
                            <td
                              key={cell.id}
                              className={cn(
                                "p-4 align-middle [&:has([role=checkbox])]:pr-0 text-sm text-slate-900 dark:text-zinc-300 whitespace-nowrap",
                                meta?.cellClassName
                              )}
                            >
                              <Checkbox
                                checked={selectedRows.has(row.id)}
                                onCheckedChange={(checked) => onSelectRow(row.id, !!checked)}
                                className="border-slate-500/50 data-[state=checked]:bg-slate-600 data-[state=checked]:border-slate-600"
                              />
                            </td>
                          )
                        }
                        return (
                          <td
                            key={cell.id}
                            className={cn(
                              "p-4 align-middle [&:has([role=checkbox])]:pr-0 text-sm text-slate-900 dark:text-zinc-300 whitespace-nowrap",
                              meta?.cellClassName
                            )}
                          >
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-4 border-t border-slate-200 bg-white dark:border-white/10 dark:bg-zinc-950">
            <div className="flex-1 text-sm text-slate-500 dark:text-zinc-500">
              {table.getFilteredSelectedRowModel().rows.length} of{" "}
              {table.getFilteredRowModel().rows.length} row(s) selected.
            </div>

            <div className="w-full sm:w-auto flex justify-between sm:justify-end items-center space-x-2">
              <div className="text-sm text-gray-400 mr-4">
                Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="bg-white border-slate-200 hover:bg-slate-50 text-slate-700 dark:bg-zinc-900 dark:border-white/10 dark:hover:bg-zinc-800 dark:text-gray-300"
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="bg-white border-slate-200 hover:bg-slate-50 text-slate-700 dark:bg-zinc-900 dark:border-white/10 dark:hover:bg-zinc-800 dark:text-gray-300"
              >
                Next
              </Button>
            </div>
          </div>
        </div>

        {keywords.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="p-4 rounded-2xl bg-muted border border-border mb-4">
              <Target className="w-8 h-8 text-slate-500 dark:text-zinc-500" />
            </div>
            <p className="text-slate-700 dark:text-zinc-300 text-sm font-medium">No keywords found</p>
            <p className="text-slate-500 dark:text-zinc-500 text-xs mt-1">Try adjusting your filters</p>
          </div>
        )}
      </div>
    </div>
  )
}
