"use client"

/**
 * Page Loading Component
 * ============================================
 * Used with Next.js Suspense for loading states
 * ============================================
 */

import { Loader2 } from "lucide-react"

interface PageLoadingProps {
  message?: string
  fullScreen?: boolean
}

export function PageLoading({ message = "Loading...", fullScreen = true }: PageLoadingProps) {
  const containerClass = fullScreen
    ? "fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50"
    : "flex items-center justify-center p-8"

  return (
    <div className={containerClass}>
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground animate-pulse">{message}</p>
      </div>
    </div>
  )
}

export function CardLoading() {
  return (
    <div className="rounded-lg border bg-card p-6 animate-pulse">
      <div className="h-4 w-1/3 bg-muted rounded mb-4" />
      <div className="space-y-2">
        <div className="h-3 w-full bg-muted rounded" />
        <div className="h-3 w-2/3 bg-muted rounded" />
      </div>
    </div>
  )
}

export function TableLoading({ rows = 5 }: { rows?: number }) {
  return (
    <div className="rounded-lg border animate-pulse">
      {/* Header */}
      <div className="border-b bg-muted/50 p-4">
        <div className="flex gap-4">
          <div className="h-4 w-1/4 bg-muted rounded" />
          <div className="h-4 w-1/4 bg-muted rounded" />
          <div className="h-4 w-1/4 bg-muted rounded" />
          <div className="h-4 w-1/4 bg-muted rounded" />
        </div>
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="border-b last:border-0 p-4">
          <div className="flex gap-4">
            <div className="h-4 w-1/4 bg-muted/50 rounded" />
            <div className="h-4 w-1/4 bg-muted/50 rounded" />
            <div className="h-4 w-1/4 bg-muted/50 rounded" />
            <div className="h-4 w-1/4 bg-muted/50 rounded" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function ChartLoading() {
  return (
    <div className="rounded-lg border bg-card p-6 animate-pulse">
      <div className="h-4 w-1/4 bg-muted rounded mb-4" />
      <div className="h-[200px] bg-muted/30 rounded flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted" />
      </div>
    </div>
  )
}

export function SidebarLoading() {
  return (
    <div className="w-64 border-r h-screen p-4 animate-pulse">
      <div className="h-8 w-32 bg-muted rounded mb-8" />
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-10 bg-muted/50 rounded" />
        ))}
      </div>
    </div>
  )
}

// Default export for Next.js loading.tsx
export default function Loading() {
  return <PageLoading />
}
