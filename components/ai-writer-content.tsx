"use client"

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
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import {
  ChevronLeft,
  Rocket,
  CheckCircle2,
  XCircle,
  Sparkles,
  MessageSquare,
  Wand2,
  Trophy,
  ArrowRight,
  Expand,
  RotateCcw,
  Minimize2,
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  ImageIcon,
  Loader2,
  Upload,
  Link as LinkIcon,
  Undo,
  Redo,
  Quote,
  Code,
} from "lucide-react"
import { cn } from "@/lib/utils"

// ============================================
// TYPES
// ============================================
interface NLPKeyword {
  text: string
  used: boolean
}

interface CriticalIssue {
  id: string
  text: string
  check: (stats: EditorStats) => boolean
}

interface EditorStats {
  wordCount: number
  characterCount: number
  headingCount: { h1: number; h2: number; h3: number }
  paragraphCount: number
  imageCount: number
  linkCount: number
  keywordDensity: number
  keywordCount: number
  content: string
}

// ============================================
// INITIAL DATA
// ============================================
const initialNLPKeywords: NLPKeyword[] = [
  { text: "AI Agents", used: false },
  { text: "Generative AI", used: false },
  { text: "LLMs", used: false },
  { text: "Prompt Engineering", used: false },
  { text: "Machine Learning", used: false },
  { text: "Neural Networks", used: false },
  { text: "Natural Language", used: false },
  { text: "Automation", used: false },
  { text: "GPT Models", used: false },
  { text: "Fine-tuning", used: false },
  { text: "Embeddings", used: false },
  { text: "Vector Database", used: false },
  { text: "RAG", used: false },
  { text: "Chain of Thought", used: false },
  { text: "Zero-shot", used: false },
]

const criticalIssuesConfig: CriticalIssue[] = [
  {
    id: "h1",
    text: "Add keyword in H1",
    check: (stats) => stats.headingCount.h1 > 0,
  },
  {
    id: "meta",
    text: "Meta description length",
    check: () => true, // Always passes for demo
  },
  {
    id: "wordcount",
    text: "Word count > 1500",
    check: (stats) => stats.wordCount >= 1500,
  },
  {
    id: "links",
    text: "Internal links > 3",
    check: (stats) => stats.linkCount >= 3,
  },
  {
    id: "images",
    text: "Image alt text",
    check: (stats) => stats.imageCount > 0,
  },
  {
    id: "density",
    text: "Keyword density 1-2%",
    check: (stats) => stats.keywordDensity >= 1 && stats.keywordDensity <= 2,
  },
]

// Initial content for the editor
const initialContent = `
<h1>How to Use AI Agents to Automate Your Workflow</h1>

<p><strong>AI agents</strong> are revolutionizing the way we work. Unlike traditional automation tools, these intelligent systems can understand context, make decisions, and execute complex multi-step tasks without constant human oversight.</p>

<p>In this comprehensive guide, we'll explore how you can leverage <strong>generative AI</strong> and <strong>LLMs</strong> to build powerful automation workflows that save hours of manual work every week.</p>

<h2>What Are AI Agents?</h2>

<p>At their core, AI agents are autonomous systems powered by <strong>machine learning</strong> and <strong>natural language</strong> processing. They can interpret instructions, break down complex goals into subtasks, and use various tools to accomplish objectives.</p>

<p>Think of them as intelligent assistants that can browse the web, write code, analyze data, and communicate with other systems—all while learning from each interaction to improve their performance over time using techniques like <strong>RAG</strong> and advanced <strong>GPT models</strong>.</p>

<h2>Key Use Cases</h2>

<p>From customer support to content creation, AI agents are finding applications across every industry. Here are some of the most impactful ways businesses are deploying these tools...</p>
`

