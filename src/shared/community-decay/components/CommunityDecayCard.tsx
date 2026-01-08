"use client"

import { cn } from "@/lib/utils"
import {
  type CommunityDecayAnalysis,
  PLATFORM_INFO,
  formatAge,
} from "@/types/community-decay.types"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  Flame,
  MessageSquare,
  Target,
  Zap,
  Sparkles,
} from "lucide-react"
import { CommunityDecayRing } from "./CommunityDecayRing"
import { PlatformBadge } from "./PlatformBadge"
import { CommunitySourceCard } from "./CommunitySourceCard"

// ============================================
// FULL DECAY CARD
// ============================================

export interface CommunityDecayCardProps {
  analysis: CommunityDecayAnalysis
  showSources?: boolean
  showRecommendations?: boolean
  className?: string
}

// Opportunity style
const getOpportunityStyle = (level: string) => {
  switch (level) {
    case "excellent": return "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
    case "high": return "text-green-600 dark:text-green-400 bg-green-500/10 border-green-500/20"
    case "moderate": return "text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20"
    default: return "text-muted-foreground bg-muted/50 border-border"
  }
}

export function CommunityDecayCard({
  analysis,
  showSources = true,
  showRecommendations = true,
  className,
}: CommunityDecayCardProps) {
  if (!analysis.hasCommunityContent) {
    return (
      <Card className={cn("bg-card border-border", className)}>
        <CardContent className="p-6">
          <div className="flex items-center gap-4 text-muted-foreground">
            <div className="p-3 bg-muted rounded-full">
              <Flame className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground/80">No Community Content</h3>
              <p className="text-sm">No Reddit, Quora, or other UGC found in SERP</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const { decayScore, avgContentAge, maxContentAge, communityCountInTop10, bestOpportunity, communitySources, recommendations, opportunityLevel } = analysis

  return (
    <Card className={cn("bg-card border-border overflow-hidden", className)}>
      {/* Header with gradient based on opportunity */}
      <div className={cn(
        "relative p-4 border-b border-border",
        opportunityLevel === "excellent" || opportunityLevel === "high"
          ? "bg-linear-to-r from-orange-500/10 via-red-500/10 to-amber-500/10"
          : "bg-muted/30"
      )}>
        <div className="flex items-center gap-4">
          <CommunityDecayRing score={decayScore} size="lg" />
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-bold text-foreground">Community Decay Analysis</h3>
              <Badge className={cn(getOpportunityStyle(opportunityLevel))}>
                <Zap className="h-3 w-3 mr-1" />
                {opportunityLevel.charAt(0).toUpperCase() + opportunityLevel.slice(1)} Opportunity
              </Badge>
            </div>
            
            <p className="text-sm text-muted-foreground">
              {communityCountInTop10} community source{communityCountInTop10 !== 1 ? "s" : ""} in top 10
              {" • "}
              Avg age: {formatAge(avgContentAge)}
            </p>
          </div>
        </div>
      </div>

      <CardContent className="p-4 space-y-4">
        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-3">
          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <div className="text-xs text-muted-foreground mb-1">Decay Score</div>
            <div className="text-xl font-bold text-orange-500 dark:text-orange-400">{decayScore}</div>
          </div>
          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <div className="text-xs text-muted-foreground mb-1">Avg Age</div>
            <div className="text-xl font-bold text-foreground">{formatAge(avgContentAge)}</div>
          </div>
          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <div className="text-xs text-muted-foreground mb-1">Max Age</div>
            <div className="text-xl font-bold text-red-500 dark:text-red-400">{formatAge(maxContentAge)}</div>
          </div>
          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <div className="text-xs text-muted-foreground mb-1">Sources</div>
            <div className="text-xl font-bold text-foreground">{communityCountInTop10}</div>
          </div>
        </div>

        {/* Best Opportunity */}
        {bestOpportunity && (
          <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-5 w-5 text-emerald-400" />
              <span className="text-sm font-semibold text-emerald-400">Best Target Opportunity</span>
            </div>
            <div className="flex items-center gap-3">
              <PlatformBadge
                platform={bestOpportunity.platform}
                ageInDays={bestOpportunity.ageInDays}
                rank={bestOpportunity.rankPosition}
              />
            <div className="flex-1 text-sm text-foreground/80">
              <p className="line-clamp-1">{bestOpportunity.title}</p>
              <p className="text-muted-foreground text-xs mt-1">
                  {bestOpportunity.engagement.upvotes?.toLocaleString() || 0} upvotes
                  {bestOpportunity.qualityScore && (
                    <span className="ml-2">Quality: {bestOpportunity.qualityScore}%</span>
                  )}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Community Sources */}
        {showSources && communitySources.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Community Sources in SERP
            </h4>
            <div className="space-y-2">
              {communitySources.map((source) => (
                <CommunitySourceCard key={source.url || source.platform} source={source} />
              ))}
            </div>
          </div>
        )}

        {/* Recommendations */}
        {showRecommendations && recommendations.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-500 dark:text-amber-400" />
              Recommendations
            </h4>
            <div className="space-y-2">
              {recommendations.slice(0, 3).map((rec) => (
                <div
                  key={rec.id}
                  className="flex items-start gap-3 bg-muted/50 rounded-lg p-3"
                >
                  <div className={cn(
                    "flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold",
                    rec.priority === 1
                      ? "bg-emerald-500/20 text-emerald-400"
                      : "bg-amber-500/20 text-amber-400"
                  )}>
                    {rec.priority}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="text-sm font-medium text-foreground">{rec.title}</h5>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {rec.description}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">
                        {rec.effort}
                      </Badge>
                      <span className="text-xs text-emerald-400">{rec.potentialGain}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
