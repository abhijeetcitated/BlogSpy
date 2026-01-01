"use client"

// ============================================
// KEYWORD TABLE - Main Component (Streamlined 10 Columns)
// ============================================
// Refactored for better UX: 10 high-value columns
// ============================================

import { useState, useCallback, useMemo, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"
import { Download, Copy, Check, Share2 } from "lucide-react"
import { cn } from "@/lib/utils"

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
  // Use state for keywords to allow refresh updates
  const [keywords, setKeywords] = useState<Keyword[]>(keywordsProp ?? MOCK_KEYWORDS)
  const data = keywords
  
  // Update keywords when prop changes
  useEffect(() => {
    if (keywordsProp) {
      setKeywords(keywordsProp)
    }
  }, [keywordsProp])
  
  // State
  const [page, setPage] = useState(1)
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set())
  const [selectAll, setSelectAll] = useState(false)
  const [sortField, setSortField] = useState<SortField>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")
  const [isExporting, setIsExporting] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const exportTimerRef = useRef<NodeJS.Timeout | null>(null)
  const copyTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (exportTimerRef.current) {
        clearTimeout(exportTimerRef.current)
      }
      if (copyTimerRef.current) {
        clearTimeout(copyTimerRef.current)
      }
    }
  }, [])

  // Copy handler - copies selected keywords data to clipboard
  const handleCopy = useCallback(() => {
    const keywordsToCopy = selectedRows.size > 0 
      ? keywords.filter(k => selectedRows.has(k.id))
      : []
    
    if (keywordsToCopy.length === 0) return
    
    // Format data as tab-separated for easy paste into Excel/Sheets
    const header = "Keyword\tIntent\tVolume\tKD%\tCPC\tGEO\tSERP Features"
    const rows = keywordsToCopy.map(k => {
      const serpFeatures = k.serpFeatures?.join(', ') || '-'
      return `${k.keyword}\t${k.intent || '-'}\t${k.volume}\t${k.difficulty}%\t$${k.cpc.toFixed(2)}\t${k.geoScore || '-'}\t${serpFeatures}`
    })
    
    const copyText = [header, ...rows].join('\n')
    
    navigator.clipboard.writeText(copyText).then(() => {
      setIsCopied(true)
      copyTimerRef.current = setTimeout(() => setIsCopied(false), 2000)
    })
  }, [selectedRows, keywords])

  // Router for navigation
  const router = useRouter()

  // Export to Topic Cluster handler
  const handleExportToTopicCluster = useCallback(() => {
    // Get keywords to export - selected ones or all
    const keywordsToExport = selectedRows.size > 0 
      ? keywords.filter(k => selectedRows.has(k.id))
      : keywords
    
    // Store keywords in localStorage for Topic Cluster page to read
    const exportData = keywordsToExport.map(k => ({
      keyword: k.keyword,
      volume: k.volume,
      difficulty: k.difficulty,
      cpc: k.cpc,
      intent: k.intent,
      geoScore: k.geoScore,
      serpFeatures: k.serpFeatures
    }))
    
    localStorage.setItem('keyword-explorer-export', JSON.stringify(exportData))
    localStorage.setItem('keyword-explorer-export-time', new Date().toISOString())
    
    // Navigate to Topic Clusters page
    router.push('/topic-clusters')
  }, [selectedRows, keywords, router])

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

  // Refresh handler
  const handleRefresh = useCallback((id: number) => {
    // Set refreshing state
    setKeywords(prev => prev.map(k => k.id === id ? { ...k, isRefreshing: true } : k))
    
    // Simulate API call - replace with actual API call later
    setTimeout(() => {
      setKeywords(prev => prev.map(k => 
        k.id === id 
          ? { 
              ...k, 
              isRefreshing: false, 
              lastUpdated: new Date(),
              // Mock: slightly change volume to show update
              volume: k.volume + Math.floor(Math.random() * 100 - 50)
            } 
          : k
      ))
    }, 1500)
  }, [])

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
      <div className="flex flex-col h-full w-full max-w-full">
        {/* Export Bar - Outside Table */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-muted/50">
          <span className="text-xs text-muted-foreground">
            {selectedRows.size > 0 ? `${selectedRows.size} keywords selected` : 'Select keywords to export'}
          </span>
          <div className="flex items-center gap-2">
            {/* Copy Button - Only shows when keywords are selected */}
            {selectedRows.size > 0 && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleCopy}
                className={cn(
                  "h-7 gap-1.5 text-xs transition-all",
                  isCopied && "text-emerald-600 border-emerald-500"
                )}
              >
                {isCopied ? (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    Copy {selectedRows.size}
                  </>
                )}
              </Button>
            )}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleExportCSV} 
              disabled={isExporting}
              className="h-7 gap-1.5 text-xs"
            >
              <Download className={cn("h-3.5 w-3.5", isExporting && "animate-pulse")} />
              {selectedRows.size > 0 ? `Export ${selectedRows.size} Selected` : 'Export All CSV'}
            </Button>
            <Button 
              variant="default" 
              size="sm" 
              onClick={handleExportToTopicCluster}
              className="h-7 gap-1.5 text-xs bg-violet-600 hover:bg-violet-700"
            >
              <Share2 className="h-3.5 w-3.5" />
              {selectedRows.size > 0 ? `To Clusters (${selectedRows.size})` : 'To Topic Clusters'}
            </Button>
          </div>
        </div>

        {/* Table Container - Horizontal scroll on mobile/tablet, hidden on desktop */}
        <div className="flex-1 min-h-0 relative w-full overflow-x-auto lg:overflow-x-hidden overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
          <div className="min-w-[800px] lg:min-w-0">
            <table className="w-full text-sm border-collapse table-fixed max-w-full">
              {/* Column widths definition - 11 columns (Action removed) */}
              <colgroup>
                <col style={{ width: '32px' }} />
                <col style={{ width: '22%' }} />
                <col style={{ width: '7%' }} />
                <col style={{ width: '10%' }} />
                <col style={{ width: '10%' }} />
                <col style={{ width: '7%' }} />
                <col style={{ width: '7%' }} />
                <col style={{ width: '10%' }} />
                <col style={{ width: '7%' }} />
                <col style={{ width: '11%' }} />
                <col style={{ width: '9%' }} />
              </colgroup>
              <KeywordTableHeader
                selectAll={selectAll}
                onSelectAll={handleSelectAll}
                sortField={sortField}
                sortDirection={sortDirection}
                onSort={handleSort}
              />
              <tbody>
                {displayedKeywords.map((item, index) => (
                  <KeywordTableRow
                    key={item.id}
                    item={item}
                    index={index}
                    isSelected={selectedRows.has(item.id)}
                    onSelect={handleSelectRow}
                    onRefresh={handleRefresh}
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
