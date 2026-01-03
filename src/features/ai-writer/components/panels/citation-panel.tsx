'use client';

// =============================================================================
// CITATION PANEL - Production Level
// =============================================================================
// Smart citation and source suggestion UI
// =============================================================================

import React, { useState, useMemo, useCallback } from 'react';
import {
  Quote,
  Link,
  ExternalLink,
  Search,
  Filter,
  Check,
  X,
  AlertTriangle,
  Info,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  BarChart3,
  Globe,
  GraduationCap,
  Building,
  Newspaper,
  FileText,
  RefreshCw,
  Download,
  Zap,
  Shield,
  Star,
  BookOpen,
  Percent,
  CheckCircle,
  Copy,
  Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import {
  CitationAnalysis,
  CitableClaim,
  CitationSource,
  CitationSettings,
  CitationPriority,
  ClaimType,
  SourceType,
  SourceAuthority,
  CITATION_TABS,
  CITATION_PRIORITY_INFO,
  CLAIM_TYPE_INFO,
  SOURCE_TYPE_INFO,
  AUTHORITY_INFO,
  DEFAULT_CITATION_SETTINGS,
  Citation
} from '@/src/features/ai-writer/types/tools/citation.types';

// =============================================================================
// TYPES
// =============================================================================

interface CitationPanelProps {
  analysis: CitationAnalysis | null;
  isAnalyzing: boolean;
  settings: CitationSettings;
  onAnalyze: () => void;
  onApplyCitation: (claim: CitableClaim, source: CitationSource) => void;
  onSkipClaim: (claimId: string) => void;
  onUpdateSettings: (settings: Partial<CitationSettings>) => void;
  onExportReport: () => void;
}

// =============================================================================
// HELPER COMPONENTS
// =============================================================================

/**
 * Score indicator with color
 */
const ScoreIndicator: React.FC<{ score: number; size?: 'sm' | 'md' | 'lg' }> = ({
  score,
  size = 'md'
}) => {
  const getColor = (s: number) => {
    if (s >= 80) return 'text-green-500';
    if (s >= 60) return 'text-yellow-500';
    if (s >= 40) return 'text-orange-500';
    return 'text-red-500';
  };

  const getBgColor = (s: number) => {
    if (s >= 80) return 'bg-green-500/10';
    if (s >= 60) return 'bg-yellow-500/10';
    if (s >= 40) return 'bg-orange-500/10';
    return 'bg-red-500/10';
  };

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-16 h-16 text-lg'
  };

  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center font-bold',
        sizeClasses[size],
        getColor(score),
        getBgColor(score)
      )}
    >
      {score}
    </div>
  );
};

/**
 * Priority badge
 */
const PriorityBadge: React.FC<{ priority: CitationPriority }> = ({ priority }) => {
  const info = CITATION_PRIORITY_INFO[priority];
  
  const colorClasses = {
    critical: 'bg-red-500/10 text-red-600 border-red-500/30',
    high: 'bg-orange-500/10 text-orange-600 border-orange-500/30',
    medium: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30',
    low: 'bg-gray-500/10 text-gray-600 border-gray-500/30'
  };

  return (
    <Badge variant="outline" className={cn('text-xs', colorClasses[priority])}>
      {info.label}
    </Badge>
  );
};

/**
 * Claim type badge
 */
const ClaimTypeBadge: React.FC<{ type: ClaimType }> = ({ type }) => {
  const info = CLAIM_TYPE_INFO[type];
  
  const icons: Record<ClaimType, React.ReactNode> = {
    'statistic': <Percent className="w-3 h-3" />,
    'fact': <CheckCircle className="w-3 h-3" />,
    'quote': <Quote className="w-3 h-3" />,
    'research': <Search className="w-3 h-3" />,
    'definition': <BookOpen className="w-3 h-3" />,
    'comparison': <BarChart3 className="w-3 h-3" />,
    'prediction': <Zap className="w-3 h-3" />,
    'historical': <FileText className="w-3 h-3" />,
    'expert-opinion': <GraduationCap className="w-3 h-3" />
  };

  return (
    <Badge variant="secondary" className="text-xs gap-1">
      {icons[type]}
      {info.label}
    </Badge>
  );
};

