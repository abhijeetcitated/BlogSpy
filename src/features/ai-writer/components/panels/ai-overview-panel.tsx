/**
 * AI Overview Visibility Panel Component
 * 
 * UI for analyzing content visibility in AI search overviews
 */

'use client';

import React, { useState, useMemo } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Label } from '@/components/ui/label';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import {
  Eye,
  RefreshCw,
  Download,
  ChevronDown,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Search,
  Target,
  FileText,
  Lightbulb,
  Sparkles,
  Copy,
  ArrowRight,
  Zap,
  Shield,
  TrendingUp,
  Clock,
  Heart,
  Info
} from 'lucide-react';
import { useAIOverview } from '@/src/features/ai-writer/hooks/tools/use-ai-overview';
import {
  AIOverviewFactor,
  AIOverviewOptimization,
  SnippetCandidate,
  FactorCategory,
  VisibilityScore,
  ContentFormat,
  OptimizationPriority,
  AIOverviewSortOption,
  VISIBILITY_SCORE_LABELS,
  CONTENT_FORMAT_LABELS,
  FACTOR_CATEGORY_LABELS
} from '@/src/features/ai-writer/types/tools/ai-overview.types';

// =============================================================================
// HELPER COMPONENTS
// =============================================================================

interface ScoreRingProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

function ScoreRing({ score, size = 'md', showLabel = true }: ScoreRingProps) {
  const dimensions = {
    sm: { width: 60, stroke: 4 },
    md: { width: 80, stroke: 6 },
    lg: { width: 120, stroke: 8 }
  };

  const { width, stroke } = dimensions[size];
  const radius = (width - stroke) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (score / 100) * circumference;

  const getColor = () => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-blue-500';
    if (score >= 40) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={width} height={width} className="-rotate-90">
        <circle
          cx={width / 2}
          cy={width / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          className="text-muted/20"
        />
        <circle
          cx={width / 2}
          cy={width / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={cn("transition-all duration-500", getColor())}
        />
      </svg>
      {showLabel && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn("font-bold", size === 'lg' ? 'text-2xl' : 'text-lg')}>
            {score}
          </span>
          <span className="text-xs text-muted-foreground">/100</span>
        </div>
      )}
    </div>
  );
}

interface VisibilityBadgeProps {
  level: VisibilityScore;
}

