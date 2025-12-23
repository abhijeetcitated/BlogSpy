"use client"

import { useState, useMemo, useCallback, useEffect, lazy, Suspense } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  RefreshCw, 
  Search, 
  Plus,
  Lightbulb,
  Loader2,
  TrendingUp,
  Eye,
  Coins,
  AlertCircle,
  AlertTriangle,
} from "lucide-react"
import { toast } from "sonner"
// Note: Clerk - use try-catch import or conditional
// import { useAuth, useUser } from "@clerk/nextjs"
import { generateNewsSummary } from "./__mocks__"
import { DEFAULT_NEWS_PLATFORM, DISCOVER_TIPS } from "./constants"
import { 
  NewsPlatformTabs, 
  NewsSummaryCards, 
  NewsKeywordList, 
  NewsCreditPurchaseCard,
  type KeywordAlert,
} from "./components"
import { useCredits } from "./hooks/useCredits"
import { useNewsTracker } from "./hooks/useNewsTracker"
import type { NewsPlatform, NewsSummary } from "./types"

// ============================================
// TEMPORARY AUTH MOCKS (until Clerk types resolved)
// Replace with: import { useAuth, useUser } from "@clerk/nextjs"
// ============================================
const useAuth = () => ({ userId: "mock-user-id" as string | null, isLoaded: true })
const useUser = () => ({ user: { firstName: "User" } })

// ============================================
// LAZY LOADED COMPONENTS (Performance)
// ============================================
const AddKeywordDialog = lazy(() => 
  import("./components/AddKeywordDialog").then(m => ({ default: m.AddKeywordDialog }))
)
const SetAlertDialog = lazy(() => 
  import("./components/SetAlertDialog").then(m => ({ default: m.SetAlertDialog }))
)

// ============================================
// LOADING FALLBACKS
// ============================================
const DialogSkeleton = () => (
  <div className="fixed inset-0 bg-background/80 flex items-center justify-center">
    <Skeleton className="w-[400px] h-[300px] rounded-lg" />
  </div>
)

// ============================================
// ICONS
// ============================================

// Google News SVG Icon
const GoogleNewsIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" fill="#4285F4"/>
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10V2z" fill="#34A853"/>
    <path d="M12 2v10l8.66 5A10 10 0 0 0 12 2z" fill="#EA4335"/>
    <path d="M12 12v10a10 10 0 0 0 8.66-5L12 12z" fill="#FBBC05"/>
    <circle cx="12" cy="12" r="4" fill="white"/>
    <text x="12" y="15" textAnchor="middle" fontSize="6" fontWeight="bold" fill="#4285F4">N</text>
  </svg>
)

// Google Discover SVG Icon
const GoogleDiscoverIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none">
    <circle cx="12" cy="12" r="10" fill="#EA4335"/>
    <path d="M12 6l1.5 3.5 3.5 1.5-3.5 1.5L12 16l-1.5-3.5L7 11l3.5-1.5L12 6z" fill="white"/>
    <circle cx="12" cy="12" r="2" fill="#FBBC05"/>
  </svg>
)

// ============================================
// ERROR STATE COMPONENT
// ============================================
function ErrorState({ 
  message, 
  onRetry 
}: { 
  message: string
  onRetry?: () => void 
}) {
  return (
    <Card className="border-red-500/30 bg-red-500/5">
      <CardContent className="p-6 flex flex-col items-center justify-center text-center">
        <AlertTriangle className="w-10 h-10 text-red-500 mb-3" />
        <p className="text-sm font-medium text-foreground mb-1">Something went wrong</p>
        <p className="text-xs text-muted-foreground mb-4">{message}</p>
        {onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry}>
            Try Again
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

// ============================================
// LOADING STATE COMPONENT
// ============================================
function LoadingState() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-32" />
        </div>
      </div>
      <div className="grid grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-10 w-full" />
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>
    </div>
  )
}

