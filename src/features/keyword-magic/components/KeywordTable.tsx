"use client"

import { useState, useCallback, useMemo } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowUpDown, ArrowUp, ArrowDown, Download, Sparkles, Brain, Flame, Loader2, Video, ShoppingCart, Share2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

import type { Keyword } from "../types"
import { MOCK_KEYWORDS } from "../__mocks__/keyword-data"
import { SortField, SortDirection } from "../constants/table-config"
import { KeywordTableRow } from "./KeywordTableRow"
import { generateMockGEOScore } from "@/lib/geo-calculator"
import { generateMockRTV } from "@/lib/rtv-calculator"
import { generateMockAIOverviewAnalysis } from "@/lib/ai-overview-analyzer"
import { generateMockCommunityDecayForId } from "@/lib/community-decay-calculator"
import { generateMockVideoOpportunity } from "@/lib/video-opportunity-calculator"
import { generateMockCommerceOpportunity } from "@/lib/commerce-opportunity-calculator"
import { generateMockSocialOpportunity } from "@/lib/social-opportunity-calculator"

export interface KeywordTableProps {
  keywords?: Keyword[]
  country?: string // ISO country code for API calls
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
  
  const [page, setPage] = useState(1)
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set())
  const [selectAll, setSelectAll] = useState(false)
  const [sortField, setSortField] = useState<SortField>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")
  const [isExporting, setIsExporting] = useState(false)

  // Export to CSV function - Enhanced with all BlogSpy metrics
  const handleExportCSV = useCallback(() => {
    setIsExporting(true)
    
    // Get data to export (selected rows or all)
    const exportData = selectedRows.size > 0 
      ? data.filter(k => selectedRows.has(k.id))
      : data
    
    // Create CSV content with ALL BlogSpy columns
    const headers = [
      'Keyword', 
      'Volume', 
      'RTV', 
      'RTV %', 
      'KD', 
      'KD Level',
      'CPC', 
      'Intent', 
      'Trend Growth %',
      'Weak Spot',
      'Weak Spot Rank',
      'GEO Score',
      'GEO Level',
      'AIO Cited',
      'AIO Position',
      'AIO Opportunity',
      'Decay Score',
      'Video Opp',
      'Commerce Opp',
      'Social Opp',
      'SERP Features'
    ]
    
    const csvContent = [
      headers.join(','),
      ...exportData.map(k => {
        // Calculate all metrics
        const rtvData = generateMockRTV(k.id, k.volume)
        const aioData = generateMockAIOverviewAnalysis(k.keyword, k.weakSpot.type !== null)
        const decayData = generateMockCommunityDecayForId(k.id, k.keyword)
        const geoScore = k.geoScore ?? generateMockGEOScore(k.id)
        const videoData = generateMockVideoOpportunity(k.id, k.keyword)
        const commerceData = generateMockCommerceOpportunity(k.id, k.keyword, k.intent)
        const socialData = generateMockSocialOpportunity(k.id, k.keyword)
        
        // Calculate trend growth
        const trendGrowth = k.trend.length >= 2 
          ? (((k.trend[k.trend.length - 1] - k.trend[0]) / Math.max(k.trend[0], 1)) * 100).toFixed(1)
          : "0"
        
        // Get KD level
        const kdLevel = k.kd <= 14 ? "Very Easy" : k.kd <= 29 ? "Easy" : k.kd <= 49 ? "Moderate" : k.kd <= 69 ? "Hard" : k.kd <= 84 ? "Very Hard" : "Extreme"
        
        // Get GEO level
        const geoLevel = geoScore >= 80 ? "Excellent" : geoScore >= 60 ? "Good" : geoScore >= 40 ? "Moderate" : "Low"
        
        return [
          `"${k.keyword}"`,
          k.volume,
          rtvData.rtv,
          `${rtvData.rtv > 0 ? ((rtvData.rtv / k.volume) * 100).toFixed(1) : 0}%`,
          k.kd,
          kdLevel,
          k.cpc.toFixed(2),
          `"${k.intent.join(', ')}"`,
          `${trendGrowth}%`,
          k.weakSpot.type || "-",
          k.weakSpot.rank || "-",
          geoScore,
          geoLevel,
          aioData.yourContent.isCited ? "Yes" : "No",
          aioData.yourContent.citationPosition || "-",
          `${aioData.opportunityScore}%`,
          decayData?.decayScore ?? "-",
          `${videoData.score}%`,
          `${commerceData.score}%`,
          `${socialData.score}%`,
          `"${k.serpFeatures.join(', ')}"`
        ].join(',')
      })
    ].join('\n')
    
    // Download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `blogspy-keywords-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    
    setTimeout(() => setIsExporting(false), 500)
  }, [data, selectedRows])

  const handleSelectAll = useCallback(() => {
    const newSelected = selectAll ? new Set<number>() : new Set(data.map((k) => k.id))
    setSelectedRows(newSelected)
    setSelectAll(!selectAll)
    // Notify parent component
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
    // Notify parent component
    onSelectionChange?.(Array.from(newSelected))
  }, [selectedRows, data.length, onSelectionChange])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("desc")
    }
  }

  const sortedKeywords = useMemo(() => {
    if (!sortField) return data

    return [...data].sort((a, b) => {
      let comparison = 0
      
      switch (sortField) {
        case "keyword":
          comparison = a.keyword.localeCompare(b.keyword)
          break
        case "volume":
          comparison = a.volume - b.volume
          break
        case "rtv":
          // Generate RTV for comparison
          const aRtv = generateMockRTV(a.id, a.volume).rtv
          const bRtv = generateMockRTV(b.id, b.volume).rtv
          comparison = aRtv - bRtv
          break
        case "kd":
          comparison = a.kd - b.kd
          break
        case "cpc":
          comparison = a.cpc - b.cpc
          break
        case "trend":
          // Calculate trend growth percentage
          const aTrend = a.trend.length >= 2 
            ? ((a.trend[a.trend.length - 1] - a.trend[0]) / Math.max(a.trend[0], 1)) * 100
            : 0
          const bTrend = b.trend.length >= 2 
            ? ((b.trend[b.trend.length - 1] - b.trend[0]) / Math.max(b.trend[0], 1)) * 100
            : 0
          comparison = aTrend - bTrend
          break
        case "geoScore":
          const aGeo = a.geoScore ?? generateMockGEOScore(a.id)
          const bGeo = b.geoScore ?? generateMockGEOScore(b.id)
          comparison = aGeo - bGeo
          break
        case "aioScore":
          // Sort by AIO opportunity score
          const aAio = generateMockAIOverviewAnalysis(a.keyword, a.weakSpot.type !== null)
          const bAio = generateMockAIOverviewAnalysis(b.keyword, b.weakSpot.type !== null)
          comparison = aAio.opportunityScore - bAio.opportunityScore
          break
        case "decayScore":
          // Sort by decay score
          const aDecay = generateMockCommunityDecayForId(a.id, a.keyword)
          const bDecay = generateMockCommunityDecayForId(b.id, b.keyword)
          comparison = (aDecay?.decayScore ?? 0) - (bDecay?.decayScore ?? 0)
          break
        case "videoOpp":
          // Sort by video opportunity score
          const aVideo = generateMockVideoOpportunity(a.id, a.keyword)
          const bVideo = generateMockVideoOpportunity(b.id, b.keyword)
          comparison = aVideo.score - bVideo.score
          break
        case "commerceOpp":
          // Sort by commerce opportunity score
          const aCommerce = generateMockCommerceOpportunity(a.id, a.keyword, a.intent)
          const bCommerce = generateMockCommerceOpportunity(b.id, b.keyword, b.intent)
          comparison = aCommerce.score - bCommerce.score
          break
        case "socialOpp":
          // Sort by social opportunity score
          const aSocial = generateMockSocialOpportunity(a.id, a.keyword)
          const bSocial = generateMockSocialOpportunity(b.id, b.keyword)
          comparison = aSocial.score - bSocial.score
          break
        default:
          comparison = 0
      }

      return sortDirection === "asc" ? comparison : -comparison
    })
  }, [data, sortField, sortDirection])

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-3 w-3 text-muted-foreground/50" />
    }
    return sortDirection === "asc" ? (
      <ArrowUp className="h-3 w-3 text-primary" />
    ) : (
      <ArrowDown className="h-3 w-3 text-primary" />
    )
  }

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
              <thead className="sticky top-0 z-30 bg-muted/95 backdrop-blur">
                <tr className="border-b border-border">
                  <th className="w-10 p-2 text-left font-medium bg-muted/95">
                    <Checkbox checked={selectAll} onCheckedChange={handleSelectAll} aria-label="Select all" />
                  </th>
                  <th className="w-[180px] p-2 text-left font-medium bg-muted/95">Keyword</th>
                  <th className="w-14 p-2 text-center font-medium">Intent</th>
                  <th className="w-20 p-2 text-right font-medium">
                    <button onClick={() => handleSort("volume")} className="inline-flex items-center gap-1 hover:text-foreground transition-colors">
                      Volume <SortIcon field="volume" />
                    </button>
                  </th>
                  <th className="w-16 p-2 text-right font-medium">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button onClick={() => handleSort("rtv")} className="inline-flex items-center gap-1 hover:text-foreground transition-colors">
                          RTV <SortIcon field="rtv" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-xs">
                        <p className="font-medium">Realizable Traffic Volume</p>
                        <p className="text-xs text-muted-foreground mt-1">Actual traffic potential after accounting for AI Overview, Featured Snippets, Ads stealing clicks.</p>
                      </TooltipContent>
                    </Tooltip>
                  </th>
                  <th className="w-16 p-2 text-center font-medium">
                    <button onClick={() => handleSort("trend")} className="inline-flex items-center gap-1 hover:text-foreground transition-colors">
                      Trend <SortIcon field="trend" />
                    </button>
                  </th>
                  <th className="w-24 p-2 text-center font-medium">Weak Spot</th>
                  <th className="w-16 p-2 text-center font-medium">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button onClick={() => handleSort("geoScore")} className="inline-flex items-center gap-1 hover:text-foreground transition-colors">
                          <Sparkles className="h-3 w-3 text-cyan-400" /> GEO <SortIcon field="geoScore" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-xs">
                        <p className="font-medium">GEO Score (0-100)</p>
                        <p className="text-xs text-muted-foreground mt-1">Generative Engine Optimization score. Higher = easier to get cited by AI Overview.</p>
                      </TooltipContent>
                    </Tooltip>
                  </th>
                  <th className="w-14 p-2 text-center font-medium">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button onClick={() => handleSort("aioScore")} className="inline-flex items-center gap-1 hover:text-foreground transition-colors">
                          <Brain className="h-3 w-3 text-purple-400" /> AIO <SortIcon field="aioScore" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-xs">
                        <p className="font-medium">AI Overview Citation</p>
                        <p className="text-xs text-muted-foreground mt-1">Your citation position in AI Overview. Shows opportunity % if not cited.</p>
                      </TooltipContent>
                    </Tooltip>
                  </th>
                  <th className="w-14 p-2 text-center font-medium">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button onClick={() => handleSort("decayScore")} className="inline-flex items-center gap-1 hover:text-foreground transition-colors">
                          <Flame className="h-3 w-3 text-orange-400" /> Decay <SortIcon field="decayScore" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-xs">
                        <p className="font-medium">Community Decay Score</p>
                        <p className="text-xs text-muted-foreground mt-1">How old is Reddit/Quora content in SERP? Higher = easier to outrank aging content.</p>
                      </TooltipContent>
                    </Tooltip>
                  </th>
                  <th className="w-14 p-2 text-center font-medium">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button onClick={() => handleSort("videoOpp")} className="inline-flex items-center gap-1 hover:text-foreground transition-colors">
                          <Video className="h-3 w-3 text-red-400" /> Video <SortIcon field="videoOpp" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-xs">
                        <p className="font-medium">Video Opportunity</p>
                        <p className="text-xs text-muted-foreground mt-1">YouTube + TikTok ranking opportunity. Higher = easier to rank with video content.</p>
                      </TooltipContent>
                    </Tooltip>
                  </th>
                  <th className="w-14 p-2 text-center font-medium">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button onClick={() => handleSort("commerceOpp")} className="inline-flex items-center gap-1 hover:text-foreground transition-colors">
                          <ShoppingCart className="h-3 w-3 text-amber-400" /> Comm <SortIcon field="commerceOpp" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-xs">
                        <p className="font-medium">Commerce Opportunity</p>
                        <p className="text-xs text-muted-foreground mt-1">Amazon ranking opportunity. Shows potential for e-commerce/affiliate content.</p>
                      </TooltipContent>
                    </Tooltip>
                  </th>
                  <th className="w-14 p-2 text-center font-medium">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button onClick={() => handleSort("socialOpp")} className="inline-flex items-center gap-1 hover:text-foreground transition-colors">
                          <Share2 className="h-3 w-3 text-pink-400" /> Social <SortIcon field="socialOpp" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-xs">
                        <p className="font-medium">Social Opportunity</p>
                        <p className="text-xs text-muted-foreground mt-1">Pinterest + Twitter/X + Instagram combined opportunity score.</p>
                      </TooltipContent>
                    </Tooltip>
                  </th>
                  <th className="w-14 p-2 text-center font-medium">
                    <button onClick={() => handleSort("kd")} className="inline-flex items-center gap-1 hover:text-foreground transition-colors">
                      KD <SortIcon field="kd" />
                    </button>
                  </th>
                  <th className="w-14 p-2 text-right font-medium">
                    <button onClick={() => handleSort("cpc")} className="inline-flex items-center gap-1 hover:text-foreground transition-colors">
                      CPC <SortIcon field="cpc" />
                    </button>
                  </th>
                  <th className="w-20 p-2 text-left font-medium">SERP</th>
                  <th className="w-24 p-2 text-right font-medium">
                    <div className="flex items-center justify-end gap-2">
                      Actions
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleExportCSV} disabled={isExporting}>
                            <Download className={cn("h-3.5 w-3.5", isExporting && "animate-pulse")} />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{selectedRows.size > 0 ? `Export ${selectedRows.size} selected` : 'Export all to CSV'}</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedKeywords.slice(0, page * ITEMS_PER_PAGE).map((item, index) => (
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

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 px-3 sm:px-4 py-2 sm:py-3 border-t border-border bg-muted/30 shrink-0 rounded-b-lg">
          <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
            <span className="text-[10px] sm:text-xs text-muted-foreground font-mono">
              {Math.min(page * ITEMS_PER_PAGE, sortedKeywords.length)}/{sortedKeywords.length}
            </span>
            {selectedRows.size > 0 && (
              <span className="text-[10px] sm:text-xs text-primary font-medium">{selectedRows.size} selected</span>
            )}
          </div>
          {page * ITEMS_PER_PAGE < sortedKeywords.length ? (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setPage(page + 1)} 
              className="gap-1.5 sm:gap-2 h-7 sm:h-8 text-[10px] sm:text-xs w-full sm:w-auto"
            >
              Load More
              <span className="text-muted-foreground">({sortedKeywords.length - page * ITEMS_PER_PAGE})</span>
            </Button>
          ) : (
            <span className="text-[10px] sm:text-xs text-muted-foreground">All loaded</span>
          )}
        </div>
      </div>
    </TooltipProvider>
  )
}
