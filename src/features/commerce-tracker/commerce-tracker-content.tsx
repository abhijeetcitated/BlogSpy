"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  ShoppingCart, 
  RefreshCw, 
  Plus,
  ChevronRight,
  ChevronLeft,
  X,
  Loader2,
  AlertCircle,
  Download,
} from "lucide-react"
import { CommerceSummaryCards, CommerceKeywordCard, CommerceFilterBar, CommerceSidebar, CommerceBulkActions } from "./components"
import { AddKeywordDialog } from "./components/AddKeywordDialog"
import { useCommerceTracker } from "./hooks"
import { COMMERCE_PLATFORM_CONFIG } from "./constants"

export function CommerceTrackerContent() {
  const {
    keywords,
    allFilteredKeywords,
    summary,
    filters,
    sortField,
    sortOrder,
    isLoading,
    isRefreshing,
    error,
    selectedKeywords,
    stats,
    pagination,
    setFilter,
    resetFilters,
    setSort,
    setPage,
    toggleKeywordSelection,
    selectAllKeywords,
    clearSelection,
    refreshData,
    addKeyword,
    deleteKeywords,
    exportToCSV,
  } = useCommerceTracker()

  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  const config = COMMERCE_PLATFORM_CONFIG.amazon

  // Check if any filters are active
  const hasActiveFilters = 
    filters.search !== "" ||
    filters.category !== "all" ||
    filters.opportunity !== "all" ||
    filters.position !== "all" ||
    filters.intent !== "all" ||
    filters.hasOurProduct !== null

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (selectedKeywords.length === 0) return
    if (!confirm(`Delete ${selectedKeywords.length} keyword(s)?`)) return
    await deleteKeywords(selectedKeywords)
  }

  // Handle export
  const handleExport = () => {
    const keywordsToExport = selectedKeywords.length > 0
      ? allFilteredKeywords.filter(k => selectedKeywords.includes(k.id))
      : allFilteredKeywords
    exportToCSV(keywordsToExport)
  }

  // Handle select all
  const handleSelectAll = () => {
    if (selectedKeywords.length === keywords.length) {
      clearSelection()
    } else {
      selectAllKeywords(keywords.map(k => k.id))
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-amber-400 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading commerce data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-4" />
          <p className="text-foreground font-medium mb-2">Something went wrong</p>
          <p className="text-muted-foreground text-sm mb-4">{error}</p>
          <Button onClick={refreshData} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-2.5 sm:gap-3 md:gap-3.5">
          <div className="p-2 sm:p-2.5 md:p-3 rounded-lg sm:rounded-xl bg-linear-to-br from-amber-500/20 to-orange-500/20 shrink-0">
            <ShoppingCart className="w-5 h-5 sm:w-5 sm:h-5 md:w-6 md:h-6 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <h1 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-foreground tracking-tight">Commerce Tracker</h1>
              <Badge className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] sm:text-[11px] md:text-xs px-1.5 sm:px-2 py-0.5 font-semibold">
                Amazon
              </Badge>
            </div>
            <p className="text-[11px] sm:text-xs md:text-sm text-muted-foreground mt-0.5">
              Track product rankings & opportunities
            </p>
          </div>
        </div>
        {/* Buttons - Mobile/Tablet: space-between, Desktop: normal */}
        <div className="flex items-center justify-between md:justify-end gap-1.5 sm:gap-2 md:gap-2.5 w-full md:w-auto">
          {/* Left side buttons (Export & Refresh) */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              className="h-8 sm:h-8 md:h-9 px-2 sm:px-2.5 md:px-3 text-xs sm:text-xs md:text-sm"
            >
              <Download className="w-3.5 h-3.5 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 mr-1 sm:mr-1 md:mr-1.5" />
              Export
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={refreshData}
              disabled={isRefreshing}
              className="h-8 sm:h-8 md:h-9 px-2 sm:px-2.5 md:px-3 text-xs sm:text-xs md:text-sm"
            >
              <RefreshCw className={`w-3.5 h-3.5 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 mr-1 sm:mr-1 md:mr-1.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
          
          {/* Right side - Add Button */}
          <Button 
            size="sm"
            onClick={() => setShowAddDialog(true)}
            className="h-8 sm:h-8 md:h-9 px-2 sm:px-2.5 md:px-3 bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 font-semibold text-xs sm:text-xs md:text-sm"
          >
            <Plus className="w-3.5 h-3.5 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 mr-1 sm:mr-1 md:mr-1.5" />
            Add Keyword
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <CommerceSummaryCards summary={summary} />

      {/* Filter Bar */}
      <CommerceFilterBar
        filters={filters}
        sortField={sortField}
        sortOrder={sortOrder}
        showFilters={showFilters}
        hasActiveFilters={hasActiveFilters}
        stats={{
          totalKeywords: stats.totalKeywords,
          highOpportunity: stats.highOpportunity,
          ourProducts: stats.ourProducts,
        }}
        onFilterChange={setFilter}
        onResetFilters={resetFilters}
        onSortChange={setSort}
        onToggleFilters={() => setShowFilters(!showFilters)}
      />

      {/* Bulk Actions Bar */}
      <CommerceBulkActions
        selectedCount={selectedKeywords.length}
        totalCount={keywords.length}
        onSelectAll={handleSelectAll}
        onExport={handleExport}
        onDelete={handleBulkDelete}
        onClear={clearSelection}
      />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
        {/* Keywords List */}
        <div className="md:col-span-2">
          {/* Header */}
          <div className="flex items-center justify-between mb-2.5 sm:mb-3 md:mb-4">
            <div className="flex items-center gap-2 sm:gap-2.5">
              <div className="p-1.5 sm:p-1.5 md:p-2 rounded-lg bg-amber-500/20">
                <ShoppingCart className="w-4 h-4 sm:w-4 sm:h-4 md:w-5 md:h-5 text-amber-400" />
              </div>
              <h2 className="text-sm sm:text-sm md:text-base lg:text-lg font-semibold text-foreground">Amazon Keywords</h2>
            </div>
            <Badge variant="secondary" className="text-[10px] sm:text-[11px] md:text-xs px-2 sm:px-2.5 md:px-3 py-0.5 sm:py-0.5 md:py-1">
              {pagination.totalItems} results
            </Badge>
          </div>

          {/* Keywords List */}
          {keywords.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 sm:py-16 text-center">
              <ShoppingCart className="w-10 h-10 sm:w-12 sm:h-12 text-muted-foreground/50 mb-3 sm:mb-4" />
              <p className="text-sm sm:text-base text-foreground font-medium mb-1">No keywords found</p>
              <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
                {hasActiveFilters 
                  ? "Try adjusting your filters or search query" 
                  : "Add your first keyword to start tracking"}
              </p>
              {hasActiveFilters ? (
                <Button variant="outline" onClick={resetFilters}>
                  <X className="w-4 h-4 mr-2" />
                  Clear Filters
                </Button>
              ) : (
                <Button onClick={() => setShowAddDialog(true)} className="bg-linear-to-r from-amber-500 to-orange-500">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Keywords
                </Button>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-2.5 sm:gap-3 md:gap-3.5">
              {keywords.map((keyword) => (
                <CommerceKeywordCard 
                  key={keyword.id}
                  keyword={keyword} 
                  isSelected={selectedKeywords.includes(keyword.id)}
                  onSelect={() => toggleKeywordSelection(keyword.id)}
                  onDelete={() => deleteKeywords([keyword.id])}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-border gap-3 sm:gap-0">
              <div className="text-xs sm:text-sm text-muted-foreground">
                Showing {((pagination.currentPage - 1) * pagination.pageSize) + 1} - {Math.min(pagination.currentPage * pagination.pageSize, pagination.totalItems)} of {pagination.totalItems}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(pagination.currentPage - 1)}
                  disabled={!pagination.hasPrevPage}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    const pageNum = i + 1
                    return (
                      <Button
                        key={pageNum}
                        variant={pagination.currentPage === pageNum ? "secondary" : "ghost"}
                        size="sm"
                        onClick={() => setPage(pageNum)}
                        className="w-8 h-8 p-0"
                      >
                        {pageNum}
                      </Button>
                    )
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(pagination.currentPage + 1)}
                  disabled={!pagination.hasNextPage}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <CommerceSidebar
          stats={{
            top3Count: stats.top3Count,
            top10Count: stats.top10Count,
            avgCpc: stats.avgCpc,
            avgSearchVolume: stats.avgSearchVolume,
          }}
        />
      </div>

      {/* Add Keyword Dialog */}
      <AddKeywordDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onAdd={addKeyword}
      />
    </div>
  )
}
