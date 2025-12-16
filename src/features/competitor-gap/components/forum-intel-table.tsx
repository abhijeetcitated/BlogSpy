"use client"

import { useCallback } from "react"
import {
  Star,
  MoreHorizontal,
  Pencil,
  CalendarPlus,
  ExternalLink,
  Key,
  ArrowUp,
  MessageCircle,
  ChevronUp,
  ChevronDown,
  Copy,
  Users,
  FileText,
  Flame,
  Sparkles,
  Globe,
  HelpCircle,
  Code,
  Newspaper,
  Youtube,
  CheckCircle,
  AlertTriangle,
  XCircle,
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import type { ForumIntelPost, SortField, SortDirection, ForumSource, CompetitionLevel, RelatedKeyword } from "../types"

// ============================================
// Props Interface
// ============================================

interface ForumIntelTableProps {
  posts: ForumIntelPost[]
  selectedRows: Set<string>
  sortField: SortField
  sortDirection: SortDirection
  onSort: (field: SortField) => void
  onSelectAll: (checked: boolean) => void
  onSelectRow: (id: string, checked: boolean) => void
  onWriteArticle?: (post: ForumIntelPost) => void
  onAddToCalendar?: (post: ForumIntelPost) => void
}

// ============================================
// Constants with Lucide Icons
// ============================================

const SOURCE_CONFIG: Record<ForumSource, { 
  icon: typeof Globe
  label: string
  fullName: string
  color: string
  bg: string
  border: string 
}> = {
  reddit: { 
    icon: Globe, 
    label: "Reddit", 
    fullName: "Reddit Community",
    color: "text-orange-600 dark:text-orange-400", 
    bg: "bg-orange-500/10 dark:bg-orange-500/15",
    border: "border-orange-500/30"
  },
  quora: { 
    icon: HelpCircle, 
    label: "Quora", 
    fullName: "Quora Q&A",
    color: "text-red-600 dark:text-red-400", 
    bg: "bg-red-500/10 dark:bg-red-500/15",
    border: "border-red-500/30"
  },
  stackoverflow: { 
    icon: Code, 
    label: "Stack Overflow", 
    fullName: "Stack Overflow",
    color: "text-amber-600 dark:text-amber-400", 
    bg: "bg-amber-500/10 dark:bg-amber-500/15",
    border: "border-amber-500/30"
  },
  hackernews: { 
    icon: Newspaper, 
    label: "Hacker News", 
    fullName: "Hacker News",
    color: "text-orange-600 dark:text-orange-400", 
    bg: "bg-orange-500/10 dark:bg-orange-500/15",
    border: "border-orange-500/30"
  },
  youtube: { 
    icon: Youtube, 
    label: "YouTube", 
    fullName: "YouTube Comments",
    color: "text-red-600 dark:text-red-400", 
    bg: "bg-red-500/10 dark:bg-red-500/15",
    border: "border-red-500/30"
  },
}

const COMPETITION_CONFIG: Record<CompetitionLevel, { 
  icon: typeof CheckCircle
  label: string
  color: string
  bg: string
  border: string 
}> = {
  low: { 
    icon: CheckCircle, 
    label: "Low", 
    color: "text-emerald-600 dark:text-emerald-400", 
    bg: "bg-emerald-500/10 dark:bg-emerald-500/15",
    border: "border-emerald-500/30"
  },
  medium: { 
    icon: AlertTriangle, 
    label: "Medium", 
    color: "text-yellow-600 dark:text-yellow-400", 
    bg: "bg-yellow-500/10 dark:bg-yellow-500/15",
    border: "border-yellow-500/30"
  },
  high: { 
    icon: XCircle, 
    label: "High", 
    color: "text-red-600 dark:text-red-400", 
    bg: "bg-red-500/10 dark:bg-red-500/15",
    border: "border-red-500/30"
  },
}

// ============================================
// Sub Components
// ============================================

function SourceBadge({ source, subSource }: { source: ForumSource, subSource: string }) {
  const config = SOURCE_CONFIG[source]
  const Icon = config.icon

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className={cn(
          "flex flex-col items-center gap-1 px-3 py-2 rounded-lg border cursor-default",
          config.bg, config.border
        )}>
          <div className="flex items-center gap-1.5">
            <Icon className={cn("w-3.5 h-3.5", config.color)} />
            <span className={cn("text-xs font-semibold", config.color)}>{config.label}</span>
          </div>
          <span className="text-[10px] text-muted-foreground truncate max-w-20">
            {subSource}
          </span>
        </div>
      </TooltipTrigger>
      <TooltipContent className="text-xs">
        {source === "reddit" && `r/${subSource}`}
        {source === "quora" && `Topic: ${subSource}`}
        {source === "stackoverflow" && `Tag: ${subSource}`}
        {source === "hackernews" && `Category: ${subSource}`}
        {source === "youtube" && `Channel: ${subSource}`}
      </TooltipContent>
    </Tooltip>
  )
}

