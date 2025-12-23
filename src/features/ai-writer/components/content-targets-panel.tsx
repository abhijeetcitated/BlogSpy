// ============================================
// AI WRITER - CONTENT TARGETS PANEL
// ============================================
// Feature #5 & #6: Visual progress bars for
// word count and heading targets
// ============================================

'use client'

import React, { useMemo } from 'react'
import {
  FileText,
  Heading2,
  Heading3,
  Image,
  Link2,
  ExternalLink,
  Target,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  AlertCircle,
  Info,
  ChevronRight
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import type { ContentTargets, TargetProgress, TargetStatus } from '../types/content-targets.types'
import { getAllTargetProgress, getStatusColor, getStatusBgColor } from '../utils/content-targets'

// ============================================
// PROPS
// ============================================

interface ContentTargetsPanelProps {
  targets: ContentTargets
  showCompetitorData?: boolean
  compact?: boolean
  className?: string
}

// ============================================
// HELPER FUNCTIONS
// ============================================

const getStatusIcon = (status: TargetStatus) => {
  switch (status) {
    case 'optimal':
      return <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
    case 'over':
      return <TrendingUp className="h-3.5 w-3.5 text-orange-500" />
    case 'under':
      return <TrendingDown className="h-3.5 w-3.5 text-red-500" />
    case 'approaching':
      return <Target className="h-3.5 w-3.5 text-yellow-500" />
    default:
      return null
  }
}

const formatNumber = (num: number): string => {
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}k`
  }
  return String(num)
}

// ============================================
// SUB-COMPONENTS
// ============================================

interface TargetRowProps {
  icon: React.ReactNode
  label: string
  current: number
  min: number
  optimal: number
  max?: number
  progress: TargetProgress
  competitorAvg?: number
  showCompetitorData?: boolean
  compact?: boolean
}

const TargetRow: React.FC<TargetRowProps> = ({
  icon,
  label,
  current,
  min,
  optimal,
  max,
  progress,
  competitorAvg,
  showCompetitorData = true,
  compact = false
}) => {
  // Calculate progress bar segments
  const percentage = Math.min(progress.percentage, 150)
  const optimalPosition = 100 // Optimal is at 100%
  const currentPosition = Math.min(percentage, 150)
  
  return (
    <div className={cn('space-y-1.5', compact && 'space-y-1')}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">{icon}</span>
          <span className={cn('font-medium', compact ? 'text-xs' : 'text-sm')}>
            {label}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1">
                  <span className={cn(
                    'font-bold',
                    compact ? 'text-xs' : 'text-sm',
                    getStatusColor(progress.status)
                  )}>
                    {formatNumber(current)}
                  </span>
                  <span className="text-muted-foreground text-xs">
                    / {formatNumber(optimal)}
                  </span>
                  {getStatusIcon(progress.status)}
                </div>
              </TooltipTrigger>
              <TooltipContent side="left" className="max-w-[200px]">
                <div className="space-y-1 text-xs">
                  <p>{progress.message}</p>
                  <p className="text-muted-foreground">
                    Min: {min} | Optimal: {optimal} {max ? `| Max: ${max}` : ''}
                  </p>
                  {showCompetitorData && competitorAvg && (
                    <p className="text-muted-foreground">
                      Competitor avg: {competitorAvg}
                    </p>
                  )}
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      
      {/* Progress bar */}
      <div className="relative">
        <div className={cn(
          'h-2 bg-muted/30 rounded-full overflow-hidden',
          compact && 'h-1.5'
        )}>
          {/* Progress fill */}
          <div
            className={cn(
              'h-full rounded-full transition-all duration-300',
              getStatusBgColor(progress.status)
            )}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
          
          {/* Overflow indicator (if over 100%) */}
          {percentage > 100 && (
            <div
              className="absolute top-0 right-0 h-full bg-orange-500/50 rounded-r-full"
              style={{ width: `${Math.min(percentage - 100, 50)}%`, right: 0 }}
            />
          )}
        </div>
        
        {/* Optimal marker */}
        <div
          className="absolute top-0 h-full w-0.5 bg-green-500"
          style={{ left: '80%' }}
        />
        
        {/* Competitor average marker */}
        {showCompetitorData && competitorAvg && competitorAvg !== optimal && (
          <div
            className="absolute top-0 h-full w-0.5 bg-blue-500/50"
            style={{ left: `${Math.min((competitorAvg / optimal) * 80, 120)}%` }}
          />
        )}
      </div>
    </div>
  )
}

// Compact single-line version
const CompactTargetRow: React.FC<{
  label: string
  current: number
  optimal: number
  status: TargetStatus
}> = ({ label, current, optimal, status }) => (
  <div className="flex items-center justify-between py-1">
    <span className="text-xs text-muted-foreground">{label}</span>
    <div className="flex items-center gap-1.5">
      <span className={cn('text-xs font-medium', getStatusColor(status))}>
        {current}
      </span>
      <span className="text-xs text-muted-foreground">/</span>
      <span className="text-xs text-muted-foreground">{optimal}</span>
      {getStatusIcon(status)}
    </div>
  </div>
)

// ============================================
// MAIN COMPONENT
// ============================================

export const ContentTargetsPanel: React.FC<ContentTargetsPanelProps> = ({
  targets,
  showCompetitorData = true,
  compact = false,
  className
}) => {
  const progress = useMemo(() => getAllTargetProgress(targets), [targets])
  
  if (compact) {
    return (
      <div className={cn('space-y-1', className)}>
        {/* Overall progress */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium">Content Targets</span>
          <Badge 
            variant="outline" 
            className={cn('text-[10px] px-1.5', getStatusColor(progress.overall.status))}
          >
            {progress.overall.percentage}%
          </Badge>
        </div>
        
        <CompactTargetRow
          label="Words"
          current={targets.wordCount.current}
          optimal={targets.wordCount.optimal}
          status={progress.wordCount.status}
        />
        <CompactTargetRow
          label="H2"
          current={targets.headings.h2.current}
          optimal={targets.headings.h2.optimal}
          status={progress.h2.status}
        />
        <CompactTargetRow
          label="H3"
          current={targets.headings.h3.current}
          optimal={targets.headings.h3.optimal}
          status={progress.h3.status}
        />
        <CompactTargetRow
          label="Images"
          current={targets.images.current}
          optimal={targets.images.optimal}
          status={progress.images.status}
        />
      </div>
    )
  }
  
  return (
    <div className={cn('space-y-4', className)}>
      {/* Header with overall progress */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Content Targets</h3>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1.5">
                <Progress 
                  value={progress.overall.percentage} 
                  className="w-16 h-2"
                />
                <span className={cn(
                  'text-sm font-bold',
                  getStatusColor(progress.overall.status)
                )}>
                  {progress.overall.percentage}%
                </span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">{progress.overall.message}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      {/* Source indicator */}
      {targets.wordCount.source !== 'default' && (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Info className="h-3 w-3" />
          <span>
            Targets based on {targets.wordCount.source === 'competitor' 
              ? `${targets.basedOnCompetitors} competitors`
              : targets.wordCount.source === 'keyword'
              ? `keyword: "${targets.targetKeyword}"`
              : 'manual settings'}
          </span>
        </div>
      )}
      
      {/* Word Count */}
      <TargetRow
        icon={<FileText className="h-4 w-4" />}
        label="Word Count"
        current={targets.wordCount.current}
        min={targets.wordCount.min}
        optimal={targets.wordCount.optimal}
        max={targets.wordCount.max}
        progress={progress.wordCount}
        competitorAvg={targets.wordCount.competitorAvg}
        showCompetitorData={showCompetitorData}
      />
      
      {/* H1 Count (usually just 1) */}
      {targets.headings.h1.current !== 1 && (
        <div className="flex items-center gap-2 text-xs">
          {targets.headings.h1.current === 0 ? (
            <>
              <AlertCircle className="h-3.5 w-3.5 text-red-500" />
              <span className="text-red-500">Missing H1 heading</span>
            </>
          ) : targets.headings.h1.current > 1 ? (
            <>
              <AlertCircle className="h-3.5 w-3.5 text-orange-500" />
              <span className="text-orange-500">
                Multiple H1 headings ({targets.headings.h1.current}) - should be 1
              </span>
            </>
          ) : (
            <>
              <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
              <span className="text-green-500">H1 heading present</span>
            </>
          )}
        </div>
      )}
      
      {/* H2 Count */}
      <TargetRow
        icon={<Heading2 className="h-4 w-4" />}
        label="H2 Headings"
        current={targets.headings.h2.current}
        min={targets.headings.h2.min}
        optimal={targets.headings.h2.optimal}
        max={targets.headings.h2.max}
        progress={progress.h2}
        competitorAvg={targets.headings.h2.competitorAvg}
        showCompetitorData={showCompetitorData}
      />
      
      {/* H3 Count */}
      <TargetRow
        icon={<Heading3 className="h-4 w-4" />}
        label="H3 Headings"
        current={targets.headings.h3.current}
        min={targets.headings.h3.min}
        optimal={targets.headings.h3.optimal}
        max={targets.headings.h3.max}
        progress={progress.h3}
        competitorAvg={targets.headings.h3.competitorAvg}
        showCompetitorData={showCompetitorData}
      />
      
      {/* Images */}
      <TargetRow
        icon={<Image className="h-4 w-4" />}
        label="Images"
        current={targets.images.current}
        min={targets.images.min}
        optimal={targets.images.optimal}
        max={targets.images.max}
        progress={progress.images}
        showCompetitorData={showCompetitorData}
      />
      
      {/* Links Section */}
      <div className="pt-2 border-t border-border/50 space-y-3">
        <h4 className="text-xs font-medium text-muted-foreground">Links</h4>
        
        {/* Internal Links */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link2 className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs">Internal</span>
          </div>
          <div className="flex items-center gap-1">
            <span className={cn(
              'text-xs font-medium',
              getStatusColor(progress.internalLinks.status)
            )}>
              {targets.links.internal.current}
            </span>
            <span className="text-xs text-muted-foreground">
              / {targets.links.internal.optimal}
            </span>
            {getStatusIcon(progress.internalLinks.status)}
          </div>
        </div>
        
        {/* External Links */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs">External</span>
          </div>
          <div className="flex items-center gap-1">
            <span className={cn(
              'text-xs font-medium',
              getStatusColor(progress.externalLinks.status)
            )}>
              {targets.links.external.current}
            </span>
            <span className="text-xs text-muted-foreground">
              / {targets.links.external.optimal}
            </span>
            {getStatusIcon(progress.externalLinks.status)}
          </div>
        </div>
      </div>
      
      {/* Legend */}
      <div className="pt-2 border-t border-border/50">
        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span>Optimal</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-yellow-500" />
            <span>Approaching</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <span>Under</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-orange-500" />
            <span>Over</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ContentTargetsPanel
