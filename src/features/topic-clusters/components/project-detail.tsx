"use client"

// ============================================
// PROJECT DETAIL COMPONENT
// ============================================
// Shows keywords table and clustering controls

import { useState, useMemo } from "react"
import { TopicProject, ProjectKeyword, KeywordType } from "../types/project.types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  ArrowLeft,
  Plus,
  Search,
  Sparkles,
  Trash2,
  MoreVertical,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Loader2,
  Target,
  FileText,
  Layers,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertCircle
} from "lucide-react"
import { cn } from "@/lib/utils"

interface ProjectDetailProps {
  project: TopicProject
  selectedKeywordIds: string[]
  onBack: () => void
  onAddKeywords: () => void
  onRemoveKeywords: (keywordIds: string[]) => void
  onToggleKeyword: (keywordId: string) => void
  onSelectAll: (keywordIds: string[]) => void
  onClearSelection: () => void
  onGenerateClusters: () => Promise<void>
  onViewClusters: () => void
  isGenerating: boolean
}

// Sort configuration
type SortField = "keyword" | "volume" | "kd" | "cpc" | "wordCount"
type SortDirection = "asc" | "desc"

export function ProjectDetail({
  project,
  selectedKeywordIds,
  onBack,
  onAddKeywords,
  onRemoveKeywords,
  onToggleKeyword,
  onSelectAll,
  onClearSelection,
  onGenerateClusters,
  onViewClusters,
  isGenerating
}: ProjectDetailProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [sortField, setSortField] = useState<SortField>("volume")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")

  // Filter and sort keywords
  const filteredKeywords = useMemo(() => {
    let keywords = [...project.keywords]

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      keywords = keywords.filter(kw =>
        kw.keyword.toLowerCase().includes(query)
      )
    }

    // Sort
    keywords.sort((a, b) => {
      let aVal: number | string = 0
      let bVal: number | string = 0

      switch (sortField) {
        case "keyword":
          aVal = a.keyword.toLowerCase()
          bVal = b.keyword.toLowerCase()
          break
        case "volume":
          aVal = a.volume || 0
          bVal = b.volume || 0
          break
        case "kd":
          aVal = a.kd || 0
          bVal = b.kd || 0
          break
        case "cpc":
          aVal = a.cpc || 0
          bVal = b.cpc || 0
          break
        case "wordCount":
          aVal = a.wordCount
          bVal = b.wordCount
          break
      }

      if (typeof aVal === "string") {
        return sortDirection === "asc"
          ? aVal.localeCompare(bVal as string)
          : (bVal as string).localeCompare(aVal)
      }

      return sortDirection === "asc" 
        ? (aVal as number) - (bVal as number) 
        : (bVal as number) - (aVal as number)
    })

    return keywords
  }, [project.keywords, searchQuery, sortField, sortDirection])

  // Handle sort
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(d => d === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("desc")
    }
  }

  // Get sort icon
  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="h-4 w-4 ml-1 text-muted-foreground" />
    return sortDirection === "asc"
      ? <ArrowUp className="h-4 w-4 ml-1" />
      : <ArrowDown className="h-4 w-4 ml-1" />
  }

  // All selected
  const allSelected = filteredKeywords.length > 0 &&
    filteredKeywords.every(kw => selectedKeywordIds.includes(kw.id))

  // Handle select all toggle
  const handleSelectAll = () => {
    if (allSelected) {
      onClearSelection()
    } else {
      onSelectAll(filteredKeywords.map(kw => kw.id))
    }
  }

  // Can generate clusters
  const canGenerate = project.keywords.length >= 5

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <div className="space-y-1 w-full sm:w-auto">
          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="ghost" size="icon" onClick={onBack} className="h-8 w-8 shrink-0">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-lg sm:text-xl font-semibold truncate">{project.name}</h2>
            <Badge variant={project.status === "clustered" ? "default" : "secondary"} className="shrink-0">
              {project.status === "clustered" ? "Clustered" : "Draft"}
            </Badge>
          </div>
          {project.description && (
            <p className="text-muted-foreground text-xs sm:text-sm ml-10 line-clamp-2">{project.description}</p>
          )}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* View Clusters Button (if clustered) */}
          {project.status === "clustered" && (
            <Button variant="outline" onClick={onViewClusters} size="sm" className="flex-1 sm:flex-none">
              <Layers className="h-4 w-4 mr-1 sm:mr-2" />
              <span className="hidden xs:inline">View</span> Clusters
            </Button>
          )}

          {/* Generate Clusters Button */}
          <Button
            onClick={onGenerateClusters}
            disabled={!canGenerate || isGenerating}
            className="bg-linear-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 flex-1 sm:flex-none"
            size="sm"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-1 sm:mr-2 animate-spin" />
                <span className="hidden sm:inline">Generating...</span>
                <span className="sm:hidden">...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Generate Clusters</span>
                <span className="sm:hidden">Generate</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
        <StatCard
          title="Keywords"
          value={project.keywordCount}
          icon={FileText}
        />
        <StatCard
          title="Total Volume"
          value={project.totalVolume >= 1000 ? `${(project.totalVolume / 1000).toFixed(1)}K` : project.totalVolume}
          icon={TrendingUp}
        />
        <StatCard
          title="Avg KD"
          value={project.avgKd}
          icon={Target}
          valueColor={
            project.avgKd >= 60 ? "text-red-500" :
            project.avgKd >= 40 ? "text-orange-500" :
            "text-green-500"
          }
        />
        <StatCard
          title="Pillars"
          value={project.pillars.length}
          icon={Layers}
          valueColor="text-primary"
        />
      </div>

      {/* Minimum Keywords Warning */}
      {project.keywords.length < 5 && (
        <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg px-4 py-3">
          <AlertCircle className="h-4 w-4" />
          <span>Add at least <strong>5 keywords</strong> to generate clusters (currently {project.keywords.length})</span>
        </div>
      )}

      {/* Keywords Table */}
      <Card>
        <CardHeader className="pb-3 px-3 sm:px-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <CardTitle className="text-sm sm:text-base">Keywords ({filteredKeywords.length})</CardTitle>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
              {/* Search */}
              <div className="relative flex-1 sm:flex-none">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search keywords..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-full sm:w-[200px] h-9 text-sm"
                />
              </div>

              <div className="flex items-center gap-2">
                {/* Bulk Delete */}
                {selectedKeywordIds.length > 0 && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onRemoveKeywords(selectedKeywordIds)}
                    className="flex-1 sm:flex-none"
                  >
                    <Trash2 className="h-4 w-4 sm:mr-1" />
                    <span className="hidden sm:inline">Delete</span> ({selectedKeywordIds.length})
                  </Button>
                )}

                {/* Add Keywords */}
                <Button onClick={onAddKeywords} size="sm" className="flex-1 sm:flex-none">
                  <Plus className="h-4 w-4 sm:mr-1" />
                  <span className="hidden sm:inline">Add Keywords</span>
                  <span className="sm:hidden">Add</span>
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {/* Mobile Card View */}
          <div className="block sm:hidden px-3 pb-3 space-y-2">
            {filteredKeywords.length === 0 ? (
              <p className="text-muted-foreground text-center py-8 text-sm">
                {searchQuery ? "No keywords match your search" : "No keywords yet. Add some keywords to get started!"}
              </p>
            ) : (
              filteredKeywords.map((keyword) => (
                <MobileKeywordCard
                  key={keyword.id}
                  keyword={keyword}
                  isSelected={selectedKeywordIds.includes(keyword.id)}
                  onToggle={() => onToggleKeyword(keyword.id)}
                  onDelete={() => onRemoveKeywords([keyword.id])}
                />
              ))
            )}
          </div>

          {/* Desktop Table View */}
          <div className="hidden sm:block border rounded-lg overflow-hidden mx-3 sm:mx-4 mb-3 sm:mb-4 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-[40px]">
                    <Checkbox
                      checked={allSelected}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-muted/80"
                    onClick={() => handleSort("keyword")}
                  >
                    <div className="flex items-center">
                      Keyword
                      <SortIcon field="keyword" />
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-muted/80 text-right w-[100px]"
                    onClick={() => handleSort("volume")}
                  >
                    <div className="flex items-center justify-end">
                      Volume
                      <SortIcon field="volume" />
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-muted/80 text-right w-[80px]"
                    onClick={() => handleSort("kd")}
                  >
                    <div className="flex items-center justify-end">
                      KD
                      <SortIcon field="kd" />
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-muted/80 text-right w-[80px] hidden md:table-cell"
                    onClick={() => handleSort("cpc")}
                  >
                    <div className="flex items-center justify-end">
                      CPC
                      <SortIcon field="cpc" />
                    </div>
                  </TableHead>
                  <TableHead className="text-center w-[100px] hidden lg:table-cell">Intent</TableHead>
                  <TableHead className="text-center w-[80px] hidden lg:table-cell">Trend</TableHead>
                  <TableHead className="w-[40px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredKeywords.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <p className="text-muted-foreground">
                        {searchQuery ? "No keywords match your search" : "No keywords yet. Add some keywords to get started!"}
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredKeywords.map((keyword) => (
                    <KeywordRow
                      key={keyword.id}
                      keyword={keyword}
                      isSelected={selectedKeywordIds.includes(keyword.id)}
                      onToggle={() => onToggleKeyword(keyword.id)}
                      onDelete={() => onRemoveKeywords([keyword.id])}
                    />
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ============================================
// STAT CARD COMPONENT
// ============================================

interface StatCardProps {
  title: string
  value: string | number
  icon: React.ElementType
  valueColor?: string
}

function StatCard({ title, value, icon: Icon, valueColor }: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider truncate">{title}</p>
            <p className={cn("text-lg sm:text-2xl font-bold mt-0.5 sm:mt-1", valueColor)}>{value}</p>
          </div>
          <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
            <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ============================================
// MOBILE KEYWORD CARD COMPONENT
// ============================================

interface MobileKeywordCardProps {
  keyword: ProjectKeyword
  isSelected: boolean
  onToggle: () => void
  onDelete: () => void
}

function MobileKeywordCard({ keyword, isSelected, onToggle, onDelete }: MobileKeywordCardProps) {
  return (
    <div className={cn(
      "border rounded-lg p-3 transition-colors",
      isSelected && "border-primary bg-primary/5"
    )}>
      <div className="flex items-start gap-3">
        <Checkbox
          checked={isSelected}
          onCheckedChange={onToggle}
          className="mt-0.5"
        />
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{keyword.keyword}</p>
              <div className="flex items-center gap-2 mt-1">
                {keyword.keywordType && (
                  <Badge variant="outline" className={cn("text-[10px]",
                    keyword.keywordType === "pillar" && "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
                    keyword.keywordType === "supporting" && "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
                    keyword.keywordType === "cluster" && "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                  )}>
                    {keyword.keywordType}
                  </Badge>
                )}
                {keyword.intent && (
                  <Badge variant="outline" className="text-[10px]">
                    {keyword.intent}
                  </Badge>
                )}
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
              onClick={onDelete}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="bg-muted/50 rounded px-2 py-1.5">
              <span className="text-muted-foreground">Vol:</span>{" "}
              <span className="font-medium">{keyword.volume?.toLocaleString() || "-"}</span>
            </div>
            <div className="bg-muted/50 rounded px-2 py-1.5">
              <span className="text-muted-foreground">KD:</span>{" "}
              <span className={cn("font-medium",
                (keyword.kd || 0) >= 60 ? "text-red-500" :
                (keyword.kd || 0) >= 40 ? "text-orange-500" :
                "text-green-500"
              )}>{keyword.kd || "-"}</span>
            </div>
            <div className="bg-muted/50 rounded px-2 py-1.5">
              <span className="text-muted-foreground">CPC:</span>{" "}
              <span className="font-medium">${keyword.cpc?.toFixed(2) || "-"}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================
// KEYWORD ROW COMPONENT
// ============================================

interface KeywordRowProps {
  keyword: ProjectKeyword
  isSelected: boolean
  onToggle: () => void
  onDelete: () => void
}

function KeywordRow({ keyword, isSelected, onToggle, onDelete }: KeywordRowProps) {
  // Type badge config
  const getTypeBadge = (type: KeywordType | null) => {
    if (!type) return null

    const config = {
      pillar: {
        label: "Pillar",
        className: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400"
      },
      supporting: {
        label: "Supporting",
        className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
      },
      cluster: {
        label: "Cluster",
        className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
      }
    }

    const c = config[type]
    return (
      <Badge variant="outline" className={cn("text-[10px] ml-2", c.className)}>
        {c.label}
      </Badge>
    )
  }

  // Intent badge
  const getIntentBadge = (intent: string | null) => {
    if (!intent) return <span className="text-muted-foreground">-</span>

    const colors: Record<string, string> = {
      informational: "bg-blue-100 text-blue-700",
      commercial: "bg-green-100 text-green-700",
      transactional: "bg-purple-100 text-purple-700",
      navigational: "bg-orange-100 text-orange-700"
    }

    return (
      <Badge variant="outline" className={cn("text-[10px]", colors[intent.toLowerCase()] || "")}>
        {intent.charAt(0).toUpperCase()}
      </Badge>
    )
  }

  // Trend icon
  const TrendIcon = () => {
    const trend = keyword.trend
    if (!trend) return <Minus className="h-4 w-4 text-muted-foreground" />
    if (trend === "up") return <TrendingUp className="h-4 w-4 text-green-500" />
    if (trend === "down") return <TrendingDown className="h-4 w-4 text-red-500" />
    return <Minus className="h-4 w-4 text-muted-foreground" />
  }

  // KD color
  const getKdColor = (kd: number | null) => {
    if (kd === null) return ""
    if (kd >= 60) return "text-red-500"
    if (kd >= 40) return "text-orange-500"
    return "text-green-500"
  }

  return (
    <TableRow className={cn(isSelected && "bg-muted/50")}>
      <TableCell>
        <Checkbox
          checked={isSelected}
          onCheckedChange={onToggle}
        />
      </TableCell>
      <TableCell>
        <div className="flex items-center">
          <span className="font-medium">{keyword.keyword}</span>
          {getTypeBadge(keyword.keywordType)}
        </div>
        {keyword.source && (
          <span className="text-xs text-muted-foreground">
            via {keyword.source}
            {keyword.sourceTag && ` • ${keyword.sourceTag}`}
          </span>
        )}
      </TableCell>
      <TableCell className="text-right font-medium">
        {keyword.volume?.toLocaleString() || "-"}
      </TableCell>
      <TableCell className={cn("text-right font-medium", getKdColor(keyword.kd))}>
        {keyword.kd ?? "-"}
      </TableCell>
      <TableCell className="text-right">
        {keyword.cpc ? `$${keyword.cpc.toFixed(2)}` : "-"}
      </TableCell>
      <TableCell className="text-center">
        {getIntentBadge(keyword.intent)}
      </TableCell>
      <TableCell className="text-center">
        <div className="flex items-center justify-center">
          <TrendIcon />
          {keyword.trendPercent && (
            <span className={cn(
              "text-xs ml-1",
              keyword.trendPercent > 0 ? "text-green-500" : "text-red-500"
            )}>
              {keyword.trendPercent > 0 ? "+" : ""}{keyword.trendPercent}%
            </span>
          )}
        </div>
      </TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onDelete} className="text-destructive">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  )
}

export default ProjectDetail
