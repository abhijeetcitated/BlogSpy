// ============================================
// AI WRITER - TERM HIGHLIGHTING EXTENSION
// ============================================
// Feature #4: TipTap extension for real-time
// NLP term highlighting with decorations
// ============================================

import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'
import type { NLPTerm, NLPTermStatus, NLPTermPriority } from '@/src/features/ai-writer/types/nlp-terms.types'
import type { HighlightPanelState } from '@/src/features/ai-writer/types/term-highlight.types'

// ============================================
// PLUGIN KEY
// ============================================

export const termHighlightPluginKey = new PluginKey('termHighlight')

// ============================================
// TYPES
// ============================================

interface TermHighlightOptions {
  terms: NLPTerm[]
  highlightState: HighlightPanelState
  onTermClick?: (term: NLPTerm, position: number) => void
}

interface TermHighlightStorage {
  terms: NLPTerm[]
  highlightState: HighlightPanelState
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get CSS class for term status
 */
function getStatusClass(status: NLPTermStatus): string {
  const classes: Record<NLPTermStatus, string> = {
    missing: 'nlp-term-missing',
    underused: 'nlp-term-underused',
    optimal: 'nlp-term-optimal',
    overused: 'nlp-term-overused'
  }
  return classes[status] || ''
}

/**
 * Get CSS class for term priority
 */
function getPriorityClass(priority: NLPTermPriority): string {
  const classes: Record<NLPTermPriority, string> = {
    primary: 'nlp-priority-primary',
    secondary: 'nlp-priority-secondary',
    supporting: 'nlp-priority-supporting',
    avoid: 'nlp-priority-avoid'
  }
  return classes[priority] || ''
}

/**
 * Check if a term should be highlighted based on state
 */
function shouldHighlight(
  term: NLPTerm,
  state: HighlightPanelState
): boolean {
  if (!state.enabled) return false
  
  // Check status filter
  switch (term.status) {
    case 'missing':
      if (!state.showMissing) return false
      break
    case 'underused':
      if (!state.showUnderused) return false
      break
    case 'optimal':
      if (!state.showOptimal) return false
      break
    case 'overused':
      if (!state.showOverused) return false
      break
  }
  
  // Check priority filter
  if (state.showOnlyPrimary && term.priority !== 'primary') {
    return false
  }
  
  // Skip 'avoid' terms from highlighting (they're warnings, not highlights)
  if (term.priority === 'avoid') {
    return false
  }
  
  return true
}

/**
 * Find all occurrences of a term in text
 */
function findTermOccurrences(
  text: string,
  term: string
): { start: number; end: number }[] {
  const occurrences: { start: number; end: number }[] = []
  const normalizedTerm = term.toLowerCase()
  const normalizedText = text.toLowerCase()
  
  // Create regex for word boundary matching
  const escapedTerm = normalizedTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const regex = new RegExp(`\\b${escapedTerm}\\b`, 'gi')
  
  let match
  while ((match = regex.exec(normalizedText)) !== null) {
    occurrences.push({
      start: match.index,
      end: match.index + match[0].length
    })
  }
  
  // Also check for plural forms
  if (!normalizedTerm.endsWith('s')) {
    const pluralTerm = normalizedTerm + 's'
    const pluralRegex = new RegExp(`\\b${escapedTerm}s\\b`, 'gi')
    
    while ((match = pluralRegex.exec(normalizedText)) !== null) {
      occurrences.push({
        start: match.index,
        end: match.index + match[0].length
      })
    }
  }
  
  return occurrences
}

/**
 * Build decorations for all highlighted terms
 */
function buildDecorations(
  doc: { textContent: string; nodeSize: number },
  terms: NLPTerm[],
  state: HighlightPanelState,
  getPos: (offset: number) => number
): Decoration[] {
  const decorations: Decoration[] = []
  const text = doc.textContent
  
  // Filter terms that should be highlighted
  const highlightableTerms = terms.filter(term => shouldHighlight(term, state))
  
  // Sort by term length (longer first) to avoid nested highlights
  highlightableTerms.sort((a, b) => b.term.length - a.term.length)
  
  // Track highlighted ranges to avoid overlaps
  const highlightedRanges: Set<string> = new Set()
  
  for (const term of highlightableTerms) {
    // Skip if term has no occurrences (missing)
    if (term.status === 'missing' || term.currentCount === 0) {
      continue
    }
    
    const occurrences = findTermOccurrences(text, term.term)
    
    for (const occ of occurrences) {
      // Check for overlap with existing highlights
      const rangeKey = `${occ.start}-${occ.end}`
      if (highlightedRanges.has(rangeKey)) {
        continue
      }
      
      // Check if this range overlaps with any existing range
      let hasOverlap = false
      for (const existingRange of highlightedRanges) {
        const [existStart, existEnd] = existingRange.split('-').map(Number)
        if (
          (occ.start >= existStart && occ.start < existEnd) ||
          (occ.end > existStart && occ.end <= existEnd) ||
          (occ.start <= existStart && occ.end >= existEnd)
        ) {
          hasOverlap = true
          break
        }
      }
      
      if (hasOverlap) continue
      
      // Mark range as highlighted
      highlightedRanges.add(rangeKey)
      
      // Calculate document positions (offset by 1 for ProseMirror)
      const from = occ.start + 1
      const to = occ.end + 1
      
      // Create decoration
      const statusClass = getStatusClass(term.status)
      const priorityClass = getPriorityClass(term.priority)
      const intensityClass = `nlp-intensity-${state.intensity}`
      
      decorations.push(
        Decoration.inline(from, to, {
          class: `nlp-term-highlight ${statusClass} ${priorityClass} ${intensityClass}`,
          'data-term': term.term,
          'data-status': term.status,
          'data-priority': term.priority,
          'data-count': String(term.currentCount)
        })
      )
    }
  }
  
  return decorations
}

// ============================================
// TIPTAP EXTENSION
// ============================================

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    termHighlight: {
      setHighlightTerms: (terms: NLPTerm[]) => ReturnType
      setHighlightState: (state: Partial<HighlightPanelState>) => ReturnType
      toggleHighlights: () => ReturnType
    }
  }
}

