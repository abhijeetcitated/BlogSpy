// ============================================
// KEYWORD DETAILS DRAWER - Overview Tab
// ============================================
// Displays main keyword metrics, trend data, and SERP features
// ============================================

"use client"

import * as React from "react"
import { TrendingUp, TrendingDown, Minus, Target, Zap, Eye, MapPin } from "lucide-react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

import type { Keyword } from "../../types"
import { generateMockGEOScore } from "@/lib/geo-calculator"
import { generateMockRTV } from "@/lib/rtv-calculator"
import { generateMockAIOverviewAnalysis } from "@/lib/ai-overview-analyzer"

// ============================================
// TYPES
// ============================================

interface OverviewTabProps {
  keyword: Keyword
}

// ============================================
// HELPER COMPONENTS
// ============================================

function MetricCard({
  title,
  value,
  subValue,
  icon: Icon,
  trend,
  colorClass,
}: {
  title: string
  value: string | number
  subValue?: string
  icon?: React.ElementType
  trend?: "up" | "down" | "neutral"
  colorClass?: string
}) {
  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus

  return (
    <Card className="bg-card/50 border-border/50">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            {Icon && <Icon className="h-4 w-4" />}
            <span>{title}</span>
          </div>
          {trend && (
            <TrendIcon
              className={cn(
                "h-4 w-4",
                trend === "up" && "text-emerald-500",
                trend === "down" && "text-red-500",
                trend === "neutral" && "text-muted-foreground"
              )}
            />
          )}
        </div>
        <div className={cn("text-2xl font-bold mt-2", colorClass)}>
          {value}
        </div>
        {subValue && (
          <div className="text-xs text-muted-foreground mt-1">{subValue}</div>
        )}
      </CardContent>
    </Card>
  )
}

// ============================================
// COMPONENT
// ============================================

export function OverviewTab({ keyword }: OverviewTabProps) {
  // Calculate metrics
  const rtvData = generateMockRTV(keyword.id, keyword.volume)
  const geoScore = keyword.geoScore ?? generateMockGEOScore(keyword.id)
  const aioData = generateMockAIOverviewAnalysis(keyword.keyword, keyword.weakSpot.type !== null)

  // Calculate trend
  const trendGrowth = keyword.trend.length >= 2
    ? ((keyword.trend[keyword.trend.length - 1] - keyword.trend[0]) / Math.max(keyword.trend[0], 1)) * 100
    : 0
  const trendDirection = trendGrowth > 5 ? "up" : trendGrowth < -5 ? "down" : "neutral"

  // Get KD level and color
  const getKdInfo = (kd: number) => {
    if (kd <= 14) return { level: "Very Easy", color: "text-emerald-500", bgColor: "bg-emerald-500" }
    if (kd <= 29) return { level: "Easy", color: "text-green-500", bgColor: "bg-green-500" }
    if (kd <= 49) return { level: "Moderate", color: "text-yellow-500", bgColor: "bg-yellow-500" }
    if (kd <= 69) return { level: "Hard", color: "text-orange-500", bgColor: "bg-orange-500" }
    if (kd <= 84) return { level: "Very Hard", color: "text-red-500", bgColor: "bg-red-500" }
    return { level: "Extreme", color: "text-red-600", bgColor: "bg-red-600" }
  }

  const kdInfo = getKdInfo(keyword.kd)

  // Get GEO level
  const getGeoInfo = (score: number) => {
    if (score >= 80) return { level: "Excellent", color: "text-emerald-500" }
    if (score >= 60) return { level: "Good", color: "text-green-500" }
    if (score >= 40) return { level: "Moderate", color: "text-yellow-500" }
    return { level: "Low", color: "text-red-500" }
  }

  const geoInfo = getGeoInfo(geoScore)

  return (
    <div className="space-y-6">
      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-2 gap-4">
        <MetricCard
          title="Real Traffic Value"
          value={rtvData.rtv.toLocaleString()}
          subValue={`${((rtvData.rtv / keyword.volume) * 100).toFixed(1)}% of volume`}
          icon={Target}
          colorClass="text-primary"
        />
        <MetricCard
          title="GEO Score"
          value={`${geoScore}%`}
          subValue={geoInfo.level}
          icon={MapPin}
          colorClass={geoInfo.color}
        />
        <MetricCard
          title="Trend"
          value={`${trendGrowth >= 0 ? "+" : ""}${trendGrowth.toFixed(1)}%`}
          subValue="Last 12 months"
          icon={TrendingUp}
          trend={trendDirection}
        />
        <MetricCard
          title="AIO Opportunity"
          value={`${aioData.opportunityScore}%`}
          subValue={aioData.yourContent.isCited ? "Currently Cited" : "Not Cited"}
          icon={Zap}
          colorClass={aioData.opportunityScore >= 70 ? "text-emerald-500" : "text-muted-foreground"}
        />
      </div>

      {/* Keyword Difficulty */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Keyword Difficulty
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className={cn("text-3xl font-bold", kdInfo.color)}>
              {keyword.kd}%
            </span>
            <Badge variant="outline" className={kdInfo.color}>
              {kdInfo.level}
            </Badge>
          </div>
          <Progress value={keyword.kd} className="h-2" />
          <p className="text-xs text-muted-foreground">
            {keyword.kd <= 29
              ? "Great opportunity! This keyword has low competition."
              : keyword.kd <= 49
              ? "Moderate competition. Quality content can rank well."
              : keyword.kd <= 69
              ? "Competitive keyword. Strong content and backlinks needed."
              : "Very competitive. Consider long-tail alternatives."}
          </p>
        </CardContent>
      </Card>

      {/* Weak Spot */}
      {keyword.weakSpot.type && (
        <Card className="bg-card/50 border-border/50 border-l-4 border-l-amber-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Eye className="h-4 w-4 text-amber-500" />
              Weak Spot Detected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <Badge variant="secondary" className="bg-amber-500/10 text-amber-600">
                {keyword.weakSpot.type}
              </Badge>
              <span className="text-sm text-muted-foreground">
                Rank #{keyword.weakSpot.rank}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              There&apos;s a weak competitor in the top 10 results you can outrank.
            </p>
          </CardContent>
        </Card>
      )}

      {/* SERP Features */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            SERP Features
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {keyword.serpFeatures.length > 0 ? (
              keyword.serpFeatures.map((feature) => (
                <Badge
                  key={feature}
                  variant="secondary"
                  className="bg-primary/10 text-primary"
                >
                  {feature}
                </Badge>
              ))
            ) : (
              <span className="text-sm text-muted-foreground">
                No special SERP features detected
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Trend Chart Placeholder */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Search Volume Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end justify-between h-24 gap-1">
            {keyword.trend.map((value, index) => {
              const maxValue = Math.max(...keyword.trend)
              const height = (value / maxValue) * 100
              return (
                <div
                  key={index}
                  className="flex-1 bg-primary/20 hover:bg-primary/40 transition-colors rounded-t"
                  style={{ height: `${height}%` }}
                  title={`Month ${index + 1}: ${value.toLocaleString()}`}
                />
              )
            })}
          </div>
          <div className="flex justify-between text-xs text-muted-foreground mt-2">
            <span>12 months ago</span>
            <span>Now</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default OverviewTab
