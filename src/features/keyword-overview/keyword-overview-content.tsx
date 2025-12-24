"use client"

import { useState, useMemo, useCallback } from "react"
import { RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { 
  KeywordHeader,
  GEOScoreCard,
  GlobalVolumeCard,
  IntentProfileCard,
  TrendForecastCard,
  PixelRankSection,
  RTVSection,
  SearchTrendsCard,
  AIOverviewSection,
  AIRecommendationsSection,
  DecayOpportunityCard,
  SERPTable,
  KeywordOverviewSkeleton,
  KeywordOverviewError
} from "./components"
import { CommunityDecayCard } from "@/components/ui/community-decay-badge"
import { generateMockPixelRank } from "@/lib/pixel-calculator"
import { calculateRTV } from "@/lib/rtv-calculator"
import { generateMockAIOverviewAnalysis } from "@/lib/ai-overview-analyzer"
import { generateMockCommunityDecay } from "@/lib/community-decay-calculator"
import { ErrorBoundary } from "@/components/common/error-boundary"
import { 
  generateMockDataForKeyword
} from "./__mocks__/keyword-data"
import type { DeviceView, KeywordMetrics } from "./types"
import type { CTRStealingFeature } from "@/types/rtv.types"
import type { GEOScoreComponents } from "@/types/geo.types"
import type { SERPResult } from "./types"

// ============================================
// TYPES
// ============================================
interface KeywordOverviewContentProps {
  /** Keyword to analyze - if not provided, uses default mock data */
  keyword?: string
}

interface KeywordData {
  metrics: KeywordMetrics
  geoComponents: GEOScoreComponents
  serpResults: SERPResult[]
}

// ============================================
// CUSTOM HOOK FOR DATA FETCHING
// ============================================
function useKeywordData(keyword: string) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  
  // Memoize data generation based on keyword
  const data = useMemo<KeywordData>(() => {
    // In production, this would be an API call
    // For now, generate mock data based on keyword
    return generateMockDataForKeyword(keyword)
  }, [keyword])

  const refetch = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      setLastUpdated(new Date())
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch data")
    } finally {
      setIsLoading(false)
    }
  }, [])

  return { data, isLoading, error, refetch, lastUpdated }
}

// ============================================
// MAIN COMPONENT
// ============================================
export function KeywordOverviewContent({ keyword = "AI Agents" }: KeywordOverviewContentProps) {
  // Device view state - affects trend data display
  const [deviceView, setDeviceView] = useState<DeviceView>("mobile")
  
  // Data fetching
  const { data, isLoading, error, refetch, lastUpdated } = useKeywordData(keyword)

  // Memoize expensive calculations to prevent recalculation on every render
  const pixelRankScore = useMemo(() => {
    return generateMockPixelRank(data.metrics.kd > 50 ? 42 : 15)
  }, [data.metrics.kd])

  const rtvAnalysis = useMemo(() => {
    const volume = parseInt(data.metrics.volume.replace(/[^0-9]/g, '')) * 1000
    return calculateRTV(
      volume, 
      ["ai_overview", "featured_snippet", "video_carousel", "people_also_ask"] as CTRStealingFeature[],
      5
    )
  }, [data.metrics.volume])

  const aiOverviewAnalysis = useMemo(() => {
    return generateMockAIOverviewAnalysis(keyword, true)
  }, [keyword])

  const communityDecayAnalysis = useMemo(() => {
    return generateMockCommunityDecay(keyword, true)
  }, [keyword])

  // Device-specific trend message
  const trendMessage = useMemo(() => {
    if (deviceView === "mobile") {
      return { icon: "📱", text: "82% searches are on Mobile. Keep intro short." }
    }
    return { icon: "💻", text: "18% searches are on Desktop. Consider detailed content." }
  }, [deviceView])

  // Loading state
  if (isLoading) {
    return <KeywordOverviewSkeleton />
  }

  // Error state
  if (error) {
    return <KeywordOverviewError error={error} onRetry={refetch} />
  }

  return (
    <ErrorBoundary fallback={<KeywordOverviewError error="Something went wrong" onRetry={refetch} />}>
      <div className="flex-1 p-4 lg:p-6 space-y-4 lg:space-y-6 overflow-x-hidden">
        {/* Header with Refresh */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <KeywordHeader 
              metrics={data.metrics} 
              aiOverviewAnalysis={aiOverviewAnalysis} 
            />
          </div>
          
          {/* Last Updated & Refresh */}
          {lastUpdated && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={refetch}
                className="h-6 px-2 text-xs"
                aria-label="Refresh keyword data"
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                Refresh
              </Button>
            </div>
          )}
        </div>

        {/* Bento Grid - Metrics */}
        <section aria-label="Keyword metrics overview">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 lg:gap-4">
            <GEOScoreCard 
              score={data.metrics.geoScore} 
              components={data.geoComponents} 
            />
            <GlobalVolumeCard />
            <IntentProfileCard />
            <TrendForecastCard />
          </div>
        </section>

        {/* Pixel Rank & RTV Row */}
        <section aria-label="Visibility analysis">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4">
            <PixelRankSection score={pixelRankScore} />
            <RTVSection analysis={rtvAnalysis} />
          </div>
        </section>

        {/* Search Trends Card - Full Width */}
        <section aria-label="Search trends">
          <SearchTrendsCard 
            deviceView={deviceView} 
            onDeviceChange={setDeviceView}
            trendMessage={trendMessage}
          />
        </section>

        {/* AI Overview Citation Analysis Section */}
        <section aria-label="AI Overview analysis">
          <AIOverviewSection analysis={aiOverviewAnalysis} />
        </section>

        {/* AI Optimization Recommendations */}
        <AIRecommendationsSection analysis={aiOverviewAnalysis} />

        {/* Community Decay Analysis Section */}
        <section aria-label="Community content decay analysis">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 lg:gap-4">
            <div className="lg:col-span-2">
              <CommunityDecayCard 
                analysis={communityDecayAnalysis} 
                showSources={true}
                showRecommendations={true}
              />
            </div>
            <DecayOpportunityCard analysis={communityDecayAnalysis} />
          </div>
        </section>

        {/* SERP X-Ray Section */}
        <section aria-label="SERP competition analysis">
          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Top 10 Competition Analysis for "{keyword}"
            </h3>
            <SERPTable results={data.serpResults} />
          </div>
        </section>
      </div>
    </ErrorBoundary>
  )
}
