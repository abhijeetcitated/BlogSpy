"use client"

// ============================================
// AI WRITER HOOKS - Index Export
// ============================================

export {
  useAIWriter,
  useDraft,
  useDraftList,
  useVersionHistory,
  useCompetitors,
  useCredits,
  useExport,
  useSchema,
  useReadability,
  useAutoSave,
  type UseAIWriterOptions,
  type UseDraftOptions
} from './use-ai-writer'

// Editor State hook (Refactored)
export { useEditorState, type UseEditorStateOptions, type UseEditorStateReturn } from './useEditorState'

// AI Generation hook (Refactored)
export { useAIGeneration, type UseAIGenerationOptions, type UseAIGenerationReturn } from './useAIGeneration'

// NLP Terms hook
export { useNLPTerms, useNLPScore } from './use-nlp-terms'

// GEO & AEO hooks (Feature #2 & #3)
export { useGEOAEO, useGEO, useAEO } from './use-geo-aeo'

// Term Highlight hook (Feature #4)
export { useTermHighlight } from './use-term-highlight'

// Content Targets hook (Feature #5 & #6)
export { useContentTargets } from './use-content-targets'
