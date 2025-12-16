// Data Table Types

export interface Column<T> {
  key: keyof T | string
  header: string
  sortable?: boolean
  width?: string
  align?: "left" | "center" | "right"
  render?: (value: unknown, row: T, index: number) => React.ReactNode
}

export interface DataTableAction<T> {
  label: string
  icon?: React.ReactNode
  onClick: (selectedRows: T[]) => void
}

export interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  pageSize?: number
  searchable?: boolean
  searchPlaceholder?: string
  selectable?: boolean
  onSelectionChange?: (selectedRows: T[]) => void
  onRowClick?: (row: T) => void
  loading?: boolean
  emptyMessage?: string
  actions?: DataTableAction<T>[]
  className?: string
}

export type SortDirection = "asc" | "desc"

export interface DataTableState {
  search: string
  sortKey: string | null
  sortDirection: SortDirection
  currentPage: number
  selectedRows: Set<string | number>
}
