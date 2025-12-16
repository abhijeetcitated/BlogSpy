"use client"

import { Globe, Zap, CheckCircle2, Clock, Trash2, ExternalLink } from "lucide-react"
import { FEATURES_LIST } from "../constants"
import type { ScanHistoryItem } from "../hooks"
import { getScoreInfo } from "../utils/checker-utils"
import { cn } from "@/lib/utils"

interface EmptyStateProps {
  history?: ScanHistoryItem[]
  onSelectUrl?: (url: string, keyword: string) => void
  onClearHistory?: () => void
}

export function EmptyState({ history = [], onSelectUrl, onClearHistory }: EmptyStateProps) {
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString("en-US", { 
      month: "short", 
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })
  }

  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center max-w-xl">
        <div className="mx-auto w-20 h-20 rounded-full bg-cyan-500/10 flex items-center justify-center mb-6">
          <Globe className="h-10 w-10 text-cyan-600 dark:text-cyan-400" />
        </div>
        <h2 className="text-xl font-semibold text-foreground mb-2">
          Ready to Analyze Your Page
        </h2>
        <p className="text-sm text-muted-foreground mb-6">
          Enter a URL above and click "Run Scan" to get a comprehensive SEO audit with 
          AI-powered fix suggestions, semantic keyword analysis, and SERP preview.
        </p>
        <div className="flex flex-wrap justify-center gap-3 text-xs text-muted-foreground mb-8">
          {FEATURES_LIST.map((feature) => (
            <div key={feature.label} className="flex items-center gap-1.5 px-3 py-1.5 bg-muted/50 rounded-full">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              {feature.label}
            </div>
          ))}
        </div>

        {/* Recent Scans History */}
        {history.length > 0 && (
          <div className="border-t border-border pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Recent Scans</span>
              </div>
              {onClearHistory && (
                <button
                  onClick={onClearHistory}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                >
                  <Trash2 className="h-3 w-3" />
                  Clear
                </button>
              )}
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {history.slice(0, 5).map((item) => {
                const scoreInfo = getScoreInfo(item.score)
                return (
                  <button
                    key={item.id}
                    onClick={() => onSelectUrl?.(item.url, item.targetKeyword)}
                    className="w-full text-left p-3 rounded-lg bg-muted/30 hover:bg-muted/50 border border-transparent hover:border-border transition-all group"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-foreground truncate">
                            {item.url.replace(/^https?:\/\//, "")}
                          </p>
                          <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        {item.targetKeyword && (
                          <p className="text-xs text-muted-foreground truncate">
                            Keyword: {item.targetKeyword}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={cn("text-sm font-semibold", scoreInfo.color)}>
                          {item.score}
                        </span>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatDate(item.timestamp)}
                        </span>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export function ScanningState() {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Skeleton 3-Column Grid */}
      <div className="flex-1 grid grid-cols-12 overflow-hidden">
        {/* Page Structure Skeleton */}
        <div className="col-span-3 border-r border-border bg-card/30 p-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-4 w-4 rounded bg-muted animate-pulse" />
            <div className="h-4 w-24 rounded bg-muted animate-pulse" />
          </div>
          <div className="space-y-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex items-center gap-2 py-1.5 px-2">
                <div className="h-6 w-6 rounded bg-muted animate-pulse" />
                <div className="h-3 flex-1 rounded bg-muted animate-pulse" style={{ width: `${60 + Math.random() * 30}%` }} />
                <div className="h-3.5 w-3.5 rounded bg-muted animate-pulse" />
              </div>
            ))}
          </div>
        </div>

        {/* Issues Panel Skeleton */}
        <div className="col-span-5 border-r border-border bg-card/30 p-4">
          <div className="flex gap-2 mb-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-8 flex-1 rounded bg-muted animate-pulse" />
            ))}
          </div>
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="p-3 rounded-lg border border-muted/30 bg-muted/5">
                <div className="flex items-start gap-3">
                  <div className="h-4 w-4 rounded bg-muted animate-pulse mt-0.5" />
                  <div className="flex-1 space-y-2">
                    <div className="flex justify-between">
                      <div className="h-4 w-40 rounded bg-muted animate-pulse" />
                      <div className="h-5 w-16 rounded bg-muted animate-pulse" />
                    </div>
                    <div className="h-3 w-full rounded bg-muted animate-pulse" />
                    <div className="flex gap-2">
                      <div className="h-4 w-20 rounded bg-muted animate-pulse" />
                      <div className="h-4 w-16 rounded bg-muted animate-pulse" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* NLP Keywords Skeleton */}
        <div className="col-span-4 bg-card/30 p-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-4 w-4 rounded bg-muted animate-pulse" />
            <div className="h-4 w-36 rounded bg-muted animate-pulse" />
          </div>
          <div className="h-3 w-64 rounded bg-muted animate-pulse mb-4" />
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 15 }).map((_, i) => (
              <div 
                key={i} 
                className="h-7 rounded-full bg-muted animate-pulse"
                style={{ width: `${50 + Math.random() * 60}px` }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* SERP Preview Skeleton */}
      <div className="border-t border-border bg-card/30 p-4">
        <div className="max-w-2xl">
          <div className="h-3 w-48 rounded bg-muted animate-pulse mb-2" />
          <div className="h-5 w-80 rounded bg-muted animate-pulse mb-2" />
          <div className="h-3 w-full rounded bg-muted animate-pulse" />
        </div>
      </div>

      {/* Scanning Overlay */}
      <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px] flex items-center justify-center">
        <div className="text-center">
          <div className="relative mx-auto w-24 h-24 mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-muted" />
            <div 
              className="absolute inset-0 rounded-full border-4 border-transparent border-t-cyan-500 animate-spin"
              style={{ animationDuration: "1s" }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <Zap className="h-8 w-8 text-cyan-600 dark:text-cyan-400" />
            </div>
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Scanning Page...
          </h2>
          <p className="text-sm text-muted-foreground">
            Analyzing structure, content, and SEO factors
          </p>
        </div>
      </div>
    </div>
  )
}
