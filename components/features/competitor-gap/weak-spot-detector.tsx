"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { 
  Search, 
  Target, 
  MessageSquare, 
  ExternalLink,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  Zap,
  Trophy,
  TrendingUp,
  Globe,
  FileText,
  Sparkles,
  Filter,
  CheckCircle2
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { KDRing } from "@/components/charts"
import { cn } from "@/lib/utils"

// ============================================
// TYPES
// ============================================
type WeakSpotType = "reddit" | "quora" | "linkedin" | "medium" | "forum"
type Intent = "commercial" | "informational" | "transactional" | "navigational"
type SortField = "volume" | "kd" | "weakSpotRank" | "trafficPotential" | null
type SortDirection = "asc" | "desc"

interface WeakSpotKeyword {
  id: string
  keyword: string
  volume: number
  kd: number
  intent: Intent
  weakSpotType: WeakSpotType
  weakSpotRank: number
  weakSpotUrl: string
  weakSpotTitle: string
  yourRank: number | null
  opportunity: "high" | "medium" | "low"
  trafficPotential: number
}

// ============================================
// MOCK DATA - Reddit/Quora/Forum Rankings
// ============================================
const WEAK_SPOT_DATA: WeakSpotKeyword[] = [
  {
    id: "ws1",
    keyword: "best ai writing tools 2024",
    volume: 12500,
    kd: 18,
    intent: "commercial",
    weakSpotType: "reddit",
    weakSpotRank: 2,
    weakSpotUrl: "https://reddit.com/r/artificial/comments/abc123",
    weakSpotTitle: "What AI writing tools are you guys using? Thread getting outdated",
    yourRank: null,
    opportunity: "high",
    trafficPotential: 8500
  },
  {
    id: "ws2",
    keyword: "chatgpt vs claude for coding",
    volume: 8900,
    kd: 22,
    intent: "informational",
    weakSpotType: "reddit",
    weakSpotRank: 1,
    weakSpotUrl: "https://reddit.com/r/programming/comments/def456",
    weakSpotTitle: "ChatGPT or Claude for coding? Need opinions (6 months old)",
    yourRank: 15,
    opportunity: "high",
    trafficPotential: 6200
  },
  {
    id: "ws3",
    keyword: "how to do keyword research",
    volume: 22000,
    kd: 35,
    intent: "informational",
    weakSpotType: "quora",
    weakSpotRank: 4,
    weakSpotUrl: "https://quora.com/How-do-I-do-keyword-research",
    weakSpotTitle: "How do I do keyword research for my blog? - Generic 2019 answer",
    yourRank: 28,
    opportunity: "medium",
    trafficPotential: 4800
  },
  {
    id: "ws4",
    keyword: "seo tools comparison 2024",
    volume: 6700,
    kd: 28,
    intent: "commercial",
    weakSpotType: "linkedin",
    weakSpotRank: 3,
    weakSpotUrl: "https://linkedin.com/pulse/best-seo-tools-2023",
    weakSpotTitle: "Best SEO Tools 2023 - LinkedIn Pulse Article (Outdated)",
    yourRank: null,
    opportunity: "high",
    trafficPotential: 4200
  },
  {
    id: "ws5",
    keyword: "content marketing strategy examples",
    volume: 14200,
    kd: 32,
    intent: "informational",
    weakSpotType: "medium",
    weakSpotRank: 5,
    weakSpotUrl: "https://medium.com/@marketer/content-strategy",
    weakSpotTitle: "My Content Marketing Strategy - Personal Blog Post",
    yourRank: 12,
    opportunity: "medium",
    trafficPotential: 3500
  },
  {
    id: "ws6",
    keyword: "free seo audit tools",
    volume: 9800,
    kd: 24,
    intent: "transactional",
    weakSpotType: "reddit",
    weakSpotRank: 3,
    weakSpotUrl: "https://reddit.com/r/SEO/comments/ghi789",
    weakSpotTitle: "Best free SEO audit tools? Thread from 2 years ago",
    yourRank: null,
    opportunity: "high",
    trafficPotential: 5800
  },
  {
    id: "ws7",
    keyword: "ai content writing tips",
    volume: 5400,
    kd: 19,
    intent: "informational",
    weakSpotType: "quora",
    weakSpotRank: 2,
    weakSpotUrl: "https://quora.com/What-are-tips-for-AI-content",
    weakSpotTitle: "Tips for using AI to write content - Basic answer",
    yourRank: 22,
    opportunity: "high",
    trafficPotential: 3800
  },
  {
    id: "ws8",
    keyword: "how to rank on google fast",
    volume: 18500,
    kd: 42,
    intent: "informational",
    weakSpotType: "reddit",
    weakSpotRank: 6,
    weakSpotUrl: "https://reddit.com/r/SEO/comments/jkl012",
    weakSpotTitle: "How to rank faster? Outdated advice thread",
    yourRank: 35,
    opportunity: "medium",
    trafficPotential: 2800
  },
  {
    id: "ws9",
    keyword: "jasper ai alternatives",
    volume: 7200,
    kd: 26,
    intent: "commercial",
    weakSpotType: "reddit",
    weakSpotRank: 1,
    weakSpotUrl: "https://reddit.com/r/EntrepreneurRideAlong/mno345",
    weakSpotTitle: "Looking for Jasper alternatives - Thread from last year",
    yourRank: null,
    opportunity: "high",
    trafficPotential: 5100
  },
  {
    id: "ws10",
    keyword: "blog post optimization checklist",
    volume: 4100,
    kd: 21,
    intent: "informational",
    weakSpotType: "medium",
    weakSpotRank: 4,
    weakSpotUrl: "https://medium.com/seo-tips/optimization-checklist",
    weakSpotTitle: "SEO Checklist - Basic Medium article",
    yourRank: 18,
    opportunity: "high",
    trafficPotential: 2900
  },
  {
    id: "ws11",
    keyword: "best blogging platform 2024",
    volume: 15600,
    kd: 31,
    intent: "commercial",
    weakSpotType: "reddit",
    weakSpotRank: 2,
    weakSpotUrl: "https://reddit.com/r/Blogging/comments/pqr678",
    weakSpotTitle: "What platform should I use for blogging? (Old recommendations)",
    yourRank: null,
    opportunity: "high",
    trafficPotential: 9200
  },
  {
    id: "ws12",
    keyword: "email marketing tools comparison",
    volume: 11200,
    kd: 38,
    intent: "commercial",
    weakSpotType: "quora",
    weakSpotRank: 5,
    weakSpotUrl: "https://quora.com/best-email-marketing-tools",
    weakSpotTitle: "What are the best email marketing tools? - 2021 answers",
    yourRank: 42,
    opportunity: "medium",
    trafficPotential: 3100
  }
]

