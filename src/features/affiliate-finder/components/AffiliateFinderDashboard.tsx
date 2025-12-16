"use client"

import { useState, useMemo, useCallback } from "react"
import { useRouter } from "next/navigation"
import { 
  Search,
  DollarSign, 
  TrendingUp,
  Target,
  Filter,
  ChevronDown,
  Sparkles,
  ShoppingCart,
  Download,
  Loader2,
  Globe,
  ChevronLeft,
  ChevronRight,
  CalendarPlus,
  Pencil,
  Copy,
  ExternalLink,
  Check,
  TrendingDown,
  Minus,
  BarChart3,
  Mail,
  Shield,
  Wallet,
  GraduationCap,
  Monitor,
  Dumbbell,
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  generateAffiliateKeywords, 
  calculateAffiliateStats,
  formatCurrency,
  formatNumber,
  getAffiliateTier,
} from "../utils"
import { AFFILIATE_NICHES, BUYER_INTENT_CONFIG, INTENT_MODIFIERS } from "../constants"
import { KeywordSearchFilters, BuyerIntent, AffiliateKeyword } from "../types"
import { IntentDistribution } from "./IntentDistribution"
import { TopProgramsCard } from "./TopProgramsCard"

// ============================================
// Niche Icons Configuration (Premium SVG)
// ============================================

const NICHE_ICONS: Record<string, { icon: React.ElementType; color: string }> = {
  hosting: { icon: Globe, color: "text-blue-400" },
  "seo-tools": { icon: BarChart3, color: "text-emerald-400" },
  "email-marketing": { icon: Mail, color: "text-pink-400" },
  vpn: { icon: Shield, color: "text-cyan-400" },
  finance: { icon: Wallet, color: "text-amber-400" },
  "online-courses": { icon: GraduationCap, color: "text-violet-400" },
  software: { icon: Monitor, color: "text-indigo-400" },
  fitness: { icon: Dumbbell, color: "text-orange-400" },
}

// Program Icons (Premium SVG instead of emojis)
const PROGRAM_ICONS: Record<string, { icon: React.ElementType; color: string }> = {
  amazon: { icon: ShoppingCart, color: "text-orange-400" },
  shareasale: { icon: ExternalLink, color: "text-blue-400" },
  cj: { icon: Globe, color: "text-emerald-400" },
  impact: { icon: Target, color: "text-purple-400" },
  bluehost: { icon: Globe, color: "text-blue-500" },
  semrush: { icon: BarChart3, color: "text-orange-500" },
  convertkit: { icon: Mail, color: "text-pink-400" },
  canva: { icon: Sparkles, color: "text-cyan-400" },
}

// ============================================
// Constants
// ============================================

const ITEMS_PER_PAGE = 10

const CONTENT_TYPE_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  review: { label: "Review", icon: Sparkles, color: "text-amber-400" },
  comparison: { label: "Compare", icon: BarChart3, color: "text-cyan-400" },
  roundup: { label: "Roundup", icon: Target, color: "text-emerald-400" },
  "deals-page": { label: "Deals", icon: DollarSign, color: "text-pink-400" },
  tutorial: { label: "Tutorial", icon: GraduationCap, color: "text-violet-400" },
  "buying-guide": { label: "Guide", icon: ShoppingCart, color: "text-blue-400" },
}

// ============================================
// Main Component
// ============================================

