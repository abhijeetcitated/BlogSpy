"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { TrendingUp, TrendingDown, Minus, BarChart3 } from "lucide-react"
import { PLATFORM_CONFIG, SEARCH_PLATFORMS } from "../constants/platforms"
import type { SearchPlatform } from "../types/platforms"
import { GoogleIcon, BingIcon, YahooIcon, DuckDuckGoIcon } from "./platform-icons"

// Platform icon mapping
const PLATFORM_ICON_COMPONENTS: Record<SearchPlatform, React.ReactNode> = {
  google: <GoogleIcon size={18} />,
  bing: <BingIcon size={18} />,
  yahoo: <YahooIcon size={18} />,
  duckduckgo: <DuckDuckGoIcon size={18} />,
}

const PLATFORM_ICON_SMALL: Record<SearchPlatform, React.ReactNode> = {
  google: <GoogleIcon size={10} />,
  bing: <BingIcon size={10} />,
  yahoo: <YahooIcon size={10} />,
  duckduckgo: <DuckDuckGoIcon size={10} />,
}

interface PlatformComparisonProps {
  stats: Record<SearchPlatform, { 
    tracked: number
    avgRank: number
    top3: number
    top10: number 
  }>
  activePlatform?: SearchPlatform
  onPlatformSelect?: (platform: SearchPlatform) => void
}

export function PlatformComparison({ stats, activePlatform, onPlatformSelect }: PlatformComparisonProps) {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <BarChart3 className="w-4 h-4" />
          Platform Comparison
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {SEARCH_PLATFORMS.map((platform) => {
            const config = PLATFORM_CONFIG[platform]
            const platformStats = stats[platform]
            const isActive = platform === activePlatform
            
            // Determine styles based on state - only active platform gets brand color
            const getCardStyles = () => {
              if (isActive) {
                return {
                  borderColor: config.color,
                  backgroundColor: `${config.color}15`,
                  boxShadow: `0 0 0 2px ${config.color}30`,
                }
              }
              return {}
            }
            
            return (
              <div
                key={platform}
                onClick={() => onPlatformSelect?.(platform)}
                className={cn(
                  "p-3 rounded-lg border-2 transition-all",
                  onPlatformSelect && "cursor-pointer hover:scale-[1.02]",
                  !isActive && "border-border/50 bg-muted/30 hover:border-border"
                )}
                style={getCardStyles()}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span 
                    className={cn(
                      "flex items-center justify-center w-7 h-7 rounded-lg",
                      platformStats.avgRank === 0 && "opacity-40 grayscale"
                    )}
                    style={{
                      backgroundColor: `${config.color}15`,
                    }}
                  >
                    {PLATFORM_ICON_COMPONENTS[platform]}
                  </span>
                  <span 
                    className={cn(
                      "text-sm font-medium",
                      !isActive && "text-foreground"
                    )}
                    style={{ color: isActive ? config.color : undefined }}
                  >{config.name}</span>
                  {isActive && (
                    <span 
                      className="text-[10px] px-1.5 py-0.5 rounded-full ml-auto text-white font-medium"
                      style={{ backgroundColor: config.color }}
                    >
                      Active
                    </span>
                  )}
                </div>
                
                {platformStats.avgRank > 0 ? (
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">Avg Rank</span>
                      <span className="text-sm font-bold text-foreground">
                        #{platformStats.avgRank}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">Top 10</span>
                      <span className="text-sm text-emerald-400">
                        {platformStats.top10}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">Tracked</span>
                      <span className="text-sm text-muted-foreground">
                        {platformStats.tracked}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-muted-foreground text-center py-2">
                    No data yet
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

// Mini comparison for table row
export function MiniPlatformComparison({ 
  ranks 
}: { 
  ranks: Record<SearchPlatform, number | null> 
}) {
  return (
    <div className="flex items-center gap-1">
      {SEARCH_PLATFORMS.map((platform) => {
        const config = PLATFORM_CONFIG[platform]
        const rank = ranks[platform]
        
        return (
          <div
            key={platform}
            className={cn(
              "flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px]",
              rank === null
                ? "bg-muted text-muted-foreground"
                : rank <= 3
                ? "bg-amber-500/20 text-amber-400"
                : rank <= 10
                ? "bg-emerald-500/20 text-emerald-400"
                : "bg-muted text-muted-foreground"
            )}
            title={`${config.name}: ${rank ?? "Not ranked"}`}
          >
            <span className="opacity-70">{PLATFORM_ICON_SMALL[platform]}</span>
            <span>{rank ?? "-"}</span>
          </div>
        )
      })}
    </div>
  )
}

// Rank Variance Indicator
export function RankVarianceIndicator({ 
  best, 
  worst 
}: { 
  best: { platform: SearchPlatform; rank: number } | null
  worst: { platform: SearchPlatform; rank: number } | null 
}) {
  if (!best || !worst) {
    return <span className="text-xs text-muted-foreground">-</span>
  }
  
  const variance = worst.rank - best.rank
  
  return (
    <div className="flex items-center gap-1">
      <span className={cn(
        "text-xs font-medium",
        variance <= 5 ? "text-emerald-400" : variance <= 15 ? "text-amber-400" : "text-red-400"
      )}>
        ±{variance}
      </span>
      {variance > 10 && (
        <span className="flex items-center gap-0.5 text-muted-foreground">
          ({PLATFORM_ICON_SMALL[best.platform]} → {PLATFORM_ICON_SMALL[worst.platform]})
        </span>
      )}
    </div>
  )
}
