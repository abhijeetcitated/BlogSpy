"use client"

import { useState, useMemo } from "react"
import { WeakSpotType, SortField, SortDirection, WeakSpotKeyword } from "../types/weak-spot.types"
import { WEAK_SPOT_DATA } from "../__mocks__/weak-spot.mock"
import { WeakSpotStats } from "./WeakSpotStats"
import { WeakSpotFilters } from "./WeakSpotFilters"
import { WeakSpotInfoBanner } from "./WeakSpotInfoBanner"
import { WeakSpotTable } from "./WeakSpotTable"

// ============================================
// WEAK SPOT DETECTOR - Main Component
// ============================================
export function WeakSpotDetector() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTypes, setSelectedTypes] = useState<WeakSpotType[]>(["reddit", "quora", "linkedin", "medium"])
  const [sortField, setSortField] = useState<SortField>("trafficPotential")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")
  const [addedKeywords, setAddedKeywords] = useState<Set<string>>(new Set())

  // Filter and Sort
  const filteredKeywords = useMemo(() => {
    let filtered = WEAK_SPOT_DATA.filter(kw => {
      // Type filter
      if (!selectedTypes.includes(kw.weakSpotType)) return false
      
      // Search filter
      if (searchQuery.trim()) {
        if (!kw.keyword.toLowerCase().includes(searchQuery.toLowerCase())) return false
      }
      
      return true
    })

    // Sort
    if (sortField) {
      filtered = [...filtered].sort((a, b) => {
        let comparison = 0
        switch (sortField) {
          case "volume":
            comparison = a.volume - b.volume
            break
          case "kd":
            comparison = a.kd - b.kd
            break
          case "weakSpotRank":
            comparison = a.weakSpotRank - b.weakSpotRank
            break
          case "trafficPotential":
            comparison = a.trafficPotential - b.trafficPotential
            break
        }
        return sortDirection === "asc" ? comparison : -comparison
      })
    }

    return filtered
  }, [searchQuery, selectedTypes, sortField, sortDirection])

  // Stats
  const stats = useMemo(() => {
    const highOpportunity = WEAK_SPOT_DATA.filter(k => k.opportunity === "high").length
    const redditCount = WEAK_SPOT_DATA.filter(k => k.weakSpotType === "reddit").length
    const totalPotential = WEAK_SPOT_DATA.reduce((sum, k) => sum + k.trafficPotential, 0)
    return { highOpportunity, redditCount, totalPotential }
  }, [])

  // Toggle type filter
  const toggleType = (type: WeakSpotType) => {
    setSelectedTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    )
  }

  // Handle sort
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("desc")
    }
  }

  // Handle write article
  const handleAddKeyword = (kw: WeakSpotKeyword) => {
    setAddedKeywords(prev => new Set([...prev, kw.id]))
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <WeakSpotStats 
        highOpportunity={stats.highOpportunity}
        redditCount={stats.redditCount}
        totalPotential={stats.totalPotential}
      />

      {/* Filters */}
      <WeakSpotFilters
        selectedTypes={selectedTypes}
        searchQuery={searchQuery}
        onToggleType={toggleType}
        onSearchChange={setSearchQuery}
      />

      {/* Info Banner */}
      <WeakSpotInfoBanner />

      {/* Table */}
      <WeakSpotTable
        keywords={filteredKeywords}
        sortField={sortField}
        sortDirection={sortDirection}
        addedKeywords={addedKeywords}
        onSort={handleSort}
        onAddKeyword={handleAddKeyword}
      />
    </div>
  )
}
