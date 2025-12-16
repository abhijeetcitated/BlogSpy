"use client"

import Link from "next/link"
import {
  Area,
  ComposedChart,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts"
import { TrendingUp } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

import { velocityData } from "../__mocks__"
import { PublishTiming } from "./publish-timing"

interface VelocityChartProps {
  searchQuery: string
}

export function VelocityChart({ searchQuery }: VelocityChartProps) {
  return (
    <Card className="bg-card border-border overflow-hidden">
      <CardHeader className="pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
            Velocity Chart
          </CardTitle>
          <div className="flex items-center gap-3 sm:gap-4 text-[10px] sm:text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="w-3 sm:w-4 h-0.5 bg-amber-500 rounded-full" />
              <span>Actual</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="w-3 sm:w-4 h-0.5 border-t-2 border-dashed border-amber-500/60" />
              <span>Forecast</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="relative h-[280px] sm:h-[350px] md:h-[400px] pt-2 sm:pt-4 px-2 sm:px-6 pb-3 sm:pb-6">
        {/* Breakout Overlay Card */}
        <div className="absolute top-2 sm:top-4 left-2 sm:left-4 z-20">
          <div className="bg-linear-to-br from-amber-500 to-orange-600 rounded-lg sm:rounded-xl p-2.5 sm:p-4 shadow-xl sm:shadow-2xl shadow-amber-500/30 min-w-[150px] sm:min-w-[200px]">
            <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
              <div className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-white animate-pulse" />
              <span className="text-[9px] sm:text-xs font-bold text-white/90 uppercase tracking-wider">
                Breakout
              </span>
            </div>
            <p className="text-lg sm:text-2xl font-bold text-white mb-0.5 sm:mb-1">
              85% <span className="text-xs sm:text-base font-medium">Viral</span>
            </p>
            {/* Difficulty Badge */}
            <div className="flex items-center gap-1.5 sm:gap-2 mt-1.5 sm:mt-2 mb-2 sm:mb-3 px-1.5 sm:px-2 py-1 sm:py-1.5 bg-white/20 rounded-md sm:rounded-lg backdrop-blur-sm">
              <div className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-emerald-400" />
              <span className="text-[10px] sm:text-xs font-semibold text-white">
                Easy
              </span>
              <span className="text-[8px] sm:text-[10px] text-white/70 hidden sm:inline">
                (Weak)
              </span>
            </div>
            <Button
              size="sm"
              className="w-full h-7 sm:h-8 text-[10px] sm:text-xs bg-white hover:bg-zinc-100 text-black font-semibold"
              asChild
            >
              <Link
                href={`/dashboard/creation/ai-writer?topic=${encodeURIComponent(searchQuery)}`}
              >
                <span className="hidden sm:inline">Write Article Now</span>
                <span className="sm:hidden">Write Now</span>
              </Link>
            </Button>
          </div>
        </div>

        {/* The Chart */}
        <div className="h-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={velocityData}
              margin={{ top: 20, right: 20, left: 0, bottom: 40 }}
            >
              <defs>
                <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="month"
                stroke="hsl(var(--muted-foreground))"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}`}
              />
              {/* Actual Data - Solid Area */}
              <Area
                type="monotone"
                dataKey="actual"
                stroke="#f59e0b"
                strokeWidth={3}
                fill="url(#colorActual)"
                dot={false}
                connectNulls={false}
              />
              {/* Forecast Data - Dashed Line */}
              <Line
                type="monotone"
                dataKey="forecast"
                stroke="#f59e0b"
                strokeWidth={2}
                strokeDasharray="8 4"
                dot={false}
                connectNulls={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Bottom Banner */}
        <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 right-2 sm:right-4">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 bg-amber-900/30 border border-amber-700/40 rounded-md sm:rounded-lg">
            <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-400 shrink-0" />
            <span className="text-xs sm:text-sm font-medium text-amber-300">
              Peak: +14% in 3mo
            </span>
            <span className="text-[10px] sm:text-xs text-amber-400/70 hidden md:inline">
              Based on historical patterns
            </span>
            <Badge className="ml-auto bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px] sm:text-xs px-1.5 sm:px-2">
              +39%
            </Badge>
          </div>
        </div>
      </CardContent>

      {/* Publish Timing Indicator */}
      <PublishTiming searchQuery={searchQuery} />
    </Card>
  )
}
