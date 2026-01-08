"use client"

import { Skeleton } from "@/components/ui/skeleton"

export function RoadmapLoadingSkeleton() {
  return (
    <main className="flex-1 flex flex-col overflow-hidden bg-background -m-3 sm:-m-4 md:-m-6">
      {/* Header Skeleton */}
      <div className="sticky top-0 z-20 bg-card border-b border-border px-3 sm:px-4 md:px-6 py-3 sm:py-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-6 mb-3 sm:mb-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg" />
            <Skeleton className="h-6 w-40" />
          </div>
          <div className="flex items-center gap-2 sm:gap-2.5 md:gap-3">
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-32" />
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
          <Skeleton className="h-9 w-full sm:w-64" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-20" />
            <Skeleton className="h-9 w-20" />
          </div>
        </div>
      </div>

      {/* Content Skeleton - Kanban Columns */}
      <div className="flex-1 overflow-auto p-3 sm:p-4 md:p-6">
        <div className="flex gap-3 sm:gap-5 h-full pb-4">
          {[1, 2, 3, 4, 5].map((col) => (
            <div
              key={col}
              className="flex-shrink-0 w-[280px] sm:w-[300px] md:w-[320px] flex flex-col"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-5 rounded" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-5 w-6 rounded-full" />
                </div>
              </div>

              {/* Cards */}
              <div className="flex-1 space-y-2">
                {[1, 2, 3].map((card) => (
                  <div
                    key={card}
                    className="rounded-lg border border-border bg-card p-3 sm:p-4"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-5 w-5 rounded" />
                    </div>
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-2/3 mb-3" />
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-5 w-16 rounded-full" />
                      <Skeleton className="h-5 w-20 rounded-full" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
