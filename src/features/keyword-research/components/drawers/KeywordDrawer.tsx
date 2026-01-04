"use client"

// ============================================
// KEYWORD DRAWER (Store-Connected) - Wrapper
// ============================================
// This wrapper connects KeywordDetailsDrawer to Zustand store
// Opens automatically when selectedKeyword is set
// ============================================

import { useKeywordStore } from "../../store"
import { KeywordDetailsDrawer } from "./KeywordDetailsDrawer"

export function KeywordDrawer() {
  const selectedKeyword = useKeywordStore((state) => state.selectedKeyword)
  const closeKeywordDrawer = useKeywordStore((state) => state.closeKeywordDrawer)

  return (
    <KeywordDetailsDrawer
      keyword={selectedKeyword}
      isOpen={selectedKeyword !== null}
      onClose={closeKeywordDrawer}
    />
  )
}

export default KeywordDrawer
