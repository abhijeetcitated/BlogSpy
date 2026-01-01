// ============================================
// CLUSTER BUILDER - Main Component
// ============================================
// Step-by-step wizard to create topic clusters:
// 1. Collect Keywords (from sources + manual)
// 2. Analyze & Generate Structure
// 3. Review & Edit Pillars/Clusters
// 4. Save & Export

"use client"

import { useState, useCallback, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import {
  Database,
  Sparkles,
  FileSearch,
  Check,
  ChevronRight,
  ChevronLeft,
  Plus,
  Trash2,
  ArrowRight,
  Loader2,
  Building2,
  FileStack,
  Link2,
  AlertCircle,
  Upload,
  Wand2,
  BarChart3,
  TrendingUp,
  Target,
  Scissors,
  Compass,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Edit3,
  Eye
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { 
  SourceKeyword, 
  KeywordSourceType,
  ClusterBuildResult,
  GeneratedPillar,
  GeneratedCluster,
  BuilderStep,
  BulkKeywordInput
} from "../types/cluster-builder.types"
import { analyzeKeywords, type AnalysisOptions } from "../utils/cluster-analysis-engine"

// ============================================
// DEMO KEYWORDS FOR TESTING
// ============================================
const DEMO_KEYWORDS: SourceKeyword[] = [
  // Main pillar candidates
  { id: "demo_1", keyword: "AI Writing Tools", volume: 45000, kd: 52, intent: "informational", source: "keyword-magic", addedAt: new Date() },
  { id: "demo_2", keyword: "AI Content Strategy", volume: 28000, kd: 45, intent: "informational", source: "keyword-magic", addedAt: new Date() },
  
  // H2 level sub-keywords
  { id: "demo_3", keyword: "best ai writing software", volume: 8500, kd: 38, intent: "commercial", source: "competitor-gap", addedAt: new Date() },
  { id: "demo_4", keyword: "ai content generator tools", volume: 12000, kd: 42, intent: "commercial", source: "competitor-gap", addedAt: new Date() },
  { id: "demo_5", keyword: "ai content planning", volume: 5200, kd: 35, intent: "informational", source: "keyword-magic", addedAt: new Date() },
  
  // H3 level sub-keywords
  { id: "demo_6", keyword: "automated content creation software", volume: 3100, kd: 28, intent: "commercial", source: "manual", addedAt: new Date() },
  { id: "demo_7", keyword: "ai blog writer tools", volume: 2900, kd: 32, intent: "commercial", source: "manual", addedAt: new Date() },
  { id: "demo_8", keyword: "ai editorial calendar tool", volume: 2100, kd: 25, intent: "commercial", source: "trend-spotter", addedAt: new Date() },
  
  // FAQ / Question keywords
  { id: "demo_9", keyword: "what is ai writing", volume: 4500, kd: 22, intent: "informational", source: "snippet-stealer", addedAt: new Date() },
  { id: "demo_10", keyword: "how to use chatgpt for content writing", volume: 8200, kd: 35, intent: "informational", source: "snippet-stealer", addedAt: new Date() },
  { id: "demo_11", keyword: "is ai writing worth it", volume: 1500, kd: 18, intent: "informational", source: "manual", addedAt: new Date() },
  
  // Cluster article candidates
  { id: "demo_12", keyword: "ChatGPT vs Jasper AI", volume: 18500, kd: 35, intent: "commercial", source: "competitor-gap", addedAt: new Date() },
  { id: "demo_13", keyword: "AI Writing for E-commerce", volume: 8200, kd: 28, intent: "commercial", source: "keyword-magic", addedAt: new Date() },
  { id: "demo_14", keyword: "Best AI Blog Writers 2025", volume: 12500, kd: 42, intent: "commercial", source: "trend-spotter", addedAt: new Date() },
  { id: "demo_15", keyword: "AI Writing for SEO Content", volume: 9800, kd: 38, intent: "informational", source: "keyword-magic", addedAt: new Date() },
  { id: "demo_16", keyword: "AI Content Writing Pricing", volume: 4200, kd: 25, intent: "transactional", source: "competitor-gap", addedAt: new Date() },
  { id: "demo_17", keyword: "AI Writing for Beginners Guide", volume: 6500, kd: 22, intent: "informational", source: "content-decay", addedAt: new Date() },
  
  // More long-tail variations
  { id: "demo_18", keyword: "content automation workflow tools", volume: 3800, kd: 30, intent: "commercial", source: "manual", addedAt: new Date() },
  { id: "demo_19", keyword: "scaling content with ai tools", volume: 1900, kd: 28, intent: "informational", source: "manual", addedAt: new Date() },
  { id: "demo_20", keyword: "ai content repurposing strategy", volume: 2400, kd: 32, intent: "informational", source: "trend-spotter", addedAt: new Date() },
]

// ============================================
// STEP INDICATOR
// ============================================

const STEPS: { key: BuilderStep; label: string; icon: React.ReactNode }[] = [
  { key: "collect", label: "Collect Keywords", icon: <Database className="h-4 w-4" /> },
  { key: "analyze", label: "Analyze", icon: <Sparkles className="h-4 w-4" /> },
  { key: "review", label: "Review Structure", icon: <FileSearch className="h-4 w-4" /> },
  { key: "finalize", label: "Finalize", icon: <Check className="h-4 w-4" /> }
]

function StepIndicator({ currentStep, onStepClick }: { 
  currentStep: BuilderStep
  onStepClick: (step: BuilderStep) => void 
}) {
  const currentIndex = STEPS.findIndex(s => s.key === currentStep)
  
  return (
    <div className="flex items-center justify-center gap-2 p-4 border-b border-zinc-800">
      {STEPS.map((step, index) => {
        const isActive = step.key === currentStep
        const isCompleted = index < currentIndex
        const isClickable = index <= currentIndex
        
        return (
          <div key={step.key} className="flex items-center">
            <button
              onClick={() => isClickable && onStepClick(step.key)}
              disabled={!isClickable}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg transition-all",
                isActive && "bg-orange-500 text-white",
                isCompleted && "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30",
                !isActive && !isCompleted && "bg-zinc-800 text-zinc-500",
                isClickable && !isActive && "cursor-pointer"
              )}
            >
              {isCompleted ? <CheckCircle2 className="h-4 w-4" /> : step.icon}
              <span className="text-sm font-medium">{step.label}</span>
            </button>
            {index < STEPS.length - 1 && (
              <ChevronRight className="h-4 w-4 text-zinc-600 mx-1" />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ============================================
// KEYWORD SOURCE BUTTONS
// ============================================

const KEYWORD_SOURCES: { type: KeywordSourceType; label: string; icon: React.ReactNode; color: string }[] = [
  { type: "keyword-explorer", label: "Keyword Explorer", icon: <Wand2 className="h-4 w-4" />, color: "purple" },
  { type: "competitor-gap", label: "Competitor Gap", icon: <BarChart3 className="h-4 w-4" />, color: "cyan" },
  { type: "content-decay", label: "Content Decay", icon: <TrendingUp className="h-4 w-4" />, color: "red" },
  { type: "rank-tracker", label: "Rank Tracker", icon: <Target className="h-4 w-4" />, color: "green" },
  { type: "snippet-stealer", label: "Snippet Stealer", icon: <Scissors className="h-4 w-4" />, color: "amber" },
  { type: "trend-spotter", label: "Trend Spotter", icon: <Compass className="h-4 w-4" />, color: "blue" },
]

function SourceButton({ 
  source, 
  count, 
  onClick 
}: { 
  source: typeof KEYWORD_SOURCES[0]
  count: number
  onClick: () => void 
}) {
  const colorClasses: Record<string, string> = {
    purple: "border-purple-500/30 hover:border-purple-500/50 bg-purple-500/5",
    cyan: "border-cyan-500/30 hover:border-cyan-500/50 bg-cyan-500/5",
    red: "border-red-500/30 hover:border-red-500/50 bg-red-500/5",
    green: "border-emerald-500/30 hover:border-emerald-500/50 bg-emerald-500/5",
    amber: "border-amber-500/30 hover:border-amber-500/50 bg-amber-500/5",
    blue: "border-blue-500/30 hover:border-blue-500/50 bg-blue-500/5",
  }
  
  return (
    <button
      onClick={onClick}
      className={cn(
        "p-4 rounded-xl border transition-all flex flex-col items-center gap-2 min-w-[140px]",
        colorClasses[source.color] || colorClasses.purple
      )}
    >
      <div className="p-2 rounded-lg bg-zinc-800/50">
        {source.icon}
      </div>
      <span className="text-sm font-medium">{source.label}</span>
      {count > 0 && (
        <Badge className="bg-zinc-700">{count} keywords</Badge>
      )}
    </button>
  )
}

// ============================================
// MANUAL INPUT PANEL
// ============================================

function ManualInputPanel({ onAdd }: { onAdd: (keywords: SourceKeyword[]) => void }) {
  const [input, setInput] = useState("")
  const [format, setFormat] = useState<BulkKeywordInput["format"]>("simple")
  
  const handleParse = () => {
    if (!input.trim()) return
    
    const lines = input.trim().split("\n").filter(l => l.trim())
    const keywords: SourceKeyword[] = []
    
    for (const line of lines) {
      let keyword = ""
      let volume = 1000  // Default volume
      let kd = 50        // Default KD
      
      if (format === "simple") {
        keyword = line.trim()
      } else if (format === "csv") {
        const parts = line.split(",").map(p => p.trim())
        keyword = parts[0] || ""
        volume = parseInt(parts[1]) || 1000
        kd = parseInt(parts[2]) || 50
      } else if (format === "tabbed") {
        const parts = line.split("\t").map(p => p.trim())
        keyword = parts[0] || ""
        volume = parseInt(parts[1]) || 1000
        kd = parseInt(parts[2]) || 50
      }
      
      if (keyword) {
        keywords.push({
          id: `manual_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          keyword,
          volume,
          kd,
          intent: "informational", // Will be detected by engine
          source: "manual",
          addedAt: new Date()
        })
      }
    }
    
    if (keywords.length > 0) {
      onAdd(keywords)
      setInput("")
    }
  }
  
  return (
    <Card className="p-4 border-zinc-700 bg-zinc-900/50">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium flex items-center gap-2">
          <Upload className="h-4 w-4 text-orange-400" />
          Manual / Bulk Input
        </h3>
        <div className="flex gap-1">
          {(["simple", "csv", "tabbed"] as const).map(f => (
            <button
              key={f}
              onClick={() => setFormat(f)}
              className={cn(
                "px-2 py-1 text-xs rounded",
                format === f ? "bg-orange-500 text-white" : "bg-zinc-800 text-zinc-400"
              )}
            >
              {f === "simple" ? "Simple" : f === "csv" ? "CSV" : "Tabbed"}
            </button>
          ))}
        </div>
      </div>
      
      <Textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={
          format === "simple" 
            ? "Enter one keyword per line:\n\nai writing tools\nbest ai content generator\nhow to use chatgpt for seo"
            : format === "csv"
            ? "keyword,volume,kd\n\nai writing tools,15000,45\nbest ai content,8000,38"
            : "keyword\\tvolume\\tkd\n\nai writing tools\\t15000\\t45"
        }
        className="min-h-[150px] bg-zinc-800/50 border-zinc-700 text-sm font-mono"
      />
      
      <div className="mt-3 flex items-center justify-between">
        <span className="text-xs text-zinc-500">
          {format === "simple" && "One keyword per line (volume defaults to 1000)"}
          {format === "csv" && "Format: keyword,volume,kd"}
          {format === "tabbed" && "Tab-separated: keyword→volume→kd"}
        </span>
        <Button size="sm" onClick={handleParse} disabled={!input.trim()}>
          <Plus className="h-4 w-4 mr-1" />
          Add Keywords
        </Button>
      </div>
    </Card>
  )
}

// ============================================
// KEYWORD LIST
// ============================================

function KeywordList({ 
  keywords, 
  onRemove, 
  onClear 
}: { 
  keywords: SourceKeyword[]
  onRemove: (id: string) => void
  onClear: () => void
}) {
  const sourceColors: Record<KeywordSourceType, string> = {
    "keyword-magic": "text-purple-400",
    "competitor-gap": "text-cyan-400",
    "content-decay": "text-red-400",
    "rank-tracker": "text-emerald-400",
    "snippet-stealer": "text-amber-400",
    "trend-spotter": "text-blue-400",
    "ai-overview": "text-pink-400",
    "manual": "text-orange-400",
    "imported": "text-slate-400"
  }
  
  // Group by source
  const grouped = useMemo(() => {
    const groups: Record<KeywordSourceType, SourceKeyword[]> = {} as any
    for (const kw of keywords) {
      if (!groups[kw.source]) groups[kw.source] = []
      groups[kw.source].push(kw)
    }
    return groups
  }, [keywords])
  
  if (keywords.length === 0) {
    return (
      <div className="text-center py-12 text-zinc-500">
        <Database className="h-12 w-12 mx-auto mb-4 opacity-30" />
        <p>No keywords collected yet</p>
        <p className="text-sm mt-1">Click a source above or add keywords manually</p>
      </div>
    )
  }
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-zinc-400">
          {keywords.length} keywords from {Object.keys(grouped).length} sources
        </span>
        <Button variant="ghost" size="sm" onClick={onClear} className="text-red-400 hover:text-red-300">
          <Trash2 className="h-4 w-4 mr-1" />
          Clear All
        </Button>
      </div>
      
      <div className="max-h-[400px] overflow-y-auto space-y-3">
        {Object.entries(grouped).map(([source, kws]) => (
          <div key={source} className="space-y-1">
            <div className={cn("text-xs font-medium flex items-center gap-1", sourceColors[source as KeywordSourceType])}>
              {source.replace("-", " ").replace(/\b\w/g, c => c.toUpperCase())}
              <Badge variant="outline" className="text-[10px] ml-1">{kws.length}</Badge>
            </div>
            <div className="flex flex-wrap gap-1">
              {kws.map(kw => (
                <div
                  key={kw.id}
                  className="group flex items-center gap-1 px-2 py-1 bg-zinc-800 rounded text-xs hover:bg-zinc-700"
                >
                  <span>{kw.keyword}</span>
                  <span className="text-zinc-500">({kw.volume.toLocaleString()})</span>
                  <button
                    onClick={() => onRemove(kw.id)}
                    className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300"
                  >
                    <XCircle className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ============================================
// ANALYSIS PROGRESS
// ============================================

function AnalysisProgress({ progress, message }: { progress: number; message: string }) {
  return (
    <div className="text-center py-12">
      <div className="relative w-24 h-24 mx-auto mb-6">
        <svg className="w-24 h-24 transform -rotate-90">
          <circle cx="48" cy="48" r="40" stroke="#27272a" strokeWidth="8" fill="none" />
          <circle 
            cx="48" cy="48" r="40" 
            stroke="#f97316" strokeWidth="8" fill="none"
            strokeDasharray={251.2}
            strokeDashoffset={251.2 - (progress / 100) * 251.2}
            strokeLinecap="round"
            className="transition-all duration-300"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <Sparkles className="h-8 w-8 text-orange-400 animate-pulse" />
        </div>
      </div>
      
      <h3 className="text-lg font-medium mb-2">Analyzing Keywords...</h3>
      <p className="text-sm text-zinc-400 mb-4">{message}</p>
      
      <div className="w-64 mx-auto bg-zinc-800 rounded-full h-2 overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      <span className="text-xs text-zinc-500 mt-2 block">{progress}%</span>
    </div>
  )
}

// ============================================
// REVIEW PANEL - Pillars & Clusters
// ============================================

function PillarReviewCard({ 
  pillar, 
  clusters,
  onEdit,
  onConfirm
}: { 
  pillar: GeneratedPillar
  clusters: GeneratedCluster[]
  onEdit: () => void
  onConfirm: () => void
}) {
  const [expanded, setExpanded] = useState(false)
  const totalSubKeywords = 
    pillar.subKeywords.h2.length + 
    pillar.subKeywords.h3.length + 
    pillar.subKeywords.body.length + 
    pillar.subKeywords.faq.length
  
  return (
    <Card className={cn(
      "border transition-all",
      pillar.isConfirmed 
        ? "border-emerald-500/50 bg-emerald-500/5" 
        : "border-purple-500/30 bg-purple-500/5"
    )}>
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/20">
              <Building2 className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/40 text-[10px]">
                  PILLAR
                </Badge>
                <span className="text-xs text-zinc-500">Score: {pillar.pillarScore}</span>
              </div>
              <h3 className="font-semibold mt-1">{pillar.keyword}</h3>
              <div className="flex items-center gap-3 mt-1 text-xs text-zinc-400">
                <span>📊 {pillar.volume.toLocaleString()} vol</span>
                <span>🎯 {pillar.kd}% KD</span>
                <span>📝 {totalSubKeywords} sub-keywords</span>
                <span>🔗 {clusters.length} clusters</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onEdit}>
              <Edit3 className="h-4 w-4" />
            </Button>
            <Button 
              variant={pillar.isConfirmed ? "outline" : "default"}
              size="sm" 
              onClick={onConfirm}
              className={pillar.isConfirmed ? "border-emerald-500 text-emerald-400" : ""}
            >
              {pillar.isConfirmed ? <CheckCircle2 className="h-4 w-4" /> : <Check className="h-4 w-4" />}
            </Button>
          </div>
        </div>
        
        {/* Sub-keywords preview */}
        <button 
          onClick={() => setExpanded(!expanded)}
          className="mt-3 w-full text-left"
        >
          <div className="flex items-center gap-2 text-xs text-zinc-500 hover:text-zinc-300">
            <Eye className="h-3 w-3" />
            {expanded ? "Hide" : "Show"} sub-keywords & clusters
            <ChevronRight className={cn("h-3 w-3 transition-transform", expanded && "rotate-90")} />
          </div>
        </button>
        
        {expanded && (
          <div className="mt-4 space-y-4 pt-4 border-t border-zinc-800">
            {/* Sub-keywords by placement */}
            <div className="space-y-2">
              <h4 className="text-xs font-medium text-zinc-400">Sub-Keywords by Placement:</h4>
              {pillar.subKeywords.h2.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {pillar.subKeywords.h2.map(sk => (
                    <Badge key={sk.id} variant="outline" className="text-[10px] border-purple-500/30 text-purple-300">
                      [H2] {sk.keyword}
                    </Badge>
                  ))}
                </div>
              )}
              {pillar.subKeywords.h3.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {pillar.subKeywords.h3.map(sk => (
                    <Badge key={sk.id} variant="outline" className="text-[10px] border-blue-500/30 text-blue-300">
                      [H3] {sk.keyword}
                    </Badge>
                  ))}
                </div>
              )}
              {pillar.subKeywords.body.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {pillar.subKeywords.body.slice(0, 5).map(sk => (
                    <Badge key={sk.id} variant="outline" className="text-[10px] border-slate-500/30 text-slate-300">
                      [BODY] {sk.keyword}
                    </Badge>
                  ))}
                  {pillar.subKeywords.body.length > 5 && (
                    <span className="text-[10px] text-zinc-500">+{pillar.subKeywords.body.length - 5} more</span>
                  )}
                </div>
              )}
              {pillar.subKeywords.faq.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {pillar.subKeywords.faq.map(sk => (
                    <Badge key={sk.id} variant="outline" className="text-[10px] border-amber-500/30 text-amber-300">
                      [FAQ] {sk.keyword}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            
            {/* Linked clusters */}
            {clusters.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-medium text-zinc-400">Linked Cluster Articles:</h4>
                <div className="grid grid-cols-2 gap-2">
                  {clusters.map(cluster => (
                    <div key={cluster.id} className="flex items-center gap-2 p-2 bg-zinc-800/50 rounded text-xs">
                      <FileStack className="h-3 w-3 text-cyan-400" />
                      <span className="truncate">{cluster.keyword}</span>
                      <span className="text-zinc-500 ml-auto">{cluster.relationshipStrength}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  )
}

// ============================================
// MAIN CLUSTER BUILDER COMPONENT
// ============================================

export function ClusterBuilder() {
  // State
  const [step, setStep] = useState<BuilderStep>("collect")
  const [keywords, setKeywords] = useState<SourceKeyword[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [analysisMessage, setAnalysisMessage] = useState("")
  const [result, setResult] = useState<ClusterBuildResult | null>(null)
  const [clusterName, setClusterName] = useState("")
  
  // Source counts (from localStorage transfers)
  const [sourceCounts, setSourceCounts] = useState<Record<KeywordSourceType, number>>({} as any)
  
  // Load transferred keywords from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("blogspy_keyword_transfer")
    if (stored) {
      try {
        const data = JSON.parse(stored)
        if (data.keywords && Array.isArray(data.keywords)) {
          const sourceKws: SourceKeyword[] = data.keywords.map((kw: any, idx: number) => ({
            id: `transfer_${Date.now()}_${idx}`,
            keyword: kw.keyword,
            volume: kw.volume || 1000,
            kd: kw.kd || 50,
            intent: kw.intent || "informational",
            source: data.source || "imported",
            addedAt: new Date()
          }))
          setKeywords(prev => [...prev, ...sourceKws])
          // Clear after loading
          localStorage.removeItem("blogspy_keyword_transfer")
        }
      } catch (e) {
        console.error("Failed to parse keyword transfer:", e)
      }
    }
  }, [])
  
  // Handlers
  const handleAddKeywords = useCallback((newKeywords: SourceKeyword[]) => {
    setKeywords(prev => {
      // Remove duplicates
      const existing = new Set(prev.map(k => k.keyword.toLowerCase()))
      const unique = newKeywords.filter(k => !existing.has(k.keyword.toLowerCase()))
      return [...prev, ...unique]
    })
  }, [])
  
  const handleRemoveKeyword = useCallback((id: string) => {
    setKeywords(prev => prev.filter(k => k.id !== id))
  }, [])
  
  const handleClearAll = useCallback(() => {
    setKeywords([])
  }, [])
  
  const handleSourceClick = useCallback((source: KeywordSourceType) => {
    // TODO: Open modal to select keywords from that source
    // For now, show alert
    alert(`Will open ${source} keyword selector. Coming soon!`)
  }, [])
  
  const handleAnalyze = useCallback(async () => {
    if (keywords.length < 5) {
      alert("Please add at least 5 keywords to analyze")
      return
    }
    
    setStep("analyze")
    setIsAnalyzing(true)
    setAnalysisProgress(0)
    
    // Simulate analysis progress
    const steps = [
      { progress: 10, message: "Extracting root topics..." },
      { progress: 25, message: "Detecting search intent..." },
      { progress: 40, message: "Calculating pillar scores..." },
      { progress: 55, message: "Grouping semantic clusters..." },
      { progress: 70, message: "Assigning sub-keywords..." },
      { progress: 85, message: "Generating internal links..." },
      { progress: 95, message: "Finalizing structure..." },
      { progress: 100, message: "Complete!" }
    ]
    
    for (const s of steps) {
      await new Promise(resolve => setTimeout(resolve, 500))
      setAnalysisProgress(s.progress)
      setAnalysisMessage(s.message)
    }
    
    // Run actual analysis
    const analysisResult = analyzeKeywords(keywords, {
      pillarThreshold: 55,
      maxPillars: 5,
      minSubKeywords: 3
    })
    
    // Set cluster name from first pillar
    if (analysisResult.pillars.length > 0) {
      setClusterName(analysisResult.pillars[0].keyword)
    }
    
    setResult(analysisResult)
    setIsAnalyzing(false)
    setStep("review")
  }, [keywords])
  
  const handleConfirmPillar = useCallback((pillarId: string) => {
    setResult(prev => {
      if (!prev) return prev
      return {
        ...prev,
        pillars: prev.pillars.map(p => 
          p.id === pillarId ? { ...p, isConfirmed: !p.isConfirmed } : p
        )
      }
    })
  }, [])
  
  const handleFinalize = useCallback(() => {
    if (!result) return
    
    // Save to localStorage or send to backend
    const savedCluster = {
      ...result,
      name: clusterName || result.name,
      updatedAt: new Date()
    }
    
    // Store in localStorage for now
    const existing = JSON.parse(localStorage.getItem("blogspy_saved_clusters") || "[]")
    existing.push(savedCluster)
    localStorage.setItem("blogspy_saved_clusters", JSON.stringify(existing))
    
    setStep("finalize")
  }, [result, clusterName])

  // Render based on step
  return (
    <div className="h-full flex flex-col bg-zinc-950">
      {/* Step Indicator */}
      <StepIndicator currentStep={step} onStepClick={setStep} />
      
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* STEP 1: Collect Keywords */}
        {step === "collect" && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold mb-2">Build Your Topic Cluster</h1>
              <p className="text-zinc-400">
                Collect keywords from various sources to create an optimized content structure
              </p>
              {/* DEMO BUTTON */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAddKeywords(DEMO_KEYWORDS)}
                className="mt-4 border-orange-500/50 text-orange-400 hover:bg-orange-500/10"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Load Demo Keywords (20 keywords)
              </Button>
            </div>
            
            {/* Source Buttons */}
            <div>
              <h2 className="text-sm font-medium text-zinc-400 mb-3">Import from Features:</h2>
              <div className="flex flex-wrap gap-3">
                {KEYWORD_SOURCES.map(source => (
                  <SourceButton
                    key={source.type}
                    source={source}
                    count={keywords.filter(k => k.source === source.type).length}
                    onClick={() => handleSourceClick(source.type)}
                  />
                ))}
              </div>
            </div>
            
            {/* Manual Input */}
            <ManualInputPanel onAdd={handleAddKeywords} />
            
            {/* Keyword List */}
            <Card className="p-4 border-zinc-700">
              <h2 className="font-medium mb-4 flex items-center gap-2">
                <Database className="h-4 w-4 text-orange-400" />
                Collected Keywords
              </h2>
              <KeywordList 
                keywords={keywords}
                onRemove={handleRemoveKeyword}
                onClear={handleClearAll}
              />
            </Card>
            
            {/* Next Button */}
            <div className="flex justify-end">
              <Button
                size="lg"
                onClick={handleAnalyze}
                disabled={keywords.length < 5}
                className="gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
              >
                <Sparkles className="h-5 w-5" />
                Analyze & Build Cluster
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
            
            {keywords.length > 0 && keywords.length < 5 && (
              <p className="text-center text-sm text-amber-400">
                Add at least {5 - keywords.length} more keywords to analyze
              </p>
            )}
          </div>
        )}
        
        {/* STEP 2: Analysis in Progress */}
        {step === "analyze" && isAnalyzing && (
          <div className="max-w-xl mx-auto">
            <AnalysisProgress progress={analysisProgress} message={analysisMessage} />
          </div>
        )}
        
        {/* STEP 3: Review Structure */}
        {step === "review" && result && (
          <div className="max-w-5xl mx-auto space-y-6">
            {/* Summary Stats */}
            <Card className="p-4 border-zinc-700 bg-gradient-to-r from-orange-500/10 to-amber-500/10">
              <div className="flex items-center justify-between">
                <div>
                  <Input
                    value={clusterName}
                    onChange={(e) => setClusterName(e.target.value)}
                    className="text-xl font-bold bg-transparent border-0 px-0 focus-visible:ring-0"
                    placeholder="Cluster Name..."
                  />
                  <div className="flex items-center gap-4 mt-2 text-sm text-zinc-400">
                    <span>📊 {result.totalKeywordsInput} keywords analyzed</span>
                    <span>🏛️ {result.pillars.length} pillars</span>
                    <span>📄 {result.clusters.length} clusters</span>
                    <span>🔗 {result.linkingMatrix.length} internal links</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-emerald-400">{result.qualityScore}</div>
                    <div className="text-[10px] text-zinc-500">Quality</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-cyan-400">{result.coverageScore}%</div>
                    <div className="text-[10px] text-zinc-500">Coverage</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-400">{result.balanceScore}</div>
                    <div className="text-[10px] text-zinc-500">Balance</div>
                  </div>
                </div>
              </div>
            </Card>
            
            {/* Pillars */}
            <div>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Building2 className="h-5 w-5 text-purple-400" />
                Pillar Articles
                <Badge className="bg-purple-500/20 text-purple-400">{result.pillars.length}</Badge>
              </h2>
              <div className="space-y-4">
                {result.pillars.map(pillar => (
                  <PillarReviewCard
                    key={pillar.id}
                    pillar={pillar}
                    clusters={result.clusters.filter(c => c.pillarId === pillar.id)}
                    onEdit={() => {/* TODO */}}
                    onConfirm={() => handleConfirmPillar(pillar.id)}
                  />
                ))}
              </div>
            </div>
            
            {/* Orphan Keywords */}
            {result.orphanKeywords.length > 0 && (
              <Card className="p-4 border-zinc-700">
                <h2 className="font-medium mb-3 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-400" />
                  Unclassified Keywords ({result.orphanKeywords.length})
                </h2>
                <div className="flex flex-wrap gap-1">
                  {result.orphanKeywords.map(kw => (
                    <Badge key={kw.id} variant="outline" className="text-xs">
                      {kw.keyword}
                    </Badge>
                  ))}
                </div>
              </Card>
            )}
            
            {/* Actions */}
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep("collect")}>
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back to Keywords
              </Button>
              <Button
                size="lg"
                onClick={handleFinalize}
                className="gap-2 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600"
              >
                <Check className="h-5 w-5" />
                Save Cluster
              </Button>
            </div>
          </div>
        )}
        
        {/* STEP 4: Finalized */}
        {step === "finalize" && (
          <div className="max-w-xl mx-auto text-center py-12">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <CheckCircle2 className="h-10 w-10 text-emerald-400" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Cluster Saved!</h2>
            <p className="text-zinc-400 mb-6">
              Your topic cluster "{clusterName}" has been created with{" "}
              {result?.pillars.length} pillars and {result?.clusters.length} clusters.
            </p>
            <div className="flex justify-center gap-4">
              <Button variant="outline" onClick={() => {
                setStep("collect")
                setKeywords([])
                setResult(null)
                setClusterName("")
              }}>
                <Plus className="h-4 w-4 mr-1" />
                Create Another
              </Button>
              <Button className="bg-orange-500 hover:bg-orange-600">
                <ArrowRight className="h-4 w-4 mr-1" />
                Go to Articles View
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
