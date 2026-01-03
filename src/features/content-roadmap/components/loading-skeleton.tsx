"use client"

// ============================================
// Loading Skeleton Components
// ============================================

import { cn } from "@/lib/utils"

interface SkeletonProps {
  className?: string
}

function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-muted",
        className
      )}
    />
  )
}

// Task Card Skeleton
export function TaskCardSkeleton() {
  return (
    <div className="bg-card border border-border rounded-xl p-3 space-y-3">
      {/* Title */}
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      
      {/* Keyword badge */}
      <Skeleton className="h-5 w-24 rounded-md" />
      
      {/* Tags */}
      <div className="flex gap-1">
        <Skeleton className="h-4 w-14 rounded-md" />
        <Skeleton className="h-4 w-16 rounded-md" />
      </div>
      
      {/* Metrics */}
      <div className="flex gap-3">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-16" />
      </div>
      
      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-border">
        <Skeleton className="h-6 w-6 rounded-full" />
        <Skeleton className="h-4 w-20" />
      </div>
    </div>
  )
}

// Kanban Column Skeleton
export function KanbanColumnSkeleton() {
  return (
    <div className="shrink-0 w-[320px] bg-muted/30 rounded-xl border border-border p-3">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5 rounded" />
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-5 w-6 rounded-full" />
        </div>
        <Skeleton className="h-7 w-7 rounded" />
      </div>
      
      {/* Cards */}
      <div className="space-y-3">
        <TaskCardSkeleton />
        <TaskCardSkeleton />
        <TaskCardSkeleton />
      </div>
    </div>
  )
}

// Board View Skeleton (4 columns)
export function BoardViewSkeleton() {
  return (
    <div className="flex gap-5 h-full pb-4">
      <KanbanColumnSkeleton />
      <KanbanColumnSkeleton />
      <KanbanColumnSkeleton />
      <KanbanColumnSkeleton />
    </div>
  )
}

// List View Skeleton
export function ListViewSkeleton() {
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      {/* Header */}
      <div className="grid grid-cols-7 gap-4 px-4 py-3 border-b border-border bg-muted/30">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-14" />
        <Skeleton className="h-4 w-10" />
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-14" />
        <Skeleton className="h-4 w-12" />
      </div>
      
      {/* Rows */}
      {[...Array(8)].map((_, i) => (
        <div key={i} className="grid grid-cols-7 gap-4 px-4 py-3 border-b border-border">
          <div className="col-span-2">
            <Skeleton className="h-4 w-full mb-1" />
            <Skeleton className="h-3 w-3/4" />
          </div>
          <Skeleton className="h-5 w-20 rounded-md" />
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-10" />
          <Skeleton className="h-6 w-6 rounded-full" />
          <Skeleton className="h-7 w-20 rounded-md" />
        </div>
      ))}
    </div>
  )
}

// Calendar View Skeleton
export function CalendarViewSkeleton() {
  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
        <div className="flex items-center gap-4">
          <Skeleton className="h-5 w-5" />
          <Skeleton className="h-6 w-32" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-16 rounded" />
          <Skeleton className="h-8 w-8 rounded" />
          <Skeleton className="h-8 w-8 rounded" />
        </div>
      </div>
      
      {/* Weekday Headers */}
      <div className="grid grid-cols-7 border-b border-border">
        {[...Array(7)].map((_, i) => (
          <div key={i} className="py-2 flex justify-center">
            <Skeleton className="h-4 w-8" />
          </div>
        ))}
      </div>
      
      {/* Calendar Grid */}
      <div className="grid grid-cols-7">
        {[...Array(35)].map((_, i) => (
          <div key={i} className="min-h-[120px] p-2 border-b border-r border-border">
            <Skeleton className="h-4 w-6 mb-2" />
            {i % 5 === 0 && <Skeleton className="h-8 w-full rounded mb-1" />}
            {i % 7 === 0 && <Skeleton className="h-8 w-full rounded" />}
          </div>
        ))}
      </div>
    </div>
  )
}

// Full Page Loading State
export function RoadmapLoadingSkeleton() {
  return (
    <main className="flex-1 flex flex-col overflow-hidden bg-background">
      {/* Header Skeleton */}
      <div className="sticky top-0 z-20 bg-card border-b border-border px-6 py-4">
        <div className="flex items-center justify-between gap-6 mb-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <Skeleton className="h-6 w-40" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-24 rounded" />
            <Skeleton className="h-9 w-28 rounded" />
          </div>
        </div>
        <div className="flex items-center justify-between gap-4">
          <Skeleton className="h-9 w-56 rounded-lg" />
          <Skeleton className="h-9 w-64 rounded-lg" />
          <div className="flex items-center gap-3">
            <Skeleton className="h-9 w-24 rounded-lg" />
            <Skeleton className="h-9 w-20 rounded-lg" />
            <Skeleton className="h-8 w-40 rounded-lg" />
          </div>
        </div>
      </div>
      
      {/* Content Skeleton */}
      <div className="flex-1 overflow-auto p-6">
        <BoardViewSkeleton />
      </div>
    </main>
  )
}

// Error State Component
interface ErrorStateProps {
  error: string
  onRetry?: () => void
}

export function ErrorState({ error, onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-64 bg-card border border-border rounded-xl p-8">
      <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
        <svg
          className="w-6 h-6 text-red-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">Something went wrong</h3>
      <p className="text-sm text-muted-foreground text-center mb-4">{error}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          Try Again
        </button>
      )}
    </div>
  )
}

// Empty State Component
interface EmptyStateProps {
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
}

export function EmptyState({ title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-64 bg-card border border-border rounded-xl p-8 border-dashed">
      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
        <svg
          className="w-6 h-6 text-muted-foreground"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground text-center mb-4">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-4 py-2 bg-linear-to-r from-emerald-500 to-teal-500 text-white rounded-lg text-sm font-medium hover:from-emerald-400 hover:to-teal-400 transition-all shadow-lg shadow-emerald-500/25"
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}
