"use client"

import { cn } from "@/lib/utils"
import {
  type CommunitySource,
  PLATFORM_INFO,
  getCommunityDecayLevel,
  getCommunityDecayColor,
  getCommunityDecayBgColor,
  formatAge,
} from "@/types/community-decay.types"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  Calendar,
  MessageSquare,
  ThumbsUp,
  ExternalLink,
  AlertCircle,
} from "lucide-react"

// ============================================
// COMMUNITY SOURCE CARD
// ============================================

export interface CommunitySourceCardProps {
  source: CommunitySource
  showActions?: boolean
  className?: string
}

export function CommunitySourceCard({
  source,
  showActions = true,
  className,
}: CommunitySourceCardProps) {
  const platformInfo = PLATFORM_INFO[source.platform]
  const decayLevel = getCommunityDecayLevel(source.ageInDays)

  return (
    <Card className={cn("bg-slate-800/50 border-slate-700", className)}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Platform Icon */}
          <div className={cn(
            "flex items-center justify-center w-10 h-10 rounded-lg text-xl",
            platformInfo.bgColor
          )}>
            {platformInfo.icon}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                Rank #{source.rankPosition}
              </Badge>
              <Badge className={cn("text-xs", getCommunityDecayBgColor(decayLevel), getCommunityDecayColor(decayLevel))}>
                {decayLevel.charAt(0).toUpperCase() + decayLevel.slice(1)}
              </Badge>
              {source.hasOutdatedFlag && (
                <Badge className="bg-red-500/20 text-red-400 text-xs">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Outdated
                </Badge>
              )}
            </div>

            <h4 className="mt-2 text-sm font-medium text-slate-200 line-clamp-2">
              {source.title}
            </h4>

            {source.subreddit && (
              <span className="text-xs text-orange-400 mt-1">
                r/{source.subreddit}
              </span>
            )}

            {/* Stats Row */}
            <div className="flex items-center gap-4 mt-3 text-xs text-slate-400">
              <div className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {formatAge(source.ageInDays)}
              </div>
              {source.engagement.upvotes && (
                <div className="flex items-center gap-1">
                  <ThumbsUp className="h-3.5 w-3.5" />
                  {source.engagement.upvotes.toLocaleString()}
                </div>
              )}
              {source.engagement.comments && (
                <div className="flex items-center gap-1">
                  <MessageSquare className="h-3.5 w-3.5" />
                  {source.engagement.comments}
                </div>
              )}
              {source.qualityScore && (
                <div className="flex items-center gap-1">
                  <span className={cn(
                    source.qualityScore < 50 ? "text-amber-400" : "text-slate-400"
                  )}>
                    Quality: {source.qualityScore}%
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* External Link */}
          {showActions && (
            <a
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-md hover:bg-slate-700 transition-colors"
            >
              <ExternalLink className="h-4 w-4 text-slate-400" />
            </a>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
