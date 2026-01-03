// ============================================
// KEYWORD POOL TABLE - Professional Data Table
// ============================================
// Full-featured table with filtering, sorting, selection
// Like Ahrefs/SEMrush keyword tables

"use client"

import { useState, useMemo, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Search,
  Filter,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Minus,
  Trash2,
  Download,
  Upload,
  Plus,
  Wand2,
  BarChart3,
  Target,
  TrendingUp,
  Scissors,
  Compass,
  Newspaper,
  Users,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  RefreshCw,
  X,
  FileText,
  MoreHorizontal
} from "lucide-react"
import { cn } from "@/lib/utils"

// ============================================
// TYPES
// ============================================

export interface PoolKeyword {
  id: string
  keyword: string
  volume: number
  kd: number
  cpc: number
  intent: "informational" | "commercial" | "transactional" | "navigational"
  trend: "up" | "down" | "stable"
  trendPercent: number
  wordCount: number
  source: string
  isSelected: boolean
}

export interface KeywordFilters {
  search: string
  volumeMin: number
  volumeMax: number
  kdMin: number
  kdMax: number
  cpcMin: number
  cpcMax: number
  intent: string
  trend: string
  wordCountMin: number
  wordCountMax: number
  source: string
}

type SortField = "keyword" | "volume" | "kd" | "cpc" | "trend" | "wordCount"
type SortDirection = "asc" | "desc"

// ============================================
// IMPORT SOURCE BUTTONS
// ============================================

const IMPORT_SOURCES = [
  { id: "keyword-explorer", label: "Keyword Explorer", icon: Wand2, color: "purple", route: "/keyword-magic" },
  { id: "competitor-gap", label: "Competitor Gap", icon: BarChart3, color: "cyan", route: "/competitor-gap" },
  { id: "rank-tracker", label: "Rank Tracker", icon: Target, color: "green", route: "/rank-tracker" },
  { id: "content-decay", label: "Content Decay", icon: TrendingUp, color: "red", route: "/content-decay" },
  { id: "snippet-stealer", label: "Snippet Stealer", icon: Scissors, color: "amber", route: "/snippet-stealer" },
  { id: "trend-spotter", label: "Trend Spotter", icon: Compass, color: "blue", route: "/trend-spotter" },
  { id: "news-tracker", label: "News Tracker", icon: Newspaper, color: "pink", route: "/trends" },
  { id: "social-tracker", label: "Social Tracker", icon: Users, color: "indigo", route: "/social" },
]

// ============================================
// DEMO DATA
// ============================================

