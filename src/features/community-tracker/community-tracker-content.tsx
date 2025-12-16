"use client"

import { useState, useMemo, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import { 
  RefreshCw, 
  Search, 
  Plus,
  Lightbulb,
  Flame,
  Loader2,
  ExternalLink
} from "lucide-react"
import { MOCK_COMMUNITY_KEYWORDS, MOCK_COMMUNITY_SUMMARY } from "./__mocks__"
import { DEFAULT_COMMUNITY_PLATFORM, COMMUNITY_TIPS, SEO_SUBREDDITS } from "./constants"
import { CommunityPlatformTabs, CommunitySummaryCards, CommunityKeywordList, CommunityCreditPurchaseCard } from "./components"
import type { CommunityPlatform, CommunityKeyword } from "./types"

// Custom Community Icon (People Discussion SVG)
function CommunityIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}

export function CommunityTrackerContent() {
  // Data state
  const [keywords, setKeywords] = useState<CommunityKeyword[]>(MOCK_COMMUNITY_KEYWORDS)
  const [summary, setSummary] = useState(MOCK_COMMUNITY_SUMMARY)
  
  // Platform state
  const [activePlatform, setActivePlatform] = useState<CommunityPlatform>(DEFAULT_COMMUNITY_PLATFORM)
  
  // Filter state
  const [searchQuery, setSearchQuery] = useState("")
  
  // Loading states
  const [isRefreshing, setIsRefreshing] = useState(false)
  
  // Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [newKeyword, setNewKeyword] = useState("")
  const [selectedPlatforms, setSelectedPlatforms] = useState<CommunityPlatform[]>(["reddit", "quora"])
  const [isAddingKeyword, setIsAddingKeyword] = useState(false)

  // Platform stats
  const platformStats = useMemo(() => ({
    reddit: { count: keywords.filter(k => k.platforms.reddit?.position).length },
    quora: { count: keywords.filter(k => k.platforms.quora?.position).length },
  }), [keywords])

  // Filtered keywords
  const filteredKeywords = useMemo(() => {
    let filtered = keywords
    
    // Filter by platform availability
    if (activePlatform === "reddit") {
      filtered = filtered.filter(k => k.platforms.reddit?.position)
    } else {
      filtered = filtered.filter(k => k.platforms.quora?.position)
    }
    
    // Filter by search
    if (searchQuery) {
      filtered = filtered.filter(k => 
        k.keyword.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    
    return filtered
  }, [keywords, activePlatform, searchQuery])

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Update summary with slight variations
    setSummary(prev => ({
      ...prev,
      totalMentions: prev.totalMentions + Math.floor(Math.random() * 20),
      opportunityScore: Math.min(100, prev.opportunityScore + Math.floor(Math.random() * 5)),
    }))
    
    setIsRefreshing(false)
    toast.success("Data refreshed successfully", {
      description: "All community rankings have been updated"
    })
  }, [])

  // Handle add keyword
  const handleAddKeyword = async () => {
    if (!newKeyword.trim()) {
      toast.error("Please enter a keyword")
      return
    }
    
    if (selectedPlatforms.length === 0) {
      toast.error("Please select at least one platform")
      return
    }
    
    setIsAddingKeyword(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Create new keyword
    const newKw: CommunityKeyword = {
      id: `community-kw-${Date.now()}`,
      keyword: newKeyword.trim(),
      searchVolume: Math.floor(Math.random() * 10000) + 1000,
      communityIntent: ["discussion", "question", "recommendation", "comparison"][Math.floor(Math.random() * 4)] as CommunityKeyword["communityIntent"],
      platforms: {
        reddit: selectedPlatforms.includes("reddit") ? {
          position: Math.floor(Math.random() * 20) + 1,
          avgUpvotes: Math.floor(Math.random() * 500) + 50,
          totalMentions: Math.floor(Math.random() * 100) + 10,
          subreddits: ["r/SEO", "r/marketing", "r/blogging"].slice(0, Math.floor(Math.random() * 3) + 1),
          hasOurContent: false,
          topPosts: [],
        } : undefined,
        quora: selectedPlatforms.includes("quora") ? {
          position: Math.floor(Math.random() * 20) + 1,
          avgViews: Math.floor(Math.random() * 50000) + 5000,
          totalQuestions: Math.floor(Math.random() * 50) + 5,
          hasOurContent: false,
          topAnswers: [],
        } : undefined,
      },
      lastUpdated: new Date().toISOString(),
    }
    
    setKeywords(prev => [newKw, ...prev])
    setIsAddingKeyword(false)
    setIsAddModalOpen(false)
    setNewKeyword("")
    setSelectedPlatforms(["reddit", "quora"])
    
    toast.success(`Keyword "${newKeyword}" added successfully`, {
      description: `Tracking on ${selectedPlatforms.join(" & ")}`
    })
  }

  // Handle platform toggle in modal
  const handlePlatformToggle = (platform: CommunityPlatform) => {
    setSelectedPlatforms(prev =>
      prev.includes(platform)
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    )
  }

  // Handle subreddit click
  const handleSubredditClick = (subreddit: string) => {
    const url = `https://reddit.com/${subreddit.replace("r/", "r/")}`
    window.open(url, "_blank")
  }

  return (
    <div className="space-y-4 sm:space-y-5 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-orange-500/10 shrink-0">
            <CommunityIcon className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-foreground">Community Tracker</h1>
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20">
                2 Platforms
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Track visibility on Reddit & Quora
            </p>
          </div>
        </div>
        <div className="flex items-center justify-between sm:justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="h-9"
          >
            {isRefreshing ? (
              <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-1.5" />
            )}
            Refresh
          </Button>
          <Button
            size="sm"
            onClick={() => setIsAddModalOpen(true)}
            className="h-9 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg shadow-orange-500/25"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Add Keywords
          </Button>
        </div>
      </div>

      {/* Platform Tabs */}
      <CommunityPlatformTabs
        activePlatform={activePlatform}
        onPlatformChange={setActivePlatform}
        stats={platformStats}
      />

      {/* Summary Cards */}
      <CommunitySummaryCards summary={summary} />

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
        {/* Keywords List */}
        <div className="lg:col-span-3 space-y-3 sm:space-y-4">
          {/* Search */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 sm:h-10 text-sm"
              />
            </div>
            <span className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
              {filteredKeywords.length} keywords
            </span>
          </div>

          {/* Keywords */}
          <CommunityKeywordList keywords={filteredKeywords} platform={activePlatform} />
        </div>

        {/* Sidebar - Hidden on mobile, shown after keywords on tablet/desktop */}
        <div className="lg:col-span-1 space-y-3 sm:space-y-4">
          {/* Platform API Cost Info */}
          <Card className="bg-card border-border overflow-hidden">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-3">
                <div 
                  className={`p-2.5 sm:p-3 rounded-xl ${activePlatform === "reddit" ? "bg-orange-500/10" : "bg-red-500/10"}`}
                >
                  {activePlatform === "reddit" ? (
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500">
                      <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701z"/>
                    </svg>
                  ) : (
                    <span className="text-base sm:text-lg font-bold text-red-600">Q</span>
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-lg sm:text-xl font-bold text-foreground">
                    1 <span className="text-sm font-normal text-muted-foreground">credit</span>
                  </p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">
                    per keyword on {activePlatform === "reddit" ? "Reddit" : "Quora"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] sm:text-xs text-muted-foreground">API Source</p>
                  <p className="text-xs sm:text-sm font-medium text-foreground">
                    {activePlatform === "reddit" ? "Apify" : "Crawlbase"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Credit Purchase Card */}
          <CommunityCreditPurchaseCard
            currentCredits={125}
            onPurchase={(packageId, credits, price) => {
              toast.success(`Purchasing ${credits} credits for ₹${price}`, {
                description: "Redirecting to Razorpay...",
              })
              // TODO: Integrate with Razorpay
            }}
          />

          {/* Tips */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-2 sm:pb-3">
              <CardTitle className="text-xs sm:text-sm font-semibold text-foreground flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-500/10">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                </div>
                Community Tips
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5 pt-0">
              {COMMUNITY_TIPS.map((tip, i) => (
                <div key={i} className="flex items-start gap-2 text-xs">
                  <span className="text-emerald-500 mt-0.5 shrink-0">✓</span>
                  <span className="text-muted-foreground leading-relaxed">{tip}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Popular Subreddits */}
          {activePlatform === "reddit" && (
            <Card className="bg-card border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-orange-500/10">
                    <Flame className="w-3.5 h-3.5 text-orange-500" />
                  </div>
                  Popular Subreddits
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 pt-0">
                {SEO_SUBREDDITS.slice(0, 6).map((sub) => (
                  <button
                    key={sub}
                    onClick={() => handleSubredditClick(sub)}
                    className="flex items-center justify-between text-xs group cursor-pointer hover:bg-muted/50 rounded-md px-2 py-1.5 -mx-2 transition-colors w-full text-left"
                  >
                    <span className="text-orange-600 dark:text-orange-400 font-medium">{sub}</span>
                    <ExternalLink className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Add Keyword Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-orange-500/10">
                <CommunityIcon className="h-4 w-4 text-orange-500" />
              </div>
              Add Keyword to Track
            </DialogTitle>
            <DialogDescription>
              Enter a keyword to track across community platforms. We&apos;ll monitor rankings and mentions.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Keyword Input */}
            <div className="space-y-2">
              <Label htmlFor="keyword">Keyword</Label>
              <Input
                id="keyword"
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                placeholder="e.g., best seo tools, rank tracking"
                disabled={isAddingKeyword}
              />
            </div>

            {/* Platform Selection */}
            <div className="space-y-3">
              <Label>Track on Platforms</Label>
              <div className="grid gap-2">
                {/* Reddit */}
                <label
                  htmlFor="reddit"
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer ${
                    selectedPlatforms.includes("reddit")
                      ? "border-orange-500/50 bg-orange-500/5"
                      : "border-border hover:border-muted-foreground/30"
                  }`}
                >
                  <Checkbox
                    id="reddit"
                    checked={selectedPlatforms.includes("reddit")}
                    disabled={isAddingKeyword}
                    onCheckedChange={() => handlePlatformToggle("reddit")}
                  />
                  <div className="w-5 h-5 text-orange-500">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701z"/>
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-foreground">Reddit</span>
                  <span className="ml-auto text-xs text-muted-foreground">1 credit</span>
                </label>

                {/* Quora */}
                <label
                  htmlFor="quora"
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer ${
                    selectedPlatforms.includes("quora")
                      ? "border-red-500/50 bg-red-500/5"
                      : "border-border hover:border-muted-foreground/30"
                  }`}
                >
                  <Checkbox
                    id="quora"
                    checked={selectedPlatforms.includes("quora")}
                    disabled={isAddingKeyword}
                    onCheckedChange={() => handlePlatformToggle("quora")}
                  />
                  <div className="w-5 h-5 text-red-500">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12.738 18.394c-.723-1.474-1.566-2.984-3.016-2.984-.467 0-.936.12-1.273.36l-.478-.815c.623-.538 1.562-.894 2.783-.894 2.005 0 3.256 1.147 4.26 2.855.398-1.052.609-2.362.609-3.904 0-4.796-1.803-7.93-5.595-7.93-3.787 0-5.678 3.134-5.678 7.93 0 4.804 1.896 7.813 5.678 7.813.793 0 1.514-.113 2.156-.335l-.446-2.096zM12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0z"/>
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-foreground">Quora</span>
                  <span className="ml-auto text-xs text-muted-foreground">1 credit</span>
                </label>
              </div>
            </div>

            {/* Credit Cost Summary */}
            {selectedPlatforms.length > 0 && (
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border">
                <span className="text-sm text-muted-foreground">Total Cost</span>
                <span className="text-sm font-semibold text-foreground">{selectedPlatforms.length} credits</span>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsAddModalOpen(false)}
              disabled={isAddingKeyword}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddKeyword}
              disabled={isAddingKeyword || !newKeyword.trim() || selectedPlatforms.length === 0}
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
            >
              {isAddingKeyword ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Keyword
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
