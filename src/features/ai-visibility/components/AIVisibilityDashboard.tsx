"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { 
  Shield,
  AlertTriangle,
  DollarSign,
  Settings2,
  Search,
  Bot,
  Info,
  Zap,
  AlertCircle,
  RefreshCw,
} from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { CitationCard } from "./CitationCard"
import { PlatformBreakdown } from "./PlatformBreakdown"
import { VisibilityTrendChart } from "./VisibilityTrendChart"
import { QueryOpportunities } from "./QueryOpportunities"
import { FactPricingGuard } from "./FactPricingGuard"
import { TechAuditWidget } from "./TechAuditWidget"
import { HowItWorksCard } from "./HowItWorksCard"
import type { FullScanResult } from "../services/scan.service"
import { 
  generateCitations, 
  calculateVisibilityStats, 
  getPlatformStats, 
  generateTrendData,
  analyzeQueries,
  calculateTrustMetrics,
} from "../utils"
import { AI_PLATFORMS, DATE_RANGE_OPTIONS, PlatformIcons } from "../constants"
import type { AIPlatform, AIVisibilityFilters, HallucinationRisk, AICitation } from "../types"

// Helper to get risk color
const getRiskColor = (risk: HallucinationRisk) => {
  switch (risk) {
    case 'low': return { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-400/30' }
    case 'medium': return { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-400/30' }
    case 'high': return { text: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-400/30' }
    case 'critical': return { text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-400/30' }
    default: return { text: 'text-muted-foreground', bg: 'bg-muted/10', border: 'border-muted/30' }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// LOADING SKELETON COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════════════════════

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>
      
      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="bg-card border-border">
            <CardContent className="p-4">
              <Skeleton className="h-10 w-10 rounded-lg mb-3" />
              <Skeleton className="h-8 w-20 mb-2" />
              <Skeleton className="h-4 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Charts Row Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <Skeleton className="h-[280px] w-full" />
            </CardContent>
          </Card>
        </div>
        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <Skeleton className="h-[280px] w-full" />
          </CardContent>
        </Card>
      </div>
      
      {/* Citations Skeleton */}
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="bg-card border-border">
            <CardContent className="p-4">
              <Skeleton className="h-24 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// ERROR MESSAGE COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════════════════════

function ErrorMessage({ 
  message, 
  onRetry 
}: { 
  message: string
  onRetry?: () => void 
}) {
  return (
    <Alert variant="destructive" className="my-8">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Error Loading Data</AlertTitle>
      <AlertDescription className="flex items-center justify-between">
        <span>{message}</span>
        {onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry} className="ml-4">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        )}
      </AlertDescription>
    </Alert>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// PROPS INTERFACE
// ═══════════════════════════════════════════════════════════════════════════════════════════════

interface AIVisibilityDashboardProps {
  /** Real citations data - if not provided, uses demo data */
  citations?: AICitation[]
  /** Loading state for real data */
  isLoading?: boolean
  /** Error message if data fetch failed */
  error?: string | null
  /** Retry callback for error state */
  onRetry?: () => void
  /** Is viewing demo/sample data */
  isDemoMode?: boolean
  /** Callback when user clicks action in demo mode */
  onDemoActionClick?: () => void
  /** Handler to trigger a full scan */
  onScan?: () => Promise<void>
  /** Whether a scan is currently in progress */
  isScanning?: boolean
  /** Latest scan result for dynamic stats */
  lastScanResult?: FullScanResult | null
  /** Handler to open Add Keyword modal */
  onAddKeyword?: () => void
}

export function AIVisibilityDashboard({ 
  citations: propCitations,
  isLoading = false,
  error = null,
  onRetry,
  isDemoMode = false,
  onDemoActionClick,
  onScan,
  isScanning = false,
  lastScanResult,
  onAddKeyword,
}: AIVisibilityDashboardProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState<AIVisibilityFilters>({
    dateRange: "30d",
    platforms: [],
    citationType: null,
    sortBy: "date",
    sortOrder: "desc",
  })

  // Use prop citations if provided, otherwise generate demo data
  const citations = useMemo(() => {
    if (propCitations && propCitations.length > 0) {
      return propCitations
    }
    // Fallback to demo data
    return generateCitations()
  }, [propCitations])
  const stats = useMemo(() => calculateVisibilityStats(citations), [citations])
  const platformStats = useMemo(() => getPlatformStats(citations), [citations])
  const trendData = useMemo(() => generateTrendData(), [])
  const queryAnalysis = useMemo(() => analyzeQueries(citations), [citations])
  
  // Calculate trust metrics - use lastScanResult if available for dynamic updates
  const trustMetrics = useMemo(() => {
    if (lastScanResult) {
      // Calculate from real scan result
      return {
        trustScore: lastScanResult.overallScore,
        hallucinationRisk: lastScanResult.overallScore >= 70 ? "low" as const : 
                          lastScanResult.overallScore >= 50 ? "medium" as const : 
                          lastScanResult.overallScore >= 30 ? "high" as const : "critical" as const,
        hallucinationCount: lastScanResult.totalPlatforms - lastScanResult.visiblePlatforms,
        revenueAtRisk: Math.round((100 - lastScanResult.overallScore) * 120), // $120 per % at risk
        aiReadinessScore: lastScanResult.siri.status === "ready" ? 95 : 
                         lastScanResult.siri.status === "at-risk" ? 65 : 35,
        lastChecked: lastScanResult.timestamp,
      }
    }
    return calculateTrustMetrics(citations)
  }, [citations, lastScanResult])

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

  const riskColors = getRiskColor(trustMetrics.hallucinationRisk)

  // NEW: CFO-focused stat cards (Trust Score, Hallucination Risk, Revenue at Risk, AI Readiness)
  const statCards = [
    {
      title: "Trust Score",
      value: trustMetrics.trustScore,
      suffix: "%",
      description: "How accurate AI is about you",
      icon: Shield,
      color: trustMetrics.trustScore >= 80 ? "text-emerald-400" : trustMetrics.trustScore >= 60 ? "text-amber-400" : "text-red-400",
      bgColor: trustMetrics.trustScore >= 80 ? "bg-emerald-500/10" : trustMetrics.trustScore >= 60 ? "bg-amber-500/10" : "bg-red-500/10",
      tooltip: "Calculated as (Correct AI Answers / Total Checks) × 100",
    },
    {
      title: "Hallucination Risk",
      value: trustMetrics.hallucinationRisk.toUpperCase(),
      isStatus: true,
      statusCount: trustMetrics.hallucinationCount,
      description: trustMetrics.hallucinationCount > 0 ? `${trustMetrics.hallucinationCount} issue${trustMetrics.hallucinationCount > 1 ? 's' : ''} detected` : "No issues found",
      icon: AlertTriangle,
      color: riskColors.text,
      bgColor: riskColors.bg,
      tooltip: "AI is giving wrong information about your brand",
    },
    {
      title: "Revenue at Risk",
      value: trustMetrics.revenueAtRisk,
      prefix: "$",
      description: "If AI drops your citations",
      icon: DollarSign,
      color: "text-red-500",
      bgColor: "bg-red-500/15",
      tooltip: "Traffic value × Commercial intent keywords",
      isWarning: true,
    },
    {
      title: "AI Readiness",
      value: trustMetrics.aiReadinessScore,
      suffix: "%",
      description: "Technical optimization score",
      icon: Settings2,
      color: trustMetrics.aiReadinessScore >= 80 ? "text-emerald-400" : trustMetrics.aiReadinessScore >= 60 ? "text-amber-400" : "text-red-400",
      bgColor: trustMetrics.aiReadinessScore >= 80 ? "bg-emerald-500/10" : trustMetrics.aiReadinessScore >= 60 ? "bg-amber-500/10" : "bg-red-500/10",
      tooltip: "robots.txt + llms.txt + Schema markup score",
    },
  ]

  // Show loading skeleton
  if (isLoading) {
    return <DashboardSkeleton />
  }

  // Show error message
  if (error) {
    return <ErrorMessage message={error} onRetry={onRetry} />
  }

  return (
    <div className="space-y-6">
      {/* Header with Credits Badge */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
            <Bot className="h-6 w-6 sm:h-7 sm:w-7 text-cyan-400 shrink-0" />
            <span className="truncate">AI Visibility Tracker</span>
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Track how AI Agents recommend & sell you.
          </p>
        </div>
        {/* Credits Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-linear-to-r from-amber-500/10 to-yellow-500/10 border border-amber-500/20 rounded-lg">
          <Zap className="h-4 w-4 text-amber-400" />
          <span className="text-sm font-medium text-amber-400">500</span>
          <span className="text-xs text-muted-foreground">Credits</span>
        </div>
      </div>

      {/* NEW: CFO Stats Grid - Trust Score, Hallucination Risk, Revenue at Risk, AI Readiness */}
      <TooltipProvider>
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
          {statCards.map((stat, index) => (
            <Card key={index} className="bg-card border-border relative overflow-hidden">
              <CardContent className="p-2.5 sm:p-4">
                <div className="flex items-center gap-2 sm:gap-0 sm:items-start sm:justify-between">
                  <div className={`p-1.5 sm:p-2 rounded-lg shrink-0 ${stat.bgColor}`}>
                    <stat.icon className={`h-3.5 w-3.5 sm:h-5 sm:w-5 ${stat.color}`} />
                  </div>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-5 w-5 absolute top-2 right-2 opacity-50 hover:opacity-100">
                        <Info className="h-3 w-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs max-w-[200px]">{stat.tooltip}</p>
                    </TooltipContent>
                  </Tooltip>
                  <div className="flex-1 sm:hidden min-w-0">
                    <div className="flex items-baseline gap-1">
                      {stat.prefix && <span className={`text-sm ${stat.isWarning ? stat.color : 'text-muted-foreground'}`}>{stat.prefix}</span>}
                      <span className={`text-base font-bold ${stat.isStatus || stat.isWarning ? stat.color : 'text-foreground'}`}>
                        {stat.value}
                      </span>
                      {stat.suffix && <span className="text-[10px] text-muted-foreground">{stat.suffix}</span>}
                    </div>
                    <p className="text-[10px] text-muted-foreground truncate">{stat.title}</p>
                  </div>
                </div>
                <div className="hidden sm:block mt-3">
                  <div className="flex items-baseline gap-1">
                    {stat.prefix && <span className={`text-lg ${stat.isWarning ? stat.color : 'text-muted-foreground'}`}>{stat.prefix}</span>}
                    <span className={`text-2xl font-bold ${stat.isStatus || stat.isWarning ? stat.color : 'text-foreground'}`}>
                      {stat.value}
                    </span>
                    {stat.suffix && <span className="text-sm text-muted-foreground">{stat.suffix}</span>}
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{stat.title}</p>
                  {stat.description && (
                    <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </TooltipProvider>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
        <div className="lg:col-span-2 order-1 lg:order-1 space-y-4">
          <VisibilityTrendChart data={trendData} />
          {/* How It Works - Credit Guide */}
          <HowItWorksCard />
        </div>
        <div className="order-2 lg:order-2">
          <PlatformBreakdown 
            stats={platformStats} 
            isDemoMode={isDemoMode}
            onDemoActionClick={onDemoActionClick}
            onScan={onScan}
            isScanning={isScanning}
          />
        </div>
      </div>

      {/* 🛡️ Fact & Pricing Guard - Hallucination Defense Log (USP) */}
      <FactPricingGuard />

      {/* Query Opportunities */}
      <QueryOpportunities 
        queries={queryAnalysis} 
        isDemoMode={isDemoMode}
        onDemoActionClick={onDemoActionClick}
        onAddKeyword={onAddKeyword}
      />

      {/* Tech Audit Widget - AI Readiness Checker */}
      <TechAuditWidget />

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

        {/* Filters and Search - For Recent Citations */}
        <Card className="bg-card border-border mb-3 sm:mb-4">
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

        <div className="space-y-2 sm:space-y-3">
          {filteredCitations.map((citation) => (
            <CitationCard 
              key={citation.id} 
              citation={citation} 
              isDemoMode={isDemoMode}
              onDemoActionClick={onDemoActionClick}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
