"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  ShoppingCart, 
  TrendingUp, 
  Star,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react"
import type { CommerceSummary } from "../types"

interface CommerceSummaryCardsProps {
  summary: CommerceSummary
}

export function CommerceSummaryCards({ summary }: CommerceSummaryCardsProps) {
  const stats = [
    {
      title: "Amazon Rankings",
      value: summary.amazonRanking,
      icon: ShoppingCart,
      color: "text-amber-400",
      bgColor: "bg-amber-500/10",
      iconBg: "bg-amber-500/20",
    },
    {
      title: "Top 10 Keywords",
      value: summary.top10Count,
      change: 12,
      icon: TrendingUp,
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/10",
      iconBg: "bg-emerald-500/20",
    },
    {
      title: "Avg Price",
      value: `$${summary.avgPrice}`,
      icon: DollarSign,
      color: "text-green-400",
      bgColor: "bg-green-500/10",
      iconBg: "bg-green-500/20",
    },
    {
      title: "Avg Rating",
      value: summary.avgRating,
      suffix: "/5",
      change: 5,
      icon: Star,
      color: "text-yellow-400",
      bgColor: "bg-yellow-500/10",
      iconBg: "bg-yellow-500/20",
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-2.5 md:gap-3 lg:gap-4">
      {stats.map((stat, index) => (
        <Card key={index} className="bg-card border-border hover:border-primary/20 transition-colors">
          <CardContent className="p-2.5 sm:p-3 md:p-4 lg:p-5">
            {/* Mobile: Horizontal compact layout */}
            <div className="flex items-center gap-2 sm:gap-2.5 md:hidden">
              <div className={`p-1.5 sm:p-2 rounded-lg shrink-0 ${stat.iconBg}`}>
                <stat.icon className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${stat.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-0.5">
                  <span className="text-base sm:text-lg font-bold text-foreground">
                    {stat.value}
                  </span>
                  {stat.suffix && (
                    <span className="text-[10px] sm:text-xs text-muted-foreground">{stat.suffix}</span>
                  )}
                  {stat.change !== undefined && (
                    <span className={`text-[10px] sm:text-xs ml-1 ${stat.change >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                      {stat.change >= 0 ? '+' : ''}{Math.abs(stat.change)}%
                    </span>
                  )}
                </div>
                <p className="text-[10px] sm:text-[11px] text-muted-foreground truncate">{stat.title}</p>
              </div>
            </div>

            {/* Tablet & Desktop: Vertical layout */}
            <div className="hidden md:block">
              <div className="flex items-center justify-between mb-2 md:mb-3 lg:mb-4">
                <div className={`p-2 md:p-2.5 lg:p-3 rounded-lg md:rounded-xl ${stat.iconBg}`}>
                  <stat.icon className={`h-4 w-4 md:h-4 md:w-4 lg:h-5 lg:w-5 ${stat.color}`} />
                </div>
                {stat.change !== undefined && (
                  <Badge 
                    variant="outline" 
                    className={`text-[10px] md:text-xs px-1.5 md:px-2 py-0.5 font-medium ${stat.change >= 0 
                      ? "text-emerald-400 border-emerald-500/30 bg-emerald-500/10" 
                      : "text-red-400 border-red-500/30 bg-red-500/10"
                    }`}
                  >
                    {stat.change >= 0 ? (
                      <ArrowUpRight className="h-2.5 w-2.5 md:h-3 md:w-3 mr-0.5 md:mr-1" />
                    ) : (
                      <ArrowDownRight className="h-2.5 w-2.5 md:h-3 md:w-3 mr-0.5 md:mr-1" />
                    )}
                    {stat.change >= 0 ? '+' : ''}{Math.abs(stat.change)}%
                  </Badge>
                )}
              </div>
              <div className="flex items-baseline gap-0.5 md:gap-1 mb-0.5 md:mb-1">
                <span className="text-lg md:text-xl lg:text-3xl font-bold text-foreground tracking-tight">
                  {stat.value}
                </span>
                {stat.suffix && (
                  <span className="text-xs md:text-sm lg:text-base text-muted-foreground font-medium">{stat.suffix}</span>
                )}
              </div>
              <p className="text-[11px] md:text-xs lg:text-sm text-muted-foreground font-medium">{stat.title}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
