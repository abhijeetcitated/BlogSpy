// ============================================
// FEATURE COMPONENTS - BARREL EXPORT
// ============================================
// All feature-specific content components
// Import from "@/components/features"
// 
// Structure:
// features/
// ├── keyword-magic/      → Keyword research tools
// ├── keyword-overview/   → Keyword analysis
// ├── rank-tracker/       → SERP position tracking
// ├── competitor-gap/     → Competitor analysis
// ├── content-decay/      → Content health monitoring
// ├── topic-clusters/     → Topic organization
// ├── snippet-stealer/    → Featured snippet tools
// ├── trend-spotter/      → Trend detection
// ├── ai-writer/          → AI content generation
// ├── content-roadmap/    → Content planning
// ├── on-page-checker/    → SEO optimization
// ├── dashboard/          → Command center
// ├── settings/           → User settings
// └── pricing/            → Pricing & plans
// ============================================

// Keyword Magic (from src/features)
export { KeywordMagicContent, KeywordMagicTool, KeywordTable } from "@/src/features/keyword-magic"
export type { Keyword, KeywordTableProps } from "@/src/features/keyword-magic"

// Keyword Overview
export { KeywordOverviewContent } from "./keyword-overview"

// Rank Tracker
export { RankTrackerContent } from "./rank-tracker"

// Competitor Gap (from src/features)
export { CompetitorGapContent, WeakSpotDetector } from "@/src/features/competitor-gap"

// Content Decay
export { ContentDecayContent } from "./content-decay"

// Topic Clusters (from src/features)
export { TopicClusterContent, NetworkGraph, ClusterListView } from "@/src/features/topic-clusters"

// Snippet Stealer
export { SnippetStealerContent } from "./snippet-stealer"

// Trend Spotter
export { TrendSpotterContent, TrendSpotter } from "./trend-spotter"

// AI Writer
export { AIWriterContent } from "./ai-writer"

// Content Roadmap
export { ContentRoadmapContent } from "./content-roadmap"

// On-Page Checker
export { OnPageCheckerContent } from "./on-page-checker"

// Cannibalization Detector
export { CannibalizationContent } from "./cannibalization"

// Video Hijack Indicator
export { VideoHijackContent } from "./video-hijack"

// Citation Checker ("Am I Cited?")
export { CitationCheckerContent } from "./citation-checker"

// Dashboard (Command Center - from src/shared)
export { CommandCenter } from "@/src/shared/dashboard"

// Settings
export { SettingsContent } from "./settings"

// Pricing (from src/shared)
export { PricingModal } from "@/src/shared/pricing"
