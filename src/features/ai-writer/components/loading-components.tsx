"use client"

// ============================================
// AI WRITER - Loading Components
// ============================================

import React from 'react'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import { AlertCircle, FileText, Loader2 } from 'lucide-react'

// ============================================
// SKELETON COMPONENTS
// ============================================

/**
 * Editor Skeleton - Loading state for TipTap editor
 */
export function EditorSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-4 p-4", className)}>
      {/* Toolbar skeleton */}
      <div className="flex gap-2 border-b border-border pb-3">
        {[...Array(8)].map((_, i) => (
          <Skeleton key={i} className="h-8 w-8" />
        ))}
        <div className="flex-1" />
        {[...Array(3)].map((_, i) => (
          <Skeleton key={`r-${i}`} className="h-8 w-8" />
        ))}
      </div>
      
      {/* Content skeleton */}
      <div className="space-y-4">
        {/* Title */}
        <Skeleton className="h-10 w-3/4" />
        
        {/* Paragraphs */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
        
        {/* Subheading */}
        <Skeleton className="h-7 w-1/2 mt-6" />
        
        {/* More paragraphs */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
        </div>
        
        {/* Image placeholder */}
        <Skeleton className="h-48 w-full mt-4" />
        
        {/* More content */}
        <div className="space-y-2 mt-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    </div>
  )
}

/**
 * Sidebar Skeleton - Loading state for right sidebar
 */
export function SidebarSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-6 p-4", className)}>
      {/* Score section */}
      <div className="space-y-3">
        <Skeleton className="h-5 w-24" />
        <div className="flex items-center justify-center">
          <Skeleton className="h-32 w-32 rounded-full" />
        </div>
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <Skeleton className="h-4 w-4 rounded-full" />
              <Skeleton className="h-3 flex-1" />
            </div>
          ))}
        </div>
      </div>
      
      {/* Stats section */}
      <div className="space-y-3">
        <Skeleton className="h-5 w-28" />
        <div className="grid grid-cols-2 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-1">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-6 w-12" />
            </div>
          ))}
        </div>
      </div>
      
      {/* Keywords section */}
      <div className="space-y-3">
        <Skeleton className="h-5 w-32" />
        <div className="flex flex-wrap gap-2">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-6 w-20" />
          ))}
        </div>
      </div>
    </div>
  )
}

/**
 * Competitors Skeleton - Loading state for competitor data
 */
export function CompetitorsSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-8 w-24" />
      </div>
      
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-3 border border-border rounded-lg">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
            <div className="text-right space-y-1">
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-3 w-8" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Draft List Skeleton - Loading state for draft list
 */
export function DraftListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-4 border border-border rounded-lg">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-1/3" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
          </div>
        </div>
      ))}
    </div>
  )
}

/**
 * Version History Skeleton
 */
export function VersionHistorySkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-2">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3 border border-border rounded-lg">
          <div className="flex flex-col items-center">
            <Skeleton className="h-6 w-6 rounded-full" />
            {i < count - 1 && <Skeleton className="h-8 w-0.5 mt-1" />}
          </div>
          <div className="flex-1 space-y-1">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="h-8 w-20" />
        </div>
      ))}
    </div>
  )
}

// ============================================
// LOADING STATES
// ============================================

/**
 * AI Writing Indicator - Shows when AI is generating content
 */
