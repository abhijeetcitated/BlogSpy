"use client"

import { useState, useMemo, useCallback, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  RefreshCw, 
  Search, 
  Plus,
  Lightbulb,
  Loader2,
  Zap,
  TrendingUp,
  Eye,
  Coins,
  AlertCircle,
} from "lucide-react"
import { toast } from "sonner"
import { generateNewsKeywords, generateNewsSummary } from "./__mocks__"
import { DEFAULT_NEWS_PLATFORM, DISCOVER_TIPS } from "./constants"
import { 
  NewsPlatformTabs, 
  NewsSummaryCards, 
  NewsKeywordList, 
  NewsCreditPurchaseCard,
  AddKeywordDialog,
  SetAlertDialog,
  type KeywordAlert,
} from "./components"
import type { NewsPlatform, NewsKeyword, NewsSummary } from "./types"
import { STACK_SPACING } from "@/src/styles"

// ============================================
// MOCK USER ID (Replace with actual auth)
// ============================================
const MOCK_USER_ID = "user_demo_123"

// ============================================
// MOCK CREDITS (Replace with useCredits hook)
// ============================================
const INITIAL_CREDITS = 50

// ============================================
// LOCAL STORAGE KEYS
// ============================================
const STORAGE_KEYS = {
  keywords: "news-tracker-keywords",
  credits: "news-tracker-credits",
  alerts: "news-tracker-alerts",
}

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

