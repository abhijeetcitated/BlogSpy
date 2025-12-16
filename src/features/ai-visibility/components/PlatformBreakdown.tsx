"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
} from "lucide-react"
import { PlatformStats } from "../types"
import { AI_PLATFORMS, PlatformIcons } from "../constants"

interface PlatformBreakdownProps {
  stats: PlatformStats[]
}

export function PlatformBreakdown({ stats }: PlatformBreakdownProps) {
  const totalCitations = stats.reduce((sum, s) => sum + s.citations, 0)

  const renderPlatformIcon = (platformId: string, colorClass: string) => {
    const IconRenderer = PlatformIcons[platformId]
    if (IconRenderer) {
      return <span className={colorClass}>{IconRenderer()}</span>
    }
    return null
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6">
        <CardTitle className="text-sm sm:text-base font-semibold text-foreground">
          Citations by Platform
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 sm:space-y-3 px-3 sm:px-6 pb-3 sm:pb-6">
        {stats.map((stat) => {
          const platform = AI_PLATFORMS[stat.platform]
          const percentage = totalCitations > 0 
            ? Math.round((stat.citations / totalCitations) * 100) 
            : 0

          return (
            <div 
              key={stat.platform}
              className="flex items-center gap-2 sm:gap-3 p-1.5 sm:p-2 rounded-lg hover:bg-muted/30 transition-colors"
            >
              {/* Platform Icon */}
              <div className={`p-1.5 sm:p-2 rounded-lg ${platform.bgColor} flex-shrink-0`}>
                <span className={`${platform.color} [&>svg]:w-4 [&>svg]:h-4 sm:[&>svg]:w-5 sm:[&>svg]:h-5`}>
                  {renderPlatformIcon(stat.platform, platform.color)}
                </span>
              </div>

              {/* Platform Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <span className={`text-xs sm:text-sm font-medium ${platform.color} truncate`}>
                    {platform.name}
                  </span>
                  <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                    <span className="text-xs sm:text-sm font-semibold text-foreground">
                      {stat.citations}
                    </span>
                    {stat.trend === 'rising' && (
                      <TrendingUp className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-emerald-400" />
                    )}
                    {stat.trend === 'declining' && (
                      <TrendingDown className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-red-400" />
                    )}
                    {stat.trend === 'stable' && (
                      <Minus className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-muted-foreground" />
                    )}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-1 sm:mt-1.5 h-1 sm:h-1.5 bg-muted rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${platform.bgColor.replace('/10', '')}`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>

                <div className="flex items-center justify-between mt-0.5 sm:mt-1">
                  <span className="text-[10px] sm:text-xs text-muted-foreground">
                    {percentage}%
                  </span>
                  {stat.avgPosition > 0 && (
                    <span className="text-[10px] sm:text-xs text-muted-foreground">
                      Avg: #{stat.avgPosition}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )
        })}

        {/* Market Share Note */}
        <div className="pt-2 sm:pt-3 border-t border-border">
          <p className="text-[10px] sm:text-xs text-muted-foreground">
            Based on {totalCitations} citations
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
