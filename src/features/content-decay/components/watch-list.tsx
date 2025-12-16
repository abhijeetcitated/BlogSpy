// ============================================
// CONTENT DECAY - Watch List Component
// ============================================
// Articles showing early signs of decay

import {
  Zap,
  AlertTriangle,
  RefreshCw,
  CheckCircle2,
  MoreVertical,
  CheckCircle,
  EyeOff,
  Clock,
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

interface WatchListProps {
  articles: DecayArticle[]
  scheduledIds: Set<string>
  highlightedArticleId: string | null
  onSchedule: (articleId: string) => void
  onMarkFixed?: (articleId: string) => void
  onIgnore?: (articleId: string) => void
  onViewDetails?: (articleId: string) => void
  setArticleRef: (articleId: string, el: HTMLDivElement | null) => void
}

export function WatchList({
  articles,
  scheduledIds,
  highlightedArticleId,
  onSchedule,
  onMarkFixed,
  onIgnore,
  onViewDetails,
  setArticleRef,
}: WatchListProps) {
  if (articles.length === 0) {
    return (
      <div className="space-y-3 sm:space-y-4">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 dark:text-amber-400" />
          <h2 className="text-base sm:text-lg font-semibold text-foreground">Watch List</h2>
        </div>
        <div className="flex flex-col items-center justify-center py-8 sm:py-12 px-4 rounded-xl border border-dashed border-amber-500/20 dark:border-amber-900/30 bg-muted/30">
          <Clock className="w-8 h-8 sm:w-10 sm:h-10 text-amber-500/50 mb-2 sm:mb-3" />
          <p className="text-muted-foreground text-xs sm:text-sm text-center">
            No articles in watch list
          </p>
          <p className="text-muted-foreground/60 text-[10px] sm:text-xs text-center mt-1">
            Articles showing early decay signs will appear here
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="flex flex-col xs:flex-row items-start xs:items-center gap-1 xs:gap-2">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 dark:text-amber-400" />
          <h2 className="text-base sm:text-lg font-semibold text-foreground">Watch List</h2>
        </div>
        <span className="text-[10px] sm:text-xs text-muted-foreground xs:ml-2">
          Showing early signs of decay
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3">
        {articles.map((article) => {
          const isScheduled = scheduledIds.has(article.id)
          const isHighlighted = highlightedArticleId === article.id

          return (
            <WatchCard
              key={article.id}
              ref={(el) => setArticleRef(article.id, el)}
              article={article}
              isScheduled={isScheduled}
              isHighlighted={isHighlighted}
              onSchedule={() => onSchedule(article.id)}
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

interface WatchCardProps {
  article: DecayArticle
  isScheduled: boolean
  isHighlighted: boolean
  onSchedule: () => void
  onMarkFixed?: () => void
  onIgnore?: () => void
  onViewDetails?: () => void
}

const WatchCard = forwardRef<HTMLDivElement, WatchCardProps>(
  ({ article, isScheduled, isHighlighted, onSchedule, onMarkFixed, onIgnore, onViewDetails }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "p-3 sm:p-4 rounded-xl bg-card border transition-all duration-300",
          isHighlighted
            ? "border-primary/50 ring-2 ring-primary/20 bg-accent"
            : "border-amber-500/20 dark:border-amber-900/30 hover:border-amber-500/40 dark:hover:border-amber-800/40"
        )}
      >
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
          {/* Title and badge */}
          <div className="flex-1 min-w-0">
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-xs sm:text-sm lg:text-base text-foreground mb-2 block hover:text-amber-600 dark:hover:text-amber-400 transition-colors line-clamp-2"
            >
              {article.title}
            </a>
            <span className="inline-flex items-center gap-1 px-1.5 sm:px-2 lg:px-2.5 py-0.5 lg:py-1 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400/80 text-[10px] sm:text-xs lg:text-sm">
              <AlertTriangle className="w-2.5 h-2.5 sm:w-3 sm:h-3 lg:w-3.5 lg:h-3.5" />
              {getDecayReasonDisplay(article.decayReason)}
            </span>
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2 sm:mt-3 text-[11px] sm:text-sm lg:text-base">
              <div className="flex items-center gap-1 sm:gap-1.5">
                <span className="text-muted-foreground text-[10px] sm:text-xs">Rank:</span>
                <span className="text-amber-600 dark:text-amber-400 font-medium">
                  #{article.currentRank}
                </span>
              </div>
              <div className="flex items-center gap-1 sm:gap-1.5">
                <span className="text-muted-foreground text-[10px] sm:text-xs">Loss:</span>
                <span className="text-amber-700/80 dark:text-amber-400/80">{article.trafficLoss}/mo</span>
              </div>
              <div className="hidden xs:block">
                <DecaySparkline data={article.trendData} width={50} height={18} />
              </div>
            </div>
          </div>
          
          {/* Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2 sm:shrink-0 sm:ml-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={onSchedule}
              disabled={isScheduled}
              className={cn(
                "flex-1 sm:flex-none text-[10px] sm:text-xs lg:text-sm transition-all h-7 sm:h-8 lg:h-9 sm:px-4",
                isScheduled
                  ? "border-emerald-500/50 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 dark:bg-emerald-900/20 hover:bg-emerald-500/20 dark:hover:bg-emerald-900/30"
                  : "border-amber-500/30 dark:border-amber-800/50 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 dark:hover:bg-amber-900/20 bg-transparent"
              )}
            >
              {isScheduled ? (
                <>
                  <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1 sm:mr-1.5" />
                  <span className="hidden xs:inline">Scheduled ✓</span>
                  <span className="xs:hidden">Done</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1 sm:mr-1.5" />
                  Schedule
                </>
              )}
            </Button>
            
            {(onMarkFixed || onIgnore || onViewDetails) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 sm:h-8 sm:w-8 lg:h-9 lg:w-9 text-muted-foreground hover:text-foreground shrink-0"
                  >
                    <MoreVertical className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-36 sm:w-40 lg:w-44">
                  {onViewDetails && (
                    <DropdownMenuItem onClick={onViewDetails} className="text-xs sm:text-sm lg:text-base">
                      <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5 mr-2 text-blue-500" />
                      <span>View Details</span>
                    </DropdownMenuItem>
                  )}
                  {onViewDetails && (onMarkFixed || onIgnore) && <DropdownMenuSeparator />}
                  {onMarkFixed && (
                    <DropdownMenuItem onClick={onMarkFixed} className="text-xs sm:text-sm lg:text-base">
                      <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5 mr-2 text-emerald-600 dark:text-emerald-400" />
                      <span>Mark as Fixed</span>
                    </DropdownMenuItem>
                  )}
                  {onIgnore && (
                    <DropdownMenuItem onClick={onIgnore} className="text-xs sm:text-sm lg:text-base">
                      <EyeOff className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5 mr-2 text-muted-foreground" />
                      <span>Ignore Article</span>
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>
    )
  }
)

WatchCard.displayName = "WatchCard"
