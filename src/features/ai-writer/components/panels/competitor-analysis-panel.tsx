// =============================================================================
// COMPETITOR ANALYSIS PANEL - Live SERP Analysis UI Component
// =============================================================================
// Industry-standard competitor analysis like Surfer SEO, Clearscope, Frase
// Real-time SERP analysis with content gaps, comparison, and outlines
// =============================================================================

'use client';

import React, { useState, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Search,
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  FileText,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Target,
  BarChart3,
  List,
  Globe,
  Link2,
  Image as ImageIcon,
  Clock,
  RefreshCw,
  Zap,
  AlertCircle,
  Info,
  Award,
  Layers,
} from 'lucide-react';

import type {
  SERPAnalysis,
  SERPCompetitor,
  ContentGapAnalysis,
  CompetitorComparison,
  MissingTopic,
  MissingSection,
  StructuralGap,
  CompetitorPanelState,
  ScoreDetail,
  PositionPrediction,
} from '@/src/features/ai-writer/types/tools/competitor-analysis.types';

// -----------------------------------------------------------------------------
// Props Interface
// -----------------------------------------------------------------------------

interface CompetitorAnalysisPanelProps {
  serpAnalysis: SERPAnalysis | null;
  contentGaps: ContentGapAnalysis | null;
  comparison: CompetitorComparison | null;
  isAnalyzing: boolean;
  progress: number;
  currentStep: string;
  onAnalyze: () => void;
  onRefresh: () => void;
  keyword?: string;
  className?: string;
}

// -----------------------------------------------------------------------------
// Default State
// -----------------------------------------------------------------------------

const DEFAULT_STATE: CompetitorPanelState = {
  activeTab: 'overview',
  expandedCompetitors: [],
  sortBy: 'rank',
  sortOrder: 'asc',
  filterBy: 'all'
};

// -----------------------------------------------------------------------------
// Main Component
// -----------------------------------------------------------------------------

