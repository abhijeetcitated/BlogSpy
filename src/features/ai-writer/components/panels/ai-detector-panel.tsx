/**
 * AI Content Detector Panel Component
 * 
 * Comprehensive AI-generated content detection UI
 */

'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
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
  Bot,
  User,
  Search,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  Download,
  RefreshCw,
  Brain,
  Sparkles,
  Lightbulb,
  BarChart3,
  Eye
} from 'lucide-react';
import { useAIDetector } from '@/src/features/ai-writer/hooks/tools/use-ai-detector';
import {
  SectionAnalysis,
  AIDetectionMetrics,
  AIDetectionSummary,
  AIDetectionRecommendation,
  AIIndicator,
  AIDetectionResult,
  ConfidenceLevel,
  TextPattern,
  AIDetectionFilterState,
  AIDetectionSortOption,
  DETECTION_RESULT_LABELS,
  CONFIDENCE_LABELS,
  TEXT_PATTERN_LABELS,
  RISK_LEVEL_LABELS
} from '@/src/features/ai-writer/types/tools/ai-detector.types';

// =============================================================================
// TYPES
// =============================================================================

interface AIDetectorPanelProps {
  content: string;
  trigger?: React.ReactNode;
  className?: string;
  onAnalysisComplete?: (aiScore: number) => void;
}

// =============================================================================
// HELPER COMPONENTS
// =============================================================================

// Score visualization
const ScoreGauge: React.FC<{
  humanScore: number;
  aiScore: number;
  size?: number;
}> = ({ humanScore, aiScore, size = 120 }) => {
  return (
    <div className="relative" style={{ width: size, height: size }}>
      {/* Background circle */}
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          className="stroke-muted"
          strokeWidth={12}
          fill="transparent"
          r={(size - 12) / 2}
          cx={size / 2}
          cy={size / 2}
        />
        {/* Human score (green) */}
        <circle
          className="stroke-green-500 transition-all duration-500"
          strokeWidth={12}
          strokeDasharray={((size - 12) * Math.PI)}
          strokeDashoffset={((size - 12) * Math.PI) * (1 - humanScore / 100)}
          strokeLinecap="round"
          fill="transparent"
          r={(size - 12) / 2}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      
      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn(
          'text-2xl font-bold',
          humanScore >= 60 ? 'text-green-600' : 
          humanScore >= 40 ? 'text-yellow-600' : 'text-red-600'
        )}>
          {humanScore}%
        </span>
        <span className="text-xs text-muted-foreground">Human</span>
      </div>
    </div>
  );
};

// Result badge
const ResultBadge: React.FC<{ result: AIDetectionResult }> = ({ result }) => {
  const config: Record<AIDetectionResult, { icon: typeof User; class: string }> = {
    human: { icon: User, class: 'bg-green-100 text-green-700' },
    ai_generated: { icon: Bot, class: 'bg-red-100 text-red-700' },
    mixed: { icon: Sparkles, class: 'bg-yellow-100 text-yellow-700' },
    uncertain: { icon: AlertCircle, class: 'bg-gray-100 text-gray-700' }
  };
  
  const cfg = config[result];
  const Icon = cfg.icon;
  
  return (
    <Badge variant="outline" className={cn('gap-1', cfg.class)}>
      <Icon className="w-3 h-3" />
      {DETECTION_RESULT_LABELS[result]}
    </Badge>
  );
};

// Confidence badge
const ConfidenceBadge: React.FC<{ confidence: ConfidenceLevel }> = ({ confidence }) => {
  const config: Record<ConfidenceLevel, string> = {
    high: 'bg-green-100 text-green-700',
    medium: 'bg-blue-100 text-blue-700',
    low: 'bg-yellow-100 text-yellow-700',
    very_low: 'bg-gray-100 text-gray-700'
  };
  
  return (
    <Badge variant="outline" className={cn('text-xs', config[confidence])}>
      {CONFIDENCE_LABELS[confidence]}
    </Badge>
  );
};