export function AffiliateFinderDashboard() {
  const router = useRouter()
  
  // Input state
  const [seedKeyword, setSeedKeyword] = useState("")
  const [selectedNiche, setSelectedNiche] = useState<string>("all")
  
  // Analysis state
  const [isLoading, setIsLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  
  // Filter state
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState<KeywordSearchFilters>({
    query: "",
    minVolume: 0,
    maxDifficulty: 100,
    minAffiliateScore: 0,
    intentTypes: [],
    modifiers: [],
    niche: null,
    sortBy: "affiliateScore",
    sortOrder: "desc",
  })

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  
  // Selection & Actions
  const [addedToCalendar, setAddedToCalendar] = useState<Set<string>>(new Set())
  const [copiedKeywords, setCopiedKeywords] = useState<Set<string>>(new Set())

  // Generate sample data
  const allKeywords = useMemo(() => generateAffiliateKeywords(), [])
  
  // Filter and sort keywords
  const filteredKeywords = useMemo(() => {
    let result = [...allKeywords]

    // Search filter
    if (searchQuery) {
      result = result.filter(k => 
        k.keyword.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Intent filter
    if (filters.intentTypes.length > 0) {
      result = result.filter(k => filters.intentTypes.includes(k.buyerIntent))
    }

    // Affiliate score filter
    if (filters.minAffiliateScore > 0) {
      result = result.filter(k => k.affiliateScore >= filters.minAffiliateScore)
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0
      switch (filters.sortBy) {
        case "affiliateScore":
          comparison = a.affiliateScore - b.affiliateScore
          break
        case "volume":
          comparison = a.searchVolume - b.searchVolume
          break
        case "difficulty":
          comparison = a.keywordDifficulty - b.keywordDifficulty
          break
        case "commission":
          comparison = a.estimatedCommission - b.estimatedCommission
          break
        case "cpc":
          comparison = a.cpc - b.cpc
          break
      }
      return filters.sortOrder === "desc" ? -comparison : comparison
    })

    return result
  }, [allKeywords, searchQuery, filters])

  // Pagination
  const totalPages = Math.ceil(filteredKeywords.length / ITEMS_PER_PAGE)
  const paginatedKeywords = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredKeywords.slice(start, start + ITEMS_PER_PAGE)
  }, [filteredKeywords, currentPage])

  const stats = useMemo(() => calculateAffiliateStats(filteredKeywords), [filteredKeywords])

  // ============================================
  // Handlers
  // ============================================

  const handleSearch = useCallback(() => {
    if (!seedKeyword.trim() && selectedNiche === "all") {
      toast.error("Enter a keyword or select a niche", {
        description: "Please provide a seed keyword or choose a niche to find affiliate opportunities.",
      })
      return
    }

    setIsLoading(true)
    setHasSearched(false)
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      setHasSearched(true)
      setCurrentPage(1)
      toast.success("Keywords Found!", {
        description: `Discovered ${allKeywords.length} affiliate keyword opportunities.`,
      })
    }, 1500)
  }, [seedKeyword, selectedNiche, allKeywords.length])

  const handleExport = useCallback(() => {
    if (filteredKeywords.length === 0) {
      toast.error("No keywords to export")
      return
    }

    const csv = [
      ["Keyword", "Affiliate Score", "Volume", "KD", "CPC", "Intent", "Commission", "Monthly Est."].join(","),
      ...filteredKeywords.map(kw => [
        `"${kw.keyword}"`,
        kw.affiliateScore,
        kw.searchVolume,
        kw.keywordDifficulty,
        kw.cpc.toFixed(2),
        kw.buyerIntent,
        kw.estimatedCommission,
        kw.estimatedEarnings.monthly
      ].join(","))
    ].join("\n")
    
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `affiliate-keywords-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
    
    toast.success("Export Complete", {
      description: `${filteredKeywords.length} keywords exported to CSV.`,
    })
  }, [filteredKeywords])

  const handleWriteArticle = useCallback((keyword: AffiliateKeyword) => {
    toast.success("Opening AI Writer", {
      description: `Creating ${CONTENT_TYPE_CONFIG[keyword.contentType]?.label || "article"} for "${keyword.keyword}"`,
    })
    router.push(`/dashboard/creation/ai-writer?topic=${encodeURIComponent(keyword.keyword)}&type=${keyword.contentType}`)
  }, [router])

  const handleAddToCalendar = useCallback((keyword: AffiliateKeyword) => {
    setAddedToCalendar(prev => new Set([...prev, keyword.id]))
    toast.success("Added to Content Calendar", {
      description: `"${keyword.keyword}" scheduled for content creation.`,
      action: {
        label: "View Calendar",
        onClick: () => router.push("/dashboard/research/content-calendar"),
      },
    })
  }, [router])

  const handleCopyKeyword = useCallback((keyword: AffiliateKeyword) => {
    navigator.clipboard.writeText(keyword.keyword)
    setCopiedKeywords(prev => new Set([...prev, keyword.id]))
    toast.success("✓ Copied to Clipboard", {
      description: `"${keyword.keyword}"`,
      duration: 2000,
    })
    
    setTimeout(() => {
      setCopiedKeywords(prev => {
        const next = new Set(prev)
        next.delete(keyword.id)
        return next
      })
    }, 3000)
  }, [])

  const handleViewSerp = useCallback((keyword: AffiliateKeyword) => {
    window.open(`https://google.com/search?q=${encodeURIComponent(keyword.keyword)}`, "_blank")
  }, [])

  const toggleIntent = (intent: BuyerIntent) => {
    setFilters(f => ({
      ...f,
      intentTypes: f.intentTypes.includes(intent)
        ? f.intentTypes.filter(i => i !== intent)
        : [...f.intentTypes, intent]
    }))
    setCurrentPage(1)
  }

  // ============================================
  // Render
  // ============================================

  return (
    <div className="space-y-6">
      {/* ==================== HEADER ==================== */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20">
              <ShoppingCart className="h-5 w-5 text-purple-500" />
            </div>
            Affiliate Keyword Finder
          </h1>
          <p className="text-muted-foreground mt-1">
            Discover high-commission keywords with buyer intent
          </p>
        </div>
        
        {hasSearched && (
          <Button 
            onClick={handleExport}
            variant="outline" 
            className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        )}
      </div>

      {/* ==================== INPUT FORM ==================== */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Seed Keyword Input */}
          <div className="flex-1 space-y-2">
            <label className="text-sm font-medium text-foreground">Seed Keyword or Topic</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="e.g., email marketing, vpn, web hosting..."
                value={seedKeyword}
                onChange={(e) => setSeedKeyword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="pl-10 h-11"
              />
            </div>
          </div>

          {/* Niche Selector - Fixed for dark/light mode */}
          <div className="w-full lg:w-64 space-y-2">
            <label className="text-sm font-medium text-foreground">Niche Category</label>
            <Select value={selectedNiche} onValueChange={setSelectedNiche}>
              <SelectTrigger className="h-11 bg-background border-border text-foreground">
                <SelectValue placeholder="Select niche" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="all" className="text-foreground focus:bg-accent focus:text-accent-foreground">
                  <span className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-muted-foreground" />
                    All Niches
                  </span>
                </SelectItem>
                {AFFILIATE_NICHES.map(niche => {
                  const nicheIcon = NICHE_ICONS[niche.id]
                  const IconComponent = nicheIcon?.icon || Globe
                  return (
                    <SelectItem 
                      key={niche.id} 
                      value={niche.id}
                      className="text-foreground focus:bg-accent focus:text-accent-foreground"
                    >
                      <span className="flex items-center gap-2">
                        <IconComponent className={cn("h-4 w-4", nicheIcon?.color || "text-muted-foreground")} />
                        {niche.name}
                      </span>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Search Button */}
          <div className="flex items-end">
            <Button 
              onClick={handleSearch}
              disabled={isLoading}
              className="h-11 px-6 bg-linear-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold shadow-lg shadow-purple-500/25"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Find Keywords
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Niche Toggle Buttons - Trend Spotter Style */}
        <div className="mt-5 flex items-center gap-3 flex-wrap">
          <span className="text-xs font-medium text-muted-foreground">Popular:</span>
          <div className="flex items-center rounded-lg border border-border bg-muted/30 p-1">
            {AFFILIATE_NICHES.slice(0, 5).map(niche => {
              const nicheIcon = NICHE_ICONS[niche.id]
              const IconComponent = nicheIcon?.icon || Globe
              const isActive = selectedNiche === niche.id
              return (
                <button
                  key={niche.id}
                  onClick={() => {
                    setSelectedNiche(niche.id)
                    setSeedKeyword(niche.name.toLowerCase())
                  }}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all border",
                    isActive
                      ? "bg-purple-500/20 text-purple-400 border-purple-500/50"
                      : "text-muted-foreground hover:text-foreground border-transparent hover:bg-muted/50"
                  )}
                >
                  <IconComponent
                    className={cn(
                      "h-3.5 w-3.5",
                      isActive ? "text-purple-400" : nicheIcon?.color
                    )}
                  />
                  <span className="hidden sm:inline">{niche.name}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* ==================== LOADING STATE ==================== */}
      {isLoading && (
        <div className="rounded-xl border border-border bg-card p-12 flex flex-col items-center justify-center">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-4 border-purple-500/20 border-t-purple-500 animate-spin" />
            <ShoppingCart className="w-6 h-6 text-purple-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-foreground font-medium mt-4">Finding Affiliate Opportunities...</p>
          <p className="text-muted-foreground text-sm mt-1">Analyzing buyer intent & commission potential</p>
        </div>
      )}

      {/* ==================== EMPTY STATE (Before Search) ==================== */}
      {!isLoading && !hasSearched && (
        <div className="rounded-xl border border-dashed border-border bg-card/50 p-12 flex flex-col items-center justify-center text-center">
          <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 mb-4">
            <Target className="w-8 h-8 text-purple-500" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">Find High-Converting Keywords</h3>
          <p className="text-muted-foreground text-sm mt-2 max-w-md">
            Enter a seed keyword or select a niche to discover affiliate keywords with 
            buyer intent, estimated commissions, and content suggestions.
          </p>
          <div className="flex gap-3 mt-6">
            <Button 
              variant="outline" 
              onClick={() => {
                setSelectedNiche("seo-tools")
                setSeedKeyword("seo tools")
              }}
            >
              <Target className="h-4 w-4 mr-2" />
              Try SEO Tools
            </Button>
            <Button 
              variant="outline"
              onClick={() => {
                setSelectedNiche("hosting")
                setSeedKeyword("web hosting")
              }}
            >
              <Globe className="h-4 w-4 mr-2" />
              Try Web Hosting
            </Button>
          </div>
        </div>
      )}

      {/* ==================== RESULTS ==================== */}
      {!isLoading && hasSearched && (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center gap-2 mb-2">
                <Search className="h-4 w-4 text-purple-500" />
                <span className="text-xs text-muted-foreground">Keywords Found</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{stats.totalKeywords}</p>
            </div>

            <div className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-4 w-4 text-emerald-500" />
                <span className="text-xs text-muted-foreground">High Intent</span>
              </div>
              <p className="text-2xl font-bold text-emerald-400">{stats.highIntentKeywords}</p>
            </div>

            <div className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-4 w-4 text-amber-500" />
                <span className="text-xs text-muted-foreground">Avg Commission</span>
              </div>
              <p className="text-2xl font-bold text-amber-400">{formatCurrency(stats.avgCommission)}</p>
            </div>

            <div className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-cyan-500" />
                <span className="text-xs text-muted-foreground">Est. Monthly</span>
              </div>
              <p className="text-2xl font-bold text-cyan-400">{formatCurrency(stats.totalEstimatedMonthly)}</p>
            </div>
          </div>

          {/* Analytics Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <IntentDistribution keywords={filteredKeywords} />
            <TopProgramsCard />
          </div>

          {/* Search & Filters */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[250px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Filter keywords..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setCurrentPage(1)
                }}
                className="pl-10"
              />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Filter className="h-4 w-4" />
                  Score: {filters.minAffiliateScore}+
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {[0, 50, 75, 90].map(score => (
                  <DropdownMenuItem 
                    key={score}
                    onClick={() => {
                      setFilters(f => ({ ...f, minAffiliateScore: score }))
                      setCurrentPage(1)
                    }}
                  >
                    {filters.minAffiliateScore === score && <Check className="h-4 w-4 mr-2" />}
                    {score === 0 ? "All Scores" : `${score}+ Score`}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  Sort: {filters.sortBy === "affiliateScore" ? "Score" : 
                         filters.sortBy === "volume" ? "Volume" : 
                         filters.sortBy === "commission" ? "Commission" : 
                         filters.sortBy === "cpc" ? "CPC" : "Difficulty"}
                  {filters.sortOrder === "desc" ? " ↓" : " ↑"}
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {[
                  { value: "affiliateScore", label: "Affiliate Score" },
                  { value: "volume", label: "Search Volume" },
                  { value: "commission", label: "Commission" },
                  { value: "cpc", label: "CPC" },
                  { value: "difficulty", label: "Difficulty" },
                ].map(option => (
                  <DropdownMenuItem 
                    key={option.value}
                    onClick={() => setFilters(f => ({ 
                      ...f, 
                      sortBy: option.value as KeywordSearchFilters['sortBy'],
                      sortOrder: f.sortBy === option.value && f.sortOrder === 'desc' ? 'asc' : 'desc'
                    }))}
                  >
                    {filters.sortBy === option.value && <Check className="h-4 w-4 mr-2" />}
                    {option.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Intent Filter Buttons */}
            <div className="flex gap-2 ml-auto">
              {Object.entries(BUYER_INTENT_CONFIG).slice(0, 2).map(([key, config]) => (
                <Button 
                  key={key}
                  variant={filters.intentTypes.includes(key as BuyerIntent) ? "default" : "outline"} 
                  size="sm"
                  onClick={() => toggleIntent(key as BuyerIntent)}
                  className={filters.intentTypes.includes(key as BuyerIntent) 
                    ? `${config.bgColor} ${config.color} border-transparent` 
                    : ''
                  }
                >
                  {config.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Keywords Table */}
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            {/* Table Header */}
            <div className="px-6 py-4 border-b border-border bg-muted/30">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4 text-purple-500" />
                  Affiliate Keywords
                  <span className="text-sm font-normal text-muted-foreground">
                    ({filteredKeywords.length})
                  </span>
                </h2>
                <div className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages || 1}
                </div>
              </div>
            </div>

            {/* Table Content */}
            {filteredKeywords.length === 0 ? (
              <div className="p-12 text-center">
                <div className="p-3 rounded-xl bg-muted inline-block mb-3">
                  <Search className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-foreground font-medium">No keywords match your filters</p>
                <p className="text-muted-foreground text-sm mt-1">Try adjusting your search or filters</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-4"
                  onClick={() => {
                    setSearchQuery("")
                    setFilters(f => ({ ...f, minAffiliateScore: 0, intentTypes: [] }))
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {paginatedKeywords.map((keyword) => (
                  <KeywordRow 
                    key={keyword.id}
                    keyword={keyword}
                    isAddedToCalendar={addedToCalendar.has(keyword.id)}
                    isCopied={copiedKeywords.has(keyword.id)}
                    onWriteArticle={() => handleWriteArticle(keyword)}
                    onAddToCalendar={() => handleAddToCalendar(keyword)}
                    onCopy={() => handleCopyKeyword(keyword)}
                    onViewSerp={() => handleViewSerp(keyword)}
                  />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-border bg-muted/30 flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum: number
                    if (totalPages <= 5) {
                      pageNum = i + 1
                    } else if (currentPage <= 3) {
                      pageNum = i + 1
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i
                    } else {
                      pageNum = currentPage - 2 + i
                    }
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "ghost"}
                        size="sm"
                        className="w-8 h-8 p-0"
                        onClick={() => setCurrentPage(pageNum)}
                      >
                        {pageNum}
                      </Button>
                    )
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

// ============================================
// Keyword Row Component
// ============================================

interface KeywordRowProps {
  keyword: AffiliateKeyword
  isAddedToCalendar: boolean
  isCopied: boolean
  onWriteArticle: () => void
  onAddToCalendar: () => void
  onCopy: () => void
  onViewSerp: () => void
}

function KeywordRow({ 
  keyword, 
  isAddedToCalendar, 
  isCopied,
  onWriteArticle, 
  onAddToCalendar, 
  onCopy,
  onViewSerp,
}: KeywordRowProps) {
  const intentConfig = BUYER_INTENT_CONFIG[keyword.buyerIntent]
  const affiliateTier = getAffiliateTier(keyword.affiliateScore)
  const contentType = CONTENT_TYPE_CONFIG[keyword.contentType]
  const ContentIcon = contentType?.icon || Sparkles

  return (
    <div className="px-6 py-4 hover:bg-muted/30 transition-colors">
      <div className="flex items-start gap-4">
        {/* Affiliate Score */}
        <div className={`p-3 rounded-xl ${affiliateTier.bg} shrink-0 text-center min-w-[60px]`}>
          <span className={`text-xl font-bold ${affiliateTier.color}`}>{keyword.affiliateScore}</span>
          <p className="text-[10px] text-muted-foreground mt-0.5 uppercase tracking-wider">Score</p>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Keyword & Badges */}
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h3 className="font-semibold text-foreground text-base">
                {keyword.keyword}
              </h3>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                {/* Intent Badge */}
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${intentConfig.bgColor} ${intentConfig.color}`}>
                  {intentConfig.label}
                </span>
                {/* Modifiers - Using SVG icons now */}
                {keyword.modifiers.slice(0, 2).map(mod => {
                  const modConfig = INTENT_MODIFIERS[mod]
                  return (
                    <span 
                      key={mod} 
                      className="px-2 py-0.5 rounded-full text-[10px] bg-muted/50 text-muted-foreground"
                      title={modConfig.description}
                    >
                      {modConfig.label}
                    </span>
                  )
                })}
                {/* Content Type - SVG Icon */}
                <span className={cn(
                  "flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-purple-500/10",
                  contentType?.color || "text-purple-400"
                )}>
                  <ContentIcon className="h-3 w-3" />
                  {contentType?.label}
                </span>
              </div>
            </div>

            {/* Monthly Earnings */}
            <div className="text-right shrink-0">
              <p className="text-xl font-bold text-emerald-400">
                {formatCurrency(keyword.estimatedEarnings.monthly)}
              </p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Est. Monthly</p>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-5 gap-4 mt-3">
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Volume</p>
              <p className="font-mono text-sm font-semibold text-foreground flex items-center gap-1">
                {formatNumber(keyword.searchVolume)}
                {keyword.trend === 'up' && <TrendingUp className="h-3 w-3 text-emerald-400" />}
                {keyword.trend === 'down' && <TrendingDown className="h-3 w-3 text-red-400" />}
                {keyword.trend === 'stable' && <Minus className="h-3 w-3 text-muted-foreground" />}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">KD</p>
              <p className={`font-mono text-sm font-semibold ${
                keyword.keywordDifficulty < 40 ? 'text-emerald-400' : 
                keyword.keywordDifficulty < 60 ? 'text-amber-400' : 'text-red-400'
              }`}>{keyword.keywordDifficulty}</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">CPC</p>
              <p className="font-mono text-sm font-semibold text-cyan-400">${keyword.cpc.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Commission</p>
              <p className="font-mono text-sm font-semibold text-purple-400">{formatCurrency(keyword.estimatedCommission)}</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Conversion</p>
              <p className={`text-sm font-semibold capitalize ${
                keyword.conversionPotential === 'high' ? 'text-emerald-400' :
                keyword.conversionPotential === 'medium' ? 'text-amber-400' : 'text-red-400'
              }`}>{keyword.conversionPotential}</p>
            </div>
          </div>

          {/* Programs & Actions */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Programs:</span>
              {keyword.suggestedPrograms.slice(0, 3).map(program => {
                const programIcon = PROGRAM_ICONS[program.id]
                const ProgramIconComponent = programIcon?.icon || ExternalLink
                return (
                  <span 
                    key={program.id} 
                    className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted/50 text-xs"
                  >
                    <ProgramIconComponent className={cn("h-3 w-3", programIcon?.color || "text-muted-foreground")} />
                    <span className="text-foreground">{program.name}</span>
                  </span>
                )
              })}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-3 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10"
                onClick={onWriteArticle}
              >
                <Pencil className="h-3.5 w-3.5 mr-1.5" />
                Write
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className={`h-8 w-8 p-0 ${isAddedToCalendar ? 'text-emerald-400' : 'text-muted-foreground hover:text-foreground'}`}
                onClick={onAddToCalendar}
                disabled={isAddedToCalendar}
              >
                {isAddedToCalendar ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <CalendarPlus className="h-4 w-4" />
                )}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className={`h-8 w-8 p-0 ${isCopied ? 'text-emerald-400' : 'text-muted-foreground hover:text-foreground'}`}
                onClick={onCopy}
              >
                {isCopied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                onClick={onViewSerp}
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
