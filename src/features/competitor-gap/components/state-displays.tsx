"use client"

import { Swords, Loader2 } from "lucide-react"

// ============================================
// STATE DISPLAYS - Empty & Loading states
// ============================================

/**
 * Empty State - Shown before analysis
 */
export function EmptyState() {
  return (
    <div className="flex-1 flex items-center justify-center px-4 py-8 sm:py-0">
      <div className="text-center max-w-md">
        <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-amber-500/10 flex items-center justify-center mb-3 sm:mb-4">
          <Swords className="h-6 w-6 sm:h-8 sm:w-8 text-amber-400" />
        </div>
        <h3 className="text-base sm:text-lg font-semibold text-foreground">
          Ready for Battle?
        </h3>
        <p className="text-xs sm:text-sm text-muted-foreground mt-2">
          Enter your domain and at least one competitor above to discover
          keyword opportunities they're ranking for that you're missing.
        </p>
      </div>
    </div>
  )
}

/**
 * Loading State - Shown during analysis
 */
export function LoadingState() {
  return (
    <div className="flex-1 flex items-center justify-center px-4 py-8 sm:py-0">
      <div className="text-center">
        <Loader2 className="h-10 w-10 sm:h-12 sm:w-12 text-amber-500 animate-spin mx-auto mb-3 sm:mb-4" />
        <h3 className="text-base sm:text-lg font-semibold text-foreground">
          Analyzing Competitor Data...
        </h3>
        <p className="text-xs sm:text-sm text-muted-foreground mt-2">
          Scanning keywords and comparing rankings
        </p>
      </div>
    </div>
  )
}