// ============================================
// AI SIMULATION UTILITIES
// ============================================
const aiGeneratedContent = {
  faq: `
<h2>Frequently Asked Questions</h2>

<h3>What is an AI Agent?</h3>
<p>An AI agent is an autonomous software system that can perceive its environment, make decisions, and take actions to achieve specific goals. Unlike simple chatbots, AI agents can use tools, browse the web, write code, and complete multi-step tasks independently.</p>

<h3>How do AI Agents differ from ChatGPT?</h3>
<p>While ChatGPT is a conversational AI model, AI agents are built on top of models like GPT-4 and can autonomously execute complex workflows. They can remember context across sessions, use external tools, and chain multiple actions together.</p>

<h3>Are AI Agents safe to use?</h3>
<p>AI agents are generally safe when properly configured with appropriate guardrails and human oversight. It's important to set clear boundaries and review agent actions, especially for critical business processes.</p>
`,
  conclusion: `
<h2>Conclusion</h2>

<p>AI agents represent a paradigm shift in how we approach automation. By combining the reasoning capabilities of large language models with the ability to take real-world actions, these systems unlock unprecedented productivity gains.</p>

<p>As you begin your journey with AI agents, remember to start small, iterate often, and always maintain appropriate human oversight. The future of work is not about replacing humans—it's about augmenting our capabilities with intelligent assistants that handle the routine while we focus on what matters most.</p>

<p>Ready to get started? Explore our recommended AI agent frameworks and start building your first automated workflow today.</p>
`,
  expand: `This concept deserves deeper exploration. AI agents leverage sophisticated architectures including transformer-based neural networks, retrieval-augmented generation (RAG), and chain-of-thought prompting to achieve remarkable reasoning capabilities. They can dynamically adapt their strategies based on intermediate results, making them far more flexible than traditional rule-based automation systems.`,
  rewrite: `In essence, this represents a fundamental shift in computational intelligence. These autonomous systems demonstrate unprecedented ability to understand nuanced instructions, decompose complex objectives into manageable subtasks, and execute multi-step processes with minimal human intervention.`,
  shorten: `In short: AI agents automate complex tasks by understanding context and making decisions autonomously.`,
}

// ============================================
// CUSTOM IMAGE PLACEHOLDER COMPONENT
// ============================================
function ImagePlaceholder({ onUpload }: { onUpload: (url: string) => void }) {
  const [isUploading, setIsUploading] = useState(false)
  const [imageUrl, setImageUrl] = useState<string | null>(null)

  const handleClick = useCallback(() => {
    // Create a hidden file input
    const input = document.createElement("input")
    input.type = "file"
    input.accept = "image/*"
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        setIsUploading(true)
        // Simulate upload delay
        await new Promise((resolve) => setTimeout(resolve, 1500))
        // Create object URL for preview
        const url = URL.createObjectURL(file)
        setImageUrl(url)
        setIsUploading(false)
        onUpload(url)
      }
    }
    input.click()
  }, [onUpload])

  if (imageUrl) {
    return (
      <div className="relative w-full h-64 rounded-lg overflow-hidden mb-8">
        <img src={imageUrl} alt="Featured" className="w-full h-full object-cover" />
        <button
          onClick={() => setImageUrl(null)}
          className="absolute top-2 right-2 p-2 bg-black/50 rounded-lg text-white hover:bg-black/70 transition-colors"
        >
          <XCircle className="h-4 w-4" />
        </button>
      </div>
    )
  }

  return (
    <div
      onClick={handleClick}
      className="relative w-full h-64 bg-slate-800 rounded-lg mb-8 flex items-center justify-center border border-border cursor-pointer hover:border-emerald-500/50 hover:bg-slate-800/80 transition-all group"
    >
      {isUploading ? (
        <div className="text-center">
          <Loader2 className="h-8 w-8 text-emerald-400 animate-spin mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Uploading...</p>
        </div>
      ) : (
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-3 rounded-lg bg-slate-700 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
            <Upload className="w-8 h-8 text-muted-foreground group-hover:text-emerald-400 transition-colors" />
          </div>
          <p className="text-muted-foreground text-sm group-hover:text-foreground transition-colors">
            Click to upload Featured Image
          </p>
        </div>
      )}
    </div>
  )
}

