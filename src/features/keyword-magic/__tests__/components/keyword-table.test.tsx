// ============================================
// KEYWORD TABLE - Component Tests
// ============================================
// Updated to match new KeywordTable component API

import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { KeywordTable } from "../../components/table/KeywordTable"
import type { Keyword } from "../../types"

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}))

const mockKeywords: Keyword[] = [
  {
    id: 1,
    keyword: "best ai tools",
    intent: ["C", "I"],
    volume: 50000,
    trend: [20, 30, 40, 50, 60, 70, 80, 90, 95, 98, 99, 100],
    weakSpot: { type: "reddit", rank: 7 },
    kd: 45,
    cpc: 3.5,
    serpFeatures: ["video", "featured_snippet"],
    geoScore: 75,
  },
  {
    id: 2,
    keyword: "ai writing tools",
    intent: ["T"],
    volume: 30000,
    trend: [50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50],
    weakSpot: { type: null },
    kd: 35,
    cpc: 2.8,
    serpFeatures: ["shopping"],
    geoScore: 85,
  },
]

describe("KeywordTable", () => {
  it("should render table with keywords", () => {
    render(<KeywordTable keywords={mockKeywords} />)
    
    expect(screen.getByText("best ai tools")).toBeDefined()
    expect(screen.getByText("ai writing tools")).toBeDefined()
  })

  it("should display volume formatted with commas", () => {
    render(<KeywordTable keywords={mockKeywords} />)
    
    expect(screen.getByText("50,000")).toBeDefined()
    expect(screen.getByText("30,000")).toBeDefined()
  })

  it("should display CPC with dollar sign", () => {
    render(<KeywordTable keywords={mockKeywords} />)
    
    expect(screen.getByText("$3.50")).toBeDefined()
    expect(screen.getByText("$2.80")).toBeDefined()
  })

  it("should handle row selection via checkbox", () => {
    render(<KeywordTable keywords={mockKeywords} />)
    
    const checkboxes = screen.getAllByRole("checkbox")
    // First checkbox (index 0) is select-all, index 1 is first row
    expect(checkboxes.length).toBeGreaterThan(1)
    
    fireEvent.click(checkboxes[1]) // First row checkbox
    expect((checkboxes[1] as HTMLInputElement).checked).toBe(true)
    
    fireEvent.click(checkboxes[1]) // Toggle off
    expect((checkboxes[1] as HTMLInputElement).checked).toBe(false)
  })

  it("should handle select all checkbox", () => {
    render(<KeywordTable keywords={mockKeywords} />)
    
    const checkboxes = screen.getAllByRole("checkbox")
    const selectAllCheckbox = checkboxes[0]
    
    fireEvent.click(selectAllCheckbox)
    
    // All row checkboxes should be checked
    checkboxes.slice(1).forEach((checkbox) => {
      expect((checkbox as HTMLInputElement).checked).toBe(true)
    })
  })

  it("should call onKeywordClick when row is clicked", () => {
    const onKeywordClick = vi.fn()
    render(<KeywordTable keywords={mockKeywords} onKeywordClick={onKeywordClick} />)
    
    // Click on a row (not on checkbox or button)
    const row = screen.getByText("best ai tools").closest("tr")
    if (row) {
      fireEvent.click(row)
      expect(onKeywordClick).toHaveBeenCalledWith(mockKeywords[0])
    }
  })

  it("should display empty state when no keywords", () => {
    render(<KeywordTable keywords={[]} />)
    
    expect(screen.getByText("No keywords to display")).toBeDefined()
  })

  it("should show load more footer when hasMore", () => {
    // With more than 50 keywords, should show load more
    const manyKeywords = Array.from({ length: 60 }, (_, i) => ({
      ...mockKeywords[0],
      id: i + 1,
      keyword: `keyword ${i + 1}`,
    }))
    
    render(<KeywordTable keywords={manyKeywords} />)
    
    // Footer should show load more button since we have more than displayedCount
    expect(screen.getByText(/load more/i)).toBeDefined()
  })
})
