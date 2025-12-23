"use client"

import Link from "next/link"
import { Code2, Search, TrendingUp, Target } from "lucide-react"
import { Button } from "@/components/ui/button"

interface FeatureLinksBarProps {
  targetKeyword?: string
}

export function FeatureLinksBar({ targetKeyword }: FeatureLinksBarProps) {
  const features = [
    {
      icon: Code2,
      label: "Add Schema Markup",
      description: "Generate structured data",
      href: "/dashboard/creation/schema-generator",
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-500/10 hover:bg-purple-500/20",
    },
    {
      icon: Search,
      label: "Keyword Research",
      description: "Analyze keyword potential",
      href: targetKeyword 
        ? `/keyword-overview?keyword=${encodeURIComponent(targetKeyword)}`
        : "/keyword-overview",
      color: "text-cyan-600 dark:text-cyan-400",
      bgColor: "bg-cyan-500/10 hover:bg-cyan-500/20",
    },
    {
      icon: TrendingUp,
      label: "Track Rankings",
      description: "Monitor your positions",
      href: "/rank-tracker",
      color: "text-emerald-600 dark:text-emerald-400",
      bgColor: "bg-emerald-500/10 hover:bg-emerald-500/20",
    },
    {
      icon: Target,
      label: "Competitor Analysis",
      description: "See competitor gaps",
      href: "/competitor-gap",
      color: "text-orange-600 dark:text-orange-400",
      bgColor: "bg-orange-500/10 hover:bg-orange-500/20",
    },
  ]

  return (
    <div className="border-t border-border bg-card/30 px-2 sm:px-3 md:px-4 py-2 sm:py-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <span className="text-xs sm:text-sm font-medium text-muted-foreground">
          Quick Actions
        </span>
        <div className="grid grid-cols-2 sm:flex sm:items-center gap-1.5 sm:gap-2">
          {features.map((feature) => (
            <Link key={feature.label} href={feature.href}>
              <Button
                variant="ghost"
                size="sm"
                className={`${feature.bgColor} ${feature.color} gap-1.5 sm:gap-2 h-9 sm:h-8 text-xs w-full sm:w-auto touch-manipulation`}
              >
                <feature.icon className="h-3.5 w-3.5" />
                <span className="sm:hidden lg:inline">{feature.label}</span>
              </Button>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
