"use client"

import type React from "react"
import { useState, useMemo, useCallback } from "react"
import Link from "next/link"
import {
  TrendingUp,
  TrendingDown,
  Target,
  Users,
  Bell,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  Video,
  FileText,
  ShoppingBag,
  ExternalLink,
  Rocket,
  MessageSquare,
  Plus,
  Loader2,
  CheckCircle2,
  Search,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Sparkline } from "@/components/charts"
import { cn } from "@/lib/utils"

// ============================================
// TYPES
// ============================================
interface RankData {
  id: string
  keyword: string
  rank: number
  previousRank: number
  change: number
  serpFeatures: ("video" | "snippet" | "ad" | "image" | "faq" | "shopping")[]
  volume: number
  url: string
  trendHistory: number[]
  lastUpdated: string
}

type FilterTab = "All" | "Top 3" | "Top 10" | "Top 100" | "Improved" | "Declined"
type SortField = "keyword" | "rank" | "change" | "volume" | null
type SortDirection = "asc" | "desc"

// ============================================
// MOCK DATA - Comprehensive Rank Data
// ============================================
const MOCK_RANK_DATA: RankData[] = [
  {
    id: "1",
    keyword: "best seo software",
    rank: 2,
    previousRank: 6,
    change: 4,
    serpFeatures: ["video", "snippet"],
    volume: 12400,
    url: "/blog/best-seo-tools",
    trendHistory: [15, 12, 10, 8, 6, 5, 4, 3, 2, 2],
    lastUpdated: "2 hours ago",
  },
  {
    id: "2",
    keyword: "ai content writer",
    rank: 5,
    previousRank: 7,
    change: 2,
    serpFeatures: ["snippet", "ad"],
    volume: 8900,
    url: "/tools/ai-writer",
    trendHistory: [12, 10, 9, 8, 7, 6, 6, 5, 5, 5],
    lastUpdated: "1 hour ago",
  },
  {
    id: "3",
    keyword: "keyword research tool",
    rank: 8,
    previousRank: 5,
    change: -3,
    serpFeatures: ["video"],
    volume: 14500,
    url: "/features/keyword-magic",
    trendHistory: [4, 5, 5, 6, 6, 7, 7, 8, 8, 8],
    lastUpdated: "3 hours ago",
  },
  {
    id: "4",
    keyword: "seo rank tracker",
    rank: 1,
    previousRank: 2,
    change: 1,
    serpFeatures: ["snippet", "video", "ad"],
    volume: 6700,
    url: "/features/rank-tracker",
    trendHistory: [8, 6, 5, 4, 3, 2, 2, 2, 1, 1],
    lastUpdated: "30 mins ago",
  },
  {
    id: "5",
    keyword: "competitor analysis",
    rank: 12,
    previousRank: 12,
    change: 0,
    serpFeatures: ["snippet"],
    volume: 9200,
    url: "/features/competitor-gap",
    trendHistory: [12, 13, 12, 11, 12, 12, 12, 12, 12, 12],
    lastUpdated: "4 hours ago",
  },
  {
    id: "6",
    keyword: "content optimization",
    rank: 3,
    previousRank: 8,
    change: 5,
    serpFeatures: ["video", "snippet"],
    volume: 7800,
    url: "/blog/content-optimization",
    trendHistory: [18, 15, 12, 10, 8, 6, 5, 4, 3, 3],
    lastUpdated: "1 hour ago",
  },
  {
    id: "7",
    keyword: "backlink checker",
    rank: 15,
    previousRank: 13,
    change: -2,
    serpFeatures: ["ad"],
    volume: 11300,
    url: "/tools/backlinks",
    trendHistory: [10, 11, 12, 13, 13, 14, 14, 15, 15, 15],
    lastUpdated: "2 hours ago",
  },
  {
    id: "8",
    keyword: "serp analysis tool",
    rank: 7,
    previousRank: 10,
    change: 3,
    serpFeatures: ["snippet"],
    volume: 4500,
    url: "/features/serp-analyzer",
    trendHistory: [14, 12, 11, 10, 9, 8, 8, 7, 7, 7],
    lastUpdated: "5 hours ago",
  },
  {
    id: "9",
    keyword: "on-page seo checker",
    rank: 4,
    previousRank: 9,
    change: 5,
    serpFeatures: ["snippet", "faq"],
    volume: 5600,
    url: "/tools/on-page-checker",
    trendHistory: [20, 16, 14, 12, 10, 8, 6, 5, 4, 4],
    lastUpdated: "1 hour ago",
  },
  {
    id: "10",
    keyword: "content gap analysis",
    rank: 9,
    previousRank: 6,
    change: -3,
    serpFeatures: ["video"],
    volume: 3200,
    url: "/features/content-gap",
    trendHistory: [4, 5, 5, 6, 6, 7, 8, 8, 9, 9],
    lastUpdated: "6 hours ago",
  },
  {
    id: "11",
    keyword: "ai writing assistant",
    rank: 6,
    previousRank: 11,
    change: 5,
    serpFeatures: ["snippet", "ad", "video"],
    volume: 18500,
    url: "/tools/ai-assistant",
    trendHistory: [22, 18, 15, 13, 11, 9, 8, 7, 6, 6],
    lastUpdated: "45 mins ago",
  },
  {
    id: "12",
    keyword: "blog post ideas",
    rank: 18,
    previousRank: 14,
    change: -4,
    serpFeatures: ["faq"],
    volume: 8100,
    url: "/blog/post-ideas",
    trendHistory: [10, 11, 12, 13, 14, 15, 16, 17, 18, 18],
    lastUpdated: "3 hours ago",
  },
  {
    id: "13",
    keyword: "seo content strategy",
    rank: 11,
    previousRank: 15,
    change: 4,
    serpFeatures: ["snippet", "video"],
    volume: 6400,
    url: "/blog/seo-strategy",
    trendHistory: [25, 22, 19, 17, 15, 14, 13, 12, 11, 11],
    lastUpdated: "2 hours ago",
  },
  {
    id: "14",
    keyword: "keyword density checker",
    rank: 22,
    previousRank: 18,
    change: -4,
    serpFeatures: ["snippet"],
    volume: 2800,
    url: "/tools/keyword-density",
    trendHistory: [14, 15, 16, 17, 18, 19, 20, 21, 22, 22],
    lastUpdated: "8 hours ago",
  },
  {
    id: "15",
    keyword: "meta tag generator",
    rank: 2,
    previousRank: 5,
    change: 3,
    serpFeatures: ["snippet", "faq"],
    volume: 4200,
    url: "/tools/meta-generator",
    trendHistory: [12, 10, 8, 7, 6, 5, 4, 3, 2, 2],
    lastUpdated: "1 hour ago",
  },
  {
    id: "16",
    keyword: "domain authority checker",
    rank: 14,
    previousRank: 10,
    change: -4,
    serpFeatures: ["ad"],
    volume: 9800,
    url: "/tools/da-checker",
    trendHistory: [8, 9, 9, 10, 10, 11, 12, 13, 14, 14],
    lastUpdated: "4 hours ago",
  },
  {
    id: "17",
    keyword: "featured snippet optimizer",
    rank: 3,
    previousRank: 7,
    change: 4,
    serpFeatures: ["snippet"],
    volume: 1900,
    url: "/tools/snippet-optimizer",
    trendHistory: [15, 13, 11, 9, 8, 7, 5, 4, 3, 3],
    lastUpdated: "2 hours ago",
  },
  {
    id: "18",
    keyword: "local seo tools",
    rank: 10,
    previousRank: 10,
    change: 0,
    serpFeatures: ["ad", "shopping"],
    volume: 7300,
    url: "/features/local-seo",
    trendHistory: [10, 10, 10, 10, 10, 10, 10, 10, 10, 10],
    lastUpdated: "5 hours ago",
  },
]

