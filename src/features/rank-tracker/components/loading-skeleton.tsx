// ============================================
// RANK TRACKER - Loading Skeleton Component
// ============================================

"use client"

import { cn } from "@/lib/utils"

/**
 * Skeleton loading animation base component
 */
function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-muted",
        className
      )}
    />
  )
}

/**
 * Stats cards loading skeleton
 */
export function StatsCardsSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="p-4 rounded-xl border border-border bg-card"
        >
          <Skeleton className="h-4 w-20 mb-2" />
          <Skeleton className="h-8 w-16 mb-1" />
          <Skeleton className="h-3 w-24" />
        </div>
      ))}
    </div>
  )
}

/**
 * Winners/Losers cards loading skeleton
 */
export function WinnersLosersSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {[1, 2].map((card) => (
        <div
          key={card}
          className="p-4 rounded-xl border border-border bg-card"
        >
          <Skeleton className="h-5 w-32 mb-4" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-12" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

/**
 * Table loading skeleton
 */
export function TableSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* Header */}
      <div className="border-b border-border px-4 py-3 flex gap-4">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-20" />
      </div>
      {/* Rows */}
      {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <div
          key={i}
          className="border-b border-border last:border-0 px-4 py-3 flex items-center gap-4"
        >
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-6 w-10 rounded-full" />
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-6 w-16 rounded-md" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-5 w-16 rounded" />
        </div>
      ))}
    </div>
  )
}

/**
 * Full page loading skeleton
 */
export function RankTrackerSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-24 rounded-lg" />
          <Skeleton className="h-9 w-32 rounded-lg" />
        </div>
      </div>

      {/* Platform Tabs */}
      <Skeleton className="h-12 w-full max-w-md rounded-lg" />

      {/* Stats Cards */}
      <StatsCardsSkeleton />

      {/* Winners/Losers */}
      <WinnersLosersSkeleton />

      {/* Filter Bar */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-8 w-16 rounded-lg" />
          ))}
        </div>
        <Skeleton className="h-8 w-48 rounded-lg" />
      </div>

      {/* Table */}
      <TableSkeleton />
    </div>
  )
}
