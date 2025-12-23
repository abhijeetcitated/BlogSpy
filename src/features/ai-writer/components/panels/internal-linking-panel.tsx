'use client';

// =============================================================================
// INTERNAL LINKING PANEL - Production Level
// =============================================================================
// Smart internal linking suggestions UI
// =============================================================================

import React, { useState, useMemo, useCallback } from 'react';
import {
  Link,
  Link2,
  ExternalLink,
  Search,
  Filter,
  ArrowRight,
  ArrowUpRight,
  Check,
  X,
  AlertTriangle,
  Info,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  Copy,
  BarChart3,
  Target,
  Network,
  FileText,
  Plus,
  Minus,
  Eye,
  RefreshCw,
  Download,
  Settings,
  Zap,
  TrendingUp,
  Globe,
  Hash,
  Star,
  BookOpen,
  Layers
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
import { Slider } from '@/components/ui/slider';
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
  InternalLinkingAnalysis,
  LinkSuggestion,
  LinkingIssue,
  LinkingRecommendation,
  LinkRelevance,
  InternalLinkType,
  InternalLinkingSettings,
  ExistingLinkInfo,
  INTERNAL_LINKING_TABS,
  RELEVANCE_INFO,
  LINK_TYPE_INFO,
  ISSUE_TYPE_INFO,
  DEFAULT_INTERNAL_LINKING_SETTINGS
} from '@/src/features/ai-writer/types/tools/internal-linking.types';

// =============================================================================
// TYPES
// =============================================================================

