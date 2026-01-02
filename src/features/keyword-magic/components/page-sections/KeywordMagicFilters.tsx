"use client"

// ============================================
// KEYWORD MAGIC - Filters Component (Zustand Version)
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

export function KeywordMagicFilters() {
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
  const [tempIntents, setTempIntents] = useState<string[]>(filters.selectedIntents)
  const [tempSerpFeatures, setTempSerpFeatures] = useState(filters.selectedSerpFeatures)
  const [tempWeakSpotToggle, setTempWeakSpotToggle] = useState(filters.weakSpotToggle)
  const [tempWeakSpotTypes, setTempWeakSpotTypes] = useState<string[]>(filters.weakSpotTypes)
  const [tempTrendDirection, setTempTrendDirection] = useState(filters.trendDirection)
  const [tempMinGrowth, setTempMinGrowth] = useState(filters.minTrendGrowth)
  const [volumePreset, setVolumePreset] = useState<string | null>(null)
  
  // Include/Exclude state
  const [includeInput, setIncludeInput] = useState("")
  const [excludeInput, setExcludeInput] = useState("")

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
        tempSelectedIntents={tempIntents}
        onToggleIntent={(intent) => {
          setTempIntents((prev) =>
            prev.includes(intent)
              ? prev.filter((i) => i !== intent)
              : [...prev, intent]
          )
        }}
        onApply={() => {
          setFilter("selectedIntents", tempIntents)
          setIntentOpen(false)
        }}
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
        tempHasWeakSpot={tempWeakSpotToggle === "all" ? null : tempWeakSpotToggle === "with"}
        tempWeakSpotTypes={tempWeakSpotTypes}
        onTempHasWeakSpotChange={(value) => {
          if (value === null) setTempWeakSpotToggle("all")
          else if (value === true) setTempWeakSpotToggle("with")
          else setTempWeakSpotToggle("without")
        }}
        onToggleWeakSpotType={(type) => {
          setTempWeakSpotTypes((prev) =>
            prev.includes(type)
              ? prev.filter((t) => t !== type)
              : [...prev, type]
          )
        }}
        onApply={() => {
          setFilter("weakSpotToggle", tempWeakSpotToggle)
          setFilter("weakSpotTypes", tempWeakSpotTypes)
          setWeakSpotOpen(false)
        }}
      />

      <SerpFilter
        open={serpOpen}
        onOpenChange={setSerpOpen}
        selectedFeatures={filters.selectedSerpFeatures}
        tempSelectedFeatures={tempSerpFeatures}
        onToggleFeature={(feature) => {
          setTempSerpFeatures((prev) =>
            prev.includes(feature)
              ? prev.filter((f) => f !== feature)
              : [...prev, feature]
          )
        }}
        onApply={() => {
          setFilter("selectedSerpFeatures", tempSerpFeatures)
          setSerpOpen(false)
        }}
      />

      <TrendFilter
        open={trendOpen}
        onOpenChange={setTrendOpen}
        tempTrendDirection={tempTrendDirection}
        tempMinGrowth={tempMinGrowth}
        onTempTrendDirectionChange={setTempTrendDirection}
        onTempMinGrowthChange={setTempMinGrowth}
        onApply={() => {
          setFilter("trendDirection", tempTrendDirection)
          setFilter("minTrendGrowth", tempMinGrowth)
          setTrendOpen(false)
        }}
      />

      <IncludeExcludeFilter
        includeTerms={filters.includeTerms}
        excludeTerms={filters.excludeTerms}
        includeInput={includeInput}
        excludeInput={excludeInput}
        onIncludeInputChange={setIncludeInput}
        onExcludeInputChange={setExcludeInput}
        onAddIncludeTerm={() => {
          if (includeInput.trim()) {
            setFilter("includeTerms", [...filters.includeTerms, includeInput.trim()])
            setIncludeInput("")
          }
        }}
        onAddExcludeTerm={() => {
          if (excludeInput.trim()) {
            setFilter("excludeTerms", [...filters.excludeTerms, excludeInput.trim()])
            setExcludeInput("")
          }
        }}
        onRemoveIncludeTerm={(term) => {
          setFilter("includeTerms", filters.includeTerms.filter((t) => t !== term))
        }}
        onRemoveExcludeTerm={(term) => {
          setFilter("excludeTerms", filters.excludeTerms.filter((t) => t !== term))
        }}
      />
    </div>
  )
}
