"use client"

import { useState, useCallback } from "react"
import {
  Search,
  Zap,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Sparkles,
  Type,
  ImageIcon,
  Link2,
  FileText,
  Monitor,
  Smartphone,
  ChevronRight,
  Eye,
  Copy,
  RefreshCw,
  Loader2,
  Globe,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

// Mock page structure data
const pageStructure = [
  { tag: "H1", content: "Complete Guide to SEO in 2024", status: "good" as const },
  { tag: "IMG", content: "hero-image.jpg - Alt tag missing", status: "error" as const },
  { tag: "P", content: "Introduction paragraph with keyword...", status: "good" as const },
  { tag: "H2", content: "What is SEO?", status: "good" as const },
  { tag: "P", content: "SEO stands for Search Engine...", status: "good" as const },
  { tag: "IMG", content: "diagram.png - Good alt text", status: "good" as const },
  { tag: "H2", content: "On-Page SEO Factors", status: "good" as const },
  { tag: "H3", content: "Title Tags", status: "warning" as const },
  { tag: "P", content: "Title tags are important for...", status: "good" as const },
  { tag: "A", content: "External link - No rel attribute", status: "warning" as const },
  { tag: "H2", content: "Technical SEO", status: "good" as const },
  { tag: "P", content: "Technical SEO involves...", status: "good" as const },
]

// Mock issues data with AI suggestions
const issues = {
  errors: [
    {
      id: 1,
      title: "Meta Description Missing",
      description: "Your page doesn't have a meta description. This affects CTR in search results.",
      canAiFix: true,
      aiSuggestion: "Discover the complete guide to SEO in 2024. Learn proven strategies for on-page optimization, technical SEO, and content marketing to boost your search rankings and drive organic traffic.",
    },
    {
      id: 2,
      title: "Alt Tag Missing on 1 Image",
      description: "hero-image.jpg is missing alt text for accessibility and SEO.",
      canAiFix: true,
      aiSuggestion: "SEO guide infographic showing the key elements of search engine optimization including keywords, backlinks, and content strategy",
    },
    {
      id: 3,
      title: "H1 Tag Too Long",
      description: "Your H1 is 68 characters. Recommended: under 60 characters.",
      canAiFix: true,
      aiSuggestion: "Complete SEO Guide 2024: Boost Rankings",
    },
  ],
  warnings: [
    {
      id: 4,
      title: "Keyword Density Low (0.4%)",
      description: "Target keyword appears only 3 times. Competitors average 8-12 mentions.",
      canAiFix: false,
    },
    {
      id: 5,
      title: "External Links Missing rel Attribute",
      description: "2 external links should have rel='noopener' for security.",
      canAiFix: false,
    },
    {
      id: 6,
      title: "Subheading H3 Could Be Improved",
      description: "'Title Tags' is too generic. Consider more descriptive headings.",
      canAiFix: true,
      aiSuggestion: "How to Optimize Title Tags for Maximum Click-Through Rate",
    },
  ],
  passed: [
    { id: 7, title: "Title Tag Present", description: "Good title tag with target keyword." },
    { id: 8, title: "URL Structure Optimized", description: "Clean, keyword-rich URL slug." },
    { id: 9, title: "Internal Links Found", description: "5 internal links detected." },
    { id: 10, title: "Mobile Responsive", description: "Page passes mobile-friendliness test." },
    { id: 11, title: "SSL Certificate Valid", description: "HTTPS is properly configured." },
    { id: 12, title: "Canonical Tag Present", description: "Correct canonical URL specified." },
  ],
}

// Mock NLP keywords with placement suggestions
const nlpKeywords = [
  { keyword: "SEO", used: true, competitorUses: 12, suggestedPlacement: "Already used throughout" },
  { keyword: "search engine optimization", used: true, competitorUses: 8, suggestedPlacement: "Already used throughout" },
  { keyword: "on-page SEO", used: true, competitorUses: 6, suggestedPlacement: "Already used throughout" },
  { keyword: "keywords", used: true, competitorUses: 9, suggestedPlacement: "Already used throughout" },
  { keyword: "meta tags", used: false, competitorUses: 7, suggestedPlacement: "Add to H2 or intro paragraph" },
  { keyword: "ranking factors", used: false, competitorUses: 5, suggestedPlacement: "Add to conclusion section" },
  { keyword: "Google algorithm", used: false, competitorUses: 4, suggestedPlacement: "Add to technical SEO section" },
  { keyword: "backlinks", used: true, competitorUses: 11, suggestedPlacement: "Already used throughout" },
  { keyword: "content optimization", used: false, competitorUses: 6, suggestedPlacement: "Add to H2 heading" },
  { keyword: "SERP", used: true, competitorUses: 5, suggestedPlacement: "Already used throughout" },
  { keyword: "title tag", used: true, competitorUses: 8, suggestedPlacement: "Already used throughout" },
  { keyword: "anchor text", used: false, competitorUses: 4, suggestedPlacement: "Add to links section" },
  { keyword: "internal linking", used: true, competitorUses: 7, suggestedPlacement: "Already used throughout" },
  { keyword: "page speed", used: false, competitorUses: 5, suggestedPlacement: "Add to technical SEO section" },
  { keyword: "mobile-first", used: false, competitorUses: 4, suggestedPlacement: "Add to mobile optimization section" },
  { keyword: "schema markup", used: false, competitorUses: 3, suggestedPlacement: "Add to structured data section" },
  { keyword: "user experience", used: true, competitorUses: 6, suggestedPlacement: "Already used throughout" },
  { keyword: "bounce rate", used: false, competitorUses: 4, suggestedPlacement: "Add to metrics section" },
  { keyword: "crawlability", used: false, competitorUses: 3, suggestedPlacement: "Add to technical SEO section" },
  { keyword: "indexing", used: true, competitorUses: 5, suggestedPlacement: "Already used throughout" },
]

export function OnPageCheckerContent() {
  // URL and scanning states
  const [url, setUrl] = useState("")
  const [isScanning, setIsScanning] = useState(false)
  const [scanComplete, setScanComplete] = useState(false)
  const [scanProgress, setScanProgress] = useState(0)
  
  // UI states
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop")
  const [activeIssueTab, setActiveIssueTab] = useState("errors")
  
  // AI Fix Modal states
  const [aiModalOpen, setAiModalOpen] = useState(false)
  const [currentIssue, setCurrentIssue] = useState<{
    title: string
    suggestion: string
  } | null>(null)
  const [aiSuggestion, setAiSuggestion] = useState("")
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [copied, setCopied] = useState(false)
  
  // Toast state
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState("")

  const score = 85
  const scoreColor = score >= 80 ? "text-emerald-400" : score >= 60 ? "text-amber-400" : "text-red-400"
  const scoreGlow = score >= 80 ? "shadow-emerald-500/30" : score >= 60 ? "shadow-amber-500/30" : "shadow-red-500/30"
  const scoreMessage =
    score >= 80
      ? "Great! Top 10 potential."
      : score >= 60
        ? "Good, but room for improvement."
        : "Critical issues found."

  // Show toast notification
  const showNotification = useCallback((message: string) => {
    setToastMessage(message)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }, [])

  // Handle scan
  const handleScan = useCallback(async () => {
    if (!url.trim()) {
      showNotification("Please enter a URL to scan")
      return
    }
    
    setIsScanning(true)
    setScanProgress(0)
    setScanComplete(false)
    
    // Simulate scanning progress
    const progressInterval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval)
          return 100
        }
        return prev + (100 / 30) // Complete in 3 seconds (100ms intervals)
      })
    }, 100)
    
    // Complete scan after 3 seconds
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    clearInterval(progressInterval)
    setScanProgress(100)
    setIsScanning(false)
    setScanComplete(true)
    showNotification("Scan complete! Found 3 errors and 3 warnings")
  }, [url, showNotification])

  // Handle AI Fix modal
  const handleAiFix = useCallback((issue: { title: string; aiSuggestion?: string }) => {
    setCurrentIssue({
      title: issue.title,
      suggestion: issue.aiSuggestion || "AI suggestion not available for this issue.",
    })
    setAiSuggestion(issue.aiSuggestion || "")
    setAiModalOpen(true)
  }, [])

  // Handle copy to clipboard
  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(aiSuggestion)
      setCopied(true)
      showNotification("Copied to clipboard!")
      setTimeout(() => setCopied(false), 2000)
    } catch {
      showNotification("Failed to copy")
    }
  }, [aiSuggestion, showNotification])

  // Handle regenerate
  const handleRegenerate = useCallback(async () => {
    setIsRegenerating(true)
    
    // Simulate AI regeneration
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Generate slightly different text
    const alternatives = [
      "Master SEO in 2024 with our comprehensive guide. From keyword research to technical optimization, learn actionable strategies to dominate search rankings and increase organic visibility.",
      "Your ultimate SEO roadmap for 2024. Explore expert techniques for on-page optimization, link building, and content strategy that drive real results in today's competitive search landscape.",
      "Unlock higher rankings with our 2024 SEO guide. Discover cutting-edge strategies for search optimization, from meta tags to content structure, designed to boost your website's visibility.",
    ]
    
    const randomAlt = alternatives[Math.floor(Math.random() * alternatives.length)]
    setAiSuggestion(randomAlt)
    setIsRegenerating(false)
    showNotification("New suggestion generated!")
  }, [showNotification])

  // Handle Add All Missing Keywords
  const handleAddAllKeywords = useCallback(() => {
    showNotification("Optimization Draft created in AI Writer ✨")
  }, [showNotification])

  // Get tag icon
  const getTagIcon = (tag: string) => {
    switch (tag) {
      case "H1":
      case "H2":
      case "H3":
        return <Type className="h-3.5 w-3.5" />
      case "IMG":
        return <ImageIcon className="h-3.5 w-3.5" />
      case "A":
        return <Link2 className="h-3.5 w-3.5" />
      default:
        return <FileText className="h-3.5 w-3.5" />
    }
  }

  // Get status icon
  const getStatusIcon = (status: "good" | "error" | "warning") => {
    switch (status) {
      case "good":
        return <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
      case "error":
        return <XCircle className="h-3.5 w-3.5 text-red-400" />
      case "warning":
        return <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-57px)]">
      {/* Diagnostic Header */}
      <div className="border-b border-border bg-card/50 p-6">
        <div className="flex items-center gap-8">
          {/* URL Input */}
          <div className="flex-1 max-w-xl">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="Enter URL to audit (e.g., https://myblog.com/seo-guide)"
                  className="pl-10 bg-muted/50 border-border h-11"
                  disabled={isScanning}
                />
              </div>
              <Button
                onClick={handleScan}
                disabled={isScanning}
                className="h-11 px-6 bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-600 hover:to-emerald-600 text-white font-medium shadow-lg shadow-cyan-500/20"
              >
                {isScanning ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Scanning... ({Math.round(3 - (scanProgress / 100) * 3)}s)
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    Run Scan
                  </>
                )}
              </Button>
            </div>
            
            {/* Progress Bar */}
            {isScanning && (
              <div className="mt-3">
                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 transition-all duration-100 ease-linear"
                    style={{ width: `${scanProgress}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1.5">
                  Analyzing page structure, meta tags, and content...
                </p>
              </div>
            )}
          </div>

          {/* Health Score Gauge */}
          {scanComplete && (
            <div className="flex items-center gap-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className={`relative w-32 h-32 rounded-full bg-card shadow-xl ${scoreGlow}`}>
                {/* Circular Progress */}
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  {/* Background circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="8"
                    className="text-muted"
                  />
                  {/* Progress circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    fill="none"
                    stroke="url(#scoreGradient)"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${(score / 100) * 264} 264`}
                    className="transition-all duration-1000"
                  />
                  <defs>
                    <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor={score >= 80 ? "#10b981" : score >= 60 ? "#f59e0b" : "#ef4444"} />
                      <stop offset="100%" stopColor={score >= 80 ? "#06b6d4" : score >= 60 ? "#eab308" : "#f87171"} />
                    </linearGradient>
                  </defs>
                </svg>
                {/* Score text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={`text-3xl font-bold ${scoreColor}`}>{score}</span>
                  <span className="text-xs text-muted-foreground">/100</span>
                </div>
              </div>
              <div>
                <p className={`text-lg font-semibold ${scoreColor}`}>{scoreMessage}</p>
                <p className="text-sm text-muted-foreground">3 errors, 3 warnings</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Empty State - Before Scan */}
      {!scanComplete && !isScanning && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md">
            <div className="mx-auto w-20 h-20 rounded-full bg-cyan-500/10 flex items-center justify-center mb-6">
              <Globe className="h-10 w-10 text-cyan-400" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Ready to Analyze Your Page
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              Enter a URL above and click "Run Scan" to get a comprehensive SEO audit with 
              AI-powered fix suggestions, semantic keyword analysis, and SERP preview.
            </p>
            <div className="flex flex-wrap justify-center gap-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-muted/50 rounded-full">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                Meta Tags
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-muted/50 rounded-full">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                Content Structure
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-muted/50 rounded-full">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                NLP Keywords
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-muted/50 rounded-full">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                SERP Preview
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Scanning State */}
      {isScanning && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="relative mx-auto w-24 h-24 mb-6">
              <div className="absolute inset-0 rounded-full border-4 border-muted" />
              <div 
                className="absolute inset-0 rounded-full border-4 border-transparent border-t-cyan-500 animate-spin"
                style={{ animationDuration: "1s" }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <Zap className="h-8 w-8 text-cyan-400" />
              </div>
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Scanning Page...
            </h2>
            <p className="text-sm text-muted-foreground">
              Analyzing structure, content, and SEO factors
            </p>
          </div>
        </div>
      )}

      {/* Main 3-Column Layout - After Scan */}
      {scanComplete && (
        <div className="flex-1 grid grid-cols-12 gap-0 overflow-hidden animate-in fade-in duration-500">
          {/* Column 1: Content DNA */}
          <div className="col-span-3 border-r border-border bg-card/30 overflow-y-auto">
            <div className="p-4">
              <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                <FileText className="h-4 w-4 text-cyan-400" />
                Page Structure
              </h3>
              <div className="space-y-1">
                {pageStructure.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 py-1.5 px-2 rounded-md hover:bg-muted/50 transition-colors group"
                  >
                    {/* Connector lines */}
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-px bg-muted-foreground/30" />
                      <div
                        className={cn(
                          "flex items-center justify-center w-6 h-6 rounded text-xs font-mono font-medium",
                          item.tag.startsWith("H") && "bg-purple-500/20 text-purple-400",
                          item.tag === "IMG" && "bg-blue-500/20 text-blue-400",
                          item.tag === "A" && "bg-cyan-500/20 text-cyan-400",
                          item.tag === "P" && "bg-muted text-muted-foreground"
                        )}
                      >
                        {getTagIcon(item.tag)}
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground truncate flex-1 font-mono">{item.content}</span>
                    {getStatusIcon(item.status)}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Column 2: The Diagnosis */}
          <div className="col-span-5 border-r border-border bg-card/20 overflow-y-auto">
            <div className="p-4">
              <Tabs value={activeIssueTab} onValueChange={setActiveIssueTab}>
                <TabsList className="bg-muted/50 mb-4">
                  <TabsTrigger
                    value="errors"
                    className="gap-2 data-[state=active]:bg-red-500/20 data-[state=active]:text-red-400"
                  >
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                    Errors ({issues.errors.length})
                  </TabsTrigger>
                  <TabsTrigger
                    value="warnings"
                    className="gap-2 data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400"
                  >
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    Warnings ({issues.warnings.length})
                  </TabsTrigger>
                  <TabsTrigger
                    value="passed"
                    className="gap-2 data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-400"
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Passed ({issues.passed.length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="errors" className="space-y-3 mt-0">
                  {issues.errors.map((issue) => (
                    <div
                      key={issue.id}
                      className="p-4 rounded-lg bg-muted/30 border border-red-500/20 hover:border-red-500/40 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <XCircle className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <h4 className="text-sm font-medium text-foreground">{issue.title}</h4>
                            <p className="text-xs text-muted-foreground mt-1">{issue.description}</p>
                          </div>
                        </div>
                        {issue.canAiFix && (
                          <Button
                            size="sm"
                            onClick={() => handleAiFix(issue)}
                            className="flex-shrink-0 bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 text-white shadow-lg shadow-violet-500/20"
                          >
                            <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                            Fix with AI
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </TabsContent>

                <TabsContent value="warnings" className="space-y-3 mt-0">
                  {issues.warnings.map((issue) => (
                    <div
                      key={issue.id}
                      className="p-4 rounded-lg bg-muted/30 border border-amber-500/20 hover:border-amber-500/40 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="h-5 w-5 text-amber-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <h4 className="text-sm font-medium text-foreground">{issue.title}</h4>
                            <p className="text-xs text-muted-foreground mt-1">{issue.description}</p>
                          </div>
                        </div>
                        {issue.canAiFix ? (
                          <Button
                            size="sm"
                            onClick={() => handleAiFix(issue)}
                            className="flex-shrink-0 bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 text-white shadow-lg shadow-violet-500/20"
                          >
                            <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                            Fix with AI
                          </Button>
                        ) : (
                          <Button size="sm" variant="outline" className="flex-shrink-0">
                            <Eye className="h-3.5 w-3.5 mr-1.5" />
                            See Suggestions
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </TabsContent>

                <TabsContent value="passed" className="space-y-2 mt-0">
                  {issues.passed.map((issue) => (
                    <div
                      key={issue.id}
                      className="p-3 rounded-lg bg-muted/20 border border-emerald-500/10 flex items-center gap-3"
                    >
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                      <div>
                        <h4 className="text-sm font-medium text-foreground">{issue.title}</h4>
                        <p className="text-xs text-muted-foreground">{issue.description}</p>
                      </div>
                    </div>
                  ))}
                </TabsContent>
              </Tabs>
            </div>
          </div>

          {/* Column 3: NLP & LSI Grid */}
          <div className="col-span-4 bg-card/10 overflow-y-auto">
            <div className="p-4">
              <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-violet-400" />
                Semantic Keywords (NLP)
              </h3>
              <p className="text-xs text-muted-foreground mb-4">
                Keywords identified via NLP analysis. <span className="text-emerald-400">Green</span> = used,{" "}
                <span className="text-muted-foreground">Gray</span> = missing opportunities.
              </p>
              <TooltipProvider>
                <div className="flex flex-wrap gap-2">
                  {nlpKeywords.map((kw, index) => (
                    <Tooltip key={index} delayDuration={200}>
                      <TooltipTrigger asChild>
                        <button
                          className={cn(
                            "px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                            kw.used
                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30"
                              : "bg-muted text-muted-foreground border border-border hover:bg-accent hover:text-foreground"
                          )}
                        >
                          {kw.keyword}
                        </button>
                      </TooltipTrigger>
                      <TooltipContent 
                        side="top" 
                        className="bg-popover border-border max-w-[200px]"
                      >
                        <p className="text-xs">
                          {kw.used ? (
                            <span className="text-emerald-400">✓ Found in your content</span>
                          ) : (
                            <span className="text-amber-400">
                              Competitors use this ~{kw.competitorUses} times.
                              <br />
                              <span className="text-muted-foreground">{kw.suggestedPlacement}</span>
                            </span>
                          )}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              </TooltipProvider>

              {/* Quick Stats */}
              <div className="mt-6 p-4 rounded-lg bg-muted/30 border border-border">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Keywords Used</p>
                    <p className="text-lg font-semibold text-emerald-400">
                      {nlpKeywords.filter((k) => k.used).length}/{nlpKeywords.length}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Coverage Score</p>
                    <p className="text-lg font-semibold text-foreground">55%</p>
                  </div>
                </div>
              </div>

              {/* Add All Missing Button */}
              <Button 
                onClick={handleAddAllKeywords}
                className="w-full mt-4 bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 text-white"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Add All Missing Keywords with AI
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Sticky Preview Bar */}
      {scanComplete && (
        <div className="border-t border-border bg-card/80 backdrop-blur-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-foreground">SERP Preview</h3>
            <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
              <button
                onClick={() => setPreviewDevice("desktop")}
                className={cn(
                  "p-1.5 rounded-md transition-colors",
                  previewDevice === "desktop"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Monitor className="h-4 w-4" />
              </button>
              <button
                onClick={() => setPreviewDevice("mobile")}
                className={cn(
                  "p-1.5 rounded-md transition-colors",
                  previewDevice === "mobile"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Smartphone className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Google Preview - Dynamic Width */}
          <div 
            className={cn(
              "bg-white rounded-lg p-4 transition-all duration-300",
              previewDevice === "mobile" ? "max-w-[375px] mx-auto" : "max-w-[600px]"
            )}
          >
            <div className="flex items-center gap-2 mb-1">
              <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center">
                <span className="text-xs text-slate-600">M</span>
              </div>
              <div>
                <p className="text-xs text-slate-600">myblog.com</p>
                <p className="text-xs text-slate-500 flex items-center gap-1">
                  https://myblog.com › seo-guide-2024
                  <ChevronRight className="h-3 w-3" />
                </p>
              </div>
            </div>
            <h4 className="text-lg text-blue-800 hover:underline cursor-pointer font-medium">
              Complete Guide to SEO in 2024 | MyBlog
            </h4>
            <p className={cn(
              "text-sm text-slate-600 mt-1",
              previewDevice === "mobile" ? "line-clamp-3" : "line-clamp-2"
            )}>
              <span className="text-red-500 text-xs">[Missing Meta Description]</span> Learn everything about search
              engine optimization with our comprehensive guide covering on-page SEO, technical SEO, and content
              strategies...
            </p>
          </div>
        </div>
      )}

      {/* AI Fix Modal */}
      <Dialog open={aiModalOpen} onOpenChange={setAiModalOpen}>
        <DialogContent className="sm:max-w-[500px] bg-card border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-violet-400" />
              AI Suggested Fix
            </DialogTitle>
            <DialogDescription>
              {currentIssue?.title}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <Textarea
              value={aiSuggestion}
              onChange={(e) => setAiSuggestion(e.target.value)}
              className="min-h-[120px] bg-muted/50 border-border resize-none"
              placeholder="AI generated suggestion..."
            />
            
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-violet-400" />
              <span>Powered by AI • You can edit the suggestion before copying</span>
            </div>
          </div>
          
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={handleRegenerate}
              disabled={isRegenerating}
            >
              {isRegenerating ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Regenerate
            </Button>
            <Button
              onClick={handleCopy}
              className="bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 text-white"
            >
              {copied ? (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy to Clipboard
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-4 fade-in duration-300">
          <div className="flex items-center gap-3 px-4 py-3 bg-card border border-border rounded-xl shadow-xl">
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            <span className="text-sm text-foreground">{toastMessage}</span>
          </div>
        </div>
      )}
    </div>
  )
}