function EngagementDisplay({ upvotes, comments }: { upvotes: number, comments: number }) {
  const formatNumber = (n: number) => {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
    return n.toString()
  }

  const totalEngagement = upvotes + comments
  const isHot = totalEngagement > 1000

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="flex items-center gap-3">
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={cn(
              "flex items-center gap-1 px-2 py-1 rounded-md border",
              isHot 
                ? "bg-amber-500/10 dark:bg-amber-500/15 border-amber-500/30" 
                : "bg-muted border-border"
            )}>
              <ArrowUp className={cn("w-3.5 h-3.5", isHot ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground")} />
              <span className={cn("text-xs font-bold tabular-nums", isHot ? "text-amber-600 dark:text-amber-400" : "text-foreground")}>
                {formatNumber(upvotes)}
              </span>
            </div>
          </TooltipTrigger>
          <TooltipContent className="text-xs">Upvotes</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-blue-500/10 dark:bg-blue-500/15 border border-blue-500/30">
              <MessageCircle className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span className="text-xs font-bold tabular-nums text-blue-600 dark:text-blue-400">
                {formatNumber(comments)}
              </span>
            </div>
          </TooltipTrigger>
          <TooltipContent className="text-xs">Comments</TooltipContent>
        </Tooltip>
      </div>
      {isHot && (
        <div className="flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400">
          <Flame className="w-3 h-3" />
          <span>Hot topic</span>
        </div>
      )}
    </div>
  )
}

function CompetitionBadge({ level, articles }: { level: CompetitionLevel, articles: number }) {
  const config = COMPETITION_CONFIG[level]
  const Icon = config.icon
  
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className={cn(
          "flex flex-col items-center gap-1 px-3 py-2 rounded-lg border cursor-default",
          config.bg, config.border
        )}>
          <div className="flex items-center gap-1.5">
            <Icon className={cn("w-3.5 h-3.5", config.color)} />
            <span className={cn("text-xs font-semibold", config.color)}>{config.label}</span>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <FileText className="w-3 h-3" />
            <span>{articles} article{articles !== 1 ? "s" : ""}</span>
          </div>
        </div>
      </TooltipTrigger>
      <TooltipContent className="text-xs">
        {level === "low" && "Few competing articles - great opportunity!"}
        {level === "medium" && "Moderate competition"}
        {level === "high" && "Many competing articles"}
      </TooltipContent>
    </Tooltip>
  )
}

function OpportunityScore({ score }: { score: number }) {
  const starCount = Math.ceil(score / 20)
  
  const getConfig = () => {
    if (score >= 80) return { 
      color: "text-emerald-600 dark:text-emerald-400", 
      label: "Excellent",
      bg: "bg-emerald-500/10 dark:bg-emerald-500/15",
      border: "border-emerald-500/30"
    }
    if (score >= 60) return { 
      color: "text-green-600 dark:text-green-400", 
      label: "Good",
      bg: "bg-green-500/10 dark:bg-green-500/15",
      border: "border-green-500/30"
    }
    if (score >= 40) return { 
      color: "text-yellow-600 dark:text-yellow-400", 
      label: "Fair",
      bg: "bg-yellow-500/10 dark:bg-yellow-500/15",
      border: "border-yellow-500/30"
    }
    return { 
      color: "text-red-600 dark:text-red-400", 
      label: "Low",
      bg: "bg-red-500/10 dark:bg-red-500/15",
      border: "border-red-500/30"
    }
  }
  const config = getConfig()

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className={cn(
          "flex flex-col items-center gap-1 px-3 py-2 rounded-lg border cursor-default",
          config.bg, config.border
        )}>
          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={cn(
                  "w-3.5 h-3.5 transition-all",
                  star <= starCount
                    ? "text-amber-500 fill-amber-500"
                    : "text-muted-foreground/30"
                )}
              />
            ))}
          </div>
          <span className={cn("text-xs font-bold tabular-nums", config.color)}>
            {score}/100
          </span>
        </div>
      </TooltipTrigger>
      <TooltipContent className="text-xs">
        {config.label} opportunity
      </TooltipContent>
    </Tooltip>
  )
}

