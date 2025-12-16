"use client"

import { useState, useMemo } from "react"
import { cn } from "@/lib/utils"

import type { Column, DataTableProps, DataTableAction, SortDirection } from "./types"
import { DataTableToolbar } from "./DataTableToolbar"
import { DataTableHeader } from "./DataTableHeader"
import { DataTableBody } from "./DataTableBody"
import { DataTablePagination } from "./DataTablePagination"

export function DataTable<T extends { id?: string | number }>({
  data,
  columns,
  pageSize = 10,
  searchable = true,
  searchPlaceholder = "Search...",
  selectable = false,
  onSelectionChange,
  onRowClick,
  loading = false,
  emptyMessage = "No data available",
  actions,
  className,
}: DataTableProps<T>) {
  const [search, setSearch] = useState("")
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedRows, setSelectedRows] = useState<Set<string | number>>(new Set())

  // Filter and sort data
  const processedData = useMemo(() => {
    let result = [...data]

    // Search filter
    if (search) {
      result = result.filter((row) =>
        Object.values(row).some((value) =>
          String(value).toLowerCase().includes(search.toLowerCase())
        )
      )
    }

    // Sort
    if (sortKey) {
      result.sort((a, b) => {
        const aVal = (a as Record<string, unknown>)[sortKey]
        const bVal = (b as Record<string, unknown>)[sortKey]

        if (typeof aVal === "number" && typeof bVal === "number") {
          return sortDirection === "asc" ? aVal - bVal : bVal - aVal
        }

        const aStr = String(aVal).toLowerCase()
        const bStr = String(bVal).toLowerCase()
        return sortDirection === "asc"
          ? aStr.localeCompare(bStr)
          : bStr.localeCompare(aStr)
      })
    }

    return result
  }, [data, search, sortKey, sortDirection])

  // Pagination
  const totalPages = Math.ceil(processedData.length / pageSize)
  const paginatedData = processedData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )

  // Handle sort
  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortKey(key)
      setSortDirection("asc")
    }
  }

  // Handle selection
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const ids = paginatedData.map((row) => row.id).filter(Boolean) as (string | number)[]
      setSelectedRows(new Set(ids))
    } else {
      setSelectedRows(new Set())
    }
  }

  const handleSelectRow = (id: string | number) => {
    const newSelected = new Set(selectedRows)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedRows(newSelected)
    onSelectionChange?.(data.filter((row) => row.id && newSelected.has(row.id)))
  }

  const handleActionClick = (action: DataTableAction<T>) => {
    action.onClick(data.filter((row) => row.id && selectedRows.has(row.id)))
  }

  const handleSearchChange = (value: string) => {
    setSearch(value)
    setCurrentPage(1)
  }

  const allSelected = paginatedData.length > 0 && 
    paginatedData.every((row) => row.id && selectedRows.has(row.id))

  return (
    <div className={cn("space-y-4", className)}>
      {/* Toolbar */}
      <DataTableToolbar
        searchable={searchable}
        searchPlaceholder={searchPlaceholder}
        search={search}
        onSearchChange={handleSearchChange}
        selectedCount={selectedRows.size}
        actions={actions}
        onActionClick={handleActionClick}
      />

      {/* Table */}
      <div className="rounded-xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <DataTableHeader
              columns={columns}
              selectable={selectable}
              allSelected={allSelected}
              onSelectAll={handleSelectAll}
              sortKey={sortKey}
              sortDirection={sortDirection}
              onSort={handleSort}
            />
            <DataTableBody
              columns={columns}
              data={paginatedData}
              selectable={selectable}
              selectedRows={selectedRows}
              onSelectRow={handleSelectRow}
              onRowClick={onRowClick}
              loading={loading}
              emptyMessage={emptyMessage}
            />
          </table>
        </div>
      </div>

      {/* Pagination */}
      <DataTablePagination
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        totalItems={processedData.length}
        onPageChange={setCurrentPage}
      />
    </div>
  )
}
