"use client"

import { useState, useMemo, useCallback } from "react"
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  BarChart3,
  FileText,
  Target,
  Zap,
  Filter,
  ArrowUpDown,
  ChevronDown,
  Loader2,
  CheckCircle2,
  RefreshCw,
  Clock,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
  generateSampleROIData, 
  calculateDashboardStats,
  groupArticlesByPerformance,
  generateTrendData,
  formatCurrency,
  formatPercent,
} from "../utils"
import { CONTENT_CATEGORIES, DATE_RANGE_OPTIONS, CategoryIcons } from "../constants"
import { ROIFilterOptions, ArticleROI } from "../types"
import { ArticleROICard } from "./ArticleROICard"
import { ROITrendChart } from "./ROITrendChart"
import { PerformanceDistribution } from "./PerformanceDistribution"

export function ContentROIDashboard() {
  const [filters, setFilters] = useState<ROIFilterOptions>({
    dateRange: 'all',
    category: null,
    profitability: 'all',
    sortBy: 'roi',
    sortOrder: 'desc',
  })

  // Sync Analytics State
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncStatus, setSyncStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [lastSynced, setLastSynced] = useState<Date | null>(null)
  const [articlesData, setArticlesData] = useState<ArticleROI[]>(() => generateSampleROIData())
  const [syncProgress, setSyncProgress] = useState(0)

  // Sync Analytics Handler
  const handleSyncAnalytics = useCallback(async () => {
    if (isSyncing) return
    
    setIsSyncing(true)
    setSyncStatus('idle')
    setSyncProgress(0)

    try {
      // Simulate API call with progress
      // Step 1: Fetching Google Analytics data
      setSyncProgress(10)
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Step 2: Fetching ad revenue data
      setSyncProgress(30)
      await new Promise(resolve => setTimeout(resolve, 600))
      
      // Step 3: Fetching affiliate data
      setSyncProgress(50)
      await new Promise(resolve => setTimeout(resolve, 400))
      
      // Step 4: Calculating ROI metrics
      setSyncProgress(70)
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Step 5: Generating new data with slight variations
      setSyncProgress(90)
      const newData = generateSampleROIData().map(article => ({
        ...article,
        traffic: {
          ...article.traffic,
          pageviews: Math.floor(article.traffic.pageviews * (0.95 + Math.random() * 0.1)),
        },
        revenue: {
          ...article.revenue,
          adRevenue: Math.floor(article.revenue.adRevenue * (0.9 + Math.random() * 0.2)),
          affiliateRevenue: Math.floor(article.revenue.affiliateRevenue * (0.85 + Math.random() * 0.3)),
        },
      }))

      // Recalculate totals and ROI
      const updatedData = newData.map(article => {
        const totalRevenue = article.revenue.adRevenue + article.revenue.affiliateRevenue + article.revenue.sponsoredRevenue
        const profit = totalRevenue - article.cost.totalCost
        const roi = article.cost.totalCost > 0 ? ((profit / article.cost.totalCost) * 100) : 0
        return {
          ...article,
          revenue: { ...article.revenue, totalRevenue },
          profit,
          roi,
        }
      })

      setSyncProgress(100)
      await new Promise(resolve => setTimeout(resolve, 300))
      
      setArticlesData(updatedData)
      setLastSynced(new Date())
      setSyncStatus('success')
      
      // Reset success status after 3 seconds
      setTimeout(() => setSyncStatus('idle'), 3000)
      
    } catch (error) {
      console.error('Sync failed:', error)
      setSyncStatus('error')
      setTimeout(() => setSyncStatus('idle'), 3000)
    } finally {
      setIsSyncing(false)
      setSyncProgress(0)
    }
  }, [isSyncing])

  // Use articlesData instead of generating new data
  const allArticles = articlesData
  const trendData = useMemo(() => generateTrendData(allArticles), [allArticles])
  
  // Filter and sort articles
  const filteredArticles = useMemo(() => {
    let result = [...allArticles]

    // Filter by category
    if (filters.category && filters.category !== 'all') {
      result = result.filter(a => a.article.category === filters.category)
    }

    // Filter by profitability
    if (filters.profitability === 'profitable') {
      result = result.filter(a => a.isProfit)
    } else if (filters.profitability === 'unprofitable') {
      result = result.filter(a => !a.isProfit)
    } else if (filters.profitability === 'break-even') {
      result = result.filter(a => a.roi >= -10 && a.roi <= 10)
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0
      switch (filters.sortBy) {
        case 'roi':
          comparison = a.roi - b.roi
          break
        case 'revenue':
          comparison = a.revenue.totalRevenue - b.revenue.totalRevenue
          break
        case 'cost':
          comparison = a.cost.totalCost - b.cost.totalCost
          break
        case 'profit':
          comparison = a.profit - b.profit
          break
        case 'pageviews':
          comparison = a.traffic.pageviews - b.traffic.pageviews
          break
        case 'date':
          comparison = new Date(a.article.publishDate).getTime() - new Date(b.article.publishDate).getTime()
          break
      }
      return filters.sortOrder === 'desc' ? -comparison : comparison
    })

    return result
  }, [allArticles, filters])

  const stats = useMemo(() => calculateDashboardStats(filteredArticles), [filteredArticles])
  const performanceGroups = useMemo(() => groupArticlesByPerformance(filteredArticles), [filteredArticles])

  return (
    <div className="space-y-4 sm:space-y-6 overflow-hidden max-w-full">
      {/* Header */}
      <div className="flex items-start sm:items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h1 className="text-lg sm:text-2xl font-bold text-foreground flex items-center gap-2">
            <Target className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-500 shrink-0" />
            Content ROI Tracker
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-xs sm:text-base text-muted-foreground">
              Track the real return on investment of every blog post
            </p>
            {lastSynced && (
              <span className="hidden sm:flex items-center gap-1 text-[10px] sm:text-xs text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">
                <Clock className="h-3 w-3" />
                Synced {lastSynced.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <Button 
            onClick={handleSyncAnalytics}
            disabled={isSyncing}
            className={`shrink-0 text-xs sm:text-sm px-2 sm:px-3 h-7 sm:h-9 transition-all ${
              syncStatus === 'success' 
                ? 'bg-emerald-500 hover:bg-emerald-600' 
                : syncStatus === 'error'
                ? 'bg-red-500 hover:bg-red-600'
                : 'bg-amber-500 hover:bg-amber-600'
            } text-white`} 
            size="sm"
          >
            {isSyncing ? (
              <>
                <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 animate-spin" />
                <span className="hidden xs:inline">Syncing... </span>
                <span className="text-[10px] sm:text-xs opacity-80">{syncProgress}%</span>
              </>
            ) : syncStatus === 'success' ? (
              <>
                <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden xs:inline">Synced!</span>
                <span className="xs:hidden">Done</span>
              </>
            ) : (
              <>
                <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden xs:inline">Sync </span>Analytics
              </>
            )}
          </Button>
          {lastSynced && (
            <span className="sm:hidden flex items-center gap-1 text-[9px] text-muted-foreground">
              <Clock className="h-2.5 w-2.5" />
              {lastSynced.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>
      </div>

      {/* Sync Progress Bar */}
      {isSyncing && (
        <div className="w-full bg-muted/30 rounded-full h-1.5 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-300 ease-out"
            style={{ width: `${syncProgress}%` }}
          />
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-4">
        <div className="rounded-xl border border-border bg-card p-3 sm:p-4">
          <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
            <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
            <span className="text-[10px] sm:text-xs text-muted-foreground">Total Articles</span>
          </div>
          <p className="text-lg sm:text-2xl font-bold text-foreground">{stats.totalArticles}</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-3 sm:p-4">
          <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
            <DollarSign className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-500" />
            <span className="text-[10px] sm:text-xs text-muted-foreground">Total Revenue</span>
          </div>
          <p className="text-lg sm:text-2xl font-bold text-emerald-400">{formatCurrency(stats.totalRevenue)}</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-3 sm:p-4">
          <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
            <TrendingDown className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-red-500" />
            <span className="text-[10px] sm:text-xs text-muted-foreground">Total Cost</span>
          </div>
          <p className="text-lg sm:text-2xl font-bold text-red-400">{formatCurrency(stats.totalCost)}</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-3 sm:p-4">
          <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
            <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-cyan-500" />
            <span className="text-[10px] sm:text-xs text-muted-foreground">Net Profit</span>
          </div>
          <p className={`text-lg sm:text-2xl font-bold ${stats.totalProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {formatCurrency(stats.totalProfit)}
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-3 sm:p-4">
          <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
            <BarChart3 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-purple-500" />
            <span className="text-[10px] sm:text-xs text-muted-foreground">Overall ROI</span>
          </div>
          <p className={`text-lg sm:text-2xl font-bold ${stats.overallROI >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {formatPercent(stats.overallROI)}
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-3 sm:p-4">
          <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
            <Zap className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-yellow-500" />
            <span className="text-[10px] sm:text-xs text-muted-foreground">Profitable</span>
          </div>
          <p className="text-lg sm:text-2xl font-bold text-foreground">
            {stats.profitableArticles}<span className="text-xs sm:text-sm text-muted-foreground">/{stats.totalArticles}</span>
          </p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <ROITrendChart data={trendData} />
        <PerformanceDistribution groups={performanceGroups} />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
        {/* Filter Dropdowns */}
        <div className="flex items-center gap-1.5 sm:gap-3 overflow-x-auto pb-1 sm:pb-0 -mx-3 px-3 sm:mx-0 sm:px-0 sm:overflow-visible">
          <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1 sm:gap-2 shrink-0 text-[10px] sm:text-sm h-7 sm:h-9 px-2 sm:px-3">
              <Filter className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden xs:inline">{DATE_RANGE_OPTIONS.find(o => o.value === filters.dateRange)?.label}</span>
              <span className="xs:hidden">Date</span>
              <ChevronDown className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {DATE_RANGE_OPTIONS.map(option => (
              <DropdownMenuItem 
                key={option.value}
                onClick={() => setFilters(f => ({ ...f, dateRange: option.value as ROIFilterOptions['dateRange'] }))}
              >
                {option.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1 sm:gap-2 shrink-0 text-[10px] sm:text-sm h-7 sm:h-9 px-2 sm:px-3">
              <span className="text-muted-foreground [&>svg]:w-3 [&>svg]:h-3 sm:[&>svg]:w-4 sm:[&>svg]:h-4">{CategoryIcons[filters.category || 'all'] ? CategoryIcons[filters.category || 'all']() : null}</span>
              <span className="hidden sm:inline">{CONTENT_CATEGORIES.find(c => c.id === (filters.category || 'all'))?.name}</span>
              <ChevronDown className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {CONTENT_CATEGORIES.map(category => (
              <DropdownMenuItem 
                key={category.id}
                onClick={() => setFilters(f => ({ ...f, category: category.id === 'all' ? null : category.id }))}
              >
                <span className="mr-2 text-muted-foreground">{CategoryIcons[category.id] ? CategoryIcons[category.id]() : null}</span>
                {category.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1 sm:gap-2 shrink-0 text-[10px] sm:text-sm h-7 sm:h-9 px-2 sm:px-3">
              <ArrowUpDown className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Sort:</span> {filters.sortBy.charAt(0).toUpperCase() + filters.sortBy.slice(1)}
              <ChevronDown className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {['roi', 'revenue', 'cost', 'profit', 'pageviews', 'date'].map(sortOption => (
              <DropdownMenuItem 
                key={sortOption}
                onClick={() => setFilters(f => ({ 
                  ...f, 
                  sortBy: sortOption as ROIFilterOptions['sortBy'],
                  sortOrder: f.sortBy === sortOption && f.sortOrder === 'desc' ? 'asc' : 'desc'
                }))}
              >
                {sortOption.charAt(0).toUpperCase() + sortOption.slice(1)}
                {filters.sortBy === sortOption && (filters.sortOrder === 'desc' ? ' ↓' : ' ↑')}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        </div>

        {/* All / Profitable / Losing */}
        <div className="flex gap-1.5 sm:gap-2 sm:ml-auto">
          <Button 
            variant={filters.profitability === 'all' ? 'default' : 'outline'} 
            size="sm"
            className="text-[10px] sm:text-sm px-2 sm:px-3 h-7 sm:h-9"
            onClick={() => setFilters(f => ({ ...f, profitability: 'all' }))}
          >
            All
          </Button>
          <Button 
            variant={filters.profitability === 'profitable' ? 'default' : 'outline'} 
            size="sm"
            className={`text-[10px] sm:text-sm px-2 sm:px-3 h-7 sm:h-9 ${filters.profitability === 'profitable' ? 'bg-emerald-500 hover:bg-emerald-600' : ''}`}
            onClick={() => setFilters(f => ({ ...f, profitability: 'profitable' }))}
          >
            Profit
          </Button>
          <Button 
            variant={filters.profitability === 'unprofitable' ? 'default' : 'outline'} 
            size="sm"
            className={`text-[10px] sm:text-sm px-2 sm:px-3 h-7 sm:h-9 ${filters.profitability === 'unprofitable' ? 'bg-red-500 hover:bg-red-600' : ''}`}
            onClick={() => setFilters(f => ({ ...f, profitability: 'unprofitable' }))}
          >
            Loss
          </Button>
        </div>
      </div>

      {/* Articles List */}
      <div className="space-y-3 sm:space-y-4 overflow-hidden">
        <h2 className="text-base sm:text-lg font-semibold text-foreground">
          Articles ({filteredArticles.length})
        </h2>
        <div className="grid gap-3 sm:gap-4 overflow-hidden">
          {filteredArticles.map(article => (
            <ArticleROICard key={article.articleId} data={article} />
          ))}
        </div>
      </div>
    </div>
  )
}
