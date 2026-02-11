"use client"

import { useState, useMemo, useEffect, useCallback } from "react"
import Link from "next/link"
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
  Printer,
  X,
  CheckCircle2,
  XCircle,
} from "lucide-react"
import { prepareAIVisibilityPrint } from "../utils/pdf-generator"
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
import { FactPricingGuard, type DefenseLogEntry } from "./FactPricingGuard"
import { TechAuditWidget } from "./TechAuditWidget"
import { HowItWorksCard } from "./HowItWorksCard"
import { CompetitorComparison } from "./CompetitorComparison"
import { NetSentimentCard } from "./NetSentimentCard"
import { TrackedKeywordsList } from "./TrackedKeywordsList"
import { ScanHistoryList, type ScanHistoryEntry } from "./ScanHistoryList"
import { OnboardingChecklist } from "./OnboardingChecklist"
import { useAnimatedCounter, FadeUp } from "../hooks/useAnimations"
import { AI_VISIBILITY_COUNTRIES, type AIVisibilityCountry } from "../config/countries"
import type { FullScanResult } from "../types"
import { 
  generateCitations, 
  calculateVisibilityStats, 
  getPlatformStats, 
  generateTrendData,
  analyzeQueries,
  calculateTrustMetrics,
  calculateShareOfVoice,
  calculateNetSentiment,
  calculateCompetitorBenchmarks,
  formatRelativeTime,
} from "../utils"
import { AI_PLATFORMS, DATE_RANGE_OPTIONS, PlatformIcons } from "../constants"
import type { AIPlatform, AIVisibilityFilters, HallucinationRisk, AICitation, AIVisibilityConfig, VisibilityTrendData, NetSentiment, CompetitorBenchmark } from "../types"

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

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// LOADING SKELETON COMPONENT
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <Skeleton className="h-7 w-56 mb-2" />
          <Skeleton className="h-4 w-40" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-28" />
          <Skeleton className="h-9 w-24" />
        </div>
      </div>

      {/* Domain Switcher Skeleton */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-9 w-[260px]" />
        <Skeleton className="h-8 w-20" />
      </div>

      {/* Scan Input Skeleton */}
      <Card className="bg-card border-border">
        <CardContent className="p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 w-[120px]" />
          </div>
        </CardContent>
      </Card>

      {/* Ring Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="bg-card border-border">
            <CardContent className="p-5 flex flex-col items-center">
              <Skeleton className="h-22 w-22 rounded-full mb-3" />
              <Skeleton className="h-4 w-24 mb-1" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* CFO Stats Skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
        <div className="lg:col-span-2">
          <Card className="bg-card border-border">
            <CardContent className="p-4 sm:p-6">
              <Skeleton className="h-5 w-32 mb-4" />
              <Skeleton className="h-[240px] w-full rounded-lg" />
            </CardContent>
          </Card>
        </div>
        <Card className="bg-card border-border">
          <CardContent className="p-4 sm:p-6">
            <Skeleton className="h-5 w-36 mb-4" />
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-4 w-4 rounded-full" />
                  <Skeleton className="h-3 flex-1" />
                  <Skeleton className="h-3 w-10" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Competitor Skeleton */}
      <Card className="bg-card border-border">
        <CardContent className="p-4 sm:p-6">
          <Skeleton className="h-5 w-44 mb-4" />
          <Skeleton className="h-[200px] w-full rounded-lg" />
        </CardContent>
      </Card>

      {/* Citations Skeleton */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-5 w-20" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="bg-card border-border">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

// Section Header component for consistent visual language
function SectionHeader({ icon: Icon, title, badge, className }: {
  icon?: React.ComponentType<{ className?: string }>
  title: string
  badge?: React.ReactNode
  className?: string
}) {
  return (
    <div className={`flex items-center gap-2 ${className || ''}`}>
      <div className="h-px flex-1 max-w-4 bg-border" />
      {Icon && <Icon className="h-4 w-4 text-muted-foreground/60" />}
      <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground/80">
        {title}
      </h2>
      {badge}
      <div className="h-px flex-1 bg-border" />
    </div>
  )
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// ERROR MESSAGE COMPONENT
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

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

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// PROPS INTERFACE
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

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
  onScan?: (keyword: string) => Promise<void>
  /** Whether a scan is currently in progress */
  isScanning?: boolean
  /** Latest scan result for dynamic stats */
  lastScanResult?: FullScanResult | null
  /** Handler to open Add Keyword modal */
  onAddKeyword?: () => void
  /** All available AI visibility configs for the user (for data lookup) */
  configs?: AIVisibilityConfig[]
  /** Selected config ID (derived from selected project) */
  selectedConfigId?: string | null
  /** Callback when config is selected (legacy compat) */
  onSelectConfig?: (configId: string) => void
  /** Callback to edit current config (brand keywords/competitors) */
  onEditConfig?: (config: AIVisibilityConfig) => void
  /** Domain name for report header */
  reportDomain?: string
  /** Trend data override */
  trendData?: VisibilityTrendData[]
  /** Real credit balance — if provided, used instead of hard-coded "500" */
  creditBalance?: number | null
  /** Callback when date range filter changes */
  onDateRangeChange?: (days: number) => void
  /** Keyword for scan input — to pass to PlatformCheckButton */
  scanKeywordValue?: string
  /** Tracked keywords list */
  trackedKeywords?: import("../types").TrackedKeyword[]
  /** Whether tracked keywords are loading */
  isKeywordsLoading?: boolean
  /** Delete a tracked keyword */
  onDeleteKeyword?: (keywordId: string) => Promise<void>
  /** Scan a specific keyword */
  onScanKeyword?: (keyword: string) => Promise<void>
  /** Scan history entries */
  scanHistory?: ScanHistoryEntry[]
  /** Whether scan history is loading */
  isScanHistoryLoading?: boolean
  /** View a specific scan result */
  onViewScanResult?: (scanId: string) => void
  /** Platform-specific status messages from last scan */
  platformMessages?: Record<string, string> | null
  /** Selected country code for scan region (e.g. "US", "IN", "WW") */
  selectedCountry?: string
  /** Callback when country selection changes */
  onCountryChange?: (code: string) => void
  /** Whether the active sidebar project needs AI Visibility configuration (mandatory gate) */
  needsConfig?: boolean
  /** Name of the active sidebar project (for display) */
  activeProjectName?: string
  /** Callback to configure AI Visibility for the active project */
  onConfigureProject?: () => void
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
  creditBalance = null,
  onDateRangeChange,
  scanKeywordValue,
  trackedKeywords = [],
  isKeywordsLoading = false,
  onDeleteKeyword,
  onScanKeyword,
  scanHistory = [],
  isScanHistoryLoading = false,
  onViewScanResult,
  onAddKeyword,
  configs = [],
  selectedConfigId = null,
  onSelectConfig,
  onEditConfig,
  reportDomain,
  trendData: trendDataOverride,
  platformMessages = null,
  selectedCountry = "WW",
  onCountryChange,
  // ── Unified Project System ──
  needsConfig = false,
  activeProjectName,
  onConfigureProject,
}: AIVisibilityDashboardProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [scanKeyword, setScanKeyword] = useState("")
  const [showPlatformMessages, setShowPlatformMessages] = useState(true)
  const [citationsVisible, setCitationsVisible] = useState(10)
  const [filters, setFilters] = useState<AIVisibilityFilters>({
    dateRange: "30d",
    platforms: [],
    citationType: null,
    sortBy: "date",
    sortOrder: "desc",
  })

  useEffect(() => {
    if (typeof window === "undefined") return

    const handleBeforePrint = () => {
      prepareAIVisibilityPrint({ domain: reportDomain })
    }

    window.addEventListener("beforeprint", handleBeforePrint)
    return () => window.removeEventListener("beforeprint", handleBeforePrint)
  }, [reportDomain])

  const handleDownloadReport = () => {
    if (typeof window !== "undefined") {
      window.print()
    }
  }

  const selectedConfig = configs.find((config) => config.id === selectedConfigId) || null
  const canRunScan = !!scanKeyword.trim()

  const handleRunScan = useCallback(() => {
    if (onScan && scanKeyword.trim()) {
      onScan(scanKeyword)
      setShowPlatformMessages(true)
    }
  }, [onScan, scanKeyword])

  const handleScanKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !isScanning && canRunScan) {
      e.preventDefault()
      handleRunScan()
    }
  }, [isScanning, canRunScan, handleRunScan])

  // Use prop citations if provided, otherwise generate demo data
  const citations = useMemo(() => {
    if (isDemoMode) {
      if (propCitations && propCitations.length > 0) {
        return propCitations
      }
      return generateCitations()
    }
    return propCitations || []
  }, [propCitations, isDemoMode])
  const stats = useMemo(() => calculateVisibilityStats(citations), [citations])
  const platformStats = useMemo(() => {
    // When scan just completed but citations haven't reloaded from DB yet,
    // generate platform stats from lastScanResult for immediate feedback
    if (lastScanResult && citations.length === 0 && !isDemoMode) {
      const platformMap: Record<string, { id: AIPlatform; data: { status: string } }> = {
        "google-aio": { id: "google-aio", data: lastScanResult.google },
        "google-ai-mode": { id: "google-ai-mode", data: lastScanResult.googleAiMode },
        "chatgpt": { id: "chatgpt", data: lastScanResult.chatgpt },
        "claude": { id: "claude", data: lastScanResult.claude },
        "gemini": { id: "gemini", data: lastScanResult.gemini },
        "perplexity": { id: "perplexity", data: lastScanResult.perplexity },
      }
      return Object.entries(platformMap).map(([, { id, data }]) => ({
        platform: id,
        citations: data.status === "visible" ? 1 : 0,
        avgPosition: 0,
        topQueries: [lastScanResult.keyword],
        trend: "stable" as const,
        lastUpdated: lastScanResult.timestamp,
      }))
    }
    return getPlatformStats(citations)
  }, [citations, lastScanResult, isDemoMode])
  const trendData = useMemo(() => {
    // Real mode: always use real data from DB (could be empty if no scans yet)
    if (!isDemoMode) {
      return trendDataOverride || []
    }
    // Demo mode: use demo generator for showcase
    return generateTrendData()
  }, [isDemoMode, trendDataOverride])
  const queryAnalysis = useMemo(() => analyzeQueries(citations), [citations])

  // NEW: Dashboard overview metrics (Row 1 cards) — with demo fallback when no data
  const shareOfVoice = useMemo(() => {
    // Use lastScanResult for immediate scan feedback
    if (lastScanResult) {
      return lastScanResult.totalPlatforms > 0
        ? Math.round((lastScanResult.visiblePlatforms / lastScanResult.totalPlatforms) * 100)
        : 0
    }
    const sov = calculateShareOfVoice(citations)
    return isDemoMode && citations.length === 0 ? 42 : sov
  }, [citations, isDemoMode, lastScanResult])
  const netSentiment = useMemo((): NetSentiment => {
    if (isDemoMode && citations.length === 0) {
      return { positive: 5, neutral: 3, negative: 1, total: 9, score: 44, percentage: 56 }
    }
    // Use lastScanResult for immediate scan feedback when citations haven't loaded yet
    if (lastScanResult && citations.length === 0) {
      const platforms = [
        lastScanResult.chatgpt,
        lastScanResult.claude,
        lastScanResult.gemini,
        lastScanResult.perplexity,
      ]
      let positive = 0, neutral = 0, negative = 0
      for (const p of platforms) {
        if (p.status === "visible") {
          if (p.sentiment === "positive") positive++
          else if (p.sentiment === "negative") negative++
          else neutral++
        }
      }
      const total = positive + neutral + negative
      return {
        positive, neutral, negative, total,
        score: total > 0 ? Math.round(((positive - negative) / total) * 100) : 0,
        percentage: total > 0 ? Math.round((positive / total) * 100) : 0,
      }
    }
    return calculateNetSentiment(citations)
  }, [citations, isDemoMode, lastScanResult])
  const competitorBenchmarks = useMemo(() => {
    const benchmarks = calculateCompetitorBenchmarks(citations)
    if (isDemoMode && benchmarks.length === 0) {
      return [
        { domain: "wpbeginner.com", mentions: 7, avgPosition: 2.1, sentiment: "positive" as const, platforms: ["chatgpt" as AIPlatform, "perplexity" as AIPlatform, "gemini" as AIPlatform], shareOfVoice: 18 },
        { domain: "backlinko.com", mentions: 5, avgPosition: 2.5, sentiment: "positive" as const, platforms: ["chatgpt" as AIPlatform, "gemini" as AIPlatform], shareOfVoice: 13 },
        { domain: "neilpatel.com", mentions: 4, avgPosition: 3.0, sentiment: "neutral" as const, platforms: ["google-aio" as AIPlatform, "perplexity" as AIPlatform, "chatgpt" as AIPlatform], shareOfVoice: 10 },
        { domain: "hubspot.com", mentions: 3, avgPosition: 2.8, sentiment: "neutral" as const, platforms: ["chatgpt" as AIPlatform], shareOfVoice: 8 },
        { domain: "moz.com", mentions: 2, avgPosition: 3.5, sentiment: "negative" as const, platforms: ["perplexity" as AIPlatform], shareOfVoice: 5 },
      ]
    }
    return benchmarks
  }, [citations, isDemoMode])
  // Demo visibility score fallback when no citations
  const displayVisibilityScore = lastScanResult 
    ? lastScanResult.overallScore 
    : (isDemoMode && citations.length === 0) ? 42 : stats.visibilityScore

  // Animated counters for ring cards (must be after displayVisibilityScore & shareOfVoice)
  const animatedVisibility = useAnimatedCounter(displayVisibilityScore, 900)
  const animatedSOV = useAnimatedCounter(shareOfVoice, 900)
  
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
        aiReadinessScore: lastScanResult.overallScore >= 70 ? 95 : 
                         lastScanResult.overallScore >= 40 ? 65 : 35,
        lastChecked: lastScanResult.timestamp,
      }
    }
    return calculateTrustMetrics(citations)
  }, [citations, lastScanResult])

  // Generate Fact & Pricing Guard entries from real scan results
  const factGuardEntries = useMemo((): DefenseLogEntry[] => {
    if (!lastScanResult) return []

    const platformConfigs = [
      { data: lastScanResult.google, id: 'google-aio', type: 'fact' },
      { data: lastScanResult.googleAiMode, id: 'google-ai-mode', type: 'feature' },
      { data: lastScanResult.chatgpt, id: 'chatgpt', type: 'pricing' },
      { data: lastScanResult.perplexity, id: 'perplexity', type: 'fact' },
      { data: lastScanResult.claude, id: 'claude', type: 'feature' },
      { data: lastScanResult.gemini, id: 'gemini', type: 'pricing' },
    ]

    return platformConfigs.map(({ data, id, type }) => {
      let sentiment = 'neutral'
      if ('sentiment' in data) {
        sentiment = data.sentiment
      }
      const snippetText = data.snippet || 'No AI response snippet available'

      let defenseStatus: DefenseLogEntry['status']
      let message: string

      if (data.status === 'visible') {
        if (sentiment === 'negative') {
          defenseStatus = 'error'
          message = 'Negative Representation'
        } else {
          defenseStatus = 'accurate'
          message = sentiment === 'positive' ? 'Accurate Info' : 'Brand Mentioned'
        }
      } else {
        defenseStatus = 'outdated'
        message = 'Not Found in AI Response'
      }

      return {
        id: `fg-${id}`,
        platform: id,
        type,
        status: defenseStatus,
        message,
        detail: snippetText.length > 120 ? snippetText.slice(0, 120) + '…' : snippetText,
        timestamp: formatRelativeTime(lastScanResult.timestamp),
      }
    })
  }, [lastScanResult])

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

  // Reset pagination when filters change
  useEffect(() => {
    setCitationsVisible(10)
  }, [searchQuery, filters])

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
      tooltip: "Calculated as (Correct AI Answers / Total Checks) Ã— 100",
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
      tooltip: "Traffic value Ã— Commercial intent keywords",
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
    <main id="report-container" className="report-container space-y-6">
      {/* ── SECTION 1: Header with Credits Badge ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
            <Bot className="h-6 w-6 sm:h-7 sm:w-7 text-cyan-400 shrink-0" />
            <span className="truncate">AI Visibility Tracker</span>
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Track how AI Agents recommend &amp; sell you.
          </p>
        </div>
        <div className="flex flex-row items-center gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadReport}
            className="h-9 gap-1.5 px-3 no-print flex-1 sm:flex-initial"
          >
            <Printer className="h-4 w-4" />
            <span className="hidden sm:inline">Download Report</span>
            <span className="sm:hidden">Report</span>
          </Button>

          {/* Credits Badge — linked to billing */}
          <Link href="/dashboard/billing" className="flex-1 sm:flex-initial no-print">
            <div className="flex items-center justify-center gap-2 px-3 h-9 bg-linear-to-r from-amber-500/15 to-yellow-500/15 border border-amber-500/30 rounded-lg hover:border-amber-500/60 transition-colors cursor-pointer">
              <Zap className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <span className="text-sm font-medium text-amber-600 dark:text-amber-400">{creditBalance ?? 0}</span>
              <span className="text-xs text-muted-foreground">Credits</span>
            </div>
          </Link>
        </div>
      </div>

      {/* ── SECTION 2: Active Project Info + Edit/Configure ── */}
      {!isDemoMode && (
        <div className="flex flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-sm text-muted-foreground truncate">
              {activeProjectName
                ? <>Tracking: <span className="font-medium text-foreground">{activeProjectName}</span> ({reportDomain})</>
                : reportDomain
                  ? <>Tracking: <span className="font-medium text-foreground">{reportDomain}</span></>
                  : "No project selected"}
            </span>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {/* Edit button — when config exists for active project */}
            {onEditConfig && selectedConfig && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2"
                onClick={() => onEditConfig(selectedConfig)}
              >
                <Settings2 className="h-4 w-4 mr-1" />
                Edit
              </Button>
            )}

            {/* Configure button — when active project has no AI config yet */}
            {needsConfig && onConfigureProject && (
              <Button
                variant="outline"
                size="sm"
                className="h-8 shrink-0"
                onClick={onConfigureProject}
              >
                <Settings2 className="h-4 w-4 mr-1" />
                Configure
              </Button>
            )}
          </div>
        </div>
      )}

      {/* ── MANDATORY CONFIG GATE ── */}
      {needsConfig && !isDemoMode && (
        <Card className="bg-amber-500/5 border-amber-500/20">
          <CardContent className="p-6 flex flex-col items-center text-center gap-4">
            <div className="p-3 rounded-full bg-amber-500/10">
              <Settings2 className="h-6 w-6 text-amber-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-1">
                Configure AI Visibility for {activeProjectName || reportDomain || "your project"}
              </h3>
              <p className="text-sm text-muted-foreground max-w-md">
                Add your brand keywords and competitor domains so we can track how AI platforms mention you. This only takes 30 seconds.
              </p>
            </div>
            {onConfigureProject && (
              <Button onClick={onConfigureProject} className="bg-amber-500 hover:bg-amber-600 text-black">
                <Settings2 className="h-4 w-4 mr-2" />
                Configure Now
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── Dashboard content (gated behind config) ── */}
      {!needsConfig && (
      <>
      {/* ── SECTION 3: Keyword Scan Input ── */}
      <Card className="bg-card border-border">
        <CardContent className="p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row gap-2">
            {/* Country / Region selector */}
            {onCountryChange && (
              <Select value={selectedCountry} onValueChange={onCountryChange}>
                <SelectTrigger className="h-9 sm:h-10 w-full sm:w-37.5 bg-background shrink-0">
                  <SelectValue>
                    {(() => {
                      const c = AI_VISIBILITY_COUNTRIES.find(c => c.code === selectedCountry)
                      return c ? `${c.flag} ${c.name}` : "🌐 Worldwide"
                    })()}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {AI_VISIBILITY_COUNTRIES.map((c) => (
                    <SelectItem key={c.code} value={c.code}>
                      <span className="flex items-center gap-2">
                        <span>{c.flag}</span>
                        <span>{c.name}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Ask AI a question... (e.g., 'Best SEO tools 2026')"
                value={scanKeyword}
                onChange={(e) => setScanKeyword(e.target.value)}
                onKeyDown={handleScanKeyDown}
                className="pl-9 bg-background w-full h-9 sm:h-10"
              />
            </div>
            <div className="flex justify-end">
              <Button
                className={`h-9 sm:h-10 w-auto max-w-40 sm:max-w-none transition-all duration-300 ${
                  !isScanning && canRunScan
                    ? "animate-[pulse-subtle_2.5s_ease-in-out_infinite] hover:scale-[1.03] hover:shadow-lg hover:shadow-primary/20"
                    : ""
                }`}
                onClick={handleRunScan}
                disabled={!onScan || !canRunScan || isScanning}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isScanning ? "animate-spin" : ""}`} />
                {isScanning ? "Scanning..." : "Run Scan"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Onboarding Checklist (for new users) ── */}
      {!isDemoMode && (
        <OnboardingChecklist
          hasConfig={configs.length > 0}
          hasScan={scanHistory.length > 0 || !!lastScanResult}
          hasKeyword={trackedKeywords.length > 0}
          onAddConfig={
            needsConfig && onConfigureProject
              ? () => onConfigureProject()
              : selectedConfig && onEditConfig
                ? () => onEditConfig(selectedConfig)
                : undefined
          }
          onStartScan={() => {
            // Focus the scan input
            const input = document.querySelector<HTMLInputElement>('input[placeholder*="Ask AI"]')
            if (input) { input.focus(); input.scrollIntoView({ behavior: 'smooth', block: 'center' }) }
          }}
          onAddKeyword={onAddKeyword}
          isDemoMode={isDemoMode}
        />
      )}

      {/* ── Platform Messages Alert (dismissible) ── */}
      {platformMessages && showPlatformMessages && Object.keys(platformMessages).length > 0 && (
        <Alert className="bg-blue-500/5 border-blue-500/20 relative">
          <Info className="h-4 w-4 text-blue-400" />
          <AlertTitle className="text-sm font-medium text-foreground">Scan Results by Platform</AlertTitle>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 absolute top-2 right-2 opacity-60 hover:opacity-100"
            onClick={() => setShowPlatformMessages(false)}
          >
            <X className="h-3.5 w-3.5" />
          </Button>
          <AlertDescription className="mt-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5 text-xs">
              {Object.entries(platformMessages).map(([platform, message]) => (
                <div key={platform} className="flex items-start gap-1.5">
                  {message.toLowerCase().includes("error") || message.toLowerCase().includes("fail")
                    ? <XCircle className="h-3.5 w-3.5 text-red-400 mt-0.5 shrink-0" />
                    : <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 mt-0.5 shrink-0" />
                  }
                  <span className="text-muted-foreground">
                    <span className="font-medium text-foreground">{platform}:</span> {message}
                  </span>
                </div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* ── SECTION 4: Overview Row 1 — Circular Ring Cards ── */}
      <SectionHeader icon={Shield} title="Performance Overview" className="mt-2" />
      <FadeUp>
      <TooltipProvider>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          {/* Visibility Score — Ring */}
          <Card className="bg-card border-border relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5 hover:border-primary/20">
            <CardContent className="p-3 sm:p-5">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-5 w-5 absolute top-2 right-2 opacity-50 hover:opacity-100">
                    <Info className="h-3 w-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent><p className="text-xs max-w-50">How visible your brand is across all AI platforms (0-100)</p></TooltipContent>
              </Tooltip>
              <div className="flex flex-col items-center text-center">
                <div className="relative w-16 h-16 sm:w-22 sm:h-22">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
                    <circle cx="40" cy="40" r="34" fill="none" strokeWidth="6" className="stroke-muted/40" />
                    <circle cx="40" cy="40" r="34" fill="none" strokeWidth="6" strokeLinecap="round"
                      className={displayVisibilityScore >= 70 ? 'stroke-emerald-500' : displayVisibilityScore >= 40 ? 'stroke-amber-500' : 'stroke-red-500'}
                      strokeDasharray={`${2 * Math.PI * 34}`}
                      strokeDashoffset={`${2 * Math.PI * 34 * (1 - displayVisibilityScore / 100)}`}
                      style={{ transition: 'stroke-dashoffset 0.8s ease' }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-sm sm:text-xl font-bold text-foreground leading-none">{animatedVisibility}</span>
                    <span className="text-[8px] sm:text-[10px] text-muted-foreground">/100</span>
                  </div>
                </div>
                <p className="text-[10px] sm:text-sm font-medium text-foreground mt-2">Visibility Score</p>
                <p className="text-[8px] sm:text-xs text-muted-foreground mt-0.5 hidden sm:block">Overall AI presence strength</p>
              </div>
            </CardContent>
          </Card>

          {/* Share of Voice — Ring */}
          <Card className="bg-card border-border relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-violet-500/5 hover:border-violet-500/20">
            <CardContent className="p-3 sm:p-5">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-5 w-5 absolute top-2 right-2 opacity-50 hover:opacity-100">
                    <Info className="h-3 w-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent><p className="text-xs max-w-50">Your mentions &divide; Total (you + competitors) &times; 100</p></TooltipContent>
              </Tooltip>
              <div className="flex flex-col items-center text-center">
                <div className="relative w-16 h-16 sm:w-22 sm:h-22">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
                    <circle cx="40" cy="40" r="34" fill="none" strokeWidth="6" className="stroke-muted/40" />
                    <circle cx="40" cy="40" r="34" fill="none" strokeWidth="6" strokeLinecap="round"
                      className={shareOfVoice >= 50 ? 'stroke-violet-500' : shareOfVoice >= 25 ? 'stroke-amber-500' : 'stroke-red-500'}
                      strokeDasharray={`${2 * Math.PI * 34}`}
                      strokeDashoffset={`${2 * Math.PI * 34 * (1 - shareOfVoice / 100)}`}
                      style={{ transition: 'stroke-dashoffset 0.8s ease' }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-sm sm:text-xl font-bold text-foreground leading-none">{animatedSOV}</span>
                    <span className="text-[8px] sm:text-[10px] text-muted-foreground">%</span>
                  </div>
                </div>
                <p className="text-[10px] sm:text-sm font-medium text-foreground mt-2">Share of Voice</p>
                <p className="text-[8px] sm:text-xs text-muted-foreground mt-0.5 hidden sm:block">You vs competitors in AI answers</p>
              </div>
            </CardContent>
          </Card>

          {/* Net Sentiment — Advanced Donut Card */}
          <NetSentimentCard sentiment={netSentiment} />
        </div>
      </TooltipProvider>
      </FadeUp>

      {/* CFO Stats Grid - Trust Score, Hallucination Risk, Revenue at Risk, AI Readiness */}
      <FadeUp delay={100}>
      <TooltipProvider>
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
          {statCards.map((stat, index) => (
            <Card key={index} className="bg-card border-border relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
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
      </FadeUp>

      {/* Charts Row */}
      <SectionHeader icon={Bot} title="Analytics & Trends" />
      <FadeUp delay={150}>
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
            onScan={onScan ? () => onScan(scanKeyword) : undefined}
            isScanning={isScanning}
            configId={selectedConfigId}
            scanQuery={scanKeyword || scanKeywordValue}
          />
        </div>
      </div>
      </FadeUp>

      {/* Competitor Comparison Chart */}
      <SectionHeader icon={Zap} title="Competitive Intelligence" />
      <FadeUp delay={100}>
      <CompetitorComparison
        competitors={competitorBenchmarks}
        yourBrand={selectedConfig?.brandKeywords?.[0] || "Your Brand"}
        yourMentions={(isDemoMode && citations.length === 0) ? 9 : citations.length}
        yourSOV={shareOfVoice}
        yourPlatforms={(isDemoMode && citations.length === 0) ? 4 : new Set(citations.map(c => c.platform)).size}
        yourAvgPosition={(isDemoMode && citations.length === 0) ? 1.2 : +(citations.reduce((s, c) => s + (c.position ?? 2), 0) / Math.max(citations.length, 1)).toFixed(1)}
        yourSentiment={(isDemoMode && citations.length === 0) ? "positive" : netSentiment.score >= 50 ? "positive" : netSentiment.score >= 0 ? "neutral" : "negative"}
        isDemoMode={isDemoMode}
        onRequestScan={() => {
          // Scroll to scan input and focus it
          const scanInput = document.querySelector<HTMLInputElement>('input[placeholder*="Ask AI"]')
          if (scanInput) {
            scanInput.scrollIntoView({ behavior: "smooth", block: "center" })
            setTimeout(() => scanInput.focus(), 400)
          }
        }}
      />

      </FadeUp>

      {/* ðŸ›¡ï¸ Fact & Pricing Guard - Hallucination Defense Log (USP) */}
      <FactPricingGuard
        isDemoMode={isDemoMode}
        entries={factGuardEntries.length > 0 ? factGuardEntries : undefined}
        onRunCheck={onScan ? () => {
          const kw = lastScanResult?.keyword || scanKeyword || scanKeywordValue || ''
          if (kw) onScan(kw)
        } : undefined}
        isChecking={isScanning}
      />

      {/* Tracked Keywords List */}
      {!isDemoMode && (
        <TrackedKeywordsList
          keywords={trackedKeywords}
          isLoading={isKeywordsLoading}
          onAddKeyword={onAddKeyword}
          onDeleteKeyword={onDeleteKeyword}
          onScanKeyword={onScanKeyword}
          isScanning={isScanning}
          isDemoMode={isDemoMode}
        />
      )}

      {/* Scan History */}
      {!isDemoMode && (
        <ScanHistoryList
          scans={scanHistory}
          isLoading={isScanHistoryLoading}
          isDemoMode={isDemoMode}
          onViewResult={onViewScanResult}
        />
      )}

      {/* Query Opportunities */}
      <SectionHeader icon={Search} title="Opportunities & Optimization" />
      <FadeUp delay={100}>
      <QueryOpportunities 
        queries={queryAnalysis} 
        isDemoMode={isDemoMode}
        onDemoActionClick={onDemoActionClick}
        onAddKeyword={onAddKeyword}
      />
      </FadeUp>

      {/* Tech Audit Widget - AI Readiness Checker */}
      <TechAuditWidget defaultDomain={selectedConfig?.trackedDomain || ""} />

      {/* Citations List */}
      <SectionHeader 
        icon={AlertTriangle} 
        title="Citations & Mentions" 
        badge={
          <Badge variant="outline" className="text-muted-foreground text-xs">
            {filteredCitations.length}
          </Badge>
        }
      />
      <FadeUp delay={100}>
      <div>

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
                  onValueChange={(value) => {
                    setFilters(f => ({ ...f, dateRange: value as AIVisibilityFilters['dateRange'] }))
                    // Notify parent to re-fetch data with new range
                    const daysMap: Record<string, number> = { '7d': 7, '14d': 14, '30d': 30, '90d': 90 }
                    const days = daysMap[value] ?? 30
                    onDateRangeChange?.(days)
                  }}
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
          {filteredCitations.length === 0 ? (
            <Card className="bg-card border-border">
              <CardContent className="p-6 sm:p-8">
                <div className="flex flex-col items-center justify-center py-6 sm:py-10 text-center">
                  <div className="p-3 rounded-full bg-muted/50 mb-4">
                    <Search className="h-8 w-8 text-muted-foreground/40" />
                  </div>
                  <h3 className="text-sm sm:text-base font-semibold text-foreground mb-1.5">
                    No citations found
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground max-w-sm">
                    {searchQuery || filters.platforms.length > 0
                      ? "Try adjusting your search or filters to find citations."
                      : "Run a scan to discover where AI platforms are citing your brand. Each scan checks 6 AI platforms simultaneously."}
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              {filteredCitations.slice(0, citationsVisible).map((citation) => (
                <CitationCard 
                  key={citation.id} 
                  citation={citation} 
                  isDemoMode={isDemoMode}
                  onDemoActionClick={onDemoActionClick}
                />
              ))}
              {filteredCitations.length > citationsVisible && (
                <Button
                  variant="outline"
                  className="w-full mt-2 text-muted-foreground hover:text-foreground"
                  onClick={() => setCitationsVisible(prev => prev + 10)}
                >
                  Show More ({filteredCitations.length - citationsVisible} remaining)
                </Button>
              )}
            </>
          )}
        </div>
      </div>
      </FadeUp>
      </>
      )}
    </main>
  )
}
