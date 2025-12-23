// ============================================
// AI WRITER - GEO & AEO SCORE PANEL COMPONENT
// ============================================
// Feature #2 & #3: Industry-standard GEO/AEO
// score display with platform predictions
// ============================================

'use client'

import React, { useState, useMemo } from 'react'
import {
  Cpu,
  Globe,
  Zap,
  Target,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Info,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Sparkles,
  Search,
  MessageSquare,
  Bot,
  Brain,
  BarChart3,
  ListChecks,
  Table2,
  HelpCircle,
  FileText
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { cn } from '@/lib/utils'
import type {
  GEOScore,
  AEOScore,
  GEORecommendation,
  AEORecommendation,
  SnippetOpportunity
} from '../types/geo-aeo.types'

// ============================================
// PROPS & TYPES
// ============================================

interface GEOAEOPanelProps {
  geoScore: GEOScore | null
  aeoScore: AEOScore | null
  isLoading?: boolean
  targetKeyword?: string
  onRecommendationClick?: (recommendation: GEORecommendation | AEORecommendation) => void
  className?: string
}

// ============================================
// HELPER FUNCTIONS
// ============================================

const getGradeColor = (grade: string) => {
  switch (grade) {
    case 'A': return 'text-green-500 bg-green-500/10 border-green-500/30'
    case 'B': return 'text-blue-500 bg-blue-500/10 border-blue-500/30'
    case 'C': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/30'
    case 'D': return 'text-orange-500 bg-orange-500/10 border-orange-500/30'
    case 'F': return 'text-red-500 bg-red-500/10 border-red-500/30'
    default: return 'text-muted-foreground bg-muted border-border'
  }
}

const getScoreColor = (score: number) => {
  if (score >= 80) return 'text-green-500'
  if (score >= 60) return 'text-blue-500'
  if (score >= 40) return 'text-yellow-500'
  if (score >= 20) return 'text-orange-500'
  return 'text-red-500'
}

const getProgressColor = (score: number) => {
  if (score >= 80) return 'bg-green-500'
  if (score >= 60) return 'bg-blue-500'
  if (score >= 40) return 'bg-yellow-500'
  if (score >= 20) return 'bg-orange-500'
  return 'bg-red-500'
}

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high': return 'bg-red-500/10 text-red-500 border-red-500/30'
    case 'medium': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30'
    case 'low': return 'bg-blue-500/10 text-blue-500 border-blue-500/30'
    default: return 'bg-muted text-muted-foreground'
  }
}

const getPlatformIcon = (platform: string) => {
  switch (platform) {
    case 'chatgpt': return <MessageSquare className="h-3.5 w-3.5" />
    case 'perplexity': return <Search className="h-3.5 w-3.5" />
    case 'gemini': return <Sparkles className="h-3.5 w-3.5" />
    case 'claude': return <Bot className="h-3.5 w-3.5" />
    case 'googleAI': return <Brain className="h-3.5 w-3.5" />
    default: return <Cpu className="h-3.5 w-3.5" />
  }
}

const getPlatformName = (platform: string) => {
  const names: Record<string, string> = {
    chatgpt: 'ChatGPT',
    perplexity: 'Perplexity',
    gemini: 'Gemini',
    claude: 'Claude',
    googleAI: 'Google AI'
  }
  return names[platform] || platform
}

const getCategoryIcon = (category: string) => {
  const icons: Record<string, React.ReactNode> = {
    structure: <ListChecks className="h-4 w-4" />,
    facts: <BarChart3 className="h-4 w-4" />,
    authority: <Target className="h-4 w-4" />,
    coverage: <Globe className="h-4 w-4" />,
    freshness: <Zap className="h-4 w-4" />,
    citations: <ExternalLink className="h-4 w-4" />,
    paragraph: <FileText className="h-4 w-4" />,
    list: <ListChecks className="h-4 w-4" />,
    table: <Table2 className="h-4 w-4" />,
    faq: <HelpCircle className="h-4 w-4" />,
    definition: <Info className="h-4 w-4" />,
    'how-to': <Target className="h-4 w-4" />
  }
  return icons[category] || <Info className="h-4 w-4" />
}

