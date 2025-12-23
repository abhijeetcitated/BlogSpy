/**
 * Featured Snippet Optimizer Panel
 * 
 * Production-grade UI component for analyzing and optimizing content
 * for featured snippets in search results
 */

'use client';

import React, { useState, useMemo } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
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
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import {
  Trophy,
  Target,
  Sparkles,
  Copy,
  Check,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  List,
  Table2,
  FileText,
  Video,
  Calculator,
  GitCompare,
  Download,
  RefreshCw,
  Settings,
  Eye,
  Lightbulb,
  TrendingUp,
  ArrowRight,
  Search,
  Zap,
  X,
  BookOpen,
  HelpCircle
} from 'lucide-react';
import {
  SnippetType,
  SnippetQuality,
  OptimizationImpact,
  SnippetOptimizerResult,
  SnippetCandidate,
  SnippetIssue,
  SnippetOptimization,
  SnippetRecommendation,
  SnippetMetrics,
  SnippetOptimizerSettings,
  SNIPPET_TYPE_LABELS,
  SNIPPET_TYPE_DESCRIPTIONS,
  SNIPPET_TEMPLATES
} from '@/src/features/ai-writer/types/tools/snippet-optimizer.types';

// =============================================================================
// HELPER COMPONENTS
// =============================================================================

interface ScoreRingProps {
  score: number;
  size?: number;
  label?: string;
}

