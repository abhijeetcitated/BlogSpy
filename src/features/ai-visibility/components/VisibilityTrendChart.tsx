"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp } from "lucide-react"
import { VisibilityTrendData } from "../types"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"

interface VisibilityTrendChartProps {
  data: VisibilityTrendData[]
}

export function VisibilityTrendChart({ data }: VisibilityTrendChartProps) {
  // Calculate total change
  const firstTotal = data[0]?.total || 0
  const lastTotal = data[data.length - 1]?.total || 0
  const changePercent = firstTotal > 0 
    ? Math.round(((lastTotal - firstTotal) / firstTotal) * 100)
    : 0

  // Empty state when no trend data
  if (!data || data.length === 0) {
    return (
      <Card className="bg-card border-border">
        <CardHeader className="pb-2 px-3 sm:px-6">
          <CardTitle className="text-sm sm:text-base font-semibold text-foreground">
            Citation Trends
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 sm:px-6 pb-6 sm:pb-8">
          <div className="flex flex-col items-center justify-center py-10 sm:py-16 text-center">
            <div className="p-3 rounded-full bg-muted/50 mb-4">
              <TrendingUp className="h-8 w-8 text-muted-foreground/40" />
            </div>
            <h3 className="text-sm sm:text-base font-semibold text-foreground mb-1.5">
              No trend data yet
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-xs">
              Run multiple scans over time to see how your AI visibility changes across platforms.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2 px-3 sm:px-6">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-sm sm:text-base font-semibold text-foreground">
            Citation Trends
          </CardTitle>
          <Badge 
            variant="outline" 
            className={`text-[10px] sm:text-xs px-1.5 sm:px-2 ${changePercent >= 0 
              ? "text-emerald-400 border-emerald-400/30" 
              : "text-red-400 border-red-400/30"
            }`}
          >
            <TrendingUp className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5 sm:mr-1" />
            {changePercent >= 0 ? '+' : ''}{changePercent}%
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="px-1 sm:px-6 pb-3 sm:pb-6">
        <div className="h-[180px] sm:h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 5, left: -30, bottom: 0 }}>
              <defs>
                {/* Google AI Overviews - Red */}
                <linearGradient id="googleAioGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
                {/* Google AI Mode - Purple */}
                <linearGradient id="googleAiModeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                </linearGradient>
                {/* ChatGPT - Green */}
                <linearGradient id="chatgptGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                {/* Perplexity - Cyan */}
                <linearGradient id="perplexityGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                </linearGradient>
                {/* Claude - Orange */}
                <linearGradient id="claudeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                </linearGradient>
                {/* Gemini - Blue */}
                <linearGradient id="geminiGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="date" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'var(--color-muted-foreground)', fontSize: 9 }}
                interval="preserveStartEnd"
                tickMargin={4}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'var(--color-muted-foreground)', fontSize: 9 }}
                width={25}
                tickMargin={2}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'var(--color-card)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.2)',
                  fontSize: '12px',
                }}
                labelStyle={{ color: 'var(--color-foreground)', fontWeight: 600 }}
              />
              <Legend 
                wrapperStyle={{ 
                  paddingTop: '8px', 
                  paddingLeft: '30px',
                }}
                iconSize={6}
                iconType="circle"
                align="center"
                layout="horizontal"
                verticalAlign="bottom"
                formatter={(value) => (
                  <span style={{ color: 'var(--color-muted-foreground)', fontSize: '9px', marginRight: '6px' }}>
                    {value}
                  </span>
                )}
              />
              {/* Google AI Overviews */}
              <Area
                type="monotone"
                dataKey="googleAio"
                name="Google AIO"
                stroke="#ef4444"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#googleAioGradient)"
                stackId="1"
              />
              {/* Google AI Mode */}
              <Area
                type="monotone"
                dataKey="googleAiMode"
                name="Google AI Mode"
                stroke="#a855f7"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#googleAiModeGradient)"
                stackId="1"
              />
              <Area
                type="monotone"
                dataKey="chatgpt"
                name="ChatGPT"
                stroke="#10b981"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#chatgptGradient)"
                stackId="1"
              />
              <Area
                type="monotone"
                dataKey="perplexity"
                name="Perplexity"
                stroke="#06b6d4"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#perplexityGradient)"
                stackId="1"
              />
              <Area
                type="monotone"
                dataKey="claude"
                name="Claude"
                stroke="#f97316"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#claudeGradient)"
                stackId="1"
              />
              <Area
                type="monotone"
                dataKey="gemini"
                name="Gemini"
                stroke="#3b82f6"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#geminiGradient)"
                stackId="1"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
