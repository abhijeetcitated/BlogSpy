"use client"

import { useState, useMemo, Fragment, useEffect } from "react"
import { useRouter } from "next/navigation"
import { 
  Upload, Trash2, Search, Filter, ArrowUpDown, ArrowUp, ArrowDown,
  Sparkles, Plus, X, ChevronDown, ChevronUp, ChevronRight,
  TrendingUp, TrendingDown, Minus, CheckSquare, Square, Check,
  Wand2, BarChart3, Target, Scissors, Flame,
  Video, MessageSquare, Star, ShoppingCart, Image, Map,
  ExternalLink, Link2, Eye, MousePointer, Zap, Layers, DollarSign, MousePointer2, RefreshCw, CheckCircle2, Clock,
  FileText, HelpCircle, ImageIcon, Globe, FolderPlus, Folder, MoreHorizontal, Edit3, Copy
} from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { STACK_SPACING, PAGE_PADDING } from "@/src/styles"

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

// Project Interface
interface Project {
  id: string
  name: string
  description: string
  keywordCount: number
  totalVolume: number
  avgKd: number
  status: "draft" | "clustered" | "archived"
  createdAt: Date
  updatedAt: Date
  color: string
}

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
  // Sort states moved to filter section
  const [showFilters, setShowFilters] = useState(false)
  const [showManualInput, setShowManualInput] = useState(false)
  const [manualText, setManualText] = useState("")
  
  // Import Modal State
  const [showImportModal, setShowImportModal] = useState(false)
  const [pendingImportKeywords, setPendingImportKeywords] = useState<Keyword[]>([])
  const [importStep, setImportStep] = useState<"choose" | "create" | "select">("choose")
  const [newProjectName, setNewProjectName] = useState("")
  const [newProjectDescription, setNewProjectDescription] = useState("")
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  
  // Projects State
  const [projects, setProjects] = useState<Project[]>([
    {
      id: "proj_1",
      name: "SEO Tools Content",
      description: "All keywords related to SEO tools and software",
      keywordCount: 24,
      totalVolume: 45000,
      avgKd: 42,
      status: "clustered",
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      color: "purple"
    },
    {
      id: "proj_2", 
      name: "AI Writing Tools",
      description: "Keywords for AI content generation",
      keywordCount: 18,
      totalVolume: 32000,
      avgKd: 38,
      status: "draft",
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      color: "blue"
    }
  ])
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null)
  
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

  // Check for keywords exported from Keyword Explorer
  useEffect(() => {
    const exportedData = localStorage.getItem('keyword-explorer-export')
    const exportTime = localStorage.getItem('keyword-explorer-export-time')
    
    if (exportedData && exportTime) {
      const exportDate = new Date(exportTime)
      const now = new Date()
      const diffMinutes = (now.getTime() - exportDate.getTime()) / (1000 * 60)
      
      // Only import if export is recent (within 5 minutes)
      if (diffMinutes < 5) {
        try {
          const parsed = JSON.parse(exportedData)
          const trends: Keyword["trend"][] = ["up", "down", "stable"]
          
          // Map short intent codes to full intent strings
          const intentMap: Record<string, Keyword["intent"]> = {
            'C': 'commercial',
            'I': 'informational',
            'T': 'transactional',
            'N': 'navigational',
            'commercial': 'commercial',
            'informational': 'informational',
            'transactional': 'transactional',
            'navigational': 'navigational',
          }
          
          const importedKeywords: Keyword[] = parsed.map((k: { 
            keyword: string; 
            volume?: number; 
            difficulty?: number; 
            cpc?: number; 
            intent?: string | string[];
            geoScore?: number;
            serpFeatures?: string[];
          }) => {
            const volume = k.volume || Math.floor(Math.random() * 5000) + 100
            const clickRate = Math.random() * 0.4 + 0.15
            const calculatedClicks = Math.floor(volume * clickRate)
            
            // Parse intent - handle array or string format
            let parsedIntent: Keyword["intent"] = null
            if (k.intent) {
              if (Array.isArray(k.intent) && k.intent.length > 0) {
                parsedIntent = intentMap[k.intent[0]] || null
              } else if (typeof k.intent === 'string') {
                parsedIntent = intentMap[k.intent] || null
              }
            }
            
            return {
              id: Math.random().toString(36).substring(2, 9),
              keyword: k.keyword,
              source: "Keyword Explorer",
              sourceTag: "Imported",
              isSelected: false,
              volume: volume,
              kd: k.difficulty || Math.floor(Math.random() * 80) + 10,
              cpc: k.cpc || Math.random() * 5,
              intent: parsedIntent,
              trend: trends[Math.floor(Math.random() * 3)],
              trendPercent: Math.floor(Math.random() * 30) - 10,
              trafficPotential: Math.floor(volume * 1.2),
              clicks: calculatedClicks,
              cps: calculatedClicks / volume,
              businessPotential: 0 as BusinessPotential,
              position: null,
              positionChange: null,
              rankingUrl: null,
              serpFeatures: (k.serpFeatures || []) as SerpFeature[],
              hasFeaturedSnippet: false,
              parentTopic: null,
              wordCount: k.keyword.split(" ").length,
              competition: null,
              results: null,
              lastUpdated: new Date(),
            }
          })
          
          // Store keywords and show import modal
          setPendingImportKeywords(importedKeywords)
          setShowImportModal(true)
          
          // Clear localStorage after reading
          localStorage.removeItem('keyword-explorer-export')
          localStorage.removeItem('keyword-explorer-export-time')
        } catch (error) {
          console.error('Failed to parse exported keywords:', error)
          toast.error('Failed to import keywords')
        }
      } else {
        // Clear old export data
        localStorage.removeItem('keyword-explorer-export')
        localStorage.removeItem('keyword-explorer-export-time')
      }
    }
  }, [])

  // Handle import confirmation
  const handleConfirmImport = () => {
    if (importStep === "create" && newProjectName.trim()) {
      // Create new project
      const newProject: Project = {
        id: `proj_${Date.now()}`,
        name: newProjectName.trim(),
        description: newProjectDescription.trim(),
        keywordCount: pendingImportKeywords.length,
        totalVolume: pendingImportKeywords.reduce((acc, k) => acc + (k.volume || 0), 0),
        avgKd: pendingImportKeywords.length > 0 
          ? Math.round(pendingImportKeywords.reduce((acc, k) => acc + (k.kd || 0), 0) / pendingImportKeywords.length) 
          : 0,
        status: "draft",
        createdAt: new Date(),
        updatedAt: new Date(),
        color: ["purple", "blue", "emerald", "amber", "pink", "cyan"][Math.floor(Math.random() * 6)]
      }
      setProjects(prev => [...prev, newProject])
      
      if (pendingImportKeywords.length > 0) {
        setKeywords(prev => [...prev, ...pendingImportKeywords])
        toast.success(`Created project "${newProject.name}" with ${pendingImportKeywords.length} keywords`, {
          description: "Keywords are ready for clustering"
        })
      } else {
        toast.success(`Created project "${newProject.name}"`, {
          description: "Add keywords to start clustering"
        })
      }
      setActiveProjectId(newProject.id)
    } else if (importStep === "select" && selectedProjectId) {
      // Add to existing project
      const project = projects.find(p => p.id === selectedProjectId)
      if (project) {
        setProjects(prev => prev.map(p => 
          p.id === selectedProjectId 
            ? {
                ...p,
                keywordCount: p.keywordCount + pendingImportKeywords.length,
                totalVolume: p.totalVolume + pendingImportKeywords.reduce((acc, k) => acc + (k.volume || 0), 0),
                updatedAt: new Date()
              }
            : p
        ))
        setKeywords(prev => [...prev, ...pendingImportKeywords])
        setActiveProjectId(selectedProjectId)
        toast.success(`Added ${pendingImportKeywords.length} keywords to "${project.name}"`, {
          description: "Keywords are ready for clustering"
        })
      }
    }
    
    // Reset modal state
    setPendingImportKeywords([])
    setShowImportModal(false)
    setImportStep("choose")
    setNewProjectName("")
    setNewProjectDescription("")
    setSelectedProjectId(null)
  }

  // Handle import cancel
  const handleCancelImport = () => {
    setPendingImportKeywords([])
    setShowImportModal(false)
    setImportStep("choose")
    setNewProjectName("")
    setNewProjectDescription("")
    setSelectedProjectId(null)
  }
  
  // Filters
  const [volumeMin, setVolumeMin] = useState("")
  const [volumeMax, setVolumeMax] = useState("")
  const [kdMin, setKdMin] = useState("")
  const [kdMax, setKdMax] = useState("")
  const [intentFilters, setIntentFilters] = useState<string[]>([])
  const [sourceFilters, setSourceFilters] = useState<string[]>([])
  const [serpFilters, setSerpFilters] = useState<string[]>([])
  const [sortField, setSortFieldState] = useState<SortField>("volume")
  const [sortDirection, setSortDirectionState] = useState<SortDirection>("desc")
  
  // Temp states for pending filter selections (before Apply)
  const [tempVolumeMin, setTempVolumeMin] = useState("")
  const [tempVolumeMax, setTempVolumeMax] = useState("")
  const [tempKdMin, setTempKdMin] = useState("")
  const [tempKdMax, setTempKdMax] = useState("")
  const [tempIntentFilters, setTempIntentFilters] = useState<string[]>([])
  const [tempSourceFilters, setTempSourceFilters] = useState<string[]>([])
  const [tempSerpFilters, setTempSerpFilters] = useState<string[]>([])
  const [tempSortField, setTempSortField] = useState<SortField>("volume")
  const [tempSortDirection, setTempSortDirection] = useState<SortDirection>("desc")
  
  // Filter popover open states
  const [volumeOpen, setVolumeOpen] = useState(false)
  const [kdOpen, setKdOpen] = useState(false)
  const [intentOpen, setIntentOpen] = useState(false)
  const [sourceOpen, setSourceOpen] = useState(false)
  const [serpOpen, setSerpOpen] = useState(false)
  const [sortOpen, setSortOpen] = useState(false)
  
  // Predefined sources (features that can import keywords)
  const KEYWORD_SOURCES = [
    { id: "keyword-magic", label: "Keyword Magic", Icon: Wand2, color: "text-purple-500" },
    { id: "competitor-gap", label: "Competitor Gap", Icon: Target, color: "text-red-500" },
    { id: "content-roadmap", label: "Content Roadmap", Icon: Layers, color: "text-blue-500" },
    { id: "rank-tracker", label: "Rank Tracker", Icon: TrendingUp, color: "text-emerald-500" },
    { id: "snippet-stealer", label: "Snippet Stealer", Icon: Scissors, color: "text-amber-500" },
    { id: "trend-spotter", label: "Trend Spotter", Icon: Zap, color: "text-yellow-500" },
  ]
  
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



  const updateBusinessPotential = (id: string, value: BusinessPotential) => {
    setKeywords(prev => prev.map(k => k.id === id ? { ...k, businessPotential: value } : k))
  }
  
  // Sorting
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirectionState(prev => prev === "asc" ? "desc" : "asc")
    } else {
      setSortFieldState(field)
      setSortDirectionState("desc")
    }
  }
  
  // Sync temp states when popover opens
  const syncTempVolume = () => { setTempVolumeMin(volumeMin); setTempVolumeMax(volumeMax) }
  const syncTempKd = () => { setTempKdMin(kdMin); setTempKdMax(kdMax) }
  const syncTempIntent = () => { setTempIntentFilters([...intentFilters]) }
  const syncTempSource = () => { setTempSourceFilters([...sourceFilters]) }
  const syncTempSerp = () => { setTempSerpFilters([...serpFilters]) }
  const syncTempSort = () => { setTempSortField(sortField); setTempSortDirection(sortDirection) }
  
  // Apply handlers
  const applyVolumeFilter = () => { setVolumeMin(tempVolumeMin); setVolumeMax(tempVolumeMax); setVolumeOpen(false) }
  const applyKdFilter = () => { setKdMin(tempKdMin); setKdMax(tempKdMax); setKdOpen(false) }
  const applyIntentFilter = () => { setIntentFilters([...tempIntentFilters]); setIntentOpen(false) }
  const applySourceFilter = () => { setSourceFilters([...tempSourceFilters]); setSourceOpen(false) }
  const applySerpFilter = () => { setSerpFilters([...tempSerpFilters]); setSerpOpen(false) }
  const applySortFilter = () => { setSortFieldState(tempSortField); setSortDirectionState(tempSortDirection); setSortOpen(false) }
  
  // Toggle helpers for multi-select
  const toggleTempIntent = (value: string) => {
    setTempIntentFilters(prev => prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value])
  }
  const toggleTempSource = (value: string) => {
    setTempSourceFilters(prev => prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value])
  }
  const toggleTempSerp = (value: string) => {
    setTempSerpFilters(prev => prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value])
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
    if (intentFilters.length > 0) result = result.filter(k => k.intent && intentFilters.includes(k.intent))
    if (sourceFilters.length > 0) result = result.filter(k => sourceFilters.some(sf => k.source.toLowerCase().includes(sf.toLowerCase())))
    if (serpFilters.length > 0) result = result.filter(k => k.serpFeatures.some(f => serpFilters.includes(f)))
    
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
  }, [keywords, searchQuery, volumeMin, volumeMax, kdMin, kdMax, intentFilters, sourceFilters, serpFilters, sortField, sortDirection])
  
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
          if (!config) return null
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
    "Keyword Explorer": { bg: "bg-indigo-100 dark:bg-indigo-900/30", text: "text-indigo-600 dark:text-indigo-400", tooltip: "Imported from Keyword Explorer - Researched keywords" },
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
            sourceTag === "Imported" ? "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400" :
            "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
          )} title={
            sourceTag === "Missing" ? "You have no content for this - Create new!" :
            sourceTag === "Weak" ? "Your ranking is weak (11-50) - Improve content" :
            sourceTag === "Traffic Loss" ? "Lost traffic recently - Needs update" :
            sourceTag === "Breakout" ? "Trending up rapidly - Quick win!" :
            sourceTag === "Imported" ? "Imported from Keyword Explorer" :
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
    <div className="min-h-full transition-colors">
      <div className={`max-w-[1800px] mx-auto ${STACK_SPACING.default} ${PAGE_PADDING.default}`}>
        
        {/* Credit Badge Row */}
        <div className="flex items-center justify-between gap-3">
          {/* Left: Credit Badge */}
          <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 px-3 py-2 rounded-lg sm:rounded-full shrink-0">
            <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span className="text-sm font-medium text-amber-700 dark:text-amber-400">{credits} Credits</span>
            <button onClick={() => setShowCreditModal(true)} className="ml-1 p-0.5 hover:bg-amber-100 dark:hover:bg-amber-800 rounded-full transition-colors" title="Buy Credits">
              <Plus className="w-3 h-3 text-amber-600 dark:text-amber-400" />
            </button>
          </div>
        </div>
        
        {/* Action Buttons Row */}
        {(selectedCount > 0 || keywords.length >= 5) && (
          <div className="flex items-center justify-between sm:justify-end gap-3">
            {/* Delete button - left on mobile, next to Generate on desktop */}
            {selectedCount > 0 && (
              <button
                onClick={handleDeleteSelected}
                className="flex items-center gap-2 px-4 py-2.5 bg-red-500/10 text-red-500 border border-red-500/30 rounded-lg hover:bg-red-500/20 transition-colors text-sm font-medium min-w-[120px]"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete ({selectedCount})</span>
              </button>
            )}
            
            {/* Generate Clusters button - right on mobile, next to Delete on desktop */}
            {keywords.length >= 5 && (
              <button
                onClick={handleGenerateClusters}
                className="flex items-center gap-2 px-4 py-2.5 bg-linear-to-r from-orange-500 to-amber-500 text-white rounded-lg hover:from-orange-600 hover:to-amber-600 transition-all text-sm font-semibold shadow-lg shadow-orange-500/25"
              >
                <Sparkles className="w-4 h-4" />
                <span>Generate Clusters ({keywords.length})</span>
              </button>
            )}
          </div>
        )}
        
        {/* IMPORT SOURCES */}
        <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-xl p-4 border border-zinc-200 dark:border-zinc-800">
          <span className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-3 block">Import from:</span>
          
          {/* Mobile/Tablet: Grid 2 columns */}
          <div className="grid grid-cols-2 gap-2 md:hidden">
            {IMPORT_SOURCES.map(source => (
              <button
                key={source.id}
                onClick={() => handleImport(source.id)}
                className={cn("flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border text-xs font-medium transition-all shadow-sm hover:shadow", source.color)}
              >
                <source.icon className="w-4 h-4" />
                <span>{source.label.split(" ")[0]}</span>
              </button>
            ))}
            <button
              onClick={() => setShowManualInput(!showManualInput)}
              className={cn(
                "flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border text-xs font-medium transition-all shadow-sm hover:shadow",
                showManualInput 
                  ? "bg-orange-500 text-white border-orange-500"
                  : "bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-300 dark:border-zinc-700 hover:border-orange-400 dark:hover:border-orange-600"
              )}
            >
              <Plus className="w-4 h-4" />
              <span>Manual</span>
            </button>
          </div>
          
          {/* Desktop: Horizontal scroll */}
          <div className="hidden md:block overflow-x-auto pb-1 scrollbar-hide -mx-1 px-1">
            <div className="flex items-center gap-2.5 min-w-max">
              {IMPORT_SOURCES.map(source => (
                <button
                  key={source.id}
                  onClick={() => handleImport(source.id)}
                  className={cn("flex items-center gap-2 px-3.5 py-2.5 rounded-lg border text-xs font-medium transition-all whitespace-nowrap shadow-sm hover:shadow", source.color)}
                >
                  <source.icon className="w-4 h-4" />
                  <span>{source.label.split(" ")[0]}</span>
                </button>
              ))}
              <button
                onClick={() => setShowManualInput(!showManualInput)}
                className={cn(
                  "flex items-center gap-2 px-3.5 py-2.5 rounded-lg border text-xs font-medium transition-all whitespace-nowrap shadow-sm hover:shadow",
                  showManualInput 
                    ? "bg-orange-500 text-white border-orange-500"
                    : "bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-300 dark:border-zinc-700 hover:border-orange-400 dark:hover:border-orange-600"
                )}
              >
                <Plus className="w-4 h-4" />
                <span>Manual</span>
              </button>
            </div>
          </div>
        </div>
        
        {/* MANUAL INPUT */}
        {showManualInput && (
          <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 bg-white dark:bg-zinc-900/50">
            <div className="flex items-start justify-between mb-3 gap-2">
              <div className="min-w-0">
                <h3 className="text-sm font-medium text-zinc-900 dark:text-white">Add Keywords Manually</h3>
                <p className="text-xs text-zinc-500 mt-1">One keyword per line. For bulk: keyword[TAB]volume[TAB]kd[TAB]cpc</p>
              </div>
              <button onClick={() => setShowManualInput(false)} className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white shrink-0">
                <X className="w-4 h-4" />
              </button>
            </div>
            <textarea
              value={manualText}
              onChange={e => setManualText(e.target.value)}
              placeholder="seo tools&#10;keyword research&#10;backlink checker"
              className="w-full h-24 bg-transparent border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:border-orange-500/50 resize-none"
            />
            <div className="flex justify-end mt-3">
              <button
                onClick={handleAddManual}
                disabled={!manualText.trim()}
                className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
                Add Keywords
              </button>
            </div>
          </div>
        )}
        
        {/* TOOLBAR */}
        <div className="bg-white dark:bg-zinc-900/50 rounded-xl p-4 border border-zinc-200 dark:border-zinc-800 space-y-4">
          {/* Search Row */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search keywords..."
                className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-lg pl-10 pr-4 py-2.5 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:border-orange-500/50 focus:bg-white dark:focus:bg-zinc-800"
              />
            </div>
            
            {/* Filter toggle & Refresh */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-all",
                  showFilters
                    ? "bg-orange-500/10 text-orange-500 border-orange-500/30"
                    : "bg-zinc-50 dark:bg-zinc-800/50 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:border-orange-400"
                )}
              >
                <Filter className="w-4 h-4" />
                <span>Filters</span>
                {showFilters ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>

              {/* Refresh Selected */}
              {selectedCount > 0 && (
                <button
                  onClick={() => handleBulkRefresh(selectedCount)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg border bg-orange-50 dark:bg-orange-900/10 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800 hover:bg-orange-100 dark:hover:bg-orange-900/20 transition-all text-sm font-medium"
                  title={`Update metrics for ${selectedCount} selected keywords`}
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Refresh ({selectedCount})</span>
                </button>
              )}
            </div>
          </div>
          
          {/* Stats Row */}
          <div className="flex items-center gap-4 text-sm text-zinc-500 px-1">
            <span><strong className="text-zinc-900 dark:text-white">{keywords.length}</strong> total</span>
            <span>•</span>
            <span><strong className="text-zinc-900 dark:text-white">{filteredKeywords.length}</strong> shown</span>
            <span>•</span>
            <span><strong className="text-orange-500">{selectedCount}</strong> selected</span>
          </div>
          
          {/* FILTERS - Inside toolbar card */}
          {showFilters && (
            <div className="pt-3 border-t border-zinc-200 dark:border-zinc-700">
              <div className="overflow-x-auto pb-1 scrollbar-hide -mx-1 px-1">
                <div className="flex items-center gap-2 min-w-max">
                  {/* Volume Filter */}
                  <Popover open={volumeOpen} onOpenChange={(open) => { setVolumeOpen(open); if (open) syncTempVolume(); }}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className={cn(
                          "h-9 gap-1.5 bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 text-sm px-3",
                          (volumeMin || volumeMax) && "border-orange-500/50 bg-orange-500/5"
                        )}
                      >
                        <BarChart3 className="h-4 w-4 text-orange-400" />
                        Vol
                        {(volumeMin || volumeMax) && (
                          <span className="ml-1 h-5 px-1.5 bg-orange-500/20 text-orange-500 rounded text-xs flex items-center">1</span>
                        )}
                        <ChevronDown className="h-3.5 w-3.5" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[280px] p-3" align="start">
                      <div className="space-y-3">
                        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Presets</div>
                        <div className="flex flex-wrap gap-1.5">
                          {[
                            { label: "0-100", min: "0", max: "100" },
                            { label: "100-1K", min: "100", max: "1000" },
                            { label: "1K-10K", min: "1000", max: "10000" },
                            { label: "10K+", min: "10000", max: "" },
                          ].map(preset => (
                            <button
                              key={preset.label}
                              onClick={() => { setTempVolumeMin(preset.min); setTempVolumeMax(preset.max); }}
                              className={cn(
                                "px-2.5 py-1 rounded text-xs font-medium transition-colors",
                                tempVolumeMin === preset.min && tempVolumeMax === preset.max
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted/50 text-muted-foreground hover:bg-muted"
                              )}
                            >
                              {preset.label}
                            </button>
                          ))}
                        </div>
                        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider pt-2">Custom Range</div>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={tempVolumeMin}
                            onChange={e => setTempVolumeMin(e.target.value)}
                            placeholder="From"
                            className="w-full h-8 bg-background border border-input rounded-md px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                          />
                          <span className="text-muted-foreground">—</span>
                          <input
                            type="number"
                            value={tempVolumeMax}
                            onChange={e => setTempVolumeMax(e.target.value)}
                      placeholder="To"
                      className="w-full h-8 bg-background border border-input rounded-md px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                    />
                  </div>
                  <Button onClick={applyVolumeFilter} className="w-full h-8 bg-orange-500 hover:bg-orange-600 text-white">
                    Apply
                  </Button>
                </div>
              </PopoverContent>
            </Popover>

                  {/* KD Filter */}
                  <Popover open={kdOpen} onOpenChange={(open) => { setKdOpen(open); if (open) syncTempKd(); }}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className={cn(
                          "h-9 gap-1.5 bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 text-sm px-3",
                          (kdMin || kdMax) && "border-orange-500/50 bg-orange-500/5"
                        )}
                      >
                        <Target className="h-4 w-4 text-orange-400" />
                        KD
                        {(kdMin || kdMax) && (
                          <span className="ml-1 h-5 px-1.5 bg-orange-500/20 text-orange-500 rounded text-xs flex items-center">1</span>
                        )}
                        <ChevronDown className="h-3.5 w-3.5" />
                      </Button>
                    </PopoverTrigger>
              <PopoverContent className="w-[280px] p-3" align="start">
                <div className="space-y-3">
                  <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Difficulty Levels</div>
                  <div className="space-y-1">
                    {[
                      { label: "Easy", range: "0-30", min: "0", max: "30", color: "bg-emerald-500" },
                      { label: "Medium", range: "31-60", min: "31", max: "60", color: "bg-amber-500" },
                      { label: "Hard", range: "61-100", min: "61", max: "100", color: "bg-red-500" },
                    ].map(level => (
                      <button
                        key={level.label}
                        onClick={() => { setTempKdMin(level.min); setTempKdMax(level.max); }}
                        className={cn(
                          "w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm transition-colors hover:bg-muted/50",
                          tempKdMin === level.min && tempKdMax === level.max && "bg-muted/50"
                        )}
                      >
                        <span className={cn("w-2.5 h-2.5 rounded-full", level.color)} />
                        <span className="flex-1 text-left">{level.label}</span>
                        <span className="text-xs text-muted-foreground">{level.range}</span>
                      </button>
                    ))}
                  </div>
                  <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider pt-2">Custom Range</div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={tempKdMin}
                      onChange={e => setTempKdMin(e.target.value)}
                      placeholder="Min"
                      className="w-full h-8 bg-background border border-input rounded-md px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                    />
                    <span className="text-muted-foreground">—</span>
                    <input
                      type="number"
                      value={tempKdMax}
                      onChange={e => setTempKdMax(e.target.value)}
                      placeholder="Max"
                      className="w-full h-8 bg-background border border-input rounded-md px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                    />
                  </div>
                  <Button onClick={applyKdFilter} className="w-full h-8 bg-orange-500 hover:bg-orange-600 text-white">
                    Apply
                  </Button>
                </div>
              </PopoverContent>
            </Popover>

                  {/* Intent Filter - Multi-select with checkboxes */}
                  <Popover open={intentOpen} onOpenChange={(open) => { setIntentOpen(open); if (open) syncTempIntent(); }}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className={cn(
                          "h-9 gap-1.5 bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 text-sm px-3",
                          intentFilters.length > 0 && "border-orange-500/50 bg-orange-500/5"
                        )}
                      >
                        <MousePointer className="h-4 w-4 text-orange-400" />
                        Intent
                        {intentFilters.length > 0 && (
                          <span className="ml-1 h-5 px-1.5 bg-orange-500/20 text-orange-500 rounded text-xs flex items-center">{intentFilters.length}</span>
                        )}
                        <ChevronDown className="h-3.5 w-3.5" />
                      </Button>
                    </PopoverTrigger>
              <PopoverContent className="w-[240px] p-3" align="start">
                <div className="space-y-2">
                  {[
                    { value: "informational", label: "Informational", short: "INFO", color: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30" },
                    { value: "commercial", label: "Commercial", short: "COMM", color: "bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30" },
                    { value: "transactional", label: "Transactional", short: "TRAN", color: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30" },
                    { value: "navigational", label: "Navigational", short: "NAVI", color: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30" },
                  ].map(intent => (
                    <button
                      key={intent.value}
                      onClick={() => toggleTempIntent(intent.value)}
                      className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm transition-colors hover:bg-muted/50"
                    >
                      <div className={cn(
                        "h-4 w-4 rounded border flex items-center justify-center transition-colors",
                        tempIntentFilters.includes(intent.value) 
                          ? "bg-orange-500 border-orange-500" 
                          : "border-input"
                      )}>
                        {tempIntentFilters.includes(intent.value) && <Check className="h-3 w-3 text-white" />}
                      </div>
                      <span className={cn("px-2 py-0.5 rounded text-[10px] font-medium border", intent.color)}>
                        {intent.short}
                      </span>
                      <span className="flex-1 text-left">{intent.label}</span>
                    </button>
                  ))}
                  <Button onClick={applyIntentFilter} className="w-full h-8 mt-2 bg-orange-500 hover:bg-orange-600 text-white">
                    Apply
                  </Button>
                </div>
              </PopoverContent>
            </Popover>

                  {/* Source Filter - Multi-select with checkboxes and predefined sources */}
                  <Popover open={sourceOpen} onOpenChange={(open) => { setSourceOpen(open); if (open) syncTempSource(); }}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className={cn(
                          "h-9 gap-1.5 bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 text-sm px-3",
                          sourceFilters.length > 0 && "border-orange-500/50 bg-orange-500/5"
                        )}
                      >
                        <Globe className="h-4 w-4 text-orange-400" />
                        Source
                        {sourceFilters.length > 0 && (
                          <span className="ml-1 h-5 px-1.5 bg-orange-500/20 text-orange-500 rounded text-xs flex items-center">{sourceFilters.length}</span>
                        )}
                        <ChevronDown className="h-3.5 w-3.5" />
                      </Button>
                    </PopoverTrigger>
              <PopoverContent className="w-[260px] p-3" align="start">
                <div className="space-y-2">
                  <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Keyword Sources</div>
                  {KEYWORD_SOURCES.map(source => (
                    <button
                      key={source.id}
                      onClick={() => toggleTempSource(source.id)}
                      className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm transition-colors hover:bg-muted/50"
                    >
                      <div className={cn(
                        "h-4 w-4 rounded border flex items-center justify-center transition-colors",
                        tempSourceFilters.includes(source.id) 
                          ? "bg-orange-500 border-orange-500" 
                          : "border-input"
                      )}>
                        {tempSourceFilters.includes(source.id) && <Check className="h-3 w-3 text-white" />}
                      </div>
                      <source.Icon className={cn("h-4 w-4", source.color)} />
                      <span className="flex-1 text-left">{source.label}</span>
                    </button>
                  ))}
                  <Button onClick={applySourceFilter} className="w-full h-8 mt-2 bg-orange-500 hover:bg-orange-600 text-white">
                    Apply
                  </Button>
                </div>
              </PopoverContent>
            </Popover>

                  {/* SERP Filter - Multi-select with checkboxes */}
                  <Popover open={serpOpen} onOpenChange={(open) => { setSerpOpen(open); if (open) syncTempSerp(); }}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className={cn(
                          "h-9 gap-1.5 bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 text-sm px-3",
                          serpFilters.length > 0 && "border-orange-500/50 bg-orange-500/5"
                        )}
                      >
                        <FileText className="h-4 w-4 text-orange-400" />
                        SERP
                        {serpFilters.length > 0 && (
                          <span className="ml-1 h-5 px-1.5 bg-orange-500/20 text-orange-500 rounded text-xs flex items-center">{serpFilters.length}</span>
                        )}
                        <ChevronDown className="h-3.5 w-3.5" />
                      </Button>
                    </PopoverTrigger>
              <PopoverContent className="w-[260px] p-3" align="start">
                <div className="space-y-2">
                  {[
                    { value: "featured_snippet", label: "Featured Snippet", Icon: FileText, color: "text-amber-500" },
                    { value: "paa", label: "People Also Ask", Icon: HelpCircle, color: "text-purple-500" },
                    { value: "video", label: "Video Results", Icon: Video, color: "text-red-500" },
                    { value: "images", label: "Image Pack", Icon: ImageIcon, color: "text-emerald-500" },
                    { value: "shopping", label: "Shopping", Icon: ShoppingCart, color: "text-blue-500" },
                  ].map(serp => (
                    <button
                      key={serp.value}
                      onClick={() => toggleTempSerp(serp.value)}
                      className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm transition-colors hover:bg-muted/50"
                    >
                      <div className={cn(
                        "h-4 w-4 rounded border flex items-center justify-center transition-colors",
                        tempSerpFilters.includes(serp.value) 
                          ? "bg-orange-500 border-orange-500" 
                          : "border-input"
                      )}>
                        {tempSerpFilters.includes(serp.value) && <Check className="h-3 w-3 text-white" />}
                      </div>
                      <serp.Icon className={cn("h-4 w-4", serp.color)} />
                      <span className="flex-1 text-left">{serp.label}</span>
                    </button>
                  ))}
                  <Button onClick={applySerpFilter} className="w-full h-8 mt-2 bg-orange-500 hover:bg-orange-600 text-white">
                    Apply
                  </Button>
                </div>
              </PopoverContent>
            </Popover>

                  {/* Sort By - with Apply */}
                  <Popover open={sortOpen} onOpenChange={(open) => { setSortOpen(open); if (open) syncTempSort(); }}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-9 gap-1.5 bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 text-sm px-3"
                      >
                        <ArrowUpDown className="h-4 w-4 text-orange-400" />
                        Sort
                        <ChevronDown className="h-3.5 w-3.5" />
                      </Button>
                    </PopoverTrigger>
              <PopoverContent className="w-[220px] p-3" align="start">
                <div className="space-y-2">
                  {[
                    { value: "volume", label: "Volume", Icon: BarChart3, color: "text-blue-500" },
                    { value: "kd", label: "Keyword Difficulty", Icon: Target, color: "text-red-500" },
                    { value: "cpc", label: "CPC", Icon: DollarSign, color: "text-emerald-500" },
                    { value: "priorityScore", label: "Priority Score", Icon: Flame, color: "text-orange-500" },
                    { value: "source", label: "Source", Icon: Globe, color: "text-purple-500" },
                    { value: "lastUpdated", label: "Last Updated", Icon: Clock, color: "text-amber-500" },
                  ].map(sort => (
                    <button
                      key={sort.value}
                      onClick={() => { setTempSortField(sort.value as SortField); }}
                      className={cn(
                        "w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm transition-colors hover:bg-muted/50",
                        tempSortField === sort.value && "bg-muted/50"
                      )}
                    >
                      <div className={cn(
                        "h-4 w-4 rounded-full border flex items-center justify-center transition-colors",
                        tempSortField === sort.value 
                          ? "bg-orange-500 border-orange-500" 
                          : "border-input"
                      )}>
                        {tempSortField === sort.value && <div className="h-2 w-2 rounded-full bg-white" />}
                      </div>
                      <sort.Icon className={cn("h-3.5 w-3.5", sort.color)} />
                      <span className="flex-1 text-left">{sort.label}</span>
                    </button>
                  ))}
                  <div className="flex gap-2 pt-2 border-t border-border mt-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setTempSortDirection(tempSortDirection === "asc" ? "desc" : "asc")}
                      className="flex-1 h-8"
                    >
                      {tempSortDirection === "asc" ? <ArrowUp className="h-3.5 w-3.5 mr-1" /> : <ArrowDown className="h-3.5 w-3.5 mr-1" />}
                      {tempSortDirection === "asc" ? "Asc" : "Desc"}
                    </Button>
                  </div>
                  <Button onClick={applySortFilter} className="w-full h-8 bg-orange-500 hover:bg-orange-600 text-white">
                    Apply
                  </Button>
                </div>
              </PopoverContent>
            </Popover>

                  {/* Clear Filters */}
                  {(volumeMin || volumeMax || kdMin || kdMax || intentFilters.length > 0 || sourceFilters.length > 0 || serpFilters.length > 0) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setVolumeMin("")
                        setVolumeMax("")
                        setKdMin("")
                        setKdMax("")
                        setIntentFilters([])
                        setSourceFilters([])
                        setSerpFilters([])
                        setSortFieldState("volume")
                        setSortDirectionState("desc")
                      }}
                      className="h-9 gap-1.5 text-sm text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <X className="h-3.5 w-3.5" />
                      Clear
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* TABLE - Desktop */}
        <div className="hidden md:block border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden bg-white dark:bg-zinc-900/50">
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
        <div className="md:hidden space-y-3">
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
                  "border rounded-xl overflow-hidden transition-all",
                  kw.isSelected 
                    ? "border-orange-400 dark:border-orange-600 bg-linear-to-b from-orange-50 to-white dark:from-orange-950/20 dark:to-zinc-900 shadow-lg shadow-orange-500/10" 
                    : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"
                )}
              >
                {/* Card Header */}
                <div className="p-3 pb-2">
                  <div className="flex items-start gap-3">
                    {/* Checkbox */}
                    <button
                      onClick={() => handleSelectOne(kw.id)}
                      className="mt-1 shrink-0"
                    >
                      {kw.isSelected ? (
                        <div className="w-5 h-5 rounded bg-orange-500 flex items-center justify-center">
                          <Check className="w-3.5 h-3.5 text-white" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded border-2 border-zinc-300 dark:border-zinc-600" />
                      )}
                    </button>
                    
                    {/* Keyword Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-base font-semibold text-zinc-900 dark:text-white leading-tight">{kw.keyword}</h4>
                      <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                        <StatusBadge keyword={kw} />
                        {kw.intent && (
                          <span className={cn("inline-flex px-1.5 py-0.5 rounded text-[10px] uppercase font-bold border", INTENT_CONFIG[kw.intent].color)}>
                            {INTENT_CONFIG[kw.intent].short}
                          </span>
                        )}
                        {kw.hasFeaturedSnippet && (
                          <span title="Featured Snippet Opportunity" className="text-yellow-500">
                            <Zap className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* Refresh Button - Same behavior as desktop */}
                    <div className="shrink-0 flex flex-col items-center">
                      {kw.isRefreshing ? (
                        <div className="w-8 h-8 flex items-center justify-center">
                          <RefreshCw className="w-4 h-4 text-orange-500 animate-spin" />
                        </div>
                      ) : (
                        <>
                          {kw.lastUpdated && new Date().getTime() - kw.lastUpdated.getTime() < 3000 ? (
                            <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 animate-in fade-in zoom-in duration-300 px-2 py-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span className="text-[10px] font-medium">Just now</span>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleRefresh(kw.id)}
                              className="w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors"
                            >
                              <RefreshCw className="w-4 h-4" />
                            </button>
                          )}
                          {kw.lastUpdated && new Date().getTime() - kw.lastUpdated.getTime() >= 3000 && (
                            <span className={cn(
                              "text-[9px] mt-0.5",
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
                  </div>
                </div>
                
                {/* Metrics Grid */}
                <div className="grid grid-cols-3 gap-px bg-zinc-200 dark:bg-zinc-700">
                  {/* Volume */}
                  <div className="bg-zinc-50 dark:bg-zinc-800/80 px-3 py-2.5 text-center">
                    <div className="text-[10px] text-zinc-500 dark:text-zinc-400 uppercase tracking-wider font-medium">VOL</div>
                    <div className="text-sm font-bold text-zinc-900 dark:text-white mt-0.5">
                      {kw.volume !== null ? kw.volume.toLocaleString() : "—"}
                    </div>
                  </div>
                  
                  {/* KD */}
                  <div className="bg-zinc-50 dark:bg-zinc-800/80 px-3 py-2.5 text-center">
                    <div className="text-[10px] text-zinc-500 dark:text-zinc-400 uppercase tracking-wider font-medium">KD</div>
                    <div className={cn(
                      "text-sm font-bold mt-0.5",
                      kw.kd !== null
                        ? kw.kd <= 30 ? "text-emerald-500"
                          : kw.kd <= 60 ? "text-amber-500"
                          : "text-red-500"
                        : "text-zinc-400"
                    )}>
                      {kw.kd !== null ? `${kw.kd}%` : "—"}
                    </div>
                  </div>
                  
                  {/* CPC */}
                  <div className="bg-zinc-50 dark:bg-zinc-800/80 px-3 py-2.5 text-center">
                    <div className="text-[10px] text-zinc-500 dark:text-zinc-400 uppercase tracking-wider font-medium">CPC</div>
                    <div className="text-sm font-bold text-zinc-900 dark:text-white mt-0.5">
                      {kw.cpc !== null ? `$${kw.cpc.toFixed(2)}` : "—"}
                    </div>
                  </div>
                </div>
                
                {/* Card Footer */}
                <div className="px-3 py-2.5 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-800/30">
                  {/* Source with "from:" prefix */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-zinc-400">from:</span>
                    <SourceBadge source={kw.source} sourceTag={kw.sourceTag} />
                  </div>
                  
                  {/* SERP Features - Center */}
                  {kw.serpFeatures && kw.serpFeatures.length > 0 && (
                    <SerpFeatureIcons features={kw.serpFeatures} />
                  )}
                  
                  {/* Trend - Right */}
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

      {/* IMPORT MODAL */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl w-full max-w-lg p-6 relative animate-in fade-in zoom-in duration-200">
            <button 
              onClick={handleCancelImport}
              className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            
            {/* Choose Step */}
            {importStep === "choose" && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FolderPlus className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">
                    Import {pendingImportKeywords.length} Keywords
                  </h3>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    Keywords from Keyword Explorer are ready to import
                  </p>
                </div>
                
                <div className="space-y-3">
                  <button
                    onClick={() => setImportStep("create")}
                    className="w-full flex items-center gap-4 p-4 bg-purple-50 dark:bg-purple-900/10 border-2 border-purple-200 dark:border-purple-800 rounded-xl hover:border-purple-400 dark:hover:border-purple-600 transition-colors text-left"
                  >
                    <div className="w-10 h-10 bg-purple-100 dark:bg-purple-800 rounded-lg flex items-center justify-center shrink-0">
                      <FolderPlus className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <div className="font-semibold text-zinc-900 dark:text-white">Create New Project</div>
                      <div className="text-sm text-zinc-500 dark:text-zinc-400">Start fresh with a new keyword project</div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-zinc-400 ml-auto" />
                  </button>
                  
                  <button
                    onClick={() => setImportStep("select")}
                    disabled={projects.length === 0}
                    className="w-full flex items-center gap-4 p-4 bg-zinc-50 dark:bg-zinc-800/50 border-2 border-zinc-200 dark:border-zinc-700 rounded-xl hover:border-zinc-400 dark:hover:border-zinc-500 transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="w-10 h-10 bg-zinc-100 dark:bg-zinc-700 rounded-lg flex items-center justify-center shrink-0">
                      <Folder className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
                    </div>
                    <div>
                      <div className="font-semibold text-zinc-900 dark:text-white">Add to Existing Project</div>
                      <div className="text-sm text-zinc-500 dark:text-zinc-400">
                        {projects.length > 0 ? `${projects.length} projects available` : 'No projects yet'}
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-zinc-400 ml-auto" />
                  </button>
                </div>
              </div>
            )}
            
            {/* Create Project Step */}
            {importStep === "create" && (
              <div className="space-y-6">
                <div>
                  <button
                    onClick={() => setImportStep("choose")}
                    className="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white mb-4"
                  >
                    <ChevronRight className="w-4 h-4 rotate-180" />
                    Back
                  </button>
                  <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">
                    Create New Project
                  </h3>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    Give your keyword project a name
                  </p>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                      Project Name *
                    </label>
                    <input
                      type="text"
                      value={newProjectName}
                      onChange={(e) => setNewProjectName(e.target.value)}
                      placeholder="e.g., SEO Tools Research"
                      className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-zinc-900 dark:text-white placeholder:text-zinc-400"
                      autoFocus
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                      Description (optional)
                    </label>
                    <textarea
                      value={newProjectDescription}
                      onChange={(e) => setNewProjectDescription(e.target.value)}
                      placeholder="Brief description of this keyword project..."
                      rows={3}
                      className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-zinc-900 dark:text-white placeholder:text-zinc-400 resize-none"
                    />
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={handleCancelImport}
                    className="flex-1 px-4 py-2.5 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmImport}
                    disabled={!newProjectName.trim()}
                    className="flex-1 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Create & Import {pendingImportKeywords.length} Keywords
                  </button>
                </div>
              </div>
            )}
            
            {/* Select Project Step */}
            {importStep === "select" && (
              <div className="space-y-6">
                <div>
                  <button
                    onClick={() => setImportStep("choose")}
                    className="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white mb-4"
                  >
                    <ChevronRight className="w-4 h-4 rotate-180" />
                    Back
                  </button>
                  <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">
                    Select Project
                  </h3>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    Choose a project to add keywords to
                  </p>
                </div>
                
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {projects.map((project) => (
                    <button
                      key={project.id}
                      onClick={() => setSelectedProjectId(project.id)}
                      className={cn(
                        "w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-colors text-left",
                        selectedProjectId === project.id
                          ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
                          : "border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600"
                      )}
                    >
                      <div className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                        project.color === "purple" && "bg-purple-100 dark:bg-purple-800",
                        project.color === "blue" && "bg-blue-100 dark:bg-blue-800",
                        project.color === "emerald" && "bg-emerald-100 dark:bg-emerald-800",
                        project.color === "amber" && "bg-amber-100 dark:bg-amber-800",
                        project.color === "pink" && "bg-pink-100 dark:bg-pink-800",
                        project.color === "cyan" && "bg-cyan-100 dark:bg-cyan-800"
                      )}>
                        <Folder className={cn(
                          "w-5 h-5",
                          project.color === "purple" && "text-purple-600 dark:text-purple-400",
                          project.color === "blue" && "text-blue-600 dark:text-blue-400",
                          project.color === "emerald" && "text-emerald-600 dark:text-emerald-400",
                          project.color === "amber" && "text-amber-600 dark:text-amber-400",
                          project.color === "pink" && "text-pink-600 dark:text-pink-400",
                          project.color === "cyan" && "text-cyan-600 dark:text-cyan-400"
                        )} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-zinc-900 dark:text-white truncate">{project.name}</div>
                        <div className="text-sm text-zinc-500 dark:text-zinc-400">
                          {project.keywordCount} keywords • {project.totalVolume.toLocaleString()} total volume
                        </div>
                      </div>
                      {selectedProjectId === project.id && (
                        <Check className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      )}
                    </button>
                  ))}
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={handleCancelImport}
                    className="flex-1 px-4 py-2.5 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmImport}
                    disabled={!selectedProjectId}
                    className="flex-1 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Add {pendingImportKeywords.length} Keywords
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
