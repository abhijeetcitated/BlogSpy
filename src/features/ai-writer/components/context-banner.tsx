// ============================================
// AI WRITER - Context Banner Component
// ============================================
// Shows context info when user comes from another feature
// 
// PILLAR vs CLUSTER:
// - PILLAR: Main article with sub-keywords to use as H2, H3, body, FAQ
// - CLUSTER: Supporting article, no sub-keywords, links back to pillar

"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { 
  X, 
  Sparkles, 
  Target, 
  TrendingUp, 
  FileText, 
  Link2,
  BarChart3,
  Zap,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Building2,
  FileStack,
  Hash,
  AlertCircle,
  ExternalLink,
  Crosshair,
  FileEdit,
  ListTree,
  Network,
  Loader2,
  Sparkle
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"
import type { WriterContext, SubKeyword } from "../types"
import { getSourceDisplayName, getIntentInfo, getContentTypeInfo } from "../utils/context-parser"

function getSourceBadgeClasses(source: WriterContext["source"]) {
  const base = "text-xs rounded-full px-2 py-0.5"
  const styles: Record<WriterContext["source"], string> = {
    "topic-clusters": "bg-purple-500/10 border-purple-500/30 text-purple-400",
    "trend-spotter": "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
    "keyword-magic": "bg-sky-500/10 border-sky-500/30 text-sky-400",
    "competitor-gap": "bg-amber-500/10 border-amber-500/30 text-amber-400",
    "content-decay": "bg-orange-500/10 border-orange-500/30 text-orange-400",
    "content-roadmap": "bg-violet-500/10 border-violet-500/30 text-violet-400",
    "snippet-stealer": "bg-cyan-500/10 border-cyan-500/30 text-cyan-400",
    "command-center": "bg-indigo-500/10 border-indigo-500/30 text-indigo-400",
    "direct": "bg-card border-border",
  }
  return cn(base, styles[source] ?? "bg-card border-border")
}

// Get badge color based on placement type
function getPlacementBadge(placement: SubKeyword["placement"]) {
  const config = {
    h2: { label: "H2", color: "bg-purple-500/20 border-purple-500/40 text-purple-400" },
    h3: { label: "H3", color: "bg-blue-500/20 border-blue-500/40 text-blue-400" },
    body: { label: "Body", color: "bg-muted/50 border-muted-foreground/40 text-muted-foreground" },
    faq: { label: "FAQ", color: "bg-amber-500/20 border-amber-500/40 text-amber-400" }
  }
  return config[placement] || config.body
}

interface ContextBannerProps {
  context: WriterContext
  onDismiss: () => void
  onApplyRecommendations: () => void
  onInsertLink?: (anchorText: string, url: string) => void
  isGenerating?: boolean
  generationProgress?: number
}