export function AIWritingIndicator({ 
  message = "AI is writing...",
  className 
}: { 
  message?: string
  className?: string 
}) {
  return (
    <div className={cn(
      "flex items-center gap-2 px-3 py-2 bg-primary/10 text-primary rounded-lg",
      className
    )}>
      <Loader2 className="h-4 w-4 animate-spin" />
      <span className="text-sm font-medium">{message}</span>
      <span className="flex gap-1">
        {[...Array(3)].map((_, i) => (
          <span 
            key={i} 
            className="h-1.5 w-1.5 bg-primary rounded-full animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </span>
    </div>
  )
}

/**
 * Saving Indicator - Shows when content is being saved
 */
export function SavingIndicator({ 
  isSaving,
  lastSaved,
  className 
}: { 
  isSaving: boolean
  lastSaved?: Date | null
  className?: string 
}) {
  return (
    <div className={cn("flex items-center gap-2 text-sm text-muted-foreground", className)}>
      {isSaving ? (
        <>
          <Loader2 className="h-3 w-3 animate-spin" />
          <span>Saving...</span>
        </>
      ) : lastSaved ? (
        <>
          <div className="h-2 w-2 bg-green-500 rounded-full" />
          <span>Saved {formatTimeAgo(lastSaved)}</span>
        </>
      ) : null}
    </div>
  )
}

/**
 * Credits Indicator - Shows remaining credits
 */
export function CreditsIndicator({ 
  remaining,
  total,
  className 
}: { 
  remaining: number
  total: number
  className?: string 
}) {
  const percentage = (remaining / total) * 100
  const isLow = percentage < 20
  
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="h-2 w-24 bg-muted rounded-full overflow-hidden">
        <div 
          className={cn(
            "h-full transition-all duration-300",
            isLow ? "bg-destructive" : "bg-primary"
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className={cn(
        "text-xs font-medium",
        isLow && "text-destructive"
      )}>
        {remaining}/{total}
      </span>
    </div>
  )
}

// ============================================
// ERROR & EMPTY STATES
// ============================================

/**
 * Error State
 */
export function ErrorState({ 
  title = "Something went wrong",
  message = "An error occurred. Please try again.",
  onRetry,
  className 
}: { 
  title?: string
  message?: string
  onRetry?: () => void
  className?: string 
}) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center p-8 text-center",
      className
    )}>
      <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
        <AlertCircle className="h-6 w-6 text-destructive" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground mb-4">{message}</p>
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

/**
 * Empty State - No drafts
 */
export function EmptyDraftsState({ 
  onCreateNew,
  className 
}: { 
  onCreateNew?: () => void
  className?: string 
}) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center p-8 text-center",
      className
    )}>
      <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
        <FileText className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-1">No drafts yet</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Create your first draft to get started
      </p>
      {onCreateNew && (
        <button
          onClick={onCreateNew}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          Create New Draft
        </button>
      )}
    </div>
  )
}

/**
 * Empty State - No versions
 */
export function EmptyVersionsState({ className }: { className?: string }) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center p-6 text-center",
      className
    )}>
      <p className="text-sm text-muted-foreground">
        No version history yet. Versions will be created as you write.
      </p>
    </div>
  )
}

/**
 * Insufficient Credits State
 */
export function InsufficientCreditsState({ 
  required,
  available,
  onUpgrade,
  className 
}: { 
  required: number
  available: number
  onUpgrade?: () => void
  className?: string 
}) {
  return (
    <div className={cn(
      "flex flex-col items-center p-6 bg-destructive/5 border border-destructive/20 rounded-lg text-center",
      className
    )}>
      <AlertCircle className="h-8 w-8 text-destructive mb-3" />
      <h3 className="font-semibold text-foreground mb-1">Insufficient Credits</h3>
      <p className="text-sm text-muted-foreground mb-3">
        This operation requires {required} credits. You have {available} credits remaining.
      </p>
      {onUpgrade && (
        <button
          onClick={onUpgrade}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          Upgrade Plan
        </button>
      )}
    </div>
  )
}

// ============================================
// PROGRESS INDICATORS
// ============================================

/**
 * Content Completion Progress
 */
export function CompletionProgress({ 
  percentage,
  label,
  className 
}: { 
  percentage: number
  label?: string
  className?: string 
}) {
  const getColor = () => {
    if (percentage >= 80) return "bg-green-500"
    if (percentage >= 50) return "bg-yellow-500"
    return "bg-orange-500"
  }

  return (
    <div className={cn("space-y-1", className)}>
      {label && (
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">{label}</span>
          <span className="font-medium">{percentage}%</span>
        </div>
      )}
      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
        <div 
          className={cn("h-full transition-all duration-500", getColor())}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  )
}

/**
 * SEO Score Circle
 */
export function SEOScoreCircle({ 
  score,
  size = 120,
  strokeWidth = 8,
  className 
}: { 
  score: number
  size?: number
  strokeWidth?: number
  className?: string 
}) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (score / 100) * circumference

  const getColor = () => {
    if (score >= 80) return "text-green-500"
    if (score >= 50) return "text-yellow-500"
    return "text-red-500"
  }

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={cn("transition-all duration-500", getColor())}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className={cn("text-2xl font-bold", getColor())}>{score}</span>
        <span className="text-xs text-muted-foreground">SEO Score</span>
      </div>
    </div>
  )
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)
  
  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}
