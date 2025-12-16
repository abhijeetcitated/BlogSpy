"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import { TrendingUp } from "lucide-react"
import { VisibilityTrendData } from "../types"
import { AI_PLATFORMS } from "../constants"

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
      <CardContent className="px-2 sm:px-6 pb-3 sm:pb-6">
        <div className="h-[200px] sm:h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="chatgptGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="claudeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="perplexityGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="geminiGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="date" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'var(--color-muted-foreground)', fontSize: 10 }}
                interval="preserveStartEnd"
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'var(--color-muted-foreground)', fontSize: 10 }}
                width={30}
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
                wrapperStyle={{ paddingTop: '8px', fontSize: '10px' }}
                iconSize={8}
                formatter={(value) => (
                  <span style={{ color: 'var(--color-muted-foreground)', fontSize: '10px' }}>
                    {value}
                  </span>
                )}
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
