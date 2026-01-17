"use client"

import Link from "next/link"
import { TrendingUp, Zap, ArrowUpRight } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

import { relatedTopics, breakoutQueries } from "../__mocks__"

interface RelatedDataListsProps {
  searchQuery: string
  data?: {
    result?: Array<{
      related_topics?: {
        top?: Array<{ title?: string; value?: number }>
      }
      related_queries?: {
        rising?: Array<{ query?: string; value?: number | string }>
      }
    }>
  }
}

function toScore(value: number | undefined) {
  if (typeof value !== "number" || !Number.isFinite(value)) return 0
  return Math.max(0, Math.min(100, Math.round(value)))
}

function isHighMomentum(value: number | string | undefined) {
  if (typeof value === "string") return value.toLowerCase() === "breakout"
  if (typeof value === "number") return value > 5000
  return false
}

function toNumericValue(value: number | string | undefined): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value
  if (typeof value === "string") {
    if (value.toLowerCase() === "breakout") return 100
    const match = value.match(/-?\d+/)
    if (match) {
      const parsed = Number.parseInt(match[0], 10)
      return Number.isFinite(parsed) ? parsed : null
    }
  }
  return null
}

export function RelatedDataLists({ searchQuery, data }: RelatedDataListsProps) {
  const relatedTopicsTop = data?.result?.[0]?.related_topics?.top ?? []
  const breakoutQueriesRising = data?.result?.[0]?.related_queries?.rising ?? []

  const topics = relatedTopicsTop.length
    ? relatedTopicsTop.map((item) => ({
        topic: item.title ?? "Untitled topic",
        score: toScore(item.value),
      }))
    : relatedTopics.map((item) => ({
        topic: item.topic,
        score: toScore(item.growth ? Number.parseFloat(item.growth) : 0),
      }))

  const queries = breakoutQueriesRising.length
    ? breakoutQueriesRising.map((item) => ({
        query: item.query ?? "Untitled query",
        value: item.value ?? 0,
        numericValue: toNumericValue(item.value),
        highMomentum: isHighMomentum(item.value),
      }))
    : breakoutQueries.map((item) => ({
        query: item.query,
        value: item.growth,
        numericValue: toNumericValue(item.growth ?? undefined),
        highMomentum: item.isBreakout,
      }))

  const filteredQueries = queries.filter((item) => {
    if (item.numericValue === null) return false
    return item.numericValue > 50
  })

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
      {/* Related Topics */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6 pt-3 sm:pt-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-0">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-1.5 sm:gap-2">
              <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-400" />
              Authority List
            </CardTitle>
            <span className="text-[10px] sm:text-xs text-muted-foreground truncate">
              Topical relevance for &quot;{searchQuery}&quot;
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 px-3 sm:px-6 pb-3 sm:pb-6">
          {topics.map((item) => (
            <div
              key={item.topic}
              className="group flex items-center justify-between py-2"
            >
              <Link
                href={`/dashboard/research/overview/${encodeURIComponent(item.topic)}`}
                className="flex items-center gap-2 text-xs sm:text-sm text-foreground group-hover:text-amber-400 transition-colors truncate"
              >
                {item.topic}
                <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
              <span className="text-xs sm:text-sm font-semibold text-emerald-400">
                {item.score}/100
              </span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Breakout Queries */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6 pt-3 sm:pt-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-0">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-1.5 sm:gap-2">
              <Zap className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-500" />
              Breakout Queries
            </CardTitle>
            <span className="text-[10px] sm:text-xs text-muted-foreground hidden sm:inline">
              Rising long-tail demand signals
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 px-3 sm:px-6 pb-3 sm:pb-6">
          {filteredQueries.map((item) => (
            <div
              key={item.query}
              className="group flex items-center justify-between py-2"
            >
              <Link
                href={`/dashboard/research/overview/${encodeURIComponent(item.query)}`}
                className="flex items-center gap-2 text-xs sm:text-sm text-foreground group-hover:text-amber-400 transition-colors truncate"
              >
                {item.query}
                <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
              <div className="flex items-center gap-2">
                {item.highMomentum && (
                  <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-[9px] sm:text-[10px] px-1.5 py-0">
                    High Momentum
                  </Badge>
                )}
                <span className="text-xs sm:text-sm font-semibold text-emerald-400">
                  {typeof item.value === "number" ? `+${item.value}%` : item.value}
                </span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
