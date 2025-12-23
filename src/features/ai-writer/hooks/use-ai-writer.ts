"use client"

// ============================================
// AI WRITER HOOKS - Production Ready
// ============================================
// Custom hooks for AI Writer functionality

import { useState, useEffect, useCallback, useRef } from 'react'
import { 
  aiWriterService, 
  draftService, 
  versionHistoryService,
  competitorService,
  creditsService,
  exportService,
  schemaService,
  readabilityService,
  type AIOperation,
  type AIRequestParams,
  type AIResponse,
  type Draft,
  type DraftListItem,
  type DraftFilters,
  type ContentVersion,
  type SERPAnalysis,
  type CreditBalance,
  type ExportFormat,
  type ExportOptions,
  type ContentMetadata,
  type ReadabilityAnalysis,
  type GeneratedSchema
} from '../services'

// ============================================
// useAIWriter - Main AI operations hook
// ============================================

export interface UseAIWriterOptions {
  onSuccess?: (response: AIResponse) => void
  onError?: (error: Error) => void
  checkCredits?: boolean
}

export function useAIWriter(options: UseAIWriterOptions = {}) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastResponse, setLastResponse] = useState<AIResponse | null>(null)

  const execute = useCallback(async (params: AIRequestParams): Promise<AIResponse | null> => {
    setIsLoading(true)
    setError(null)

    try {
      // Check credits if enabled
      if (options.checkCredits) {
        const hasCredits = creditsService.hasEnoughCredits(params.operation)
        if (!hasCredits) {
          throw new Error('Insufficient credits for this operation')
        }
      }

      const response = await aiWriterService.execute(params)
      
      if (response.success) {
        // Deduct credits
        if (options.checkCredits && response.tokens) {
          await creditsService.deductCredits(params.operation, response.tokens.total)
        }
        
        setLastResponse(response)
        options.onSuccess?.(response)
        return response
      } else {
        throw new Error(response.error || 'AI operation failed')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      options.onError?.(err instanceof Error ? err : new Error(errorMessage))
      return null
    } finally {
      setIsLoading(false)
    }
  }, [options])

  const executeStream = useCallback(async (
    params: AIRequestParams,
    onToken: (token: string) => void,
    onComplete: (content: string) => void
  ) => {
    setIsLoading(true)
    setError(null)

    try {
      if (options.checkCredits) {
        const hasCredits = creditsService.hasEnoughCredits(params.operation)
        if (!hasCredits) {
          throw new Error('Insufficient credits for this operation')
        }
      }

      await aiWriterService.executeStream(params, {
        onToken,
        onComplete: (content) => {
          setIsLoading(false)
          onComplete(content)
        },
        onError: (err) => {
          setError(err.message)
          setIsLoading(false)
        }
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      setIsLoading(false)
    }
  }, [options.checkCredits])

  return {
    execute,
    executeStream,
    isLoading,
    error,
    lastResponse,
    clearError: () => setError(null)
  }
}

// ============================================
// useDraft - Draft management hook
// ============================================

export interface UseDraftOptions {
  autoSave?: boolean
  autoSaveInterval?: number
}

export function useDraft(draftId?: string | null, options: UseDraftOptions = {}) {
  const [draft, setDraft] = useState<Draft | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null)
  
  const contentRef = useRef<string>('')

  // Load draft
  useEffect(() => {
    if (!draftId) {
      setDraft(null)
      return
    }

    const loadDraft = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const loaded = await draftService.getDraft(draftId)
        setDraft(loaded)
        if (loaded) {
          contentRef.current = loaded.content
          draftService.setCurrentDraft(draftId)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load draft')
      } finally {
        setIsLoading(false)
      }
    }

    loadDraft()
  }, [draftId])

  // Auto-save setup
  useEffect(() => {
    if (!draftId || !options.autoSave) return

    draftService.startAutoSave(draftId, () => ({
      content: contentRef.current,
      metaSettings: draft?.metaSettings
    }))

    return () => {
      draftService.stopAutoSave()
    }
  }, [draftId, options.autoSave, draft?.metaSettings])

  const createDraft = useCallback(async (params: {
    title?: string
    content?: string
    keyword?: string
    secondaryKeywords?: string[]
    sourceFeature?: string
  }): Promise<Draft | null> => {
    setIsLoading(true)
    setError(null)
    try {
      const newDraft = await draftService.createDraft(params)
      setDraft(newDraft)
      draftService.setCurrentDraft(newDraft.id)
      return newDraft
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create draft')
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  const saveDraft = useCallback(async (updates: Partial<Draft>): Promise<Draft | null> => {
    if (!draftId) return null
    
    setIsSaving(true)
    try {
      const updated = await draftService.updateDraft(draftId, updates)
      if (updated) {
        setDraft(updated)
        setLastSavedAt(new Date())
        contentRef.current = updated.content
      }
      return updated
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save draft')
      return null
    } finally {
      setIsSaving(false)
    }
  }, [draftId])

  const deleteDraft = useCallback(async (): Promise<boolean> => {
    if (!draftId) return false
    
    try {
      const success = await draftService.deleteDraft(draftId)
      if (success) {
        setDraft(null)
        draftService.clearCurrentDraft()
      }
      return success
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete draft')
      return false
    }
  }, [draftId])

  const updateContent = useCallback((content: string) => {
    contentRef.current = content
  }, [])

  return {
    draft,
    isLoading,
    isSaving,
    error,
    lastSavedAt,
    createDraft,
    saveDraft,
    deleteDraft,
    updateContent,
    clearError: () => setError(null)
  }
}

// ============================================
// useDraftList - Draft listing hook
// ============================================

export function useDraftList(filters?: DraftFilters) {
  const [drafts, setDrafts] = useState<DraftListItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadDrafts = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const list = await draftService.listDrafts(filters)
      setDrafts(list)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load drafts')
    } finally {
      setIsLoading(false)
    }
  }, [filters])

  useEffect(() => {
    loadDrafts()
  }, [loadDrafts])

  return {
    drafts,
    isLoading,
    error,
    refresh: loadDrafts
  }
}