// ============================================
// HELPER FUNCTIONS
// ============================================
const getWeakSpotIcon = (type: WeakSpotType) => {
  switch (type) {
    case "reddit":
      return { icon: MessageSquare, color: "text-orange-400", bg: "bg-orange-500/20" }
    case "quora":
      return { icon: MessageSquare, color: "text-red-400", bg: "bg-red-500/20" }
    case "linkedin":
      return { icon: Globe, color: "text-blue-400", bg: "bg-blue-500/20" }
    case "medium":
      return { icon: FileText, color: "text-emerald-400", bg: "bg-emerald-500/20" }
    case "forum":
      return { icon: MessageSquare, color: "text-purple-400", bg: "bg-purple-500/20" }
    default:
      return { icon: Globe, color: "text-muted-foreground", bg: "bg-muted/20" }
  }
}

const getOpportunityStyle = (opportunity: string) => {
  switch (opportunity) {
    case "high":
      return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
    case "medium":
      return "bg-amber-500/20 text-amber-400 border-amber-500/30"
    case "low":
      return "bg-slate-500/20 text-slate-400 border-slate-500/30"
    default:
      return "bg-slate-500/20 text-slate-400 border-slate-500/30"
  }
}

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

// ============================================
// COMPONENT
// ============================================
export function WeakSpotDetector() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTypes, setSelectedTypes] = useState<WeakSpotType[]>(["reddit", "quora", "linkedin", "medium"])
  const [sortField, setSortField] = useState<SortField>("trafficPotential")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")
  const [addedKeywords, setAddedKeywords] = useState<Set<string>>(new Set())

  // Filter and Sort
  const filteredKeywords = useMemo(() => {
    let filtered = WEAK_SPOT_DATA.filter(kw => {
      // Type filter
      if (!selectedTypes.includes(kw.weakSpotType)) return false
      
      // Search filter
      if (searchQuery.trim()) {
        if (!kw.keyword.toLowerCase().includes(searchQuery.toLowerCase())) return false
      }
      
      return true
    })

    // Sort
    if (sortField) {
      filtered = [...filtered].sort((a, b) => {
        let comparison = 0
        switch (sortField) {
          case "volume":
            comparison = a.volume - b.volume
            break
          case "kd":
            comparison = a.kd - b.kd
            break
          case "weakSpotRank":
            comparison = a.weakSpotRank - b.weakSpotRank
            break
          case "trafficPotential":
            comparison = a.trafficPotential - b.trafficPotential
            break
        }
        return sortDirection === "asc" ? comparison : -comparison
      })
    }

    return filtered
  }, [searchQuery, selectedTypes, sortField, sortDirection])

  // Stats
  const stats = useMemo(() => {
    const highOpportunity = WEAK_SPOT_DATA.filter(k => k.opportunity === "high").length
    const redditCount = WEAK_SPOT_DATA.filter(k => k.weakSpotType === "reddit").length
    const totalPotential = WEAK_SPOT_DATA.reduce((sum, k) => sum + k.trafficPotential, 0)
    return { highOpportunity, redditCount, totalPotential }
  }, [])

  // Toggle type filter
  const toggleType = (type: WeakSpotType) => {
    setSelectedTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    )
  }

  // Handle sort
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("desc")
    }
  }

  // Sort Icon
  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-3 w-3 text-muted-foreground/50" />
    }
    return sortDirection === "asc" 
      ? <ArrowUp className="h-3 w-3 text-cyan-400" />
      : <ArrowDown className="h-3 w-3 text-cyan-400" />
  }

  // Handle write article
  const handleWriteArticle = (kw: WeakSpotKeyword) => {
    setAddedKeywords(prev => new Set([...prev, kw.id]))
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border-emerald-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-emerald-400 uppercase tracking-wider font-medium">High Opportunity</p>
                <p className="text-2xl font-bold text-foreground mt-1">{stats.highOpportunity}</p>
                <p className="text-xs text-muted-foreground">Easy wins available</p>
              </div>
              <div className="p-3 rounded-full bg-emerald-500/20">
                <Trophy className="h-6 w-6 text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500/10 to-orange-500/5 border-orange-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-orange-400 uppercase tracking-wider font-medium">Reddit Threads</p>
                <p className="text-2xl font-bold text-foreground mt-1">{stats.redditCount}</p>
                <p className="text-xs text-muted-foreground">Ranking in Top 10</p>
              </div>
              <div className="p-3 rounded-full bg-orange-500/20">
                <MessageSquare className="h-6 w-6 text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 border-cyan-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-cyan-400 uppercase tracking-wider font-medium">Traffic Potential</p>
                <p className="text-2xl font-bold text-foreground mt-1">{stats.totalPotential.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Monthly visits possible</p>
              </div>
              <div className="p-3 rounded-full bg-cyan-500/20">
                <TrendingUp className="h-6 w-6 text-cyan-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-muted-foreground uppercase tracking-wider">Source:</span>
          {(["reddit", "quora", "linkedin", "medium"] as WeakSpotType[]).map(type => {
            const { icon: Icon, color, bg } = getWeakSpotIcon(type)
            const isActive = selectedTypes.includes(type)
            return (
              <button
                key={type}
                onClick={() => toggleType(type)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                  isActive 
                    ? `${bg} ${color} border border-current/30`
                    : "bg-muted/30 text-muted-foreground hover:bg-muted/50"
                )}
              >
                <Icon className="h-3 w-3" />
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            )
          })}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 bg-secondary/50 border-border"
          />
        </div>
      </div>

      {/* Info Banner */}
      <div className="p-4 rounded-lg bg-gradient-to-r from-cyan-500/10 via-transparent to-purple-500/10 border border-cyan-500/20">
        <div className="flex items-start gap-3">
          <Sparkles className="h-5 w-5 text-cyan-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-foreground">Weak Spot Strategy</p>
            <p className="text-xs text-muted-foreground mt-1">
              These keywords have Reddit threads, Quora answers, or other low-authority content ranking in Top 10. 
              Write a comprehensive article to outrank them easily! Click on the thread title to see what's currently ranking.
            </p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border overflow-hidden bg-card/30">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Keyword
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Weak Spot
                </th>
                <th 
                  className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground"
                  onClick={() => handleSort("weakSpotRank")}
                >
                  <div className="flex items-center justify-center gap-1">
                    Position
                    <SortIcon field="weakSpotRank" />
                  </div>
                </th>
                <th 
                  className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground"
                  onClick={() => handleSort("volume")}
                >
                  <div className="flex items-center justify-end gap-1">
                    Volume
                    <SortIcon field="volume" />
                  </div>
                </th>
                <th 
                  className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground"
                  onClick={() => handleSort("kd")}
                >
                  <div className="flex items-center justify-center gap-1">
                    KD
                    <SortIcon field="kd" />
                  </div>
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Opportunity
                </th>
                <th 
                  className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground"
                  onClick={() => handleSort("trafficPotential")}
                >
                  <div className="flex items-center justify-end gap-1">
                    Traffic Potential
                    <SortIcon field="trafficPotential" />
                  </div>
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredKeywords.map((kw) => {
                const { icon: SourceIcon, color, bg } = getWeakSpotIcon(kw.weakSpotType)
                return (
                  <tr key={kw.id} className="hover:bg-muted/20 transition-colors group">
                    <td className="px-4 py-4">
                      <div className="space-y-1">
                        <Link 
                          href={`/dashboard/research/overview/${encodeURIComponent(kw.keyword)}`}
                          className="text-sm font-medium text-foreground hover:text-cyan-400 transition-colors"
                        >
                          {kw.keyword}
                        </Link>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className={cn("text-[10px] capitalize", getIntentStyle(kw.intent))}
                          >
                            {kw.intent}
                          </Badge>
                          {kw.yourRank && (
                            <span className="text-[10px] text-muted-foreground">
                              Your rank: #{kw.yourRank}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <a 
                        href={kw.weakSpotUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group/link block space-y-1"
                      >
                        <div className="flex items-center gap-2">
                          <div className={cn("p-1 rounded", bg)}>
                            <SourceIcon className={cn("h-3 w-3", color)} />
                          </div>
                          <span className={cn("text-xs font-medium capitalize", color)}>
                            {kw.weakSpotType}
                          </span>
                          <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 group-hover/link:opacity-100 transition-opacity" />
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-1 max-w-[200px] group-hover/link:text-foreground transition-colors">
                          {kw.weakSpotTitle}
                        </p>
                      </a>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className={cn(
                        "inline-flex items-center justify-center w-8 h-6 rounded text-xs font-bold",
                        kw.weakSpotRank <= 3 ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"
                      )}>
                        #{kw.weakSpotRank}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span className="font-mono text-foreground">{kw.volume.toLocaleString()}</span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex justify-center">
                        <KDRing value={kw.kd} />
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <Badge
                        variant="outline"
                        className={cn("text-[10px] capitalize", getOpportunityStyle(kw.opportunity))}
                      >
                        {kw.opportunity}
                      </Badge>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
                        <span className="font-mono text-emerald-400 font-medium">
                          +{kw.trafficPotential.toLocaleString()}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {addedKeywords.has(kw.id) ? (
                        <Button
                          size="sm"
                          disabled
                          className="h-7 px-3 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold text-xs cursor-default"
                        >
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Queued
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          asChild
                          className="h-7 px-3 bg-cyan-500 hover:bg-cyan-600 text-cyan-950 font-semibold text-xs"
                          onClick={() => handleWriteArticle(kw)}
                        >
                          <Link href={`/dashboard/creation/ai-writer?keyword=${encodeURIComponent(kw.keyword)}`}>
                            <Zap className="h-3 w-3 mr-1" />
                            Write Article
                          </Link>
                        </Button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {filteredKeywords.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                <Search className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-sm font-medium text-foreground">No weak spots found</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Try adjusting your filters or search query
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
