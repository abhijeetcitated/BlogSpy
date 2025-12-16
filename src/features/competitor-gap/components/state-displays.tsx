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
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center max-w-md">
        <div className="mx-auto w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center mb-4">
          <Swords className="h-8 w-8 text-amber-400" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">
          Ready for Battle?
        </h3>
        <p className="text-sm text-muted-foreground mt-2">
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
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-12 w-12 text-amber-500 animate-spin mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-foreground">
          Analyzing Competitor Data...
        </h3>
        <p className="text-sm text-muted-foreground mt-2">
          Scanning keywords and comparing rankings
        </p>
      </div>
    </div>
  )
}
