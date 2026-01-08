"use client"

import { useState, useMemo, useCallback } from "react"
import {
  PageHeader,
  SummaryCards,
  CitationFilters,
  CitationList,
  RecommendationsPanel,
  MissedOpportunitiesPanel,
  TopCompetitorsPanel,
  CitationTrendPanel,
} from "./components"
import { generateCitationAnalysis, generateCitationTrend, getCitationRecommendations } from "./__mocks__/citation-data"
import { calculateCitationScore, filterCitations, sortCitations } from "./utils/citation-utils"
import type { CitationStatus, SortByOption, SortOrder } from "./types"
import { STACK_SPACING, GAP_PATTERNS } from "@/src/styles"

export function CitationCheckerContent() {
  // Domain state
  const [domain, setDomain] = useState("myblog.com")
  const [inputDomain, setInputDomain] = useState("myblog.com")
  const [analysis, setAnalysis] = useState(() => generateCitationAnalysis("myblog.com"))

  // Filter state
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<SortByOption>("volume")
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc")
  const [statusFilter, setStatusFilter] = useState<CitationStatus[]>([])
  const [showOnlyWithAI, setShowOnlyWithAI] = useState(false)

  // Computed values
  const recommendations = useMemo(() => getCitationRecommendations(analysis), [analysis])
  const citationScore = useMemo(() => calculateCitationScore(analysis.summary), [analysis.summary])
  const trendData = useMemo(() => generateCitationTrend(6), [])

  // Handle domain change
  const handleCheckDomain = useCallback(() => {
    if (inputDomain && inputDomain !== domain) {
      setDomain(inputDomain)
      setAnalysis(generateCitationAnalysis(inputDomain))
    }
  }, [inputDomain, domain])

  // Filter and sort citations
  const filteredCitations = useMemo(() => {
    const filtered = filterCitations(analysis.citations, searchQuery, statusFilter, showOnlyWithAI)
    return sortCitations(filtered, sortBy, sortOrder)
  }, [analysis.citations, searchQuery, statusFilter, showOnlyWithAI, sortBy, sortOrder])

  // Toggle sort order
  const toggleSortOrder = useCallback(() => {
    setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"))
  }, [])

  return (
    <div className={`min-h-screen bg-background ${STACK_SPACING.default}`}>
      {/* Header */}
      <PageHeader
        inputDomain={inputDomain}
        onInputChange={setInputDomain}
        onCheckDomain={handleCheckDomain}
      />

      {/* Score & Summary */}
      <SummaryCards
        summary={analysis.summary}
        domain={domain}
        citationScore={citationScore}
      />

      {/* Main Content Grid */}
      <div className={`grid grid-cols-1 lg:grid-cols-3 ${GAP_PATTERNS.default}`}>
        {/* Citations List */}
        <div className={`lg:col-span-2 ${STACK_SPACING.tight}`}>
          {/* Filters */}
          <CitationFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            showOnlyWithAI={showOnlyWithAI}
            onShowOnlyWithAIChange={setShowOnlyWithAI}
            sortBy={sortBy}
            onSortByChange={setSortBy}
            sortOrder={sortOrder}
            onSortOrderChange={toggleSortOrder}
          />

          {/* Citations */}
          <CitationList citations={filteredCitations} domain={domain} />
        </div>

        {/* Sidebar */}
        <div className={STACK_SPACING.tight}>
          <RecommendationsPanel recommendations={recommendations} />
          <MissedOpportunitiesPanel opportunities={analysis.missedOpportunities} />
          <TopCompetitorsPanel competitors={analysis.competitorComparison} />
          <CitationTrendPanel trendData={trendData} />
        </div>
      </div>
    </div>
  )
}
