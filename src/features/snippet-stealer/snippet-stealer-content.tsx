"use client"

import { useState, useMemo, useCallback, useRef, useEffect } from "react"
import {
  ToastNotification,
  OpportunityList,
  CompetitorSnippetCard,
  SnippetEditor,
  GooglePreview,
  WorkbenchHeader,
} from "./components"
import { MOCK_OPPORTUNITIES, AI_RESPONSES, DEFAULT_AI_RESPONSE_TEMPLATE } from "./__mocks__/snippet-data"
import { calculateWordCount, calculateKeywordsUsed } from "./utils/snippet-utils"
import { DELAYS } from "./constants"
import type { SnippetOpportunity, ViewMode, FilterType } from "./types"

export function SnippetStealerContent() {
  // Core state
  const [selectedSnippet, setSelectedSnippet] = useState<SnippetOpportunity>(MOCK_OPPORTUNITIES[0])
  const [filterType, setFilterType] = useState<FilterType>("all")
  const [userSnippet, setUserSnippet] = useState("")
  const [viewMode, setViewMode] = useState<ViewMode>("editor")
  
  // Action states
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [savedSnippets, setSavedSnippets] = useState<Set<string>>(new Set())
  const [error, setError] = useState<string | null>(null)
  
  // Toast state
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState("")
  
  // Timer refs for cleanup
  const toastTimerRef = useRef<NodeJS.Timeout | null>(null)
  const generateTimerRef = useRef<NodeJS.Timeout | null>(null)
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null)
  
  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
      if (generateTimerRef.current) clearTimeout(generateTimerRef.current)
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    }
  }, [])

  // Computed values
  const wordCount = useMemo(() => calculateWordCount(userSnippet), [userSnippet])
  const keywordsUsed = useMemo(
    () => calculateKeywordsUsed(userSnippet, selectedSnippet.targetKeywords),
    [userSnippet, selectedSnippet.targetKeywords]
  )
  const isSnippetSaved = savedSnippets.has(selectedSnippet.id)
  const hasContent = userSnippet.trim().length > 0

  // Show toast notification
  const showNotification = useCallback((message: string) => {
    setToastMessage(message)
    setShowToast(true)
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    toastTimerRef.current = setTimeout(() => setShowToast(false), DELAYS.TOAST_DURATION)
  }, [])

  // Handle snippet selection
  const handleSelectSnippet = useCallback((snippet: SnippetOpportunity) => {
    setSelectedSnippet(snippet)
    setUserSnippet("")
    setViewMode("editor")
  }, [])

  // Handle AI generation
  const handleGenerate = useCallback(async () => {
    try {
      setError(null)
      setIsGenerating(true)
      
      await new Promise(resolve => {
        generateTimerRef.current = setTimeout(resolve, DELAYS.GENERATE_DELAY)
      })
      
      const response = AI_RESPONSES[selectedSnippet.id] || 
        DEFAULT_AI_RESPONSE_TEMPLATE(selectedSnippet.keyword)
      
      setUserSnippet(response)
      showNotification("AI snippet generated successfully! ✨")
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to generate snippet"
      setError(message)
      showNotification(`Error: ${message}`)
    } finally {
      setIsGenerating(false)
    }
  }, [selectedSnippet, showNotification])

  // Handle save snippet
  const handleSave = useCallback(async () => {
    if (!userSnippet.trim()) {
      showNotification("Please write or generate a snippet first")
      return
    }
    
    try {
      setError(null)
      setIsSaving(true)
      
      await new Promise(resolve => {
        saveTimerRef.current = setTimeout(resolve, DELAYS.SAVE_DELAY)
      })
      
      setSavedSnippets(prev => new Set([...prev, selectedSnippet.id]))
      showNotification(`Snippet saved to Content Plan for "${selectedSnippet.keyword}" 🎯`)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save snippet"
      setError(message)
      showNotification(`Error: ${message}`)
    } finally {
      setIsSaving(false)
    }
  }, [selectedSnippet, userSnippet, showNotification])

  return (
    <main className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-background">
      {/* Left Panel - Opportunities List */}
      <OpportunityList
        opportunities={MOCK_OPPORTUNITIES}
        selectedId={selectedSnippet.id}
        savedIds={savedSnippets}
        filterType={filterType}
        onFilterChange={setFilterType}
        onSelect={handleSelectSnippet}
      />

      {/* Right Panel - Workbench */}
      <div className="flex-1 bg-background flex flex-col overflow-hidden">
        <WorkbenchHeader
          snippet={selectedSnippet}
          viewMode={viewMode}
          isSaved={isSnippetSaved}
          hasContent={hasContent}
          onViewModeChange={setViewMode}
        />

        {/* Workbench Content */}
        <div className="flex-1 overflow-y-auto space-y-4 sm:space-y-6">
          {/* Competitor Snippet */}
          <CompetitorSnippetCard snippet={selectedSnippet} />

          {/* Conditional Render: Editor or Preview */}
          {viewMode === "editor" ? (
            <SnippetEditor
              snippet={selectedSnippet}
              userSnippet={userSnippet}
              wordCount={wordCount}
              keywordsUsed={keywordsUsed}
              isGenerating={isGenerating}
              isSaving={isSaving}
              isSaved={isSnippetSaved}
              onSnippetChange={setUserSnippet}
              onGenerate={handleGenerate}
              onSave={handleSave}
            />
          ) : (
            <GooglePreview
              snippet={selectedSnippet}
              userSnippet={userSnippet}
              wordCount={wordCount}
              keywordsUsed={keywordsUsed}
              onBackToEditor={() => setViewMode("editor")}
            />
          )}
        </div>
      </div>

      {/* Toast Notification */}
      <ToastNotification message={toastMessage} show={showToast} />
    </main>
  )
}
