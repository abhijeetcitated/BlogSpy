// ============================================
// AGENTIC SUGGESTIONS - AI Agent Cards
// ============================================

"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Bot,
  Sparkles,
  RefreshCw,
  XCircle,
  ArrowUpRight,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { AgenticSuggestion } from "./command-center-data"

interface AgenticSuggestionsProps {
  suggestions: AgenticSuggestion[]
}

export function AgenticSuggestions({ suggestions }: AgenticSuggestionsProps) {
  const [dismissedSuggestions, setDismissedSuggestions] = useState<number[]>([])
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [shuffledOrder, setShuffledOrder] = useState<number[]>([])
  const [lastRefreshTime, setLastRefreshTime] = useState<Date | null>(null)

  // Shuffle function for randomizing order
  const shuffleArray = (array: AgenticSuggestion[]) => {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }

  // Get active suggestions (not dismissed)
  const activeSuggestions = suggestions.filter(s => !dismissedSuggestions.includes(s.id))
  
  // Apply shuffle order if exists, otherwise use original order
  const orderedSuggestions = shuffledOrder.length > 0 
    ? shuffledOrder.map(id => activeSuggestions.find(s => s.id === id)).filter(Boolean) as AgenticSuggestion[]
    : activeSuggestions
  
  // Show 4 by default, all when expanded
  const visibleSuggestions = isExpanded ? orderedSuggestions : orderedSuggestions.slice(0, 4)
  const hiddenCount = orderedSuggestions.length - 4

  const handleDismiss = (id: number) => {
    setDismissedSuggestions(prev => [...prev, id])
    // Also remove from shuffled order
    setShuffledOrder(prev => prev.filter(sId => sId !== id))
  }

  const handleRefresh = () => {
    setIsRefreshing(true)
    
    // Simulate API call with realistic delay
    setTimeout(() => {
      // Reset all dismissed suggestions
      setDismissedSuggestions([])
      
      // Shuffle suggestions to show "new" order
      const shuffled = shuffleArray(suggestions)
      setShuffledOrder(shuffled.map(s => s.id))
      
      // Collapse to show fresh 4 cards
      setIsExpanded(false)
      
      // Update last refresh time
      setLastRefreshTime(new Date())
      
      setIsRefreshing(false)
    }, 1200)
  }

  const toggleExpanded = () => {
    setIsExpanded(prev => !prev)
  }
  
  // Format last refresh time
  const getRefreshText = () => {
    if (isRefreshing) return 'Analyzing...'
    if (lastRefreshTime) {
      const seconds = Math.floor((new Date().getTime() - lastRefreshTime.getTime()) / 1000)
      if (seconds < 60) return 'Just now'
    }
    return 'Refresh'
  }

  return (
    <Card className="bg-gradient-to-br from-card via-card to-violet-950/10 border-violet-500/20 backdrop-blur-sm relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-violet-500/5 via-transparent to-purple-500/5" />
      <CardContent className="p-4 sm:p-6 relative">
        <div className="space-y-3 sm:space-y-4">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 rounded-lg bg-gradient-to-br from-violet-500/20 to-purple-500/20 border border-violet-500/30">
                <Bot className="h-4 w-4 sm:h-5 sm:w-5 text-violet-400" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                  <h2 className="text-base sm:text-lg font-semibold text-foreground">AI Suggestions</h2>
                  <Badge className="bg-violet-500/10 text-violet-400 border-violet-500/20 text-[10px] sm:text-xs px-1.5">
                    <Sparkles className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5 sm:mr-1" />
                    {activeSuggestions.length}
                  </Badge>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">
                  Personalized actions to improve your SEO
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="border-violet-500/30 text-violet-400 hover:bg-violet-500/10 hover:text-violet-300 h-8 text-xs self-end sm:self-auto"
            >
              <RefreshCw className={`h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              {getRefreshText()}
            </Button>
          </div>

          {/* Suggestions Grid */}
          {activeSuggestions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              {visibleSuggestions.map((suggestion) => (
                <SuggestionCard
                  key={suggestion.id}
                  suggestion={suggestion}
                  onDismiss={handleDismiss}
                />
              ))}
            </div>
          ) : (
            <EmptyState />
          )}

          {/* View All / Collapse Button */}
          {hiddenCount > 0 && (
            <div className="flex justify-center pt-1 sm:pt-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={toggleExpanded}
                className="text-violet-400 hover:text-violet-300 hover:bg-violet-500/10 text-xs sm:text-sm h-8 gap-1"
              >
                {isExpanded ? (
                  <>
                    Show less
                    <ChevronUp className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </>
                ) : (
                  <>
                    View all {activeSuggestions.length} suggestions
                    <ChevronDown className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// ============================================
// SUGGESTION CARD
// ============================================

interface SuggestionCardProps {
  suggestion: AgenticSuggestion
  onDismiss: (id: number) => void
}

function SuggestionCard({ suggestion, onDismiss }: SuggestionCardProps) {
  return (
    <div
      className={`relative p-3 sm:p-4 rounded-lg sm:rounded-xl bg-gradient-to-br ${suggestion.bgColor} border ${suggestion.borderColor} transition-all duration-300 group`}
    >
      {/* Priority Badge */}
      {suggestion.priority === 'high' && (
        <Badge className="absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2 bg-red-500/80 text-white border-0 text-[10px] sm:text-xs px-1.5">
          High
        </Badge>
      )}

      <div className="space-y-2 sm:space-y-3">
        {/* Header Row */}
        <div className="flex items-start justify-between gap-2 sm:gap-3">
          <div className="flex items-start gap-2 sm:gap-3 min-w-0 flex-1">
            <div className={`p-1.5 sm:p-2 rounded-lg bg-background/50 ${suggestion.iconColor} shrink-0`}>
              <suggestion.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
            <div className="space-y-0.5 sm:space-y-1 min-w-0">
              <h3 className="text-xs sm:text-sm font-medium text-foreground leading-tight line-clamp-2">
                {suggestion.title}
              </h3>
              <p className="text-[10px] sm:text-xs text-muted-foreground">
                {suggestion.timeAgo}
              </p>
            </div>
          </div>
          <button
            onClick={() => onDismiss(suggestion.id)}
            className="p-1 rounded-full hover:bg-background/50 text-muted-foreground hover:text-foreground transition-colors sm:opacity-0 sm:group-hover:opacity-100 shrink-0"
            title="Dismiss"
          >
            <XCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </button>
        </div>

        {/* Description */}
        <p className="text-[10px] sm:text-xs text-muted-foreground leading-relaxed line-clamp-2">
          {suggestion.description}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between pt-1 sm:pt-2">
          <div className="flex items-center gap-1 sm:gap-1.5">
            <ArrowUpRight className={`h-3 w-3 sm:h-3.5 sm:w-3.5 ${suggestion.impactColor}`} />
            <span className={`text-[10px] sm:text-xs font-medium ${suggestion.impactColor}`}>
              {suggestion.impact}
            </span>
          </div>
          <Button
            asChild
            size="sm"
            className="h-6 sm:h-7 text-[10px] sm:text-xs px-2 sm:px-3 bg-background/50 hover:bg-background/80 text-foreground border-0"
          >
            <Link href={suggestion.actionHref}>
              {suggestion.action}
              <ChevronRight className="h-2.5 w-2.5 sm:h-3 sm:w-3 ml-0.5 sm:ml-1" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

// ============================================
// EMPTY STATE
// ============================================

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <CheckCircle2 className="h-12 w-12 text-emerald-400 mb-3" />
      <h3 className="text-lg font-medium text-foreground">All caught up!</h3>
      <p className="text-sm text-muted-foreground mt-1">
        No pending suggestions. Click refresh to scan for new opportunities.
      </p>
    </div>
  )
}
