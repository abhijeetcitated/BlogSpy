// ============================================
// CLUSTER WRITING MODE - Sequential Article Writing
// ============================================
// Left: Queue | Center: Current Article | Right: History

"use client"

import { useState, useCallback } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import {
  Building2,
  FileStack,
  ChevronRight,
  Pencil,
  Sparkles,
  Download,
  Copy,
  Check,
  Clock,
  FileEdit,
  History,
  Link2,
  Hash,
  ArrowRight,
  FileText,
  CheckCircle2,
  X
} from "lucide-react"
import { cn } from "@/lib/utils"

// Types for cluster writing mode
export interface WritingQueueItem {
  id: string
  keyword: string
  type: "pillar" | "cluster"
  status: "pending" | "writing" | "completed"
  subKeywords?: { keyword: string; placement: string; volume?: number }[]
  links?: { toKeyword: string; anchorText: string; placementHint: string }[]
  recommendedWords: number
  recommendedHeadings: number
  parentPillar?: string
}

export interface CompletedArticle {
  id: string
  keyword: string
  type: "pillar" | "cluster"
  content: string
  wordCount: number
  completedAt: Date
  exported: boolean
}

interface ClusterWritingModeProps {
  clusterName: string
  queue: WritingQueueItem[]
  onComplete: (articleId: string, content: string) => void
  onExport: (articleId: string, format: "docs" | "markdown" | "html") => void
  onExit: () => void
}

// Queue Item Component
function QueueItem({ 
  item, 
  isActive, 
  index 
}: { 
  item: WritingQueueItem
  isActive: boolean
  index: number 
}) {
  return (
    <div className={cn(
      "p-3 rounded-lg border transition-all",
      isActive 
        ? "bg-orange-500/10 border-orange-500/50 ring-1 ring-orange-500/20" 
        : item.status === "completed"
          ? "bg-emerald-500/5 border-emerald-500/30"
        : "bg-card/30 border-border/50"
    )}>
      <div className="flex items-center gap-2">
        {item.status === "completed" ? (
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
        ) : isActive ? (
          <div className="h-4 w-4 rounded-full bg-orange-500 animate-pulse" />
        ) : (
          <div className="h-4 w-4 rounded-full border-2 border-border flex items-center justify-center">
            <span className="text-[10px] text-muted-foreground">{index + 1}</span>
          </div>
        )}
        
        {item.type === "pillar" ? (
          <Building2 className="h-4 w-4 text-purple-400" />
        ) : (
          <FileStack className="h-4 w-4 text-cyan-400" />
        )}
        
        <span className={cn(
          "text-sm truncate flex-1",
          isActive ? "font-medium text-foreground" : "text-muted-foreground"
        )}>
          {item.keyword}
        </span>
      </div>
      
      {item.type === "pillar" && item.subKeywords && (
        <div className="mt-1 ml-6 text-[10px] text-muted-foreground">
          {item.subKeywords.length} sub-keywords
        </div>
      )}
    </div>
  )
}

// History Item Component
function HistoryItem({ 
  article, 
  onView,
  onExport 
}: { 
  article: CompletedArticle
  onView: () => void
  onExport: () => void
}) {
  return (
    <div className="p-3 rounded-lg bg-card/30 border border-border/50">
      <div className="flex items-center gap-2 mb-2">
        {article.type === "pillar" ? (
          <Building2 className="h-4 w-4 text-purple-400" />
        ) : (
          <FileStack className="h-4 w-4 text-cyan-400" />
        )}
        <span className="text-sm font-medium truncate flex-1">{article.keyword}</span>
        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
      </div>
      
      <div className="flex items-center gap-2 text-[10px] text-muted-foreground mb-2">
        <span>{article.wordCount.toLocaleString()} words</span>
        <span>•</span>
        <span>{article.completedAt.toLocaleTimeString()}</span>
      </div>
      
      <div className="flex gap-2">
        <Button size="sm" variant="ghost" className="h-7 text-xs flex-1" onClick={onView}>
          <FileText className="h-3 w-3 mr-1" />
          View
        </Button>
        <Button size="sm" variant="ghost" className="h-7 text-xs flex-1" onClick={onExport}>
          <Download className="h-3 w-3 mr-1" />
          Export
        </Button>
      </div>
    </div>
  )
}

