"use client"

// ============================================
// CLUSTER RESULTS COMPONENT
// ============================================
// Shows clustering results with Pillar → Supporting → Cluster hierarchy

import { useState } from "react"
import { TopicProject, PillarResult, ProjectKeyword } from "../types/project.types"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  ArrowLeft,
  Crown,
  FileText,
  Layers,
  Target,
  Sparkles,
  AlertCircle,
  CircleDot,
  GitBranch,
  ChevronDown
} from "lucide-react"
import { cn } from "@/lib/utils"

interface ClusterResultsProps {
  project: TopicProject
  onBack: () => void
  onRegenerate: () => void
  isRegenerating: boolean
}

export function ClusterResults({
  project,
  onBack,
  onRegenerate,
  isRegenerating
}: ClusterResultsProps) {
  const [expandedPillars, setExpandedPillars] = useState<string[]>([])

  // Get keyword by ID helper
  const getKeyword = (id: string) => project.keywords.find(k => k.id === id)

  // Stats
  const totalPillars = project.pillars.length
  const totalSupporting = project.keywords.filter(k => k.keywordType === "supporting").length
  const totalCluster = project.keywords.filter(k => k.keywordType === "cluster").length
  const totalUncategorized = project.uncategorizedKeywordIds.length

  // Clustering coverage
  const categorizedCount = project.keywords.length - totalUncategorized
  const coveragePercent = Math.round((categorizedCount / project.keywords.length) * 100)

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="ghost" size="icon" onClick={onBack} className="h-8 w-8 sm:h-9 sm:w-9 shrink-0">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-lg sm:text-xl font-semibold">Cluster Results</h2>
            <Badge className="bg-linear-to-r from-violet-600 to-indigo-600 text-xs shrink-0">
              <Sparkles className="h-3 w-3 mr-1" />
              AI Generated
            </Badge>
          </div>
          <p className="text-muted-foreground text-xs sm:text-sm ml-0 sm:ml-10 truncate">
            {project.name} • Clustered {project.clusteredAt ? new Date(project.clusteredAt).toLocaleDateString() : ""}
          </p>
        </div>

        <Button variant="outline" onClick={onRegenerate} disabled={isRegenerating} size="sm" className="w-full sm:w-auto shrink-0">
          <Sparkles className="h-4 w-4 mr-2" />
          <span className="sm:hidden">{isRegenerating ? "..." : "Regenerate"}</span>
          <span className="hidden sm:inline">{isRegenerating ? "Regenerating..." : "Regenerate"}</span>
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-4">
        <StatCard
          title="Pillars"
          value={totalPillars}
          icon={Crown}
          iconColor="text-violet-500"
          bgColor="bg-violet-50 dark:bg-violet-950/30"
        />
        <StatCard
          title="Supporting"
          value={totalSupporting}
          icon={FileText}
          iconColor="text-blue-500"
          bgColor="bg-blue-50 dark:bg-blue-950/30"
        />
        <StatCard
          title="Clusters"
          value={totalCluster}
          icon={GitBranch}
          iconColor="text-emerald-500"
          bgColor="bg-emerald-50 dark:bg-emerald-950/30"
        />
        <StatCard
          title="Uncategorized"
          value={totalUncategorized}
          icon={AlertCircle}
          iconColor="text-gray-500"
          bgColor="bg-gray-50 dark:bg-gray-950/30"
        />
        <Card className="col-span-2 sm:col-span-1">
          <CardContent className="p-3 sm:p-4">
            <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider mb-1.5 sm:mb-2">Coverage</p>
            <div className="flex items-center gap-2">
              <Progress value={coveragePercent} className="h-1.5 sm:h-2 flex-1" />
              <span className="text-xs sm:text-sm font-semibold">{coveragePercent}%</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pillar Cards */}
      <div className="space-y-3 sm:space-y-4">
        <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2">
          <Target className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
          Topic Pillars ({totalPillars})
        </h3>

        {project.pillars.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-muted-foreground">No pillars were identified. Try adding more keywords.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {project.pillars.map((pillar, index) => (
              <PillarCard
                key={pillar.id}
                pillar={pillar}
                index={index + 1}
                getKeyword={getKeyword}
                isExpanded={expandedPillars.includes(pillar.id)}
                onToggle={() => setExpandedPillars(prev => 
                  prev.includes(pillar.id) 
                    ? prev.filter(id => id !== pillar.id)
                    : [...prev, pillar.id]
                )}
              />
            ))}
          </div>
        )}
      </div>

      {/* Uncategorized Keywords */}
      {totalUncategorized > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
              Uncategorized Keywords ({totalUncategorized})
            </CardTitle>
            <CardDescription>
              These keywords couldn't be automatically assigned to any pillar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {project.uncategorizedKeywordIds.map(id => {
                const kw = getKeyword(id)
                if (!kw) return null
                return (
                  <Badge key={id} variant="outline" className="py-1 px-2">
                    {kw.keyword}
                    <span className="ml-1 text-muted-foreground">
                      {kw.volume?.toLocaleString()}
                    </span>
                  </Badge>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// ============================================
// STAT CARD
// ============================================

interface StatCardProps {
  title: string
  value: number
  icon: React.ElementType
  iconColor: string
  bgColor: string
}

function StatCard({ title, value, icon: Icon, iconColor, bgColor }: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider truncate">{title}</p>
            <p className="text-lg sm:text-2xl font-bold mt-0.5 sm:mt-1">{value}</p>
          </div>
          <div className={cn("h-8 w-8 sm:h-10 sm:w-10 rounded-lg flex items-center justify-center shrink-0", bgColor)}>
            <Icon className={cn("h-4 w-4 sm:h-5 sm:w-5", iconColor)} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ============================================
// PILLAR CARD
// ============================================

interface PillarCardProps {
  pillar: PillarResult
  index: number
  getKeyword: (id: string) => ProjectKeyword | undefined
  isExpanded: boolean
  onToggle: () => void
}

function PillarCard({ pillar, index, getKeyword, isExpanded, onToggle }: PillarCardProps) {
  const supportingKeywords = pillar.supportingKeywordIds.map(id => getKeyword(id)).filter(Boolean) as ProjectKeyword[]
  const clusterKeywords = pillar.clusterKeywordIds.map(id => getKeyword(id)).filter(Boolean) as ProjectKeyword[]

  return (
    <Collapsible open={isExpanded} onOpenChange={onToggle} className="border rounded-lg overflow-hidden">
      <CollapsibleTrigger className="w-full px-3 sm:px-4 py-2.5 sm:py-3 hover:bg-muted/50 flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
          {/* Pillar Number */}
          <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-linear-to-r from-violet-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs sm:text-sm shrink-0">
            {index}
          </div>

          {/* Pillar Info */}
          <div className="flex-1 text-left min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <Crown className="h-3 w-3 sm:h-4 sm:w-4 text-violet-500 shrink-0" />
              <span className="font-semibold text-sm sm:text-base truncate">{pillar.keyword}</span>
              <Badge variant="outline" className="bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400 text-[10px] hidden sm:inline-flex">
                Pillar
              </Badge>
            </div>
            <div className="flex items-center gap-2 sm:gap-4 mt-0.5 sm:mt-1 text-[10px] sm:text-xs text-muted-foreground">
              <span>Vol: {pillar.volume.toLocaleString()}</span>
              <span className={cn(
                pillar.kd >= 60 ? "text-red-500" :
                pillar.kd >= 40 ? "text-orange-500" :
                "text-green-500"
              )}>
                KD: {pillar.kd}
              </span>
              <span className="hidden sm:inline">Confidence: {Math.round(pillar.confidenceScore)}%</span>
            </div>
          </div>

          {/* Counts - Hidden on mobile, shown on tablet+ */}
          <div className="hidden sm:flex items-center gap-2 sm:gap-3 text-sm shrink-0">
            <div className="text-center px-2 sm:px-3 py-0.5 sm:py-1 bg-muted rounded">
              <div className="font-semibold text-xs sm:text-sm">{pillar.supportingKeywordIds.length}</div>
              <div className="text-[10px] text-muted-foreground">Supporting</div>
            </div>
            <div className="text-center px-2 sm:px-3 py-0.5 sm:py-1 bg-muted rounded">
              <div className="font-semibold text-xs sm:text-sm">{pillar.clusterKeywordIds.length}</div>
              <div className="text-[10px] text-muted-foreground">Clusters</div>
            </div>
            <div className="text-center px-2 sm:px-3 py-0.5 sm:py-1 bg-primary/10 rounded">
              <div className="font-semibold text-primary text-xs sm:text-sm">{pillar.totalVolume.toLocaleString()}</div>
              <div className="text-[10px] text-muted-foreground">Total Vol</div>
            </div>
          </div>

          {/* Mobile counts */}
          <div className="flex sm:hidden items-center gap-1.5 text-xs shrink-0">
            <div className="text-center px-1.5 py-0.5 bg-muted rounded">
              <div className="font-semibold">{pillar.supportingKeywordIds.length + pillar.clusterKeywordIds.length}</div>
            </div>
            <ChevronDown className={cn("h-4 w-4 transition-transform", isExpanded && "rotate-180")} />
          </div>
        </div>
      </CollapsibleTrigger>

      <CollapsibleContent className="px-3 sm:px-4 pb-3 sm:pb-4">
        <div className="space-y-3 sm:space-y-4 pt-2">
          {/* Mobile stats row */}
          <div className="flex sm:hidden items-center gap-2 text-xs pb-2 border-b">
            <div className="flex-1 text-center py-1 bg-muted rounded">
              <div className="font-semibold">{pillar.supportingKeywordIds.length}</div>
              <div className="text-[10px] text-muted-foreground">Supporting</div>
            </div>
            <div className="flex-1 text-center py-1 bg-muted rounded">
              <div className="font-semibold">{pillar.clusterKeywordIds.length}</div>
              <div className="text-[10px] text-muted-foreground">Clusters</div>
            </div>
            <div className="flex-1 text-center py-1 bg-primary/10 rounded">
              <div className="font-semibold text-primary">{pillar.totalVolume.toLocaleString()}</div>
              <div className="text-[10px] text-muted-foreground">Total Vol</div>
            </div>
          </div>

          {/* Supporting Keywords */}
          {supportingKeywords.length > 0 && (
            <div className="space-y-1.5 sm:space-y-2">
              <h4 className="text-xs sm:text-sm font-medium flex items-center gap-1.5 sm:gap-2">
                <FileText className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500" />
                Supporting Keywords ({supportingKeywords.length})
              </h4>
              <div className="ml-4 sm:ml-6 space-y-1">
                {supportingKeywords.map(kw => (
                  <KeywordItem key={kw.id} keyword={kw} type="supporting" />
                ))}
              </div>
            </div>
          )}

          {/* Cluster Keywords */}
          {clusterKeywords.length > 0 && (
            <div className="space-y-1.5 sm:space-y-2">
              <h4 className="text-xs sm:text-sm font-medium flex items-center gap-1.5 sm:gap-2">
                <GitBranch className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-500" />
                Cluster Keywords ({clusterKeywords.length})
              </h4>
              <div className="ml-4 sm:ml-6 space-y-1">
                {clusterKeywords.map(kw => (
                  <KeywordItem key={kw.id} keyword={kw} type="cluster" />
                ))}
              </div>
            </div>
          )}

          {/* No sub-keywords */}
          {supportingKeywords.length === 0 && clusterKeywords.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No supporting or cluster keywords found for this pillar
            </p>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}

// ============================================
// KEYWORD ITEM
// ============================================

interface KeywordItemProps {
  keyword: ProjectKeyword
  type: "supporting" | "cluster"
}

function KeywordItem({ keyword, type }: KeywordItemProps) {
  const colorClasses = type === "supporting"
    ? "border-l-blue-500 bg-blue-50/50 dark:bg-blue-950/20"
    : "border-l-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20"

  return (
    <div className={cn(
      "flex flex-col sm:flex-row sm:items-center sm:justify-between px-2 sm:px-3 py-1.5 sm:py-2 rounded border-l-2 gap-1 sm:gap-0",
      colorClasses
    )}>
      <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
        <CircleDot className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-muted-foreground shrink-0" />
        <span className="text-xs sm:text-sm truncate">{keyword.keyword}</span>
        {keyword.confidenceScore && (
          <Badge variant="outline" className="text-[9px] sm:text-[10px] py-0 shrink-0">
            {Math.round(keyword.confidenceScore)}%
          </Badge>
        )}
      </div>
      <div className="flex items-center gap-2 sm:gap-4 text-[10px] sm:text-xs text-muted-foreground ml-4 sm:ml-0">
        <span>Vol: {keyword.volume?.toLocaleString() || "-"}</span>
        <span className={cn(
          (keyword.kd || 0) >= 60 ? "text-red-500" :
          (keyword.kd || 0) >= 40 ? "text-orange-500" :
          "text-green-500"
        )}>
          KD: {keyword.kd ?? "-"}
        </span>
      </div>
    </div>
  )
}

export default ClusterResults
