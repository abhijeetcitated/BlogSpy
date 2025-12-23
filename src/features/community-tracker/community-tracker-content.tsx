"use client"

import { toast } from "sonner"
import { useUser } from "@/contexts/user-context"
import { ErrorBoundary } from "@/components/common/error-boundary"
import { CommunityPlatformTabs, CommunitySummaryCards } from "./components"
import { CommunityHeader } from "./components/CommunityHeader"
import { CommunityFilterBar } from "./components/CommunityFilterBar"
import { CommunityKeywordSection } from "./components/CommunityKeywordSection"
import { CommunitySidebar } from "./components/CommunitySidebar"
import { AddKeywordModal } from "./components/AddKeywordModal"
import { useCommunityTracker } from "./hooks/useCommunityTracker"

export function CommunityTrackerContent() {
  // Get user credits from context
  const { credits } = useUser()
  // Use custom hook for state management
  const {
    summary,
    activePlatform,
    searchQuery,
    isRefreshing,
    isAddModalOpen,
    newKeyword,
    selectedPlatforms,
    isAddingKeyword,
    platformStats,
    filteredKeywords,
    setActivePlatform,
    setSearchQuery,
    setIsAddModalOpen,
    setNewKeyword,
    handleRefresh,
    handleAddKeyword,
    handlePlatformToggle,
    handleDeleteKeyword,
  } = useCommunityTracker()

  // Handle credit purchase
  const handlePurchase = (packageId: string, credits: number, price: number) => {
    toast.success(`Purchasing ${credits} credits for ₹${price}`, {
      description: "Redirecting to Razorpay...",
    })
    // TODO: Integrate with Razorpay
  }

  return (
    <div className="space-y-4 sm:space-y-5 md:space-y-6">
      {/* Header */}
      <CommunityHeader
        isRefreshing={isRefreshing}
        onRefresh={handleRefresh}
        onAddKeyword={() => setIsAddModalOpen(true)}
      />

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
          <CommunityFilterBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            resultCount={filteredKeywords.length}
          />
          <ErrorBoundary>
            <CommunityKeywordSection
              keywords={filteredKeywords}
              platform={activePlatform}
              onDeleteKeyword={handleDeleteKeyword}
            />
          </ErrorBoundary>
        </div>

        {/* Sidebar */}
        <ErrorBoundary>
          <CommunitySidebar
            activePlatform={activePlatform}
            currentCredits={credits.remaining}
            onPurchase={handlePurchase}
          />
        </ErrorBoundary>
      </div>

      {/* Add Keyword Modal */}
      <AddKeywordModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        newKeyword={newKeyword}
        onKeywordChange={setNewKeyword}
        selectedPlatforms={selectedPlatforms}
        onPlatformToggle={handlePlatformToggle}
        onAddKeyword={handleAddKeyword}
        isAdding={isAddingKeyword}
      />
    </div>
  )
}
