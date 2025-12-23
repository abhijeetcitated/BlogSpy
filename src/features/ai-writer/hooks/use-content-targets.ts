// ============================================
// AI WRITER - CONTENT TARGETS HOOK
// ============================================
// Feature #5 & #6: Hook for managing content
// targets with real-time updates
// ============================================

'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import type { ContentTargets } from '../types/content-targets.types'
import { DEFAULT_CONTENT_TARGETS } from '../types/content-targets.types'
import {
  generateTargetsFromCompetitors,
  generateTargetsFromKeyword,
  updateTargetsWithCurrent,
  getAllTargetProgress
} from '../utils/content-targets'

// ============================================
// TYPES
// ============================================

interface UseContentTargetsOptions {
  /** Initial targets (optional) */
  initialTargets?: Partial<ContentTargets>
  /** Target keyword for generating targets */
  targetKeyword?: string
  /** Search intent */
  intent?: 'informational' | 'commercial' | 'transactional' | 'navigational'
  /** Competitor data for generating targets */
  competitors?: {
    wordCount: number
    h1Count: number
    h2Count: number
    h3Count: number
    imageCount: number
    internalLinks: number
    externalLinks: number
  }[]
  /** Current domain for link analysis */
  currentDomain?: string
  /** Debounce delay for content updates */
  debounceMs?: number
  /** Auto-update targets when content changes */
  autoUpdate?: boolean
}

interface UseContentTargetsReturn {
  // State
  targets: ContentTargets
  progress: ReturnType<typeof getAllTargetProgress>
  isAnalyzing: boolean
  
  // Actions
  updateFromContent: (html: string) => void
  setTargets: (targets: Partial<ContentTargets>) => void
  regenerateFromKeyword: (keyword: string, intent?: UseContentTargetsOptions['intent']) => void
  regenerateFromCompetitors: (competitors: UseContentTargetsOptions['competitors']) => void
  reset: () => void
  
  // Derived
  overallScore: number
  missingTargets: string[]
}

// ============================================
// DEBOUNCE HELPER
// ============================================

function useDebouncedCallback<T extends (...args: Parameters<T>) => void>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const callbackRef = useRef(callback)
  
  useEffect(() => {
    callbackRef.current = callback
  }, [callback])
  
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])
  
  return useCallback(
    ((...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args)
      }, delay)
    }) as T,
    [delay]
  )
}

// ============================================
// MAIN HOOK
// ============================================

