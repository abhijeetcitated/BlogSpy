"use client"

import { cn } from "@/lib/utils"
import { Checkbox } from "@/components/ui/checkbox"
import type { Column } from "./types"

interface DataTableBodyProps<T> {
  columns: Column<T>[]
  data: T[]
  selectable: boolean
  selectedRows: Set<string | number>
  onSelectRow: (id: string | number) => void
  onRowClick?: (row: T) => void
  loading: boolean
  emptyMessage: string
}

export function DataTableBody<T extends { id?: string | number }>({
  columns,
  data,
  selectable,
  selectedRows,
  onSelectRow,
  onRowClick,
  loading,
  emptyMessage,
}: DataTableBodyProps<T>) {
  const colSpan = columns.length + (selectable ? 1 : 0)

  if (loading) {
    return (
      <tbody>
        <tr>
          <td colSpan={colSpan} className="px-4 py-12 text-center text-slate-400">
            Loading...
          </td>
        </tr>
      </tbody>
    )
  }

  if (data.length === 0) {
    return (
      <tbody>
        <tr>
          <td colSpan={colSpan} className="px-4 py-12 text-center text-slate-400">
            {emptyMessage}
          </td>
        </tr>
      </tbody>
    )
  }

  return (
    <tbody className="divide-y divide-slate-800">
      {data.map((row, rowIndex) => (
        <tr
          key={row.id ?? rowIndex}
          onClick={() => onRowClick?.(row)}
          className={cn(
            "bg-slate-900/30 hover:bg-slate-800/50 transition-colors",
            onRowClick && "cursor-pointer",
            row.id && selectedRows.has(row.id) && "bg-emerald-500/10"
          )}
        >
          {selectable && (
            <td className="px-4 py-3">
              <Checkbox
                checked={row.id ? selectedRows.has(row.id) : false}
                onCheckedChange={() => row.id && onSelectRow(row.id)}
                onClick={(e) => e.stopPropagation()}
                className="border-slate-600"
              />
            </td>
          )}
          {columns.map((column) => (
            <td
              key={String(column.key)}
              className={cn(
                "px-4 py-3 text-sm text-slate-300",
                column.align === "center" && "text-center",
                column.align === "right" && "text-right"
              )}
            >
              {column.render
                ? column.render(
                    (row as Record<string, unknown>)[String(column.key)],
                    row,
                    rowIndex
                  )
                : String((row as Record<string, unknown>)[String(column.key)] ?? "-")}
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  )
}
