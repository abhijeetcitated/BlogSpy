"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { History, Search, TrendingUp, Clock } from "lucide-react"

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface ScanHistoryEntry {
  id: string
  keyword: string
  overallScore: number
  visiblePlatforms: number
  totalPlatforms: number
  creditsUsed: number
  createdAt: string
}

export interface ScanHistoryListProps {
  scans: ScanHistoryEntry[]
  isLoading?: boolean
  isDemoMode?: boolean
  onViewResult?: (scanId: string) => void
}

// ═══════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "Just now"
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

function getScoreBadge(score: number) {
  if (score >= 70) return { color: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10", label: "Strong" }
  if (score >= 40) return { color: "text-amber-400 border-amber-500/30 bg-amber-500/10", label: "Moderate" }
  return { color: "text-red-400 border-red-500/30 bg-red-500/10", label: "Weak" }
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export function ScanHistoryList({
  scans,
  isLoading = false,
  isDemoMode = false,
  onViewResult,
}: ScanHistoryListProps) {
  if (isLoading) {
    return (
      <Card className="bg-card border-border">
        <CardHeader className="pb-2 px-3 sm:px-6">
          <CardTitle className="text-sm sm:text-base font-semibold flex items-center gap-2">
            <History className="h-4 w-4 text-blue-400" />
            Recent Scans
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 sm:px-6 pb-4">
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-14 rounded-lg bg-muted/30 animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (scans.length === 0 && !isDemoMode) {
    return (
      <Card className="bg-card border-border">
        <CardHeader className="pb-2 px-3 sm:px-6">
          <CardTitle className="text-sm sm:text-base font-semibold flex items-center gap-2">
            <History className="h-4 w-4 text-blue-400" />
            Recent Scans
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 sm:px-6 pb-4">
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <Search className="h-8 w-8 text-muted-foreground/40 mb-2" />
            <p className="text-sm text-muted-foreground">No scans yet</p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              Run your first scan to see results here
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2 px-3 sm:px-6">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm sm:text-base font-semibold flex items-center gap-2">
            <History className="h-4 w-4 text-blue-400" />
            Recent Scans
          </CardTitle>
          <span className="text-xs text-muted-foreground">{scans.length} scan{scans.length !== 1 ? "s" : ""}</span>
        </div>
      </CardHeader>
      <CardContent className="px-3 sm:px-6 pb-4">
        <div className="space-y-2">
          {scans.map((scan) => {
            const scoreBadge = getScoreBadge(scan.overallScore)
            return (
              <button
                key={scan.id}
                onClick={() => onViewResult?.(scan.id)}
                className="w-full flex items-center gap-3 p-2.5 sm:p-3 rounded-lg border border-border hover:border-primary/30 hover:bg-muted/30 transition-colors text-left"
              >
                {/* Score */}
                <div className="flex flex-col items-center min-w-[48px]">
                  <span className="text-lg font-bold text-foreground">{scan.overallScore}%</span>
                  <Badge variant="outline" className={`text-[8px] px-1 h-4 ${scoreBadge.color}`}>
                    {scoreBadge.label}
                  </Badge>
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{scan.keyword}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      {scan.visiblePlatforms}/{scan.totalPlatforms} platforms
                    </span>
                    <span className="text-xs text-muted-foreground">•</span>
                    <span className="text-xs text-muted-foreground">{scan.creditsUsed} credits</span>
                  </div>
                </div>

                {/* Time */}
                <span className="text-[10px] sm:text-xs text-muted-foreground shrink-0 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {timeAgo(scan.createdAt)}
                </span>
              </button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