function RelatedKeywordsButton({ keywords, onCopyAll }: { keywords: RelatedKeyword[], onCopyAll: () => void }) {
  if (!keywords.length) return <div className="w-8" />

  const formatVolume = (vol: number) => {
    if (vol >= 1000) return `${(vol / 1000).toFixed(1)}K`
    return vol.toString()
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 w-8 p-0 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20"
        >
          <Key className="w-4 h-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="left" className="max-w-xs p-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-emerald-500/15">
              <Key className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <span className="font-semibold text-sm text-emerald-600 dark:text-emerald-400">Related Keywords</span>
          </div>
          <div className="space-y-1.5">
            {keywords.slice(0, 5).map((kw, i) => (
              <div key={i} className="flex items-center justify-between text-xs bg-muted rounded-md px-2 py-1.5">
                <span className="text-foreground font-medium">{kw.keyword}</span>
                <span className="text-muted-foreground ml-3 text-[10px]">
                  {formatVolume(kw.volume)}
                </span>
              </div>
            ))}
          </div>
          <Button 
            size="sm" 
            className="w-full h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
            onClick={onCopyAll}
          >
            <Copy className="w-3 h-3 mr-1.5" />
            Copy All Keywords
          </Button>
        </div>
      </TooltipContent>
    </Tooltip>
  )
}

function ActionsDropdown({ 
  post,
  onWrite,
  onAddToCalendar,
  onViewSource,
}: { 
  post: ForumIntelPost
  onWrite: () => void
  onAddToCalendar: () => void
  onViewSource: () => void
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 w-8 p-0 rounded-lg hover:bg-muted"
        >
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem onClick={onWrite} className="text-emerald-600 dark:text-emerald-400">
          <Pencil className="w-4 h-4 mr-2.5" />
          Write Article
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onAddToCalendar}>
          <CalendarPlus className="w-4 h-4 mr-2.5" />
          Add to Content Calendar
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onViewSource}>
          <ExternalLink className="w-4 h-4 mr-2.5" />
          View Original Discussion
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function SortHeader({ 
  label, 
  field, 
  currentField, 
  direction, 
  onSort,
  className 
}: { 
  label: string
  field: SortField
  currentField: SortField
  direction: SortDirection
  onSort: (field: SortField) => void
  className?: string
}) {
  const isActive = currentField === field
  
  return (
    <button
      onClick={() => onSort(field)}
      className={cn(
        "flex items-center gap-1.5 text-xs font-semibold transition-colors group",
        isActive ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground hover:text-foreground",
        className
      )}
    >
      {label}
      <div className={cn(
        "flex flex-col items-center justify-center w-4 h-4",
        isActive ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground/50 group-hover:text-muted-foreground"
      )}>
        {isActive ? (
          direction === "asc" ? 
            <ChevronUp className="w-4 h-4" /> : 
            <ChevronDown className="w-4 h-4" />
        ) : (
          <>
            <ChevronUp className="w-3 h-3 -mb-1" />
            <ChevronDown className="w-3 h-3 -mt-1" />
          </>
        )}
      </div>
    </button>
  )
}

// ============================================
// Main Component
// ============================================

