"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { memo } from "react"

/**
 * Pinterest Card Skeleton - Shows pin-specific metrics placeholder
 */
export const PinterestCardSkeleton = memo(function PinterestCardSkeleton() {
  return (
    <Card className="bg-card border-border overflow-hidden">
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-36" />
              <Skeleton className="h-5 w-14 rounded-full" />
            </div>
            <div className="flex items-center gap-3">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-18" />
            </div>
            <div className="flex items-center gap-2 pt-1">
              <Skeleton className="h-6 w-20 rounded" />
              <Skeleton className="h-6 w-20 rounded" />
              <Skeleton className="h-6 w-20 rounded" />
            </div>
          </div>
          <Skeleton className="h-8 w-8 rounded" />
        </div>
      </CardContent>
    </Card>
  )
})

/**
 * Twitter/X Card Skeleton - Shows tweet-specific metrics placeholder
 */
export const TwitterCardSkeleton = memo(function TwitterCardSkeleton() {
  return (
    <Card className="bg-card border-border overflow-hidden">
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <div className="flex items-center gap-3">
              <Skeleton className="h-4 w-18" />
              <Skeleton className="h-4 w-22" />
              <Skeleton className="h-4 w-16" />
            </div>
            <div className="flex items-center gap-2 pt-1">
              <Skeleton className="h-6 w-18 rounded" />
              <Skeleton className="h-6 w-22 rounded" />
              <Skeleton className="h-6 w-18 rounded" />
            </div>
          </div>
          <Skeleton className="h-8 w-8 rounded" />
        </div>
      </CardContent>
    </Card>
  )
})

/**
 * Instagram Card Skeleton - Shows hashtag-specific metrics placeholder
 */
export const InstagramCardSkeleton = memo(function InstagramCardSkeleton() {
  return (
    <Card className="bg-card border-border overflow-hidden">
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-28" />
              <Skeleton className="h-5 w-18 rounded-full" />
            </div>
            <div className="flex items-center gap-3">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-24" />
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {Array(3).fill(null).map((_, i) => (
                <Skeleton key={i} className="h-6 w-16 rounded-full" />
              ))}
            </div>
          </div>
          <Skeleton className="h-8 w-8 rounded" />
        </div>
      </CardContent>
    </Card>
  )
})

/**
 * Platform-specific keyword card skeleton
 */
export const SocialKeywordCardSkeleton = memo(function SocialKeywordCardSkeleton({ 
  platform = 'pinterest' 
}: { 
  platform?: 'pinterest' | 'twitter' | 'instagram' 
}) {
  switch (platform) {
    case 'twitter':
      return <TwitterCardSkeleton />
    case 'instagram':
      return <InstagramCardSkeleton />
    default:
      return <PinterestCardSkeleton />
  }
})

/**
 * Sidebar Skeleton - For the right panel
 */
export const SocialTrackerSidebarSkeleton = memo(function SocialTrackerSidebarSkeleton() {
  return (
    <div className="space-y-4">
      {/* Trending Topics Card */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent className="space-y-2">
          {Array(5).fill(null).map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-12" />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Audience Insights Card */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-36" />
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
          <Skeleton className="h-24 w-full rounded" />
        </CardContent>
      </Card>

      {/* Quick Actions Card */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-28" />
        </CardHeader>
        <CardContent className="space-y-2">
          {Array(3).fill(null).map((_, i) => (
            <Skeleton key={i} className="h-9 w-full rounded" />
          ))}
        </CardContent>
      </Card>
    </div>
  )
})

/**
 * Header Skeleton - For page header
 */
export const SocialTrackerHeaderSkeleton = memo(function SocialTrackerHeaderSkeleton() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-lg" />
        <div className="space-y-1">
          <Skeleton className="h-6 w-36" />
          <Skeleton className="h-4 w-52" />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Skeleton className="h-9 w-28" />
        <Skeleton className="h-9 w-36" />
      </div>
    </div>
  )
})

/**
 * Platform Tabs Skeleton
 */
export const SocialPlatformTabsSkeleton = memo(function SocialPlatformTabsSkeleton() {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2">
      {Array(4).fill(null).map((_, i) => (
        <Skeleton key={i} className="h-9 w-24 rounded-lg shrink-0" />
      ))}
    </div>
  )
})

// Summary Cards Skeleton
export const SocialSummaryCardsSkeleton = memo(function SocialSummaryCardsSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
      {Array(6).fill(null).map((_, i) => (
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
})

// Keyword List Skeleton
export const SocialKeywordListSkeleton = memo(function SocialKeywordListSkeleton() {
  return (
    <div className="space-y-3">
      {Array(5).fill(null).map((_, i) => (
        <Card key={i} className="bg-card border-border">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
                <div className="flex items-center gap-4">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-8 rounded" />
                <Skeleton className="h-8 w-8 rounded" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
})

// Full Page Skeleton
export const SocialTrackerSkeleton = memo(function SocialTrackerSkeleton() {
  return (
    <div className="min-h-full space-y-4 md:space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div className="space-y-1">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-32" />
        </div>
      </div>

      {/* Summary Cards Skeleton */}
      <SocialSummaryCardsSkeleton />

      {/* Tabs Skeleton */}
      <div className="flex flex-col gap-3 md:gap-4">
        <Skeleton className="h-10 w-full sm:w-64" />
        <Skeleton className="h-10 w-full md:w-64" />
      </div>

      {/* Content Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="lg:col-span-2">
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <SocialKeywordListSkeleton />
            </CardContent>
          </Card>
        </div>
        <div className="space-y-4">
          {Array(4).fill(null).map((_, i) => (
            <Card key={i} className="bg-card border-border">
              <CardContent className="p-4">
                <Skeleton className="h-4 w-24 mb-3" />
                <div className="space-y-2">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
})
