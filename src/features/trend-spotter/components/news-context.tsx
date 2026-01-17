"use client"

import Link from "next/link"
import { ExternalLink } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

import { relatedTopics } from "../__mocks__"

export function NewsContext() {
  const featuredTopics = relatedTopics
    .filter((topic) => topic.status === "Rising")
    .map((topic) => {
      const growthValue = topic.growth
        ? Number.parseFloat(topic.growth.replace("%", "").replace("+", ""))
        : 0
      return { ...topic, growthValue }
    })
    .sort((a, b) => b.growthValue - a.growthValue)
    .slice(0, 3)

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="flex items-center gap-1.5 sm:gap-2">
        <ExternalLink className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
        <h2 className="text-base sm:text-lg font-semibold text-foreground">
          Triggering Events
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
        {featuredTopics.map((topic) => (
          <Card
            key={topic.topic}
            className="bg-card border-border hover:border-muted-foreground/30 transition-all group"
          >
            <CardContent className="p-3 sm:p-4 space-y-2.5 sm:space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-muted flex items-center justify-center text-xs sm:text-sm font-bold text-foreground border border-border shrink-0">
                    TS
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] sm:text-xs text-muted-foreground block">
                      Related Topic
                    </span>
                    <h3 className="text-sm sm:text-base font-semibold text-foreground truncate">
                      {topic.topic}
                    </h3>
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className={`shrink-0 text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 ${
                    topic.status === "Rising"
                      ? "border-emerald-500/30 text-emerald-400 bg-emerald-500/10"
                      : "border-amber-500/30 text-amber-400 bg-amber-500/10"
                  }`}
                >
                  {topic.status}
                </Badge>
              </div>

              <div className="flex items-center justify-between gap-3">
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">Momentum</span>
                  <span className="text-lg sm:text-xl font-semibold text-emerald-400">
                    {topic.growth || "+0%"}
                  </span>
                </div>
                <div className="flex items-end gap-1 h-8">
                  <span className="w-1.5 h-3 rounded bg-emerald-500/30" />
                  <span className="w-1.5 h-5 rounded bg-emerald-500/40" />
                  <span className="w-1.5 h-7 rounded bg-emerald-500/60" />
                  <span className="w-1.5 h-4 rounded bg-emerald-500/35" />
                  <span className="w-1.5 h-6 rounded bg-emerald-500/50" />
                </div>
              </div>

              {/* Draft Response - Links to AI Writer */}
              <Button
                variant="outline"
                size="sm"
                className="w-full h-8 sm:h-9 text-xs sm:text-sm bg-amber-500/15 border-amber-500/40 text-amber-300 hover:bg-amber-500/25 hover:text-amber-200 transition-colors"
                asChild
              >
                <Link
                  href={`/ai-writer?source=trend-spotter&keyword=${encodeURIComponent(topic.topic)}&velocity=rising&news_angle=true`}
                >
                  Draft Response
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
