/**
 * E-E-A-T Analyzer Panel Component
 * 
 * Comprehensive UI for analyzing and improving E-E-A-T signals:
 * - Overall score with component breakdown
 * - Individual component deep dives (Expertise, Experience, Authority, Trust)
 * - Issue detection and recommendations
 * - Actionable improvement suggestions
 */

'use client';

import React, { useState, useMemo } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import {
  Shield,
  GraduationCap,
  Briefcase,
  Award,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle,
  XCircle,
  Lightbulb,
  Download,
  RefreshCw,
  Settings,
  TrendingUp,
  Target,
  LayoutDashboard,
  Eye,
  User,
  FileText,
  Link,
  BadgeCheck,
  BarChart,
  Clock,
  Mail,
  ExternalLink
} from 'lucide-react';

import {
  EEATComponent,
  EEATTab,
  SignalStrength,
  EEATIssueSeverity,
  EEATRecommendationPriority,
  EEATAnalysis,
  EEATSignal,
  EEATIssue,
  EEATRecommendation,
  ComponentAnalysis,
  EEATSettings,
  DEFAULT_EEAT_SETTINGS,
  EEAT_COMPONENT_INFO,
  SIGNAL_STRENGTH_INFO,
  EEAT_TABS
} from '@/src/features/ai-writer/types/tools/eeat.types';

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

/**
 * Score indicator with grade
 */
function ScoreIndicator({ 
  score, 
  grade,
  size = 'default',
  showGrade = true
}: { 
  score: number; 
  grade: string;
  size?: 'small' | 'default' | 'large';
  showGrade?: boolean;
}) {
  const getColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-blue-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 45) return 'text-orange-600';
    return 'text-red-600';
  };
  
  const getBgColor = (score: number) => {
    if (score >= 90) return 'bg-green-100';
    if (score >= 75) return 'bg-blue-100';
    if (score >= 60) return 'bg-yellow-100';
    if (score >= 45) return 'bg-orange-100';
    return 'bg-red-100';
  };
  
  const sizes = {
    small: 'w-10 h-10 text-sm',
    default: 'w-14 h-14 text-lg',
    large: 'w-20 h-20 text-2xl'
  };
  
  return (
    <div className="flex items-center gap-2">
      <div 
        className={cn(
          'rounded-full flex items-center justify-center font-bold',
          sizes[size],
          getColor(score),
          getBgColor(score)
        )}
      >
        {score}
      </div>
      {showGrade && (
        <Badge variant="outline" className={cn('font-bold', getColor(score))}>
          {grade}
        </Badge>
      )}
    </div>
  );
}

/**
 * Component icon mapper
 */
function ComponentIcon({ 
  component, 
  className 
}: { 
  component: EEATComponent;
  className?: string;
}) {
  const icons = {
    expertise: GraduationCap,
    experience: Briefcase,
    authoritativeness: Award,
    trustworthiness: Shield
  };
  
  const Icon = icons[component];
  return <Icon className={className} />;
}

/**
 * Signal strength badge
 */
function StrengthBadge({ strength }: { strength: SignalStrength }) {
  const info = SIGNAL_STRENGTH_INFO[strength];
  
  const variants: Record<SignalStrength, string> = {
    strong: 'bg-green-100 text-green-700 border-green-200',
    moderate: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    weak: 'bg-orange-100 text-orange-700 border-orange-200',
    missing: 'bg-red-100 text-red-700 border-red-200'
  };
  
  return (
    <Badge variant="outline" className={cn('text-xs', variants[strength])}>
      {info.label}
    </Badge>
  );
}

/**
 * Severity badge
 */