// ============================================
// SUB-COMPONENTS
// ============================================

// Score Display Circle
const ScoreCircle: React.FC<{
  score: number
  grade: string
  label: string
  size?: 'sm' | 'md' | 'lg'
}> = ({ score, grade, label, size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-14 h-14 text-lg',
    md: 'w-20 h-20 text-2xl',
    lg: 'w-24 h-24 text-3xl'
  }
  
  const circumference = 2 * Math.PI * 45
  const strokeDashoffset = circumference - (score / 100) * circumference
  
  return (
    <div className="flex flex-col items-center gap-1">
      <div className={cn('relative', sizeClasses[size])}>
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="50%"
            cy="50%"
            r="45%"
            fill="none"
            stroke="currentColor"
            strokeWidth="6"
            className="text-muted/30"
          />
          <circle
            cx="50%"
            cy="50%"
            r="45%"
            fill="none"
            stroke="currentColor"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className={cn('transition-all duration-500', getScoreColor(score))}
          />
        </svg>
        <div className={cn(
          'absolute inset-0 flex flex-col items-center justify-center font-bold',
          getScoreColor(score)
        )}>
          <span className={sizeClasses[size].split(' ')[2]}>{grade}</span>
        </div>
      </div>
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className={cn('text-sm font-semibold', getScoreColor(score))}>
        {score}/100
      </span>
    </div>
  )
}

// Platform Score Bar
const PlatformScoreBar: React.FC<{
  platform: string
  score: number
}> = ({ platform, score }) => (
  <div className="flex items-center gap-2">
    <div className="flex items-center gap-1.5 w-24">
      {getPlatformIcon(platform)}
      <span className="text-xs text-muted-foreground">
        {getPlatformName(platform)}
      </span>
    </div>
    <div className="flex-1">
      <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-500', getProgressColor(score))}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
    <span className={cn('text-xs font-medium w-8 text-right', getScoreColor(score))}>
      {score}
    </span>
  </div>
)

// Component Score Item
const ComponentScoreItem: React.FC<{
  label: string
  score: number
  icon?: React.ReactNode
  tooltip?: string
}> = ({ label, score, icon, tooltip }) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex items-center gap-2">
          {icon && <span className="text-muted-foreground">{icon}</span>}
          <div className="flex-1">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-muted-foreground">{label}</span>
              <span className={cn('text-xs font-medium', getScoreColor(score))}>
                {score}
              </span>
            </div>
            <div className="h-1.5 bg-muted/30 rounded-full overflow-hidden">
              <div
                className={cn('h-full rounded-full transition-all duration-300', getProgressColor(score))}
                style={{ width: `${score}%` }}
              />
            </div>
          </div>
        </div>
      </TooltipTrigger>
      {tooltip && (
        <TooltipContent side="left" className="max-w-[200px]">
          <p className="text-xs">{tooltip}</p>
        </TooltipContent>
      )}
    </Tooltip>
  </TooltipProvider>
)

// Recommendation Card
const RecommendationCard: React.FC<{
  recommendation: GEORecommendation | AEORecommendation
  onClick?: () => void
}> = ({ recommendation, onClick }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  
  return (
    <div className="border border-border/50 rounded-lg p-3 hover:bg-muted/30 transition-colors">
      <div className="flex items-start gap-2">
        <span className="text-muted-foreground mt-0.5">
          {getCategoryIcon('category' in recommendation ? recommendation.category : recommendation.type)}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium line-clamp-1">
              {recommendation.title}
            </span>
            <Badge 
              variant="outline" 
              className={cn('text-[10px] px-1.5 py-0', getPriorityColor(recommendation.priority))}
            >
              {recommendation.priority}
            </Badge>
          </div>
          
          <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
            <p className="text-xs text-muted-foreground line-clamp-2">
              {recommendation.description}
            </p>
            
            <CollapsibleContent>
              {'example' in recommendation && recommendation.example && (
                <div className="mt-2 p-2 bg-muted/50 rounded text-xs font-mono">
                  {recommendation.example}
                </div>
              )}
              {'impact' in recommendation && (
                <div className="mt-2 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  <span className="text-xs text-green-500">{recommendation.impact}</span>
                </div>
              )}
            </CollapsibleContent>
            
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 px-2 mt-1">
                {isExpanded ? (
                  <>
                    <ChevronUp className="h-3 w-3 mr-1" />
                    <span className="text-xs">Less</span>
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-3 w-3 mr-1" />
                    <span className="text-xs">More</span>
                  </>
                )}
              </Button>
            </CollapsibleTrigger>
          </Collapsible>
        </div>
      </div>
    </div>
  )
}

