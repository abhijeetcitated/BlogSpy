"use client"

import { ChevronDown, ChevronUp, ArrowUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Checkbox } from "@/components/ui/checkbox"
import type { Column, SortDirection } from "./types"

interface DataTableHeaderProps<T> {
  columns: Column<T>[]
  selectable: boolean
  allSelected: boolean
  onSelectAll: (checked: boolean) => void
  sortKey: string | null
  sortDirection: SortDirection
  onSort: (key: string) => void
}

export function DataTableHeader<T>({
  columns,
  selectable,
  allSelected,
  onSelectAll,
  sortKey,
  sortDirection,
  onSort,
}: DataTableHeaderProps<T>) {
  return (
    <thead className="bg-slate-800/50">
      <tr>
        {selectable && (
          <th className="w-12 px-4 py-3">
            <Checkbox
              checked={allSelected}
              onCheckedChange={onSelectAll}
              className="border-slate-600"
            />
          </th>
        )}
        {columns.map((column) => (
          <th
            key={String(column.key)}
            className={cn(
              "px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider",
              column.align === "center" && "text-center",
              column.align === "right" && "text-right",
              column.sortable && "cursor-pointer hover:text-white transition-colors"
            )}
            style={{ width: column.width }}
            onClick={() => column.sortable && onSort(String(column.key))}
          >
            <div className="flex items-center gap-1">
              {column.header}
              {column.sortable && (
                <span className="text-slate-600">
                  {sortKey === column.key ? (
                    sortDirection === "asc" ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )
                  ) : (
                    <ArrowUpDown className="h-3 w-3" />
                  )}
                </span>
              )}
            </div>
          </th>
        ))}
      </tr>
    </thead>
  )
}
