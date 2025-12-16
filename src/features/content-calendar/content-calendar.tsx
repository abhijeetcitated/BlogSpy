"use client"

import { useState, useMemo } from "react"
import Link from "next/link"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

import { NicheSelector, EventCard, MyPlanSidebar } from "./components"
import { getEventsForNiche, mockCalendarEvents } from "./__mocks__"
import type { ContentNiche, MyPlanItem, CalendarEvent } from "./types"
import {
  ArrowLeftIcon,
  CalendarPlanIcon,
  SparklesIcon,
  FilterIcon,
} from "./components/icons"

export function ContentCalendar() {
  const [selectedNiche, setSelectedNiche] = useState<ContentNiche | "all">("all")
  const [myPlan, setMyPlan] = useState<MyPlanItem[]>([])
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null)
  const [showAllEvents, setShowAllEvents] = useState(false)

  // Get filtered events based on selected niche
  const filteredEvents = useMemo(() => {
    const events = selectedNiche === "all" 
      ? mockCalendarEvents 
      : getEventsForNiche(selectedNiche)
    
    // Sort by urgency (days until event)
    return events.sort((a: CalendarEvent, b: CalendarEvent) => a.daysUntil - b.daysUntil)
  }, [selectedNiche])

  // Show 5 events by default or all if showAllEvents is true
  const displayEvents: CalendarEvent[] = showAllEvents 
    ? filteredEvents 
    : filteredEvents.slice(0, 5)

  // Check if event is in my plan
  const isInPlan = (eventId: string) => {
    return myPlan.some(item => item.eventId === eventId)
  }

  // Add event to plan
  const addToPlan = (event: CalendarEvent) => {
    if (!isInPlan(event.id)) {
      setMyPlan(prev => [
        ...prev,
        {
          eventId: event.id,
          event,
          status: "not-started",
          addedAt: new Date()
        }
      ])
    }
  }

  // Remove from plan
  const removeFromPlan = (eventId: string) => {
    setMyPlan(prev => prev.filter(item => item.eventId !== eventId))
  }

  // Toggle expanded event
  const toggleExpand = (eventId: string) => {
    setExpandedEventId(prev => prev === eventId ? null : eventId)
  }

  return (
    <div className="min-h-full space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-500/10 shrink-0">
            <CalendarPlanIcon className="h-5 w-5 sm:h-6 sm:w-6 text-amber-500" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">Content Calendar</h1>
            <p className="text-xs sm:text-sm text-muted-foreground line-clamp-1 sm:line-clamp-none">
              Plan your content around trending events & seasons
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <Link href="/dashboard/research/trends">
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-1.5 sm:gap-2 border-border text-muted-foreground hover:text-foreground h-8 sm:h-9 text-xs sm:text-sm"
            >
              <ArrowLeftIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden xs:inline">Back to</span> Trends
            </Button>
          </Link>
          <Badge className="bg-linear-to-r from-purple-500/20 to-pink-500/20 text-purple-400 border-purple-500/30 px-2 sm:px-3 py-1 sm:py-1.5 font-semibold text-xs sm:text-sm">
            <SparklesIcon className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1 sm:mr-1.5" />
            {filteredEvents.length} <span className="hidden sm:inline">Opportunities</span>
          </Badge>
        </div>
      </div>

      {/* Niche Filter */}
      <Card className="bg-card border-border">
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-2 sm:mb-3">
            <FilterIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
            <span className="text-xs sm:text-sm font-medium text-muted-foreground">Filter by niche:</span>
          </div>
          <NicheSelector 
            selectedNiche={selectedNiche} 
            onSelect={setSelectedNiche} 
          />
        </CardContent>
      </Card>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Events Column - 2 cols on lg */}
        <div className="lg:col-span-2 space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between mb-1 sm:mb-2">
            <h2 className="text-base sm:text-lg font-semibold text-foreground">
              Upcoming Opportunities
            </h2>
            <span className="text-xs sm:text-sm text-muted-foreground">
              {displayEvents.length} of {filteredEvents.length}
            </span>
          </div>

          {displayEvents.length === 0 ? (
            <Card className="bg-card border-border p-8 sm:p-12 text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl bg-muted flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <CalendarPlanIcon className="h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground opacity-40" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">
                No events found
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
                No seasonal content opportunities found for this niche.
              </p>
            </Card>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {displayEvents.map((event: CalendarEvent) => (
                <EventCard
                  key={event.id}
                  event={event}
                  isExpanded={expandedEventId === event.id}
                  isInPlan={isInPlan(event.id)}
                  onToggleExpand={() => toggleExpand(event.id)}
                  onAddToPlan={() => addToPlan(event)}
                  onRemoveFromPlan={() => removeFromPlan(event.id)}
                />
              ))}
            </div>
          )}

          {filteredEvents.length > 5 && !showAllEvents && (
            <div className="text-center pt-3 sm:pt-4">
              <Button 
                variant="outline" 
                size="sm"
                className="gap-2 bg-card border-border text-foreground hover:bg-muted font-medium h-9 sm:h-10"
                onClick={() => setShowAllEvents(true)}
              >
                Load More Events
                <Badge className="bg-muted text-muted-foreground border-0 ml-1 text-xs">
                  +{filteredEvents.length - 5}
                </Badge>
              </Button>
            </div>
          )}

          {showAllEvents && filteredEvents.length > 5 && (
            <div className="text-center pt-3 sm:pt-4">
              <Button 
                variant="ghost" 
                size="sm"
                className="gap-2 text-muted-foreground hover:text-foreground"
                onClick={() => setShowAllEvents(false)}
              >
                Show Less
              </Button>
            </div>
          )}
        </div>

        {/* My Plan Sidebar - 1 col on lg, below content on mobile */}
        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-24">
            <MyPlanSidebar items={myPlan} onRemove={removeFromPlan} />
          </div>
        </div>
      </div>
    </div>
  )
}
