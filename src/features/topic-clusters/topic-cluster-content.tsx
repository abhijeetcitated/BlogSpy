"use client"

import { useState, useMemo, Fragment, useEffect } from "react"
import { useRouter } from "next/navigation"
import { 
  Upload, Trash2, Search, Filter, ArrowUpDown, ArrowUp, ArrowDown,
  Sparkles, Plus, X, ChevronDown, ChevronUp,
  TrendingUp, TrendingDown, Minus, CheckSquare, Square,
  Wand2, BarChart3, Target, Scissors, Flame,
  Video, MessageSquare, Star, ShoppingCart, Image, Map,
  ExternalLink, Link2, Eye, MousePointer, Zap, Layout, Layers, DollarSign, MousePointer2, RefreshCw, CheckCircle2, Clock
} from "lucide-react"
import { cn } from "@/lib/utils"

// ============================================
// TYPES - Advanced Schema
// ============================================

type SerpFeature = "featured_snippet" | "paa" | "video" | "images" | "shopping" | "local_pack" | "reviews" | "knowledge_panel"
type BusinessPotential = 0 | 1 | 2 | 3 // 0=None, 1=Low, 2=Med, 3=High

interface Keyword {
  id: string
  keyword: string
  source: string
  sourceTag?: string // Contextual tag (e.g., "Missing", "Decaying", "Breakout")
  isSelected: boolean
  
  // Core metrics (almost always available)
  volume: number | null
  kd: number | null
  cpc: number | null
  
  // Intent & Trend
  intent: "informational" | "transactional" | "navigational" | "commercial" | null
  trend: "up" | "down" | "stable" | null
  trendPercent: number | null
  
  // Advanced metrics
  trafficPotential: number | null      // Estimated traffic if #1 (or current traffic if ranked)
  clicks: number | null                 // Actual clicks (searches that result in clicks)
  cps: number | null                    // Clicks per search ratio
  businessPotential: BusinessPotential  // Manual score for value
  
  // Position data (from Rank Tracker, Competitor Gap)
  position: number | null               // Your current ranking
  positionChange: number | null         // Position change (+/-)
  rankingUrl: string | null             // Your URL that ranks
  
  // SERP Features
  serpFeatures: SerpFeature[]           // What SERP features appear
  hasFeaturedSnippet: boolean           // Opportunity for featured snippet
  
  // Clustering
  parentTopic: string | null            // Broader topic for grouping
  wordCount: number
  
  // Competition
  competition: "low" | "medium" | "high" | null  // PPC competition
  results: number | null                // Number of search results
  
  // Metadata
  lastUpdated: Date | null
  isRefreshing?: boolean // New state for animation
}

type SortField = "keyword" | "volume" | "kd" | "cpc" | "trafficPotential" | "position" | "clicks" | "wordCount" | "businessPotential" | "source" | "lastUpdated" | "priorityScore"
type SortDirection = "asc" | "desc"
type KeywordStatus = "new" | "update" | "optimize" | "ranking" | null

// Status determination logic based on source and position
const getKeywordStatus = (kw: Keyword): KeywordStatus => {
  // If ranking well (top 10), it's "ranking"
  if (kw.position !== null && kw.position <= 10) return "ranking"
  // If from Content Decay or has Traffic Loss tag, needs "update"
  if (kw.source === "Content Decay" || kw.sourceTag === "Traffic Loss") return "update"
  // If ranking but weak (11-50), needs "optimize"
  if (kw.position !== null && kw.position <= 50) return "optimize"
  // If from Competitor Gap or has Missing tag, it's "new" content needed
  if (kw.source === "Competitor Gap" || kw.sourceTag === "Missing") return "new"
  // If not ranking at all, it's "new"
  if (kw.position === null && (kw.source === "Keyword Magic" || kw.source === "Trend Spotter")) return "new"
  return null
}

// Priority Score calculation: Higher = Better opportunity
// Formula: (Volume / 1000) × (100 - KD) × (CPC + 0.5) × StatusMultiplier
const calculatePriorityScore = (kw: Keyword): number => {
  const volume = kw.volume || 0
  const kd = kw.kd || 50
  const cpc = kw.cpc || 0.5
  const status = getKeywordStatus(kw)
  
  // Status multiplier: Update/Optimize existing content = higher priority (quick wins)
  const statusMultiplier = 
    status === "update" ? 1.5 :      // Existing content, just refresh
    status === "optimize" ? 1.3 :    // Already ranking, improve
    status === "new" ? 1.0 :         // New content needed
    status === "ranking" ? 0.5 :     // Already doing well, low priority
    1.0
  
  // Trend multiplier
  const trendMultiplier = 
    kw.trend === "up" ? 1.2 :        // Growing topic
    kw.trend === "down" ? 0.7 :      // Declining
    1.0
  
  return Math.round((volume / 1000) * (100 - kd) * (cpc + 0.5) * statusMultiplier * trendMultiplier)
}

// ============================================
// CONSTANTS
// ============================================

const IMPORT_SOURCES = [
  { id: "keyword-magic", label: "Keyword Magic", icon: Wand2, color: "text-purple-500 dark:text-purple-400 bg-purple-500/10 border-purple-500/30 hover:bg-purple-500/20" },
  { id: "competitor-gap", label: "Competitor Gap", icon: BarChart3, color: "text-blue-500 dark:text-blue-400 bg-blue-500/10 border-blue-500/30 hover:bg-blue-500/20" },
  { id: "content-decay", label: "Content Decay", icon: TrendingDown, color: "text-amber-500 dark:text-amber-400 bg-amber-500/10 border-amber-500/30 hover:bg-amber-500/20" },
  { id: "rank-tracker", label: "Rank Tracker", icon: Target, color: "text-emerald-500 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/30 hover:bg-emerald-500/20" },
  { id: "snippet-stealer", label: "Snippet Stealer", icon: Scissors, color: "text-pink-500 dark:text-pink-400 bg-pink-500/10 border-pink-500/30 hover:bg-pink-500/20" },
  { id: "trend-spotter", label: "Trend Spotter", icon: Flame, color: "text-orange-500 dark:text-orange-400 bg-orange-500/10 border-orange-500/30 hover:bg-orange-500/20" },
]

