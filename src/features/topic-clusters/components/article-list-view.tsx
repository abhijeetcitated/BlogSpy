// ============================================
// ARTICLE LIST VIEW - Clean List of All Articles
// ============================================
// Shows pillars with sub-keywords dropdown, clusters, and linking

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Building2,
  FileStack,
  ChevronDown,
  ChevronRight,
  Pencil,
  Rocket,
  Link2,
  ArrowRight,
  Hash,
  Check,
  Clock,
  FileEdit
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { TopicClusterFull, PillarArticle, ClusterArticle } from "../types"

interface ArticleListViewProps {
  cluster: TopicClusterFull
  onWriteArticle: (articleId: string, type: "pillar" | "cluster") => void
  onWriteAll: () => void
}

// Status indicator
function StatusIndicator({ status }: { status: "planned" | "draft" | "published" }) {
  const config = {
    planned: { icon: Clock, color: "text-slate-400", bg: "bg-slate-500/20" },
    draft: { icon: FileEdit, color: "text-amber-400", bg: "bg-amber-500/20" },
    published: { icon: Check, color: "text-emerald-400", bg: "bg-emerald-500/20" }
  }
  const { icon: Icon, color, bg } = config[status]
  return (
    <div className={cn("p-1 rounded", bg)}>
      <Icon className={cn("h-3 w-3", color)} />
    </div>
  )
}

