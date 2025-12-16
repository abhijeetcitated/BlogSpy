"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Eye, 
  TrendingUp, 
  Target, 
  Zap,
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Bot,
  Quote,
  Link2,
  Star,
  MessageSquare,
} from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CitationCard } from "./CitationCard"
import { PlatformBreakdown } from "./PlatformBreakdown"
import { VisibilityTrendChart } from "./VisibilityTrendChart"
import { QueryOpportunities } from "./QueryOpportunities"
import { 
  generateCitations, 
  calculateVisibilityStats, 
  getPlatformStats, 
  generateTrendData,
  analyzeQueries,
  getVisibilityTier,
} from "../utils"
import { AI_PLATFORMS, DATE_RANGE_OPTIONS, PlatformIcons } from "../constants"
import type { AIPlatform, AIVisibilityFilters } from "../types"

export function AIVisibilityDashboard() {
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState<AIVisibilityFilters>({
    dateRange: "30d",
    platforms: [],
    citationType: null,
    sortBy: "date",
    sortOrder: "desc",
  })

  const citations = useMemo(() => generateCitations(), [])
  const stats = useMemo(() => calculateVisibilityStats(citations), [citations])
  const platformStats = useMemo(() => getPlatformStats(citations), [citations])
  const trendData = useMemo(() => generateTrendData(), [])
  const queryAnalysis = useMemo(() => analyzeQueries(citations), [citations])

  const filteredCitations = useMemo(() => {
    let filtered = [...citations]
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(c => 
        c.query.toLowerCase().includes(query) ||
        c.citedTitle.toLowerCase().includes(query)
      )
    }

    if (filters.platforms.length > 0) {
      filtered = filtered.filter(c => filters.platforms.includes(c.platform))
    }

    if (filters.citationType) {
      filtered = filtered.filter(c => c.citationType === filters.citationType)
    }

    return filtered
  }, [citations, searchQuery, filters])

  const visibilityTier = getVisibilityTier(stats.visibilityScore)

  const statCards = [
    {
      title: "Total Citations",
      value: stats.totalCitations,
      change: stats.weekOverWeekChange,
      changeLabel: "vs last week",
      icon: Quote,
      color: "text-cyan-400",
      bgColor: "bg-cyan-500/10",
    },
    {
      title: "Visibility Score",
      value: stats.visibilityScore,
      suffix: "/100",
      tier: visibilityTier.label,
      tierColor: visibilityTier.color,
      icon: Eye,
      color: visibilityTier.color,
      bgColor: visibilityTier.bg,
    },
    {
      title: "Avg. Position",
      value: stats.avgPosition,
      description: "In AI responses",
      icon: Target,
      color: "text-amber-400",
      bgColor: "bg-amber-500/10",
    },
    {
      title: "Unique Queries",
      value: stats.uniqueQueries,
      change: stats.competitorComparison,
      changeLabel: "above industry",
      icon: MessageSquare,
      color: "text-purple-400",
      bgColor: "bg-purple-500/10",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
          <Bot className="h-6 w-6 sm:h-7 sm:w-7 text-cyan-400 flex-shrink-0" />
          <span className="truncate">AI Visibility Tracker</span>
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1">
          Track how AI chatbots cite and recommend your content
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
        {statCards.map((stat, index) => (
          <Card key={index} className="bg-card border-border">
            <CardContent className="p-2.5 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-0 sm:items-start sm:justify-between">
                <div className={`p-1.5 sm:p-2 rounded-lg shrink-0 ${stat.bgColor}`}>
                  <stat.icon className={`h-3.5 w-3.5 sm:h-5 sm:w-5 ${stat.color}`} />
                </div>
                <div className="flex-1 sm:hidden min-w-0">
                  <div className="flex items-baseline gap-1">
                    <span className="text-base font-bold text-foreground">
                      {stat.value}
                    </span>
                    {stat.suffix && (
                      <span className="text-[10px] text-muted-foreground">{stat.suffix}</span>
                    )}
                  </div>
                  <p className="text-[10px] text-muted-foreground truncate">{stat.title}</p>
                </div>
                {stat.change !== undefined && (
                  <Badge 
                    variant="outline" 
                    className={`text-[10px] sm:text-xs px-1 sm:px-2 shrink-0 ${stat.change >= 0 
                      ? "text-emerald-400 border-emerald-400/30" 
                      : "text-red-400 border-red-400/30"
                    }`}
                  >
                    <span className="hidden sm:inline-flex items-center">
                      {stat.change >= 0 ? (
                        <ArrowUpRight className="h-3 w-3 mr-0.5" />
                      ) : (
                        <ArrowDownRight className="h-3 w-3 mr-0.5" />
                      )}
                    </span>
                    {stat.change >= 0 ? '+' : ''}{Math.abs(stat.change)}%
                  </Badge>
                )}
                {stat.tier && (
                  <Badge variant="outline" className={`text-[10px] sm:text-xs px-1 sm:px-2 shrink-0 ${stat.tierColor} border-current/30`}>
                    {stat.tier}
                  </Badge>
                )}
              </div>
              <div className="hidden sm:block mt-3">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-foreground">
                    {stat.value}
                  </span>
                  {stat.suffix && (
                    <span className="text-sm text-muted-foreground">{stat.suffix}</span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground truncate">{stat.title}</p>
                {stat.changeLabel && (
                  <p className="text-xs text-muted-foreground mt-1">{stat.changeLabel}</p>
                )}
                {stat.description && (
                  <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
        <div className="lg:col-span-2 order-1 lg:order-1">
          <VisibilityTrendChart data={trendData} />
        </div>
        <div className="order-2 lg:order-2">
          <PlatformBreakdown stats={platformStats} />
        </div>
      </div>

      {/* Filters and Search */}
      <Card className="bg-card border-border">
        <CardContent className="p-3 sm:p-4">
          <div className="flex flex-col lg:flex-row gap-2">
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search queries or content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-background w-full h-9"
              />
            </div>
            <div className="flex flex-row gap-2">
              <Select
                value={filters.dateRange}
                onValueChange={(value) => setFilters(f => ({ ...f, dateRange: value as AIVisibilityFilters['dateRange'] }))}
              >
                <SelectTrigger className="flex-1 lg:w-[130px] bg-background h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DATE_RANGE_OPTIONS.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={filters.platforms.length > 0 ? filters.platforms[0] : "all"}
                onValueChange={(value) => setFilters(f => ({ 
                  ...f, 
                  platforms: value === "all" ? [] : [value as AIPlatform] 
                }))}
              >
                <SelectTrigger className="flex-1 lg:w-[140px] bg-background h-9 text-sm">
                  <SelectValue placeholder="All Platforms" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Platforms</SelectItem>
                  {Object.values(AI_PLATFORMS).map(platform => {
                    const IconRenderer = PlatformIcons[platform.id]
                    return (
                      <SelectItem key={platform.id} value={platform.id}>
                        <span className="flex items-center gap-2">
                          <span className={platform.color}>{IconRenderer && IconRenderer()}</span>
                          {platform.name}
                        </span>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Query Opportunities */}
      <QueryOpportunities queries={queryAnalysis} />

      {/* Citations List */}
      <div>
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h2 className="text-base sm:text-lg font-semibold text-foreground">
            Recent Citations
          </h2>
          <Badge variant="outline" className="text-muted-foreground text-xs sm:text-sm">
            {filteredCitations.length} citations
          </Badge>
        </div>
        <div className="space-y-2 sm:space-y-3">
          {filteredCitations.map((citation) => (
            <CitationCard key={citation.id} citation={citation} />
          ))}
        </div>
      </div>
    </div>
  )
}