const INTENT_CONFIG: Record<string, { label: string; color: string; short: string }> = {
  informational: { label: "Informational", color: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30", short: "INFO" },
  transactional: { label: "Transactional", color: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30", short: "TRAN" },
  navigational: { label: "Navigational", color: "bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30", short: "NAVI" },
  commercial: { label: "Commercial", color: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30", short: "COMM" },
}

const SERP_FEATURE_ICONS: Record<SerpFeature, { icon: typeof Video; label: string; color: string }> = {
  featured_snippet: { icon: Zap, label: "Featured Snippet", color: "text-yellow-500" },
  paa: { icon: MessageSquare, label: "People Also Ask", color: "text-blue-500" },
  video: { icon: Video, label: "Video", color: "text-red-500" },
  images: { icon: Image, label: "Images", color: "text-green-500" },
  shopping: { icon: ShoppingCart, label: "Shopping", color: "text-purple-500" },
  local_pack: { icon: Map, label: "Local Pack", color: "text-orange-500" },
  reviews: { icon: Star, label: "Reviews", color: "text-amber-500" },
  knowledge_panel: { icon: Eye, label: "Knowledge Panel", color: "text-cyan-500" },
}

// Source-specific data availability
// "Complete Solution": We enable calculated metrics (Traffic Pot, Clicks, CPS) for ALL sources 
// so the table never looks "empty" or broken.
const SOURCE_DATA_MAP: Record<string, Partial<Record<keyof Keyword, boolean>>> = {
  "keyword-magic": { volume: true, kd: true, cpc: true, intent: true, trend: true, trafficPotential: true, serpFeatures: true, clicks: true, cps: true },
  "competitor-gap": { volume: true, kd: true, cpc: true, intent: true, position: false, trafficPotential: true, rankingUrl: false, clicks: true, cps: true, trend: true }, // Position false (we don't rank)
  "content-decay": { volume: true, kd: true, trend: true, position: true, positionChange: true, trafficPotential: true, rankingUrl: true, clicks: true, cps: true },
  "rank-tracker": { volume: true, kd: true, position: true, positionChange: true, serpFeatures: true, trafficPotential: true, rankingUrl: true, clicks: true, cps: true, trend: true },
  "snippet-stealer": { volume: true, kd: true, intent: true, position: true, serpFeatures: true, hasFeaturedSnippet: true, trafficPotential: true, clicks: true, cps: true },
  "trend-spotter": { volume: true, trend: true, trendPercent: true, trafficPotential: true, clicks: true, cps: true, kd: true, intent: true },
  "manual": { volume: true, kd: true, cpc: true, intent: true, trend: true, trafficPotential: true, clicks: true, cps: true }, // Manual entry fetches all data
}

// ============================================
// DEMO DATA GENERATOR
// ============================================

function generateKeywordData(sourceId: string): Keyword[] {
  const sourceConfig = SOURCE_DATA_MAP[sourceId] || {}
  const sourceName = IMPORT_SOURCES.find(s => s.id === sourceId)?.label || (sourceId === "manual" ? "Manual Entry" : sourceId)
  
  const keywordsBySource: Record<string, { kw: string; parent: string }[]> = {
    "keyword-magic": [
      { kw: "seo tools", parent: "SEO Software" },
      { kw: "best seo tools 2024", parent: "SEO Software" },
      { kw: "keyword research tool", parent: "Keyword Research" },
      { kw: "backlink checker free", parent: "Backlink Analysis" },
      { kw: "competitor analysis tool", parent: "Competitive Analysis" },
      { kw: "site audit tool", parent: "Technical SEO" },
      { kw: "rank tracker software", parent: "Rank Tracking" },
      { kw: "content optimization tool", parent: "Content SEO" },
    ],
    "manual": [
      { kw: "my custom keyword", parent: "Custom Topic" },
      { kw: "niche specific term", parent: "Custom Topic" },
    ],
    "competitor-gap": [
      { kw: "ahrefs alternatives", parent: "SEO Tools Comparison" },
      { kw: "semrush vs ahrefs", parent: "SEO Tools Comparison" },
      { kw: "moz pro review", parent: "SEO Tools Review" },
      { kw: "ubersuggest free", parent: "Free SEO Tools" },
      { kw: "serpstat pricing", parent: "SEO Tools Pricing" },
    ],
    "content-decay": [
      { kw: "seo guide 2023", parent: "SEO Guides" },
      { kw: "link building strategies", parent: "Link Building" },
      { kw: "on page seo checklist", parent: "On-Page SEO" },
      { kw: "google algorithm updates", parent: "Algorithm Updates" },
    ],
    "rank-tracker": [
      { kw: "how to rank on google", parent: "SEO Basics" },
      { kw: "increase website traffic", parent: "Traffic Growth" },
      { kw: "local seo tips", parent: "Local SEO" },
      { kw: "mobile seo best practices", parent: "Mobile SEO" },
      { kw: "voice search optimization", parent: "Voice Search" },
    ],
    "snippet-stealer": [
      { kw: "what is seo", parent: "SEO Basics" },
      { kw: "how does google work", parent: "Search Engines" },
      { kw: "best time to post on instagram", parent: "Social Media" },
      { kw: "how to start a blog", parent: "Blogging" },
    ],
    "trend-spotter": [
      { kw: "ai seo tools", parent: "AI in SEO" },
      { kw: "chatgpt for seo", parent: "AI in SEO" },
      { kw: "google sge optimization", parent: "AI Search" },
      { kw: "tiktok seo", parent: "Social SEO" },
    ],
  }
  
  const keywords = keywordsBySource[sourceId] || []
  const intents: Keyword["intent"][] = ["informational", "transactional", "commercial", "navigational"]
  const trends: Keyword["trend"][] = ["up", "down", "stable"]
  const serpFeaturesList: SerpFeature[] = ["featured_snippet", "paa", "video", "images", "shopping", "reviews"]
  
  return keywords.map(({ kw, parent }) => {
    const volume = Math.floor(Math.random() * 15000) + 500
    const kd = Math.floor(Math.random() * 85) + 10
    const position = sourceConfig.position ? (Math.random() > 0.3 ? Math.floor(Math.random() * 50) + 1 : null) : null
    
    // Generate SERP features (random subset)
    const serpFeatures: SerpFeature[] = sourceConfig.serpFeatures 
      ? serpFeaturesList.filter(() => Math.random() > 0.6)
      : []
      
    // Generate Source Tag based on source
    let sourceTag = undefined
    if (sourceId === "competitor-gap") sourceTag = Math.random() > 0.5 ? "Missing" : "Weak"
    if (sourceId === "content-decay") sourceTag = "Traffic Loss"
    if (sourceId === "trend-spotter") sourceTag = "Breakout"
    if (sourceId === "snippet-stealer") sourceTag = Math.random() > 0.5 ? "List Snippet" : "Table Snippet"
    if (sourceId === "manual") sourceTag = "User Added"
    
// Deep Dive Logic: Metrics Calculation
      // CPS (Clicks Per Search) = Clicks / Volume
      // Traffic Potential = Volume * CTR (assuming #1 ranking + long tail)
      const clickRate = Math.random() * 0.4 + 0.15; // 15% to 55% organic click rate
      const calculatedClicks = Math.floor(volume * clickRate);
      
      return {
      id: Math.random().toString(36).substring(2, 9),
      keyword: kw,
      source: sourceName,
      sourceTag,
      isSelected: false,
      
      volume: sourceConfig.volume ? volume : null,
      kd: sourceConfig.kd ? kd : null,
      cpc: sourceConfig.cpc ? Math.random() * 8 + 0.5 : null,
      
      intent: sourceConfig.intent ? intents[Math.floor(Math.random() * intents.length)] : null,
      trend: sourceConfig.trend ? trends[Math.floor(Math.random() * trends.length)] : null,
      trendPercent: sourceConfig.trendPercent || sourceConfig.trend ? Math.floor(Math.random() * 50) - 20 : null,
      
      trafficPotential: sourceConfig.trafficPotential ? Math.floor(volume * (clickRate + 0.1)) : null, // Potential is slightly higher than raw clicks due to long-tail
      clicks: sourceConfig.clicks ? calculatedClicks : null,
      cps: sourceConfig.cps ? parseFloat(clickRate.toFixed(2)) : null,
      businessPotential: Math.floor(Math.random() * 4) as BusinessPotential,
      
      position: position,
      positionChange: sourceConfig.positionChange && position ? Math.floor(Math.random() * 20) - 10 : null,
      rankingUrl: sourceConfig.rankingUrl && position ? `/blog/${kw.replace(/\s+/g, "-")}` : null,
      
      serpFeatures: serpFeatures,
      hasFeaturedSnippet: sourceConfig.hasFeaturedSnippet ? serpFeatures.includes("featured_snippet") || Math.random() > 0.7 : false,
      
      parentTopic: parent,
      wordCount: kw.split(" ").length,
      
      competition: sourceConfig.cpc ? (["low", "medium", "high"] as const)[Math.floor(Math.random() * 3)] : null,
      results: Math.floor(Math.random() * 500000000) + 1000000,
      
      lastUpdated: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
    }
  })
}

// Helper for relative time
const getRelativeTime = (date: Date) => {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  const months = Math.floor(days / 30)
  
  if (seconds < 60) return "Just now"
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 30) return `${days}d ago`
  return `${months}mo ago`
}

// ============================================
// MAIN COMPONENT
// ============================================

export function TopicClusterContent() {
  // State
  const [keywords, setKeywords] = useState<Keyword[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [sortField, setSortField] = useState<SortField>("volume")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")
  const [showFilters, setShowFilters] = useState(false)
  const [showManualInput, setShowManualInput] = useState(false)
  const [showColumnMenu, setShowColumnMenu] = useState(false)
  const [manualText, setManualText] = useState("")
  const [columnOverrides, setColumnOverrides] = useState<Record<string, boolean>>({})
  
  // NEW: Side Panel for keyword details
  const [selectedKeyword, setSelectedKeyword] = useState<Keyword | null>(null)
  const [showSidePanel, setShowSidePanel] = useState(false)
  
  // NEW: Content Brief Modal
  const [showContentBrief, setShowContentBrief] = useState(false)
  const [briefKeywords, setBriefKeywords] = useState<Keyword[]>([])
  
  // Force re-render every minute to update relative times
  const [, setTick] = useState(0)
  useEffect(() => {
    const timer = setInterval(() => setTick(t => t + 1), 60000)
    return () => clearInterval(timer)
  }, [])
  
  // Filters
  const [volumeMin, setVolumeMin] = useState("")
  const [volumeMax, setVolumeMax] = useState("")
  const [kdMin, setKdMin] = useState("")
  const [kdMax, setKdMax] = useState("")
  const [intentFilter, setIntentFilter] = useState<string>("all")
  const [sourceFilter, setSourceFilter] = useState<string>("all")
  const [serpFilter, setSerpFilter] = useState<string>("all")
  
  // Credits System
  const [credits, setCredits] = useState(450)
  const [showCreditModal, setShowCreditModal] = useState(false)

  const handleRefresh = (id: string) => {
    if (credits >= 1) {
      setCredits(prev => prev - 1)
      // Start animation
      setKeywords(prev => prev.map(k => k.id === id ? { ...k, isRefreshing: true } : k))
      
      // Simulate API call
      setTimeout(() => {
        setKeywords(prev => prev.map(k => k.id === id ? { 
          ...k, 
          isRefreshing: false,
          lastUpdated: new Date() // Update timestamp
        } : k))
      }, 2000)
    } else {
      setShowCreditModal(true)
    }
  }

  const handleBulkRefresh = (count: number) => {
    if (credits >= count) {
      setCredits(prev => prev - count)
      
      // Get selected IDs
      const selectedIds = new Set(keywords.filter(k => k.isSelected).map(k => k.id))
      
      // Start animation for selected
      setKeywords(prev => prev.map(k => selectedIds.has(k.id) ? { ...k, isRefreshing: true } : k))
      
      // Simulate API call
      setTimeout(() => {
        setKeywords(prev => prev.map(k => selectedIds.has(k.id) ? { 
          ...k, 
          isRefreshing: false,
          lastUpdated: new Date() // Update timestamp
        } : k))
      }, 2000)
    } else {
      setShowCreditModal(true)
    }
  }

  // Check which columns have data (Smart Visibility + User Overrides)
  const columnVisibility = useMemo(() => {
    const hasData = {
      trafficPotential: keywords.some(k => k.trafficPotential !== null),
      clicks: keywords.some(k => k.clicks !== null),
      position: keywords.some(k => k.position !== null),
      serpFeatures: keywords.some(k => k.serpFeatures.length > 0),
      parentTopic: keywords.some(k => k.parentTopic !== null),
      intent: keywords.some(k => k.intent !== null),
      trend: keywords.some(k => k.trend !== null),
      cpc: keywords.some(k => k.cpc !== null),
    }
    
    return {
      trafficPotential: columnOverrides.trafficPotential ?? hasData.trafficPotential,
      clicks: columnOverrides.clicks ?? hasData.clicks,
      position: columnOverrides.position ?? hasData.position,
      serpFeatures: columnOverrides.serpFeatures ?? hasData.serpFeatures,
      parentTopic: columnOverrides.parentTopic ?? hasData.parentTopic,
      intent: columnOverrides.intent ?? hasData.intent,
      trend: columnOverrides.trend ?? hasData.trend,
      cpc: columnOverrides.cpc ?? hasData.cpc,
    }
  }, [keywords, columnOverrides])
  
  const toggleColumn = (key: string) => {
    setColumnOverrides(prev => {
      // If currently undefined (smart), set to opposite of smart
      // If currently true/false, toggle
      const currentSmart = keywords.some(k => k[key as keyof Keyword] !== null)
      const currentVal = prev[key] ?? currentSmart
      return { ...prev, [key]: !currentVal }
    })
  }

  const updateBusinessPotential = (id: string, value: BusinessPotential) => {
    setKeywords(prev => prev.map(k => k.id === id ? { ...k, businessPotential: value } : k))
  }
  
  // Sorting
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("desc")
    }
  }
  
  // Selection
  const selectedCount = keywords.filter(k => k.isSelected).length
  
  const handleSelectAll = () => {
    const allSelected = filteredKeywords.every(k => k.isSelected)
    const filteredIds = new Set(filteredKeywords.map(k => k.id))
    setKeywords(prev => prev.map(k => 
      filteredIds.has(k.id) ? { ...k, isSelected: !allSelected } : k
    ))
  }
  
  const handleSelectOne = (id: string) => {
    setKeywords(prev => prev.map(k => k.id === id ? { ...k, isSelected: !k.isSelected } : k))
  }
  
  // Filter & Sort keywords
  const filteredKeywords = useMemo(() => {
    let result = [...keywords]
    
    if (searchQuery) {
      result = result.filter(k => k.keyword.toLowerCase().includes(searchQuery.toLowerCase()))
    }
    
    if (volumeMin) result = result.filter(k => (k.volume ?? 0) >= parseInt(volumeMin))
    if (volumeMax) result = result.filter(k => (k.volume ?? Infinity) <= parseInt(volumeMax))
    if (kdMin) result = result.filter(k => (k.kd ?? 0) >= parseInt(kdMin))
    if (kdMax) result = result.filter(k => (k.kd ?? Infinity) <= parseInt(kdMax))
    if (intentFilter !== "all") result = result.filter(k => k.intent === intentFilter)
    if (sourceFilter !== "all") result = result.filter(k => k.source === sourceFilter)
    if (serpFilter !== "all") result = result.filter(k => k.serpFeatures.includes(serpFilter as SerpFeature))
    
    result.sort((a, b) => {
      // Special handling for priorityScore - calculate on the fly
      if (sortField === "priorityScore") {
        const aScore = calculatePriorityScore(a)
        const bScore = calculatePriorityScore(b)
        return sortDirection === "asc" ? aScore - bScore : bScore - aScore
      }
      
      const aVal = a[sortField]
      const bVal = b[sortField]
      if (aVal === null && bVal === null) return 0
      if (aVal === null) return 1
      if (bVal === null) return -1
      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortDirection === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
      }
      return sortDirection === "asc" ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number)
    })
    
    return result
  }, [keywords, searchQuery, volumeMin, volumeMax, kdMin, kdMax, intentFilter, sourceFilter, serpFilter, sortField, sortDirection])
  
  // Add manual keywords
  const handleAddManual = () => {
    if (!manualText.trim()) return
    
    const lines = manualText.split("\n").filter(l => l.trim())
    const newKeywords: Keyword[] = lines.map(line => {
      const parts = line.split("\t")
      const kw = parts[0]?.trim() || line.trim()
      const volume = parseInt(parts[1]) || Math.floor(Math.random() * 5000) + 100
      
      return {
        id: Math.random().toString(36).substring(2, 9),
        keyword: kw,
        source: "Manual",
        isSelected: false,
        volume: volume,
        kd: parseInt(parts[2]) || Math.floor(Math.random() * 80) + 10,
        cpc: parseFloat(parts[3]) || Math.random() * 5,
        intent: (["informational", "transactional", "commercial", "navigational"] as const)[Math.floor(Math.random() * 4)],
        trend: (["up", "down", "stable"] as const)[Math.floor(Math.random() * 3)],
        trendPercent: Math.floor(Math.random() * 30) - 10,
        trafficPotential: Math.floor(volume * 1.2),
        clicks: null,
        cps: null,
        businessPotential: 0,
        position: null,
        positionChange: null,
        rankingUrl: null,
        serpFeatures: [],
        hasFeaturedSnippet: false,
        parentTopic: null,
        wordCount: kw.split(" ").length,
        competition: null,
        results: null,
        lastUpdated: new Date(),
      }
    })
    
    setKeywords(prev => [...prev, ...newKeywords])
    setManualText("")
    setShowManualInput(false)
  }
  
  // Import from source
  const handleImport = (sourceId: string) => {
    const newKeywords = generateKeywordData(sourceId)
    setKeywords(prev => [...prev, ...newKeywords])
  }
  
  // Delete & Clear
  const handleDeleteSelected = () => setKeywords(prev => prev.filter(k => !k.isSelected))
  const handleClearAll = () => setKeywords([])
  
  // ============================================
  // PROFESSIONAL SEO CLUSTERING ALGORITHM
  // ============================================
  // Complete mathematics-based clustering logic
  // Developed for production SEO tool
  // ============================================

  // ============================================
  // GENERATE CLUSTERS - Navigate to Results Page
  // ============================================
  const router = useRouter()
  
  const handleGenerateClusters = () => {
    if (keywords.length < 5) {
      alert("Need at least 5 keywords to generate clusters")
      return
    }

    // Prepare keywords data for clustering algorithm
    const clusteringKeywords = keywords.map(kw => ({
      id: kw.id,
      keyword: kw.keyword,
      volume: kw.volume ?? undefined,
      kd: kw.kd ?? undefined,
      cpc: kw.cpc ?? undefined,
      intent: kw.intent ?? undefined,
      trend: kw.trend ?? undefined,
      source: kw.source
    }))

    // Store in sessionStorage for results page
    sessionStorage.setItem("clustering_keywords", JSON.stringify(clusteringKeywords))

    // Navigate to results page
    router.push("/dashboard/strategy/topic-clusters/results")
  }
  
  // Group keywords by Parent Topic - REMOVED (cluster view removed)

  // Helper components
  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="w-3 h-3 opacity-40" />
    return sortDirection === "asc" ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
  }
  
  const BusinessPotentialDots = ({ id, value }: { id: string, value: BusinessPotential }) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3].map((dot) => (
          <button
            key={dot}
            onClick={(e) => {
              e.stopPropagation()
              updateBusinessPotential(id, value === dot ? 0 : dot as BusinessPotential)
            }}
            className={cn(
              "w-2 h-2 rounded-full transition-colors",
              value >= dot ? "bg-blue-500" : "bg-zinc-200 dark:bg-zinc-700 hover:bg-blue-500/50"
            )}
          />
        ))}
      </div>
    )
  }

  const TrendBadge = ({ trend, percent }: { trend: string | null; percent: number | null }) => {
    if (!trend) return <span className="text-zinc-400">—</span>
    const color = trend === "up" ? "text-emerald-500" : trend === "down" ? "text-red-500" : "text-zinc-500"
    const Icon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus
    return (
      <span className={cn("flex items-center gap-1 text-xs", color)}>
        <Icon className="w-3 h-3" />
        {percent !== null && percent !== 0 && `${percent > 0 ? "+" : ""}${percent}%`}
      </span>
    )
  }
  
  const PositionBadge = ({ position, change }: { position: number | null; change: number | null }) => {
    if (position === null) return <span className="text-zinc-400">—</span>
    const posColor = position <= 3 ? "text-emerald-500 font-semibold" : position <= 10 ? "text-amber-500" : "text-zinc-500"
    return (
      <div className="flex items-center gap-1">
        <span className={cn("text-xs", posColor)}>#{position}</span>
        {change !== null && change !== 0 && (
          <span className={cn("text-[10px]", change > 0 ? "text-emerald-500" : "text-red-500")}>
            {change > 0 ? `↑${change}` : `↓${Math.abs(change)}`}
          </span>
        )}
      </div>
    )
  }
  
  const SerpFeatureIcons = ({ features }: { features: SerpFeature[] }) => {
    if (features.length === 0) return <span className="text-zinc-400">—</span>
    return (
      <div className="flex items-center gap-0.5">
        {features.slice(0, 4).map(f => {
          const config = SERP_FEATURE_ICONS[f]
          return (
            <span key={f} title={config.label} className={cn("p-0.5", config.color)}>
              <config.icon className="w-3 h-3" />
            </span>
          )
        })}
        {features.length > 4 && (
          <span className="text-[10px] text-zinc-500">+{features.length - 4}</span>
        )}
      </div>
    )
  }

  // Source Badge with colors
  const SOURCE_COLORS: Record<string, { bg: string; text: string; tooltip: string }> = {
    "Keyword Magic": { bg: "bg-purple-100 dark:bg-purple-900/30", text: "text-purple-600 dark:text-purple-400", tooltip: "Found via Keyword Magic Tool - Seed keyword expansion" },
    "Competitor Gap": { bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-600 dark:text-blue-400", tooltip: "Competitor is ranking, you are not - Gap opportunity!" },
    "Content Decay": { bg: "bg-amber-100 dark:bg-amber-900/30", text: "text-amber-600 dark:text-amber-400", tooltip: "Your existing content is losing traffic - Needs refresh" },
    "Rank Tracker": { bg: "bg-emerald-100 dark:bg-emerald-900/30", text: "text-emerald-600 dark:text-emerald-400", tooltip: "You are already ranking for this keyword" },
    "Snippet Stealer": { bg: "bg-pink-100 dark:bg-pink-900/30", text: "text-pink-600 dark:text-pink-400", tooltip: "Featured snippet opportunity - Competitor has it" },
    "Trend Spotter": { bg: "bg-orange-100 dark:bg-orange-900/30", text: "text-orange-600 dark:text-orange-400", tooltip: "Trending/Breakout topic - New opportunity" },
    "Manual": { bg: "bg-zinc-100 dark:bg-zinc-800", text: "text-zinc-600 dark:text-zinc-400", tooltip: "Manually added by you" },
  }

  const SourceBadge = ({ source, sourceTag }: { source: string; sourceTag?: string }) => {
    const config = SOURCE_COLORS[source] || SOURCE_COLORS["Manual"]
    return (
      <div className="flex flex-col items-center gap-0.5">
        <span 
          className={cn("text-[10px] px-1.5 py-0.5 rounded font-medium", config.bg, config.text)}
          title={config.tooltip}
        >
          {source.split(" ")[0]}
        </span>
        {sourceTag && (
          <span className={cn(
            "text-[9px] px-1 py-0.5 rounded-full font-medium",
            sourceTag === "Missing" ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400" :
            sourceTag === "Weak" ? "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400" :
            sourceTag === "Traffic Loss" ? "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400" :
            sourceTag === "Breakout" ? "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400" :
            "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
          )} title={
            sourceTag === "Missing" ? "You have no content for this - Create new!" :
            sourceTag === "Weak" ? "Your ranking is weak (11-50) - Improve content" :
            sourceTag === "Traffic Loss" ? "Lost traffic recently - Needs update" :
            sourceTag === "Breakout" ? "Trending up rapidly - Quick win!" :
            sourceTag
          }>{sourceTag}</span>
        )}
      </div>
    )
  }

  // STATUS BADGE - Shows what action to take
  const STATUS_CONFIG = {
    "new": { label: "NEW", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400", tooltip: "Create new content for this keyword", icon: "+" },
    "update": { label: "UPDATE", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400", tooltip: "Update existing content - losing traffic", icon: "↻" },
    "optimize": { label: "OPTIMIZE", color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400", tooltip: "Improve ranking - you're close!", icon: "↑" },
    "ranking": { label: "RANKING", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400", tooltip: "Already ranking well - maintain", icon: "✓" },
  } as const

  const StatusBadge = ({ keyword }: { keyword: Keyword }) => {
    const status = getKeywordStatus(keyword)
    if (!status) return null
    const config = STATUS_CONFIG[status]
    return (
      <span 
        className={cn("text-[9px] px-1.5 py-0.5 rounded font-semibold ml-1", config.color)}
        title={config.tooltip}
      >
        {config.icon} {config.label}
      </span>
    )
  }

  // POSITION BADGE - Shows where you rank (inline with keyword)
  const InlinePositionBadge = ({ position, change }: { position: number | null; change: number | null }) => {
    if (position === null) return null
    const posColor = position <= 3 
      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" 
      : position <= 10 
      ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" 
      : position <= 30
      ? "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
      : "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
    return (
      <span 
        className={cn("text-[9px] px-1.5 py-0.5 rounded font-semibold ml-2", posColor)}
        title={position <= 10 ? "Great! You're on page 1" : position <= 30 ? "Page 2-3 - Optimize to reach page 1" : "Low ranking - needs major improvement"}
      >
        #{position}
        {change !== null && change !== 0 && (
          <span className={cn("ml-0.5", change > 0 ? "text-emerald-600" : "text-red-500")}>
            {change > 0 ? `↑${change}` : `↓${Math.abs(change)}`}
          </span>
        )}
      </span>
    )
  }

  // PRIORITY SCORE BADGE
  const PriorityBadge = ({ score }: { score: number }) => {
    const color = score >= 500 
      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" 
      : score >= 200 
      ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" 
      : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
    const label = score >= 500 ? "🔥 Hot" : score >= 200 ? "⭐ Good" : "💤 Low"
    return (
      <span 
        className={cn("text-[9px] px-1.5 py-0.5 rounded font-medium", color)}
        title={`Priority Score: ${score} - Based on Volume, KD, CPC & Status`}
      >
        {label}
      </span>
    )
  }
  
  // Get unique sources for filter
  const uniqueSources = useMemo(() => [...new Set(keywords.map(k => k.source))], [keywords])

  return (
    <div className="min-h-full p-0 transition-colors">
      <div className="max-w-[1800px] mx-auto space-y-3 sm:space-y-4">
        
        {/* HEADER */}
        <div className="flex flex-col gap-3 sm:gap-4">
          <div>
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-zinc-900 dark:text-white">Topic Cluster Builder</h1>
            <p className="text-zinc-500 dark:text-zinc-400 text-xs sm:text-sm mt-0.5 sm:mt-1">Import keywords from various sources and build optimized content clusters</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* Credit Badge */}
            <div className="flex items-center gap-1.5 sm:gap-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full">
              <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500 fill-amber-500" />
              <span className="text-xs sm:text-sm font-medium text-amber-700 dark:text-amber-400">{credits} <span className="hidden sm:inline">Refresh </span>Credits</span>
              <button onClick={() => setShowCreditModal(true)} className="ml-0.5 sm:ml-1 p-0.5 hover:bg-amber-100 dark:hover:bg-amber-800 rounded-full transition-colors" title="Buy Credits">
                <Plus className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-600 dark:text-amber-400" />
              </button>
            </div>

            {selectedCount > 0 && (
              <button
                onClick={handleDeleteSelected}
                className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 bg-red-500/10 text-red-500 border border-red-500/30 rounded-lg hover:bg-red-500/20 transition-colors text-xs sm:text-sm"
              >
                <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Delete</span> ({selectedCount})
              </button>
            )}
            
            {/* MASTER BUTTON - Generate Clusters */}
            {keywords.length >= 5 && (
              <button
                onClick={handleGenerateClusters}
                className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-1.5 sm:py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg hover:from-orange-600 hover:to-amber-600 transition-all text-xs sm:text-sm font-semibold shadow-lg shadow-orange-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Generate Clusters</span>
                <span className="sm:hidden">Generate</span> ({keywords.length})
              </button>
            )}
          </div>
        </div>
        
        {/* IMPORT SOURCES */}
        <div className="space-y-2">
          <span className="text-[10px] sm:text-xs text-zinc-500 uppercase tracking-wider block">Import from:</span>
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {IMPORT_SOURCES.map(source => (
              <button
                key={source.id}
                onClick={() => handleImport(source.id)}
                className={cn("flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg border text-[10px] sm:text-xs font-medium transition-all", source.color)}
              >
                <source.icon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span className="hidden xs:inline">{source.label}</span>
                <span className="xs:hidden">{source.label.split(" ")[0]}</span>
              </button>
            ))}
            <button
              onClick={() => setShowManualInput(!showManualInput)}
              className={cn(
                "flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg border text-[10px] sm:text-xs font-medium transition-all",
                showManualInput 
                  ? "bg-orange-500 text-white border-orange-500"
                  : "bg-transparent text-zinc-600 dark:text-zinc-400 border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-600"
              )}
            >
              <Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span className="hidden xs:inline">Add Manual</span>
              <span className="xs:hidden">Manual</span>
            </button>
          </div>
        </div>
        
        {/* MANUAL INPUT */}
        {showManualInput && (
          <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 sm:p-4">
            <div className="flex items-start justify-between mb-2 sm:mb-3 gap-2">
              <div className="min-w-0">
                <h3 className="text-xs sm:text-sm font-medium text-zinc-900 dark:text-white">Add Keywords Manually</h3>
                <p className="text-[10px] sm:text-xs text-zinc-500 mt-0.5 line-clamp-2 sm:line-clamp-none">One keyword per line. For bulk: keyword[TAB]volume[TAB]kd[TAB]cpc</p>
              </div>
              <button onClick={() => setShowManualInput(false)} className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white shrink-0">
                <X className="w-4 h-4" />
              </button>
            </div>
            <textarea
              value={manualText}
              onChange={e => setManualText(e.target.value)}
              placeholder="seo tools&#10;keyword research&#10;backlink checker"
              className="w-full h-20 sm:h-24 bg-transparent border border-zinc-300 dark:border-zinc-700 rounded-lg px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:border-orange-500/50 resize-none"
            />
            <div className="flex justify-end mt-2 sm:mt-3">
              <button
                onClick={handleAddManual}
                disabled={!manualText.trim()}
                className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-xs sm:text-sm font-medium disabled:opacity-50"
              >
                <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                Add Keywords
              </button>
            </div>
          </div>
        )}
        
        {/* TOOLBAR */}
        <div className="flex flex-col gap-2 sm:gap-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
            <div className="relative flex-1 sm:max-w-md">
              <Search className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-zinc-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search keywords..."
                className="w-full bg-transparent border border-zinc-300 dark:border-zinc-800 rounded-lg pl-8 sm:pl-9 pr-3 sm:pr-4 py-1.5 sm:py-2 text-xs sm:text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:border-orange-500/50"
              />
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={cn(
                  "flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg border text-xs sm:text-sm transition-all",
                  showFilters
                    ? "bg-orange-500/10 text-orange-500 border-orange-500/30"
                    : "bg-transparent text-zinc-600 dark:text-zinc-400 border-zinc-300 dark:border-zinc-800 hover:border-zinc-400"
                )}
              >
                <Filter className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden xs:inline">Filters</span>
                {showFilters ? <ChevronUp className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> : <ChevronDown className="w-2.5 h-2.5 sm:w-3 sm:h-3" />}
              </button>

              {selectedCount > 0 && (
                <button
                  onClick={() => handleBulkRefresh(selectedCount)}
                  className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg border bg-orange-50 dark:bg-orange-900/10 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800 hover:bg-orange-100 dark:hover:bg-orange-900/20 transition-all text-xs sm:text-sm font-medium"
                  title={`Update metrics for ${selectedCount} selected keywords`}
                >
                  <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Refresh Selected</span> ({selectedCount})
                </button>
              )}
              
              <div className="relative">
                <button
                  onClick={() => setShowColumnMenu(!showColumnMenu)}
                  className={cn(
                    "flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg border text-xs sm:text-sm transition-all",
                    showColumnMenu
                      ? "bg-orange-500/10 text-orange-500 border-orange-500/30"
                      : "bg-transparent text-zinc-600 dark:text-zinc-400 border-zinc-300 dark:border-zinc-800 hover:border-zinc-400"
                  )}
                >
                  <Layout className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="hidden xs:inline">Columns</span>
                </button>
                
                {showColumnMenu && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl p-2 z-50">
                    <div className="text-xs font-medium text-zinc-500 px-2 py-1 mb-1">Toggle Columns</div>
                    {[
                  { id: "trafficPotential", label: "Traffic Potential" },
                  { id: "clicks", label: "Clicks" },
                  { id: "position", label: "Position" },
                  { id: "kd", label: "Keyword Difficulty" },
                  { id: "cpc", label: "CPC" },
                  { id: "intent", label: "Intent" },
                  { id: "serpFeatures", label: "SERP Features" },
                  { id: "trend", label: "Trend" },
                  { id: "parentTopic", label: "Parent Topic" },
                ].map(col => (
                  <button
                    key={col.id}
                    onClick={() => toggleColumn(col.id)}
                    className="flex items-center justify-between w-full px-2 py-1.5 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg"
                  >
                    <span>{col.label}</span>
                    {columnVisibility[col.id as keyof typeof columnVisibility] && (
                      <CheckSquare className="w-3.5 h-3.5 text-orange-500" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
            </div>
          </div>


          
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-[10px] sm:text-xs text-zinc-500">
            <span><strong className="text-zinc-900 dark:text-white">{keywords.length}</strong> total</span>
            <span><strong className="text-zinc-900 dark:text-white">{filteredKeywords.length}</strong> shown</span>
            <span><strong className="text-orange-500">{selectedCount}</strong> selected</span>
          </div>
          
          {keywords.length > 0 && (
            <button onClick={handleClearAll} className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 sm:py-2 text-[10px] sm:text-xs text-zinc-500 hover:text-red-500 transition-colors">
              <Trash2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span className="hidden xs:inline">Clear All</span>
              <span className="xs:hidden">Clear</span>
            </button>
          )}
        </div>
        
        {/* FILTERS */}
        {showFilters && (
          <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 sm:p-4 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-4">
            <div>
              <label className="text-[10px] sm:text-xs text-zinc-500 mb-1 sm:mb-1.5 block">Volume</label>
              <div className="flex items-center gap-0.5 sm:gap-1">
                <input type="number" value={volumeMin} onChange={e => setVolumeMin(e.target.value)} placeholder="Min"
                  className="w-full bg-transparent border border-zinc-300 dark:border-zinc-700 rounded px-1.5 sm:px-2 py-1 sm:py-1.5 text-[10px] sm:text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-orange-500/50" />
                <span className="text-zinc-400 text-[10px]">-</span>
                <input type="number" value={volumeMax} onChange={e => setVolumeMax(e.target.value)} placeholder="Max"
                  className="w-full bg-transparent border border-zinc-300 dark:border-zinc-700 rounded px-1.5 sm:px-2 py-1 sm:py-1.5 text-[10px] sm:text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-orange-500/50" />
              </div>
            </div>
            
            <div>
              <label className="text-[10px] sm:text-xs text-zinc-500 mb-1 sm:mb-1.5 block">KD</label>
              <div className="flex items-center gap-0.5 sm:gap-1">
                <input type="number" value={kdMin} onChange={e => setKdMin(e.target.value)} placeholder="Min"
                  className="w-full bg-transparent border border-zinc-300 dark:border-zinc-700 rounded px-1.5 sm:px-2 py-1 sm:py-1.5 text-[10px] sm:text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-orange-500/50" />
                <span className="text-zinc-400 text-[10px]">-</span>
                <input type="number" value={kdMax} onChange={e => setKdMax(e.target.value)} placeholder="Max"
                  className="w-full bg-transparent border border-zinc-300 dark:border-zinc-700 rounded px-1.5 sm:px-2 py-1 sm:py-1.5 text-[10px] sm:text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-orange-500/50" />
              </div>
            </div>
            
            <div>
              <label className="text-[10px] sm:text-xs text-zinc-500 mb-1 sm:mb-1.5 block">Intent</label>
              <select value={intentFilter} onChange={e => setIntentFilter(e.target.value)}
                className="w-full bg-transparent border border-zinc-300 dark:border-zinc-700 rounded px-1.5 sm:px-2 py-1 sm:py-1.5 text-[10px] sm:text-xs text-zinc-900 dark:text-white focus:outline-none">
                <option value="all">All</option>
                <option value="informational">Info</option>
                <option value="transactional">Trans</option>
                <option value="commercial">Comm</option>
                <option value="navigational">Nav</option>
              </select>
            </div>
            
            <div>
              <label className="text-[10px] sm:text-xs text-zinc-500 mb-1 sm:mb-1.5 block">Source</label>
              <select value={sourceFilter} onChange={e => setSourceFilter(e.target.value)}
                className="w-full bg-transparent border border-zinc-300 dark:border-zinc-700 rounded px-1.5 sm:px-2 py-1 sm:py-1.5 text-[10px] sm:text-xs text-zinc-900 dark:text-white focus:outline-none">
                <option value="all">All</option>
                {uniqueSources.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            
            <div>
              <label className="text-[10px] sm:text-xs text-zinc-500 mb-1 sm:mb-1.5 block">SERP</label>
              <select value={serpFilter} onChange={e => setSerpFilter(e.target.value)}
                className="w-full bg-transparent border border-zinc-300 dark:border-zinc-700 rounded px-1.5 sm:px-2 py-1 sm:py-1.5 text-[10px] sm:text-xs text-zinc-900 dark:text-white focus:outline-none">
                <option value="all">All</option>
                <option value="featured_snippet">Featured</option>
                <option value="paa">PAA</option>
                <option value="video">Video</option>
                <option value="images">Images</option>
              </select>
            </div>
            
            <div>
              <label className="text-[10px] sm:text-xs text-zinc-500 mb-1 sm:mb-1.5 flex items-center gap-1">
                Sort By
                <span className="text-orange-500" title="Quick sort option">⚡</span>
              </label>
              <select 
                value={sortField} 
                onChange={e => { setSortField(e.target.value as SortField); setSortDirection("desc") }}
                className="w-full bg-transparent border border-zinc-300 dark:border-zinc-700 rounded px-1.5 sm:px-2 py-1 sm:py-1.5 text-[10px] sm:text-xs text-zinc-900 dark:text-white focus:outline-none"
              >
                <option value="volume">Volume</option>
                <option value="kd">KD</option>
                <option value="cpc">CPC</option>
                <option value="priorityScore">🔥 Priority</option>
                <option value="source">Source</option>
                <option value="lastUpdated">Updated</option>
              </select>
            </div>
            
            <div className="flex items-end col-span-2 md:col-span-1">
              <button onClick={() => { setVolumeMin(""); setVolumeMax(""); setKdMin(""); setKdMax(""); setIntentFilter("all"); setSourceFilter("all"); setSerpFilter("all"); setSortField("volume"); setSortDirection("desc") }}
                className="text-[10px] sm:text-xs text-zinc-500 hover:text-orange-500 transition-colors">
                Clear Filters
              </button>
            </div>
          </div>
        )}
        
        {/* TABLE - Desktop */}
        <div className="hidden md:block border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30">
                  <th className="w-10 px-3 py-3">
                    <button onClick={handleSelectAll} className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white">
                      {filteredKeywords.length > 0 && filteredKeywords.every(k => k.isSelected) 
                        ? <CheckSquare className="w-4 h-4 text-orange-500" />
                        : <Square className="w-4 h-4" />}
                    </button>
                  </th>
                  <th className="text-left px-3 py-3 min-w-[200px]">
                    <button onClick={() => handleSort("keyword")} className="flex items-center gap-1 text-xs font-medium text-zinc-500 uppercase tracking-wider hover:text-zinc-900 dark:hover:text-white group" title="The search term or phrase that users type into Google">
                      Keyword <SortIcon field="keyword" />
                    </button>
                  </th>
                  <th className="text-right px-3 py-3">
                    <button onClick={() => handleSort("volume")} className="flex items-center gap-1 text-xs font-medium text-zinc-500 uppercase tracking-wider hover:text-zinc-900 dark:hover:text-white ml-auto" title="Average monthly searches for this keyword. Higher = more potential traffic">
                      Volume <SortIcon field="volume" />
                    </button>
                  </th>
                  <th className="text-right px-3 py-3 hidden lg:table-cell">
                    <button onClick={() => handleSort("cpc")} className="flex items-center gap-1 text-xs font-medium text-zinc-500 uppercase tracking-wider hover:text-zinc-900 dark:hover:text-white ml-auto" title="Cost Per Click - How much advertisers pay per click. Higher CPC = Higher monetization potential for AdSense/Affiliate">
                      CPC <SortIcon field="cpc" />
                    </button>
                  </th>
                  <th className="text-right px-3 py-3">
                    <button onClick={() => handleSort("kd")} className="flex items-center gap-1 text-xs font-medium text-zinc-500 uppercase tracking-wider hover:text-zinc-900 dark:hover:text-white ml-auto" title="Keyword Difficulty (0-100). Lower = Easier to rank. Below 30 is ideal for new blogs">
                      KD <SortIcon field="kd" />
                    </button>
                  </th>
                  <th className="text-center px-3 py-3 hidden xl:table-cell">
                    <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider cursor-help" title="Search Intent: INFO=Blog post, COMM=Comparison/Review, TRAN=Product page, NAVI=Brand search">Intent</span>
                  </th>
                  <th className="text-center px-3 py-3 hidden xl:table-cell">
                    <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider cursor-help" title="SERP Features present for this keyword: Video, Featured Snippet, Images, Shopping, PAA, Local Pack, etc.">SERP</span>
                  </th>
                  <th className="text-center px-3 py-3 hidden lg:table-cell">
                    <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider cursor-help" title="Search volume trend over time. ↑ Growing topic, ↓ Declining interest, — Stable">Trend</span>
                  </th>
                  <th className="text-center px-3 py-3 hidden lg:table-cell">
                    <button onClick={() => handleSort("source")} className="flex items-center gap-1 text-xs font-medium text-zinc-500 uppercase tracking-wider hover:text-zinc-900 dark:hover:text-white mx-auto" title="Where this keyword was discovered: Competitor Gap, Content Decay, Keyword Magic, Rank Tracker, Trend Spotter, or Manual">
                      Source <SortIcon field="source" />
                    </button>
                  </th>
                  <th className="text-center px-3 py-3 w-[100px]">
                    <button onClick={() => handleSort("lastUpdated")} className="flex items-center gap-1 text-xs font-medium text-zinc-500 uppercase tracking-wider hover:text-zinc-900 dark:hover:text-white mx-auto" title="When metrics were last updated. Click refresh icon to get fresh data (uses 1 credit)">
                      Refresh <SortIcon field="lastUpdated" />
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredKeywords.length === 0 ? (
                  <tr>
                    <td colSpan={12} className="text-center py-16">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-14 h-14 rounded-full bg-zinc-100 dark:bg-zinc-800/50 flex items-center justify-center">
                          <Upload className="w-6 h-6 text-zinc-400" />
                        </div>
                        <div>
                          <h3 className="text-zinc-900 dark:text-white font-medium mb-1">No keywords yet</h3>
                          <p className="text-zinc-500 text-sm">Import keywords from the sources above or add them manually</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredKeywords.map(kw => (
                    <tr key={kw.id} className={cn(
                      "border-b border-zinc-100 dark:border-zinc-800/50 transition-colors",
                      kw.isSelected ? "bg-orange-50 dark:bg-orange-500/5" : "hover:bg-zinc-50 dark:hover:bg-zinc-800/30"
                    )}>
                      <td className="px-3 py-2.5">
                        <button onClick={() => handleSelectOne(kw.id)} className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white">
                          {kw.isSelected ? <CheckSquare className="w-4 h-4 text-orange-500" /> : <Square className="w-4 h-4" />}
                        </button>
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-zinc-900 dark:text-white text-sm font-medium" title="The search term users type into Google">{kw.keyword}</span>
                          <InlinePositionBadge position={kw.position ?? null} change={kw.positionChange ?? null} />
                          <StatusBadge keyword={kw} />
                          {kw.hasFeaturedSnippet && (
                            <span title="Featured Snippet Opportunity - You can steal this!" className="text-yellow-500">
                              <Zap className="w-3.5 h-3.5" />
                            </span>
                          )}
                          {kw.rankingUrl && (
                            <a href={kw.rankingUrl} title={`Currently ranking: ${kw.rankingUrl}`} className="text-blue-500 hover:text-blue-600">
                              <Link2 className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-right" title="Monthly search volume">
                        <span className="text-zinc-900 dark:text-white text-sm font-medium">
                          {kw.volume !== null ? kw.volume.toLocaleString() : "—"}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-right hidden lg:table-cell" title={kw.cpc ? `$${kw.cpc.toFixed(2)} per click - ${kw.cpc >= 3 ? 'High' : kw.cpc >= 1 ? 'Medium' : 'Low'} monetization potential` : 'CPC data not available'}>
                        <span className="text-zinc-600 dark:text-zinc-400 text-sm">
                          {kw.cpc !== null ? `$${kw.cpc.toFixed(2)}` : "—"}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-right" title={kw.kd !== null ? `KD ${kw.kd}% - ${kw.kd <= 30 ? 'Easy to rank! Great for new blogs' : kw.kd <= 60 ? 'Moderate difficulty - needs good content & some backlinks' : 'Hard to rank - established sites only'}` : 'KD not available'}>
                        {kw.kd !== null ? (
                          <span className={cn(
                            "inline-flex px-2 py-0.5 rounded text-xs font-medium",
                            kw.kd <= 30 ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" :
                            kw.kd <= 60 ? "bg-amber-500/15 text-amber-600 dark:text-amber-400" :
                            "bg-red-500/15 text-red-600 dark:text-red-400"
                          )}>
                            {kw.kd}%
                          </span>
                        ) : <span className="text-zinc-400">—</span>}
                      </td>
                      <td className="px-3 py-2.5 text-center hidden xl:table-cell" title={kw.intent ? INTENT_CONFIG[kw.intent].label + ' - ' + (kw.intent === 'informational' ? 'Write a blog post/guide' : kw.intent === 'transactional' ? 'Create product/service page' : kw.intent === 'commercial' ? 'Write comparison/review' : 'Create brand-focused page') : 'Intent not detected'}>
                        {kw.intent ? (
                          <span className={cn("inline-flex px-2 py-0.5 rounded text-[10px] uppercase font-medium border", INTENT_CONFIG[kw.intent].color)}>
                            {INTENT_CONFIG[kw.intent].short}
                          </span>
                        ) : <span className="text-zinc-400">—</span>}
                      </td>
                      <td className="px-3 py-2.5 text-center hidden xl:table-cell"><SerpFeatureIcons features={kw.serpFeatures} /></td>
                      <td className="px-3 py-2.5 text-center hidden lg:table-cell" title={kw.trend ? `${kw.trend === 'up' ? 'Growing trend' : kw.trend === 'down' ? 'Declining interest' : 'Stable'} ${kw.trendPercent ? `(${kw.trendPercent > 0 ? '+' : ''}${kw.trendPercent}%)` : ''}` : 'Trend data not available'}>
                        <TrendBadge trend={kw.trend} percent={kw.trendPercent} />
                      </td>
                      <td className="px-3 py-2.5 text-center hidden lg:table-cell">
                        <SourceBadge source={kw.source} sourceTag={kw.sourceTag} />
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <div className="flex flex-col items-center gap-1">
                          {kw.isRefreshing ? (
                            <RefreshCw className="w-4 h-4 text-orange-500 animate-spin" />
                          ) : (
                            <>
                              {kw.lastUpdated && new Date().getTime() - kw.lastUpdated.getTime() < 3000 ? (
                                <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 animate-in fade-in zoom-in duration-300">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span className="text-[10px] font-medium">Just now</span>
                                </div>
                              ) : (
                                <div className="group relative">
                                  <button 
                                    onClick={() => handleRefresh(kw.id)}
                                    className="p-1.5 text-zinc-400 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors"
                                  >
                                    <RefreshCw className="w-3.5 h-3.5" />
                                  </button>
                                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-2 py-1 bg-zinc-900 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                    Last: {kw.lastUpdated ? kw.lastUpdated.toLocaleDateString() : "Never"}
                                  </div>
                                </div>
                              )}
                              {kw.lastUpdated && new Date().getTime() - kw.lastUpdated.getTime() >= 3000 && (
                                <span className={cn(
                                  "text-[10px]",
                                  (new Date().getTime() - kw.lastUpdated.getTime()) > 30 * 24 * 60 * 60 * 1000 
                                    ? "text-red-500 font-medium" 
                                    : "text-zinc-400"
                                )}>
                                  {getRelativeTime(kw.lastUpdated)}
                                </span>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* MOBILE CARDS VIEW */}
        <div className="md:hidden space-y-2">
          {filteredKeywords.length === 0 ? (
            <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800/50 flex items-center justify-center mx-auto mb-3">
                <Upload className="w-5 h-5 text-zinc-400" />
              </div>
              <h3 className="text-zinc-900 dark:text-white font-medium text-sm mb-1">No keywords yet</h3>
              <p className="text-zinc-500 text-xs">Import keywords from sources above</p>
            </div>
          ) : (
            filteredKeywords.map(kw => (
              <div
                key={kw.id}
                className={cn(
                  "border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 transition-colors",
                  kw.isSelected ? "bg-orange-50 dark:bg-orange-500/5 border-orange-200 dark:border-orange-800" : ""
                )}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-start gap-2 min-w-0 flex-1">
                    <button
                      onClick={() => handleSelectOne(kw.id)}
                      className="mt-0.5 text-zinc-400 hover:text-zinc-900 dark:hover:text-white shrink-0"
                    >
                      {kw.isSelected ? <CheckSquare className="w-4 h-4 text-orange-500" /> : <Square className="w-4 h-4" />}
                    </button>
                    <div className="min-w-0">
                      <h4 className="text-sm font-medium text-zinc-900 dark:text-white truncate">{kw.keyword}</h4>
                      <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                        <InlinePositionBadge position={kw.position ?? null} change={kw.positionChange ?? null} />
                        <StatusBadge keyword={kw} />
                        {kw.intent && (
                          <span className={cn("inline-flex px-1.5 py-0.5 rounded text-[9px] uppercase font-medium border", INTENT_CONFIG[kw.intent].color)}>
                            {INTENT_CONFIG[kw.intent].short}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {kw.isRefreshing ? (
                      <RefreshCw className="w-3.5 h-3.5 text-orange-500 animate-spin" />
                    ) : (
                      <button
                        onClick={() => handleRefresh(kw.id)}
                        className="p-1 text-zinc-400 hover:text-orange-500 transition-colors"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-lg p-1.5">
                    <div className="text-[10px] text-zinc-500 uppercase">Vol</div>
                    <div className="text-xs font-semibold text-zinc-900 dark:text-white">
                      {kw.volume !== null ? kw.volume.toLocaleString() : "—"}
                    </div>
                  </div>
                  <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-lg p-1.5">
                    <div className="text-[10px] text-zinc-500 uppercase">KD</div>
                    <div className={cn(
                      "text-xs font-semibold",
                      kw.kd !== null
                        ? kw.kd <= 30 ? "text-emerald-600 dark:text-emerald-400"
                          : kw.kd <= 60 ? "text-amber-600 dark:text-amber-400"
                          : "text-red-600 dark:text-red-400"
                        : "text-zinc-400"
                    )}>
                      {kw.kd !== null ? `${kw.kd}%` : "—"}
                    </div>
                  </div>
                  <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-lg p-1.5">
                    <div className="text-[10px] text-zinc-500 uppercase">CPC</div>
                    <div className="text-xs font-semibold text-zinc-900 dark:text-white">
                      {kw.cpc !== null ? `$${kw.cpc.toFixed(2)}` : "—"}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                  <SourceBadge source={kw.source} sourceTag={kw.sourceTag} />
                  <TrendBadge trend={kw.trend} percent={kw.trendPercent} />
                </div>
              </div>
            ))
          )}
        </div>
        
        {/* FOOTER */}
        {keywords.length > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 sm:px-4 py-2 sm:py-3 gap-2">
            <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-[10px] sm:text-sm">
              <div title="Sum of all monthly search volumes">
                <span className="text-zinc-500">Total: </span>
                <span className="text-zinc-900 dark:text-white font-medium">
                  {keywords.reduce((acc, k) => acc + (k.volume ?? 0), 0).toLocaleString()}
                </span>
              </div>
              <div title="Average keyword difficulty - Lower is easier to rank">
                <span className="text-zinc-500">Avg KD: </span>
                <span className="text-zinc-900 dark:text-white font-medium">
                  {Math.round(keywords.filter(k => k.kd !== null).reduce((acc, k) => acc + (k.kd ?? 0), 0) / keywords.filter(k => k.kd !== null).length || 0)}%
                </span>
              </div>
              <div title="Average cost per click - Higher = better monetization">
                <span className="text-zinc-500">Avg CPC: </span>
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                  ${(keywords.filter(k => k.cpc !== null).reduce((acc, k) => acc + (k.cpc ?? 0), 0) / keywords.filter(k => k.cpc !== null).length || 0).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        )}
        
      </div>

      {/* CREDIT MODAL */}
      {showCreditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl w-full max-w-md p-4 sm:p-6 relative animate-in fade-in zoom-in duration-200">
            <button 
              onClick={() => setShowCreditModal(false)}
              className="absolute top-3 sm:top-4 right-3 sm:right-4 text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex flex-col items-center text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mb-3 sm:mb-4">
                <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500 fill-amber-500" />
              </div>
              
              <h3 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-white mb-2">
                You've used all credits
              </h3>
              
              <p className="text-sm sm:text-base text-zinc-500 dark:text-zinc-400 mb-4 sm:mb-6">
                Top up credits for real-time metrics.
              </p>
              
              <div className="w-full space-y-2 sm:space-y-3">
                <button className="w-full flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-800 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/20 transition-colors group">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 bg-orange-100 dark:bg-orange-800 rounded-full flex items-center justify-center">
                      <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div className="text-left">
                      <div className="text-sm sm:text-base font-medium text-zinc-900 dark:text-white">1,000 Credits</div>
                      <div className="text-[10px] sm:text-xs text-zinc-500">Best for small updates</div>
                    </div>
                  </div>
                  <span className="text-sm sm:text-base font-bold text-orange-600 dark:text-orange-400">$5.00</span>
                </button>
                
                <button className="w-full flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 bg-zinc-200 dark:bg-zinc-700 rounded-full flex items-center justify-center">
                      <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-zinc-600 dark:text-zinc-400" />
                    </div>
                    <div className="text-left">
                      <div className="text-sm sm:text-base font-medium text-zinc-900 dark:text-white">5,000 Credits</div>
                      <div className="text-[10px] sm:text-xs text-zinc-500">Best for bulk analysis</div>
                    </div>
                  </div>
                  <span className="text-sm sm:text-base font-bold text-zinc-900 dark:text-white">$20.00</span>
                </button>
              </div>
              
              <p className="text-xs text-zinc-400 mt-4">
                Credits never expire. Secure payment via Stripe.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
