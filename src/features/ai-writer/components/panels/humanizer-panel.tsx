/**
 * Content Humanizer Panel Component
 * 
 * UI for humanizing AI-generated content
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
import { Switch } from '@/components/ui/switch';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import {
  UserCircle,
  RefreshCw,
  Download,
  ChevronDown,
  Check,
  X,
  ArrowRight,
  Sparkles,
  Settings2,
  Copy,
  Eye,
  EyeOff,
  Zap,
  Type,
  Smile,
  Target,
  FileText,
  Lightbulb,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { useHumanizer } from '@/src/features/ai-writer/hooks/tools/use-humanizer';
import {
  HumanizationChange,
  HumanizationRecommendation,
  ChangeType,
  ChangeImpact,
  HumanizationSortOption,
  HUMANIZATION_LEVEL_LABELS,
  WRITING_STYLE_LABELS,
  TONE_LABELS,
  CHANGE_TYPE_LABELS,
  HumanizationLevel,
  WritingStyle,
  ToneType,
  DiffSegment
} from '@/src/features/ai-writer/types/tools/humanizer.types';

// =============================================================================
// HELPER COMPONENTS
// =============================================================================

interface ScoreGaugeProps {
  label: string;
  score: number;
  maxScore?: number;
  showChange?: boolean;
  previousScore?: number;
  color?: string;
}

function ScoreGauge({ 
  label, 
  score, 
  maxScore = 100, 
  showChange,
  previousScore,
  color = 'primary'
}: ScoreGaugeProps) {
  const percentage = (score / maxScore) * 100;
  const change = previousScore !== undefined ? score - previousScore : 0;
  
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <div className="flex items-center gap-1">
          <span className="font-medium">{Math.round(score)}</span>
          {showChange && change !== 0 && (
            <span className={cn(
              "flex items-center text-xs",
              change > 0 ? "text-green-500" : "text-red-500"
            )}>
              {change > 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
              {Math.abs(Math.round(change))}
            </span>
          )}
        </div>
      </div>
      <Progress value={percentage} className="h-2" />
    </div>
  );
}

interface ImpactBadgeProps {
  impact: ChangeImpact;
}

function ImpactBadge({ impact }: ImpactBadgeProps) {
  const config = {
    high: { label: 'High Impact', className: 'bg-red-500/10 text-red-500 border-red-500/20' },
    medium: { label: 'Medium Impact', className: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' },
    low: { label: 'Low Impact', className: 'bg-green-500/10 text-green-500 border-green-500/20' }
  };

  const { label, className } = config[impact];
  return <Badge variant="outline" className={className}>{label}</Badge>;
}

interface ChangeTypeBadgeProps {
  type: ChangeType;
}

function ChangeTypeBadge({ type }: ChangeTypeBadgeProps) {
  const config: Record<ChangeType, { icon: React.ReactNode; className: string }> = {
    vocabulary: { icon: <Type className="h-3 w-3" />, className: 'bg-blue-500/10 text-blue-500' },
    structure: { icon: <FileText className="h-3 w-3" />, className: 'bg-purple-500/10 text-purple-500' },
    tone: { icon: <Smile className="h-3 w-3" />, className: 'bg-pink-500/10 text-pink-500' },
    flow: { icon: <Zap className="h-3 w-3" />, className: 'bg-orange-500/10 text-orange-500' },
    personality: { icon: <UserCircle className="h-3 w-3" />, className: 'bg-green-500/10 text-green-500' },
    formatting: { icon: <FileText className="h-3 w-3" />, className: 'bg-gray-500/10 text-gray-500' }
  };

  const { icon, className } = config[type];
  return (
    <Badge variant="outline" className={cn('gap-1', className)}>
      {icon}
      {CHANGE_TYPE_LABELS[type]}
    </Badge>
  );
}

interface VerdictBadgeProps {
  verdict: 'excellent' | 'good' | 'moderate' | 'needs_work';
}

function VerdictBadge({ verdict }: VerdictBadgeProps) {
  const config = {
    excellent: { label: 'Excellent', className: 'bg-green-500/10 text-green-500', icon: <CheckCircle className="h-3 w-3" /> },
    good: { label: 'Good', className: 'bg-blue-500/10 text-blue-500', icon: <Check className="h-3 w-3" /> },
    moderate: { label: 'Moderate', className: 'bg-yellow-500/10 text-yellow-500', icon: <AlertTriangle className="h-3 w-3" /> },
    needs_work: { label: 'Needs Work', className: 'bg-red-500/10 text-red-500', icon: <XCircle className="h-3 w-3" /> }
  };

  const { label, className, icon } = config[verdict];
  return (
    <Badge variant="outline" className={cn('gap-1', className)}>
      {icon}
      {label}
    </Badge>
  );
}

interface DetectabilityBadgeProps {
  level: 'very_low' | 'low' | 'moderate' | 'high';
}

function DetectabilityBadge({ level }: DetectabilityBadgeProps) {
  const config = {
    very_low: { label: 'Very Low Risk', className: 'bg-green-500/10 text-green-500' },
    low: { label: 'Low Risk', className: 'bg-blue-500/10 text-blue-500' },
    moderate: { label: 'Moderate Risk', className: 'bg-yellow-500/10 text-yellow-500' },
    high: { label: 'High Risk', className: 'bg-red-500/10 text-red-500' }
  };

  const { label, className } = config[level];
  return <Badge variant="outline" className={className}>{label}</Badge>;
}

// =============================================================================
// CHANGE CARD
// =============================================================================

interface ChangeCardProps {
  change: HumanizationChange;
  isAccepted: boolean;
  onAccept: () => void;
  onReject: () => void;
}

function ChangeCard({ change, isAccepted, onAccept, onReject }: ChangeCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={cn(
      "border rounded-lg p-3 space-y-2 transition-colors",
      isAccepted ? "bg-green-500/5 border-green-500/20" : "bg-red-500/5 border-red-500/20"
    )}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <ChangeTypeBadge type={change.type} />
          <ImpactBadge impact={change.impact} />
        </div>
        <div className="flex items-center gap-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-7 w-7",
                    isAccepted && "bg-green-500/10 text-green-500"
                  )}
                  onClick={onAccept}
                >
                  <Check className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Accept Change</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-7 w-7",
                    !isAccepted && "bg-red-500/10 text-red-500"
                  )}
                  onClick={onReject}
                >
                  <X className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Reject Change</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <div className="flex items-center gap-2 text-sm">
        <span className="px-2 py-1 bg-red-500/10 text-red-600 rounded line-through">
          {change.original}
        </span>
        <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        <span className="px-2 py-1 bg-green-500/10 text-green-600 rounded">
          {change.humanized}
        </span>
      </div>

      <Collapsible open={expanded} onOpenChange={setExpanded}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" className="w-full h-7">
            <ChevronDown className={cn("h-4 w-4 transition-transform", expanded && "rotate-180")} />
            {expanded ? 'Hide Details' : 'Show Details'}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-2 pt-2">
          <p className="text-sm text-muted-foreground">{change.reason}</p>
          {change.suggestions.length > 1 && (
            <div className="space-y-1">
              <Label className="text-xs">Alternative Suggestions:</Label>
              <div className="flex flex-wrap gap-1">
                {change.suggestions.map((suggestion, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {suggestion}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

// =============================================================================
// RECOMMENDATION CARD
// =============================================================================

interface RecommendationCardProps {
  recommendation: HumanizationRecommendation;
}

function RecommendationCard({ recommendation }: RecommendationCardProps) {
  const priorityConfig = {
    high: { className: 'border-l-red-500', icon: <AlertTriangle className="h-4 w-4 text-red-500" /> },
    medium: { className: 'border-l-yellow-500', icon: <Info className="h-4 w-4 text-yellow-500" /> },
    low: { className: 'border-l-green-500', icon: <Lightbulb className="h-4 w-4 text-green-500" /> }
  };

  const { className, icon } = priorityConfig[recommendation.priority];

  return (
    <div className={cn("border rounded-lg p-3 border-l-4", className)}>
      <div className="flex items-start gap-3">
        <div className="mt-0.5">{icon}</div>
        <div className="space-y-1 flex-1">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm">{recommendation.title}</h4>
            <Badge variant="outline" className="text-xs capitalize">
              {recommendation.type.replace('_', ' ')}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">{recommendation.description}</p>
          <div className="pt-1">
            <p className="text-xs font-medium text-primary">
              Action: {recommendation.action}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// DIFF VIEW COMPONENT
// =============================================================================

interface DiffViewProps {
  segments: DiffSegment[];
}

function DiffViewComponent({ segments }: DiffViewProps) {
  return (
    <div className="p-3 bg-muted/30 rounded-lg text-sm leading-relaxed">
      {segments.map((segment, index) => {
        switch (segment.type) {
          case 'added':
            return (
              <span key={index} className="bg-green-500/20 text-green-700 dark:text-green-300 px-0.5 rounded">
                {segment.text}{' '}
              </span>
            );
          case 'removed':
            return (
              <span key={index} className="bg-red-500/20 text-red-700 dark:text-red-300 line-through px-0.5 rounded">
                {segment.text}{' '}
              </span>
            );
          case 'modified':
            return (
              <TooltipProvider key={index}>
                <Tooltip>
                  <TooltipTrigger>
                    <span className="bg-yellow-500/20 text-yellow-700 dark:text-yellow-300 px-0.5 rounded cursor-help">
                      {segment.text}{' '}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    Was: "{segment.originalText}"
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            );
          default:
            return <span key={index}>{segment.text} </span>;
        }
      })}
    </div>
  );
}

// =============================================================================
// SETTINGS PANEL
// =============================================================================

interface SettingsPanelProps {
  settings: ReturnType<typeof useHumanizer>['settings'];
  onUpdate: (settings: Partial<ReturnType<typeof useHumanizer>['settings']>) => void;
}

function SettingsPanel({ settings, onUpdate }: SettingsPanelProps) {
  return (
    <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
      <div className="flex items-center gap-2">
        <Settings2 className="h-4 w-4" />
        <Label className="font-medium">Humanization Settings</Label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Humanization Level</Label>
          <Select
            value={settings.level}
            onValueChange={(value) => onUpdate({ level: value as HumanizationLevel })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(HUMANIZATION_LEVEL_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Writing Style</Label>
          <Select
            value={settings.style}
            onValueChange={(value) => onUpdate({ style: value as WritingStyle })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(WRITING_STYLE_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Tone</Label>
          <Select
            value={settings.tone}
            onValueChange={(value) => onUpdate({ tone: value as ToneType })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(TONE_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <Label className="text-sm">Add Personal Elements</Label>
          <Switch
            checked={settings.addPersonalElements}
            onCheckedChange={(checked) => onUpdate({ addPersonalElements: checked })}
          />
        </div>
        <div className="flex items-center justify-between">
          <Label className="text-sm">Add Rhetorical Questions</Label>
          <Switch
            checked={settings.addRhetoricalQuestions}
            onCheckedChange={(checked) => onUpdate({ addRhetoricalQuestions: checked })}
          />
        </div>
        <div className="flex items-center justify-between">
          <Label className="text-sm">Vary Sentence Length</Label>
          <Switch
            checked={settings.varySentenceLength}
            onCheckedChange={(checked) => onUpdate({ varySentenceLength: checked })}
          />
        </div>
        <div className="flex items-center justify-between">
          <Label className="text-sm">Preserve Technical Terms</Label>
          <Switch
            checked={settings.preserveTechnicalTerms}
            onCheckedChange={(checked) => onUpdate({ preserveTechnicalTerms: checked })}
          />
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// TABS
// =============================================================================

interface OverviewTabProps {
  humanizer: ReturnType<typeof useHumanizer>;
  onCopy: () => void;
}

function OverviewTab({ humanizer, onCopy }: OverviewTabProps) {
  const { analysis, metrics, quality, summary, getDiff } = humanizer;
  const diff = getDiff();

  if (!analysis || !metrics || !quality || !summary) {
    return (
      <div className="flex items-center justify-center h-48 text-muted-foreground">
        <p>Click "Humanize" to transform your content</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[calc(100vh-280px)]">
      <div className="space-y-6 pr-4">
        {/* Summary Section */}
        <div className="p-4 border rounded-lg bg-gradient-to-br from-green-500/5 to-blue-500/5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Humanization Complete</h3>
            </div>
            <VerdictBadge verdict={summary.verdict} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">AI Detectability</p>
              <DetectabilityBadge level={summary.estimatedDetectability} />
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Total Changes</p>
              <p className="font-semibold">{metrics.totalChanges}</p>
            </div>
          </div>
        </div>

        {/* AI Score Comparison */}
        <div className="p-4 border rounded-lg space-y-4">
          <h4 className="font-medium flex items-center gap-2">
            <Target className="h-4 w-4" />
            AI Detection Score
          </h4>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-red-500/10 rounded-lg">
              <p className="text-2xl font-bold text-red-500">{metrics.originalAIScore}%</p>
              <p className="text-xs text-muted-foreground">Before</p>
            </div>
            <div className="text-center p-3 bg-green-500/10 rounded-lg">
              <p className="text-2xl font-bold text-green-500">{metrics.humanizedAIScore}%</p>
              <p className="text-xs text-muted-foreground">After</p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 text-sm">
            <span className="text-muted-foreground">Improvement:</span>
            <Badge variant="outline" className="bg-green-500/10 text-green-500">
              -{metrics.aiScoreImprovement}%
            </Badge>
          </div>
        </div>

        {/* Quality Scores */}
        <div className="p-4 border rounded-lg space-y-3">
          <h4 className="font-medium">Quality Metrics</h4>
          <ScoreGauge label="Naturalness" score={quality.naturalness} />
          <ScoreGauge label="Coherence" score={quality.coherence} />
          <ScoreGauge label="Engagement" score={quality.engagement} />
          <ScoreGauge label="Authenticity" score={quality.authenticity} />
          <div className="pt-2 border-t">
            <ScoreGauge label="Overall Quality" score={quality.overall} />
          </div>
        </div>

        {/* Diff Preview */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-medium flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Changes Preview
            </h4>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 bg-green-500/30 rounded" /> Added: {diff.addedCount}
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 bg-red-500/30 rounded" /> Removed: {diff.removedCount}
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 bg-yellow-500/30 rounded" /> Modified: {diff.modifiedCount}
              </span>
            </div>
          </div>
          <DiffViewComponent segments={diff.segments.slice(0, 100)} />
          {diff.segments.length > 100 && (
            <p className="text-xs text-muted-foreground text-center">
              Showing first 100 words...
            </p>
          )}
        </div>

        {/* Humanized Content */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Humanized Content</h4>
            <Button variant="ghost" size="sm" onClick={onCopy}>
              <Copy className="h-4 w-4 mr-1" />
              Copy
            </Button>
          </div>
          <div className="p-3 bg-muted/30 rounded-lg text-sm max-h-48 overflow-y-auto">
            {analysis.humanizedContent}
          </div>
        </div>

        {/* Improvements */}
        {summary.improvements.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-green-600 flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Improvements Made
            </h4>
            <ul className="space-y-1">
              {summary.improvements.map((improvement, index) => (
                <li key={index} className="text-sm flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  {improvement}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Warnings */}
        {summary.warnings.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-yellow-600 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Warnings
            </h4>
            <ul className="space-y-1">
              {summary.warnings.map((warning, index) => (
                <li key={index} className="text-sm flex items-start gap-2 text-yellow-600">
                  <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  {warning}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </ScrollArea>
  );
}

interface ChangesTabProps {
  humanizer: ReturnType<typeof useHumanizer>;
}

function ChangesTab({ humanizer }: ChangesTabProps) {
  const { changes, filterChanges, sortChanges, acceptChange, rejectChange, acceptAll, rejectAll } = humanizer;
  const [sortBy, setSortBy] = useState<HumanizationSortOption>('position');
  const [typeFilter, setTypeFilter] = useState<ChangeType | 'all'>('all');

  const filteredChanges = useMemo(() => {
    const filtered = filterChanges({ changeType: typeFilter });
    return sortChanges(filtered, sortBy);
  }, [filterChanges, sortChanges, typeFilter, sortBy]);

  if (changes.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-muted-foreground">
        <p>No changes detected</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as ChangeType | 'all')}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {Object.entries(CHANGE_TYPE_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={(v) => setSortBy(v as HumanizationSortOption)}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="position">Position</SelectItem>
              <SelectItem value="impact">Impact</SelectItem>
              <SelectItem value="type">Type</SelectItem>
              <SelectItem value="status">Status</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={acceptAll}>
            <CheckCircle className="h-4 w-4 mr-1" />
            Accept All
          </Button>
          <Button variant="outline" size="sm" onClick={rejectAll}>
            <XCircle className="h-4 w-4 mr-1" />
            Reject All
          </Button>
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        {filteredChanges.length} of {changes.length} changes
      </p>

      {/* Changes List */}
      <ScrollArea className="h-[calc(100vh-360px)]">
        <div className="space-y-3 pr-4">
          {filteredChanges.map((change) => (
            <ChangeCard
              key={change.id}
              change={change}
              isAccepted={change.accepted}
              onAccept={() => acceptChange(change.id)}
              onReject={() => rejectChange(change.id)}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

interface RecommendationsTabProps {
  recommendations: HumanizationRecommendation[];
}

function RecommendationsTab({ recommendations }: RecommendationsTabProps) {
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');

  const filtered = useMemo(() => {
    if (priorityFilter === 'all') return recommendations;
    return recommendations.filter(r => r.priority === priorityFilter);
  }, [recommendations, priorityFilter]);

  if (recommendations.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-muted-foreground">
        <p>No recommendations available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {filtered.length} recommendations
        </p>
        <Select value={priorityFilter} onValueChange={(v) => setPriorityFilter(v as 'all' | 'high' | 'medium' | 'low')}>
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="high">High Priority</SelectItem>
            <SelectItem value="medium">Medium Priority</SelectItem>
            <SelectItem value="low">Low Priority</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <ScrollArea className="h-[calc(100vh-320px)]">
        <div className="space-y-3 pr-4">
          {filtered.map((rec) => (
            <RecommendationCard key={rec.id} recommendation={rec} />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

interface SettingsTabProps {
  humanizer: ReturnType<typeof useHumanizer>;
}

function SettingsTab({ humanizer }: SettingsTabProps) {
  const { settings, updateSettings } = humanizer;

  return (
    <ScrollArea className="h-[calc(100vh-280px)]">
      <div className="pr-4">
        <SettingsPanel settings={settings} onUpdate={updateSettings} />
      </div>
    </ScrollArea>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

interface HumanizerPanelProps {
  content: string;
  onApply?: (humanizedContent: string) => void;
  trigger?: React.ReactNode;
}

export function HumanizerPanel({ content, onApply, trigger }: HumanizerPanelProps) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [copied, setCopied] = useState(false);

  const humanizer = useHumanizer(content, {
    autoHumanize: false
  });

  const { isHumanizing, humanize, rehumanize, humanizedContent, exportResult, metrics } = humanizer;

  const handleHumanize = async () => {
    await humanize(content);
  };

  const handleApply = () => {
    if (humanizedContent && onApply) {
      onApply(humanizedContent);
      setOpen(false);
    }
  };

  const handleCopy = async () => {
    if (humanizedContent) {
      await navigator.clipboard.writeText(humanizedContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleExport = (format: 'markdown' | 'html' | 'json') => {
    const result = exportResult(format);
    if (result) {
      const blob = new Blob([result], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `humanized-content.${format === 'markdown' ? 'md' : format}`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <UserCircle className="h-4 w-4 mr-2" />
            Humanize
          </Button>
        )}
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-xl">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <UserCircle className="h-5 w-5" />
            Content Humanizer
          </SheetTitle>
          <SheetDescription>
            Transform AI-generated content to sound more natural and human-written
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {/* Action Buttons */}
          <div className="flex items-center justify-between gap-2">
            <Button
              onClick={handleHumanize}
              disabled={isHumanizing || !content.trim()}
              className="flex-1"
            >
              {isHumanizing ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Humanizing...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Humanize Content
                </>
              )}
            </Button>

            {humanizedContent && (
              <>
                <Button variant="outline" size="icon" onClick={() => rehumanize()}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
                <Select onValueChange={(v) => handleExport(v as 'markdown' | 'html' | 'json')}>
                  <SelectTrigger className="w-[100px]">
                    <Download className="h-4 w-4 mr-1" />
                    Export
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="markdown">Markdown</SelectItem>
                    <SelectItem value="html">HTML</SelectItem>
                    <SelectItem value="json">JSON</SelectItem>
                  </SelectContent>
                </Select>
              </>
            )}
          </div>

          {/* Stats Bar */}
          {metrics && (
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>Words: {metrics.originalWordCount} â†’ {metrics.humanizedWordCount}</span>
              <span>Changes: {metrics.totalChanges}</span>
            </div>
          )}

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="changes">
                Changes
                {humanizer.changes.length > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                    {humanizer.changes.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="recommendations">Tips</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-4">
              <OverviewTab humanizer={humanizer} onCopy={handleCopy} />
            </TabsContent>

            <TabsContent value="changes" className="mt-4">
              <ChangesTab humanizer={humanizer} />
            </TabsContent>

            <TabsContent value="recommendations" className="mt-4">
              <RecommendationsTab recommendations={humanizer.recommendations} />
            </TabsContent>

            <TabsContent value="settings" className="mt-4">
              <SettingsTab humanizer={humanizer} />
            </TabsContent>
          </Tabs>

          {/* Apply Button */}
          {humanizedContent && onApply && (
            <div className="pt-4 border-t">
              <Button onClick={handleApply} className="w-full">
                <Check className="h-4 w-4 mr-2" />
                Apply Humanized Content
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