/**
 * Source type icon
 */
const SourceTypeIcon: React.FC<{ type: SourceType; className?: string }> = ({ 
  type, 
  className = "w-4 h-4" 
}) => {
  const icons: Record<SourceType, React.ReactNode> = {
    'academic': <GraduationCap className={className} />,
    'government': <Building className={className} />,
    'news': <Newspaper className={className} />,
    'industry': <Building className={className} />,
    'research': <Search className={className} />,
    'statistics': <BarChart3 className={className} />,
    'expert': <GraduationCap className={className} />,
    'official': <FileText className={className} />,
    'book': <BookOpen className={className} />,
    'case-study': <FileText className={className} />
  };

  return <>{icons[type]}</>;
};

/**
 * Authority badge
 */
const AuthorityBadge: React.FC<{ authority: SourceAuthority; score: number }> = ({ 
  authority, 
  score 
}) => {
  const info = AUTHORITY_INFO[authority];
  
  return (
    <Badge variant="outline" className={cn('text-xs gap-1', info.color)}>
      <Shield className="w-3 h-3" />
      {score}
    </Badge>
  );
};

/**
 * Empty state component
 */
const EmptyState: React.FC<{ 
  title: string; 
  description: string; 
  action?: React.ReactNode 
}> = ({ title, description, action }) => (
  <div className="flex flex-col items-center justify-center p-8 text-center">
    <Quote className="w-12 h-12 text-muted-foreground/50 mb-4" />
    <h3 className="font-medium text-foreground mb-1">{title}</h3>
    <p className="text-sm text-muted-foreground mb-4">{description}</p>
    {action}
  </div>
);

// =============================================================================
// OVERVIEW TAB
// =============================================================================

