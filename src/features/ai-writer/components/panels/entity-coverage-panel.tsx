/**
 * Entity Coverage Panel Component
 * 
 * Comprehensive entity coverage analysis UI:
 * - Entity list with filtering and sorting
 * - Relationship visualization
 * - Gap analysis
 * - Recommendations
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
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
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
  Network,
  Search,
  Filter,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  Lightbulb,
  Plus,
  Minus,
  Link,
  Download,
  RefreshCw,
  Settings2,
  Target,
  Users,
  Building2,
  MapPin,
  Box,
  Tag,
  Cpu,
  Calendar,
  Hash,
  Clock,
  DollarSign,
  Percent,
  Sparkles,
  Zap,
  GitBranch,
  Layers,
  TrendingUp,
  X,
  Copy,
  ExternalLink
} from 'lucide-react';
import { useEntityCoverage } from '@/src/features/ai-writer/hooks/tools/use-entity-coverage';
import {
  Entity,
  EntityType,
  EntityStatus,
  EntityImportance,
  EntityGap,
  EntityRecommendation,
  EntitySuggestion,
  EntityCluster,
  EntityRelationship,
  EntityCoverageMetrics,
  EntityCoverageSummary,
  EntityScoreBreakdown,
  EntityFilterState,
  EntitySortOption,
  ENTITY_TYPE_LABELS,
  ENTITY_STATUS_LABELS
} from '@/src/features/ai-writer/types/tools/entity-coverage.types';

// =============================================================================
// TYPES
// =============================================================================

interface EntityCoveragePanelProps {
  content: string;
  keyword?: string;
  onHighlightEntity?: (entity: Entity) => void;
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
  strokeWidth?: number;
  label?: string;
}> = ({ 
  score, 
  size = 100, 
  strokeWidth = 8,
  label 
}) => {
  const radius = (size - strokeWidth) / 2;
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
          strokeWidth={strokeWidth}
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          className={cn('transition-all duration-500', getColor(score))}
          strokeWidth={strokeWidth}
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

// Entity type icon
const EntityTypeIcon: React.FC<{ type: EntityType; className?: string }> = ({ type, className }) => {
  const icons: Record<EntityType, React.ReactNode> = {
    person: <Users className={className} />,
    organization: <Building2 className={className} />,
    location: <MapPin className={className} />,
    product: <Box className={className} />,
    brand: <Tag className={className} />,
    concept: <Lightbulb className={className} />,
    technology: <Cpu className={className} />,
    event: <Calendar className={className} />,
    quantity: <Hash className={className} />,
    time: <Clock className={className} />,
    money: <DollarSign className={className} />,
    percent: <Percent className={className} />,
    attribute: <Sparkles className={className} />,
    action: <Zap className={className} />,
    topic: <Target className={className} />,
    subtopic: <GitBranch className={className} />,
    custom: <Tag className={className} />
  };
  
  return <>{icons[type] || <Tag className={className} />}</>;
};

// Status badge
const StatusBadge: React.FC<{ status: EntityStatus }> = ({ status }) => {
  const config: Record<EntityStatus, { icon: typeof CheckCircle2; class: string }> = {
    covered: { icon: CheckCircle2, class: 'bg-green-500/10 text-green-600' },
    mentioned: { icon: Info, class: 'bg-blue-500/10 text-blue-600' },
    missing: { icon: AlertCircle, class: 'bg-red-500/10 text-red-600' },
    overused: { icon: AlertTriangle, class: 'bg-orange-500/10 text-orange-600' }
  };
  
  const cfg = config[status];
  const Icon = cfg.icon;
  
  return (
    <Badge variant="outline" className={cn('gap-1 text-xs', cfg.class)}>
      <Icon className="w-3 h-3" />
      {ENTITY_STATUS_LABELS[status]}
    </Badge>
  );
};

// Importance badge
const ImportanceBadge: React.FC<{ importance: EntityImportance }> = ({ importance }) => {
  const config: Record<EntityImportance, string> = {
    critical: 'bg-purple-500/10 text-purple-600 border-purple-300',
    high: 'bg-blue-500/10 text-blue-600 border-blue-300',
    medium: 'bg-gray-500/10 text-gray-600 border-gray-300',
    low: 'bg-gray-200/50 text-gray-500 border-gray-200'
  };
  
  return (
    <Badge variant="outline" className={cn('text-xs capitalize', config[importance])}>
      {importance}
    </Badge>
  );
};

// Entity card
const EntityCard: React.FC<{
  entity: Entity;
  onClick?: () => void;
  onHighlight?: () => void;
}> = ({ entity, onClick, onHighlight }) => {
  return (
    <div 
      className={cn(
        'p-3 rounded-lg border transition-colors cursor-pointer',
        'hover:bg-muted/50',
        entity.status === 'missing' && 'border-red-200 bg-red-50/50',
        entity.status === 'overused' && 'border-orange-200 bg-orange-50/50'
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <EntityTypeIcon type={entity.type} className="w-4 h-4 text-muted-foreground shrink-0" />
          <span className="font-medium truncate">{entity.text}</span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <StatusBadge status={entity.status} />
        </div>
      </div>
      
      <div className="flex items-center justify-between mt-2 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <span className="capitalize">{ENTITY_TYPE_LABELS[entity.type]}</span>
          <span>â€¢</span>
          <span>{entity.count} mentions</span>
        </div>
        <ImportanceBadge importance={entity.importance} />
      </div>
      
      {entity.status === 'missing' && (
        <div className="mt-2 text-xs text-red-600">
          This entity should be added to your content
        </div>
      )}
      
      {onHighlight && entity.positions.length > 0 && (
        <Button
          size="sm"
          variant="ghost"
          className="mt-2 w-full h-7 text-xs"
          onClick={(e) => {
            e.stopPropagation();
            onHighlight();
          }}
        >
          <Target className="w-3 h-3 mr-1" />
          Highlight in content
        </Button>
      )}
    </div>
  );
};

// Gap card
const GapCard: React.FC<{
  gap: EntityGap;
  onAdd?: () => void;
}> = ({ gap, onAdd }) => {
  return (
    <div className="p-3 rounded-lg border border-dashed border-orange-300 bg-orange-50/30">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="font-medium">{gap.entity}</div>
          <div className="text-sm text-muted-foreground mt-1">
            {gap.suggestedContext}
          </div>
        </div>
        {onAdd && (
          <Button size="sm" variant="outline" onClick={onAdd}>
            <Plus className="w-3 h-3 mr-1" />
            Add
          </Button>
        )}
      </div>
      
      {gap.competitorsWithEntity.length > 0 && (
        <div className="mt-2 text-xs text-muted-foreground">
          Found in: {gap.competitorsWithEntity.join(', ')}
        </div>
      )}
    </div>
  );
};

// Recommendation card
const RecommendationCard: React.FC<{
  recommendation: EntityRecommendation;
  onApply?: () => void;
}> = ({ recommendation, onApply }) => {
  const typeIcons: Record<string, typeof Plus> = {
    add: Plus,
    expand: TrendingUp,
    reduce: Minus,
    link: Link,
    optimize: Zap,
    cluster: Layers
  };
  
  const Icon = typeIcons[recommendation.type] || Lightbulb;
  
  return (
    <div className="p-3 rounded-lg border">
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
          
          {recommendation.suggestedAction && (
            <div className="mt-2 p-2 rounded bg-muted/50 text-sm">
              <span className="font-medium">Action:</span> {recommendation.suggestedAction}
            </div>
          )}
          
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline" className="text-xs">
              Impact: {recommendation.impact}
            </Badge>
            <Badge variant="outline" className="text-xs">
              Effort: {recommendation.effort}
            </Badge>
          </div>
        </div>
        
        {onApply && (
          <Button size="sm" variant="ghost" onClick={onApply}>
            Apply
          </Button>
        )}
      </div>
    </div>
  );
};

// Cluster card
const ClusterCard: React.FC<{
  cluster: EntityCluster;
  entities: Entity[];
}> = ({ cluster, entities }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const clusterEntities = entities.filter(e => cluster.entityIds.includes(e.id));
  
  return (
    <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
      <CollapsibleTrigger asChild>
        <div className="p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium">{cluster.name}</span>
              <Badge variant="secondary" className="text-xs">
                {cluster.entityIds.length} entities
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Progress value={cluster.coveragePercent} className="w-20 h-2" />
              <span className="text-sm text-muted-foreground w-10">
                {cluster.coveragePercent}%
              </span>
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
        <div className="ml-4 mt-2 space-y-2">
          {clusterEntities.map(entity => (
            <div 
              key={entity.id}
              className="p-2 rounded border text-sm flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <EntityTypeIcon type={entity.type} className="w-3 h-3" />
                <span>{entity.text}</span>
              </div>
              <StatusBadge status={entity.status} />
            </div>
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

// =============================================================================
// TAB COMPONENTS
// =============================================================================

// Overview Tab
const OverviewTab: React.FC<{
  metrics: EntityCoverageMetrics | null;
  summary: EntityCoverageSummary | null;
  scoreBreakdown: EntityScoreBreakdown | null;
}> = ({ metrics, summary, scoreBreakdown }) => {
  if (!metrics || !summary) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Run analysis to see entity coverage overview
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Score and Verdict */}
      <div className="flex items-center gap-6">
        <ScoreRing score={metrics.overallScore} label="Score" />
        
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
          <div className="text-2xl font-bold">{metrics.totalEntities}</div>
          <div className="text-xs text-muted-foreground">Total</div>
        </div>
        <div className="p-3 rounded-lg bg-green-500/10 text-center">
          <div className="text-2xl font-bold text-green-600">
            {metrics.entitiesByStatus.covered}
          </div>
          <div className="text-xs text-muted-foreground">Covered</div>
        </div>
        <div className="p-3 rounded-lg bg-red-500/10 text-center">
          <div className="text-2xl font-bold text-red-600">
            {metrics.entitiesByStatus.missing}
          </div>
          <div className="text-xs text-muted-foreground">Missing</div>
        </div>
        <div className="p-3 rounded-lg bg-purple-500/10 text-center">
          <div className="text-2xl font-bold text-purple-600">
            {metrics.entitiesByImportance.critical}
          </div>
          <div className="text-xs text-muted-foreground">Critical</div>
        </div>
      </div>
      
      {/* Score Breakdown */}
      {scoreBreakdown && (
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Score Breakdown</h4>
          
          {[
            { label: 'Breadth', value: scoreBreakdown.breadthScore },
            { label: 'Depth', value: scoreBreakdown.depthScore },
            { label: 'Relevance', value: scoreBreakdown.relevanceScore },
            { label: 'Relationships', value: scoreBreakdown.relationshipScore }
          ].map(item => (
            <div key={item.label} className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground w-24">{item.label}</span>
              <Progress value={item.value} className="flex-1 h-2" />
              <span className="text-sm font-medium w-10">{item.value}</span>
            </div>
          ))}
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
      {summary.quickWins.length > 0 && (
        <div>
          <h4 className="font-medium text-sm text-yellow-600 mb-2 flex items-center gap-1">
            <Zap className="w-4 h-4" />
            Quick Wins
          </h4>
          <div className="space-y-2">
            {summary.quickWins.map((win, i) => (
              <div 
                key={i}
                className="p-2 rounded bg-yellow-50 text-sm flex items-center gap-2"
              >
                <ChevronRight className="w-4 h-4 text-yellow-600" />
                {win}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Entities Tab
const EntitiesTab: React.FC<{
  entities: Entity[];
  onHighlight?: (entity: Entity) => void;
  filterEntities: (filter: Partial<EntityFilterState>) => Entity[];
  sortEntities: (entities: Entity[], sortBy: EntitySortOption) => Entity[];
}> = ({ entities, onHighlight, filterEntities, sortEntities }) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<EntityStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<EntityType | 'all'>('all');
  const [sortBy, setSortBy] = useState<EntitySortOption>('importance');
  
  const filteredEntities = useMemo(() => {
    let result = filterEntities({
      search,
      status: statusFilter,
      types: typeFilter === 'all' ? [] : [typeFilter]
    });
    
    return sortEntities(result, sortBy);
  }, [entities, search, statusFilter, typeFilter, sortBy, filterEntities, sortEntities]);
  
  // Count by status
  const statusCounts = useMemo(() => ({
    all: entities.length,
    covered: entities.filter(e => e.status === 'covered').length,
    mentioned: entities.filter(e => e.status === 'mentioned').length,
    missing: entities.filter(e => e.status === 'missing').length,
    overused: entities.filter(e => e.status === 'overused').length
  }), [entities]);
  
  return (
    <div className="space-y-4">
      {/* Search & Filters */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search entities..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as EntityStatus | 'all')}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All ({statusCounts.all})</SelectItem>
              <SelectItem value="covered">Covered ({statusCounts.covered})</SelectItem>
              <SelectItem value="mentioned">Mentioned ({statusCounts.mentioned})</SelectItem>
              <SelectItem value="missing">Missing ({statusCounts.missing})</SelectItem>
              <SelectItem value="overused">Overused ({statusCounts.overused})</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as EntityType | 'all')}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {Object.entries(ENTITY_TYPE_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as EntitySortOption)}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="importance">Importance</SelectItem>
              <SelectItem value="relevance">Relevance</SelectItem>
              <SelectItem value="count">Mentions</SelectItem>
              <SelectItem value="alphabetical">A-Z</SelectItem>
              <SelectItem value="type">Type</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Status Summary */}
      <div className="grid grid-cols-4 gap-2">
        {(['covered', 'mentioned', 'missing', 'overused'] as EntityStatus[]).map(status => (
          <button
            key={status}
            className={cn(
              'p-2 rounded text-center transition-colors',
              statusFilter === status && 'ring-2 ring-primary',
              status === 'covered' && 'bg-green-500/10',
              status === 'mentioned' && 'bg-blue-500/10',
              status === 'missing' && 'bg-red-500/10',
              status === 'overused' && 'bg-orange-500/10'
            )}
            onClick={() => setStatusFilter(statusFilter === status ? 'all' : status)}
          >
            <div className="text-lg font-bold">{statusCounts[status]}</div>
            <div className="text-xs capitalize">{status}</div>
          </button>
        ))}
      </div>
      
      {/* Entity List */}
      <ScrollArea className="h-[400px]">
        <div className="space-y-2">
          {filteredEntities.map(entity => (
            <EntityCard
              key={entity.id}
              entity={entity}
              onHighlight={() => onHighlight?.(entity)}
            />
          ))}
          
          {filteredEntities.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No entities found
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

// Gaps Tab
const GapsTab: React.FC<{
  gaps: EntityGap[];
  suggestions: EntitySuggestion[];
}> = ({ gaps, suggestions }) => {
  return (
    <div className="space-y-6">
      {/* Gap Analysis */}
      <div>
        <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-orange-500" />
          Entity Gaps ({gaps.length})
        </h4>
        
        {gaps.length > 0 ? (
          <div className="space-y-2">
            {gaps.slice(0, 10).map(gap => (
              <GapCard key={gap.id} gap={gap} />
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-muted-foreground text-sm">
            No significant gaps found
          </div>
        )}
      </div>
      
      {/* Suggestions */}
      <div>
        <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-yellow-500" />
          Suggested Entities ({suggestions.length})
        </h4>
        
        {suggestions.length > 0 ? (
          <div className="space-y-2">
            {suggestions.map((suggestion, i) => (
              <div 
                key={i}
                className="p-3 rounded-lg border bg-muted/30"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <EntityTypeIcon type={suggestion.type} className="w-4 h-4" />
                    <span className="font-medium">{suggestion.entity}</span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {suggestion.relevance}% relevance
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {suggestion.reason}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-muted-foreground text-sm">
            No suggestions at this time
          </div>
        )}
      </div>
    </div>
  );
};

// Recommendations Tab
const RecommendationsTab: React.FC<{
  recommendations: EntityRecommendation[];
}> = ({ recommendations }) => {
  if (recommendations.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <CheckCircle2 className="w-12 h-12 mx-auto mb-2 text-green-500" />
        <p>Great job! No recommendations at this time.</p>
      </div>
    );
  }
  
  // Group by type
  const byType = recommendations.reduce((acc, rec) => {
    if (!acc[rec.type]) acc[rec.type] = [];
    acc[rec.type].push(rec);
    return acc;
  }, {} as Record<string, EntityRecommendation[]>);
  
  return (
    <div className="space-y-4">
      {Object.entries(byType).map(([type, recs]) => (
        <div key={type}>
          <h4 className="font-medium text-sm mb-2 capitalize">
            {type} Recommendations ({recs.length})
          </h4>
          <div className="space-y-2">
            {recs.map(rec => (
              <RecommendationCard key={rec.id} recommendation={rec} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

// Clusters Tab
const ClustersTab: React.FC<{
  clusters: EntityCluster[];
  entities: Entity[];
}> = ({ clusters, entities }) => {
  if (clusters.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Layers className="w-12 h-12 mx-auto mb-2 opacity-50" />
        <p>No entity clusters found</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-3">
      {clusters.map(cluster => (
        <ClusterCard key={cluster.id} cluster={cluster} entities={entities} />
      ))}
    </div>
  );
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export const EntityCoveragePanel: React.FC<EntityCoveragePanelProps> = ({
  content,
  keyword = '',
  onHighlightEntity,
  trigger,
  className
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  
  const {
    analysis,
    isAnalyzing,
    metrics,
    entities,
    relationships,
    clusters,
    gaps,
    recommendations,
    suggestions,
    summary,
    scoreBreakdown,
    analyze,
    filterEntities,
    sortEntities,
    exportReport
  } = useEntityCoverage({ keyword });
  
  // Auto-analyze when content changes
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
            <Network className="w-4 h-4 mr-2" />
            Entities
            {metrics && metrics.entitiesByStatus.missing > 0 && (
              <Badge variant="destructive" className="ml-2">
                {metrics.entitiesByStatus.missing}
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
                <Network className="w-5 h-5" />
                Entity Coverage
              </SheetTitle>
              <SheetDescription>
                Named entity analysis and coverage
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
          <TabsList className="grid w-full grid-cols-5 shrink-0">
            <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
            <TabsTrigger value="entities" className="text-xs">Entities</TabsTrigger>
            <TabsTrigger value="gaps" className="text-xs">Gaps</TabsTrigger>
            <TabsTrigger value="recommendations" className="text-xs">Tips</TabsTrigger>
            <TabsTrigger value="clusters" className="text-xs">Clusters</TabsTrigger>
          </TabsList>
          
          <ScrollArea className="flex-1 mt-4">
            <TabsContent value="overview" className="m-0">
              <OverviewTab 
                metrics={metrics}
                summary={summary}
                scoreBreakdown={scoreBreakdown}
              />
            </TabsContent>
            
            <TabsContent value="entities" className="m-0">
              <EntitiesTab
                entities={entities}
                onHighlight={onHighlightEntity}
                filterEntities={filterEntities}
                sortEntities={sortEntities}
              />
            </TabsContent>
            
            <TabsContent value="gaps" className="m-0">
              <GapsTab gaps={gaps} suggestions={suggestions} />
            </TabsContent>
            
            <TabsContent value="recommendations" className="m-0">
              <RecommendationsTab recommendations={recommendations} />
            </TabsContent>
            
            <TabsContent value="clusters" className="m-0">
              <ClustersTab clusters={clusters} entities={entities} />
            </TabsContent>
          </ScrollArea>
        </Tabs>
        
        {/* Loading Overlay */}
        {isAnalyzing && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
            <div className="text-center">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Analyzing entities...</p>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default EntityCoveragePanel;

