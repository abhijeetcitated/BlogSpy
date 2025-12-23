// ============================================
// CONTENT BRIEFS PANEL - AI Writer Export
// ============================================
// Shows generated content briefs ready for AI Writer

"use client"

import { useState, useMemo, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import {
  Building2,
  FileStack,
  ChevronRight,
  ChevronDown,
  Sparkles,
  Check,
  Eye,
  Download,
  ArrowLeft,
  Send,
  FileText,
  Link2,
  Target,
  Clock,
  BarChart3,
  Lightbulb,
  Copy,
  ExternalLink
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

// ============================================
// TYPES (from ClusterBuilderPanel)
// ============================================

interface SubKeyword {
  id: string
  keyword: string
  volume: number
  kd: number
  placement: "h2" | "h3" | "body" | "faq"
  reason: string
}

interface ClusterArticle {
  id: string
  keyword: string
  volume: number
  kd: number
  intent: string
  type: string
  reason: string
}

interface GeneratedPillar {
  id: string
  keyword: string
  volume: number
  kd: number
  pillarScore: number
  subKeywords: {
    h2: SubKeyword[]
    h3: SubKeyword[]
    body: SubKeyword[]
    faq: SubKeyword[]
  }
  clusterArticles: ClusterArticle[]
  isExpanded: boolean
  isConfirmed: boolean
}

interface ClusterResult {
  pillars: GeneratedPillar[]
  orphanKeywords: any[]
  qualityScore: number
  coveragePercent: number
}

// ============================================
// BRIEF TYPES
// ============================================

interface ContentBrief {
  id: string
  type: "pillar" | "cluster"
  keyword: string
  volume: number
  kd: number
  
  // Content specs
  targetWordCount: number
  estimatedTime: string
  
  // Structure
  h2Count: number
  h3Count: number
  faqCount: number
  
  // Keywords
  primaryKeyword: string
  secondaryKeywords: string[]
  lsiKeywords: string[]
  faqKeywords: string[]
  
  // Internal linking
  internalLinks: { keyword: string; type: "pillar" | "cluster" }[]
  
  // Parent (for clusters)
  parentPillar?: string
  
  // UI
  isExpanded: boolean
}

// ============================================
// GENERATE BRIEFS
// ============================================

function generateBriefs(result: ClusterResult): ContentBrief[] {
  const briefs: ContentBrief[] = []
  
  for (const pillar of result.pillars) {
    // Pillar Brief
    const h2Count = Math.max(3, pillar.subKeywords.h2.length + 2)
    const h3Count = pillar.subKeywords.h3.length
    const faqCount = pillar.subKeywords.faq.length
    
    const wordCount = Math.max(3000, 2000 + (h2Count * 300) + (h3Count * 150) + (faqCount * 100))
    const hours = Math.ceil(wordCount / 500) // ~500 words per hour with AI
    
    briefs.push({
      id: pillar.id,
      type: "pillar",
      keyword: pillar.keyword,
      volume: pillar.volume,
      kd: pillar.kd,
      targetWordCount: wordCount,
      estimatedTime: `${hours}-${hours + 1} hours`,
      h2Count,
      h3Count,
      faqCount,
      primaryKeyword: pillar.keyword,
      secondaryKeywords: pillar.subKeywords.h2.map(s => s.keyword),
      lsiKeywords: [...pillar.subKeywords.h3, ...pillar.subKeywords.body].map(s => s.keyword),
      faqKeywords: pillar.subKeywords.faq.map(s => s.keyword),
      internalLinks: pillar.clusterArticles.map(c => ({ keyword: c.keyword, type: "cluster" as const })),
      isExpanded: false
    })
    
    // Cluster Briefs
    for (const cluster of pillar.clusterArticles) {
      const clusterWordCount = cluster.type === "tutorial" ? 2500 : 
                               cluster.type === "comparison" ? 2000 :
                               cluster.type === "list-post" ? 1800 : 1500
      const clusterHours = Math.ceil(clusterWordCount / 600)
      
      briefs.push({
        id: cluster.id,
        type: "cluster",
        keyword: cluster.keyword,
        volume: cluster.volume,
        kd: cluster.kd,
        targetWordCount: clusterWordCount,
        estimatedTime: `${clusterHours}-${clusterHours + 1} hours`,
        h2Count: cluster.type === "comparison" ? 4 : 3,
        h3Count: 2,
        faqCount: 2,
        primaryKeyword: cluster.keyword,
        secondaryKeywords: [],
        lsiKeywords: [],
        faqKeywords: [],
        internalLinks: [{ keyword: pillar.keyword, type: "pillar" }],
        parentPillar: pillar.keyword,
        isExpanded: false
      })
    }
  }
  
  return briefs
}

// ============================================
// MAIN COMPONENT
// ============================================

interface ContentBriefsPanelProps {
  result: ClusterResult
  onBack: () => void
}

export function ContentBriefsPanel({ result, onBack }: ContentBriefsPanelProps) {
  const router = useRouter()
  const [briefs, setBriefs] = useState<ContentBrief[]>(() => generateBriefs(result))
  const [filter, setFilter] = useState<"all" | "pillar" | "cluster">("all")
  
  // Filter briefs
  const filteredBriefs = useMemo(() => {
    if (filter === "all") return briefs
    return briefs.filter(b => b.type === filter)
  }, [briefs, filter])
  
  // Stats
  const stats = useMemo(() => ({
    pillars: briefs.filter(b => b.type === "pillar").length,
    clusters: briefs.filter(b => b.type === "cluster").length,
    totalWords: briefs.reduce((sum, b) => sum + b.targetWordCount, 0),
    totalVolume: briefs.reduce((sum, b) => sum + b.volume, 0)
  }), [briefs])
  
  // Toggle expansion
  const toggleBrief = useCallback((briefId: string) => {
    setBriefs(prev => prev.map(b => 
      b.id === briefId ? { ...b, isExpanded: !b.isExpanded } : b
    ))
  }, [])
  
  // Send to AI Writer
  const sendToAIWriter = useCallback((brief: ContentBrief) => {
    // Store brief in localStorage
    const writerData = {
      keyword: brief.keyword,
      type: brief.type,
      targetWordCount: brief.targetWordCount,
      h2Count: brief.h2Count,
      h3Count: brief.h3Count,
      faqCount: brief.faqCount,
      secondaryKeywords: brief.secondaryKeywords,
      lsiKeywords: brief.lsiKeywords,
      faqKeywords: brief.faqKeywords,
      internalLinks: brief.internalLinks
    }
    
    localStorage.setItem("blogspy_ai_writer_brief", JSON.stringify(writerData))
    router.push("/ai-writer")
  }, [router])
  
  // Copy brief as text
  const copyBrief = useCallback((brief: ContentBrief) => {
    const text = `
# Content Brief: ${brief.keyword}

## Overview
- Type: ${brief.type === "pillar" ? "Pillar Article" : "Cluster Article"}
- Target Word Count: ${brief.targetWordCount.toLocaleString()} words
- Estimated Time: ${brief.estimatedTime}

## Primary Keyword
${brief.keyword} (${brief.volume.toLocaleString()} monthly searches, KD: ${brief.kd})

## Secondary Keywords
${brief.secondaryKeywords.map(k => `- ${k}`).join("\n")}

## LSI Keywords
${brief.lsiKeywords.map(k => `- ${k}`).join("\n")}

## FAQ Keywords
${brief.faqKeywords.map(k => `- ${k}`).join("\n")}

## Structure
- H2 Sections: ${brief.h2Count}
- H3 Subsections: ${brief.h3Count}
- FAQ Items: ${brief.faqCount}

## Internal Links
${brief.internalLinks.map(l => `- ${l.keyword} (${l.type})`).join("\n")}
${brief.parentPillar ? `\n## Parent Pillar\n${brief.parentPillar}` : ""}
`.trim()
    
    navigator.clipboard.writeText(text)
    alert("Brief copied to clipboard!")
  }, [])
  
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-zinc-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Builder
            </Button>
            <div>
              <h2 className="text-lg font-semibold">Content Briefs</h2>
              <p className="text-sm text-zinc-400">
                {briefs.length} content briefs ready for AI Writer
              </p>
            </div>
          </div>
          
          {/* Filter tabs */}
          <div className="flex items-center gap-1 bg-zinc-800/50 p-1 rounded-lg">
            {(["all", "pillar", "cluster"] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "px-3 py-1.5 text-sm rounded-md transition-colors",
                  filter === f 
                    ? "bg-orange-500 text-white" 
                    : "text-zinc-400 hover:text-white"
                )}
              >
                {f === "all" ? `All (${briefs.length})` : 
                 f === "pillar" ? `Pillars (${stats.pillars})` : 
                 `Clusters (${stats.clusters})`}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Stats Bar */}
      <div className="p-4 border-b border-zinc-800 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-purple-400" />
              <div>
                <div className="text-lg font-bold text-white">{stats.pillars}</div>
                <div className="text-xs text-zinc-500">Pillar Briefs</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <FileStack className="h-5 w-5 text-cyan-400" />
              <div>
                <div className="text-lg font-bold text-white">{stats.clusters}</div>
                <div className="text-xs text-zinc-500">Cluster Briefs</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-emerald-400" />
              <div>
                <div className="text-lg font-bold text-white">{stats.totalWords.toLocaleString()}</div>
                <div className="text-xs text-zinc-500">Total Words</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-amber-400" />
              <div>
                <div className="text-lg font-bold text-white">{stats.totalVolume.toLocaleString()}</div>
                <div className="text-xs text-zinc-500">Total Volume</div>
              </div>
            </div>
          </div>
          
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-1" />
            Export All Briefs
          </Button>
        </div>
      </div>
      
      {/* Briefs Grid */}
      <div className="flex-1 overflow-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-w-6xl mx-auto">
          {filteredBriefs.map(brief => (
            <Card 
              key={brief.id}
              className={cn(
                "border transition-all",
                brief.type === "pillar"
                  ? "border-purple-500/30 bg-purple-500/5"
                  : "border-cyan-500/30 bg-cyan-500/5"
              )}
            >
              {/* Brief Header */}
              <div 
                className="p-4 cursor-pointer"
                onClick={() => toggleBrief(brief.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "p-2 rounded-lg",
                      brief.type === "pillar" ? "bg-purple-500/20" : "bg-cyan-500/20"
                    )}>
                      {brief.type === "pillar" 
                        ? <Building2 className="h-5 w-5 text-purple-400" />
                        : <FileStack className="h-5 w-5 text-cyan-400" />
                      }
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={cn(
                          "text-[10px]",
                          brief.type === "pillar"
                            ? "bg-purple-500/20 text-purple-400 border-purple-500/40"
                            : "bg-cyan-500/20 text-cyan-400 border-cyan-500/40"
                        )}>
                          {brief.type === "pillar" ? "PILLAR" : "CLUSTER"}
                        </Badge>
                        {brief.parentPillar && (
                          <span className="text-[10px] text-zinc-500">
                            → {brief.parentPillar}
                          </span>
                        )}
                      </div>
                      <h3 className="font-semibold">{brief.keyword}</h3>
                      <div className="flex items-center gap-3 mt-1 text-xs text-zinc-400">
                        <span className="text-emerald-400">{brief.volume.toLocaleString()} vol</span>
                        <span className={cn(
                          brief.kd <= 30 ? "text-emerald-400" : brief.kd <= 60 ? "text-amber-400" : "text-red-400"
                        )}>{brief.kd} KD</span>
                        <span>{brief.targetWordCount.toLocaleString()} words</span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {brief.estimatedTime}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => { e.stopPropagation(); copyBrief(brief) }}
                      className="h-8 w-8 p-0"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    {brief.isExpanded ? (
                      <ChevronDown className="h-5 w-5 text-zinc-400" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-zinc-400" />
                    )}
                  </div>
                </div>
                
                {/* Quick Stats */}
                <div className="flex items-center gap-4 mt-3 pt-3 border-t border-zinc-800">
                  <div className="flex items-center gap-1 text-xs">
                    <div className="w-2 h-2 rounded-full bg-purple-400" />
                    <span className="text-zinc-400">{brief.h2Count} H2s</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs">
                    <div className="w-2 h-2 rounded-full bg-blue-400" />
                    <span className="text-zinc-400">{brief.h3Count} H3s</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs">
                    <div className="w-2 h-2 rounded-full bg-amber-400" />
                    <span className="text-zinc-400">{brief.faqCount} FAQs</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs">
                    <Link2 className="h-3 w-3 text-emerald-400" />
                    <span className="text-zinc-400">{brief.internalLinks.length} links</span>
                  </div>
                </div>
              </div>
              
              {/* Expanded Content */}
              {brief.isExpanded && (
                <div className="px-4 pb-4 space-y-4">
                  {/* Secondary Keywords */}
                  {brief.secondaryKeywords.length > 0 && (
                    <div>
                      <h4 className="text-xs font-medium text-zinc-500 mb-2">Secondary Keywords</h4>
                      <div className="flex flex-wrap gap-1">
                        {brief.secondaryKeywords.map((kw, i) => (
                          <Badge key={i} variant="outline" className="text-[10px]">
                            {kw}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* LSI Keywords */}
                  {brief.lsiKeywords.length > 0 && (
                    <div>
                      <h4 className="text-xs font-medium text-zinc-500 mb-2">LSI Keywords</h4>
                      <div className="flex flex-wrap gap-1">
                        {brief.lsiKeywords.slice(0, 8).map((kw, i) => (
                          <Badge key={i} variant="outline" className="text-[10px] text-zinc-500">
                            {kw}
                          </Badge>
                        ))}
                        {brief.lsiKeywords.length > 8 && (
                          <span className="text-[10px] text-zinc-600">+{brief.lsiKeywords.length - 8} more</span>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* FAQ Keywords */}
                  {brief.faqKeywords.length > 0 && (
                    <div>
                      <h4 className="text-xs font-medium text-zinc-500 mb-2">FAQ Questions</h4>
                      <div className="space-y-1">
                        {brief.faqKeywords.map((kw, i) => (
                          <p key={i} className="text-xs text-zinc-400">• {kw}</p>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Internal Links */}
                  {brief.internalLinks.length > 0 && (
                    <div>
                      <h4 className="text-xs font-medium text-zinc-500 mb-2">Internal Links</h4>
                      <div className="flex flex-wrap gap-1">
                        {brief.internalLinks.map((link, i) => (
                          <Badge 
                            key={i} 
                            variant="outline" 
                            className={cn(
                              "text-[10px]",
                              link.type === "pillar" ? "text-purple-400" : "text-cyan-400"
                            )}
                          >
                            <Link2 className="h-2.5 w-2.5 mr-1" />
                            {link.keyword}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Action Button */}
                  <div className="pt-3 border-t border-zinc-800">
                    <Button 
                      onClick={(e) => { e.stopPropagation(); sendToAIWriter(brief) }}
                      className="w-full gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
                    >
                      <Sparkles className="h-4 w-4" />
                      Send to AI Writer
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>
      
      {/* Footer */}
      <div className="p-4 border-t border-zinc-800 bg-zinc-900/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-zinc-400">
            <Lightbulb className="h-4 w-4 text-amber-400" />
            <span>Click any brief to expand and send to AI Writer</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Builder
            </Button>
            <Button
              size="lg"
              className="gap-2 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600"
            >
              <Download className="h-5 w-5" />
              Export All to CSV
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