const DEMO_KEYWORDS: PoolKeyword[] = [
  // High volume pillars
  { id: "1", keyword: "AI Writing Tools", volume: 45000, kd: 52, cpc: 3.20, intent: "informational", trend: "up", trendPercent: 15, wordCount: 3, source: "keyword-magic", isSelected: false },
  { id: "2", keyword: "AI Content Generator", volume: 38000, kd: 48, cpc: 4.10, intent: "commercial", trend: "up", trendPercent: 22, wordCount: 3, source: "keyword-magic", isSelected: false },
  { id: "3", keyword: "AI Writing Software", volume: 28000, kd: 45, cpc: 3.80, intent: "commercial", trend: "up", trendPercent: 18, wordCount: 3, source: "competitor-gap", isSelected: false },
  
  // H2 level keywords
  { id: "4", keyword: "Best AI Writing Tools 2025", volume: 12500, kd: 42, cpc: 4.50, intent: "commercial", trend: "up", trendPercent: 35, wordCount: 5, source: "keyword-magic", isSelected: false },
  { id: "5", keyword: "Free AI Writing Tools", volume: 18000, kd: 35, cpc: 2.20, intent: "commercial", trend: "up", trendPercent: 28, wordCount: 4, source: "competitor-gap", isSelected: false },
  { id: "6", keyword: "AI Content Creation Tools", volume: 9800, kd: 38, cpc: 3.40, intent: "commercial", trend: "up", trendPercent: 12, wordCount: 4, source: "keyword-magic", isSelected: false },
  { id: "7", keyword: "How AI Writers Work", volume: 5200, kd: 28, cpc: 1.80, intent: "informational", trend: "stable", trendPercent: 2, wordCount: 4, source: "snippet-stealer", isSelected: false },
  
  // H3 level keywords
  { id: "8", keyword: "AI Writing Tools for Bloggers", volume: 4200, kd: 32, cpc: 2.90, intent: "commercial", trend: "up", trendPercent: 8, wordCount: 5, source: "rank-tracker", isSelected: false },
  { id: "9", keyword: "AI Writing Tools for Business", volume: 3800, kd: 35, cpc: 5.20, intent: "commercial", trend: "up", trendPercent: 15, wordCount: 5, source: "competitor-gap", isSelected: false },
  { id: "10", keyword: "AI Content Generator Free Online", volume: 8500, kd: 28, cpc: 1.50, intent: "transactional", trend: "up", trendPercent: 42, wordCount: 5, source: "trend-spotter", isSelected: false },
  { id: "11", keyword: "AI Writing Technology Explained", volume: 890, kd: 22, cpc: 0.80, intent: "informational", trend: "stable", trendPercent: 0, wordCount: 4, source: "snippet-stealer", isSelected: false },
  
  // FAQ keywords
  { id: "12", keyword: "Is AI Writing Good for SEO", volume: 3400, kd: 25, cpc: 1.20, intent: "informational", trend: "up", trendPercent: 18, wordCount: 6, source: "snippet-stealer", isSelected: false },
  { id: "13", keyword: "Can Google Detect AI Writing", volume: 8200, kd: 22, cpc: 0.90, intent: "informational", trend: "up", trendPercent: 55, wordCount: 5, source: "trend-spotter", isSelected: false },
  { id: "14", keyword: "How to Use AI for Content Writing", volume: 6500, kd: 30, cpc: 2.10, intent: "informational", trend: "up", trendPercent: 25, wordCount: 7, source: "keyword-magic", isSelected: false },
  { id: "15", keyword: "What is AI Content Writing", volume: 4500, kd: 18, cpc: 1.00, intent: "informational", trend: "stable", trendPercent: 5, wordCount: 5, source: "snippet-stealer", isSelected: false },
  
  // Cluster article keywords
  { id: "16", keyword: "ChatGPT vs Jasper AI", volume: 18500, kd: 35, cpc: 4.80, intent: "commercial", trend: "up", trendPercent: 45, wordCount: 4, source: "competitor-gap", isSelected: false },
  { id: "17", keyword: "AI Writing Tools Comparison", volume: 5800, kd: 38, cpc: 3.60, intent: "commercial", trend: "up", trendPercent: 20, wordCount: 4, source: "keyword-magic", isSelected: false },
  { id: "18", keyword: "AI Writing Tools Pricing", volume: 4200, kd: 25, cpc: 5.50, intent: "transactional", trend: "stable", trendPercent: 8, wordCount: 4, source: "competitor-gap", isSelected: false },
  { id: "19", keyword: "AI Writing Tutorial for Beginners", volume: 6500, kd: 22, cpc: 1.80, intent: "informational", trend: "up", trendPercent: 30, wordCount: 5, source: "content-decay", isSelected: false },
  { id: "20", keyword: "AI Blog Writing Guide", volume: 3200, kd: 28, cpc: 2.40, intent: "informational", trend: "up", trendPercent: 15, wordCount: 4, source: "keyword-magic", isSelected: false },
  
  // Long-tail variations
  { id: "21", keyword: "Best Free AI Writing Tools for Students", volume: 2800, kd: 18, cpc: 1.20, intent: "commercial", trend: "up", trendPercent: 38, wordCount: 7, source: "trend-spotter", isSelected: false },
  { id: "22", keyword: "AI Writing Tools with No Word Limit", volume: 1900, kd: 15, cpc: 2.80, intent: "commercial", trend: "up", trendPercent: 25, wordCount: 7, source: "rank-tracker", isSelected: false },
  { id: "23", keyword: "How to Write Better with AI Tools", volume: 2400, kd: 25, cpc: 1.50, intent: "informational", trend: "up", trendPercent: 12, wordCount: 7, source: "snippet-stealer", isSelected: false },
  { id: "24", keyword: "AI Content Writing for E-commerce", volume: 3100, kd: 32, cpc: 4.20, intent: "commercial", trend: "up", trendPercent: 22, wordCount: 5, source: "competitor-gap", isSelected: false },
  { id: "25", keyword: "Automated Blog Writing Software", volume: 2200, kd: 35, cpc: 3.80, intent: "commercial", trend: "stable", trendPercent: 5, wordCount: 4, source: "keyword-magic", isSelected: false },
  
  // More variations
  { id: "26", keyword: "AI Article Writer", volume: 15000, kd: 42, cpc: 3.50, intent: "commercial", trend: "up", trendPercent: 18, wordCount: 3, source: "keyword-magic", isSelected: false },
  { id: "27", keyword: "AI Essay Writer", volume: 22000, kd: 38, cpc: 2.80, intent: "transactional", trend: "up", trendPercent: 35, wordCount: 3, source: "trend-spotter", isSelected: false },
  { id: "28", keyword: "AI Copywriting Tools", volume: 8500, kd: 40, cpc: 4.90, intent: "commercial", trend: "up", trendPercent: 28, wordCount: 3, source: "competitor-gap", isSelected: false },
  { id: "29", keyword: "AI SEO Writing Tools", volume: 4800, kd: 35, cpc: 4.20, intent: "commercial", trend: "up", trendPercent: 22, wordCount: 4, source: "keyword-magic", isSelected: false },
  { id: "30", keyword: "AI Marketing Content Generator", volume: 3600, kd: 38, cpc: 5.10, intent: "commercial", trend: "up", trendPercent: 15, wordCount: 4, source: "competitor-gap", isSelected: false },
]

