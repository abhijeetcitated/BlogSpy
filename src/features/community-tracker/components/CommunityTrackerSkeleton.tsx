"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

// Summary Cards Skeleton
export function CommunitySummaryCardsSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
      {Array(4).fill(null).map((_, i) => (
        <Card key={i} className="bg-card border-border">
          <CardContent className="p-3 sm:p-3 md:p-4">
            <div className="flex sm:block items-center gap-3 sm:gap-0">
              <Skeleton className="w-8 h-8 rounded-lg shrink-0 sm:mb-2" />
              <div className="flex-1 sm:flex-none space-y-1">
                <Skeleton className="h-6 w-12" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// Keyword Card Skeleton
export function CommunityKeywordCardSkeleton() {
  return (
    <Card className="bg-card border-border">
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>
          <Skeleton className="h-8 w-8 rounded" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Skeleton className="h-12 rounded-lg" />
          <Skeleton className="h-12 rounded-lg" />
        </div>
      </CardContent>
    </Card>
  )
}

// Keyword List Skeleton
export function CommunityKeywordListSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
      {Array(4).fill(null).map((_, i) => (
        <CommunityKeywordCardSkeleton key={i} />
      ))}
    </div>
  )
}

// Sidebar Skeleton
export function CommunitySidebarSkeleton() {
  return (
    <div className="space-y-4">
      {/* Credit Card Skeleton */}
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-5 rounded" />
          </div>
          <Skeleton className="h-8 w-20 mb-4" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </CardContent>
      </Card>
      
      {/* Tips Card Skeleton */}
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <Skeleton className="h-5 w-28 mb-3" />
          <div className="space-y-2">
            {Array(3).fill(null).map((_, i) => (
              <Skeleton key={i} className="h-4 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Full Page Skeleton
export function CommunityTrackerSkeleton() {
  return (
    <div className="min-h-full space-y-4 md:space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div className="space-y-1">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-56" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-32" />
        </div>
      </div>

      {/* Platform Tabs Skeleton */}
      <div className="flex gap-2">
        <Skeleton className="h-10 w-24 rounded-lg" />
        <Skeleton className="h-10 w-24 rounded-lg" />
      </div>

      {/* Summary Cards Skeleton */}
      <CommunitySummaryCardsSkeleton />

      {/* Main Content Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
        {/* Keywords List */}
        <div className="lg:col-span-3 space-y-3 sm:space-y-4">
          {/* Filter Bar Skeleton */}
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 flex-1 rounded-lg" />
            <Skeleton className="h-10 w-24 rounded-lg" />
          </div>
          
          {/* Keyword Cards */}
          <CommunityKeywordListSkeleton />
        </div>

        {/* Sidebar */}
        <CommunitySidebarSkeleton />
      </div>
    </div>
  )
}
