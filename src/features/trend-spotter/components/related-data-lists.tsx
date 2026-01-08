"use client"

import Link from "next/link"
import { TrendingUp, Zap, ArrowUpRight } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

import { relatedTopics, breakoutQueries } from "../__mocks__"

interface RelatedDataListsProps {
  searchQuery: string
}

export function RelatedDataLists({ searchQuery }: RelatedDataListsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
      {/* Related Topics */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6 pt-3 sm:pt-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-0">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-1.5 sm:gap-2">
              <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Related Topics
            </CardTitle>
            <span className="text-[10px] sm:text-xs text-muted-foreground truncate">
              Rising with &quot;{searchQuery}&quot;
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-0.5 sm:space-y-1 px-2 sm:px-6 pb-3 sm:pb-6">
          {relatedTopics.map((item) => (
            <Link
              key={item.topic}
              href={`/dashboard/research/overview/${encodeURIComponent(item.topic)}`}
              className="flex items-center justify-between py-2 sm:py-2.5 px-2 sm:px-3 rounded-lg cursor-pointer hover:bg-muted active:bg-muted transition-colors group"
            >
              <span className="text-xs sm:text-sm text-foreground group-hover:text-amber-400 transition-colors truncate flex-1 mr-2">
                {item.topic}
              </span>
              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                {item.growth && (
                  <span className="text-xs sm:text-sm font-mono text-emerald-400 hidden sm:inline">
                    {item.growth}
                  </span>
                )}
                <Badge
                  variant="outline"
                  className={`text-[9px] sm:text-xs px-1 sm:px-2 py-0 ${
                    item.status === "Rising"
                      ? "border-emerald-500/30 text-emerald-400 bg-emerald-500/10"
                      : "border-amber-500/30 text-amber-400 bg-amber-500/10"
                  }`}
                >
                  {item.status}
                </Badge>
                <ArrowUpRight className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-muted-foreground group-hover:text-amber-400 transition-colors" />
              </div>
            </Link>
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
              The holy 🔥 - exact searches
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-0.5 sm:space-y-1 px-2 sm:px-6 pb-3 sm:pb-6">
          {breakoutQueries.map((item) => (
            <Link
              key={item.query}
              href={`/dashboard/research/overview/${encodeURIComponent(item.query)}`}
              className="flex items-center justify-between py-2 sm:py-2.5 px-2 sm:px-3 rounded-lg cursor-pointer hover:bg-muted active:bg-muted transition-colors group"
            >
              <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
                <span className="text-xs sm:text-sm text-foreground group-hover:text-amber-400 transition-colors truncate">
                  {item.query}
                </span>
                {item.isBreakout && (
                  <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-[9px] sm:text-[10px] px-1 sm:px-1.5 py-0 shrink-0">
                    🔥
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                <span className="text-xs sm:text-sm font-mono text-emerald-400">
                  {item.growth}
                </span>
                <ArrowUpRight className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-muted-foreground group-hover:text-amber-400 transition-colors" />
              </div>
            </Link>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