export function ForumIntelTable({
  posts,
  selectedRows,
  sortField,
  sortDirection,
  onSort,
  onSelectAll,
  onSelectRow,
  onWriteArticle,
  onAddToCalendar,
}: ForumIntelTableProps) {
  
  const allSelected = posts.length > 0 && selectedRows.size === posts.length

  const handleWrite = useCallback((post: ForumIntelPost) => {
    if (onWriteArticle) {
      onWriteArticle(post)
    } else {
      console.log("Write article for:", post.topic)
    }
  }, [onWriteArticle])

  const handleAddToCalendar = useCallback((post: ForumIntelPost) => {
    if (onAddToCalendar) {
      onAddToCalendar(post)
    } else {
      console.log("Add to calendar:", post.topic)
    }
  }, [onAddToCalendar])

  const copyAllKeywords = (keywords: RelatedKeyword[]) => {
    const text = keywords.map(k => k.keyword).join("\n")
    navigator.clipboard.writeText(text)
    toast.success("✓ Copied to Clipboard", {
      description: `${keywords.length} keywords copied`,
      duration: 2000,
    })
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Bulk Actions Bar */}
      {selectedRows.size > 0 && (
        <div className="px-6 py-3 bg-emerald-500/5 dark:bg-emerald-500/10 border-b border-emerald-500/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center">
              <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{selectedRows.size}</span>
            </div>
            <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
              topic{selectedRows.size > 1 ? "s" : ""} selected
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <CalendarPlus className="w-3.5 h-3.5 mr-1.5" />
              Add to Calendar
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 text-xs"
              onClick={() => onSelectAll(false)}
            >
              Clear
            </Button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full">
          {/* Header */}
          <thead className="sticky top-0 z-10">
            <tr className="bg-background border-b border-border">
              <th className="w-12 px-4 py-4">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={(checked) => onSelectAll(!!checked)}
                  className="border-emerald-500/50 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                />
              </th>
              <th className="px-4 py-4 text-left">
                <span className="text-xs font-semibold text-muted-foreground">Topic / Question</span>
              </th>
              <th className="w-28 px-4 py-4 text-center">
                <span className="text-xs font-semibold text-muted-foreground">Source</span>
              </th>
              <th className="w-32 px-4 py-4">
                <SortHeader
                  label="Engagement"
                  field="engagement"
                  currentField={sortField}
                  direction={sortDirection}
                  onSort={onSort}
                  className="justify-center"
                />
              </th>
              <th className="w-28 px-4 py-4 text-center">
                <span className="text-xs font-semibold text-muted-foreground">Competition</span>
              </th>
              <th className="w-28 px-4 py-4">
                <SortHeader
                  label="Opportunity"
                  field="opportunity"
                  currentField={sortField}
                  direction={sortDirection}
                  onSort={onSort}
                  className="justify-center"
                />
              </th>
              <th className="w-28 px-4 py-4 text-center">
                <span className="text-xs font-semibold text-muted-foreground">Actions</span>
              </th>
            </tr>
          </thead>

          {/* Body */}
          <tbody className="divide-y divide-border">
            {posts.map((post) => (
              <tr
                key={post.id}
                className={cn(
                  "group transition-all duration-150",
                  selectedRows.has(post.id) 
                    ? "bg-emerald-500/5 dark:bg-emerald-500/10" 
                    : "hover:bg-muted/50"
                )}
              >
                {/* Checkbox */}
                <td className="px-4 py-4">
                  <Checkbox
                    checked={selectedRows.has(post.id)}
                    onCheckedChange={(checked) => onSelectRow(post.id, !!checked)}
                    className="border-emerald-500/50 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                  />
                </td>

                {/* Topic */}
                <td className="px-4 py-4">
                  <div className="max-w-md">
                    <span className="text-sm font-medium text-foreground line-clamp-2">
                      {post.topic}
                    </span>
                    {post.opportunityLevel === "high" && (
                      <div className="flex items-center gap-1 mt-1.5 text-[10px] text-emerald-600 dark:text-emerald-400">
                        <Sparkles className="w-3 h-3" />
                        <span>High opportunity</span>
                      </div>
                    )}
                  </div>
                </td>

                {/* Source */}
                <td className="px-4 py-4">
                  <div className="flex justify-center">
                    <SourceBadge source={post.source} subSource={post.subSource} />
                  </div>
                </td>

                {/* Engagement */}
                <td className="px-4 py-4">
                  <div className="flex justify-center">
                    <EngagementDisplay upvotes={post.upvotes} comments={post.comments} />
                  </div>
                </td>

                {/* Competition */}
                <td className="px-4 py-4">
                  <div className="flex justify-center">
                    <CompetitionBadge 
                      level={post.competitionLevel} 
                      articles={post.existingArticles} 
                    />
                  </div>
                </td>

                {/* Opportunity */}
                <td className="px-4 py-4">
                  <div className="flex justify-center">
                    <OpportunityScore score={post.opportunityScore} />
                  </div>
                </td>

                {/* Actions */}
                <td className="px-4 py-4">
                  <div className="flex items-center justify-center gap-1">
                    <RelatedKeywordsButton 
                      keywords={post.relatedKeywords}
                      onCopyAll={() => copyAllKeywords(post.relatedKeywords)}
                    />
                    <ActionsDropdown
                      post={post}
                      onWrite={() => handleWrite(post)}
                      onAddToCalendar={() => handleAddToCalendar(post)}
                      onViewSource={() => window.open(post.url, "_blank")}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Empty State */}
        {posts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="p-4 rounded-2xl bg-muted border border-border mb-4">
              <Users className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-foreground text-sm font-medium">No forum discussions found</p>
            <p className="text-muted-foreground text-xs mt-1">Try searching for a different topic</p>
          </div>
        )}
      </div>
    </div>
  )
}
