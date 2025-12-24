"use client"

import { Skeleton } from "@/components/ui/skeleton"

// Header Skeleton
function HeaderSkeleton() {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <Skeleton className="h-8 w-48" />
        <div className="flex flex-wrap items-center gap-2">
          <Skeleton className="h-6 w-24 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      </div>
      <div className="flex items-center gap-2 lg:gap-3">
        <Skeleton className="h-9 w-28" />
        <Skeleton className="h-9 w-32" />
      </div>
    </div>
  )
}

// Metric Card Skeleton
function MetricCardSkeleton() {
  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Skeleton className="h-5 w-5 rounded" />
        <Skeleton className="h-4 w-24" />
      </div>
      <Skeleton className="h-32 w-full rounded-lg" />
      <div className="mt-3">
        <Skeleton className="h-8 w-full rounded-lg" />
      </div>
    </div>
  )
}

// Large Section Skeleton
function LargeSectionSkeleton() {
  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5 rounded" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      <Skeleton className="h-48 w-full rounded-lg" />
      <div className="mt-4 pt-3 border-t border-border">
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  )
}

// Search Trends Skeleton
function SearchTrendsSkeleton() {
  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5 rounded" />
          <Skeleton className="h-4 w-28" />
        </div>
        <Skeleton className="h-8 w-40 rounded-lg" />
      </div>
      <Skeleton className="h-28 w-full rounded-lg" />
      <Skeleton className="h-10 w-full rounded-lg mt-3" />
    </div>
  )
}

// SERP Table Skeleton
function SERPTableSkeleton() {
  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <Skeleton className="h-6 w-56 mb-4" />
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg">
            <Skeleton className="h-6 w-6 rounded-full shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/3" />
            </div>
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  )
}

// Main Skeleton Component
export function KeywordOverviewSkeleton() {
  return (
    <div className="flex-1 p-4 lg:p-6 space-y-4 lg:space-y-6 overflow-x-hidden animate-pulse">
      {/* Header */}
      <HeaderSkeleton />

      {/* Bento Grid - Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 lg:gap-4">
        <MetricCardSkeleton />
        <MetricCardSkeleton />
        <MetricCardSkeleton />
        <MetricCardSkeleton />
      </div>

      {/* Pixel Rank & RTV Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4">
        <LargeSectionSkeleton />
        <LargeSectionSkeleton />
      </div>

      {/* Search Trends Card */}
      <SearchTrendsSkeleton />

      {/* AI Overview Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 lg:gap-4">
        <div className="lg:col-span-2">
          <LargeSectionSkeleton />
        </div>
        <LargeSectionSkeleton />
      </div>

      {/* SERP Table */}
      <SERPTableSkeleton />
    </div>
  )
}

// Error State Component
export function KeywordOverviewError({ error, onRetry }: { error: string; onRetry?: () => void }) {
  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
          <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">Failed to load keyword data</h3>
        <p className="text-sm text-muted-foreground mb-4">{error}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  )
}
