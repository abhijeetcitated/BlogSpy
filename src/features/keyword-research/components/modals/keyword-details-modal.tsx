"use client"

// ============================================
// KEYWORD DETAILS MODAL - Full keyword info
// ============================================

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { 
  ExternalLink, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Copy,
  Check 
} from "lucide-react"
import { useState } from "react"
import type { Keyword } from "../../types"

interface KeywordDetailsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  keyword: Keyword | null
}

export function KeywordDetailsModal({
  open,
  onOpenChange,
  keyword,
}: KeywordDetailsModalProps) {
  const [copied, setCopied] = useState(false)

  if (!keyword) return null

  const handleCopy = () => {
    navigator.clipboard.writeText(keyword.keyword)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const getTrendIcon = () => {
    const trend = keyword.trend
    const first = trend[0]
    const last = trend[trend.length - 1]
    const diff = last - first
    
    if (diff > 10) return <TrendingUp className="h-4 w-4 text-green-500" />
    if (diff < -10) return <TrendingDown className="h-4 w-4 text-red-500" />
    return <Minus className="h-4 w-4 text-yellow-500" />
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="font-mono text-base">{keyword.keyword}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={handleCopy}
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-green-500" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Key metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Volume</p>
              <p className="text-lg font-semibold tabular-nums">
                {keyword.volume.toLocaleString()}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">KD</p>
              <p className="text-lg font-semibold tabular-nums">{keyword.kd}%</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">CPC</p>
              <p className="text-lg font-semibold tabular-nums">
                ${keyword.cpc.toFixed(2)}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">GEO Score</p>
              <p className="text-lg font-semibold tabular-nums">
                {keyword.geoScore ?? "—"}
              </p>
            </div>
          </div>

          <Separator />

          {/* Intent */}
          <div className="space-y-2">
            <p className="text-sm font-medium">Search Intent</p>
            <div className="flex gap-2">
              {keyword.intent.map((intent) => (
                <Badge key={intent} variant="secondary">
                  {intent === "I" && "Informational"}
                  {intent === "C" && "Commercial"}
                  {intent === "T" && "Transactional"}
                  {intent === "N" && "Navigational"}
                </Badge>
              ))}
            </div>
          </div>

          {/* Trend */}
          <div className="space-y-2">
            <p className="text-sm font-medium flex items-center gap-2">
              Trend (12 months)
              {getTrendIcon()}
            </p>
            <div className="flex items-end gap-px h-12">
              {keyword.trend.map((value, i) => (
                <div
                  key={i}
                  className="flex-1 bg-primary/60 rounded-t"
                  style={{ height: `${(value / Math.max(...keyword.trend)) * 100}%` }}
                />
              ))}
            </div>
          </div>

          {/* SERP Features */}
          {keyword.serpFeatures.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">SERP Features</p>
              <div className="flex flex-wrap gap-2">
                {keyword.serpFeatures.map((feature) => (
                  <Badge key={feature} variant="outline">
                    {feature.replace(/_/g, " ")}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Weak Spots */}
          {(keyword.weakSpots.reddit !== null || keyword.weakSpots.quora !== null || keyword.weakSpots.pinterest !== null) && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Weak Spots Detected</p>
              <div className="flex flex-wrap gap-2">
                {keyword.weakSpots.reddit !== null && (
                  <Badge variant="destructive">Reddit #{keyword.weakSpots.reddit}</Badge>
                )}
                {keyword.weakSpots.quora !== null && (
                  <Badge variant="destructive">Quora #{keyword.weakSpots.quora}</Badge>
                )}
                {keyword.weakSpots.pinterest !== null && (
                  <Badge variant="destructive">Pinterest #{keyword.weakSpots.pinterest}</Badge>
                )}
              </div>
            </div>
          )}

          <Separator />

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 gap-2"
              onClick={() =>
                window.open(
                  `https://www.google.com/search?q=${encodeURIComponent(keyword.keyword)}`,
                  "_blank"
                )
              }
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Search Google
            </Button>
            <Button variant="outline" size="sm" className="flex-1 gap-2">
              Add to List
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
