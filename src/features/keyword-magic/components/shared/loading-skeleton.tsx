"use client"

// ============================================
// LOADING SKELETON - Loading states
// ============================================

import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"

interface LoadingSkeletonProps {
  variant?: "table" | "cards" | "filters" | "header"
  rows?: number
  className?: string
}

export function LoadingSkeleton({
  variant = "table",
  rows = 10,
  className,
}: LoadingSkeletonProps) {
  if (variant === "header") {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <div className="flex gap-2">
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-24" />
          </div>
        </div>
        <Skeleton className="h-10 w-full max-w-xl" />
      </div>
    )
  }

  if (variant === "filters") {
    return (
      <div className={cn("flex gap-2", className)}>
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-24" />
        ))}
      </div>
    )
  }

  if (variant === "cards") {
    return (
      <div className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4", className)}>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="border border-border rounded-lg p-4 space-y-3">
            <Skeleton className="h-5 w-3/4" />
            <div className="flex gap-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-4 w-14" />
            </div>
            <Skeleton className="h-8 w-full" />
          </div>
        ))}
      </div>
    )
  }

  // Table variant (default)
  return (
    <div className={cn("space-y-1", className)}>
      {/* Header */}
      <div className="flex items-center gap-4 py-3 px-4 bg-muted/50 rounded-t-lg">
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 flex-1" />
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-12" />
        <Skeleton className="h-4 w-12" />
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-20" />
      </div>

      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 py-3 px-4 border-b border-border last:border-0"
        >
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-20" />
        </div>
      ))}
    </div>
  )
}

// Specialized skeletons
export function TableLoadingSkeleton({ rows = 10 }: { rows?: number }) {
  return <LoadingSkeleton variant="table" rows={rows} />
}

export function FilterLoadingSkeleton() {
  return <LoadingSkeleton variant="filters" />
}

export function HeaderLoadingSkeleton() {
  return <LoadingSkeleton variant="header" />
}
