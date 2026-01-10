// ============================================
// KEYWORD DETAILS DRAWER - Main Sheet Component
// ============================================
// Displays detailed keyword information in a slide-out drawer
// with tabs for Overview, Commerce, and Social data
// Features:
// - ErrorBoundary for fault tolerance
// - Fixed footer with Deep GEO Report link
// ============================================

"use client"

import * as React from "react"
import Link from "next/link"
import {
  X,
  MapPin,
  ExternalLink,
  Info,
  ShoppingCart,
  DollarSign,
  Navigation,
  Monitor,
  Youtube,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ErrorBoundary } from "@/components/common/error-boundary"

import { OverviewTab } from "./OverviewTab"
import { CommerceTab } from "./CommerceTab"
import { SocialTab } from "./SocialTab"
import { RtvFormulaDialog } from "./RtvFormulaDialog"

import type { Keyword } from "../../types"

// ============================================
// LOCAL FEATURE FLAGS
// ============================================
// Temporarily disable incomplete UI surfaces without deleting code.
const SHOW_COMMERCE_TAB = false

// ============================================
// TYPES
// ============================================

interface KeywordDetailsDrawerProps {
  keyword: Keyword | null
  isOpen: boolean
  onClose: () => void
  onWriteClick?: (keyword: Keyword) => void
  onAnalyzeClick?: (keyword: Keyword) => void
}

// ============================================
// COMPONENT
// ============================================