export const TermHighlight = Extension.create<TermHighlightOptions, TermHighlightStorage>({
  name: 'termHighlight',

  addOptions() {
    return {
      terms: [],
      highlightState: {
        enabled: true,
        showMissing: false,
        showUnderused: true,
        showOptimal: true,
        showOverused: true,
        showOnlyPrimary: false,
        intensity: 'normal'
      },
      onTermClick: undefined
    }
  },

  addStorage() {
    return {
      terms: this.options.terms,
      highlightState: this.options.highlightState
    }
  },

  addCommands() {
    return {
      setHighlightTerms:
        (terms: NLPTerm[]) =>
        ({ editor, tr }) => {
          this.storage.terms = terms
          // Trigger decoration update
          const { state } = editor
          editor.view.dispatch(tr.setMeta(termHighlightPluginKey, { terms }))
          return true
        },

      setHighlightState:
        (newState: Partial<HighlightPanelState>) =>
        ({ editor, tr }) => {
          this.storage.highlightState = {
            ...this.storage.highlightState,
            ...newState
          }
          editor.view.dispatch(
            tr.setMeta(termHighlightPluginKey, { 
              highlightState: this.storage.highlightState 
            })
          )
          return true
        },

      toggleHighlights:
        () =>
        ({ editor, tr }) => {
          this.storage.highlightState.enabled = !this.storage.highlightState.enabled
          editor.view.dispatch(
            tr.setMeta(termHighlightPluginKey, {
              highlightState: this.storage.highlightState
            })
          )
          return true
        }
    }
  },

  addProseMirrorPlugins() {
    const extension = this

    return [
      new Plugin({
        key: termHighlightPluginKey,

        state: {
          init(_, { doc }) {
            return DecorationSet.create(doc, [])
          },

          apply(tr, oldDecorations, oldState, newState) {
            // Check if we need to update decorations
            const meta = tr.getMeta(termHighlightPluginKey)
            const docChanged = tr.docChanged
            
            if (meta || docChanged) {
              const terms = meta?.terms || extension.storage.terms
              const highlightState = meta?.highlightState || extension.storage.highlightState
              
              // Build new decorations
              const decorations = buildDecorations(
                newState.doc,
                terms,
                highlightState,
                (offset) => offset
              )
              
              return DecorationSet.create(newState.doc, decorations)
            }
            
            // Map decorations through document changes
            if (tr.docChanged) {
              return oldDecorations.map(tr.mapping, tr.doc)
            }
            
            return oldDecorations
          }
        },

        props: {
          decorations(state) {
            return this.getState(state)
          },

          handleClick(view, pos, event) {
            const target = event.target as HTMLElement
            
            if (target.classList.contains('nlp-term-highlight')) {
              const term = target.getAttribute('data-term')
              const status = target.getAttribute('data-status') as NLPTermStatus
              const priority = target.getAttribute('data-priority') as NLPTermPriority
              
              if (term && extension.options.onTermClick) {
                const nlpTerm = extension.storage.terms.find(t => t.term === term)
                if (nlpTerm) {
                  extension.options.onTermClick(nlpTerm, pos)
                }
              }
            }
            
            return false
          }
        }
      })
    ]
  }
})

export default TermHighlight

