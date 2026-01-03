'use client';

// =============================================================================
// AUTO-OPTIMIZE BUTTON COMPONENT - Production Level
// =============================================================================
// One-click optimization UI like Surfer SEO, Clearscope, MarketMuse
// =============================================================================

import React, { useState, useMemo } from 'react';
import {
  Wand2,
  Sparkles,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  Play,
  Pause,
  RotateCcw,
  Download,
  Settings,
  Zap,
  AlertCircle,
  Clock,
  TrendingUp,
  BookOpen,
  Search,
  Heart,
  LayoutList,
  SpellCheck,
  Eye,
  EyeOff,
  Filter,
  ListChecks,
  History,
  LayoutDashboard,
  ChevronRight,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { useAutoOptimize } from '@/src/features/ai-writer/hooks/tools/use-auto-optimize';
import {
  OptimizationAction,
  OptimizationCategory,
  OptimizationPriority,
  AutoOptimizeTab,
  CATEGORY_INFO,
  PRIORITY_INFO,
  OPTIMIZATION_TABS,
  OPTIMIZATION_LEVELS,
  OptimizationLevel
} from '@/src/features/ai-writer/types/tools/auto-optimize.types';

// =============================================================================
// COMPONENT PROPS
// =============================================================================

interface AutoOptimizeButtonProps {
  content: string;
  onContentChange: (content: string) => void;
  className?: string;
  disabled?: boolean;
}

// =============================================================================
// ICON MAPPING
// =============================================================================

const CATEGORY_ICONS: Record<OptimizationCategory, React.ReactNode> = {
  'readability': <BookOpen className="h-4 w-4" />,
  'seo': <Search className="h-4 w-4" />,
  'engagement': <Heart className="h-4 w-4" />,
  'structure': <LayoutList className="h-4 w-4" />,
  'grammar': <SpellCheck className="h-4 w-4" />,
  'style': <Sparkles className="h-4 w-4" />,
  'accessibility': <Eye className="h-4 w-4" />
};

const TAB_ICONS: Record<AutoOptimizeTab, React.ReactNode> = {
  'overview': <LayoutDashboard className="h-4 w-4" />,
  'actions': <ListChecks className="h-4 w-4" />,
  'settings': <Settings className="h-4 w-4" />,
  'history': <History className="h-4 w-4" />
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function AutoOptimizeButton({
  content,
  onContentChange,
  className,
  disabled = false
}: AutoOptimizeButtonProps) {
  const {
    analysis,
    isAnalyzing,
    isBatchRunning,
    selectedActions,
    appliedActions,
    settings,
    overallScore,
    projectedScore,
    totalActions,
    criticalCount,
    highCount,
    actionsByCategory,
    filteredActions,
    analyze,
    applyAction,
    applySelected,
    applyAll,
    skipAction,
    selectAction,
    deselectAction,
    selectAll,
    deselectAll,
    updateSettings,
    exportReport,
    clearAnalysis
  } = useAutoOptimize(content, onContentChange);

  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<AutoOptimizeTab>('overview');
  const [categoryFilter, setCategoryFilter] = useState<OptimizationCategory | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<OptimizationPriority | 'all'>('all');
  const [expandedActions, setExpandedActions] = useState<Set<string>>(new Set());

  // Filter actions based on current filters
  const displayedActions = useMemo(() => {
    return filteredActions.filter(action => {
      if (categoryFilter !== 'all' && action.category !== categoryFilter) return false;
      if (priorityFilter !== 'all' && action.priority !== priorityFilter) return false;
      return true;
    });
  }, [filteredActions, categoryFilter, priorityFilter]);

  const toggleActionExpand = (actionId: string) => {
    setExpandedActions(prev => {
      const next = new Set(prev);
      if (next.has(actionId)) {
        next.delete(actionId);
      } else {
        next.add(actionId);
      }
      return next;
    });
  };

  const handleApplyAction = async (action: OptimizationAction) => {
    await applyAction(action);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "gap-2 relative",
            analysis && totalActions > 0 && "border-amber-500",
            className
          )}
          disabled={disabled}
        >
          <Wand2 className="h-4 w-4" />
          <span className="hidden sm:inline">Auto-Optimize</span>
          {analysis && totalActions > 0 && (
            <Badge 
              variant="secondary" 
              className="ml-1 h-5 px-1.5 text-xs bg-amber-100 text-amber-700"
            >
              {totalActions}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      
      <SheetContent className="w-full sm:max-w-2xl overflow-hidden flex flex-col">
        <SheetHeader className="pb-4 border-b">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2">
              <Wand2 className="h-5 w-5 text-primary" />
              Auto-Optimize
            </SheetTitle>
            <div className="flex items-center gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => analyze()}
                      disabled={isAnalyzing}
                    >
                      <RefreshCw className={cn(
                        "h-4 w-4",
                        isAnalyzing && "animate-spin"
                      )} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Re-analyze content</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              {analysis && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={exportReport}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Export report</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          </div>
          
          {/* Quick Stats Bar */}
          {analysis && (
            <div className="flex items-center gap-4 mt-4">
              <ScoreIndicator
                label="Current"
                score={overallScore}
                size="sm"
              />
              <div className="flex items-center text-muted-foreground">
                <ChevronRight className="h-4 w-4" />
              </div>
              <ScoreIndicator
                label="Projected"
                score={projectedScore}
                size="sm"
                highlight
              />
              <div className="flex-1" />
              <div className="flex items-center gap-2 text-sm">
                {criticalCount > 0 && (
                  <Badge variant="destructive" className="gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {criticalCount} Critical
                  </Badge>
                )}
                {highCount > 0 && (
                  <Badge variant="secondary" className="gap-1 bg-orange-100 text-orange-700">
                    {highCount} High
                  </Badge>
                )}
              </div>
            </div>
          )}
        </SheetHeader>

        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as AutoOptimizeTab)}
          className="flex-1 flex flex-col overflow-hidden"
        >
          <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
            {OPTIMIZATION_TABS.map(tab => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="gap-2 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none py-3"
              >
                {TAB_ICONS[tab.id]}
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <ScrollArea className="flex-1">
            {/* Overview Tab */}
            <TabsContent value="overview" className="m-0 p-4">
              {!analysis ? (
                <EmptyState onAnalyze={() => analyze()} isAnalyzing={isAnalyzing} />
              ) : (
                <OverviewTab analysis={analysis} />
              )}
            </TabsContent>

            {/* Actions Tab */}
            <TabsContent value="actions" className="m-0 p-4">
              {!analysis ? (
                <EmptyState onAnalyze={() => analyze()} isAnalyzing={isAnalyzing} />
              ) : (
                <div className="space-y-4">
                  {/* Filters and Bulk Actions */}
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      {/* Category Filter */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" className="gap-2">
                            <Filter className="h-4 w-4" />
                            Category
                            <ChevronDown className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuCheckboxItem
                            checked={categoryFilter === 'all'}
                            onCheckedChange={() => setCategoryFilter('all')}
                          >
                            All Categories
                          </DropdownMenuCheckboxItem>
                          <DropdownMenuSeparator />
                          {(Object.keys(CATEGORY_INFO) as OptimizationCategory[]).map(cat => (
                            <DropdownMenuCheckboxItem
                              key={cat}
                              checked={categoryFilter === cat}
                              onCheckedChange={() => setCategoryFilter(cat)}
                            >
                              <span className="flex items-center gap-2">
                                {CATEGORY_ICONS[cat]}
                                {CATEGORY_INFO[cat].label}
                              </span>
                            </DropdownMenuCheckboxItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>

                      {/* Priority Filter */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" className="gap-2">
                            Priority
                            <ChevronDown className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuCheckboxItem
                            checked={priorityFilter === 'all'}
                            onCheckedChange={() => setPriorityFilter('all')}
                          >
                            All Priorities
                          </DropdownMenuCheckboxItem>
                          <DropdownMenuSeparator />
                          {(Object.keys(PRIORITY_INFO) as OptimizationPriority[]).map(pri => (
                            <DropdownMenuCheckboxItem
                              key={pri}
                              checked={priorityFilter === pri}
                              onCheckedChange={() => setPriorityFilter(pri)}
                            >
                              <span className={PRIORITY_INFO[pri].color}>
                                {PRIORITY_INFO[pri].label}
                              </span>
                            </DropdownMenuCheckboxItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Bulk Actions */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={selectAll}
                        disabled={displayedActions.length === 0}
                      >
                        Select All
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={deselectAll}
                        disabled={selectedActions.size === 0}
                      >
                        Deselect All
                      </Button>
                    </div>
                  </div>

                  {/* Selected Actions Bar */}
                  {selectedActions.size > 0 && (
                    <div className="bg-primary/5 border rounded-lg p-3 flex items-center justify-between">
                      <span className="text-sm">
                        {selectedActions.size} action{selectedActions.size !== 1 ? 's' : ''} selected
                      </span>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          onClick={applySelected}
                          disabled={isBatchRunning}
                          className="gap-2"
                        >
                          <Zap className="h-4 w-4" />
                          Apply Selected
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Action List */}
                  <div className="space-y-2">
                    {displayedActions.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Check className="h-8 w-8 mx-auto mb-2 text-green-500" />
                        <p>No optimization actions match your filters</p>
                      </div>
                    ) : (
                      displayedActions.map(action => (
                        <ActionCard
                          key={action.id}
                          action={action}
                          isSelected={selectedActions.has(action.id)}
                          isApplied={appliedActions.has(action.id)}
                          isExpanded={expandedActions.has(action.id)}
                          onToggleSelect={() => {
                            if (selectedActions.has(action.id)) {
                              deselectAction(action.id);
                            } else {
                              selectAction(action.id);
                            }
                          }}
                          onToggleExpand={() => toggleActionExpand(action.id)}
                          onApply={() => handleApplyAction(action)}
                          onSkip={() => skipAction(action.id)}
                        />
                      ))
                    )}
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="m-0 p-4">
              <SettingsTab
                settings={settings}
                onUpdateSettings={updateSettings}
              />
            </TabsContent>

            {/* History Tab */}
            <TabsContent value="history" className="m-0 p-4">
              <div className="text-center py-8 text-muted-foreground">
                <History className="h-8 w-8 mx-auto mb-2" />
                <p>Optimization history will appear here</p>
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>

        {/* Bottom Action Bar */}
        {analysis && totalActions > 0 && (
          <div className="border-t p-4 bg-background">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                <Clock className="h-4 w-4 inline mr-1" />
                Est. {analysis.summary.estimatedTimeToApply} min to apply all
              </div>
              <Button
                onClick={applyAll}
                disabled={isBatchRunning || totalActions === 0}
                className="gap-2"
              >
                <Zap className="h-4 w-4" />
                Apply All ({totalActions})
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

interface ScoreIndicatorProps {
  label: string;
  score: number;
  size?: 'sm' | 'md' | 'lg';
  highlight?: boolean;
}

function ScoreIndicator({ label, score, size = 'md', highlight }: ScoreIndicatorProps) {
  const getColor = (s: number) => {
    if (s >= 80) return 'text-green-600';
    if (s >= 60) return 'text-amber-600';
    return 'text-red-600';
  };

  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl'
  };

  return (
    <div className={cn(
      "text-center",
      highlight && "bg-green-50 rounded-lg px-3 py-1"
    )}>
      <div className={cn(
        "font-bold",
        sizeClasses[size],
        getColor(score)
      )}>
        {Math.round(score)}
      </div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

interface EmptyStateProps {
  onAnalyze: () => void;
  isAnalyzing: boolean;
}

function EmptyState({ onAnalyze, isAnalyzing }: EmptyStateProps) {
  return (
    <div className="text-center py-12">
      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
        <Wand2 className="h-8 w-8 text-primary" />
      </div>
      <h3 className="text-lg font-semibold mb-2">Optimize Your Content</h3>
      <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
        Analyze your content for readability, SEO, and engagement improvements.
        Get actionable suggestions to enhance your writing.
      </p>
      <Button onClick={onAnalyze} disabled={isAnalyzing} className="gap-2">
        {isAnalyzing ? (
          <>
            <RefreshCw className="h-4 w-4 animate-spin" />
            Analyzing...
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4" />
            Analyze Content
          </>
        )}
      </Button>
    </div>
  );
}

interface OverviewTabProps {
  analysis: NonNullable<ReturnType<typeof useAutoOptimize>['analysis']>;
}

function OverviewTab({ analysis }: OverviewTabProps) {
  return (
    <div className="space-y-6">
      {/* Score Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="border rounded-lg p-4">
          <div className="text-sm text-muted-foreground mb-2">Current Score</div>
          <div className="flex items-end gap-2">
            <span className={cn(
              "text-4xl font-bold",
              analysis.scoreBefore.overall >= 80 ? "text-green-600" :
              analysis.scoreBefore.overall >= 60 ? "text-amber-600" : "text-red-600"
            )}>
              {Math.round(analysis.scoreBefore.overall)}
            </span>
            <span className="text-muted-foreground mb-1">/ 100</span>
          </div>
        </div>
        <div className="border rounded-lg p-4 bg-green-50/50">
          <div className="text-sm text-muted-foreground mb-2">After Optimization</div>
          <div className="flex items-end gap-2">
            <span className="text-4xl font-bold text-green-600">
              {Math.round(analysis.scoreAfter.overall)}
            </span>
            <span className="text-muted-foreground mb-1">/ 100</span>
            <Badge variant="secondary" className="ml-2 bg-green-100 text-green-700">
              +{Math.round(analysis.scoreAfter.overall - analysis.scoreBefore.overall)}
            </Badge>
          </div>
        </div>
      </div>

      {/* Score Breakdown */}
      <div className="space-y-3">
        <h4 className="font-medium">Score Breakdown</h4>
        {(['readability', 'seo', 'structure', 'engagement', 'grammar'] as const).map(category => (
          <ScoreBar
            key={category}
            label={CATEGORY_INFO[category as OptimizationCategory]?.label || category}
            icon={CATEGORY_ICONS[category as OptimizationCategory]}
            current={analysis.scoreBefore[category]}
            projected={analysis.scoreAfter[category]}
          />
        ))}
      </div>

      {/* Top Recommendations */}
      {analysis.summary.topRecommendations.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium">Top Recommendations</h4>
          <div className="space-y-2">
            {analysis.summary.topRecommendations.map((rec, i) => (
              <div key={i} className="flex items-center gap-3 p-3 border rounded-lg">
                <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-sm font-medium">
                  {i + 1}
                </div>
                <span className="text-sm">{rec}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Warnings */}
      {analysis.summary.warnings.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-amber-700">Warnings</h4>
          {analysis.summary.warnings.map((warning, i) => (
            <div key={i} className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
              <span className="text-sm text-amber-800">{warning}</span>
            </div>
          ))}
        </div>
      )}

      {/* Actions by Category */}
      <div className="space-y-3">
        <h4 className="font-medium">Actions by Category</h4>
        <div className="grid grid-cols-2 gap-2">
          {(Object.keys(CATEGORY_INFO) as OptimizationCategory[]).map(cat => {
            const count = analysis.actionsByCategory[cat] || 0;
            if (count === 0) return null;
            return (
              <div key={cat} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  {CATEGORY_ICONS[cat]}
                  <span className="text-sm">{CATEGORY_INFO[cat].label}</span>
                </div>
                <Badge variant="secondary">{count}</Badge>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

interface ScoreBarProps {
  label: string;
  icon: React.ReactNode;
  current: number;
  projected: number;
}

function ScoreBar({ label, icon, current, projected }: ScoreBarProps) {
  const improvement = projected - current;
  
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          {icon}
          <span>{label}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">{Math.round(current)}</span>
          {improvement > 0 && (
            <>
              <ChevronRight className="h-3 w-3 text-muted-foreground" />
              <span className="text-green-600 font-medium">{Math.round(projected)}</span>
            </>
          )}
        </div>
      </div>
      <div className="relative h-2 bg-muted rounded-full overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 bg-primary/30 rounded-full"
          style={{ width: `${Math.min(projected, 100)}%` }}
        />
        <div
          className="absolute inset-y-0 left-0 bg-primary rounded-full"
          style={{ width: `${Math.min(current, 100)}%` }}
        />
      </div>
    </div>
  );
}

interface ActionCardProps {
  action: OptimizationAction;
  isSelected: boolean;
  isApplied: boolean;
  isExpanded: boolean;
  onToggleSelect: () => void;
  onToggleExpand: () => void;
  onApply: () => void;
  onSkip: () => void;
}

function ActionCard({
  action,
  isSelected,
  isApplied,
  isExpanded,
  onToggleSelect,
  onToggleExpand,
  onApply,
  onSkip
}: ActionCardProps) {
  const priorityInfo = PRIORITY_INFO[action.priority];
  const categoryInfo = CATEGORY_INFO[action.category];

  return (
    <div className={cn(
      "border rounded-lg overflow-hidden transition-colors",
      isApplied && "bg-green-50/50 border-green-200",
      isSelected && !isApplied && "border-primary"
    )}>
      <div className="p-3">
        <div className="flex items-start gap-3">
          {/* Selection Checkbox */}
          <button
            onClick={onToggleSelect}
            disabled={isApplied}
            className={cn(
              "w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5 shrink-0 transition-colors",
              isApplied ? "bg-green-500 border-green-500" :
              isSelected ? "bg-primary border-primary" : "border-muted-foreground/30"
            )}
          >
            {(isSelected || isApplied) && <Check className="h-3 w-3 text-white" />}
          </button>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge 
                variant="secondary" 
                className={cn("text-xs", priorityInfo.bgColor, priorityInfo.color)}
              >
                {priorityInfo.label}
              </Badge>
              <Badge variant="outline" className="text-xs gap-1">
                {CATEGORY_ICONS[action.category]}
                {categoryInfo.label}
              </Badge>
              {isApplied && (
                <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                  Applied
                </Badge>
              )}
            </div>
            <h4 className="font-medium text-sm">{action.title}</h4>
            <p className="text-sm text-muted-foreground mt-0.5">{action.description}</p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 shrink-0">
            {!isApplied && (
              <>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={onApply}
                      >
                        <Zap className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Apply</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground"
                        onClick={onSkip}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Skip</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground"
              onClick={onToggleExpand}
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="border-t bg-muted/30 p-3 space-y-3">
          <div>
            <div className="text-xs font-medium text-muted-foreground mb-1">Reason</div>
            <p className="text-sm">{action.reason}</p>
          </div>
          
          {action.originalText && (
            <div>
              <div className="text-xs font-medium text-muted-foreground mb-1">Original</div>
              <div className="bg-red-50 border border-red-200 rounded p-2 text-sm font-mono">
                {action.originalText.length > 200 
                  ? action.originalText.substring(0, 200) + '...' 
                  : action.originalText}
              </div>
            </div>
          )}
          
          {action.suggestedText && (
            <div>
              <div className="text-xs font-medium text-muted-foreground mb-1">Suggested</div>
              <div className="bg-green-50 border border-green-200 rounded p-2 text-sm font-mono">
                {action.suggestedText.length > 200 
                  ? action.suggestedText.substring(0, 200) + '...' 
                  : action.suggestedText}
              </div>
            </div>
          )}

          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>Confidence: {Math.round(action.metrics.confidenceLevel * 100)}%</span>
            {action.requiresReview && (
              <span className="text-amber-600">Requires review</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

interface SettingsTabProps {
  settings: ReturnType<typeof useAutoOptimize>['settings'];
  onUpdateSettings: ReturnType<typeof useAutoOptimize>['updateSettings'];
}

function SettingsTab({ settings, onUpdateSettings }: SettingsTabProps) {
  return (
    <div className="space-y-6">
      {/* Optimization Level */}
      <div className="space-y-3">
        <Label className="text-base font-medium">Optimization Level</Label>
        <div className="grid grid-cols-2 gap-2">
          {OPTIMIZATION_LEVELS.map(level => (
            <button
              key={level.value}
              onClick={() => onUpdateSettings({ optimizationLevel: level.value })}
              className={cn(
                "p-3 border rounded-lg text-left transition-colors",
                settings.optimizationLevel === level.value
                  ? "border-primary bg-primary/5"
                  : "hover:bg-muted"
              )}
            >
              <div className="font-medium text-sm">{level.label}</div>
              <div className="text-xs text-muted-foreground">{level.description}</div>
            </button>
          ))}
        </div>
      </div>

      <Separator />

      {/* Target Scores */}
      <div className="space-y-4">
        <Label className="text-base font-medium">Target Scores</Label>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm">Readability Score</Label>
              <span className="text-sm text-muted-foreground">{settings.targetReadabilityScore}</span>
            </div>
            <Slider
              value={[settings.targetReadabilityScore]}
              onValueChange={([value]) => onUpdateSettings({ targetReadabilityScore: value })}
              min={0}
              max={100}
              step={5}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm">SEO Score</Label>
              <span className="text-sm text-muted-foreground">{settings.targetSeoScore}</span>
            </div>
            <Slider
              value={[settings.targetSeoScore]}
              onValueChange={([value]) => onUpdateSettings({ targetSeoScore: value })}
              min={0}
              max={100}
              step={5}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm">Target Grade Level</Label>
              <span className="text-sm text-muted-foreground">{settings.targetGradeLevel}</span>
            </div>
            <Slider
              value={[settings.targetGradeLevel]}
              onValueChange={([value]) => onUpdateSettings({ targetGradeLevel: value })}
              min={1}
              max={16}
              step={1}
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Category Toggles */}
      <div className="space-y-4">
        <Label className="text-base font-medium">Categories to Optimize</Label>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-blue-500" />
              <Label className="text-sm">Readability</Label>
            </div>
            <Switch
              checked={settings.enableReadability}
              onCheckedChange={(checked) => onUpdateSettings({ enableReadability: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-green-500" />
              <Label className="text-sm">SEO</Label>
            </div>
            <Switch
              checked={settings.enableSeo}
              onCheckedChange={(checked) => onUpdateSettings({ enableSeo: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-pink-500" />
              <Label className="text-sm">Engagement</Label>
            </div>
            <Switch
              checked={settings.enableEngagement}
              onCheckedChange={(checked) => onUpdateSettings({ enableEngagement: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <LayoutList className="h-4 w-4 text-purple-500" />
              <Label className="text-sm">Structure</Label>
            </div>
            <Switch
              checked={settings.enableStructure}
              onCheckedChange={(checked) => onUpdateSettings({ enableStructure: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <SpellCheck className="h-4 w-4 text-amber-500" />
              <Label className="text-sm">Grammar</Label>
            </div>
            <Switch
              checked={settings.enableGrammar}
              onCheckedChange={(checked) => onUpdateSettings({ enableGrammar: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-cyan-500" />
              <Label className="text-sm">Style</Label>
            </div>
            <Switch
              checked={settings.enableStyle}
              onCheckedChange={(checked) => onUpdateSettings({ enableStyle: checked })}
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Keyword Settings */}
      <div className="space-y-4">
        <Label className="text-base font-medium">Keyword Optimization</Label>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm">Primary Keyword</Label>
            <Input
              placeholder="Enter target keyword"
              value={settings.primaryKeyword || ''}
              onChange={(e) => onUpdateSettings({ primaryKeyword: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm">Target Keyword Density</Label>
              <span className="text-sm text-muted-foreground">{settings.targetKeywordDensity}%</span>
            </div>
            <Slider
              value={[settings.targetKeywordDensity]}
              onValueChange={([value]) => onUpdateSettings({ targetKeywordDensity: value })}
              min={0.5}
              max={3}
              step={0.1}
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Preservation Settings */}
      <div className="space-y-4">
        <Label className="text-base font-medium">Content Preservation</Label>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm">Preserve Quotes</Label>
            <Switch
              checked={settings.preserveQuotes}
              onCheckedChange={(checked) => onUpdateSettings({ preserveQuotes: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label className="text-sm">Preserve Code Blocks</Label>
            <Switch
              checked={settings.preserveCodeBlocks}
              onCheckedChange={(checked) => onUpdateSettings({ preserveCodeBlocks: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label className="text-sm">Preserve Technical Terms</Label>
            <Switch
              checked={settings.preserveTechnicalTerms}
              onCheckedChange={(checked) => onUpdateSettings({ preserveTechnicalTerms: checked })}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default AutoOptimizeButton;

