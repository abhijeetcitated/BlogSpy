/**
 * Social Keyword List Component
 * Grid layout for keyword cards with windowed rendering for performance
 */

"use client"

import { memo, useMemo, useState, useCallback, useRef, useEffect } from "react"
import { SocialKeywordCard } from "./SocialKeywordCard"
import { SOCIAL_TRACKER_DEFAULTS } from "../../constants"
import type { SocialKeyword, SocialPlatform } from "../../types"

// Threshold for enabling windowed rendering
const WINDOWING_THRESHOLD = SOCIAL_TRACKER_DEFAULTS.virtualizationThreshold
const INITIAL_VISIBLE_COUNT = 20
const LOAD_MORE_COUNT = 10

interface SocialKeywordListProps {
  keywords: SocialKeyword[]
  platform: SocialPlatform
  onDelete?: (keywordId: string) => void
  onViewDetails?: (keyword: SocialKeyword) => void
}

/**
 * Windowed Keyword List - Loads more items as user scrolls
 * Uses intersection observer for efficient loading
 */
const WindowedKeywordList = memo(function WindowedKeywordList({
  keywords,
  platform,
  onDelete,
  onViewDetails,
}: SocialKeywordListProps) {
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COUNT)
  const loadMoreRef = useRef<HTMLDivElement>(null)

  // Reset visible count when keywords change
  useEffect(() => {
    setVisibleCount(INITIAL_VISIBLE_COUNT)
  }, [keywords.length, platform])

  // Intersection observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && visibleCount < keywords.length) {
          setVisibleCount(prev => Math.min(prev + LOAD_MORE_COUNT, keywords.length))
        }
      },
      { threshold: 0.1 }
    )

    const current = loadMoreRef.current
    if (current) {
      observer.observe(current)
    }

    return () => {
      if (current) {
        observer.unobserve(current)
      }
    }
  }, [visibleCount, keywords.length])

  const visibleKeywords = useMemo(
    () => keywords.slice(0, visibleCount),
    [keywords, visibleCount]
  )

  const hasMore = visibleCount < keywords.length

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        {visibleKeywords.map((keyword) => (
          <SocialKeywordCard
            key={keyword.id}
            keyword={keyword}
            platform={platform}
            onDelete={onDelete}
            onViewDetails={onViewDetails}
          />
        ))}
      </div>
      
      {hasMore && (
        <div 
          ref={loadMoreRef} 
          className="flex items-center justify-center py-4"
        >
          <span className="text-sm text-muted-foreground">
            Loading more... ({visibleCount}/{keywords.length})
          </span>
        </div>
      )}
    </div>
  )
})

/**
 * Standard (non-windowed) Keyword List for small datasets
 */
const StandardKeywordList = memo(function StandardKeywordList({
  keywords,
  platform,
  onDelete,
  onViewDetails,
}: SocialKeywordListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
      {keywords.map((keyword) => (
        <SocialKeywordCard
          key={keyword.id}
          keyword={keyword}
          platform={platform}
          onDelete={onDelete}
          onViewDetails={onViewDetails}
        />
      ))}
    </div>
  )
})

/**
 * Social Keyword List - Automatically uses windowed rendering for large lists
 */
export const SocialKeywordList = memo(function SocialKeywordList({ 
  keywords, 
  platform,
  onDelete,
  onViewDetails,
}: SocialKeywordListProps) {
  // Memoize filtered keywords to avoid recalculating on every render
  const filteredKeywords = useMemo(() => 
    keywords.filter(k => k.platforms[platform]),
    [keywords, platform]
  )

  if (filteredKeywords.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p className="text-sm">No keywords found for this platform</p>
      </div>
    )
  }

  // Use windowed rendering for large lists
  if (filteredKeywords.length > WINDOWING_THRESHOLD) {
    return (
      <WindowedKeywordList
        keywords={filteredKeywords}
        platform={platform}
        onDelete={onDelete}
        onViewDetails={onViewDetails}
      />
    )
  }

  // Standard rendering for small lists
  return (
    <StandardKeywordList
      keywords={filteredKeywords}
      platform={platform}
      onDelete={onDelete}
      onViewDetails={onViewDetails}
    />
  )
})
