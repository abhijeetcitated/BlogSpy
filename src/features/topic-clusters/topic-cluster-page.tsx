"use client"

// ============================================
// TOPIC CLUSTER PAGE - NEW PROJECT-BASED SYSTEM
// ============================================
// This is the new entry point for Topic Clusters feature
// Uses the Project/Topic based approach for organizing keywords

import { TopicClusterManager } from "./components/topic-cluster-manager"
import { Layers, Sparkles, Target, TrendingUp } from "lucide-react"

// Mock user ID - replace with real auth when ready
const MOCK_USER_ID = "user_demo_123"

export function TopicClusterPage() {
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight flex items-center gap-2">
          <Layers className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
          My Topic Clusters
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Create topics, add keywords, and generate pillar-cluster structures
        </p>
      </div>

      {/* Main Content - Topic Cluster Manager */}
      <TopicClusterManager userId={MOCK_USER_ID} />
    </div>
  )
}

export default TopicClusterPage
