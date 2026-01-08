/**
 * Social Tracker Sidebar Component
 * Platform tips, quick stats, and audience insights
 */

"use client"

import { memo, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Lightbulb, TrendingUp, Users } from "lucide-react"
import { CreditPurchaseCard } from "../credits/components"
import { SOCIAL_PLATFORM_CONFIG, PINTEREST_TIPS, TWITTER_TIPS, INSTAGRAM_TIPS, PLATFORM_AUDIENCE } from "../constants"
import { PinterestIcon, XIcon, InstagramIcon } from "./SocialPlatformTabs"
import type { SocialPlatform, SocialKeyword, SocialSummary } from "../types"

interface SocialTrackerSidebarProps {
  activePlatform: SocialPlatform
  keywords: SocialKeyword[]
  summary: SocialSummary | null
  currentCredits: number
  onCreditPurchase: (packageId: string, credits: number, price: number) => void
}

export const SocialTrackerSidebar = memo(function SocialTrackerSidebar({
  activePlatform,
  keywords,
  summary,
  currentCredits,
  onCreditPurchase,
}: SocialTrackerSidebarProps) {
  const config = SOCIAL_PLATFORM_CONFIG[activePlatform]

  // Memoized platform icon
  const PlatformIcon = useMemo(() => {
    switch (activePlatform) {
      case "pinterest": return <PinterestIcon className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
      case "twitter": return <XIcon className="w-4 h-4 sm:w-5 sm:h-5 text-foreground" />
      case "instagram": return <InstagramIcon className="w-4 h-4 sm:w-5 sm:h-5 text-pink-500" />
    }
  }, [activePlatform])

  // Memoized tips
  const tips = useMemo(() => {
    switch (activePlatform) {
      case "pinterest": return PINTEREST_TIPS
      case "twitter": return TWITTER_TIPS
      case "instagram": return INSTAGRAM_TIPS
    }
  }, [activePlatform])

  // Memoized quick stats
  const quickStats = useMemo(() => {
    const top3 = keywords.filter(k => {
      const data = k.platforms[activePlatform]
      return data && data.position && data.position <= 3
    }).length

    const top10 = keywords.filter(k => {
      const data = k.platforms[activePlatform]
      return data && data.position && data.position <= 10
    }).length

    return { top3, top10 }
  }, [keywords, activePlatform])

  // Audience insights from constants
  const audienceInsights = PLATFORM_AUDIENCE[activePlatform]

  return (
    <div className="space-y-3 md:space-y-4 order-1 lg:order-2">
      {/* Platform Credit Cost Card */}
      <Card className="bg-card border-border overflow-hidden">
        <div 
          className={cn(
            "h-1.5",
            activePlatform === "twitter" && "bg-foreground dark:bg-white"
          )}
          style={activePlatform !== "twitter" ? { backgroundColor: config.color } : undefined}
        />
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-center gap-3">
            <div 
              className={cn(
                "p-2.5 sm:p-3 rounded-xl",
                activePlatform === "twitter" ? "bg-foreground/10 dark:bg-white/10" : ""
              )}
              style={activePlatform !== "twitter" ? { backgroundColor: `${config.color}15` } : undefined}
            >
              {PlatformIcon}
            </div>
            <div className="flex-1">
              <p className="text-lg sm:text-xl font-bold text-foreground">
                {config.creditCost} <span className="text-sm font-normal text-muted-foreground">credits</span>
              </p>
              <p className="text-[10px] sm:text-xs text-muted-foreground">per keyword on {config.name}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] sm:text-xs text-muted-foreground">API Source</p>
              <p className="text-xs sm:text-sm font-medium text-foreground">{config.apiSource}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Premium Credits Purchase Card */}
      <CreditPurchaseCard 
        currentCredits={currentCredits}
        onPurchase={(packageId, credits, price) => onCreditPurchase(packageId, credits, price)}
      />

      {/* Platform Tips */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2 p-3 sm:p-4 sm:pb-2">
          <CardTitle className="text-xs sm:text-sm flex items-center gap-2 text-card-foreground">
            <Lightbulb className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500" />
            {config.name} Tips
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-4 pt-0">
          <ul className="space-y-1.5 sm:space-y-2">
            {tips.map((tip) => (
              <li key={tip} className="text-[10px] sm:text-xs text-muted-foreground flex items-start gap-2">
                <span className="text-amber-500">•</span>
                {tip}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2 p-3 sm:p-4 sm:pb-2">
          <CardTitle className="text-xs sm:text-sm flex items-center gap-2 text-card-foreground">
            <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500" />
            Quick Stats
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-4 pt-0 space-y-2 sm:space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-[10px] sm:text-xs text-muted-foreground">Top 3 Rankings</span>
            <span className="text-xs sm:text-sm font-medium text-foreground">{quickStats.top3}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[10px] sm:text-xs text-muted-foreground">Top 10 Rankings</span>
            <span className="text-xs sm:text-sm font-medium text-foreground">{quickStats.top10}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[10px] sm:text-xs text-muted-foreground">Avg Engagement</span>
            <span className="text-xs sm:text-sm font-medium text-emerald-500">
              {summary?.avgEngagement ?? 0}%
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Audience Insights */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2 p-3 sm:p-4 sm:pb-2">
          <CardTitle className="text-xs sm:text-sm flex items-center gap-2 text-card-foreground">
            <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-500" />
            Platform Audience
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-4 pt-0">
          <div className="space-y-1.5 sm:space-y-2">
            {audienceInsights.map((insight) => (
              <p key={insight} className="text-[10px] sm:text-xs text-muted-foreground">• {insight}</p>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
})
