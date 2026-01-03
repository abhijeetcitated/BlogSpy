"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Trophy, MessageSquare, TrendingUp } from "lucide-react"

interface WeakSpotStatsProps {
  highOpportunity: number
  redditCount: number
  totalPotential: number
}

export function WeakSpotStats({ highOpportunity, redditCount, totalPotential }: WeakSpotStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="bg-linear-to-br from-emerald-500/10 to-emerald-500/5 border-emerald-500/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-emerald-400 uppercase tracking-wider font-medium">High Opportunity</p>
              <p className="text-2xl font-bold text-foreground mt-1">{highOpportunity}</p>
              <p className="text-xs text-muted-foreground">Easy wins available</p>
            </div>
            <div className="p-3 rounded-full bg-emerald-500/20">
              <Trophy className="h-6 w-6 text-emerald-400" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-linear-to-br from-orange-500/10 to-orange-500/5 border-orange-500/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-orange-400 uppercase tracking-wider font-medium">Reddit Threads</p>
              <p className="text-2xl font-bold text-foreground mt-1">{redditCount}</p>
              <p className="text-xs text-muted-foreground">Ranking in Top 10</p>
            </div>
            <div className="p-3 rounded-full bg-orange-500/20">
              <MessageSquare className="h-6 w-6 text-orange-400" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-linear-to-br from-cyan-500/10 to-cyan-500/5 border-cyan-500/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-cyan-400 uppercase tracking-wider font-medium">Traffic Potential</p>
              <p className="text-2xl font-bold text-foreground mt-1">{totalPotential.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Monthly visits possible</p>
            </div>
            <div className="p-3 rounded-full bg-cyan-500/20">
              <TrendingUp className="h-6 w-6 text-cyan-400" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
