"use client"

import { useState, useTransition } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Trash2,
  RefreshCw,
  Loader2,
  Plus,
  Search,
  Tag,
  Clock,
} from "lucide-react"
import type { TrackedKeyword } from "../types"

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════════════

export interface TrackedKeywordsListProps {
  /** List of tracked keywords */
  keywords: TrackedKeyword[]
  /** Loading state */
  isLoading?: boolean
  /** Callback to add a keyword */
  onAddKeyword?: () => void
  /** Callback when a keyword is deleted */
  onDeleteKeyword?: (keywordId: string) => Promise<void>
  /** Callback to scan a specific keyword */
  onScanKeyword?: (keyword: string) => Promise<void>
  /** Whether scanning is in progress */
  isScanning?: boolean
  /** Is demo mode */
  isDemoMode?: boolean
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════════════════════════

const CATEGORY_COLORS: Record<string, string> = {
  brand: "bg-violet-500/10 text-violet-400 border-violet-500/30",
  product: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  competitor: "bg-red-500/10 text-red-400 border-red-500/30",
  industry: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  other: "bg-gray-500/10 text-gray-400 border-gray-500/30",
}

function formatTimeAgo(dateStr?: string): string {
  if (!dateStr) return "Never"
  const d = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  if (diffMin < 1) return "Just now"
  if (diffMin < 60) return `${diffMin}m ago`
  const diffHr = Math.floor(diffMin / 60)
  if (diffHr < 24) return `${diffHr}h ago`
  const diffDay = Math.floor(diffHr / 24)
  return `${diffDay}d ago`
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════════════════════

export function TrackedKeywordsList({
  keywords,
  isLoading = false,
  onAddKeyword,
  onDeleteKeyword,
  onScanKeyword,
  isScanning = false,
  isDemoMode = false,
}: TrackedKeywordsListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [scanningKeyword, setScanningKeyword] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleDelete = async (keywordId: string) => {
    if (!onDeleteKeyword) return
    setDeletingId(keywordId)
    try {
      await onDeleteKeyword(keywordId)
    } finally {
      setDeletingId(null)
    }
  }

  const handleScan = (keyword: string) => {
    if (!onScanKeyword) return
    setScanningKeyword(keyword)
    startTransition(async () => {
      try {
        await onScanKeyword(keyword)
      } finally {
        setScanningKeyword(null)
      }
    })
  }

  if (isLoading) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="p-6 flex items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-sm sm:text-base font-semibold text-foreground flex items-center gap-2">
            <Search className="h-4 w-4 text-cyan-400 shrink-0" />
            <span className="truncate">Tracked Keywords</span>
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs text-muted-foreground">
              {keywords.length} keyword{keywords.length !== 1 ? "s" : ""}
            </Badge>
            {onAddKeyword && (
              <Button
                variant="outline"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={onAddKeyword}
              >
                <Plus className="h-3 w-3 mr-1" />
                Add
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
        {keywords.length === 0 ? (
          <div className="text-center py-8">
            <Search className="h-8 w-8 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground mb-2">No keywords tracked yet</p>
            <p className="text-xs text-muted-foreground mb-4">
              Add keywords to monitor how AI platforms mention your brand
            </p>
            {onAddKeyword && (
              <Button variant="outline" size="sm" onClick={onAddKeyword}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Keyword
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {keywords.map((kw) => {
              const catColor = CATEGORY_COLORS[kw.category || "other"] || CATEGORY_COLORS.other
              const isDeleting = deletingId === kw.id
              const isScanningThis = scanningKeyword === kw.keyword || (isScanning && isPending)

              return (
                <div
                  key={kw.id}
                  className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg border border-border bg-background hover:bg-muted/30 transition-colors"
                >
                  {/* Keyword Text */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {kw.keyword}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      {kw.category && (
                        <Badge
                          variant="outline"
                          className={`text-[9px] px-1.5 h-4 ${catColor}`}
                        >
                          <Tag className="h-2 w-2 mr-0.5" />
                          {kw.category}
                        </Badge>
                      )}
                      <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                        <Clock className="h-2.5 w-2.5" />
                        {formatTimeAgo(kw.lastCheckedAt)}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    {onScanKeyword && !isDemoMode && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        disabled={isScanningThis}
                        onClick={() => handleScan(kw.keyword)}
                        title="Scan this keyword"
                      >
                        {isScanningThis ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <RefreshCw className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    )}
                    {onDeleteKeyword && !isDemoMode && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-red-400"
                        disabled={isDeleting}
                        onClick={() => handleDelete(kw.id)}
                        title="Remove keyword"
                      >
                        {isDeleting ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
