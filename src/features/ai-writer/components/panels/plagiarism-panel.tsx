/**
 * Plagiarism Checker Panel Component
 * 
 * Comprehensive plagiarism detection and reporting UI
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
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
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
  Shield,
  Search,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  ExternalLink,
  Download,
  RefreshCw,
  Copy,
  Eye,
  EyeOff,
  FileText,
  Globe,
  Lightbulb,
  X
} from 'lucide-react';
import { usePlagiarism } from '@/src/features/ai-writer/hooks/tools/use-plagiarism';
import {
  PlagiarismMatch,
  PlagiarismRecommendation,
  PlagiarismMetrics,
  PlagiarismSummary,
  PlagiarismSeverity,
  MatchType,
  SourceType,
  ContentRisk,
  PlagiarismFilterState,
  PlagiarismSortOption,
  SourceStats,
  SEVERITY_LABELS,
  MATCH_TYPE_LABELS,
  SOURCE_TYPE_LABELS,
  CONTENT_RISK_LABELS
} from '@/src/features/ai-writer/types/tools/plagiarism.types';

// =============================================================================
// TYPES
// =============================================================================

interface PlagiarismPanelProps {
  content: string;
  trigger?: React.ReactNode;
  className?: string;
  onScanComplete?: (score: number) => void;
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
        <span className="text-2xl font-bold">{score}%</span>
        {label && <span className="text-xs text-muted-foreground">{label}</span>}
      </div>
    </div>
  );
};

// Severity badge
const SeverityBadge: React.FC<{ severity: PlagiarismSeverity }> = ({ severity }) => {
  const config: Record<PlagiarismSeverity, { icon: typeof AlertCircle; class: string }> = {
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
      {SEVERITY_LABELS[severity]}
    </Badge>
  );
};

// Risk badge
const RiskBadge: React.FC<{ risk: ContentRisk }> = ({ risk }) => {
  const config: Record<ContentRisk, string> = {
    safe: 'bg-green-100 text-green-700',
    low_risk: 'bg-blue-100 text-blue-700',
    moderate_risk: 'bg-yellow-100 text-yellow-700',
    high_risk: 'bg-orange-100 text-orange-700',
    critical_risk: 'bg-red-100 text-red-700'
  };
  
  return (
    <Badge variant="outline" className={cn('text-sm', config[risk])}>
      {CONTENT_RISK_LABELS[risk]}
    </Badge>
  );
};

// Match card
const MatchCard: React.FC<{
  match: PlagiarismMatch;
  onExclude?: () => void;
}> = ({ match, onExclude }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
      <div className={cn(
        'rounded-lg border transition-colors',
        match.severity === 'critical' && 'border-red-200 bg-red-50/30',
        match.severity === 'high' && 'border-orange-200 bg-orange-50/30'
      )}>
        <CollapsibleTrigger asChild>
          <div className="p-3 cursor-pointer hover:bg-muted/30">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="secondary" className="text-xs">
                    {match.similarity}% match
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {MATCH_TYPE_LABELS[match.matchType]}
                  </Badge>
                  {match.isQuoted && (
                    <Badge variant="outline" className="text-xs bg-purple-50">
                      Quoted
                    </Badge>
                  )}
                  {match.hasCitation && (
                    <Badge variant="outline" className="text-xs bg-green-50">
                      Cited
                    </Badge>
                  )}
                </div>
                <p className="text-sm mt-2 line-clamp-2">
                  "{match.originalText.substring(0, 150)}
                  {match.originalText.length > 150 ? '...' : ''}"
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <SeverityBadge severity={match.severity} />
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
            {/* Source info */}
            <div className="p-2 rounded bg-muted/50">
              <div className="flex items-center gap-2 text-sm">
                <Globe className="w-4 h-4 text-muted-foreground" />
                <a 
                  href={match.source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline flex items-center gap-1"
                >
                  {match.source.domain}
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {match.source.title}
              </p>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div className="p-2 rounded bg-muted/30 text-center">
                <div className="text-xs text-muted-foreground">Words</div>
                <div className="font-medium">{match.wordCount}</div>
              </div>
              <div className="p-2 rounded bg-muted/30 text-center">
                <div className="text-xs text-muted-foreground">Position</div>
                <div className="font-medium">{match.startIndex}</div>
              </div>
              <div className="p-2 rounded bg-muted/30 text-center">
                <div className="text-xs text-muted-foreground">Source Type</div>
                <div className="font-medium">{SOURCE_TYPE_LABELS[match.source.sourceType]}</div>
              </div>
            </div>
            
            {/* Context */}
            {(match.context.before || match.context.after) && (
              <div className="text-xs text-muted-foreground">
                <span className="opacity-60">...{match.context.before}</span>
                <mark className="bg-yellow-200 px-1">{match.originalText.substring(0, 100)}</mark>
                <span className="opacity-60">{match.context.after}...</span>
              </div>
            )}
            
            {/* Suggestions */}
            {match.suggestions.length > 0 && (
              <div>
                <div className="text-xs font-medium mb-1">Suggestions:</div>
                <ul className="text-xs text-muted-foreground space-y-1">
                  {match.suggestions.map((s, i) => (
                    <li key={i} className="flex items-start gap-1">
                      <Lightbulb className="w-3 h-3 mt-0.5 text-yellow-500" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" className="flex-1">
                <Copy className="w-3 h-3 mr-1" />
                Copy
              </Button>
              {onExclude && match.canExclude && (
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="flex-1"
                  onClick={onExclude}
                >
                  <EyeOff className="w-3 h-3 mr-1" />
                  Exclude
                </Button>
              )}
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};

// Recommendation card
const RecommendationCard: React.FC<{
  recommendation: PlagiarismRecommendation;
}> = ({ recommendation }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const typeIcons: Record<string, typeof FileText> = {
    rewrite: RefreshCw,
    cite: FileText,
    remove: X,
    quote: Copy,
    paraphrase: RefreshCw,
    verify: Search
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
                recommendation.priority === 'critical' && 'bg-red-100 text-red-600',
                recommendation.priority === 'high' && 'bg-orange-100 text-orange-600',
                recommendation.priority === 'medium' && 'bg-yellow-100 text-yellow-600',
                recommendation.priority === 'low' && 'bg-blue-100 text-blue-600'
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
                  {recommendation.affectedMatches.length} matches
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
            <p className="text-sm text-muted-foreground">
              {recommendation.suggestedAction}
            </p>
            
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                Impact: {recommendation.impact}%
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

// Source card
const SourceCard: React.FC<{ source: SourceStats }> = ({ source }) => (
  <div className="p-3 rounded-lg border">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Globe className="w-4 h-4 text-muted-foreground" />
        <span className="font-medium">{source.domain}</span>
      </div>
      <Badge variant="secondary" className="text-xs">
        {source.matchCount} matches
      </Badge>
    </div>
    
    <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
      <div>
        <span className="text-muted-foreground">Highest: </span>
        <span className="font-medium">{source.highestSimilarity}%</span>
      </div>
      <div>
        <span className="text-muted-foreground">Avg: </span>
        <span className="font-medium">{Math.round(source.averageSimilarity)}%</span>
      </div>
      <div>
        <span className="text-muted-foreground">Words: </span>
        <span className="font-medium">{source.totalWords}</span>
      </div>
    </div>
  </div>
);

// =============================================================================
// TAB COMPONENTS
// =============================================================================

// Overview Tab
const OverviewTab: React.FC<{
  metrics: PlagiarismMetrics | null;
  summary: PlagiarismSummary | null;
}> = ({ metrics, summary }) => {
  if (!metrics || !summary) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Run a scan to see plagiarism results
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Score and Verdict */}
      <div className="flex items-center gap-6">
        <ScoreRing score={metrics.originalityScore} label="Original" />
        
        <div className="flex-1">
          <RiskBadge risk={summary.verdict} />
          <p className="text-sm text-muted-foreground mt-2">
            {summary.mainFinding}
          </p>
          {summary.actionRequired && (
            <p className="text-sm text-orange-600 mt-1">
              ⚠️ Action required - estimated fix time: {summary.estimatedFixTime} minutes
            </p>
          )}
        </div>
      </div>
      
      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-3">
        <div className="p-3 rounded-lg bg-muted/50 text-center">
          <div className="text-2xl font-bold">{metrics.totalWords}</div>
          <div className="text-xs text-muted-foreground">Words</div>
        </div>
        <div className="p-3 rounded-lg bg-green-500/10 text-center">
          <div className="text-2xl font-bold text-green-600">
            {metrics.uniqueWords}
          </div>
          <div className="text-xs text-muted-foreground">Unique</div>
        </div>
        <div className="p-3 rounded-lg bg-red-500/10 text-center">
          <div className="text-2xl font-bold text-red-600">
            {metrics.plagiarizedWords}
          </div>
          <div className="text-xs text-muted-foreground">Matched</div>
        </div>
        <div className="p-3 rounded-lg bg-purple-500/10 text-center">
          <div className="text-2xl font-bold text-purple-600">
            {metrics.sourcesFound}
          </div>
          <div className="text-xs text-muted-foreground">Sources</div>
        </div>
      </div>
      
      {/* Match breakdown */}
      <div>
        <h4 className="font-medium text-sm mb-2">Matches by Severity</h4>
        <div className="grid grid-cols-4 gap-2">
          {(['critical', 'high', 'medium', 'low'] as PlagiarismSeverity[]).map(severity => (
            <div 
              key={severity}
              className={cn(
                'p-2 rounded text-center',
                severity === 'critical' && 'bg-red-500/10',
                severity === 'high' && 'bg-orange-500/10',
                severity === 'medium' && 'bg-yellow-500/10',
                severity === 'low' && 'bg-blue-500/10'
              )}
            >
              <div className="text-lg font-bold">
                {metrics.matchesBySeverity[severity]}
              </div>
              <div className="text-xs capitalize">{severity}</div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Issues & Positives */}
      <div className="grid grid-cols-2 gap-4">
        {summary.criticalIssues.length > 0 && (
          <div>
            <h4 className="font-medium text-sm text-red-600 mb-2 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              Critical Issues
            </h4>
            <ul className="space-y-1">
              {summary.criticalIssues.map((issue, i) => (
                <li key={i} className="text-sm text-muted-foreground">• {issue}</li>
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
                <li key={i} className="text-sm text-muted-foreground">• {p}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
      
      {/* Confidence */}
      <div className="p-3 rounded-lg bg-muted/30">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Scan Confidence</span>
          <span className="font-medium">{metrics.confidence}%</span>
        </div>
        <Progress value={metrics.confidence} className="h-2 mt-2" />
      </div>
    </div>
  );
};

// Matches Tab
const MatchesTab: React.FC<{
  matches: PlagiarismMatch[];
  filterMatches: (filter: Partial<PlagiarismFilterState>) => PlagiarismMatch[];
  sortMatches: (matches: PlagiarismMatch[], sortBy: PlagiarismSortOption) => PlagiarismMatch[];
  onExclude: (matchId: string) => void;
}> = ({ matches, filterMatches, sortMatches, onExclude }) => {
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState<PlagiarismSeverity | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<MatchType | 'all'>('all');
  const [sortBy, setSortBy] = useState<PlagiarismSortOption>('severity');
  const [showQuoted, setShowQuoted] = useState(true);
  const [showCited, setShowCited] = useState(true);
  
  const filteredMatches = useMemo(() => {
    let result = filterMatches({
      search,
      severity: severityFilter,
      matchType: typeFilter,
      showQuoted,
      showCited
    });
    return sortMatches(result, sortBy);
  }, [matches, search, severityFilter, typeFilter, showQuoted, showCited, sortBy, filterMatches, sortMatches]);
  
  return (
    <div className="space-y-4">
      {/* Search & Filters */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search matches..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <div className="flex items-center gap-2 flex-wrap">
          <Select value={severityFilter} onValueChange={(v) => setSeverityFilter(v as PlagiarismSeverity | 'all')}>
            <SelectTrigger className="w-28">
              <SelectValue placeholder="Severity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as MatchType | 'all')}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="exact">Exact</SelectItem>
              <SelectItem value="paraphrased">Paraphrased</SelectItem>
              <SelectItem value="similar">Similar</SelectItem>
              <SelectItem value="common_phrase">Common</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as PlagiarismSortOption)}>
            <SelectTrigger className="w-28">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="severity">Severity</SelectItem>
              <SelectItem value="similarity">Similarity</SelectItem>
              <SelectItem value="wordCount">Word Count</SelectItem>
              <SelectItem value="position">Position</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center gap-4 text-sm">
          <label className="flex items-center gap-2">
            <Switch checked={showQuoted} onCheckedChange={setShowQuoted} />
            <span>Show Quoted</span>
          </label>
          <label className="flex items-center gap-2">
            <Switch checked={showCited} onCheckedChange={setShowCited} />
            <span>Show Cited</span>
          </label>
        </div>
      </div>
      
      {/* Results count */}
      <div className="text-sm text-muted-foreground">
        {filteredMatches.length} matches found
      </div>
      
      {/* Match List */}
      <ScrollArea className="h-80">
        <div className="space-y-2 pr-2">
          {filteredMatches.map(match => (
            <MatchCard 
              key={match.id} 
              match={match}
              onExclude={() => onExclude(match.id)}
            />
          ))}
          
          {filteredMatches.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle2 className="w-12 h-12 mx-auto mb-2 text-green-500" />
              <p>No matches found!</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

// Recommendations Tab
const RecommendationsTab: React.FC<{
  recommendations: PlagiarismRecommendation[];
}> = ({ recommendations }) => {
  if (recommendations.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <CheckCircle2 className="w-12 h-12 mx-auto mb-2 text-green-500" />
        <p>No recommendations - content looks good!</p>
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

// Sources Tab
const SourcesTab: React.FC<{
  sources: SourceStats[];
}> = ({ sources }) => {
  if (sources.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Globe className="w-12 h-12 mx-auto mb-2 opacity-50" />
        <p>No sources detected</p>
      </div>
    );
  }
  
  return (
    <ScrollArea className="h-96">
      <div className="space-y-2 pr-2">
        {sources.map(source => (
          <SourceCard key={source.sourceId} source={source} />
        ))}
      </div>
    </ScrollArea>
  );
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export const PlagiarismPanel: React.FC<PlagiarismPanelProps> = ({
  content,
  trigger,
  className,
  onScanComplete
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  
  const {
    analysis,
    isScanning,
    metrics,
    matches,
    recommendations,
    summary,
    scan,
    excludeMatch,
    filterMatches,
    sortMatches,
    exportReport
  } = usePlagiarism();
  
  // Source stats from analysis
  const sourceStats = useMemo(() => {
    return analysis?.sourceStats ?? [];
  }, [analysis]);
  
  // Auto-scan on content change
  useEffect(() => {
    if (content && content.length > 100) {
      scan(content).then(() => {
        if (metrics?.originalityScore !== undefined) {
          onScanComplete?.(metrics.originalityScore);
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
            <Shield className="w-4 h-4 mr-2" />
            Plagiarism
            {metrics && (
              <Badge 
                variant="outline" 
                className={cn(
                  'ml-2',
                  metrics.originalityScore >= 80 && 'bg-green-100 text-green-700',
                  metrics.originalityScore >= 60 && metrics.originalityScore < 80 && 'bg-yellow-100 text-yellow-700',
                  metrics.originalityScore < 60 && 'bg-red-100 text-red-700'
                )}
              >
                {metrics.originalityScore}%
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
                <Shield className="w-5 h-5" />
                Plagiarism Checker
              </SheetTitle>
              <SheetDescription>
                Detect plagiarism and check content originality
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
                onClick={() => scan(content)}
                disabled={isScanning}
              >
                <RefreshCw className={cn(
                  'w-4 h-4',
                  isScanning && 'animate-spin'
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
            <TabsTrigger value="matches" className="text-xs">
              Matches
              {matches.length > 0 && (
                <Badge variant="secondary" className="ml-1 text-xs h-4 px-1">
                  {matches.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="recommendations" className="text-xs">Tips</TabsTrigger>
            <TabsTrigger value="sources" className="text-xs">Sources</TabsTrigger>
          </TabsList>
          
          <ScrollArea className="flex-1 mt-4">
            <TabsContent value="overview" className="m-0">
              <OverviewTab metrics={metrics} summary={summary} />
            </TabsContent>
            
            <TabsContent value="matches" className="m-0">
              <MatchesTab
                matches={matches}
                filterMatches={filterMatches}
                sortMatches={sortMatches}
                onExclude={excludeMatch}
              />
            </TabsContent>
            
            <TabsContent value="recommendations" className="m-0">
              <RecommendationsTab recommendations={recommendations} />
            </TabsContent>
            
            <TabsContent value="sources" className="m-0">
              <SourcesTab sources={sourceStats} />
            </TabsContent>
          </ScrollArea>
        </Tabs>
        
        {/* Scanning overlay */}
        {isScanning && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
            <div className="text-center">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Scanning for plagiarism...</p>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default PlagiarismPanel;


