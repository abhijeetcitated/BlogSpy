/**
 * Topic Gap Analysis Panel Component
 * 
 * Comprehensive topic gap analysis UI
 */

'use client';

import React, { useState, useMemo, useCallback } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetDescription
} from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@/components/ui/collapsible';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import {
  Target,
  Search,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  Lightbulb,
  Plus,
  Download,
  RefreshCw,
  Layers,
  TrendingUp,
  Zap,
  FileText,
  BarChart3,
  ArrowRight
} from 'lucide-react';
import { useTopicGap } from '@/src/features/ai-writer/hooks/tools/use-topic-gap';
import {
  ContentGap,
  GapSeverity,
  GapStatus,
  TopicType,
  TopicCluster,
  TopicRecommendation,
  QuickWin,
  TopicGapMetrics,
  TopicGapSummary,
  TopicGapFilterState,
  TopicGapSortOption,
  GAP_SEVERITY_LABELS,
  GAP_STATUS_LABELS,
  TOPIC_TYPE_LABELS
} from '@/src/features/ai-writer/types/tools/topic-gap.types';

// =============================================================================
// TYPES
// =============================================================================

interface TopicGapPanelProps {
  content: string;
  keyword?: string;
  trigger?: React.ReactNode;
  className?: string;
}

// =============================================================================
// HELPER COMPONENTS
// =============================================================================

// Score ring
const ScoreRing: React.FC<{ 
  score: number; 
  size?: number;
  label?: string;
}> = ({ score, size = 100, label }) => {
  const radius = (size - 8) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (score / 100) * circumference;
  
  const getColor = (score: number) => {
    if (score >= 80) return 'stroke-green-500';
    if (score >= 60) return 'stroke-yellow-500';
    if (score >= 40) return 'stroke-orange-500';
    return 'stroke-red-500';
  };
  
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          className="stroke-muted"
          strokeWidth={8}
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          className={cn('transition-all duration-500', getColor(score))}
          strokeWidth={8}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold">{score}</span>
        {label && <span className="text-xs text-muted-foreground">{label}</span>}
      </div>
    </div>
  );
};

// Severity badge
const SeverityBadge: React.FC<{ severity: GapSeverity }> = ({ severity }) => {
  const config: Record<GapSeverity, { icon: typeof AlertCircle; class: string }> = {
    critical: { icon: AlertCircle, class: 'bg-red-500/10 text-red-600' },
    high: { icon: AlertTriangle, class: 'bg-orange-500/10 text-orange-600' },
    medium: { icon: Info, class: 'bg-yellow-500/10 text-yellow-600' },
    low: { icon: Info, class: 'bg-blue-500/10 text-blue-600' }
  };
  
  const cfg = config[severity];
  const Icon = cfg.icon;
  
  return (
    <Badge variant="outline" className={cn('gap-1 text-xs', cfg.class)}>
      <Icon className="w-3 h-3" />
      {GAP_SEVERITY_LABELS[severity]}
    </Badge>
  );
};

