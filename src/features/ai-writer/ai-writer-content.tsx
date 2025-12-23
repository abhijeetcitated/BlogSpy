"use client"

// ============================================
// AI WRITER - Production-Ready Main Component
// ============================================
// Architecture: Service Layer + Custom Hooks
// Ready for API Integration - Just swap mock data
// ============================================

import { useState, useEffect, useCallback, useMemo, useRef } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Placeholder from "@tiptap/extension-placeholder"
import Image from "@tiptap/extension-image"
import Link from "@tiptap/extension-link"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { 
  ChevronLeft, 
  Rocket, 
  History, 
  FileText,
  Shield,
  Bot,
  Wand2,
  BookOpen,
  Award,
  BarChart3,
  Code2,
  Target,
  Eye,
  Users,
  Quote,
  Link2,
  HelpCircle,
  TrendingUp,
  Zap,
  Keyboard,
  Download,
  Loader2,
  CheckCircle2,
  Clock,
  Hash,
  Image as ImageIcon
} from "lucide-react"
import { cn } from "@/lib/utils"

import { Details, DetailsSummary } from "./extensions"

// Feature imports
import type { NLPKeyword, EditorStats, AIAction, WriterContext } from "./types"
import type { WritingQueueItem } from "./components"
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
  parseWriterContext,
  getDemoContextForDev,
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
  ContextBanner,
  MetaPanel,
  ClusterWritingMode,
  AIToolsPanel,
  AIToolsQuickBar,
} from "./components"

// Services - Production Layer
import {
  aiWriterService,
  draftService,
  versionHistoryService,
  creditsService,
  exportService,
  schemaService,
  readabilityService,
} from "./services"

// Import mock data for cluster writing mode
import { MOCK_TOPIC_CLUSTER_FULL, getLinksForArticle } from "../topic-clusters/constants/mock-cluster-data"

