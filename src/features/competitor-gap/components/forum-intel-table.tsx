"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Users, Sparkles } from "lucide-react"
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  type RowSelectionState,
  type SortingState,
} from "@tanstack/react-table"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { Checkbox } from "@/components/ui/checkbox"
import type { ForumIntelPost, SortField, SortDirection, RelatedKeyword } from "../types"
import {
  SourceBadge,
  CompetitionBadge,
  OpportunityScore,
  EngagementDisplay,
  SortHeader,
  RelatedKeywordsButton,
  ActionsDropdown,
  BulkActionsBar,
} from "./forum-intel-table/index"

interface ForumIntelTableProps {
  posts: ForumIntelPost[]
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
  selectedRows,
  sortField,
  sortDirection,
  onSort,
  onSelectAll,
  onSelectRow,
  onWriteArticle,
  onAddToCalendar,
}: ForumIntelTableProps) {
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: Math.max(posts.length, 1),
  })

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

  const copyAllKeywords = (keywords: RelatedKeyword[]) => {
    const text = keywords.map(k => k.keyword).join("\n")
    navigator.clipboard.writeText(text)
    toast.success("✓ Copied to Clipboard", {
      description: `${keywords.length} keywords copied`,
      duration: 2000,
    })
  }

  useEffect(() => {
    setPagination((prev) => ({
      ...prev,
      pageIndex: 0,
      pageSize: Math.max(posts.length, 1),
    }))
  }, [posts.length])

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
      columnHelper.accessor("topic", {
        header: () => (
          <span className="text-xs font-semibold text-muted-foreground">Topic / Question</span>
        ),
        cell: ({ row }) => (
          <div className="max-w-md">
            <span className="text-sm font-medium text-foreground line-clamp-2">
              {row.original.topic}
            </span>
            {row.original.opportunityLevel === "high" && (
              <div className="flex items-center gap-1 mt-1.5 text-[10px] text-emerald-600 dark:text-emerald-400">
                <Sparkles className="w-3 h-3" />
                <span>High opportunity</span>
              </div>
            )}
          </div>
        ),
        meta: {
          headerClassName: "px-4 py-4 text-left",
          cellClassName: "px-4 py-4",
        },
      }),
      columnHelper.display({
        id: "source",
        header: () => (
          <span className="text-xs font-semibold text-muted-foreground">Source</span>
        ),
        cell: ({ row }) => (
          <div className="flex justify-center">
            <SourceBadge source={row.original.source} subSource={row.original.subSource} />
          </div>
        ),
        meta: {
          headerClassName: "w-28 px-4 py-4 text-center",
          cellClassName: "px-4 py-4",
        },
      }),
      columnHelper.accessor("upvotes", {
        header: () => (
          <SortHeader
            label="Engagement"
            field="engagement"
            currentField={sortField}
            direction={sortDirection}
            onSort={onSort}
            className="justify-center"
          />
        ),
        cell: ({ row }) => (
          <div className="flex justify-center">
            <EngagementDisplay upvotes={row.original.upvotes} comments={row.original.comments} />
          </div>
        ),
        meta: {
          headerClassName: "w-32 px-4 py-4",
          cellClassName: "px-4 py-4",
        },
      }),
      columnHelper.display({
        id: "competition",
        header: () => (
          <span className="text-xs font-semibold text-muted-foreground">Competition</span>
        ),
        cell: ({ row }) => (
          <div className="flex justify-center">
            <CompetitionBadge
              level={row.original.competitionLevel}
              articles={row.original.existingArticles}
            />
          </div>
        ),
        meta: {
          headerClassName: "w-28 px-4 py-4 text-center",
          cellClassName: "px-4 py-4",
        },
      }),
      columnHelper.accessor("opportunityScore", {
        header: () => (
          <SortHeader
            label="Opportunity"
            field="opportunity"
            currentField={sortField}
            direction={sortDirection}
            onSort={onSort}
            className="justify-center"
          />
        ),
        cell: ({ row }) => (
          <div className="flex justify-center">
            <OpportunityScore score={row.original.opportunityScore} />
          </div>
        ),
        meta: {
          headerClassName: "w-28 px-4 py-4",
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
            <RelatedKeywordsButton
              keywords={row.original.relatedKeywords}
              onCopyAll={() => copyAllKeywords(row.original.relatedKeywords)}
            />
            <ActionsDropdown
              post={row.original}
              onWrite={() => handleWrite(row.original)}
              onAddToCalendar={() => handleAddToCalendar(row.original)}
              onViewSource={() => window.open(row.original.url, "_blank")}
            />
          </div>
        ),
        meta: {
          headerClassName: "w-28 pl-4 pr-3 sm:pr-4 md:pr-6 py-4 text-center",
          cellClassName: "pl-4 pr-3 sm:pr-4 md:pr-6 py-4",
        },
      }),
    ],
    [handleAddToCalendar, handleWrite, onSort, sortDirection, sortField]
  )

  const table = useReactTable({
    data: posts,
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
    if (pageRows.length === posts.length) {
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
        onClearSelection={() => onSelectAll(false)}
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
                          className="border-emerald-500/50 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
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
                    ? "bg-emerald-500/5 dark:bg-emerald-500/10" 
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
                          className="border-emerald-500/50 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
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

        {posts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="p-4 rounded-2xl bg-muted border border-border mb-4">
              <Users className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-foreground text-sm font-medium">No forum discussions found</p>
            <p className="text-muted-foreground text-xs mt-1">Try searching for a different topic</p>
          </div>
        )}
      </div>
    </div>
  )
}