// ============================================
// EDITOR TOOLBAR COMPONENT
// ============================================
function EditorToolbar({ editor }: { editor: ReturnType<typeof useEditor> }) {
  if (!editor) return null

  return (
    <div className="flex items-center gap-1 p-2 border-b border-border bg-card/50 rounded-t-lg">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        className="h-8 w-8 p-0"
      >
        <Undo className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        className="h-8 w-8 p-0"
      >
        <Redo className="h-4 w-4" />
      </Button>

      <div className="h-4 w-px bg-border mx-1" />

      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={cn("h-8 w-8 p-0", editor.isActive("bold") && "bg-muted text-emerald-400")}
      >
        <Bold className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={cn("h-8 w-8 p-0", editor.isActive("italic") && "bg-muted text-emerald-400")}
      >
        <Italic className="h-4 w-4" />
      </Button>

      <div className="h-4 w-px bg-border mx-1" />

      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={cn("h-8 w-8 p-0", editor.isActive("heading", { level: 1 }) && "bg-muted text-emerald-400")}
      >
        <Heading1 className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={cn("h-8 w-8 p-0", editor.isActive("heading", { level: 2 }) && "bg-muted text-emerald-400")}
      >
        <Heading2 className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={cn("h-8 w-8 p-0", editor.isActive("heading", { level: 3 }) && "bg-muted text-emerald-400")}
      >
        <Heading3 className="h-4 w-4" />
      </Button>

      <div className="h-4 w-px bg-border mx-1" />

      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={cn("h-8 w-8 p-0", editor.isActive("bulletList") && "bg-muted text-emerald-400")}
      >
        <List className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={cn("h-8 w-8 p-0", editor.isActive("orderedList") && "bg-muted text-emerald-400")}
      >
        <ListOrdered className="h-4 w-4" />
      </Button>

      <div className="h-4 w-px bg-border mx-1" />

      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={cn("h-8 w-8 p-0", editor.isActive("blockquote") && "bg-muted text-emerald-400")}
      >
        <Quote className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        className={cn("h-8 w-8 p-0", editor.isActive("codeBlock") && "bg-muted text-emerald-400")}
      >
        <Code className="h-4 w-4" />
      </Button>
    </div>
  )
}

