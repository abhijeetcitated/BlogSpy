// ============================================
// CLUSTER BUILDER PANEL - Analysis & Structure
// ============================================
// Analyzes keywords and generates Pillar/Sub-keyword/Cluster structure

"use client"

import { useState, useMemo, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Settings2,
  Play,
  Building2,
  FileStack,
  ChevronRight,
  ChevronDown,
  Sparkles,
  Check,
  X,
  Edit3,
  Trash2,
  Plus,
  Link2,
  AlertCircle,
  ArrowLeft,
  Save,
  RefreshCw,
  Loader2,
  HelpCircle,
  Lightbulb
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { PoolKeyword } from "./keyword-pool-table"

// ============================================
// TYPES
// ============================================

interface PillarScoring {
  volumeWeight: number
  wordCountWeight: number
  intentWeight: number
  broadnessWeight: number
  childCountWeight: number
}

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
  orphanKeywords: PoolKeyword[]
  qualityScore: number
  coveragePercent: number
}

// ============================================
// DEFAULT WEIGHTS
// ============================================

const DEFAULT_WEIGHTS: PillarScoring = {
  volumeWeight: 0.25,
  wordCountWeight: 0.20,
  intentWeight: 0.15,
  broadnessWeight: 0.25,
  childCountWeight: 0.15
}

// ============================================
// ANALYSIS ENGINE
// ============================================

function extractRootTopic(keyword: string): string {
  const modifiers = [
    "best", "top", "how to", "what is", "guide to", "ultimate",
    "complete", "beginner", "advanced", "free", "cheap", "review",
    "vs", "versus", "comparison", "alternative", "2024", "2025"
  ]
  
  let root = keyword.toLowerCase()
  for (const mod of modifiers) {
    root = root.replace(new RegExp(`\\b${mod}\\b`, "gi"), "").trim()
  }
  return root.replace(/\s+/g, " ").trim()
}

function calculateSimilarity(kw1: string, kw2: string): number {
  const root1 = extractRootTopic(kw1).toLowerCase()
  const root2 = extractRootTopic(kw2).toLowerCase()
  
  const words1 = new Set(root1.split(/\s+/))
  const words2 = new Set(root2.split(/\s+/))
  
  const intersection = [...words1].filter(w => words2.has(w))
  const union = new Set([...words1, ...words2])
  
  return intersection.length / union.size
}

function isPotentialChild(parent: string, child: string): boolean {
  const parentRoot = extractRootTopic(parent).toLowerCase()
  const childLower = child.toLowerCase()
  
  if (!childLower.includes(parentRoot) && parentRoot.length > 3) {
    const parentWords = parentRoot.split(/\s+/)
    const matchingWords = parentWords.filter(w => childLower.includes(w))
    if (matchingWords.length < parentWords.length * 0.5) {
      return false
    }
  }
  
  return child.split(/\s+/).length > parent.split(/\s+/).length
}

function calculatePillarScore(
  kw: PoolKeyword,
  allKeywords: PoolKeyword[],
  weights: PillarScoring
): number {
  let score = 0
  
  // Volume score
  const maxVolume = Math.max(...allKeywords.map(k => k.volume))
  const volumeScore = (kw.volume / maxVolume) * 100
  score += volumeScore * weights.volumeWeight
  
  // Word count score (shorter = better)
  const wordCount = kw.wordCount
  let wordCountScore = 0
  if (wordCount <= 2) wordCountScore = 100
  else if (wordCount === 3) wordCountScore = 80
  else if (wordCount === 4) wordCountScore = 50
  else wordCountScore = 20
  score += wordCountScore * weights.wordCountWeight
  
  // Intent score
  let intentScore = 0
  if (kw.intent === "informational") intentScore = 100
  else if (kw.intent === "commercial") intentScore = 70
  else intentScore = 40
  score += intentScore * weights.intentWeight
  
  // Broadness score (fewer modifiers = broader)
  const modifiers = ["best", "top", "how", "what", "free", "vs", "2024", "2025"]
  const hasModifier = modifiers.some(m => kw.keyword.toLowerCase().includes(m))
  const broadnessScore = hasModifier ? 40 : 100
  score += broadnessScore * weights.broadnessWeight
  
  // Child count score
  const potentialChildren = allKeywords.filter(k => 
    k.id !== kw.id && isPotentialChild(kw.keyword, k.keyword)
  )
  const childCountScore = Math.min(100, potentialChildren.length * 15)
  score += childCountScore * weights.childCountWeight
  
  return Math.round(score)
}