// Gap card
const GapCard: React.FC<{
  gap: ContentGap;
  onAdd?: () => void;
}> = ({ gap, onAdd }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
      <div className={cn(
        'rounded-lg border transition-colors',
        gap.severity === 'critical' && 'border-red-200 bg-red-50/30',
        gap.severity === 'high' && 'border-orange-200 bg-orange-50/30'
      )}>
        <CollapsibleTrigger asChild>
          <div className="p-3 cursor-pointer hover:bg-muted/30">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium truncate">{gap.topic}</span>
                  <Badge variant="secondary" className="text-xs shrink-0">
                    {TOPIC_TYPE_LABELS[gap.type]}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {gap.reason}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <SeverityBadge severity={gap.severity} />
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </div>
            </div>
          </div>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <div className="px-3 pb-3 space-y-3 border-t pt-3">
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div className="p-2 rounded bg-muted/50">
                <div className="text-xs text-muted-foreground">Opportunity</div>
                <div className="font-medium">{gap.opportunityScore}/100</div>
              </div>
              <div className="p-2 rounded bg-muted/50">
                <div className="text-xs text-muted-foreground">Words Needed</div>
                <div className="font-medium">+{gap.suggestedWordCount}</div>
              </div>
              <div className="p-2 rounded bg-muted/50">
                <div className="text-xs text-muted-foreground">Effort</div>
                <div className="font-medium capitalize">{gap.effort}</div>
              </div>
            </div>
            
            <div className="p-2 rounded bg-muted/30">
              <div className="text-xs font-medium mb-1">Suggested Content:</div>
              <div className="text-sm text-muted-foreground">
                {gap.suggestedContent}
              </div>
            </div>
            
            {gap.questionsToAnswer.length > 0 && (
              <div>
                <div className="text-xs font-medium mb-1">Questions to Answer:</div>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {gap.questionsToAnswer.slice(0, 3).map((q, i) => (
                    <li key={i} className="flex items-start gap-1">
                      <ChevronRight className="w-3 h-3 mt-0.5 shrink-0" />
                      {q}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {onAdd && (
              <Button size="sm" className="w-full" onClick={onAdd}>
                <Plus className="w-3 h-3 mr-1" />
                Add This Topic
              </Button>
            )}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};

// Quick win card
const QuickWinCard: React.FC<{ quickWin: QuickWin }> = ({ quickWin }) => (
  <div className="p-3 rounded-lg border border-dashed border-yellow-300 bg-yellow-50/30">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Zap className="w-4 h-4 text-yellow-600" />
        <span className="font-medium">{quickWin.topic}</span>
      </div>
      <Badge variant="outline" className="text-xs">
        +{quickWin.wordCount} words
      </Badge>
    </div>
    <p className="text-sm text-muted-foreground mt-1">{quickWin.action}</p>
  </div>
);

// Recommendation card
const RecommendationCard: React.FC<{
  recommendation: TopicRecommendation;
}> = ({ recommendation }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const typeIcons: Record<string, typeof Plus> = {
    add_topic: Plus,
    expand_topic: TrendingUp,
    add_section: FileText,
    answer_question: Lightbulb,
    update_content: RefreshCw
  };
  
  const Icon = typeIcons[recommendation.type] || Lightbulb;
  
  return (
    <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
      <div className="rounded-lg border">
        <CollapsibleTrigger asChild>
          <div className="p-3 cursor-pointer hover:bg-muted/30">
            <div className="flex items-start gap-3">
              <div className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center shrink-0',
                recommendation.impact === 'critical' && 'bg-purple-100 text-purple-600',
                recommendation.impact === 'high' && 'bg-blue-100 text-blue-600',
                recommendation.impact === 'medium' && 'bg-gray-100 text-gray-600',
                recommendation.impact === 'low' && 'bg-gray-50 text-gray-500'
              )}>
                <Icon className="w-4 h-4" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="font-medium">{recommendation.title}</div>
                <div className="text-sm text-muted-foreground mt-1">
                  {recommendation.description}
                </div>
              </div>
              
              <div className="flex items-center gap-2 shrink-0">
                <Badge variant="outline" className="text-xs">
                  +{recommendation.suggestedWordCount} words
                </Badge>
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </div>
            </div>
          </div>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <div className="px-3 pb-3 border-t pt-3 space-y-2">
            {recommendation.suggestedOutline && (
              <div>
                <div className="text-xs font-medium mb-1">Suggested Outline:</div>
                <ul className="text-sm text-muted-foreground">
                  {recommendation.suggestedOutline.map((item, i) => (
                    <li key={i} className="flex items-center gap-1">
                      <ArrowRight className="w-3 h-3" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                Impact: {recommendation.impact}
              </Badge>
              <Badge variant="outline" className="text-xs">
                Effort: {recommendation.effort}
              </Badge>
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};

// Cluster card
const ClusterCard: React.FC<{
  cluster: TopicCluster;
}> = ({ cluster }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
      <div className="rounded-lg border">
        <CollapsibleTrigger asChild>
          <div className="p-3 cursor-pointer hover:bg-muted/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">{cluster.mainTopic}</span>
                <Badge variant="secondary" className="text-xs">
                  {cluster.subtopics.length} subtopics
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-right text-sm">
                  <div className="text-muted-foreground">Gap: {cluster.gapPercentage}%</div>
                </div>
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </div>
            </div>
            
            <div className="mt-2 flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Your coverage:</span>
              <Progress value={cluster.yourCoverage} className="flex-1 h-2" />
              <span className="text-xs font-medium w-10">{cluster.yourCoverage}%</span>
            </div>
          </div>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <div className="px-3 pb-3 border-t pt-3">
            <div className="text-xs font-medium mb-2">Subtopics:</div>
            <div className="flex flex-wrap gap-1">
              {cluster.subtopics.map((subtopic, i) => (
                <Badge key={i} variant="outline" className="text-xs">
                  {subtopic}
                </Badge>
              ))}
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};

// =============================================================================
// TAB COMPONENTS
// =============================================================================

// Overview Tab
const OverviewTab: React.FC<{
  metrics: TopicGapMetrics | null;
  summary: TopicGapSummary | null;
  quickWins: QuickWin[];
}> = ({ metrics, summary, quickWins }) => {
  if (!metrics || !summary) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Run analysis to see topic gap overview
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Score and Verdict */}
      <div className="flex items-center gap-6">
        <ScoreRing score={metrics.overallScore} label="Coverage" />
        
        <div className="flex-1">
          <Badge
            variant="outline"
            className={cn(
              'text-sm mb-2',
              summary.verdict === 'excellent' && 'bg-green-100 text-green-700',
              summary.verdict === 'good' && 'bg-blue-100 text-blue-700',
              summary.verdict === 'average' && 'bg-yellow-100 text-yellow-700',
              summary.verdict === 'needs_work' && 'bg-orange-100 text-orange-700',
              summary.verdict === 'poor' && 'bg-red-100 text-red-700'
            )}
          >
            {summary.verdict.replace('_', ' ').toUpperCase()}
          </Badge>
          <p className="text-sm text-muted-foreground">{summary.mainFinding}</p>
        </div>
      </div>
      
      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-3">
        <div className="p-3 rounded-lg bg-muted/50 text-center">
          <div className="text-2xl font-bold">{metrics.totalTopics}</div>
          <div className="text-xs text-muted-foreground">Topics</div>
        </div>
        <div className="p-3 rounded-lg bg-green-500/10 text-center">
          <div className="text-2xl font-bold text-green-600">
            {metrics.topicsCovered}
          </div>
          <div className="text-xs text-muted-foreground">Covered</div>
        </div>
        <div className="p-3 rounded-lg bg-red-500/10 text-center">
          <div className="text-2xl font-bold text-red-600">
            {metrics.topicsMissing}
          </div>
          <div className="text-xs text-muted-foreground">Missing</div>
        </div>
        <div className="p-3 rounded-lg bg-purple-500/10 text-center">
          <div className="text-2xl font-bold text-purple-600">
            {metrics.criticalGaps}
          </div>
          <div className="text-xs text-muted-foreground">Critical</div>
        </div>
      </div>
      
      {/* Word Count Gap */}
      {metrics.wordCountGap > 0 && (
        <div className="p-3 rounded-lg bg-orange-50 border border-orange-200">
          <div className="flex items-center gap-2 text-orange-700">
            <TrendingUp className="w-4 h-4" />
            <span className="font-medium">
              Add ~{metrics.wordCountGap} words to match competitors
            </span>
          </div>
        </div>
      )}
      
      {/* Strengths & Weaknesses */}
      <div className="grid grid-cols-2 gap-4">
        {summary.strengths.length > 0 && (
          <div>
            <h4 className="font-medium text-sm text-green-600 mb-2 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" />
              Strengths
            </h4>
            <ul className="space-y-1">
              {summary.strengths.map((s, i) => (
                <li key={i} className="text-sm text-muted-foreground">â€¢ {s}</li>
              ))}
            </ul>
          </div>
        )}
        
        {summary.weaknesses.length > 0 && (
          <div>
            <h4 className="font-medium text-sm text-red-600 mb-2 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              Weaknesses
            </h4>
            <ul className="space-y-1">
              {summary.weaknesses.map((w, i) => (
                <li key={i} className="text-sm text-muted-foreground">â€¢ {w}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
      
      {/* Quick Wins */}
      {quickWins.length > 0 && (
        <div>
          <h4 className="font-medium text-sm text-yellow-600 mb-2 flex items-center gap-1">
            <Zap className="w-4 h-4" />
            Quick Wins
          </h4>
          <div className="space-y-2">
            {quickWins.slice(0, 3).map((win, i) => (
              <QuickWinCard key={i} quickWin={win} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Gaps Tab
const GapsTab: React.FC<{
  gaps: ContentGap[];
  filterGaps: (filter: Partial<TopicGapFilterState>) => ContentGap[];
  sortGaps: (gaps: ContentGap[], sortBy: TopicGapSortOption) => ContentGap[];
}> = ({ gaps, filterGaps, sortGaps }) => {
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState<GapSeverity | 'all'>('all');
  const [sortBy, setSortBy] = useState<TopicGapSortOption>('severity');
  
  const filteredGaps = useMemo(() => {
    let result = filterGaps({
      search,
      severity: severityFilter
    });
    return sortGaps(result, sortBy);
  }, [gaps, search, severityFilter, sortBy, filterGaps, sortGaps]);
  
  // Count by severity
  const severityCounts = useMemo(() => ({
    all: gaps.length,
    critical: gaps.filter(g => g.severity === 'critical').length,
    high: gaps.filter(g => g.severity === 'high').length,
    medium: gaps.filter(g => g.severity === 'medium').length,
    low: gaps.filter(g => g.severity === 'low').length
  }), [gaps]);
  
  return (
    <div className="space-y-4">
      {/* Search & Filters */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search gaps..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={severityFilter} onValueChange={(v) => setSeverityFilter(v as GapSeverity | 'all')}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Severity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All ({severityCounts.all})</SelectItem>
              <SelectItem value="critical">Critical ({severityCounts.critical})</SelectItem>
              <SelectItem value="high">High ({severityCounts.high})</SelectItem>
              <SelectItem value="medium">Medium ({severityCounts.medium})</SelectItem>
              <SelectItem value="low">Low ({severityCounts.low})</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as TopicGapSortOption)}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="severity">Severity</SelectItem>
              <SelectItem value="opportunity">Opportunity</SelectItem>
              <SelectItem value="effort">Effort</SelectItem>
              <SelectItem value="impact">Impact</SelectItem>
              <SelectItem value="alphabetical">A-Z</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Severity Summary */}
      <div className="grid grid-cols-4 gap-2">
        {(['critical', 'high', 'medium', 'low'] as GapSeverity[]).map(severity => (
          <button
            key={severity}
            className={cn(
              'p-2 rounded text-center transition-colors',
              severityFilter === severity && 'ring-2 ring-primary',
              severity === 'critical' && 'bg-red-500/10',
              severity === 'high' && 'bg-orange-500/10',
              severity === 'medium' && 'bg-yellow-500/10',
              severity === 'low' && 'bg-blue-500/10'
            )}
            onClick={() => setSeverityFilter(severityFilter === severity ? 'all' : severity)}
          >
            <div className="text-lg font-bold">{severityCounts[severity]}</div>
            <div className="text-xs capitalize">{severity}</div>
          </button>
        ))}
      </div>
      
      {/* Gap List */}
      <ScrollArea className="h-[350px]">
        <div className="space-y-2">
          {filteredGaps.map(gap => (
            <GapCard key={gap.id} gap={gap} />
          ))}
          
          {filteredGaps.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle2 className="w-12 h-12 mx-auto mb-2 text-green-500" />
              <p>No gaps found!</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

// Recommendations Tab
const RecommendationsTab: React.FC<{
  recommendations: TopicRecommendation[];
}> = ({ recommendations }) => {
  if (recommendations.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <CheckCircle2 className="w-12 h-12 mx-auto mb-2 text-green-500" />
        <p>Great! No recommendations at this time.</p>
      </div>
    );
  }
  
  return (
    <ScrollArea className="h-[400px]">
      <div className="space-y-2">
        {recommendations.map(rec => (
          <RecommendationCard key={rec.id} recommendation={rec} />
        ))}
      </div>
    </ScrollArea>
  );
};

// Clusters Tab
const ClustersTab: React.FC<{
  clusters: TopicCluster[];
}> = ({ clusters }) => {
  if (clusters.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Layers className="w-12 h-12 mx-auto mb-2 opacity-50" />
        <p>No topic clusters found</p>
      </div>
    );
  }
  
  return (
    <ScrollArea className="h-[400px]">
      <div className="space-y-2">
        {clusters.map(cluster => (
          <ClusterCard key={cluster.id} cluster={cluster} />
        ))}
      </div>
    </ScrollArea>
  );
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export const TopicGapPanel: React.FC<TopicGapPanelProps> = ({
  content,
  keyword = '',
  trigger,
  className
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  
  const {
    analysis,
    isAnalyzing,
    metrics,
    gaps,
    clusters,
    recommendations,
    quickWins,
    summary,
    analyze,
    filterGaps,
    sortGaps,
    exportReport
  } = useTopicGap({ keyword });
  
  // Auto-analyze
  React.useEffect(() => {
    if (content) {
      analyze(content, keyword);
    }
  }, [content, keyword, analyze]);
  
  const handleExport = useCallback(() => {
    const report = exportReport('markdown');
    if (report) {
      navigator.clipboard.writeText(report);
    }
  }, [exportReport]);
  
  return (
    <Sheet>
      <SheetTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className={className}>
            <Target className="w-4 h-4 mr-2" />
            Topic Gaps
            {metrics && metrics.criticalGaps > 0 && (
              <Badge variant="destructive" className="ml-2">
                {metrics.criticalGaps}
              </Badge>
            )}
          </Button>
        )}
      </SheetTrigger>
      
      <SheetContent className="w-[500px] sm:max-w-[500px] overflow-hidden flex flex-col">
        <SheetHeader className="shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <SheetTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Topic Gap Analysis
              </SheetTitle>
              <SheetDescription>
                Identify content gaps vs competitors
              </SheetDescription>
            </div>
            
            <div className="flex items-center gap-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button size="sm" variant="ghost" onClick={handleExport}>
                      <Download className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Export Report</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <Button
                size="sm"
                variant="ghost"
                onClick={() => analyze(content, keyword)}
                disabled={isAnalyzing}
              >
                <RefreshCw className={cn(
                  'w-4 h-4',
                  isAnalyzing && 'animate-spin'
                )} />
              </Button>
            </div>
          </div>
        </SheetHeader>
        
        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="flex-1 flex flex-col min-h-0 mt-4"
        >
          <TabsList className="grid w-full grid-cols-4 shrink-0">
            <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
            <TabsTrigger value="gaps" className="text-xs">Gaps</TabsTrigger>
            <TabsTrigger value="recommendations" className="text-xs">Tips</TabsTrigger>
            <TabsTrigger value="clusters" className="text-xs">Clusters</TabsTrigger>
          </TabsList>
          
          <ScrollArea className="flex-1 mt-4">
            <TabsContent value="overview" className="m-0">
              <OverviewTab 
                metrics={metrics}
                summary={summary}
                quickWins={quickWins}
              />
            </TabsContent>
            
            <TabsContent value="gaps" className="m-0">
              <GapsTab
                gaps={gaps}
                filterGaps={filterGaps}
                sortGaps={sortGaps}
              />
            </TabsContent>
            
            <TabsContent value="recommendations" className="m-0">
              <RecommendationsTab recommendations={recommendations} />
            </TabsContent>
            
            <TabsContent value="clusters" className="m-0">
              <ClustersTab clusters={clusters} />
            </TabsContent>
          </ScrollArea>
        </Tabs>
        
        {/* Loading */}
        {isAnalyzing && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
            <div className="text-center">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Analyzing topic gaps...</p>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default TopicGapPanel;

