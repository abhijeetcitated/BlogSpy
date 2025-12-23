// ============================================
// RANK TRACKER - Keyword Detail Modal
// ============================================

"use client"

import { Target, Edit2, BarChart3, Globe, Eye, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Sparkline } from "@/components/charts"
import { cn } from "@/lib/utils"
import { RankBadge } from "../rank-badge"
import { SerpFeatureIcon } from "../serp-feature-icon"
import type { RankData } from "../../types"

interface KeywordDetailModalProps {
  keyword: RankData | null
  onClose: () => void
  onEdit: (keyword: RankData) => void
}

export function KeywordDetailModal({
  keyword,
  onClose,
  onEdit,
}: KeywordDetailModalProps) {
  const handleEdit = () => {
    if (keyword) {
      onEdit(keyword)
      onClose()
    }
  }

  return (
    <Dialog open={!!keyword} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-card border-border text-foreground max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-emerald-400" />
            Keyword Details
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Full ranking history and performance data
          </DialogDescription>
        </DialogHeader>
        {keyword && (
          <div className="space-y-6 py-4">
            {/* Keyword Overview */}
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-foreground">{keyword.keyword}</h3>
                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <BarChart3 className="w-4 h-4" />
                    {keyword.volume.toLocaleString()} monthly searches
                  </span>
                  <span className="flex items-center gap-1">
                    <Globe className="w-4 h-4" />
                    {keyword.country || "Worldwide"}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <RankBadge rank={keyword.rank} />
                <div className="mt-1">
                  {keyword.change !== 0 && (
                    <span className={cn(
                      "text-sm font-medium",
                      keyword.change > 0 ? "text-emerald-400" : "text-red-400"
                    )}>
                      {keyword.change > 0 ? "▲" : "▼"} {Math.abs(keyword.change)} today
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* 30-Day Trend Chart */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">30-Day Ranking Trend</h4>
              <div className="h-32 rounded-lg bg-muted/30 border border-border p-4">
                <Sparkline data={keyword.trendHistory} />
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-lg bg-muted/30 border border-border p-4 text-center">
                <div className="text-2xl font-bold text-foreground">
                  {Math.min(...keyword.trendHistory)}
                </div>
                <div className="text-xs text-emerald-400">Best Rank</div>
              </div>
              <div className="rounded-lg bg-muted/30 border border-border p-4 text-center">
                <div className="text-2xl font-bold text-foreground">
                  {Math.max(...keyword.trendHistory)}
                </div>
                <div className="text-xs text-red-400">Worst Rank</div>
              </div>
              <div className="rounded-lg bg-muted/30 border border-border p-4 text-center">
                <div className="text-2xl font-bold text-foreground">
                  {Math.round(keyword.trendHistory.reduce((a, b) => a + b, 0) / keyword.trendHistory.length)}
                </div>
                <div className="text-xs text-muted-foreground">Avg Rank</div>
              </div>
            </div>

            {/* SERP Features */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">SERP Features</h4>
              <div className="flex flex-wrap gap-2">
                {keyword.serpFeatures.length > 0 ? (
                  keyword.serpFeatures.map((feature, i) => (
                    <div key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 border border-border">
                      <SerpFeatureIcon feature={feature} />
                      <span className="text-xs text-foreground capitalize">{feature.replace("_", " ")}</span>
                    </div>
                  ))
                ) : (
                  <span className="text-sm text-muted-foreground">No SERP features detected</span>
                )}
              </div>
            </div>

            {/* AI Overview Status */}
            {keyword.aiOverview && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">AI Overview Status</h4>
                <div className={cn(
                  "rounded-lg border p-4",
                  keyword.aiOverview.position === "cited" && "bg-emerald-500/10 border-emerald-500/30",
                  keyword.aiOverview.position === "mentioned" && "bg-amber-500/10 border-amber-500/30",
                  keyword.aiOverview.position === "not_included" && "bg-red-500/10 border-red-500/30"
                )}>
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    <span className="font-medium capitalize">
                      {keyword.aiOverview.position === "cited" && "✓ Your site is cited in AI Overview"}
                      {keyword.aiOverview.position === "mentioned" && "Brand mentioned in AI Overview"}
                      {keyword.aiOverview.position === "not_included" && "Not included in AI Overview"}
                    </span>
                  </div>
                  {keyword.aiOverview.recommendation && (
                    <p className="mt-2 text-sm text-muted-foreground">
                      💡 {keyword.aiOverview.recommendation}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Ranking URL */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">Ranking URL</h4>
              <a
                href={keyword.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-emerald-400 hover:underline"
              >
                {keyword.url}
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        )}
        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            className="border-border"
          >
            Close
          </Button>
          <Button
            onClick={handleEdit}
            className="bg-emerald-500 hover:bg-emerald-600 text-white"
          >
            <Edit2 className="w-4 h-4 mr-2" />
            Edit Keyword
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
