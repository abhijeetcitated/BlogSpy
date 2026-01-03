// ============================================
// CLUSTER OVERVIEW COMPONENT
// ============================================
// Shows full cluster with "Load Entire Cluster to AI Writer" button

"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Sparkles,
  Building2,
  FileStack,
  Link2,
  ArrowRight,
  Rocket,
  Check,
  Clock,
  FileEdit,
  BarChart3
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import type { TopicClusterFull } from "../types"
import { buildAIWriterUrl, buildClusterOverviewUrl } from "../constants/mock-cluster-data"

interface ClusterOverviewProps {
  cluster: TopicClusterFull
}

export function ClusterOverview({ cluster }: ClusterOverviewProps) {
  const router = useRouter()
  
  // Calculate stats
  const plannedCount = cluster.pillars.filter(p => p.status === "planned").length +
                       cluster.clusters.filter(c => c.status === "planned").length
  const draftCount = cluster.pillars.filter(p => p.status === "draft").length +
                     cluster.clusters.filter(c => c.status === "draft").length
  const publishedCount = cluster.publishedCount
  
  const requiredLinks = cluster.linkingMatrix.filter(l => l.isRequired).length
  const totalLinks = cluster.linkingMatrix.length
  
  // Handle write article
  const handleWriteArticle = (articleId: string, type: "pillar" | "cluster") => {
    const url = buildAIWriterUrl(articleId, type)
    router.push(url)
  }
  
  // Handle load entire cluster
  const handleLoadCluster = () => {
    const url = buildClusterOverviewUrl()
    router.push(url)
  }

  return (
    <div className="space-y-6">
      {/* Main Overview Card */}
      <Card className="p-6 bg-linear-to-br from-purple-500/10 via-slate-900 to-cyan-500/10 border-purple-500/30">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 rounded-xl bg-linear-to-br from-purple-500/20 to-cyan-500/20">
                <Link2 className="h-6 w-6 text-purple-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">{cluster.name}</h2>
                <p className="text-sm text-muted-foreground">{cluster.description}</p>
              </div>
            </div>
          </div>
          
          <Button
            size="lg"
            className="gap-2 bg-linear-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-lg shadow-orange-500/25"
            onClick={handleLoadCluster}
          >
            <Rocket className="h-5 w-5" />
            Load Entire Cluster to AI Writer
          </Button>
        </div>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50 text-center">
            <div className="text-2xl font-bold text-foreground">{cluster.articleCount}</div>
            <div className="text-[10px] text-muted-foreground uppercase">Total Articles</div>
          </div>
          <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/30 text-center">
            <div className="text-2xl font-bold text-purple-400">{cluster.pillars.length}</div>
            <div className="text-[10px] text-purple-400 uppercase">Pillars</div>
          </div>
          <div className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-center">
            <div className="text-2xl font-bold text-cyan-400">{cluster.clusters.length}</div>
            <div className="text-[10px] text-cyan-400 uppercase">Clusters</div>
          </div>
          <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-center">
            <div className="text-2xl font-bold text-emerald-400">{(cluster.totalVolume / 1000).toFixed(0)}K</div>
            <div className="text-[10px] text-emerald-400 uppercase">Volume</div>
          </div>
          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-center">
            <div className="text-2xl font-bold text-amber-400">{cluster.avgKd}%</div>
            <div className="text-[10px] text-amber-400 uppercase">Avg KD</div>
          </div>
          <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50 text-center">
            <div className="text-2xl font-bold text-orange-400">{totalLinks}</div>
            <div className="text-[10px] text-muted-foreground uppercase">Internal Links</div>
          </div>
          <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-center">
            <div className="text-2xl font-bold text-emerald-400">{publishedCount}/{cluster.articleCount}</div>
            <div className="text-[10px] text-emerald-400 uppercase">Published</div>
          </div>
        </div>
      </Card>

      {/* Progress & Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Planned */}
        <Card className="p-4 border-slate-700/50">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="h-4 w-4 text-slate-400" />
            <span className="font-medium text-slate-400">Planned</span>
            <Badge variant="outline" className="text-[10px] ml-auto">{plannedCount}</Badge>
          </div>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {[...cluster.pillars, ...cluster.clusters]
              .filter(a => a.status === "planned")
              .map(article => {
                const isPillar = cluster.pillars.some(p => p.id === article.id)
                return (
                  <div 
                    key={article.id} 
                    className="flex items-center justify-between p-2 rounded bg-slate-800/50 hover:bg-slate-800 cursor-pointer"
                    onClick={() => handleWriteArticle(article.id, isPillar ? "pillar" : "cluster")}
                  >
                    <div className="flex items-center gap-2">
                      {isPillar ? (
                        <Building2 className="h-3.5 w-3.5 text-purple-400" />
                      ) : (
                        <FileStack className="h-3.5 w-3.5 text-cyan-400" />
                      )}
                      <span className="text-xs text-foreground truncate max-w-[150px]">{article.keyword}</span>
                    </div>
                    <ArrowRight className="h-3 w-3 text-muted-foreground" />
                  </div>
                )
              })}
          </div>
        </Card>

        {/* In Progress */}
        <Card className="p-4 border-amber-500/30">
          <div className="flex items-center gap-2 mb-3">
            <FileEdit className="h-4 w-4 text-amber-400" />
            <span className="font-medium text-amber-400">In Progress</span>
            <Badge variant="outline" className="text-[10px] ml-auto border-amber-500/30 text-amber-400">{draftCount}</Badge>
          </div>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {[...cluster.pillars, ...cluster.clusters]
              .filter(a => a.status === "draft")
              .map(article => {
                const isPillar = cluster.pillars.some(p => p.id === article.id)
                return (
                  <div 
                    key={article.id} 
                    className="flex items-center justify-between p-2 rounded bg-amber-500/10 hover:bg-amber-500/20 cursor-pointer"
                    onClick={() => handleWriteArticle(article.id, isPillar ? "pillar" : "cluster")}
                  >
                    <div className="flex items-center gap-2">
                      {isPillar ? (
                        <Building2 className="h-3.5 w-3.5 text-purple-400" />
                      ) : (
                        <FileStack className="h-3.5 w-3.5 text-cyan-400" />
                      )}
                      <span className="text-xs text-foreground truncate max-w-[150px]">{article.keyword}</span>
                    </div>
                    <Button size="sm" variant="ghost" className="h-6 px-2 text-[10px]">
                      Continue
                    </Button>
                  </div>
                )
              })}
            {draftCount === 0 && (
              <p className="text-xs text-muted-foreground text-center py-4">No articles in progress</p>
            )}
          </div>
        </Card>

        {/* Published */}
        <Card className="p-4 border-emerald-500/30">
          <div className="flex items-center gap-2 mb-3">
            <Check className="h-4 w-4 text-emerald-400" />
            <span className="font-medium text-emerald-400">Published</span>
            <Badge variant="outline" className="text-[10px] ml-auto border-emerald-500/30 text-emerald-400">{publishedCount}</Badge>
          </div>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {[...cluster.pillars, ...cluster.clusters]
              .filter(a => a.status === "published")
              .map(article => {
                const isPillar = cluster.pillars.some(p => p.id === article.id)
                return (
                  <div 
                    key={article.id} 
                    className="flex items-center justify-between p-2 rounded bg-emerald-500/10"
                  >
                    <div className="flex items-center gap-2">
                      {isPillar ? (
                        <Building2 className="h-3.5 w-3.5 text-purple-400" />
                      ) : (
                        <FileStack className="h-3.5 w-3.5 text-cyan-400" />
                      )}
                      <span className="text-xs text-foreground truncate max-w-[150px]">{article.keyword}</span>
                    </div>
                    <Check className="h-3 w-3 text-emerald-400" />
                  </div>
                )
              })}
          </div>
        </Card>
      </div>

      {/* Internal Linking Summary */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="h-5 w-5 text-orange-400" />
          <span className="font-medium">Internal Linking Strategy</span>
          <Badge className="ml-auto bg-orange-500/20 text-orange-400 border-orange-500/40">
            AI Recommended
          </Badge>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3 rounded-lg bg-slate-800/50 text-center">
            <div className="text-xl font-bold text-foreground">{totalLinks}</div>
            <div className="text-[10px] text-muted-foreground">Total Links</div>
          </div>
          <div className="p-3 rounded-lg bg-purple-500/10 text-center">
            <div className="text-xl font-bold text-purple-400">{requiredLinks}</div>
            <div className="text-[10px] text-purple-400">Required</div>
          </div>
          <div className="p-3 rounded-lg bg-cyan-500/10 text-center">
            <div className="text-xl font-bold text-cyan-400">{totalLinks - requiredLinks}</div>
            <div className="text-[10px] text-cyan-400">Optional</div>
          </div>
          <div className="p-3 rounded-lg bg-emerald-500/10 text-center">
            <div className="text-xl font-bold text-emerald-400">
              {Math.round((cluster.linkingMatrix.reduce((sum, l) => sum + l.relevanceScore, 0) / totalLinks))}%
            </div>
            <div className="text-[10px] text-emerald-400">Avg Relevance</div>
          </div>
        </div>
        
        <p className="text-xs text-muted-foreground mt-4 text-center">
          💡 AI has analyzed semantic relationships and recommends {requiredLinks} required links and {totalLinks - requiredLinks} optional links
          to maximize SEO impact and user experience.
        </p>
      </Card>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        {cluster.pillars.filter(p => p.status === "planned").slice(0, 2).map(pillar => (
          <Button
            key={pillar.id}
            variant="outline"
            className="gap-2 border-purple-500/30 hover:bg-purple-500/10"
            onClick={() => handleWriteArticle(pillar.id, "pillar")}
          >
            <Building2 className="h-4 w-4 text-purple-400" />
            Write: {pillar.keyword}
          </Button>
        ))}
        {cluster.clusters.filter(c => c.status === "planned").slice(0, 3).map(clusterArticle => (
          <Button
            key={clusterArticle.id}
            variant="outline"
            className="gap-2 border-cyan-500/30 hover:bg-cyan-500/10"
            onClick={() => handleWriteArticle(clusterArticle.id, "cluster")}
          >
            <FileStack className="h-4 w-4 text-cyan-400" />
            Write: {clusterArticle.keyword}
          </Button>
        ))}
      </div>
    </div>
  )
}
