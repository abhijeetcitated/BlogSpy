"use client"

import { useState } from "react"
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
  SERPTable
} from "./components"
import { CommunityDecayCard } from "@/components/ui/community-decay-badge"
import { generateMockPixelRank } from "@/lib/pixel-calculator"
import { calculateRTV } from "@/lib/rtv-calculator"
import { generateMockAIOverviewAnalysis } from "@/lib/ai-overview-analyzer"
import { generateMockCommunityDecay } from "@/lib/community-decay-calculator"
import { 
  MOCK_KEYWORD_METRICS, 
  MOCK_GEO_COMPONENTS, 
  MOCK_SERP_RESULTS 
} from "./__mocks__/keyword-data"
import type { DeviceView } from "./types"
import type { CTRStealingFeature } from "@/types/rtv.types"

export function KeywordOverviewContent() {
  const [deviceView, setDeviceView] = useState<DeviceView>("mobile")

  // Generate mock data for advanced metrics
  const pixelRankScore = generateMockPixelRank(42)
  const rtvAnalysis = calculateRTV(
    90000, 
    ["ai_overview", "featured_snippet", "video_carousel", "people_also_ask"] as CTRStealingFeature[],
    5
  )
  const aiOverviewAnalysis = generateMockAIOverviewAnalysis("AI Agents", true)
  const communityDecayAnalysis = generateMockCommunityDecay("AI Agents", true)

  return (
    <div className="flex-1 p-4 lg:p-6 space-y-4 lg:space-y-6 overflow-x-hidden">
      {/* Header */}
      <KeywordHeader 
        metrics={MOCK_KEYWORD_METRICS} 
        aiOverviewAnalysis={aiOverviewAnalysis} 
      />

      {/* Bento Grid - Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 lg:gap-4">
        <GEOScoreCard 
          score={MOCK_KEYWORD_METRICS.geoScore} 
          components={MOCK_GEO_COMPONENTS} 
        />
        <GlobalVolumeCard />
        <IntentProfileCard />
        <TrendForecastCard />
      </div>

      {/* Pixel Rank & RTV Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4">
        <PixelRankSection score={pixelRankScore} />
        <RTVSection analysis={rtvAnalysis} />
      </div>

      {/* Search Trends Card - Full Width */}
      <SearchTrendsCard 
        deviceView={deviceView} 
        onDeviceChange={setDeviceView} 
      />

      {/* AI Overview Citation Analysis Section */}
      <AIOverviewSection analysis={aiOverviewAnalysis} />

      {/* AI Optimization Recommendations */}
      <AIRecommendationsSection analysis={aiOverviewAnalysis} />

      {/* Community Decay Analysis Section */}
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

      {/* SERP X-Ray Section */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
        <h3 className="text-lg font-semibold text-white mb-4">Top 10 Competition Analysis</h3>
        <SERPTable results={MOCK_SERP_RESULTS} />
      </div>
    </div>
  )
}