export function ClusterWritingMode({
  clusterName,
  queue,
  onComplete,
  onExport,
  onExit
}: ClusterWritingModeProps) {
  // State
  const [currentIndex, setCurrentIndex] = useState(0)
  const [content, setContent] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [history, setHistory] = useState<CompletedArticle[]>([])
  const [copied, setCopied] = useState(false)
  const [viewingHistory, setViewingHistory] = useState<CompletedArticle | null>(null)
  
  const currentItem = queue[currentIndex]
  const completedCount = history.length
  const totalCount = queue.length
  const progress = Math.round((completedCount / totalCount) * 100)
  
  // Handle AI Generate
  const handleGenerate = async () => {
    setIsGenerating(true)
    // Simulate AI generation
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const mockContent = `# ${currentItem.keyword}

## Introduction
This is a comprehensive guide about ${currentItem.keyword}...

${currentItem.subKeywords?.map(sk => 
  sk.placement === "h2" ? `## ${sk.keyword}\nContent about ${sk.keyword}...\n` :
  sk.placement === "h3" ? `### ${sk.keyword}\nDetailed section about ${sk.keyword}...\n` :
  `Mention of ${sk.keyword} in the content...\n`
).join("\n") || ""}

## Conclusion
In summary, ${currentItem.keyword} is essential for...