// Snippet Opportunity Card
const SnippetOpportunityCard: React.FC<{
  opportunity: SnippetOpportunity
}> = ({ opportunity }) => {
  const typeIcons: Record<string, React.ReactNode> = {
    paragraph: <FileText className="h-4 w-4" />,
    list: <ListChecks className="h-4 w-4" />,
    table: <Table2 className="h-4 w-4" />,
    definition: <Info className="h-4 w-4" />,
    'how-to': <Target className="h-4 w-4" />
  }
  
  return (
    <div className="border border-border/50 rounded-lg p-3 bg-muted/20">
      <div className="flex items-start gap-2">
        <span className={cn(
          'p-1.5 rounded',
          opportunity.currentScore < 30 ? 'bg-red-500/10 text-red-500' :
          opportunity.currentScore < 60 ? 'bg-yellow-500/10 text-yellow-500' :
          'bg-green-500/10 text-green-500'
        )}>
          {typeIcons[opportunity.type]}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
              {opportunity.type}
            </Badge>
            <span className={cn('text-xs font-medium', getScoreColor(opportunity.currentScore))}>
              {opportunity.currentScore}%
            </span>
          </div>
          <p className="text-xs text-muted-foreground mb-1">
            Target: <span className="text-foreground">"{opportunity.targetQuery}"</span>
          </p>
          <p className="text-xs text-muted-foreground">
            {opportunity.suggestion}
          </p>
        </div>
      </div>
    </div>
  )
}

// ============================================
// MAIN COMPONENT
// ============================================