function VisibilityBadge({ level }: VisibilityBadgeProps) {
  const config = {
    excellent: { className: 'bg-green-500/10 text-green-500 border-green-500/20', icon: <CheckCircle className="h-3 w-3" /> },
    good: { className: 'bg-blue-500/10 text-blue-500 border-blue-500/20', icon: <CheckCircle className="h-3 w-3" /> },
    moderate: { className: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20', icon: <AlertTriangle className="h-3 w-3" /> },
    poor: { className: 'bg-orange-500/10 text-orange-500 border-orange-500/20', icon: <AlertTriangle className="h-3 w-3" /> },
    critical: { className: 'bg-red-500/10 text-red-500 border-red-500/20', icon: <XCircle className="h-3 w-3" /> }
  };

  const { className, icon } = config[level];
  return (
    <Badge variant="outline" className={cn('gap-1', className)}>
      {icon}
      {VISIBILITY_SCORE_LABELS[level]}
    </Badge>
  );
}

interface StatusBadgeProps {
  status: 'pass' | 'warning' | 'fail';
}

function StatusBadge({ status }: StatusBadgeProps) {
  const config = {
    pass: { label: 'Pass', className: 'bg-green-500/10 text-green-500', icon: <CheckCircle className="h-3 w-3" /> },
    warning: { label: 'Warning', className: 'bg-yellow-500/10 text-yellow-500', icon: <AlertTriangle className="h-3 w-3" /> },
    fail: { label: 'Fail', className: 'bg-red-500/10 text-red-500', icon: <XCircle className="h-3 w-3" /> }
  };

  const { label, className, icon } = config[status];
  return (
    <Badge variant="outline" className={cn('gap-1', className)}>
      {icon}
      {label}
    </Badge>
  );
}

interface CategoryIconProps {
  category: FactorCategory;
  className?: string;
}

function CategoryIcon({ category, className }: CategoryIconProps) {
  const icons: Record<FactorCategory, React.ReactNode> = {
    structure: <FileText className={cn("h-4 w-4", className)} />,
    authority: <Shield className={cn("h-4 w-4", className)} />,
    relevance: <Target className={cn("h-4 w-4", className)} />,
    freshness: <Clock className={cn("h-4 w-4", className)} />,
    engagement: <Heart className={cn("h-4 w-4", className)} />
  };
  
  return icons[category];
}

interface PriorityBadgeProps {
  priority: OptimizationPriority;
}

function PriorityBadge({ priority }: PriorityBadgeProps) {
  const config = {
    critical: { className: 'bg-red-500/10 text-red-500' },
    high: { className: 'bg-orange-500/10 text-orange-500' },
    medium: { className: 'bg-yellow-500/10 text-yellow-500' },
    low: { className: 'bg-green-500/10 text-green-500' }
  };

  return (
    <Badge variant="outline" className={config[priority].className}>
      {priority.charAt(0).toUpperCase() + priority.slice(1)}
    </Badge>
  );
}

// =============================================================================
// FACTOR CARD
// =============================================================================

interface FactorCardProps {
  factor: AIOverviewFactor;
}

function FactorCard({ factor }: FactorCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={cn(
      "border rounded-lg p-3 space-y-2 transition-colors",
      factor.status === 'pass' && "bg-green-500/5 border-green-500/20",
      factor.status === 'warning' && "bg-yellow-500/5 border-yellow-500/20",
      factor.status === 'fail' && "bg-red-500/5 border-red-500/20"
    )}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <CategoryIcon category={factor.category} className="text-muted-foreground" />
          <div>
            <h4 className="font-medium text-sm">{factor.name}</h4>
            <p className="text-xs text-muted-foreground">{FACTOR_CATEGORY_LABELS[factor.category]}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm">{factor.score}/{factor.maxScore}</span>
          <StatusBadge status={factor.status} />
        </div>
      </div>

      <Progress value={(factor.score / factor.maxScore) * 100} className="h-1.5" />

      <p className="text-sm text-muted-foreground">{factor.description}</p>

      <Collapsible open={expanded} onOpenChange={setExpanded}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" className="w-full h-7">
            <ChevronDown className={cn("h-4 w-4 transition-transform", expanded && "rotate-180")} />
            {expanded ? 'Hide Details' : 'Show Details'}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-2 pt-2">
          {factor.details.length > 0 && (
            <div className="space-y-1">
              <Label className="text-xs">Details:</Label>
              <ul className="text-sm text-muted-foreground space-y-1">
                {factor.details.map((detail, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Info className="h-3 w-3 mt-0.5 shrink-0" />
                    {detail}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {factor.recommendations.length > 0 && (
            <div className="space-y-1">
              <Label className="text-xs">Recommendations:</Label>
              <ul className="text-sm space-y-1">
                {factor.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start gap-2 text-primary">
                    <Lightbulb className="h-3 w-3 mt-0.5 shrink-0" />
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

// =============================================================================
// SNIPPET CARD
// =============================================================================

interface SnippetCardProps {
  snippet: SnippetCandidate;
  isSelected: boolean;
  onSelect: () => void;
  onCopy: () => void;
}

function SnippetCard({ snippet, isSelected, onSelect, onCopy }: SnippetCardProps) {
  return (
    <div className={cn(
      "border rounded-lg p-3 space-y-2 cursor-pointer transition-colors",
      isSelected ? "border-primary bg-primary/5" : "hover:bg-muted/50"
    )} onClick={onSelect}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <Badge variant="outline">
            {CONTENT_FORMAT_LABELS[snippet.format]}
          </Badge>
          <span className="text-sm font-medium">{snippet.confidence}% confidence</span>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); onCopy(); }}>
                <Copy className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Copy Snippet</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="p-2 bg-muted/30 rounded text-sm">
        {snippet.text.slice(0, 200)}{snippet.text.length > 200 && '...'}
      </div>

      {snippet.reasons.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {snippet.reasons.map((reason, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {reason}
            </Badge>
          ))}
        </div>
      )}

      {snippet.improvements.length > 0 && (
        <div className="text-xs text-yellow-600 flex items-start gap-1">
          <AlertTriangle className="h-3 w-3 mt-0.5 shrink-0" />
          {snippet.improvements[0]}
        </div>
      )}
    </div>
  );
}

// =============================================================================
// OPTIMIZATION CARD
// =============================================================================

interface OptimizationCardProps {
  optimization: AIOverviewOptimization;
}

function OptimizationCard({ optimization }: OptimizationCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={cn(
      "border rounded-lg p-3 border-l-4",
      optimization.priority === 'critical' && "border-l-red-500",
      optimization.priority === 'high' && "border-l-orange-500",
      optimization.priority === 'medium' && "border-l-yellow-500",
      optimization.priority === 'low' && "border-l-green-500"
    )}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <CategoryIcon category={optimization.category} />
          <h4 className="font-medium text-sm">{optimization.title}</h4>
        </div>
        <div className="flex items-center gap-1">
          <PriorityBadge priority={optimization.priority} />
        </div>
      </div>

      <p className="text-sm text-muted-foreground mb-2">{optimization.description}</p>

      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <TrendingUp className="h-3 w-3" />
          Impact: {optimization.impact}
        </span>
        <span className="flex items-center gap-1">
          <Zap className="h-3 w-3" />
          Effort: {optimization.effort}
        </span>
      </div>

      {(optimization.example || optimization.beforeAfter) && (
        <Collapsible open={expanded} onOpenChange={setExpanded}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="w-full h-7 mt-2">
              <ChevronDown className={cn("h-4 w-4 transition-transform", expanded && "rotate-180")} />
              {expanded ? 'Hide Example' : 'Show Example'}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-2">
            {optimization.example && (
              <div className="p-2 bg-muted/30 rounded text-sm">
                {optimization.example}
              </div>
            )}
            {optimization.beforeAfter && (
              <div className="space-y-2">
                <div className="p-2 bg-red-500/10 rounded text-sm">
                  <span className="text-xs font-medium text-red-500">Before:</span>
                  <p>{optimization.beforeAfter.before}</p>
                </div>
                <div className="flex justify-center">
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="p-2 bg-green-500/10 rounded text-sm">
                  <span className="text-xs font-medium text-green-500">After:</span>
                  <p>{optimization.beforeAfter.after}</p>
                </div>
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  );
}

// =============================================================================
// TABS
// =============================================================================

interface OverviewTabProps {
  aiOverview: ReturnType<typeof useAIOverview>;
}

function OverviewTab({ aiOverview }: OverviewTabProps) {
  const { analysis, metrics, summary } = aiOverview;

  if (!analysis || !metrics || !summary) {
    return (
      <div className="flex items-center justify-center h-48 text-muted-foreground">
        <p>Enter a target query and click "Analyze"</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[calc(100vh-350px)]">
      <div className="space-y-6 pr-4">
        {/* Score Section */}
        <div className="flex items-center justify-center p-6 bg-linear-to-br from-primary/5 to-primary/10 rounded-lg">
          <div className="text-center space-y-2">
            <ScoreRing score={analysis.overallScore} size="lg" />
            <VisibilityBadge level={analysis.visibilityLevel} />
            <p className="text-sm text-muted-foreground">AI Overview Visibility Score</p>
          </div>
        </div>

        {/* Verdict */}
        <div className="p-4 border rounded-lg">
          <h4 className="font-medium mb-2 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            Analysis Verdict
          </h4>
          <p className="text-sm">{summary.verdict}</p>
        </div>

        {/* Format Analysis */}
        <div className="p-4 border rounded-lg space-y-3">
          <h4 className="font-medium">Content Format</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Detected Format</p>
              <Badge variant="outline">{CONTENT_FORMAT_LABELS[analysis.detectedFormat]}</Badge>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Recommended Format</p>
              <Badge variant="secondary">{CONTENT_FORMAT_LABELS[analysis.recommendedFormat]}</Badge>
            </div>
          </div>
          {analysis.detectedFormat !== analysis.recommendedFormat && (
            <div className="text-sm text-yellow-600 flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
              Consider restructuring content to match the recommended format
            </div>
          )}
        </div>

        {/* Category Scores */}
        <div className="p-4 border rounded-lg space-y-3">
          <h4 className="font-medium">Category Scores</h4>
          {Object.entries(FACTOR_CATEGORY_LABELS).map(([category, label]) => (
            <div key={category} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <CategoryIcon category={category as FactorCategory} className="text-muted-foreground" />
                  {label}
                </span>
                <span className="font-medium">
                  {Math.round(metrics.categoryScores[category as FactorCategory])}%
                </span>
              </div>
              <Progress 
                value={metrics.categoryScores[category as FactorCategory]} 
                className="h-1.5" 
              />
            </div>
          ))}
        </div>

        {/* Strengths */}
        {summary.strengths.length > 0 && (
          <div className="p-4 border rounded-lg border-green-500/20 bg-green-500/5">
            <h4 className="font-medium text-green-600 flex items-center gap-2 mb-2">
              <CheckCircle className="h-4 w-4" />
              Strengths
            </h4>
            <ul className="space-y-1">
              {summary.strengths.map((strength, index) => (
                <li key={index} className="text-sm flex items-start gap-2">
                  <CheckCircle className="h-3 w-3 mt-0.5 text-green-500 shrink-0" />
                  {strength}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Weaknesses */}
        {summary.weaknesses.length > 0 && (
          <div className="p-4 border rounded-lg border-red-500/20 bg-red-500/5">
            <h4 className="font-medium text-red-600 flex items-center gap-2 mb-2">
              <XCircle className="h-4 w-4" />
              Areas for Improvement
            </h4>
            <ul className="space-y-1">
              {summary.weaknesses.map((weakness, index) => (
                <li key={index} className="text-sm flex items-start gap-2">
                  <XCircle className="h-3 w-3 mt-0.5 text-red-500 shrink-0" />
                  {weakness}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Quick Wins */}
        {summary.quickWins.length > 0 && (
          <div className="p-4 border rounded-lg border-yellow-500/20 bg-yellow-500/5">
            <h4 className="font-medium text-yellow-600 flex items-center gap-2 mb-2">
              <Zap className="h-4 w-4" />
              Quick Wins
            </h4>
            <ul className="space-y-1">
              {summary.quickWins.map((win, index) => (
                <li key={index} className="text-sm flex items-start gap-2">
                  <Lightbulb className="h-3 w-3 mt-0.5 text-yellow-500 shrink-0" />
                  {win}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </ScrollArea>
  );
}

interface FactorsTabProps {
  aiOverview: ReturnType<typeof useAIOverview>;
}

function FactorsTab({ aiOverview }: FactorsTabProps) {
  const { factors, filterFactors, sortFactors } = aiOverview;
  const [categoryFilter, setCategoryFilter] = useState<FactorCategory | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pass' | 'warning' | 'fail'>('all');
  const [sortBy, setSortBy] = useState<AIOverviewSortOption>('status');

  const filteredFactors = useMemo(() => {
    const filtered = filterFactors({ category: categoryFilter, status: statusFilter });
    return sortFactors(filtered, sortBy);
  }, [filterFactors, sortFactors, categoryFilter, statusFilter, sortBy]);

  if (factors.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-muted-foreground">
        <p>No factors to display</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        <Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v as FactorCategory | 'all')}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {Object.entries(FACTOR_CATEGORY_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as 'all' | 'pass' | 'warning' | 'fail')}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pass">Pass</SelectItem>
            <SelectItem value="warning">Warning</SelectItem>
            <SelectItem value="fail">Fail</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={(v) => setSortBy(v as AIOverviewSortOption)}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="status">Status</SelectItem>
            <SelectItem value="score">Score</SelectItem>
            <SelectItem value="category">Category</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <p className="text-sm text-muted-foreground">
        {filteredFactors.length} of {factors.length} factors
      </p>

      <ScrollArea className="h-[calc(100vh-420px)]">
        <div className="space-y-3 pr-4">
          {filteredFactors.map((factor) => (
            <FactorCard key={factor.id} factor={factor} />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

interface SnippetsTabProps {
  aiOverview: ReturnType<typeof useAIOverview>;
}

function SnippetsTab({ aiOverview }: SnippetsTabProps) {
  const { snippetCandidates, analysis } = aiOverview;
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
  };

  if (snippetCandidates.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-muted-foreground flex-col gap-2">
        <Eye className="h-8 w-8 opacity-50" />
        <p>No snippet candidates found</p>
        <p className="text-xs">Add a direct answer or definition to your content</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="p-4 border rounded-lg bg-muted/30">
        <h4 className="font-medium mb-2 flex items-center gap-2">
          <Target className="h-4 w-4" />
          Best Candidate
        </h4>
        {analysis?.bestCandidate ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                {CONTENT_FORMAT_LABELS[analysis.bestCandidate.format]}
              </Badge>
              <span className="text-sm font-medium text-green-500">
                {analysis.bestCandidate.confidence}% confidence
              </span>
            </div>
            <div className="p-2 bg-background rounded text-sm">
              {analysis.bestCandidate.text}
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No suitable snippet detected</p>
        )}
      </div>

      <h4 className="font-medium">All Candidates ({snippetCandidates.length})</h4>

      <ScrollArea className="h-[calc(100vh-480px)]">
        <div className="space-y-3 pr-4">
          {snippetCandidates.map((snippet) => (
            <SnippetCard
              key={snippet.id}
              snippet={snippet}
              isSelected={selectedId === snippet.id}
              onSelect={() => setSelectedId(snippet.id)}
              onCopy={() => handleCopy(snippet.text)}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

interface OptimizationsTabProps {
  optimizations: AIOverviewOptimization[];
}

function OptimizationsTab({ optimizations }: OptimizationsTabProps) {
  const [priorityFilter, setPriorityFilter] = useState<OptimizationPriority | 'all'>('all');

  const filtered = useMemo(() => {
    if (priorityFilter === 'all') return optimizations;
    return optimizations.filter(o => o.priority === priorityFilter);
  }, [optimizations, priorityFilter]);

  if (optimizations.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-muted-foreground flex-col gap-2">
        <CheckCircle className="h-8 w-8 opacity-50" />
        <p>No optimizations needed</p>
        <p className="text-xs">Your content is well-optimized!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {filtered.length} optimizations
        </p>
        <Select value={priorityFilter} onValueChange={(v) => setPriorityFilter(v as OptimizationPriority | 'all')}>
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <ScrollArea className="h-[calc(100vh-380px)]">
        <div className="space-y-3 pr-4">
          {filtered.map((opt) => (
            <OptimizationCard key={opt.id} optimization={opt} />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

interface AIOverviewPanelProps {
  content: string;
  defaultQuery?: string;
  trigger?: React.ReactNode;
}

export function AIOverviewPanel({ content, defaultQuery = '', trigger }: AIOverviewPanelProps) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [query, setQuery] = useState(defaultQuery);

  const aiOverview = useAIOverview(content, {
    autoAnalyze: false
  });

  const { isAnalyzing, analyze, analysis, exportReport, metrics } = aiOverview;

  const handleAnalyze = async () => {
    if (query.trim()) {
      await analyze(content, query);
    }
  };

  const handleExport = (format: 'markdown' | 'json') => {
    const result = exportReport(format);
    if (result) {
      const blob = new Blob([result], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ai-overview-report.${format === 'markdown' ? 'md' : format}`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Eye className="h-4 w-4 mr-2" />
            AI Overview
          </Button>
        )}
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-xl">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            AI Overview Visibility
          </SheetTitle>
          <SheetDescription>
            Optimize your content for AI search overview results
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {/* Query Input */}
          <div className="space-y-2">
            <Label>Target Search Query</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="e.g., What is SEO?"
                  className="pl-9"
                  onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
                />
              </div>
              <Button
                onClick={handleAnalyze}
                disabled={isAnalyzing || !query.trim() || !content.trim()}
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Analyze
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Stats Bar */}
          {metrics && (
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3 text-green-500" />
                {metrics.passedFactors} passed
              </span>
              <span className="flex items-center gap-1">
                <AlertTriangle className="h-3 w-3 text-yellow-500" />
                {metrics.warningFactors} warnings
              </span>
              <span className="flex items-center gap-1">
                <XCircle className="h-3 w-3 text-red-500" />
                {metrics.failedFactors} failed
              </span>
            </div>
          )}

          {/* Export Button */}
          {analysis && (
            <div className="flex justify-end">
              <Select onValueChange={(v) => handleExport(v as 'markdown' | 'json')}>
                <SelectTrigger className="w-[100px]">
                  <Download className="h-4 w-4 mr-1" />
                  Export
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="markdown">Markdown</SelectItem>
                  <SelectItem value="json">JSON</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="factors">
                Factors
                {metrics && (
                  <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                    {aiOverview.factors.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="snippets">Snippets</TabsTrigger>
              <TabsTrigger value="optimizations">
                Actions
                {aiOverview.optimizations.length > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                    {aiOverview.optimizations.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-4">
              <OverviewTab aiOverview={aiOverview} />
            </TabsContent>

            <TabsContent value="factors" className="mt-4">
              <FactorsTab aiOverview={aiOverview} />
            </TabsContent>

            <TabsContent value="snippets" className="mt-4">
              <SnippetsTab aiOverview={aiOverview} />
            </TabsContent>

            <TabsContent value="optimizations" className="mt-4">
              <OptimizationsTab optimizations={aiOverview.optimizations} />
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
}

