"use client"

import Link from "next/link"

import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

import { StarIcon, DocumentIcon, VideoIcon, SocialIcon, WriteIcon, LightbulbIcon } from "./icons"

type DataForSEOTrendsItem = {
  type?: string
  value?: number
  values?: number[]
}

type RelatedQueryItem = {
  value?: number
}

type TrendsResponse = {
  result?: Array<{
    items?: DataForSEOTrendsItem[]
    related_queries?: {
      rising?: RelatedQueryItem[]
    }
  }>
}

type ContentCard = {
  key: "blog" | "video" | "social"
  label: string
  icon: typeof DocumentIcon
  iconClassName: string
  actionLabel: string
  actionUrl: (keyword: string) => string
}

const CONTENT_CARDS: ContentCard[] = [
  {
    key: "blog",
    label: "Blog Post",
    icon: DocumentIcon,
    iconClassName: "text-blue-400",
    actionLabel: "Write",
    actionUrl: (keyword) =>
      `/dashboard/creation/ai-writer?source=trend-spotter&type=standalone&keyword=${encodeURIComponent(keyword)}`,
  },
  {
    key: "video",
    label: "Video",
    icon: VideoIcon,
    iconClassName: "text-red-400",
    actionLabel: "Script",
    actionUrl: (keyword) =>
      `/dashboard/creation/ai-writer?source=trend-spotter&type=standalone&format=script&editor=ozmeum&keyword=${encodeURIComponent(
        keyword
      )}`,
  },
  {
    key: "social",
    label: "Social Post",
    icon: SocialIcon,
    iconClassName: "text-emerald-400",
    actionLabel: "Draft",
    actionUrl: (keyword) =>
      `/dashboard/creation/ai-writer?source=trend-spotter&type=standalone&format=social&keyword=${encodeURIComponent(
        keyword
      )}`,
  },
]

function toNumeric(value: number | undefined): number | null {
  if (typeof value !== "number") return null
  if (!Number.isFinite(value)) return null
  return value
}

function averageSeries(items: DataForSEOTrendsItem[], typeFilter: string): number | null {
  const filtered = items.filter((item) => (item.type ? item.type === typeFilter : true))
  if (filtered.length === 0) return null

  const values: number[] = []
  for (const item of filtered) {
    const direct = toNumeric(item.value)
    const arrayValue = Array.isArray(item.values) ? toNumeric(item.values[0]) : null
    const v = direct ?? arrayValue
    if (v !== null) values.push(v)
  }

  if (values.length === 0) return null
  const sum = values.reduce((acc, val) => acc + val, 0)
  return sum / values.length
}

function hasBreakoutQuery(data?: TrendsResponse): boolean {
  const rising = data?.result?.[0]?.related_queries?.rising ?? []
  return rising.some((item) => (item.value ?? 0) > 5000)
}

function buildProTip(youtubeAvg: number | null, webAvg: number | null, breakout: boolean): string {
  if (breakout) {
    return "Breakout queries detected. Social content can capture viral momentum fastest."
  }
  if (youtubeAvg !== null && webAvg !== null) {
    if (youtubeAvg > webAvg) {
      return "Rising video demand suggests a high ROI on YouTube content."
    }
    if (webAvg > youtubeAvg) {
      return "Search interest favors web results, so long-form blog content should win."
    }
  }
  return "Balanced demand suggests a mixed content strategy across channels."
}

interface ContentStrategyProps {
  keyword: string
  data?: TrendsResponse
}

export function ContentStrategy({ keyword, data }: ContentStrategyProps) {
  const items = data?.result?.[0]?.items ?? []
  const webAvg = averageSeries(items, "web")
  const youtubeAvg = averageSeries(items, "youtube")
  const breakout = hasBreakoutQuery(data)

  const ratings: Record<ContentCard["key"], number> = {
    blog: 3,
    video: 3,
    social: 3,
  }
  const badges: Partial<Record<ContentCard["key"], string>> = {}

  if (youtubeAvg !== null && webAvg !== null) {
    if (youtubeAvg > webAvg) {
      ratings.video = 5
    } else if (webAvg > youtubeAvg) {
      ratings.blog = 5
    }
  }

  if (breakout) {
    ratings.social = 5
    badges.social = "Viral Alert"
  }

  const maxStars = Math.max(ratings.blog, ratings.video, ratings.social)
  const proTip = buildProTip(youtubeAvg, webAvg, breakout)

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6 pt-3 sm:pt-6">
        <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-1.5 sm:gap-2">
          <WriteIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-400" />
          <span className="hidden sm:inline">Recommended Content Type</span>
          <span className="sm:hidden">Content Type</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-4 px-3 sm:px-6 pb-3 sm:pb-6">
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {CONTENT_CARDS.map((card) => {
            const stars = ratings[card.key]
            const isTop = stars === maxStars
            const Icon = card.icon
            return (
              <div
                key={card.key}
                className={cn(
                  "flex flex-col items-center p-2.5 sm:p-4 rounded-lg border transition-all",
                  isTop
                    ? "bg-amber-100/10 border-amber-400/30 backdrop-blur-sm"
                    : "bg-muted/30 border-border/50"
                )}
              >
                <div
                  className={cn(
                    "h-8 w-8 sm:h-10 sm:w-10 rounded-lg flex items-center justify-center mb-1.5 sm:mb-2",
                    isTop ? "bg-amber-400/10" : "bg-muted/50"
                  )}
                >
                  <Icon className={cn("h-4 w-4 sm:h-5 sm:w-5", card.iconClassName)} />
                </div>
                <span className="text-xs sm:text-sm font-semibold mb-0.5 sm:mb-1 text-center text-foreground">
                  {card.label}
                </span>
                <div className="flex gap-0.5 mb-1.5 sm:mb-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <StarIcon
                      key={i}
                      filled={i < stars}
                      className={cn(
                        "h-3 w-3",
                        i < stars ? "text-amber-400" : "text-muted-foreground/30"
                      )}
                    />
                  ))}
                </div>
                {badges[card.key] && (
                  <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-[9px] sm:text-[10px] px-1.5 py-0 mb-2">
                    {badges[card.key]}
                  </Badge>
                )}
                <Button
                  size="sm"
                  variant={isTop ? "default" : "outline"}
                  className={cn(
                    "w-full mt-auto h-7 sm:h-8 text-[10px] sm:text-xs",
                    isTop &&
                      "bg-amber-100/10 text-amber-400 border border-amber-400/20 hover:bg-amber-400/20 hover:text-amber-300"
                  )}
                  asChild
                >
                  <Link href={card.actionUrl(keyword)}>{card.actionLabel}</Link>
                </Button>
              </div>
            )
          })}
        </div>

        <div className="flex items-start gap-1.5 sm:gap-2 p-2.5 sm:p-3 bg-muted/30 border border-border/50 rounded-lg">
          <LightbulbIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-400 shrink-0 mt-0.5" />
          <p className="text-xs sm:text-sm text-muted-foreground">
            <span className="text-foreground font-medium">Pro Tip: </span>
            {proTip}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
