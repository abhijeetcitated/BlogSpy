"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Info,
  Clock,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
} from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { PlatformStats, AIPlatform } from "../types"
import { AI_PLATFORMS, PlatformIcons } from "../constants"

interface PlatformBreakdownProps {
  stats: PlatformStats[]
  isDemoMode?: boolean
  onDemoActionClick?: () => void
}

export function PlatformBreakdown({ stats, isDemoMode, onDemoActionClick }: PlatformBreakdownProps) {
  const totalCitations = stats.reduce((sum, s) => sum + s.citations, 0)

  const renderPlatformIcon = (platformId: string, colorClass: string) => {
    const IconRenderer = PlatformIcons[platformId]
    if (IconRenderer) {
      return <span className={colorClass}>{IconRenderer()}</span>
    }
    return null
  }

  // Get platform config with safety check
  const getPlatformConfig = (platformId: AIPlatform) => {
    return AI_PLATFORMS[platformId] || {
      name: platformId,
      color: 'text-muted-foreground',
      bgColor: 'bg-muted/10',
      isComingSoon: false,
      isReadinessOnly: false,
    }
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6">
        <CardTitle className="text-sm sm:text-base font-semibold text-foreground">
          Citations by Platform
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 sm:space-y-3 px-3 sm:px-6 pb-3 sm:pb-6">
        <TooltipProvider>
          {stats.map((stat) => {
            const platform = getPlatformConfig(stat.platform)
            const percentage = totalCitations > 0 
              ? Math.round((stat.citations / totalCitations) * 100) 
              : 0

            return (
              <div 
                key={stat.platform}
                className="flex items-center gap-2 sm:gap-3 p-1.5 sm:p-2 rounded-lg hover:bg-muted/30 transition-colors"
              >
                {/* Platform Icon */}
                <div className="p-1.5 sm:p-2 shrink-0">
                  <span className={`${platform.color} [&>svg]:w-4 [&>svg]:h-4 sm:[&>svg]:w-5 sm:[&>svg]:h-5`}>
                    {renderPlatformIcon(stat.platform, platform.color)}
                  </span>
                </div>

                {/* Platform Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className={`text-xs sm:text-sm font-medium ${platform.color} truncate`}>
                        {platform.name}
                      </span>
                      
                      {/* Coming Soon badge for SearchGPT */}
                      {platform.isComingSoon && (
                        <Badge 
                          variant="outline" 
                          className="text-[8px] px-1 py-0 h-4 bg-amber-500/10 text-amber-400 border-amber-500/30 shrink-0"
                        >
                          <Clock className="h-2 w-2 mr-0.5" />
                          Soon
                        </Badge>
                      )}
                      
                      {/* Readiness Only info for Apple Siri */}
                      {platform.isReadinessOnly && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-3 w-3 text-muted-foreground cursor-help shrink-0" />
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-[200px]">
                            <p className="text-xs">
                              Based on Applebot Readiness
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                      {platform.isReadinessOnly ? (
                        // Show Ready/At Risk status for Apple Siri (no API available)
                        stat.avgPosition <= 3 ? (
                          <Badge className="text-[10px] px-1.5 py-0 h-5 bg-emerald-500/15 text-emerald-400 border-emerald-500/30 gap-1">
                            <CheckCircle className="h-2.5 w-2.5" />
                            Ready
                          </Badge>
                        ) : (
                          <Badge className="text-[10px] px-1.5 py-0 h-5 bg-amber-500/15 text-amber-400 border-amber-500/30 gap-1">
                            <AlertTriangle className="h-2.5 w-2.5" />
                            At Risk
                          </Badge>
                        )
                      ) : (
                        <>
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
                        </>
                      )}
                    </div>
                  </div>

                  {/* Progress Bar - Hide for readiness-only platforms */}
                  {!platform.isReadinessOnly && (
                    <>
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
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </TooltipProvider>

        {/* Market Share Note */}
        <div className="pt-2 sm:pt-3 border-t border-border">
          <p className="text-[10px] sm:text-xs text-muted-foreground mb-3">
            Based on {totalCitations} citations across 8 AI platforms
          </p>
          <Button 
            className="w-full h-8 sm:h-9 text-xs sm:text-sm"
            onClick={isDemoMode ? onDemoActionClick : undefined}
          >
            <RefreshCw className="h-3.5 w-3.5 mr-2" />
            Run Full Scan (⚡ 5)
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
