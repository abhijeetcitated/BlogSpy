"use client"

// ============================================
// KEYWORD MAGIC - Bulk Analysis Hook
// ============================================
// Manages bulk keyword analysis functionality
// ============================================

import { useState, useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import type { BulkMode } from "../types"
import { keywordMagicAPI } from "../services"

// ============================================
// TYPES
// ============================================

export interface UseBulkAnalysisReturn {
  bulkMode: BulkMode
  setBulkMode: (mode: BulkMode) => void
  bulkKeywords: string
  setBulkKeywords: (value: string) => void
  parsedKeywords: string[]
  keywordCount: number
  isAnalyzing: boolean
  error: Error | null
  handleBulkAnalyze: () => Promise<void>
  canAnalyze: boolean
}

// ============================================
// HOOK
// ============================================

export function useBulkAnalysis(): UseBulkAnalysisReturn {
  const router = useRouter()
  
  const [bulkMode, setBulkMode] = useState<BulkMode>("explore")
  const [bulkKeywords, setBulkKeywords] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  
  // Parse keywords from input
  const parsedKeywords = useMemo(() => {
    return bulkKeywords
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
  }, [bulkKeywords])
  
  const keywordCount = parsedKeywords.length
  const canAnalyze = keywordCount > 0 && keywordCount <= 100
  
  const handleBulkAnalyze = useCallback(async () => {
    if (!canAnalyze || isAnalyzing) return
    
    setIsAnalyzing(true)
    setError(null)
    
    try {
      if (parsedKeywords.length === 1) {
        // Single keyword - navigate to overview
        router.push(`/dashboard/research/overview/${encodeURIComponent(parsedKeywords[0])}`)
      } else {
        // Multiple keywords - call bulk API
        const response = await keywordMagicAPI.bulkAnalyze({
          keywords: parsedKeywords,
          country: "US",
          options: {
            includeRTV: true,
            includeGEO: true,
            includeAIO: true,
            includeDecay: true,
          },
        })
        
        if (response.success) {
          // Store results and navigate to bulk results view
          try {
            sessionStorage.setItem("bulkAnalysisResults", JSON.stringify(response.data.results))
            sessionStorage.setItem("bulkKeywords", JSON.stringify(parsedKeywords))
          } catch {
            // sessionStorage may be blocked in privacy mode
          }
          // TODO: Navigate to bulk results page
          toast.success(`Analyzed ${response.data.results.length} keywords successfully!`)
        } else {
          throw new Error(response.error?.message || "Bulk analysis failed")
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Analysis failed"))
    } finally {
      setIsAnalyzing(false)
    }
  }, [canAnalyze, isAnalyzing, parsedKeywords, router])
  
  return {
    bulkMode,
    setBulkMode,
    bulkKeywords,
    setBulkKeywords,
    parsedKeywords,
    keywordCount,
    isAnalyzing,
    error,
    handleBulkAnalyze,
    canAnalyze,
  }
}