// Pillar Card with expandable sub-keywords
function PillarCard({ 
  pillar, 
  cluster,
  onWrite 
}: { 
  pillar: PillarArticle
  cluster: TopicClusterFull
  onWrite: () => void 
}) {
  const [isExpanded, setIsExpanded] = useState(true)
  
  // Get outgoing links for this pillar
  const outgoingLinks = cluster.linkingMatrix.filter(l => l.fromId === pillar.id)
  
  // Group sub-keywords by placement
  const h2Keywords = pillar.subKeywords.filter(k => k.placement === "h2")
  const h3Keywords = pillar.subKeywords.filter(k => k.placement === "h3")
  const bodyKeywords = pillar.subKeywords.filter(k => k.placement === "body")
  const faqKeywords = pillar.subKeywords.filter(k => k.placement === "faq")

  return (
    <Card className="overflow-hidden border-purple-500/30 bg-gradient-to-r from-purple-500/5 to-transparent">
      {/* Header */}
      <div className="p-4 flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1">
          <div className="p-2 rounded-lg bg-purple-500/20 mt-0.5">
            <Building2 className="h-5 w-5 text-purple-400" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-medium text-purple-400 uppercase">Pillar Article</span>
              <StatusIndicator status={pillar.status} />
            </div>
            <h3 className="font-semibold text-foreground">{pillar.keyword}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{pillar.fullTitle}</p>
            
            {/* Stats row */}
            <div className="flex items-center gap-4 mt-2">
              <span className="text-xs text-emerald-400">{(pillar.volume / 1000).toFixed(1)}K vol</span>
              <span className={cn(
                "text-xs",
                pillar.kd <= 30 ? "text-emerald-400" : pillar.kd <= 60 ? "text-amber-400" : "text-red-400"
              )}>
                KD {pillar.kd}%
              </span>
              <span className="text-xs text-muted-foreground">
                {pillar.subKeywords.length} sub-keywords
              </span>
              <span className="text-xs text-muted-foreground">
                {outgoingLinks.length} links out
              </span>
            </div>
          </div>
        </div>
        
        <Button
          size="sm"
          className="gap-1.5 bg-purple-500 hover:bg-purple-600 text-white shrink-0"
          onClick={onWrite}
        >
          <Pencil className="h-3.5 w-3.5" />
          Write This
        </Button>
      </div>
      
      {/* Sub-keywords toggle */}
      <button
        className="w-full px-4 py-2 flex items-center gap-2 text-xs text-muted-foreground hover:bg-slate-800/50 border-t border-slate-800"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {isExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
        <Hash className="h-3.5 w-3.5" />
        Sub-Keywords to use in article ({pillar.subKeywords.length})
      </button>
      
      {/* Expanded sub-keywords */}
      {isExpanded && pillar.subKeywords.length > 0 && (
        <div className="px-4 pb-4 space-y-3">
          {/* H2 Keywords */}
          {h2Keywords.length > 0 && (
            <div className="space-y-1">
              <span className="text-[10px] uppercase tracking-wider text-purple-400 font-medium">
                Use as H2 Headings
              </span>
              <div className="flex flex-wrap gap-1.5">
                {h2Keywords.map((kw, idx) => (
                  <Badge 
                    key={idx} 
                    variant="outline" 
                    className="text-xs bg-purple-500/10 border-purple-500/30 text-purple-300"
                  >
                    {kw.keyword}
                    {kw.volume && <span className="text-[9px] opacity-70 ml-1">({(kw.volume/1000).toFixed(1)}K)</span>}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {/* H3 Keywords */}
          {h3Keywords.length > 0 && (
            <div className="space-y-1">
              <span className="text-[10px] uppercase tracking-wider text-blue-400 font-medium">
                Use as H3 Headings
              </span>
              <div className="flex flex-wrap gap-1.5">
                {h3Keywords.map((kw, idx) => (
                  <Badge 
                    key={idx} 
                    variant="outline" 
                    className="text-xs bg-blue-500/10 border-blue-500/30 text-blue-300"
                  >
                    {kw.keyword}
                    {kw.volume && <span className="text-[9px] opacity-70 ml-1">({(kw.volume/1000).toFixed(1)}K)</span>}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {/* Body Keywords */}
          {bodyKeywords.length > 0 && (
            <div className="space-y-1">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">
                Mention in Body
              </span>
              <div className="flex flex-wrap gap-1.5">
                {bodyKeywords.map((kw, idx) => (
                  <Badge 
                    key={idx} 
                    variant="outline" 
                    className="text-xs bg-slate-500/10 border-slate-500/30 text-slate-300"
                  >
                    {kw.keyword}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {/* FAQ Keywords */}
          {faqKeywords.length > 0 && (
            <div className="space-y-1">
              <span className="text-[10px] uppercase tracking-wider text-amber-400 font-medium">
                Use in FAQ Section
              </span>
              <div className="flex flex-wrap gap-1.5">
                {faqKeywords.map((kw, idx) => (
                  <Badge 
                    key={idx} 
                    variant="outline" 
                    className="text-xs bg-amber-500/10 border-amber-500/30 text-amber-300"
                  >
                    {kw.keyword}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {/* Recommended specs */}
          <div className="flex items-center gap-4 pt-2 border-t border-slate-800">
            <span className="text-[10px] text-muted-foreground">
              📝 {pillar.recommendedWordCount.toLocaleString()}+ words
            </span>
            <span className="text-[10px] text-muted-foreground">
              📑 {pillar.recommendedHeadings} headings
            </span>
          </div>
        </div>
      )}
    </Card>
  )
}

// Cluster Article Row
function ClusterRow({ 
  article, 
  cluster,
  onWrite 
}: { 
  article: ClusterArticle
  cluster: TopicClusterFull
  onWrite: () => void 
}) {
  const parentPillar = cluster.pillars.find(p => p.id === article.pillarId)
  const outgoingLinks = cluster.linkingMatrix.filter(l => l.fromId === article.id)
  
  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/30 hover:bg-slate-800/50 transition-colors">
      <div className="flex items-center gap-3">
        <div className="p-1.5 rounded bg-cyan-500/20">
          <FileStack className="h-4 w-4 text-cyan-400" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">{article.keyword}</span>
            <StatusIndicator status={article.status} />
          </div>
          <div className="flex items-center gap-3 mt-0.5">
            <span className="text-xs text-emerald-400">{(article.volume / 1000).toFixed(1)}K</span>
            <span className={cn(
              "text-xs",
              article.kd <= 30 ? "text-emerald-400" : article.kd <= 60 ? "text-amber-400" : "text-red-400"
            )}>
              KD {article.kd}%
            </span>
            {parentPillar && (
              <span className="text-xs text-muted-foreground">
                → Links to: {parentPillar.keyword}
              </span>
            )}
          </div>
        </div>
      </div>
      
      <Button
        size="sm"
        variant="outline"
        className="gap-1.5 border-cyan-500/30 hover:bg-cyan-500/10"
        onClick={onWrite}
      >
        <Pencil className="h-3 w-3" />
        Write
      </Button>
    </div>
  )
}

// Internal Linking Preview
function LinkingPreview({ cluster }: { cluster: TopicClusterFull }) {
  const requiredLinks = cluster.linkingMatrix.filter(l => l.isRequired)
  const pillarToCluster = requiredLinks.filter(l => 
    cluster.pillars.some(p => p.id === l.fromId) && 
    cluster.clusters.some(c => c.id === l.toId)
  )
  const clusterToPillar = requiredLinks.filter(l => 
    cluster.clusters.some(c => c.id === l.fromId) && 
    cluster.pillars.some(p => p.id === l.toId)
  )

  return (
    <Card className="p-4 border-orange-500/30">
      <div className="flex items-center gap-2 mb-3">
        <Link2 className="h-4 w-4 text-orange-400" />
        <span className="font-medium text-sm">Internal Linking Strategy</span>
        <Badge className="text-[10px] bg-orange-500/20 text-orange-400 border-orange-500/40 ml-auto">
          {cluster.linkingMatrix.length} total links
        </Badge>
      </div>
      
      <div className="space-y-3 text-xs">
        {/* Pillar → Clusters */}
        <div className="p-2 rounded bg-purple-500/10 border border-purple-500/20">
          <div className="flex items-center gap-2 mb-1">
            <Building2 className="h-3 w-3 text-purple-400" />
            <span className="text-purple-300">Pillars link to Clusters</span>
            <ArrowRight className="h-3 w-3 text-purple-400" />
            <FileStack className="h-3 w-3 text-cyan-400" />
          </div>
          <p className="text-muted-foreground">
            {pillarToCluster.length} required links from pillar articles to cluster articles
          </p>
        </div>
        
        {/* Clusters → Pillar */}
        <div className="p-2 rounded bg-cyan-500/10 border border-cyan-500/20">
          <div className="flex items-center gap-2 mb-1">
            <FileStack className="h-3 w-3 text-cyan-400" />
            <span className="text-cyan-300">Clusters link back to Pillars</span>
            <ArrowRight className="h-3 w-3 text-cyan-400" />
            <Building2 className="h-3 w-3 text-purple-400" />
          </div>
          <p className="text-muted-foreground">
            {clusterToPillar.length} required backlinks from clusters to parent pillar
          </p>
        </div>
        
        <p className="text-[10px] text-muted-foreground text-center">
          💡 AI will automatically suggest where to place each link in your content
        </p>
      </div>
    </Card>
  )
}

export function ArticleListView({ cluster, onWriteArticle, onWriteAll }: ArticleListViewProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-4 bg-gradient-to-r from-purple-500/10 via-slate-900 to-cyan-500/10 border-purple-500/30">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-foreground">{cluster.name}</h2>
            <p className="text-sm text-muted-foreground mt-1">{cluster.description}</p>
            <div className="flex items-center gap-4 mt-2">
              <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/40">
                {cluster.pillars.length} Pillars
              </Badge>
              <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/40">
                {cluster.clusters.length} Clusters
              </Badge>
              <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/40">
                {(cluster.totalVolume / 1000).toFixed(0)}K total volume
              </Badge>
            </div>
          </div>
          
          <Button
            size="lg"
            className="gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-lg"
            onClick={onWriteAll}
          >
            <Rocket className="h-5 w-5" />
            Write All - Sequential Mode
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Pillars */}
        <div className="lg:col-span-2 space-y-4">
          {/* Pillars Section */}
          <div>
            <h3 className="text-sm font-medium text-purple-400 mb-3 flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              PILLAR ARTICLES ({cluster.pillars.length})
            </h3>
            <div className="space-y-4">
              {cluster.pillars.map(pillar => (
                <PillarCard
                  key={pillar.id}
                  pillar={pillar}
                  cluster={cluster}
                  onWrite={() => onWriteArticle(pillar.id, "pillar")}
                />
              ))}
            </div>
          </div>
          
          {/* Clusters Section */}
          <div className="pt-4 border-t border-slate-800">
            <h3 className="text-sm font-medium text-cyan-400 mb-3 flex items-center gap-2">
              <FileStack className="h-4 w-4" />
              CLUSTER ARTICLES ({cluster.clusters.length})
            </h3>
            <div className="space-y-2">
              {cluster.clusters.map(article => (
                <ClusterRow
                  key={article.id}
                  article={article}
                  cluster={cluster}
                  onWrite={() => onWriteArticle(article.id, "cluster")}
                />
              ))}
            </div>
          </div>
        </div>
        
        {/* Right Column - Linking Preview */}
        <div className="space-y-4">
          <LinkingPreview cluster={cluster} />
          
          {/* Quick Stats */}
          <Card className="p-4">
            <h4 className="text-sm font-medium mb-3">Writing Plan Summary</h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Articles</span>
                <span className="font-medium">{cluster.articleCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Est. Total Words</span>
                <span className="font-medium">
                  {(
                    cluster.pillars.reduce((sum, p) => sum + p.recommendedWordCount, 0) +
                    cluster.clusters.reduce((sum, c) => sum + c.recommendedWordCount, 0)
                  ).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Internal Links</span>
                <span className="font-medium">{cluster.linkingMatrix.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Completed</span>
                <span className="font-medium text-emerald-400">{cluster.publishedCount}/{cluster.articleCount}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
