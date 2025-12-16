"use client"

// ============================================
// AI WRITER - Main Component
// ============================================
// Refactored from 1,114 lines to ~280 lines
// Original: components/features/ai-writer/ai-writer-content.tsx
// ============================================

import { useState, useEffect, useCallback, useMemo } from "react"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Placeholder from "@tiptap/extension-placeholder"
import Image from "@tiptap/extension-image"
import Link from "@tiptap/extension-link"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChevronLeft, Rocket } from "lucide-react"

// Feature imports
import type { NLPKeyword, EditorStats, AIAction } from "./types"
import {
  INITIAL_NLP_KEYWORDS,
  CRITICAL_ISSUES_CONFIG,
  DEFAULT_EDITOR_STATS,
} from "./constants"
import { AI_GENERATED_CONTENT, INITIAL_EDITOR_CONTENT } from "./__mocks__"
import {
  analyzeEditorContent,
  updateNLPKeywordsUsage,
  calculateSEOScore,
  generateSlug,
  generateExportHTML,
} from "./utils"
import {
  ImagePlaceholder,
  EditorToolbar,
  SelectionToolbar,
  SEOScoreGauge,
  AIWritingIndicator,
  ToastNotification,
  OptimizationTab,
  OutlineTab,
  CompetitorsTab,
} from "./components"

