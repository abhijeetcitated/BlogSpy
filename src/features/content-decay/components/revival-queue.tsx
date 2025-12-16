// ============================================
// CONTENT DECAY - Revival Queue Component
// ============================================
// Critical articles requiring immediate attention

import {
  Heart,
  AlertTriangle,
  TrendingDown,
  ExternalLink,
  Sparkles,
  Loader2,
  CheckCircle2,
  EyeOff,
  MoreVertical,
  Eye,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import type { DecayArticle } from "../types"
import { getDecayReasonDisplay } from "../utils"
import { DecaySparkline } from "./decay-sparkline"
import { forwardRef } from "react"

interface RevivalQueueProps {
  articles: DecayArticle[]
  revivingIds: Set<string>
  scheduledIds: Set<string>
  highlightedArticleId: string | null
  onReviveWithAI: (articleId: string) => void
  onMarkFixed?: (articleId: string) => void
  onIgnore?: (articleId: string) => void
  onViewDetails?: (articleId: string) => void
  setArticleRef: (articleId: string, el: HTMLDivElement | null) => void
}

export function RevivalQueue({
  articles,
  revivingIds,
  scheduledIds,
  highlightedArticleId,
  onReviveWithAI,
  onMarkFixed,
  onIgnore,
  onViewDetails,
  setArticleRef,
}: RevivalQueueProps) {
  if (articles.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-6 sm:p-8 text-center">
        <Heart className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-500 mx-auto mb-2 sm:mb-3" />
        <h3 className="text-base sm:text-lg font-semibold text-foreground mb-1">No Critical Articles</h3>
        <p className="text-xs sm:text-sm text-muted-foreground">All critical articles have been addressed!</p>
      </div>
    )
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="flex flex-col xs:flex-row items-start xs:items-center gap-1 xs:gap-2">
        <div className="flex items-center gap-2">
          <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 dark:text-red-400" />
          <h2 className="text-base sm:text-lg font-semibold text-foreground">Revival Queue</h2>
        </div>
        <span className="text-[10px] sm:text-xs text-muted-foreground xs:ml-2">
          Critical articles requiring immediate attention
        </span>
      </div>

      <div className="space-y-2 sm:space-y-3">
        {articles.map((article) => {
          const isReviving = revivingIds.has(article.id)
          const isScheduled = scheduledIds.has(article.id)
          const isHighlighted = highlightedArticleId === article.id

          return (
            <RevivalCard
              key={article.id}
              ref={(el) => setArticleRef(article.id, el)}
              article={article}
              isReviving={isReviving}
              isScheduled={isScheduled}
              isHighlighted={isHighlighted}
              onReviveWithAI={() => onReviveWithAI(article.id)}
              onMarkFixed={onMarkFixed ? () => onMarkFixed(article.id) : undefined}
              onIgnore={onIgnore ? () => onIgnore(article.id) : undefined}
              onViewDetails={onViewDetails ? () => onViewDetails(article.id) : undefined}
            />
          )
        })}
      </div>
    </div>
  )
}

interface RevivalCardProps {
  article: DecayArticle
  isReviving: boolean
  isScheduled: boolean
  isHighlighted: boolean
  onReviveWithAI: () => void
  onMarkFixed?: () => void
  onIgnore?: () => void
  onViewDetails?: () => void
}

