"use client"

// ============================================
// KEYWORD MAGIC - Filters Component
// ============================================

import type { Dispatch } from "react"
import type { KeywordMagicState, KeywordMagicAction } from "../../state"
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

interface KeywordMagicFiltersProps {
  state: KeywordMagicState
  dispatch: Dispatch<KeywordMagicAction>
}

export function KeywordMagicFilters({ state, dispatch }: KeywordMagicFiltersProps) {
  return (
    <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-none -mx-1 px-1">
      <VolumeFilter
        open={state.volumeOpen}
        onOpenChange={(open) => dispatch({ type: "SET_POPOVER_OPEN", payload: { name: "volumeOpen", value: open } })}
        tempRange={state.tempVolumeRange}
        onTempRangeChange={(range) => dispatch({ type: "SET_TEMP_VOLUME_RANGE", payload: range })}
        volumePreset={state.volumePreset}
        onPresetChange={(preset) => dispatch({ type: "SET_VOLUME_PRESET", payload: preset })}
        onApply={() => dispatch({ type: "APPLY_VOLUME_FILTER" })}
      />

      <KDFilter
        open={state.kdOpen}
        onOpenChange={(open) => dispatch({ type: "SET_POPOVER_OPEN", payload: { name: "kdOpen", value: open } })}
        tempRange={state.tempKdRange}
        onTempRangeChange={(range) => dispatch({ type: "SET_TEMP_KD_RANGE", payload: range })}
        onApply={() => dispatch({ type: "APPLY_KD_FILTER" })}
      />

      <IntentFilter
        open={state.intentOpen}
        onOpenChange={(open) => dispatch({ type: "SET_POPOVER_OPEN", payload: { name: "intentOpen", value: open } })}
        selectedIntents={state.selectedIntents}
        tempSelectedIntents={state.tempSelectedIntents}
        onToggleIntent={(intent) => dispatch({ type: "TOGGLE_TEMP_INTENT", payload: intent })}
        onApply={() => dispatch({ type: "APPLY_INTENT_FILTER" })}
      />

      <CPCFilter
        open={state.cpcOpen}
        onOpenChange={(open) => dispatch({ type: "SET_POPOVER_OPEN", payload: { name: "cpcOpen", value: open } })}
        tempRange={state.tempCpcRange}
        onTempRangeChange={(range) => dispatch({ type: "SET_TEMP_CPC_RANGE", payload: range })}
        onApply={() => dispatch({ type: "APPLY_CPC_FILTER" })}
      />

      <GeoFilter
        open={state.geoOpen}
        onOpenChange={(open) => dispatch({ type: "SET_POPOVER_OPEN", payload: { name: "geoOpen", value: open } })}
        tempRange={state.tempGeoRange}
        onTempRangeChange={(range) => dispatch({ type: "SET_TEMP_GEO_RANGE", payload: range })}
        onApply={() => dispatch({ type: "APPLY_GEO_FILTER" })}
      />

      <WeakSpotFilter
        open={state.weakSpotOpen}
        onOpenChange={(open) => dispatch({ type: "SET_POPOVER_OPEN", payload: { name: "weakSpotOpen", value: open } })}
        tempHasWeakSpot={state.tempHasWeakSpot}
        tempWeakSpotTypes={state.tempWeakSpotTypes}
        onTempHasWeakSpotChange={(value) => dispatch({ type: "SET_TEMP_HAS_WEAK_SPOT", payload: value })}
        onToggleWeakSpotType={(type) => dispatch({ type: "TOGGLE_TEMP_WEAK_SPOT_TYPE", payload: type })}
        onApply={() => dispatch({ type: "APPLY_WEAK_SPOT_FILTER" })}
      />

      <SerpFilter
        open={state.serpOpen}
        onOpenChange={(open) => dispatch({ type: "SET_POPOVER_OPEN", payload: { name: "serpOpen", value: open } })}
        selectedFeatures={state.selectedSerpFeatures}
        tempSelectedFeatures={state.tempSelectedSerpFeatures}
        onToggleFeature={(feature) => dispatch({ type: "TOGGLE_TEMP_SERP_FEATURE", payload: feature })}
        onApply={() => dispatch({ type: "APPLY_SERP_FILTER" })}
      />

      <TrendFilter
        open={state.trendOpen}
        onOpenChange={(open) => dispatch({ type: "SET_POPOVER_OPEN", payload: { name: "trendOpen", value: open } })}
        tempTrendDirection={state.tempTrendDirection}
        tempMinGrowth={state.tempMinTrendGrowth}
        onTempTrendDirectionChange={(dir) => dispatch({ type: "SET_TEMP_TREND_DIRECTION", payload: dir })}
        onTempMinGrowthChange={(growth) => dispatch({ type: "SET_TEMP_MIN_TREND_GROWTH", payload: growth })}
        onApply={() => dispatch({ type: "APPLY_TREND_FILTER" })}
      />

      <IncludeExcludeFilter
        includeTerms={state.includeTerms}
        excludeTerms={state.excludeTerms}
        includeInput={state.includeInput}
        excludeInput={state.excludeInput}
        onIncludeInputChange={(value) => dispatch({ type: "SET_INCLUDE_INPUT", payload: value })}
        onExcludeInputChange={(value) => dispatch({ type: "SET_EXCLUDE_INPUT", payload: value })}
        onAddIncludeTerm={() => dispatch({ type: "ADD_INCLUDE_TERM" })}
        onAddExcludeTerm={() => dispatch({ type: "ADD_EXCLUDE_TERM" })}
        onRemoveIncludeTerm={(term) => dispatch({ type: "REMOVE_INCLUDE_TERM", payload: term })}
        onRemoveExcludeTerm={(term) => dispatch({ type: "REMOVE_EXCLUDE_TERM", payload: term })}
      />
    </div>
  )
}