const OverviewTab: React.FC<{
  analysis: CitationAnalysis;
}> = ({ analysis }) => {
  const { metrics, claims, issues } = analysis;

  return (
    <div className="space-y-6 p-4">
      {/* Main Score */}
      <div className="flex items-center gap-6 p-4 rounded-lg border bg-card">
        <ScoreIndicator score={metrics.overallScore} size="lg" />
        <div className="flex-1">
          <h3 className="font-semibold mb-1">Citation Score</h3>
          <p className="text-sm text-muted-foreground">
            {metrics.overallScore >= 80 && 'Excellent citation coverage!'}
            {metrics.overallScore >= 60 && metrics.overallScore < 80 && 'Good coverage, some claims need sources.'}
            {metrics.overallScore >= 40 && metrics.overallScore < 60 && 'Moderate coverage, add more citations.'}
            {metrics.overallScore < 40 && 'Low coverage. Many claims need citations.'}
          </p>
          <Progress value={metrics.overallScore} className="h-2 mt-2" />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-lg border bg-card">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Quote className="w-4 h-4" />
            <span className="text-xs">Claims Found</span>
          </div>
          <div className="text-2xl font-bold">{metrics.totalClaims}</div>
          <div className="text-xs text-orange-600">
            {metrics.uncitedClaims} uncited
          </div>
        </div>

        <div className="p-3 rounded-lg border bg-card">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Link className="w-4 h-4" />
            <span className="text-xs">Existing Citations</span>
          </div>
          <div className="text-2xl font-bold">{analysis.existingCitationCount}</div>
          <div className="text-xs text-muted-foreground">
            in content
          </div>
        </div>

        <div className="p-3 rounded-lg border bg-card">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Shield className="w-4 h-4" />
            <span className="text-xs">Trust Score</span>
          </div>
          <div className="text-2xl font-bold">{metrics.trustScore}</div>
          <Progress 
            value={metrics.trustScore} 
            className="h-1 mt-1" 
          />
        </div>

        <div className="p-3 rounded-lg border bg-card">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-xs">Issues</span>
          </div>
          <div className="text-2xl font-bold">{issues.length}</div>
          <div className="text-xs text-muted-foreground">
            {issues.filter(i => i.severity === 'error').length} critical
          </div>
        </div>
      </div>

      {/* Coverage */}
      <div className="p-4 rounded-lg border bg-card">
        <h4 className="font-medium mb-3 flex items-center gap-2">
          <BarChart3 className="w-4 h-4" />
          Citation Coverage
        </h4>
        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm">Overall Coverage</span>
              <span className="text-sm font-medium">{metrics.citationCoverage}%</span>
            </div>
            <Progress value={metrics.citationCoverage} className="h-2" />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm">Critical Claims</span>
              <span className="text-sm font-medium">{metrics.criticalCoverage}%</span>
            </div>
            <Progress value={metrics.criticalCoverage} className="h-2" />
          </div>
        </div>
      </div>

      {/* Claim Breakdown */}
      <div className="p-4 rounded-lg border bg-card">
        <h4 className="font-medium mb-3">Claims by Priority</h4>
        <div className="space-y-2">
          {(['critical', 'high', 'medium', 'low'] as CitationPriority[]).map(priority => {
            const count = claims.filter(c => c.citationPriority === priority).length;
            const uncited = claims.filter(c => c.citationPriority === priority && c.status !== 'cited').length;
            
            return (
              <div key={priority} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <PriorityBadge priority={priority} />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">{count} total</span>
                  {uncited > 0 && (
                    <span className="text-orange-600">({uncited} uncited)</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// =============================================================================
// CLAIMS TAB
// =============================================================================

const ClaimCard: React.FC<{
  claim: CitableClaim;
  onApplyCitation: (source: CitationSource) => void;
  onSkip: () => void;
}> = ({ claim, onApplyCitation, onSkip }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedSource, setSelectedSource] = useState<CitationSource | null>(null);

  return (
    <div className={cn(
      "p-3 rounded-lg border bg-card",
      claim.citationPriority === 'critical' && "border-red-500/30",
      claim.status === 'cited' && "opacity-60"
    )}>
      <div className="flex items-start gap-3">
        {/* Priority indicator */}
        <div className={cn(
          "w-1 h-full rounded-full shrink-0",
          claim.citationPriority === 'critical' && "bg-red-500",
          claim.citationPriority === 'high' && "bg-orange-500",
          claim.citationPriority === 'medium' && "bg-yellow-500",
          claim.citationPriority === 'low' && "bg-gray-400"
        )} />
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <PriorityBadge priority={claim.citationPriority} />
            <ClaimTypeBadge type={claim.type} />
            {claim.status === 'cited' && (
              <Badge variant="secondary" className="text-xs text-green-600">
                <CheckCircle className="w-3 h-3 mr-1" />
                Cited
              </Badge>
            )}
          </div>
          
          {/* Claim text */}
          <p className="text-sm mb-2 line-clamp-2">{claim.text}</p>
          
          {/* Reason */}
          <p className="text-xs text-muted-foreground mb-2">{claim.reason}</p>
          
          {/* Expanded Details */}
          <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="w-full h-6 text-xs">
                {isExpanded ? (
                  <>
                    <ChevronUp className="w-3 h-3 mr-1" />
                    Hide Sources
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-3 h-3 mr-1" />
                    View {claim.suggestedSources.length} Sources
                  </>
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2 space-y-2">
              {claim.suggestedSources.map(source => (
                <div 
                  key={source.id}
                  className={cn(
                    "p-2 rounded border text-sm cursor-pointer hover:bg-accent/50",
                    selectedSource?.id === source.id && "border-primary bg-primary/5"
                  )}
                  onClick={() => setSelectedSource(source)}
                >
                  <div className="flex items-start gap-2">
                    <SourceTypeIcon type={source.type} className="w-4 h-4 shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-xs truncate">{source.title}</div>
                      <div className="text-xs text-muted-foreground truncate">{source.domain}</div>
                    </div>
                    <AuthorityBadge authority={source.authority} score={source.authorityScore} />
                  </div>
                  
                  {selectedSource?.id === source.id && (
                    <div className="mt-2 pt-2 border-t">
                      <p className="text-xs text-muted-foreground mb-2">{source.snippet}</p>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          className="flex-1 h-7 text-xs"
                          onClick={() => onApplyCitation(source)}
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          Add Citation
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="h-7 text-xs"
                          onClick={() => window.open(source.url, '_blank')}
                        >
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              
              {claim.suggestedSources.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-2">
                  No sources found. Try searching manually.
                </p>
              )}
            </CollapsibleContent>
          </Collapsible>
        </div>
        
        {/* Actions */}
        {claim.status !== 'cited' && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="h-7 w-7 text-muted-foreground hover:text-foreground"
                  onClick={onSkip}
                >
                  <X className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Skip Claim</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    </div>
  );
};

const ClaimsTab: React.FC<{
  claims: CitableClaim[];
  onApplyCitation: (claim: CitableClaim, source: CitationSource) => void;
  onSkip: (claimId: string) => void;
}> = ({ claims, onApplyCitation, onSkip }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<CitationPriority | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<ClaimType | 'all'>('all');
  const [showCited, setShowCited] = useState(false);

  const filteredClaims = useMemo(() => {
    return claims.filter(c => {
      if (searchQuery && !c.text.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      if (priorityFilter !== 'all' && c.citationPriority !== priorityFilter) {
        return false;
      }
      if (typeFilter !== 'all' && c.type !== typeFilter) {
        return false;
      }
      if (!showCited && c.status === 'cited') {
        return false;
      }
      return true;
    });
  }, [claims, searchQuery, priorityFilter, typeFilter, showCited]);

  if (claims.length === 0) {
    return (
      <EmptyState
        title="No Claims Found"
        description="No citable claims detected in content."
      />
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Filters */}
      <div className="p-4 border-b space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search claims..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <div className="flex gap-2">
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as CitationPriority | 'all')}
            className="text-sm border rounded px-2 py-1 bg-background"
          >
            <option value="all">All Priority</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as ClaimType | 'all')}
            className="text-sm border rounded px-2 py-1 bg-background"
          >
            <option value="all">All Types</option>
            <option value="statistic">Statistics</option>
            <option value="fact">Facts</option>
            <option value="quote">Quotes</option>
            <option value="research">Research</option>
          </select>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            {filteredClaims.length} claims
          </span>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Show cited</span>
            <Switch
              checked={showCited}
              onCheckedChange={setShowCited}
            />
          </div>
        </div>
      </div>
      
      {/* Claims List */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-2">
          {filteredClaims.map(claim => (
            <ClaimCard
              key={claim.id}
              claim={claim}
              onApplyCitation={(source) => onApplyCitation(claim, source)}
              onSkip={() => onSkip(claim.id)}
            />
          ))}
          
          {filteredClaims.length === 0 && (
            <EmptyState
              title="No Matching Claims"
              description="Try adjusting your filters."
            />
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

// =============================================================================
// SOURCES TAB
// =============================================================================

const SourceCard: React.FC<{
  source: CitationSource;
  onSelect: () => void;
}> = ({ source, onSelect }) => {
  const info = SOURCE_TYPE_INFO[source.type];

  return (
    <div 
      className="p-3 rounded-lg border bg-card hover:bg-accent/50 cursor-pointer transition-colors"
      onClick={onSelect}
    >
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-muted">
          <SourceTypeIcon type={source.type} className="w-5 h-5" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm truncate">{source.title}</h4>
          <p className="text-xs text-muted-foreground truncate mb-2">{source.domain}</p>
          
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="secondary" className="text-xs">
              {info.label}
            </Badge>
            <AuthorityBadge authority={source.authority} score={source.authorityScore} />
            <Badge variant="outline" className="text-xs">
              {source.relevanceScore}% relevant
            </Badge>
          </div>
        </div>
        
        <Button 
          size="icon" 
          variant="ghost" 
          className="h-7 w-7"
          onClick={(e) => {
            e.stopPropagation();
            window.open(source.url, '_blank');
          }}
        >
          <ExternalLink className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

const SourcesTab: React.FC<{
  sources: CitationSource[];
}> = ({ sources }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<SourceType | 'all'>('all');

  const filteredSources = useMemo(() => {
    return sources.filter(s => {
      if (searchQuery && 
          !s.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !s.domain.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      if (typeFilter !== 'all' && s.type !== typeFilter) {
        return false;
      }
      return true;
    });
  }, [sources, searchQuery, typeFilter]);

  if (sources.length === 0) {
    return (
      <EmptyState
        title="No Sources Yet"
        description="Analyze content to get source suggestions."
      />
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Filters */}
      <div className="p-4 border-b space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search sources..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as SourceType | 'all')}
          className="text-sm border rounded px-2 py-1 bg-background w-full"
        >
          <option value="all">All Types</option>
          <option value="academic">Academic</option>
          <option value="government">Government</option>
          <option value="research">Research</option>
          <option value="statistics">Statistics</option>
          <option value="news">News</option>
        </select>
        
        <div className="text-sm text-muted-foreground">
          {filteredSources.length} sources found
        </div>
      </div>
      
      {/* Sources List */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-2">
          {filteredSources.map(source => (
            <SourceCard
              key={source.id}
              source={source}
              onSelect={() => {}}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

// =============================================================================
// SETTINGS TAB
// =============================================================================

const SettingsTab: React.FC<{
  settings: CitationSettings;
  onUpdate: (settings: Partial<CitationSettings>) => void;
}> = ({ settings, onUpdate }) => {
  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-6">
        {/* Detection Settings */}
        <div>
          <h3 className="font-medium mb-3">Claim Detection</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">Detect Statistics</div>
                <div className="text-xs text-muted-foreground">
                  Numbers, percentages, data points
                </div>
              </div>
              <Switch
                checked={settings.detectStatistics}
                onCheckedChange={(checked) => onUpdate({ detectStatistics: checked })}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">Detect Facts</div>
                <div className="text-xs text-muted-foreground">
                  Factual statements and claims
                </div>
              </div>
              <Switch
                checked={settings.detectFacts}
                onCheckedChange={(checked) => onUpdate({ detectFacts: checked })}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">Detect Quotes</div>
                <div className="text-xs text-muted-foreground">
                  Direct quotations
                </div>
              </div>
              <Switch
                checked={settings.detectQuotes}
                onCheckedChange={(checked) => onUpdate({ detectQuotes: checked })}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">Detect Research</div>
                <div className="text-xs text-muted-foreground">
                  Research findings and studies
                </div>
              </div>
              <Switch
                checked={settings.detectResearch}
                onCheckedChange={(checked) => onUpdate({ detectResearch: checked })}
              />
            </div>
          </div>
        </div>
        
        {/* Source Preferences */}
        <div>
          <h3 className="font-medium mb-3">Source Preferences</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">Require HTTPS</div>
                <div className="text-xs text-muted-foreground">
                  Only suggest secure sources
                </div>
              </div>
              <Switch
                checked={settings.requireHttps}
                onCheckedChange={(checked) => onUpdate({ requireHttps: checked })}
              />
            </div>
          </div>
        </div>
        
        {/* Display */}
        <div>
          <h3 className="font-medium mb-3">Display</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">Show Low Priority</div>
                <div className="text-xs text-muted-foreground">
                  Include low-priority claims
                </div>
              </div>
              <Switch
                checked={settings.showLowPriority}
                onCheckedChange={(checked) => onUpdate({ showLowPriority: checked })}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">Highlight Uncited</div>
                <div className="text-xs text-muted-foreground">
                  Highlight uncited claims in editor
                </div>
              </div>
              <Switch
                checked={settings.highlightUncited}
                onCheckedChange={(checked) => onUpdate({ highlightUncited: checked })}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">Group by Priority</div>
                <div className="text-xs text-muted-foreground">
                  Organize claims by priority
                </div>
              </div>
              <Switch
                checked={settings.groupByPriority}
                onCheckedChange={(checked) => onUpdate({ groupByPriority: checked })}
              />
            </div>
          </div>
        </div>
      </div>
    </ScrollArea>
  );
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export const CitationPanel: React.FC<CitationPanelProps> = ({
  analysis,
  isAnalyzing,
  settings,
  onAnalyze,
  onApplyCitation,
  onSkipClaim,
  onUpdateSettings,
  onExportReport
}) => {
  const [activeTab, setActiveTab] = useState<string>('overview');

  const tabs = CITATION_TABS;
  const uncitedCount = analysis?.uncitedClaims || 0;
  const criticalCount = analysis?.criticalClaims || 0;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-2"
        >
          <Quote className="w-4 h-4" />
          Citations
          {analysis && uncitedCount > 0 && (
            <Badge variant={criticalCount > 0 ? "destructive" : "secondary"} className="ml-1">
              {uncitedCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      
      <SheetContent className="w-[450px] sm:w-[500px] p-0 flex flex-col">
        <SheetHeader className="p-4 border-b">
          <div className="flex items-center justify-between">
            <div>
              <SheetTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Citation Checker
              </SheetTitle>
              <SheetDescription>
                Add credibility with citations
              </SheetDescription>
            </div>
            <div className="flex gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={onExportReport}
                      disabled={!analysis}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Export Report</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <Button
                size="sm"
                onClick={onAnalyze}
                disabled={isAnalyzing}
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Analyze
                  </>
                )}
              </Button>
            </div>
          </div>
        </SheetHeader>
        
        {!analysis ? (
          <EmptyState
            title="No Analysis Yet"
            description="Click 'Analyze' to find claims that need citations."
            action={
              <Button onClick={onAnalyze} disabled={isAnalyzing}>
                {isAnalyzing ? 'Analyzing...' : 'Analyze Content'}
              </Button>
            }
          />
        ) : (
          <>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
              <TabsList className="w-full justify-start p-1 mx-4 mt-2">
                {tabs.map(tab => (
                  <TabsTrigger 
                    key={tab.id} 
                    value={tab.id}
                    className="text-xs relative"
                  >
                    {tab.label}
                    {tab.id === 'claims' && uncitedCount > 0 && (
                      <Badge 
                        variant="secondary" 
                        className="ml-1 h-4 w-4 p-0 flex items-center justify-center text-[10px]"
                      >
                        {uncitedCount}
                      </Badge>
                    )}
                  </TabsTrigger>
                ))}
              </TabsList>
              
              <div className="flex-1 overflow-hidden">
                <TabsContent value="overview" className="h-full m-0 data-[state=active]:block">
                  <ScrollArea className="h-full">
                    <OverviewTab analysis={analysis} />
                  </ScrollArea>
                </TabsContent>
                
                <TabsContent value="claims" className="h-full m-0 data-[state=active]:flex flex-col">
                  <ClaimsTab
                    claims={analysis.claims}
                    onApplyCitation={onApplyCitation}
                    onSkip={onSkipClaim}
                  />
                </TabsContent>
                
                <TabsContent value="sources" className="h-full m-0 data-[state=active]:flex flex-col">
                  <SourcesTab sources={analysis.suggestedSources} />
                </TabsContent>
                
                <TabsContent value="applied" className="h-full m-0 data-[state=active]:block">
                  <EmptyState
                    title="No Citations Applied"
                    description="Applied citations will appear here."
                  />
                </TabsContent>
                
                <TabsContent value="settings" className="h-full m-0 data-[state=active]:block">
                  <SettingsTab
                    settings={settings}
                    onUpdate={onUpdateSettings}
                  />
                </TabsContent>
              </div>
            </Tabs>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default CitationPanel;

