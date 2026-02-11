"use client"

// ============================================
// AI Visibility — Competitor Comparison Card
// ============================================
// Grouped vertical bar chart (Mentions × Platforms × Position)
// + Detail breakdown table
// Matches Decay Trend History visual language
// No Recharts dependency — pure CSS

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  Users,
  Crown,
  Swords,
  Info,
  Globe,
  MapPin,
  Search,
} from "lucide-react"
import type { CompetitorBenchmark } from "../types"

// ============================================
// INTERFACES
// ============================================

interface CompetitorComparisonProps {
  competitors: CompetitorBenchmark[]
  yourBrand?: string
  yourMentions: number
  yourSOV: number
  yourPlatforms?: number
  yourAvgPosition?: number
  yourSentiment?: "positive" | "neutral" | "negative"
  isDemoMode?: boolean
  /** Callback when user clicks "Run a Scan" in empty state */
  onRequestScan?: () => void
}

// ============================================
// STAT BOX — same pattern as Decay Alerts
// ============================================

function StatBox({
  label,
  value,
  suffix,
  color,
  subtext,
}: {
  label: string
  value: string | number
  suffix?: string
  color: string
  subtext?: string
}) {
  return (
    <div className={cn(
      "p-2 sm:p-3 md:p-4 rounded-xl transition-all",
      "bg-muted/30 dark:bg-muted/20",
      "border border-border/50"
    )}>
      <span className="text-[9px] sm:text-[10px] md:text-xs font-medium text-muted-foreground truncate block mb-1 sm:mb-2">
        {label}
      </span>
      <p className={cn("text-base sm:text-lg md:text-xl font-bold", color)}>
        {value}{suffix}
      </p>
      {subtext && (
        <p className="text-[8px] sm:text-[9px] text-muted-foreground mt-0.5">{subtext}</p>
      )}
    </div>
  )
}

// ============================================
// GROUPED VERTICAL BARS — 3 bars per competitor
// Mentions (emerald/red) | Platforms (amber) | Position (violet)
// ============================================

function CompetitorBarGroup({
  name,
  mentions,
  platforms,
  avgPosition,
  sentiment,
  sov,
  maxMentions,
  maxPlatforms,
  isYou,
}: {
  name: string
  mentions: number
  platforms: number
  avgPosition: number
  sentiment: string
  sov: number
  maxMentions: number
  maxPlatforms: number
  isYou: boolean
}) {
  // Normalize all metrics to 0-100% for consistent bar heights
  const mentionH = maxMentions > 0 ? (mentions / maxMentions) * 100 : 0
  const platformH = maxPlatforms > 0 ? (platforms / maxPlatforms) * 100 : 0
  // Position: lower = better → invert. Range 1-5 → score 100-0
  const positionH = Math.max(0, Math.min(100, ((5 - avgPosition) / 4) * 100))

  const sentimentDot: Record<string, string> = {
    positive: "bg-emerald-500",
    neutral: "bg-amber-500",
    negative: "bg-red-500",
  }

  return (
    <div className="flex-1 flex flex-col items-center gap-1 h-full group min-w-0">
      {/* Bar group — 3 bars side by side */}
      <div className="flex-1 w-full flex gap-[2px] sm:gap-0.5 items-end justify-center px-0.5">
        {/* Mentions bar */}
        <div
          className={cn(
            "flex-1 max-w-3 sm:max-w-4 md:max-w-5 rounded-t transition-all duration-500 cursor-pointer",
            isYou
              ? "bg-linear-to-t from-emerald-500/80 to-emerald-400/60 dark:from-emerald-600/80 dark:to-emerald-500/50 hover:from-emerald-500 hover:to-emerald-400"
              : "bg-linear-to-t from-red-500/80 to-red-400/60 dark:from-red-600/80 dark:to-red-500/50 hover:from-red-500 hover:to-red-400"
          )}
          style={{ height: `${Math.max(mentionH, 5)}%` }}
          title={`${mentions} mentions`}
        />
        {/* Platforms bar */}
        <div
          className={cn(
            "flex-1 max-w-3 sm:max-w-4 md:max-w-5 rounded-t transition-all duration-500 cursor-pointer",
            "bg-linear-to-t from-amber-500/80 to-amber-400/60",
            "dark:from-amber-600/80 dark:to-amber-500/50",
            "hover:from-amber-500 hover:to-amber-400"
          )}
          style={{ height: `${Math.max(platformH, 5)}%` }}
          title={`${platforms} platform${platforms !== 1 ? "s" : ""}`}
        />
        {/* Position score bar */}
        <div
          className={cn(
            "flex-1 max-w-3 sm:max-w-4 md:max-w-5 rounded-t transition-all duration-500 cursor-pointer",
            "bg-linear-to-t from-blue-500 to-blue-400",
            "dark:from-blue-500 dark:to-blue-400",
            "hover:from-blue-400 hover:to-blue-300"
          )}
          style={{ height: `${Math.max(positionH, 5)}%` }}
          title={`Avg position #${avgPosition.toFixed(1)}`}
        />
      </div>

      {/* Name + sentiment dot */}
      <div className="flex flex-col items-center gap-0.5 min-w-0 w-full">
        <div className="flex items-center gap-1">
          <div className={cn("w-1.5 h-1.5 rounded-full shrink-0", sentimentDot[sentiment] || "bg-gray-400")} />
          <span className={cn(
            "text-[7px] sm:text-[9px] md:text-[10px] font-semibold truncate max-w-full text-center",
            isYou ? "text-emerald-500" : "text-foreground"
          )}>
            {isYou ? "You" : name.replace(/\.com$/, "")}
          </span>
        </div>
        <span className="text-[6px] sm:text-[7px] md:text-[8px] text-muted-foreground">
          {sov}% SOV
        </span>
      </div>
    </div>
  )
}

