// ============================================
// RANK TRACKER - Main Content Component (Refactored)
// ============================================
// Reduced from 1,660 lines to ~350 lines
// Uses useReducer, service layer, lazy loading
// ============================================

"use client"

import { useMemo, useCallback, useEffect, lazy, Suspense } from "react"
import Link from "next/link"
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Target,
  Bell,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  Plus,
  RefreshCw,
  Download,
  Settings,
  Trash2,
  Edit2,
  MoreHorizontal,
  Eye,
  CheckCircle2,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Sparkline } from "@/components/charts"
import { cn } from "@/lib/utils"
import { PixelRankBadge } from "@/components/ui/pixel-rank-badge"
import { generateMockPixelRank } from "@/lib/pixel-calculator"

// Feature imports
import { PLATFORM_CONFIG, DEBOUNCE_MS } from "./constants"
import { calculateStats, getTopWinners, getTopLosers, filterByTab, filterBySearch, sortData, convertToRankData } from "./utils"
import {
  AIOverviewBadge,
  RankBadge,
  SerpFeatureIcon,
  StatsCards,
  WinnersLosersCards,
  SearchFilterBar,
  PlatformTabs,
  PlatformComparison,
  EmptyState,
  RankTrackerSkeleton,
  CountryDropdown,
  getPlatformIcon,
  DateRangeSelect,
  AutoRefreshMenu,
  ItemsPerPageSelect,
  Pagination,
  RankTrackerErrorBoundary,
} from "./components"
import { useRankTrackerState, useRankTrackerOps, useDebounce } from "./hooks"
import { generatePlatformStats, getCountryStats, MOCK_MULTI_PLATFORM_DATA } from "./__mocks__/multi-platform-data"
import type { SortField } from "./types"

// Lazy load modals for code splitting
const AddKeywordsModal = lazy(() => import("./components/modals/add-keywords-modal").then(m => ({ default: m.AddKeywordsModal })))
const AlertSettingsModal = lazy(() => import("./components/modals/alert-settings-modal").then(m => ({ default: m.AlertSettingsModal })))
const DeleteConfirmModal = lazy(() => import("./components/modals/delete-confirm-modal").then(m => ({ default: m.DeleteConfirmModal })))
const BulkDeleteModal = lazy(() => import("./components/modals/bulk-delete-modal").then(m => ({ default: m.BulkDeleteModal })))
const EditKeywordModal = lazy(() => import("./components/modals/edit-keyword-modal").then(m => ({ default: m.EditKeywordModal })))
const KeywordDetailModal = lazy(() => import("./components/modals/keyword-detail-modal").then(m => ({ default: m.KeywordDetailModal })))

// Modal loading fallback
const ModalLoader = () => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
    <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
  </div>
)

// Sort icon component - defined outside to prevent recreation on each render
interface SortIconProps {
  field: SortField
  currentField: SortField | null
  direction: "asc" | "desc"
}

const SortIcon = ({ field, currentField, direction }: SortIconProps) => {
  if (currentField !== field) {
    return <ArrowUpDown className="h-3 w-3 text-muted-foreground/60" />
  }
  return direction === "asc" ? (
    <ArrowUp className="h-3 w-3 text-emerald-400" />
  ) : (
    <ArrowDown className="h-3 w-3 text-emerald-400" />
  )
}

// ============================================
// MAIN COMPONENT
// ============================================

