// ============================================
// AI WRITER - NLP Terms Panel Component
// ============================================
// Feature #1: Production-ready NLP term suggestions
// Industry-standard Surfer SEO style panel
// ============================================

"use client"

import { useState, useMemo, useCallback } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  Target,
  Sparkles,
  Lightbulb,
  AlertTriangle,
  Search,
  ChevronDown,
  ChevronRight,
  Check,
  X,
  Minus,
  TrendingUp,
  Eye,
  EyeOff,
  RotateCcw,
  Zap,
  Info,
  Plus
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { 
  NLPTerm, 
  NLPTermCategory, 
  NLPOptimizationScore, 
  NLPTermStatus,
  NLPTermPriority 
} from "../types/nlp-terms.types"
import {
  getStatusColor,
  getPriorityColor,
  getPriorityBadge,
  groupTermsByCategory
} from "../utils/nlp-analysis"

// ============================================
// COMPONENT PROPS
// ============================================

interface NLPTermsPanelProps {
  terms: NLPTerm[]
  score: NLPOptimizationScore
  onTermClick?: (term: NLPTerm) => void
  onAddTermToContent?: (term: NLPTerm) => void
  onHighlightToggle?: (termId: string) => void
  onRefresh?: () => void
  isAnalyzing?: boolean
  className?: string
}

// ============================================
// HELPER COMPONENTS
// ============================================

/**
 * Score display component
 */
