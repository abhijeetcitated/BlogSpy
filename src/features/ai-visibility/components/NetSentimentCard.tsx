"use client"

// ============================================
// AI Visibility — Net Sentiment Card (Advanced Donut)
// ============================================
// Analytics-grade donut with:
// - Recharts PieChart with 3 segments (positive/neutral/negative)
// - Center score display (+56 net score)
// - Real values visible per-segment without hover
// - Bottom legend with counts + percentages
// - Active animation on hover
// - Gradient-style fills for premium look

import { useState, useCallback } from "react"
import { PieChart, Pie, Cell, ResponsiveContainer, Sector } from "recharts"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Info } from "lucide-react"
import type { NetSentiment } from "../types"

// ============================================
// CONSTANTS
// ============================================

const SENTIMENT_COLORS = {
  positive: { fill: "#22c55e", light: "#4ade80", label: "Positive" },
  neutral:  { fill: "#94a3b8", light: "#cbd5e1", label: "Neutral" },
  negative: { fill: "#ef4444", light: "#f87171", label: "Negative" },
} as const

// ============================================
// ACTIVE SHAPE RENDERER — segment pops out on hover
// ============================================

function renderActiveShape(props: unknown) {
  const {
    cx, cy, innerRadius, outerRadius, startAngle, endAngle,
    fill, payload, percent,
  } = props as {
    cx: number; cy: number; innerRadius: number; outerRadius: number
    startAngle: number; endAngle: number; fill: string
    payload: { name: string; value: number }; percent: number
  }

  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={(outerRadius as number) + 6}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        opacity={1}
        cornerRadius={4}
      />
      {/* Tooltip label near segment */}
      <text
        x={cx}
        y={cy - (innerRadius as number) - 14}
        textAnchor="middle"
        className="fill-foreground text-[10px] font-semibold"
      >
        {payload.name}: {payload.value} ({(percent * 100).toFixed(0)}%)
      </text>
    </g>
  )
}

// ============================================
// COMPONENT
// ============================================

interface NetSentimentCardProps {
  sentiment: NetSentiment
}

export function NetSentimentCard({ sentiment }: NetSentimentCardProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  const onPieEnter = useCallback((_: unknown, index: number) => {
    setActiveIndex(index)
  }, [])

  const onPieLeave = useCallback(() => {
    setActiveIndex(null)
  }, [])

  // Prepare chart data
  const chartData = [
    { name: "Positive", value: sentiment.positive, color: SENTIMENT_COLORS.positive.fill },
    { name: "Neutral",  value: sentiment.neutral,  color: SENTIMENT_COLORS.neutral.fill },
    { name: "Negative", value: sentiment.negative,  color: SENTIMENT_COLORS.negative.fill },
  ].filter(d => d.value > 0) // Don't render zero segments

  // If no data at all, show empty state
  const hasData = sentiment.total > 0

  // Percentages for each
  const positiveP = hasData ? Math.round((sentiment.positive / sentiment.total) * 100) : 0
  const neutralP  = hasData ? Math.round((sentiment.neutral / sentiment.total) * 100) : 0
  const negativeP = hasData ? Math.round((sentiment.negative / sentiment.total) * 100) : 0

  // Score sign and color
  const scoreSign = sentiment.score > 0 ? "+" : ""
  const scoreColor = sentiment.score >= 50
    ? "text-emerald-500"
    : sentiment.score >= 0
      ? "text-amber-500"
      : "text-red-500"

  return (
    <Card className="bg-card border-border relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-cyan-500/5 hover:border-cyan-500/20">
      <CardContent className="p-3 sm:p-5">
        {/* Info tooltip */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 absolute top-2 right-2 opacity-50 hover:opacity-100 z-10"
            >
              <Info className="h-3 w-3" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs max-w-[220px]">
              How AI describes your brand across all {sentiment.total} citations.
              Score ranges from -100 (all negative) to +100 (all positive).
            </p>
          </TooltipContent>
        </Tooltip>

        <div className="flex flex-col items-center text-center">
          {/* Donut Chart */}
          <div className="relative w-20 h-20 sm:w-28 sm:h-28">
            {hasData ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius="55%"
                    outerRadius="85%"
                    paddingAngle={2}
                    dataKey="value"
                    strokeWidth={0}
                    cornerRadius={3}
                    activeIndex={activeIndex !== null ? activeIndex : undefined}
                    activeShape={renderActiveShape}
                    onMouseEnter={onPieEnter}
                    onMouseLeave={onPieLeave}
                  >
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        opacity={activeIndex !== null && activeIndex !== index ? 0.4 : 1}
                        style={{ transition: "opacity 0.2s ease" }}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              /* Empty state ring */
              <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="30" fill="none" strokeWidth="8" className="stroke-muted/30" />
              </svg>
            )}
            {/* Center score */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className={`text-sm sm:text-xl font-bold leading-none ${hasData ? scoreColor : "text-muted-foreground"}`}>
                {hasData ? `${scoreSign}${sentiment.score}` : "—"}
              </span>
              <span className="text-[7px] sm:text-[9px] text-muted-foreground mt-0.5">
                {hasData ? "score" : "no data"}
              </span>
            </div>
          </div>

          {/* Title */}
          <p className="text-[10px] sm:text-sm font-medium text-foreground mt-2">
            Net Sentiment
          </p>

          {/* Legend: count + percentage for each */}
          <div className="flex items-center justify-center gap-2 sm:gap-3 mt-1.5">
            <span className="flex items-center gap-1 text-[8px] sm:text-[10px]">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              <span className="text-emerald-500 font-semibold">{sentiment.positive}</span>
              <span className="text-muted-foreground">({positiveP}%)</span>
            </span>
            <span className="flex items-center gap-1 text-[8px] sm:text-[10px]">
              <span className="w-2 h-2 rounded-full bg-slate-400 shrink-0" />
              <span className="text-slate-400 font-semibold">{sentiment.neutral}</span>
              <span className="text-muted-foreground">({neutralP}%)</span>
            </span>
            <span className="flex items-center gap-1 text-[8px] sm:text-[10px]">
              <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
              <span className="text-red-500 font-semibold">{sentiment.negative}</span>
              <span className="text-muted-foreground">({negativeP}%)</span>
            </span>
          </div>


        </div>
      </CardContent>
    </Card>
  )
}