const filterTabs: FilterTab[] = ["All", "Top 3", "Top 10", "Top 100", "Improved", "Declined"]

// ============================================
// HELPER COMPONENTS
// ============================================
function RadialProgress({ value, size = 80 }: { value: number; size?: number }) {
  const strokeWidth = 6
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (value / 100) * circumference

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-slate-800"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#visibilityGradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="drop-shadow-[0_0_8px_rgba(34,197,94,0.5)]"
        />
        <defs>
          <linearGradient id="visibilityGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#22c55e" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xl font-bold text-white">{value}%</span>
      </div>
    </div>
  )
}

function RankBadge({ rank }: { rank: number }) {
  const getBadgeStyle = () => {
    if (rank <= 3) {
      return "bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-900 font-bold shadow-[0_0_12px_rgba(251,191,36,0.4)]"
    }
    if (rank <= 10) {
      return "bg-gradient-to-r from-emerald-500 to-green-400 text-slate-900 font-bold"
    }
    return "bg-slate-700 text-slate-300"
  }

  return (
    <span className={`inline-flex items-center justify-center w-10 h-7 rounded-md text-sm ${getBadgeStyle()}`}>
      #{rank}
    </span>
  )
}

function SerpFeatureIcon({ type }: { type: string }) {
  const iconConfig: Record<string, { icon: React.ReactNode; label: string; color: string }> = {
    video: { icon: <Video className="w-3.5 h-3.5" />, label: "Video Result", color: "text-red-400" },
    snippet: { icon: <FileText className="w-3.5 h-3.5" />, label: "Featured Snippet", color: "text-blue-400" },
    ad: { icon: <ShoppingBag className="w-3.5 h-3.5" />, label: "Paid Ad", color: "text-amber-400" },
    image: { icon: <FileText className="w-3.5 h-3.5" />, label: "Image Pack", color: "text-purple-400" },
    faq: { icon: <FileText className="w-3.5 h-3.5" />, label: "FAQ Section", color: "text-cyan-400" },
    shopping: { icon: <ShoppingBag className="w-3.5 h-3.5" />, label: "Shopping Results", color: "text-green-400" },
  }

  const config = iconConfig[type] || iconConfig.snippet

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className={cn("inline-flex items-center justify-center w-5 h-5 rounded bg-slate-800 cursor-default", config.color)}>
          {config.icon}
        </span>
      </TooltipTrigger>
      <TooltipContent side="top" className="text-xs">
        {config.label}
      </TooltipContent>
    </Tooltip>
  )
}

