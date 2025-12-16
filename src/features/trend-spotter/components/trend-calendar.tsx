"use client"

import { useState, useMemo } from "react"
import { Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

import type { CalendarView, EventCategory, EventSource, IndustryNiche, SeasonalTrend } from "../types"
import { seasonalCalendar } from "../__mocks__"
import { 
  filterCalendarEvents, 
  orderCalendarFromCurrentMonth,
  calculateCalendarStats 
} from "../utils"
import { getCurrentDateInfo, calculateDaysUntil } from "../utils/date-utils"

import {
  CalendarHeader,
  CalendarFilters,
  CalendarFooter,
  MonthCard,
  EventItem,
} from "./calendar"

export function TrendCalendar() {
  const { currentMonth } = getCurrentDateInfo()
  
  // Calendar state
  const [calendarView, setCalendarView] = useState<CalendarView>("grid")
  const [selectedCategory, setSelectedCategory] = useState<EventCategory>("All")
  const [selectedSource, setSelectedSource] = useState<EventSource | "all">("all")
  const [selectedNiche, setSelectedNiche] = useState<IndustryNiche>("All")
  const [calendarSearch, setCalendarSearch] = useState("")
  const [showUpcomingOnly, setShowUpcomingOnly] = useState(false)
  const [expandedMonths, setExpandedMonths] = useState<Set<number>>(new Set([currentMonth]))
  const [visibleMonthsCount, setVisibleMonthsCount] = useState(4)

  // Filter events based on all criteria
  const filteredCalendar = useMemo(() => {
    return filterCalendarEvents(seasonalCalendar, {
      selectedCategory,
      selectedSource,
      selectedNiche,
      calendarSearch,
      showUpcomingOnly,
    })
  }, [selectedCategory, selectedSource, selectedNiche, calendarSearch, showUpcomingOnly])

  // Get months ordered from current month
  const orderedCalendar = useMemo(() => {
    return orderCalendarFromCurrentMonth(filteredCalendar, currentMonth, visibleMonthsCount)
  }, [filteredCalendar, currentMonth, visibleMonthsCount])

  // Count stats
  const { totalEvents, upcomingEvents } = useMemo(() => {
    return calculateCalendarStats(filteredCalendar)
  }, [filteredCalendar])

  // Toggle month expansion
  const toggleMonthExpand = (monthIndex: number) => {
    setExpandedMonths(prev => {
      const newSet = new Set(prev)
      if (newSet.has(monthIndex)) {
        newSet.delete(monthIndex)
      } else {
        newSet.add(monthIndex)
      }
      return newSet
    })
  }

  // Clear all filters
  const clearFilters = () => {
    setSelectedCategory("All")
    setSelectedSource("all")
    setSelectedNiche("All")
    setCalendarSearch("")
    setShowUpcomingOnly(false)
  }

  const hasActiveFilters = 
    selectedCategory !== "All" || 
    selectedSource !== "all" || 
    selectedNiche !== "All" || 
    calendarSearch.length > 0 || 
    showUpcomingOnly

  // Render list view events
  const listViewEvents = useMemo(() => {
    return orderedCalendar.flatMap(month => 
      month.events.map((event, idx) => {
        const daysUntil = calculateDaysUntil(
          month.monthIndex, 
          parseInt(event.exactDate.split("-")[1]), 
          month.year
        )
        return {
          event,
          month,
          idx,
          daysUntil,
        }
      })
    ).slice(0, 20)
  }, [orderedCalendar])

  const totalListEvents = orderedCalendar.flatMap(m => m.events).length

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        {/* Header Row */}
        <CalendarHeader
          totalEvents={totalEvents}
          upcomingEvents={upcomingEvents}
          calendarView={calendarView}
          showUpcomingOnly={showUpcomingOnly}
          onViewChange={setCalendarView}
          onToggleUpcoming={() => setShowUpcomingOnly(!showUpcomingOnly)}
        />

        {/* Filter Row */}
        <CalendarFilters
          calendarSearch={calendarSearch}
          selectedSource={selectedSource}
          selectedCategory={selectedCategory}
          selectedNiche={selectedNiche}
          hasActiveFilters={hasActiveFilters}
          onSearchChange={setCalendarSearch}
          onSourceChange={setSelectedSource}
          onCategoryChange={setSelectedCategory}
          onNicheChange={setSelectedNiche}
          onClearFilters={clearFilters}
        />
      </CardHeader>

      <CardContent className="pt-0">
        {/* No Results */}
        {orderedCalendar.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No events found for current filters</p>
            <Button
              variant="link"
              size="sm"
              onClick={clearFilters}
              className="text-purple-400 mt-2"
            >
              Clear filters
            </Button>
          </div>
        ) : calendarView === "grid" ? (
          /* Grid View */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {orderedCalendar.map((month) => (
              <MonthCard
                key={month.monthIndex}
                month={month}
                isCurrentMonth={month.monthIndex === currentMonth}
                isExpanded={expandedMonths.has(month.monthIndex)}
                onToggleExpand={() => toggleMonthExpand(month.monthIndex)}
              />
            ))}
          </div>
        ) : (
          /* List View */
          <div className="space-y-1">
            {listViewEvents.map(({ event, month, idx, daysUntil }) => (
              <EventItem
                key={`${month.monthIndex}-${idx}`}
                event={event}
                monthIndex={month.monthIndex}
                year={month.year}
                daysUntil={daysUntil}
                variant="list"
                monthName={month.month}
              />
            ))}
            
            {totalListEvents > 20 && (
              <p className="text-center text-[10px] text-muted-foreground py-2">
                Showing 20 of {totalListEvents} events
              </p>
            )}
          </div>
        )}

        {/* Load More Months */}
        {filteredCalendar.length > visibleMonthsCount && (
          <div className="mt-4 text-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setVisibleMonthsCount(prev => Math.min(prev + 4, 12))}
              className="h-8 text-xs"
            >
              Load More Months ({visibleMonthsCount}/{filteredCalendar.length})
            </Button>
          </div>
        )}
      </CardContent>

      {/* Footer */}
      <CalendarFooter />
    </Card>
  )
}
