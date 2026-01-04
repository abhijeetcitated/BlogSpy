"use client"

// ============================================
// GEO COLUMN - GEO (AI visibility) score display
// ============================================

import { cn } from "@/lib/utils"
import { Bot, Globe } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface GeoColumnProps {
  geoScore?: number
  country?: string
  countryCode?: string
  showFlag?: boolean
  showName?: boolean
  className?: string
}

// Country code to flag emoji
const getFlagEmoji = (countryCode: string): string => {
  const code = countryCode.toUpperCase()
  const offset = 127397
  return [...code].map((c) => String.fromCodePoint(c.charCodeAt(0) + offset)).join("")
}

// Get score color based on value
const getScoreColor = (score: number): string => {
  if (score >= 80) return "text-green-500 bg-green-500/10 border-green-500/20"
  if (score >= 60) return "text-yellow-500 bg-yellow-500/10 border-yellow-500/20"
  if (score >= 40) return "text-orange-500 bg-orange-500/10 border-orange-500/20"
  return "text-red-500 bg-red-500/10 border-red-500/20"
}

const getScoreLabel = (score: number): string => {
  if (score >= 80) return "Excellent AI visibility"
  if (score >= 60) return "Good AI visibility"
  if (score >= 40) return "Moderate AI visibility"
  return "Low AI visibility"
}

export function GeoColumn({
  geoScore,
  country,
  countryCode,
  showFlag = true,
  showName = true,
  className,
}: GeoColumnProps) {
  // If we have a geoScore, show the AI visibility score
  if (geoScore !== undefined) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            variant="outline"
            className={cn("h-6 gap-1", getScoreColor(geoScore), className)}
          >
            <Bot className="h-3 w-3" />
            <span className="text-xs tabular-nums">{geoScore}</span>
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p className="font-medium">{getScoreLabel(geoScore)}</p>
          <p className="text-xs text-muted-foreground">GEO Score: {geoScore}/100</p>
        </TooltipContent>
      </Tooltip>
    )
  }

  // Fallback: show country if provided
  if (countryCode) {
    const flag = getFlagEmoji(countryCode)
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn("flex items-center gap-1.5", className)}>
            {showFlag && <span className="text-base">{flag}</span>}
            {showName && (
              <span className="text-sm text-muted-foreground truncate max-w-[60px]">
                {countryCode.toUpperCase()}
              </span>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            {country || countryCode.toUpperCase()}
          </div>
        </TooltipContent>
      </Tooltip>
    )
  }

  // No data
  return <span className="text-muted-foreground">—</span>
}