${currentItem.links?.map(link => 
  `\n[Internal Link: ${link.anchorText}](link-to-${link.toKeyword.toLowerCase().replace(/\s+/g, "-")})`
).join("") || ""}
`
    
    setContent(mockContent)
    setIsGenerating(false)
  }
  
  // Handle copy
  const handleCopy = () => {
    navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  
  // Handle complete and move to next
  const handleCompleteAndNext = () => {
    // Add to history
    const completed: CompletedArticle = {
      id: currentItem.id,
      keyword: currentItem.keyword,
      type: currentItem.type,
      content: content,
      wordCount: content.split(/\s+/).length,
      completedAt: new Date(),
      exported: false
    }
    setHistory(prev => [...prev, completed])
    
    // Notify parent
    onComplete(currentItem.id, content)
    
    // Move to next
    if (currentIndex < queue.length - 1) {
      setCurrentIndex(prev => prev + 1)
      setContent("")
    }
  }
  
  // Handle export
  const handleExport = (format: "docs" | "markdown" | "html") => {
    onExport(currentItem.id, format)
  }

  return (
    <div className="h-full flex flex-col bg-zinc-950">
      {/* Header */}
      <div className="shrink-0 p-4 border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-orange-500/20">
            <Pencil className="h-5 w-5 text-orange-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-foreground">Cluster Writing Mode</span>
              <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/40">
                {clusterName}
              </Badge>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-32 h-1.5 bg-card rounded-full overflow-hidden">
                <div 
                  className="h-full bg-linear-to-r from-orange-500 to-amber-500 transition-all" 
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground">
                {completedCount}/{totalCount} articles
              </span>
            </div>
          </div>
        </div>
        
        <Button variant="outline" size="sm" onClick={onExit}>
          <X className="h-4 w-4 mr-1" />
          Exit Mode
        </Button>
      </div>
      
      {/* Main Content - 3 Columns */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left - Queue */}
        <div className="w-64 shrink-0 border-r border-zinc-800 flex flex-col overflow-hidden">
          <div className="p-3 border-b border-zinc-800">
            <h3 className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              Writing Queue
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {queue.map((item, idx) => (
              <QueueItem 
                key={item.id}
                item={item}
                isActive={idx === currentIndex}
                index={idx}
              />
            ))}
          </div>
        </div>
        
        {/* Center - Current Writing */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {viewingHistory ? (
            // Viewing history item
            <div className="flex-1 flex flex-col p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <History className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Viewing: {viewingHistory.keyword}</span>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setViewingHistory(null)}>
                  <X className="h-4 w-4 mr-1" />
                  Close
                </Button>
              </div>
              <div className="flex-1 bg-background rounded-lg p-4 overflow-y-auto">
                <pre className="whitespace-pre-wrap text-sm">{viewingHistory.content}</pre>
              </div>
            </div>
          ) : (
            // Current writing
            <>
              {/* Current Article Header */}
              <div className="p-4 border-b border-zinc-800">
                <div className="flex items-center gap-3">
                  {currentItem.type === "pillar" ? (
                    <div className="p-2 rounded-lg bg-purple-500/20">
                      <Building2 className="h-5 w-5 text-purple-400" />
                    </div>
                  ) : (
                    <div className="p-2 rounded-lg bg-cyan-500/20">
                      <FileStack className="h-5 w-5 text-cyan-400" />
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={cn(
                        "text-[10px]",
                        currentItem.type === "pillar" 
                          ? "border-purple-500/40 text-purple-400" 
                          : "border-cyan-500/40 text-cyan-400"
                      )}>
                        {currentItem.type.toUpperCase()}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        Article {currentIndex + 1} of {queue.length}
                      </span>
                    </div>
                    <h2 className="text-lg font-semibold text-foreground mt-0.5">
                      {currentItem.keyword}
                    </h2>
                  </div>
                </div>
                
                {/* Article requirements */}
                <div className="mt-3 p-3 rounded-lg bg-card/50 space-y-2">
                  {/* Sub-keywords for pillar */}
                  {currentItem.subKeywords && currentItem.subKeywords.length > 0 && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Hash className="h-3.5 w-3.5" />
                        Sub-Keywords to include:
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {currentItem.subKeywords.map((sk, idx) => (
                          <Badge 
                            key={idx} 
                            variant="outline" 
                            className={cn(
                              "text-[10px]",
                              sk.placement === "h2" ? "border-purple-500/30 text-purple-300" :
                              sk.placement === "h3" ? "border-blue-500/30 text-blue-300" :
                              sk.placement === "faq" ? "border-amber-500/30 text-amber-300" :
                              "border-muted-foreground/30 text-muted-foreground"
                            )}
                          >
                            [{sk.placement.toUpperCase()}] {sk.keyword}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Internal links */}
                  {currentItem.links && currentItem.links.length > 0 && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Link2 className="h-3.5 w-3.5" />
                        Internal links to add:
                      </div>
                      <div className="space-y-1">
                        {currentItem.links.map((link, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-[10px]">
                            <ArrowRight className="h-3 w-3 text-orange-400" />
                            <span className="text-cyan-400">{link.toKeyword}</span>
                            <span className="text-muted-foreground">— "{link.anchorText}"</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Parent pillar for clusters */}
                  {currentItem.parentPillar && (
                    <div className="flex items-center gap-2 text-xs">
                      <ArrowRight className="h-3.5 w-3.5 text-purple-400" />
                      <span className="text-muted-foreground">Link back to pillar:</span>
                      <span className="text-purple-400">{currentItem.parentPillar}</span>
                    </div>
                  )}
                  
                  {/* Specs */}
                  <div className="flex items-center gap-4 pt-2 border-t border-border">
                    <span className="text-[10px] text-muted-foreground">
                      📝 {currentItem.recommendedWords.toLocaleString()} words
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      📑 {currentItem.recommendedHeadings} headings
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Editor Area */}
              <div className="flex-1 p-4 overflow-y-auto">
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Click 'Generate with AI' to create content, or write manually..."
                  className="min-h-[400px] bg-background/50 border-border resize-none text-sm"
                />
                
                {content && (
                  <div className="mt-2 text-xs text-muted-foreground">
                    {content.split(/\s+/).length.toLocaleString()} words
                  </div>
                )}
              </div>
              
              {/* Action Buttons */}
              <div className="p-4 border-t border-zinc-800 flex items-center justify-between">
                <Button
                  size="lg"
                  className="gap-2 bg-linear-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600"
                  onClick={handleGenerate}
                  disabled={isGenerating}
                >
                  <Sparkles className="h-4 w-4" />
                  {isGenerating ? "Generating..." : "Generate with AI"}
                </Button>
                
                <div className="flex items-center gap-2">
                  {content && (
                    <>
                      <Button variant="outline" onClick={handleCopy}>
                        {copied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
                        {copied ? "Copied!" : "Copy"}
                      </Button>
                      <Button variant="outline" onClick={() => handleExport("docs")}>
                        <Download className="h-4 w-4 mr-1" />
                        Export Docs
                      </Button>
                      <Button 
                        className="gap-2 bg-orange-500 hover:bg-orange-600"
                        onClick={handleCompleteAndNext}
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        {currentIndex < queue.length - 1 ? "Complete & Next" : "Complete All"}
                        {currentIndex < queue.length - 1 && <ChevronRight className="h-4 w-4" />}
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
        
        {/* Right - History */}
        <div className="w-64 shrink-0 border-l border-zinc-800 flex flex-col overflow-hidden">
          <div className="p-3 border-b border-zinc-800">
            <h3 className="text-sm font-medium flex items-center gap-2">
              <History className="h-4 w-4 text-muted-foreground" />
              Completed ({history.length})
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {history.length === 0 ? (
              <div className="text-center py-8 text-xs text-muted-foreground">
                <History className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p>Completed articles will appear here</p>
              </div>
            ) : (
              history.map(article => (
                <HistoryItem
                  key={article.id}
                  article={article}
                  onView={() => setViewingHistory(article)}
                  onExport={() => onExport(article.id, "docs")}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