export function useContentTargets(
  options: UseContentTargetsOptions = {}
): UseContentTargetsReturn {
  const {
    initialTargets,
    targetKeyword,
    intent,
    competitors,
    currentDomain,
    debounceMs = 300,
    autoUpdate = true
  } = options

  // State
  const [targets, setTargetsState] = useState<ContentTargets>(() => {
    // Initialize with provided targets or generate from keyword/competitors
    let baseTargets = { ...DEFAULT_CONTENT_TARGETS }
    
    if (competitors && competitors.length > 0) {
      const competitorTargets = generateTargetsFromCompetitors(competitors)
      baseTargets = { ...baseTargets, ...competitorTargets } as ContentTargets
    } else if (targetKeyword) {
      const keywordTargets = generateTargetsFromKeyword(targetKeyword, intent)
      baseTargets = { ...baseTargets, ...keywordTargets } as ContentTargets
    }
    
    if (initialTargets) {
      baseTargets = { ...baseTargets, ...initialTargets } as ContentTargets
    }
    
    return baseTargets
  })
  
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  // Calculate progress
  const progress = useMemo(() => getAllTargetProgress(targets), [targets])

  // Calculate overall score (0-100)
  const overallScore = useMemo(() => {
    return progress.overall.percentage
  }, [progress])

  // Get list of missing/under targets
  const missingTargets = useMemo(() => {
    const missing: string[] = []
    
    if (progress.wordCount.status === 'under') {
      missing.push(`Word count (${targets.wordCount.current}/${targets.wordCount.min} min)`)
    }
    if (progress.h1.status === 'under') {
      missing.push('H1 heading')
    }
    if (progress.h2.status === 'under') {
      missing.push(`H2 headings (${targets.headings.h2.current}/${targets.headings.h2.min} min)`)
    }
    if (progress.h3.status === 'under') {
      missing.push(`H3 headings (${targets.headings.h3.current}/${targets.headings.h3.min} min)`)
    }
    if (progress.images.status === 'under') {
      missing.push(`Images (${targets.images.current}/${targets.images.min} min)`)
    }
    if (progress.internalLinks.status === 'under') {
      missing.push(`Internal links (${targets.links.internal.current}/${targets.links.internal.min} min)`)
    }
    if (progress.externalLinks.status === 'under') {
      missing.push(`External links (${targets.links.external.current}/${targets.links.external.min} min)`)
    }
    
    return missing
  }, [progress, targets])

  // Update from content
  const performUpdate = useCallback((html: string) => {
    setIsAnalyzing(true)
    
    try {
      const updated = updateTargetsWithCurrent(targets, html, currentDomain)
      setTargetsState(updated)
    } finally {
      setIsAnalyzing(false)
    }
  }, [targets, currentDomain])

  // Debounced version
  const updateFromContent = useDebouncedCallback(performUpdate, debounceMs)

  // Set targets manually
  const setTargets = useCallback((newTargets: Partial<ContentTargets>) => {
    setTargetsState(prev => ({
      ...prev,
      ...newTargets,
      lastUpdated: new Date()
    } as ContentTargets))
  }, [])

  // Regenerate from keyword
  const regenerateFromKeyword = useCallback((
    keyword: string,
    newIntent?: UseContentTargetsOptions['intent']
  ) => {
    const keywordTargets = generateTargetsFromKeyword(keyword, newIntent)
    setTargetsState(prev => ({
      ...prev,
      ...keywordTargets,
      // Preserve current counts
      wordCount: {
        ...(keywordTargets.wordCount || prev.wordCount),
        current: prev.wordCount.current
      },
      headings: {
        h1: { ...(keywordTargets.headings?.h1 || prev.headings.h1), current: prev.headings.h1.current },
        h2: { ...(keywordTargets.headings?.h2 || prev.headings.h2), current: prev.headings.h2.current },
        h3: { ...(keywordTargets.headings?.h3 || prev.headings.h3), current: prev.headings.h3.current }
      },
      lastUpdated: new Date()
    } as ContentTargets))
  }, [])

  // Regenerate from competitors
  const regenerateFromCompetitors = useCallback((
    newCompetitors: UseContentTargetsOptions['competitors']
  ) => {
    if (!newCompetitors || newCompetitors.length === 0) return
    
    const competitorTargets = generateTargetsFromCompetitors(newCompetitors)
    setTargetsState(prev => ({
      ...prev,
      ...competitorTargets,
      // Preserve current counts
      wordCount: {
        ...(competitorTargets.wordCount || prev.wordCount),
        current: prev.wordCount.current
      },
      headings: {
        h1: { ...(competitorTargets.headings?.h1 || prev.headings.h1), current: prev.headings.h1.current },
        h2: { ...(competitorTargets.headings?.h2 || prev.headings.h2), current: prev.headings.h2.current },
        h3: { ...(competitorTargets.headings?.h3 || prev.headings.h3), current: prev.headings.h3.current }
      },
      lastUpdated: new Date()
    } as ContentTargets))
  }, [])

  // Reset to defaults
  const reset = useCallback(() => {
    setTargetsState({ ...DEFAULT_CONTENT_TARGETS, lastUpdated: new Date() })
  }, [])

  // Update targets when competitors change
  useEffect(() => {
    if (competitors && competitors.length > 0) {
      regenerateFromCompetitors(competitors)
    }
  }, [competitors]) // eslint-disable-line react-hooks/exhaustive-deps

  // Update targets when keyword changes
  useEffect(() => {
    if (targetKeyword) {
      regenerateFromKeyword(targetKeyword, intent)
    }
  }, [targetKeyword, intent]) // eslint-disable-line react-hooks/exhaustive-deps

  return {
    // State
    targets,
    progress,
    isAnalyzing,
    
    // Actions
    updateFromContent,
    setTargets,
    regenerateFromKeyword,
    regenerateFromCompetitors,
    reset,
    
    // Derived
    overallScore,
    missingTargets
  }
}

export default useContentTargets