interface InternalLinkingPanelProps {
  analysis: InternalLinkingAnalysis | null;
  isAnalyzing: boolean;
  settings: InternalLinkingSettings;
  onAnalyze: () => void;
  onApplySuggestion: (suggestion: LinkSuggestion) => void;
  onDismissSuggestion: (suggestionId: string) => void;
  onUpdateSettings: (settings: Partial<InternalLinkingSettings>) => void;
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
 * Relevance badge with color
 */
const RelevanceBadge: React.FC<{ relevance: LinkRelevance }> = ({ relevance }) => {
  const info = RELEVANCE_INFO[relevance];
  
  const colorClasses = {
    high: 'bg-green-500/10 text-green-600 border-green-500/30',
    medium: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30',
    low: 'bg-gray-500/10 text-gray-600 border-gray-500/30'
  };

  return (
    <Badge variant="outline" className={cn('text-xs', colorClasses[relevance])}>
      {info.label}
    </Badge>
  );
};

/**
 * Link type badge
 */
const LinkTypeBadge: React.FC<{ type: InternalLinkType }> = ({ type }) => {
  const info = LINK_TYPE_INFO[type];
  
  const Icon = {
    contextual: Link2,
    navigational: ArrowRight,
    related: BookOpen,
    pillar: Layers,
    cluster: Network,
    footer: FileText,
    sidebar: FileText
  }[type] || Link;

  return (
    <Badge variant="secondary" className="text-xs gap-1">
      <Icon className="w-3 h-3" />
      {info.label}
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
    <Link className="w-12 h-12 text-muted-foreground/50 mb-4" />
    <h3 className="font-medium text-foreground mb-1">{title}</h3>
    <p className="text-sm text-muted-foreground mb-4">{description}</p>
    {action}
  </div>
);

// =============================================================================
// OVERVIEW TAB
// =============================================================================

const OverviewTab: React.FC<{
  analysis: InternalLinkingAnalysis;
  settings: InternalLinkingSettings;
}> = ({ analysis, settings }) => {
  const { metrics, suggestions, issues, siteStats } = analysis;

  return (
    <div className="space-y-6 p-4">
      {/* Main Score */}
      <div className="flex items-center gap-6 p-4 rounded-lg border bg-card">
        <ScoreIndicator score={metrics.overallScore} size="lg" />
        <div className="flex-1">
          <h3 className="font-semibold mb-1">Internal Linking Score</h3>
          <p className="text-sm text-muted-foreground">
            {metrics.overallScore >= 80 && 'Excellent internal linking structure!'}
            {metrics.overallScore >= 60 && metrics.overallScore < 80 && 'Good linking, some improvements possible.'}
            {metrics.overallScore >= 40 && metrics.overallScore < 60 && 'Moderate linking, consider adding more.'}
            {metrics.overallScore < 40 && 'Needs improvement. Add more internal links.'}
          </p>
          <Progress value={metrics.overallScore} className="h-2 mt-2" />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-lg border bg-card">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Link className="w-4 h-4" />
            <span className="text-xs">Current Links</span>
          </div>
          <div className="text-2xl font-bold">{metrics.internalLinkCount}</div>
          <div className="text-xs text-muted-foreground">
            Optimal: {metrics.optimalLinkCount}
          </div>
        </div>

        <div className="p-3 rounded-lg border bg-card">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Lightbulb className="w-4 h-4" />
            <span className="text-xs">Suggestions</span>
          </div>
          <div className="text-2xl font-bold">{analysis.totalSuggestions}</div>
          <div className="text-xs text-green-600">
            {analysis.highRelevanceSuggestions} high relevance
          </div>
        </div>

        <div className="p-3 rounded-lg border bg-card">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <BarChart3 className="w-4 h-4" />
            <span className="text-xs">Anchor Variety</span>
          </div>
          <div className="text-2xl font-bold">
            {Math.round(metrics.anchorTextVariety * 100)}%
          </div>
          <Progress 
            value={metrics.anchorTextVariety * 100} 
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
            {issues.filter(i => i.severity === 'warning').length} warnings
          </div>
        </div>
      </div>

      {/* Link Distribution */}
      <div className="p-4 rounded-lg border bg-card">
        <h4 className="font-medium mb-3 flex items-center gap-2">
          <Target className="w-4 h-4" />
          Link Distribution
        </h4>
        <div className="space-y-2">
          {[
            { label: 'Introduction', value: metrics.linkDistribution.introduction },
            { label: 'Body', value: metrics.linkDistribution.body },
            { label: 'Conclusion', value: metrics.linkDistribution.conclusion }
          ].map(item => (
            <div key={item.label} className="flex items-center gap-3">
              <span className="text-sm w-24">{item.label}</span>
              <Progress 
                value={(item.value / Math.max(metrics.internalLinkCount, 1)) * 100} 
                className="h-2 flex-1" 
              />
              <span className="text-sm font-medium w-8 text-right">
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Site Stats */}
      {siteStats && (
        <div className="p-4 rounded-lg border bg-card">
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <Globe className="w-4 h-4" />
            Site Overview
          </h4>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-muted-foreground">Total Pages:</span>
              <span className="ml-2 font-medium">{siteStats.totalPages}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Avg Links/Page:</span>
              <span className="ml-2 font-medium">
                {siteStats.averageLinksPerPage.toFixed(1)}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Orphan Pages:</span>
              <span className={cn(
                "ml-2 font-medium",
                siteStats.orphanPageCount > 0 && "text-orange-500"
              )}>
                {siteStats.orphanPageCount}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Topic Clusters:</span>
              <span className="ml-2 font-medium">{siteStats.clusterCount}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// =============================================================================
// SUGGESTIONS TAB
// =============================================================================

const SuggestionCard: React.FC<{
  suggestion: LinkSuggestion;
  onApply: () => void;
  onDismiss: () => void;
}> = ({ suggestion, onApply, onDismiss }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
      <div className="flex items-start gap-3">
        {/* Score */}
        <ScoreIndicator score={suggestion.relevanceScore} size="sm" />
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-sm truncate">
              {suggestion.targetPage.title}
            </span>
            <RelevanceBadge relevance={suggestion.relevance} />
          </div>
          
          <div className="text-xs text-muted-foreground mb-2 truncate">
            {suggestion.targetUrl}
          </div>
          
          {/* Anchor Text */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs text-muted-foreground">Anchor:</span>
            <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
              {suggestion.anchorText}
            </code>
          </div>
          
          {/* Match Reasons */}
          <div className="flex flex-wrap gap-1">
            {suggestion.matchReason.slice(0, 3).map((reason, idx) => (
              <Badge key={idx} variant="outline" className="text-[10px]">
                {reason.replace('-', ' ')}
              </Badge>
            ))}
            <LinkTypeBadge type={suggestion.linkType} />
          </div>
          
          {/* Expanded Details */}
          <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="w-full mt-2 h-6 text-xs">
                {isExpanded ? (
                  <>
                    <ChevronUp className="w-3 h-3 mr-1" />
                    Less
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-3 h-3 mr-1" />
                    More Details
                  </>
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2 space-y-2">
              {/* Context */}
              <div className="text-xs p-2 bg-muted rounded">
                <span className="text-muted-foreground">Context: </span>
                {suggestion.surroundingText}
              </div>
              
              {/* SEO Impact */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Link Equity:</span>
                  <span>{suggestion.seoImpact.linkEquityFlow}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Topic Relevance:</span>
                  <span>{suggestion.seoImpact.topicalRelevance}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Anchor Score:</span>
                  <span>{suggestion.seoImpact.anchorOptimization}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Structure:</span>
                  <span>{suggestion.seoImpact.structuralBenefit}%</span>
                </div>
              </div>
              
              {/* Alternative Anchors */}
              {suggestion.alternativeAnchors.length > 0 && (
                <div>
                  <span className="text-xs text-muted-foreground">Alternatives:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {suggestion.alternativeAnchors.map((alt, idx) => (
                      <code key={idx} className="text-[10px] bg-muted px-1 py-0.5 rounded">
                        {alt}
                      </code>
                    ))}
                  </div>
                </div>
              )}
            </CollapsibleContent>
          </Collapsible>
        </div>
        
        {/* Actions */}
        <div className="flex flex-col gap-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="h-7 w-7 text-green-600 hover:text-green-700 hover:bg-green-100"
                  onClick={onApply}
                >
                  <Check className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Apply Link</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="h-7 w-7 text-muted-foreground hover:text-foreground"
                  onClick={onDismiss}
                >
                  <X className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Dismiss</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>
  );
};

const SuggestionsTab: React.FC<{
  suggestions: LinkSuggestion[];
  onApply: (suggestion: LinkSuggestion) => void;
  onDismiss: (suggestionId: string) => void;
}> = ({ suggestions, onApply, onDismiss }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [relevanceFilter, setRelevanceFilter] = useState<LinkRelevance | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<InternalLinkType | 'all'>('all');

  const filteredSuggestions = useMemo(() => {
    return suggestions.filter(s => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (
          !s.targetPage.title.toLowerCase().includes(query) &&
          !s.anchorText.toLowerCase().includes(query) &&
          !s.targetUrl.toLowerCase().includes(query)
        ) {
          return false;
        }
      }
      
      // Relevance filter
      if (relevanceFilter !== 'all' && s.relevance !== relevanceFilter) {
        return false;
      }
      
      // Type filter
      if (typeFilter !== 'all' && s.linkType !== typeFilter) {
        return false;
      }
      
      // Hide applied/dismissed
      if (s.status !== 'pending') {
        return false;
      }
      
      return true;
    });
  }, [suggestions, searchQuery, relevanceFilter, typeFilter]);

  const pendingCount = suggestions.filter(s => s.status === 'pending').length;

  if (suggestions.length === 0) {
    return (
      <EmptyState
        title="No Suggestions Yet"
        description="Run the analysis to get internal linking suggestions."
      />
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Filters */}
      <div className="p-4 border-b space-y-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search suggestions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        
        {/* Filter Row */}
        <div className="flex gap-2">
          <select
            value={relevanceFilter}
            onChange={(e) => setRelevanceFilter(e.target.value as LinkRelevance | 'all')}
            className="text-sm border rounded px-2 py-1 bg-background"
          >
            <option value="all">All Relevance</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as InternalLinkType | 'all')}
            className="text-sm border rounded px-2 py-1 bg-background"
          >
            <option value="all">All Types</option>
            <option value="contextual">Contextual</option>
            <option value="pillar">Pillar</option>
            <option value="cluster">Cluster</option>
            <option value="related">Related</option>
          </select>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {filteredSuggestions.length} of {pendingCount} pending
          </span>
          <Button variant="ghost" size="sm" className="h-7 text-xs">
            Apply All High
          </Button>
        </div>
      </div>
      
      {/* Suggestions List */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-2">
          {filteredSuggestions.map(suggestion => (
            <SuggestionCard
              key={suggestion.id}
              suggestion={suggestion}
              onApply={() => onApply(suggestion)}
              onDismiss={() => onDismiss(suggestion.id)}
            />
          ))}
          
          {filteredSuggestions.length === 0 && (
            <EmptyState
              title="No Matching Suggestions"
              description="Try adjusting your filters."
            />
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

// =============================================================================
// ISSUES TAB
// =============================================================================

const IssueCard: React.FC<{ issue: LinkingIssue }> = ({ issue }) => {
  const issueInfo = ISSUE_TYPE_INFO[issue.type];
  
  const severityColors = {
    error: 'border-red-500/50 bg-red-500/5',
    warning: 'border-yellow-500/50 bg-yellow-500/5',
    info: 'border-blue-500/50 bg-blue-500/5'
  };
  
  const severityIcons = {
    error: <X className="w-4 h-4 text-red-500" />,
    warning: <AlertTriangle className="w-4 h-4 text-yellow-500" />,
    info: <Info className="w-4 h-4 text-blue-500" />
  };

  return (
    <div className={cn(
      "p-3 rounded-lg border",
      severityColors[issue.severity]
    )}>
      <div className="flex items-start gap-3">
        {severityIcons[issue.severity]}
        <div className="flex-1">
          <h4 className="font-medium text-sm mb-1">{issue.message}</h4>
          <p className="text-xs text-muted-foreground mb-2">{issue.suggestion}</p>
          {issue.affectedLinks && issue.affectedLinks.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {issue.affectedLinks.slice(0, 3).map((link, idx) => (
                <code key={idx} className="text-[10px] bg-muted px-1 py-0.5 rounded">
                  {link}
                </code>
              ))}
              {issue.affectedLinks.length > 3 && (
                <span className="text-[10px] text-muted-foreground">
                  +{issue.affectedLinks.length - 3} more
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const IssuesTab: React.FC<{
  issues: LinkingIssue[];
  recommendations: LinkingRecommendation[];
}> = ({ issues, recommendations }) => {
  if (issues.length === 0 && recommendations.length === 0) {
    return (
      <EmptyState
        title="No Issues Found"
        description="Your internal linking looks good!"
      />
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-6">
        {/* Issues */}
        {issues.length > 0 && (
          <div>
            <h3 className="font-medium mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Issues ({issues.length})
            </h3>
            <div className="space-y-2">
              {issues.map(issue => (
                <IssueCard key={issue.id} issue={issue} />
              ))}
            </div>
          </div>
        )}
        
        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div>
            <h3 className="font-medium mb-3 flex items-center gap-2">
              <Lightbulb className="w-4 h-4" />
              Recommendations ({recommendations.length})
            </h3>
            <div className="space-y-2">
              {recommendations.map(rec => (
                <div 
                  key={rec.id} 
                  className="p-3 rounded-lg border bg-card"
                >
                  <div className="flex items-start gap-3">
                    <Badge 
                      variant={rec.priority === 'high' ? 'destructive' : 'secondary'}
                      className="text-[10px]"
                    >
                      {rec.priority}
                    </Badge>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm mb-1">{rec.title}</h4>
                      <p className="text-xs text-muted-foreground mb-2">
                        {rec.description}
                      </p>
                      <div className="text-xs">
                        <span className="text-muted-foreground">Action: </span>
                        {rec.action}
                      </div>
                      <div className="text-xs mt-1">
                        <span className="text-muted-foreground">Impact: </span>
                        <span className="text-green-600">{rec.impact}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ScrollArea>
  );
};

// =============================================================================
// EXISTING LINKS TAB
// =============================================================================

const ExistingLinksTab: React.FC<{
  links: ExistingLinkInfo[];
}> = ({ links }) => {
  if (links.length === 0) {
    return (
      <EmptyState
        title="No Internal Links"
        description="This content doesn't have any internal links yet."
      />
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-2">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium">
            {links.length} Internal Links
          </span>
        </div>
        
        {links.map((link, idx) => (
          <div 
            key={idx} 
            className="p-3 rounded-lg border bg-card flex items-center gap-3"
          >
            <Link className="w-4 h-4 text-muted-foreground shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm truncate">
                {link.anchorText || '(no anchor text)'}
              </div>
              <div className="text-xs text-muted-foreground truncate">
                {link.url}
              </div>
            </div>
            {link.issues.length > 0 && (
              <Badge variant="destructive" className="text-[10px]">
                {link.issues.length} issue{link.issues.length > 1 ? 's' : ''}
              </Badge>
            )}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="icon" variant="ghost" className="h-7 w-7">
                    <ExternalLink className="w-3 h-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Open Link</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};

// =============================================================================
// SETTINGS TAB
// =============================================================================

const SettingsTab: React.FC<{
  settings: InternalLinkingSettings;
  onUpdate: (settings: Partial<InternalLinkingSettings>) => void;
}> = ({ settings, onUpdate }) => {
  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-6">
        {/* General Settings */}
        <div>
          <h3 className="font-medium mb-3">General</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">Show Low Relevance</div>
                <div className="text-xs text-muted-foreground">
                  Include suggestions with low relevance
                </div>
              </div>
              <Switch
                checked={settings.showLowRelevance}
                onCheckedChange={(checked) => onUpdate({ showLowRelevance: checked })}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">Auto-Apply High</div>
                <div className="text-xs text-muted-foreground">
                  Auto-apply high relevance suggestions
                </div>
              </div>
              <Switch
                checked={settings.autoApplyHighRelevance}
                onCheckedChange={(checked) => onUpdate({ autoApplyHighRelevance: checked })}
              />
            </div>
          </div>
        </div>
        
        {/* Thresholds */}
        <div>
          <h3 className="font-medium mb-3">Thresholds</h3>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm">Min Relevance Score</span>
                <span className="text-sm font-medium">{settings.minRelevanceScore}</span>
              </div>
              <Slider
                value={[settings.minRelevanceScore]}
                onValueChange={([value]) => onUpdate({ minRelevanceScore: value })}
                min={0}
                max={100}
                step={5}
              />
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm">Max Suggestions</span>
                <span className="text-sm font-medium">{settings.maxSuggestionsPerPage}</span>
              </div>
              <Slider
                value={[settings.maxSuggestionsPerPage]}
                onValueChange={([value]) => onUpdate({ maxSuggestionsPerPage: value })}
                min={5}
                max={50}
                step={5}
              />
            </div>
          </div>
        </div>
        
        {/* Link Preferences */}
        <div>
          <h3 className="font-medium mb-3">Link Preferences</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">Prefer Pillar Content</div>
                <div className="text-xs text-muted-foreground">
                  Prioritize links to pillar pages
                </div>
              </div>
              <Switch
                checked={settings.preferPillarContent}
                onCheckedChange={(checked) => onUpdate({ preferPillarContent: checked })}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">Help Orphan Pages</div>
                <div className="text-xs text-muted-foreground">
                  Suggest links to pages with no inbound links
                </div>
              </div>
              <Switch
                checked={settings.includeOrphanPages}
                onCheckedChange={(checked) => onUpdate({ includeOrphanPages: checked })}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">Same Category Only</div>
                <div className="text-xs text-muted-foreground">
                  Only suggest links within same category
                </div>
              </div>
              <Switch
                checked={settings.sameCategoryOnly}
                onCheckedChange={(checked) => onUpdate({ sameCategoryOnly: checked })}
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

export const InternalLinkingPanel: React.FC<InternalLinkingPanelProps> = ({
  analysis,
  isAnalyzing,
  settings,
  onAnalyze,
  onApplySuggestion,
  onDismissSuggestion,
  onUpdateSettings,
  onExportReport
}) => {
  const [activeTab, setActiveTab] = useState<string>('overview');

  const tabs = INTERNAL_LINKING_TABS;
  const pendingSuggestions = analysis?.suggestions.filter(s => s.status === 'pending').length || 0;
  const issueCount = analysis?.issues.length || 0;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-2"
        >
          <Link className="w-4 h-4" />
          Internal Links
          {analysis && pendingSuggestions > 0 && (
            <Badge variant="secondary" className="ml-1">
              {pendingSuggestions}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      
      <SheetContent className="w-[450px] sm:w-[500px] p-0 flex flex-col">
        <SheetHeader className="p-4 border-b">
          <div className="flex items-center justify-between">
            <div>
              <SheetTitle className="flex items-center gap-2">
                <Network className="w-5 h-5" />
                Internal Linking
              </SheetTitle>
              <SheetDescription>
                Smart suggestions for internal links
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
            description="Click 'Analyze' to get internal linking suggestions."
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
                    {tab.id === 'suggestions' && pendingSuggestions > 0 && (
                      <Badge 
                        variant="secondary" 
                        className="ml-1 h-4 w-4 p-0 flex items-center justify-center text-[10px]"
                      >
                        {pendingSuggestions}
                      </Badge>
                    )}
                    {tab.id === 'issues' && issueCount > 0 && (
                      <Badge 
                        variant="destructive" 
                        className="ml-1 h-4 w-4 p-0 flex items-center justify-center text-[10px]"
                      >
                        {issueCount}
                      </Badge>
                    )}
                  </TabsTrigger>
                ))}
              </TabsList>
              
              <div className="flex-1 overflow-hidden">
                <TabsContent value="overview" className="h-full m-0 data-[state=active]:block">
                  <ScrollArea className="h-full">
                    <OverviewTab analysis={analysis} settings={settings} />
                  </ScrollArea>
                </TabsContent>
                
                <TabsContent value="suggestions" className="h-full m-0 data-[state=active]:flex flex-col">
                  <SuggestionsTab
                    suggestions={analysis.suggestions}
                    onApply={onApplySuggestion}
                    onDismiss={onDismissSuggestion}
                  />
                </TabsContent>
                
                <TabsContent value="issues" className="h-full m-0 data-[state=active]:block">
                  <IssuesTab
                    issues={analysis.issues}
                    recommendations={analysis.recommendations}
                  />
                </TabsContent>
                
                <TabsContent value="existing" className="h-full m-0 data-[state=active]:block">
                  <ExistingLinksTab links={analysis.existingLinks} />
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

export default InternalLinkingPanel;

