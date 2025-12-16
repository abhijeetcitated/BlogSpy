// ============================================
// CONTENT DECAY - Decay Matrix Component
// ============================================

import { useMemo } from "react"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import type { MatrixPoint, DecayArticle } from "../types"
import { ZONE_DOT_COLORS } from "../constants"

interface DecayMatrixProps {
  matrixPoints: MatrixPoint[]
  articles: DecayArticle[]
  highlightedArticleId: string | null
  onDotClick: (articleId: string) => void
}

// Minimum distance between dots (in percentage) - increased for better separation
const MIN_DOT_DISTANCE = 12

// Calculate distance between two points
function getDistance(p1: { x: number; y: number }, p2: { x: number; y: number }): number {
  return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2))
}

// Spread overlapping dots using iterative force-directed approach
function spreadOverlappingDots(points: MatrixPoint[]): MatrixPoint[] {
  if (points.length <= 1) return points
  
  const spreadPoints = points.map(p => ({ ...p }))
  
  // Sort by zone priority (critical first) to give them better positions
  const zonePriority: Record<string, number> = { critical: 0, watch: 1, low: 2, stable: 3 }
  spreadPoints.sort((a, b) => zonePriority[a.zone] - zonePriority[b.zone])
  
  // Multiple passes to spread dots properly
  for (let pass = 0; pass < 3; pass++) {
    for (let i = 0; i < spreadPoints.length; i++) {
      for (let j = i + 1; j < spreadPoints.length; j++) {
        const distance = getDistance(spreadPoints[i], spreadPoints[j])
        
        if (distance < MIN_DOT_DISTANCE) {
          // Calculate repulsion vector
          const dx = spreadPoints[j].x - spreadPoints[i].x
          const dy = spreadPoints[j].y - spreadPoints[i].y
          const len = Math.max(distance, 0.1)
          
          // Push the lower priority dot away
          const pushDistance = (MIN_DOT_DISTANCE - distance) / 2 + 2
          spreadPoints[j].x = Math.min(92, Math.max(8, spreadPoints[j].x + (dx / len) * pushDistance))
          spreadPoints[j].y = Math.min(92, Math.max(8, spreadPoints[j].y + (dy / len) * pushDistance))
        }
      }
    }
  }
  
  return spreadPoints
}