export function KeywordDetailsDrawer({
  keyword,
  isOpen,
  onClose,
  onWriteClick,
  onAnalyzeClick,
}: KeywordDetailsDrawerProps) {
  const [activeTab, setActiveTab] = React.useState("overview")
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_isLoading, _setIsLoading] = React.useState(false)

  // Reset tab when drawer opens with new keyword
  React.useEffect(() => {
    if (isOpen) {
      setActiveTab("overview")
    }
  }, [isOpen, keyword?.id])

  // Safety: if Commerce tab is hidden, never keep it as active.
  React.useEffect(() => {
    if (!SHOW_COMMERCE_TAB && activeTab === "commerce") {
      setActiveTab("overview")
    }
  }, [activeTab])

  if (!keyword) return null

  // Format volume with commas
  const formattedVolume = keyword.volume.toLocaleString()

  // Get KD color
  const getKdColor = (kd: number) => {
    if (kd <= 14) return "text-emerald-500"
    if (kd <= 29) return "text-green-500"
    if (kd <= 49) return "text-yellow-500"
    if (kd <= 69) return "text-orange-500"
    if (kd <= 84) return "text-red-500"
    return "text-red-600"
  }

  // Intent configuration matching table column colors
  type IntentCode = "I" | "C" | "T" | "N"
  const intentConfig: Record<IntentCode, {
    label: string
    icon: typeof Info
    color: string
    bgColor: string
    borderColor: string
  }> = {
    I: {
      label: "Informational",
      icon: Info,
      color: "text-blue-600",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/20",
    },
    C: {
      label: "Commercial",
      icon: ShoppingCart,
      color: "text-purple-600",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500/20",
    },
    T: {
      label: "Transactional",
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-500/10",
      borderColor: "border-green-500/20",
    },
    N: {
      label: "Navigational",
      icon: Navigation,
      color: "text-orange-600",
      bgColor: "bg-orange-500/10",
      borderColor: "border-orange-500/20",
    },
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className={cn(
          // Keep the details view premium + focused (not too wide)
          "w-[calc(100vw-1rem)] max-w-5xl",
          // Desktop: taller fixed-height card (aim: no scroll on large screens).
          "h-[92vh] max-h-[92vh] sm:h-[92vh] sm:max-h-[92vh]",
          "p-0 gap-0",
          "flex flex-col",
          // Keep header/footer fixed; scroll happens inside the content area.
          "overflow-hidden",
          "border border-white/10 shadow-2xl"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="px-4 py-3 sm:px-6 sm:py-3 border-b border-border bg-muted/30 shrink-0">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="text-lg font-semibold text-foreground truncate">
                  {keyword.keyword}
                </div>
                <div className="flex items-center gap-2 mt-1 text-sm">
                  <span className="text-muted-foreground">
                    Volume: <span className="text-foreground font-medium">{formattedVolume}</span>
                  </span>
                  <span className="text-muted-foreground">•</span>
                  <span className={cn("font-medium", getKdColor(keyword.kd))}>
                    KD: {keyword.kd}%
                  </span>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-muted-foreground">
                    CPC: <span className="text-foreground font-medium">${keyword.cpc.toFixed(2)}</span>
                  </span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0"
                onClick={onClose}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </Button>
            </div>

            {/* Intent badges */}
            <div className="flex flex-wrap gap-1.5 mt-3">
              {keyword.intent.map((intentCode) => {
                const config = intentConfig[intentCode as IntentCode]
                if (!config) return null

                return (
                  <Badge
                    key={intentCode}
                    variant="outline"
                    className={cn(
                      "h-6 px-2 text-xs font-medium border rounded-full",
                      config.bgColor,
                      config.borderColor,
                      config.color
                    )}
                  >
                    {intentCode}
                  </Badge>
                )
              })}
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-2 mt-4">
              <Button
                size="sm"
                onClick={() => onWriteClick?.(keyword)}
                className="h-9 w-full sm:w-auto sm:px-4"
              >
                ✍️ Write Content
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  const encodedKeyword = encodeURIComponent(keyword.keyword)
                  window.location.href = `/keyword-overview?keyword=${encodedKeyword}`
                }}
                className="h-9 w-full sm:w-auto sm:px-4"
              >
                📊 Keyword Overview
              </Button>
            </div>
          </div>

          {/* Content (tabs + tab contents)
              Desktop goal: avoid scrolling the whole dialog; allow tab-specific scrolling only when needed.
           */}
          <div className="flex-1 overflow-y-auto">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col min-h-0">
              {/* Trend-Spotter style pill tabs */}
              <TabsList className="w-full justify-start rounded-none border-b border-border bg-background/60 px-4 sm:px-6 py-2 h-auto sticky top-0 z-10 backdrop-blur-sm">
                <TabsTrigger
                  value="overview"
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all border",
                    "data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400 data-[state=active]:border-amber-500/50",
                    "data-[state=inactive]:text-muted-foreground data-[state=inactive]:border-transparent data-[state=inactive]:hover:text-foreground"
                  )}
                >
                  <Monitor
                    className={cn(
                      "h-3.5 w-3.5",
                      activeTab === "overview" ? "text-amber-400" : "text-blue-400"
                    )}
                  />
                  <span>Overview</span>
                </TabsTrigger>

                {SHOW_COMMERCE_TAB && (
                  <TabsTrigger
                    value="commerce"
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all border",
                      "data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400 data-[state=active]:border-amber-500/50",
                      "data-[state=inactive]:text-muted-foreground data-[state=inactive]:border-transparent data-[state=inactive]:hover:text-foreground"
                    )}
                  >
                    <ShoppingCart
                      className={cn(
                        "h-3.5 w-3.5",
                        activeTab === "commerce" ? "text-amber-400" : "text-orange-400"
                      )}
                    />
                    <span>Commerce</span>
                  </TabsTrigger>
                )}

                <TabsTrigger
                  value="social"
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all border",
                    "data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400 data-[state=active]:border-amber-500/50",
                    "data-[state=inactive]:text-muted-foreground data-[state=inactive]:border-transparent data-[state=inactive]:hover:text-foreground"
                  )}
                >
                  <Youtube
                    className={cn(
                      "h-3.5 w-3.5",
                      activeTab === "social" ? "text-amber-400" : "text-red-500"
                    )}
                  />
                  <span>Social</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="m-0 p-3 sm:p-4 pb-6">
                <ErrorBoundary fallback={<TabErrorFallback tabName="Overview" />}>
                  <OverviewTab keyword={keyword} />
                </ErrorBoundary>
              </TabsContent>

              {SHOW_COMMERCE_TAB && (
                <TabsContent value="commerce" className="m-0 p-6">
                  <ErrorBoundary fallback={<TabErrorFallback tabName="Commerce" />}>
                    <CommerceTab keyword={keyword} />
                  </ErrorBoundary>
                </TabsContent>
              )}

              <TabsContent value="social" className="m-0 p-3 sm:p-4 pb-6">
                <ErrorBoundary fallback={<TabErrorFallback tabName="Social" />}>
                  <SocialTab keyword={keyword} />
                </ErrorBoundary>
              </TabsContent>
            </Tabs>
          </div>

          {/* Footer */}
          <div className="border-t border-border bg-muted/30 px-4 py-3 sm:px-6 sm:py-3 shrink-0">
            <Button
              asChild
              className="h-10 w-full gap-2 bg-linear-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
            >
              <Link href={`/dashboard/research/geo-report/${encodeURIComponent(keyword.keyword)}`}>
                <MapPin className="h-4 w-4" />
                🚀 View Full Deep GEO Report
                <ExternalLink className="h-3 w-3 ml-auto opacity-70" />
              </Link>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ============================================
// TAB ERROR FALLBACK
// ============================================

function TabErrorFallback({ tabName }: { tabName: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="h-12 w-12 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
        <X className="h-6 w-6 text-red-500" />
      </div>
      <h3 className="text-sm font-medium text-foreground mb-1">
        Failed to load {tabName}
      </h3>
      <p className="text-xs text-muted-foreground max-w-[200px]">
        There was an error loading this section. Please try closing and reopening the drawer.
      </p>
    </div>
  )
}

export default KeywordDetailsDrawer
