"use client"

// ============================================
// KEYWORD TABLE - Main Component (Refactored)
// ============================================
// Split into smaller sub-components
// ============================================

import { useState, useCallback, useMemo, useRef, useEffect } from "react"
import { TooltipProvider } from "@/components/ui/tooltip"
import { ArrowUpDown } from "lucide-react"

import type { Keyword } from "../types"
import { MOCK_KEYWORDS } from "../__mocks__/keyword-data"
import type { SortField, SortDirection } from "../constants/table-config"
import { KeywordTableRow } from "./KeywordTableRow"
import { 
  KeywordTableHeader, 
  KeywordTableFooter, 
  downloadKeywordsCSV,
  sortKeywords,
} from "./table"

export interface KeywordTableProps {
  keywords?: Keyword[]
  country?: string
  onKeywordClick?: (keyword: Keyword) => void
  onSelectionChange?: (selectedIds: number[]) => void
}

const ITEMS_PER_PAGE = 20

export function KeywordTable({ 
  keywords: keywordsProp, 
  country = "US",
  onKeywordClick,
  onSelectionChange 
}: KeywordTableProps) {
  const data = keywordsProp ?? MOCK_KEYWORDS
  
  // State
  const [page, setPage] = useState(1)
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set())
  const [selectAll, setSelectAll] = useState(false)
  const [sortField, setSortField] = useState<SortField>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")
  const [isExporting, setIsExporting] = useState(false)
  const exportTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Cleanup export timer on unmount
  useEffect(() => {
    return () => {
      if (exportTimerRef.current) {
        clearTimeout(exportTimerRef.current)
      }
    }
  }, [])

  // Export handler
  const handleExportCSV = useCallback(() => {
    setIsExporting(true)
    downloadKeywordsCSV(data, selectedRows)
    exportTimerRef.current = setTimeout(() => setIsExporting(false), 500)
  }, [data, selectedRows])

  // Selection handlers
  const handleSelectAll = useCallback(() => {
    const newSelected = selectAll ? new Set<number>() : new Set(data.map((k) => k.id))
    setSelectedRows(newSelected)
    setSelectAll(!selectAll)
    onSelectionChange?.(Array.from(newSelected))
  }, [selectAll, data, onSelectionChange])

  const handleSelectRow = useCallback((id: number) => {
    const newSelected = new Set(selectedRows)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedRows(newSelected)
    setSelectAll(newSelected.size === data.length)
    onSelectionChange?.(Array.from(newSelected))
  }, [selectedRows, data.length, onSelectionChange])

  // Sort handler
  const handleSort = useCallback((field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("desc")
    }
  }, [sortField, sortDirection])

  // Sorted keywords
  const sortedKeywords = useMemo(() => {
    return sortKeywords(data, sortField, sortDirection)
  }, [data, sortField, sortDirection])

  // Pagination
  const displayedKeywords = useMemo(() => {
    return sortedKeywords.slice(0, page * ITEMS_PER_PAGE)
  }, [sortedKeywords, page])

  const hasMore = displayedKeywords.length < sortedKeywords.length

  const handleLoadMore = useCallback(() => {
    setPage((prev) => prev + 1)
  }, [])

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex flex-col h-full">
        {/* Scroll hint */}
        <div className="text-[10px] sm:text-xs text-muted-foreground px-3 sm:px-4 py-1.5 sm:py-2 bg-muted/30 border-b border-border flex items-center gap-1.5 shrink-0">
          <ArrowUpDown className="h-3 w-3 rotate-90" />
          <span>Scroll horizontally to see all columns →</span>
        </div>
        
        {/* Scrollable Table Container */}
        <div className="flex-1 min-h-0 relative">
          <div className="absolute inset-0 overflow-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
            <table className="min-w-[1500px] w-full text-sm border-collapse">
              <KeywordTableHeader
                selectAll={selectAll}
                onSelectAll={handleSelectAll}
                sortField={sortField}
                sortDirection={sortDirection}
                onSort={handleSort}
                onExport={handleExportCSV}
                isExporting={isExporting}
                selectedCount={selectedRows.size}
              />
              <tbody>
                {displayedKeywords.map((item, index) => (
                  <KeywordTableRow
                    key={item.id}
                    item={item}
                    index={index}
                    isSelected={selectedRows.has(item.id)}
                    onSelect={handleSelectRow}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <KeywordTableFooter
          displayedCount={displayedKeywords.length}
          totalCount={sortedKeywords.length}
          selectedCount={selectedRows.size}
          hasMore={hasMore}
          onLoadMore={handleLoadMore}
        />
      </div>
    </TooltipProvider>
  )
}
