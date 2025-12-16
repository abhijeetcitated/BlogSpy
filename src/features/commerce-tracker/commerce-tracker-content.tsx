"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
  ShoppingCart, 
  Search, 
  RefreshCw, 
  Plus,
  Lightbulb,
  Zap,
  TrendingUp,
  Target,
  Package,
  ChevronRight,
  ChevronLeft,
  Download,
  Trash2,
  Filter,
  SortAsc,
  SortDesc,
  MoreHorizontal,
  X,
  Loader2,
  AlertCircle,
} from "lucide-react"
import { CommerceSummaryCards, CommerceKeywordCard } from "./components"
import { AddKeywordDialog } from "./components/AddKeywordDialog"
import { COMMERCE_PLATFORM_CONFIG, AMAZON_TIPS, AMAZON_CATEGORIES } from "./constants"
import { useCommerceTracker, type OpportunityFilter, type PositionFilter, type SortField } from "./hooks"
import type { CommerceIntent } from "./types"

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

  // Sort options
  const sortOptions: { value: SortField; label: string }[] = [
    { value: "searchVolume", label: "Search Volume" },
    { value: "position", label: "Position" },
    { value: "cpc", label: "CPC" },
    { value: "opportunity", label: "Opportunity" },
    { value: "keyword", label: "Keyword A-Z" },
    { value: "lastUpdated", label: "Last Updated" },
  ]

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
          <div className="p-2 sm:p-2.5 md:p-3 rounded-lg sm:rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 shrink-0">
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
            className="h-8 sm:h-8 md:h-9 px-2 sm:px-2.5 md:px-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 font-semibold text-xs sm:text-xs md:text-sm"
          >
            <Plus className="w-3.5 h-3.5 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 mr-1 sm:mr-1 md:mr-1.5" />
            Add Keyword
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <CommerceSummaryCards summary={summary} />

      {/* Filter Bar */}
      <div className="flex flex-col gap-3 sm:gap-4">
        {/* Main Filters Row */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4">
          {/* Stats Pills */}
          <div className="flex items-center gap-1.5 sm:gap-2 md:gap-2.5 flex-wrap">
            <Badge 
              variant="outline" 
              className="text-[10px] sm:text-[11px] md:text-xs px-1.5 sm:px-2 md:px-2.5 py-0.5 sm:py-0.5 md:py-1 border-amber-500/30 text-amber-400 bg-amber-500/10 font-medium cursor-pointer"
              onClick={() => resetFilters()}
            >
              <ShoppingCart className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 sm:mr-1" />
              {stats.totalKeywords}
            </Badge>
            <Badge 
              variant="outline" 
              className={`text-[10px] sm:text-[11px] md:text-xs px-1.5 sm:px-2 md:px-2.5 py-0.5 sm:py-0.5 md:py-1 border-emerald-500/30 text-emerald-400 bg-emerald-500/10 font-medium cursor-pointer ${filters.opportunity === "high" ? "ring-1 ring-emerald-500" : ""}`}
              onClick={() => setFilter("opportunity", filters.opportunity === "high" ? "all" : "high")}
            >
              <Target className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 sm:mr-1" />
              {stats.highOpportunity} High
            </Badge>
            <Badge 
              variant="outline" 
              className={`text-[10px] sm:text-[11px] md:text-xs px-1.5 sm:px-2 md:px-2.5 py-0.5 sm:py-0.5 md:py-1 border-blue-500/30 text-blue-400 bg-blue-500/10 font-medium cursor-pointer ${filters.hasOurProduct === true ? "ring-1 ring-blue-500" : ""}`}
              onClick={() => setFilter("hasOurProduct", filters.hasOurProduct === true ? null : true)}
            >
              <Package className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 sm:mr-1" />
              {stats.ourProducts} Ours
            </Badge>
          </div>
          
          {/* Search, Sort & Filters */}
          <div className="flex items-center gap-1.5 sm:gap-2 w-full sm:w-auto">
            {/* Toggle Filters */}
            <Button 
              variant={showFilters ? "secondary" : "outline"} 
              size="sm" 
              onClick={() => setShowFilters(!showFilters)}
              className="h-7 sm:h-7 md:h-8 px-2 sm:px-2.5 md:px-3 text-xs"
            >
              <Filter className="w-3 h-3 sm:w-3 sm:h-3 md:w-3.5 md:h-3.5" />
              <span className="ml-1 sm:ml-1.5">Filters</span>
              {hasActiveFilters && (
                <span className="ml-1 w-1.5 h-1.5 rounded-full bg-amber-400" />
              )}
            </Button>

            {/* Sort Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-7 sm:h-7 md:h-8 px-2 sm:px-2.5 md:px-3">
                  {sortOrder === "asc" ? <SortAsc className="w-3 h-3 sm:w-3 sm:h-3 md:w-3.5 md:h-3.5" /> : <SortDesc className="w-3 h-3 sm:w-3 sm:h-3 md:w-3.5 md:h-3.5" />}
                  <span className="ml-1 sm:ml-1.5">Sort</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuLabel className="text-xs">Sort by</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {sortOptions.map((option) => (
                  <DropdownMenuItem 
                    key={option.value}
                    onClick={() => setSort(option.value)}
                    className={`text-xs ${sortField === option.value ? "bg-muted" : ""}`}
                  >
                    {option.label}
                    {sortField === option.value && (
                      <span className="ml-auto text-[10px] text-muted-foreground">
                        {sortOrder === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            
            {/* Search */}
            <div className="relative flex-1 sm:flex-1 md:w-48 lg:w-56">
              <Search className="absolute left-2 sm:left-2.5 md:left-3 top-1/2 -translate-y-1/2 w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 text-muted-foreground" />
              <Input
                value={filters.search}
                onChange={(e) => setFilter("search", e.target.value)}
                placeholder="Search..."
                className="pl-7 sm:pl-8 md:pl-9 h-7 sm:h-7 md:h-8 text-xs sm:text-xs md:text-sm bg-card border-border"
              />
              {filters.search && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-0.5 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                  onClick={() => setFilter("search", "")}
                >
                  <X className="w-2.5 h-2.5" />
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Advanced Filters (Collapsible) */}
        {showFilters && (
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 md:gap-3 p-2 sm:p-2.5 md:p-3 bg-muted/30 rounded-lg border border-border">
            {/* Category Filter */}
            <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2">
              <span className="text-[10px] sm:text-[11px] md:text-xs text-muted-foreground">Category:</span>
              <Select value={filters.category} onValueChange={(v) => setFilter("category", v)}>
                <SelectTrigger className="h-7 sm:h-7 md:h-8 text-[11px] sm:text-xs w-[100px] sm:w-[110px] md:w-[130px] bg-card">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="text-xs">All</SelectItem>
                  {AMAZON_CATEGORIES.map(cat => (
                    <SelectItem key={cat} value={cat} className="text-xs">{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Opportunity Filter */}
            <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2">
              <span className="text-[10px] sm:text-[11px] md:text-xs text-muted-foreground">Opp:</span>
              <Select value={filters.opportunity} onValueChange={(v) => setFilter("opportunity", v as OpportunityFilter)}>
                <SelectTrigger className="h-7 sm:h-7 md:h-8 text-[11px] sm:text-xs w-[70px] sm:w-[80px] md:w-[90px] bg-card">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="text-xs">All</SelectItem>
                  <SelectItem value="high" className="text-xs">High</SelectItem>
                  <SelectItem value="medium" className="text-xs">Medium</SelectItem>
                  <SelectItem value="low" className="text-xs">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Position Filter */}
            <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2">
              <span className="text-[10px] sm:text-[11px] md:text-xs text-muted-foreground">Pos:</span>
              <Select value={filters.position} onValueChange={(v) => setFilter("position", v as PositionFilter)}>
                <SelectTrigger className="h-7 sm:h-7 md:h-8 text-[11px] sm:text-xs w-[70px] sm:w-[75px] md:w-[80px] bg-card">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="text-xs">All</SelectItem>
                  <SelectItem value="top3" className="text-xs">Top 3</SelectItem>
                  <SelectItem value="top10" className="text-xs">Top 10</SelectItem>
                  <SelectItem value="top20" className="text-xs">Top 20</SelectItem>
                  <SelectItem value="unranked" className="text-xs">Unranked</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Intent Filter */}
            <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2">
              <span className="text-[10px] sm:text-[11px] md:text-xs text-muted-foreground">Intent:</span>
              <Select value={filters.intent} onValueChange={(v) => setFilter("intent", v as CommerceIntent | "all")}>
                <SelectTrigger className="h-7 sm:h-7 md:h-8 text-[11px] sm:text-xs w-[85px] sm:w-[90px] md:w-[100px] bg-card">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="text-xs">All</SelectItem>
                  <SelectItem value="transactional" className="text-xs">Transactional</SelectItem>
                  <SelectItem value="comparison" className="text-xs">Comparison</SelectItem>
                  <SelectItem value="informational" className="text-xs">Info</SelectItem>
                  <SelectItem value="branded" className="text-xs">Branded</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={resetFilters} className="h-7 sm:h-7 md:h-8 px-2 text-amber-400 hover:text-amber-300 text-[11px] sm:text-xs">
                <X className="w-2.5 h-2.5 mr-0.5" />
                Clear
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Bulk Actions Bar */}
      {selectedKeywords.length > 0 && (
        <div className="flex items-center justify-between p-2 sm:p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Checkbox 
              checked={selectedKeywords.length === keywords.length}
              onCheckedChange={handleSelectAll}
              className="h-4 w-4 border-2"
            />
            <span className="text-xs sm:text-sm font-medium text-foreground">
              {selectedKeywords.length} selected
            </span>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <Button variant="outline" size="sm" onClick={handleExport} className="h-7 sm:h-8 px-2 sm:px-3 text-[10px] sm:text-xs">
              <Download className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1" />
              Export
            </Button>
            <Button variant="destructive" size="sm" onClick={handleBulkDelete} className="h-7 sm:h-8 px-2 sm:px-3 text-[10px] sm:text-xs">
              <Trash2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1" />
              Delete
            </Button>
            <Button variant="ghost" size="sm" onClick={clearSelection} className="h-7 w-7 sm:h-8 sm:w-8 p-0">
              <X className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      )}

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
                <Button onClick={() => setShowAddDialog(true)} className="bg-gradient-to-r from-amber-500 to-orange-500">
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
        <div className="space-y-4">
          {/* Credit Cost Card */}
          <Card className="bg-card border-border">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-amber-500/20 shrink-0">
                  <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-lg sm:text-xl font-bold text-foreground">{config.creditCost} Credits</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">per keyword • {config.apiSource}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="bg-card border-border">
            <CardHeader className="p-4 sm:p-5 pb-3">
              <CardTitle className="text-sm sm:text-base flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-emerald-500/20">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                </div>
                Quick Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-5 pt-0 space-y-3">
              {[
                { label: "Top 3 Rankings", value: stats.top3Count, color: "text-amber-400" },
                { label: "Top 10 Rankings", value: stats.top10Count, color: "text-emerald-400" },
                { label: "Avg CPC", value: `$${stats.avgCpc}`, color: "text-green-400" },
                { label: "Avg Volume", value: stats.avgSearchVolume.toLocaleString(), color: "text-cyan-400" },
              ].map((stat, i) => (
                <div key={i} className="flex justify-between items-center py-2 px-3 rounded-lg bg-muted/30">
                  <span className="text-xs sm:text-sm text-muted-foreground">{stat.label}</span>
                  <span className={`text-sm sm:text-base font-bold ${stat.color}`}>{stat.value}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Amazon Tips */}
          <Card className="bg-card border-border">
            <CardHeader className="p-4 sm:p-5 pb-3">
              <CardTitle className="text-sm sm:text-base flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-amber-500/20">
                  <Lightbulb className="w-4 h-4 text-amber-400" />
                </div>
                Amazon Tips
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-5 pt-0">
              <ul className="space-y-2.5">
                {AMAZON_TIPS.slice(0, 4).map((tip, i) => (
                  <li key={i} className="text-xs sm:text-sm text-muted-foreground flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{tip}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Features */}
          <Card className="bg-card border-border">
            <CardHeader className="p-4 sm:p-5 pb-3">
              <CardTitle className="text-sm sm:text-base flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-blue-500/20">
                  <Package className="w-4 h-4 text-blue-400" />
                </div>
                Features
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-5 pt-0">
              <ul className="space-y-2.5">
                {config.features.slice(0, 5).map((feature, i) => (
                  <li key={i} className="text-xs sm:text-sm text-muted-foreground flex items-center gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
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