// ============================================
// MAIN COMPONENT
// ============================================
export function RankTrackerContent() {
  // Core states
  const [rankData, setRankData] = useState<RankData[]>(MOCK_RANK_DATA)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState<FilterTab>("All")
  const [sortField, setSortField] = useState<SortField>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")
  
  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [newKeywords, setNewKeywords] = useState("")
  const [isAdding, setIsAdding] = useState(false)
  
  // Alert states
  const [isAlertsEnabled, setIsAlertsEnabled] = useState(false)
  
  // Toast state
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState("")

  // Show toast notification
  const showNotification = useCallback((message: string) => {
    setToastMessage(message)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }, [])

  // Calculate dynamic stats
  const stats = useMemo(() => {
    const totalKeywords = rankData.length
    const top3Count = rankData.filter(k => k.rank <= 3).length
    const top10Count = rankData.filter(k => k.rank <= 10).length
    const improvedCount = rankData.filter(k => k.change > 0).length
    const declinedCount = rankData.filter(k => k.change < 0).length
    
    // Visibility score (weighted by rank position)
    const visibilityScore = Math.round(
      (rankData.reduce((acc, k) => {
        if (k.rank <= 3) return acc + 10
        if (k.rank <= 10) return acc + 5
        if (k.rank <= 20) return acc + 2
        return acc + 1
      }, 0) / (totalKeywords * 10)) * 100
    )
    
    // Average position
    const avgPosition = (rankData.reduce((acc, k) => acc + k.rank, 0) / totalKeywords).toFixed(1)
    
    // Traffic forecast (based on volume and rank)
    const trafficForecast = rankData.reduce((acc, k) => {
      const ctr = k.rank === 1 ? 0.3 : k.rank <= 3 ? 0.15 : k.rank <= 10 ? 0.05 : 0.01
      return acc + Math.round(k.volume * ctr)
    }, 0)
    
    // Alerts count (keywords that entered top 3 today)
    const alertsCount = rankData.filter(k => k.rank <= 3 && k.change > 0).length
    
    return {
      visibilityScore,
      avgPosition,
      trafficForecast,
      alertsCount,
      top3Count,
      top10Count,
      improvedCount,
      declinedCount,
    }
  }, [rankData])

  // Calculate Winners & Losers dynamically
  const winners = useMemo(() => {
    return [...rankData]
      .filter(k => k.change > 0)
      .sort((a, b) => b.change - a.change)
      .slice(0, 3)
      .map(k => ({ keyword: k.keyword, from: k.previousRank, to: k.rank }))
  }, [rankData])

  const losers = useMemo(() => {
    return [...rankData]
      .filter(k => k.change < 0)
      .sort((a, b) => a.change - b.change)
      .slice(0, 3)
      .map(k => ({ keyword: k.keyword, from: k.previousRank, to: k.rank }))
  }, [rankData])

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    // First apply search filter
    let filtered = rankData.filter(item =>
      item.keyword.toLowerCase().includes(searchQuery.toLowerCase())
    )

    // Then apply tab filter
    switch (activeTab) {
      case "Top 3":
        filtered = filtered.filter(k => k.rank <= 3)
        break
      case "Top 10":
        filtered = filtered.filter(k => k.rank <= 10)
        break
      case "Top 100":
        filtered = filtered.filter(k => k.rank <= 100)
        break
      case "Improved":
        filtered = filtered.filter(k => k.change > 0)
        break
      case "Declined":
        filtered = filtered.filter(k => k.change < 0)
        break
    }

    // Then apply sorting
    if (sortField) {
      filtered = [...filtered].sort((a, b) => {
        let comparison = 0
        switch (sortField) {
          case "keyword":
            comparison = a.keyword.localeCompare(b.keyword)
            break
          case "rank":
            comparison = a.rank - b.rank
            break
          case "change":
            comparison = a.change - b.change
            break
          case "volume":
            comparison = a.volume - b.volume
            break
        }
        return sortDirection === "asc" ? comparison : -comparison
      })
    }

    return filtered
  }, [rankData, searchQuery, activeTab, sortField, sortDirection])

  // Handle sorting
  const handleSort = useCallback((field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("desc")
    }
  }, [sortField])

  // Sort icon component
  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-3 w-3 text-slate-600" />
    }
    return sortDirection === "asc" 
      ? <ArrowUp className="h-3 w-3 text-emerald-400" />
      : <ArrowDown className="h-3 w-3 text-emerald-400" />
  }

  // Handle adding keywords
  const handleAddKeywords = useCallback(async () => {
    const keywords = newKeywords
      .split('\n')
      .map(k => k.trim())
      .filter(k => k.length > 0)
    
    if (keywords.length === 0) {
      showNotification("Please enter at least one keyword")
      return
    }

    setIsAdding(true)

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Generate new rank data for added keywords
    const newRankData: RankData[] = keywords.map((keyword, index) => ({
      id: `new-${Date.now()}-${index}`,
      keyword,
      rank: Math.floor(Math.random() * 50) + 10, // Random rank 10-60
      previousRank: Math.floor(Math.random() * 50) + 10,
      change: 0, // New keywords start with no change
      serpFeatures: ["snippet"] as ("snippet")[],
      volume: Math.floor(Math.random() * 10000) + 1000,
      url: `/blog/${keyword.toLowerCase().replace(/\s+/g, '-')}`,
      trendHistory: Array(10).fill(0).map(() => Math.floor(Math.random() * 30) + 20),
      lastUpdated: "Just now",
    }))

    // Calculate change based on generated ranks
    newRankData.forEach(item => {
      item.change = item.previousRank - item.rank
    })

    setRankData(prev => [...newRankData, ...prev])
    setIsAdding(false)
    setNewKeywords("")
    setIsAddModalOpen(false)
    showNotification(`${keywords.length} keyword${keywords.length > 1 ? 's' : ''} added to tracking! 🎯`)
  }, [newKeywords, showNotification])

  // Handle WhatsApp alerts toggle
  const handleAlertsToggle = useCallback(() => {
    const newState = !isAlertsEnabled
    setIsAlertsEnabled(newState)
    
    if (newState) {
      showNotification("WhatsApp Alerts Enabled for +91 98765 43210 📱")
    } else {
      showNotification("WhatsApp Alerts Disabled")
    }
  }, [isAlertsEnabled, showNotification])

  // Format traffic number
  const formatTraffic = (num: number) => {
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`
    return num.toString()
  }

  // Pulse stats data
  const pulseStats = [
    {
      label: "Visibility Score",
      value: stats.visibilityScore,
      type: "radial",
      change: "+2.4%",
      changeLabel: "this week",
      positive: true,
    },
    {
      label: "Average Position",
      value: stats.avgPosition,
      type: "number",
      change: 1.2,
      positive: true,
    },
    {
      label: "Traffic Forecast",
      value: formatTraffic(stats.trafficForecast),
      type: "number",
      subtext: "Visits",
      icon: Users,
    },
    {
      label: "Alerts Today",
      value: stats.alertsCount.toString(),
      type: "alert",
      message: "Keywords entered Top 3",
    },
  ]

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex-1 p-6 space-y-6 overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-white">Rank Tracker</h1>
            <p className="text-sm text-slate-400">Real-time keyword position monitoring</p>
          </div>
          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-lg hover:opacity-90 transition-opacity"
          >
            <Target className="w-4 h-4" />
            Add Keywords
          </Button>
        </div>

        {/* Pulse Header Stats */}
        <div className="grid grid-cols-4 gap-4">
          {pulseStats.map((stat, index) => (
            <div key={index} className="p-4 rounded-xl border border-slate-800 bg-slate-900/50 backdrop-blur-sm">
              <p className="text-xs text-slate-400 mb-3">{stat.label}</p>
              {stat.type === "radial" ? (
                <div className="flex items-center gap-4">
                  <RadialProgress value={stat.value as number} />
                  <div>
                    <span className="text-sm text-emerald-400 font-medium">{stat.change}</span>
                    <p className="text-xs text-slate-500">{stat.changeLabel}</p>
                  </div>
                </div>
              ) : stat.type === "alert" ? (
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-amber-500/20">
                    <Bell className="w-6 h-6 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                    <p className="text-xs text-slate-400">{stat.message}</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  {stat.icon && (
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-slate-800">
                      <stat.icon className="w-5 h-5 text-slate-400" />
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-2xl font-bold text-white">{stat.value}</p>
                      {stat.change !== undefined && (
                        <span
                          className={`flex items-center text-sm font-medium ${
                            stat.positive ? "text-emerald-400" : "text-red-400"
                          }`}
                        >
                          {stat.positive ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />}
                          {Math.abs(stat.change as number)}
                        </span>
                      )}
                    </div>
                    {stat.subtext && <p className="text-xs text-slate-500">{stat.subtext}</p>}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Winners & Losers - Dynamic */}
        <div className="grid grid-cols-2 gap-4">
          {/* Winners */}
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/50">
            <div className="flex items-center gap-2 mb-4">
              <Rocket className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-medium text-white">Biggest Winners</h3>
            </div>
            <div className="space-y-3">
              {winners.length > 0 ? winners.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20"
                >
                  <span className="text-sm text-white font-medium truncate max-w-[150px]">{item.keyword}</span>
                  <div className="flex items-center gap-2 text-emerald-400">
                    <span className="text-xs text-slate-400">#{item.from}</span>
                    <ArrowUp className="w-4 h-4" />
                    <span className="text-sm font-bold">#{item.to}</span>
                  </div>
                </div>
              )) : (
                <p className="text-sm text-slate-500 text-center py-4">No improvements today</p>
              )}
            </div>
          </div>

          {/* Losers */}
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/50">
            <div className="flex items-center gap-2 mb-4">
              <TrendingDown className="w-4 h-4 text-red-400" />
              <h3 className="text-sm font-medium text-white">Biggest Losers</h3>
            </div>
            <div className="space-y-3">
              {losers.length > 0 ? losers.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 rounded-lg bg-red-500/10 border border-red-500/20"
                >
                  <span className="text-sm text-white font-medium truncate max-w-[150px]">{item.keyword}</span>
                  <div className="flex items-center gap-2 text-red-400">
                    <span className="text-xs text-slate-400">#{item.from}</span>
                    <ArrowDown className="w-4 h-4" />
                    <span className="text-sm font-bold">#{item.to}</span>
                  </div>
                </div>
              )) : (
                <p className="text-sm text-slate-500 text-center py-4">No declines today</p>
              )}
            </div>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex items-center justify-between gap-4">
          {/* Filter Tabs */}
          <div className="flex items-center gap-2">
            {filterTabs.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveTab(filter)}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium rounded-lg transition-colors",
                  activeTab === filter 
                    ? "bg-white text-slate-900" 
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                )}
              >
                {filter}
                {filter === "Top 3" && ` (${stats.top3Count})`}
                {filter === "Improved" && ` (${stats.improvedCount})`}
                {filter === "Declined" && ` (${stats.declinedCount})`}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search keywords..."
              className="pl-9 h-8 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Main Ranking Table */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="px-4 py-3 text-left">
                  <button
                    onClick={() => handleSort("keyword")}
                    className="flex items-center gap-1 text-xs font-medium text-slate-400 uppercase tracking-wider hover:text-white transition-colors"
                  >
                    Keyword
                    <SortIcon field="keyword" />
                  </button>
                </th>
                <th className="px-4 py-3 text-center">
                  <button
                    onClick={() => handleSort("rank")}
                    className="flex items-center justify-center gap-1 text-xs font-medium text-slate-400 uppercase tracking-wider hover:text-white transition-colors w-full"
                  >
                    Rank
                    <SortIcon field="rank" />
                  </button>
                </th>
                <th className="px-4 py-3 text-center">
                  <button
                    onClick={() => handleSort("change")}
                    className="flex items-center justify-center gap-1 text-xs font-medium text-slate-400 uppercase tracking-wider hover:text-white transition-colors w-full"
                  >
                    Change (24h)
                    <SortIcon field="change" />
                  </button>
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-slate-400 uppercase tracking-wider">
                  SERP Features
                </th>
                <th className="px-4 py-3 text-right">
                  <button
                    onClick={() => handleSort("volume")}
                    className="flex items-center justify-end gap-1 text-xs font-medium text-slate-400 uppercase tracking-wider hover:text-white transition-colors w-full"
                  >
                    Volume
                    <SortIcon field="volume" />
                  </button>
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-slate-400 uppercase tracking-wider">
                  URL
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">
                  30d Trend
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {filteredAndSortedData.map((row) => (
                <tr key={row.id} className="hover:bg-slate-800/30 transition-colors group">
                  <td className="px-4 py-3">
                    <Link
                      href={`/dashboard/research/overview/${encodeURIComponent(row.keyword)}`}
                      className="text-sm font-semibold text-white hover:text-emerald-400 transition-colors"
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
                          row.change > 0 
                            ? "bg-emerald-500/20 text-emerald-400" 
                            : "bg-red-500/20 text-red-400"
                        )}
                      >
                        {row.change > 0 ? (
                          <TrendingUp className="w-3.5 h-3.5" />
                        ) : (
                          <TrendingDown className="w-3.5 h-3.5" />
                        )}
                        {row.change > 0 ? `+${row.change}` : row.change}
                      </span>
                    ) : (
                      <span className="text-slate-500 text-sm">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      {row.serpFeatures.map((feature, i) => (
                        <SerpFeatureIcon key={i} type={feature} />
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-sm text-slate-300">{row.volume.toLocaleString()}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <a
                          href={row.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex p-1.5 rounded-md hover:bg-slate-700 transition-colors text-slate-400 hover:text-white"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="text-xs">
                        Open {row.url}
                      </TooltipContent>
                    </Tooltip>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end">
                      <Sparkline data={row.trendHistory} width={60} height={24} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Empty State */}
          {filteredAndSortedData.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mb-4">
                <Search className="h-6 w-6 text-slate-500" />
              </div>
              <h3 className="text-sm font-medium text-white">No keywords found</h3>
              <p className="text-xs text-slate-500 mt-1">
                Try adjusting your filters or search query
              </p>
            </div>
          )}
        </div>

        {/* Notification Center */}
        <div className="fixed bottom-6 right-6 z-50">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-slate-700 bg-slate-900/95 backdrop-blur-sm shadow-xl">
            <MessageSquare className={cn("w-5 h-5", isAlertsEnabled ? "text-emerald-400" : "text-slate-400")} />
            <span className="text-sm text-white">Get WhatsApp Alerts for Top 3 rankings</span>
            <button
              onClick={handleAlertsToggle}
              className={cn(
                "relative w-10 h-5 rounded-full transition-colors",
                isAlertsEnabled ? "bg-emerald-500" : "bg-slate-700"
              )}
            >
              <span
                className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all duration-200"
                style={{ left: isAlertsEnabled ? "22px" : "2px" }}
              />
            </button>
            <Bell className={cn("w-4 h-4", isAlertsEnabled ? "text-amber-400" : "text-slate-500")} />
          </div>
        </div>

        {/* Add Keywords Modal */}
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogContent className="sm:max-w-[500px] bg-slate-900 border-slate-800">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-white">
                <Plus className="h-5 w-5 text-emerald-400" />
                Add Keywords to Track
              </DialogTitle>
              <DialogDescription className="text-slate-400">
                Enter keywords to start tracking their rankings. One keyword per line.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <Textarea
                value={newKeywords}
                onChange={(e) => setNewKeywords(e.target.value)}
                placeholder="best seo tools&#10;keyword research guide&#10;content optimization tips&#10;..."
                className="min-h-[160px] bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 resize-none"
              />
              
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>
                  {newKeywords.split('\n').filter(k => k.trim()).length} keywords entered
                </span>
                <span>Max 50 keywords per batch</span>
              </div>
            </div>
            
            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={() => setIsAddModalOpen(false)}
                className="bg-transparent border-slate-700 text-slate-300 hover:bg-slate-800"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddKeywords}
                disabled={isAdding || !newKeywords.trim()}
                className="bg-gradient-to-r from-cyan-500 to-emerald-500 text-white hover:opacity-90"
              >
                {isAdding ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Target className="h-4 w-4 mr-2" />
                    Track Keywords
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Toast Notification */}
        {showToast && (
          <div className="fixed top-6 right-6 z-50 animate-in slide-in-from-top-4 fade-in duration-300">
            <div className="flex items-center gap-3 px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl shadow-xl">
              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              <span className="text-sm text-white">{toastMessage}</span>
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  )
}