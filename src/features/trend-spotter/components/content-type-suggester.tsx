"use client"

import Link from "next/link"

import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

import type { ContentTypeData, ContentTypeSuggestion, ContentType, VelocityDataPoint } from "../types"
import { contentTypeData } from "../__mocks__"
import { StarIcon, LightbulbIcon, DocumentIcon, VideoIcon, SocialIcon, WriteIcon } from "./icons"

// Icon mapping for content types
const contentTypeIcons: Record<ContentType, typeof DocumentIcon> = {
  blog: DocumentIcon,
  video: VideoIcon,
  social: SocialIcon,
}

interface ContentTypeSuggesterProps {
  searchQuery: string
  data?: ContentTypeData
  className?: string
  chartData?: TrendScoreInputPoint[]
  webVolume?: number | null
  youtubeVolume?: number | null
}

type TrendScorePoint = {
  date?: string
  web?: number | null
  youtube?: number | null
  news?: number | null
  shopping?: number | null
}

type TrendScoreInputPoint = TrendScorePoint | VelocityDataPoint

type TrendPlatform = "web" | "youtube" | "news"

// Render stars based on count
function RenderStars({ count, maxStars = 5 }: { count: number; maxStars?: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: maxStars }).map((_, i) => (
        <StarIcon
          key={i}
          filled={i < count}
          className={cn(
            "h-3 w-3",
            i < count ? "text-amber-400" : "text-muted-foreground/30"
          )}
        />
      ))}
    </div>
  )
}

function readTrendValue(point: TrendScoreInputPoint, key: TrendPlatform): number | null {
  if (key in point) {
    const value = (point as TrendScorePoint)[key]
    return typeof value === "number" && Number.isFinite(value) ? value : null
  }

  if (key === "web" && "actual" in point) {
    const value = (point as VelocityDataPoint).actual
    return typeof value === "number" && Number.isFinite(value) ? value : null
  }

  return null
}

function averageLastN(chartData: TrendScoreInputPoint[], key: TrendPlatform, count = 3): number | null {
  if (!chartData.length) return null

  const values: number[] = []
  for (let i = chartData.length - 1; i >= 0 && values.length < count; i -= 1) {
    const value = readTrendValue(chartData[i], key)
    if (value !== null) {
      values.push(value)
    }
  }

  if (values.length === 0) return null
  const sum = values.reduce((acc, val) => acc + val, 0)
  return sum / values.length
}

// Single content type card
function ContentTypeCard({ 
  item, 
  searchQuery,
  isPrimary 
}: { 
  item: ContentTypeSuggestion
  searchQuery: string
  isPrimary: boolean 
}) {
  const actionUrl = item.actionUrl.includes("?")
    ? `${item.actionUrl}&topic=${encodeURIComponent(searchQuery)}`
    : `${item.actionUrl}?topic=${encodeURIComponent(searchQuery)}`

  // Get the appropriate icon component
  const IconComponent = contentTypeIcons[item.type]
  
  return (
    <div
      className={cn(
        "flex flex-col items-center p-2.5 sm:p-4 rounded-lg border transition-all",
        isPrimary
          ? "bg-amber-500/10 border-amber-500/30"
          : "bg-muted/30 border-border/50 hover:border-muted-foreground/30"
      )}
    >
      {/* Icon */}
      <div className={cn(
        "h-8 w-8 sm:h-10 sm:w-10 rounded-lg flex items-center justify-center mb-1.5 sm:mb-2",
        isPrimary 
          ? "bg-amber-500/20" 
          : "bg-muted/50"
      )}>
        <IconComponent className={cn(
          "h-4 w-4 sm:h-5 sm:w-5",
          isPrimary ? "text-amber-400" : "text-muted-foreground"
        )} />
      </div>
      
      {/* Label */}
      <span className={cn(
        "text-xs sm:text-sm font-semibold mb-0.5 sm:mb-1 text-center",
        isPrimary ? "text-amber-400" : "text-foreground"
      )}>
        {item.label}
      </span>
      
      {/* Match Score Bar */}
      <div className="w-full h-1 sm:h-1.5 bg-muted rounded-full overflow-hidden mb-1.5 sm:mb-2">
        <div
          className={cn(
            "h-full rounded-full transition-all",
            isPrimary 
              ? "bg-linear-to-r from-amber-500 to-orange-500" 
              : "bg-muted-foreground/50"
          )}
          style={{ width: `${item.matchScore}%` }}
        />
      </div>
      
      {/* Match Percentage */}
      <span className={cn(
        "text-[10px] sm:text-xs font-medium mb-1.5 sm:mb-2",
        isPrimary ? "text-amber-400" : "text-muted-foreground"
      )}>
        {item.matchScore}%
      </span>
      
      {/* Stars - Hidden on mobile */}
      <div className="hidden sm:block">
        <RenderStars count={item.stars} />
      </div>
      
      {/* Action Button */}
      <Button
        size="sm"
        variant={isPrimary ? "default" : "outline"}
        className={cn(
          "w-full mt-2 sm:mt-3 h-7 sm:h-8 text-[10px] sm:text-xs",
          isPrimary && "bg-linear-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-black font-semibold"
        )}
        asChild
      >
        <Link href={actionUrl}>
          {item.actionLabel} →
        </Link>
      </Button>
    </div>
  )
}

