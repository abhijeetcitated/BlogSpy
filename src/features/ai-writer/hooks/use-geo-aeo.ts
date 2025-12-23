// ============================================
// AI WRITER - GEO & AEO HOOK
// ============================================
// Feature #2 & #3: Custom hook for GEO/AEO
// analysis with debounced real-time updates
// ============================================

'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import type {
  GEOScore,
  AEOScore,
  GEOConfig,
  AEOConfig,
  GEORecommendation,
  AEORecommendation
} from '../types/geo-aeo.types'
import {
  DEFAULT_GEO_CONFIG,
  DEFAULT_AEO_CONFIG
} from '../types/geo-aeo.types'
import { analyzeGEO, analyzeAEO, analyzeGEOAEO } from '../utils/geo-aeo-analysis'

// ============================================
// HOOK TYPES
// ============================================

interface UseGEOAEOOptions {
  /** Debounce delay in ms (default: 500) */
  debounceMs?: number
  /** GEO analysis configuration */
  geoConfig?: Partial<GEOConfig>
  /** AEO analysis configuration */
  aeoConfig?: Partial<AEOConfig>
  /** Auto-analyze on content change */
  autoAnalyze?: boolean
  /** Minimum content length to trigger analysis */
  minContentLength?: number
}

interface UseGEOAEOReturn {
  // Scores
  geoScore: GEOScore | null
  aeoScore: AEOScore | null
  
  // Combined metrics
  combinedScore: number
  combinedGrade: 'A' | 'B' | 'C' | 'D' | 'F'
  
  // State
  isAnalyzing: boolean
  lastAnalyzed: Date | null
  error: string | null
  
  // Actions
  analyze: (html: string, keyword: string) => void
  analyzeGEOOnly: (html: string, keyword: string) => void
  analyzeAEOOnly: (html: string, keyword: string) => void
  reset: () => void
  
  // Recommendations
  allRecommendations: (GEORecommendation | AEORecommendation)[]
  highPriorityCount: number
}

// ============================================
// DEBOUNCE UTILITY
// ============================================

function useDebouncedCallback<T extends (...args: Parameters<T>) => void>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const callbackRef = useRef(callback)
  
  // Update callback ref when callback changes
  useEffect(() => {
    callbackRef.current = callback
  }, [callback])
  
  // Cleanup on unmount
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

