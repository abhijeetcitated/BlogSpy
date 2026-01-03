'use client';

/**
 * Image Optimization Panel Component
 * 
 * Provides comprehensive image SEO optimization:
 * - Alt text analysis and suggestions
 * - File size and format optimization
 * - Performance recommendations
 * - Bulk optimization actions
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger
} from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Slider } from '@/components/ui/slider';
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
import {
  Image as ImageIcon,
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle2,
  FileImage,
  FileWarning,
  Zap,
  Download,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  Copy,
  Pencil,
  ImagePlus,
  Gauge,
  FileType,
  Ruler,
  Eye,
  EyeOff,
  Settings,
  Lightbulb,
  ArrowRight,
  Filter,
  Search,
  LayoutGrid,
  List
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useImageOptimization } from '@/src/features/ai-writer/hooks/tools/use-image-optimization';
import {
  ImageFormat,
  ImageIssueSeverity,
  ImageStatus,
  ImageInfo,
  ImageIssue,
  AltTextSuggestion,
  ImageOptimizationRecommendation,
  ImageOptimizationSettings,
  IMAGE_FORMAT_INFO,
  IMAGE_ISSUE_TYPE_INFO,
  OPTIMIZATION_ACTION_INFO
} from '@/src/features/ai-writer/types/tools/image-optimization.types';

// ============================================================================
// TYPES
// ============================================================================

interface ImageOptimizationPanelProps {
  content: string;
  onApplyOptimization?: (imageId: string, action: string, value?: string) => void;
  trigger?: React.ReactNode;
  className?: string;
}

type FilterStatus = 'all' | ImageStatus;
type ViewMode = 'grid' | 'list';

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

// Score indicator ring
const ScoreRing: React.FC<{
  score: number;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  showLabel?: boolean;
}> = ({ score, size = 'md', label, showLabel = true }) => {
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-20 h-20',
    lg: 'w-28 h-28'
  };
  
  const strokeWidth = size === 'sm' ? 4 : size === 'md' ? 5 : 6;
  const textSize = size === 'sm' ? 'text-sm' : size === 'md' ? 'text-xl' : 'text-3xl';
  const labelSize = size === 'sm' ? 'text-[10px]' : 'text-xs';
  
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;
  
  const getScoreColor = (s: number) => {
    if (s >= 90) return 'text-green-500';
    if (s >= 70) return 'text-blue-500';
    if (s >= 50) return 'text-yellow-500';
    return 'text-red-500';
  };
  
  return (
    <div className={cn('relative', sizeClasses[size])}>
      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-muted/30"
        />
        <circle
          cx="50"
          cy="50"
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          className={cn('transition-all duration-500', getScoreColor(score))}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn('font-bold', textSize, getScoreColor(score))}>
          {score}
        </span>
        {showLabel && label && (
          <span className={cn('text-muted-foreground', labelSize)}>
            {label}
          </span>
        )}
      </div>
    </div>
  );
};

// Status badge
const StatusBadge: React.FC<{ status: ImageStatus }> = ({ status }) => {
  const config = {
    optimized: { label: 'Optimized', class: 'bg-green-500/10 text-green-600' },
    needs_work: { label: 'Needs Work', class: 'bg-yellow-500/10 text-yellow-600' },
    critical: { label: 'Critical', class: 'bg-red-500/10 text-red-600' },
    pending: { label: 'Pending', class: 'bg-gray-500/10 text-gray-600' }
  };
  
  const cfg = config[status] || config.pending;
  
  return (
    <Badge className={cn('text-xs', cfg.class)}>
      {cfg.label}
    </Badge>
  );
};

// Severity badge
const SeverityBadge: React.FC<{ severity: ImageIssueSeverity }> = ({ severity }) => {
  const config: Record<ImageIssueSeverity, { icon: typeof AlertCircle; class: string }> = {
    critical: { icon: AlertCircle, class: 'bg-red-500/10 text-red-600' },
    warning: { icon: AlertTriangle, class: 'bg-orange-500/10 text-orange-600' },
    suggestion: { icon: Info, class: 'bg-yellow-500/10 text-yellow-600' },
    info: { icon: Info, class: 'bg-blue-500/10 text-blue-600' }
  };
  
  const cfg = config[severity];
  const Icon = cfg.icon;
  
  return (
    <Badge variant="outline" className={cn('text-xs gap-1', cfg.class)}>
      <Icon className="w-3 h-3" />
      {severity.charAt(0).toUpperCase() + severity.slice(1)}
    </Badge>
  );
};

// Priority badge
const PriorityBadge: React.FC<{ 
  priority: ImageOptimizationRecommendation['priority'] 
}> = ({ priority }) => {
  const config = {
    critical: 'bg-red-500/10 text-red-600 border-red-200',
    high: 'bg-orange-500/10 text-orange-600 border-orange-200',
    medium: 'bg-yellow-500/10 text-yellow-600 border-yellow-200',
    low: 'bg-blue-500/10 text-blue-600 border-blue-200'
  };
  
  return (
    <Badge variant="outline" className={cn('text-xs', config[priority])}>
      {priority.charAt(0).toUpperCase() + priority.slice(1)}
    </Badge>
  );
};

// Format badge
const FormatBadge: React.FC<{ format: ImageFormat }> = ({ format }) => {
  const info = IMAGE_FORMAT_INFO[format];
  
  return (
    <Badge 
      variant="outline" 
      className={cn(
        'text-xs gap-1',
        info?.modern ? 'border-green-200 text-green-600' : 'border-gray-200'
      )}
    >
      <FileType className="w-3 h-3" />
      {info?.label || format.toUpperCase()}
    </Badge>
  );
};

// Image thumbnail
const ImageThumbnail: React.FC<{
  src: string;
  alt?: string;
  className?: string;
}> = ({ src, alt, className }) => {
  const [error, setError] = useState(false);
  
  if (error) {
    return (
      <div className={cn(
        'flex items-center justify-center bg-muted rounded',
        className
      )}>
        <FileImage className="w-6 h-6 text-muted-foreground" />
      </div>
    );
  }
  
  return (
    <img
      src={src}
      alt={alt || ''}
      className={cn('object-cover rounded', className)}
      onError={() => setError(true)}
    />
  );
};

// Stat card
const StatCard: React.FC<{
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: 'good' | 'bad' | 'neutral';
  subtitle?: string;
}> = ({ label, value, icon, trend, subtitle }) => (
  <div className="bg-muted/30 rounded-lg p-3 space-y-1">
    <div className="flex items-center justify-between">
      <span className="text-xs text-muted-foreground">{label}</span>
      {icon}
    </div>
    <div className={cn(
      'text-xl font-semibold',
      trend === 'good' && 'text-green-600',
      trend === 'bad' && 'text-red-600'
    )}>
      {value}
    </div>
    {subtitle && (
      <div className="text-xs text-muted-foreground">{subtitle}</div>
    )}
  </div>
);

// ============================================================================
// IMAGE CARD COMPONENT
// ============================================================================

const ImageCard: React.FC<{
  image: ImageInfo;
  onApplyAlt?: (alt: string) => void;
  onApplyFix?: (action: string) => void;
  isExpanded?: boolean;
  onToggle?: () => void;
}> = ({ image, onApplyAlt, onApplyFix, isExpanded, onToggle }) => {
  const [editingAlt, setEditingAlt] = useState(false);
  const [altValue, setAltValue] = useState(image.alt || '');
  
  const handleSaveAlt = () => {
    onApplyAlt?.(altValue);
    setEditingAlt(false);
  };
  
  return (
    <div className="border rounded-lg overflow-hidden bg-background">
      <div 
        className="flex items-start gap-3 p-3 cursor-pointer hover:bg-muted/30 transition-colors"
        onClick={onToggle}
      >
        {/* Thumbnail */}
        <ImageThumbnail 
          src={image.src} 
          alt={image.alt}
          className="w-16 h-16 shrink-0"
        />
        
        {/* Info */}
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium truncate">
              {image.filename || 'Unknown image'}
            </span>
            <StatusBadge status={image.status} />
          </div>
          
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <FormatBadge format={image.format} />
            {image.width && image.height && (
              <span>{image.width}×{image.height}</span>
            )}
            {image.issues.length > 0 && (
              <span className="text-orange-500">
                {image.issues.length} issue{image.issues.length > 1 ? 's' : ''}
              </span>
            )}
          </div>
          
          {/* Alt text preview */}
          <div className="text-xs">
            <span className="text-muted-foreground">Alt: </span>
            {image.alt ? (
              <span className={cn(
                'truncate',
                image.alt.length > 125 && 'text-orange-500'
              )}>
                "{image.alt.slice(0, 50)}{image.alt.length > 50 ? '...' : ''}"
              </span>
            ) : (
              <span className="text-red-500 italic">Missing</span>
            )}
          </div>
        </div>
        
        {/* Score & Expand */}
        <div className="flex items-center gap-2">
          <ScoreRing score={image.score} size="sm" showLabel={false} />
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          )}
        </div>
      </div>
      
      {/* Expanded content */}
      {isExpanded && (
        <div className="border-t p-3 space-y-3 bg-muted/10">
          {/* Alt text editor */}
          <div className="space-y-2">
            <Label className="text-xs">Alt Text</Label>
            {editingAlt ? (
              <div className="flex gap-2">
                <Input
                  value={altValue}
                  onChange={(e) => setAltValue(e.target.value)}
                  placeholder="Enter descriptive alt text..."
                  className="text-sm"
                />
                <Button size="sm" onClick={handleSaveAlt}>
                  Save
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={() => setEditingAlt(false)}
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div className="flex-1 text-sm p-2 bg-muted rounded">
                  {image.alt || <span className="text-muted-foreground italic">No alt text</span>}
                </div>
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={() => setEditingAlt(true)}
                >
                  <Pencil className="w-4 h-4" />
                </Button>
              </div>
            )}
            {image.alt && (
              <div className="text-xs text-muted-foreground">
                {image.alt.length} characters 
                {image.alt.length > 125 && (
                  <span className="text-orange-500"> (recommended: under 125)</span>
                )}
              </div>
            )}
          </div>
          
          {/* Issues */}
          {image.issues.length > 0 && (
            <div className="space-y-2">
              <Label className="text-xs">Issues</Label>
              <div className="space-y-2">
                {image.issues.map((issue) => (
                  <div 
                    key={issue.id}
                    className="flex items-start gap-2 p-2 bg-muted/50 rounded text-sm"
                  >
                    <SeverityBadge severity={issue.severity} />
                    <div className="flex-1 space-y-1">
                      <div className="font-medium">{issue.message}</div>
                      {issue.suggestedFix && (
                        <div className="text-xs text-muted-foreground">
                          Fix: {issue.suggestedFix}
                        </div>
                      )}
                    </div>
                    {issue.autoFixable && issue.action && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => onApplyFix?.(issue.action!)}
                      >
                        <Zap className="w-3 h-3 mr-1" />
                        Fix
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Quick actions */}
          <div className="flex items-center gap-2 pt-2 border-t">
            <Button size="sm" variant="ghost">
              <Copy className="w-3 h-3 mr-1" />
              Copy URL
            </Button>
            <Button size="sm" variant="ghost">
              <Eye className="w-3 h-3 mr-1" />
              Preview
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// ISSUE CARD COMPONENT
// ============================================================================

const IssueCard: React.FC<{
  issue: ImageIssue;
  imageName: string;
  onFix?: () => void;
}> = ({ issue, imageName, onFix }) => {
  const typeInfo = IMAGE_ISSUE_TYPE_INFO[issue.type];
  
  return (
    <div className="border rounded-lg p-3 space-y-2 hover:bg-muted/20 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <SeverityBadge severity={issue.severity} />
            <span className="text-sm font-medium">{issue.message}</span>
          </div>
          <div className="text-xs text-muted-foreground">
            Image: {imageName}
          </div>
        </div>
        {issue.autoFixable && (
          <Button size="sm" variant="outline" onClick={onFix}>
            <Zap className="w-3 h-3 mr-1" />
            Quick Fix
          </Button>
        )}
      </div>
      
      {issue.details && (
        <div className="text-sm text-muted-foreground">
          {issue.details}
        </div>
      )}
      
      {issue.suggestedFix && (
        <div className="flex items-start gap-2 text-sm bg-muted/30 rounded p-2">
          <Lightbulb className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
          <span>{issue.suggestedFix}</span>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// RECOMMENDATION CARD COMPONENT
// ============================================================================

const RecommendationCard: React.FC<{
  recommendation: ImageOptimizationRecommendation;
  onApply?: () => void;
}> = ({ recommendation, onApply }) => {
  const actionInfo = OPTIMIZATION_ACTION_INFO[recommendation.action];
  
  return (
    <div className="border rounded-lg p-4 space-y-3 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <PriorityBadge priority={recommendation.priority} />
            <span className="font-medium">{recommendation.title}</span>
          </div>
          <div className="text-sm text-muted-foreground">
            {recommendation.description}
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-1">
          <ImageIcon className="w-4 h-4 text-muted-foreground" />
          <span>{recommendation.affectedImages.length} images</span>
        </div>
        
        {recommendation.potentialImpact && (
          <div className="flex items-center gap-1 text-green-600">
            <Zap className="w-4 h-4" />
            <span>{recommendation.potentialImpact}</span>
          </div>
        )}
        
        <Badge variant="outline" className="text-xs">
          Effort: {recommendation.effort}
        </Badge>
      </div>
      
      <Button 
        size="sm" 
        className="w-full"
        onClick={onApply}
      >
        {actionInfo?.label || 'Apply'} <ArrowRight className="w-4 h-4 ml-2" />
      </Button>
    </div>
  );
};

// ============================================================================
// ALT TEXT SUGGESTION CARD
// ============================================================================

const AltSuggestionCard: React.FC<{
  suggestion: AltTextSuggestion;
  onApply?: (alt: string) => void;
}> = ({ suggestion, onApply }) => (
  <div className="border rounded-lg p-3 space-y-2">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <FileImage className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm font-medium">
          Image #{suggestion.imageId.split('-')[1]}
        </span>
      </div>
      <Badge variant="outline" className="text-xs">
        {suggestion.confidence}% confidence
      </Badge>
    </div>
    
    {suggestion.currentAlt && (
      <div className="text-sm">
        <span className="text-muted-foreground">Current: </span>
        <span className="text-orange-500">"{suggestion.currentAlt}"</span>
      </div>
    )}
    
    <div className="text-sm">
      <span className="text-muted-foreground">Suggested: </span>
      <span className="text-green-600">"{suggestion.suggestedAlt}"</span>
    </div>
    
    {suggestion.reasoning && (
      <div className="text-xs text-muted-foreground italic">
        {suggestion.reasoning}
      </div>
    )}
    
    <Button 
      size="sm" 
      variant="outline"
      className="w-full"
      onClick={() => onApply?.(suggestion.suggestedAlt)}
    >
      Apply Suggestion
    </Button>
  </div>
);

// ============================================================================
// TAB COMPONENTS
// ============================================================================

// Overview Tab
const OverviewTab: React.FC<{
  metrics: ReturnType<typeof useImageOptimization>['metrics'];
  analysis: ReturnType<typeof useImageOptimization>['analysis'];
}> = ({ metrics, analysis }) => {
  if (!metrics) return null;
  
  return (
    <div className="space-y-6">
      {/* Main score */}
      <div className="flex items-center justify-center py-4">
        <div className="text-center space-y-2">
          <ScoreRing score={metrics.overallScore} size="lg" label="Overall" />
          <div className="text-sm text-muted-foreground">
            {analysis?.summary}
          </div>
        </div>
      </div>
      
      {/* Score breakdown */}
      <div className="grid grid-cols-3 gap-3">
        <div className="text-center p-3 bg-muted/30 rounded-lg">
          <ScoreRing score={metrics.altTextScore} size="sm" label="Alt Text" />
        </div>
        <div className="text-center p-3 bg-muted/30 rounded-lg">
          <ScoreRing score={metrics.performanceScore} size="sm" label="Performance" />
        </div>
        <div className="text-center p-3 bg-muted/30 rounded-lg">
          <ScoreRing score={metrics.formatScore} size="sm" label="Format" />
        </div>
      </div>
      
      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          label="Total Images"
          value={metrics.totalImages}
          icon={<ImageIcon className="w-4 h-4 text-muted-foreground" />}
        />
        <StatCard
          label="Optimized"
          value={metrics.optimizedImages}
          icon={<CheckCircle2 className="w-4 h-4 text-green-500" />}
          trend={metrics.optimizedImages === metrics.totalImages ? 'good' : 'neutral'}
        />
        <StatCard
          label="Need Work"
          value={metrics.imagesWithIssues}
          icon={<AlertTriangle className="w-4 h-4 text-yellow-500" />}
          trend={metrics.imagesWithIssues > 0 ? 'bad' : 'good'}
        />
        <StatCard
          label="Critical Issues"
          value={metrics.criticalIssues}
          icon={<AlertCircle className="w-4 h-4 text-red-500" />}
          trend={metrics.criticalIssues > 0 ? 'bad' : 'good'}
        />
      </div>
      
      {/* Alt text breakdown */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium">Alt Text Coverage</h4>
        <div className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span>Images with alt text</span>
            <span className="font-medium text-green-600">{metrics.imagesWithAlt}</span>
          </div>
          <Progress 
            value={(metrics.imagesWithAlt / Math.max(metrics.totalImages, 1)) * 100} 
            className="h-2"
          />
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Without alt: {metrics.imagesWithoutAlt}</span>
          <span>Empty alt: {metrics.imagesWithEmptyAlt}</span>
        </div>
      </div>
      
      {/* Quick wins */}
      {analysis?.quickWins && analysis.quickWins.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-500" />
            Quick Wins
          </h4>
          <div className="space-y-1">
            {analysis.quickWins.map((win, i) => (
              <div 
                key={i}
                className="text-sm p-2 bg-yellow-500/10 rounded flex items-center gap-2"
              >
                <ChevronRight className="w-4 h-4" />
                {win}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Images Tab
const ImagesTab: React.FC<{
  images: ImageInfo[];
  onApplyOptimization?: (imageId: string, action: string, value?: string) => void;
}> = ({ images, onApplyOptimization }) => {
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  
  const filteredImages = useMemo(() => {
    return images.filter(img => {
      const matchesFilter = filter === 'all' || img.status === filter;
      const matchesSearch = !searchQuery || 
        img.filename?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        img.alt?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [images, filter, searchQuery]);
  
  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search images..."
            className="pl-8 h-8"
          />
        </div>
        
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as FilterStatus)}
          className="h-8 text-sm border rounded px-2"
        >
          <option value="all">All ({images.length})</option>
          <option value="critical">Critical</option>
          <option value="needs_work">Needs Work</option>
          <option value="optimized">Optimized</option>
        </select>
        
        <div className="flex items-center border rounded">
          <Button
            size="sm"
            variant={viewMode === 'list' ? 'secondary' : 'ghost'}
            className="h-8 w-8 p-0"
            onClick={() => setViewMode('list')}
          >
            <List className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
            className="h-8 w-8 p-0"
            onClick={() => setViewMode('grid')}
          >
            <LayoutGrid className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      {/* Results */}
      <div className="text-xs text-muted-foreground">
        {filteredImages.length} of {images.length} images
      </div>
      
      {/* Image list/grid */}
      {viewMode === 'list' ? (
        <div className="space-y-2">
          {filteredImages.map((image) => (
            <ImageCard
              key={image.id}
              image={image}
              isExpanded={expandedId === image.id}
              onToggle={() => setExpandedId(
                expandedId === image.id ? null : image.id
              )}
              onApplyAlt={(alt) => onApplyOptimization?.(image.id, 'add_alt', alt)}
              onApplyFix={(action) => onApplyOptimization?.(image.id, action)}
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {filteredImages.map((image) => (
            <TooltipProvider key={image.id}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div 
                    className={cn(
                      'relative aspect-square border rounded overflow-hidden cursor-pointer',
                      'hover:ring-2 hover:ring-primary transition-all',
                      image.status === 'critical' && 'ring-2 ring-red-500',
                      image.status === 'needs_work' && 'ring-2 ring-yellow-500'
                    )}
                    onClick={() => setExpandedId(image.id)}
                  >
                    <ImageThumbnail 
                      src={image.src} 
                      alt={image.alt}
                      className="w-full h-full"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-1 text-xs text-white">
                      Score: {image.score}
                    </div>
                    {image.issues.length > 0 && (
                      <div className="absolute top-1 right-1">
                        <Badge className="bg-red-500 text-white text-[10px] h-4">
                          {image.issues.length}
                        </Badge>
                      </div>
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="text-xs space-y-1">
                    <div className="font-medium">{image.filename}</div>
                    <div>Score: {image.score}/100</div>
                    <div>Issues: {image.issues.length}</div>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>
      )}
      
      {filteredImages.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-30" />
          <p>No images found matching your criteria</p>
        </div>
      )}
    </div>
  );
};

// Issues Tab
const IssuesTab: React.FC<{
  issues: ImageIssue[];
  images: ImageInfo[];
  onFix?: (imageId: string, action: string) => void;
}> = ({ issues, images, onFix }) => {
  const [severityFilter, setSeverityFilter] = useState<ImageIssueSeverity | 'all'>('all');
  
  const getImageName = (imageId: string) => {
    const image = images.find(i => i.id === imageId);
    return image?.filename || 'Unknown';
  };
  
  const filteredIssues = useMemo(() => {
    if (severityFilter === 'all') return issues;
    return issues.filter(i => i.severity === severityFilter);
  }, [issues, severityFilter]);
  
  const issueCounts = useMemo(() => ({
    critical: issues.filter(i => i.severity === 'critical').length,
    warning: issues.filter(i => i.severity === 'warning').length,
    suggestion: issues.filter(i => i.severity === 'suggestion').length,
    info: issues.filter(i => i.severity === 'info').length
  }), [issues]);
  
  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-4 gap-2">
        {(['critical', 'warning', 'suggestion', 'info'] as const).map((sev) => (
          <button
            key={sev}
            className={cn(
              'p-2 rounded text-center transition-colors',
              severityFilter === sev && 'ring-2 ring-primary',
              sev === 'critical' && 'bg-red-500/10',
              sev === 'warning' && 'bg-orange-500/10',
              sev === 'suggestion' && 'bg-yellow-500/10',
              sev === 'info' && 'bg-blue-500/10'
            )}
            onClick={() => setSeverityFilter(
              severityFilter === sev ? 'all' : sev
            )}
          >
            <div className="text-lg font-bold">{issueCounts[sev]}</div>
            <div className="text-xs capitalize">{sev}</div>
          </button>
        ))}
      </div>
      
      {/* Issues list */}
      <div className="space-y-2">
        {filteredIssues.map((issue) => (
          <IssueCard
            key={issue.id}
            issue={issue}
            imageName={getImageName(issue.imageId)}
            onFix={() => issue.action && onFix?.(issue.imageId, issue.action)}
          />
        ))}
      </div>
      
      {filteredIssues.length === 0 && (
        <div className="text-center py-8">
          <CheckCircle2 className="w-12 h-12 mx-auto mb-2 text-green-500" />
          <p className="text-muted-foreground">
            {issues.length === 0 
              ? 'No issues found! All images are optimized.'
              : 'No issues matching the filter.'
            }
          </p>
        </div>
      )}
    </div>
  );
};

// Recommendations Tab
const RecommendationsTab: React.FC<{
  recommendations: ImageOptimizationRecommendation[];
  altSuggestions: AltTextSuggestion[];
  onApplyRecommendation?: (rec: ImageOptimizationRecommendation) => void;
  onApplyAlt?: (imageId: string, alt: string) => void;
}> = ({ recommendations, altSuggestions, onApplyRecommendation, onApplyAlt }) => (
  <div className="space-y-6">
    {/* Main recommendations */}
    {recommendations.length > 0 && (
      <div className="space-y-3">
        <h4 className="text-sm font-medium">Top Recommendations</h4>
        {recommendations.map((rec) => (
          <RecommendationCard
            key={rec.id}
            recommendation={rec}
            onApply={() => onApplyRecommendation?.(rec)}
          />
        ))}
      </div>
    )}
    
    {/* Alt text suggestions */}
    {altSuggestions.length > 0 && (
      <div className="space-y-3">
        <h4 className="text-sm font-medium">Alt Text Suggestions</h4>
        <div className="space-y-2">
          {altSuggestions.map((suggestion) => (
            <AltSuggestionCard
              key={suggestion.id}
              suggestion={suggestion}
              onApply={(alt) => onApplyAlt?.(suggestion.imageId, alt)}
            />
          ))}
        </div>
      </div>
    )}
    
    {recommendations.length === 0 && altSuggestions.length === 0 && (
      <div className="text-center py-8">
        <CheckCircle2 className="w-12 h-12 mx-auto mb-2 text-green-500" />
        <p className="text-muted-foreground">
          All images are well optimized! No recommendations.
        </p>
      </div>
    )}
  </div>
);

// Settings Tab
const SettingsTab: React.FC<{
  settings: ImageOptimizationSettings;
  onUpdateSettings: (settings: Partial<ImageOptimizationSettings>) => void;
}> = ({ settings, onUpdateSettings }) => (
  <div className="space-y-6">
    {/* Check toggles */}
    <div className="space-y-4">
      <h4 className="text-sm font-medium">Analysis Checks</h4>
      
      <div className="space-y-3">
        {([
          { key: 'checkAltText', label: 'Alt Text Analysis', desc: 'Check for missing or generic alt text' },
          { key: 'checkFileSize', label: 'File Size Analysis', desc: 'Check for oversized images' },
          { key: 'checkFormat', label: 'Format Analysis', desc: 'Check for legacy formats' },
          { key: 'checkDimensions', label: 'Dimension Analysis', desc: 'Check for missing dimensions' },
          { key: 'checkLazyLoading', label: 'Lazy Loading', desc: 'Check for lazy loading below fold' },
          { key: 'checkSrcset', label: 'Responsive Images', desc: 'Check for srcset on large images' }
        ] as const).map(({ key, label, desc }) => (
          <div 
            key={key}
            className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
          >
            <div>
              <Label className="text-sm">{label}</Label>
              <p className="text-xs text-muted-foreground">{desc}</p>
            </div>
            <Switch
              checked={settings[key]}
              onCheckedChange={(checked) => onUpdateSettings({ [key]: checked })}
            />
          </div>
        ))}
      </div>
    </div>
    
    {/* Thresholds */}
    <div className="space-y-4">
      <h4 className="text-sm font-medium">Thresholds</h4>
      
      <div className="space-y-4 p-3 bg-muted/30 rounded-lg">
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label className="text-sm">Max File Size (KB)</Label>
            <span className="text-sm font-medium">{settings.maxFileSize / 1024} KB</span>
          </div>
          <Slider
            value={[settings.maxFileSize / 1024]}
            onValueChange={([v]) => onUpdateSettings({ maxFileSize: v * 1024 })}
            min={50}
            max={1000}
            step={50}
          />
        </div>
        
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label className="text-sm">Max Image Width (px)</Label>
            <span className="text-sm font-medium">{settings.maxWidth}px</span>
          </div>
          <Slider
            value={[settings.maxWidth]}
            onValueChange={([v]) => onUpdateSettings({ maxWidth: v })}
            min={800}
            max={3000}
            step={100}
          />
        </div>
        
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label className="text-sm">Max Image Height (px)</Label>
            <span className="text-sm font-medium">{settings.maxHeight}px</span>
          </div>
          <Slider
            value={[settings.maxHeight]}
            onValueChange={([v]) => onUpdateSettings({ maxHeight: v })}
            min={600}
            max={2500}
            step={100}
          />
        </div>
      </div>
    </div>
    
    {/* Additional options */}
    <div className="space-y-3">
      <h4 className="text-sm font-medium">Additional Options</h4>
      
      <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
        <div>
          <Label className="text-sm">Suggest Modern Formats</Label>
          <p className="text-xs text-muted-foreground">Recommend WebP/AVIF</p>
        </div>
        <Switch
          checked={settings.suggestModernFormats}
          onCheckedChange={(checked) => onUpdateSettings({ suggestModernFormats: checked })}
        />
      </div>
      
      <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
        <div>
          <Label className="text-sm">Suggest Alt Text</Label>
          <p className="text-xs text-muted-foreground">Generate alt text suggestions</p>
        </div>
        <Switch
          checked={settings.suggestAltText}
          onCheckedChange={(checked) => onUpdateSettings({ suggestAltText: checked })}
        />
      </div>
      
      <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
        <div>
          <Label className="text-sm">Lazy Load Below Fold</Label>
          <p className="text-xs text-muted-foreground">Require lazy loading for non-visible images</p>
        </div>
        <Switch
          checked={settings.lazyLoadBelowFold}
          onCheckedChange={(checked) => onUpdateSettings({ lazyLoadBelowFold: checked })}
        />
      </div>
    </div>
  </div>
);

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const ImageOptimizationPanel: React.FC<ImageOptimizationPanelProps> = ({
  content,
  onApplyOptimization,
  trigger,
  className
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  
  const {
    analysis,
    isAnalyzing,
    settings,
    metrics,
    images,
    issues,
    recommendations,
    altSuggestions,
    analyze,
    updateSettings,
    exportReport
  } = useImageOptimization({});
  
  // Auto-analyze when content changes
  React.useEffect(() => {
    if (content) {
      analyze(content);
    }
  }, [content, analyze]);
  
  const handleExport = useCallback(() => {
    const report = exportReport('markdown');
    if (report) {
      // Copy to clipboard
      navigator.clipboard.writeText(report);
    }
  }, [exportReport]);
  
  const handleApplyOptimization = useCallback((
    imageId: string, 
    action: string, 
    value?: string
  ) => {
    onApplyOptimization?.(imageId, action, value);
  }, [onApplyOptimization]);
  
  return (
    <Sheet>
      <SheetTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className={className}>
            <ImageIcon className="w-4 h-4 mr-2" />
            Images
            {metrics && metrics.criticalIssues > 0 && (
              <Badge variant="destructive" className="ml-2">
                {metrics.criticalIssues}
              </Badge>
            )}
          </Button>
        )}
      </SheetTrigger>
      
      <SheetContent 
        side="right" 
        className="w-full sm:max-w-xl flex flex-col p-0"
      >
        <SheetHeader className="px-4 py-3 border-b">
          <div className="flex items-center justify-between">
            <div>
              <SheetTitle className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                Image Optimization
              </SheetTitle>
              <SheetDescription>
                Optimize images for SEO and performance
              </SheetDescription>
            </div>
            <div className="flex items-center gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleExport}
                    >
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
          className="flex-1 flex flex-col"
        >
          <TabsList className="px-4 py-2 justify-start border-b rounded-none bg-transparent">
            <TabsTrigger value="overview" className="text-xs">
              Overview
            </TabsTrigger>
            <TabsTrigger value="images" className="text-xs">
              Images
              {images.length > 0 && (
                <Badge variant="secondary" className="ml-1 h-4 text-[10px]">
                  {images.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="issues" className="text-xs">
              Issues
              {issues.length > 0 && (
                <Badge variant="destructive" className="ml-1 h-4 text-[10px]">
                  {issues.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="recommendations" className="text-xs">
              Tips
            </TabsTrigger>
            <TabsTrigger value="settings" className="text-xs">
              <Settings className="w-3 h-3" />
            </TabsTrigger>
          </TabsList>
          
          <ScrollArea className="flex-1">
            <div className="p-4">
              {isAnalyzing ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Analyzing images...</p>
                </div>
              ) : (
                <>
                  <TabsContent value="overview" className="m-0">
                    <OverviewTab metrics={metrics} analysis={analysis} />
                  </TabsContent>
                  
                  <TabsContent value="images" className="m-0">
                    <ImagesTab 
                      images={images}
                      onApplyOptimization={handleApplyOptimization}
                    />
                  </TabsContent>
                  
                  <TabsContent value="issues" className="m-0">
                    <IssuesTab 
                      issues={issues}
                      images={images}
                      onFix={handleApplyOptimization}
                    />
                  </TabsContent>
                  
                  <TabsContent value="recommendations" className="m-0">
                    <RecommendationsTab 
                      recommendations={recommendations}
                      altSuggestions={altSuggestions}
                      onApplyRecommendation={(rec) => {
                        rec.affectedImages.forEach(imgId => {
                          handleApplyOptimization(imgId, rec.action);
                        });
                      }}
                      onApplyAlt={(imgId, alt) => handleApplyOptimization(imgId, 'add_alt', alt)}
                    />
                  </TabsContent>
                  
                  <TabsContent value="settings" className="m-0">
                    <SettingsTab 
                      settings={settings}
                      onUpdateSettings={updateSettings}
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
};

export default ImageOptimizationPanel;

