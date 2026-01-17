"use client"

import React from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowUpRight, Newspaper, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { handleFeatureAccess } from "@/lib/feature-guard"

interface Topic {
  topic_title: string
  topic_type: string
  value: number
}

interface TriggeringEventsProps {
  data?: {
    relatedTopics?: { rising?: Topic[] }
  }
}

export function TriggeringEvents({ data }: TriggeringEventsProps) {
  const topics = data?.relatedTopics?.rising || []

  const displayItems =
    topics.length > 0
      ? topics.slice(0, 3)
      : [
          { topic_title: "AI Agents Framework", topic_type: "Tech Trend", value: 120 },
          { topic_title: "Generative Search", topic_type: "SEO Update", value: 85 },
          { topic_title: "Nvidia Earnings", topic_type: "Market News", value: 45 },
        ]

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <Newspaper className="h-5 w-5 text-muted-foreground" />
        <h3 className="text-lg font-semibold text-foreground">Triggering Events</h3>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {displayItems.map((item, index) => (
          <Card
            key={`${item.topic_title}-${index}`}
            className="p-4 bg-card border-border hover:border-emerald-500/30 transition-all group"
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center font-bold text-xs text-foreground">
                  {item.topic_title.substring(0, 2).toUpperCase()}
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                    {item.topic_type || "Trending Topic"}
                  </span>
                  <h4 className="text-sm font-medium text-foreground group-hover:text-emerald-500 transition-colors line-clamp-1">
                    {item.topic_title}
                  </h4>
                </div>
              </div>
              <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500 border-0 text-xs">
                Positive
              </Badge>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-muted-foreground line-clamp-2">
                Significant market interest detected for <strong>{item.topic_title}</strong>. Search
                velocity has increased by {item.value}% in the last period.
              </p>

              <div className="flex items-center justify-between pt-2 border-t border-border/60">
                <div className="flex items-center gap-1 text-emerald-500 text-xs font-bold">
                  <TrendingUp className="h-3 w-3" />
                  +{item.value}% Momentum
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-[10px] text-muted-foreground hover:text-foreground"
                  onClick={() =>
                    handleFeatureAccess("AI_WRITER", () => {
                      console.log("Opening AI Writer for:", item.topic_title)
                    })
                  }
                >
                  Draft Response <ArrowUpRight className="ml-1 h-3 w-3" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </section>
  )
}