function determinePlacement(kw: PoolKeyword, pillarKeyword: string): { placement: "h2" | "h3" | "body" | "faq"; reason: string } {
  const lower = kw.keyword.toLowerCase()
  
  // FAQ - questions
  if (/^(what|how|why|when|where|who|is|can|does|will|should)\b/i.test(lower)) {
    return { placement: "faq", reason: "Question format → FAQ section" }
  }
  
  // H2 - high volume subtopics
  if (kw.volume > 3000 && kw.wordCount <= 5) {
    return { placement: "h2", reason: `High volume (${kw.volume.toLocaleString()}) → Main section` }
  }
  
  // H2 - structural patterns
  if (/\b(types of|benefits of|features of|how to|ways to)\b/i.test(lower)) {
    return { placement: "h2", reason: "Structural pattern → Main section" }
  }
  
  // H3 - medium volume specific
  if (kw.volume >= 500 && kw.wordCount >= 4 && kw.wordCount <= 6) {
    return { placement: "h3", reason: "Medium volume, specific → Subsection" }
  }
  
  // Body - long tail
  return { placement: "body", reason: "Long-tail variation → Body content" }
}

function analyzeKeywords(
  keywords: PoolKeyword[],
  weights: PillarScoring,
  pillarThreshold: number = 55
): ClusterResult {
  // Calculate pillar scores
  const scored = keywords.map(kw => ({
    ...kw,
    pillarScore: calculatePillarScore(kw, keywords, weights)
  })).sort((a, b) => b.pillarScore - a.pillarScore)
  
  // Select pillars
  const pillars: GeneratedPillar[] = []
  const usedIds = new Set<string>()
  
  for (const kw of scored) {
    if (pillars.length >= 5) break
    if (kw.pillarScore < pillarThreshold) break
    
    // Check if root topic already covered
    const rootTopic = extractRootTopic(kw.keyword)
    const alreadyCovered = pillars.some(p => {
      const pRoot = extractRootTopic(p.keyword)
      return calculateSimilarity(rootTopic, pRoot) > 0.7
    })
    
    if (!alreadyCovered) {
      pillars.push({
        id: kw.id,
        keyword: kw.keyword,
        volume: kw.volume,
        kd: kw.kd,
        pillarScore: kw.pillarScore,
        subKeywords: { h2: [], h3: [], body: [], faq: [] },
        clusterArticles: [],
        isExpanded: true,
        isConfirmed: false
      })
      usedIds.add(kw.id)
    }
  }
  
  // Assign sub-keywords to pillars
  for (const kw of scored) {
    if (usedIds.has(kw.id)) continue
    
    // Find best matching pillar
    let bestPillar: GeneratedPillar | null = null
    let bestScore = 0
    
    for (const pillar of pillars) {
      if (isPotentialChild(pillar.keyword, kw.keyword)) {
        const similarity = calculateSimilarity(pillar.keyword, kw.keyword)
        if (similarity > bestScore) {
          bestScore = similarity
          bestPillar = pillar
        }
      }
    }
    
    if (bestPillar && bestScore > 0.2) {
      const { placement, reason } = determinePlacement(kw, bestPillar.keyword)
      
      bestPillar.subKeywords[placement].push({
        id: kw.id,
        keyword: kw.keyword,
        volume: kw.volume,
        kd: kw.kd,
        placement,
        reason
      })
      usedIds.add(kw.id)
    }
  }
  
  // Remaining keywords become cluster articles or orphans
  const orphans: PoolKeyword[] = []
  
  for (const kw of scored) {
    if (usedIds.has(kw.id)) continue
    
    // Find related pillar
    let bestPillar: GeneratedPillar | null = null
    let bestScore = 0
    
    for (const pillar of pillars) {
      const similarity = calculateSimilarity(pillar.keyword, kw.keyword)
      if (similarity > bestScore && similarity > 0.15) {
        bestScore = similarity
        bestPillar = pillar
      }
    }
    
    if (bestPillar && kw.volume > 1000) {
      // Cluster article
      let type = "supporting-article"
      if (/vs|versus|comparison/.test(kw.keyword.toLowerCase())) type = "comparison"
      else if (/best|top \d+/.test(kw.keyword.toLowerCase())) type = "list-post"
      else if (/how to|tutorial|guide/.test(kw.keyword.toLowerCase())) type = "tutorial"
      else if (/price|pricing|cost/.test(kw.keyword.toLowerCase())) type = "pricing-guide"
      
      bestPillar.clusterArticles.push({
        id: kw.id,
        keyword: kw.keyword,
        volume: kw.volume,
        kd: kw.kd,
        intent: kw.intent,
        type,
        reason: `Related to "${bestPillar.keyword}" (${Math.round(bestScore * 100)}% match)`
      })
      usedIds.add(kw.id)
    } else {
      orphans.push(kw)
    }
  }
  
  // Calculate quality metrics
  const coveragePercent = Math.round((usedIds.size / keywords.length) * 100)
  
  let qualityScore = 0
  if (pillars.length > 0) qualityScore += 20
  if (pillars.length >= 2 && pillars.length <= 4) qualityScore += 20
  const pillarsWithContent = pillars.filter(p => 
    p.subKeywords.h2.length + p.subKeywords.h3.length + p.clusterArticles.length > 0
  )
  qualityScore += Math.round((pillarsWithContent.length / Math.max(1, pillars.length)) * 30)
  qualityScore += Math.round(coveragePercent * 0.3)
  
  return {
    pillars,
    orphanKeywords: orphans,
    qualityScore: Math.min(100, qualityScore),
    coveragePercent
  }
}