export function CompetitorAnalysisPanel({
  serpAnalysis,
  contentGaps,
  comparison,
  isAnalyzing,
  progress,
  currentStep,
  onAnalyze,
  onRefresh,
  keyword = '',
  className = ''
}: CompetitorAnalysisPanelProps) {
  const [panelState, setPanelState] = useState<CompetitorPanelState>(DEFAULT_STATE);
  
  // Filter and sort competitors
  const displayCompetitors = useMemo(() => {
    if (!serpAnalysis?.competitors) return [];
    
    let competitors = [...serpAnalysis.competitors];
    
    // Apply filter
    switch (panelState.filterBy) {
      case 'top-3':
        competitors = competitors.slice(0, 3);
        break;
      case 'top-5':
        competitors = competitors.slice(0, 5);
        break;
      case 'top-10':
        competitors = competitors.slice(0, 10);
        break;
    }
    
    // Apply sort
    competitors.sort((a, b) => {
      let comparison = 0;
      switch (panelState.sortBy) {
        case 'rank':
          comparison = a.rank - b.rank;
          break;
        case 'wordCount':
          comparison = a.wordCount - b.wordCount;
          break;
        case 'headings':
          comparison = a.headingCount.total - b.headingCount.total;
          break;
        case 'authority':
          comparison = a.domainAuthority - b.domainAuthority;
          break;
        case 'topicCoverage':
          comparison = a.topicCoverage - b.topicCoverage;
          break;
      }
      return panelState.sortOrder === 'asc' ? comparison : -comparison;
    });
    
    return competitors;
  }, [serpAnalysis, panelState.sortBy, panelState.sortOrder, panelState.filterBy]);
  
  // Toggle competitor expansion
  const toggleCompetitor = (id: string) => {
    setPanelState(prev => ({
      ...prev,
      expandedCompetitors: prev.expandedCompetitors.includes(id)
        ? prev.expandedCompetitors.filter(c => c !== id)
        : [...prev.expandedCompetitors, id]
    }));
  };
  
  // Render loading state
  if (isAnalyzing) {
    return (
      <div className={`p-4 ${className}`}>
        <div className="flex flex-col items-center justify-center py-8 space-y-4">
          <RefreshCw className="h-8 w-8 text-blue-500 animate-spin" />
          <p className="text-sm font-medium text-muted-foreground">{currentStep}</p>
          <div className="w-full max-w-xs">
            <Progress value={progress} className="h-2" />
          </div>
          <p className="text-xs text-muted-foreground">{progress}% complete</p>
        </div>
      </div>
    );
  }
  
  // Render empty state
  if (!serpAnalysis) {
    return (
      <div className={`p-4 ${className}`}>
        <div className="flex flex-col items-center justify-center py-8 space-y-4">
          <Globe className="h-12 w-12 text-muted-foreground/50" />
          <div className="text-center">
            <h3 className="font-semibold text-sm">Analyze Competitors</h3>
            <p className="text-xs text-muted-foreground mt-1">
              {keyword 
                ? `Analyze top 10 results for "${keyword}"`
                : 'Enter a keyword to analyze SERP competitors'
              }
            </p>
          </div>
          <Button
            onClick={onAnalyze}
            disabled={!keyword}
            className="gap-2"
          >
            <Search className="h-4 w-4" />
            Analyze SERP
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <TooltipProvider>
      <div className={`flex flex-col h-full ${className}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-blue-500" />
            <span className="text-sm font-medium">Competitor Analysis</span>
            <Badge variant="outline" className="text-xs">
              {serpAnalysis.competitors.length} results
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onRefresh}
            className="h-7 px-2"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
        </div>
        
        {/* Tabs */}
        <Tabs
          value={panelState.activeTab}
          onValueChange={(v: string) => setPanelState(prev => ({ ...prev, activeTab: v as 'overview' | 'gaps' | 'comparison' | 'outline' }))}
          className="flex-1 flex flex-col"
        >
          <TabsList className="w-full justify-start rounded-none border-b px-3 h-9">
            <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
            <TabsTrigger value="gaps" className="text-xs">
              Gaps
              {contentGaps && contentGaps.missingTopics.length > 0 && (
                <Badge variant="destructive" className="ml-1 h-4 px-1 text-[10px]">
                  {contentGaps.missingTopics.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="comparison" className="text-xs">Compare</TabsTrigger>
            <TabsTrigger value="outline" className="text-xs">Outline</TabsTrigger>
          </TabsList>
          
          <ScrollArea className="flex-1">
            {/* Overview Tab */}
            <TabsContent value="overview" className="m-0 p-3 space-y-4">
              {/* Quick Stats */}
              <QuickStats serpAnalysis={serpAnalysis} comparison={comparison} />
              
              {/* Position Prediction */}
              {comparison?.positionPrediction && (
                <PositionPredictionCard prediction={comparison.positionPrediction} />
              )}
              
              {/* Competitor List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">
                    Top Competitors
                  </span>
                  <div className="flex items-center gap-2">
                    <Select
                      value={panelState.filterBy}
                      onValueChange={(v: string) => setPanelState(prev => ({ ...prev, filterBy: v as 'all' | 'similar-length' | 'top-3' | 'top-5' | 'top-10' }))}
                    >
                      <SelectTrigger className="h-6 text-xs w-[80px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="top-3">Top 3</SelectItem>
                        <SelectItem value="top-5">Top 5</SelectItem>
                        <SelectItem value="top-10">Top 10</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select
                      value={panelState.sortBy}
                      onValueChange={(v: string) => setPanelState(prev => ({ ...prev, sortBy: v as 'rank' | 'wordCount' | 'headings' | 'authority' | 'topicCoverage' }))}
                    >
                      <SelectTrigger className="h-6 text-xs w-[100px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="rank">Rank</SelectItem>
                        <SelectItem value="wordCount">Words</SelectItem>
                        <SelectItem value="headings">Headings</SelectItem>
                        <SelectItem value="authority">Authority</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-1">
                  {displayCompetitors.map(competitor => (
                    <CompetitorCard
                      key={competitor.id}
                      competitor={competitor}
                      isExpanded={panelState.expandedCompetitors.includes(competitor.id)}
                      onToggle={() => toggleCompetitor(competitor.id)}
                    />
                  ))}
                </div>
              </div>
            </TabsContent>
            
            {/* Gaps Tab */}
            <TabsContent value="gaps" className="m-0 p-3 space-y-4">
              {contentGaps ? (
                <ContentGapsView contentGaps={contentGaps} />
              ) : (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  No gap analysis available
                </div>
              )}
            </TabsContent>
            
            {/* Comparison Tab */}
            <TabsContent value="comparison" className="m-0 p-3 space-y-4">
              {comparison ? (
                <ComparisonView comparison={comparison} />
              ) : (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  No comparison data available
                </div>
              )}
            </TabsContent>
            
            {/* Outline Tab */}
            <TabsContent value="outline" className="m-0 p-3 space-y-4">
              <OutlineView serpAnalysis={serpAnalysis} />
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </div>
    </TooltipProvider>
  );
}

// -----------------------------------------------------------------------------
// Quick Stats Component
// -----------------------------------------------------------------------------

interface QuickStatsProps {
  serpAnalysis: SERPAnalysis;
  comparison: CompetitorComparison | null;
}

function QuickStats({ serpAnalysis, comparison }: QuickStatsProps) {
  const avgMetrics = serpAnalysis.averageMetrics;
  
  return (
    <div className="grid grid-cols-2 gap-2">
      <StatCard
        label="Avg. Words"
        value={avgMetrics.wordCount.toLocaleString()}
        icon={FileText}
        trend={comparison?.scores.contentLength.vsAverage}
      />
      <StatCard
        label="Avg. Headings"
        value={avgMetrics.headingCount.total.toString()}
        icon={List}
        trend={comparison?.scores.structure.vsAverage}
      />
      <StatCard
        label="Avg. Images"
        value={avgMetrics.imageCount.toString()}
        icon={ImageIcon}
        trend={comparison?.scores.multimedia.vsAverage}
      />
      <StatCard
        label="Avg. Links"
        value={(avgMetrics.internalLinks + avgMetrics.externalLinks).toString()}
        icon={Link2}
        trend={comparison?.scores.linking.vsAverage}
      />
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string;
  icon: React.ElementType;
  trend?: number;
}

function StatCard({ label, value, icon: Icon, trend }: StatCardProps) {
  return (
    <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
      <Icon className="h-4 w-4 text-muted-foreground" />
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground truncate">{label}</p>
        <p className="text-sm font-semibold">{value}</p>
      </div>
      {trend !== undefined && (
        <div className={`flex items-center gap-0.5 text-xs ${
          trend > 0 ? 'text-green-500' : trend < 0 ? 'text-red-500' : 'text-muted-foreground'
        }`}>
          {trend > 0 ? <TrendingUp className="h-3 w-3" /> :
           trend < 0 ? <TrendingDown className="h-3 w-3" /> :
           <Minus className="h-3 w-3" />}
          <span>{Math.abs(trend)}%</span>
        </div>
      )}
    </div>
  );
}

// -----------------------------------------------------------------------------
// Position Prediction Component
// -----------------------------------------------------------------------------

interface PositionPredictionCardProps {
  prediction: PositionPrediction;
}

function PositionPredictionCard({ prediction }: PositionPredictionCardProps) {
  return (
    <div className="p-3 rounded-lg border bg-gradient-to-r from-blue-500/10 to-purple-500/10">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4 text-blue-500" />
          <span className="text-sm font-medium">Position Prediction</span>
        </div>
        <Badge variant="outline" className="text-xs">
          {prediction.confidence}% confidence
        </Badge>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="text-center">
          <p className="text-3xl font-bold text-blue-500">#{prediction.estimatedPosition}</p>
          <p className="text-xs text-muted-foreground">Est. Position</p>
        </div>
        
        <div className="flex-1 space-y-1">
          {prediction.factors.slice(0, 3).map((factor, idx) => (
            <div key={idx} className="flex items-center gap-2 text-xs">
              {factor.impact === 'positive' ? (
                <CheckCircle2 className="h-3 w-3 text-green-500" />
              ) : factor.impact === 'negative' ? (
                <XCircle className="h-3 w-3 text-red-500" />
              ) : (
                <Minus className="h-3 w-3 text-muted-foreground" />
              )}
              <span className="text-muted-foreground truncate">{factor.factor}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Competitor Card Component
// -----------------------------------------------------------------------------

interface CompetitorCardProps {
  competitor: SERPCompetitor;
  isExpanded: boolean;
  onToggle: () => void;
}

function CompetitorCard({ competitor, isExpanded, onToggle }: CompetitorCardProps) {
  return (
    <Collapsible open={isExpanded} onOpenChange={onToggle}>
      <CollapsibleTrigger asChild>
        <div className="flex items-center gap-2 p-2 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors">
          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-muted text-xs font-bold">
            {competitor.rank}
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium truncate">{competitor.domain}</p>
            <p className="text-[10px] text-muted-foreground truncate">{competitor.title}</p>
          </div>
          
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{competitor.wordCount.toLocaleString()} words</span>
            {isExpanded ? (
              <ChevronDown className="h-3.5 w-3.5" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5" />
            )}
          </div>
        </div>
      </CollapsibleTrigger>
      
      <CollapsibleContent className="pl-8 pr-2 pb-2 space-y-2">
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div>
            <p className="text-muted-foreground">Headings</p>
            <p className="font-medium">{competitor.headingCount.total}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Images</p>
            <p className="font-medium">{competitor.imageCount}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Links</p>
            <p className="font-medium">{competitor.internalLinks + competitor.externalLinks}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant={competitor.hasFAQ ? 'default' : 'secondary'} className="text-[10px]">
            FAQ {competitor.hasFAQ ? 'âœ“' : 'âœ—'}
          </Badge>
          <Badge variant={competitor.hasTableOfContents ? 'default' : 'secondary'} className="text-[10px]">
            ToC {competitor.hasTableOfContents ? 'âœ“' : 'âœ—'}
          </Badge>
          <Badge variant={competitor.hasSchema ? 'default' : 'secondary'} className="text-[10px]">
            Schema {competitor.hasSchema ? 'âœ“' : 'âœ—'}
          </Badge>
        </div>
        
        <a
          href={competitor.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-xs text-blue-500 hover:underline"
        >
          <ExternalLink className="h-3 w-3" />
          View page
        </a>
      </CollapsibleContent>
    </Collapsible>
  );
}

// -----------------------------------------------------------------------------
// Content Gaps View Component
// -----------------------------------------------------------------------------

interface ContentGapsViewProps {
  contentGaps: ContentGapAnalysis;
}

function ContentGapsView({ contentGaps }: ContentGapsViewProps) {
  return (
    <div className="space-y-4">
      {/* Gap Score */}
      <div className="p-3 rounded-lg border">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Content Gap Score</span>
          <Badge variant={contentGaps.gapScore <= 30 ? 'default' : contentGaps.gapScore <= 60 ? 'secondary' : 'destructive'}>
            {Math.round(100 - contentGaps.gapScore)}% coverage
          </Badge>
        </div>
        <Progress value={100 - contentGaps.gapScore} className="h-2" />
        
        <div className="grid grid-cols-4 gap-2 mt-3 text-center text-xs">
          <div>
            <p className="text-muted-foreground">Topics</p>
            <p className="font-medium">{Math.round(contentGaps.topicCoverage)}%</p>
          </div>
          <div>
            <p className="text-muted-foreground">Terms</p>
            <p className="font-medium">{Math.round(contentGaps.termCoverage)}%</p>
          </div>
          <div>
            <p className="text-muted-foreground">Entities</p>
            <p className="font-medium">{Math.round(contentGaps.entityCoverage)}%</p>
          </div>
          <div>
            <p className="text-muted-foreground">Structure</p>
            <p className="font-medium">{Math.round(contentGaps.structureCoverage)}%</p>
          </div>
        </div>
      </div>
      
      {/* Missing Topics */}
      {contentGaps.missingTopics.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-medium flex items-center gap-2">
            <AlertCircle className="h-3.5 w-3.5 text-orange-500" />
            Missing Topics ({contentGaps.missingTopics.length})
          </h4>
          <div className="space-y-1">
            {contentGaps.missingTopics.slice(0, 5).map(topic => (
              <MissingTopicCard key={topic.id} topic={topic} />
            ))}
          </div>
        </div>
      )}
      
      {/* Missing Sections */}
      {contentGaps.missingSections.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-medium flex items-center gap-2">
            <Layers className="h-3.5 w-3.5 text-blue-500" />
            Missing Sections ({contentGaps.missingSections.length})
          </h4>
          <div className="space-y-1">
            {contentGaps.missingSections.slice(0, 5).map(section => (
              <MissingSectionCard key={section.id} section={section} />
            ))}
          </div>
        </div>
      )}
      
      {/* Structural Gaps */}
      {contentGaps.structuralGaps.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-medium flex items-center gap-2">
            <BarChart3 className="h-3.5 w-3.5 text-purple-500" />
            Structural Gaps
          </h4>
          <div className="space-y-1">
            {contentGaps.structuralGaps.map((gap, idx) => (
              <StructuralGapCard key={idx} gap={gap} />
            ))}
          </div>
        </div>
      )}
      
      {/* Missing Terms Preview */}
      {contentGaps.missingTerms.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-medium flex items-center gap-2">
            <Zap className="h-3.5 w-3.5 text-yellow-500" />
            Missing Terms ({contentGaps.missingTerms.length})
          </h4>
          <div className="flex flex-wrap gap-1">
            {contentGaps.missingTerms.slice(0, 10).map(term => (
              <Badge key={term.term} variant="outline" className="text-[10px]">
                {term.term}
              </Badge>
            ))}
            {contentGaps.missingTerms.length > 10 && (
              <Badge variant="secondary" className="text-[10px]">
                +{contentGaps.missingTerms.length - 10} more
              </Badge>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function MissingTopicCard({ topic }: { topic: MissingTopic }) {
  const priorityColor = topic.priority === 'critical' ? 'text-red-500' :
                       topic.priority === 'high' ? 'text-orange-500' :
                       topic.priority === 'medium' ? 'text-yellow-500' : 'text-green-500';
  
  return (
    <div className="p-2 rounded-lg border bg-muted/30">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium truncate">{topic.topic}</p>
          <p className="text-[10px] text-muted-foreground">
            {topic.competitorsCovering} competitors â€¢ ~{topic.suggestedWordCount} words
          </p>
        </div>
        <Badge variant="outline" className={`text-[10px] ${priorityColor}`}>
          {topic.priority}
        </Badge>
      </div>
      {topic.relatedTerms.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1">
          {topic.relatedTerms.slice(0, 3).map(term => (
            <span key={term} className="text-[10px] text-muted-foreground">#{term}</span>
          ))}
        </div>
      )}
    </div>
  );
}

function MissingSectionCard({ section }: { section: MissingSection }) {
  const priorityColor = section.priority === 'critical' ? 'text-red-500' :
                       section.priority === 'high' ? 'text-orange-500' :
                       section.priority === 'medium' ? 'text-yellow-500' : 'text-green-500';
  
  return (
    <div className="flex items-center gap-2 p-2 rounded-lg border bg-muted/30">
      <Badge variant="secondary" className="text-[10px] shrink-0">H{section.level}</Badge>
      <p className="text-xs flex-1 truncate">{section.heading}</p>
      <span className={`text-[10px] ${priorityColor}`}>{section.competitorsCovering} competitors</span>
    </div>
  );
}

function StructuralGapCard({ gap }: { gap: StructuralGap }) {
  const progress = gap.recommended > 0 ? (gap.current / gap.recommended) * 100 : 100;
  const priorityColor = gap.priority === 'critical' ? 'bg-red-500' :
                       gap.priority === 'high' ? 'bg-orange-500' :
                       gap.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500';
  
  return (
    <div className="p-2 rounded-lg border bg-muted/30 space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="capitalize">{gap.type.replace('-', ' ')}</span>
        <span>{gap.current} / {gap.recommended}</span>
      </div>
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full ${priorityColor} transition-all`}
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>
      <p className="text-[10px] text-muted-foreground">{gap.action}</p>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Comparison View Component
// -----------------------------------------------------------------------------

interface ComparisonViewProps {
  comparison: CompetitorComparison;
}

function ComparisonView({ comparison }: ComparisonViewProps) {
  const scores = comparison.scores;
  
  return (
    <div className="space-y-4">
      {/* Overall Score */}
      <div className="text-center p-4 rounded-lg border bg-gradient-to-b from-muted/50">
        <div className="relative inline-flex items-center justify-center">
          <svg className="w-24 h-24 transform -rotate-90">
            <circle
              cx="48"
              cy="48"
              r="40"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              className="text-muted"
            />
            <circle
              cx="48"
              cy="48"
              r="40"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              strokeDasharray={`${scores.overall * 2.51} 251`}
              className={
                scores.overall >= 80 ? 'text-green-500' :
                scores.overall >= 60 ? 'text-blue-500' :
                scores.overall >= 40 ? 'text-yellow-500' : 'text-red-500'
              }
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-bold">{scores.overall}</span>
          </div>
        </div>
        <p className="text-sm font-medium mt-2">Content Score</p>
        <p className="text-xs text-muted-foreground">vs. Top 10 Competitors</p>
      </div>
      
      {/* Score Breakdown */}
      <div className="space-y-2">
        <h4 className="text-xs font-medium text-muted-foreground">Score Breakdown</h4>
        <ScoreDetailRow label="Content Length" detail={scores.contentLength} />
        <ScoreDetailRow label="Structure" detail={scores.structure} />
        <ScoreDetailRow label="Term Coverage" detail={scores.termCoverage} />
        <ScoreDetailRow label="Entity Coverage" detail={scores.entityCoverage} />
        <ScoreDetailRow label="Readability" detail={scores.readability} />
        <ScoreDetailRow label="Multimedia" detail={scores.multimedia} />
        <ScoreDetailRow label="Linking" detail={scores.linking} />
      </div>
      
      {/* Metrics Comparison Table */}
      <div className="space-y-2">
        <h4 className="text-xs font-medium text-muted-foreground">Metrics Comparison</h4>
        <div className="rounded-lg border overflow-hidden">
          <table className="w-full text-xs">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-2 font-medium">Metric</th>
                <th className="text-center p-2 font-medium">You</th>
                <th className="text-center p-2 font-medium">Avg</th>
                <th className="text-center p-2 font-medium">Top</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              <MetricRow
                label="Words"
                yours={comparison.yourContent.wordCount}
                avg={comparison.competitorAverage.wordCount}
                top={comparison.topCompetitor.wordCount}
              />
              <MetricRow
                label="Headings"
                yours={comparison.yourContent.headingCount.total}
                avg={comparison.competitorAverage.headingCount.total}
                top={comparison.topCompetitor.headingCount.total}
              />
              <MetricRow
                label="Images"
                yours={comparison.yourContent.imageCount}
                avg={comparison.competitorAverage.imageCount}
                top={comparison.topCompetitor.imageCount}
              />
              <MetricRow
                label="Int. Links"
                yours={comparison.yourContent.internalLinks}
                avg={comparison.competitorAverage.internalLinks}
                top={comparison.topCompetitor.internalLinks}
              />
              <MetricRow
                label="Ext. Links"
                yours={comparison.yourContent.externalLinks}
                avg={comparison.competitorAverage.externalLinks}
                top={comparison.topCompetitor.externalLinks}
              />
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ScoreDetailRow({ label, detail }: { label: string; detail: ScoreDetail }) {
  const statusColor = detail.status === 'excellent' ? 'text-green-500' :
                     detail.status === 'good' ? 'text-blue-500' :
                     detail.status === 'needs-work' ? 'text-yellow-500' : 'text-red-500';
  
  return (
    <div className="flex items-center gap-2 p-2 rounded-lg border bg-muted/30">
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs">{label}</span>
          <span className={`text-xs font-medium ${statusColor}`}>{detail.score}</span>
        </div>
        <Progress value={detail.score} className="h-1" />
      </div>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
            <Info className="h-3 w-3 text-muted-foreground" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left" className="max-w-[200px]">
          <p className="text-xs">{detail.recommendation}</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
}

function MetricRow({
  label,
  yours,
  avg,
  top
}: {
  label: string;
  yours: number;
  avg: number;
  top: number;
}) {
  const vsAvg = avg > 0 ? ((yours - avg) / avg) * 100 : 0;
  
  return (
    <tr>
      <td className="p-2">{label}</td>
      <td className="p-2 text-center font-medium">{yours.toLocaleString()}</td>
      <td className="p-2 text-center text-muted-foreground">{avg.toLocaleString()}</td>
      <td className="p-2 text-center">
        <div className="flex items-center justify-center gap-1">
          <span className="text-muted-foreground">{top.toLocaleString()}</span>
          <span className={`text-[10px] ${vsAvg >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {vsAvg >= 0 ? '+' : ''}{Math.round(vsAvg)}%
          </span>
        </div>
      </td>
    </tr>
  );
}

// -----------------------------------------------------------------------------
// Outline View Component
// -----------------------------------------------------------------------------

interface OutlineViewProps {
  serpAnalysis: SERPAnalysis;
}

function OutlineView({ serpAnalysis }: OutlineViewProps) {
  const commonHeadings = serpAnalysis.commonHeadings || [];
  
  return (
    <div className="space-y-4">
      <div className="p-3 rounded-lg border bg-muted/30">
        <div className="flex items-center gap-2 mb-2">
          <Award className="h-4 w-4 text-yellow-500" />
          <span className="text-sm font-medium">Common Headings</span>
        </div>
        <p className="text-xs text-muted-foreground mb-3">
          Headings used by multiple top-ranking competitors
        </p>
        
        <div className="space-y-1">
          {commonHeadings.length > 0 ? (
            commonHeadings.map((pattern, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 p-2 rounded-lg bg-background"
              >
                <Badge
                  variant={
                    pattern.importance === 'critical' ? 'destructive' :
                    pattern.importance === 'high' ? 'default' :
                    'secondary'
                  }
                  className="text-[10px] shrink-0"
                >
                  {Math.round(pattern.percentage)}%
                </Badge>
                <span className="text-xs flex-1 truncate">{pattern.item}</span>
                <span className="text-[10px] text-muted-foreground">
                  {pattern.frequency} competitors
                </span>
              </div>
            ))
          ) : (
            <p className="text-xs text-muted-foreground text-center py-4">
              No common headings found
            </p>
          )}
        </div>
      </div>
      
      {/* Common Terms */}
      <div className="p-3 rounded-lg border bg-muted/30">
        <div className="flex items-center gap-2 mb-2">
          <Zap className="h-4 w-4 text-blue-500" />
          <span className="text-sm font-medium">Common Terms</span>
        </div>
        
        <div className="flex flex-wrap gap-1">
          {(serpAnalysis.commonTerms || []).slice(0, 20).map((term, idx) => (
            <Badge
              key={idx}
              variant={
                term.importance === 'critical' ? 'destructive' :
                term.importance === 'high' ? 'default' :
                'outline'
              }
              className="text-[10px]"
            >
              {term.item}
            </Badge>
          ))}
        </div>
      </div>
      
      {/* Feature Frequency */}
      <div className="p-3 rounded-lg border bg-muted/30">
        <div className="flex items-center gap-2 mb-2">
          <BarChart3 className="h-4 w-4 text-purple-500" />
          <span className="text-sm font-medium">Content Features</span>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <FeatureFrequencyItem
            label="FAQ Section"
            value={serpAnalysis.featureFrequency?.faq || 0}
          />
          <FeatureFrequencyItem
            label="Table of Contents"
            value={serpAnalysis.featureFrequency?.tableOfContents || 0}
          />
          <FeatureFrequencyItem
            label="Video Content"
            value={serpAnalysis.featureFrequency?.video || 0}
          />
          <FeatureFrequencyItem
            label="Schema Markup"
            value={serpAnalysis.featureFrequency?.schemaMarkup || 0}
          />
        </div>
      </div>
    </div>
  );
}

function FeatureFrequencyItem({ label, value }: { label: string; value: number }) {
  return (
    <div className="p-2 rounded-lg bg-background">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className="text-xs font-medium">{Math.round(value)}%</span>
      </div>
      <Progress value={value} className="h-1" />
    </div>
  );
}

// -----------------------------------------------------------------------------
// Export
// -----------------------------------------------------------------------------

export default CompetitorAnalysisPanel;