// ============================================
// DETAIL ROW — competitor breakdown table row
// ============================================

function CompetitorDetailRow({
  rank,
  name,
  mentions,
  platforms,
  avgPosition,
  sentiment,
  sov,
  isYou,
}: {
  rank: number
  name: string
  mentions: number
  platforms: number
  avgPosition: number
  sentiment: string
  sov: number
  isYou: boolean
}) {
  const sentimentColor: Record<string, string> = {
    positive: "text-emerald-500",
    neutral: "text-amber-500",
    negative: "text-red-500",
  }
  const sentimentBg: Record<string, string> = {
    positive: "bg-emerald-500/10 border-emerald-500/20",
    neutral: "bg-amber-500/10 border-amber-500/20",
    negative: "bg-red-500/10 border-red-500/20",
  }

  return (
    <div className={cn(
      "flex items-center gap-2 sm:gap-3 py-1.5 sm:py-2 px-2 sm:px-3 rounded-lg transition-all",
      isYou
        ? "bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20"
        : "hover:bg-muted/30"
    )}>
      {/* Rank */}
      <span className={cn(
        "w-5 text-center text-[10px] sm:text-xs font-bold shrink-0",
        isYou ? "text-emerald-500" : "text-muted-foreground"
      )}>
        {isYou ? <Crown className="h-3.5 w-3.5 mx-auto text-emerald-500" /> : `#${rank}`}
      </span>

      {/* Name */}
      <span className={cn(
        "flex-1 text-xs sm:text-sm font-medium truncate min-w-0",
        isYou ? "text-emerald-500" : "text-foreground"
      )}>
        {name}
      </span>

      {/* Mentions */}
      <span className="text-[10px] sm:text-xs text-foreground font-semibold w-8 text-center">
        {mentions}
      </span>

      {/* Platforms */}
      <span className="text-[10px] sm:text-xs text-muted-foreground w-6 text-center">
        {platforms}
      </span>

      {/* Avg Position */}
      <span className="text-[10px] sm:text-xs text-muted-foreground w-8 text-center">
        #{avgPosition.toFixed(1)}
      </span>

      {/* Sentiment Badge */}
      <Badge
        variant="outline"
        className={cn(
          "text-[8px] sm:text-[9px] px-1 py-0 h-4 capitalize",
          sentimentColor[sentiment] || "text-muted-foreground",
          sentimentBg[sentiment] || "bg-muted/20"
        )}
      >
        {sentiment.slice(0, 3)}
      </Badge>

      {/* SOV */}
      <span className="text-[10px] sm:text-xs font-semibold w-8 text-right text-foreground">
        {sov}%
      </span>
    </div>
  )
}

// ============================================
// MAIN COMPONENT
// ============================================

