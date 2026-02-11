"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  RefreshCw,
  Loader2,
  BarChart3,
} from "lucide-react"
import {
  TooltipProvider,
} from "@/components/ui/tooltip"
import { PlatformStats, AIPlatform } from "../types"
import { AI_PLATFORMS, PlatformIcons } from "../constants"
import { PlatformCheckButton } from "./PlatformCheckButton"

interface PlatformBreakdownProps {
  stats: PlatformStats[]
  isDemoMode?: boolean
  onDemoActionClick?: () => void
  /** Handler to trigger a full scan */
  onScan?: () => Promise<void>
  /** Whether a scan is currently in progress */
  isScanning?: boolean
  /** Config ID for per-platform checks */
  configId?: string | null
  /** Current scan keyword for per-platform checks */
  scanQuery?: string
}

export function PlatformBreakdown({ 
  stats, 
  isDemoMode, 
  onDemoActionClick,
  onScan,
  isScanning = false,
  configId = null,
  scanQuery = "",
}: PlatformBreakdownProps) {
  const totalCitations = stats.reduce((sum, s) => sum + s.citations, 0)

  // Empty state when no platform stats
  if (!stats || stats.length === 0 || totalCitations === 0) {
    return (
      <Card className="bg-card border-border">
        <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6">
          <CardTitle className="text-sm sm:text-base font-semibold text-foreground">
            Citations by Platform
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 sm:px-6 pb-4 sm:pb-6">
          <div className="flex flex-col items-center justify-center py-8 sm:py-12 text-center">
            <div className="p-3 rounded-full bg-muted/50 mb-4">
              <BarChart3 className="h-8 w-8 text-muted-foreground/40" />
            </div>
            <h3 className="text-sm sm:text-base font-semibold text-foreground mb-1.5">
              No platform data yet
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-xs mb-5">
              Run a scan to see which AI platforms mention your brand and how often.
            </p>
            <Button 
              className="h-8 sm:h-9 text-xs sm:text-sm"
              onClick={isDemoMode ? onDemoActionClick : onScan}
              disabled={isScanning}
            >
              {isScanning ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />
                  Scanning...
                </>
              ) : (
                <>
                  <RefreshCw className="h-3.5 w-3.5 mr-2" />
                  Run First Scan (&#9889; 5)
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

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
                      

                    </div>
                    
                    <div className="flex items-center gap-1 sm:gap-2 shrink-0">
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
                      {/* Per-platform Check Now button */}
                      {!isDemoMode && configId && scanQuery && (
                        <PlatformCheckButton
                          platform={stat.platform}
                          query={scanQuery}
                          configId={configId}
                          size="icon"
                          className="h-5 w-5 sm:h-6 sm:w-6"
                        />
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
        </TooltipProvider>

        {/* Market Share Note */}
        <div className="pt-2 sm:pt-3 border-t border-border">
          <p className="text-[10px] sm:text-xs text-muted-foreground mb-3">
            Based on {totalCitations} citations across 8 AI platforms
          </p>
          <Button 
            className="w-full h-8 sm:h-9 text-xs sm:text-sm"
            onClick={isDemoMode ? onDemoActionClick : onScan}
            disabled={isScanning}
          >
            {isScanning ? (
              <>
                <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />
                Scanning...
              </>
            ) : (
              <>
                <RefreshCw className="h-3.5 w-3.5 mr-2" />
                Run Full Scan (⚡ 5)
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