// ============================================
// DEFAULT FILTERS
// ============================================

const DEFAULT_FILTERS: KeywordFilters = {
  search: "",
  volumeMin: 0,
  volumeMax: 1000000,
  kdMin: 0,
  kdMax: 100,
  cpcMin: 0,
  cpcMax: 100,
  intent: "all",
  trend: "all",
  wordCountMin: 1,
  wordCountMax: 20,
  source: "all"
}

// ============================================
// MAIN COMPONENT
// ============================================

interface KeywordPoolTableProps {
  onBuildCluster: (keywords: PoolKeyword[]) => void
}

export function KeywordPoolTable({ onBuildCluster }: KeywordPoolTableProps) {
  // State
  const [keywords, setKeywords] = useState<PoolKeyword[]>([])
  const [filters, setFilters] = useState<KeywordFilters>(DEFAULT_FILTERS)
  const [sortField, setSortField] = useState<SortField>("volume")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")
  const [showFilters, setShowFilters] = useState(false)
  const [showManualInput, setShowManualInput] = useState(false)
  const [manualInput, setManualInput] = useState("")
  const [inputFormat, setInputFormat] = useState<"simple" | "csv" | "tabbed">("simple")
  
  // Filter keywords
  const filteredKeywords = useMemo(() => {
    return keywords.filter(kw => {
      if (filters.search && !kw.keyword.toLowerCase().includes(filters.search.toLowerCase())) return false
      if (kw.volume < filters.volumeMin || kw.volume > filters.volumeMax) return false
      if (kw.kd < filters.kdMin || kw.kd > filters.kdMax) return false
      if (kw.cpc < filters.cpcMin || kw.cpc > filters.cpcMax) return false
      if (filters.intent !== "all" && kw.intent !== filters.intent) return false
      if (filters.trend !== "all" && kw.trend !== filters.trend) return false
      if (kw.wordCount < filters.wordCountMin || kw.wordCount > filters.wordCountMax) return false
      if (filters.source !== "all" && kw.source !== filters.source) return false
      return true
    })
  }, [keywords, filters])
  
  // Sort keywords
  const sortedKeywords = useMemo(() => {
    return [...filteredKeywords].sort((a, b) => {
      let aVal: number | string = a[sortField]
      let bVal: number | string = b[sortField]
      
      if (sortField === "trend") {
        aVal = a.trendPercent
        bVal = b.trendPercent
      }
      
      if (typeof aVal === "string") {
        return sortDirection === "asc" 
          ? aVal.localeCompare(bVal as string)
          : (bVal as string).localeCompare(aVal)
      }
      
      return sortDirection === "asc" ? aVal - (bVal as number) : (bVal as number) - aVal
    })
  }, [filteredKeywords, sortField, sortDirection])
  
  // Selected keywords
  const selectedKeywords = useMemo(() => keywords.filter(k => k.isSelected), [keywords])
  const selectedCount = selectedKeywords.length
  const allSelected = filteredKeywords.length > 0 && filteredKeywords.every(k => k.isSelected)
  
  // Stats
  const stats = useMemo(() => ({
    total: keywords.length,
    filtered: filteredKeywords.length,
    selected: selectedCount,
    totalVolume: selectedKeywords.reduce((sum, k) => sum + k.volume, 0),
    avgKD: selectedKeywords.length > 0 
      ? Math.round(selectedKeywords.reduce((sum, k) => sum + k.kd, 0) / selectedKeywords.length)
      : 0
  }), [keywords, filteredKeywords, selectedKeywords, selectedCount])
  
  // Handlers
  const handleSort = useCallback((field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("desc")
    }
  }, [sortField])
  
  const handleSelectAll = useCallback(() => {
    const newSelected = !allSelected
    setKeywords(prev => prev.map(k => 
      filteredKeywords.some(fk => fk.id === k.id) 
        ? { ...k, isSelected: newSelected }
        : k
    ))
  }, [allSelected, filteredKeywords])
  
  const handleSelectOne = useCallback((id: string) => {
    setKeywords(prev => prev.map(k => 
      k.id === id ? { ...k, isSelected: !k.isSelected } : k
    ))
  }, [])
  
  const handleLoadDemo = useCallback(() => {
    setKeywords(DEMO_KEYWORDS)
  }, [])
  
  const handleClearAll = useCallback(() => {
    setKeywords([])
  }, [])
  
  const handleDeleteSelected = useCallback(() => {
    setKeywords(prev => prev.filter(k => !k.isSelected))
  }, [])
  
  const handleImportSource = useCallback((sourceId: string) => {
    // In real app, this would open a modal to select keywords from that source
    // For now, filter demo data by source
    const sourceKeywords = DEMO_KEYWORDS.filter(k => k.source === sourceId)
    if (sourceKeywords.length > 0) {
      setKeywords(prev => {
        const existingIds = new Set(prev.map(k => k.keyword.toLowerCase()))
        const newKws = sourceKeywords.filter(k => !existingIds.has(k.keyword.toLowerCase()))
        return [...prev, ...newKws.map(k => ({ ...k, id: `${k.id}_${Date.now()}` }))]
      })
    } else {
      alert(`No keywords found from ${sourceId}. In production, this would open the ${sourceId} page.`)
    }
  }, [])
  
  const handleManualAdd = useCallback(() => {
    if (!manualInput.trim()) return
    
    const lines = manualInput.trim().split("\n").filter(l => l.trim())
    const newKeywords: PoolKeyword[] = []
    
    for (const line of lines) {
      let keyword = ""
      let volume = 1000
      let kd = 30
      let cpc = 1.00
      
      if (inputFormat === "simple") {
        keyword = line.trim()
      } else if (inputFormat === "csv") {
        const parts = line.split(",").map(p => p.trim())
        keyword = parts[0] || ""
        volume = parseInt(parts[1]) || 1000
        kd = parseInt(parts[2]) || 30
        cpc = parseFloat(parts[3]) || 1.00
      } else if (inputFormat === "tabbed") {
        const parts = line.split("\t").map(p => p.trim())
        keyword = parts[0] || ""
        volume = parseInt(parts[1]) || 1000
        kd = parseInt(parts[2]) || 30
        cpc = parseFloat(parts[3]) || 1.00
      }
      
      if (keyword) {
        // Detect intent from keyword
        let intent: PoolKeyword["intent"] = "informational"
        const lower = keyword.toLowerCase()
        if (/best|top|review|vs|compare|alternative/.test(lower)) intent = "commercial"
        else if (/buy|price|discount|deal|order|purchase/.test(lower)) intent = "transactional"
        else if (/login|official|website|app/.test(lower)) intent = "navigational"
        
        newKeywords.push({
          id: `manual_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          keyword,
          volume,
          kd,
          cpc,
          intent,
          trend: "stable",
          trendPercent: 0,
          wordCount: keyword.split(/\s+/).length,
          source: "manual",
          isSelected: false
        })
      }
    }
    
    if (newKeywords.length > 0) {
      setKeywords(prev => {
        const existingKeywords = new Set(prev.map(k => k.keyword.toLowerCase()))
        const unique = newKeywords.filter(k => !existingKeywords.has(k.keyword.toLowerCase()))
        return [...prev, ...unique]
      })
      setManualInput("")
      setShowManualInput(false)
    }
  }, [manualInput, inputFormat])
  
  const handleBuildCluster = useCallback(() => {
    if (selectedKeywords.length < 5) {
      alert("Please select at least 5 keywords to build a cluster")
      return
    }
    onBuildCluster(selectedKeywords)
  }, [selectedKeywords, onBuildCluster])
  
  const handleResetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS)
  }, [])
  
  // Render sort icon
  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="h-3 w-3 opacity-50" />
    return sortDirection === "asc" 
      ? <ArrowUp className="h-3 w-3 text-orange-400" />
      : <ArrowDown className="h-3 w-3 text-orange-400" />
  }
  
  // Render trend icon
  const TrendIcon = ({ trend, percent }: { trend: string; percent: number }) => {
    if (trend === "up") return <span className="text-emerald-400 flex items-center gap-1"><ArrowUp className="h-3 w-3" />+{percent}%</span>
    if (trend === "down") return <span className="text-red-400 flex items-center gap-1"><ArrowDown className="h-3 w-3" />-{percent}%</span>
    return <span className="text-zinc-500 flex items-center gap-1"><Minus className="h-3 w-3" />{percent}%</span>
  }
  
  // Render intent badge
  const IntentBadge = ({ intent }: { intent: string }) => {
    const colors: Record<string, string> = {
      informational: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      commercial: "bg-purple-500/20 text-purple-400 border-purple-500/30",
      transactional: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
      navigational: "bg-amber-500/20 text-amber-400 border-amber-500/30"
    }
    const labels: Record<string, string> = {
      informational: "Info",
      commercial: "Comm",
      transactional: "Trans",
      navigational: "Nav"
    }
    return (
      <Badge variant="outline" className={cn("text-[10px]", colors[intent])}>
        {labels[intent]}
      </Badge>
    )
  }
  
  return (
    <div className="h-full flex flex-col">
      {/* Header with Import Sources */}
      <div className="p-4 border-b border-zinc-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold">Keyword Pool</h2>
            <p className="text-sm text-zinc-400">Import keywords from various sources or add manually</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleLoadDemo}>
              <Sparkles className="h-4 w-4 mr-1" />
              Load Demo (30)
            </Button>
            {keywords.length > 0 && (
              <Button variant="ghost" size="sm" onClick={handleClearAll} className="text-red-400">
                <Trash2 className="h-4 w-4 mr-1" />
                Clear All
              </Button>
            )}
          </div>
        </div>
        
        {/* Import Source Buttons */}
        <div className="flex flex-wrap gap-2">
          {IMPORT_SOURCES.map(source => {
            const Icon = source.icon
            const colorClasses: Record<string, string> = {
              purple: "border-purple-500/30 hover:border-purple-500/50 hover:bg-purple-500/10 text-purple-400",
              cyan: "border-cyan-500/30 hover:border-cyan-500/50 hover:bg-cyan-500/10 text-cyan-400",
              green: "border-emerald-500/30 hover:border-emerald-500/50 hover:bg-emerald-500/10 text-emerald-400",
              red: "border-red-500/30 hover:border-red-500/50 hover:bg-red-500/10 text-red-400",
              amber: "border-amber-500/30 hover:border-amber-500/50 hover:bg-amber-500/10 text-amber-400",
              blue: "border-blue-500/30 hover:border-blue-500/50 hover:bg-blue-500/10 text-blue-400",
              pink: "border-pink-500/30 hover:border-pink-500/50 hover:bg-pink-500/10 text-pink-400",
              indigo: "border-indigo-500/30 hover:border-indigo-500/50 hover:bg-indigo-500/10 text-indigo-400",
            }
            return (
              <Button
                key={source.id}
                variant="outline"
                size="sm"
                onClick={() => handleImportSource(source.id)}
                className={cn("gap-1.5", colorClasses[source.color])}
              >
                <Icon className="h-3.5 w-3.5" />
                {source.label}
              </Button>
            )
          })}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowManualInput(!showManualInput)}
            className="gap-1.5 border-orange-500/30 hover:border-orange-500/50 hover:bg-orange-500/10 text-orange-400"
          >
            <Plus className="h-3.5 w-3.5" />
            Manual Input
          </Button>
        </div>
        
        {/* Manual Input Panel */}
        {showManualInput && (
          <Card className="mt-4 p-4 border-zinc-700 bg-zinc-900/50">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium flex items-center gap-2">
                <Upload className="h-4 w-4 text-orange-400" />
                Add Keywords Manually
              </h3>
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  {(["simple", "csv", "tabbed"] as const).map(f => (
                    <button
                      key={f}
                      onClick={() => setInputFormat(f)}
                      className={cn(
                        "px-2 py-1 text-xs rounded transition-colors",
                        inputFormat === f ? "bg-orange-500 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                      )}
                    >
                      {f === "simple" ? "Simple" : f === "csv" ? "CSV" : "Tabbed"}
                    </button>
                  ))}
                </div>
                <Button variant="ghost" size="sm" onClick={() => setShowManualInput(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <Textarea
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              placeholder={
                inputFormat === "simple" 
                  ? "Enter one keyword per line:\n\nai writing tools\nbest ai content generator\nhow to use chatgpt for seo"
                  : inputFormat === "csv"
                  ? "keyword,volume,kd,cpc\n\nai writing tools,15000,45,3.20\nbest ai content,8000,38,2.50"
                  : "keyword\\tvolume\\tkd\\tcpc\n\nai writing tools\\t15000\\t45\\t3.20"
              }
              className="min-h-[120px] bg-zinc-800/50 border-zinc-700 text-sm font-mono"
            />
            
            <div className="mt-3 flex items-center justify-between">
              <span className="text-xs text-zinc-500">
                {inputFormat === "simple" && "One keyword per line (defaults: volume=1000, kd=30, cpc=$1)"}
                {inputFormat === "csv" && "Format: keyword,volume,kd,cpc"}
                {inputFormat === "tabbed" && "Tab-separated: keyword → volume → kd → cpc"}
              </span>
              <Button size="sm" onClick={handleManualAdd} disabled={!manualInput.trim()}>
                <Plus className="h-4 w-4 mr-1" />
                Add Keywords
              </Button>
            </div>
          </Card>
        )}
      </div>
      
      {/* Filters Bar */}
      <div className="p-4 border-b border-zinc-800 bg-zinc-900/30">
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <Input
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              placeholder="Search keywords..."
              className="pl-9 bg-zinc-800/50 border-zinc-700"
            />
          </div>
          
          {/* Quick Filters */}
          <Select value={filters.intent} onValueChange={(v) => setFilters(prev => ({ ...prev, intent: v }))}>
            <SelectTrigger className="w-[130px] bg-zinc-800/50 border-zinc-700">
              <SelectValue placeholder="Intent" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Intents</SelectItem>
              <SelectItem value="informational">Informational</SelectItem>
              <SelectItem value="commercial">Commercial</SelectItem>
              <SelectItem value="transactional">Transactional</SelectItem>
              <SelectItem value="navigational">Navigational</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={filters.trend} onValueChange={(v) => setFilters(prev => ({ ...prev, trend: v }))}>
            <SelectTrigger className="w-[120px] bg-zinc-800/50 border-zinc-700">
              <SelectValue placeholder="Trend" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Trends</SelectItem>
              <SelectItem value="up">↑ Rising</SelectItem>
              <SelectItem value="down">↓ Falling</SelectItem>
              <SelectItem value="stable">→ Stable</SelectItem>
            </SelectContent>
          </Select>
          
          {/* Advanced Filters Toggle */}
          <Button 
            variant={showFilters ? "default" : "outline"} 
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className={showFilters ? "bg-orange-500 hover:bg-orange-600" : ""}
          >
            <Filter className="h-4 w-4 mr-1" />
            Filters
          </Button>
          
          {/* Reset Filters */}
          {(filters.search || filters.intent !== "all" || filters.trend !== "all" || 
            filters.volumeMin > 0 || filters.kdMin > 0) && (
            <Button variant="ghost" size="sm" onClick={handleResetFilters}>
              <RefreshCw className="h-4 w-4 mr-1" />
              Reset
            </Button>
          )}
          
          {/* Stats */}
          <div className="ml-auto flex items-center gap-4 text-sm">
            <span className="text-zinc-400">
              Showing <span className="text-white font-medium">{stats.filtered}</span> of {stats.total}
            </span>
            {stats.selected > 0 && (
              <span className="text-orange-400 font-medium">
                {stats.selected} selected
              </span>
            )}
          </div>
        </div>
        
        {/* Advanced Filters */}
        {showFilters && (
          <div className="mt-4 p-4 bg-zinc-800/30 rounded-lg grid grid-cols-4 gap-4">
            <div>
              <label className="text-xs text-zinc-500 mb-1 block">Volume Range</label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={filters.volumeMin}
                  onChange={(e) => setFilters(prev => ({ ...prev, volumeMin: parseInt(e.target.value) || 0 }))}
                  placeholder="Min"
                  className="bg-zinc-800 border-zinc-700 text-sm"
                />
                <span className="text-zinc-500">-</span>
                <Input
                  type="number"
                  value={filters.volumeMax}
                  onChange={(e) => setFilters(prev => ({ ...prev, volumeMax: parseInt(e.target.value) || 1000000 }))}
                  placeholder="Max"
                  className="bg-zinc-800 border-zinc-700 text-sm"
                />
              </div>
            </div>
            
            <div>
              <label className="text-xs text-zinc-500 mb-1 block">KD Range (0-100)</label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={filters.kdMin}
                  onChange={(e) => setFilters(prev => ({ ...prev, kdMin: parseInt(e.target.value) || 0 }))}
                  placeholder="Min"
                  className="bg-zinc-800 border-zinc-700 text-sm"
                />
                <span className="text-zinc-500">-</span>
                <Input
                  type="number"
                  value={filters.kdMax}
                  onChange={(e) => setFilters(prev => ({ ...prev, kdMax: parseInt(e.target.value) || 100 }))}
                  placeholder="Max"
                  className="bg-zinc-800 border-zinc-700 text-sm"
                />
              </div>
            </div>
            
            <div>
              <label className="text-xs text-zinc-500 mb-1 block">CPC Range ($)</label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  step="0.1"
                  value={filters.cpcMin}
                  onChange={(e) => setFilters(prev => ({ ...prev, cpcMin: parseFloat(e.target.value) || 0 }))}
                  placeholder="Min"
                  className="bg-zinc-800 border-zinc-700 text-sm"
                />
                <span className="text-zinc-500">-</span>
                <Input
                  type="number"
                  step="0.1"
                  value={filters.cpcMax}
                  onChange={(e) => setFilters(prev => ({ ...prev, cpcMax: parseFloat(e.target.value) || 100 }))}
                  placeholder="Max"
                  className="bg-zinc-800 border-zinc-700 text-sm"
                />
              </div>
            </div>
            
            <div>
              <label className="text-xs text-zinc-500 mb-1 block">Word Count</label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={filters.wordCountMin}
                  onChange={(e) => setFilters(prev => ({ ...prev, wordCountMin: parseInt(e.target.value) || 1 }))}
                  placeholder="Min"
                  className="bg-zinc-800 border-zinc-700 text-sm"
                />
                <span className="text-zinc-500">-</span>
                <Input
                  type="number"
                  value={filters.wordCountMax}
                  onChange={(e) => setFilters(prev => ({ ...prev, wordCountMax: parseInt(e.target.value) || 20 }))}
                  placeholder="Max"
                  className="bg-zinc-800 border-zinc-700 text-sm"
                />
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Table */}
      <div className="flex-1 overflow-auto">
        {keywords.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-zinc-500">
            <FileText className="h-16 w-16 mb-4 opacity-30" />
            <p className="text-lg font-medium mb-2">No Keywords Yet</p>
            <p className="text-sm mb-4">Import keywords from sources above or add them manually</p>
            <Button variant="outline" onClick={handleLoadDemo}>
              <Sparkles className="h-4 w-4 mr-2" />
              Load Demo Keywords
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader className="sticky top-0 bg-zinc-900 z-10">
              <TableRow className="border-zinc-800 hover:bg-transparent">
                <TableHead className="w-[40px]">
                  <Checkbox 
                    checked={allSelected}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>
                  <button 
                    className="flex items-center gap-1 hover:text-white transition-colors"
                    onClick={() => handleSort("keyword")}
                  >
                    Keyword <SortIcon field="keyword" />
                  </button>
                </TableHead>
                <TableHead className="text-right">
                  <button 
                    className="flex items-center gap-1 ml-auto hover:text-white transition-colors"
                    onClick={() => handleSort("volume")}
                  >
                    Volume <SortIcon field="volume" />
                  </button>
                </TableHead>
                <TableHead className="text-right">
                  <button 
                    className="flex items-center gap-1 ml-auto hover:text-white transition-colors"
                    onClick={() => handleSort("kd")}
                  >
                    KD <SortIcon field="kd" />
                  </button>
                </TableHead>
                <TableHead className="text-right">
                  <button 
                    className="flex items-center gap-1 ml-auto hover:text-white transition-colors"
                    onClick={() => handleSort("cpc")}
                  >
                    CPC <SortIcon field="cpc" />
                  </button>
                </TableHead>
                <TableHead className="text-center">Intent</TableHead>
                <TableHead className="text-right">
                  <button 
                    className="flex items-center gap-1 ml-auto hover:text-white transition-colors"
                    onClick={() => handleSort("trend")}
                  >
                    Trend <SortIcon field="trend" />
                  </button>
                </TableHead>
                <TableHead className="text-center">
                  <button 
                    className="flex items-center gap-1 justify-center hover:text-white transition-colors"
                    onClick={() => handleSort("wordCount")}
                  >
                    Words <SortIcon field="wordCount" />
                  </button>
                </TableHead>
                <TableHead className="text-center">Source</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedKeywords.map((kw) => (
                <TableRow 
                  key={kw.id} 
                  className={cn(
                    "border-zinc-800 hover:bg-zinc-800/50 cursor-pointer",
                    kw.isSelected && "bg-orange-500/10"
                  )}
                  onClick={() => handleSelectOne(kw.id)}
                >
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Checkbox 
                      checked={kw.isSelected}
                      onCheckedChange={() => handleSelectOne(kw.id)}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{kw.keyword}</TableCell>
                  <TableCell className="text-right font-mono text-emerald-400">
                    {kw.volume.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={cn(
                      "font-mono",
                      kw.kd <= 30 ? "text-emerald-400" : kw.kd <= 60 ? "text-amber-400" : "text-red-400"
                    )}>
                      {kw.kd}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-mono text-zinc-300">
                    ${kw.cpc.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-center">
                    <IntentBadge intent={kw.intent} />
                  </TableCell>
                  <TableCell className="text-right text-sm">
                    <TrendIcon trend={kw.trend} percent={kw.trendPercent} />
                  </TableCell>
                  <TableCell className="text-center text-zinc-400">
                    {kw.wordCount}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className="text-[10px] text-zinc-500">
                      {kw.source}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
      
      {/* Footer with Actions */}
      {keywords.length > 0 && (
        <div className="p-4 border-t border-zinc-800 bg-zinc-900/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {selectedCount > 0 && (
                <>
                  <span className="text-sm">
                    <span className="text-orange-400 font-bold">{selectedCount}</span> keywords selected
                  </span>
                  <span className="text-zinc-600">|</span>
                  <span className="text-sm text-zinc-400">
                    Total Volume: <span className="text-emerald-400 font-mono">{stats.totalVolume.toLocaleString()}</span>
                  </span>
                  <span className="text-zinc-600">|</span>
                  <span className="text-sm text-zinc-400">
                    Avg KD: <span className="text-amber-400 font-mono">{stats.avgKD}</span>
                  </span>
                  <Button variant="ghost" size="sm" onClick={handleDeleteSelected} className="text-red-400">
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete Selected
                  </Button>
                </>
              )}
            </div>
            
            <Button
              size="lg"
              onClick={handleBuildCluster}
              disabled={selectedCount < 5}
              className="gap-2 bg-linear-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
            >
              <Sparkles className="h-5 w-5" />
              Build Cluster ({selectedCount})
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
          
          {selectedCount > 0 && selectedCount < 5 && (
            <p className="text-sm text-amber-400 mt-2">
              Select at least {5 - selectedCount} more keywords to build a cluster
            </p>
          )}
        </div>
      )}
    </div>
  )
}