export function ContentTypeSuggester({ 
  searchQuery, 
  data = contentTypeData,
  className,
  chartData = [],
  webVolume,
  youtubeVolume
}: ContentTypeSuggesterProps) {
  const { primaryType, dominanceLabel } = (() => {
    const avgWeb = averageLastN(chartData, "web")
    const avgYoutube = averageLastN(chartData, "youtube")
    const avgNews = averageLastN(chartData, "news")

    const entries: Array<{ platform: TrendPlatform; value: number }> = []
    if (typeof avgWeb === "number") entries.push({ platform: "web", value: avgWeb })
    if (typeof avgYoutube === "number") entries.push({ platform: "youtube", value: avgYoutube })
    if (typeof avgNews === "number") entries.push({ platform: "news", value: avgNews })

    if (entries.length === 0) {
      return { primaryType: data.primaryType, dominanceLabel: null }
    }

    const maxValue = entries.reduce((max, entry) => Math.max(max, entry.value), -Infinity)
    const winner = entries.find((entry) => entry.value === maxValue)?.platform

    if (!winner) {
      return { primaryType: data.primaryType, dominanceLabel: null }
    }

    const mappedType: ContentType =
      winner === "web" ? "blog" : winner === "youtube" ? "video" : "social"

    const labelPrefix = winner === "web" ? "Web" : winner === "youtube" ? "YouTube" : "News"
    const dominance = `${labelPrefix} Dominance: ${Math.round(maxValue)}%`

    return { primaryType: mappedType, dominanceLabel: dominance }
  })()

  const shouldBoostVideo =
    typeof youtubeVolume === "number" &&
    typeof webVolume === "number" &&
    youtubeVolume > webVolume
  const recommendations = data.recommendations.map((item) => {
    if (item.type !== "video" || !shouldBoostVideo) return item
    return { ...item, stars: 5 }
  })

  return (
    <Card className={cn("bg-card border-border", className)}>
      <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6 pt-3 sm:pt-6">
        <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-1.5 sm:gap-2">
          <WriteIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-400" />
          <span className="hidden sm:inline">Recommended Content Type</span>
          <span className="sm:hidden">Content Type</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-4 px-3 sm:px-6 pb-3 sm:pb-6">
        {dominanceLabel && (
          <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-medium text-amber-400">
            <StarIcon className="h-3 w-3 text-amber-400" filled />
            <span>{dominanceLabel}</span>
          </div>
        )}

        {/* Content Type Cards */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {recommendations.map((item) => (
            <ContentTypeCard
              key={item.type}
              item={item}
              searchQuery={searchQuery}
              isPrimary={item.type === primaryType}
            />
          ))}
        </div>

        {/* AI Insight */}
        <div className="flex items-start gap-1.5 sm:gap-2 p-2.5 sm:p-3 bg-muted/30 border border-border/50 rounded-lg">
          <LightbulbIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-400 shrink-0 mt-0.5" />
          <p className="text-xs sm:text-sm text-muted-foreground">
            <span className="text-foreground font-medium">Pro Tip: </span>
            <span className="hidden sm:inline">{data.insight}</span>
            <span className="sm:hidden">{data.insight.split('.')[0]}.</span>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
