"use client"

import { Rocket, TrendingDown, ArrowUp, ArrowDown } from "lucide-react"
import type { RankChangeItem } from "../types"

interface WinnersLosersCardsProps {
  winners: RankChangeItem[]
  losers: RankChangeItem[]
}

export function WinnersLosersCards({ winners, losers }: WinnersLosersCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
      {/* Winners */}
      <div className="p-3 sm:p-4 rounded-xl border border-border bg-card">
        <div className="flex items-center gap-2 mb-4">
          <Rocket className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-medium text-foreground">Biggest Winners</h3>
        </div>
        <div className="space-y-3">
          {winners.length > 0 ? (
            winners.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20"
              >
                <span className="text-sm text-foreground font-medium truncate max-w-36">
                  {item.keyword}
                </span>
                <div className="flex items-center gap-2 text-emerald-400">
                  <span className="text-xs text-muted-foreground">#{item.from}</span>
                  <ArrowUp className="w-4 h-4" />
                  <span className="text-sm font-bold">#{item.to}</span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">No improvements today</p>
          )}
        </div>
      </div>

      {/* Losers */}
      <div className="p-3 sm:p-4 rounded-xl border border-border bg-card">
        <div className="flex items-center gap-2 mb-4">
          <TrendingDown className="w-4 h-4 text-red-400" />
          <h3 className="text-sm font-medium text-foreground">Biggest Losers</h3>
        </div>
        <div className="space-y-3">
          {losers.length > 0 ? (
            losers.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 rounded-lg bg-red-500/10 border border-red-500/20"
              >
                <span className="text-sm text-foreground font-medium truncate max-w-36">
                  {item.keyword}
                </span>
                <div className="flex items-center gap-2 text-red-400">
                  <span className="text-xs text-muted-foreground">#{item.from}</span>
                  <ArrowDown className="w-4 h-4" />
                  <span className="text-sm font-bold">#{item.to}</span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">No declines today</p>
          )}
        </div>
      </div>
    </div>
  )
}
