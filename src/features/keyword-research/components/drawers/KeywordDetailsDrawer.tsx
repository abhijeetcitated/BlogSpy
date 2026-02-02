// ============================================
// KEYWORD DETAILS DRAWER - Main Sheet Component
// ============================================
// Displays detailed keyword information in a slide-out drawer
// with tabs for Overview, Commerce, and Social data
// Features:
// - ErrorBoundary for fault tolerance
// - Fixed header with scrollable content area
// ============================================

"use client"

import * as React from "react"
import {
  X,
  Info,
  ShoppingCart,
  DollarSign,
  Navigation,
  Monitor,
  Youtube,
  BarChart3,
  Gauge,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogClose,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ErrorBoundary } from "@/components/shared/common/error-boundary"

import { OverviewTab } from "./OverviewTab"
import { CommerceTab } from "./CommerceTab"
import { SocialTab } from "./SocialTab"

import type { Keyword } from "../../types"
import { useKeywordStore } from "../../store"

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
}

// ============================================
// COMPONENT
// ============================================

export function KeywordDetailsDrawer({
  keyword,
  isOpen,
  onClose,
  onWriteClick,
}: KeywordDetailsDrawerProps) {
  const [activeTab, setActiveTab] = React.useState("overview")
  const credits = useKeywordStore((state) => state.credits)

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
        className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-[95vw] lg:max-w-5xl translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-0 shadow-lg duration-200 sm:rounded-lg h-[90vh] flex flex-col overflow-hidden [&>button]:hidden"
      >
        <DialogTitle className="sr-only">Keyword details</DialogTitle>
        <div className="flex flex-col h-full w-full overflow-x-hidden">
          {/* Header */}
          <div className="px-3 py-3 sm:px-6 sm:py-3 border-b border-border bg-muted/30 shrink-0 pr-12 relative">
            <DialogClose asChild>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-4 z-50 h-8 w-8 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </Button>
            </DialogClose>

            {/* Mobile layout */}
            <div className="flex flex-col gap-2 sm:hidden">
              <div className="flex items-center justify-between gap-3">
                <div className="text-lg font-bold truncate max-w-[70vw] text-foreground">
                  {keyword.keyword}
                </div>
                <div className="flex items-center gap-2 rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-1 text-xs shrink-0">
                  <span className="text-muted-foreground">Credits</span>
                  <span className="font-semibold text-amber-300">
                    {typeof credits === "number" ? credits : "--"}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground overflow-x-auto whitespace-nowrap">
                <span className="inline-flex items-center gap-1 shrink-0">
                  <BarChart3 className="h-4 w-4" />
                  Vol <span className="text-foreground font-medium">{formattedVolume}</span>
                </span>
                <span className={cn("inline-flex items-center gap-1 shrink-0", getKdColor(keyword.kd))}>
                  <Gauge className="h-4 w-4" />
                  KD <span className="font-medium">{keyword.kd}%</span>
                </span>
                <span className="inline-flex items-center gap-1 text-muted-foreground shrink-0">
                  <DollarSign className="h-4 w-4" />
                  CPC <span className="text-foreground font-medium">${keyword.cpc.toFixed(2)}</span>
                </span>
                <div className="flex items-center gap-1.5 shrink-0">
                  {keyword.intent.map((intentCode) => {
                    const config = intentConfig[intentCode as IntentCode]
                    if (!config) return null

                    return (
                      <Badge
                        key={intentCode}
                        variant="outline"
                        className={cn(
                          "h-5 px-1.5 text-[10px] font-medium border rounded-full",
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
              </div>

              <div className="grid grid-cols-2 gap-2 w-full">
                <Button size="sm" onClick={() => onWriteClick?.(keyword)} className="h-8 w-full">
                  Write Content
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const slug = keyword.keyword
                      .trim()
                      .toLowerCase()
                      .replace(/\\s+/g, "-")

                    window.location.href = `/dashboard/research/overview/${encodeURIComponent(slug)}`
                  }}
                  className="h-8 w-full"
                >
                  Keyword Overview
                </Button>
              </div>
            </div>

            {/* Desktop layout */}
            <div className="hidden sm:flex flex-col gap-2 pr-10">
              {/* Row 1: Keyword + Actions + Credits */}
              <div className="flex items-center gap-3">
                <div className="text-lg font-bold truncate max-w-[70vw] text-foreground">
                  {keyword.keyword}
                </div>

                <div className="flex items-center gap-2 ml-auto shrink-0">
                  <Button size="sm" onClick={() => onWriteClick?.(keyword)} className="h-8">
                    Write Content
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const slug = keyword.keyword
                        .trim()
                        .toLowerCase()
                        .replace(/\\s+/g, "-")

                      window.location.href = `/dashboard/research/overview/${encodeURIComponent(slug)}`
                    }}
                    className="h-8"
                  >
                    Keyword Overview
                  </Button>
                  <div className="flex items-center gap-2 rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-1 text-sm shrink-0">
                    <span className="text-muted-foreground">Credits</span>
                    <span className="font-semibold text-amber-300">
                      {typeof credits === "number" ? credits : "--"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Row 2: Metrics + Intent */}
              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <BarChart3 className="h-4 w-4" />
                  Vol <span className="text-foreground font-medium">{formattedVolume}</span>
                </span>
                <span className={cn("inline-flex items-center gap-1", getKdColor(keyword.kd))}>
                  <Gauge className="h-4 w-4" />
                  KD <span className="font-medium">{keyword.kd}%</span>
                </span>
                <span className="inline-flex items-center gap-1 text-muted-foreground">
                  <DollarSign className="h-4 w-4" />
                  CPC <span className="text-foreground font-medium">${keyword.cpc.toFixed(2)}</span>
                </span>

                <div className="flex items-center gap-2">
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
              </div>
            </div>
          </div>

          {/* Content (tabs + tab contents) */}
          <div className="flex-1 min-h-0 flex flex-col">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
              {/* Trend-Spotter style pill tabs */}
              <TabsList className="w-full justify-start rounded-none border-b border-border bg-background/60 px-3 sm:px-6 py-2 h-auto">
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

              <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar">
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
              </div>
            </Tabs>
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
