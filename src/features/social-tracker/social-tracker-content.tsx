"use client"

import { useState, useCallback, useMemo, memo, lazy, Suspense } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Search, Loader2 } from "lucide-react"
import { 
  SocialPlatformTabs, 
  SocialSummaryCards, 
  SocialKeywordList, 
  SocialTrackerSkeleton,
  SocialTrackerEmptyState,
  SocialTrackerHeader,
  SocialTrackerSidebar,
  PinterestIcon,
  XIcon,
  InstagramIcon
} from "./components"
import { SOCIAL_PLATFORM_CONFIG, SOCIAL_TRACKER_DEFAULTS } from "./constants"
import { useSocialTracker } from "./hooks"
import type { SocialPlatform, SocialKeyword } from "./types"
import { STACK_SPACING } from "@/src/styles"

// Lazy load modals for better performance
const AddKeywordModal = lazy(() => 
  import("./components/AddKeywordModal").then(m => ({ default: m.AddKeywordModal }))
)
const DeleteKeywordDialog = lazy(() => 
  import("./components/DeleteKeywordDialog").then(m => ({ default: m.DeleteKeywordDialog }))
)

// Modal loading fallback
const ModalLoader = () => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <Loader2 className="w-8 h-8 animate-spin text-white" />
  </div>
)

/**
 * Platform Icon Component - memoized for performance
 */
const PlatformIconDisplay = memo(function PlatformIconDisplay({ 
  platform 
}: { 
  platform: SocialPlatform 
}) {
  switch (platform) {
    case "pinterest": return <PinterestIcon className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
    case "twitter": return <XIcon className="w-4 h-4 sm:w-5 sm:h-5 text-foreground" />
    case "instagram": return <InstagramIcon className="w-4 h-4 sm:w-5 sm:h-5 text-pink-500" />
  }
})

/**
 * Keywords List Card - extracted for cleaner code
 */
const KeywordsListCard = memo(function KeywordsListCard({
  platform,
  filteredKeywords,
  onDelete,
  onViewDetails,
}: {
  platform: SocialPlatform
  filteredKeywords: SocialKeyword[]
  onDelete: (id: string) => void
  onViewDetails: (keyword: SocialKeyword) => void
}) {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="border-b border-border p-3 sm:p-4 md:p-6">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm sm:text-base md:text-lg flex items-center gap-2 text-card-foreground">
            <PlatformIconDisplay platform={platform} />
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
          platform={platform}
          onDelete={onDelete}
          onViewDetails={onViewDetails}
        />
      </CardContent>
    </Card>
  )
})

