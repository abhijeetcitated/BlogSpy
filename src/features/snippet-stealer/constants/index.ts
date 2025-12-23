// Snippet Stealer Constants
import { FileText, List, Table2 } from "lucide-react"

export const SNIPPET_TYPE_ICONS = {
  paragraph: FileText,
  list: List,
  table: Table2,
} as const

export const SNIPPET_TYPE_LABELS = {
  paragraph: "Paragraph",
  list: "List",
  table: "Table",
} as const

export const WORD_COUNT_THRESHOLDS = {
  min: 30,
  idealMax: 60,
  displayMax: 70,
} as const

export const KEYWORD_THRESHOLDS = {
  good: 4,
  medium: 2,
} as const

export const COMPETITOR_WORD_COUNT_RANGE = {
  min: 40,
  max: 50,
} as const

/**
 * Delay constants for async operations (in milliseconds)
 * Centralized for consistent timing across the feature
 */
export const DELAYS = {
  /** Toast notification auto-hide duration */
  TOAST_DURATION: 3000,
  /** AI generation simulation delay */
  GENERATE_DELAY: 2000,
  /** Save operation simulation delay */
  SAVE_DELAY: 800,
} as const