function NLPScoreDisplay({ score }: { score: NLPOptimizationScore }) {
  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A': return 'text-emerald-400 bg-emerald-500/20 border-emerald-500/40'
      case 'B': return 'text-blue-400 bg-blue-500/20 border-blue-500/40'
      case 'C': return 'text-amber-400 bg-amber-500/20 border-amber-500/40'
      case 'D': return 'text-orange-400 bg-orange-500/20 border-orange-500/40'
      case 'F': return 'text-red-400 bg-red-500/20 border-red-500/40'
      default: return 'text-muted-foreground bg-muted'
    }
  }
  
  const getScoreColor = (value: number) => {
    if (value >= 80) return 'bg-emerald-500'
    if (value >= 60) return 'bg-amber-500'
    return 'bg-red-500'
  }
  
  return (
    <div className="p-3 rounded-lg bg-card/50 border border-border">
      {/* Main Score */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg border",
            getGradeColor(score.grade)
          )}>
            {score.grade}
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">NLP Score</p>
            <p className="text-xs text-muted-foreground">{score.score}/100</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-foreground">{score.score}</p>
        </div>
      </div>
      
      {/* Category Breakdown */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Primary Keywords</span>
          <span className="text-foreground font-medium">{score.primaryCompletion}%</span>
        </div>
        <Progress value={score.primaryCompletion} className="h-1.5" />
        
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Secondary Terms</span>
          <span className="text-foreground font-medium">{score.secondaryCompletion}%</span>
        </div>
        <Progress value={score.secondaryCompletion} className="h-1.5" />
        
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Supporting Keywords</span>
          <span className="text-foreground font-medium">{score.supportingCompletion}%</span>
        </div>
        <Progress value={score.supportingCompletion} className="h-1.5" />
      </div>
      
      {/* Warnings */}
      {(score.overusedCount > 0 || score.missingCritical.length > 0) && (
        <div className="mt-3 pt-3 border-t border-border space-y-1">
          {score.overusedCount > 0 && (
            <div className="flex items-center gap-2 text-xs text-amber-400">
              <AlertTriangle className="h-3 w-3" />
              <span>{score.overusedCount} term(s) overused</span>
            </div>
          )}
          {score.missingCritical.length > 0 && (
            <div className="flex items-center gap-2 text-xs text-red-400">
              <X className="h-3 w-3" />
              <span>{score.missingCritical.length} critical term(s) missing</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/**
 * Single term item display
 */
function TermItem({ 
  term, 
  onClick, 
  onAdd,
  onHighlight,
  showDetails = false 
}: { 
  term: NLPTerm
  onClick?: () => void
  onAdd?: () => void
  onHighlight?: () => void
  showDetails?: boolean
}) {
  const statusIcon = useMemo(() => {
    switch (term.status) {
      case 'optimal': return <Check className="h-3 w-3 text-emerald-400" />
      case 'underused': return <Minus className="h-3 w-3 text-amber-400" />
      case 'overused': return <TrendingUp className="h-3 w-3 text-red-400" />
      case 'missing': return <X className="h-3 w-3 text-red-400" />
      default: return null
    }
  }, [term.status])
  
  const usageDisplay = term.priority === 'avoid' 
    ? `${term.currentCount} used`
    : `${term.currentCount}/${term.targetCount}`
  
  const isGood = term.status === 'optimal' || (term.priority === 'avoid' && term.currentCount === 0)
  
  return (
    <div 
      className={cn(
        "group flex items-center gap-2 p-2 rounded-lg transition-all cursor-pointer",
        "hover:bg-muted/50 border border-transparent hover:border-border",
        isGood && "bg-emerald-500/5",
        term.status === 'overused' && "bg-red-500/5",
        term.status === 'missing' && term.priority === 'primary' && "bg-red-500/5"
      )}
      onClick={onClick}
    >
      {/* Status Icon */}
      <div className={cn(
        "w-5 h-5 rounded flex items-center justify-center shrink-0",
        getStatusColor(term.status)
      )}>
        {statusIcon}
      </div>
      
      {/* Term Text */}
      <div className="flex-1 min-w-0">
        <p className={cn(
          "text-sm font-medium truncate",
          isGood ? "text-foreground" : "text-muted-foreground"
        )}>
          {term.term}
        </p>
        {showDetails && term.volume && (
          <p className="text-xs text-muted-foreground">
            Vol: {term.volume.toLocaleString()} | Rel: {term.relevance}%
          </p>
        )}
      </div>
      
      {/* Usage Count */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge 
              variant="outline" 
              className={cn(
                "text-xs font-mono shrink-0",
                getStatusColor(term.status)
              )}
            >
              {usageDisplay}
            </Badge>
          </TooltipTrigger>
          <TooltipContent side="left" className="max-w-[200px]">
            <p className="text-xs">
              {term.priority === 'avoid' 
                ? `Avoid using this term. Currently used ${term.currentCount} times.`
                : `Use ${term.targetCount}-${term.maxCount} times. Currently ${term.currentCount}.`
              }
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      {/* Actions (visible on hover) */}
      <div className="hidden group-hover:flex items-center gap-1">
        {term.status !== 'optimal' && term.priority !== 'avoid' && onAdd && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6"
                  onClick={(e) => { e.stopPropagation(); onAdd() }}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Add to content</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        {onHighlight && term.currentCount > 0 && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6"
                  onClick={(e) => { e.stopPropagation(); onHighlight() }}
                >
                  <Eye className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Show in content</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    </div>
  )
}

/**
 * Category section with collapsible terms list
 */
function CategorySection({ 
  category,
  onTermClick,
  onAddTerm,
  onHighlightTerm,
  defaultOpen = true
}: {
  category: NLPTermCategory
  onTermClick?: (term: NLPTerm) => void
  onAddTerm?: (term: NLPTerm) => void
  onHighlightTerm?: (termId: string) => void
  defaultOpen?: boolean
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  
  const CategoryIcon = useMemo(() => {
    switch (category.icon) {
      case 'Target': return Target
      case 'Sparkles': return Sparkles
      case 'Lightbulb': return Lightbulb
      case 'AlertTriangle': return AlertTriangle
      default: return Target
    }
  }, [category.icon])
  
  const iconColorClass = useMemo(() => {
    switch (category.color) {
      case 'blue': return 'text-blue-400'
      case 'purple': return 'text-purple-400'
      case 'cyan': return 'text-cyan-400'
      case 'red': return 'text-red-400'
      default: return 'text-foreground'
    }
  }, [category.color])
  
  const progressColorClass = useMemo(() => {
    if (category.completionPercentage >= 80) return 'bg-emerald-500'
    if (category.completionPercentage >= 50) return 'bg-amber-500'
    return 'bg-red-500'
  }, [category.completionPercentage])

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="w-full">
        <div className={cn(
          "flex items-center gap-3 p-3 rounded-lg transition-colors",
          "hover:bg-muted/50 cursor-pointer"
        )}>
          {/* Expand Icon */}
          {isOpen ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
          )}
          
          {/* Category Icon */}
          <div className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center",
            `bg-${category.color}-500/10`
          )}>
            <CategoryIcon className={cn("h-4 w-4", iconColorClass)} />
          </div>
          
          {/* Category Info */}
          <div className="flex-1 text-left">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-foreground">{category.name}</p>
              <Badge variant="outline" className="text-xs">
                {category.usedCount}/{category.totalCount}
              </Badge>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Progress 
                value={category.completionPercentage} 
                className="h-1 flex-1" 
              />
              <span className="text-xs text-muted-foreground w-8 text-right">
                {category.completionPercentage}%
              </span>
            </div>
          </div>
        </div>
      </CollapsibleTrigger>
      
      <CollapsibleContent>
        <div className="pl-6 pr-2 pb-2 space-y-1">
          {category.terms.map(term => (
            <TermItem
              key={term.id}
              term={term}
              onClick={() => onTermClick?.(term)}
              onAdd={() => onAddTerm?.(term)}
              onHighlight={() => onHighlightTerm?.(term.id)}
            />
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}

// ============================================
// MAIN COMPONENT
// ============================================

export function NLPTermsPanel({
  terms,
  score,
  onTermClick,
  onAddTermToContent,
  onHighlightToggle,
  onRefresh,
  isAnalyzing = false,
  className
}: NLPTermsPanelProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState<NLPTermStatus | 'all'>('all')
  
  // Filter and group terms
  const filteredTerms = useMemo(() => {
    let filtered = terms
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(t => t.term.toLowerCase().includes(query))
    }
    
    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(t => t.status === filterStatus)
    }
    
    return filtered
  }, [terms, searchQuery, filterStatus])
  
  // Group filtered terms by category
  const categories = useMemo(() => groupTermsByCategory(filteredTerms), [filteredTerms])
  
  // Stats
  const stats = useMemo(() => ({
    total: terms.length,
    optimal: terms.filter(t => t.status === 'optimal').length,
    missing: terms.filter(t => t.status === 'missing').length,
    overused: terms.filter(t => t.status === 'overused').length
  }), [terms])
  
  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Zap className="h-4 w-4 text-amber-400" />
            NLP Term Suggestions
          </h3>
          {onRefresh && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-7 w-7"
              onClick={onRefresh}
              disabled={isAnalyzing}
            >
              <RotateCcw className={cn(
                "h-3.5 w-3.5",
                isAnalyzing && "animate-spin"
              )} />
            </Button>
          )}
        </div>
        
        {/* Score Display */}
        <NLPScoreDisplay score={score} />
      </div>
      
      {/* Search & Filter */}
      <div className="px-4 py-2 border-b border-border space-y-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search terms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8 pl-8 text-sm bg-muted/30 border-border"
          />
        </div>
        
        {/* Quick Filters */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <Badge 
            variant={filterStatus === 'all' ? 'default' : 'outline'}
            className="cursor-pointer text-xs"
            onClick={() => setFilterStatus('all')}
          >
            All ({stats.total})
          </Badge>
          <Badge 
            variant={filterStatus === 'optimal' ? 'default' : 'outline'}
            className={cn(
              "cursor-pointer text-xs",
              filterStatus === 'optimal' && "bg-emerald-500 hover:bg-emerald-600"
            )}
            onClick={() => setFilterStatus('optimal')}
          >
            <Check className="h-3 w-3 mr-1" />
            {stats.optimal}
          </Badge>
          <Badge 
            variant={filterStatus === 'missing' ? 'default' : 'outline'}
            className={cn(
              "cursor-pointer text-xs",
              filterStatus === 'missing' && "bg-red-500 hover:bg-red-600"
            )}
            onClick={() => setFilterStatus('missing')}
          >
            <X className="h-3 w-3 mr-1" />
            {stats.missing}
          </Badge>
          <Badge 
            variant={filterStatus === 'overused' ? 'default' : 'outline'}
            className={cn(
              "cursor-pointer text-xs",
              filterStatus === 'overused' && "bg-amber-500 hover:bg-amber-600"
            )}
            onClick={() => setFilterStatus('overused')}
          >
            <TrendingUp className="h-3 w-3 mr-1" />
            {stats.overused}
          </Badge>
        </div>
      </div>
      
      {/* Terms List */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {categories.length > 0 ? (
            categories.map(category => (
              <CategorySection
                key={category.id}
                category={category}
                onTermClick={onTermClick}
                onAddTerm={onAddTermToContent}
                onHighlightTerm={onHighlightToggle}
                defaultOpen={category.priority === 'primary' || category.priority === 'secondary'}
              />
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Info className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No terms match your filters</p>
            </div>
          )}
        </div>
      </ScrollArea>
      
      {/* Footer with recommendations count */}
      {score.recommendations.length > 0 && (
        <div className="px-4 py-2 border-t border-border bg-muted/30">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              {score.recommendations.filter(r => r.priority === 'high').length} high priority fixes
            </span>
            <Button variant="link" size="sm" className="h-auto p-0 text-xs">
              View all recommendations
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