export function RankTrackerContent() {
  // Use the centralized state management with useReducer
  const { state, actions } = useRankTrackerState()
  
  // Debounce search query
  const debouncedSearchQuery = useDebounce(state.searchQuery, DEBOUNCE_MS.SEARCH)

  // TODO: Replace with real API data fetch
  // For now, using mock data - will be replaced when backend is ready
  const multiPlatformData = useMemo(() => {
    // This is a placeholder - in production, this comes from API
    return MOCK_MULTI_PLATFORM_DATA
  }, [])

  // Operations hook with service layer
  const ops = useRankTrackerOps({
    showToast: actions.showToast,
    setRefreshing: actions.setRefreshing,
    setLastUpdated: actions.setLastUpdated,
    setAdding: actions.setAdding,
    setDeleting: actions.setDeleting,
    setEditing: actions.setEditing,
    closeAddModal: actions.closeAddModal,
    setDeleteConfirm: actions.setDeleteConfirm,
    closeBulkDelete: actions.closeBulkDelete,
    setEditingKeyword: actions.setEditingKeyword,
    clearSelection: actions.clearSelection,
  })

  // Derived data with memoization
  const countryStats = useMemo(
    () => getCountryStats(multiPlatformData),
    [multiPlatformData]
  )

  const platformStats = useMemo(
    () => generatePlatformStats(multiPlatformData, state.activeCountry),
    [multiPlatformData, state.activeCountry]
  )

  const rankData = useMemo(
    () => convertToRankData(multiPlatformData, state.activePlatform, state.activeCountry),
    [multiPlatformData, state.activePlatform, state.activeCountry]
  )

  const stats = useMemo(() => calculateStats(rankData), [rankData])
  const winners = useMemo(() => getTopWinners(rankData), [rankData])
  const losers = useMemo(() => getTopLosers(rankData), [rankData])

  // Filter and sort with debounced search
  const filteredAndSortedData = useMemo(() => {
    let filtered = filterBySearch(rankData, debouncedSearchQuery)
    filtered = filterByTab(filtered, state.activeTab)
    return sortData(filtered, state.sortField, state.sortDirection)
  }, [rankData, debouncedSearchQuery, state.activeTab, state.sortField, state.sortDirection])

  // Pagination
  const paginatedData = useMemo(() => {
    const startIndex = (state.currentPage - 1) * state.itemsPerPage
    return filteredAndSortedData.slice(startIndex, startIndex + state.itemsPerPage)
  }, [filteredAndSortedData, state.currentPage, state.itemsPerPage])

  const totalPages = useMemo(
    () => Math.ceil(filteredAndSortedData.length / state.itemsPerPage),
    [filteredAndSortedData.length, state.itemsPerPage]
  )

  // Handlers
  const handleSort = useCallback((field: SortField) => {
    actions.toggleSort(field)
  }, [actions])

  const handleSelectAll = useCallback(() => {
    actions.selectAll(paginatedData.map(k => k.id))
  }, [actions, paginatedData])

  const handleClearFilters = useCallback(() => {
    actions.resetFilters()
  }, [actions])

  const handleExport = useCallback(() => {
    ops.handleExport(filteredAndSortedData, PLATFORM_CONFIG[state.activePlatform].name)
  }, [ops, filteredAndSortedData, state.activePlatform])

  // Auto-refresh effect
  useEffect(() => {
    if (state.autoRefreshInterval && state.autoRefreshInterval > 0) {
      const interval = setInterval(() => {
        ops.handleRefresh()
      }, state.autoRefreshInterval * 60 * 1000)
      return () => clearInterval(interval)
    }
  }, [state.autoRefreshInterval, ops])

  return (
    <RankTrackerErrorBoundary>
      <TooltipProvider>
        <div className="min-h-screen bg-background">
          <div className="space-y-4 sm:space-y-6">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 sm:gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-linear-to-br from-emerald-500 to-cyan-500">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl font-bold text-foreground flex items-center gap-2">
                    Rank Tracker
                    <span
                      className="inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: `${PLATFORM_CONFIG[state.activePlatform].color}20`,
                        color: PLATFORM_CONFIG[state.activePlatform].color,
                      }}
                    >
                      {getPlatformIcon(state.activePlatform, 14)} {PLATFORM_CONFIG[state.activePlatform].name}
                    </span>
                  </h1>
                  <p className="text-xs text-muted-foreground">
                    Track rankings across Google, Bing, Yahoo & DuckDuckGo
                    {state.lastUpdated && (
                      <span className="ml-2 text-muted-foreground/60">
                        • Updated {state.lastUpdated.toLocaleTimeString()}
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto lg:justify-end">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={ops.handleRefresh}
                      disabled={state.isRefreshing}
                      className="h-8 text-xs border-border text-muted-foreground hover:bg-muted"
                    >
                      <RefreshCw className={cn("w-3.5 h-3.5 mr-1.5", state.isRefreshing && "animate-spin")} />
                      {state.isRefreshing ? "Refreshing..." : "Refresh"}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Refresh rankings data</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleExport}
                      disabled={filteredAndSortedData.length === 0}
                      className="h-8 text-xs border-border text-muted-foreground hover:bg-muted"
                    >
                      <Download className="w-3.5 h-3.5 mr-1.5" />
                      Export
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Export to CSV</TooltipContent>
                </Tooltip>

                <div className="flex items-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => actions.toggleAlerts()}
                    className={cn(
                      "h-8 text-xs border-border hover:bg-muted rounded-r-none",
                      state.isAlertsEnabled
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                        : "text-muted-foreground"
                    )}
                  >
                    <Bell className="w-3.5 h-3.5 mr-1.5" />
                    Alerts {state.isAlertsEnabled ? "ON" : "OFF"}
                  </Button>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={actions.openAlertSettings}
                        className="h-8 px-2 border-border text-muted-foreground hover:bg-muted rounded-l-none border-l-0"
                      >
                        <Settings className="w-3.5 h-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Configure alert settings</TooltipContent>
                  </Tooltip>
                </div>

                <Button
                  size="sm"
                  onClick={actions.openAddModal}
                  className="h-8 text-xs bg-emerald-500 hover:bg-emerald-600 text-white"
                >
                  <Plus className="w-3.5 h-3.5 mr-1.5" />
                  Add Keywords
                </Button>
              </div>
            </div>

            {/* Platform Tabs & Country Filter */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <PlatformTabs
                  activePlatform={state.activePlatform}
                  onPlatformChange={actions.setPlatform}
                  stats={platformStats}
                />
                <CountryDropdown
                  value={state.activeCountry}
                  onChange={actions.setCountry}
                  countryStats={countryStats}
                  className="w-full max-w-56 sm:w-auto sm:max-w-none"
                />
              </div>
              <PlatformComparison
                stats={platformStats}
                activePlatform={state.activePlatform}
                onPlatformSelect={actions.setPlatform}
              />
            </div>

            {/* Stats Row */}
            <StatsCards stats={stats} />

            {/* Winners & Losers */}
            <WinnersLosersCards winners={winners} losers={losers} />

            {/* Search & Filter Bar */}
            <SearchFilterBar
              activeTab={state.activeTab}
              onTabChange={actions.setActiveTab}
              searchQuery={state.searchQuery}
              onSearchChange={actions.setSearchQuery}
              stats={stats}
            />

            {/* Toolbar */}
            {!state.isLoading && filteredAndSortedData.length > 0 && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <DateRangeSelect
                    value={state.dateRange}
                    onChange={actions.setDateRange}
                  />
                  <AutoRefreshMenu
                    interval={state.autoRefreshInterval}
                    onStart={(mins) => actions.setAutoRefresh(mins)}
                    onStop={() => actions.setAutoRefresh(null)}
                  />
                </div>
                <ItemsPerPageSelect
                  value={state.itemsPerPage}
                  onChange={actions.setItemsPerPage}
                  totalItems={filteredAndSortedData.length}
                />
              </div>
            )}

            {/* Loading State */}
            {state.isLoading && <RankTrackerSkeleton />}

            {/* Empty States */}
            {!state.isLoading && rankData.length === 0 && (
              <EmptyState type="no-data" onAddKeywords={actions.openAddModal} />
            )}

            {!state.isLoading && rankData.length > 0 && filteredAndSortedData.length === 0 && (
              <EmptyState
                type="no-results"
                searchQuery={state.searchQuery}
                onClearFilters={handleClearFilters}
              />
            )}

            {/* Main Table (Desktop) */}
            {!state.isLoading && filteredAndSortedData.length > 0 && (
              <div className="hidden lg:block space-y-3">
                <div className="rounded-xl border border-border bg-card overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-4xl" role="grid" aria-label="Rankings table">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="w-10 px-3 py-3">
                            <Checkbox
                              checked={state.selectedKeywords.size === paginatedData.length && paginatedData.length > 0}
                              onCheckedChange={handleSelectAll}
                              className="border-border"
                              aria-label="Select all keywords"
                            />
                          </th>
                          <th className="px-4 py-3 text-left">
                            <button
                              onClick={() => handleSort("keyword")}
                              className="flex items-center gap-1 text-xs font-medium text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors"
                            >
                              Keyword <SortIcon field="keyword" currentField={state.sortField} direction={state.sortDirection} />
                            </button>
                          </th>
                          <th className="px-4 py-3 text-center">
                            <button
                              onClick={() => handleSort("rank")}
                              className="flex items-center justify-center gap-1 text-xs font-medium text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors w-full"
                            >
                              Rank <SortIcon field="rank" currentField={state.sortField} direction={state.sortDirection} />
                            </button>
                          </th>
                          <th className="px-4 py-3 text-center">
                            <button
                              onClick={() => handleSort("change")}
                              className="flex items-center justify-center gap-1 text-xs font-medium text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors w-full"
                            >
                              Change <SortIcon field="change" currentField={state.sortField} direction={state.sortDirection} />
                            </button>
                          </th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            SERP
                          </th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            AI Overview
                          </th>
                          <th className="px-4 py-3 text-right">
                            <button
                              onClick={() => handleSort("volume")}
                              className="flex items-center justify-end gap-1 text-xs font-medium text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors w-full"
                            >
                              Volume <SortIcon field="volume" currentField={state.sortField} direction={state.sortDirection} />
                            </button>
                          </th>
                          <th className="px-4 py-3 w-24 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Trend
                          </th>
                          <th className="px-4 py-3 w-12"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/50">
                        {paginatedData.map((row) => (
                          <tr
                            key={row.id}
                            className={cn(
                              "hover:bg-muted/30 transition-colors group",
                              state.selectedKeywords.has(row.id) && "bg-emerald-500/5"
                            )}
                          >
                            <td className="px-3 py-3">
                              <Checkbox
                                checked={state.selectedKeywords.has(row.id)}
                                onCheckedChange={() => actions.selectKeyword(row.id)}
                                className="border-border"
                              />
                            </td>
                            <td className="px-4 py-3">
                              <Link
                                href={`/keyword-overview?keyword=${encodeURIComponent(row.keyword)}`}
                                target="_blank"
                                className="text-sm font-semibold text-foreground hover:text-emerald-400 transition-colors"
                              >
                                {row.keyword}
                              </Link>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <RankBadge rank={row.rank} />
                            </td>
                            <td className="px-4 py-3 text-center">
                              {row.change !== 0 ? (
                                <span
                                  className={cn(
                                    "inline-flex items-center gap-1 px-2 py-1 rounded-md text-sm font-bold",
                                    row.change > 0 ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"
                                  )}
                                >
                                  {row.change > 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                                  {row.change > 0 ? `+${row.change}` : row.change}
                                </span>
                              ) : (
                                <span className="text-muted-foreground text-sm">—</span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center justify-center gap-1">
                                {row.serpFeatures.map((feature, i) => (
                                  <SerpFeatureIcon key={i} feature={feature} />
                                ))}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <AIOverviewBadge status={row.aiOverview} />
                            </td>
                            <td className="px-4 py-3 text-right">
                              <span className="text-sm text-foreground/80">{row.volume.toLocaleString()}</span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="w-20 h-6 mx-auto">
                                <Sparkline data={row.trendHistory} />
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100">
                                    <MoreHorizontal className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => actions.setDetailKeyword(row)}>
                                    <Eye className="w-4 h-4 mr-2" /> View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => actions.setEditingKeyword(row)}>
                                    <Edit2 className="w-4 h-4 mr-2" /> Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => actions.setDeleteConfirm(row)}
                                    className="text-red-400 focus:text-red-400"
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" /> Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Pagination */}
                <Pagination
                  currentPage={state.currentPage}
                  totalPages={totalPages}
                  totalItems={filteredAndSortedData.length}
                  itemsPerPage={state.itemsPerPage}
                  onPageChange={actions.setPage}
                />
              </div>
            )}

            {/* Mobile View - Similar structure but with cards */}
            {!state.isLoading && filteredAndSortedData.length > 0 && (
              <div className="lg:hidden space-y-3">
                {paginatedData.map((row) => (
                  <div
                    key={row.id}
                    className={cn(
                      "rounded-xl border bg-card p-4 space-y-3",
                      state.selectedKeywords.has(row.id) ? "border-emerald-500/50 bg-emerald-500/5" : "border-border"
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={state.selectedKeywords.has(row.id)}
                          onCheckedChange={() => actions.selectKeyword(row.id)}
                          className="mt-1"
                        />
                        <div>
                          <Link
                            href={`/keyword-overview?keyword=${encodeURIComponent(row.keyword)}`}
                            className="font-semibold text-foreground hover:text-emerald-400 transition-colors"
                          >
                            {row.keyword}
                          </Link>
                          <p className="text-xs text-muted-foreground mt-1">
                            {row.volume.toLocaleString()} monthly searches
                          </p>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => actions.setDetailKeyword(row)}>
                            <Eye className="w-4 h-4 mr-2" /> View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => actions.setEditingKeyword(row)}>
                            <Edit2 className="w-4 h-4 mr-2" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => actions.setDeleteConfirm(row)}
                            className="text-red-400"
                          >
                            <Trash2 className="w-4 h-4 mr-2" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <RankBadge rank={row.rank} />
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 text-sm font-medium",
                            row.change > 0 ? "text-emerald-400" : row.change < 0 ? "text-red-400" : "text-muted-foreground"
                          )}
                        >
                          {row.change > 0 ? <TrendingUp className="w-3 h-3" /> : row.change < 0 ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                          {row.change > 0 ? `+${row.change}` : row.change}
                        </span>
                      </div>
                      <AIOverviewBadge status={row.aiOverview} />
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-border/50">
                      <div className="w-24 h-6">
                        <Sparkline data={row.trendHistory} />
                      </div>
                      <PixelRankBadge score={row.pixelRank || generateMockPixelRank(row.rank)} size="sm" />
                    </div>
                  </div>
                ))}

                {/* Mobile Pagination */}
                <Pagination
                  currentPage={state.currentPage}
                  totalPages={totalPages}
                  totalItems={filteredAndSortedData.length}
                  itemsPerPage={state.itemsPerPage}
                  onPageChange={actions.setPage}
                  compact
                />
              </div>
            )}

            {/* Bulk Actions Bar */}
            {state.selectedKeywords.size > 0 && (
              <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg shadow-lg">
                <span className="text-sm text-muted-foreground">
                  {state.selectedKeywords.size} selected
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => ops.handleBulkExport(filteredAndSortedData, state.selectedKeywords, PLATFORM_CONFIG[state.activePlatform].name)}
                >
                  <Download className="w-4 h-4 mr-1" /> Export
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={actions.openBulkDelete}
                >
                  <Trash2 className="w-4 h-4 mr-1" /> Delete
                </Button>
              </div>
            )}

            {/* Toast */}
            {state.showToast && (
              <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
                <div className="flex items-center gap-2 px-4 py-3 bg-card border border-border rounded-lg shadow-lg">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span className="text-sm text-foreground">{state.toastMessage}</span>
                </div>
              </div>
            )}
          </div>

          {/* Lazy Loaded Modals */}
          <Suspense fallback={<ModalLoader />}>
            {state.isAddModalOpen && (
              <AddKeywordsModal
                isOpen={state.isAddModalOpen}
                onClose={actions.closeAddModal}
                onAdd={ops.handleAddKeywords}
                isAdding={state.isAdding}
              />
            )}

            {state.isAlertSettingsOpen && (
              <AlertSettingsModal
                isOpen={state.isAlertSettingsOpen}
                onClose={actions.closeAlertSettings}
                settings={state.alertSettings}
                onSave={(settings) => {
                  actions.setAlertSettings(settings)
                  actions.toggleAlerts(true)
                  actions.closeAlertSettings()
                  actions.showToast("Alert settings saved!")
                }}
              />
            )}

            {state.deleteConfirmKeyword && (
              <DeleteConfirmModal
                keyword={state.deleteConfirmKeyword}
                onClose={() => actions.setDeleteConfirm(null)}
                onConfirm={() => ops.handleDeleteKeyword(state.deleteConfirmKeyword!)}
                isDeleting={state.isDeleting}
              />
            )}

            {state.isBulkDeleteOpen && (
              <BulkDeleteModal
                isOpen={state.isBulkDeleteOpen}
                onClose={actions.closeBulkDelete}
                selectedCount={state.selectedKeywords.size}
                onConfirm={() => ops.handleBulkDelete(state.selectedKeywords)}
                isDeleting={state.isDeleting}
              />
            )}

            {state.editingKeyword && (
              <EditKeywordModal
                keyword={state.editingKeyword}
                onClose={() => actions.setEditingKeyword(null)}
                onSave={(keywordId, newKeyword, newCountry) =>
                  ops.handleUpdateKeyword(keywordId, newKeyword, newCountry)
                }
                isEditing={state.isEditing}
              />
            )}

            {state.detailKeyword && (
              <KeywordDetailModal
                keyword={state.detailKeyword}
                onClose={() => actions.setDetailKeyword(null)}
                onEdit={(keyword) => {
                  actions.setEditingKeyword(keyword)
                  actions.setDetailKeyword(null)
                }}
              />
            )}
          </Suspense>
        </div>
      </TooltipProvider>
    </RankTrackerErrorBoundary>
  )
}