export function CompetitorComparison({
  competitors,
  yourBrand = "Your Brand",
  yourMentions,
  yourSOV,
  yourPlatforms = 4,
  yourAvgPosition = 1.2,
  yourSentiment = "positive",
  onRequestScan,
}: CompetitorComparisonProps) {
  // Derived metrics
  const allMentions = [yourMentions, ...competitors.map(c => c.mentions)]
  const maxMentions = Math.max(...allMentions, 1)
  const maxPlatforms = Math.max(4, ...competitors.map(c => c.platforms.length), yourPlatforms)
  const yourRank = competitors.filter(c => c.mentions > yourMentions).length + 1
  const totalMentions = yourMentions + competitors.reduce((s, c) => s + c.mentions, 0)
  const avgCompetitorSOV = competitors.length > 0
    ? Math.round(competitors.reduce((s, c) => s + c.shareOfVoice, 0) / competitors.length)
    : 0

  // Sort competitors by mentions descending for detail table
  const sorted = [...competitors].sort((a, b) => b.mentions - a.mentions)

  // ── Empty state ──
  if (competitors.length === 0) {
    return (
      <Card className="bg-card border-border p-3 sm:p-4 md:p-6">
        <div className="flex items-center gap-2 sm:gap-2.5 mb-4">
          <Swords className="h-4 w-4 sm:h-5 sm:w-5 text-cyan-400 shrink-0" />
          <h3 className="text-sm sm:text-base md:text-lg font-semibold text-foreground">
            Competitor Comparison
          </h3>
        </div>
        <div className="flex flex-col items-center justify-center py-8 sm:py-12 text-center">
          <div className="p-3 rounded-full bg-muted/50 mb-4">
            <Users className="h-8 w-8 text-muted-foreground/40" />
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">
            No competitor data yet
          </h3>
          <p className="text-sm text-muted-foreground max-w-sm mb-5">
            Run scans to discover which competitors appear alongside your brand in AI responses.
          </p>
          <Button variant="outline" size="sm" className="h-9 gap-1.5" onClick={onRequestScan}>
            <Search className="h-4 w-4" />
            Run a Scan to Discover Competitors
          </Button>
        </div>
      </Card>
    )
  }

  // ── Main card ──
  return (
    <Card className="bg-card border-border p-3 sm:p-4 md:p-6">
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-3 sm:mb-4 md:mb-6">
        <div className="flex items-center gap-2 sm:gap-2.5">
          <Swords className="h-4 w-4 sm:h-5 sm:w-5 text-cyan-400 shrink-0" />
          <h3 className="text-sm sm:text-base md:text-lg font-semibold text-foreground">
            Competitor Comparison
          </h3>
        </div>
        <Badge variant="secondary" className="text-[9px] sm:text-[10px] md:text-xs font-medium">
          {competitors.length} tracked
        </Badge>
      </div>

      {/* ── Stats Row — 4 stat boxes ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2 md:gap-3 mb-3 sm:mb-4 md:mb-6">
        <StatBox
          label="Your Rank"
          value={`#${yourRank}`}
          color={yourRank === 1 ? "text-emerald-500" : yourRank <= 3 ? "text-amber-500" : "text-red-500"}
          subtext={`of ${competitors.length + 1} brands`}
        />
        <StatBox
          label="Your SOV"
          value={yourSOV}
          suffix="%"
          color={yourSOV >= 50 ? "text-emerald-500" : yourSOV >= 25 ? "text-amber-500" : "text-red-500"}
          subtext={`vs avg ${avgCompetitorSOV}%`}
        />
        <StatBox
          label="Total Mentions"
          value={totalMentions}
          color="text-foreground"
          subtext={`${yourMentions} yours`}
        />
        <StatBox
          label="Competitors"
          value={competitors.length}
          color="text-foreground"
          subtext="tracked brands"
        />
      </div>

      {/* ── Grouped Vertical Bar Chart ── */}
      <div className="relative h-40 sm:h-48 md:h-56 mt-1 sm:mt-2">
        {/* Horizontal gridlines */}
        <div className="absolute left-6 sm:left-8 md:left-10 right-0 top-0 bottom-10 sm:bottom-12 flex flex-col justify-between pointer-events-none">
          <div className="border-t border-dashed border-border/30 w-full" />
          <div className="border-t border-dashed border-border/30 w-full" />
          <div className="border-t border-dashed border-border/30 w-full" />
          <div className="border-t border-dashed border-border/20 w-full" />
        </div>

        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-10 sm:bottom-12 flex flex-col justify-between text-[8px] sm:text-[10px] md:text-xs text-muted-foreground w-5 sm:w-6 md:w-8">
          <span>{maxMentions}</span>
          <span>{Math.round(maxMentions * 0.66)}</span>
          <span>{Math.round(maxMentions * 0.33)}</span>
          <span>0</span>
        </div>

        {/* Chart area */}
        <div className="ml-6 sm:ml-8 md:ml-10 h-full flex items-end gap-2 sm:gap-3 md:gap-4">
          {/* Your Brand grouped bars */}
          <CompetitorBarGroup
            name={yourBrand}
            mentions={yourMentions}
            platforms={yourPlatforms}
            avgPosition={yourAvgPosition}
            sentiment={yourSentiment}
            sov={yourSOV}
            maxMentions={maxMentions}
            maxPlatforms={maxPlatforms}
            isYou={true}
          />
          {/* Competitor grouped bars — sorted by mentions desc */}
          {sorted.slice(0, 5).map((comp) => (
            <CompetitorBarGroup
              key={comp.domain}
              name={comp.domain}
              mentions={comp.mentions}
              platforms={comp.platforms.length}
              avgPosition={comp.avgPosition}
              sentiment={comp.sentiment}
              sov={comp.shareOfVoice}
              maxMentions={maxMentions}
              maxPlatforms={maxPlatforms}
              isYou={false}
            />
          ))}
        </div>
      </div>

      {/* ── Legend — 3 bar types ── */}
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 md:gap-6 mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-border/50">
        <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2">
          <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 rounded-sm bg-linear-to-t from-emerald-500 to-emerald-400" />
          <span className="text-[9px] sm:text-[10px] md:text-xs text-muted-foreground font-medium">Mentions</span>
        </div>
        <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2">
          <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 rounded-sm bg-linear-to-t from-amber-500 to-amber-400" />
          <span className="text-[9px] sm:text-[10px] md:text-xs text-muted-foreground font-medium">Platforms</span>
        </div>
        <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2">
          <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 rounded-sm bg-linear-to-t from-blue-500 to-blue-400" />
          <span className="text-[9px] sm:text-[10px] md:text-xs text-muted-foreground font-medium">Position Score</span>
        </div>
      </div>

      {/* ── Detail Breakdown Table ── */}
      <div className="mt-3 sm:mt-4 md:mt-5">
        <h4 className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
          Detailed Breakdown
        </h4>

        {/* Table header */}
        <div className="flex items-center gap-2 sm:gap-3 py-1 px-2 sm:px-3 text-[8px] sm:text-[9px] text-muted-foreground font-medium border-b border-border/30">
          <span className="w-5 text-center">#</span>
          <span className="flex-1">Brand</span>
          <span className="w-8 text-center">Mentions</span>
          <span className="w-6 text-center flex items-center justify-center" title="Platforms">
            <Globe className="h-2.5 w-2.5" />
          </span>
          <span className="w-8 text-center flex items-center justify-center" title="Avg Position">
            <MapPin className="h-2.5 w-2.5" />
          </span>
          <span className="w-10 text-center">Sent.</span>
          <span className="w-8 text-right">SOV</span>
        </div>

        {/* Your brand row */}
        <CompetitorDetailRow
          rank={yourRank}
          name={yourBrand}
          mentions={yourMentions}
          platforms={yourPlatforms}
          avgPosition={yourAvgPosition}
          sentiment={yourSentiment}
          sov={yourSOV}
          isYou={true}
        />

        {/* Competitor rows sorted by mentions */}
        {sorted.slice(0, 5).map((comp, i) => {
          // Calculate correct rank: count how many have more mentions than this competitor (+1 for zero-index, +1 for your brand if you have more)
          const compRank = [yourMentions, ...sorted.map(c => c.mentions)]
            .sort((a, b) => b - a)
            .indexOf(comp.mentions) + 1

          return (
            <CompetitorDetailRow
              key={comp.domain}
              rank={compRank}
              name={comp.domain}
              mentions={comp.mentions}
              platforms={comp.platforms.length}
              avgPosition={comp.avgPosition}
              sentiment={comp.sentiment}
              sov={comp.shareOfVoice}
              isYou={false}
            />
          )
        })}
      </div>

      {/* ── Insight ── */}
      <div className="mt-3 sm:mt-4 p-2 sm:p-2.5 md:p-3 rounded-lg border border-border bg-muted/30">
        <div className="flex items-start gap-1.5 sm:gap-2">
          <Info className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 text-cyan-400 mt-0.5 shrink-0" />
          <p className="text-[9px] sm:text-[10px] md:text-xs text-muted-foreground leading-relaxed">
            {yourRank === 1
              ? `You're leading! ${yourBrand} has the highest AI Share of Voice at ${yourSOV}% across ${totalMentions} total mentions.`
              : `${sorted[0]?.domain || "A competitor"} leads with ${sorted[0]?.mentions || 0} mentions. Target their keywords to improve your rank.`
            }
          </p>
        </div>
      </div>
    </Card>
  )
}
