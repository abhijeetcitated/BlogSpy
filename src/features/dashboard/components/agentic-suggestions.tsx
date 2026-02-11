// ============================================
// AGENTIC SUGGESTIONS - AI Agent Cards
// ============================================

"use client"

import { useState, memo } from "react"
import Link from "next/link"
import {
  Bot,
  Sparkles,
  RefreshCw,
  XCircle,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  AlertCircle,
  Zap,
  FileEdit,
  Eye,
  Target,
  Lightbulb,
  Activity,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  BarChart3,
  ExternalLink,
  Crosshair,
  Flame,
  Search,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { AgenticSuggestion } from "./command-center-data"

const suggestionIcons = {
  file_edit: FileEdit,
  sparkles: Sparkles,
  eye: Eye,
  target: Target,
  lightbulb: Lightbulb,
  activity: Activity,
  alert_triangle: AlertTriangle,
} as const

// ============================================
// EVIDENCE CHIP PARSER
// ============================================

interface EvidenceChip {
  icon: typeof TrendingDown
  text: string
  accent: string // just the text accent color — chip bg stays muted
}

/** Detect which Lucide icon + subtle accent to use based on chip text */
function detectChipMeta(text: string): { icon: typeof TrendingDown; accent: string } {
  const t = text.toLowerCase().trim()
  if (t.startsWith("#") && t.includes("→"))     return { icon: TrendingDown, accent: "text-amber-400" }
  if (t.startsWith("rank") || t.startsWith("position")) return { icon: Crosshair, accent: "text-blue-400" }
  if (t.startsWith("vol:") || t.includes("monthly search")) return { icon: BarChart3, accent: "text-violet-400" }
  if (t.startsWith("kd:"))                       return { icon: Target, accent: "text-cyan-400" }
  if (t.startsWith("/") || t.includes("url:"))   return { icon: ExternalLink, accent: "text-muted-foreground" }
  if (t.startsWith("growth") || (t.includes("%") && !t.includes("lost"))) return { icon: TrendingUp, accent: "text-emerald-400" }
  if (t === "decaying")                           return { icon: Flame, accent: "text-red-400" }
  if (t.includes("snippet"))                      return { icon: Eye, accent: "text-purple-400" }
  if (t.includes("ai"))                           return { icon: Search, accent: "text-emerald-400" }
  if (t.includes("traffic") || t.includes("lost")) return { icon: TrendingDown, accent: "text-orange-400" }
  return { icon: BarChart3, accent: "text-muted-foreground" }
}

function parseEvidenceChips(evidence: string): EvidenceChip[] {
  return evidence.split("|").map((part) => {
    const text = part.trim()
    const meta = detectChipMeta(text)
    return { icon: meta.icon, text, accent: meta.accent }
  })
}

// ============================================
// IMPACT ICON DETECTOR
// ============================================

function getImpactIcon(impact: string): typeof TrendingDown {
  const t = impact.toLowerCase()
  if (t.includes("at risk") || t.includes("lost")) return TrendingDown
  if (t.includes("clicks") || t.includes("potential")) return TrendingUp
  if (t.includes("first mover") || t.includes("advantage")) return Zap
  if (t.includes("ai") || t.includes("searcher")) return Search
  if (t.includes("recovery") || t.includes("save") || t.includes("prevent")) return TrendingUp
  return TrendingUp
}

// ============================================
// PRIORITY DOT
// ============================================
const priorityConfig = {
  high: { dot: "bg-red-500", ring: "ring-red-500/20" },
  medium: { dot: "bg-amber-500", ring: "ring-amber-500/20" },
  low: { dot: "bg-muted-foreground", ring: "ring-muted-foreground/20" },
} as const

const REFRESH_COOLDOWN_MS = 30_000 // 30 second cooldown

interface AgenticSuggestionsProps {
  suggestions: AgenticSuggestion[]
  onRefresh?: () => void
  onLiveRefresh?: () => void
  isLoading?: boolean
  isLiveRefreshPending?: boolean
  error?: boolean
}

export const AgenticSuggestions = memo(function AgenticSuggestions({
  suggestions,
  onRefresh,
  onLiveRefresh,
  isLoading = false,
  isLiveRefreshPending = false,
  error = false,
}: AgenticSuggestionsProps) {
  const [dismissedSuggestions, setDismissedSuggestions] = useState<number[]>([])
  const [isExpanded, setIsExpanded] = useState(false)
  const [lastRefreshTime, setLastRefreshTime] = useState<Date | null>(null)

  // Get active suggestions (not dismissed)
  const activeSuggestions = suggestions.filter(s => !dismissedSuggestions.includes(s.id))
  
  // Show 4 by default, all when expanded
  const visibleSuggestions = isExpanded ? activeSuggestions : activeSuggestions.slice(0, 4)
  const hiddenCount = activeSuggestions.length - 4

  const handleDismiss = (id: number) => {
    setDismissedSuggestions(prev => [...prev, id])
  }

  const handleRefresh = () => {
    // 30s cooldown guard
    if (lastRefreshTime) {
      const elapsed = Date.now() - lastRefreshTime.getTime()
      if (elapsed < REFRESH_COOLDOWN_MS) return
    }

    setDismissedSuggestions([])
    setIsExpanded(false)
    setLastRefreshTime(new Date())

    if (onRefresh) {
      onRefresh()
    }
  }

  const toggleExpanded = () => {
    setIsExpanded(prev => !prev)
  }
  
  // Format refresh button text
  const getRefreshText = () => {
    if (isLoading) return 'Analyzing...'
    if (lastRefreshTime) {
      const seconds = Math.floor((Date.now() - lastRefreshTime.getTime()) / 1000)
      if (seconds < 60) return 'Just now'
    }
    return 'Refresh'
  }

  // Disable refresh during loading or within cooldown
  const isRefreshDisabled = isLoading || (
    lastRefreshTime !== null && (Date.now() - lastRefreshTime.getTime()) < REFRESH_COOLDOWN_MS
  )

  return (
    <Card className="border-border/60 relative overflow-hidden">
      <CardContent className="p-4 sm:p-6 relative">
        <div className="space-y-3 sm:space-y-4">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-2 rounded-lg bg-amber-500/15 shrink-0">
                <Bot className="h-5 w-5 sm:h-6 sm:w-6 text-amber-500" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                  <h2 className="text-base sm:text-lg font-bold text-foreground">AI Suggestions</h2>
                  <Badge variant="secondary" className="text-[10px] sm:text-xs px-1.5">
                    <Sparkles className="h-3 w-3 mr-1" />
                    {activeSuggestions.length}
                  </Badge>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">
                  Personalized actions to improve your SEO
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={onLiveRefresh}
                disabled={isLiveRefreshPending || !onLiveRefresh}
                className="h-8 text-xs border-amber-500/40 text-amber-500 hover:bg-amber-500/10 hover:text-amber-400"
                title="Paid live refresh using external signals"
              >
                <Zap className={`h-4 w-4 mr-1.5 ${isLiveRefreshPending ? "animate-pulse" : ""}`} />
                {isLiveRefreshPending ? "Queued..." : "Live Refresh"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshDisabled}
                className="h-8 text-xs border-emerald-500/40 text-emerald-500 hover:bg-emerald-500/10 hover:text-emerald-400"
              >
                <RefreshCw className={`h-4 w-4 mr-1.5 ${isLoading ? "animate-spin" : ""}`} />
                {getRefreshText()}
              </Button>
            </div>
          </div>

          {/* Suggestions Grid */}
          {error && activeSuggestions.length === 0 ? (
            <ErrorState onRetry={handleRefresh} />
          ) : activeSuggestions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              {visibleSuggestions.map((suggestion) => (
                <SuggestionCard
                  key={suggestion.id}
                  suggestion={suggestion}
                  onDismiss={handleDismiss}
                />
              ))}
            </div>
          ) : (
            <EmptyState />
          )}

          {/* View All / Collapse Button */}
          {hiddenCount > 0 && (
            <div className="flex justify-center pt-1 sm:pt-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={toggleExpanded}
                className="text-muted-foreground hover:text-foreground text-xs sm:text-sm h-8 gap-1"
              >
                {isExpanded ? (
                  <>
                    Show less
                    <ChevronUp className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </>
                ) : (
                  <>
                    View all {activeSuggestions.length} suggestions
                    <ChevronDown className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
})

// ============================================
// SUGGESTION CARD (Clean card style)
// ============================================

interface SuggestionCardProps {
  suggestion: AgenticSuggestion
  onDismiss: (id: number) => void
}

function SuggestionCard({ suggestion, onDismiss }: SuggestionCardProps) {
  const SuggestionIcon = suggestionIcons[suggestion.iconKey] ?? Sparkles
  const evidenceChips = parseEvidenceChips(suggestion.evidence)
  const ImpactIcon = getImpactIcon(suggestion.impact)
  const prio = priorityConfig[suggestion.priority]

  return (
    <Card className="group hover:border-primary/50 hover:shadow-md transition-[border-color,box-shadow] duration-200 relative">
      <CardContent className="p-3 sm:p-4">
        <div className="flex flex-col gap-3">
          {/* ── Header Row ── */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-2.5 sm:gap-3 min-w-0 flex-1">
              <div className={`p-2 rounded-lg bg-muted/50 shrink-0 ${suggestion.iconColor}`}>
                <SuggestionIcon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1 space-y-0.5">
                <h3 className="text-xs sm:text-sm font-semibold text-foreground leading-snug line-clamp-2">
                  {suggestion.title}
                </h3>
                <div className="flex items-center gap-2">
                  {/* Priority dot */}
                  <span className={`inline-block h-2 w-2 rounded-full ${prio.dot} ring-2 ${prio.ring}`} />
                  <span className="text-[10px] sm:text-[11px] text-muted-foreground capitalize">{suggestion.priority}</span>
                  <span className="text-[10px] sm:text-[11px] text-muted-foreground/50">·</span>
                  <span className="text-[10px] sm:text-[11px] text-muted-foreground/60">{suggestion.freshness}</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => onDismiss(suggestion.id)}
              className="p-1 rounded-full hover:bg-muted text-muted-foreground/30 hover:text-foreground transition-colors sm:opacity-0 sm:group-hover:opacity-100 shrink-0"
              title="Dismiss"
            >
              <XCircle className="h-4 w-4" />
            </button>
          </div>

          {/* ── Evidence Data Chips ── */}
          <div className="flex flex-wrap gap-1.5">
            {evidenceChips.map((chip, i) => {
              const ChipIcon = chip.icon
              return (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted/50 text-[11px] sm:text-xs font-medium text-foreground/80"
                >
                  <ChipIcon className={`h-3.5 w-3.5 shrink-0 ${chip.accent}`} />
                  {chip.text}
                </span>
              )
            })}
          </div>

          {/* ── Description ── */}
          <p className="text-[11px] sm:text-xs text-muted-foreground leading-relaxed line-clamp-2">
            {suggestion.description}
          </p>

          {/* ── Impact Row ── */}
          <div className="flex items-center gap-2 px-2.5 py-2 rounded-lg bg-muted/50">
            <ImpactIcon className={`h-4 w-4 shrink-0 ${suggestion.impactColor}`} />
            <span className={`text-[11px] sm:text-xs font-semibold ${suggestion.impactColor}`}>
              {suggestion.impact}
            </span>
          </div>

          {/* ── Footer: Effort + CTA ── */}
          <div className="flex items-center justify-between pt-1 border-t border-border/50">
            {suggestion.effort ? (
              <span className="text-[10px] text-muted-foreground/60 font-medium">
                {suggestion.effort}
              </span>
            ) : <span />}
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="h-7 text-xs px-2.5 group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
            >
              <Link href={suggestion.ctaHref}>
                {suggestion.ctaLabel}
                <ChevronRight className="h-3 w-3 ml-1" />
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ============================================
// EMPTY STATE
// ============================================

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <CheckCircle2 className="h-12 w-12 text-emerald-400 mb-3" />
      <h3 className="text-lg font-medium text-foreground">All caught up!</h3>
      <p className="text-sm text-muted-foreground mt-1">
        No pending suggestions. Click refresh to scan for new opportunities.
      </p>
    </div>
  )
}

// ============================================
// ERROR STATE
// ============================================

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <AlertCircle className="h-12 w-12 text-amber-400 mb-3" />
      <h3 className="text-lg font-medium text-foreground">Couldn&apos;t load suggestions</h3>
      <p className="text-sm text-muted-foreground mt-1">
        Something went wrong. Try refreshing or check back shortly.
      </p>
      <Button
        variant="outline"
        size="sm"
        onClick={onRetry}
        className="mt-3 border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
      >
        <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
        Try Again
      </Button>
    </div>
  )
}