// ============================================
// useVersionHistory - Version tracking hook
// ============================================

export function useVersionHistory(draftId?: string | null) {
  const [versions, setVersions] = useState<ContentVersion[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadVersions = useCallback(async () => {
    if (!draftId) {
      setVersions([])
      return
    }
    
    setIsLoading(true)
    setError(null)
    try {
      const list = await versionHistoryService.getVersions(draftId)
      setVersions(list)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load versions')
    } finally {
      setIsLoading(false)
    }
  }, [draftId])

  useEffect(() => {
    loadVersions()
  }, [loadVersions])

  const createVersion = useCallback(async (params: {
    content: string
    title: string
    metaTitle?: string
    metaDescription?: string
    changeType: ContentVersion['changeType']
    changeDescription?: string
  }): Promise<ContentVersion | null> => {
    if (!draftId) return null
    
    try {
      const version = await versionHistoryService.createVersion({
        draftId,
        ...params
      })
      await loadVersions()
      return version
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create version')
      return null
    }
  }, [draftId, loadVersions])

  const restoreVersion = useCallback(async (versionId: string): Promise<ContentVersion | null> => {
    if (!draftId) return null
    
    try {
      const restored = await versionHistoryService.restoreVersion(draftId, versionId)
      await loadVersions()
      return restored
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to restore version')
      return null
    }
  }, [draftId, loadVersions])

  const compareVersions = useCallback(async (versionIdA: string, versionIdB: string) => {
    if (!draftId) return null
    return versionHistoryService.compareVersions(draftId, versionIdA, versionIdB)
  }, [draftId])

  return {
    versions,
    isLoading,
    error,
    createVersion,
    restoreVersion,
    compareVersions,
    refresh: loadVersions
  }
}

// ============================================
// useCompetitors - Competitor analysis hook
// ============================================

export function useCompetitors(keyword?: string | null) {
  const [analysis, setAnalysis] = useState<SERPAnalysis | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchAnalysis = useCallback(async (kw?: string) => {
    const targetKeyword = kw || keyword
    if (!targetKeyword) return
    
    setIsLoading(true)
    setError(null)
    try {
      const data = await competitorService.getSERPData(targetKeyword)
      setAnalysis(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch competitor data')
    } finally {
      setIsLoading(false)
    }
  }, [keyword])

  useEffect(() => {
    if (keyword) {
      fetchAnalysis()
    }
  }, [keyword, fetchAnalysis])

  return {
    analysis,
    isLoading,
    error,
    refresh: fetchAnalysis
  }
}

// ============================================
// useCredits - Credits management hook
// ============================================

export function useCredits() {
  const [balance, setBalance] = useState<CreditBalance | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const refreshBalance = useCallback(() => {
    const currentBalance = creditsService.getBalance()
    setBalance(currentBalance)
    setIsLoading(false)
  }, [])

  useEffect(() => {
    refreshBalance()
  }, [refreshBalance])

  const hasCredits = useCallback((operation: string, tokens = 0): boolean => {
    return creditsService.hasEnoughCredits(operation, tokens)
  }, [])

  const deductCredits = useCallback(async (
    operation: string,
    tokens = 0,
    details?: string
  ) => {
    const result = await creditsService.deductCredits(operation, tokens, details)
    refreshBalance()
    return result
  }, [refreshBalance])

  const getOperationCost = useCallback((operation: string, tokens = 0): number => {
    return creditsService.calculateCost(operation, tokens)
  }, [])

  return {
    balance,
    isLoading,
    hasCredits,
    deductCredits,
    getOperationCost,
    refresh: refreshBalance,
    plans: creditsService.getPlans(),
    usage: creditsService.getUsageStats()
  }
}

// ============================================
// useExport - Export functionality hook
// ============================================

export function useExport() {
  const [isExporting, setIsExporting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const exportContent = useCallback(async (
    content: string,
    metadata: ContentMetadata,
    options?: Partial<ExportOptions>
  ) => {
    setIsExporting(true)
    setError(null)
    try {
      const result = await exportService.export(content, metadata, options)
      if (!result.success) {
        throw new Error(result.error)
      }
      return result
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Export failed'
      setError(msg)
      return null
    } finally {
      setIsExporting(false)
    }
  }, [])

  const downloadContent = useCallback(async (
    content: string,
    metadata: ContentMetadata,
    format: ExportFormat
  ): Promise<boolean> => {
    setIsExporting(true)
    setError(null)
    try {
      const success = await exportService.download(content, metadata, { format })
      return success
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Download failed')
      return false
    } finally {
      setIsExporting(false)
    }
  }, [])

  return {
    isExporting,
    error,
    exportContent,
    downloadContent,
    formats: exportService.getSupportedFormats(),
    clearError: () => setError(null)
  }
}

// ============================================
// useSchema - Schema generation hook
// ============================================

export function useSchema() {
  const [schemas, setSchemas] = useState<GeneratedSchema[]>([])
  const [isGenerating, setIsGenerating] = useState(false)

  const generateSchema = useCallback((type: string, data: Record<string, unknown>): GeneratedSchema | null => {
    setIsGenerating(true)
    try {
      let result: GeneratedSchema

      switch (type) {
        case 'Article':
          result = schemaService.generateArticleSchema({
            headline: data.headline as string || '',
            description: data.description as string || '',
            author: data.author as { name: string; url?: string } || { name: 'Author' },
            publisher: data.publisher as { name: string; logo?: string } || { name: 'Publisher' },
            datePublished: data.datePublished as string || new Date().toISOString(),
            dateModified: data.dateModified as string | undefined,
            image: data.image as string | undefined,
            wordCount: data.wordCount as number | undefined,
            keywords: data.keywords as string[] | undefined
          })
          break
        case 'FAQPage':
          result = schemaService.generateFAQSchema(data.faqs as Parameters<typeof schemaService.generateFAQSchema>[0])
          break
        case 'HowTo':
          result = schemaService.generateHowToSchema({
            name: data.name as string || '',
            description: data.description as string || '',
            steps: data.steps as Array<{ name: string; text: string; image?: string; url?: string }> || [],
            totalTime: data.totalTime as string | undefined,
            image: data.image as string | undefined,
            estimatedCost: data.estimatedCost as { currency: string; value: number } | undefined,
            supply: data.supply as string[] | undefined,
            tool: data.tool as string[] | undefined
          })
          break
        case 'Review':
          result = schemaService.generateReviewSchema({
            itemReviewed: {
              type: (data.itemReviewed as { type?: string })?.type as 'Product' | 'LocalBusiness' | 'Organization' | 'Book' | 'Movie' || 'Product',
              name: (data.itemReviewed as { name?: string })?.name || ''
            },
            reviewRating: data.reviewRating as { ratingValue: number; bestRating?: number; worstRating?: number } || { ratingValue: 5, bestRating: 5, worstRating: 1 },
            author: typeof data.author === 'string' ? data.author : (data.author as { name?: string })?.name || 'Author',
            reviewBody: data.reviewBody as string || '',
            datePublished: data.datePublished as string | undefined
          })
          break
        case 'BreadcrumbList':
          result = schemaService.generateBreadcrumbSchema(data.items as Parameters<typeof schemaService.generateBreadcrumbSchema>[0])
          break
        default:
          return null
      }

      setSchemas(prev => [...prev.filter(s => s.type !== type), result])
      return result
    } finally {
      setIsGenerating(false)
    }
  }, [])

  const detectSchemas = useCallback((content: string) => {
    return schemaService.detectApplicableSchemas(content)
  }, [])

  const extractFAQs = useCallback((content: string) => {
    return schemaService.extractFAQsFromContent(content)
  }, [])

  const extractHowTo = useCallback((content: string) => {
    return schemaService.extractHowToFromContent(content)
  }, [])

  const getCombinedScript = useCallback(() => {
    if (schemas.length === 0) return ''
    const allSchemas = schemas.map(s => s.json)
    return `<script type="application/ld+json">\n${JSON.stringify(allSchemas, null, 2)}\n</script>`
  }, [schemas])

  return {
    schemas,
    isGenerating,
    generateSchema,
    detectSchemas,
    extractFAQs,
    extractHowTo,
    getCombinedScript,
    schemaTypes: schemaService.getSchemaTypeInfo(),
    clearSchemas: () => setSchemas([])
  }
}

// ============================================
// useReadability - Readability analysis hook
// ============================================

export function useReadability(content?: string) {
  const [analysis, setAnalysis] = useState<ReadabilityAnalysis | null>(null)
  const [quickScore, setQuickScore] = useState<{ grade: number; level: string; readingTime: number } | null>(null)
  
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  // Full analysis (debounced)
  const analyze = useCallback((text: string) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }
    
    debounceRef.current = setTimeout(() => {
      const result = readabilityService.analyze(text)
      setAnalysis(result)
    }, 500)
  }, [])

  // Quick score (for real-time feedback)
  const getQuickScore = useCallback((text: string) => {
    const score = readabilityService.quickScore(text)
    setQuickScore(score)
    return score
  }, [])

  // Auto-analyze when content changes
  useEffect(() => {
    if (content) {
      getQuickScore(content)
      analyze(content)
    }
    
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [content, analyze, getQuickScore])

  return {
    analysis,
    quickScore,
    analyze,
    getQuickScore,
    getRecommendedLevel: readabilityService.getRecommendedLevel.bind(readabilityService)
  }
}

// ============================================
// useAutoSave - Auto-save functionality hook
// ============================================

export function useAutoSave(
  draftId: string | null,
  getContent: () => string,
  interval = 30000
) {
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const contentRef = useRef<string>('')

  useEffect(() => {
    if (!draftId) return

    const save = async () => {
      const currentContent = getContent()
      
      // Only save if content changed
      if (currentContent === contentRef.current) return
      
      setIsSaving(true)
      try {
        await draftService.updateDraft(draftId, { content: currentContent })
        contentRef.current = currentContent
        setLastSaved(new Date())
      } catch (error) {
        console.warn('Auto-save failed:', error)
      } finally {
        setIsSaving(false)
      }
    }

    intervalRef.current = setInterval(save, interval)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [draftId, getContent, interval])

  return {
    lastSaved,
    isSaving
  }
}
