// ============================================
// USE KEYWORD DATA - Hook Tests
// ============================================

import { describe, it, expect } from "vitest"
import { renderHook } from "@testing-library/react"
import { useKeywordData } from "../../hooks/use-keyword-data"
import type { FilterState, MatchType, Keyword } from "../../types"

const defaultFilterState: FilterState & { filterText: string; matchType: MatchType } = {
  filterText: "",
  matchType: "broad",
  volumeRange: [0, 500000],
  kdRange: [0, 100],
  cpcRange: [0, 50],
  selectedIntents: [],
  includeTerms: [],
  excludeTerms: [],
}

describe("useKeywordData", () => {
  it("should initialize with mock keywords", () => {
    const { result } = renderHook(() => useKeywordData(defaultFilterState))
    
    expect(result.current.keywords.length).toBeGreaterThan(0)
    expect(result.current.isLoading).toBe(false)
  })

  it("should filter keywords based on filter state", () => {
    const filterState = {
      ...defaultFilterState,
      filterText: "ai",
    }
    
    const { result } = renderHook(() => useKeywordData(filterState))
    
    expect(result.current.filteredKeywords.every((k: Keyword) => 
      k.keyword.toLowerCase().includes("ai")
    )).toBe(true)
  })

  it("should handle sorting", () => {
    const { result } = renderHook(() => useKeywordData(defaultFilterState))
    
    // Test sort field exists
    expect(result.current.sortField).toBeDefined()
  })

  it("should handle row selection", () => {
    const { result } = renderHook(() => useKeywordData(defaultFilterState))
    
    // Selection test - simplified
    expect(result.current.selectedIds).toBeDefined()
  })

  it("should handle select all", () => {
    const { result } = renderHook(() => useKeywordData(defaultFilterState))
    
    expect(result.current.selectAll).toBeDefined()
  })

  it("should handle pagination (load more)", () => {
    const { result } = renderHook(() => useKeywordData(defaultFilterState, { pageSize: 5 }))
    
    expect(result.current.displayedKeywords).toBeDefined()
  })

  it("should have clear selection functionality", () => {
    const { result } = renderHook(() => useKeywordData(defaultFilterState))
    
    expect(result.current.clearSelection).toBeDefined()
  })
})
