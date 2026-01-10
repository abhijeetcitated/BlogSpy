// ============================================
// YOUTUBE STRATEGY PANEL
// ============================================
// Intelligence dashboard for YouTube competition analysis
// Displays: Win Probability, Authority Wall, Angle Map,
// FGI, Effort Level, and Exploit Recommendation
// Theme-aware: Uses CSS variables for dark/light mode
// ============================================

"use client"

import * as React from "react"
import {
  AlertCircle,
  BarChart3,
  BookOpen,
  Calendar,
  CheckCircle,
  Clock,
  Eye,
  Flame,
  Lightbulb,
  Shield,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  XCircle,
  Youtube,
  Zap,
} from "lucide-react"

import { cn } from "@/lib/utils"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import type {
  YouTubeIntelligenceResult,
  AnalyzedVideo,
  AngleClusterKey,
  AuthorityStatus,
  WinProbabilityLabel,
} from "../../utils/youtube-intelligence"

// ============================================
// TYPES
// ============================================

interface YouTubeStrategyPanelProps {
  analysis: YouTubeIntelligenceResult
  className?: string
}

interface YouTubeVideoCardProps {
  video: AnalyzedVideo
  className?: string
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function formatNumber(num: number): string {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`
  return `${num}`
}

function getWinProbabilityColor(label: WinProbabilityLabel): string {
  switch (label) {
    case "High":
      return "text-emerald-500 dark:text-emerald-400"
    case "Medium":
      return "text-amber-500 dark:text-amber-400"
    case "Low":
      return "text-rose-500 dark:text-rose-400"
  }
}

function getWinProbabilityBg(label: WinProbabilityLabel): string {
  switch (label) {
    case "High":
      return "bg-emerald-500/10 border-emerald-500/20"
    case "Medium":
      return "bg-amber-500/10 border-amber-500/20"
    case "Low":
      return "bg-rose-500/10 border-rose-500/20"
  }
}

function getAuthorityStatusColor(status: AuthorityStatus): string {
  switch (status) {
    case "Open Field":
      return "text-emerald-500 dark:text-emerald-400"
    case "Mixed":
      return "text-amber-500 dark:text-amber-400"
    case "Hard (Wall)":
      return "text-rose-500 dark:text-rose-400"
  }
}

function getAuthorityStatusEmoji(status: AuthorityStatus): string {
  switch (status) {
    case "Open Field":
      return "🟢"
    case "Mixed":
      return "🟡"
    case "Hard (Wall)":
      return "🔴"
  }
}

function getAngleIcon(angle: AngleClusterKey): React.ReactNode {
  switch (angle) {
    case "Beginner":
      return <BookOpen className="h-3 w-3" />
    case "Mistakes":
      return <AlertCircle className="h-3 w-3" />
    case "StepByStep":
      return <BarChart3 className="h-3 w-3" />
    case "Update":
      return <Calendar className="h-3 w-3" />
    case "Comparison":
      return <Target className="h-3 w-3" />
  }
}

// ============================================
// SUB-COMPONENTS
// ============================================

function WinProbabilityBadge({
  score,
  label,
}: {
  score: number
  label: WinProbabilityLabel
}) {
  return (
    <div className="flex flex-col items-start gap-1">
      <div className="text-xs text-muted-foreground uppercase tracking-wider">Win Probability</div>
      <div className="flex items-center gap-2">
        <span className={cn("text-3xl font-bold tabular-nums", getWinProbabilityColor(label))}>
          {score}%
        </span>
        <span
          className={cn(
            "px-2 py-0.5 rounded-full text-xs font-medium border",
            getWinProbabilityBg(label),
            getWinProbabilityColor(label)
          )}
        >
          {label}
        </span>
      </div>
    </div>
  )
}

function RecommendedPlay({
  strategy,
  icon,
}: {
  strategy: string
  icon: string
}) {
  return (
    <div className="flex flex-col items-center gap-2 text-center px-4">
      <div className="text-xs text-muted-foreground uppercase tracking-wider">Recommended Play</div>
      <div className="flex items-center gap-2">
        <span className="text-2xl">{icon}</span>
        <span className="text-sm font-semibold text-foreground">{strategy}</span>
      </div>
    </div>
  )
}

function AuthorityStatusBadge({
  status,
  ratio,
}: {
  status: AuthorityStatus
  ratio: number
}) {
  return (
    <div className="flex flex-col items-end gap-1">
      <div className="text-xs text-muted-foreground uppercase tracking-wider">Authority Wall</div>
      <div className="flex items-center gap-2">
        <span className="text-lg">{getAuthorityStatusEmoji(status)}</span>
        <span className={cn("text-sm font-medium", getAuthorityStatusColor(status))}>
          {status}
        </span>
      </div>
      <div className="text-xs text-muted-foreground/70">
        {Math.round(ratio * 100)}% big channels
      </div>
    </div>
  )
}

function AngleMapDisplay({
  dominantAngles,
  missingAngles,
}: {
  dominantAngles: AngleClusterKey[]
  missingAngles: AngleClusterKey[]
}) {
  return (
    <div className="space-y-3">
      <div className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
        <Lightbulb className="h-3 w-3" />
        Content Gap Analysis
      </div>

      {/* Market has */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <CheckCircle className="h-3 w-3" />
          <span>Market has:</span>
        </div>
        <div className="flex flex-wrap gap-1.5 pl-4">
          {dominantAngles.length > 0 ? (
            dominantAngles.map((angle) => (
              <span
                key={angle}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-muted/50 border border-border text-xs text-muted-foreground"
              >
                {getAngleIcon(angle)}
                {angle}
              </span>
            ))
          ) : (
            <span className="text-xs text-muted-foreground/60">No dominant angles</span>
          )}
        </div>
      </div>

      {/* Opportunities */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <XCircle className="h-3 w-3 text-amber-500" />
          <span>Opportunity:</span>
        </div>
        <div className="flex flex-wrap gap-1.5 pl-4">
          {missingAngles.length > 0 ? (
            missingAngles.map((angle) => (
              <span
                key={angle}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-xs text-amber-600 dark:text-amber-400 font-medium"
              >
                {getAngleIcon(angle)}
                {angle}
              </span>
            ))
          ) : (
            <span className="text-xs text-muted-foreground/60">All angles covered</span>
          )}
        </div>
      </div>
    </div>
  )
}

function StatsDisplay({
  fgiPercentage,
  effortLevel,
  avgDuration,
}: {
  fgiPercentage: number
  effortLevel: string
  avgDuration: number
}) {
  const fgiColor = fgiPercentage > 50 ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground"

  return (
    <div className="space-y-3">
      <div className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
        <BarChart3 className="h-3 w-3" />
        Quick Stats
      </div>

      <div className="space-y-2">
        {/* FGI */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            Freshness Gap Index
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className={cn("text-sm font-medium", fgiColor)}>
                  {fgiPercentage}% Outdated
                </span>
              </TooltipTrigger>
              <TooltipContent side="left" className="max-w-xs bg-popover border-border">
                <p className="text-xs">
                  {fgiPercentage > 50
                    ? "Most top videos are over 2 years old. Great opportunity for fresh content!"
                    : "Competition is relatively fresh. Focus on quality over recency."}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Effort Level */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Flame className="h-3 w-3" />
            Effort Level
          </div>
          <span className="text-xs font-medium text-foreground/80">
            {effortLevel.split("(")[0].trim()}
          </span>
        </div>

        {/* Avg Duration */}
        {avgDuration > 0 && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3" />
              Avg. Video Length
            </div>
            <span className="text-xs font-medium text-foreground/80">
              {avgDuration.toFixed(1)} min
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

// ============================================
// VIDEO BADGE COMPONENT
// ============================================

function VideoBadge({
  type,
  emoji,
  label,
}: {
  type: "viral" | "outdated" | "weak"
  emoji: string
  label: string
}) {
  const styles = {
    viral: "bg-purple-500/10 border-purple-500/30 text-purple-600 dark:text-purple-400",
    outdated: "bg-orange-500/10 border-orange-500/30 text-orange-600 dark:text-orange-400",
    weak: "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400",
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium border",
        styles[type]
      )}
    >
      <span>{emoji}</span>
      <span>{label}</span>
    </span>
  )
}

// ============================================
// VIDEO CARD COMPONENT (Enhanced)
// ============================================

export function YouTubeVideoCard({ video, className }: YouTubeVideoCardProps) {
  return (
    <a
      href={video.url}
      target="_blank"
      rel="noreferrer"
      className={cn(
        "group flex gap-4 p-3 rounded-lg",
        "border border-border/50 bg-card/30",
        "hover:border-border hover:bg-accent/50",
        "backdrop-blur-sm transition-all duration-200",
        className
      )}
    >
      {/* Thumbnail */}
      <div className="relative w-32 h-20 shrink-0 overflow-hidden rounded-md border border-border/80">
        {video.thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={video.thumbnailUrl}
            alt={video.title}
            referrerPolicy="no-referrer"
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-200"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted/40">
            <Youtube className="h-5 w-5 text-muted-foreground" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col justify-center gap-1.5 min-w-0 flex-1">
        {/* Badges Row */}
        {video.badges.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {video.badges.map((badge) => (
              <VideoBadge
                key={badge.type}
                type={badge.type}
                emoji={badge.emoji}
                label={badge.label}
              />
            ))}
          </div>
        )}

        {/* Title */}
        <h4 className="text-sm font-medium leading-tight text-foreground group-hover:text-primary line-clamp-2">
          {video.title}
        </h4>

        {/* Meta */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Eye className="w-3 h-3" />
            <span className="font-mono text-xs text-primary">
              {typeof video.views === "number"
                ? `${formatNumber(video.views)} views`
                : video.viewsLabel ?? "— views"}
            </span>
          </span>
          <span>•</span>
          <span className="truncate">{video.channel ?? "Unknown channel"}</span>
          {video.published && (
            <>
              <span>•</span>
              <span className="truncate">{video.published}</span>
            </>
          )}
        </div>
      </div>
    </a>
  )
}

// ============================================
// MAIN PANEL COMPONENT
// ============================================

export function YouTubeStrategyPanel({ analysis, className }: YouTubeStrategyPanelProps) {
  const { winProbability, authorityWall, angleMap, freshnessGap, effort, exploit } = analysis

  return (
    <div className={cn("space-y-4", className)}>
      {/* ─────────────────────────────────────────
          ROW 1: The "Consultant" Header
          ───────────────────────────────────────── */}
      <div
        className={cn(
          "rounded-xl p-4",
          "border border-border/50",
          "bg-gradient-to-r from-card/80 via-card/60 to-card/80",
          "backdrop-blur-md"
        )}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* Left: Win Probability */}
          <WinProbabilityBadge score={winProbability.score} label={winProbability.label} />

          {/* Center: Recommended Play */}
          <RecommendedPlay strategy={exploit.strategy} icon={exploit.icon} />

          {/* Right: Authority Status */}
          <AuthorityStatusBadge status={authorityWall.status} ratio={authorityWall.ratio} />
        </div>

        {/* Strategy Reasoning */}
        <div className="mt-3 pt-3 border-t border-border/50">
          <p className="text-xs text-muted-foreground flex items-start gap-2">
            <Sparkles className="h-3 w-3 shrink-0 mt-0.5 text-amber-500" />
            <span>{exploit.reasoning}</span>
          </p>
        </div>
      </div>

      {/* ─────────────────────────────────────────
          ROW 2: The Insights Grid (2 Columns)
          ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Col 1: Angle Map */}
        <div
          className={cn(
            "rounded-xl p-4",
            "border border-border/50",
            "bg-card/40 backdrop-blur-sm"
          )}
        >
          <AngleMapDisplay
            dominantAngles={angleMap.dominantAngles}
            missingAngles={angleMap.missingAngles}
          />
        </div>

        {/* Col 2: Stats */}
        <div
          className={cn(
            "rounded-xl p-4",
            "border border-border/50",
            "bg-card/40 backdrop-blur-sm"
          )}
        >
          <StatsDisplay
            fgiPercentage={freshnessGap.percentage}
            effortLevel={effort.level}
            avgDuration={effort.avgDurationMinutes}
          />
        </div>
      </div>

      {/* ─────────────────────────────────────────
          Breakdown Details (Collapsible Info)
          ───────────────────────────────────────── */}
      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-muted/30 border border-border/50 cursor-help">
                <Users className="h-3 w-3" />
                {winProbability.breakdown.weakCount} weak
              </span>
            </TooltipTrigger>
            <TooltipContent className="bg-popover border-border">
              <p className="text-xs">Channels with &lt;1K subscribers</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-muted/30 border border-border/50 cursor-help">
                <Clock className="h-3 w-3" />
                {winProbability.breakdown.outdatedCount} outdated
              </span>
            </TooltipTrigger>
            <TooltipContent className="bg-popover border-border">
              <p className="text-xs">Videos older than 2 years</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-muted/30 border border-border/50 cursor-help">
                <Zap className="h-3 w-3" />
                {winProbability.breakdown.viralCount} viral
              </span>
            </TooltipTrigger>
            <TooltipContent className="bg-popover border-border">
              <p className="text-xs">Videos with views/subs ratio &gt;5x</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-muted/30 border border-border/50 cursor-help">
                <Shield className="h-3 w-3" />
                {authorityWall.highAuthorityCount}/{authorityWall.totalChecked} authority
              </span>
            </TooltipTrigger>
            <TooltipContent className="bg-popover border-border">
              <p className="text-xs">Top 5 channels with &gt;100K subscribers</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  )
}

export default YouTubeStrategyPanel
