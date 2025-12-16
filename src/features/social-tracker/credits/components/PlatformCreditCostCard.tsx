/**
 * ============================================
 * PLATFORM CREDIT COST CARD
 * ============================================
 * 
 * Shows credit costs for each social platform
 * 
 * @version 1.0.0
 * @lastUpdated 2025-12-15
 */

"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Coins, RefreshCw, Users } from "lucide-react"
import { PLATFORM_CREDIT_COSTS } from "../config/pricing.config"

// Platform Icons
const PlatformIcons: Record<string, { icon: React.ReactNode; color: string }> = {
  pinterest: {
    icon: <span className="text-lg">📌</span>,
    color: "text-red-500",
  },
  twitter: {
    icon: <span className="text-lg font-bold">𝕏</span>,
    color: "text-foreground",
  },
  instagram: {
    icon: <span className="text-lg">📸</span>,
    color: "text-pink-500",
  },
  tiktok: {
    icon: <span className="text-lg">🎵</span>,
    color: "text-cyan-500",
  },
}

interface PlatformCreditCostCardProps {
  className?: string
  compact?: boolean
}

export function PlatformCreditCostCard({ 
  className, 
  compact = false 
}: PlatformCreditCostCardProps) {
  const platforms = Object.values(PLATFORM_CREDIT_COSTS)

  return (
    <Card className={cn("border-muted", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Coins className="h-4 w-4 text-amber-500" />
          Credit Costs by Platform
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {platforms.map((platform) => {
          const iconData = PlatformIcons[platform.platformId]
          
          return (
            <div
              key={platform.platformId}
              className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
            >
              <div className="flex items-center gap-2">
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center bg-background",
                  iconData?.color
                )}>
                  {iconData?.icon || <span>📱</span>}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {platform.platformName}
                  </p>
                  {!compact && (
                    <p className="text-[10px] text-muted-foreground">
                      {platform.description}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-3 text-right">
                {/* Track Keyword */}
                <div className="flex flex-col items-center">
                  <Badge variant="secondary" className="text-xs tabular-nums">
                    {platform.creditsPerKeyword}
                  </Badge>
                  {!compact && (
                    <span className="text-[9px] text-muted-foreground mt-0.5">
                      per keyword
                    </span>
                  )}
                </div>
                
                {/* Refresh */}
                {!compact && (
                  <div className="flex flex-col items-center">
                    <Badge variant="outline" className="text-[10px] tabular-nums gap-1">
                      <RefreshCw className="h-2.5 w-2.5" />
                      {platform.creditsPerRefresh}
                    </Badge>
                    <span className="text-[9px] text-muted-foreground mt-0.5">
                      refresh
                    </span>
                  </div>
                )}
                
                {/* Competitor */}
                {!compact && (
                  <div className="flex flex-col items-center">
                    <Badge variant="outline" className="text-[10px] tabular-nums gap-1">
                      <Users className="h-2.5 w-2.5" />
                      {platform.creditsPerCompetitor}
                    </Badge>
                    <span className="text-[9px] text-muted-foreground mt-0.5">
                      competitor
                    </span>
                  </div>
                )}
              </div>
            </div>
          )
        })}
        
        {/* Info Footer */}
        {!compact && (
          <p className="text-[10px] text-muted-foreground text-center pt-2 border-t border-border">
            Credits are deducted per action. Bulk actions may vary.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
