/**
 * useEditorState - Centralized Editor State Management
 * 
 * This hook manages all editor-related state in one place:
 * - Title, slug, target keyword
 * - Editor stats (word count, headings, images)
 * - NLP keywords tracking
 * - Featured image
 * - Save status and draft management
 * 
 * Industry Standard: Single Responsibility Principle
 */

import { useState, useCallback, useMemo, useRef, useEffect } from "react"
import type { Editor } from "@tiptap/react"
import type { NLPKeyword, EditorStats, WriterContext } from "../types"
import {
  INITIAL_NLP_KEYWORDS,
  CRITICAL_ISSUES_CONFIG,
  DEFAULT_EDITOR_STATS,
} from "../constants"
import {
  analyzeEditorContent,
  updateNLPKeywordsUsage,
  calculateSEOScore,
  generateSlug,
} from "../utils"
import { draftService, readabilityService } from "../services"

// ============================================
// TYPES
// ============================================

export interface ReadabilityScore {
  fleschKincaid: number
  gradeLevel: string
  readingTime: number
  issues: string[]
}

export interface UseEditorStateOptions {
  initialKeyword?: string
  initialTitle?: string
  writerContext?: WriterContext | null
}

export interface UseEditorStateReturn {
  // Meta state
  title: string
  setTitle: (title: string) => void
  slug: string
  setSlug: (slug: string) => void
  targetKeyword: string
  setTargetKeyword: (keyword: string) => void
  
  // Editor stats
  editorStats: EditorStats
  setEditorStats: (stats: EditorStats) => void
  
  // NLP Keywords
  nlpKeywords: NLPKeyword[]
  setNlpKeywords: React.Dispatch<React.SetStateAction<NLPKeyword[]>>
  
  // Featured image
  featuredImageUrl: string | null
  setFeaturedImageUrl: (url: string | null) => void
  
  // Readability
  readabilityScore: ReadabilityScore | null
  
  // SEO Score (derived)
  seoScore: number
  
  // Save state
  isSaving: boolean
  lastSaved: Date | null
  hasUnsavedChanges: boolean
  currentDraftId: string | null
  
  // Actions
  saveContent: (editor: Editor, isAutoSave?: boolean) => Promise<void>
  scheduleAutoSave: (editor: Editor) => void
  updateEditorContent: (editor: Editor) => void
  handleImageUpload: (editor: Editor, url: string, showNotification: (msg: string) => void) => void
}

// ============================================
// HELPER: Generate title from keyword
// ============================================

function generateTitleFromKeyword(keyword: string, intent: string): string {
  const capitalizedKeyword = keyword
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
  
  const lowerKeyword = keyword.toLowerCase()
  
  switch (intent) {
    case "commercial":
      if (lowerKeyword.startsWith("best ")) {
        return `${capitalizedKeyword} in ${new Date().getFullYear()} (Tested & Reviewed)`
      }
      return `Best ${capitalizedKeyword} in ${new Date().getFullYear()} (Tested & Reviewed)`
    case "transactional":
      return `${capitalizedKeyword} - Get Started Today`
    case "navigational":
      return `${capitalizedKeyword} - Official Guide`
    case "informational":
    default:
      if (lowerKeyword.startsWith("how to ")) {
        return `${capitalizedKeyword}: Complete Guide ${new Date().getFullYear()}`
      }
      if (lowerKeyword.startsWith("what ") || lowerKeyword.startsWith("why ") || lowerKeyword.startsWith("when ")) {
        return `${capitalizedKeyword}: Complete Guide ${new Date().getFullYear()}`
      }
      return `How to Use ${capitalizedKeyword}: Complete Guide ${new Date().getFullYear()}`
  }
}

// ============================================
// HOOK
// ============================================