/**
 * Social Tracker Content - Main Component
 */
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

  // Memoized config
  const config = useMemo(() => SOCIAL_PLATFORM_CONFIG[activePlatform], [activePlatform])

  // Memoized current credits (TODO: Get from user context)
  const currentCredits = SOCIAL_TRACKER_DEFAULTS.demoCredits

  // Memoized handlers
  const handleRefresh = useCallback(async () => {
    await refreshData()
    toast.success("Data refreshed", {
      description: "All keyword metrics updated",
    })
  }, [refreshData])

  const handleAddKeyword = useCallback(async (keyword: string, platforms: SocialPlatform[]) => {
    const success = await addKeyword(keyword, platforms)
    if (success) {
      toast.success(`"${keyword}" added successfully`, {
        description: `Tracking on ${platforms.length} platform${platforms.length > 1 ? "s" : ""}`,
      })
    }
    return success
  }, [addKeyword])

  const handleDeleteClick = useCallback((keywordId: string) => {
    const keyword = keywords.find(k => k.id === keywordId)
    if (keyword) {
      setKeywordToDelete(keyword)
      setDeleteDialogOpen(true)
    }
  }, [keywords])

  const handleDeleteConfirm = useCallback(async () => {
    if (!keywordToDelete) return
    const success = await deleteKeyword(keywordToDelete.id)
    if (success) {
      toast.success(`"${keywordToDelete.keyword}" deleted`, {
        description: "Keyword removed from tracking",
      })
      setDeleteDialogOpen(false)
      setKeywordToDelete(null)
    }
  }, [keywordToDelete, deleteKeyword])

  const handleViewDetails = useCallback((keyword: SocialKeyword) => {
    toast.info(`View details for "${keyword.keyword}"`, {
      description: "Feature coming soon!",
    })
  }, [])

  const handleCreditPurchase = useCallback((packageId: string, credits: number, price: number) => {
    toast.success(`Purchasing ${credits} credits for $${price}`, {
      description: "Redirecting to payment...",
    })
    // TODO: Integrate with Stripe
  }, [])

  const handleOpenAddModal = useCallback(() => setIsAddModalOpen(true), [])
  const handleCloseAddModal = useCallback(() => setIsAddModalOpen(false), [])
  const handleCloseDeleteDialog = useCallback(() => {
    setDeleteDialogOpen(false)
    setKeywordToDelete(null)
  }, [])

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
    <div className={`min-h-full ${STACK_SPACING.default}`}>
      {/* Header */}
      <SocialTrackerHeader
        isRefreshing={isRefreshing}
        onRefresh={handleRefresh}
        onAddKeyword={handleOpenAddModal}
      />

      {/* Summary Cards */}
      {summary && <SocialSummaryCards summary={summary} />}

      {/* Platform Tabs & Search */}
      <div className="flex flex-col gap-3 md:gap-4">
        <div className="overflow-x-auto -mx-3 sm:-mx-4 md:mx-0 px-3 sm:px-4 md:px-0">
          <SocialPlatformTabs
            activePlatform={activePlatform}
            onPlatformChange={setActivePlatform}
            stats={platformStats}
          />
        </div>
        
        <div className="relative w-full md:w-64">
          <label htmlFor="keyword-search" className="sr-only">
            Search keywords
          </label>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
          <Input
            id="keyword-search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search ${config.name} keywords...`}
            className="pl-10 text-sm"
            aria-label={`Search ${config.name} keywords`}
          />
        </div>
      </div>

      {/* Empty state check */}
      {keywords.length === 0 ? (
        <SocialTrackerEmptyState
          type="no-keywords"
          onAddKeyword={handleOpenAddModal}
        />
      ) : filteredKeywords.length === 0 ? (
        <SocialTrackerEmptyState
          type="no-results"
          searchQuery={searchQuery}
          onAddKeyword={handleOpenAddModal}
        />
      ) : (
        /* Main Content Grid */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Keywords List */}
          <div className="lg:col-span-2 order-2 lg:order-1">
            <KeywordsListCard
              platform={activePlatform}
              filteredKeywords={filteredKeywords}
              onDelete={handleDeleteClick}
              onViewDetails={handleViewDetails}
            />
          </div>

          {/* Tips & Insights Sidebar */}
          <SocialTrackerSidebar
            activePlatform={activePlatform}
            keywords={keywords}
            summary={summary}
            currentCredits={currentCredits}
            onCreditPurchase={handleCreditPurchase}
          />
        </div>
      )}

      {/* Lazy-loaded Modals with Suspense */}
      {isAddModalOpen && (
        <Suspense fallback={<ModalLoader />}>
          <AddKeywordModal
            isOpen={isAddModalOpen}
            onClose={handleCloseAddModal}
            onAdd={handleAddKeyword}
            isLoading={isAddingKeyword}
          />
        </Suspense>
      )}

      {deleteDialogOpen && (
        <Suspense fallback={<ModalLoader />}>
          <DeleteKeywordDialog
            isOpen={deleteDialogOpen}
            onClose={handleCloseDeleteDialog}
            onConfirm={handleDeleteConfirm}
            keyword={keywordToDelete?.keyword ?? ""}
            isLoading={isDeletingKeyword}
          />
        </Suspense>
      )}
    </div>
  )
}