export function NewsTrackerContent() {
  // ============================================
  // DATA STATE
  // ============================================
  const [keywords, setKeywords] = useState<NewsKeyword[]>([])
  const [summary, setSummary] = useState<NewsSummary | null>(null)
  const [availableCredits, setAvailableCredits] = useState(INITIAL_CREDITS)
  const [alerts, setAlerts] = useState<Map<string, KeywordAlert>>(new Map())
  
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
  const [selectedKeywordForAlert, setSelectedKeywordForAlert] = useState<NewsKeyword | null>(null)

  // ============================================
  // LOAD INITIAL DATA
  // ============================================
  useEffect(() => {
    // Load from localStorage or generate mock
    const loadData = () => {
      try {
        // Load keywords
        const savedKeywords = localStorage.getItem(`${STORAGE_KEYS.keywords}-${MOCK_USER_ID}`)
        if (savedKeywords) {
          const parsed = JSON.parse(savedKeywords)
          setKeywords(parsed)
          setSummary(generateNewsSummary(parsed))
        } else {
          // Generate initial mock data
          const mockKeywords = generateNewsKeywords()
          setKeywords(mockKeywords)
          setSummary(generateNewsSummary(mockKeywords))
        }

        // Load credits
        const savedCredits = localStorage.getItem(`${STORAGE_KEYS.credits}-${MOCK_USER_ID}`)
        if (savedCredits) {
          setAvailableCredits(parseInt(savedCredits, 10))
        }

        // Load alerts
        const savedAlerts = localStorage.getItem(`${STORAGE_KEYS.alerts}-${MOCK_USER_ID}`)
        if (savedAlerts) {
          const parsedAlerts = JSON.parse(savedAlerts)
          setAlerts(new Map(Object.entries(parsedAlerts)))
        }
      } catch (err) {
        console.error("Failed to load data:", err)
        // Fallback to mock data
        const mockKeywords = generateNewsKeywords()
        setKeywords(mockKeywords)
        setSummary(generateNewsSummary(mockKeywords))
      }
    }

    loadData()
  }, [])

  // ============================================
  // PERSIST DATA
  // ============================================
  useEffect(() => {
    if (keywords.length > 0) {
      localStorage.setItem(`${STORAGE_KEYS.keywords}-${MOCK_USER_ID}`, JSON.stringify(keywords))
    }
  }, [keywords])

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEYS.credits}-${MOCK_USER_ID}`, availableCredits.toString())
  }, [availableCredits])

  useEffect(() => {
    if (alerts.size > 0) {
      localStorage.setItem(
        `${STORAGE_KEYS.alerts}-${MOCK_USER_ID}`, 
        JSON.stringify(Object.fromEntries(alerts))
      )
    }
  }, [alerts])

  // ============================================
  // COMPUTED VALUES
  // ============================================
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
  // HANDLERS: ADD KEYWORDS
  // ============================================
  const handleAddKeywords = useCallback(async (
    newKeywords: string[],
    platform: NewsPlatform
  ): Promise<boolean> => {
    const creditCost = platform === "google-news" ? 1 : 2
    const totalCost = newKeywords.length * creditCost

    // Validate credits
    if (availableCredits < totalCost) {
      toast.error("Insufficient credits", {
        description: `Need ${totalCost} credits, have ${availableCredits}`,
      })
      return false
    }

    // Simulate API call
    const processingToast = toast.loading(`Adding ${newKeywords.length} keyword(s)...`)

    try {
      // Simulate delay
      await new Promise(resolve => setTimeout(resolve, 1500))

      // Create new keywords
      const createdKeywords: NewsKeyword[] = newKeywords.map((kw, i) => {
        const newsPosition = platform === "google-news" ? Math.floor(Math.random() * 20) + 1 : null
        const impressions = platform === "google-discover" ? Math.floor(Math.random() * 50000) + 5000 : 0

        return {
          id: `kw_${Date.now()}_${i}`,
          keyword: kw,
          searchVolume: Math.floor(Math.random() * 50000) + 1000,
          newsIntent: ["trending", "breaking", "evergreen", "local"][Math.floor(Math.random() * 4)] as NewsKeyword["newsIntent"],
          platforms: {
            "google-news": platform === "google-news" ? {
              position: newsPosition,
              previousPosition: null,
              change: 0,
              isTopStory: newsPosition !== null && newsPosition <= 3 && Math.random() > 0.5,
              category: "Technology",
              articles: [],
            } : null,
            "google-discover": platform === "google-discover" ? {
              impressions,
              clicks: Math.floor(impressions * (Math.random() * 0.1 + 0.02)),
              ctr: Math.random() * 8 + 2,
              avgPosition: Math.floor(Math.random() * 10) + 1,
              trend: ["up", "down", "stable"][Math.floor(Math.random() * 3)] as "up" | "down" | "stable",
              cards: [],
            } : null,
          },
          lastUpdated: "Just now",
        }
      })

      // Update state
      setKeywords(prev => {
        const updated = [...createdKeywords, ...prev]
        setSummary(generateNewsSummary(updated))
        return updated
      })

      // Deduct credits
      setAvailableCredits(prev => prev - totalCost)

      toast.dismiss(processingToast)
      toast.success(`Added ${newKeywords.length} keyword(s)`, {
        description: `${totalCost} credits used`,
      })

      return true
    } catch (err) {
      toast.dismiss(processingToast)
      toast.error("Failed to add keywords")
      return false
    }
  }, [availableCredits])

  // ============================================
  // HANDLERS: REFRESH ALL
  // ============================================
  const handleRefreshAll = useCallback(async () => {
    if (keywords.length === 0) {
      toast.info("No keywords to refresh")
      return
    }

    setIsRefreshing(true)
    const processingToast = toast.loading("Refreshing all keywords...")

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Update keywords with new random data
      setKeywords(prev => prev.map(kw => ({
        ...kw,
        platforms: {
          "google-news": kw.platforms["google-news"] ? {
            ...kw.platforms["google-news"],
            previousPosition: kw.platforms["google-news"].position,
            position: Math.max(1, (kw.platforms["google-news"].position || 10) + Math.floor((Math.random() - 0.5) * 6)),
            change: Math.floor((Math.random() - 0.5) * 6),
            isTopStory: Math.random() > 0.7,
          } : null,
          "google-discover": kw.platforms["google-discover"] ? {
            ...kw.platforms["google-discover"],
            impressions: kw.platforms["google-discover"].impressions + Math.floor((Math.random() - 0.3) * 5000),
            clicks: kw.platforms["google-discover"].clicks + Math.floor((Math.random() - 0.3) * 500),
            trend: ["up", "down", "stable"][Math.floor(Math.random() * 3)] as "up" | "down" | "stable",
          } : null,
        },
        lastUpdated: "Just now",
      })))

      // Update summary
      setKeywords(prev => {
        setSummary(generateNewsSummary(prev))
        return prev
      })

      toast.dismiss(processingToast)
      toast.success("All keywords refreshed!", {
        description: `Updated ${keywords.length} keywords`,
      })
    } catch (err) {
      toast.dismiss(processingToast)
      toast.error("Failed to refresh")
    } finally {
      setIsRefreshing(false)
    }
  }, [keywords])

  // ============================================
  // HANDLERS: REFRESH SINGLE KEYWORD
  // ============================================
  const handleRefreshKeyword = useCallback(async (keywordId: string) => {
    const keyword = keywords.find(k => k.id === keywordId)
    if (!keyword) return

    setIsRefreshingKeyword(keywordId)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      setKeywords(prev => prev.map(kw => {
        if (kw.id !== keywordId) return kw

        return {
          ...kw,
          platforms: {
            "google-news": kw.platforms["google-news"] ? {
              ...kw.platforms["google-news"],
              previousPosition: kw.platforms["google-news"].position,
              position: Math.max(1, (kw.platforms["google-news"].position || 10) + Math.floor((Math.random() - 0.5) * 6)),
              change: Math.floor((Math.random() - 0.5) * 6),
            } : null,
            "google-discover": kw.platforms["google-discover"] ? {
              ...kw.platforms["google-discover"],
              impressions: kw.platforms["google-discover"].impressions + Math.floor((Math.random() - 0.3) * 3000),
              clicks: kw.platforms["google-discover"].clicks + Math.floor((Math.random() - 0.3) * 300),
            } : null,
          },
          lastUpdated: "Just now",
        }
      }))

      toast.success(`Refreshed: ${keyword.keyword}`)
    } catch (err) {
      toast.error("Failed to refresh keyword")
    } finally {
      setIsRefreshingKeyword(null)
    }
  }, [keywords])

  // ============================================
  // HANDLERS: REMOVE KEYWORD
  // ============================================
  const handleRemoveKeyword = useCallback((keywordId: string) => {
    const keyword = keywords.find(k => k.id === keywordId)
    if (!keyword) return

    setKeywords(prev => {
      const updated = prev.filter(k => k.id !== keywordId)
      setSummary(generateNewsSummary(updated))
      return updated
    })

    // Remove any alerts
    setAlerts(prev => {
      const newAlerts = new Map(prev)
      newAlerts.delete(keywordId)
      return newAlerts
    })

    toast.success(`Removed: ${keyword.keyword}`)
  }, [keywords])

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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))

      setAlerts(prev => {
        const newAlerts = new Map(prev)
        newAlerts.set(alert.keywordId, alert)
        return newAlerts
      })

      return true
    } catch (err) {
      toast.error("Failed to save alert")
      return false
    }
  }, [])

  return (
    <div className={STACK_SPACING.default}>
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
            disabled={isRefreshing || keywords.length === 0}
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
            className="h-9 text-xs bg-blue-500 hover:bg-blue-600 text-white"
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            Add Keywords
          </Button>
        </div>
      </div>

      {/* Low Credit Warning */}
      {availableCredits < 10 && (
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

      {/* Dialogs */}
      <AddKeywordDialog
        open={addKeywordDialogOpen}
        onOpenChange={setAddKeywordDialogOpen}
        activePlatform={activePlatform}
        availableCredits={availableCredits}
        onAddKeywords={handleAddKeywords}
      />

      <SetAlertDialog
        open={alertDialogOpen}
        onOpenChange={setAlertDialogOpen}
        keyword={selectedKeywordForAlert}
        platform={activePlatform}
        existingAlert={selectedKeywordForAlert ? alerts.get(selectedKeywordForAlert.id) || null : null}
        onSaveAlert={handleSaveAlert}
      />
    </div>
  )
}