export const GEOAEOPanel: React.FC<GEOAEOPanelProps> = ({
  geoScore,
  aeoScore,
  isLoading = false,
  targetKeyword,
  onRecommendationClick,
  className
}) => {
  const [activeTab, setActiveTab] = useState<'geo' | 'aeo'>('geo')
  
  // Calculate combined score
  const combinedScore = useMemo(() => {
    if (!geoScore && !aeoScore) return 0
    const geo = geoScore?.score || 0
    const aeo = aeoScore?.score || 0
    return Math.round((geo * 0.6 + aeo * 0.4))
  }, [geoScore, aeoScore])
  
  const combinedGrade = useMemo(() => {
    if (combinedScore >= 80) return 'A'
    if (combinedScore >= 60) return 'B'
    if (combinedScore >= 40) return 'C'
    if (combinedScore >= 20) return 'D'
    return 'F'
  }, [combinedScore])

  // Loading state
  if (isLoading) {
    return (
      <div className={cn('p-4', className)}>
        <div className="flex items-center justify-center h-40">
          <div className="flex flex-col items-center gap-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            <span className="text-sm text-muted-foreground">Analyzing content...</span>
          </div>
        </div>
      </div>
    )
  }

  // No data state
  if (!geoScore && !aeoScore) {
    return (
      <div className={cn('p-4', className)}>
        <div className="flex flex-col items-center justify-center h-40 text-center">
          <Cpu className="h-10 w-10 text-muted-foreground/50 mb-2" />
          <p className="text-sm text-muted-foreground">
            Start writing to see GEO & AEO scores
          </p>
          <p className="text-xs text-muted-foreground/70 mt-1">
            Optimize for AI search engines
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Header with Combined Score */}
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">AI Optimization</h3>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent side="left" className="max-w-[250px]">
                <p className="text-xs">
                  GEO (Generative Engine Optimization) measures how likely AI systems will cite your content.
                  AEO (Answer Engine Optimization) measures featured snippet potential.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        
        {/* Combined Score Display */}
        <div className="flex items-center justify-center gap-6">
          <ScoreCircle
            score={combinedScore}
            grade={combinedGrade}
            label="Combined"
            size="lg"
          />
          <div className="flex flex-col gap-2">
            {geoScore && (
              <div className="flex items-center gap-2">
                <div className={cn(
                  'px-2 py-0.5 rounded text-xs font-bold border',
                  getGradeColor(geoScore.grade)
                )}>
                  {geoScore.grade}
                </div>
                <span className="text-sm text-muted-foreground">GEO</span>
                <span className={cn('text-sm font-semibold', getScoreColor(geoScore.score))}>
                  {geoScore.score}
                </span>
              </div>
            )}
            {aeoScore && (
              <div className="flex items-center gap-2">
                <div className={cn(
                  'px-2 py-0.5 rounded text-xs font-bold border',
                  getGradeColor(aeoScore.grade)
                )}>
                  {aeoScore.grade}
                </div>
                <span className="text-sm text-muted-foreground">AEO</span>
                <span className={cn('text-sm font-semibold', getScoreColor(aeoScore.score))}>
                  {aeoScore.score}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'geo' | 'aeo')} className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-2 mx-4 mt-2" style={{ width: 'calc(100% - 2rem)' }}>
          <TabsTrigger value="geo" className="text-xs">
            <Cpu className="h-3.5 w-3.5 mr-1.5" />
            GEO Score
          </TabsTrigger>
          <TabsTrigger value="aeo" className="text-xs">
            <Search className="h-3.5 w-3.5 mr-1.5" />
            AEO Score
          </TabsTrigger>
        </TabsList>

        <ScrollArea className="flex-1">
          {/* GEO Tab */}
          <TabsContent value="geo" className="p-4 m-0 space-y-4">
            {geoScore && (
              <>
                {/* Platform Predictions */}
                <div>
                  <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-yellow-500" />
                    AI Platform Visibility
                  </h4>
                  <div className="space-y-2">
                    {Object.entries(geoScore.platformScores).map(([platform, score]) => (
                      <PlatformScoreBar key={platform} platform={platform} score={score} />
                    ))}
                  </div>
                </div>

                {/* Component Breakdown */}
                <div>
                  <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Score Breakdown
                  </h4>
                  <div className="space-y-3">
                    <ComponentScoreItem
                      label="Structured Content"
                      score={geoScore.components.structuredContent}
                      icon={<ListChecks className="h-3.5 w-3.5" />}
                      tooltip="Headings, lists, and tables make content easier for AI to parse"
                    />
                    <ComponentScoreItem
                      label="Factual Density"
                      score={geoScore.components.factualDensity}
                      icon={<BarChart3 className="h-3.5 w-3.5" />}
                      tooltip="Statistics, data points, and research citations"
                    />
                    <ComponentScoreItem
                      label="Authority Signals"
                      score={geoScore.components.authoritySignals}
                      icon={<Target className="h-3.5 w-3.5" />}
                      tooltip="Expert citations, authoritative sources, and E-E-A-T signals"
                    />
                    <ComponentScoreItem
                      label="Comprehensiveness"
                      score={geoScore.components.comprehensiveness}
                      icon={<Globe className="h-3.5 w-3.5" />}
                      tooltip="Topic depth, coverage, and content length"
                    />
                    <ComponentScoreItem
                      label="Freshness"
                      score={geoScore.components.freshness}
                      icon={<Zap className="h-3.5 w-3.5" />}
                      tooltip="Recent data, current year references, and updates"
                    />
                    <ComponentScoreItem
                      label="Citation Readiness"
                      score={geoScore.components.citationReadiness}
                      icon={<ExternalLink className="h-3.5 w-3.5" />}
                      tooltip="Quotable paragraphs and clear takeaways"
                    />
                  </div>
                </div>

                {/* Analysis Stats */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-2 bg-muted/30 rounded text-center">
                    <div className="text-lg font-bold text-foreground">
                      {geoScore.analysis.statisticsCount}
                    </div>
                    <div className="text-[10px] text-muted-foreground">Stats</div>
                  </div>
                  <div className="p-2 bg-muted/30 rounded text-center">
                    <div className="text-lg font-bold text-foreground">
                      {geoScore.analysis.definitionCount}
                    </div>
                    <div className="text-[10px] text-muted-foreground">Definitions</div>
                  </div>
                  <div className="p-2 bg-muted/30 rounded text-center">
                    <div className="text-lg font-bold text-foreground">
                      {geoScore.analysis.externalCitations}
                    </div>
                    <div className="text-[10px] text-muted-foreground">Citations</div>
                  </div>
                </div>

                {/* Recommendations */}
                {geoScore.recommendations.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-500" />
                      Recommendations
                    </h4>
                    <div className="space-y-2">
                      {geoScore.recommendations.map((rec) => (
                        <RecommendationCard
                          key={rec.id}
                          recommendation={rec}
                          onClick={() => onRecommendationClick?.(rec)}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </TabsContent>

          {/* AEO Tab */}
          <TabsContent value="aeo" className="p-4 m-0 space-y-4">
            {aeoScore && (
              <>
                {/* Component Breakdown */}
                <div>
                  <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                    <Search className="h-4 w-4" />
                    Snippet Optimization
                  </h4>
                  <div className="space-y-3">
                    <ComponentScoreItem
                      label="Direct Answers"
                      score={aeoScore.components.directAnswers}
                      icon={<CheckCircle2 className="h-3.5 w-3.5" />}
                      tooltip="Concise 40-60 word answer paragraphs"
                    />
                    <ComponentScoreItem
                      label="List Formats"
                      score={aeoScore.components.listFormats}
                      icon={<ListChecks className="h-3.5 w-3.5" />}
                      tooltip="Numbered and bulleted lists"
                    />
                    <ComponentScoreItem
                      label="Table Formats"
                      score={aeoScore.components.tableFormats}
                      icon={<Table2 className="h-3.5 w-3.5" />}
                      tooltip="Data tables for comparisons"
                    />
                    <ComponentScoreItem
                      label="FAQ Structure"
                      score={aeoScore.components.faqStructure}
                      icon={<HelpCircle className="h-3.5 w-3.5" />}
                      tooltip="Question and answer format"
                    />
                    <ComponentScoreItem
                      label="Definitions"
                      score={aeoScore.components.definitionBlocks}
                      icon={<Info className="h-3.5 w-3.5" />}
                      tooltip="Clear 'X is...' definitions"
                    />
                    <ComponentScoreItem
                      label="Step-by-Step"
                      score={aeoScore.components.stepByStep}
                      icon={<Target className="h-3.5 w-3.5" />}
                      tooltip="How-to instructions"
                    />
                  </div>
                </div>

                {/* Analysis Stats */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-2 bg-muted/30 rounded text-center">
                    <div className="text-lg font-bold text-foreground">
                      {aeoScore.analysis.numberedLists}
                    </div>
                    <div className="text-[10px] text-muted-foreground">Lists</div>
                  </div>
                  <div className="p-2 bg-muted/30 rounded text-center">
                    <div className="text-lg font-bold text-foreground">
                      {aeoScore.analysis.faqPairs}
                    </div>
                    <div className="text-[10px] text-muted-foreground">FAQs</div>
                  </div>
                  <div className="p-2 bg-muted/30 rounded text-center">
                    <div className="text-lg font-bold text-foreground">
                      {aeoScore.analysis.tablesFound}
                    </div>
                    <div className="text-[10px] text-muted-foreground">Tables</div>
                  </div>
                </div>

                {/* Snippet Opportunities */}
                {aeoScore.snippetOpportunities.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                      <Target className="h-4 w-4 text-blue-500" />
                      Snippet Opportunities
                    </h4>
                    <div className="space-y-2">
                      {aeoScore.snippetOpportunities.map((opp) => (
                        <SnippetOpportunityCard key={opp.id} opportunity={opp} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommendations */}
                {aeoScore.recommendations.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-500" />
                      Recommendations
                    </h4>
                    <div className="space-y-2">
                      {aeoScore.recommendations.map((rec) => (
                        <RecommendationCard
                          key={rec.id}
                          recommendation={rec}
                          onClick={() => onRecommendationClick?.(rec)}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  )
}

export default GEOAEOPanel
