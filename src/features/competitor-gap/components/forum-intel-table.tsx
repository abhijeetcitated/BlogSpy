"use client"

import { useCallback, useMemo } from "react"
import { Users, Flame } from "lucide-react"
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
import { Button } from "@/components/ui/button"
import type { ForumIntelPost, SortField, SortDirection } from "../types"
import {
  SourceBadge,
  ActionsDropdown,
} from "./forum-intel-table/index"

interface ForumIntelTableProps {
  posts?: ForumIntelPost[]
  data?: ForumIntelPost[]
  selectedRows: Set<string>
  sortField: SortField
  sortDirection: SortDirection
  onSort: (field: SortField) => void
  onSelectAll: (checked: boolean) => void
  onSelectRow: (id: string, checked: boolean) => void
  onWriteArticle?: (post: ForumIntelPost) => void
  onAddToCalendar?: (post: ForumIntelPost) => void
}

type ColumnMeta = {
  headerClassName?: string
  cellClassName?: string
}

const columnHelper = createColumnHelper<ForumIntelPost>()

export function ForumIntelTable({
  posts,
  data,
  selectedRows,
  sortField,
  sortDirection,
  onSort,
  onSelectAll,
  onSelectRow,
  onWriteArticle,
  onAddToCalendar,
}: ForumIntelTableProps) {
  const tablePosts = posts ?? data ?? []
  const handleWrite = useCallback((post: ForumIntelPost) => {
    if (onWriteArticle) {
      onWriteArticle(post)
    } else {
      console.log("Write article for:", post.topic)
    }
  }, [onWriteArticle])

  const handleAddToCalendar = useCallback((post: ForumIntelPost) => {
    if (onAddToCalendar) {
      onAddToCalendar(post)
    } else {
      console.log("Add to calendar:", post.topic)
    }
  }, [onAddToCalendar])

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

  const trafficFormatter = useMemo(
    () =>
      new Intl.NumberFormat("en-US", {
        notation: "compact",
        maximumFractionDigits: 1,
      }),
    []
  )

  const getCTR = useCallback((rank: number) => {
    if (rank <= 1) return 0.32
    if (rank === 2) return 0.18
    if (rank === 3) return 0.12
    if (rank <= 10) return 0.06
    if (rank <= 20) return 0.03
    return 0.01
  }, [])

  const formatFreshness = useCallback((date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const days = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)))
    if (days === 0) return "Last updated: today"
    if (days === 1) return "Last updated: 1 day ago"
    return `Last updated: ${days} days ago`
  }, [])

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
      columnHelper.accessor("topic", {
        header: () => (
          <span className="text-xs font-semibold text-slate-500 dark:text-zinc-500">Topic / Question</span>
        ),
        cell: ({ row }) => (
          <div className="max-w-md">
            <span className="text-sm font-medium text-slate-700 dark:text-zinc-300 line-clamp-2">
              {row.original.topic}
            </span>
            <div className="mt-1 text-[10px] text-slate-500 dark:text-zinc-500">
              {formatFreshness(
                typeof row.original.lastActive === "string"
                  ? new Date(row.original.lastActive)
                  : row.original.lastActive
              )}
            </div>
          </div>
        ),
        meta: {
          headerClassName: "text-left",
          cellClassName: "text-left",
        },
      }),
      columnHelper.display({
        id: "source",
        header: () => (
          <span className="text-xs font-semibold text-slate-500 dark:text-zinc-500">Source</span>
        ),
        cell: ({ row }) => (
          <div className="flex justify-center">
            <SourceBadge source={row.original.source} subSource={row.original.subSource} />
          </div>
        ),
        meta: {
          headerClassName: "w-28 text-center",
          cellClassName: "text-center",
        },
      }),
      columnHelper.accessor("serpRank", {
        header: () => (
          <span className="text-xs font-semibold text-slate-500 dark:text-zinc-500">SERP Rank</span>
        ),
        cell: ({ row }) => {
          const rank = row.original.serpRank
          const isTop = rank <= 3
          const isPageOne = rank > 3 && rank <= 10
          const badgeClass = isTop
            ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/40"
            : isPageOne
              ? "bg-yellow-500/15 text-yellow-700 dark:text-yellow-400 border border-yellow-500/40"
              : "bg-slate-200 text-slate-600 dark:bg-zinc-800/60 dark:text-zinc-300 border border-slate-300/60 dark:border-white/10"
          const label = isTop ? "Top Ranking" : isPageOne ? "Page 1" : "Beyond Page 1"
          return (
            <div className="flex flex-col items-center gap-1">
              <span className="text-xs font-semibold text-slate-700 dark:text-zinc-300">#{rank}</span>
              <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold", badgeClass)}>
                {isTop && <Flame className="w-3 h-3" />}
                {label}
              </span>
            </div>
          )
        },
        meta: {
          headerClassName: "w-28 text-center",
          cellClassName: "text-center",
        },
      }),
      columnHelper.accessor("monthlyVolume", {
        header: () => (
          <span className="text-xs font-semibold text-slate-500 dark:text-zinc-500">Est. Traffic</span>
        ),
        cell: ({ row }) => {
          const traffic =
            row.original.trafficEstimate ??
            Math.round(row.original.monthlyVolume * getCTR(row.original.serpRank))
          return (
            <span className="text-sm font-semibold text-slate-700 dark:text-zinc-300">
              {trafficFormatter.format(traffic)} visits
            </span>
          )
        },
        meta: {
          headerClassName: "w-28 text-center",
          cellClassName: "text-center",
        },
      }),
      columnHelper.accessor("lastActive", {
        header: () => (
          <span className="text-xs font-semibold text-slate-500 dark:text-zinc-500">Date</span>
        ),
        cell: ({ row }) => (
          <span className="text-xs text-slate-600 dark:text-zinc-400">
            {(typeof row.original.lastActive === "string"
              ? new Date(row.original.lastActive)
              : row.original.lastActive
            ).toISOString().split("T")[0]}
          </span>
        ),
        meta: {
          headerClassName: "w-28 text-center",
          cellClassName: "text-center",
        },
      }),
      columnHelper.display({
        id: "actions",
        header: () => (
          <span className="text-xs font-semibold text-slate-500 dark:text-zinc-500">Actions</span>
        ),
        cell: ({ row }) => (
          <div className="flex items-center justify-center gap-1">
            <ActionsDropdown
              post={row.original}
              onWrite={() => handleWrite(row.original)}
              onAddToCalendar={() => handleAddToCalendar(row.original)}
              onViewSource={() => window.open(row.original.url, "_blank")}
            />
          </div>
        ),
        meta: {
          headerClassName: "w-28 text-center",
          cellClassName: "text-center",
        },
      }),
    ],
    [formatFreshness, getCTR, handleAddToCalendar, handleWrite, trafficFormatter]
  )

  const table = useReactTable({
    data: tablePosts,
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
    if (pageRows.length === tablePosts.length) {
      onSelectAll(checked)
      return
    }
    pageRows.forEach((row) => {
      onSelectRow(row.id, checked)
    })
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden -mx-3 sm:-mx-4 md:-mx-6">
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

        {tablePosts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="p-4 rounded-2xl bg-muted border border-border mb-4">
              <Users className="w-8 h-8 text-slate-500 dark:text-zinc-500" />
            </div>
            <p className="text-slate-700 dark:text-zinc-300 text-sm font-medium">No forum discussions found</p>
            <p className="text-slate-500 dark:text-zinc-500 text-xs mt-1">Try searching for a different topic</p>
          </div>
        )}
      </div>
    </div>
  )
}