function SeverityBadge({ severity }: { severity: EEATIssueSeverity }) {
  const variants: Record<EEATIssueSeverity, string> = {
    critical: 'bg-red-100 text-red-700',
    warning: 'bg-yellow-100 text-yellow-700',
    suggestion: 'bg-blue-100 text-blue-700'
  };
  
  const icons: Record<EEATIssueSeverity, React.ReactNode> = {
    critical: <AlertCircle className="h-3 w-3" />,
    warning: <AlertTriangle className="h-3 w-3" />,
    suggestion: <Info className="h-3 w-3" />
  };
  
  return (
    <Badge variant="outline" className={cn('text-xs gap-1', variants[severity])}>
      {icons[severity]}
      {severity}
    </Badge>
  );
}

/**
 * Priority badge
 */
function PriorityBadge({ priority }: { priority: EEATRecommendationPriority }) {
  const variants: Record<EEATRecommendationPriority, string> = {
    critical: 'bg-red-100 text-red-700',
    high: 'bg-orange-100 text-orange-700',
    medium: 'bg-yellow-100 text-yellow-700',
    low: 'bg-green-100 text-green-700'
  };
  
  return (
    <Badge variant="outline" className={cn('text-xs', variants[priority])}>
      {priority}
    </Badge>
  );
}

// ============================================================================
// SIGNAL CARD
// ============================================================================

interface SignalCardProps {
  signal: EEATSignal;
}

