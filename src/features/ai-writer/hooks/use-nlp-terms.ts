// ============================================
// AI WRITER - NLP Terms Hook
// ============================================
// Feature #1: Custom hook for NLP term management
// Production-ready state management with real-time analysis
// ============================================

import { useState, useCallback, useEffect, useMemo, useRef } from 'react'
import type { 
  NLPTerm, 
  NLPOptimizationScore, 
  NLPConfig,
  NLPAnalysisResult 
} from '../types/nlp-terms.types'
import {
  analyzeNLPTerms,
  calculateNLPScore,
  performNLPAnalysis,
  DEFAULT_NLP_CONFIG
} from '../utils/nlp-analysis'
import { getMockNLPTermsByKeyword, getInitialNLPScore } from '../__mocks__/nlp-terms.mock'

interface UseNLPTermsOptions {
  keyword: string
  content: string
  config?: Partial<NLPConfig>
  debounceMs?: number
  enabled?: boolean
}

interface UseNLPTermsReturn {
  // State
  terms: NLPTerm[]
  score: NLPOptimizationScore
  isAnalyzing: boolean
  lastAnalyzed: number | null
  
  // Actions
  refreshAnalysis: () => void
  setTerms: (terms: NLPTerm[]) => void
  addCustomTerm: (term: Omit<NLPTerm, 'id' | 'currentCount' | 'status'>) => void
  removeTerm: (termId: string) => void
  updateTermTarget: (termId: string, targetCount: number, maxCount: number) => void
  
  // Analysis result
  analysisResult: NLPAnalysisResult | null
}

/**
 * Custom hook for NLP term management and analysis
 */
export function useNLPTerms({
  keyword,
  content,
  config = {},
  debounceMs = 500,
  enabled = true
}: UseNLPTermsOptions): UseNLPTermsReturn {
  // Merge config with defaults
  const mergedConfig = useMemo(() => ({
    ...DEFAULT_NLP_CONFIG,
    ...config
  }), [config])
  
  // State
  const [terms, setTerms] = useState<NLPTerm[]>([])
  const [score, setScore] = useState<NLPOptimizationScore>(getInitialNLPScore())
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [lastAnalyzed, setLastAnalyzed] = useState<number | null>(null)
  const [analysisResult, setAnalysisResult] = useState<NLPAnalysisResult | null>(null)
  
  // Refs for debouncing
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)
  const previousKeywordRef = useRef<string>('')
  
  // Load terms when keyword changes
  useEffect(() => {
    if (!enabled || !keyword) return
    
    // Only reload terms if keyword actually changed
    if (keyword !== previousKeywordRef.current) {
      previousKeywordRef.current = keyword
      
      // In production, this would be an API call
      const newTerms = getMockNLPTermsByKeyword(keyword)
      setTerms(newTerms)
      
      // Reset analysis
      setScore(getInitialNLPScore())
      setAnalysisResult(null)
    }
  }, [keyword, enabled])
  
  // Analyze content when it changes (debounced)
  useEffect(() => {
    if (!enabled || terms.length === 0) return
    
    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }
    
    // Set new timer
    debounceTimerRef.current = setTimeout(() => {
      runAnalysis()
    }, debounceMs)
    
    // Cleanup
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [content, terms, enabled, debounceMs])
  
  /**
   * Run NLP analysis on current content
   */
  const runAnalysis = useCallback(() => {
    if (terms.length === 0) return
    
    setIsAnalyzing(true)
    
    // Simulate async analysis (in production, could be actual API call)
    requestAnimationFrame(() => {
      try {
        const result = performNLPAnalysis(content, terms, mergedConfig)
        
        setTerms(result.terms)
        setScore(result.score)
        setAnalysisResult(result)
        setLastAnalyzed(Date.now())
      } catch (error) {
        console.error('NLP analysis error:', error)
      } finally {
        setIsAnalyzing(false)
      }
    })
  }, [content, terms, mergedConfig])
  
  /**
   * Manual refresh analysis
   */
  const refreshAnalysis = useCallback(() => {
    runAnalysis()
  }, [runAnalysis])
  
  /**
   * Add a custom term
   */
  const addCustomTerm = useCallback((
    termData: Omit<NLPTerm, 'id' | 'currentCount' | 'status'>
  ) => {
    const newTerm: NLPTerm = {
      ...termData,
      id: `custom-${Date.now()}`,
      currentCount: 0,
      status: 'missing'
    }
    
    setTerms(prev => [...prev, newTerm])
  }, [])
  
  /**
   * Remove a term
   */
  const removeTerm = useCallback((termId: string) => {
    setTerms(prev => prev.filter(t => t.id !== termId))
  }, [])
  
  /**
   * Update term target counts
   */
  const updateTermTarget = useCallback((
    termId: string, 
    targetCount: number, 
    maxCount: number
  ) => {
    setTerms(prev => prev.map(t => 
      t.id === termId 
        ? { ...t, targetCount, maxCount }
        : t
    ))
  }, [])
  
  return {
    terms,
    score,
    isAnalyzing,
    lastAnalyzed,
    refreshAnalysis,
    setTerms,
    addCustomTerm,
    removeTerm,
    updateTermTarget,
    analysisResult
  }
}

/**
 * Simple hook for NLP score display only
 */
export function useNLPScore(terms: NLPTerm[]): NLPOptimizationScore {
  return useMemo(() => calculateNLPScore(terms), [terms])
}