export function DecayMatrix({
  matrixPoints,
  articles,
  highlightedArticleId,
  onDotClick,
}: DecayMatrixProps) {
  const getArticleById = (articleId: string) =>
    articles.find((a) => a.id === articleId)

  // Spread dots to prevent overlap
  const spreadPoints = useMemo(() => spreadOverlappingDots(matrixPoints), [matrixPoints])

  return (
    <div className="rounded-xl border border-border bg-card p-3 sm:p-4 lg:p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4">
        <div>
          <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-foreground">Decay Matrix</h2>
          <p className="text-xs sm:text-sm lg:text-base text-muted-foreground">
            Click on any dot to jump to that article
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 lg:gap-4 text-[10px] sm:text-xs lg:text-sm">
          <div className="flex items-center gap-1 sm:gap-1.5">
            <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 lg:w-3 lg:h-3 rounded-full bg-red-500" />
            <span className="text-muted-foreground">Urgent Fix</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-1.5">
            <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 lg:w-3 lg:h-3 rounded-full bg-amber-500" />
            <span className="text-muted-foreground">Watch</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-1.5">
            <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 lg:w-3 lg:h-3 rounded-full bg-slate-500" />
            <span className="text-muted-foreground">Low Priority</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-1.5">
            <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 lg:w-3 lg:h-3 rounded-full bg-emerald-500" />
            <span className="text-muted-foreground">Stable</span>
          </div>
        </div>
      </div>

      {/* Matrix Chart */}
      <div className="relative overflow-x-auto -mx-3 sm:mx-0 px-3 sm:px-0">
        <div className="relative h-52 sm:h-56 lg:h-80 min-w-[280px] sm:min-w-0 bg-muted/30 dark:bg-slate-900/50 rounded-lg border border-border overflow-hidden">
        {/* Quadrant backgrounds */}
        <div className="absolute inset-0 grid grid-cols-2 grid-rows-2">
          <div className="bg-muted/40 dark:bg-slate-800/30 border-r border-b border-border/30" />
          <div className="bg-red-100/40 dark:bg-red-950/20 border-b border-border/30" />
          <div className="bg-emerald-100/30 dark:bg-emerald-950/10 border-r border-border/30" />
          <div className="bg-amber-100/30 dark:bg-amber-950/10" />
        </div>

        {/* Quadrant labels */}
        <div className="absolute top-2 sm:top-3 lg:top-4 left-2 sm:left-3 lg:left-4 text-[9px] sm:text-xs lg:text-sm text-muted-foreground">
          Low Priority
        </div>
        <div className="absolute top-2 sm:top-3 lg:top-4 right-2 sm:right-3 lg:right-4 text-[9px] sm:text-xs lg:text-sm text-red-600 dark:text-red-400 font-medium">
          Urgent Fix
        </div>
        <div className="absolute bottom-2 sm:bottom-3 lg:bottom-4 left-2 sm:left-3 lg:left-4 text-[9px] sm:text-xs lg:text-sm text-emerald-600 dark:text-emerald-500">
          Stable
        </div>
        <div className="absolute bottom-2 sm:bottom-3 lg:bottom-4 right-2 sm:right-3 lg:right-4 text-[9px] sm:text-xs lg:text-sm text-amber-600 dark:text-amber-400">
          Watch
        </div>

        {/* Axis labels */}
        <div className="absolute left-1/2 -translate-x-1/2 bottom-0.5 sm:bottom-1 lg:bottom-2 text-[8px] sm:text-[10px] lg:text-xs text-muted-foreground">
          Traffic Value →
        </div>
        <div className="absolute left-0.5 sm:left-1 lg:left-2 top-1/2 -translate-y-1/2 text-[8px] sm:text-[10px] lg:text-xs text-muted-foreground rotate-[-90deg] origin-center whitespace-nowrap">
          Decay Rate →
        </div>

        {/* Data points - using spread positions to prevent overlap */}
        {spreadPoints.map((point) => {
          const article = getArticleById(point.articleId)
          const dotColor = ZONE_DOT_COLORS[point.zone]

          return (
            <Tooltip key={point.id}>
              <TooltipTrigger asChild>
                <button
                  className={cn(
                    "absolute rounded-full cursor-pointer transition-all duration-200 focus:outline-none",
                    // Much smaller dots on mobile, gradually larger on bigger screens
                    "w-1.5 h-1.5 xs:w-2 xs:h-2 sm:w-2.5 sm:h-2.5 lg:w-3 lg:h-3",
                    "hover:scale-[2] hover:z-10 active:scale-[2.5]",
                    // Shadow only on larger screens to keep dots clean on mobile
                    "sm:shadow-md",
                    dotColor,
                    highlightedArticleId === point.articleId &&
                      "ring-1 ring-white scale-[2] z-20"
                  )}
                  style={{
                    left: `${point.x}%`,
                    bottom: `${point.y}%`,
                    transform: "translate(-50%, 50%)",
                  }}
                  onClick={() => onDotClick(point.articleId)}
                />
              </TooltipTrigger>
              <TooltipContent
                side="top"
                className="bg-card border-border max-w-[200px]"
              >
                <div className="space-y-1">
                  <p className="font-medium text-foreground text-sm truncate">
                    {article?.title}
                  </p>
                  <p className="text-red-600 dark:text-red-400 text-xs">
                    Traffic Loss: {article?.trafficLoss.toLocaleString()}/mo
                  </p>
                  <p className="text-muted-foreground text-xs">
                    Click to view details
                  </p>
                </div>
              </TooltipContent>
            </Tooltip>
          )
        })}
        </div>
      </div>
    </div>
  )
}
