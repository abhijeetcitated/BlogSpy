"use client"

import { useState, useMemo, useCallback } from "react"
import Link from "next/link"
import { 
  Search, 
  Swords, 
  Target, 
  AlertCircle, 
  ChevronDown, 
  Check, 
  Loader2,
  ExternalLink,
  CheckCircle2,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  Download,
  Plus
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { KDRing } from "@/components/kd-ring"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

// ============================================
// TYPES
// ============================================
type GapType = "missing" | "weak" | "strong" | "shared"
type Intent = "commercial" | "informational" | "transactional" | "navigational"
type SortField = "volume" | "kd" | "competitorRank" | "yourRank" | null
type SortDirection = "asc" | "desc"

interface GapKeyword {
  id: string
  keyword: string
  competitorRank: number | null
  competitor2Rank: number | null
  yourRank: number | null
  volume: number
  kd: number
  intent: Intent
  gapType: GapType
  competitorUrl: string
  competitor2Url: string | null
  source: "comp1" | "comp2" | "both"
}

// ============================================
// MOCK DATA - Comprehensive Gap Keywords
// ============================================
const MOCK_GAP_DATA: GapKeyword[] = [
  // Missing Keywords (You don't rank, they do)
  {
    id: "1",
    keyword: "best ai writing tools 2024",
    competitorRank: 3,
    competitor2Rank: 8,
    yourRank: null,
    volume: 8100,
    kd: 24,
    intent: "commercial",
    gapType: "missing",
    competitorUrl: "https://techcrunch.com/best-ai-writing-tools-review",
    competitor2Url: "https://theverge.com/ai-writing-guide",
    source: "both",
  },
  {
    id: "2",
    keyword: "chatgpt alternatives free",
    competitorRank: 5,
    competitor2Rank: null,
    yourRank: null,
    volume: 14800,
    kd: 31,
    intent: "informational",
    gapType: "missing",
    competitorUrl: "https://techcrunch.com/chatgpt-alternatives",
    competitor2Url: null,
    source: "comp1",
  },
  {
    id: "3",
    keyword: "ai content generator for blogs",
    competitorRank: 2,
    competitor2Rank: 5,
    yourRank: null,
    volume: 5400,
    kd: 28,
    intent: "commercial",
    gapType: "missing",
    competitorUrl: "https://techcrunch.com/ai-content-generators",
    competitor2Url: "https://theverge.com/blog-ai-tools",
    source: "both",
  },
  {
    id: "4",
    keyword: "how to use jasper ai",
    competitorRank: 8,
    competitor2Rank: 12,
    yourRank: null,
    volume: 3200,
    kd: 18,
    intent: "informational",
    gapType: "missing",
    competitorUrl: "https://techcrunch.com/jasper-ai-tutorial",
    competitor2Url: "https://theverge.com/jasper-guide",
    source: "both",
  },
  {
    id: "5",
    keyword: "free ai article writer",
    competitorRank: 1,
    competitor2Rank: 3,
    yourRank: null,
    volume: 12300,
    kd: 42,
    intent: "transactional",
    gapType: "missing",
    competitorUrl: "https://techcrunch.com/free-ai-writers",
    competitor2Url: "https://theverge.com/free-ai-article-tools",
    source: "both",
  },
  {
    id: "6",
    keyword: "ai blog post generator",
    competitorRank: 7,
    competitor2Rank: null,
    yourRank: null,
    volume: 6700,
    kd: 33,
    intent: "commercial",
    gapType: "missing",
    competitorUrl: "https://techcrunch.com/blog-generators",
    competitor2Url: null,
    source: "comp1",
  },
  {
    id: "7",
    keyword: "copy.ai vs jasper",
    competitorRank: 4,
    competitor2Rank: 6,
    yourRank: null,
    volume: 2900,
    kd: 22,
    intent: "commercial",
    gapType: "missing",
    competitorUrl: "https://techcrunch.com/copy-ai-jasper-comparison",
    competitor2Url: "https://theverge.com/ai-comparison",
    source: "both",
  },

  // Weak Keywords (You rank lower than them)
  {
    id: "8",
    keyword: "ai seo content optimization",
    competitorRank: 6,
    competitor2Rank: 9,
    yourRank: 87,
    volume: 4100,
    kd: 35,
    intent: "commercial",
    gapType: "weak",
    competitorUrl: "https://techcrunch.com/ai-seo-optimization",
    competitor2Url: "https://theverge.com/seo-ai",
    source: "both",
  },
  {
    id: "9",
    keyword: "content writing with ai",
    competitorRank: 4,
    competitor2Rank: null,
    yourRank: 45,
    volume: 7200,
    kd: 29,
    intent: "informational",
    gapType: "weak",
    competitorUrl: "https://techcrunch.com/content-writing-ai",
    competitor2Url: null,
    source: "comp1",
  },
  {
    id: "10",
    keyword: "automated blog writing",
    competitorRank: 3,
    competitor2Rank: 5,
    yourRank: 28,
    volume: 3800,
    kd: 38,
    intent: "commercial",
    gapType: "weak",
    competitorUrl: "https://techcrunch.com/automated-blogging",
    competitor2Url: "https://theverge.com/auto-blog",
    source: "both",
  },
  {
    id: "11",
    keyword: "ai writing assistant tools",
    competitorRank: 2,
    competitor2Rank: 4,
    yourRank: 15,
    volume: 5500,
    kd: 41,
    intent: "commercial",
    gapType: "weak",
    competitorUrl: "https://techcrunch.com/writing-assistants",
    competitor2Url: "https://theverge.com/ai-assistants",
    source: "both",
  },

  // Strong Keywords (You rank higher than them)
  {
    id: "12",
    keyword: "seo keyword research tools",
    competitorRank: 12,
    competitor2Rank: 18,
    yourRank: 3,
    volume: 9800,
    kd: 52,
    intent: "commercial",
    gapType: "strong",
    competitorUrl: "https://techcrunch.com/keyword-tools",
    competitor2Url: "https://theverge.com/seo-research",
    source: "both",
  },
  {
    id: "13",
    keyword: "content gap analysis tool",
    competitorRank: 25,
    competitor2Rank: null,
    yourRank: 5,
    volume: 2100,
    kd: 26,
    intent: "commercial",
    gapType: "strong",
    competitorUrl: "https://techcrunch.com/gap-analysis",
    competitor2Url: null,
    source: "comp1",
  },
  {
    id: "14",
    keyword: "competitor keyword analysis",
    competitorRank: 15,
    competitor2Rank: 22,
    yourRank: 2,
    volume: 4600,
    kd: 33,
    intent: "informational",
    gapType: "strong",
    competitorUrl: "https://techcrunch.com/competitor-keywords",
    competitor2Url: "https://theverge.com/keyword-spy",
    source: "both",
  },

  // Shared Keywords (Both rank similarly)
  {
    id: "15",
    keyword: "ai writing software comparison",
    competitorRank: 6,
    competitor2Rank: 8,
    yourRank: 7,
    volume: 6100,
    kd: 44,
    intent: "commercial",
    gapType: "shared",
    competitorUrl: "https://techcrunch.com/ai-software-compare",
    competitor2Url: "https://theverge.com/writing-software",
    source: "both",
  },
  {
    id: "16",
    keyword: "best content creation tools",
    competitorRank: 4,
    competitor2Rank: 5,
    yourRank: 4,
    volume: 8900,
    kd: 48,
    intent: "commercial",
    gapType: "shared",
    competitorUrl: "https://techcrunch.com/content-tools",
    competitor2Url: "https://theverge.com/creation-tools",
    source: "both",
  },
  {
    id: "17",
    keyword: "ai copywriting examples",
    competitorRank: 9,
    competitor2Rank: 11,
    yourRank: 10,
    volume: 2800,
    kd: 21,
    intent: "informational",
    gapType: "shared",
    competitorUrl: "https://techcrunch.com/copywriting-examples",
    competitor2Url: "https://theverge.com/ai-copy-samples",
    source: "both",
  },

  // More Missing Keywords for volume
  {
    id: "18",
    keyword: "gpt-4 vs claude comparison",
    competitorRank: 2,
    competitor2Rank: 4,
    yourRank: null,
    volume: 18500,
    kd: 36,
    intent: "informational",
    gapType: "missing",
    competitorUrl: "https://techcrunch.com/gpt4-claude",
    competitor2Url: "https://theverge.com/ai-model-compare",
    source: "both",
  },
  {
    id: "19",
    keyword: "ai writing prompts guide",
    competitorRank: 5,
    competitor2Rank: null,
    yourRank: null,
    volume: 4200,
    kd: 19,
    intent: "informational",
    gapType: "missing",
    competitorUrl: "https://techcrunch.com/writing-prompts",
    competitor2Url: null,
    source: "comp1",
  },
  {
    id: "20",
    keyword: "notion ai vs chatgpt",
    competitorRank: null,
    competitor2Rank: 3,
    yourRank: null,
    volume: 7800,
    kd: 27,
    intent: "commercial",
    gapType: "missing",
    competitorUrl: "",
    competitor2Url: "https://theverge.com/notion-chatgpt",
    source: "comp2",
  },
]

// ============================================
// FILTER PRESETS
// ============================================
const volumePresets = [
  { label: "Any", min: 0, max: 500000 },
  { label: "0-1K", min: 0, max: 1000 },
  { label: "1K-5K", min: 1000, max: 5000 },
  { label: "5K-10K", min: 5000, max: 10000 },
  { label: "10K+", min: 10000, max: 500000 },
]

const kdPresets = [
  { label: "Any", min: 0, max: 100 },
  { label: "Easy (0-30)", min: 0, max: 30 },
  { label: "Medium (30-50)", min: 30, max: 50 },
  { label: "Hard (50-70)", min: 50, max: 70 },
  { label: "Very Hard (70+)", min: 70, max: 100 },
]

const quickFilters = [
  { id: "easy", label: "Easy Wins (KD < 30)", filter: (kw: GapKeyword) => kw.kd < 30 },
  { id: "highvol", label: "High Volume (> 1K)", filter: (kw: GapKeyword) => kw.volume > 1000 },
  { id: "commercial", label: "Commercial Intent", filter: (kw: GapKeyword) => kw.intent === "commercial" },
]

// ============================================
// COMPONENT
// ============================================
export function CompetitorGapContent() {
  // Form State
  const [yourDomain, setYourDomain] = useState("")
  const [competitor1, setCompetitor1] = useState("")
  const [competitor2, setCompetitor2] = useState("")
  
  // Analysis State
  const [isLoading, setIsLoading] = useState(false)
  const [hasAnalyzed, setHasAnalyzed] = useState(false)
  
  // Gap Type Filter
  const [selectedGapType, setSelectedGapType] = useState<GapType>("missing")
  
  // Competitor Source Filter (when 2 competitors entered)
  const [showComp1, setShowComp1] = useState(true)
  const [showComp2, setShowComp2] = useState(true)
  
  // Quick Filters
  const [activeQuickFilters, setActiveQuickFilters] = useState<string[]>([])
  
  // Volume Filter (with Apply logic)
  const [volumeOpen, setVolumeOpen] = useState(false)
  const [tempVolumeRange, setTempVolumeRange] = useState<[number, number]>([0, 500000])
  const [volumeRange, setVolumeRange] = useState<[number, number]>([0, 500000])
  const [volumePreset, setVolumePreset] = useState<string>("Any")
  
  // KD Filter (with Apply logic)
  const [kdOpen, setKdOpen] = useState(false)
  const [tempKdRange, setTempKdRange] = useState<[number, number]>([0, 100])
  const [kdRange, setKdRange] = useState<[number, number]>([0, 100])
  const [kdPreset, setKdPreset] = useState<string>("Any")
  
  // Added to Roadmap tracking
  const [addedKeywords, setAddedKeywords] = useState<Set<string>>(new Set())
  
  // Search within results
  const [searchQuery, setSearchQuery] = useState("")

  // Sorting State
  const [sortField, setSortField] = useState<SortField>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")

  // Bulk Selection State
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set())

  // Check if competitor 2 is entered
  const hasCompetitor2 = competitor2.trim().length > 0

  // Apply filters
  const applyVolumeFilter = () => {
    setVolumeRange(tempVolumeRange)
    setVolumeOpen(false)
  }

  const applyKdFilter = () => {
    setKdRange(tempKdRange)
    setKdOpen(false)
  }

  // Toggle quick filter
  const toggleQuickFilter = (filterId: string) => {
    setActiveQuickFilters(prev => 
      prev.includes(filterId) 
        ? prev.filter(f => f !== filterId)
        : [...prev, filterId]
    )
  }

  // Handle Analyze
  const handleAnalyze = async () => {
    if (!yourDomain.trim() || !competitor1.trim()) {
      return
    }
    
    setIsLoading(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    setIsLoading(false)
    setHasAnalyzed(true)
  }

  // Handle "Steal This" / Add to Roadmap
  const handleAddToRoadmap = (keyword: GapKeyword) => {
    console.log(`Added keyword "${keyword.keyword}" to Content Plan`)
    console.log("Keyword details:", {
      volume: keyword.volume,
      kd: keyword.kd,
      intent: keyword.intent,
      gapType: keyword.gapType,
    })
    
    setAddedKeywords(prev => new Set([...prev, keyword.id]))
  }

  // Handle Sorting
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("desc")
    }
  }

  // Sort Icon Component
  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-3 w-3 text-muted-foreground/50" />
    }
    return sortDirection === "asc" 
      ? <ArrowUp className="h-3 w-3 text-amber-400" />
      : <ArrowDown className="h-3 w-3 text-amber-400" />
  }

  // Bulk Selection Handlers
  const handleSelectAll = useCallback((checked: boolean) => {
    if (checked) {
      const allIds = filteredAndSortedKeywords.map(kw => kw.id)
      setSelectedRows(new Set(allIds))
    } else {
      setSelectedRows(new Set())
    }
  }, [])

  const handleSelectRow = (id: string, checked: boolean) => {
    setSelectedRows(prev => {
      const newSet = new Set(prev)
      if (checked) {
        newSet.add(id)
      } else {
        newSet.delete(id)
      }
      return newSet
    })
  }

  // Bulk Add to Roadmap
  const handleBulkAddToRoadmap = () => {
    selectedRows.forEach(id => {
      const kw = MOCK_GAP_DATA.find(k => k.id === id)
      if (kw) {
        console.log(`Added keyword "${kw.keyword}" to Content Plan`)
      }
    })
    setAddedKeywords(prev => new Set([...prev, ...selectedRows]))
    setSelectedRows(new Set())
  }

  // Export to CSV
  const exportToCSV = useCallback(() => {
    const headers = ["Keyword", "Competitor Rank", "Your Rank", "Volume", "KD", "Intent", "Gap Type", "Competitor URL"]
    const csvRows = [headers.join(",")]
    
    filteredAndSortedKeywords.forEach(kw => {
      const row = [
        `"${kw.keyword}"`,
        kw.competitorRank ?? "N/A",
        kw.yourRank ?? "Not Ranking",
        kw.volume,
        kw.kd,
        kw.intent,
        kw.gapType,
        `"${kw.competitorUrl}"`
      ]
      csvRows.push(row.join(","))
    })
    
    const csvContent = csvRows.join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `competitor-gap-${selectedGapType}-keywords.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }, [selectedGapType])

  // Filtered Keywords
  const filteredKeywords = useMemo(() => {
    return MOCK_GAP_DATA.filter(kw => {
      // 1. Filter by Gap Type
      if (kw.gapType !== selectedGapType) return false
      
      // 2. Filter by Competitor Source (if 2 competitors)
      if (hasCompetitor2) {
        if (!showComp1 && !showComp2) return false
        if (!showComp1 && kw.source === "comp1") return false
        if (!showComp2 && kw.source === "comp2") return false
      }
      
      // 3. Filter by Volume Range
      if (kw.volume < volumeRange[0] || kw.volume > volumeRange[1]) return false
      
      // 4. Filter by KD Range
      if (kw.kd < kdRange[0] || kw.kd > kdRange[1]) return false
      
      // 5. Apply Quick Filters (if any active)
      if (activeQuickFilters.length > 0) {
        const passesQuickFilters = activeQuickFilters.every(filterId => {
          const quickFilter = quickFilters.find(f => f.id === filterId)
          return quickFilter ? quickFilter.filter(kw) : true
        })
        if (!passesQuickFilters) return false
      }
      
      // 6. Search query
      if (searchQuery.trim()) {
        if (!kw.keyword.toLowerCase().includes(searchQuery.toLowerCase())) return false
      }
      
      return true
    })
  }, [selectedGapType, showComp1, showComp2, hasCompetitor2, volumeRange, kdRange, activeQuickFilters, searchQuery])

  // Filtered and Sorted Keywords
  const filteredAndSortedKeywords = useMemo(() => {
    if (!sortField) return filteredKeywords

    return [...filteredKeywords].sort((a, b) => {
      let comparison = 0
      
      switch (sortField) {
        case "volume":
          comparison = a.volume - b.volume
          break
        case "kd":
          comparison = a.kd - b.kd
          break
        case "competitorRank":
          // Handle nulls - push to end
          const aRank = a.competitorRank ?? 999
          const bRank = b.competitorRank ?? 999
          comparison = aRank - bRank
          break
        case "yourRank":
          // Handle nulls - push to end
          const aYourRank = a.yourRank ?? 999
          const bYourRank = b.yourRank ?? 999
          comparison = aYourRank - bYourRank
          break
      }

      return sortDirection === "asc" ? comparison : -comparison
    })
  }, [filteredKeywords, sortField, sortDirection])

  // Update handleSelectAll dependency
  const isAllSelected = filteredAndSortedKeywords.length > 0 && 
    filteredAndSortedKeywords.every(kw => selectedRows.has(kw.id))
  const isSomeSelected = filteredAndSortedKeywords.some(kw => selectedRows.has(kw.id))

  // Stats for current gap type
  const gapStats = useMemo(() => {
    const missing = MOCK_GAP_DATA.filter(k => k.gapType === "missing").length
    const weak = MOCK_GAP_DATA.filter(k => k.gapType === "weak").length
    const strong = MOCK_GAP_DATA.filter(k => k.gapType === "strong").length
    const shared = MOCK_GAP_DATA.filter(k => k.gapType === "shared").length
    return { missing, weak, strong, shared }
  }, [])

  // Intent badge styles
  const getIntentStyle = (intent: Intent) => {
    switch (intent) {
      case "commercial":
        return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
      case "transactional":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      case "informational":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30"
      case "navigational":
        return "bg-amber-500/20 text-amber-400 border-amber-500/30"
      default:
        return "bg-slate-500/20 text-slate-400 border-slate-500/30"
    }
  }

  return (
    <TooltipProvider>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10">
              <Swords className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground">Competitor Content Gap</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Discover keywords your competitors rank for that you're missing
              </p>
            </div>
          </div>
        </div>

        {/* Input Section */}
        <div className="px-6 py-5 border-b border-border bg-card/30">
          <div className="flex items-end gap-4">
            <div className="flex-1 space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Your Domain</label>
              <div className="relative">
                <Target className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-400" />
                <Input
                  placeholder="myblog.com"
                  value={yourDomain}
                  onChange={(e) => setYourDomain(e.target.value)}
                  className="pl-9 h-10 bg-secondary/50 border-border"
                />
              </div>
            </div>
            <div className="flex-1 space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Competitor 1</label>
              <div className="relative">
                <AlertCircle className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-red-400" />
                <Input
                  placeholder="techcrunch.com"
                  value={competitor1}
                  onChange={(e) => setCompetitor1(e.target.value)}
                  className="pl-9 h-10 bg-secondary/50 border-border"
                />
              </div>
            </div>
            <div className="flex-1 space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Competitor 2 <span className="text-muted-foreground/50">(Optional)</span>
              </label>
              <div className="relative">
                <AlertCircle className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-orange-400" />
                <Input
                  placeholder="theverge.com"
                  value={competitor2}
                  onChange={(e) => setCompetitor2(e.target.value)}
                  className="pl-9 h-10 bg-secondary/50 border-border"
                />
              </div>
            </div>
            <Button
              onClick={handleAnalyze}
              disabled={isLoading || !yourDomain.trim() || !competitor1.trim()}
              className="h-10 px-6 bg-amber-500 hover:bg-amber-600 text-amber-950 font-semibold shadow-lg shadow-amber-500/20 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Swords className="h-4 w-4 mr-2" />
                  Find Missing Keywords
                </>
              )}
            </Button>
          </div>
        </div>

        {hasAnalyzed && (
          <>
            {/* Gap Matrix - Visual Summary */}
            <div className="px-6 py-5 border-b border-border">
              <div className="flex items-center gap-6">
                {/* Venn Diagram Visualization */}
                <div className="relative w-48 h-32 flex-shrink-0">
                  {/* Your circle */}
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-24 h-24 rounded-full bg-emerald-500/20 border-2 border-emerald-500/40 flex items-center justify-center">
                    <span className="text-[10px] font-medium text-emerald-400 text-center leading-tight">
                      You
                      <br />
                      {gapStats.strong}
                    </span>
                  </div>
                  {/* Competitor circle */}
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-24 h-24 rounded-full bg-red-500/20 border-2 border-red-500/40 flex items-center justify-center">
                    <span className="text-[10px] font-medium text-red-400 text-center leading-tight">
                      Them
                      <br />
                      {gapStats.missing}
                    </span>
                  </div>
                  {/* Overlap */}
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-purple-500/30 border-2 border-purple-500/50 flex items-center justify-center z-10">
                    <span className="text-[10px] font-medium text-purple-300 text-center leading-tight">
                      Both
                      <br />
                      {gapStats.shared}
                    </span>
                  </div>
                </div>

                {/* Stats Cards */}
                <div className="flex-1 grid grid-cols-4 gap-3">
                  <button
                    onClick={() => setSelectedGapType("missing")}
                    className={cn(
                      "p-3 rounded-lg border transition-all text-left",
                      selectedGapType === "missing"
                        ? "bg-amber-500/20 border-amber-500/50"
                        : "bg-secondary/30 border-border hover:border-amber-500/30"
                    )}
                  >
                    <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide">
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        selectedGapType === "missing" ? "bg-amber-400 animate-pulse" : "bg-amber-400/50"
                      )} />
                      <span className={selectedGapType === "missing" ? "text-amber-400" : "text-muted-foreground"}>
                        Missing
                      </span>
                    </div>
                    <div className={cn(
                      "mt-1 text-xl font-bold font-mono",
                      selectedGapType === "missing" ? "text-amber-400" : "text-foreground"
                    )}>
                      {gapStats.missing}
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">You don't rank</div>
                  </button>

                  <button
                    onClick={() => setSelectedGapType("weak")}
                    className={cn(
                      "p-3 rounded-lg border transition-all text-left",
                      selectedGapType === "weak"
                        ? "bg-orange-500/20 border-orange-500/50"
                        : "bg-secondary/30 border-border hover:border-orange-500/30"
                    )}
                  >
                    <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide">
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        selectedGapType === "weak" ? "bg-orange-400 animate-pulse" : "bg-orange-400/50"
                      )} />
                      <span className={selectedGapType === "weak" ? "text-orange-400" : "text-muted-foreground"}>
                        Weak
                      </span>
                    </div>
                    <div className={cn(
                      "mt-1 text-xl font-bold font-mono",
                      selectedGapType === "weak" ? "text-orange-400" : "text-foreground"
                    )}>
                      {gapStats.weak}
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">You rank lower</div>
                  </button>

                  <button
                    onClick={() => setSelectedGapType("strong")}
                    className={cn(
                      "p-3 rounded-lg border transition-all text-left",
                      selectedGapType === "strong"
                        ? "bg-emerald-500/20 border-emerald-500/50"
                        : "bg-secondary/30 border-border hover:border-emerald-500/30"
                    )}
                  >
                    <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide">
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        selectedGapType === "strong" ? "bg-emerald-400 animate-pulse" : "bg-emerald-400/50"
                      )} />
                      <span className={selectedGapType === "strong" ? "text-emerald-400" : "text-muted-foreground"}>
                        Strong
                      </span>
                    </div>
                    <div className={cn(
                      "mt-1 text-xl font-bold font-mono",
                      selectedGapType === "strong" ? "text-emerald-400" : "text-foreground"
                    )}>
                      {gapStats.strong}
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">You rank higher</div>
                  </button>

                  <button
                    onClick={() => setSelectedGapType("shared")}
                    className={cn(
                      "p-3 rounded-lg border transition-all text-left",
                      selectedGapType === "shared"
                        ? "bg-purple-500/20 border-purple-500/50"
                        : "bg-secondary/30 border-border hover:border-purple-500/30"
                    )}
                  >
                    <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide">
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        selectedGapType === "shared" ? "bg-purple-400 animate-pulse" : "bg-purple-400/50"
                      )} />
                      <span className={selectedGapType === "shared" ? "text-purple-400" : "text-muted-foreground"}>
                        Shared
                      </span>
                    </div>
                    <div className={cn(
                      "mt-1 text-xl font-bold font-mono",
                      selectedGapType === "shared" ? "text-purple-400" : "text-foreground"
                    )}>
                      {gapStats.shared}
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">Similar rankings</div>
                  </button>
                </div>
              </div>
            </div>

            {/* Advanced Filters Bar */}
            <div className="px-6 py-3 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
              <div className="flex items-center gap-3 flex-wrap">
                {/* Competitor Source Toggle (if 2 competitors) */}
                {hasCompetitor2 && (
                  <div className="flex items-center gap-3 pr-3 border-r border-border">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Source:</span>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <Checkbox 
                        checked={showComp1} 
                        onCheckedChange={(checked) => setShowComp1(!!checked)}
                        className="h-4 w-4"
                      />
                      <span className="text-xs text-foreground">{competitor1 || "Comp 1"}</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <Checkbox 
                        checked={showComp2} 
                        onCheckedChange={(checked) => setShowComp2(!!checked)}
                        className="h-4 w-4"
                      />
                      <span className="text-xs text-foreground">{competitor2 || "Comp 2"}</span>
                    </label>
                  </div>
                )}

                {/* Quick Filters */}
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Quick:</span>
                <div className="flex items-center gap-2">
                  {quickFilters.map((filter) => (
                    <button
                      key={filter.id}
                      onClick={() => toggleQuickFilter(filter.id)}
                      className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                        activeQuickFilters.includes(filter.id)
                          ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                          : "bg-secondary/50 text-muted-foreground border border-transparent hover:bg-secondary"
                      )}
                    >
                      {activeQuickFilters.includes(filter.id) && <Check className="h-3 w-3" />}
                      {filter.label}
                    </button>
                  ))}
                </div>

                {/* Volume Filter Popover */}
                <Popover open={volumeOpen} onOpenChange={setVolumeOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 gap-1.5 bg-secondary/50 border-border">
                      Volume
                      {volumePreset !== "Any" && (
                        <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                          {volumePreset}
                        </Badge>
                      )}
                      <ChevronDown className="h-3.5 w-3.5" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[280px] p-3" align="start">
                    <div className="space-y-3">
                      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Volume Range
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {volumePresets.map((preset) => (
                          <button
                            key={preset.label}
                            onClick={() => {
                              setTempVolumeRange([preset.min, preset.max])
                              setVolumePreset(preset.label)
                            }}
                            className={cn(
                              "px-2.5 py-1 rounded text-xs font-medium transition-colors",
                              volumePreset === preset.label
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted/50 text-muted-foreground hover:bg-muted"
                            )}
                          >
                            {preset.label}
                          </button>
                        ))}
                      </div>
                      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider pt-2">
                        Custom Range
                      </div>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          placeholder="From"
                          value={tempVolumeRange[0] || ""}
                          onChange={(e) => {
                            const val = e.target.value === "" ? 0 : Number(e.target.value)
                            setTempVolumeRange([val, tempVolumeRange[1]])
                            setVolumePreset("Custom")
                          }}
                          className="h-8 text-sm"
                        />
                        <span className="text-muted-foreground">—</span>
                        <Input
                          type="number"
                          placeholder="To"
                          value={tempVolumeRange[1] || ""}
                          onChange={(e) => {
                            const val = e.target.value === "" ? 500000 : Number(e.target.value)
                            setTempVolumeRange([tempVolumeRange[0], val])
                            setVolumePreset("Custom")
                          }}
                          className="h-8 text-sm"
                        />
                      </div>
                      <Button onClick={applyVolumeFilter} className="w-full mt-2 bg-primary hover:bg-primary/90">
                        Apply Filter
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>

                {/* KD Filter Popover */}
                <Popover open={kdOpen} onOpenChange={setKdOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 gap-1.5 bg-secondary/50 border-border">
                      KD %
                      {kdPreset !== "Any" && (
                        <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                          {kdPreset.split(" ")[0]}
                        </Badge>
                      )}
                      <ChevronDown className="h-3.5 w-3.5" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[280px] p-3" align="start">
                    <div className="space-y-3">
                      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Keyword Difficulty
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {kdPresets.map((preset) => (
                          <button
                            key={preset.label}
                            onClick={() => {
                              setTempKdRange([preset.min, preset.max])
                              setKdPreset(preset.label)
                            }}
                            className={cn(
                              "px-2.5 py-1 rounded text-xs font-medium transition-colors",
                              kdPreset === preset.label
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted/50 text-muted-foreground hover:bg-muted"
                            )}
                          >
                            {preset.label}
                          </button>
                        ))}
                      </div>
                      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider pt-2">
                        Custom Range
                      </div>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          placeholder="Min"
                          value={tempKdRange[0] || ""}
                          onChange={(e) => {
                            const val = e.target.value === "" ? 0 : Number(e.target.value)
                            setTempKdRange([val, tempKdRange[1]])
                            setKdPreset("Custom")
                          }}
                          className="h-8 text-sm"
                        />
                        <span className="text-muted-foreground">—</span>
                        <Input
                          type="number"
                          placeholder="Max"
                          value={tempKdRange[1] || ""}
                          onChange={(e) => {
                            const val = e.target.value === "" ? 100 : Number(e.target.value)
                            setTempKdRange([tempKdRange[0], val])
                            setKdPreset("Custom")
                          }}
                          className="h-8 text-sm"
                        />
                      </div>
                      <Button onClick={applyKdFilter} className="w-full mt-2 bg-primary hover:bg-primary/90">
                        Apply Filter
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>

                {/* Search & Export */}
                <div className="ml-auto flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search keywords..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 h-8 w-64 bg-secondary/50 border-border text-sm"
                    />
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {filteredAndSortedKeywords.length} results
                  </Badge>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={exportToCSV}
                        className="h-8 gap-1.5 bg-secondary/50 border-border"
                      >
                        <Download className="h-3.5 w-3.5" />
                        Export CSV
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Download filtered keywords as CSV</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </div>

            {/* Bulk Action Bar - Shows when items selected */}
            {selectedRows.size > 0 && (
              <div className="px-6 py-2 bg-amber-500/10 border-b border-amber-500/30 flex items-center gap-3">
                <span className="text-sm font-medium text-amber-400">
                  {selectedRows.size} keyword{selectedRows.size > 1 ? "s" : ""} selected
                </span>
                <Button
                  size="sm"
                  onClick={handleBulkAddToRoadmap}
                  className="h-7 px-3 bg-amber-500 hover:bg-amber-600 text-amber-950 font-semibold text-xs"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add {selectedRows.size} Keywords to Roadmap
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setSelectedRows(new Set())}
                  className="h-7 px-3 text-muted-foreground hover:text-foreground text-xs"
                >
                  Clear Selection
                </Button>
              </div>
            )}

            {/* Keywords Table */}
            <div className="flex-1 overflow-auto">
              <table className="w-full text-sm">
                <thead className="bg-secondary/30 sticky top-0">
                  <tr className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    <th className="px-4 py-3 w-10">
                      <Checkbox 
                        checked={isAllSelected}
                        onCheckedChange={handleSelectAll}
                        className="h-4 w-4"
                        aria-label="Select all"
                      />
                    </th>
                    <th className="px-4 py-3">Keyword</th>
                    <th className="px-4 py-3 text-center">
                      <button 
                        onClick={() => handleSort("competitorRank")}
                        className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
                      >
                        Competitor Rank
                        <SortIcon field="competitorRank" />
                      </button>
                    </th>
                    <th className="px-4 py-3 text-center">
                      <button 
                        onClick={() => handleSort("yourRank")}
                        className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
                      >
                        Your Rank
                        <SortIcon field="yourRank" />
                      </button>
                    </th>
                    <th className="px-4 py-3 text-right">
                      <button 
                        onClick={() => handleSort("volume")}
                        className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
                      >
                        Volume
                        <SortIcon field="volume" />
                      </button>
                    </th>
                    <th className="px-4 py-3 text-center">
                      <button 
                        onClick={() => handleSort("kd")}
                        className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
                      >
                        KD
                        <SortIcon field="kd" />
                      </button>
                    </th>
                    <th className="px-4 py-3 text-center">Intent</th>
                    <th className="px-6 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredAndSortedKeywords.map((kw) => (
                    <tr 
                      key={kw.id} 
                      className={cn(
                        "hover:bg-secondary/20 transition-colors group",
                        selectedRows.has(kw.id) && "bg-amber-500/5"
                      )}
                    >
                      <td className="px-4 py-3">
                        <Checkbox 
                          checked={selectedRows.has(kw.id)}
                          onCheckedChange={(checked) => handleSelectRow(kw.id, !!checked)}
                          className="h-4 w-4"
                          aria-label={`Select ${kw.keyword}`}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/dashboard/research/overview/${encodeURIComponent(kw.keyword)}`}
                          className="font-medium text-foreground hover:text-amber-400 transition-colors inline-flex items-center gap-1.5 group/link"
                        >
                          {kw.keyword}
                          <ExternalLink className="h-3 w-3 opacity-0 group-hover/link:opacity-100 transition-opacity" />
                        </Link>
                        {hasCompetitor2 && (
                          <Badge 
                            variant="outline" 
                            className={cn(
                              "ml-2 text-[9px] px-1.5",
                              kw.source === "both" 
                                ? "bg-purple-500/10 text-purple-400 border-purple-500/30"
                                : kw.source === "comp1"
                                  ? "bg-red-500/10 text-red-400 border-red-500/30"
                                  : "bg-orange-500/10 text-orange-400 border-orange-500/30"
                            )}
                          >
                            {kw.source === "both" ? "Both" : kw.source === "comp1" ? "C1" : "C2"}
                          </Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {kw.competitorRank && kw.competitorUrl ? (
                          <a
                            href={kw.competitorUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            title={kw.competitorUrl}
                            className="inline-flex items-center justify-center gap-1 w-auto min-w-[2rem] h-6 px-2 rounded bg-red-500/20 text-red-400 text-xs font-bold hover:bg-red-500/30 hover:text-red-300 transition-all group/rank"
                          >
                            #{kw.competitorRank}
                            <ExternalLink className="h-2.5 w-2.5 opacity-0 group-hover/rank:opacity-100 transition-opacity" />
                          </a>
                        ) : kw.competitorRank ? (
                          <span className="inline-flex items-center justify-center w-8 h-6 rounded bg-red-500/20 text-red-400 text-xs font-bold">
                            #{kw.competitorRank}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                        {hasCompetitor2 && kw.competitor2Rank && kw.competitor2Url && (
                          <a
                            href={kw.competitor2Url}
                            target="_blank"
                            rel="noopener noreferrer"
                            title={kw.competitor2Url}
                            className="inline-flex items-center justify-center gap-1 w-auto min-w-[2rem] h-6 px-2 rounded bg-orange-500/20 text-orange-400 text-xs font-bold hover:bg-orange-500/30 hover:text-orange-300 transition-all ml-1 group/rank2"
                          >
                            #{kw.competitor2Rank}
                            <ExternalLink className="h-2.5 w-2.5 opacity-0 group-hover/rank2:opacity-100 transition-opacity" />
                          </a>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {kw.yourRank === null ? (
                          <Badge variant="outline" className="bg-slate-800 text-slate-400 border-slate-700 text-[10px]">
                            Not Ranking
                          </Badge>
                        ) : kw.gapType === "strong" ? (
                          <span className="inline-flex items-center justify-center w-8 h-6 rounded bg-emerald-500/20 text-emerald-400 text-xs font-bold">
                            #{kw.yourRank}
                          </span>
                        ) : (
                          <Badge
                            variant="outline"
                            className="bg-orange-500/20 text-orange-400 border-orange-500/30 text-[10px]"
                          >
                            #{kw.yourRank}
                          </Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="font-mono text-foreground">{kw.volume.toLocaleString()}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-center">
                          <KDRing value={kw.kd} />
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge
                          variant="outline"
                          className={cn("text-[10px] capitalize", getIntentStyle(kw.intent))}
                        >
                          {kw.intent}
                        </Badge>
                      </td>
                      <td className="px-6 py-3 text-right">
                        {addedKeywords.has(kw.id) ? (
                          <Button
                            size="sm"
                            disabled
                            className="h-7 px-3 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold text-xs cursor-default"
                          >
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Added to Roadmap
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => handleAddToRoadmap(kw)}
                            className="h-7 px-3 bg-amber-500 hover:bg-amber-600 text-amber-950 font-semibold text-xs"
                          >
                            <Swords className="h-3 w-3 mr-1" />
                            Steal This
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredAndSortedKeywords.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                    <Search className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="text-sm font-medium text-foreground">No keywords found</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Try adjusting your filters or search query
                  </p>
                </div>
              )}
            </div>
          </>
        )}

        {/* Empty State */}
        {!hasAnalyzed && !isLoading && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center max-w-md">
              <div className="mx-auto w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center mb-4">
                <Swords className="h-8 w-8 text-amber-400" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Ready for Battle?</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Enter your domain and at least one competitor above to discover keyword opportunities they're ranking for
                that you're missing.
              </p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="h-12 w-12 text-amber-500 animate-spin mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground">Analyzing Competitor Data...</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Scanning keywords and comparing rankings
              </p>
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  )
}