export function useGEOAEO(options: UseGEOAEOOptions = {}): UseGEOAEOReturn {
  const {
    debounceMs = 500,
    geoConfig: customGeoConfig,
    aeoConfig: customAeoConfig,
    autoAnalyze = true,
    minContentLength = 100
  } = options

  // State
  const [geoScore, setGeoScore] = useState<GEOScore | null>(null)
  const [aeoScore, setAeoScore] = useState<AEOScore | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [lastAnalyzed, setLastAnalyzed] = useState<Date | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Merge configs with defaults
  const geoConfig = useMemo<GEOConfig>(() => ({
    ...DEFAULT_GEO_CONFIG,
    ...customGeoConfig,
    weights: {
      ...DEFAULT_GEO_CONFIG.weights,
      ...customGeoConfig?.weights
    }
  }), [customGeoConfig])

  const aeoConfig = useMemo<AEOConfig>(() => ({
    ...DEFAULT_AEO_CONFIG,
    ...customAeoConfig,
    weights: {
      ...DEFAULT_AEO_CONFIG.weights,
      ...customAeoConfig?.weights
    }
  }), [customAeoConfig])

  // Calculate combined metrics
  const combinedScore = useMemo(() => {
    if (!geoScore && !aeoScore) return 0
    const geo = geoScore?.score || 0
    const aeo = aeoScore?.score || 0
    // GEO weighted slightly higher (60/40)
    return Math.round(geo * 0.6 + aeo * 0.4)
  }, [geoScore, aeoScore])

  const combinedGrade = useMemo<'A' | 'B' | 'C' | 'D' | 'F'>(() => {
    if (combinedScore >= 80) return 'A'
    if (combinedScore >= 60) return 'B'
    if (combinedScore >= 40) return 'C'
    if (combinedScore >= 20) return 'D'
    return 'F'
  }, [combinedScore])

  // Get all recommendations
  const allRecommendations = useMemo(() => {
    const recs: (GEORecommendation | AEORecommendation)[] = []
    if (geoScore) recs.push(...geoScore.recommendations)
    if (aeoScore) recs.push(...aeoScore.recommendations)
    
    // Sort by priority
    const priorityOrder = { high: 0, medium: 1, low: 2 }
    recs.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
    
    return recs
  }, [geoScore, aeoScore])

  const highPriorityCount = useMemo(() => {
    return allRecommendations.filter(r => r.priority === 'high').length
  }, [allRecommendations])

  // Analysis functions
  const performAnalysis = useCallback((html: string, keyword: string) => {
    if (!html || html.length < minContentLength) {
      return
    }

    setIsAnalyzing(true)
    setError(null)

    try {
      const { geo, aeo } = analyzeGEOAEO(html, keyword, geoConfig, aeoConfig)
      setGeoScore(geo)
      setAeoScore(aeo)
      setLastAnalyzed(new Date())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed')
      console.error('GEO/AEO analysis error:', err)
    } finally {
      setIsAnalyzing(false)
    }
  }, [geoConfig, aeoConfig, minContentLength])

  const performGEOAnalysis = useCallback((html: string, keyword: string) => {
    if (!html || html.length < minContentLength) return

    setIsAnalyzing(true)
    setError(null)

    try {
      const geo = analyzeGEO(html, keyword, geoConfig)
      setGeoScore(geo)
      setLastAnalyzed(new Date())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'GEO analysis failed')
    } finally {
      setIsAnalyzing(false)
    }
  }, [geoConfig, minContentLength])

  const performAEOAnalysis = useCallback((html: string, keyword: string) => {
    if (!html || html.length < minContentLength) return

    setIsAnalyzing(true)
    setError(null)

    try {
      const aeo = analyzeAEO(html, keyword, aeoConfig)
      setAeoScore(aeo)
      setLastAnalyzed(new Date())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'AEO analysis failed')
    } finally {
      setIsAnalyzing(false)
    }
  }, [aeoConfig, minContentLength])

  // Debounced versions
  const analyze = useDebouncedCallback(performAnalysis, debounceMs)
  const analyzeGEOOnly = useDebouncedCallback(performGEOAnalysis, debounceMs)
  const analyzeAEOOnly = useDebouncedCallback(performAEOAnalysis, debounceMs)

  // Reset function
  const reset = useCallback(() => {
    setGeoScore(null)
    setAeoScore(null)
    setIsAnalyzing(false)
    setLastAnalyzed(null)
    setError(null)
  }, [])

  return {
    // Scores
    geoScore,
    aeoScore,
    
    // Combined
    combinedScore,
    combinedGrade,
    
    // State
    isAnalyzing,
    lastAnalyzed,
    error,
    
    // Actions
    analyze,
    analyzeGEOOnly,
    analyzeAEOOnly,
    reset,
    
    // Recommendations
    allRecommendations,
    highPriorityCount
  }
}

// ============================================
// CONVENIENCE HOOKS
// ============================================

/**
 * Hook for GEO-only analysis
 */
export function useGEO(options: Omit<UseGEOAEOOptions, 'aeoConfig'> = {}) {
  const result = useGEOAEO(options)
  
  return {
    score: result.geoScore,
    isAnalyzing: result.isAnalyzing,
    lastAnalyzed: result.lastAnalyzed,
    error: result.error,
    analyze: result.analyzeGEOOnly,
    reset: result.reset,
    recommendations: result.geoScore?.recommendations || []
  }
}

/**
 * Hook for AEO-only analysis
 */
export function useAEO(options: Omit<UseGEOAEOOptions, 'geoConfig'> = {}) {
  const result = useGEOAEO(options)
  
  return {
    score: result.aeoScore,
    isAnalyzing: result.isAnalyzing,
    lastAnalyzed: result.lastAnalyzed,
    error: result.error,
    analyze: result.analyzeAEOOnly,
    reset: result.reset,
    recommendations: result.aeoScore?.recommendations || [],
    snippetOpportunities: result.aeoScore?.snippetOpportunities || []
  }
}

export default useGEOAEO