// ============================================
// MAIN COMPONENT
// ============================================
export function AIWriterContent() {
  // Meta states
  const [title, setTitle] = useState("How to Use AI Agents to Automate Your Workflow")
  const [slug, setSlug] = useState("ai-agents-automate-workflow")
  const [targetKeyword, setTargetKeyword] = useState("AI Agents")

  // UI states
  const [isAIGenerating, setIsAIGenerating] = useState(false)
  const [aiAction, setAiAction] = useState<string | null>(null)
  const [featuredImageUrl, setFeaturedImageUrl] = useState<string | null>(null)
  const [hasSelection, setHasSelection] = useState(false)

  // NLP Keywords state
  const [nlpKeywords, setNlpKeywords] = useState<NLPKeyword[]>(initialNLPKeywords)

  // Editor stats state
  const [editorStats, setEditorStats] = useState<EditorStats>({
    wordCount: 0,
    characterCount: 0,
    headingCount: { h1: 0, h2: 0, h3: 0 },
    paragraphCount: 0,
    imageCount: 0,
    linkCount: 0,
    keywordDensity: 0,
    keywordCount: 0,
    content: "",
  })

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
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Placeholder.configure({
        placeholder: "Start writing with AI...",
        emptyEditorClass: "is-editor-empty",
      }),
      Image.configure({
        HTMLAttributes: {
          class: "rounded-lg max-w-full h-auto",
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-emerald-400 underline hover:text-emerald-300",
        },
      }),
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        class:
          "prose prose-invert prose-lg max-w-none focus:outline-none min-h-[500px] px-8 py-6",
      },
    },
    onUpdate: ({ editor }) => {
      analyzeContent(editor)
    },
    onSelectionUpdate: ({ editor }) => {
      setHasSelection(!editor.state.selection.empty)
    },
  })

  // Analyze content for SEO stats
  const analyzeContent = useCallback(
    (editorInstance: ReturnType<typeof useEditor>) => {
      if (!editorInstance) return

      const html = editorInstance.getHTML()
      const text = editorInstance.getText()

      // Word count
      const words = text.trim().split(/\s+/).filter(Boolean)
      const wordCount = words.length

      // Character count
      const characterCount = text.length

      // Heading counts
      const h1Count = (html.match(/<h1/gi) || []).length
      const h2Count = (html.match(/<h2/gi) || []).length
      const h3Count = (html.match(/<h3/gi) || []).length

      // Paragraph count
      const paragraphCount = (html.match(/<p/gi) || []).length

      // Image count
      const imageCount = (html.match(/<img/gi) || []).length + (featuredImageUrl ? 1 : 0)

      // Link count
      const linkCount = (html.match(/<a /gi) || []).length

      // Keyword density
      const keywordLower = targetKeyword.toLowerCase()
      const textLower = text.toLowerCase()
      const keywordMatches = textLower.split(keywordLower).length - 1
      const keywordDensity = wordCount > 0 ? (keywordMatches / wordCount) * 100 : 0

      setEditorStats({
        wordCount,
        characterCount,
        headingCount: { h1: h1Count, h2: h2Count, h3: h3Count },
        paragraphCount,
        imageCount,
        linkCount,
        keywordDensity: Math.round(keywordDensity * 100) / 100,
        keywordCount: keywordMatches,
        content: text,
      })

      // Update NLP keywords usage
      updateNLPKeywords(textLower)
    },
    [targetKeyword, featuredImageUrl]
  )

  // Update NLP keywords based on content
  const updateNLPKeywords = useCallback((text: string) => {
    setNlpKeywords((prev) =>
      prev.map((keyword) => ({
        ...keyword,
        used: text.includes(keyword.text.toLowerCase()),
      }))
    )
  }, [])

  // Calculate SEO Score
  const seoScore = useMemo(() => {
    let score = 0
    const maxScore = criticalIssuesConfig.length * 15 + 10 // Max possible score

    // Score from critical issues
    criticalIssuesConfig.forEach((issue) => {
      if (issue.check(editorStats)) {
        score += 15
      }
    })

    // Bonus for NLP keywords usage
    const usedKeywords = nlpKeywords.filter((k) => k.used).length
    const keywordBonus = Math.min((usedKeywords / nlpKeywords.length) * 10, 10)
    score += keywordBonus

    return Math.min(Math.round((score / maxScore) * 100), 100)
  }, [editorStats, nlpKeywords])

  // Get score styling
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-400"
    if (score >= 60) return "text-yellow-400"
    return "text-red-400"
  }

  const getScoreGlow = (score: number) => {
    if (score >= 80) return "shadow-emerald-500/50"
    if (score >= 60) return "shadow-yellow-500/50"
    return "shadow-red-500/50"
  }

  // Simulate AI Writing - streams text character by character
  const simulateAIWriting = useCallback(
    async (content: string, mode: "append" | "replace" = "append") => {
      if (!editor) return

      setIsAIGenerating(true)

      // If replacing, we need to handle selected text
      if (mode === "replace") {
        editor.chain().focus().deleteSelection().run()
      } else {
        // Move cursor to end for appending
        editor.chain().focus().setTextSelection(editor.state.doc.content.size).run()
      }

      // Stream content character by character
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

  // Handle AI Actions from sidebar
  const handleGenerateFAQ = useCallback(async () => {
    setAiAction("faq")
    await simulateAIWriting(aiGeneratedContent.faq)
  }, [simulateAIWriting])

  const handleWriteConclusion = useCallback(async () => {
    setAiAction("conclusion")
    await simulateAIWriting(aiGeneratedContent.conclusion)
  }, [simulateAIWriting])

  // Handle BubbleMenu AI Actions
  const handleExpand = useCallback(async () => {
    if (!editor) return
    setAiAction("expand")
    setIsAIGenerating(true)

    // Get selected text
    const { from, to } = editor.state.selection
    const selectedText = editor.state.doc.textBetween(from, to)

    // Simulate AI delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Replace selection with expanded content
    editor.chain().focus().deleteSelection().run()
    await simulateAIWriting(aiGeneratedContent.expand, "replace")
  }, [editor, simulateAIWriting])

  const handleRewrite = useCallback(async () => {
    if (!editor) return
    setAiAction("rewrite")
    setIsAIGenerating(true)

    await new Promise((resolve) => setTimeout(resolve, 1000))

    editor.chain().focus().deleteSelection().run()
    await simulateAIWriting(aiGeneratedContent.rewrite, "replace")
  }, [editor, simulateAIWriting])

  const handleShorten = useCallback(async () => {
    if (!editor) return
    setAiAction("shorten")
    setIsAIGenerating(true)

    await new Promise((resolve) => setTimeout(resolve, 1000))

    editor.chain().focus().deleteSelection().run()
    await simulateAIWriting(aiGeneratedContent.shorten, "replace")
  }, [editor, simulateAIWriting])

  // Handle Export
  const handleExport = useCallback(async () => {
    if (!editor) return

    const html = editor.getHTML()
    const fullHtml = `
<!DOCTYPE html>
<html>
<head>
  <title>${title}</title>
  <meta name="description" content="${title}">
</head>
<body>
  ${featuredImageUrl ? `<img src="${featuredImageUrl}" alt="${title}" />` : ""}
  ${html}
</body>
</html>
    `.trim()

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
      // Re-analyze content with new image
      if (editor) {
        analyzeContent(editor)
      }
      showNotification("Featured image uploaded! 🖼️")
    },
    [editor, analyzeContent, showNotification]
  )

  // Initial content analysis
  useEffect(() => {
    if (editor) {
      analyzeContent(editor)
    }
  }, [editor, analyzeContent])

  // Auto-generate slug from title
  useEffect(() => {
    const newSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
    setSlug(newSlug)
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
            <span>{editorStats.headingCount.h1 + editorStats.headingCount.h2 + editorStats.headingCount.h3} headings</span>
            <span className="h-3 w-px bg-border" />
            <span>{editorStats.imageCount} images</span>
          </div>

          {/* SEO Score Gauge */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">SEO Score</span>
            <div
              className={cn(
                "relative flex items-center justify-center w-14 h-14 rounded-full bg-slate-900 shadow-lg",
                getScoreGlow(seoScore)
              )}
            >
              <svg className="absolute inset-0 w-14 h-14 -rotate-90">
                <circle cx="28" cy="28" r="24" fill="none" stroke="currentColor" strokeWidth="4" className="text-slate-700" />
                <circle
                  cx="28"
                  cy="28"
                  r="24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeDasharray={`${(seoScore / 100) * 150.8} 150.8`}
                  strokeLinecap="round"
                  className={getScoreColor(seoScore)}
                />
              </svg>
              <span className={cn("text-sm font-bold", getScoreColor(seoScore))}>{seoScore}</span>
            </div>
          </div>

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
              {hasSelection && (
                <div className="absolute top-2 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1 p-1 bg-slate-800 rounded-lg border border-slate-700 shadow-xl animate-in fade-in slide-in-from-top-2 duration-200">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleExpand}
                    disabled={isAIGenerating}
                    className="h-8 px-3 gap-1.5 text-xs hover:bg-slate-700 hover:text-emerald-400"
                  >
                    {aiAction === "expand" && isAIGenerating ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Expand className="h-3.5 w-3.5" />
                    )}
                    Expand
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleRewrite}
                    disabled={isAIGenerating}
                    className="h-8 px-3 gap-1.5 text-xs hover:bg-slate-700 hover:text-cyan-400"
                  >
                    {aiAction === "rewrite" && isAIGenerating ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <RotateCcw className="h-3.5 w-3.5" />
                    )}
                    Rewrite
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleShorten}
                    disabled={isAIGenerating}
                    className="h-8 px-3 gap-1.5 text-xs hover:bg-slate-700 hover:text-amber-400"
                  >
                    {aiAction === "shorten" && isAIGenerating ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Minimize2 className="h-3.5 w-3.5" />
                    )}
                    Shorter
                  </Button>
                </div>
              )}
            </div>

            {/* AI Generating Indicator */}
            {isAIGenerating && (
              <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
                <div className="flex items-center gap-3 px-4 py-3 bg-slate-800 border border-emerald-500/30 rounded-xl shadow-xl">
                  <Loader2 className="h-5 w-5 text-emerald-400 animate-spin" />
                  <span className="text-sm text-foreground">AI is writing...</span>
                  <div className="flex gap-1">
                    <span className="w-1 h-1 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1 h-1 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1 h-1 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
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

            <TabsContent value="optimization" className="flex-1 overflow-y-auto p-4 space-y-6 m-0">
              {/* Content Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-muted/30 border border-border">
                  <p className="text-xs text-muted-foreground mb-1">Words</p>
                  <p className="text-xl font-bold text-foreground">{editorStats.wordCount.toLocaleString()}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/30 border border-border">
                  <p className="text-xs text-muted-foreground mb-1">Keyword Density</p>
                  <p className={cn("text-xl font-bold", editorStats.keywordDensity >= 1 && editorStats.keywordDensity <= 2 ? "text-emerald-400" : "text-amber-400")}>
                    {editorStats.keywordDensity}%
                  </p>
                </div>
              </div>

              {/* Critical Issues Section */}
              <div>
                <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  Critical Issues
                </h3>
                <div className="space-y-2">
                  {criticalIssuesConfig.map((issue) => {
                    const passed = issue.check(editorStats)
                    return (
                      <div key={issue.id} className="flex items-center gap-2 text-sm">
                        {passed ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-400 shrink-0" />
                        )}
                        <span className={passed ? "text-muted-foreground" : "text-foreground"}>{issue.text}</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* NLP Keywords Section */}
              <div>
                <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-yellow-400" />
                  NLP Keywords (LSI)
                  <span className="text-xs text-muted-foreground ml-auto">
                    {nlpKeywords.filter((k) => k.used).length}/{nlpKeywords.length}
                  </span>
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {nlpKeywords.map((keyword, i) => (
                    <Badge
                      key={i}
                      variant="outline"
                      className={cn(
                        "text-xs transition-colors",
                        keyword.used
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                          : "bg-slate-800 border-slate-700 text-muted-foreground"
                      )}
                    >
                      {keyword.text}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* AI Tools Section */}
              <div>
                <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                  <Wand2 className="h-4 w-4 text-cyan-400" />
                  AI Tools
                </h3>
                <div className="grid grid-cols-1 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleGenerateFAQ}
                    disabled={isAIGenerating}
                    className="justify-start gap-2 h-9 bg-slate-800/50 border-slate-700 hover:bg-slate-800 hover:border-emerald-500/50"
                  >
                    {aiAction === "faq" && isAIGenerating ? (
                      <Loader2 className="h-4 w-4 text-emerald-400 animate-spin" />
                    ) : (
                      <MessageSquare className="h-4 w-4 text-emerald-400" />
                    )}
                    Generate FAQ
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleWriteConclusion}
                    disabled={isAIGenerating}
                    className="justify-start gap-2 h-9 bg-slate-800/50 border-slate-700 hover:bg-slate-800 hover:border-cyan-500/50"
                  >
                    {aiAction === "conclusion" && isAIGenerating ? (
                      <Loader2 className="h-4 w-4 text-cyan-400 animate-spin" />
                    ) : (
                      <Sparkles className="h-4 w-4 text-cyan-400" />
                    )}
                    Write Conclusion
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isAIGenerating}
                    className="justify-start gap-2 h-9 bg-slate-800/50 border-slate-700 hover:bg-slate-800 hover:border-yellow-500/50"
                  >
                    <CheckCircle2 className="h-4 w-4 text-yellow-400" />
                    Fix Grammar
                  </Button>
                </div>
              </div>

              {/* Snippet Stealer Integration */}
              <Card className="p-4 bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/30">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-amber-500/20">
                    <Trophy className="h-5 w-5 text-amber-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-foreground mb-1">Featured Snippet Opportunity</h4>
                    <p className="text-xs text-muted-foreground mb-3">
                      Competitor defines &quot;{targetKeyword}&quot; in 45 words.
                    </p>
                    <Button size="sm" className="w-full gap-2 bg-amber-500 hover:bg-amber-600 text-slate-900 font-medium">
                      Draft Better Definition
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="outline" className="flex-1 overflow-y-auto p-4 m-0">
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-foreground mb-3">Document Outline</h3>
                <div className="space-y-2 text-sm">
                  {/* Dynamically generated from editor content */}
                  {editorStats.headingCount.h1 > 0 && (
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-800/50">
                      <span className="text-emerald-400 font-mono text-xs">H1</span>
                      <span className="text-foreground truncate">{title}</span>
                    </div>
                  )}
                  {editorStats.headingCount.h2 > 0 && (
                    <>
                      <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-800/30 ml-4">
                        <span className="text-cyan-400 font-mono text-xs">H2</span>
                        <span className="text-muted-foreground">What Are AI Agents?</span>
                      </div>
                      <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-800/30 ml-4">
                        <span className="text-cyan-400 font-mono text-xs">H2</span>
                        <span className="text-muted-foreground">Key Use Cases</span>
                      </div>
                    </>
                  )}
                  <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-800/30 ml-4 opacity-50 cursor-pointer">
                    <span className="text-yellow-400 font-mono text-xs">+</span>
                    <span className="text-muted-foreground italic">Add section...</span>
                  </div>
                </div>

                {/* Outline Stats */}
                <div className="mt-6 p-3 rounded-lg bg-muted/30 border border-border">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <p className="text-lg font-bold text-emerald-400">{editorStats.headingCount.h1}</p>
                      <p className="text-xs text-muted-foreground">H1</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-cyan-400">{editorStats.headingCount.h2}</p>
                      <p className="text-xs text-muted-foreground">H2</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-amber-400">{editorStats.headingCount.h3}</p>
                      <p className="text-xs text-muted-foreground">H3</p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="competitors" className="flex-1 overflow-y-auto p-4 m-0">
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-foreground mb-3">Top Ranking Competitors</h3>
                {[1, 2, 3].map((rank) => (
                  <Card key={rank} className="p-3 bg-slate-800/50 border-slate-700">
                    <div className="flex items-start gap-3">
                      <span className="text-lg font-bold text-muted-foreground">#{rank}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {rank === 1 && "The Ultimate Guide to AI Agents"}
                          {rank === 2 && "AI Agents Explained: A Complete Overview"}
                          {rank === 3 && "Building AI Agents from Scratch"}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {rank === 1 && "techcrunch.com"}
                          {rank === 2 && "openai.com"}
                          {rank === 3 && "medium.com"}
                        </p>
                        <div className="flex items-center gap-3 mt-2 text-xs">
                          <span className="text-muted-foreground">
                            Words: <span className="text-foreground">{2500 - rank * 300}</span>
                          </span>
                          <span className="text-muted-foreground">
                            Headers: <span className="text-foreground">{12 - rank}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}

                {/* Comparison Card */}
                <Card className="p-4 bg-gradient-to-br from-cyan-500/10 to-emerald-500/10 border-cyan-500/30 mt-6">
                  <h4 className="text-sm font-medium text-foreground mb-3">Your Content vs Top 3</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Word Count</span>
                      <span className={cn("font-medium", editorStats.wordCount >= 1500 ? "text-emerald-400" : "text-amber-400")}>
                        {editorStats.wordCount} / 2,000 avg
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Headings</span>
                      <span className="font-medium text-foreground">
                        {editorStats.headingCount.h1 + editorStats.headingCount.h2 + editorStats.headingCount.h3} / 10 avg
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Images</span>
                      <span className={cn("font-medium", editorStats.imageCount >= 3 ? "text-emerald-400" : "text-amber-400")}>
                        {editorStats.imageCount} / 5 avg
                      </span>
                    </div>
                  </div>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </aside>
      </div>

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-4 fade-in duration-300">
          <div className="flex items-center gap-3 px-4 py-3 bg-card border border-border rounded-xl shadow-xl">
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            <span className="text-sm text-foreground">{toastMessage}</span>
          </div>
        </div>
      )}
    </main>
  )
}