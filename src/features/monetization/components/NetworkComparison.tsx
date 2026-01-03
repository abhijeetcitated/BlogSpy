"use client"

import { CheckCircle, XCircle, ArrowRight, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AdNetwork, EarningsBreakdown } from "../types"
import { formatCurrency, formatNumber } from "../utils"
import { AD_NETWORKS } from "../constants"
import { NetworkIcons } from "./Icons"

interface NetworkComparisonProps {
  breakdown: EarningsBreakdown[]
  recommendedNetworks: AdNetwork[]
  currentPageviews: number
}

export function NetworkComparison({ breakdown, recommendedNetworks, currentPageviews }: NetworkComparisonProps) {
  // Find networks user can't access yet
  const lockedNetworks = AD_NETWORKS.filter(
    n => n.minTraffic > currentPageviews
  )

  return (
    <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
      <h3 className="font-semibold text-foreground mb-3 sm:mb-4 flex items-center gap-2 text-sm sm:text-base">
        <TrendingUp className="h-4 w-4 text-purple-500" />
        Ad Network Comparison
      </h3>

      {/* Network Earnings Table */}
      <div className="overflow-x-auto -mx-4 sm:mx-0">
        <table className="w-full min-w-[500px]">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 sm:py-3 px-3 sm:px-4 text-[10px] sm:text-xs font-medium text-muted-foreground">Network</th>
              <th className="text-right py-2 sm:py-3 px-3 sm:px-4 text-[10px] sm:text-xs font-medium text-muted-foreground">Est. RPM</th>
              <th className="text-right py-2 sm:py-3 px-3 sm:px-4 text-[10px] sm:text-xs font-medium text-muted-foreground">Monthly</th>
              <th className="text-right py-2 sm:py-3 px-3 sm:px-4 text-[10px] sm:text-xs font-medium text-muted-foreground">Yearly</th>
              <th className="text-center py-2 sm:py-3 px-3 sm:px-4 text-[10px] sm:text-xs font-medium text-muted-foreground">Status</th>
            </tr>
          </thead>
          <tbody>
            {breakdown.map((item, index) => {
              const network = AD_NETWORKS.find(n => n.name === item.adNetwork)
              return (
                <tr key={item.adNetwork} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="py-2 sm:py-3 px-3 sm:px-4">
                    <div className="flex items-center gap-2">
                      <span className="shrink-0">
                        {network && NetworkIcons[network.id]}
                      </span>
                      <span className="font-medium text-foreground text-xs sm:text-sm truncate max-w-[100px] sm:max-w-none">{item.adNetwork}</span>
                      {index === 0 && (
                        <span className="text-[10px] sm:text-xs bg-emerald-500/20 text-emerald-400 px-1.5 sm:px-2 py-0.5 rounded-full shrink-0">
                          Best
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-2 sm:py-3 px-3 sm:px-4 text-right font-mono text-cyan-400 text-xs sm:text-sm">
                    ${item.estimatedRpm}
                  </td>
                  <td className="py-2 sm:py-3 px-3 sm:px-4 text-right font-mono text-emerald-400 text-xs sm:text-sm">
                    {formatCurrency(item.monthlyEarnings)}
                  </td>
                  <td className="py-2 sm:py-3 px-3 sm:px-4 text-right font-mono text-emerald-400 text-xs sm:text-sm">
                    {formatCurrency(item.yearlyEarnings)}
                  </td>
                  <td className="py-2 sm:py-3 px-3 sm:px-4 text-center">
                    <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs text-emerald-400">
                      <CheckCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                      <span className="hidden sm:inline">Eligible</span>
                    </span>
                  </td>
                </tr>
              )
            })}
            {/* Locked Networks */}
            {lockedNetworks.map((network) => (
              <tr key={network.id} className="border-b border-border/50 opacity-60">
                <td className="py-2 sm:py-3 px-3 sm:px-4">
                  <div className="flex items-center gap-2">
                    <span className="shrink-0">{NetworkIcons[network.id]}</span>
                    <span className="font-medium text-foreground text-xs sm:text-sm truncate max-w-[100px] sm:max-w-none">{network.name}</span>
                  </div>
                </td>
                <td className="py-2 sm:py-3 px-3 sm:px-4 text-right font-mono text-muted-foreground text-xs sm:text-sm">
                  ${network.avgRpm}+
                </td>
                <td className="py-2 sm:py-3 px-3 sm:px-4 text-right font-mono text-muted-foreground text-xs sm:text-sm">
                  --
                </td>
                <td className="py-2 sm:py-3 px-3 sm:px-4 text-right font-mono text-muted-foreground text-xs sm:text-sm">
                  --
                </td>
                <td className="py-2 sm:py-3 px-3 sm:px-4 text-center">
                  <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs text-red-400">
                    <XCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                    <span className="hidden sm:inline">Need {formatNumber(network.minTraffic)}</span>
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Unlock Message */}
      {lockedNetworks.length > 0 && (
        <div className="mt-3 sm:mt-4 p-3 sm:p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
          <div className="flex flex-col sm:flex-row sm:items-start gap-3">
            <div className="p-2 rounded-lg bg-amber-500/20 w-fit">
              <TrendingUp className="h-4 w-4 text-amber-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-foreground">Grow to unlock premium networks</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                Reach {formatNumber(lockedNetworks[0].minTraffic)} pageviews to unlock {lockedNetworks[0].name} and earn up to ${lockedNetworks[0].avgRpm}+ RPM
              </p>
            </div>
            <Button size="sm" variant="outline" className="text-amber-400 border-amber-400/30 hover:bg-amber-500/10 text-xs sm:text-sm h-8 sm:h-9 w-full sm:w-auto">
              <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
              Growth Tips
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