// ============================================
// MAIN COMPONENT
// ============================================

interface ClusterBuilderPanelProps {
  keywords: PoolKeyword[]
  onBack: () => void
  onExportBriefs: (result: ClusterResult) => void
}

export function ClusterBuilderPanel({ keywords, onBack, onExportBriefs }: ClusterBuilderPanelProps) {
  // State
  const [weights, setWeights] = useState<PillarScoring>(DEFAULT_WEIGHTS)
  const [pillarThreshold, setPillarThreshold] = useState(55)
  const [showConfig, setShowConfig] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<ClusterResult | null>(null)
  
  // Run analysis
  const runAnalysis = useCallback(async () => {
    setIsAnalyzing(true)
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    const analysisResult = analyzeKeywords(keywords, weights, pillarThreshold)
    setResult(analysisResult)
    setIsAnalyzing(false)
  }, [keywords, weights, pillarThreshold])
  
  // Auto-run on mount
  useEffect(() => {
    runAnalysis()
  }, []) // Only on mount
  
  // Toggle pillar expansion
  const togglePillar = useCallback((pillarId: string) => {
    setResult(prev => {
      if (!prev) return prev
      return {
        ...prev,
        pillars: prev.pillars.map(p => 
          p.id === pillarId ? { ...p, isExpanded: !p.isExpanded } : p
        )
      }
    })
  }, [])
  
  // Confirm pillar
  const confirmPillar = useCallback((pillarId: string) => {
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
  
  // Handle export
  const handleExport = useCallback(() => {
    if (result) {
      onExportBriefs(result)
    }
  }, [result, onExportBriefs])
  
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-zinc-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Pool
            </Button>
            <div>
              <h2 className="text-lg font-semibold">Cluster Builder</h2>
              <p className="text-sm text-zinc-400">
                Analyzing {keywords.length} keywords → Pillar/Sub-keyword/Cluster structure
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowConfig(!showConfig)}
              className={showConfig ? "border-orange-500 text-orange-400" : ""}
            >
              <Settings2 className="h-4 w-4 mr-1" />
              Configure
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={runAnalysis}
              disabled={isAnalyzing}
            >
              <RefreshCw className={cn("h-4 w-4 mr-1", isAnalyzing && "animate-spin")} />
              Re-analyze
            </Button>
          </div>
        </div>
        
        {/* Configuration Panel */}
        {showConfig && (
          <Card className="mt-4 p-4 border-zinc-700 bg-zinc-900/50">
            <h3 className="font-medium mb-4 flex items-center gap-2">
              <Settings2 className="h-4 w-4 text-orange-400" />
              Pillar Scoring Weights
            </h3>
            <div className="grid grid-cols-5 gap-4">
              <div>
                <label className="text-xs text-zinc-500 mb-2 block">Volume ({Math.round(weights.volumeWeight * 100)}%)</label>
                <Slider
                  value={[weights.volumeWeight * 100]}
                  onValueChange={([v]) => setWeights(prev => ({ ...prev, volumeWeight: v / 100 }))}
                  max={50}
                  step={5}
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-500 mb-2 block">Word Count ({Math.round(weights.wordCountWeight * 100)}%)</label>
                <Slider
                  value={[weights.wordCountWeight * 100]}
                  onValueChange={([v]) => setWeights(prev => ({ ...prev, wordCountWeight: v / 100 }))}
                  max={50}
                  step={5}
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-500 mb-2 block">Intent ({Math.round(weights.intentWeight * 100)}%)</label>
                <Slider
                  value={[weights.intentWeight * 100]}
                  onValueChange={([v]) => setWeights(prev => ({ ...prev, intentWeight: v / 100 }))}
                  max={50}
                  step={5}
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-500 mb-2 block">Broadness ({Math.round(weights.broadnessWeight * 100)}%)</label>
                <Slider
                  value={[weights.broadnessWeight * 100]}
                  onValueChange={([v]) => setWeights(prev => ({ ...prev, broadnessWeight: v / 100 }))}
                  max={50}
                  step={5}
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-500 mb-2 block">Child Count ({Math.round(weights.childCountWeight * 100)}%)</label>
                <Slider
                  value={[weights.childCountWeight * 100]}
                  onValueChange={([v]) => setWeights(prev => ({ ...prev, childCountWeight: v / 100 }))}
                  max={50}
                  step={5}
                  className="w-full"
                />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-xs text-zinc-500">Pillar Threshold:</label>
                <Input
                  type="number"
                  value={pillarThreshold}
                  onChange={(e) => setPillarThreshold(parseInt(e.target.value) || 55)}
                  className="w-20 h-8 bg-zinc-800 border-zinc-700 text-sm"
                />
              </div>
              <Button size="sm" onClick={runAnalysis}>
                <Play className="h-4 w-4 mr-1" />
                Apply & Re-analyze
              </Button>
            </div>
          </Card>
        )}
      </div>
      
      {/* Analysis Stats */}
      {result && !isAnalyzing && (
        <div className="p-4 border-b border-zinc-800 bg-linear-to-r from-orange-500/10 to-amber-500/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{keywords.length}</div>
                <div className="text-xs text-zinc-500">Keywords</div>
              </div>
              <ChevronRight className="h-5 w-5 text-zinc-600" />
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">{result.pillars.length}</div>
                <div className="text-xs text-zinc-500">Pillars</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">
                  {result.pillars.reduce((sum, p) => sum + p.subKeywords.h2.length + p.subKeywords.h3.length + p.subKeywords.body.length + p.subKeywords.faq.length, 0)}
                </div>
                <div className="text-xs text-zinc-500">Sub-Keywords</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-cyan-400">
                  {result.pillars.reduce((sum, p) => sum + p.clusterArticles.length, 0)}
                </div>
                <div className="text-xs text-zinc-500">Clusters</div>
              </div>
              {result.orphanKeywords.length > 0 && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-amber-400">{result.orphanKeywords.length}</div>
                  <div className="text-xs text-zinc-500">Unclassified</div>
                </div>
              )}
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center px-4 py-2 bg-zinc-800/50 rounded-lg">
                <div className="text-xl font-bold text-emerald-400">{result.qualityScore}</div>
                <div className="text-xs text-zinc-500">Quality</div>
              </div>
              <div className="text-center px-4 py-2 bg-zinc-800/50 rounded-lg">
                <div className="text-xl font-bold text-cyan-400">{result.coveragePercent}%</div>
                <div className="text-xs text-zinc-500">Coverage</div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        {isAnalyzing ? (
          <div className="flex flex-col items-center justify-center h-full">
            <Loader2 className="h-12 w-12 text-orange-400 animate-spin mb-4" />
            <p className="text-lg font-medium mb-2">Analyzing Keywords...</p>
            <p className="text-sm text-zinc-500">Calculating pillar scores and building structure</p>
          </div>
        ) : result ? (
          <div className="space-y-4 max-w-5xl mx-auto">
            {/* Pillars */}
            {result.pillars.map((pillar, index) => (
              <Card key={pillar.id} className={cn(
                "border transition-all",
                pillar.isConfirmed 
                  ? "border-emerald-500/50 bg-emerald-500/5" 
                  : "border-purple-500/30 bg-purple-500/5"
              )}>
                {/* Pillar Header */}
                <div 
                  className="p-4 cursor-pointer"
                  onClick={() => togglePillar(pillar.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-purple-500/20">
                        <Building2 className="h-5 w-5 text-purple-400" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/40 text-[10px]">
                            PILLAR #{index + 1}
                          </Badge>
                          <Badge variant="outline" className="text-[10px]">
                            Score: {pillar.pillarScore}
                          </Badge>
                        </div>
                        <h3 className="text-lg font-semibold">{pillar.keyword}</h3>
                        <div className="flex items-center gap-4 mt-1 text-sm text-zinc-400">
                          <span>📊 {pillar.volume.toLocaleString()} vol</span>
                          <span className={cn(
                            pillar.kd <= 30 ? "text-emerald-400" : pillar.kd <= 60 ? "text-amber-400" : "text-red-400"
                          )}>🎯 {pillar.kd} KD</span>
                          <span>📝 {pillar.subKeywords.h2.length + pillar.subKeywords.h3.length + pillar.subKeywords.body.length + pillar.subKeywords.faq.length} sub-keywords</span>
                          <span>🔗 {pillar.clusterArticles.length} clusters</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant={pillar.isConfirmed ? "outline" : "default"}
                        size="sm"
                        onClick={(e) => { e.stopPropagation(); confirmPillar(pillar.id) }}
                        className={pillar.isConfirmed ? "border-emerald-500 text-emerald-400" : "bg-emerald-500 hover:bg-emerald-600"}
                      >
                        <Check className="h-4 w-4 mr-1" />
                        {pillar.isConfirmed ? "Confirmed" : "Confirm"}
                      </Button>
                      {pillar.isExpanded ? (
                        <ChevronDown className="h-5 w-5 text-zinc-400" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-zinc-400" />
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Pillar Content */}
                {pillar.isExpanded && (
                  <div className="px-4 pb-4 pt-0 space-y-4">
                    {/* Sub-keywords by placement */}
                    <div className="grid grid-cols-4 gap-3">
                      {/* H2 */}
                      <div className="p-3 bg-zinc-800/30 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-2 h-2 rounded-full bg-purple-400" />
                          <span className="text-xs font-medium text-purple-400">H2 Sections ({pillar.subKeywords.h2.length})</span>
                        </div>
                        <div className="space-y-1">
                          {pillar.subKeywords.h2.length === 0 ? (
                            <p className="text-xs text-zinc-600">No H2 keywords</p>
                          ) : (
                            pillar.subKeywords.h2.map(sk => (
                              <div key={sk.id} className="text-xs">
                                <p className="text-zinc-300 truncate">{sk.keyword}</p>
                                <p className="text-zinc-500">{sk.volume.toLocaleString()} vol</p>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                      
                      {/* H3 */}
                      <div className="p-3 bg-zinc-800/30 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-2 h-2 rounded-full bg-blue-400" />
                          <span className="text-xs font-medium text-blue-400">H3 Subsections ({pillar.subKeywords.h3.length})</span>
                        </div>
                        <div className="space-y-1">
                          {pillar.subKeywords.h3.length === 0 ? (
                            <p className="text-xs text-zinc-600">No H3 keywords</p>
                          ) : (
                            pillar.subKeywords.h3.map(sk => (
                              <div key={sk.id} className="text-xs">
                                <p className="text-zinc-300 truncate">{sk.keyword}</p>
                                <p className="text-zinc-500">{sk.volume.toLocaleString()} vol</p>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                      
                      {/* Body */}
                      <div className="p-3 bg-zinc-800/30 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-2 h-2 rounded-full bg-slate-400" />
                          <span className="text-xs font-medium text-slate-400">Body/LSI ({pillar.subKeywords.body.length})</span>
                        </div>
                        <div className="space-y-1">
                          {pillar.subKeywords.body.length === 0 ? (
                            <p className="text-xs text-zinc-600">No body keywords</p>
                          ) : (
                            pillar.subKeywords.body.slice(0, 3).map(sk => (
                              <div key={sk.id} className="text-xs">
                                <p className="text-zinc-300 truncate">{sk.keyword}</p>
                              </div>
                            ))
                          )}
                          {pillar.subKeywords.body.length > 3 && (
                            <p className="text-xs text-zinc-500">+{pillar.subKeywords.body.length - 3} more</p>
                          )}
                        </div>
                      </div>
                      
                      {/* FAQ */}
                      <div className="p-3 bg-zinc-800/30 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-2 h-2 rounded-full bg-amber-400" />
                          <span className="text-xs font-medium text-amber-400">FAQ ({pillar.subKeywords.faq.length})</span>
                        </div>
                        <div className="space-y-1">
                          {pillar.subKeywords.faq.length === 0 ? (
                            <p className="text-xs text-zinc-600">No FAQ keywords</p>
                          ) : (
                            pillar.subKeywords.faq.map(sk => (
                              <div key={sk.id} className="text-xs">
                                <p className="text-zinc-300 truncate">{sk.keyword}</p>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Cluster Articles */}
                    {pillar.clusterArticles.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-cyan-400 mb-2 flex items-center gap-2">
                          <FileStack className="h-4 w-4" />
                          Cluster Articles ({pillar.clusterArticles.length})
                        </h4>
                        <div className="grid grid-cols-2 gap-2">
                          {pillar.clusterArticles.map(cluster => (
                            <div key={cluster.id} className="flex items-center gap-2 p-2 bg-zinc-800/30 rounded text-sm">
                              <Badge variant="outline" className="text-[9px] shrink-0">
                                {cluster.type}
                              </Badge>
                              <span className="truncate">{cluster.keyword}</span>
                              <span className="text-zinc-500 text-xs ml-auto shrink-0">
                                {cluster.volume.toLocaleString()}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            ))}
            
            {/* Orphan Keywords */}
            {result.orphanKeywords.length > 0 && (
              <Card className="p-4 border-zinc-700">
                <h3 className="font-medium mb-3 flex items-center gap-2 text-amber-400">
                  <AlertCircle className="h-4 w-4" />
                  Unclassified Keywords ({result.orphanKeywords.length})
                </h3>
                <p className="text-xs text-zinc-500 mb-3">
                  These keywords couldn't be matched to any pillar. Consider adding them manually or using different thresholds.
                </p>
                <div className="flex flex-wrap gap-1">
                  {result.orphanKeywords.map(kw => (
                    <Badge key={kw.id} variant="outline" className="text-xs text-zinc-400">
                      {kw.keyword} ({kw.volume.toLocaleString()})
                    </Badge>
                  ))}
                </div>
              </Card>
            )}
          </div>
        ) : null}
      </div>
      
      {/* Footer */}
      {result && !isAnalyzing && (
        <div className="p-4 border-t border-zinc-800 bg-zinc-900/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-zinc-400">
              <Lightbulb className="h-4 w-4 text-amber-400" />
              <span>
                {result.pillars.filter(p => p.isConfirmed).length} of {result.pillars.length} pillars confirmed
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={onBack}>
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Edit
              </Button>
              <Button
                size="lg"
                onClick={handleExport}
                className="gap-2 bg-linear-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600"
              >
                <Sparkles className="h-5 w-5" />
                Generate Content Briefs
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
