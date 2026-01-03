// ============================================
// CONTENT DECAY - Article Detail Modal
// ============================================
// Full article decay details in a modal

import {
  TrendingDown,
  Calendar,
  ExternalLink,
  AlertTriangle,
  BarChart3,
  ArrowDownRight,
  ArrowUpRight,
  Clock,
  Target,
  DollarSign,
  Sparkles,
  CheckCircle,
  EyeOff,
  RefreshCw,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { DecayArticle } from "../types"
import { getDecayReasonDisplay, getDecayZone } from "../utils"
import { DecaySparkline } from "./decay-sparkline"

interface ArticleDetailModalProps {
  article: DecayArticle | null
  isOpen: boolean
  onClose: () => void
  onReviveWithAI?: (articleId: string) => void
  onMarkFixed?: (articleId: string) => void
  onIgnore?: (articleId: string) => void
  isReviving?: boolean
}

export function ArticleDetailModal({
  article,
  isOpen,
  onClose,
  onReviveWithAI,
  onMarkFixed,
  onIgnore,
  isReviving,
}: ArticleDetailModalProps) {
  if (!article) return null

  const rankChange = article.previousRank - article.currentRank
  const rankChangePercent = Math.abs((rankChange / article.previousRank) * 100).toFixed(1)
  const zone = getDecayZone(article)
  
  const zoneColors = {
    critical: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30",
    watch: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30",
    low: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30",
    stable: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
  }

  const zoneLabels = {
    critical: "Critical",
    watch: "Watching",
    low: "Low Priority",
    stable: "Stable",
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[95vw] max-w-md sm:max-w-lg p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-start gap-2 sm:gap-3">
            <div className="flex-1 min-w-0">
              <h3 className="text-base sm:text-lg font-semibold text-foreground line-clamp-2 pr-4">
                {article.title}
              </h3>
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs sm:text-sm text-muted-foreground hover:text-primary flex items-center gap-1 mt-1"
              >
                <ExternalLink className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                <span className="truncate">{article.url}</span>
              </a>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 sm:space-y-5 py-2">
          {/* Status Badges */}
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            <Badge className={cn("border text-[10px] sm:text-xs", zoneColors[zone])}>
              {zoneLabels[zone]}
            </Badge>
            <Badge variant="outline" className="gap-1 text-[10px] sm:text-xs">
              <AlertTriangle className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              {getDecayReasonDisplay(article.decayReason)}
            </Badge>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            {/* Current Rank */}
            <div className="p-2 sm:p-3 rounded-lg bg-muted/30 border border-border/50">
              <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-muted-foreground mb-1">
                <Target className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                Current Rank
              </div>
              <div className="flex items-baseline gap-1.5 sm:gap-2">
                <span className="text-lg sm:text-2xl font-bold text-foreground">
                  #{article.currentRank}
                </span>
                <span className={cn(
                  "text-[9px] sm:text-xs flex items-center gap-0.5",
                  rankChange > 0 
                    ? "text-red-600 dark:text-red-400" 
                    : "text-emerald-600 dark:text-emerald-400"
                )}>
                  {rankChange > 0 ? (
                    <ArrowDownRight className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                  ) : (
                    <ArrowUpRight className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                  )}
                  {Math.abs(rankChange)}
                </span>
              </div>
              <div className="text-[9px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1">
                was #{article.previousRank}
              </div>
            </div>

            {/* Traffic Loss */}
            <div className="p-2 sm:p-3 rounded-lg bg-muted/30 border border-border/50">
              <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-muted-foreground mb-1">
                <TrendingDown className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                Traffic Lost
              </div>
              <div className="text-lg sm:text-2xl font-bold text-red-600 dark:text-red-400">
                -{article.trafficLoss.toLocaleString()}
              </div>
              <div className="text-[9px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1">
                visitors/mo
              </div>
            </div>

            {/* Decay Rate */}
            <div className="p-2 sm:p-3 rounded-lg bg-muted/30 border border-border/50">
              <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-muted-foreground mb-1">
                <BarChart3 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                Decay Rate
              </div>
              <div className="text-lg sm:text-2xl font-bold text-amber-600 dark:text-amber-400">
                {article.decayRate}%
              </div>
              <div className="text-[9px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1">
                monthly
              </div>
            </div>

            {/* Traffic Value */}
            <div className="p-2 sm:p-3 rounded-lg bg-muted/30 border border-border/50">
              <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-muted-foreground mb-1">
                <DollarSign className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                Traffic Value
              </div>
              <div className="text-lg sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                ${article.trafficValue.toLocaleString()}
              </div>
              <div className="text-[9px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1">
                estimated
              </div>
            </div>
          </div>

          {/* Trend Chart */}
          <div className="p-3 sm:p-4 rounded-lg bg-muted/30 border border-border/50">
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium text-foreground">
                <BarChart3 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                Traffic Trend (12 Weeks)
              </div>
            </div>
            <div className="h-12 sm:h-16 flex items-end justify-between gap-0.5 sm:gap-1">
              {article.trendData.map((value, idx) => {
                const max = Math.max(...article.trendData)
                const height = (value / max) * 100
                const isLast = idx === article.trendData.length - 1
                return (
                  <div
                    key={idx}
                    className={cn(
                      "flex-1 rounded-t-sm transition-all",
                      isLast 
                        ? "bg-red-500/80" 
                        : "bg-muted-foreground/20 hover:bg-muted-foreground/30"
                    )}
                    style={{ height: `${Math.max(height, 5)}%` }}
                    title={`Week ${idx + 1}: ${value.toLocaleString()} visits`}
                  />
                )
              })}
            </div>
            <div className="flex justify-between mt-1.5 sm:mt-2 text-[9px] sm:text-xs text-muted-foreground">
              <span>12 weeks ago</span>
              <span>Now</span>
            </div>
          </div>

          {/* Last Updated */}
          <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-muted-foreground">
            <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Last updated: {article.lastUpdated}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 pt-2 border-t border-border/50">
          {onReviveWithAI && (
            <Button
              onClick={() => onReviveWithAI(article.id)}
              disabled={isReviving}
              className="w-full gap-1.5 sm:gap-2 bg-linear-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white h-9 sm:h-10 text-xs sm:text-sm"
            >
              {isReviving ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" />
                  Reviving...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  Revive with AI
                </>
              )}
            </Button>
          )}
          
          <div className="flex gap-2">
            {onMarkFixed && (
              <Button
                variant="outline"
                onClick={() => {
                  onMarkFixed(article.id)
                  onClose()
                }}
                className="flex-1 gap-1.5 sm:gap-2 h-8 sm:h-9 text-xs sm:text-sm"
              >
                <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 dark:text-emerald-400" />
                Mark Fixed
              </Button>
            )}
            {onIgnore && (
              <Button
                variant="ghost"
                onClick={() => {
                  onIgnore(article.id)
                  onClose()
                }}
                className="flex-1 gap-1.5 sm:gap-2 text-muted-foreground h-8 sm:h-9 text-xs sm:text-sm"
              >
                <EyeOff className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                Ignore
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