// Section card
const SectionCard: React.FC<{
  section: SectionAnalysis;
}> = ({ section }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
      <div className={cn(
        'rounded-lg border transition-colors',
        section.result === 'ai_generated' && 'border-red-200 bg-red-50/30',
        section.result === 'human' && 'border-green-200 bg-green-50/30',
        section.result === 'mixed' && 'border-yellow-200 bg-yellow-50/30'
      )}>
        <CollapsibleTrigger asChild>
          <div className="p-3 cursor-pointer hover:bg-muted/30">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <ResultBadge result={section.result} />
                  <Badge variant="secondary" className="text-xs">
                    {section.aiScore}% AI
                  </Badge>
                  <ConfidenceBadge confidence={section.confidence} />
                </div>
                <p className="text-sm mt-2 line-clamp-2 text-muted-foreground">
                  {section.text.substring(0, 150)}
                  {section.text.length > 150 ? '...' : ''}
                </p>
              </div>
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 shrink-0" />
              ) : (
                <ChevronRight className="w-4 h-4 shrink-0" />
              )}
            </div>
          </div>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <div className="px-3 pb-3 space-y-3 border-t pt-3">
            {/* Score bars */}
            <div className="space-y-2">
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3 text-green-600" />
                    Human
                  </span>
                  <span className="font-medium">{section.humanScore}%</span>
                </div>
                <Progress value={section.humanScore} className="h-2" />
              </div>
              
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="flex items-center gap-1">
                    <Bot className="w-3 h-3 text-red-600" />
                    AI
                  </span>
                  <span className="font-medium">{section.aiScore}%</span>
                </div>
                <Progress value={section.aiScore} className="h-2 [&>div]:bg-red-500" />
              </div>
            </div>
            
            {/* Metrics */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 rounded bg-muted/50">
                <span className="text-muted-foreground">Burstiness:</span>
                <span className="font-medium ml-1">{section.burstiness}</span>
              </div>
              <div className="p-2 rounded bg-muted/50">
                <span className="text-muted-foreground">Perplexity:</span>
                <span className="font-medium ml-1">{section.perplexity}</span>
              </div>
              <div className="p-2 rounded bg-muted/50">
                <span className="text-muted-foreground">Repetition:</span>
                <span className="font-medium ml-1">{section.repetitionScore}</span>
              </div>
              <div className="p-2 rounded bg-muted/50">
                <span className="text-muted-foreground">Vocab:</span>
                <span className="font-medium ml-1">{section.vocabularyRichness}</span>
              </div>
            </div>
            
            {/* Patterns */}
            {section.patterns.length > 0 && (
              <div>
                <span className="text-xs font-medium">Patterns:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {section.patterns.map(pattern => (
                    <Badge key={pattern} variant="outline" className="text-xs">
                      {TEXT_PATTERN_LABELS[pattern]}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            {/* Indicators */}
            {section.indicators.length > 0 && (
              <div>
                <span className="text-xs font-medium">Indicators:</span>
                <ul className="mt-1 space-y-1">
                  {section.indicators.slice(0, 3).map(indicator => (
                    <li key={indicator.id} className="text-xs text-muted-foreground flex items-start gap-1">
                      <AlertTriangle className="w-3 h-3 text-yellow-500 shrink-0 mt-0.5" />
                      {indicator.name}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};

// Indicator card
const IndicatorCard: React.FC<{ indicator: AIIndicator }> = ({ indicator }) => (
  <div className="p-3 rounded-lg border">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className={cn(
          'w-6 h-6 rounded-full flex items-center justify-center',
          indicator.detected ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
        )}>
          {indicator.detected ? (
            <AlertTriangle className="w-3 h-3" />
          ) : (
            <CheckCircle2 className="w-3 h-3" />
          )}
        </div>
        <span className="font-medium text-sm">{indicator.name}</span>
      </div>
      <Badge variant="outline" className="text-xs">
        {indicator.confidence}% conf
      </Badge>
    </div>
    <p className="text-xs text-muted-foreground mt-2">{indicator.description}</p>
    {indicator.examples.length > 0 && (
      <div className="mt-2">
        <span className="text-xs text-muted-foreground">Examples: </span>
        <span className="text-xs">{indicator.examples.join(', ')}</span>
      </div>
    )}
  </div>
);

// Recommendation card
const RecommendationCard: React.FC<{
  recommendation: AIDetectionRecommendation;
}> = ({ recommendation }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
      <div className="rounded-lg border">
        <CollapsibleTrigger asChild>
          <div className="p-3 cursor-pointer hover:bg-muted/30">
            <div className="flex items-start gap-3">
              <div className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center shrink-0',
                recommendation.priority === 'high' && 'bg-red-100 text-red-600',
                recommendation.priority === 'medium' && 'bg-yellow-100 text-yellow-600',
                recommendation.priority === 'low' && 'bg-blue-100 text-blue-600'
              )}>
                <Lightbulb className="w-4 h-4" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="font-medium">{recommendation.title}</div>
                <div className="text-sm text-muted-foreground mt-1">
                  {recommendation.description}
                </div>
              </div>
              
              <div className="flex items-center gap-2 shrink-0">
                <Badge variant="outline" className="text-xs">
                  Impact: {recommendation.impact}%
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
            <div className="text-xs font-medium">Tips:</div>
            <ul className="space-y-1">
              {recommendation.tips.map((tip, i) => (
                <li key={i} className="text-xs text-muted-foreground flex items-start gap-1">
                  <ChevronRight className="w-3 h-3 mt-0.5 shrink-0" />
                  {tip}
                </li>
              ))}
            </ul>
            
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                Effort: {recommendation.effort}
              </Badge>
              <Badge variant="outline" className="text-xs">
                Sections: {recommendation.affectedSections.length}
              </Badge>
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
  metrics: AIDetectionMetrics | null;
  summary: AIDetectionSummary | null;
}> = ({ metrics, summary }) => {
  if (!metrics || !summary) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Run analysis to detect AI content
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Main Score */}
      <div className="flex items-center gap-6">
        <ScoreGauge 
          humanScore={metrics.overallHumanScore}
          aiScore={metrics.overallAIScore}
        />
        
        <div className="flex-1">
          <ResultBadge result={summary.verdict} />
          <p className="text-sm text-muted-foreground mt-2">
            {summary.mainFinding}
          </p>
          <ConfidenceBadge confidence={summary.confidence} />
        </div>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        <div className="p-3 rounded-lg bg-muted/50 text-center">
          <div className="text-2xl font-bold">{metrics.totalWords}</div>
          <div className="text-xs text-muted-foreground">Words</div>
        </div>
        <div className="p-3 rounded-lg bg-green-500/10 text-center">
          <div className="text-2xl font-bold text-green-600">
            {metrics.sectionsByResult.human}
          </div>
          <div className="text-xs text-muted-foreground">Human</div>
        </div>
        <div className="p-3 rounded-lg bg-red-500/10 text-center">
          <div className="text-2xl font-bold text-red-600">
            {metrics.sectionsByResult.ai_generated}
          </div>
          <div className="text-xs text-muted-foreground">AI</div>
        </div>
        <div className="p-3 rounded-lg bg-yellow-500/10 text-center">
          <div className="text-2xl font-bold text-yellow-600">
            {metrics.sectionsByResult.mixed}
          </div>
          <div className="text-xs text-muted-foreground">Mixed</div>
        </div>
      </div>
      
      {/* Risk Level */}
      <div className={cn(
        'p-3 rounded-lg',
        metrics.riskLevel === 'safe' && 'bg-green-50 border border-green-200',
        metrics.riskLevel === 'low' && 'bg-blue-50 border border-blue-200',
        metrics.riskLevel === 'moderate' && 'bg-yellow-50 border border-yellow-200',
        metrics.riskLevel === 'high' && 'bg-orange-50 border border-orange-200',
        metrics.riskLevel === 'critical' && 'bg-red-50 border border-red-200'
      )}>
        <div className="flex items-center gap-2">
          {metrics.riskLevel === 'safe' ? (
            <CheckCircle2 className="w-5 h-5 text-green-600" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-orange-600" />
          )}
          <span className="font-medium">
            Risk Level: {RISK_LEVEL_LABELS[metrics.riskLevel]}
          </span>
        </div>
      </div>
      
      {/* Key Indicators */}
      {summary.keyIndicators.length > 0 && (
        <div>
          <h4 className="font-medium text-sm mb-2 flex items-center gap-1">
            <Brain className="w-4 h-4" />
            Key Indicators
          </h4>
          <ul className="space-y-1">
            {summary.keyIndicators.map((indicator, i) => (
              <li key={i} className="text-sm text-muted-foreground flex items-start gap-1">
                <Info className="w-3 h-3 mt-0.5 shrink-0" />
                {indicator}
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Concerns & Positives */}
      <div className="grid grid-cols-2 gap-4">
        {summary.concerns.length > 0 && (
          <div>
            <h4 className="font-medium text-sm text-red-600 mb-2 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              Concerns
            </h4>
            <ul className="space-y-1">
              {summary.concerns.map((c, i) => (
                <li key={i} className="text-xs text-muted-foreground">• {c}</li>
              ))}
            </ul>
          </div>
        )}
        
        {summary.positives.length > 0 && (
          <div>
            <h4 className="font-medium text-sm text-green-600 mb-2 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" />
              Positives
            </h4>
            <ul className="space-y-1">
              {summary.positives.map((p, i) => (
                <li key={i} className="text-xs text-muted-foreground">• {p}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
      
      {/* Writing Metrics */}
      <div>
        <h4 className="font-medium text-sm mb-2 flex items-center gap-1">
          <BarChart3 className="w-4 h-4" />
          Writing Metrics
        </h4>
        <div className="grid grid-cols-2 gap-2">
          <div className="p-2 rounded bg-muted/30">
            <div className="text-xs text-muted-foreground">Burstiness</div>
            <div className="flex items-center gap-2">
              <Progress value={metrics.burstiness} className="flex-1 h-2" />
              <span className="text-xs font-medium w-8">{metrics.burstiness}</span>
            </div>
          </div>
          <div className="p-2 rounded bg-muted/30">
            <div className="text-xs text-muted-foreground">Perplexity</div>
            <div className="flex items-center gap-2">
              <Progress value={metrics.perplexity} className="flex-1 h-2" />
              <span className="text-xs font-medium w-8">{metrics.perplexity}</span>
            </div>
          </div>
          <div className="p-2 rounded bg-muted/30">
            <div className="text-xs text-muted-foreground">Vocab Diversity</div>
            <div className="flex items-center gap-2">
              <Progress value={metrics.vocabularyDiversity} className="flex-1 h-2" />
              <span className="text-xs font-medium w-8">{metrics.vocabularyDiversity}</span>
            </div>
          </div>
          <div className="p-2 rounded bg-muted/30">
            <div className="text-xs text-muted-foreground">Repetition</div>
            <div className="flex items-center gap-2">
              <Progress value={metrics.repetitionIndex} className="flex-1 h-2" />
              <span className="text-xs font-medium w-8">{metrics.repetitionIndex}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Sections Tab
const SectionsTab: React.FC<{
  sections: SectionAnalysis[];
  filterSections: (filter: Partial<AIDetectionFilterState>) => SectionAnalysis[];
  sortSections: (sections: SectionAnalysis[], sortBy: AIDetectionSortOption) => SectionAnalysis[];
}> = ({ sections, filterSections, sortSections }) => {
  const [search, setSearch] = useState('');
  const [resultFilter, setResultFilter] = useState<AIDetectionResult | 'all'>('all');
  const [sortBy, setSortBy] = useState<AIDetectionSortOption>('aiScore');
  
  const filteredSections = useMemo(() => {
    let result = filterSections({
      search,
      result: resultFilter
    });
    return sortSections(result, sortBy);
  }, [sections, search, resultFilter, sortBy, filterSections, sortSections]);
  
  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search sections..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={resultFilter} onValueChange={(v) => setResultFilter(v as AIDetectionResult | 'all')}>
            <SelectTrigger className="w-28">
              <SelectValue placeholder="Result" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="human">Human</SelectItem>
              <SelectItem value="ai_generated">AI</SelectItem>
              <SelectItem value="mixed">Mixed</SelectItem>
              <SelectItem value="uncertain">Uncertain</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as AIDetectionSortOption)}>
            <SelectTrigger className="w-28">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="aiScore">AI Score</SelectItem>
              <SelectItem value="humanScore">Human Score</SelectItem>
              <SelectItem value="confidence">Confidence</SelectItem>
              <SelectItem value="position">Position</SelectItem>
              <SelectItem value="wordCount">Words</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Results count */}
      <div className="text-sm text-muted-foreground">
        {filteredSections.length} sections
      </div>
      
      {/* Section List */}
      <ScrollArea className="h-80">
        <div className="space-y-2 pr-2">
          {filteredSections.map(section => (
            <SectionCard key={section.id} section={section} />
          ))}
          
          {filteredSections.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No sections match your filters
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

// Indicators Tab
const IndicatorsTab: React.FC<{
  indicators: AIIndicator[];
}> = ({ indicators }) => {
  if (indicators.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Brain className="w-12 h-12 mx-auto mb-2 opacity-50" />
        <p>No indicators detected</p>
      </div>
    );
  }
  
  const detectedIndicators = indicators.filter(i => i.detected);
  const clearIndicators = indicators.filter(i => !i.detected);
  
  return (
    <ScrollArea className="h-96">
      <div className="space-y-4 pr-2">
        {detectedIndicators.length > 0 && (
          <div>
            <h4 className="font-medium text-sm text-red-600 mb-2 flex items-center gap-1">
              <AlertTriangle className="w-4 h-4" />
              AI Indicators Detected ({detectedIndicators.length})
            </h4>
            <div className="space-y-2">
              {detectedIndicators.map(indicator => (
                <IndicatorCard key={indicator.id} indicator={indicator} />
              ))}
            </div>
          </div>
        )}
        
        {clearIndicators.length > 0 && (
          <div>
            <h4 className="font-medium text-sm text-green-600 mb-2 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" />
              Human Indicators ({clearIndicators.length})
            </h4>
            <div className="space-y-2">
              {clearIndicators.map(indicator => (
                <IndicatorCard key={indicator.id} indicator={indicator} />
              ))}
            </div>
          </div>
        )}
      </div>
    </ScrollArea>
  );
};

// Recommendations Tab
const RecommendationsTab: React.FC<{
  recommendations: AIDetectionRecommendation[];
}> = ({ recommendations }) => {
  if (recommendations.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <CheckCircle2 className="w-12 h-12 mx-auto mb-2 text-green-500" />
        <p>Content looks human-like!</p>
      </div>
    );
  }
  
  return (
    <ScrollArea className="h-96">
      <div className="space-y-2 pr-2">
        {recommendations.map(rec => (
          <RecommendationCard key={rec.id} recommendation={rec} />
        ))}
      </div>
    </ScrollArea>
  );
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export const AIDetectorPanel: React.FC<AIDetectorPanelProps> = ({
  content,
  trigger,
  className,
  onAnalysisComplete
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  
  const {
    analysis,
    isAnalyzing,
    metrics,
    sections,
    indicators,
    recommendations,
    summary,
    analyze,
    filterSections,
    sortSections,
    exportReport
  } = useAIDetector();
  
  // Auto-analyze on content change
  useEffect(() => {
    if (content && content.length > 50) {
      analyze(content).then(() => {
        if (metrics?.overallAIScore !== undefined) {
          onAnalysisComplete?.(metrics.overallAIScore);
        }
      });
    }
  }, [content]);
  
  // Export handler
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
            <Bot className="w-4 h-4 mr-2" />
            AI Detector
            {metrics && (
              <Badge
                variant="outline"
                className={cn(
                  'ml-2',
                  metrics.overallHumanScore >= 75 && 'bg-green-100 text-green-700',
                  metrics.overallHumanScore >= 40 && metrics.overallHumanScore < 75 && 'bg-yellow-100 text-yellow-700',
                  metrics.overallHumanScore < 40 && 'bg-red-100 text-red-700'
                )}
              >
                {metrics.overallHumanScore}%
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
                <Bot className="w-5 h-5" />
                AI Content Detector
              </SheetTitle>
              <SheetDescription>
                Detect AI-generated content
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
                onClick={() => analyze(content)}
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
            <TabsTrigger value="sections" className="text-xs">Sections</TabsTrigger>
            <TabsTrigger value="indicators" className="text-xs">Indicators</TabsTrigger>
            <TabsTrigger value="recommendations" className="text-xs">Tips</TabsTrigger>
          </TabsList>
          
          <ScrollArea className="flex-1 mt-4">
            <TabsContent value="overview" className="m-0">
              <OverviewTab metrics={metrics} summary={summary} />
            </TabsContent>
            
            <TabsContent value="sections" className="m-0">
              <SectionsTab
                sections={sections}
                filterSections={filterSections}
                sortSections={sortSections}
              />
            </TabsContent>
            
            <TabsContent value="indicators" className="m-0">
              <IndicatorsTab indicators={indicators} />
            </TabsContent>
            
            <TabsContent value="recommendations" className="m-0">
              <RecommendationsTab recommendations={recommendations} />
            </TabsContent>
          </ScrollArea>
        </Tabs>
        
        {/* Analyzing overlay */}
        {isAnalyzing && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
            <div className="text-center">
              <Brain className="w-8 h-8 animate-pulse mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Analyzing content...</p>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default AIDetectorPanel;

