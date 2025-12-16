"use client"

import Link from "next/link"
import { ExternalLink } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

import { newsItems } from "../__mocks__"

export function NewsContext() {
  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="flex items-center gap-1.5 sm:gap-2">
        <ExternalLink className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
        <h2 className="text-base sm:text-lg font-semibold text-foreground">
          Triggering Events
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
        {newsItems.map((news, i) => (
          <Card
            key={i}
            className="bg-card border-border hover:border-muted-foreground/30 transition-all group"
          >
            <CardContent className="p-3 sm:p-4 space-y-2.5 sm:space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-muted flex items-center justify-center text-xs sm:text-sm font-bold text-foreground border border-border shrink-0">
                    {news.logo}
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs sm:text-sm font-medium text-foreground truncate block">
                      {news.source}
                    </span>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">{news.time}</p>
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className={`shrink-0 text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 ${
                    news.sentiment === "Positive"
                      ? "border-emerald-500/30 text-emerald-400 bg-emerald-500/10"
                      : "border-border text-muted-foreground bg-muted"
                  }`}
                >
                  {news.sentiment}
                </Badge>
              </div>

              <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 group-hover:text-foreground transition-colors">
                {news.headline}
              </p>

              {/* Draft Response - Links to AI Writer */}
              <Button
                variant="outline"
                size="sm"
                className="w-full h-8 sm:h-9 text-xs sm:text-sm bg-transparent border-border text-muted-foreground hover:text-foreground hover:bg-muted active:bg-muted"
                asChild
              >
                <Link
                  href={`/dashboard/creation/ai-writer?type=news&topic=${encodeURIComponent(news.headline)}`}
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
