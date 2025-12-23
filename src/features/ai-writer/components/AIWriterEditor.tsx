/**
 * AIWriterEditor - Editor Component for AI Writer
 * 
 * This component handles:
 * - Context banner display
 * - Slug and keyword inputs
 * - Featured image placeholder
 * - TipTap editor with toolbar
 * - Selection toolbar for AI operations
 * - AI writing indicator
 * 
 * Industry Standard: Single Responsibility Principle
 */

"use client"

import React from "react"
import type { Editor } from "@tiptap/react"
import { EditorContent } from "@tiptap/react"
import { Input } from "@/components/ui/input"
import { EditorToolbar } from "../components/editor-toolbar"
import { SelectionToolbar } from "../components/selection-toolbar"
import { ImagePlaceholder } from "../components/image-placeholder"
import { ContextBanner } from "../components/context-banner"
import { AIWritingIndicator } from "../components/ai-writing-indicator"
import type { WriterContext, AIAction } from "../types"

// ============================================
// TYPES
// ============================================

export interface AIWriterEditorProps {
  // TipTap Editor
  editor: Editor | null
  
  // Meta fields
  slug: string
  setSlug: (slug: string) => void
  targetKeyword: string
  setTargetKeyword: (keyword: string) => void
  title: string
  
  // Context
  writerContext: WriterContext | null
  showContext: boolean
  setShowContext: (show: boolean) => void
  
  // AI State
  isAIGenerating: boolean
  generationProgress: number
  aiAction: AIAction
  
  // Selection State
  hasSelection: boolean
  
  // Handlers
  onImageUpload: (url: string) => void
  onApplyRecommendations: () => void
  onInsertLink: (url: string, text: string) => void
  onExpand: () => void
  onRewrite: () => void
  onShorten: () => void
  
  // Copilot Sidebar (for mobile sheet)
  copilotSidebar: React.ReactNode
}

// ============================================
// COMPONENT
// ============================================

export function AIWriterEditor({
  editor,
  slug,
  setSlug,
  targetKeyword,
  setTargetKeyword,
  title,
  writerContext,
  showContext,
  setShowContext,
  isAIGenerating,
  generationProgress,
  aiAction,
  hasSelection,
  onImageUpload,
  onApplyRecommendations,
  onInsertLink,
  onExpand,
  onRewrite,
  onShorten,
  copilotSidebar,
}: AIWriterEditorProps) {
  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Column A: The Editor - Scrollable */}
      <div className="flex-1 min-w-0 overflow-y-auto">
        {/* Context Banner - Shows when coming from another feature */}
        {showContext && writerContext && (
          <ContextBanner
            context={writerContext}
            onDismiss={() => setShowContext(false)}
            onApplyRecommendations={onApplyRecommendations}
            onInsertLink={onInsertLink}
            isGenerating={isAIGenerating}
            generationProgress={generationProgress}
          />
        )}
        
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          {/* Meta Info Bar */}
          <MetaInfoBar
            slug={slug}
            setSlug={setSlug}
            targetKeyword={targetKeyword}
            setTargetKeyword={setTargetKeyword}
          />

          {/* Featured Image Placeholder */}
          <ImagePlaceholder 
            onUpload={onImageUpload} 
            keyword={targetKeyword}
            title={title}
          />

          {/* Editor Toolbar */}
          <EditorToolbar editor={editor} />

          {/* Tiptap Editor */}
          <div className="bg-card/30 rounded-b-lg border border-t-0 border-border min-h-125 relative">
            <EditorContent
              editor={editor}
              className="[&_.ProseMirror]:px-4 sm:[&_.ProseMirror]:px-6 [&_.ProseMirror]:py-5 sm:[&_.ProseMirror]:py-6 [&_.ProseMirror]:text-base [&_.ProseMirror]:leading-7 [&_.ProseMirror]:outline-none"
            />
            
            {/* Selection Floating Toolbar */}
            <SelectionToolbar
              isVisible={hasSelection}
              isAIGenerating={isAIGenerating}
              aiAction={aiAction}
              onExpand={onExpand}
              onRewrite={onRewrite}
              onShorten={onShorten}
            />
          </div>

          {/* AI Generating Indicator */}
          <AIWritingIndicator isVisible={isAIGenerating} />
        </div>
      </div>

      {/* Column B: SEO Copilot Sidebar (Desktop only) */}
      <aside className="hidden lg:flex w-[320px] shrink-0 border-l border-border/50 bg-card/30 flex-col overflow-hidden">
        {copilotSidebar}
      </aside>
    </div>
  )
}

// ============================================
// SUB-COMPONENTS
// ============================================

interface MetaInfoBarProps {
  slug: string
  setSlug: (slug: string) => void
  targetKeyword: string
  setTargetKeyword: (keyword: string) => void
}

function MetaInfoBar({
  slug,
  setSlug,
  targetKeyword,
  setTargetKeyword,
}: MetaInfoBarProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-6 p-3 bg-card/50 rounded-lg border border-border">
      <div className="flex-1">
        <label className="text-xs text-muted-foreground mb-1 block">Slug</label>
        <Input
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          className="h-8 text-sm bg-muted/50"
          placeholder="url-slug"
        />
      </div>
      <div className="flex-1">
        <label className="text-xs text-muted-foreground mb-1 block">Target Keyword</label>
        <Input
          value={targetKeyword}
          onChange={(e) => setTargetKeyword(e.target.value)}
          className="h-8 text-sm bg-muted/50"
          placeholder="Primary keyword"
        />
      </div>
    </div>
  )
}

export default AIWriterEditor
