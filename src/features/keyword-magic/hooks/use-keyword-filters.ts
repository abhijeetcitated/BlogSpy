"use client"

// ============================================
// KEYWORD MAGIC - Filter State Hook
// ============================================
// Manages filter state with temp + applied pattern
// ============================================

import { useState, useCallback, useMemo } from "react"
import {
  DEFAULT_VOLUME_RANGE,
  DEFAULT_KD_RANGE,
  DEFAULT_CPC_RANGE,
} from "../constants"

// ============================================
// TYPES
// ============================================

export interface UseKeywordFiltersReturn {
  // Filter values (applied)
  volumeRange: [number, number]
  kdRange: [number, number]
  cpcRange: [number, number]
  selectedIntents: string[]
  includeTerms: string[]
  excludeTerms: string[]
  
  // Temp values (before apply)
  tempVolumeRange: [number, number]
  tempKdRange: [number, number]
  tempCpcRange: [number, number]
  tempSelectedIntents: string[]
  
  // Setters for temp values
  setTempVolumeRange: (range: [number, number]) => void
  setTempKdRange: (range: [number, number]) => void
  setTempCpcRange: (range: [number, number]) => void
  toggleTempIntent: (intent: string) => void
  
  // Include/Exclude
  includeInput: string
  excludeInput: string
  setIncludeInput: (value: string) => void
  setExcludeInput: (value: string) => void
  addIncludeTerm: () => void
  addExcludeTerm: () => void
  removeIncludeTerm: (term: string) => void
  removeExcludeTerm: (term: string) => void
  
  // Apply handlers
  applyVolumeFilter: () => void
  applyKdFilter: () => void
  applyCpcFilter: () => void
  applyIntentFilter: () => void
  
  // Reset
  resetAllFilters: () => void
  
  // Active filter count
  activeFilterCount: number
  
  // Check if any filter is active
  hasActiveFilters: boolean
}

// ============================================
// HOOK
// ============================================

export function useKeywordFilters(): UseKeywordFiltersReturn {
  // Applied filter states
  const [volumeRange, setVolumeRange] = useState<[number, number]>(DEFAULT_VOLUME_RANGE)
  const [kdRange, setKdRange] = useState<[number, number]>(DEFAULT_KD_RANGE)
  const [cpcRange, setCpcRange] = useState<[number, number]>(DEFAULT_CPC_RANGE)
  const [selectedIntents, setSelectedIntents] = useState<string[]>([])
  const [includeTerms, setIncludeTerms] = useState<string[]>([])
  const [excludeTerms, setExcludeTerms] = useState<string[]>([])
  
  // Temp filter states (before apply)
  const [tempVolumeRange, setTempVolumeRange] = useState<[number, number]>(DEFAULT_VOLUME_RANGE)
  const [tempKdRange, setTempKdRange] = useState<[number, number]>(DEFAULT_KD_RANGE)
  const [tempCpcRange, setTempCpcRange] = useState<[number, number]>(DEFAULT_CPC_RANGE)
  const [tempSelectedIntents, setTempSelectedIntents] = useState<string[]>([])
  
  // Include/Exclude inputs
  const [includeInput, setIncludeInput] = useState("")
  const [excludeInput, setExcludeInput] = useState("")
  
  // Toggle intent in temp state
  const toggleTempIntent = useCallback((intent: string) => {
    setTempSelectedIntents((prev) =>
      prev.includes(intent)
        ? prev.filter((i) => i !== intent)
        : [...prev, intent]
    )
  }, [])
  
  // Add/Remove include terms
  const addIncludeTerm = useCallback(() => {
    const term = includeInput.trim()
    if (term && !includeTerms.includes(term)) {
      setIncludeTerms((prev) => [...prev, term])
      setIncludeInput("")
    }
  }, [includeInput, includeTerms])
  
  const removeIncludeTerm = useCallback((term: string) => {
    setIncludeTerms((prev) => prev.filter((t) => t !== term))
  }, [])
  
  // Add/Remove exclude terms
  const addExcludeTerm = useCallback(() => {
    const term = excludeInput.trim()
    if (term && !excludeTerms.includes(term)) {
      setExcludeTerms((prev) => [...prev, term])
      setExcludeInput("")
    }
  }, [excludeInput, excludeTerms])
  
  const removeExcludeTerm = useCallback((term: string) => {
    setExcludeTerms((prev) => prev.filter((t) => t !== term))
  }, [])
  
  // Apply filters
  const applyVolumeFilter = useCallback(() => {
    setVolumeRange(tempVolumeRange)
  }, [tempVolumeRange])
  
  const applyKdFilter = useCallback(() => {
    setKdRange(tempKdRange)
  }, [tempKdRange])
  
  const applyCpcFilter = useCallback(() => {
    setCpcRange(tempCpcRange)
  }, [tempCpcRange])
  
  const applyIntentFilter = useCallback(() => {
    setSelectedIntents(tempSelectedIntents)
  }, [tempSelectedIntents])
  
  // Reset all filters
  const resetAllFilters = useCallback(() => {
    setVolumeRange(DEFAULT_VOLUME_RANGE)
    setKdRange(DEFAULT_KD_RANGE)
    setCpcRange(DEFAULT_CPC_RANGE)
    setSelectedIntents([])
    setIncludeTerms([])
    setExcludeTerms([])
    setTempVolumeRange(DEFAULT_VOLUME_RANGE)
    setTempKdRange(DEFAULT_KD_RANGE)
    setTempCpcRange(DEFAULT_CPC_RANGE)
    setTempSelectedIntents([])
    setIncludeInput("")
    setExcludeInput("")
  }, [])
  
  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0
    if (volumeRange[0] !== DEFAULT_VOLUME_RANGE[0] || volumeRange[1] !== DEFAULT_VOLUME_RANGE[1]) count++
    if (kdRange[0] !== DEFAULT_KD_RANGE[0] || kdRange[1] !== DEFAULT_KD_RANGE[1]) count++
    if (cpcRange[0] !== DEFAULT_CPC_RANGE[0] || cpcRange[1] !== DEFAULT_CPC_RANGE[1]) count++
    if (selectedIntents.length > 0) count++
    if (includeTerms.length > 0) count++
    if (excludeTerms.length > 0) count++
    return count
  }, [volumeRange, kdRange, cpcRange, selectedIntents, includeTerms, excludeTerms])
  
  const hasActiveFilters = activeFilterCount > 0
  
  return {
    volumeRange,
    kdRange,
    cpcRange,
    selectedIntents,
    includeTerms,
    excludeTerms,
    tempVolumeRange,
    tempKdRange,
    tempCpcRange,
    tempSelectedIntents,
    setTempVolumeRange,
    setTempKdRange,
    setTempCpcRange,
    toggleTempIntent,
    includeInput,
    excludeInput,
    setIncludeInput,
    setExcludeInput,
    addIncludeTerm,
    addExcludeTerm,
    removeIncludeTerm,
    removeExcludeTerm,
    applyVolumeFilter,
    applyKdFilter,
    applyCpcFilter,
    applyIntentFilter,
    resetAllFilters,
    activeFilterCount,
    hasActiveFilters,
  }
}
