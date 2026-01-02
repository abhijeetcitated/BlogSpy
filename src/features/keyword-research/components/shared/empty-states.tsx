"use client"

// ============================================
// EMPTY STATES - No data/results states
// ============================================

import { Search, Sparkles, AlertCircle, Database } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface EmptyStateProps {
  type: "no-search" | "no-results" | "no-selection" | "error"
  title?: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

const defaultContent = {
  "no-search": {
    icon: Sparkles,
    title: "Ready to explore keywords",
    description: "Enter a seed keyword to discover opportunities",
  },
  "no-results": {
    icon: Search,
    title: "No keywords found",
    description: "Try adjusting your filters or search term",
  },
  "no-selection": {
    icon: Database,
    title: "No keywords selected",
    description: "Select keywords from the table to perform bulk actions",
  },
  error: {
    icon: AlertCircle,
    title: "Something went wrong",
    description: "We couldn't load the keywords. Please try again.",
  },
}

export function EmptyState({
  type,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  const content = defaultContent[type]
  const Icon = content.icon

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center py-12 px-4",
        className
      )}
    >
      <div className="rounded-full bg-muted/50 p-4 mb-4">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="font-medium text-foreground">{title || content.title}</h3>
      <p className="text-sm text-muted-foreground mt-1 max-w-sm">
        {description || content.description}
      </p>
      {action && (
        <Button variant="outline" size="sm" onClick={action.onClick} className="mt-4">
          {action.label}
        </Button>
      )}
    </div>
  )
}

// Preset empty states
export function NoSearchState({ onGetStarted }: { onGetStarted?: () => void }) {
  return (
    <EmptyState
      type="no-search"
      action={onGetStarted ? { label: "Get Started", onClick: onGetStarted } : undefined}
    />
  )
}

export function NoResultsState({ onClearFilters }: { onClearFilters?: () => void }) {
  return (
    <EmptyState
      type="no-results"
      action={onClearFilters ? { label: "Clear Filters", onClick: onClearFilters } : undefined}
    />
  )
}

export function ErrorState({ onRetry }: { onRetry?: () => void }) {
  return (
    <EmptyState
      type="error"
      action={onRetry ? { label: "Try Again", onClick: onRetry } : undefined}
    />
  )
}
