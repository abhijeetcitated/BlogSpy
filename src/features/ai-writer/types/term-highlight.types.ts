// ============================================
// AI WRITER - TERM HIGHLIGHTING TYPES
// ============================================
// Feature #4: Real-time NLP term highlighting
// in the TipTap editor
// ============================================

import type { NLPTermStatus, NLPTermPriority } from './nlp-terms.types'

/**
 * Term highlight style configuration
 */
export interface TermHighlightStyle {
  backgroundColor: string
  borderColor: string
  textColor?: string
  underline?: boolean
  dotted?: boolean
}

/**
 * Highlight configuration for different term statuses
 */
export interface HighlightConfig {
  missing: TermHighlightStyle
  underused: TermHighlightStyle
  optimal: TermHighlightStyle
  overused: TermHighlightStyle
}

/**
 * Term highlight instance in the editor
 */
export interface TermHighlight {
  id: string
  term: string
  normalizedTerm: string
  status: NLPTermStatus
  priority: NLPTermPriority
  from: number  // Position in editor
  to: number    // Position in editor
  count: number // Current usage count
}

/**
 * Highlight decoration for TipTap
 */
export interface HighlightDecoration {
  from: number
  to: number
  class: string
  attributes: {
    'data-term': string
    'data-status': NLPTermStatus
    'data-priority': NLPTermPriority
    'data-count': string
  }
}

/**
 * Highlight panel state
 */
export interface HighlightPanelState {
  enabled: boolean
  showMissing: boolean
  showUnderused: boolean
  showOptimal: boolean
  showOverused: boolean
  showOnlyPrimary: boolean
  intensity: 'subtle' | 'normal' | 'strong'
}

/**
 * Default highlight colors (CSS classes)
 */
export const HIGHLIGHT_COLORS: Record<NLPTermStatus, TermHighlightStyle> = {
  missing: {
    backgroundColor: 'rgba(239, 68, 68, 0.0)',  // Not highlighted (missing)
    borderColor: 'transparent',
    textColor: undefined
  },
  underused: {
    backgroundColor: 'rgba(251, 191, 36, 0.25)',  // Yellow/amber
    borderColor: 'rgb(251, 191, 36)',
    underline: true,
    dotted: true
  },
  optimal: {
    backgroundColor: 'rgba(34, 197, 94, 0.20)',  // Green
    borderColor: 'rgb(34, 197, 94)',
    underline: false
  },
  overused: {
    backgroundColor: 'rgba(239, 68, 68, 0.25)',  // Red
    borderColor: 'rgb(239, 68, 68)',
    underline: true,
    dotted: false
  }
}

/**
 * Highlight intensity multipliers
 */
export const INTENSITY_MULTIPLIERS: Record<HighlightPanelState['intensity'], number> = {
  subtle: 0.5,
  normal: 1,
  strong: 1.5
}

/**
 * Default highlight panel state
 */
export const DEFAULT_HIGHLIGHT_STATE: HighlightPanelState = {
  enabled: true,
  showMissing: false,  // Don't highlight missing (nothing to highlight)
  showUnderused: true,
  showOptimal: true,
  showOverused: true,
  showOnlyPrimary: false,
  intensity: 'normal'
}
