"use client"

import { Calculator, TrendingDown, Info } from "lucide-react"
import { DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import type { Keyword } from "../../types"

interface RtvFormulaDialogProps {
  keyword: Keyword
}

function formatInt(n: number): string {
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(
    Number.isFinite(n) ? n : 0
  )
}

function normalizeBreakdownValue(value: number): number {
  if (!Number.isFinite(value)) return 0
  if (value > 0 && value < 1) return Math.round(value * 100)
  return Math.round(value)
}

export function RtvFormulaDialog({ keyword }: RtvFormulaDialogProps) {
  const volume = Math.max(0, Number(keyword.volume ?? 0) || 0)
  const rtv = Math.max(0, Number(keyword.rtv ?? 0) || 0)
  const rtvBreakdown = Array.isArray(keyword.rtvBreakdown) ? keyword.rtvBreakdown : []
  
  const totalLoss = rtvBreakdown.reduce((acc, item) => acc + normalizeBreakdownValue(item.value), 0)
  const realPercentage = volume > 0 ? Math.round((rtv / volume) * 100) : 0
  const lossPercentage = 100 - realPercentage

  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2 text-xl text-white">
          <Calculator className="h-5 w-5 text-emerald-400" />
          RTV Calculation Formula
        </DialogTitle>
        <DialogDescription className="text-zinc-400">
          How we calculate Realizable Traffic Value for &ldquo;{keyword.keyword}&rdquo;
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-6 pt-4">
        {/* Base Formula */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-blue-400" />
            <h3 className="text-sm font-semibold text-zinc-200">Base Formula</h3>
          </div>
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
            <div className="font-mono text-sm text-zinc-300">
              <div className="mb-2">RTV = Volume × (1 - Total Loss)</div>
              <div className="text-xs text-zinc-500">Maximum loss capped at 85%</div>
            </div>
          </div>
        </div>

        <Separator className="bg-zinc-800" />

        {/* Calculation Steps */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-zinc-200">Step-by-Step Calculation</h3>
          
          {/* Step 1: Starting Volume */}
          <div className="space-y-2">
            <div className="flex items-baseline gap-2">
              <Badge variant="outline" className="h-5 w-5 flex items-center justify-center p-0 border-blue-500/30 bg-blue-500/10 text-blue-300 text-xs">
                1
              </Badge>
              <span className="text-sm text-zinc-300">Starting search volume</span>
            </div>
            <div className="ml-7 rounded-md border border-zinc-800 bg-zinc-900/30 px-3 py-2">
              <div className="text-2xl font-semibold text-white tabular-nums">
                {formatInt(volume)}
                <span className="ml-2 text-sm font-normal text-zinc-500">searches/month</span>
              </div>
            </div>
          </div>

          {/* Step 2: SERP Feature Losses */}
          <div className="space-y-2">
            <div className="flex items-baseline gap-2">
              <Badge variant="outline" className="h-5 w-5 flex items-center justify-center p-0 border-rose-500/30 bg-rose-500/10 text-rose-300 text-xs">
                2
              </Badge>
              <span className="text-sm text-zinc-300">Subtract traffic losses from SERP features</span>
            </div>
            <div className="ml-7 space-y-2">
              {rtvBreakdown.length === 0 ? (
                <div className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
                  ✓ No major SERP suppressors detected
                </div>
              ) : (
                rtvBreakdown.map((item, index) => {
                  const lossValue = normalizeBreakdownValue(item.value)
                  const lostClicks = Math.round((volume * lossValue) / 100)
                  
                  return (
                    <div
                      key={`${item.label}-${index}`}
                      className="rounded-md border border-zinc-800 bg-zinc-900/30 p-3"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-zinc-200">{item.label}</span>
                        <Badge
                          variant="outline"
                          className="border-rose-500/30 bg-rose-500/10 text-rose-300 text-xs"
                        >
                          <TrendingDown className="h-3 w-3 mr-1" />
                          -{lossValue}%
                        </Badge>
                      </div>
                      <div className="text-xs text-zinc-500">
                        {formatInt(lostClicks)} clicks lost to this feature
                      </div>
                    </div>
                  )
                })
              )}
              
              <div className="rounded-md border border-rose-500/30 bg-rose-500/10 px-3 py-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-rose-200">Total Loss</span>
                  <span className="text-lg font-bold text-rose-300 tabular-nums">{lossPercentage}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Step 3: Final RTV */}
          <div className="space-y-2">
            <div className="flex items-baseline gap-2">
              <Badge variant="outline" className="h-5 w-5 flex items-center justify-center p-0 border-emerald-500/30 bg-emerald-500/10 text-emerald-300 text-xs">
                3
              </Badge>
              <span className="text-sm text-zinc-300">Realizable Traffic Value (RTV)</span>
            </div>
            <div className="ml-7 rounded-lg border-2 border-emerald-500/30 bg-emerald-500/10 p-4">
              <div className="flex items-baseline justify-between">
                <div>
                  <div className="text-3xl font-bold text-emerald-300 tabular-nums">
                    {formatInt(rtv)}
                  </div>
                  <div className="text-sm text-emerald-200/70 mt-1">
                    real clicks/month
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className="border-emerald-500/30 bg-emerald-500/20 text-emerald-200 text-sm px-3 py-1"
                >
                  {realPercentage}% of volume
                </Badge>
              </div>
            </div>
          </div>
        </div>

        <Separator className="bg-zinc-800" />

        {/* Loss Rules Reference */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-zinc-200">Traffic Loss Rules</h3>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-md border border-zinc-800 bg-zinc-900/30 px-3 py-2">
              <div className="text-rose-300 font-medium">AI Overview</div>
              <div className="text-zinc-500">-50% CTR loss</div>
            </div>
            <div className="rounded-md border border-zinc-800 bg-zinc-900/30 px-3 py-2">
              <div className="text-orange-300 font-medium">Local Pack</div>
              <div className="text-zinc-500">-30% CTR loss</div>
            </div>
            <div className="rounded-md border border-zinc-800 bg-zinc-900/30 px-3 py-2">
              <div className="text-amber-300 font-medium">Featured Snippet</div>
              <div className="text-zinc-500">-20% CTR loss*</div>
            </div>
            <div className="rounded-md border border-zinc-800 bg-zinc-900/30 px-3 py-2">
              <div className="text-pink-300 font-medium">Paid Ads</div>
              <div className="text-zinc-500">-15% CTR loss</div>
            </div>
            <div className="rounded-md border border-zinc-800 bg-zinc-900/30 px-3 py-2">
              <div className="text-yellow-300 font-medium">Video Carousel</div>
              <div className="text-zinc-500">-10% CTR loss</div>
            </div>
          </div>
          <div className="text-xs text-zinc-500 italic">
            * Featured Snippet loss only applies when no AI Overview is present
          </div>
        </div>
      </div>
    </>
  )
}

export default RtvFormulaDialog