export function useEditorState(options: UseEditorStateOptions = {}): UseEditorStateReturn {
  const { writerContext } = options
  
  // ========================================
  // META STATE
  // ========================================
  const [title, setTitle] = useState(() => {
    if (writerContext?.keyword) {
      return generateTitleFromKeyword(writerContext.keyword, writerContext.intent)
    }
    return options.initialTitle || "How to Use AI Agents to Automate Your Workflow"
  })
  
  const [slug, setSlug] = useState(() => generateSlug(title))
  
  const [targetKeyword, setTargetKeyword] = useState(() => {
    return writerContext?.keyword || options.initialKeyword || "AI Agents"
  })
  
  // ========================================
  // EDITOR STATS STATE
  // ========================================
  const [editorStats, setEditorStats] = useState<EditorStats>(DEFAULT_EDITOR_STATS)
  
  // ========================================
  // NLP KEYWORDS STATE
  // ========================================
  const [nlpKeywords, setNlpKeywords] = useState<NLPKeyword[]>(INITIAL_NLP_KEYWORDS)
  
  // ========================================
  // FEATURED IMAGE STATE
  // ========================================
  const [featuredImageUrl, setFeaturedImageUrl] = useState<string | null>(null)
  
  // ========================================
  // READABILITY STATE
  // ========================================
  const [readabilityScore, setReadabilityScore] = useState<ReadabilityScore | null>(null)
  
  // ========================================
  // DRAFT & PERSISTENCE STATE
  // ========================================
  const [currentDraftId, setCurrentDraftId] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null)
  
  // ========================================
  // DERIVED: SEO SCORE
  // ========================================
  const seoScore = useMemo(
    () => calculateSEOScore(editorStats, nlpKeywords, CRITICAL_ISSUES_CONFIG),
    [editorStats, nlpKeywords]
  )
  
  // ========================================
  // AUTO-GENERATE SLUG FROM TITLE
  // ========================================
  useEffect(() => {
    setSlug(generateSlug(title))
  }, [title])
  
  // ========================================
  // CLEANUP AUTO-SAVE TIMER
  // ========================================
  useEffect(() => {
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current)
      }
    }
  }, [])
  
  // ========================================
  // SAVE CONTENT
  // ========================================
  const saveContent = useCallback(async (editor: Editor, isAutoSave = false) => {
    const content = editor.getHTML()
    if (!content.trim()) return
    
    setIsSaving(true)
    try {
      if (currentDraftId) {
        await draftService.updateDraft(currentDraftId, {
          content,
          title,
          keyword: targetKeyword
        })
      } else {
        const draft = await draftService.createDraft({
          title,
          content,
          keyword: targetKeyword
        })
        setCurrentDraftId(draft.id)
      }
      
      setLastSaved(new Date())
      setHasUnsavedChanges(false)
    } catch (error) {
      console.error("Save error:", error)
    } finally {
      setIsSaving(false)
    }
  }, [currentDraftId, title, targetKeyword])
  
  // ========================================
  // SCHEDULE AUTO-SAVE
  // ========================================
  const scheduleAutoSave = useCallback((editor: Editor) => {
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current)
    }
    autoSaveTimerRef.current = setTimeout(() => {
      saveContent(editor, true)
    }, 30000) // Auto-save every 30 seconds
  }, [saveContent])
  
  // ========================================
  // UPDATE EDITOR CONTENT (on editor update)
  // ========================================
  const updateEditorContent = useCallback((editor: Editor) => {
    const html = editor.getHTML()
    const text = editor.getText()
    
    // Update stats
    const stats = analyzeEditorContent(html, text, targetKeyword, featuredImageUrl)
    setEditorStats(stats)
    
    // Update NLP keywords usage
    setNlpKeywords(prev => updateNLPKeywordsUsage(prev, text.toLowerCase()))
    
    // Mark unsaved
    setHasUnsavedChanges(true)
    
    // Update readability
    const readability = readabilityService.analyze(text)
    setReadabilityScore({
      fleschKincaid: readability.score.fleschKincaidGrade,
      gradeLevel: readability.score.readingLevel,
      readingTime: readability.stats.readingTimeMinutes,
      issues: readability.issues.map(i => i.suggestion)
    })
    
    // Schedule auto-save
    scheduleAutoSave(editor)
  }, [targetKeyword, featuredImageUrl, scheduleAutoSave])
  
  // ========================================
  // HANDLE IMAGE UPLOAD
  // ========================================
  const handleImageUpload = useCallback((editor: Editor, url: string, showNotification: (msg: string) => void) => {
    setFeaturedImageUrl(url)
    
    const html = editor.getHTML()
    const text = editor.getText()
    setEditorStats(analyzeEditorContent(html, text, targetKeyword, url))
    
    showNotification("Featured image uploaded! 🖼️")
  }, [targetKeyword])
  
  return {
    // Meta state
    title,
    setTitle,
    slug,
    setSlug,
    targetKeyword,
    setTargetKeyword,
    
    // Editor stats
    editorStats,
    setEditorStats,
    
    // NLP Keywords
    nlpKeywords,
    setNlpKeywords,
    
    // Featured image
    featuredImageUrl,
    setFeaturedImageUrl,
    
    // Readability
    readabilityScore,
    
    // SEO Score
    seoScore,
    
    // Save state
    isSaving,
    lastSaved,
    hasUnsavedChanges,
    currentDraftId,
    
    // Actions
    saveContent,
    scheduleAutoSave,
    updateEditorContent,
    handleImageUpload,
  }
}

export default useEditorState
