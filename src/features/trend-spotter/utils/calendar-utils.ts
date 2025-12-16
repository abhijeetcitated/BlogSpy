import type { 
  SeasonalTrend, 
  EventCategory, 
  EventSource, 
  IndustryNiche 
} from "../types"
import { nicheToCategories } from "../constants"
import { calculateDaysUntil } from "./date-utils"

export interface CalendarFilterOptions {
  selectedCategory: EventCategory
  selectedSource: EventSource | "all"
  selectedNiche: IndustryNiche
  calendarSearch: string
  showUpcomingOnly: boolean
}

/**
 * Filter calendar events based on multiple criteria
 */
export function filterCalendarEvents(
  calendar: SeasonalTrend[],
  options: CalendarFilterOptions
): SeasonalTrend[] {
  const { 
    selectedCategory, 
    selectedSource, 
    selectedNiche, 
    calendarSearch, 
    showUpcomingOnly 
  } = options

  return calendar.map(month => ({
    ...month,
    events: month.events.filter(event => {
      // Category filter
      if (selectedCategory !== "All" && event.category !== selectedCategory) {
        return false
      }
      
      // Source filter
      if (selectedSource !== "all" && event.source !== selectedSource) {
        return false
      }
      
      // Niche/Industry filter
      if (selectedNiche !== "All" && nicheToCategories[selectedNiche]?.length > 0) {
        if (!nicheToCategories[selectedNiche].includes(event.category)) {
          return false
        }
      }
      
      // Search filter
      if (calendarSearch) {
        const searchLower = calendarSearch.toLowerCase()
        const matchesName = event.name.toLowerCase().includes(searchLower)
        const matchesKeyword = event.keyword.toLowerCase().includes(searchLower)
        if (!matchesName && !matchesKeyword) {
          return false
        }
      }
      
      // Upcoming only filter
      if (showUpcomingOnly) {
        const day = parseInt(event.exactDate.split("-")[1])
        const daysUntil = calculateDaysUntil(month.monthIndex, day, month.year)
        if (daysUntil < 0) {
          return false
        }
      }
      
      return true
    })
  })).filter(month => month.events.length > 0) // Remove empty months
}

/**
 * Order calendar starting from current month
 */
export function orderCalendarFromCurrentMonth(
  calendar: SeasonalTrend[],
  currentMonth: number,
  visibleCount: number
): SeasonalTrend[] {
  const fromCurrentMonth = calendar.filter(m => m.monthIndex >= currentMonth)
  const beforeCurrentMonth = calendar.filter(m => m.monthIndex < currentMonth)
  const reordered = [...fromCurrentMonth, ...beforeCurrentMonth]
  return reordered.slice(0, visibleCount)
}

/**
 * Calculate calendar statistics
 */
export function calculateCalendarStats(calendar: SeasonalTrend[]) {
  const totalEvents = calendar.reduce((acc, m) => acc + m.events.length, 0)
  
  const upcomingEvents = calendar.reduce((acc, m) => {
    return acc + m.events.filter(e => {
      const day = parseInt(e.exactDate.split("-")[1])
      const daysUntil = calculateDaysUntil(m.monthIndex, day, m.year)
      return daysUntil >= 0 && daysUntil <= 30
    }).length
  }, 0)

  return { totalEvents, upcomingEvents }
}
