// ============================================
// AI WRITER - TERM HIGHLIGHT HOOK
// ============================================
// Feature #4: Hook for managing term
// highlighting state and actions
// ============================================

'use client'

import { useState, useCallback, useMemo, useEffect } from 'react'
import type { Editor } from '@tiptap/core'
import type { NLPTerm } from '../types/nlp-terms.types'
import type { HighlightPanelState, TermHighlight } from '../types/term-highlight.types'
import { DEFAULT_HIGHLIGHT_STATE } from '../types/term-highlight.types'

// ============================================
// TYPES
// ============================================

interface UseTermHighlightOptions {
  editor: Editor | null
  terms: NLPTerm[]
  enabled?: boolean
  autoUpdate?: boolean
}

interface UseTermHighlightReturn {
  // State
  highlightState: HighlightPanelState
  activeHighlights: TermHighlight[]
  highlightCount: number
  
  // Actions
  setHighlightState: (state: Partial<HighlightPanelState>) => void
  toggleHighlights: () => void
  scrollToTerm: (term: NLPTerm) => void
  flashTerm: (term: NLPTerm) => void
  
  // Stats
  underusedCount: number
  optimalCount: number
  overusedCount: number
}

// ============================================
// HOOK
// ============================================

export function useTermHighlight({
  editor,
  terms,
  enabled = true,
  autoUpdate = true
}: UseTermHighlightOptions): UseTermHighlightReturn {
  const [highlightState, setHighlightStateInternal] = useState<HighlightPanelState>({
    ...DEFAULT_HIGHLIGHT_STATE,
    enabled
  })

  // Update highlight state
  const setHighlightState = useCallback((newState: Partial<HighlightPanelState>) => {
    setHighlightStateInternal(prev => {
      const updated = { ...prev, ...newState }
      
      // Update editor if available
      if (editor && editor.commands.setHighlightState) {
        editor.commands.setHighlightState(updated)
      }
      
      return updated
    })
  }, [editor])

  // Toggle highlights on/off
  const toggleHighlights = useCallback(() => {
    setHighlightState({ enabled: !highlightState.enabled })
  }, [highlightState.enabled, setHighlightState])

  // Scroll to first occurrence of a term
  const scrollToTerm = useCallback((term: NLPTerm) => {
    if (!editor) return
    
    const content = editor.getText()
    const normalizedTerm = term.term.toLowerCase()
    const normalizedContent = content.toLowerCase()
    
    const index = normalizedContent.indexOf(normalizedTerm)
    if (index === -1) return
    
    // Focus editor and set selection
    editor.commands.focus()
    editor.commands.setTextSelection({
      from: index + 1,
      to: index + term.term.length + 1
    })
    
    // Scroll into view
    const { view } = editor
    const coords = view.coordsAtPos(index + 1)
    if (coords) {
      const editorElement = view.dom
      const editorRect = editorElement.getBoundingClientRect()
      
      if (coords.top < editorRect.top || coords.bottom > editorRect.bottom) {
        editorElement.scrollTo({
          top: coords.top - editorRect.top + editorElement.scrollTop - 100,
          behavior: 'smooth'
        })
      }
    }
  }, [editor])

  // Flash highlight a term temporarily
  const flashTerm = useCallback((term: NLPTerm) => {
    if (!editor) return
    
    scrollToTerm(term)
    
    // Add flash animation class
    setTimeout(() => {
      const highlights = document.querySelectorAll(
        `[data-term="${term.term}"]`
      )
      highlights.forEach(el => {
        el.classList.add('animate-highlight')
        setTimeout(() => el.classList.remove('animate-highlight'), 500)
      })
    }, 100)
  }, [editor, scrollToTerm])

  // Calculate active highlights
  const activeHighlights = useMemo((): TermHighlight[] => {
    if (!highlightState.enabled) return []
    
    return terms
      .filter(term => {
        if (term.status === 'missing') return false
        if (term.currentCount === 0) return false
        
        // Apply status filter
        if (term.status === 'underused' && !highlightState.showUnderused) return false
        if (term.status === 'optimal' && !highlightState.showOptimal) return false
        if (term.status === 'overused' && !highlightState.showOverused) return false
        
        // Apply priority filter
        if (highlightState.showOnlyPrimary && term.priority !== 'primary') return false
        
        // Skip avoid terms
        if (term.priority === 'avoid') return false
        
        return true
      })
      .map(term => ({
        id: term.id,
        term: term.term,
        normalizedTerm: term.term.toLowerCase(),
        status: term.status,
        priority: term.priority,
        from: 0, // Positions are managed by the extension
        to: 0,
        count: term.currentCount
      }))
  }, [terms, highlightState])

  // Stats
  const underusedCount = useMemo(() => 
    terms.filter(t => t.status === 'underused' && t.currentCount > 0).length
  , [terms])

  const optimalCount = useMemo(() => 
    terms.filter(t => t.status === 'optimal').length
  , [terms])

  const overusedCount = useMemo(() => 
    terms.filter(t => t.status === 'overused').length
  , [terms])

  // Auto-update editor when terms change
  useEffect(() => {
    if (!editor || !autoUpdate) return
    
    // Check if the command exists before calling
    if (editor.commands.setHighlightTerms) {
      editor.commands.setHighlightTerms(terms)
    }
  }, [editor, terms, autoUpdate])

  // Sync enabled state
  useEffect(() => {
    setHighlightStateInternal(prev => ({
      ...prev,
      enabled
    }))
  }, [enabled])

  return {
    // State
    highlightState,
    activeHighlights,
    highlightCount: activeHighlights.length,
    
    // Actions
    setHighlightState,
    toggleHighlights,
    scrollToTerm,
    flashTerm,
    
    // Stats
    underusedCount,
    optimalCount,
    overusedCount
  }
}

export default useTermHighlight
