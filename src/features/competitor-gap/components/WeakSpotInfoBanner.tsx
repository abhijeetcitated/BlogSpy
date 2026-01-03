"use client"

import { Sparkles } from "lucide-react"

export function WeakSpotInfoBanner() {
  return (
    <div className="p-4 rounded-lg bg-linear-to-r from-cyan-500/10 via-transparent to-purple-500/10 border border-cyan-500/20">
      <div className="flex items-start gap-3">
        <Sparkles className="h-5 w-5 text-cyan-400 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-medium text-foreground">Weak Spot Strategy</p>
          <p className="text-xs text-muted-foreground mt-1">
            These keywords have Reddit threads, Quora answers, or other low-authority content ranking in Top 10. 
            Write a comprehensive article to outrank them easily! Click on the thread title to see what's currently ranking.
          </p>
        </div>
      </div>
    </div>
  )
}
