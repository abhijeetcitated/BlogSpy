"use client"

// ============================================
// KEYWORD RESEARCH - Filters Component (Zustand Version)
// ============================================
// Migrated from legacy useReducer to Zustand store
// ============================================

import { useState } from "react"
import { useKeywordStore } from "../../store"
import {
  VolumeFilter,
  KDFilter,
  IntentFilter,
  CPCFilter,
  GeoFilter,
  WeakSpotFilter,
  SerpFilter,
  TrendFilter,
  IncludeExcludeFilter,
} from "../index"

export function KeywordResearchFilters() {
  // Zustand store
  const filters = useKeywordStore((state) => state.filters)
  const setFilter = useKeywordStore((state) => state.setFilter)
  
  // Local popover states
  const [volumeOpen, setVolumeOpen] = useState(false)
  const [kdOpen, setKdOpen] = useState(false)
  const [intentOpen, setIntentOpen] = useState(false)
  const [cpcOpen, setCpcOpen] = useState(false)
  const [geoOpen, setGeoOpen] = useState(false)
  const [weakSpotOpen, setWeakSpotOpen] = useState(false)
  const [serpOpen, setSerpOpen] = useState(false)
  const [trendOpen, setTrendOpen] = useState(false)
  
  // Temp filter states (for apply pattern)
  const [tempVolumeRange, setTempVolumeRange] = useState<[number, number]>(filters.volumeRange)
  const [tempKdRange, setTempKdRange] = useState<[number, number]>(filters.kdRange)
  const [tempCpcRange, setTempCpcRange] = useState<[number, number]>(filters.cpcRange)
  const [tempGeoRange, setTempGeoRange] = useState<[number, number]>(filters.geoRange)
  const [volumePreset, setVolumePreset] = useState<string | null>(null)


  return (
    <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-none -mx-1 px-1">
      <VolumeFilter
        open={volumeOpen}
        onOpenChange={setVolumeOpen}
        tempRange={tempVolumeRange}
        onTempRangeChange={setTempVolumeRange}
        volumePreset={volumePreset}
        onPresetChange={setVolumePreset}
        onApply={() => {
          setFilter("volumeRange", tempVolumeRange)
          setVolumeOpen(false)
        }}
      />

      <KDFilter
        open={kdOpen}
        onOpenChange={setKdOpen}
        tempRange={tempKdRange}
        onTempRangeChange={setTempKdRange}
        onApply={() => {
          setFilter("kdRange", tempKdRange)
          setKdOpen(false)
        }}
      />

      <IntentFilter
        open={intentOpen}
        onOpenChange={setIntentOpen}
        selectedIntents={filters.selectedIntents}
      />

      <CPCFilter
        open={cpcOpen}
        onOpenChange={setCpcOpen}
        tempRange={tempCpcRange}
        onTempRangeChange={setTempCpcRange}
        onApply={() => {
          setFilter("cpcRange", tempCpcRange)
          setCpcOpen(false)
        }}
      />

      <GeoFilter
        open={geoOpen}
        onOpenChange={setGeoOpen}
        tempRange={tempGeoRange}
        onTempRangeChange={setTempGeoRange}
        onApply={() => {
          setFilter("geoRange", tempGeoRange)
          setGeoOpen(false)
        }}
      />

      <WeakSpotFilter
        open={weakSpotOpen}
        onOpenChange={setWeakSpotOpen}
        selectedTypes={filters.weakSpotTypes}
        weakSpotToggle={filters.weakSpotToggle}
      />

      <SerpFilter
        open={serpOpen}
        onOpenChange={setSerpOpen}
        selectedFeatures={filters.selectedSerpFeatures}
      />

      <TrendFilter
        open={trendOpen}
        onOpenChange={setTrendOpen}
      />

      <IncludeExcludeFilter />
    </div>
  )
}