export function ContextBanner({ context, onDismiss, onApplyRecommendations, onInsertLink, isGenerating = false, generationProgress = 0 }: ContextBannerProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  
  const intentInfo = getIntentInfo(context.intent)
  const typeInfo = getContentTypeInfo(context.contentType)
  
  // Count active SERP features
  const activeSerpFeatures = Object.values(context.serpFeatures).filter(Boolean).length
  
  return (
    <Card className="mx-3 mt-3 sm:mx-4 sm:mt-4 bg-card/30 border border-border overflow-hidden">
      {/* Header - Always visible */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-3 sm:px-4 py-3 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/20">
            <Sparkles className="h-4 w-4 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-foreground">Smart Context Loaded</span>
              <Badge
                variant="outline"
                className={getSourceBadgeClasses(context.source)}
              >
                From {getSourceDisplayName(context.source)}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Keyword: <span className="text-emerald-400 font-medium">{context.keyword}</span>
              {context.volume && <span className="ml-2">• {context.volume.toLocaleString()} searches/mo</span>}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 flex-wrap justify-end">
          {isGenerating ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-emerald-500/10 rounded-full px-3 py-1.5">
                <Loader2 className="h-4 w-4 text-emerald-400 animate-spin" />
                <span className="text-xs font-medium text-emerald-400">AI Writing... {generationProgress}%</span>
              </div>
              <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-linear-to-r from-emerald-500 to-cyan-500 rounded-full transition-all duration-300"
                  style={{ width: `${generationProgress}%` }}
                />
              </div>
            </div>
          ) : (
            <Button
              size="sm"
              onClick={onApplyRecommendations}
              className="gap-1.5 bg-linear-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white h-8 px-3 shadow-md shadow-emerald-500/20"
            >
              <Sparkle className="h-3.5 w-3.5" />
              <span className="sm:hidden">Generate</span>
              <span className="hidden sm:inline">Generate Full Article</span>
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-8 w-8 p-0"
            disabled={isGenerating}
          >
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDismiss}
            className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
            disabled={isGenerating}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Expanded Content */}
      {isExpanded && (
        <div className="p-3 sm:p-4 grid grid-cols-1 sm:grid-cols-2 lg:col-span-4 gap-3 sm:gap-4">
          
          {/* Topic Clusters: Clean minimal top bar with key metrics ONLY */}
          {context.source === "topic-clusters" && (
            <div className="col-span-1 sm:col-span-2 lg:col-span-4 flex flex-wrap items-center gap-2">
              <Badge variant="outline" className={cn("text-[11px] flex items-center gap-1", typeInfo.color)}>
                {context.contentType === "pillar" ? (
                  <><Building2 className="h-3 w-3" /> Pillar Article</>
                ) : (
                  <><FileStack className="h-3 w-3" /> Sub-Page / Cluster Article</>
                )}
              </Badge>
              {context.volume !== undefined && (
                <Badge variant="outline" className="text-[11px] text-emerald-400 flex items-center gap-1">
                  <BarChart3 className="h-3 w-3" /> {context.volume.toLocaleString()}/mo
                </Badge>
              )}
              {context.difficulty !== undefined && (
                <Badge
                  variant="outline"
                  className={cn(
                    "text-[11px]",
                    context.difficulty < 30
                      ? "text-emerald-400"
                      : context.difficulty < 60
                        ? "text-amber-400"
                        : "text-red-400"
                  )}
                >
                  KD: {context.difficulty}%
                </Badge>
              )}
              {context.pillarData && (
                <>
                  <Badge variant="outline" className="text-[11px] flex items-center gap-1">
                    <FileEdit className="h-3 w-3" /> {context.pillarData.recommendedLength.toLocaleString()}+ words
                  </Badge>
                  <Badge variant="outline" className="text-[11px] flex items-center gap-1">
                    <ListTree className="h-3 w-3" /> {context.pillarData.recommendedHeadings} headings
                  </Badge>
                  {context.pillarData.clusterCount > 0 && (
                    <Badge variant="outline" className="text-[11px] flex items-center gap-1">
                      <Network className="h-3 w-3" /> {context.pillarData.clusterCount} clusters
                    </Badge>
                  )}
                </>
              )}
              {context.clusterData && (
                <>
                  <Badge variant="outline" className="text-[11px]">
                    📝 {context.clusterData.recommendedLength.toLocaleString()} words
                  </Badge>
                  <Badge variant="outline" className="text-[11px]">
                    📑 {context.clusterData.recommendedHeadings} headings
                  </Badge>
                </>
              )}
            </div>
          )}
          
          {/* Other Sources: Full context summary block */}
          {context.source !== "topic-clusters" && (
          <div className="col-span-1 sm:col-span-2 lg:col-span-4 rounded-lg border border-border bg-card/50 p-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-0.5">
                <p className="text-sm font-medium text-foreground">What this context means</p>
                <p className="text-xs text-muted-foreground">
                  These are recommendations pulled from {getSourceDisplayName(context.source)} for this keyword.
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Zap className="h-3.5 w-3.5 text-emerald-400" />
                <span>Use “Apply Recommendations” to auto-fill outline & targets</span>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-1.5">
              <Badge variant="outline" className={cn("text-[11px]", intentInfo.color)}>
                <Target className="mr-1 h-3 w-3" />
                Intent: {intentInfo.label}
              </Badge>

              <Badge variant="outline" className={cn("text-[11px]", typeInfo.color)}>
                <FileText className="mr-1 h-3 w-3" />
                Type: {typeInfo.label}
              </Badge>

              {context.difficulty !== undefined && (
                <Badge
                  variant="outline"
                  className={cn(
                    "text-[11px]",
                    context.difficulty < 30
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                      : context.difficulty < 60
                        ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                        : "bg-red-500/10 border-red-500/30 text-red-400"
                  )}
                >
                  <BarChart3 className="mr-1 h-3 w-3" />
                  KD: {context.difficulty} • {context.difficulty < 30 ? "Easy" : context.difficulty < 60 ? "Medium" : "Hard"}
                </Badge>
              )}

              <div className="flex flex-wrap gap-1.5">
                <span className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <TrendingUp className="h-3 w-3" />
                  Opportunities:
                </span>
                {context.serpFeatures.featuredSnippet && (
                  <Badge variant="outline" className="text-[10px] bg-amber-500/10 border-amber-500/30 text-amber-400">
                    Featured Snippet
                  </Badge>
                )}
                {context.serpFeatures.peopleAlsoAsk && (
                  <Badge variant="outline" className="text-[10px] bg-blue-500/10 border-blue-500/30 text-blue-400">
                    PAA
                  </Badge>
                )}
                {context.serpFeatures.videoCarousel && (
                  <Badge variant="outline" className="text-[10px] bg-red-500/10 border-red-500/30 text-red-400">
                    Video
                  </Badge>
                )}
                {activeSerpFeatures === 0 && (
                  <span className="text-[11px] text-muted-foreground">No data</span>
                )}
              </div>
            </div>

            <p className="mt-2 text-[11px] text-muted-foreground">
              {context.pillarData
                ? "Next: Use the H2/H3/body/FAQ keyword chips below to structure your pillar article." 
                : context.clusterData
                  ? "Next: Write a focused supporting article and add the suggested link to the pillar." 
                  : "Next: Apply recommendations to align your content with what’s ranking."}
            </p>
          </div>          )}          
          {/* Revival Mode Alert */}
          {context.revivalMode && (
            <div className="col-span-1 sm:col-span-2 lg:col-span-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
              <div className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4 text-amber-400" />
                <span className="text-sm font-medium text-amber-400">Content Revival Mode</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Reviving: {context.revivalMode.oldUrl} • 
                Traffic dropped from {context.revivalMode.originalTraffic.toLocaleString()} to {context.revivalMode.currentTraffic.toLocaleString()} • 
                Reason: {context.revivalMode.decayReason}
              </p>
            </div>
          )}
          
          {/* Trend Alert */}
          {context.trendData && context.trendData.velocity === "rising" && (
            <div className="col-span-1 sm:col-span-2 lg:col-span-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-400" />
                <span className="text-sm font-medium text-emerald-400">Trending Topic</span>
                <Badge className="text-xs bg-emerald-500/20 text-emerald-400">
                  Score: {context.trendData.score}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                This topic is rising in search interest. 
                {context.trendData.newsAngle && " Consider adding a news angle for timely content."}
              </p>
            </div>
          )}
          
          {/* Parent Pillar Link */}
          {context.contentType === "cluster" && context.parentPillar && (
            <div className="col-span-1 sm:col-span-2 lg:col-span-4 flex items-center gap-2 text-xs">
              <Link2 className="h-3.5 w-3.5 text-cyan-400" />
              <span className="text-muted-foreground">Link to Pillar:</span>
              <a href={context.parentPillar} className="text-cyan-400 hover:underline">
                {context.parentPillar}
              </a>
            </div>
          )}
          
          {/* Competitor Data Summary */}
          {context.competitorData && (
            <div className="col-span-1 sm:col-span-2 lg:col-span-4 p-3 rounded-lg bg-card/50 border border-border">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="h-4 w-4 text-cyan-400" />
                <span className="text-sm font-medium text-foreground">Competitor Benchmark</span>
              </div>
              <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
                <div>
                  <p className="text-lg font-bold text-foreground">
                    {context.competitorData.avgWordCount.toLocaleString()}
                  </p>
                  <p className="text-[10px] text-muted-foreground">Avg Words</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-foreground">
                    {context.competitorData.avgHeadings}
                  </p>
                  <p className="text-[10px] text-muted-foreground">Avg Headings</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-foreground">
                    {context.competitorData.avgImages}
                  </p>
                  <p className="text-[10px] text-muted-foreground">Avg Images</p>
                </div>
              </div>
            </div>
          )}
          
          {/* ============================================ */}
          {/* TOPIC CLUSTERS: UNIFIED CONTENT CARD */}
          {/* Clean design showing Pillar vs Sub-page clearly */}
          {/* ============================================ */}
          {context.source === "topic-clusters" && (context.pillarData || context.clusterData) && (
            <div className="col-span-1 sm:col-span-2 lg:col-span-4 rounded-lg border overflow-hidden"
              style={{
                background: context.contentType === "pillar" 
                  ? "linear-gradient(135deg, rgba(147,51,234,0.1) 0%, rgba(15,23,42,0.5) 50%, rgba(6,182,212,0.1) 100%)"
                  : "linear-gradient(135deg, rgba(6,182,212,0.1) 0%, rgba(15,23,42,0.5) 50%, rgba(16,185,129,0.1) 100%)",
                borderColor: context.contentType === "pillar" ? "rgba(147,51,234,0.3)" : "rgba(6,182,212,0.3)"
              }}
            >
              {/* Header Bar - Article Type + Main Topic + SEO Stats */}
              <div className="px-4 py-3 border-b border-border/50">
                {/* Row 1: Type Badge + Main Topic */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-2">
                  {/* Article Type Badge */}
                  <div className="flex items-center gap-2">
                    {context.contentType === "pillar" ? (
                      <>
                        <Building2 className="h-5 w-5 text-purple-400" />
                        <Badge className="text-xs bg-purple-500/20 text-purple-300 border-purple-500/40 px-2.5 py-1 flex items-center gap-1">
                          <Building2 className="h-3.5 w-3.5" /> Pillar Article
                        </Badge>
                      </>
                    ) : (
                      <>
                        <FileStack className="h-5 w-5 text-cyan-400" />
                        <Badge className="text-xs bg-cyan-500/20 text-cyan-300 border-cyan-500/40 px-2.5 py-1 flex items-center gap-1">
                          <FileStack className="h-3.5 w-3.5" /> Sub-Page / Cluster Article
                        </Badge>
                      </>
                    )}
                  </div>
                  
                  {/* Main Topic (Pillar Keyword) - Always visible */}
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">
                      {context.contentType === "pillar" ? "Topic:" : "Parent Pillar:"}
                    </span>
                    <span className="font-semibold text-foreground">
                      {context.contentType === "pillar" ? context.keyword : context.clusterData?.pillarKeyword}
                    </span>
                    {context.contentType === "cluster" && context.clusterData?.pillarUrl && (
                      <a 
                        href={context.clusterData.pillarUrl}
                        className="text-purple-400 hover:text-purple-300"
                        title="View Pillar Article"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>
                </div>
                
                {/* Row 2: SEO Metrics Bar */}
                <div className="flex flex-wrap items-center gap-3 text-xs">
                  {/* For Pillar: Show main focus keyword prominently */}
                  {context.contentType === "pillar" && (
                    <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-purple-500/15 border border-purple-500/40">
                      <Crosshair className="h-3.5 w-3.5 text-purple-400" />
                      <span className="text-purple-300 font-medium">Focus Keyword:</span>
                      <span className="text-purple-100 font-semibold">{context.keyword}</span>
                    </div>
                  )}
                  
                  {/* For Sub-page: Show current keyword */}
                  {context.contentType === "cluster" && (
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-cyan-500/10 border border-cyan-500/30">
                      <span className="text-muted-foreground">Keyword:</span>
                      <span className="text-cyan-300 font-medium">{context.keyword}</span>
                    </div>
                  )}
                  
                  {/* Volume */}
                  {context.volume && (
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-card/50 border border-border">
                      <span className="text-muted-foreground">Volume:</span>
                      <span className="text-emerald-400 font-medium">{context.volume.toLocaleString()}/mo</span>
                    </div>
                  )}
                  
                  {/* KD */}
                  {context.difficulty !== undefined && (
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-card/50 border border-border">
                      <span className="text-muted-foreground">KD:</span>
                      <span className={cn(
                        "font-medium",
                        context.difficulty < 30 ? "text-emerald-400" : 
                        context.difficulty < 60 ? "text-amber-400" : "text-red-400"
                      )}>
                        {context.difficulty}%
                      </span>
                    </div>
                  )}
                  
                  {/* Word Count Target */}
                  {context.contentType === "pillar" && context.pillarData && (
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-purple-500/10 border border-purple-500/30">
                      <span className="text-muted-foreground">Target:</span>
                      <span className="text-purple-300 font-medium">{context.pillarData.recommendedLength.toLocaleString()}+ words</span>
                    </div>
                  )}
                  {context.contentType === "cluster" && context.clusterData && (
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-cyan-500/10 border border-cyan-500/30">
                      <span className="text-muted-foreground">Target:</span>
                      <span className="text-cyan-300 font-medium">{context.clusterData.recommendedLength.toLocaleString()} words</span>
                    </div>
                  )}
                  
                  {/* Headings Target */}
                  {context.contentType === "pillar" && context.pillarData && (
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-purple-500/10 border border-purple-500/30">
                      <span className="text-muted-foreground">Headings:</span>
                      <span className="text-purple-300 font-medium">{context.pillarData.recommendedHeadings}</span>
                    </div>
                  )}
                  {context.contentType === "cluster" && context.clusterData && (
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-cyan-500/10 border border-cyan-500/30">
                      <span className="text-muted-foreground">Headings:</span>
                      <span className="text-cyan-300 font-medium">{context.clusterData.recommendedHeadings}</span>
                    </div>
                  )}
                  
                  {/* Cluster Count (Pillar only) */}
                  {context.contentType === "pillar" && context.pillarData && context.pillarData.clusterCount > 0 && (
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-purple-500/10 border border-purple-500/30">
                      <span className="text-muted-foreground">Clusters:</span>
                      <span className="text-purple-300 font-medium">{context.pillarData.clusterCount}</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Content Area */}
              <div className="p-4 space-y-4">
                {/* For Cluster/Sub-page: Show link instruction (SEO stats are in header now) */}
                {context.contentType === "cluster" && context.clusterData && (
                  <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/30">
                    <div className="flex items-center gap-2 mb-2">
                      <Link2 className="h-4 w-4 text-purple-400" />
                      <span className="text-sm font-medium text-purple-300">Required: Link to Pillar</span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">
                      Add an internal link to the parent pillar to strengthen the topic cluster:
                    </p>
                    <div className="flex items-center gap-2 p-2 rounded bg-card/50 border border-border">
                      <span className="text-xs text-muted-foreground">Anchor text:</span>
                      <span className="text-sm text-cyan-400 font-medium">"{context.clusterData.linkAnchor}"</span>
                      <span className="text-[10px] text-muted-foreground">→</span>
                      <span className="text-xs text-purple-400">{context.clusterData.pillarKeyword}</span>
                    </div>
                  </div>
                )}
                
                {/* For Cluster: Show supporting keywords with SEO placements */}
                {context.contentType === "cluster" && context.clusterData?.supportingKeywords && context.clusterData.supportingKeywords.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Hash className="h-4 w-4 text-cyan-400" />
                        <span className="text-sm font-medium text-foreground">
                          Supporting Keywords ({context.clusterData.supportingKeywords.length})
                        </span>
                      </div>
                      <span className="text-[10px] text-muted-foreground">
                        Best SEO placement
                      </span>
                    </div>
                    
                    {/* Keywords Grid - Grouped by SEO placement */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* H2 Keywords - Main sections */}
                      {context.clusterData.supportingKeywords.filter(k => k.placement === "h2").length > 0 && (
                        <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/30">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="text-[10px] bg-purple-500/20 text-purple-300 border-purple-500/40">
                              H2
                            </Badge>
                            <span className="text-[10px] text-purple-300">Main Sections</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {context.clusterData.supportingKeywords.filter(k => k.placement === "h2").map((kw, idx) => (
                              <Badge key={idx} variant="outline" className="text-[11px] bg-purple-500/10 border-purple-500/30 text-purple-200">
                                {kw.keyword}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* H3 Keywords - Sub-sections */}
                      {context.clusterData.supportingKeywords.filter(k => k.placement === "h3").length > 0 && (
                        <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="text-[10px] bg-blue-500/20 text-blue-300 border-blue-500/40">
                              H3
                            </Badge>
                            <span className="text-[10px] text-blue-300">Sub-Sections</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {context.clusterData.supportingKeywords.filter(k => k.placement === "h3").map((kw, idx) => (
                              <Badge key={idx} variant="outline" className="text-[11px] bg-blue-500/10 border-blue-500/30 text-blue-200">
                                {kw.keyword}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Body Keywords */}
                      {context.clusterData.supportingKeywords.filter(k => k.placement === "body").length > 0 && (
                        <div className="p-3 rounded-lg bg-card/50 border border-border">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="text-[10px] bg-muted text-muted-foreground border-border">
                              BODY
                            </Badge>
                            <span className="text-[10px] text-muted-foreground">Mention in Content</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {context.clusterData.supportingKeywords.filter(k => k.placement === "body").map((kw, idx) => (
                              <Badge key={idx} variant="outline" className="text-[11px] bg-muted/50 border-border text-muted-foreground">
                                {kw.keyword}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* FAQ Keywords */}
                      {context.clusterData.supportingKeywords.filter(k => k.placement === "faq").length > 0 && (
                        <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="text-[10px] bg-amber-500/20 text-amber-300 border-amber-500/40">
                              FAQ
                            </Badge>
                            <span className="text-[10px] text-amber-300">FAQ Section</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {context.clusterData.supportingKeywords.filter(k => k.placement === "faq").map((kw, idx) => (
                              <Badge key={idx} variant="outline" className="text-[11px] bg-amber-500/10 border-amber-500/30 text-amber-200">
                                {kw.keyword}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* For Pillar: Show supporting keywords organized by placement */}
                {context.contentType === "pillar" && context.pillarData && context.pillarData.subKeywords.length > 0 && (
                  <>
                    {/* Section Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Hash className="h-4 w-4 text-purple-400" />
                        <span className="text-sm font-medium text-foreground">
                          Supporting Keywords ({context.pillarData.subKeywords.length})
                        </span>
                      </div>
                      <span className="text-[10px] text-muted-foreground">
                        Volume • KD based placement
                      </span>
                    </div>
                    
                    {/* Keywords Grid - Grouped by SEO placement */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* H2 Keywords - High volume, primary sections */}
                      {context.pillarData.subKeywords.filter(k => k.placement === "h2").length > 0 && (
                        <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/30">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="text-[10px] bg-purple-500/20 text-purple-300 border-purple-500/40">
                              H2
                            </Badge>
                            <span className="text-[10px] text-purple-300">Main Sections</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {context.pillarData.subKeywords.filter(k => k.placement === "h2").map((kw, idx) => (
                              <Badge 
                                key={idx} 
                                variant="outline" 
                                className="text-[11px] gap-1.5 bg-purple-500/10 border-purple-500/30 text-purple-200"
                              >
                                {kw.keyword}
                                <span className="text-[9px] px-1 py-0.5 rounded bg-purple-500/20 text-purple-300">
                                  {kw.volume ? `${(kw.volume/1000).toFixed(1)}K` : "-"}
                                </span>
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* H3 Keywords - Sub-sections */}
                      {context.pillarData.subKeywords.filter(k => k.placement === "h3").length > 0 && (
                        <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="text-[10px] bg-blue-500/20 text-blue-300 border-blue-500/40">
                              H3
                            </Badge>
                            <span className="text-[10px] text-blue-300">Sub-Sections</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {context.pillarData.subKeywords.filter(k => k.placement === "h3").map((kw, idx) => (
                              <Badge 
                                key={idx} 
                                variant="outline" 
                                className="text-[11px] gap-1.5 bg-blue-500/10 border-blue-500/30 text-blue-200"
                              >
                                {kw.keyword}
                                <span className="text-[9px] px-1 py-0.5 rounded bg-blue-500/20 text-blue-300">
                                  {kw.volume ? `${(kw.volume/1000).toFixed(1)}K` : "-"}
                                </span>
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Body Keywords - Mentions in content */}
                      {context.pillarData.subKeywords.filter(k => k.placement === "body").length > 0 && (
                        <div className="p-3 rounded-lg bg-card/50 border border-border">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="text-[10px] bg-muted text-muted-foreground border-border">
                              BODY
                            </Badge>
                            <span className="text-[10px] text-muted-foreground">Mention in Content</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {context.pillarData.subKeywords.filter(k => k.placement === "body").map((kw, idx) => (
                              <Badge 
                                key={idx} 
                                variant="outline" 
                                className="text-[11px] gap-1.5 bg-muted/50 border-border text-muted-foreground"
                              >
                                {kw.keyword}
                                <span className="text-[9px] px-1 py-0.5 rounded bg-muted text-muted-foreground">
                                  {kw.volume ? `${(kw.volume/1000).toFixed(1)}K` : "-"}
                                </span>
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* FAQ Keywords - For FAQ section */}
                      {context.pillarData.subKeywords.filter(k => k.placement === "faq").length > 0 && (
                        <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="text-[10px] bg-amber-500/20 text-amber-300 border-amber-500/40">
                              FAQ
                            </Badge>
                            <span className="text-[10px] text-amber-300">Add to FAQ Section</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {context.pillarData.subKeywords.filter(k => k.placement === "faq").map((kw, idx) => (
                              <Badge 
                                key={idx} 
                                variant="outline" 
                                className="text-[11px] gap-1.5 bg-amber-500/10 border-amber-500/30 text-amber-200"
                              >
                                {kw.keyword}
                                <span className="text-[9px] px-1 py-0.5 rounded bg-amber-500/20 text-amber-300">
                                  {kw.volume ? `${(kw.volume/1000).toFixed(1)}K` : "-"}
                                </span>
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
          
          {/* ============================================ */}
          {/* NON-TOPIC-CLUSTERS: Original Pillar Section */}
          {/* For other sources like Keyword Magic, etc. */}
          {/* ============================================ */}
          {context.source !== "topic-clusters" && context.pillarData && (
            <div className="col-span-1 sm:col-span-2 lg:col-span-4 p-3 sm:p-4 rounded-lg bg-linear-to-br from-purple-500/10 via-card/50 to-cyan-500/10 border border-purple-500/30">
              {/* Header */}
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <Building2 className="h-5 w-5 text-purple-400" />
                  <span className="text-sm font-semibold text-purple-300">PILLAR ARTICLE</span>
                  <Badge className="text-[10px] bg-purple-500/20 text-purple-300 border-purple-500/40">
                    Main Content Hub
                  </Badge>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 text-xs text-muted-foreground flex-wrap">
                  <span className="flex items-center gap-1"><FileEdit className="h-3 w-3" /> {context.pillarData.recommendedLength.toLocaleString()}+ words</span>
                  <span className="flex items-center gap-1"><ListTree className="h-3 w-3" /> {context.pillarData.recommendedHeadings} headings</span>
                  {context.pillarData.clusterCount && (
                    <span className="flex items-center gap-1"><Network className="h-3 w-3" /> {context.pillarData.clusterCount} clusters linking</span>
                  )}
                </div>
              </div>
              
              {/* Sub-Keywords Section */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                  <Hash className="h-3.5 w-3.5" />
                  <span>Sub-Keywords to use in this article ({context.pillarData.subKeywords.length} keywords)</span>
                </div>
                
                {/* Group by placement */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* H2 Keywords */}
                  {context.pillarData.subKeywords.filter(k => k.placement === "h2").length > 0 && (
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase tracking-wider text-purple-400 font-medium">Use as H2 Headings</span>
                      <div className="flex flex-wrap gap-1.5">
                        {context.pillarData.subKeywords.filter(k => k.placement === "h2").map((kw, idx) => (
                          <Badge 
                            key={idx} 
                            variant="outline" 
                            className={cn("text-xs gap-1", getPlacementBadge("h2").color)}
                          >
                            {kw.keyword}
                            {kw.volume && (
                              <span className="text-[9px] opacity-70">({(kw.volume/1000).toFixed(1)}K)</span>
                            )}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* H3 Keywords */}
                  {context.pillarData.subKeywords.filter(k => k.placement === "h3").length > 0 && (
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase tracking-wider text-blue-400 font-medium">Use as H3 Headings</span>
                      <div className="flex flex-wrap gap-1.5">
                        {context.pillarData.subKeywords.filter(k => k.placement === "h3").map((kw, idx) => (
                          <Badge 
                            key={idx} 
                            variant="outline" 
                            className={cn("text-xs gap-1", getPlacementBadge("h3").color)}
                          >
                            {kw.keyword}
                            {kw.volume && (
                              <span className="text-[9px] opacity-70">({(kw.volume/1000).toFixed(1)}K)</span>
                            )}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Body Keywords */}
                  {context.pillarData.subKeywords.filter(k => k.placement === "body").length > 0 && (
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Mention in Body</span>
                      <div className="flex flex-wrap gap-1.5">
                        {context.pillarData.subKeywords.filter(k => k.placement === "body").map((kw, idx) => (
                          <Badge 
                            key={idx} 
                            variant="outline" 
                            className={cn("text-xs gap-1", getPlacementBadge("body").color)}
                          >
                            {kw.keyword}
                            {kw.volume && (
                              <span className="text-[9px] opacity-70">({(kw.volume/1000).toFixed(1)}K)</span>
                            )}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* FAQ Keywords */}
                  {context.pillarData.subKeywords.filter(k => k.placement === "faq").length > 0 && (
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase tracking-wider text-amber-400 font-medium">Use in FAQ Section</span>
                      <div className="flex flex-wrap gap-1.5">
                        {context.pillarData.subKeywords.filter(k => k.placement === "faq").map((kw, idx) => (
                          <Badge 
                            key={idx} 
                            variant="outline" 
                            className={cn("text-xs gap-1", getPlacementBadge("faq").color)}
                          >
                            {kw.keyword}
                            {kw.volume && (
                              <span className="text-[9px] opacity-70">({(kw.volume/1000).toFixed(1)}K)</span>
                            )}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* ============================================ */}
          {/* NON-TOPIC-CLUSTERS: Original Cluster Section */}
          {/* ============================================ */}
          {context.source !== "topic-clusters" && context.clusterData && (
            <div className="col-span-1 sm:col-span-2 lg:col-span-4 p-3 sm:p-4 rounded-lg bg-linear-to-br from-cyan-500/10 via-card/50 to-emerald-500/10 border border-cyan-500/30">
              {/* Header */}
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <FileStack className="h-5 w-5 text-cyan-400" />
                  <span className="text-sm font-semibold text-cyan-300">CLUSTER ARTICLE</span>
                  <Badge className="text-[10px] bg-cyan-500/20 text-cyan-300 border-cyan-500/40">
                    Supporting Content
                  </Badge>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 text-xs text-muted-foreground flex-wrap">
                  <span>📝 {context.clusterData.recommendedLength.toLocaleString()} words</span>
                  <span>📑 {context.clusterData.recommendedHeadings} headings</span>
                </div>
              </div>
              
              {/* No Sub-Keywords Alert */}
              <div className="flex items-center gap-2 p-2 rounded bg-card/50 border border-border mb-3">
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  Cluster articles are focused - no sub-keywords needed. Cover the topic deeply and link to pillar.
                </span>
              </div>
              
              {/* Parent Pillar Link */}
              <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <Link2 className="h-4 w-4 text-purple-400" />
                  <span className="text-xs font-medium text-purple-300">Link to Parent Pillar</span>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-3.5 w-3.5 text-purple-400" />
                    <span className="text-sm text-foreground font-medium">{context.clusterData.pillarKeyword}</span>
                    {context.clusterData.pillarUrl && (
                      <a 
                        href={context.clusterData.pillarUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-purple-400 hover:text-purple-300"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                  {context.clusterData.linkAnchor && (
                    <p className="text-xs text-muted-foreground">
                      Suggested anchor text: <span className="text-cyan-400">"{context.clusterData.linkAnchor}"</span>
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* ============================================ */}
          {/* INTERNAL LINKS SECTION */}
          {/* Shows required internal links from linking matrix */}
          {/* ============================================ */}
          {context.internalLinks && context.internalLinks.length > 0 && (
            <div className="col-span-1 sm:col-span-2 lg:col-span-4 p-3 sm:p-4 rounded-lg bg-linear-to-br from-orange-500/10 via-card/50 to-amber-500/10 border border-orange-500/30">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <Link2 className="h-5 w-5 text-orange-400" />
                  <span className="text-sm font-semibold text-orange-300">REQUIRED INTERNAL LINKS</span>
                  <Badge className="text-[10px] bg-orange-500/20 text-orange-300 border-orange-500/40">
                    {context.internalLinks.length} links
                  </Badge>
                </div>
                <Badge variant="outline" className="text-[10px] text-muted-foreground">
                  AI Recommended
                </Badge>
              </div>
              
              <div className="space-y-2">
                {context.internalLinks.map((link, idx) => (
                  <div 
                    key={idx}
                    className={cn(
                      "p-3 rounded-lg border",
                      link.isRequired 
                        ? "bg-orange-500/5 border-orange-500/30" 
                        : "bg-card/30 border-border/50"
                    )}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <FileStack className="h-4 w-4 text-cyan-400" />
                        <span className="text-sm font-medium text-foreground truncate">{link.toKeyword}</span>
                      </div>
                      {link.isRequired && (
                        <Badge className="text-[9px] bg-orange-500/20 text-orange-400 border-orange-500/40">
                          Required
                        </Badge>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div className="flex items-start gap-1.5">
                        <span className="text-muted-foreground shrink-0">Anchor:</span>
                        <span className="text-cyan-400">"{link.anchorText}"</span>
                      </div>
                      <div className="flex items-start gap-1.5">
                        <span className="text-muted-foreground shrink-0">Place:</span>
                        <span className="text-muted-foreground">{link.placementHint}</span>
                      </div>
                    </div>
                    {link.toUrl && (
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-1.5 text-xs">
                          <span className="text-muted-foreground">URL:</span>
                          <a href={link.toUrl} className="text-emerald-400 hover:underline flex items-center gap-1">
                            {link.toUrl}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                        {onInsertLink && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
                            onClick={() => onInsertLink(link.anchorText, link.toUrl || '#')}
                          >
                            <Link2 className="h-3 w-3 mr-1" />
                            Insert Link
                          </Button>
                        )}
                      </div>
                    )}
                    {!link.toUrl && onInsertLink && (
                      <div className="flex justify-end mt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20"
                          onClick={() => onInsertLink(link.anchorText, `/articles/${link.toKeyword.toLowerCase().replace(/\s+/g, '-')}`)}
                        >
                          <Link2 className="h-3 w-3 mr-1" />
                          Insert Placeholder
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              <p className="text-[10px] text-muted-foreground mt-3 text-center">
                💡 Add these internal links to maximize SEO impact and user experience
              </p>
            </div>
          )}
          
          {/* ============================================ */}
          {/* CLUSTER OVERVIEW SECTION */}
          {/* Shows when "Load Entire Cluster" is used */}
          {/* ============================================ */}
          {context.clusterOverview && (
            <div className="col-span-1 sm:col-span-2 lg:col-span-4 p-3 sm:p-4 rounded-lg bg-linear-to-br from-purple-500/10 via-card/50 to-cyan-500/10 border border-purple-500/30">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <Building2 className="h-5 w-5 text-purple-400" />
                  <span className="text-sm font-semibold text-foreground">CLUSTER OVERVIEW</span>
                  <Badge className="text-[10px] bg-purple-500/20 text-purple-300 border-purple-500/40">
                    {context.clusterOverview.clusterName}
                  </Badge>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Pillars */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-purple-400 font-medium">
                    <Building2 className="h-3.5 w-3.5" />
                    Pillars ({context.clusterOverview.pillars.length})
                  </div>
                  <div className="space-y-1">
                    {context.clusterOverview.pillars.map((pillar, idx) => (
                      <div key={idx} className="flex items-center justify-between gap-2 p-2 rounded bg-card/50">
                        <span className="text-xs text-foreground truncate min-w-0 flex-1">{pillar.keyword}</span>
                        <Badge 
                          variant="outline" 
                          className={cn(
                            "text-[9px]",
                            pillar.status === "published" ? "border-emerald-500/40 text-emerald-400" :
                            pillar.status === "draft" ? "border-amber-500/40 text-amber-400" :
                            "border-muted-foreground/40 text-muted-foreground"
                          )}
                        >
                          {pillar.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Clusters */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-cyan-400 font-medium">
                    <FileStack className="h-3.5 w-3.5" />
                    Clusters ({context.clusterOverview.clusters.length})
                  </div>
                  <div className="space-y-1 max-h-40 overflow-y-auto">
                    {context.clusterOverview.clusters.map((cluster, idx) => (
                      <div key={idx} className="flex items-center justify-between gap-2 p-2 rounded bg-card/50">
                        <span className="text-xs text-foreground truncate min-w-0 flex-1">{cluster.keyword}</span>
                        <Badge 
                          variant="outline" 
                          className={cn(
                            "text-[9px]",
                            cluster.status === "published" ? "border-emerald-500/40 text-emerald-400" :
                            cluster.status === "draft" ? "border-amber-500/40 text-amber-400" :
                            "border-muted-foreground/40 text-muted-foreground"
                          )}
                        >
                          {cluster.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  )
}