// Build writing queue from cluster data
function buildWritingQueue(): WritingQueueItem[] {
  const cluster = MOCK_TOPIC_CLUSTER_FULL
  const queue: WritingQueueItem[] = []
  
  // Add pillars first
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
  
  // Add clusters
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

export function AIWriterContent() {
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
  const [showVersionHistory, setShowVersionHistory] = useState(false)
  const [versions, setVersions] = useState<Array<{
    id: string
    timestamp: Date
    wordCount: number
    label?: string
  }>>([])
  
  // ========================================
  // AI GENERATION STATE (additional)
  // ========================================
  const [generationProgress, setGenerationProgress] = useState(0)
  const generationAbortRef = useRef(false)
  
  // ========================================
  // READABILITY STATE
  // ========================================
  const [readabilityScore, setReadabilityScore] = useState<{
    fleschKincaid: number
    gradeLevel: string
    readingTime: number
    issues: string[]
  } | null>(null)
  
  // Check if we're in cluster writing mode
  const isClusterWritingMode = useMemo(() => {
    return searchParams.get("mode") === "cluster-writing"
  }, [searchParams])
  
  const clusterName = searchParams.get("cluster_name") || "AI Writing Tools"
  
  // Build writing queue for cluster mode
  const writingQueue = useMemo(() => {
    if (isClusterWritingMode) {
      return buildWritingQueue()
    }
    return []
  }, [isClusterWritingMode])
  
  // Handlers for cluster writing mode
  const handleClusterComplete = useCallback(async (articleId: string, content: string) => {
    // Save completed article as draft
    const draft = await draftService.createDraft({
      title: `Cluster Article - ${articleId}`,
      content,
      keyword: articleId
    })
    // Update status to published
    await draftService.updateDraft(draft.id, { status: 'published' })
    console.log("Completed article saved:", draft.id)
  }, [])
  
  const handleClusterExport = useCallback(async (articleId: string, format: "docs" | "markdown" | "html") => {
    // Get draft content and export
    const drafts = await draftService.listDrafts()
    const draft = drafts.find((d: { title: string }) => d.title.includes(articleId))
    
    if (draft) {
      const fullDraft = await draftService.getDraft(draft.id)
      if (fullDraft) {
        const formatMap = {
          docs: 'docx' as const,
          markdown: 'markdown' as const,
          html: 'html' as const
        }
        const result = await exportService.export(
          fullDraft.content,
          {
            title: fullDraft.title,
            metaTitle: fullDraft.title,
            metaDescription: '',
            slug: '',
            focusKeyword: fullDraft.keyword,
            secondaryKeywords: fullDraft.secondaryKeywords || []
          },
          { format: formatMap[format] }
        )
        
        if (result.success) {
          // Create downloadable blob
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
  
  // Render cluster writing mode if active
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
  
  // Parse URL params into context
  // DEV MODE: Always shows demo context if no real context provided
  // TODO: [AUTH] After login system is implemented, show context only when:
  //   1. User comes from another feature (keyword-magic, content-decay, etc.)
  //   2. User has active subscription/credits
  const writerContext = useMemo(() => {
    const realContext = parseWriterContext(searchParams)
    // DEV: If no context, show demo context for testing
    if (!realContext) {
      return getDemoContextForDev()
    }
    return realContext
  }, [searchParams])
  
  // Context visibility state - always show in dev for testing
  const [showContext, setShowContext] = useState(true)
  
  // Meta states - initialized from context if available
  const [title, setTitle] = useState(() => {
    if (writerContext?.keyword) {
      // Generate initial title from keyword
      return generateTitleFromKeyword(writerContext.keyword, writerContext.intent)
    }
    return "How to Use AI Agents to Automate Your Workflow"
  })
  const [slug, setSlug] = useState("ai-agents-automate-workflow")
  const [targetKeyword, setTargetKeyword] = useState(() => {
    return writerContext?.keyword || "AI Agents"
  })

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

  // ========================================
  // AUTO-SAVE FUNCTIONALITY
  // ========================================
  const saveContent = useCallback(async (content: string, isAutoSave = false) => {
    if (!content.trim()) return
    
    setIsSaving(true)
    try {
      if (currentDraftId) {
        // Update existing draft
        await draftService.updateDraft(currentDraftId, {
          content,
          title,
          keyword: targetKeyword
        })
      } else {
        // Create new draft
        const draft = await draftService.createDraft({
          title,
          content,
          keyword: targetKeyword
        })
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
  
  // Schedule auto-save
  const scheduleAutoSave = useCallback((content: string) => {
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current)
    }
    autoSaveTimerRef.current = setTimeout(() => {
      saveContent(content, true)
    }, 30000) // Auto-save every 30 seconds
  }, [saveContent])
  
  // ========================================
  // VERSION HISTORY - Defined after editor
  // ========================================
  // Note: These are stubs that will be properly defined after editor initialization
  const saveVersionRef = useRef<((label?: string) => Promise<void>) | null>(null)
  const restoreVersionRef = useRef<((versionId: string) => Promise<void>) | null>(null)
  
  // Wrapper functions that call the refs
  const saveVersion = useCallback(async (label?: string) => {
    if (saveVersionRef.current) {
      await saveVersionRef.current(label)
    }
  }, [])
  
  const restoreVersion = useCallback(async (versionId: string) => {
    if (restoreVersionRef.current) {
      await restoreVersionRef.current(versionId)
    }
  }, [])

  // Initialize Tiptap Editor
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
      scheduleAutoSave(html)
      
      // Update readability score
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

  // Calculate SEO Score
  const seoScore = useMemo(
    () => calculateSEOScore(editorStats, nlpKeywords, CRITICAL_ISSUES_CONFIG),
    [editorStats, nlpKeywords]
  )

  // Simulate AI Writing - streams text character by character
  // PRODUCTION: Uses aiWriterService with streaming support
  const simulateAIWriting = useCallback(
    async (content: string, mode: "append" | "replace" = "append") => {
      if (!editor) return
      setIsAIGenerating(true)

      if (mode === "replace") {
        editor.chain().focus().deleteSelection().run()
      } else {
        editor.chain().focus().setTextSelection(editor.state.doc.content.size).run()
      }

      // Stream content character by character for typing effect
      const chars = content.split("")
      for (let i = 0; i < chars.length; i++) {
        await new Promise((resolve) => setTimeout(resolve, 10))
        editor.chain().focus().insertContent(chars[i]).run()
      }

      setIsAIGenerating(false)
      
      // Deduct credits after successful operation based on current AI action
      const operationMap: Record<string, string> = {
        faq: 'generate-faq',
        conclusion: 'generate-conclusion',
        expand: 'expand-text',
        rewrite: 'rewrite-text',
        shorten: 'shorten-text'
      }
      
      if (aiAction && operationMap[aiAction]) {
        await creditsService.deductCredits(operationMap[aiAction])
        setCreditBalance(creditsService.getBalance())
      }
      
      setAiAction(null)
      showNotification("AI content generated successfully! ✨")
    },
    [editor, showNotification, aiAction]
  )
  
  // Check credits before AI operation
  const checkCredits = useCallback((operation: string): boolean => {
    const canUse = creditsService.hasEnoughCredits(operation)
    if (!canUse) {
      showNotification("Insufficient credits! Upgrade your plan 💳")
      return false
    }
    return true
  }, [showNotification])

  // AI Action handlers - Production Ready with Service Layer
  const handleGenerateFAQ = useCallback(async () => {
    if (!checkCredits('generate-faq')) return
    
    setAiAction("faq")
    
    // PRODUCTION: Use service layer with streaming
    const response = await aiWriterService.execute({
      operation: 'generate-faq',
      content: editor?.getText() || '',
      keyword: targetKeyword
    })
    
    if (response.success && response.content) {
      await simulateAIWriting(response.content)
    } else {
      // Fallback to mock data
      await simulateAIWriting(AI_GENERATED_CONTENT.faq)
    }
  }, [checkCredits, editor, targetKeyword, simulateAIWriting])

  const handleWriteConclusion = useCallback(async () => {
    if (!checkCredits('generate-conclusion')) return
    
    setAiAction("conclusion")
    
    const response = await aiWriterService.execute({
      operation: 'generate-conclusion',
      content: editor?.getText() || '',
      keyword: targetKeyword
    })
    
    if (response.success && response.content) {
      await simulateAIWriting(response.content)
    } else {
      await simulateAIWriting(AI_GENERATED_CONTENT.conclusion)
    }
  }, [checkCredits, editor, targetKeyword, simulateAIWriting])

  const handleExpand = useCallback(async () => {
    if (!editor) return
    if (!checkCredits('expand-text')) return
    
    const selectedText = editor.state.selection.empty 
      ? '' 
      : editor.state.doc.textBetween(
          editor.state.selection.from,
          editor.state.selection.to
        )
    
    setAiAction("expand")
    setIsAIGenerating(true)
    
    const response = await aiWriterService.execute({
      operation: 'expand-text',
      content: selectedText,
      keyword: targetKeyword
    })
    
    if (response.success && response.content) {
      editor.chain().focus().deleteSelection().run()
      await simulateAIWriting(response.content, "replace")
    } else {
      editor.chain().focus().deleteSelection().run()
      await simulateAIWriting(AI_GENERATED_CONTENT.expand, "replace")
    }
  }, [editor, checkCredits, targetKeyword, simulateAIWriting])

  const handleRewrite = useCallback(async () => {
    if (!editor) return
    if (!checkCredits('rewrite-text')) return
    
    const selectedText = editor.state.selection.empty 
      ? '' 
      : editor.state.doc.textBetween(
          editor.state.selection.from,
          editor.state.selection.to
        )
    
    setAiAction("rewrite")
    setIsAIGenerating(true)
    
    const response = await aiWriterService.execute({
      operation: 'rewrite-text',
      content: selectedText,
      keyword: targetKeyword
    })
    
    if (response.success && response.content) {
      editor.chain().focus().deleteSelection().run()
      await simulateAIWriting(response.content, "replace")
    } else {
      editor.chain().focus().deleteSelection().run()
      await simulateAIWriting(AI_GENERATED_CONTENT.rewrite, "replace")
    }
  }, [editor, checkCredits, targetKeyword, simulateAIWriting])

  const handleShorten = useCallback(async () => {
    if (!editor) return
    if (!checkCredits('shorten-text')) return
    
    const selectedText = editor.state.selection.empty 
      ? '' 
      : editor.state.doc.textBetween(
          editor.state.selection.from,
          editor.state.selection.to
        )
    
    setAiAction("shorten")
    setIsAIGenerating(true)
    
    const response = await aiWriterService.execute({
      operation: 'shorten-text',
      content: selectedText,
      keyword: targetKeyword
    })
    
    if (response.success && response.content) {
      editor.chain().focus().deleteSelection().run()
      await simulateAIWriting(response.content, "replace")
    } else {
      editor.chain().focus().deleteSelection().run()
      await simulateAIWriting(AI_GENERATED_CONTENT.shorten, "replace")
    }
  }, [editor, checkCredits, targetKeyword, simulateAIWriting])

  // Handle Export - Production Ready with Multiple Formats
  const [isExporting, setIsExporting] = useState(false)
  const [showExportMenu, setShowExportMenu] = useState(false)
  
  const handleExport = useCallback(async (format: 'markdown' | 'html' | 'wordpress' | 'json' = 'html') => {
    if (!editor) return
    
    setIsExporting(true)
    setShowExportMenu(false)
    
    try {
      const html = editor.getHTML()
      
      // Generate Article schema
      const schema = schemaService.generateArticleSchema({
        headline: title,
        description: editorStats.content.substring(0, 160),
        datePublished: new Date().toISOString(),
        keywords: [targetKeyword],
        author: {
          name: 'BlogSpy User',
          url: 'https://blogspy.io'
        },
        publisher: {
          name: 'BlogSpy',
          logo: 'https://blogspy.io/logo.png'
        }
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
          // Copy to clipboard for HTML (include schema)
          const contentWithSchema = result.content.replace('</head>', `${schema.script}\n</head>`)
          await navigator.clipboard.writeText(contentWithSchema)
          showNotification("Article HTML copied to clipboard! 📋")
        } else {
          // Download for other formats
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
      } else {
        showNotification("Export failed. Please try again.")
      }
    } catch (error) {
      console.error("Export error:", error)
      showNotification("Failed to export content")
    } finally {
      setIsExporting(false)
    }
  }, [editor, title, targetKeyword, slug, editorStats.content, showNotification])

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

  // Handle apply recommendations from context - COMPLETE AI-STYLE GENERATION
  const handleApplyRecommendations = useCallback(async () => {
    if (!writerContext || !editor) return
    
    // Reset abort flag
    generationAbortRef.current = false
    setIsAIGenerating(true)
    setGenerationProgress(0)
    
    // 1. Update target keyword
    setTargetKeyword(writerContext.keyword)
    
    // 2. Generate optimized title based on intent
    const newTitle = generateTitleFromKeyword(writerContext.keyword, writerContext.intent)
    setTitle(newTitle)
    
    // 3. Generate slug from keyword
    setSlug(generateSlug(writerContext.keyword))
    
    showNotification("🤖 AI is generating your article...")
    
    // Helper function for typing animation
    const typeContent = async (chunks: string[], delayMs: number = 30) => {
      let fullContent = ""
      const totalChunks = chunks.length
      
      for (let i = 0; i < chunks.length; i++) {
        if (generationAbortRef.current) break
        
        fullContent += chunks[i]
        editor.commands.setContent(fullContent)
        setGenerationProgress(Math.round(((i + 1) / totalChunks) * 100))
        
        // Variable delay for natural feel
        const actualDelay = delayMs + Math.random() * 20
        await new Promise(resolve => setTimeout(resolve, actualDelay))
      }
      
      return fullContent
    }

    const estimateWords = (htmlOrText: string) => {
      const text = htmlOrText
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim()
      if (!text) return 0
      return text.split(" ").filter(Boolean).length
    }

    const pushChunk = (chunks: string[], html: string, wordCounter: { value: number }) => {
      chunks.push(html)
      wordCounter.value += estimateWords(html)
    }
    
    // 4. For PILLAR articles - Generate COMPLETE blog with AI typing effect
    if (writerContext.contentType === "pillar" && writerContext.pillarData) {
      const { subKeywords, recommendedLength, recommendedHeadings } = writerContext.pillarData
      const keyword = writerContext.keyword
      const keywordCapitalized = capitalizeWords(keyword)

      const targetMinWords = 3000
      
      // Build H2 structure from sub-keywords
      const h2Keywords = subKeywords.filter(k => k.placement === "h2")
      const h3Keywords = subKeywords.filter(k => k.placement === "h3")
      const faqKeywords = subKeywords.filter(k => k.placement === "faq")
      
      // Generate complete mock blog content (split into chunks for animation)
      const contentChunks: string[] = []

      const wordCounter = { value: 0 }
      const paragraph = (inner: string) => `<p>${inner}</p>\n\n`
      
      // Title
      pushChunk(contentChunks, `<h1>${newTitle}</h1>\n\n`, wordCounter)
      
      // Introduction
      pushChunk(
        contentChunks,
        paragraph(
          `In today's rapidly evolving digital landscape, <strong>${keywordCapitalized}</strong> has become an essential topic that every professional needs to understand. ` +
            `Whether you're a beginner just starting out or an experienced practitioner looking to deepen your knowledge, this pillar guide is designed to take you from fundamentals to execution.`
        ),
        wordCounter
      )

      pushChunk(
        contentChunks,
        paragraph(
          `This demo article is intentionally long and structured so that later, when you connect a real AI API, the model can produce similar depth. ` +
            `You'll see sections, checklists, examples, and even tables — all in a format that feels like an AI is generating the article in real-time.`
        ),
        wordCounter
      )

      pushChunk(
        contentChunks,
        paragraph(
          `In practice, strong results come from combining clear strategy with repeatable execution. ` +
            `We'll cover definitions, best practices, tools, workflows, and a complete roadmap — plus common mistakes and how to avoid them.`
        ),
        wordCounter
      )

      // Quick table (demo table support)
      pushChunk(contentChunks, `<h2>📊 Quick Reference Table (Demo)</h2>\n`, wordCounter)
      pushChunk(
        contentChunks,
        `<table>\n` +
          `<thead>\n<tr>\n<th>Focus</th>\n<th>Best For</th>\n<th>What To Do</th>\n<th>Common Pitfall</th>\n</tr>\n</thead>\n` +
          `<tbody>\n` +
          `<tr><td>Strategy</td><td>Planning</td><td>Define goals, audience, and success metrics</td><td>Writing without a clear objective</td></tr>\n` +
          `<tr><td>Execution</td><td>Implementation</td><td>Follow a checklist and iterate weekly</td><td>Doing everything at once</td></tr>\n` +
          `<tr><td>Optimization</td><td>Growth</td><td>Measure outcomes and improve sections</td><td>Ignoring data</td></tr>\n` +
          `<tr><td>Quality</td><td>Trust</td><td>Add examples, structure, and clarity</td><td>Fluffy, generic writing</td></tr>\n` +
          `</tbody>\n</table>\n\n`,
        wordCounter
      )
      
      // Table of Contents
      pushChunk(contentChunks, `<h2>📋 What You'll Learn in This Guide</h2>\n`, wordCounter)
      pushChunk(contentChunks, `<ul>\n`, wordCounter)
      h2Keywords.slice(0, 10).forEach((kw, idx) => {
        pushChunk(contentChunks, `<li><strong>Section ${idx + 1}:</strong> ${capitalizeWords(kw.keyword)}</li>\n`, wordCounter)
      })
      pushChunk(contentChunks, `<li><strong>Templates:</strong> Checklists and practical steps</li>\n`, wordCounter)
      pushChunk(contentChunks, `<li><strong>Tables:</strong> Demo tabular outputs for real AI later</li>\n`, wordCounter)
      pushChunk(contentChunks, `<li><strong>FAQ:</strong> Answers to common questions</li>\n`, wordCounter)
      pushChunk(contentChunks, `<li><strong>Conclusion:</strong> Key takeaways & next steps</li>\n`, wordCounter)
      pushChunk(contentChunks, `</ul>\n\n`, wordCounter)
      
      // Main H2 Sections with real content
      h2Keywords.forEach((kw, idx) => {
        const sectionKeyword = capitalizeWords(kw.keyword)
        
        pushChunk(contentChunks, `<h2>${idx + 1}. ${sectionKeyword}</h2>\n`, wordCounter)
        
        // Section intro
        pushChunk(
          contentChunks,
          paragraph(
            `Understanding ${kw.keyword} is crucial for anyone serious about mastering ${keyword}. ` +
              `This section explains the concepts, practical applications, and decision points you should consider when applying ${kw.keyword} in real scenarios.`
          ),
          wordCounter
        )

        pushChunk(
          contentChunks,
          paragraph(
            `To make this actionable, we'll cover: (1) what it means, (2) how to implement it, (3) what to measure, and (4) how to iterate. ` +
              `If you're using this as a demo, imagine each paragraph being generated by a model, tuned to your brand voice and your niche.`
          ),
          wordCounter
        )
        
        // Key points list
        pushChunk(contentChunks, `<p><strong>Key aspects of ${kw.keyword} include:</strong></p>\n`, wordCounter)
        pushChunk(contentChunks, `<ul>\n`, wordCounter)
        pushChunk(contentChunks, `<li><strong>Foundation:</strong> Core principles and definitions</li>\n`, wordCounter)
        pushChunk(contentChunks, `<li><strong>Implementation:</strong> A repeatable process you can follow</li>\n`, wordCounter)
        pushChunk(contentChunks, `<li><strong>Quality checks:</strong> What “good” looks like and how to validate it</li>\n`, wordCounter)
        pushChunk(contentChunks, `<li><strong>Optimization:</strong> Improve outcomes over time with data</li>\n`, wordCounter)
        pushChunk(contentChunks, `<li><strong>Common pitfalls:</strong> Mistakes to avoid</li>\n`, wordCounter)
        pushChunk(contentChunks, `</ul>\n\n`, wordCounter)
        
        // Detailed paragraph
        pushChunk(
          contentChunks,
          paragraph(
            `When implementing ${kw.keyword}, start with a simple baseline and only add complexity after the basics work. ` +
              `A useful mental model is: <strong>plan → execute → measure → improve</strong>. ` +
              `If you ever feel stuck, return to that loop and ask which step is missing.`
          ),
          wordCounter
        )

        pushChunk(
          contentChunks,
          paragraph(
            `Example: if your goal is higher performance, define success upfront (e.g., better engagement, faster workflow, fewer errors), ` +
              `then test one change at a time. This avoids the common trap of making multiple changes and not knowing what caused improvement.`
          ),
          wordCounter
        )
        
        // Add related H3 sections
        const relatedH3 = h3Keywords.slice(idx * 2, (idx * 2) + 2)
        relatedH3.forEach(h3 => {
          const h3Keyword = capitalizeWords(h3.keyword)
          pushChunk(contentChunks, `<h3>${h3Keyword}</h3>\n`, wordCounter)
          pushChunk(
            contentChunks,
            paragraph(
              `Diving deeper into ${h3.keyword}, focus on clarity and intent. Ask: what is the reader trying to achieve, and what would “success” look like for them? ` +
                `Then write the section so it answers that outcome directly, using examples and steps instead of abstract theory.`
            ),
            wordCounter
          )

          pushChunk(
            contentChunks,
            paragraph(
              `A practical pattern for ${h3.keyword}: explain the idea in 2–3 lines, give a short checklist, then provide a mini example. ` +
                `This keeps the content skimmable, useful, and easy to turn into a real AI-generated section later.`
            ),
            wordCounter
          )

          pushChunk(
            contentChunks,
            `<blockquote><p><em>"The key to success with ${h3.keyword} is consistency: write, measure, refine, repeat."</em></p></blockquote>\n\n`,
            wordCounter
          )
        })
        
        // Pro tip box
        pushChunk(
          contentChunks,
          paragraph(
            `💡 <strong>Pro Tip:</strong> Treat ${kw.keyword} like a system. Document what you did, why you did it, and what changed. ` +
              `This makes it easy to replicate wins and avoid repeating mistakes, especially when you scale to many pages or many keywords.`
          ),
          wordCounter
        )

        // Insert a demo table occasionally to represent structured output
        if (idx > 0 && idx % 3 === 0) {
          pushChunk(contentChunks, `<h3>Mini Table: Decisions for ${sectionKeyword}</h3>\n`, wordCounter)
          pushChunk(
            contentChunks,
            `<table>\n` +
              `<thead><tr><th>Decision</th><th>Option A</th><th>Option B</th><th>When to choose</th></tr></thead>\n` +
              `<tbody>` +
              `<tr><td>Approach</td><td>Simple</td><td>Advanced</td><td>Start simple, go advanced after baseline works</td></tr>` +
              `<tr><td>Measurement</td><td>Manual</td><td>Automated</td><td>Automate once you validate the metric</td></tr>` +
              `<tr><td>Iteration</td><td>Weekly</td><td>Daily</td><td>Daily for fast-moving topics, weekly otherwise</td></tr>` +
              `</tbody>\n</table>\n\n`,
            wordCounter
          )
        }
      })

      // Templates & checklist (adds substantial useful length)
      pushChunk(contentChunks, `<h2>✅ Implementation Checklist</h2>\n`, wordCounter)
      pushChunk(
        contentChunks,
        `<ul>\n` +
          `<li>Define the primary goal for ${keyword} (traffic, signups, education, etc.)</li>\n` +
          `<li>Write a clear reader promise in one sentence</li>\n` +
          `<li>Ensure every H2 answers a “why/how/what” question</li>\n` +
          `<li>Add examples, edge cases, and simple-to-follow steps</li>\n` +
          `<li>Include at least one table when comparison is helpful</li>\n` +
          `<li>Conclude with next steps and a practical action plan</li>\n` +
          `</ul>\n\n`,
        wordCounter
      )

      pushChunk(contentChunks, `<h2>🗺️ 30-Day Roadmap (Demo Table)</h2>\n`, wordCounter)
      pushChunk(
        contentChunks,
        `<table>\n` +
          `<thead><tr><th>Week</th><th>Focus</th><th>Tasks</th><th>Output</th></tr></thead>\n` +
          `<tbody>` +
          `<tr><td>1</td><td>Foundation</td><td>Define goals, outline structure, gather examples</td><td>Complete outline + sources</td></tr>` +
          `<tr><td>2</td><td>Draft</td><td>Write sections, add checklists and screenshots/examples</td><td>Full first draft</td></tr>` +
          `<tr><td>3</td><td>Optimize</td><td>Improve clarity, add internal links, refine headings</td><td>Polished article</td></tr>` +
          `<tr><td>4</td><td>Measure</td><td>Track performance, update weak sections</td><td>Iteration plan</td></tr>` +
          `</tbody>\n</table>\n\n`,
        wordCounter
      )
      
      // FAQ Section
      if (faqKeywords.length > 0) {
        pushChunk(contentChunks, `<h2>❓ Frequently Asked Questions</h2>\n`, wordCounter)
        pushChunk(
          contentChunks,
          paragraph(`Short, SEO-friendly answers to common questions about ${keyword}:`),
          wordCounter
        )

        const toShortQuestion = (raw: string) => {
          const cleaned = raw
            .replace(/\?/g, "")
            .replace(/\s+/g, " ")
            .trim()
          const words = cleaned.split(" ").filter(Boolean)
          const short = words.slice(0, 6).join(" ")
          const safe = short.length > 0 ? short : keyword
          return capitalizeWords(safe)
        }

        // FAQ as styled H3 + collapsible answer sections
        // Using simple H3 for question with visual styling - works reliably in TipTap
        faqKeywords.slice(0, 10).forEach((kw, idx) => {
          const q = toShortQuestion(kw.keyword)

          // Rotate a few SEO-style templates so questions stay short and natural.
          const questionVariants = [
            `What is ${q}?`,
            `How does ${q} work?`,
            `Is ${q} worth it?`,
            `How to start with ${q}?`,
            `What are the benefits of ${q}?`,
          ]
          const question = questionVariants[idx % questionVariants.length]

          // Keep answers concise: 2–4 short sentences, no big paragraphs.
          const answer1 = `In simple terms, ${q} is a practical approach within ${keyword} that helps you get a clear outcome with less confusion.`
          const answer2 = `Start small: define one goal, follow a basic checklist, and improve based on what you measure.`
          const answer3 = `If you need a quick rule: if it improves clarity or results, keep it; if not, simplify.`

          // Use blockquote for FAQ item - TipTap definitely supports this
          // Styled via CSS to look like an accordion
          const faqBlock =
            `<blockquote class="faq-item">\n` +
            `<p><strong>Q${idx + 1}: ${question}</strong> <span style="float:right;cursor:pointer;">▼</span></p>\n` +
            `<p>${answer1} ${answer2}</p>\n` +
            `<p><em>${answer3}</em></p>\n` +
            `</blockquote>\n\n`

          pushChunk(contentChunks, faqBlock, wordCounter)
        })
      }

      // Ensure minimum length (pillar 3000+ words)
      let safetyIterations = 0
      while (wordCounter.value < targetMinWords && safetyIterations < 12) {
        safetyIterations += 1
        const n = safetyIterations
        pushChunk(contentChunks, `<h2>🔍 Deep Dive: Advanced Concepts (${n})</h2>\n`, wordCounter)
        pushChunk(
          contentChunks,
          paragraph(
            `Advanced mastery of ${keyword} comes from making small improvements across multiple dimensions: structure, clarity, examples, measurement, and iteration. ` +
              `In this section we add extra depth to make the pillar article feel complete and truly “long-form”.`
          ),
          wordCounter
        )
        pushChunk(
          contentChunks,
          paragraph(
            `Try this exercise: choose one section in this article and rewrite it with (1) a clearer promise, (2) a short checklist, and (3) an example. ` +
              `Then compare reader comprehension before and after. This process creates content that reads like an expert guide, not generic filler.`
          ),
          wordCounter
        )
        pushChunk(
          contentChunks,
          paragraph(
            `Finally, define 3 measurable outcomes for ${keyword} (for example: engagement, conversions, time saved). ` +
              `If an improvement doesn't move an outcome, revert it and test a different change. This is how teams scale high-quality content across many topics.`
          ),
          wordCounter
        )
      }
      
      // Conclusion
      pushChunk(contentChunks, `<h2>🎯 Conclusion: Your Path Forward</h2>\n`, wordCounter)
      pushChunk(
        contentChunks,
        paragraph(
          `We've covered a tremendous amount of ground in this comprehensive guide to ${keyword}. ` +
            `You now have the structure, the strategies, and the templates to implement what you've learned.`
        ),
        wordCounter
      )
      
      pushChunk(contentChunks, `<p><strong>Key takeaways from this guide:</strong></p>\n`, wordCounter)
      pushChunk(contentChunks, `<ol>\n`, wordCounter)
      pushChunk(contentChunks, `<li><strong>Start with fundamentals:</strong> Build a strong baseline before advanced tactics</li>\n`, wordCounter)
      pushChunk(contentChunks, `<li><strong>Use structure:</strong> H2/H3, examples, and checklists improve readability</li>\n`, wordCounter)
      pushChunk(contentChunks, `<li><strong>Include tables when helpful:</strong> Tables simplify comparisons and decisions</li>\n`, wordCounter)
      pushChunk(contentChunks, `<li><strong>Measure results:</strong> Optimize based on data, not guesses</li>\n`, wordCounter)
      pushChunk(contentChunks, `<li><strong>Iterate:</strong> Improve weak sections and refresh content regularly</li>\n`, wordCounter)
      pushChunk(contentChunks, `</ol>\n\n`, wordCounter)
      
      pushChunk(
        contentChunks,
        paragraph(
          `Ready to take the next step? Pick one checklist item and implement it today. ` +
            `Small, consistent actions lead to compounding results over time — and this is exactly the workflow a real AI model would support when you connect your API.`
        ),
        wordCounter
      )
      
      // Call to action
      pushChunk(contentChunks, `<hr>\n`, wordCounter)
      pushChunk(
        contentChunks,
        paragraph(
          `<strong>📚 Want to learn more?</strong> Explore related guides and resources to continue your ${keyword} journey. ` +
            `Bookmark this page so you can revisit the checklists and tables whenever you need them.`
        ),
        wordCounter
      )
      
      // Start typing animation
      await typeContent(contentChunks, 8)
      
      if (!generationAbortRef.current) {
        showNotification(`✅ Complete pillar article generated! ${Math.max(targetMinWords, recommendedLength)}+ words, ${recommendedHeadings}+ headings 🚀`)
      }
    }
    
    // 5. For CLUSTER articles - Generate focused article with pillar link
    else if (writerContext.contentType === "cluster" && writerContext.clusterData) {
      const { pillarKeyword, pillarUrl, linkAnchor, recommendedLength, recommendedHeadings } = writerContext.clusterData
      const keyword = writerContext.keyword
      const keywordCapitalized = capitalizeWords(keyword)

      const targetMinWords = 1600
      
      const contentChunks: string[] = []

      const wordCounter = { value: 0 }
      const paragraph = (inner: string) => `<p>${inner}</p>\n\n`
      
      pushChunk(contentChunks, `<h1>${newTitle}</h1>\n\n`, wordCounter)
      
      // Intro with pillar link
      pushChunk(
        contentChunks,
        paragraph(
          `If you're looking to master <strong>${keywordCapitalized}</strong>, you've come to the right place. ` +
            `This cluster article goes deep on a specific sub-topic and gives you practical steps and examples. ` +
            `For the full context, see our pillar guide: <a href="${pillarUrl || '#'}">${linkAnchor || pillarKeyword}</a>.`
        ),
        wordCounter
      )

      // Demo table (cluster)
      pushChunk(contentChunks, `<h2>📌 Quick Checklist Table (Demo)</h2>\n`, wordCounter)
      pushChunk(
        contentChunks,
        `<table>\n` +
          `<thead><tr><th>Step</th><th>Action</th><th>Output</th></tr></thead>\n` +
          `<tbody>` +
          `<tr><td>1</td><td>Define the exact intent for ${keyword}</td><td>One-sentence promise</td></tr>` +
          `<tr><td>2</td><td>Write a clear structure (H2/H3)</td><td>Skimmable outline</td></tr>` +
          `<tr><td>3</td><td>Add examples + pitfalls</td><td>Trust-building content</td></tr>` +
          `<tr><td>4</td><td>Link back to pillar</td><td>Internal link flow</td></tr>` +
          `</tbody>\n</table>\n\n`,
        wordCounter
      )
      
      pushChunk(contentChunks, `<h2>What is ${keywordCapitalized}?</h2>\n`, wordCounter)
      pushChunk(
        contentChunks,
        paragraph(
          `${keywordCapitalized} is a focused subset of ${pillarKeyword} designed to deliver targeted results. ` +
            `Instead of covering everything broadly, this article prioritizes clarity, actionable steps, and practical implementation.`
        ),
        wordCounter
      )

      pushChunk(
        contentChunks,
        paragraph(
          `Think of this page as the “how-to” companion to the pillar. Your goal here is to be extremely clear and specific: ` +
            `a reader should be able to follow the steps and see progress quickly, even if they're new to the topic.`
        ),
        wordCounter
      )
      
      pushChunk(contentChunks, `<p>The core components of ${keyword} include:</p>\n`, wordCounter)
      pushChunk(contentChunks, `<ul>\n`, wordCounter)
      pushChunk(contentChunks, `<li><strong>Strategic planning:</strong> Clear objectives and constraints</li>\n`, wordCounter)
      pushChunk(contentChunks, `<li><strong>Tactical execution:</strong> A repeatable workflow</li>\n`, wordCounter)
      pushChunk(contentChunks, `<li><strong>Quality checks:</strong> Validation before scaling</li>\n`, wordCounter)
      pushChunk(contentChunks, `<li><strong>Performance tracking:</strong> Measure and iterate</li>\n`, wordCounter)
      pushChunk(contentChunks, `</ul>\n\n`, wordCounter)
      
      pushChunk(contentChunks, `<h2>How to Get Started with ${keywordCapitalized}</h2>\n`, wordCounter)
      pushChunk(
        contentChunks,
        paragraph(
          `Getting started with ${keyword} doesn't have to be complicated. ` +
            `Use this step-by-step process, then refine based on results.`
        ),
        wordCounter
      )
      
      pushChunk(contentChunks, `<ol>\n`, wordCounter)
      pushChunk(contentChunks, `<li><strong>Assess:</strong> Identify what you already have (assets, constraints, tools)</li>\n`, wordCounter)
      pushChunk(contentChunks, `<li><strong>Define:</strong> Set a single primary metric for success</li>\n`, wordCounter)
      pushChunk(contentChunks, `<li><strong>Plan:</strong> Create a simple checklist and timeline</li>\n`, wordCounter)
      pushChunk(contentChunks, `<li><strong>Execute:</strong> Implement one change at a time</li>\n`, wordCounter)
      pushChunk(contentChunks, `<li><strong>Review:</strong> Improve weak parts weekly</li>\n`, wordCounter)
      pushChunk(contentChunks, `</ol>\n\n`, wordCounter)
      
      pushChunk(contentChunks, `<h2>Benefits of ${keywordCapitalized}</h2>\n`, wordCounter)
      pushChunk(contentChunks, paragraph(`Organizations and individuals who master ${keyword} experience numerous advantages:`), wordCounter)
      pushChunk(contentChunks, `<ul>\n`, wordCounter)
      pushChunk(contentChunks, `<li>Higher clarity and faster execution</li>\n`, wordCounter)
      pushChunk(contentChunks, `<li>Better decision-making through measurement</li>\n`, wordCounter)
      pushChunk(contentChunks, `<li>More predictable outcomes and repeatability</li>\n`, wordCounter)
      pushChunk(contentChunks, `<li>Improved ROI on related initiatives</li>\n`, wordCounter)
      pushChunk(contentChunks, `</ul>\n\n`, wordCounter)

      pushChunk(contentChunks, `<h2>Practical Example</h2>\n`, wordCounter)
      pushChunk(
        contentChunks,
        paragraph(
          `Example scenario: you're implementing ${keyword} for the first time. Start with a short baseline. ` +
            `Write a single section, validate it with a checklist, then scale the same pattern to the next section. ` +
            `This is the exact workflow a real AI model can automate: generate, refine, validate, and publish.`
        ),
        wordCounter
      )

      pushChunk(contentChunks, `<h2>Common Mistakes to Avoid</h2>\n`, wordCounter)
      pushChunk(contentChunks, paragraph(`When working with ${keyword}, be mindful of these common pitfalls:`), wordCounter)
      pushChunk(contentChunks, `<ul>\n`, wordCounter)
      pushChunk(contentChunks, `<li>❌ Overcomplicating the first version</li>\n`, wordCounter)
      pushChunk(contentChunks, `<li>❌ Skipping examples and edge cases</li>\n`, wordCounter)
      pushChunk(contentChunks, `<li>❌ Not linking back to the pillar for context</li>\n`, wordCounter)
      pushChunk(contentChunks, `<li>❌ Not measuring outcomes</li>\n`, wordCounter)
      pushChunk(contentChunks, `</ul>\n\n`, wordCounter)

      // Ensure minimum length (cluster 1600+ words)
      let safetyIterations = 0
      while (wordCounter.value < targetMinWords && safetyIterations < 10) {
        safetyIterations += 1
        const n = safetyIterations
        pushChunk(contentChunks, `<h2>Extra Depth (${n})</h2>\n`, wordCounter)
        pushChunk(
          contentChunks,
          paragraph(
            `This additional section is included to make the demo cluster article long enough (1600+ words). ` +
              `In a real API connection, the model would fill this space with niche-specific details, data, and examples relevant to ${keyword}.`
          ),
          wordCounter
        )
        pushChunk(
          contentChunks,
          paragraph(
            `A strong cluster page should answer the reader’s intent quickly, then offer depth: steps, pitfalls, and a practical checklist. ` +
              `If you add a table, use it when you need comparison, a checklist, or a decision matrix.`
          ),
          wordCounter
        )
      }
      
      pushChunk(contentChunks, `<h2>Conclusion</h2>\n`, wordCounter)
      pushChunk(
        contentChunks,
        paragraph(
          `${keywordCapitalized} is a powerful tool in your ${pillarKeyword} toolkit. ` +
            `Use this page as a repeatable template: clear structure, examples, checklists, and a link back to the pillar. ` +
            `For more in-depth coverage, revisit <a href="${pillarUrl || '#'}">${linkAnchor || pillarKeyword}</a>.`
        ),
        wordCounter
      )
      
      await typeContent(contentChunks, 10)
      
      if (!generationAbortRef.current) {
        showNotification(`✅ Cluster article generated! ${Math.max(targetMinWords, recommendedLength)}+ words 🔗`)
      }
    }
    
    // 6. For STANDALONE articles - Generate basic article
    else {
      const keyword = writerContext.keyword
      const keywordCapitalized = capitalizeWords(keyword)
      
      const contentChunks: string[] = []
      
      contentChunks.push(`<h1>${newTitle}</h1>\n\n`)
      
      contentChunks.push(`<p>`)
      contentChunks.push(`Welcome to this comprehensive guide on ${keyword}. `)
      contentChunks.push(`In the following sections, we'll explore everything you need to know to get started and succeed.</p>\n\n`)
      
      contentChunks.push(`<h2>What is ${keywordCapitalized}?</h2>\n`)
      contentChunks.push(`<p>`)
      contentChunks.push(`${keywordCapitalized} is a concept that has gained significant attention in recent years. `)
      contentChunks.push(`At its core, it represents a systematic approach to achieving specific goals through proven methodologies.</p>\n\n`)
      
      contentChunks.push(`<h2>Key Features and Benefits</h2>\n`)
      contentChunks.push(`<p>`)
      contentChunks.push(`Understanding the key features helps you leverage ${keyword} effectively:</p>\n`)
      contentChunks.push(`<ul>\n`)
      contentChunks.push(`<li><strong>Flexibility:</strong> Adaptable to various contexts and needs</li>\n`)
      contentChunks.push(`<li><strong>Scalability:</strong> Works for individuals and organizations alike</li>\n`)
      contentChunks.push(`<li><strong>Measurability:</strong> Clear metrics for tracking progress</li>\n`)
      contentChunks.push(`</ul>\n\n`)
      
      contentChunks.push(`<h2>How to Get Started</h2>\n`)
      contentChunks.push(`<p>`)
      contentChunks.push(`Ready to begin? Here's a simple roadmap:</p>\n`)
      contentChunks.push(`<ol>\n`)
      contentChunks.push(`<li>Define your objectives clearly</li>\n`)
      contentChunks.push(`<li>Gather necessary resources and tools</li>\n`)
      contentChunks.push(`<li>Create an implementation plan</li>\n`)
      contentChunks.push(`<li>Execute and monitor progress</li>\n`)
      contentChunks.push(`<li>Iterate based on feedback</li>\n`)
      contentChunks.push(`</ol>\n\n`)
      
      contentChunks.push(`<h2>Conclusion</h2>\n`)
      contentChunks.push(`<p>`)
      contentChunks.push(`${keywordCapitalized} offers tremendous potential for those willing to invest time in learning and applying its principles. `)
      contentChunks.push(`Start with the basics outlined above, and you'll be on your way to mastery.</p>`)
      
      await typeContent(contentChunks, 25)
      
      if (!generationAbortRef.current) {
        showNotification(`✅ Article generated! Start editing to customize 🚀`)
      }
    }
    
    // 7. Update NLP keywords from context
    if (writerContext.pillarData?.subKeywords) {
      const newNLPKeywords: NLPKeyword[] = writerContext.pillarData.subKeywords.map(sk => ({
        text: sk.keyword,
        used: false
      }))
      setNlpKeywords(newNLPKeywords)
    }
    
    setIsAIGenerating(false)
    setGenerationProgress(100)
    
  }, [writerContext, editor, showNotification])
  
  // Handle inserting internal link into editor
  const handleInsertLink = useCallback((anchorText: string, url: string) => {
    if (!editor) return
    
    // Check if there's a selection
    const { from, to } = editor.state.selection
    const hasSelection = from !== to
    
    if (hasSelection) {
      // Replace selection with linked text
      editor
        .chain()
        .focus()
        .deleteSelection()
        .insertContent(`<a href="${url}">${anchorText}</a>`)
        .run()
    } else {
      // Insert at cursor position
      editor
        .chain()
        .focus()
        .insertContent(`<a href="${url}">${anchorText}</a>`)
        .run()
    }
    
    showNotification(`Link inserted: "${anchorText}" 🔗`)
  }, [editor, showNotification])
  
  // Handle back navigation
  const handleBack = useCallback(() => {
    if (writerContext?.source && writerContext.source !== "direct") {
      // Navigate back to source feature
      const sourceRoutes: Record<string, string> = {
        "keyword-magic": "/keyword-magic",
        "competitor-gap": "/competitor-gap",
        "content-decay": "/content-decay",
        "topic-clusters": "/topic-clusters",
        "trend-spotter": "/trends",
        "content-roadmap": "/content-roadmap",
        "snippet-stealer": "/snippet-stealer",
        "command-center": "/dashboard",
      }
      router.push(sourceRoutes[writerContext.source] || "/dashboard")
    } else {
      router.push("/content-roadmap")
    }
  }, [writerContext, router])

  // Initial content analysis
  useEffect(() => {
    if (editor) {
      const html = editor.getHTML()
      const text = editor.getText()
      setEditorStats(analyzeEditorContent(html, text, targetKeyword, featuredImageUrl))
      
      // Initial readability calculation
      const readability = readabilityService.analyze(text)
      setReadabilityScore({
        fleschKincaid: readability.score.fleschKincaidGrade,
        gradeLevel: readability.score.readingLevel,
        readingTime: readability.stats.readingTimeMinutes,
        issues: readability.issues.map(i => i.suggestion)
      })
    }
  }, [editor, targetKeyword, featuredImageUrl])
  
  // Load versions when draft changes
  useEffect(() => {
    if (currentDraftId) {
      versionHistoryService.getVersions(currentDraftId).then((versionList) => {
        setVersions(versionList.map(v => ({
          id: v.id,
          timestamp: new Date(v.createdAt),
          wordCount: v.wordCount,
          label: v.changeDescription || `Version ${v.version}`
        })))
      })
    }
  }, [currentDraftId])
  
  // Cleanup auto-save timer
  useEffect(() => {
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current)
      }
    }
  }, [])
  
  // Set up version history functions after editor is ready
  useEffect(() => {
    if (editor) {
      saveVersionRef.current = async (label?: string) => {
        if (!currentDraftId) {
          // Create draft first if none exists
          const content = editor.getHTML()
          const draft = await draftService.createDraft({
            title,
            content,
            keyword: targetKeyword
          })
          setCurrentDraftId(draft.id)
          
          // Now create version
          const version = await versionHistoryService.createVersion({
            draftId: draft.id,
            content,
            title,
            changeType: 'manual',
            changeDescription: label || 'Manual checkpoint'
          })
          
          setVersions(prev => [...prev, {
            id: version.id,
            timestamp: new Date(version.createdAt),
            wordCount: version.wordCount,
            label: label || `Version ${version.version}`
          }])
          showNotification(`Version saved: ${label || 'Checkpoint'} 📝`)
          return
        }
        
        const content = editor.getHTML()
        const version = await versionHistoryService.createVersion({
          draftId: currentDraftId,
          content,
          title,
          changeType: 'manual',
          changeDescription: label || 'Manual checkpoint'
        })
        
        setVersions(prev => [...prev, {
          id: version.id,
          timestamp: new Date(version.createdAt),
          wordCount: version.wordCount,
          label: label || `Version ${version.version}`
        }])
        showNotification(`Version saved: ${label || 'Checkpoint'} 📝`)
      }
      
      restoreVersionRef.current = async (versionId: string) => {
        if (!currentDraftId) return
        
        const version = await versionHistoryService.getVersion(currentDraftId, versionId)
        if (version) {
          editor.commands.setContent(version.content)
          showNotification("Version restored! ↩️")
        }
      }
    }
  }, [editor, currentDraftId, title, targetKeyword, showNotification])

  // Auto-generate slug from title
  useEffect(() => {
    setSlug(generateSlug(title))
  }, [title])

  const copilotSidebar = (
    <Tabs defaultValue="optimization" className="flex-1 min-h-0 flex flex-col overflow-hidden">
      {/* Sticky Tab Headers */}
      <TabsList className="w-full justify-start rounded-none border-b border-border bg-background/95 backdrop-blur-sm p-0 shrink-0">
        <TabsTrigger
          value="optimization"
          className="rounded-none border-b-2 border-transparent data-[state=active]:border-emerald-500 data-[state=active]:bg-transparent data-[state=active]:text-emerald-400 px-3 py-3 text-xs"
        >
          SEO
        </TabsTrigger>
        <TabsTrigger
          value="meta"
          className="rounded-none border-b-2 border-transparent data-[state=active]:border-emerald-500 data-[state=active]:bg-transparent data-[state=active]:text-emerald-400 px-3 py-3 text-xs"
        >
          Meta
        </TabsTrigger>
        <TabsTrigger
          value="outline"
          className="rounded-none border-b-2 border-transparent data-[state=active]:border-emerald-500 data-[state=active]:bg-transparent data-[state=active]:text-emerald-400 px-3 py-3 text-xs"
        >
          Outline
        </TabsTrigger>
        <TabsTrigger
          value="competitors"
          className="rounded-none border-b-2 border-transparent data-[state=active]:border-emerald-500 data-[state=active]:bg-transparent data-[state=active]:text-emerald-400 px-3 py-3 text-xs"
        >
          SERP
        </TabsTrigger>
        <TabsTrigger
          value="tools"
          className="rounded-none border-b-2 border-transparent data-[state=active]:border-emerald-500 data-[state=active]:bg-transparent data-[state=active]:text-emerald-400 px-3 py-3 text-xs"
        >
          Tools
        </TabsTrigger>
      </TabsList>

      <TabsContent value="optimization" className="flex-1 min-h-0 m-0 overflow-y-auto">
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

      <TabsContent value="meta" className="flex-1 min-h-0 m-0 overflow-y-auto p-4">
        <MetaPanel
          title={title}
          content={editorStats.content}
          targetKeyword={targetKeyword}
          context={writerContext}
        />
      </TabsContent>

      <TabsContent value="outline" className="flex-1 min-h-0 m-0 overflow-y-auto">
        <OutlineTab editorStats={editorStats} title={title} />
      </TabsContent>

      <TabsContent value="competitors" className="flex-1 min-h-0 m-0 overflow-y-auto">
        <CompetitorsTab editorStats={editorStats} />
      </TabsContent>

      <TabsContent value="tools" className="flex-1 min-h-0 m-0 overflow-y-auto">
        <ToolsTab content={editorStats.content} targetKeyword={targetKeyword} />
      </TabsContent>
    </Tabs>
  )

  return (
    <main className="flex-1 flex flex-col h-screen overflow-hidden">
      {/* Fixed Header Bar */}
      <div className="shrink-0">
        {/* Editor Header - Fixed Header Bar */}
        <header className="flex items-center justify-between gap-2 px-3 sm:px-4 py-2.5 border-b border-border/50 bg-background/95 backdrop-blur-xl shadow-sm min-w-0 overflow-x-auto">
        {/* Left Section: Navigation & Title */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleBack}
            className="gap-1 sm:gap-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/50 h-8 px-1.5 sm:px-2"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline text-xs">
              {writerContext?.source && writerContext.source !== "direct" 
                ? `Back to ${writerContext.source.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}`
                : "Back"
              }
            </span>
          </Button>
        </div>

        {/* Center Section: Live Stats */}
        <div className="hidden lg:flex items-center gap-1 px-3 py-1.5 rounded-full bg-muted/40 border border-border/50">
          <div className="flex items-center gap-1.5 px-2">
            <FileText className="h-3.5 w-3.5 text-blue-500" />
            <span className="text-xs font-medium text-foreground">{editorStats.wordCount.toLocaleString()}</span>
            <span className="text-[10px] text-muted-foreground">words</span>
          </div>
          <div className="h-3 w-px bg-border/60" />
          <div className="flex items-center gap-1.5 px-2">
            <Hash className="h-3.5 w-3.5 text-purple-500" />
            <span className="text-xs font-medium text-foreground">
              {editorStats.headingCount.h1 + editorStats.headingCount.h2 + editorStats.headingCount.h3}
            </span>
            <span className="text-[10px] text-muted-foreground">headings</span>
          </div>
          <div className="h-3 w-px bg-border/60" />
          <div className="flex items-center gap-1.5 px-2">
            <ImageIcon className="h-3.5 w-3.5 text-emerald-500" />
            <span className="text-xs font-medium text-foreground">{editorStats.imageCount}</span>
            <span className="text-[10px] text-muted-foreground">images</span>
          </div>
          {readabilityScore && (
            <>
              <div className="h-3 w-px bg-border/60" />
              <div className="flex items-center gap-1.5 px-2">
                <Clock className="h-3.5 w-3.5 text-orange-500" />
                <span className="text-xs font-medium text-foreground">{readabilityScore.readingTime}</span>
                <span className="text-[10px] text-muted-foreground">min</span>
              </div>
            </>
          )}
        </div>

        {/* Right Section: Actions - Desktop (Full) */}
        <div className="hidden lg:flex items-center gap-3 shrink-0">
          {/* Save Status Indicator */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className={cn(
                  "flex items-center justify-center gap-1.5 h-8 px-3 rounded-full text-xs font-medium transition-colors",
                  isSaving 
                    ? "bg-blue-500/10 text-blue-600 dark:text-blue-400" 
                    : hasUnsavedChanges 
                      ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                      : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                )}>
                  {isSaving ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Saving</span>
                    </>
                  ) : hasUnsavedChanges ? (
                    <>
                      <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                      <span>Unsaved</span>
                    </>
                  ) : lastSaved ? (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Saved</span>
                    </>
                  ) : null}
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                {lastSaved 
                  ? `Last saved: ${lastSaved.toLocaleTimeString()}`
                  : 'Not saved yet'}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          {/* SEO Score */}
          <SEOScoreGauge score={seoScore} />
          
          {/* AI Tools Panel Button */}
          <AIToolsPanel 
            content={editorStats.content}
            targetKeyword={targetKeyword}
            onToolSelect={(toolId: string) => console.log('Selected tool:', toolId)}
          />
          
          {/* Checkpoint Button */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => saveVersion()}
                  className="h-8 gap-1.5 px-3"
                >
                  <History className="h-4 w-4 text-purple-500" />
                  <span className="text-xs">Checkpoint</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">Create Version Checkpoint</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Export Button with Dropdown */}
          <div className="relative">
            <Button
              onClick={() => setShowExportMenu(!showExportMenu)}
              disabled={isExporting}
              size="sm"
              className="h-8 gap-1.5 px-3 bg-linear-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white shadow-md shadow-emerald-500/20 border-0"
            >
              {isExporting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Rocket className="h-4 w-4" />
              )}
              <span>Export</span>
            </Button>
            
            {showExportMenu && (
              <div className="absolute right-0 top-full mt-2 w-52 bg-popover/95 backdrop-blur-lg border border-border rounded-xl shadow-xl z-50 overflow-hidden">
                <div className="p-1">
                  <button
                    onClick={() => handleExport('html')}
                    className="w-full px-3 py-2 text-sm text-left hover:bg-muted rounded-lg flex items-center gap-2.5 transition-colors"
                  >
                    <div className="p-1.5 rounded-md bg-blue-500/10">
                      <FileText className="h-4 w-4 text-blue-500" />
                    </div>
                    <div>
                      <p className="font-medium">Copy HTML</p>
                      <p className="text-[10px] text-muted-foreground">Copy to clipboard</p>
                    </div>
                  </button>
                  <button
                    onClick={() => handleExport('markdown')}
                    className="w-full px-3 py-2 text-sm text-left hover:bg-muted rounded-lg flex items-center gap-2.5 transition-colors"
                  >
                    <div className="p-1.5 rounded-md bg-purple-500/10">
                      <Download className="h-4 w-4 text-purple-500" />
                    </div>
                    <div>
                      <p className="font-medium">Markdown</p>
                      <p className="text-[10px] text-muted-foreground">Download .md file</p>
                    </div>
                  </button>
                  <button
                    onClick={() => handleExport('wordpress')}
                    className="w-full px-3 py-2 text-sm text-left hover:bg-muted rounded-lg flex items-center gap-2.5 transition-colors"
                  >
                    <div className="p-1.5 rounded-md bg-cyan-500/10">
                      <Download className="h-4 w-4 text-cyan-500" />
                    </div>
                    <div>
                      <p className="font-medium">WordPress</p>
                      <p className="text-[10px] text-muted-foreground">Export JSON format</p>
                    </div>
                  </button>
                  <button
                    onClick={() => handleExport('json')}
                    className="w-full px-3 py-2 text-sm text-left hover:bg-muted rounded-lg flex items-center gap-2.5 transition-colors"
                  >
                    <div className="p-1.5 rounded-md bg-emerald-500/10">
                      <Download className="h-4 w-4 text-emerald-500" />
                    </div>
                    <div>
                      <p className="font-medium">JSON Data</p>
                      <p className="text-[10px] text-muted-foreground">Full article data</p>
                    </div>
                  </button>
                </div>
              </div>
            )}
            </div>
        </div>
        
        {/* Right Section: Mobile Only - Saved, SEO, Export */}
        <div className="flex lg:hidden items-center gap-4 shrink-0">
          {/* Save Status - Mobile */}
          <div className={cn(
            "flex items-center justify-center gap-1.5 h-7 px-2.5 rounded-full text-xs font-medium",
            isSaving 
              ? "bg-blue-500/10 text-blue-600 dark:text-blue-400" 
              : hasUnsavedChanges 
                ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
          )}>
            {isSaving ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : hasUnsavedChanges ? (
              <div className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
            ) : lastSaved ? (
              <CheckCircle2 className="h-3 w-3" />
            ) : null}
          </div>
          
          {/* SEO Score - Mobile */}
          <SEOScoreGauge score={seoScore} />
          
          {/* Export Button - Mobile */}
          <div className="relative">
            <Button
              onClick={() => setShowExportMenu(!showExportMenu)}
              disabled={isExporting}
              size="sm"
              className="h-7 gap-1.5 px-2.5 bg-linear-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white shadow-md shadow-emerald-500/20 border-0"
            >
              {isExporting ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Rocket className="h-3.5 w-3.5" />
              )}
              <span className="text-xs">Export</span>
            </Button>
          </div>
        </div>
      </header>
      
      {/* Mobile Action Toolbar - Below Header (Only AI Tools, Copilot, Checkpoint) */}
      <div className="lg:hidden flex items-center justify-center gap-2 px-4 py-2 border-b border-border/50 bg-muted/30">
        {/* AI Tools Panel Button */}
        <AIToolsPanel 
          content={editorStats.content}
          targetKeyword={targetKeyword}
          onToolSelect={(toolId: string) => console.log('Selected tool:', toolId)}
        />
        
        {/* Copilot Sidebar Sheet */}
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
        
        {/* Checkpoint Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => saveVersion()}
          className="h-8 gap-1.5 px-3"
        >
          <History className="h-4 w-4 text-purple-500" />
          <span className="text-xs">Checkpoint</span>
        </Button>
      </div>
      </div>

      {/* Main Layout - Two Column Split - Scrollable Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Column A: The Editor - Scrollable */}
        <div className="flex-1 min-w-0 overflow-y-auto">
          {/* Context Banner - Shows when coming from another feature (Scrollable) */}
          {showContext && writerContext && (
            <ContextBanner
              context={writerContext}
              onDismiss={() => setShowContext(false)}
              onApplyRecommendations={handleApplyRecommendations}
              onInsertLink={handleInsertLink}
              isGenerating={isAIGenerating}
              generationProgress={generationProgress}
            />
          )}
          
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
            {/* Meta Info Bar */}
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

            {/* Featured Image Placeholder */}
            <ImagePlaceholder 
              onUpload={handleImageUpload} 
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
                onExpand={handleExpand}
                onRewrite={handleRewrite}
                onShorten={handleShorten}
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

      {/* Toast Notification */}
      <ToastNotification show={showToast} message={toastMessage} />
    </main>
  )
}

// ============================================
// TOOLS TAB COMPONENT - Quick Access to 18 AI Features
// ============================================

function ToolsTab({ content, targetKeyword }: { content: string; targetKeyword: string }) {
  const tools = [
    { id: 'plagiarism', name: 'Plagiarism Checker', icon: Shield, iconClass: 'text-emerald-400', chipClass: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30', score: 96, desc: 'Check for duplicate content' },
    { id: 'ai-detector', name: 'AI Detector', icon: Bot, iconClass: 'text-violet-400', chipClass: 'bg-violet-500/10 text-violet-300 border-violet-500/30', score: 35, desc: 'Detect AI-generated content' },
    { id: 'humanizer', name: 'Content Humanizer', icon: Wand2, iconClass: 'text-purple-400', chipClass: 'bg-purple-500/10 text-purple-300 border-purple-500/30', score: null, desc: 'Make content more natural' },
    { id: 'readability', name: 'Readability', icon: BookOpen, iconClass: 'text-blue-400', chipClass: 'bg-blue-500/10 text-blue-300 border-blue-500/30', score: 72, desc: 'Analyze reading difficulty' },
    { id: 'eeat', name: 'E-E-A-T Score', icon: Award, iconClass: 'text-amber-400', chipClass: 'bg-amber-500/10 text-amber-300 border-amber-500/30', score: 68, desc: 'Expertise & authority signals' },
    { id: 'topic-gap', name: 'Topic Gaps', icon: BarChart3, iconClass: 'text-orange-400', chipClass: 'bg-orange-500/10 text-orange-300 border-orange-500/30', score: null, desc: '3 missing topics found' },
    { id: 'schema', name: 'Schema Markup', icon: Code2, iconClass: 'text-cyan-400', chipClass: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30', score: null, desc: 'Generate structured data' },
    { id: 'snippet', name: 'Snippet Optimizer', icon: Target, iconClass: 'text-yellow-400', chipClass: 'bg-yellow-500/10 text-yellow-300 border-yellow-500/30', score: 45, desc: 'Optimize for snippets' },
    { id: 'ai-overview', name: 'AI Overview', icon: Eye, iconClass: 'text-violet-400', chipClass: 'bg-violet-500/10 text-violet-300 border-violet-500/30', score: 52, desc: 'AI search visibility' },
    { id: 'entities', name: 'Entity Coverage', icon: Users, iconClass: 'text-emerald-400', chipClass: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30', score: 78, desc: '12 entities detected' },
    { id: 'citations', name: 'Citations', icon: Quote, iconClass: 'text-purple-400', chipClass: 'bg-purple-500/10 text-purple-300 border-purple-500/30', score: null, desc: 'Manage source citations' },
    { id: 'links', name: 'Internal Links', icon: Link2, iconClass: 'text-blue-400', chipClass: 'bg-blue-500/10 text-blue-300 border-blue-500/30', score: null, desc: '8 link opportunities' },
    { id: 'paa', name: 'People Also Ask', icon: HelpCircle, iconClass: 'text-blue-400', chipClass: 'bg-blue-500/10 text-blue-300 border-blue-500/30', score: null, desc: '15 questions to answer' },
    { id: 'brief', name: 'Content Brief', icon: FileText, iconClass: 'text-purple-400', chipClass: 'bg-purple-500/10 text-purple-300 border-purple-500/30', score: null, desc: 'Generate full brief' },
    { id: 'competitor', name: 'Competitors', icon: TrendingUp, iconClass: 'text-blue-400', chipClass: 'bg-blue-500/10 text-blue-300 border-blue-500/30', score: null, desc: 'Analyze top 10 results' },
    { id: 'images', name: 'Image SEO', icon: ImageIcon, iconClass: 'text-lime-400', chipClass: 'bg-lime-500/10 text-lime-300 border-lime-500/30', score: null, desc: 'Optimize 4 images' },
    { id: 'auto-optimize', name: 'Auto Optimize', icon: Zap, iconClass: 'text-yellow-400', chipClass: 'bg-yellow-500/10 text-yellow-300 border-yellow-500/30', score: null, desc: 'One-click SEO optimization' },
    { id: 'slash-commands', name: 'Slash Commands', icon: Keyboard, iconClass: 'text-cyan-400', chipClass: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30', score: null, desc: 'Type / in editor for AI' },
  ]

  const getStatusColor = (status: 'good' | 'medium' | 'warning' | 'action' | 'info') => {
    switch (status) {
      case 'good': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'warning': return 'bg-orange-500/20 text-orange-400 border-orange-500/30'
      case 'action': return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
      case 'info': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
    }
  }

  return (
    <div className="p-3 sm:p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">AI Writing Tools</h3>
        <span className="text-xs text-muted-foreground">18 tools</span>
      </div>

      <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-border bg-card p-1">
        {tools.map((tool) => (
          <button
            key={tool.id}
            type="button"
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border",
              "hover:brightness-110",
              tool.chipClass
            )}
            title={tool.desc}
          >
            <tool.icon className={cn("h-3.5 w-3.5", tool.iconClass)} />
            <span className="truncate max-w-44 sm:max-w-none">{tool.name}</span>
            {tool.score !== null && (
              <span className="ml-0.5 text-[10px] font-bold opacity-90">{tool.score}%</span>
            )}
          </button>
        ))}
      </div>

      <div className="pt-2 border-t border-border">
        <p className="text-xs text-muted-foreground text-center">
          Click "AI Tools" button for full panel →
        </p>
      </div>
    </div>
  )
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Capitalize first letter of each word
 */
function capitalizeWords(str: string): string {
  return str
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ")
}

/**
 * Generate a title based on keyword and intent
 * Smart detection to avoid duplicate words like "How to Use How to..."
 */
function generateTitleFromKeyword(keyword: string, intent: string): string {
  const capitalizedKeyword = keyword
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
  
  const lowerKeyword = keyword.toLowerCase()
  
  switch (intent) {
    case "commercial":
      // Avoid "Best Best..." if keyword already starts with "best"
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
      // Avoid "How to How to..." if keyword already starts with "how to"
      if (lowerKeyword.startsWith("how to ")) {
        return `${capitalizedKeyword}: Complete Guide ${new Date().getFullYear()}`
      }
      // Avoid "How to Use What is..." patterns
      if (lowerKeyword.startsWith("what ") || lowerKeyword.startsWith("why ") || lowerKeyword.startsWith("when ")) {
        return `${capitalizedKeyword}: Complete Guide ${new Date().getFullYear()}`
      }
      return `How to Use ${capitalizedKeyword}: Complete Guide ${new Date().getFullYear()}`
  }
}
