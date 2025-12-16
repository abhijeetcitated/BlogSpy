"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { 
  Search, 
  RefreshCw, 
  Plus,
  Lightbulb,
  TrendingUp,
  Users
} from "lucide-react"
import { 
  SocialPlatformTabs, 
  SocialSummaryCards, 
  SocialKeywordList, 
  SocialTrackerIcon, 
  PinterestIcon, 
  XIcon, 
  InstagramIcon,
  AddKeywordModal,
  DeleteKeywordDialog,
  CreditPurchaseCard,
  SocialTrackerSkeleton,
  SocialTrackerEmptyState
} from "./components"
import { SOCIAL_PLATFORM_CONFIG, PINTEREST_TIPS, TWITTER_TIPS, INSTAGRAM_TIPS } from "./constants"
import { useSocialTracker } from "./hooks"
import type { SocialPlatform, SocialKeyword } from "./types"

export function SocialTrackerContent() {
  // Use custom hook for data management
  const {
    keywords,
    summary,
    isLoading,
    error,
    isRefreshing,
    isAddingKeyword,
    isDeletingKeyword,
    searchQuery,
    setSearchQuery,
    activePlatform,
    setActivePlatform,
    filteredKeywords,
    platformStats,
    refreshData,
    addKeyword,
    deleteKeyword,
  } = useSocialTracker()

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [keywordToDelete, setKeywordToDelete] = useState<SocialKeyword | null>(null)

  const config = SOCIAL_PLATFORM_CONFIG[activePlatform]

  // Get platform icon component for sidebar
  const getPlatformIconComponent = () => {
    switch (activePlatform) {
      case "pinterest": return <PinterestIcon className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
      case "twitter": return <XIcon className="w-4 h-4 sm:w-5 sm:h-5 text-foreground" />
      case "instagram": return <InstagramIcon className="w-4 h-4 sm:w-5 sm:h-5 text-pink-500" />
    }
  }

  // Get tips for current platform
  const getTips = () => {
    switch (activePlatform) {
      case "pinterest": return PINTEREST_TIPS
      case "twitter": return TWITTER_TIPS
      case "instagram": return INSTAGRAM_TIPS
    }
  }

  // Get platform icon
  const getPlatformIcon = () => {
    switch (activePlatform) {
      case "pinterest": return <PinterestIcon className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
      case "twitter": return <XIcon className="w-4 h-4 sm:w-5 sm:h-5 text-foreground" />
      case "instagram": return <InstagramIcon className="w-4 h-4 sm:w-5 sm:h-5 text-pink-500" />
    }
  }

  // Handlers
  const handleRefresh = async () => {
    await refreshData()
    toast.success("Data refreshed", {
      description: "All keyword metrics updated",
    })
  }

  const handleAddKeyword = async (keyword: string, platforms: SocialPlatform[]) => {
    const success = await addKeyword(keyword, platforms)
    if (success) {
      toast.success(`"${keyword}" added successfully`, {
        description: `Tracking on ${platforms.length} platform${platforms.length > 1 ? "s" : ""}`,
      })
    }
    return success
  }

  const handleDeleteClick = (keywordId: string) => {
    const keyword = keywords.find(k => k.id === keywordId)
    if (keyword) {
      setKeywordToDelete(keyword)
      setDeleteDialogOpen(true)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!keywordToDelete) return
    const success = await deleteKeyword(keywordToDelete.id)
    if (success) {
      toast.success(`"${keywordToDelete.keyword}" deleted`, {
        description: "Keyword removed from tracking",
      })
      setDeleteDialogOpen(false)
      setKeywordToDelete(null)
    }
  }

  const handleViewDetails = (keyword: SocialKeyword) => {
    toast.info(`View details for "${keyword.keyword}"`, {
      description: "Feature coming soon!",
    })
  }

  // Loading state
  if (isLoading) {
    return <SocialTrackerSkeleton />
  }

  // Error state
  if (error) {
    return (
      <SocialTrackerEmptyState
        type="error"
        onRetry={() => window.location.reload()}
      />
    )
  }

  return (
    <div className="min-h-full space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-pink-500/10 shrink-0">
            <SocialTrackerIcon className="h-5 w-5 sm:h-6 sm:w-6 text-pink-500" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground">Social Tracker</h1>
              <Badge variant="outline" className="border-pink-500/30 text-pink-500 dark:text-pink-400">
                3 Platforms
              </Badge>
            </div>
            <p className="text-muted-foreground text-xs sm:text-sm mt-0.5 line-clamp-1 sm:line-clamp-none">
              Track keyword visibility across Pinterest, X & Instagram
            </p>
          </div>
        </div>
        <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="text-xs sm:text-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
            <span className="sm:hidden">Sync</span>
          </Button>
          <Button 
            size="sm"
            className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white text-xs sm:text-sm"
            onClick={() => setIsAddModalOpen(true)}
          >
            <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
            Add Keywords
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && <SocialSummaryCards summary={summary} />}

      {/* Platform Tabs */}
      <div className="flex flex-col gap-3 md:gap-4">
        <div className="overflow-x-auto -mx-3 sm:-mx-4 md:mx-0 px-3 sm:px-4 md:px-0">
          <SocialPlatformTabs
            activePlatform={activePlatform}
            onPlatformChange={setActivePlatform}
            stats={platformStats}
          />
        </div>
        
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search ${config.name} keywords...`}
            className="pl-10 text-sm"
          />
        </div>
      </div>

      {/* Empty state check */}
      {keywords.length === 0 ? (
        <SocialTrackerEmptyState
          type="no-keywords"
          onAddKeyword={() => setIsAddModalOpen(true)}
        />
      ) : filteredKeywords.length === 0 ? (
        <SocialTrackerEmptyState
          type="no-results"
          searchQuery={searchQuery}
          onAddKeyword={() => setIsAddModalOpen(true)}
        />
      ) : (
      /* Main Content Grid */
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Keywords List */}
        <div className="lg:col-span-2 order-2 lg:order-1">
          <Card className="bg-card border-border">
            <CardHeader className="border-b border-border p-3 sm:p-4 md:p-6">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm sm:text-base md:text-lg flex items-center gap-2 text-card-foreground">
                  {getPlatformIcon()}
                  <span>Keywords</span>
                </CardTitle>
                <Badge variant="secondary" className="text-xs">
                  {filteredKeywords.length} keywords
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-3 sm:p-4">
              <SocialKeywordList 
                keywords={filteredKeywords} 
                platform={activePlatform}
                onDelete={handleDeleteClick}
                onViewDetails={handleViewDetails}
              />
            </CardContent>
          </Card>
        </div>

        {/* Tips & Insights Sidebar */}
        <div className="space-y-3 md:space-y-4 order-1 lg:order-2">
          {/* Platform Credit Cost Card */}
          <Card className="bg-card border-border overflow-hidden">
            <div 
              className={cn(
                "h-1.5",
                activePlatform === "twitter" && "bg-foreground dark:bg-white"
              )}
              style={activePlatform !== "twitter" ? { backgroundColor: config.color } : undefined}
            />
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-3">
                <div 
                  className={cn(
                    "p-2.5 sm:p-3 rounded-xl",
                    activePlatform === "twitter" ? "bg-foreground/10 dark:bg-white/10" : ""
                  )}
                  style={activePlatform !== "twitter" ? { backgroundColor: `${config.color}15` } : undefined}
                >
                  {getPlatformIconComponent()}
                </div>
                <div className="flex-1">
                  <p className="text-lg sm:text-xl font-bold text-foreground">
                    {config.creditCost} <span className="text-sm font-normal text-muted-foreground">credits</span>
                  </p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">per keyword on {config.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] sm:text-xs text-muted-foreground">API Source</p>
                  <p className="text-xs sm:text-sm font-medium text-foreground">{config.apiSource}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Premium Credits Purchase Card */}
          <CreditPurchaseCard 
            currentCredits={125} // TODO: Get from user context
            onPurchase={(packageId: string, credits: number, price: number) => {
              toast.success(`Purchasing ${credits} credits for $${price}`, {
                description: "Redirecting to payment...",
              })
              // TODO: Integrate with Stripe
            }}
          />

          {/* Platform Tips */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-2 p-3 sm:p-4 sm:pb-2">
              <CardTitle className="text-xs sm:text-sm flex items-center gap-2 text-card-foreground">
                <Lightbulb className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500" />
                {config.name} Tips
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 pt-0">
              <ul className="space-y-1.5 sm:space-y-2">
                {getTips().map((tip, i) => (
                  <li key={i} className="text-[10px] sm:text-xs text-muted-foreground flex items-start gap-2">
                    <span className="text-amber-500">•</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-2 p-3 sm:p-4 sm:pb-2">
              <CardTitle className="text-xs sm:text-sm flex items-center gap-2 text-card-foreground">
                <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500" />
                Quick Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 pt-0 space-y-2 sm:space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[10px] sm:text-xs text-muted-foreground">Top 3 Rankings</span>
                <span className="text-xs sm:text-sm font-medium text-foreground">
                  {keywords.filter(k => {
                    const data = k.platforms[activePlatform]
                    return data && data.position && data.position <= 3
                  }).length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] sm:text-xs text-muted-foreground">Top 10 Rankings</span>
                <span className="text-xs sm:text-sm font-medium text-foreground">
                  {keywords.filter(k => {
                    const data = k.platforms[activePlatform]
                    return data && data.position && data.position <= 10
                  }).length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] sm:text-xs text-muted-foreground">Avg Engagement</span>
                <span className="text-xs sm:text-sm font-medium text-emerald-500">
                  {summary?.avgEngagement ?? 0}%
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Audience Insights */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-2 p-3 sm:p-4 sm:pb-2">
              <CardTitle className="text-xs sm:text-sm flex items-center gap-2 text-card-foreground">
                <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-500" />
                Platform Audience
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 pt-0">
              <div className="space-y-1.5 sm:space-y-2">
                {activePlatform === "pinterest" && (
                  <>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">• 80% female users</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">• High purchase intent</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">• Visual search dominant</p>
                  </>
                )}
                {activePlatform === "twitter" && (
                  <>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">• Real-time engagement</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">• News & trending topics</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">• B2B & tech audience</p>
                  </>
                )}
                {activePlatform === "instagram" && (
                  <>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">• 18-34 age dominant</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">• Visual storytelling</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">• Lifestyle & product focus</p>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      )}

      {/* Add Keyword Modal */}
      <AddKeywordModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddKeyword}
        isLoading={isAddingKeyword}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteKeywordDialog
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false)
          setKeywordToDelete(null)
        }}
        onConfirm={handleDeleteConfirm}
        keyword={keywordToDelete?.keyword ?? ""}
        isLoading={isDeletingKeyword}
      />
    </div>
  )
}