// ============================================
// MAIN COMPONENT
// ============================================
export function NewsTrackerContent() {
  // ============================================
  // AUTH - Get real user ID from Clerk
  // ============================================
  const { userId, isLoaded: authLoaded } = useAuth()
  const { user } = useUser()
  
  // ============================================
  // HOOKS - Use actual hooks instead of localStorage
  // ============================================
  const {
    balance,
    isLoading: creditsLoading,
    error: creditsError,
    lowCredits,
    validateCredits,
    deductCredits,
    fetchBalance,
  } = useCredits({ 
    userId: userId || "", 
    autoFetch: !!userId 
  })

  const {
    keywords,
    isTracking,
    error: trackingError,
    trackKeyword,
    trackMultiple,
    refreshKeyword,
    removeKeyword,
    totalKeywords,
    canTrack,
  } = useNewsTracker({ 
    userId: userId || "",
    autoRefresh: false,
  })

  // ============================================
  // UI STATE
  // ============================================
  const [activePlatform, setActivePlatform] = useState<NewsPlatform>(DEFAULT_NEWS_PLATFORM)
  const [searchQuery, setSearchQuery] = useState("")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isRefreshingKeyword, setIsRefreshingKeyword] = useState<string | null>(null)
  
  // ============================================
  // DIALOG STATE
  // ============================================
  const [addKeywordDialogOpen, setAddKeywordDialogOpen] = useState(false)
  const [alertDialogOpen, setAlertDialogOpen] = useState(false)
  const [selectedKeywordForAlert, setSelectedKeywordForAlert] = useState<typeof keywords[0] | null>(null)

  // ============================================
  // ALERTS STATE (Local for now, can be moved to hook)
  // ============================================
  const [alerts, setAlerts] = useState<Map<string, KeywordAlert>>(new Map())

  // ============================================
  // DERIVED STATE - Summary computed from keywords
  // ============================================
  const summary = useMemo<NewsSummary | null>(() => {
    if (keywords.length === 0) return null
    return generateNewsSummary(keywords)
  }, [keywords])

  // ============================================
  // COMPUTED VALUES
  // ============================================
  const availableCredits = balance?.availableCredits || 0

  const platformStats = useMemo(() => ({
    "google-news": { 
      count: keywords.filter(k => k.platforms["google-news"]?.position).length 
    },
    "google-discover": { 
      count: keywords.filter(k => k.platforms["google-discover"]).length 
    },
  }), [keywords])

  const filteredKeywords = useMemo(() => {
    let filtered = keywords
    
    // Filter by platform availability
    if (activePlatform === "google-news") {
      filtered = filtered.filter(k => k.platforms["google-news"]?.position)
    } else {
      filtered = filtered.filter(k => k.platforms["google-discover"])
    }
    
    // Filter by search
    if (searchQuery) {
      filtered = filtered.filter(k => 
        k.keyword.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    
    return filtered
  }, [keywords, activePlatform, searchQuery])

  // ============================================
  // HANDLERS: ADD KEYWORDS (Using hook)
  // ============================================
  const handleAddKeywords = useCallback(async (
    newKeywords: string[],
    platform: NewsPlatform
  ): Promise<boolean> => {
    if (!userId) {
      toast.error("Please login to track keywords")
      return false
    }

    const creditCost = platform === "google-news" ? 1 : 2
    const totalCost = newKeywords.length * creditCost

    // Validate credits using hook
    if (!canTrack(newKeywords.length, platform)) {
      toast.error("Insufficient credits", {
        description: `Need ${totalCost} credits, have ${availableCredits}`,
      })
      return false
    }

    try {
      // Use batch tracking from hook
      const batchId = await trackMultiple(newKeywords, platform)
      
      if (batchId) {
        toast.success(`Added ${newKeywords.length} keyword(s)`, {
          description: `Tracking started`,
        })
        return true
      }
      return false
    } catch (err) {
      toast.error("Failed to add keywords")
      return false
    }
  }, [userId, availableCredits, canTrack, trackMultiple])

  // ============================================
  // HANDLERS: REFRESH ALL (With cleanup)
  // ============================================
  const handleRefreshAll = useCallback(async () => {
    if (keywords.length === 0) {
      toast.info("No keywords to refresh")
      return
    }

    setIsRefreshing(true)
    let isCancelled = false

    try {
      // Refresh each keyword
      for (const kw of keywords) {
        if (isCancelled) break
        await refreshKeyword(kw.id)
      }

      if (!isCancelled) {
        toast.success("All keywords refreshed!", {
          description: `Updated ${keywords.length} keywords`,
        })
      }
    } catch (err) {
      if (!isCancelled) {
        toast.error("Failed to refresh")
      }
    } finally {
      if (!isCancelled) {
        setIsRefreshing(false)
      }
    }

    // Cleanup function for component unmount
    return () => {
      isCancelled = true
    }
  }, [keywords, refreshKeyword])

  // ============================================
  // HANDLERS: REFRESH SINGLE KEYWORD
  // ============================================
  const handleRefreshKeyword = useCallback(async (keywordId: string) => {
    setIsRefreshingKeyword(keywordId)

    try {
      await refreshKeyword(keywordId)
      toast.success("Keyword refreshed")
    } catch (err) {
      toast.error("Failed to refresh keyword")
    } finally {
      setIsRefreshingKeyword(null)
    }
  }, [refreshKeyword])

  // ============================================
  // HANDLERS: REMOVE KEYWORD
  // ============================================
  const handleRemoveKeyword = useCallback((keywordId: string) => {
    removeKeyword(keywordId)
    
    // Remove any alerts
    setAlerts(prev => {
      const newAlerts = new Map(prev)
      newAlerts.delete(keywordId)
      return newAlerts
    })
  }, [removeKeyword])

  // ============================================
  // HANDLERS: SET ALERT
  // ============================================
  const handleSetAlert = useCallback((keywordId: string) => {
    const keyword = keywords.find(k => k.id === keywordId)
    if (!keyword) return

    setSelectedKeywordForAlert(keyword)
    setAlertDialogOpen(true)
  }, [keywords])

  const handleSaveAlert = useCallback(async (alert: KeywordAlert): Promise<boolean> => {
    try {
      setAlerts(prev => {
        const newAlerts = new Map(prev)
        newAlerts.set(alert.keywordId, alert)
        return newAlerts
      })
      toast.success("Alert saved")
      return true
    } catch (err) {
      toast.error("Failed to save alert")
      return false
    }
  }, [])

  // ============================================
  // EFFECTS: Load alerts from localStorage (with cleanup)
  // ============================================
  useEffect(() => {
    if (!userId || typeof window === "undefined") return

    let isMounted = true

    const loadAlerts = () => {
      try {
        const savedAlerts = localStorage.getItem(`news-tracker-alerts-${userId}`)
        if (savedAlerts && isMounted) {
          const parsedAlerts = JSON.parse(savedAlerts)
          setAlerts(new Map(Object.entries(parsedAlerts)))
        }
      } catch (err) {
        console.error("Failed to load alerts:", err)
      }
    }

    loadAlerts()

    // Cleanup
    return () => {
      isMounted = false
    }
  }, [userId])

  // ============================================
  // EFFECTS: Save alerts to localStorage
  // ============================================
  useEffect(() => {
    if (!userId || typeof window === "undefined") return
    if (alerts.size === 0) return

    try {
      localStorage.setItem(
        `news-tracker-alerts-${userId}`, 
        JSON.stringify(Object.fromEntries(alerts))
      )
    } catch (err) {
      console.error("Failed to save alerts:", err)
    }
  }, [alerts, userId])

  // ============================================
  // LOADING STATE
  // ============================================
  if (!authLoaded || creditsLoading) {
    return <LoadingState />
  }

  // ============================================
  // NOT AUTHENTICATED
  // ============================================
  if (!userId) {
    return (
      <ErrorState 
        message="Please login to use News Tracker" 
        onRetry={() => window.location.href = "/sign-in"}
      />
    )
  }

  // ============================================
  // ERROR STATE
  // ============================================
  if (creditsError || trackingError) {
    return (
      <ErrorState 
        message={creditsError || trackingError || "Unknown error occurred"} 
        onRetry={() => {
          fetchBalance()
        }}
      />
    )
  }

  // ============================================
  // RENDER
  // ============================================
  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-500/10 dark:bg-blue-500/20">
            <GoogleNewsIcon className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">News & Discover Tracker</h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Track visibility in Google News & Discover
            </p>
          </div>
        </div>
        <div className="flex items-center justify-between sm:justify-end gap-2">
          {/* Credits Badge */}
          <Badge variant="outline" className="h-9 px-3 gap-1.5 border-amber-500/30 bg-amber-500/5">
            <Coins className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-sm font-medium">{availableCredits}</span>
            <span className="text-xs text-muted-foreground">credits</span>
          </Badge>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefreshAll}
            disabled={isRefreshing || isTracking || keywords.length === 0}
            className="h-9 text-xs border-border text-muted-foreground hover:bg-muted"
          >
            {isRefreshing ? (
              <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
            ) : (
              <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
            )}
            Refresh All
          </Button>
          <Button
            size="sm"
            onClick={() => setAddKeywordDialogOpen(true)}
            disabled={isTracking}
            className="h-9 text-xs bg-blue-500 hover:bg-blue-600 text-white"
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            Add Keywords
          </Button>
        </div>
      </div>

      {/* Low Credit Warning */}
      {lowCredits && (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardContent className="p-3 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Low Credits</p>
              <p className="text-xs text-muted-foreground">
                You have only {availableCredits} credits remaining. Purchase more to continue tracking.
              </p>
            </div>
            <Button size="sm" variant="outline" className="shrink-0 border-amber-500/30 text-amber-600 hover:bg-amber-500/10">
              Buy Credits
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Platform Tabs */}
      <NewsPlatformTabs
        activePlatform={activePlatform}
        onPlatformChange={setActivePlatform}
        stats={platformStats}
      />

      {/* Summary Cards */}
      {summary && <NewsSummaryCards summary={summary} />}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6">
        {/* Keywords List */}
        <div className="lg:col-span-3 space-y-4">
          {/* Search */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 sm:h-10 bg-background border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <span className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
              {filteredKeywords.length} keywords
            </span>
          </div>

          {/* Keywords */}
          <NewsKeywordList 
            keywords={filteredKeywords} 
            platform={activePlatform}
            onRefresh={handleRefreshKeyword}
            onRemove={handleRemoveKeyword}
            onSetAlert={handleSetAlert}
            isRefreshing={isRefreshingKeyword}
            alerts={alerts}
          />
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          {/* Platform API Info Card */}
          <Card className={`border ${activePlatform === "google-news" ? "border-blue-500/30 bg-blue-500/5" : "border-red-500/30 bg-red-500/5"}`}>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2 mb-3">
                {activePlatform === "google-news" ? (
                  <GoogleNewsIcon className="w-5 h-5" />
                ) : (
                  <GoogleDiscoverIcon className="w-5 h-5" />
                )}
                <span className="text-sm font-medium text-foreground">
                  {activePlatform === "google-news" ? "Google News" : "Google Discover"}
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Data Source</span>
                  <span className="text-foreground font-medium">
                    {activePlatform === "google-news" ? "DataForSEO" : "Search Console"}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Cost per Keyword</span>
                  <span className={`font-medium ${activePlatform === "google-news" ? "text-blue-500" : "text-red-500"}`}>
                    {activePlatform === "google-news" ? "1 credit" : "2 credits"}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Refresh Rate</span>
                  <span className="text-foreground font-medium">
                    {activePlatform === "google-news" ? "6 hours" : "24 hours"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Credit Purchase Card */}
          <NewsCreditPurchaseCard activePlatform={activePlatform} />
          
          {/* Discover Tips */}
          {activePlatform === "google-discover" && (
            <Card className="bg-card border-border">
              <CardHeader className="pb-2 px-3 sm:px-4 pt-3 sm:pt-4">
                <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-amber-500/10">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                  </div>
                  Discover Optimization Tips
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 px-3 sm:px-4 pb-3 sm:pb-4">
                {DISCOVER_TIPS.map((tip, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs">
                    <span className="text-emerald-500 mt-0.5 shrink-0">✓</span>
                    <span className="text-muted-foreground">{tip}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Quick Stats */}
          {summary && (
            <Card className="bg-card border-border">
              <CardHeader className="pb-2 px-3 sm:px-4 pt-3 sm:pt-4">
                <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
                  {activePlatform === "google-news" ? (
                    <>
                      <div className="p-1.5 rounded-lg bg-blue-500/10">
                        <TrendingUp className="w-3.5 h-3.5 text-blue-500" />
                      </div>
                      News Stats
                    </>
                  ) : (
                    <>
                      <div className="p-1.5 rounded-lg bg-purple-500/10">
                        <Eye className="w-3.5 h-3.5 text-purple-500" />
                      </div>
                      Discover Stats
                    </>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 px-3 sm:px-4 pb-3 sm:pb-4">
                {activePlatform === "google-news" ? (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">Top Stories</span>
                      <span className="text-sm font-medium text-amber-500">{summary.topStories}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">Ranking Keywords</span>
                      <span className="text-sm font-medium text-foreground">{summary.newsRanking}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">Trending Topics</span>
                      <span className="text-sm font-medium text-emerald-500">{summary.trendingCount}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">Total Impressions</span>
                      <span className="text-sm font-medium text-purple-500">
                        {(summary.discoverImpressions / 1000).toFixed(0)}K
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">Average CTR</span>
                      <span className="text-sm font-medium text-cyan-500">{summary.avgCTR}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">Active Keywords</span>
                      <span className="text-sm font-medium text-foreground">{platformStats["google-discover"].count}</span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Dialogs - Lazy Loaded with Suspense */}
      <Suspense fallback={<DialogSkeleton />}>
        {addKeywordDialogOpen && (
          <AddKeywordDialog
            open={addKeywordDialogOpen}
            onOpenChange={setAddKeywordDialogOpen}
            activePlatform={activePlatform}
            availableCredits={availableCredits}
            onAddKeywords={handleAddKeywords}
            isTracking={isTracking}
          />
        )}
      </Suspense>

      <Suspense fallback={<DialogSkeleton />}>
        {alertDialogOpen && (
          <SetAlertDialog
            open={alertDialogOpen}
            onOpenChange={setAlertDialogOpen}
            keyword={selectedKeywordForAlert}
            platform={activePlatform}
            existingAlert={selectedKeywordForAlert ? alerts.get(selectedKeywordForAlert.id) || null : null}
            onSaveAlert={handleSaveAlert}
          />
        )}
      </Suspense>
    </div>
  )
}
