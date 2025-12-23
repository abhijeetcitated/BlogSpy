/**
 * AI WRITER - Refactored Main Component
 * 
 * This is the refactored version using extracted hooks and components.
 * Original: 2069 lines → Refactored: ~500 lines
 * 
 * Hooks Used:
 * - useEditorState: Editor-related state management
 * - useAIGeneration: AI content generation with typing animation
 * 
 * Components Used:
 * - AIWriterHeader: Desktop/Mobile header with stats, export, etc.
 * - AIWriterEditor: Editor area with context banner, toolbar, sidebar
 */

"use client"

import { useState, useEffect, useCallback, useMemo, useRef } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { useEditor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Placeholder from "@tiptap/extension-placeholder"
import Image from "@tiptap/extension-image"
import Link from "@tiptap/extension-link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { History, FileText } from "lucide-react"

import { Details, DetailsSummary } from "./extensions"

// Types
import type { NLPKeyword, EditorStats, AIAction, WriterContext } from "./types"
import type { WritingQueueItem } from "./components"

// Constants & Mocks
import {
  INITIAL_NLP_KEYWORDS,
  CRITICAL_ISSUES_CONFIG,
  DEFAULT_EDITOR_STATS,
} from "./constants"
import { AI_GENERATED_CONTENT, INITIAL_EDITOR_CONTENT } from "./__mocks__"

// Utils
import {
  analyzeEditorContent,
  updateNLPKeywordsUsage,
  calculateSEOScore,
  generateSlug,
  parseWriterContext,
  getDemoContextForDev,
} from "./utils"

// Components - Original
import {
  ToastNotification,
  OptimizationTab,
  OutlineTab,
  CompetitorsTab,
  MetaPanel,
  ClusterWritingMode,
} from "./components"

// Components - Refactored
import { AIWriterHeader } from "./components/AIWriterHeader"
import { AIWriterEditor } from "./components/AIWriterEditor"

// Hooks - Refactored
import { useAIGeneration } from "./hooks/useAIGeneration"

// Services
import {
  aiWriterService,
  draftService,
  versionHistoryService,
  creditsService,
  exportService,
  schemaService,
  readabilityService,
} from "./services"

// Mock data for cluster mode
import { MOCK_TOPIC_CLUSTER_FULL, getLinksForArticle } from "../topic-clusters/constants/mock-cluster-data"

// ============================================
// HELPER FUNCTIONS
// ============================================

function buildWritingQueue(): WritingQueueItem[] {
  const cluster = MOCK_TOPIC_CLUSTER_FULL
  const queue: WritingQueueItem[] = []
  
  for (const pillar of cluster.pillars) {
    const links = getLinksForArticle(pillar.id)
    queue.push({
      id: pillar.id,
      keyword: pillar.keyword,
      type: "pillar",
      status: "pending",
      subKeywords: pillar.subKeywords.map(sk => ({
        keyword: sk.keyword,
        placement: sk.placement,
        volume: sk.volume
      })),
      links: links.map(l => ({
        toKeyword: l.toKeyword,
        anchorText: l.anchorText,
        placementHint: l.placementHint
      })),
      recommendedWords: pillar.recommendedWordCount,
      recommendedHeadings: pillar.recommendedHeadings
    })
  }
  
  for (const clusterArticle of cluster.clusters) {
    const links = getLinksForArticle(clusterArticle.id)
    const parentPillar = cluster.pillars.find(p => p.id === clusterArticle.pillarId)
    
    queue.push({
      id: clusterArticle.id,
      keyword: clusterArticle.keyword,
      type: "cluster",
      status: "pending",
      parentPillar: parentPillar?.keyword,
      links: links.map(l => ({
        toKeyword: l.toKeyword,
        anchorText: l.anchorText,
        placementHint: l.placementHint
      })),
      recommendedWords: clusterArticle.recommendedWordCount,
      recommendedHeadings: clusterArticle.recommendedHeadings
    })
  }
  
  return queue
}

function capitalizeWords(str: string): string {
  return str
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ")
}

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
// MAIN COMPONENT
// ============================================

export function AIWriterContentRefactored() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  // ========================================
  // DRAFT & PERSISTENCE STATE
  // ========================================
  const [currentDraftId, setCurrentDraftId] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null)
  
  // ========================================
  // CREDITS STATE
  // ========================================
  const [creditBalance, setCreditBalance] = useState(() => creditsService.getBalance())
  
  // ========================================
  // VERSION HISTORY STATE
  // ========================================
  const [versions, setVersions] = useState<Array<{
    id: string
    timestamp: Date
    wordCount: number
    label?: string
  }>>([])
  
  // ========================================
  // READABILITY STATE
  // ========================================
  const [readabilityScore, setReadabilityScore] = useState<{
    fleschKincaid: number
    gradeLevel: string
    readingTime: number
    issues: string[]
  } | null>(null)
  
  // ========================================
  // CLUSTER MODE CHECK
  // ========================================
  const isClusterWritingMode = useMemo(() => {
    return searchParams.get("mode") === "cluster-writing"
  }, [searchParams])
  
  const clusterName = searchParams.get("cluster_name") || "AI Writing Tools"
  
  const writingQueue = useMemo(() => {
    if (isClusterWritingMode) return buildWritingQueue()
    return []
  }, [isClusterWritingMode])
  
  // ========================================
  // CONTEXT PARSING
  // ========================================
  const writerContext = useMemo(() => {
    const realContext = parseWriterContext(searchParams)
    if (!realContext) return getDemoContextForDev()
    return realContext
  }, [searchParams])
  
  const [showContext, setShowContext] = useState(true)
  
  // ========================================
  // META STATES
  // ========================================
  const [title, setTitle] = useState(() => {
    if (writerContext?.keyword) {
      return generateTitleFromKeyword(writerContext.keyword, writerContext.intent)
    }
    return "How to Use AI Agents to Automate Your Workflow"
  })
  const [slug, setSlug] = useState("ai-agents-automate-workflow")
  const [targetKeyword, setTargetKeyword] = useState(() => {
    return writerContext?.keyword || "AI Agents"
  })

  // ========================================
  // UI STATES
  // ========================================
  const [aiAction, setAiAction] = useState<AIAction>(null)
  const [featuredImageUrl, setFeaturedImageUrl] = useState<string | null>(null)
  const [hasSelection, setHasSelection] = useState(false)
  const [nlpKeywords, setNlpKeywords] = useState<NLPKeyword[]>(INITIAL_NLP_KEYWORDS)
  const [editorStats, setEditorStats] = useState<EditorStats>(DEFAULT_EDITOR_STATS)
  
  // Toast
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState("")
  
  // Export
  const [isExporting, setIsExporting] = useState(false)
  const [showExportMenu, setShowExportMenu] = useState(false)

  // ========================================
  // NOTIFICATION HELPER
  // ========================================
  const showNotification = useCallback((message: string) => {
    setToastMessage(message)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }, [])

  // ========================================
  // TIPTAP EDITOR
  // ========================================
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      DetailsSummary,
      Details,
      Placeholder.configure({
        placeholder: "Start writing with AI...",
        emptyEditorClass: "is-editor-empty",
      }),
      Image.configure({
        HTMLAttributes: { class: "rounded-lg max-w-full h-auto" },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: "text-primary underline hover:text-primary/80" },
      }),
    ],
    content: INITIAL_EDITOR_CONTENT,
    editorProps: {
      attributes: {
        class: "prose prose-neutral dark:prose-invert prose-lg max-w-none focus:outline-none min-h-[500px] px-6 py-6",
      },
    },
    onUpdate: ({ editor: ed }) => {
      const html = ed.getHTML()
      const text = ed.getText()
      const stats = analyzeEditorContent(html, text, targetKeyword, featuredImageUrl)
      setEditorStats(stats)
      setNlpKeywords((prev) => updateNLPKeywordsUsage(prev, text.toLowerCase()))
      setHasUnsavedChanges(true)
      
      // Auto-save
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current)
      autoSaveTimerRef.current = setTimeout(() => saveContent(html, true), 30000)
      
      // Readability
      const readability = readabilityService.analyze(text)
      setReadabilityScore({
        fleschKincaid: readability.score.fleschKincaidGrade,
        gradeLevel: readability.score.readingLevel,
        readingTime: readability.stats.readingTimeMinutes,
        issues: readability.issues.map(i => i.suggestion)
      })
    },
    onSelectionUpdate: ({ editor: ed }) => {
      setHasSelection(!ed.state.selection.empty)
    },
  })

  // ========================================
  // AI GENERATION HOOK
  // ========================================
  const { isGenerating: isAIGenerating, progress: generationProgress, generateArticle, abort: abortGeneration } = useAIGeneration({
    editor,
    showNotification,
    setTitle,
    setSlug,
    setTargetKeyword,
    setNlpKeywords,
  })

  // ========================================
  // CALCULATED VALUES
  // ========================================
  const seoScore = useMemo(
    () => calculateSEOScore(editorStats, nlpKeywords, CRITICAL_ISSUES_CONFIG),
    [editorStats, nlpKeywords]
  )

  // ========================================
  // SAVE CONTENT
  // ========================================
  const saveContent = useCallback(async (content: string, isAutoSave = false) => {
    if (!content.trim()) return
    
    setIsSaving(true)
    try {
      if (currentDraftId) {
        await draftService.updateDraft(currentDraftId, { content, title, keyword: targetKeyword })
      } else {
        const draft = await draftService.createDraft({ title, content, keyword: targetKeyword })
        setCurrentDraftId(draft.id)
      }
      
      setLastSaved(new Date())
      setHasUnsavedChanges(false)
      
      if (!isAutoSave) {
        showNotification("Draft saved successfully! 💾")
      }
    } catch (error) {
      console.error("Save error:", error)
      showNotification("Failed to save draft")
    } finally {
      setIsSaving(false)
    }
  }, [currentDraftId, title, targetKeyword, showNotification])

  // ========================================
  // VERSION HISTORY
  // ========================================
  const saveVersion = useCallback(async (label?: string) => {
    if (!editor) return
    
    const content = editor.getHTML()
    
    const version = await versionHistoryService.createVersion({
      draftId: currentDraftId || 'temp',
      content,
      title: label || 'Manual Checkpoint',
      changeType: 'manual',
      changeDescription: label
    })
    
    setVersions(prev => [...prev, {
      id: version.id,
      timestamp: new Date(version.createdAt),
      wordCount: version.wordCount,
      label: version.title
    }])
    
    showNotification("Version checkpoint saved! 📌")
  }, [editor, currentDraftId, showNotification])

  // ========================================
  // HANDLERS
  // ========================================
  const handleBack = useCallback(() => {
    if (writerContext?.source && writerContext.source !== "direct") {
      const sourceRoutes: Record<string, string> = {
        "keyword-magic": "/keyword-magic",
        "content-decay": "/content-decay",
        "competitor-gap": "/competitor-gap",
        "content-roadmap": "/content-roadmap",
        "snippet-stealer": "/snippet-stealer",
        "trend-spotter": "/trend-spotter",
        "topic-clusters": "/topic-clusters",
      }
      router.push(sourceRoutes[writerContext.source] || "/dashboard")
    } else {
      router.push("/dashboard")
    }
  }, [writerContext, router])

  const handleExport = useCallback(async (format: 'markdown' | 'html' | 'wordpress' | 'json') => {
    if (!editor) return
    
    setIsExporting(true)
    setShowExportMenu(false)
    
    try {
      const html = editor.getHTML()
      
      const schema = schemaService.generateArticleSchema({
        headline: title,
        description: editorStats.content.substring(0, 160),
        datePublished: new Date().toISOString(),
        keywords: [targetKeyword],
        author: { name: 'BlogSpy User', url: 'https://blogspy.io' },
        publisher: { name: 'BlogSpy', logo: 'https://blogspy.io/logo.png' }
      })
      
      const metadata = {
        title,
        metaTitle: title,
        metaDescription: editorStats.content.substring(0, 160),
        slug,
        focusKeyword: targetKeyword,
        secondaryKeywords: [] as string[]
      }
      
      const result = await exportService.export(html, metadata, { format })
      
      if (result.success) {
        if (format === 'html') {
          const contentWithSchema = result.content.replace('</head>', `${schema.script}\n</head>`)
          await navigator.clipboard.writeText(contentWithSchema)
          showNotification("Article HTML copied to clipboard! 📋")
        } else {
          const blob = new Blob([result.content], { type: result.mimeType })
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = result.filename
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          URL.revokeObjectURL(url)
          showNotification(`Exported as ${format.toUpperCase()}! 📥`)
        }
      }
    } catch (error) {
      console.error("Export error:", error)
      showNotification("Failed to export content")
    } finally {
      setIsExporting(false)
    }
  }, [editor, title, targetKeyword, slug, editorStats.content, showNotification])

  const handleImageUpload = useCallback((url: string) => {
    setFeaturedImageUrl(url)
    if (editor) {
      const html = editor.getHTML()
      const text = editor.getText()
      setEditorStats(analyzeEditorContent(html, text, targetKeyword, url))
    }
    showNotification("Featured image uploaded! 🖼️")
  }, [editor, targetKeyword, showNotification])

  const handleApplyRecommendations = useCallback(async () => {
    if (!writerContext) return
    await generateArticle(writerContext)
  }, [writerContext, generateArticle])

  const handleInsertLink = useCallback((url: string, text: string) => {
    if (!editor) return
    editor.chain().focus().insertContent(`<a href="${url}">${text}</a>`).run()
    showNotification("Link inserted! 🔗")
  }, [editor, showNotification])

  // AI Selection handlers
  const handleExpand = useCallback(async () => {
    if (!editor) return
    setAiAction("expand")
    const selectedText = editor.state.selection.empty ? '' : editor.state.doc.textBetween(editor.state.selection.from, editor.state.selection.to)
    
    const response = await aiWriterService.execute({ operation: 'expand-text', content: selectedText, keyword: targetKeyword })
    if (response.success && response.content) {
      editor.chain().focus().deleteSelection().run()
      // Simulate typing
      for (const char of response.content.split('')) {
        await new Promise(r => setTimeout(r, 10))
        editor.chain().focus().insertContent(char).run()
      }
    }
    setAiAction(null)
    showNotification("Text expanded! ✨")
  }, [editor, targetKeyword, showNotification])

  const handleRewrite = useCallback(async () => {
    if (!editor) return
    setAiAction("rewrite")
    const selectedText = editor.state.selection.empty ? '' : editor.state.doc.textBetween(editor.state.selection.from, editor.state.selection.to)
    
    const response = await aiWriterService.execute({ operation: 'rewrite-text', content: selectedText, keyword: targetKeyword })
    if (response.success && response.content) {
      editor.chain().focus().deleteSelection().run()
      for (const char of response.content.split('')) {
        await new Promise(r => setTimeout(r, 10))
        editor.chain().focus().insertContent(char).run()
      }
    }
    setAiAction(null)
    showNotification("Text rewritten! ✨")
  }, [editor, targetKeyword, showNotification])

  const handleShorten = useCallback(async () => {
    if (!editor) return
    setAiAction("shorten")
    const selectedText = editor.state.selection.empty ? '' : editor.state.doc.textBetween(editor.state.selection.from, editor.state.selection.to)
    
    const response = await aiWriterService.execute({ operation: 'shorten-text', content: selectedText, keyword: targetKeyword })
    if (response.success && response.content) {
      editor.chain().focus().deleteSelection().run()
      for (const char of response.content.split('')) {
        await new Promise(r => setTimeout(r, 10))
        editor.chain().focus().insertContent(char).run()
      }
    }
    setAiAction(null)
    showNotification("Text shortened! ✨")
  }, [editor, targetKeyword, showNotification])

  // Cluster mode handlers
  const handleClusterComplete = useCallback(async (articleId: string, content: string) => {
    const draft = await draftService.createDraft({ title: `Cluster Article - ${articleId}`, content, keyword: articleId })
    await draftService.updateDraft(draft.id, { status: 'published' })
  }, [])

  const handleClusterExport = useCallback(async (articleId: string, format: "docs" | "markdown" | "html") => {
    const drafts = await draftService.listDrafts()
    const draft = drafts.find((d: { title: string }) => d.title.includes(articleId))
    if (draft) {
      const fullDraft = await draftService.getDraft(draft.id)
      if (fullDraft) {
        const formatMap = { docs: 'docx' as const, markdown: 'markdown' as const, html: 'html' as const }
        const result = await exportService.export(fullDraft.content, { title: fullDraft.title, metaTitle: fullDraft.title, metaDescription: '', slug: '', focusKeyword: fullDraft.keyword, secondaryKeywords: fullDraft.secondaryKeywords || [] }, { format: formatMap[format] })
        if (result.success) {
          const blob = new Blob([result.content], { type: result.mimeType })
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = result.filename
          a.click()
          URL.revokeObjectURL(url)
        }
      }
    }
  }, [])

  const handleExitClusterMode = useCallback(() => {
    router.push("/topic-clusters")
  }, [router])

  // ========================================
  // CLUSTER MODE RENDER
  // ========================================
  if (isClusterWritingMode) {
    return (
      <ClusterWritingMode
        clusterName={clusterName}
        queue={writingQueue}
        onComplete={handleClusterComplete}
        onExport={handleClusterExport}
        onExit={handleExitClusterMode}
      />
    )
  }

  // ========================================
  // COPILOT SIDEBAR
  // ========================================
  const copilotSidebar = (
    <Tabs defaultValue="optimize" className="flex-1 flex flex-col overflow-hidden">
      <TabsList className="grid grid-cols-5 gap-0.5 p-1 mx-3 mt-3 bg-muted/50 rounded-lg shrink-0">
        <TabsTrigger value="optimize" className="text-[10px] px-1">SEO</TabsTrigger>
        <TabsTrigger value="meta" className="text-[10px] px-1">Meta</TabsTrigger>
        <TabsTrigger value="outline" className="text-[10px] px-1">Outline</TabsTrigger>
        <TabsTrigger value="competitors" className="text-[10px] px-1">SERP</TabsTrigger>
        <TabsTrigger value="tools" className="text-[10px] px-1">Tools</TabsTrigger>
      </TabsList>

      <TabsContent value="optimize" className="flex-1 min-h-0 m-0 overflow-y-auto">
        <OptimizationTab
          editorStats={editorStats}
          nlpKeywords={nlpKeywords}
          criticalIssues={[]}
          targetKeyword={targetKeyword}
          isAIGenerating={isAIGenerating}
          aiAction={aiAction}
          onGenerateFAQ={() => showNotification("Generate FAQ")}
          onWriteConclusion={() => showNotification("Write Conclusion")}
        />
      </TabsContent>

      <TabsContent value="meta" className="flex-1 min-h-0 m-0 overflow-y-auto p-4">
        <MetaPanel title={title} content={editorStats.content} targetKeyword={targetKeyword} context={writerContext} />
      </TabsContent>

      <TabsContent value="outline" className="flex-1 min-h-0 m-0 overflow-y-auto">
        <OutlineTab editorStats={editorStats} title={title} />
      </TabsContent>

      <TabsContent value="competitors" className="flex-1 min-h-0 m-0 overflow-y-auto">
        <CompetitorsTab editorStats={editorStats} />
      </TabsContent>

      <TabsContent value="tools" className="flex-1 min-h-0 m-0 overflow-y-auto p-4">
        <div className="text-sm text-muted-foreground">AI Tools Panel - Click AI Tools button in header</div>
      </TabsContent>
    </Tabs>
  )

  // ========================================
  // MAIN RENDER
  // ========================================
  return (
    <main className="flex-1 flex flex-col h-screen overflow-hidden">
      {/* Fixed Header */}
      <div className="shrink-0">
        <AIWriterHeader
          writerContext={writerContext}
          editorStats={editorStats}
          readabilityScore={readabilityScore}
          seoScore={seoScore}
          isSaving={isSaving}
          hasUnsavedChanges={hasUnsavedChanges}
          lastSaved={lastSaved}
          isExporting={isExporting}
          showExportMenu={showExportMenu}
          setShowExportMenu={setShowExportMenu}
          targetKeyword={targetKeyword}
          onBack={handleBack}
          onExport={handleExport}
          onSaveVersion={saveVersion}
        />
        
        {/* Mobile Action Toolbar */}
        <div className="lg:hidden flex items-center justify-center gap-2 px-4 py-2 border-b border-border/50 bg-muted/30">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 gap-1.5 px-3">
                <FileText className="h-4 w-4 text-emerald-500" />
                <span className="text-xs">Copilot</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:w-90 max-w-[92vw] p-0 flex flex-col min-h-0">
              <SheetHeader className="px-4 py-3 border-b border-border">
                <SheetTitle className="text-sm">SEO Copilot</SheetTitle>
              </SheetHeader>
              <div className="flex-1 min-h-0 flex flex-col">
                {copilotSidebar}
              </div>
            </SheetContent>
          </Sheet>
          
          <Button variant="outline" size="sm" onClick={() => saveVersion()} className="h-8 gap-1.5 px-3">
            <History className="h-4 w-4 text-purple-500" />
            <span className="text-xs">Checkpoint</span>
          </Button>
        </div>
      </div>

      {/* Editor Area */}
      <AIWriterEditor
        editor={editor}
        slug={slug}
        setSlug={setSlug}
        targetKeyword={targetKeyword}
        setTargetKeyword={setTargetKeyword}
        title={title}
        writerContext={writerContext}
        showContext={showContext}
        setShowContext={setShowContext}
        isAIGenerating={isAIGenerating}
        generationProgress={generationProgress}
        aiAction={aiAction}
        hasSelection={hasSelection}
        onImageUpload={handleImageUpload}
        onApplyRecommendations={handleApplyRecommendations}
        onInsertLink={handleInsertLink}
        onExpand={handleExpand}
        onRewrite={handleRewrite}
        onShorten={handleShorten}
        copilotSidebar={copilotSidebar}
      />

      {/* Toast */}
      <ToastNotification show={showToast} message={toastMessage} />
    </main>
  )
}

export default AIWriterContentRefactored