export function AIWriterContent() {
  // Meta states
  const [title, setTitle] = useState("How to Use AI Agents to Automate Your Workflow")
  const [slug, setSlug] = useState("ai-agents-automate-workflow")
  const [targetKeyword, setTargetKeyword] = useState("AI Agents")

  // UI states
  const [isAIGenerating, setIsAIGenerating] = useState(false)
  const [aiAction, setAiAction] = useState<AIAction>(null)
  const [featuredImageUrl, setFeaturedImageUrl] = useState<string | null>(null)
  const [hasSelection, setHasSelection] = useState(false)

  // NLP Keywords state
  const [nlpKeywords, setNlpKeywords] = useState<NLPKeyword[]>(INITIAL_NLP_KEYWORDS)

  // Editor stats state
  const [editorStats, setEditorStats] = useState<EditorStats>(DEFAULT_EDITOR_STATS)

  // Toast state
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState("")

  // Show toast notification
  const showNotification = useCallback((message: string) => {
    setToastMessage(message)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }, [])

  // Initialize Tiptap Editor
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Placeholder.configure({
        placeholder: "Start writing with AI...",
        emptyEditorClass: "is-editor-empty",
      }),
      Image.configure({
        HTMLAttributes: { class: "rounded-lg max-w-full h-auto" },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: "text-emerald-400 underline hover:text-emerald-300" },
      }),
    ],
    content: INITIAL_EDITOR_CONTENT,
    editorProps: {
      attributes: {
        class: "prose prose-invert prose-lg max-w-none focus:outline-none min-h-[500px] px-8 py-6",
      },
    },
    onUpdate: ({ editor: ed }) => {
      const html = ed.getHTML()
      const text = ed.getText()
      const stats = analyzeEditorContent(html, text, targetKeyword, featuredImageUrl)
      setEditorStats(stats)
      setNlpKeywords((prev) => updateNLPKeywordsUsage(prev, text.toLowerCase()))
    },
    onSelectionUpdate: ({ editor: ed }) => {
      setHasSelection(!ed.state.selection.empty)
    },
  })

  // Calculate SEO Score
  const seoScore = useMemo(
    () => calculateSEOScore(editorStats, nlpKeywords, CRITICAL_ISSUES_CONFIG),
    [editorStats, nlpKeywords]
  )

  // Simulate AI Writing - streams text character by character
  const simulateAIWriting = useCallback(
    async (content: string, mode: "append" | "replace" = "append") => {
      if (!editor) return
      setIsAIGenerating(true)

      if (mode === "replace") {
        editor.chain().focus().deleteSelection().run()
      } else {
        editor.chain().focus().setTextSelection(editor.state.doc.content.size).run()
      }

      const chars = content.split("")
      for (let i = 0; i < chars.length; i++) {
        await new Promise((resolve) => setTimeout(resolve, 10))
        editor.chain().focus().insertContent(chars[i]).run()
      }

      setIsAIGenerating(false)
      setAiAction(null)
      showNotification("AI content generated successfully! ✨")
    },
    [editor, showNotification]
  )

  // AI Action handlers
  const handleGenerateFAQ = useCallback(async () => {
    setAiAction("faq")
    await simulateAIWriting(AI_GENERATED_CONTENT.faq)
  }, [simulateAIWriting])

  const handleWriteConclusion = useCallback(async () => {
    setAiAction("conclusion")
    await simulateAIWriting(AI_GENERATED_CONTENT.conclusion)
  }, [simulateAIWriting])

  const handleExpand = useCallback(async () => {
    if (!editor) return
    setAiAction("expand")
    setIsAIGenerating(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    editor.chain().focus().deleteSelection().run()
    await simulateAIWriting(AI_GENERATED_CONTENT.expand, "replace")
  }, [editor, simulateAIWriting])

  const handleRewrite = useCallback(async () => {
    if (!editor) return
    setAiAction("rewrite")
    setIsAIGenerating(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    editor.chain().focus().deleteSelection().run()
    await simulateAIWriting(AI_GENERATED_CONTENT.rewrite, "replace")
  }, [editor, simulateAIWriting])

  const handleShorten = useCallback(async () => {
    if (!editor) return
    setAiAction("shorten")
    setIsAIGenerating(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    editor.chain().focus().deleteSelection().run()
    await simulateAIWriting(AI_GENERATED_CONTENT.shorten, "replace")
  }, [editor, simulateAIWriting])

  // Handle Export
  const handleExport = useCallback(async () => {
    if (!editor) return
    const html = editor.getHTML()
    const fullHtml = generateExportHTML(title, html, featuredImageUrl)
    try {
      await navigator.clipboard.writeText(fullHtml)
      showNotification("Article HTML copied to clipboard! 📋")
    } catch {
      showNotification("Failed to copy to clipboard")
    }
  }, [editor, title, featuredImageUrl, showNotification])

  // Handle image upload
  const handleImageUpload = useCallback(
    (url: string) => {
      setFeaturedImageUrl(url)
      if (editor) {
        const html = editor.getHTML()
        const text = editor.getText()
        setEditorStats(analyzeEditorContent(html, text, targetKeyword, url))
      }
      showNotification("Featured image uploaded! 🖼️")
    },
    [editor, targetKeyword, showNotification]
  )

  // Initial content analysis
  useEffect(() => {
    if (editor) {
      const html = editor.getHTML()
      const text = editor.getText()
      setEditorStats(analyzeEditorContent(html, text, targetKeyword, featuredImageUrl))
    }
  }, [editor, targetKeyword, featuredImageUrl])

  // Auto-generate slug from title
  useEffect(() => {
    setSlug(generateSlug(title))
  }, [title])

  return (
    <main className="flex-1 flex flex-col min-h-screen">
      {/* Editor Header */}
      <header className="sticky top-0 z-10 flex items-center justify-between px-6 py-3 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center gap-4">
          <SidebarTrigger />
          <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
            <ChevronLeft className="h-4 w-4" />
            Back to Roadmap
          </Button>
          <div className="h-4 w-px bg-border" />
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="border-0 bg-transparent text-lg font-medium w-[400px] focus-visible:ring-0 focus-visible:ring-offset-0 px-0"
          />
        </div>

        <div className="flex items-center gap-4">
          {/* Live Stats */}
          <div className="hidden lg:flex items-center gap-4 text-xs text-muted-foreground">
            <span>{editorStats.wordCount} words</span>
            <span className="h-3 w-px bg-border" />
            <span>
              {editorStats.headingCount.h1 + editorStats.headingCount.h2 + editorStats.headingCount.h3} headings
            </span>
            <span className="h-3 w-px bg-border" />
            <span>{editorStats.imageCount} images</span>
          </div>

          <SEOScoreGauge score={seoScore} />

          <Button
            onClick={handleExport}
            className="gap-2 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white shadow-lg shadow-emerald-500/25"
          >
            <Rocket className="h-4 w-4" />
            Export / Publish
          </Button>
        </div>
      </header>

      {/* Main Layout - Two Column Split */}
      <div className="flex-1 flex">
        {/* Column A: The Editor (70%) */}
        <div className="flex-1 w-[70%] overflow-y-auto">
          <div className="max-w-3xl mx-auto p-8">
            {/* Meta Info Bar */}
            <div className="flex items-center gap-4 mb-6 p-3 bg-card/50 rounded-lg border border-border">
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

            {/* Featured Image Placeholder */}
            <ImagePlaceholder onUpload={handleImageUpload} />

            {/* Editor Toolbar */}
            <EditorToolbar editor={editor} />

            {/* Tiptap Editor */}
            <div className="bg-card/30 rounded-b-lg border border-t-0 border-border min-h-[500px] relative">
              <EditorContent editor={editor} />
              
              {/* Selection Floating Toolbar */}
              <SelectionToolbar
                isVisible={hasSelection}
                isAIGenerating={isAIGenerating}
                aiAction={aiAction}
                onExpand={handleExpand}
                onRewrite={handleRewrite}
                onShorten={handleShorten}
              />
            </div>

            {/* AI Generating Indicator */}
            <AIWritingIndicator isVisible={isAIGenerating} />
          </div>
        </div>

        {/* Column B: SEO Copilot Sidebar (30%) */}
        <aside className="w-[350px] border-l border-border bg-card/50 flex flex-col sticky top-[73px] h-[calc(100vh-73px)] overflow-hidden">
          <Tabs defaultValue="optimization" className="flex-1 flex flex-col">
            <TabsList className="w-full justify-start rounded-none border-b border-border bg-transparent p-0">
              <TabsTrigger
                value="optimization"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-emerald-500 data-[state=active]:bg-transparent data-[state=active]:text-emerald-400 px-4 py-3"
              >
                Optimization
              </TabsTrigger>
              <TabsTrigger
                value="outline"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-emerald-500 data-[state=active]:bg-transparent data-[state=active]:text-emerald-400 px-4 py-3"
              >
                Outline
              </TabsTrigger>
              <TabsTrigger
                value="competitors"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-emerald-500 data-[state=active]:bg-transparent data-[state=active]:text-emerald-400 px-4 py-3"
              >
                Competitors
              </TabsTrigger>
            </TabsList>

            <TabsContent value="optimization" className="flex-1 m-0">
              <OptimizationTab
                editorStats={editorStats}
                nlpKeywords={nlpKeywords}
                criticalIssues={CRITICAL_ISSUES_CONFIG}
                targetKeyword={targetKeyword}
                isAIGenerating={isAIGenerating}
                aiAction={aiAction}
                onGenerateFAQ={handleGenerateFAQ}
                onWriteConclusion={handleWriteConclusion}
              />
            </TabsContent>

            <TabsContent value="outline" className="flex-1 m-0">
              <OutlineTab editorStats={editorStats} title={title} />
            </TabsContent>

            <TabsContent value="competitors" className="flex-1 m-0">
              <CompetitorsTab editorStats={editorStats} />
            </TabsContent>
          </Tabs>
        </aside>
      </div>

      {/* Toast Notification */}
      <ToastNotification show={showToast} message={toastMessage} />
    </main>
  )
}
