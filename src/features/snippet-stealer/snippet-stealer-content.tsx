"use client"

import { useState, useMemo, useCallback } from "react"
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
  
  // Toast state
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState("")

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
    setTimeout(() => setShowToast(false), 3000)
  }, [])

  // Handle snippet selection
  const handleSelectSnippet = useCallback((snippet: SnippetOpportunity) => {
    setSelectedSnippet(snippet)
    setUserSnippet("")
    setViewMode("editor")
  }, [])

  // Handle AI generation
  const handleGenerate = useCallback(async () => {
    setIsGenerating(true)
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const response = AI_RESPONSES[selectedSnippet.id] || 
      DEFAULT_AI_RESPONSE_TEMPLATE(selectedSnippet.keyword)
    
    setUserSnippet(response)
    setIsGenerating(false)
    showNotification("AI snippet generated successfully! ✨")
  }, [selectedSnippet, showNotification])

  // Handle save snippet
  const handleSave = useCallback(async () => {
    if (!userSnippet.trim()) {
      showNotification("Please write or generate a snippet first")
      return
    }
    
    setIsSaving(true)
    await new Promise(resolve => setTimeout(resolve, 800))
    
    setSavedSnippets(prev => new Set([...prev, selectedSnippet.id]))
    setIsSaving(false)
    showNotification(`Snippet saved to Content Plan for "${selectedSnippet.keyword}" 🎯`)
  }, [selectedSnippet, userSnippet, showNotification])

  return (
    <main className="flex-1 flex overflow-hidden bg-background">
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
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
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
