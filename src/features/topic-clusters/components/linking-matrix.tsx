// ============================================
// LINKING MATRIX COMPONENT
// ============================================
// Visual internal linking recommendations with AI insights

"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Link2,
  ArrowRight,
  Building2,
  FileStack,
  ExternalLink,
  Sparkles,
  Check,
  Clock,
  FileEdit,
  ChevronDown,
  ChevronUp
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"
import type { 
  TopicClusterFull, 
  PillarArticle, 
  ClusterArticle, 
  InternalLinkRecommendation 
} from "../types"

interface LinkingMatrixProps {
  cluster: TopicClusterFull
  selectedArticleId?: string
  onSelectArticle?: (id: string, type: "pillar" | "cluster") => void
  onWriteArticle?: (id: string, type: "pillar" | "cluster") => void
}

// Status badge component
function StatusBadge({ status }: { status: "planned" | "draft" | "published" }) {
  const config = {
    planned: { icon: Clock, color: "bg-slate-500/20 text-slate-400 border-slate-500/30" },
    draft: { icon: FileEdit, color: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
    published: { icon: Check, color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" }
  }
  const { icon: Icon, color } = config[status]
  return (
    <Badge variant="outline" className={cn("text-[10px] gap-1", color)}>
      <Icon className="h-3 w-3" />
      {status}
    </Badge>
  )
}

// Single link recommendation card
function LinkRecommendationCard({ link, cluster }: { 
  link: InternalLinkRecommendation
  cluster: TopicClusterFull 
}) {
  const toArticle = [...cluster.pillars, ...cluster.clusters].find(a => a.id === link.toId)
  const isPillar = cluster.pillars.some(p => p.id === link.toId)
  
  return (
    <div className={cn(
      "p-3 rounded-lg border",
      link.isRequired 
        ? "bg-purple-500/5 border-purple-500/30" 
        : "bg-slate-800/30 border-slate-700/50"
    )}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          {isPillar ? (
            <Building2 className="h-4 w-4 text-purple-400" />
          ) : (
            <FileStack className="h-4 w-4 text-cyan-400" />
          )}
          <span className="text-sm font-medium text-foreground">{link.toKeyword}</span>
        </div>
        <div className="flex items-center gap-1">
          {link.isRequired && (
            <Badge className="text-[9px] bg-purple-500/20 text-purple-400 border-purple-500/40">
              Required
            </Badge>
          )}
          <Badge variant="outline" className="text-[9px] text-muted-foreground">
            {link.relevanceScore}% match
          </Badge>
        </div>
      </div>
      
      <div className="space-y-1.5 text-xs">
        <div className="flex items-start gap-2">
          <span className="text-muted-foreground shrink-0">Anchor:</span>
          <span className="text-cyan-400">"{link.anchorText}"</span>
        </div>
        <div className="flex items-start gap-2">
          <span className="text-muted-foreground shrink-0">Where:</span>
          <span className="text-slate-300">{link.placementHint}</span>
        </div>
        {link.toUrl && (
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground shrink-0">URL:</span>
            <a href={link.toUrl} className="text-emerald-400 hover:underline flex items-center gap-1">
              {link.toUrl}
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        )}
      </div>
    </div>
  )
}

// Article card with linking info
function ArticleCard({ 
  article, 
  type, 
  isSelected, 
  linksFrom,
  linksTo,
  onClick,
  onWrite 
}: {
  article: PillarArticle | ClusterArticle
  type: "pillar" | "cluster"
  isSelected: boolean
  linksFrom: InternalLinkRecommendation[]
  linksTo: InternalLinkRecommendation[]
  onClick: () => void
  onWrite: () => void
}) {
  const isPillar = type === "pillar"
  
  return (
    <Card 
      className={cn(
        "p-4 cursor-pointer transition-all",
        isSelected 
          ? "ring-2 ring-orange-500/50 bg-slate-800/50" 
          : "hover:bg-slate-800/30"
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-start gap-2">
          {isPillar ? (
            <Building2 className="h-5 w-5 text-purple-400 mt-0.5" />
          ) : (
            <FileStack className="h-5 w-5 text-cyan-400 mt-0.5" />
          )}
          <div>
            <h4 className="font-medium text-foreground">{article.keyword}</h4>
            <p className="text-xs text-muted-foreground mt-0.5">{article.fullTitle}</p>
          </div>
        </div>
        <StatusBadge status={article.status} />
      </div>
      
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="text-center p-2 bg-slate-800/50 rounded">
          <div className="text-sm font-bold text-emerald-400">{(article.volume / 1000).toFixed(1)}K</div>
          <div className="text-[9px] text-muted-foreground">Volume</div>
        </div>
        <div className="text-center p-2 bg-slate-800/50 rounded">
          <div className={cn(
            "text-sm font-bold",
            article.kd <= 30 ? "text-emerald-400" : article.kd <= 60 ? "text-amber-400" : "text-red-400"
          )}>
            {article.kd}%
          </div>
          <div className="text-[9px] text-muted-foreground">KD</div>
        </div>
        <div className="text-center p-2 bg-slate-800/50 rounded">
          <div className="text-sm font-bold text-cyan-400">
            {linksFrom.filter(l => l.isRequired).length}/{linksFrom.length}
          </div>
          <div className="text-[9px] text-muted-foreground">Links Out</div>
        </div>
      </div>
      
      {/* Link indicators */}
      <div className="flex items-center gap-2 text-[10px] mb-3">
        <span className="text-muted-foreground">Links to:</span>
        <div className="flex flex-wrap gap-1">
          {linksFrom.slice(0, 3).map(link => (
            <Badge 
              key={link.id} 
              variant="outline" 
              className={cn(
                "text-[9px]",
                link.isRequired ? "border-purple-500/40 text-purple-400" : "border-slate-600"
              )}
            >
              {link.toKeyword.slice(0, 15)}...
            </Badge>
          ))}
          {linksFrom.length > 3 && (
            <Badge variant="outline" className="text-[9px] border-slate-600">
              +{linksFrom.length - 3} more
            </Badge>
          )}
        </div>
      </div>
      
      <Button
        size="sm"
        className="w-full gap-1.5 bg-orange-500 hover:bg-orange-600"
        onClick={(e) => {
          e.stopPropagation()
          onWrite()
        }}
      >
        <Sparkles className="h-3.5 w-3.5" />
        Write with AI
      </Button>
    </Card>
  )
}

export function LinkingMatrix({ 
  cluster, 
  selectedArticleId, 
  onSelectArticle,
  onWriteArticle
}: LinkingMatrixProps) {
  const [expandedSection, setExpandedSection] = useState<"pillars" | "clusters" | "matrix" | null>("pillars")
  
  const selectedArticle = selectedArticleId 
    ? [...cluster.pillars, ...cluster.clusters].find(a => a.id === selectedArticleId)
    : null
  
  const selectedType = selectedArticle
    ? cluster.pillars.some(p => p.id === selectedArticleId) ? "pillar" : "cluster"
    : null
  
  const selectedLinks = selectedArticleId 
    ? cluster.linkingMatrix.filter(l => l.fromId === selectedArticleId)
    : []
  
  const incomingLinks = selectedArticleId
    ? cluster.linkingMatrix.filter(l => l.toId === selectedArticleId)
    : []

  return (
    <div className="space-y-4">
      {/* Cluster Overview Header */}
      <Card className="p-4 bg-linear-to-r from-purple-500/10 via-slate-800/50 to-cyan-500/10 border-purple-500/30">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/20">
              <Link2 className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{cluster.name}</h3>
              <p className="text-xs text-muted-foreground">{cluster.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/40">
              {cluster.pillars.length} Pillars
            </Badge>
            <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/40">
              {cluster.clusters.length} Clusters
            </Badge>
          </div>
        </div>
        
        <div className="grid grid-cols-4 gap-3">
          <div className="text-center p-3 bg-slate-800/50 rounded-lg">
            <div className="text-xl font-bold text-foreground">{cluster.articleCount}</div>
            <div className="text-[10px] text-muted-foreground">Total Articles</div>
          </div>
          <div className="text-center p-3 bg-slate-800/50 rounded-lg">
            <div className="text-xl font-bold text-emerald-400">{(cluster.totalVolume / 1000).toFixed(0)}K</div>
            <div className="text-[10px] text-muted-foreground">Total Volume</div>
          </div>
          <div className="text-center p-3 bg-slate-800/50 rounded-lg">
            <div className="text-xl font-bold text-amber-400">{cluster.avgKd}%</div>
            <div className="text-[10px] text-muted-foreground">Avg KD</div>
          </div>
          <div className="text-center p-3 bg-slate-800/50 rounded-lg">
            <div className="text-xl font-bold text-cyan-400">{cluster.linkingMatrix.length}</div>
            <div className="text-[10px] text-muted-foreground">Internal Links</div>
          </div>
        </div>
      </Card>

      {/* Pillars Section */}
      <Card className="overflow-hidden">
        <button
          className="w-full p-4 flex items-center justify-between hover:bg-slate-800/30 transition-colors"
          onClick={() => setExpandedSection(expandedSection === "pillars" ? null : "pillars")}
        >
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-purple-400" />
            <span className="font-medium">Pillar Articles</span>
            <Badge variant="outline" className="text-[10px]">{cluster.pillars.length}</Badge>
          </div>
          {expandedSection === "pillars" ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </button>
        
        {expandedSection === "pillars" && (
          <div className="p-4 pt-0 grid grid-cols-1 md:grid-cols-2 gap-4">
            {cluster.pillars.map(pillar => {
              const linksFrom = cluster.linkingMatrix.filter(l => l.fromId === pillar.id)
              const linksTo = cluster.linkingMatrix.filter(l => l.toId === pillar.id)
              return (
                <ArticleCard
                  key={pillar.id}
                  article={pillar}
                  type="pillar"
                  isSelected={selectedArticleId === pillar.id}
                  linksFrom={linksFrom}
                  linksTo={linksTo}
                  onClick={() => onSelectArticle?.(pillar.id, "pillar")}
                  onWrite={() => onWriteArticle?.(pillar.id, "pillar")}
                />
              )
            })}
          </div>
        )}
      </Card>

      {/* Clusters Section */}
      <Card className="overflow-hidden">
        <button
          className="w-full p-4 flex items-center justify-between hover:bg-slate-800/30 transition-colors"
          onClick={() => setExpandedSection(expandedSection === "clusters" ? null : "clusters")}
        >
          <div className="flex items-center gap-2">
            <FileStack className="h-5 w-5 text-cyan-400" />
            <span className="font-medium">Cluster Articles</span>
            <Badge variant="outline" className="text-[10px]">{cluster.clusters.length}</Badge>
          </div>
          {expandedSection === "clusters" ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </button>
        
        {expandedSection === "clusters" && (
          <div className="p-4 pt-0 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cluster.clusters.map(clusterArticle => {
              const linksFrom = cluster.linkingMatrix.filter(l => l.fromId === clusterArticle.id)
              const linksTo = cluster.linkingMatrix.filter(l => l.toId === clusterArticle.id)
              return (
                <ArticleCard
                  key={clusterArticle.id}
                  article={clusterArticle}
                  type="cluster"
                  isSelected={selectedArticleId === clusterArticle.id}
                  linksFrom={linksFrom}
                  linksTo={linksTo}
                  onClick={() => onSelectArticle?.(clusterArticle.id, "cluster")}
                  onWrite={() => onWriteArticle?.(clusterArticle.id, "cluster")}
                />
              )
            })}
          </div>
        )}
      </Card>

      {/* Selected Article Link Details */}
      {selectedArticle && (
        <Card className="overflow-hidden">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-orange-400" />
              <span className="font-medium">AI Linking Recommendations</span>
              <Badge className="text-[10px] bg-slate-800">
                for "{selectedArticle.keyword}"
              </Badge>
            </div>
          </div>
          
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Outgoing Links */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <ArrowRight className="h-4 w-4" />
                Links to Add ({selectedLinks.length})
              </div>
              {selectedLinks.length > 0 ? (
                <div className="space-y-2">
                  {selectedLinks.map(link => (
                    <LinkRecommendationCard key={link.id} link={link} cluster={cluster} />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No outgoing links recommended</p>
              )}
            </div>
            
            {/* Incoming Links */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <ArrowRight className="h-4 w-4 rotate-180" />
                Will Receive Links From ({incomingLinks.length})
              </div>
              {incomingLinks.length > 0 ? (
                <div className="space-y-2">
                  {incomingLinks.map(link => (
                    <div key={link.id} className="p-2 rounded bg-slate-800/30 border border-slate-700/50">
                      <div className="flex items-center gap-2">
                        {cluster.pillars.some(p => p.id === link.fromId) ? (
                          <Building2 className="h-3.5 w-3.5 text-purple-400" />
                        ) : (
                          <FileStack className="h-3.5 w-3.5 text-cyan-400" />
                        )}
                        <span className="text-sm text-foreground">{link.fromKeyword}</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        Anchor: <span className="text-cyan-400">"{link.anchorText}"</span>
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No incoming links</p>
              )}
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
