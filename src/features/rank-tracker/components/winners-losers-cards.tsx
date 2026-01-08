"use client"

import { memo } from "react"
import { Rocket, TrendingDown, ArrowUp, ArrowDown } from "lucide-react"
import type { RankChangeItem } from "../types"

interface WinnersLosersCardsProps {
  winners: RankChangeItem[]
  losers: RankChangeItem[]
}

/**
 * Display cards showing biggest ranking winners and losers
 * @description Memoized to prevent unnecessary re-renders
 */
export const WinnersLosersCards = memo(function WinnersLosersCards({ winners, losers }: WinnersLosersCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
      {/* Winners */}
      <div className="p-3 sm:p-4 rounded-xl border border-border bg-card">
        <div className="flex items-center gap-2 mb-4">
          <Rocket className="w-4 h-4 text-emerald-400" aria-hidden="true" />
          <h3 className="text-sm font-medium text-foreground">Biggest Winners</h3>
        </div>
        <div className="space-y-3" role="list" aria-label="Biggest ranking winners">
          {winners.length > 0 ? (
            winners.map((item) => (
              <div
                key={item.keyword}
                className="flex items-center justify-between p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20"
                role="listitem"
              >
                <span className="text-sm text-foreground font-medium truncate max-w-36">
                  {item.keyword}
                </span>
                <div className="flex items-center gap-2 text-emerald-400">
                  <span className="text-xs text-muted-foreground">#{item.from}</span>
                  <ArrowUp className="w-4 h-4" aria-hidden="true" />
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
          <TrendingDown className="w-4 h-4 text-red-400" aria-hidden="true" />
          <h3 className="text-sm font-medium text-foreground">Biggest Losers</h3>
        </div>
        <div className="space-y-3" role="list" aria-label="Biggest ranking losers">
          {losers.length > 0 ? (
            losers.map((item) => (
              <div
                key={item.keyword}
                className="flex items-center justify-between p-2 rounded-lg bg-red-500/10 border border-red-500/20"
                role="listitem"
              >
                <span className="text-sm text-foreground font-medium truncate max-w-36">
                  {item.keyword}
                </span>
                <div className="flex items-center gap-2 text-red-400">
                  <span className="text-xs text-muted-foreground">#{item.from}</span>
                  <ArrowDown className="w-4 h-4" aria-hidden="true" />
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
})