const RevivalCard = forwardRef<HTMLDivElement, RevivalCardProps>(
  ({ article, isReviving, isScheduled, isHighlighted, onReviveWithAI, onMarkFixed, onIgnore, onViewDetails }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "p-3 sm:p-4 rounded-xl bg-card border transition-all duration-300",
          isHighlighted
            ? "border-primary/50 ring-2 ring-primary/20 bg-accent"
            : "border-red-500/30 dark:border-red-900/50 hover:border-red-500/50 dark:hover:border-red-800/60"
        )}
      >
        <div className="flex flex-col lg:flex-row lg:items-center gap-3 sm:gap-4">
          {/* Title and badges */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 md:gap-3 mb-2">
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-xs sm:text-sm lg:text-base text-foreground hover:text-red-600 dark:hover:text-red-400 transition-colors flex items-center gap-1 sm:gap-1.5 group line-clamp-2"
              >
                {article.title}
                <ExternalLink className="w-3 h-3 sm:w-3.5 sm:h-3.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
              </a>
            </div>
            
            {/* Badges row */}
            <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-2">
              <span className="flex items-center gap-1 px-1.5 sm:px-2 lg:px-2.5 py-0.5 lg:py-1 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 text-[10px] sm:text-xs lg:text-sm">
                <AlertTriangle className="w-2.5 h-2.5 sm:w-3 sm:h-3 lg:w-3.5 lg:h-3.5" />
                {getDecayReasonDisplay(article.decayReason)}
              </span>
              {isScheduled && (
                <span className="flex items-center gap-1 px-1.5 sm:px-2 lg:px-2.5 py-0.5 lg:py-1 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] sm:text-xs lg:text-sm">
                  <CheckCircle2 className="w-2.5 h-2.5 sm:w-3 sm:h-3 lg:w-3.5 lg:h-3.5" />
                  Scheduled
                </span>
              )}
            </div>

            {/* Stats row */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 lg:gap-6 text-[11px] sm:text-xs lg:text-sm">
              <div className="flex items-center gap-1 sm:gap-2">
                <span className="text-muted-foreground">Rank:</span>
                <span className="text-red-600 dark:text-red-400 font-medium">
                  #{article.currentRank}
                </span>
                <span className="text-muted-foreground text-[9px] sm:text-[10px] lg:text-xs">
                  (was #{article.previousRank})
                </span>
                <TrendingDown className="w-2.5 h-2.5 sm:w-3 sm:h-3 lg:w-4 lg:h-4 text-red-600 dark:text-red-400" />
              </div>
              <div className="flex items-center gap-1 sm:gap-2">
                <span className="text-muted-foreground">Traffic Loss:</span>
                <span className="text-red-600 dark:text-red-400 font-medium">
                  {article.trafficLoss.toLocaleString()}/mo
                </span>
              </div>
              <div className="hidden sm:flex items-center gap-2">
                <span className="text-muted-foreground">Trend:</span>
                <DecaySparkline data={article.trendData} width={60} height={20} />
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 lg:shrink-0 lg:ml-4">
            <Button
              onClick={onReviveWithAI}
              disabled={isReviving}
              className="flex-1 sm:flex-none bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white gap-1.5 sm:gap-2 shadow-lg shadow-violet-900/40 h-8 sm:h-9 lg:h-10 text-xs sm:text-sm lg:text-base"
            >
              {isReviving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" />
                  <span className="hidden xs:inline">Reviving...</span>
                  <span className="xs:hidden">...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span>Revive with AI</span>
                </>
              )}
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="shrink-0 h-8 w-8 sm:h-9 sm:w-9 lg:h-10 lg:w-10">
                  <MoreVertical className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onViewDetails && (
                  <DropdownMenuItem onClick={onViewDetails} className="gap-2 text-xs sm:text-sm lg:text-base">
                    <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-blue-500" />
                    View Details
                  </DropdownMenuItem>
                )}
                {onViewDetails && (onMarkFixed || onIgnore) && <DropdownMenuSeparator />}
                {onMarkFixed && (
                  <DropdownMenuItem onClick={onMarkFixed} className="gap-2 text-xs sm:text-sm lg:text-base">
                    <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-emerald-500" />
                    Mark as Fixed
                  </DropdownMenuItem>
                )}
                {onIgnore && (
                  <DropdownMenuItem onClick={onIgnore} className="gap-2 text-xs sm:text-sm lg:text-base text-muted-foreground">
                    <EyeOff className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
                    Ignore Article
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    )
  }
)

RevivalCard.displayName = "RevivalCard"