function SignalCard({ signal }: SignalCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
      <div className="border rounded-lg p-3 bg-card">
        <CollapsibleTrigger className="w-full">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 text-left">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">{signal.name}</span>
                <StrengthBadge strength={signal.strength} />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {signal.description}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className={cn(
                'text-sm font-medium',
                signal.score >= 70 ? 'text-green-600' : 
                signal.score >= 40 ? 'text-yellow-600' : 'text-red-600'
              )}>
                {signal.score}
              </span>
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
          </div>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <div className="mt-3 pt-3 border-t space-y-3">
            {/* Evidence */}
            {signal.evidence.length > 0 && (
              <div>
                <p className="text-xs font-medium mb-1">Evidence Found:</p>
                <ul className="space-y-1">
                  {signal.evidence.map((e, i) => (
                    <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                      <CheckCircle className="h-3 w-3 mt-0.5 text-green-500 flex-shrink-0" />
                      <span className="line-clamp-2">{e}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Suggestions */}
            {signal.suggestions.length > 0 && (
              <div>
                <p className="text-xs font-medium mb-1">Suggestions:</p>
                <ul className="space-y-1">
                  {signal.suggestions.map((s, i) => (
                    <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                      <Lightbulb className="h-3 w-3 mt-0.5 text-yellow-500 flex-shrink-0" />
                      {s}
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
}

// ============================================================================
// ISSUE CARD
// ============================================================================

interface IssueCardProps {
  issue: EEATIssue;
}

function IssueCard({ issue }: IssueCardProps) {
  return (
    <div className={cn(
      'border rounded-lg p-3',
      issue.severity === 'critical' && 'border-red-200 bg-red-50',
      issue.severity === 'warning' && 'border-yellow-200 bg-yellow-50',
      issue.severity === 'suggestion' && 'border-blue-200 bg-blue-50'
    )}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <SeverityBadge severity={issue.severity} />
            <Badge variant="outline" className="text-xs">
              <ComponentIcon component={issue.component} className="h-3 w-3 mr-1" />
              {EEAT_COMPONENT_INFO[issue.component].label}
            </Badge>
          </div>
          <h4 className="font-medium text-sm">{issue.title}</h4>
          <p className="text-xs text-muted-foreground mt-1">{issue.description}</p>
        </div>
      </div>
      
      <div className="mt-3 pt-3 border-t border-dashed">
        <div className="flex items-start gap-2">
          <Lightbulb className="h-4 w-4 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-medium">Fix:</p>
            <p className="text-xs text-muted-foreground">{issue.fixSuggestion}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// RECOMMENDATION CARD
// ============================================================================

interface RecommendationCardProps {
  recommendation: EEATRecommendation;
  onApply?: () => void;
}

function RecommendationCard({ recommendation, onApply }: RecommendationCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
      <div className="border rounded-lg p-3 bg-card">
        <CollapsibleTrigger className="w-full">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 text-left">
              <div className="flex items-center gap-2 mb-1">
                <PriorityBadge priority={recommendation.priority} />
                <Badge variant="outline" className="text-xs">
                  <ComponentIcon component={recommendation.component} className="h-3 w-3 mr-1" />
                  {EEAT_COMPONENT_INFO[recommendation.component].label}
                </Badge>
              </div>
              <h4 className="font-medium text-sm">{recommendation.title}</h4>
            </div>
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <div className="mt-3 pt-3 border-t space-y-3">
            <p className="text-xs text-muted-foreground">{recommendation.description}</p>
            
            <div className="bg-muted/50 rounded p-2">
              <p className="text-xs font-medium mb-1">Action:</p>
              <p className="text-xs">{recommendation.action}</p>
            </div>
            
            {recommendation.examples && recommendation.examples.length > 0 && (
              <div>
                <p className="text-xs font-medium mb-1">Examples:</p>
                <ul className="space-y-1">
                  {recommendation.examples.map((ex, i) => (
                    <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                      <span className="text-muted-foreground">â€¢</span>
                      {ex}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  {recommendation.effort} effort
                </span>
                {recommendation.timeEstimate && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {recommendation.timeEstimate}
                  </span>
                )}
              </div>
              {onApply && (
                <Button size="sm" variant="outline" onClick={onApply}>
                  Apply
                </Button>
              )}
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

// ============================================================================
// COMPONENT ANALYSIS SECTION
// ============================================================================

interface ComponentSectionProps {
  analysis: ComponentAnalysis;
  component: EEATComponent;
}

function ComponentSection({ analysis, component }: ComponentSectionProps) {
  const info = EEAT_COMPONENT_INFO[component];
  
  return (
    <div className="space-y-4">
      {/* Header with score */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={cn(
            'p-2 rounded-lg',
            `bg-${info.color}-100`
          )}>
            <ComponentIcon component={component} className={cn('h-5 w-5', `text-${info.color}-600`)} />
          </div>
          <div>
            <h3 className="font-semibold">{info.label}</h3>
            <p className="text-xs text-muted-foreground">{info.description}</p>
          </div>
        </div>
        <ScoreIndicator score={analysis.score} grade={analysis.grade} />
      </div>
      
      {/* Signal summary */}
      <div className="grid grid-cols-4 gap-2">
        <div className="text-center p-2 bg-green-50 rounded">
          <div className="text-lg font-bold text-green-600">{analysis.strongSignals}</div>
          <div className="text-xs text-muted-foreground">Strong</div>
        </div>
        <div className="text-center p-2 bg-yellow-50 rounded">
          <div className="text-lg font-bold text-yellow-600">{analysis.moderateSignals}</div>
          <div className="text-xs text-muted-foreground">Moderate</div>
        </div>
        <div className="text-center p-2 bg-orange-50 rounded">
          <div className="text-lg font-bold text-orange-600">{analysis.weakSignals}</div>
          <div className="text-xs text-muted-foreground">Weak</div>
        </div>
        <div className="text-center p-2 bg-red-50 rounded">
          <div className="text-lg font-bold text-red-600">{analysis.missingSignals}</div>
          <div className="text-xs text-muted-foreground">Missing</div>
        </div>
      </div>
      
      {/* Signals list */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium">Signals Analysis</h4>
        {analysis.signals.map(signal => (
          <SignalCard key={signal.id} signal={signal} />
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// TAB CONTENT COMPONENTS
// ============================================================================

/**
 * Overview tab
 */
function OverviewTab({ analysis }: { analysis: EEATAnalysis }) {
  return (
    <div className="space-y-6 p-4">
      {/* Overall score */}
      <div className="text-center">
        <ScoreIndicator 
          score={analysis.metrics.overallScore} 
          grade={analysis.metrics.overallGrade}
          size="large"
        />
        <p className="text-sm text-muted-foreground mt-2">
          Overall E-E-A-T Score
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {analysis.summary}
        </p>
      </div>
      
      {/* Component breakdown */}
      <div className="grid grid-cols-2 gap-3">
        {(['expertise', 'experience', 'authoritativeness', 'trustworthiness'] as EEATComponent[]).map(component => {
          const componentData = analysis[component];
          const info = EEAT_COMPONENT_INFO[component];
          
          return (
            <div key={component} className="border rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <ComponentIcon component={component} className="h-4 w-4" />
                <span className="text-sm font-medium">{info.label}</span>
              </div>
              <div className="flex items-center justify-between">
                <Progress 
                  value={componentData.score} 
                  className="h-2 flex-1 mr-2" 
                />
                <Badge variant="outline" className="text-xs">
                  {componentData.score}
                </Badge>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Issues summary */}
      <div className="border rounded-lg p-4">
        <h4 className="font-medium mb-3">Issues Found</h4>
        <div className="grid grid-cols-3 gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <div>
              <div className="text-lg font-bold">{analysis.metrics.criticalIssues}</div>
              <div className="text-xs text-muted-foreground">Critical</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
            <div>
              <div className="text-lg font-bold">{analysis.metrics.warningIssues}</div>
              <div className="text-xs text-muted-foreground">Warnings</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-blue-500" />
            <div>
              <div className="text-lg font-bold">{analysis.metrics.suggestionIssues}</div>
              <div className="text-xs text-muted-foreground">Suggestions</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Quick wins */}
      {analysis.quickWins.length > 0 && (
        <div className="border rounded-lg p-4">
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-yellow-500" />
            Quick Wins
          </h4>
          <div className="space-y-2">
            {analysis.quickWins.slice(0, 3).map(rec => (
              <div key={rec.id} className="flex items-start gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>{rec.title}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Content metadata */}
      <div className="border rounded-lg p-4">
        <h4 className="font-medium mb-3">Content Analysis</h4>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span>{analysis.contentMetadata.wordCount} words</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>{analysis.contentMetadata.readingTime} min read</span>
          </div>
          <div className="flex items-center gap-2">
            {analysis.contentMetadata.hasCitations ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <XCircle className="h-4 w-4 text-red-500" />
            )}
            <span>{analysis.contentMetadata.citationCount} citations</span>
          </div>
          <div className="flex items-center gap-2">
            {analysis.contentMetadata.hasImages ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <XCircle className="h-4 w-4 text-red-500" />
            )}
            <span>{analysis.contentMetadata.imageCount} images</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Recommendations tab
 */
function RecommendationsTab({ 
  recommendations,
  onApply
}: { 
  recommendations: EEATRecommendation[];
  onApply?: (rec: EEATRecommendation) => void;
}) {
  const [priorityFilter, setPriorityFilter] = useState<EEATRecommendationPriority | 'all'>('all');
  
  const filteredRecs = useMemo(() => {
    if (priorityFilter === 'all') return recommendations;
    return recommendations.filter(r => r.priority === priorityFilter);
  }, [recommendations, priorityFilter]);
  
  return (
    <div className="space-y-4 p-4">
      {/* Filters */}
      <div className="flex gap-2">
        <Button
          variant={priorityFilter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setPriorityFilter('all')}
        >
          All ({recommendations.length})
        </Button>
        <Button
          variant={priorityFilter === 'critical' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setPriorityFilter('critical')}
        >
          Critical
        </Button>
        <Button
          variant={priorityFilter === 'high' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setPriorityFilter('high')}
        >
          High
        </Button>
      </div>
      
      {/* Recommendations list */}
      <div className="space-y-2">
        {filteredRecs.map(rec => (
          <RecommendationCard 
            key={rec.id} 
            recommendation={rec}
            onApply={onApply ? () => onApply(rec) : undefined}
          />
        ))}
      </div>
      
      {filteredRecs.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <CheckCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>No recommendations with this priority</p>
        </div>
      )}
    </div>
  );
}

/**
 * Settings tab
 */
function SettingsTab({ 
  settings, 
  onUpdate 
}: { 
  settings: EEATSettings;
  onUpdate: (settings: Partial<EEATSettings>) => void;
}) {
  return (
    <div className="space-y-6 p-4">
      {/* Analysis scope */}
      <div className="space-y-4">
        <h4 className="font-medium">Analysis Scope</h4>
        
        <div className="flex items-center justify-between">
          <Label htmlFor="analyzeAuthor" className="text-sm">Analyze Author</Label>
          <Switch
            id="analyzeAuthor"
            checked={settings.analyzeAuthor}
            onCheckedChange={(checked) => onUpdate({ analyzeAuthor: checked })}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <Label htmlFor="analyzeContent" className="text-sm">Analyze Content</Label>
          <Switch
            id="analyzeContent"
            checked={settings.analyzeContent}
            onCheckedChange={(checked) => onUpdate({ analyzeContent: checked })}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <Label htmlFor="analyzeSources" className="text-sm">Analyze Sources</Label>
          <Switch
            id="analyzeSources"
            checked={settings.analyzeSources}
            onCheckedChange={(checked) => onUpdate({ analyzeSources: checked })}
          />
        </div>
      </div>
      
      {/* Component weights */}
      <div className="space-y-4">
        <h4 className="font-medium">Component Weights</h4>
        
        {(['expertise', 'experience', 'authoritativeness', 'trustworthiness'] as EEATComponent[]).map(component => {
          const weightKey = `${component}Weight` as keyof EEATSettings;
          const weight = settings[weightKey] as number;
          
          return (
            <div key={component} className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm capitalize">{component}</Label>
                <span className="text-sm text-muted-foreground">
                  {Math.round(weight * 100)}%
                </span>
              </div>
              <Slider
                value={[weight * 100]}
                min={0}
                max={50}
                step={5}
                onValueChange={([value]) => onUpdate({ [weightKey]: value / 100 })}
              />
            </div>
          );
        })}
      </div>
      
      {/* Display options */}
      <div className="space-y-4">
        <h4 className="font-medium">Display Options</h4>
        
        <div className="flex items-center justify-between">
          <Label htmlFor="showDetailedSignals" className="text-sm">Show Detailed Signals</Label>
          <Switch
            id="showDetailedSignals"
            checked={settings.showDetailedSignals}
            onCheckedChange={(checked) => onUpdate({ showDetailedSignals: checked })}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <Label htmlFor="highlightIssues" className="text-sm">Highlight Issues in Editor</Label>
          <Switch
            id="highlightIssues"
            checked={settings.highlightIssuesInEditor}
            onCheckedChange={(checked) => onUpdate({ highlightIssuesInEditor: checked })}
          />
        </div>
      </div>
      
      {/* Thresholds */}
      <div className="space-y-4">
        <h4 className="font-medium">Thresholds</h4>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm">Minimum Score Target</Label>
            <span className="text-sm text-muted-foreground">
              {settings.minimumScore}
            </span>
          </div>
          <Slider
            value={[settings.minimumScore]}
            min={0}
            max={100}
            step={5}
            onValueChange={([value]) => onUpdate({ minimumScore: value })}
          />
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export interface EEATPanelProps {
  analysis: EEATAnalysis | null;
  isAnalyzing?: boolean;
  settings?: EEATSettings;
  onAnalyze?: () => void;
  onUpdateSettings?: (settings: Partial<EEATSettings>) => void;
  onApplyRecommendation?: (rec: EEATRecommendation) => void;
  onExport?: (format: 'json' | 'csv' | 'markdown') => void;
  trigger?: React.ReactNode;
}

export function EEATPanel({
  analysis,
  isAnalyzing = false,
  settings = DEFAULT_EEAT_SETTINGS,
  onAnalyze,
  onUpdateSettings,
  onApplyRecommendation,
  onExport,
  trigger
}: EEATPanelProps) {
  const [activeTab, setActiveTab] = useState<EEATTab>('overview');
  
  const defaultTrigger = (
    <Button variant="outline" size="sm" className="gap-2">
      <Shield className="h-4 w-4" />
      E-E-A-T
      {analysis && (
        <Badge variant="secondary" className="ml-1">
          {analysis.metrics.overallScore}
        </Badge>
      )}
    </Button>
  );
  
  return (
    <Sheet>
      <SheetTrigger asChild>
        {trigger || defaultTrigger}
      </SheetTrigger>
      <SheetContent className="w-[450px] sm:w-[540px] p-0">
        <SheetHeader className="p-4 border-b">
          <div className="flex items-center justify-between">
            <div>
              <SheetTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                E-E-A-T Analyzer
              </SheetTitle>
              <SheetDescription>
                Expertise, Experience, Authoritativeness, Trust
              </SheetDescription>
            </div>
            <div className="flex items-center gap-2">
              {onExport && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onExport('markdown')}
                >
                  <Download className="h-4 w-4" />
                </Button>
              )}
              {onAnalyze && (
                <Button
                  size="sm"
                  onClick={onAnalyze}
                  disabled={isAnalyzing}
                >
                  <RefreshCw className={cn('h-4 w-4 mr-2', isAnalyzing && 'animate-spin')} />
                  Analyze
                </Button>
              )}
            </div>
          </div>
        </SheetHeader>
        
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as EEATTab)}>
          <TabsList className="w-full justify-start px-4 py-2 border-b h-auto flex-wrap">
            {EEAT_TABS.map(tab => (
              <TabsTrigger key={tab.id} value={tab.id} className="text-xs">
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
          
          <ScrollArea className="h-[calc(100vh-200px)]">
            {!analysis ? (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <Shield className="h-16 w-16 text-muted-foreground/30 mb-4" />
                <h3 className="font-medium mb-2">No Analysis Yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Click &quot;Analyze&quot; to evaluate your content&apos;s E-E-A-T signals
                </p>
                {onAnalyze && (
                  <Button onClick={onAnalyze} disabled={isAnalyzing}>
                    <RefreshCw className={cn('h-4 w-4 mr-2', isAnalyzing && 'animate-spin')} />
                    Start Analysis
                  </Button>
                )}
              </div>
            ) : (
              <>
                <TabsContent value="overview" className="m-0">
                  <OverviewTab analysis={analysis} />
                </TabsContent>
                
                <TabsContent value="expertise" className="m-0 p-4">
                  <ComponentSection 
                    analysis={analysis.expertise} 
                    component="expertise" 
                  />
                </TabsContent>
                
                <TabsContent value="experience" className="m-0 p-4">
                  <ComponentSection 
                    analysis={analysis.experience} 
                    component="experience" 
                  />
                </TabsContent>
                
                <TabsContent value="authority" className="m-0 p-4">
                  <ComponentSection 
                    analysis={analysis.authoritativeness} 
                    component="authoritativeness" 
                  />
                </TabsContent>
                
                <TabsContent value="trust" className="m-0 p-4">
                  <ComponentSection 
                    analysis={analysis.trustworthiness} 
                    component="trustworthiness" 
                  />
                </TabsContent>
                
                <TabsContent value="recommendations" className="m-0">
                  <RecommendationsTab 
                    recommendations={analysis.recommendations}
                    onApply={onApplyRecommendation}
                  />
                </TabsContent>
                
                <TabsContent value="settings" className="m-0">
                  <SettingsTab 
                    settings={settings}
                    onUpdate={onUpdateSettings || (() => {})}
                  />
                </TabsContent>
              </>
            )}
          </ScrollArea>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}

export default EEATPanel;