function ScoreRing({ score, size = 100, label }: ScoreRingProps) {
  const radius = (size - 10) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;

  const getColor = () => {
    if (score >= 85) return 'text-emerald-500';
    if (score >= 70) return 'text-green-500';
    if (score >= 50) return 'text-amber-500';
    if (score >= 30) return 'text-orange-500';
    return 'text-red-500';
  };

  return (
    <div className="relative flex flex-col items-center" style={{ width: size, height: size + (label ? 20 : 0) }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth="6"
          fill="none"
          className="text-muted/20"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth="6"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          strokeLinecap="round"
          className={cn('transition-all duration-700', getColor())}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center" style={{ height: size }}>
        <span className={cn('text-2xl font-bold', getColor())}>{score}</span>
      </div>
      {label && (
        <span className="mt-1 text-xs text-muted-foreground">{label}</span>
      )}
    </div>
  );
}

interface QualityBadgeProps {
  quality: SnippetQuality;
}

function QualityBadge({ quality }: QualityBadgeProps) {
  const config: Record<SnippetQuality, { label: string; className: string; icon: typeof CheckCircle2 }> = {
    excellent: { label: 'Excellent', className: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30', icon: Trophy },
    good: { label: 'Good', className: 'bg-green-500/10 text-green-500 border-green-500/30', icon: CheckCircle2 },
    moderate: { label: 'Moderate', className: 'bg-amber-500/10 text-amber-500 border-amber-500/30', icon: TrendingUp },
    poor: { label: 'Poor', className: 'bg-orange-500/10 text-orange-500 border-orange-500/30', icon: AlertTriangle },
    unoptimized: { label: 'Unoptimized', className: 'bg-red-500/10 text-red-500 border-red-500/30', icon: AlertCircle }
  };

  const { label, className, icon: Icon } = config[quality];

  return (
    <Badge variant="outline" className={cn('gap-1', className)}>
      <Icon className="h-3 w-3" />
      {label}
    </Badge>
  );
}

interface PriorityBadgeProps {
  priority: OptimizationImpact;
}

function PriorityBadge({ priority }: PriorityBadgeProps) {
  const config = {
    high: { label: 'High Impact', className: 'bg-red-500/10 text-red-500 border-red-500/30' },
    medium: { label: 'Medium Impact', className: 'bg-amber-500/10 text-amber-500 border-amber-500/30' },
    low: { label: 'Low Impact', className: 'bg-blue-500/10 text-blue-500 border-blue-500/30' }
  };

  const { label, className } = config[priority];

  return (
    <Badge variant="outline" className={cn('text-xs', className)}>
      {label}
    </Badge>
  );
}

interface SeverityBadgeProps {
  severity: 'error' | 'warning' | 'info';
}

function SeverityBadge({ severity }: SeverityBadgeProps) {
  const config = {
    error: { label: 'Error', className: 'bg-red-500/10 text-red-500', icon: AlertCircle },
    warning: { label: 'Warning', className: 'bg-amber-500/10 text-amber-500', icon: AlertTriangle },
    info: { label: 'Info', className: 'bg-blue-500/10 text-blue-500', icon: Lightbulb }
  };

  const { label, className, icon: Icon } = config[severity];

  return (
    <Badge variant="outline" className={cn('gap-1', className)}>
      <Icon className="h-3 w-3" />
      {label}
    </Badge>
  );
}

function SnippetTypeIcon({ type }: { type: SnippetType }) {
  const icons: Record<SnippetType, React.ComponentType<{ className?: string }>> = {
    paragraph: FileText,
    list: List,
    table: Table2,
    video: Video,
    definition: BookOpen,
    comparison: GitCompare,
    how_to: List,
    calculation: Calculator
  };

  const Icon = icons[type] || FileText;
  return <Icon className="h-4 w-4" />;
}

// =============================================================================
// CANDIDATE CARD
// =============================================================================

interface CandidateCardProps {
  candidate: SnippetCandidate;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onOptimize: () => void;
}

function CandidateCard({
  candidate,
  isExpanded,
  onToggleExpand,
  onOptimize
}: CandidateCardProps) {
  const [copied, setCopied] = useState(false);
  const [showOptimized, setShowOptimized] = useState(false);

  const handleCopy = async () => {
    const content = showOptimized && candidate.optimizedVersion 
      ? candidate.optimizedVersion 
      : candidate.content;
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-lg border p-4 transition-all hover:border-primary/50">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <SnippetTypeIcon type={candidate.type} />
          </div>
          <div>
            <h4 className="font-medium">{SNIPPET_TYPE_LABELS[candidate.type]}</h4>
            <div className="mt-1 flex items-center gap-2">
              <QualityBadge quality={candidate.quality} />
              <span className="text-xs text-muted-foreground">
                {candidate.wordCount} words
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ScoreRing score={candidate.score} size={50} />
        </div>
      </div>

      <Collapsible open={isExpanded} onOpenChange={onToggleExpand}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" className="mt-3 w-full justify-between">
            <span className="text-xs">View Details</span>
            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="mt-3 space-y-3">
            {/* Content Preview */}
            <div className="rounded-md bg-muted p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-medium">
                  {showOptimized ? 'Optimized Version' : 'Current Content'}
                </span>
                <div className="flex items-center gap-2">
                  {candidate.optimizedVersion && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 text-xs"
                      onClick={() => setShowOptimized(!showOptimized)}
                    >
                      {showOptimized ? 'Show Original' : 'Show Optimized'}
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleCopy}>
                    {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  </Button>
                </div>
              </div>
              <pre className="whitespace-pre-wrap text-xs">
                {showOptimized && candidate.optimizedVersion 
                  ? candidate.optimizedVersion 
                  : candidate.content.slice(0, 300) + (candidate.content.length > 300 ? '...' : '')}
              </pre>
            </div>

            {/* Strengths & Weaknesses */}
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <h5 className="mb-2 text-xs font-medium text-emerald-500">Strengths</h5>
                <ul className="space-y-1">
                  {candidate.strengths.map((s, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs">
                      <CheckCircle2 className="mt-0.5 h-3 w-3 text-emerald-500" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h5 className="mb-2 text-xs font-medium text-amber-500">Weaknesses</h5>
                <ul className="space-y-1">
                  {candidate.weaknesses.map((w, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs">
                      <AlertTriangle className="mt-0.5 h-3 w-3 text-amber-500" />
                      {w}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {candidate.optimizedVersion && (
              <Button
                variant="outline"
                size="sm"
                className="w-full gap-2"
                onClick={onOptimize}
              >
                <Sparkles className="h-4 w-4" />
                Apply Optimization
              </Button>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

// =============================================================================
// ISSUE CARD
// =============================================================================

interface IssueCardProps {
  issue: SnippetIssue;
}

function IssueCard({ issue }: IssueCardProps) {
  return (
    <div className="rounded-lg border p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2">
          {issue.severity === 'error' && <AlertCircle className="mt-0.5 h-4 w-4 text-red-500" />}
          {issue.severity === 'warning' && <AlertTriangle className="mt-0.5 h-4 w-4 text-amber-500" />}
          {issue.severity === 'info' && <Lightbulb className="mt-0.5 h-4 w-4 text-blue-500" />}
          <div>
            <p className="text-sm">{issue.message}</p>
            <p className="mt-1 text-xs text-primary">{issue.suggestion}</p>
          </div>
        </div>
        <SeverityBadge severity={issue.severity} />
      </div>
    </div>
  );
}

// =============================================================================
// RECOMMENDATION CARD
// =============================================================================

interface RecommendationCardProps {
  recommendation: SnippetRecommendation;
}

function RecommendationCard({ recommendation }: RecommendationCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const categoryIcons = {
    format: FileText,
    content: BookOpen,
    structure: List,
    keywords: Search,
    technical: Settings
  };

  const Icon = categoryIcons[recommendation.category];

  return (
    <div className="rounded-lg border p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
          <Icon className="h-4 w-4 text-primary" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between gap-2">
            <h4 className="font-medium">{recommendation.title}</h4>
            <PriorityBadge priority={recommendation.priority} />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{recommendation.description}</p>
          
          <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="mt-2 h-7 gap-1 px-2">
                {isExpanded ? 'Hide' : 'Show'} Action
                {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="mt-2 rounded-md bg-muted p-3">
                <div className="flex items-start gap-2">
                  <ArrowRight className="mt-0.5 h-4 w-4 text-primary" />
                  <div>
                    <p className="text-sm">{recommendation.action}</p>
                    <p className="mt-2 text-xs text-emerald-500">
                      Expected Impact: {recommendation.impact}
                    </p>
                  </div>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// TAB COMPONENTS
// =============================================================================

interface OverviewTabProps {
  metrics: SnippetMetrics;
  formatAnalysis: SnippetOptimizerResult['formatAnalysis'];
}

function OverviewTab({ metrics, formatAnalysis }: OverviewTabProps) {
  return (
    <div className="space-y-6">
      {/* Main Score */}
      <div className="flex items-center gap-6 rounded-lg border p-4">
        <ScoreRing score={metrics.overallScore} size={120} />
        <div className="flex-1">
          <h3 className="text-lg font-semibold">Snippet Optimization Score</h3>
          <div className="mt-1 flex items-center gap-2">
            <QualityBadge quality={metrics.quality} />
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            {metrics.quality === 'excellent' || metrics.quality === 'good'
              ? 'Your content is well-optimized for featured snippets'
              : 'There are opportunities to improve snippet eligibility'}
          </p>
          <div className="mt-3 flex items-center gap-4 text-sm">
            <span className="flex items-center gap-1">
              <Target className="h-4 w-4 text-primary" />
              {metrics.candidateCount} candidates
            </span>
            <span className="flex items-center gap-1 text-emerald-500">
              <Trophy className="h-4 w-4" />
              {metrics.highQualityCount} high quality
            </span>
            <span className="flex items-center gap-1 text-amber-500">
              <AlertTriangle className="h-4 w-4" />
              {metrics.issueCount} issues
            </span>
          </div>
        </div>
      </div>

      {/* Metric Scores */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border p-4">
          <h4 className="text-sm font-medium">Format Score</h4>
          <Progress value={metrics.formatScore} className="mt-2" />
          <p className="mt-1 text-xs text-muted-foreground">{metrics.formatScore}%</p>
        </div>
        <div className="rounded-lg border p-4">
          <h4 className="text-sm font-medium">Clarity Score</h4>
          <Progress value={metrics.clarityScore} className="mt-2" />
          <p className="mt-1 text-xs text-muted-foreground">{metrics.clarityScore}%</p>
        </div>
        <div className="rounded-lg border p-4">
          <h4 className="text-sm font-medium">Relevance Score</h4>
          <Progress value={metrics.relevanceScore} className="mt-2" />
          <p className="mt-1 text-xs text-muted-foreground">{metrics.relevanceScore}%</p>
        </div>
        <div className="rounded-lg border p-4">
          <h4 className="text-sm font-medium">Structure Score</h4>
          <Progress value={metrics.structureScore} className="mt-2" />
          <p className="mt-1 text-xs text-muted-foreground">{metrics.structureScore}%</p>
        </div>
      </div>

      {/* Format Analysis */}
      <div className="rounded-lg border p-4">
        <h3 className="font-semibold">Format Analysis</h3>
        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm">Current Format</span>
            <div className="flex items-center gap-2">
              {formatAnalysis.currentFormat && (
                <>
                  <SnippetTypeIcon type={formatAnalysis.currentFormat} />
                  <span className="text-sm font-medium">
                    {SNIPPET_TYPE_LABELS[formatAnalysis.currentFormat]}
                  </span>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Recommended Format</span>
            <div className="flex items-center gap-2">
              <SnippetTypeIcon type={formatAnalysis.recommendedFormat} />
              <span className="text-sm font-medium text-primary">
                {SNIPPET_TYPE_LABELS[formatAnalysis.recommendedFormat]}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Format Fit</span>
            <span className="text-sm font-medium">{formatAnalysis.formatFitScore}%</span>
          </div>
        </div>

        {formatAnalysis.alternatives.length > 0 && (
          <div className="mt-4">
            <h4 className="mb-2 text-sm font-medium">Alternative Formats</h4>
            <div className="space-y-2">
              {formatAnalysis.alternatives.map((alt, idx) => (
                <div key={idx} className="flex items-center justify-between rounded-md bg-muted/50 p-2">
                  <div className="flex items-center gap-2">
                    <SnippetTypeIcon type={alt.format} />
                    <span className="text-sm">{SNIPPET_TYPE_LABELS[alt.format]}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{alt.score}%</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface CandidatesTabProps {
  candidates: SnippetCandidate[];
  filterType: SnippetType | 'all';
  onFilterChange: (type: SnippetType | 'all') => void;
  onOptimize: (candidateId: string) => void;
}

function CandidatesTab({
  candidates,
  filterType,
  onFilterChange,
  onOptimize
}: CandidatesTabProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredCandidates = useMemo(() => {
    if (filterType === 'all') return candidates;
    return candidates.filter(c => c.type === filterType);
  }, [candidates, filterType]);

  const availableTypes = useMemo(() => {
    const types = new Set(candidates.map(c => c.type));
    return Array.from(types);
  }, [candidates]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Snippet Candidates</h3>
        <Select value={filterType} onValueChange={(v) => onFilterChange(v as SnippetType | 'all')}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {availableTypes.map(type => (
              <SelectItem key={type} value={type}>
                {SNIPPET_TYPE_LABELS[type]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filteredCandidates.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <Target className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <h4 className="mt-4 font-medium">No Snippet Candidates</h4>
          <p className="mt-1 text-sm text-muted-foreground">
            Add optimized content sections to create snippet candidates
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredCandidates.map(candidate => (
            <CandidateCard
              key={candidate.id}
              candidate={candidate}
              isExpanded={expandedId === candidate.id}
              onToggleExpand={() => setExpandedId(expandedId === candidate.id ? null : candidate.id)}
              onOptimize={() => onOptimize(candidate.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface IssuesTabProps {
  issues: SnippetIssue[];
  recommendations: SnippetRecommendation[];
  filterSeverity: 'all' | 'error' | 'warning' | 'info';
  onFilterChange: (severity: 'all' | 'error' | 'warning' | 'info') => void;
}

function IssuesTab({
  issues,
  recommendations,
  filterSeverity,
  onFilterChange
}: IssuesTabProps) {
  const filteredIssues = useMemo(() => {
    if (filterSeverity === 'all') return issues;
    return issues.filter(i => i.severity === filterSeverity);
  }, [issues, filterSeverity]);

  return (
    <div className="space-y-6">
      {/* Issues Section */}
      <div>
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Issues</h3>
          <Select value={filterSeverity} onValueChange={(v) => onFilterChange(v as 'all' | 'error' | 'warning' | 'info')}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="error">Errors</SelectItem>
              <SelectItem value="warning">Warnings</SelectItem>
              <SelectItem value="info">Info</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {filteredIssues.length === 0 ? (
          <div className="mt-4 rounded-lg border border-dashed p-6 text-center">
            <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-500/50" />
            <h4 className="mt-3 font-medium">No Issues Found</h4>
            <p className="mt-1 text-sm text-muted-foreground">
              Your content has no issues at this severity level
            </p>
          </div>
        ) : (
          <div className="mt-4 space-y-2">
            {filteredIssues.map(issue => (
              <IssueCard key={issue.id} issue={issue} />
            ))}
          </div>
        )}
      </div>

      {/* Recommendations Section */}
      <div>
        <h3 className="font-semibold">Recommendations</h3>
        {recommendations.length === 0 ? (
          <div className="mt-4 rounded-lg border border-dashed p-6 text-center">
            <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-500/50" />
            <h4 className="mt-3 font-medium">All Good!</h4>
            <p className="mt-1 text-sm text-muted-foreground">
              No additional recommendations at this time
            </p>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {recommendations.map(rec => (
              <RecommendationCard key={rec.id} recommendation={rec} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface SettingsTabProps {
  settings: SnippetOptimizerSettings;
  onSettingsChange: (settings: Partial<SnippetOptimizerSettings>) => void;
}

function SettingsTab({ settings, onSettingsChange }: SettingsTabProps) {
  return (
    <div className="space-y-6">
      <div className="rounded-lg border p-4">
        <h3 className="font-semibold">Target Query</h3>
        <Input
          className="mt-3"
          placeholder="Enter target search query..."
          value={settings.targetQuery || ''}
          onChange={(e) => onSettingsChange({ targetQuery: e.target.value })}
        />
        <p className="mt-2 text-xs text-muted-foreground">
          Enter the query you want to rank for in featured snippets
        </p>
      </div>

      <div className="rounded-lg border p-4">
        <h3 className="font-semibold">Target Snippet Type</h3>
        <Select
          value={settings.targetSnippetType}
          onValueChange={(v) => onSettingsChange({ targetSnippetType: v as SnippetType | 'auto' })}
        >
          <SelectTrigger className="mt-3">
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="auto">Auto-detect</SelectItem>
            <SelectItem value="paragraph">Paragraph</SelectItem>
            <SelectItem value="list">List</SelectItem>
            <SelectItem value="table">Table</SelectItem>
            <SelectItem value="definition">Definition</SelectItem>
            <SelectItem value="how_to">How-To</SelectItem>
            <SelectItem value="comparison">Comparison</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border p-4">
        <h3 className="font-semibold">Analysis Settings</h3>
        <div className="mt-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Analyze Competitors</Label>
              <p className="text-xs text-muted-foreground">
                Include competitor analysis
              </p>
            </div>
            <Switch
              checked={settings.analyzeCompetitors}
              onCheckedChange={(checked) => onSettingsChange({ analyzeCompetitors: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Generate Optimized Version</Label>
              <p className="text-xs text-muted-foreground">
                Auto-generate optimized content
              </p>
            </div>
            <Switch
              checked={settings.generateOptimizedVersion}
              onCheckedChange={(checked) => onSettingsChange({ generateOptimizedVersion: checked })}
            />
          </div>
        </div>
      </div>

      <div className="rounded-lg border p-4">
        <h3 className="font-semibold">Focus Areas</h3>
        <div className="mt-4 space-y-4">
          <div className="flex items-center justify-between">
            <Label>Paragraph Snippets</Label>
            <Switch
              checked={settings.focusOnParagraph}
              onCheckedChange={(checked) => onSettingsChange({ focusOnParagraph: checked })}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label>List Snippets</Label>
            <Switch
              checked={settings.focusOnList}
              onCheckedChange={(checked) => onSettingsChange({ focusOnList: checked })}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label>Table Snippets</Label>
            <Switch
              checked={settings.focusOnTable}
              onCheckedChange={(checked) => onSettingsChange({ focusOnTable: checked })}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// MAIN PANEL COMPONENT
// =============================================================================

interface SnippetOptimizerPanelProps {
  isOpen: boolean;
  onClose: () => void;
  result: SnippetOptimizerResult | null;
  isAnalyzing: boolean;
  onReanalyze: () => void;
  onApplyOptimization: (optimizationId: string) => void;
  settings: SnippetOptimizerSettings;
  onSettingsChange: (settings: Partial<SnippetOptimizerSettings>) => void;
  exportReport: (options: { format: 'markdown' | 'html' | 'json'; includeAnalysis: boolean; includeOptimized: boolean; includeCandidates: boolean }) => string;
}

export function SnippetOptimizerPanel({
  isOpen,
  onClose,
  result,
  isAnalyzing,
  onReanalyze,
  onApplyOptimization,
  settings,
  onSettingsChange,
  exportReport
}: SnippetOptimizerPanelProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [filterType, setFilterType] = useState<SnippetType | 'all'>('all');
  const [filterSeverity, setFilterSeverity] = useState<'all' | 'error' | 'warning' | 'info'>('all');
  const [copied, setCopied] = useState(false);

  const handleCopyReport = async () => {
    const report = exportReport({
      format: 'markdown',
      includeAnalysis: true,
      includeOptimized: true,
      includeCandidates: true
    });
    await navigator.clipboard.writeText(report);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExport = () => {
    const report = exportReport({
      format: 'html',
      includeAnalysis: true,
      includeOptimized: true,
      includeCandidates: true
    });
    const blob = new Blob([report], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'snippet-optimization-report.html';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-xl">
        <SheetHeader>
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Featured Snippet Optimizer
            </SheetTitle>
          </div>
        </SheetHeader>

        <div className="mt-6 flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onReanalyze}
            disabled={isAnalyzing}
            className="gap-2"
          >
            <RefreshCw className={cn('h-4 w-4', isAnalyzing && 'animate-spin')} />
            Reanalyze
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyReport}
            disabled={!result}
            className="gap-2"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            Copy Report
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={!result}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="gap-1 text-xs">
              <Eye className="h-3 w-3" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="candidates" className="gap-1 text-xs">
              <Target className="h-3 w-3" />
              Candidates
            </TabsTrigger>
            <TabsTrigger value="issues" className="gap-1 text-xs">
              <Zap className="h-3 w-3" />
              Issues
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-1 text-xs">
              <Settings className="h-3 w-3" />
              Settings
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="mt-4 h-[calc(100vh-280px)]">
            <div className="pr-4">
              {!result ? (
                <div className="rounded-lg border border-dashed p-8 text-center">
                  <Search className="mx-auto h-12 w-12 text-muted-foreground/50" />
                  <h4 className="mt-4 font-medium">No Content Analyzed</h4>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Add content to analyze for featured snippet optimization
                  </p>
                </div>
              ) : (
                <>
                  <TabsContent value="overview" className="mt-0">
                    <OverviewTab
                      metrics={result.metrics}
                      formatAnalysis={result.formatAnalysis}
                    />
                  </TabsContent>

                  <TabsContent value="candidates" className="mt-0">
                    <CandidatesTab
                      candidates={result.candidates}
                      filterType={filterType}
                      onFilterChange={setFilterType}
                      onOptimize={onApplyOptimization}
                    />
                  </TabsContent>

                  <TabsContent value="issues" className="mt-0">
                    <IssuesTab
                      issues={result.issues}
                      recommendations={result.recommendations}
                      filterSeverity={filterSeverity}
                      onFilterChange={setFilterSeverity}
                    />
                  </TabsContent>

                  <TabsContent value="settings" className="mt-0">
                    <SettingsTab
                      settings={settings}
                      onSettingsChange={onSettingsChange}
                    />
                  </TabsContent>
                </>
              )}
            </div>
          </ScrollArea>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}

export default SnippetOptimizerPanel;

