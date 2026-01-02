// ============================================
// USE TABLE STATE - Table state management hook
// ============================================

"use client"

import { useState, useCallback, useMemo } from "react"
import type { Keyword, SortField, SortDirection, PaginationState } from "../types"
import { sortKeywords, getNextSortDirection } from "../utils/sort-utils"

interface UseTableStateOptions {
  initialPageSize?: number
  initialSortField?: SortField
  initialSortDirection?: SortDirection
}

interface UseTableStateReturn {
  // Pagination
  currentPage: number
  pageSize: number
  totalPages: (total: number) => number
  setPage: (page: number) => void
  setPageSize: (size: number) => void
  nextPage: () => void
  prevPage: () => void
  goToFirstPage: () => void
  goToLastPage: () => void
  
  // Sorting
  sortField: SortField | null
  sortDirection: SortDirection
  handleSort: (field: SortField) => void
  resetSort: () => void
  
  // Selection
  selectedIds: Set<string | number>
  isAllSelected: boolean
  isIndeterminate: boolean
  toggleSelection: (id: string | number) => void
  toggleSelectAll: (keywords: Keyword[]) => void
  clearSelection: () => void
  getSelectedKeywords: (keywords: Keyword[]) => Keyword[]
  
  // Data processing
  getPaginatedData: (keywords: Keyword[]) => Keyword[]
  getSortedData: (keywords: Keyword[]) => Keyword[]
  getProcessedData: (keywords: Keyword[]) => Keyword[]
  
  // Pagination info
  paginationInfo: (total: number) => PaginationState
}

export function useTableState(
  options: UseTableStateOptions = {}
): UseTableStateReturn {
  const {
    initialPageSize = 25,
    initialSortField = null,
    initialSortDirection = "desc",
  } = options

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSizeState] = useState(initialPageSize)

  // Sorting state
  const [sortField, setSortField] = useState<SortField | null>(initialSortField)
  const [sortDirection, setSortDirection] = useState<SortDirection>(initialSortDirection)

  // Selection state
  const [selectedIds, setSelectedIds] = useState<Set<string | number>>(new Set())

  // Pagination handlers
  const setPage = useCallback((page: number) => {
    setCurrentPage(Math.max(1, page))
  }, [])

  const setPageSize = useCallback((size: number) => {
    setPageSizeState(size)
    setCurrentPage(1)
  }, [])

  const nextPage = useCallback(() => {
    setCurrentPage((prev) => prev + 1)
  }, [])

  const prevPage = useCallback(() => {
    setCurrentPage((prev) => Math.max(1, prev - 1))
  }, [])

  const goToFirstPage = useCallback(() => {
    setCurrentPage(1)
  }, [])

  const goToLastPage = useCallback((total: number) => {
    setCurrentPage(Math.ceil(total / pageSize))
  }, [pageSize])

  // Sorting handlers
  const handleSort = useCallback((field: SortField) => {
    const newDirection = getNextSortDirection(sortField, sortDirection, field)
    setSortField(field)
    setSortDirection(newDirection)
    setCurrentPage(1)
  }, [sortField, sortDirection])

  const resetSort = useCallback(() => {
    setSortField(null)
    setSortDirection("desc")
  }, [])

  // Selection handlers
  const toggleSelection = useCallback((id: string | number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [])

  const toggleSelectAll = useCallback((keywords: Keyword[]) => {
    setSelectedIds((prev) => {
      const allIds = keywords.map((k) => k.id)
      const allSelected = allIds.every((id) => prev.has(id))
      
      if (allSelected) {
        return new Set()
      } else {
        return new Set(allIds)
      }
    })
  }, [])

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set())
  }, [])

  const getSelectedKeywords = useCallback(
    (keywords: Keyword[]) => {
      return keywords.filter((k) => selectedIds.has(k.id))
    },
    [selectedIds]
  )

  // Computed selection state
  const isAllSelected = useMemo(() => {
    return selectedIds.size > 0
  }, [selectedIds])

  const isIndeterminate = useMemo(() => {
    return selectedIds.size > 0
  }, [selectedIds])

  // Data processing
  const getSortedData = useCallback(
    (keywords: Keyword[]) => {
      if (!sortField) return keywords
      return sortKeywords(keywords, sortField, sortDirection)
    },
    [sortField, sortDirection]
  )

  const getPaginatedData = useCallback(
    (keywords: Keyword[]) => {
      const startIndex = (currentPage - 1) * pageSize
      return keywords.slice(startIndex, startIndex + pageSize)
    },
    [currentPage, pageSize]
  )

  const getProcessedData = useCallback(
    (keywords: Keyword[]) => {
      const sorted = getSortedData(keywords)
      return getPaginatedData(sorted)
    },
    [getSortedData, getPaginatedData]
  )

  // Pagination info
  const paginationInfo = useCallback(
    (total: number): PaginationState => {
      const totalPagesCount = Math.ceil(total / pageSize)
      return {
        page: currentPage,
        pageSize,
        totalPages: totalPagesCount,
        totalItems: total,
      }
    },
    [currentPage, pageSize]
  )

  const computeTotalPages = useCallback(
    (total: number) => Math.ceil(total / pageSize),
    [pageSize]
  )

  return {
    // Pagination
    currentPage,
    pageSize,
    totalPages: computeTotalPages,
    setPage,
    setPageSize,
    nextPage,
    prevPage,
    goToFirstPage,
    goToLastPage: () => goToLastPage(0),
    
    // Sorting
    sortField,
    sortDirection,
    handleSort,
    resetSort,
    
    // Selection
    selectedIds,
    isAllSelected,
    isIndeterminate,
    toggleSelection,
    toggleSelectAll,
    clearSelection,
    getSelectedKeywords,
    
    // Data processing
    getPaginatedData,
    getSortedData,
    getProcessedData,
    
    // Pagination info
    paginationInfo,
  }
}
