/**
 * Schema Markup Generator Panel
 * 
 * Production-grade UI component for generating and managing structured data
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
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import {
  Code2,
  FileJson,
  Copy,
  Check,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  FileText,
  ListChecks,
  HelpCircle,
  Package,
  Star,
  Calendar,
  Store,
  Video,
  Globe,
  Navigation,
  List,
  Download,
  RefreshCw,
  Settings,
  Eye,
  Trash2,
  Plus,
  Sparkles,
  Search,
  ChefHat,
  Building2,
  User,
  Newspaper,
  FileEdit
} from 'lucide-react';
import {
  SchemaType,
  SchemaGeneratorResult,
  GeneratedSchemaItem,
  SchemaValidation,
  SchemaRecommendation,
  ContentAnalysis,
  SchemaGeneratorSettings,
  SCHEMA_TYPE_LABELS,
  ValidationStatus
} from '@/src/features/ai-writer/types/tools/schema-markup.types';

// =============================================================================
// HELPER COMPONENTS
// =============================================================================

interface ValidationScoreRingProps {
  score: number;
  size?: number;
}

function ValidationScoreRing({ score, size = 80 }: ValidationScoreRingProps) {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;

  const getColor = () => {
    if (score >= 80) return 'text-emerald-500';
    if (score >= 60) return 'text-amber-500';
    if (score >= 40) return 'text-orange-500';
    return 'text-red-500';
  };

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth="4"
          fill="none"
          className="text-muted/20"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth="4"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          strokeLinecap="round"
          className={cn('transition-all duration-500', getColor())}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={cn('text-lg font-bold', getColor())}>{score}</span>
      </div>
    </div>
  );
}

interface ValidationBadgeProps {
  status: ValidationStatus;
}

function ValidationBadge({ status }: ValidationBadgeProps) {
  const config = {
    valid: { label: 'Valid', className: 'bg-emerald-500/10 text-emerald-500', icon: CheckCircle2 },
    warning: { label: 'Warning', className: 'bg-amber-500/10 text-amber-500', icon: AlertTriangle },
    error: { label: 'Error', className: 'bg-red-500/10 text-red-500', icon: AlertCircle }
  };

  const { label, className, icon: Icon } = config[status];

  return (
    <Badge variant="outline" className={cn('gap-1', className)}>
      <Icon className="h-3 w-3" />
      {label}
    </Badge>
  );
}

interface PriorityBadgeProps {
  priority: 'high' | 'medium' | 'low';
}

function PriorityBadge({ priority }: PriorityBadgeProps) {
  const config = {
    high: { label: 'High', className: 'bg-red-500/10 text-red-500 border-red-500/30' },
    medium: { label: 'Medium', className: 'bg-amber-500/10 text-amber-500 border-amber-500/30' },
    low: { label: 'Low', className: 'bg-blue-500/10 text-blue-500 border-blue-500/30' }
  };

  const { label, className } = config[priority];

  return (
    <Badge variant="outline" className={cn('text-xs', className)}>
      {label}
    </Badge>
  );
}

function SchemaTypeIcon({ type }: { type: SchemaType }) {
  const icons: Record<SchemaType, React.ComponentType<{ className?: string }>> = {
    Article: FileText,
    BlogPosting: FileEdit,
    NewsArticle: Newspaper,
    HowTo: ListChecks,
    FAQ: HelpCircle,
    Product: Package,
    Review: Star,
    Recipe: ChefHat,
    Event: Calendar,
    LocalBusiness: Store,
    Organization: Building2,
    Person: User,
    VideoObject: Video,
    WebPage: Globe,
    BreadcrumbList: Navigation,
    ItemList: List
  };

  const Icon = icons[type] || FileJson;
  return <Icon className="h-4 w-4" />;
}

// =============================================================================
// SCHEMA CARD COMPONENT
// =============================================================================

interface SchemaCardProps {
  schema: GeneratedSchemaItem;
  onSelect: () => void;
  onRemove: () => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

function SchemaCard({
  schema,
  onSelect,
  onRemove,
  isExpanded,
  onToggleExpand
}: SchemaCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(schema.jsonLd);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={cn(
        'rounded-lg border p-4 transition-all',
        schema.isSelected
          ? 'border-primary bg-primary/5'
          : 'border-border hover:border-primary/50'
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-lg',
              schema.isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted'
            )}
          >
            <SchemaTypeIcon type={schema.type} />
          </div>
          <div>
            <h4 className="font-medium">{SCHEMA_TYPE_LABELS[schema.type]}</h4>
            <div className="mt-1 flex items-center gap-2">
              <ValidationBadge
                status={
                  schema.validation.errors.length > 0
                    ? 'error'
                    : schema.validation.warnings.length > 0
                    ? 'warning'
                    : 'valid'
                }
              />
              <span className="text-xs text-muted-foreground">
                Score: {schema.validation.score}%
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleCopy}>
                  {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>Copy JSON-LD</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={onSelect}
                  disabled={schema.isSelected}
                >
                  <Check className={cn('h-4 w-4', schema.isSelected && 'text-primary')} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Select as primary</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive"
                  onClick={onRemove}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Remove</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <Collapsible open={isExpanded} onOpenChange={onToggleExpand}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" className="mt-3 w-full justify-between">
            <span className="text-xs">View JSON-LD</span>
            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="mt-2 rounded-md bg-muted p-3">
            <pre className="overflow-x-auto text-xs">
              <code>{schema.jsonLd}</code>
            </pre>
          </div>
          {schema.validation.errors.length > 0 && (
            <div className="mt-2 space-y-1">
              {schema.validation.errors.map((error, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-red-500">
                  <AlertCircle className="mt-0.5 h-3 w-3 shrink-0" />
                  <span>{error.message}</span>
                </div>
              ))}
            </div>
          )}
          {schema.validation.warnings.length > 0 && (
            <div className="mt-2 space-y-1">
              {schema.validation.warnings.map((warning, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-amber-500">
                  <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" />
                  <span>{warning.message}</span>
                </div>
              ))}
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
  recommendation: SchemaRecommendation;
}

function RecommendationCard({ recommendation }: RecommendationCardProps) {
  const categoryIcons = {
    missing_field: AlertCircle,
    optimization: Sparkles,
    additional_schema: Plus,
    best_practice: CheckCircle2
  };

  const Icon = categoryIcons[recommendation.category];

  return (
    <div className="rounded-lg border p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
          <Icon className="h-4 w-4" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between gap-2">
            <h4 className="font-medium">{recommendation.title}</h4>
            <PriorityBadge priority={recommendation.priority} />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{recommendation.description}</p>
          <p className="mt-2 text-xs text-primary">{recommendation.action}</p>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// TAB COMPONENTS
// =============================================================================

interface OverviewTabProps {
  result: SchemaGeneratorResult;
  analysis: ContentAnalysis;
}

function OverviewTab({ result, analysis }: OverviewTabProps) {
  return (
    <div className="space-y-6">
      {/* Score Overview */}
      <div className="flex items-center gap-6 rounded-lg border p-4">
        <ValidationScoreRing score={result.validation.score} size={100} />
        <div className="flex-1">
          <h3 className="text-lg font-semibold">Schema Validation Score</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {result.validation.isValid
              ? 'All schemas are valid and ready for use'
              : `${result.validation.errors.length} error(s) found`}
          </p>
          <div className="mt-3 flex items-center gap-4 text-sm">
            <span className="flex items-center gap-1 text-emerald-500">
              <CheckCircle2 className="h-4 w-4" />
              {result.generatedSchemas.filter(s => s.validation.isValid).length} valid
            </span>
            <span className="flex items-center gap-1 text-red-500">
              <AlertCircle className="h-4 w-4" />
              {result.validation.errors.length} errors
            </span>
            <span className="flex items-center gap-1 text-amber-500">
              <AlertTriangle className="h-4 w-4" />
              {result.validation.warnings.length} warnings
            </span>
          </div>
        </div>
      </div>

      {/* Detected Types */}
      <div className="rounded-lg border p-4">
        <h3 className="font-semibold">Detected Schema Types</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Content analysis detected {analysis.detectedTypes.length} potential schema type(s)
        </p>
        <div className="mt-4 space-y-2">
          {analysis.suggestions.slice(0, 5).map((suggestion, idx) => (
            <div key={idx} className="flex items-center justify-between rounded-md bg-muted/50 p-2">
              <div className="flex items-center gap-2">
                <SchemaTypeIcon type={suggestion.type} />
                <span className="font-medium">{SCHEMA_TYPE_LABELS[suggestion.type]}</span>
              </div>
              <div className="flex items-center gap-2">
                <Progress value={suggestion.confidence * 100} className="h-1.5 w-20" />
                <span className="text-xs text-muted-foreground">
                  {Math.round(suggestion.confidence * 100)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Generated Schemas Count */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border p-4 text-center">
          <div className="text-3xl font-bold text-primary">{result.generatedSchemas.length}</div>
          <div className="text-sm text-muted-foreground">Schemas Generated</div>
        </div>
        <div className="rounded-lg border p-4 text-center">
          <div className="text-3xl font-bold text-emerald-500">
            {result.generatedSchemas.filter(s => s.validation.isValid).length}
          </div>
          <div className="text-sm text-muted-foreground">Valid Schemas</div>
        </div>
        <div className="rounded-lg border p-4 text-center">
          <div className="text-3xl font-bold text-amber-500">{result.recommendations.length}</div>
          <div className="text-sm text-muted-foreground">Recommendations</div>
        </div>
      </div>

      {/* Google Preview */}
      {result.preview.googlePreview && (
        <div className="rounded-lg border p-4">
          <h3 className="font-semibold">Search Result Preview</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            How your content may appear with rich results
          </p>
          <div className="mt-4 rounded-md bg-white p-4 dark:bg-gray-900">
            <pre className="whitespace-pre-wrap text-sm">{result.preview.googlePreview}</pre>
          </div>
        </div>
      )}
    </div>
  );
}

interface SchemasTabProps {
  schemas: GeneratedSchemaItem[];
  onSelect: (id: string) => void;
  onRemove: (id: string) => void;
  filterType: SchemaType | 'all';
  onFilterChange: (type: SchemaType | 'all') => void;
}

function SchemasTab({
  schemas,
  onSelect,
  onRemove,
  filterType,
  onFilterChange
}: SchemasTabProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredSchemas = useMemo(() => {
    if (filterType === 'all') return schemas;
    return schemas.filter(s => s.type === filterType);
  }, [schemas, filterType]);

  const availableTypes = useMemo(() => {
    const types = new Set(schemas.map(s => s.type));
    return Array.from(types);
  }, [schemas]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Generated Schemas</h3>
        <Select value={filterType} onValueChange={(v) => onFilterChange(v as SchemaType | 'all')}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {availableTypes.map(type => (
              <SelectItem key={type} value={type}>
                {SCHEMA_TYPE_LABELS[type]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filteredSchemas.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <FileJson className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <h4 className="mt-4 font-medium">No Schemas Generated</h4>
          <p className="mt-1 text-sm text-muted-foreground">
            Generate schemas from your content to see them here
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredSchemas.map(schema => (
            <SchemaCard
              key={schema.id}
              schema={schema}
              onSelect={() => onSelect(schema.id)}
              onRemove={() => onRemove(schema.id)}
              isExpanded={expandedId === schema.id}
              onToggleExpand={() => setExpandedId(expandedId === schema.id ? null : schema.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface RecommendationsTabProps {
  recommendations: SchemaRecommendation[];
  filterPriority: 'all' | 'high' | 'medium' | 'low';
  onFilterChange: (priority: 'all' | 'high' | 'medium' | 'low') => void;
}

function RecommendationsTab({
  recommendations,
  filterPriority,
  onFilterChange
}: RecommendationsTabProps) {
  const filteredRecommendations = useMemo(() => {
    if (filterPriority === 'all') return recommendations;
    return recommendations.filter(r => r.priority === filterPriority);
  }, [recommendations, filterPriority]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Recommendations</h3>
        <Select value={filterPriority} onValueChange={(v) => onFilterChange(v as 'all' | 'high' | 'medium' | 'low')}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredRecommendations.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500/50" />
          <h4 className="mt-4 font-medium">All Good!</h4>
          <p className="mt-1 text-sm text-muted-foreground">
            No recommendations at this priority level
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredRecommendations.map(rec => (
            <RecommendationCard key={rec.id} recommendation={rec} />
          ))}
        </div>
      )}
    </div>
  );
}

interface SettingsTabProps {
  settings: SchemaGeneratorSettings;
  onSettingsChange: (settings: Partial<SchemaGeneratorSettings>) => void;
}

function SettingsTab({ settings, onSettingsChange }: SettingsTabProps) {
  return (
    <div className="space-y-6">
      <div className="rounded-lg border p-4">
        <h3 className="font-semibold">Generation Settings</h3>
        <div className="mt-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Auto-detect Schema Types</Label>
              <p className="text-xs text-muted-foreground">
                Automatically detect schema types from content
              </p>
            </div>
            <Switch
              checked={settings.autoDetect}
              onCheckedChange={(checked) => onSettingsChange({ autoDetect: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Include Optional Fields</Label>
              <p className="text-xs text-muted-foreground">
                Include recommended but not required fields
              </p>
            </div>
            <Switch
              checked={settings.includeOptionalFields}
              onCheckedChange={(checked) => onSettingsChange({ includeOptionalFields: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Generate Multiple Schemas</Label>
              <p className="text-xs text-muted-foreground">
                Generate all detected schema types
              </p>
            </div>
            <Switch
              checked={settings.generateMultiple}
              onCheckedChange={(checked) => onSettingsChange({ generateMultiple: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Validate on Generate</Label>
              <p className="text-xs text-muted-foreground">
                Automatically validate schemas when generated
              </p>
            </div>
            <Switch
              checked={settings.validateOnGenerate}
              onCheckedChange={(checked) => onSettingsChange({ validateOnGenerate: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Include Organization</Label>
              <p className="text-xs text-muted-foreground">
                Add organization/publisher info to schemas
              </p>
            </div>
            <Switch
              checked={settings.includeOrganization}
              onCheckedChange={(checked) => onSettingsChange({ includeOrganization: checked })}
            />
          </div>
        </div>
      </div>

      <div className="rounded-lg border p-4">
        <h3 className="font-semibold">Output Format</h3>
        <div className="mt-4">
          <Select
            value={settings.format}
            onValueChange={(v) => onSettingsChange({ format: v as 'json-ld' | 'microdata' | 'rdfa' })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select format" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="json-ld">JSON-LD (Recommended)</SelectItem>
              <SelectItem value="microdata">Microdata</SelectItem>
              <SelectItem value="rdfa">RDFa</SelectItem>
            </SelectContent>
          </Select>
          <p className="mt-2 text-xs text-muted-foreground">
            JSON-LD is recommended by Google and easiest to implement
          </p>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// MAIN PANEL COMPONENT
// =============================================================================

interface SchemaMarkupPanelProps {
  isOpen: boolean;
  onClose: () => void;
  result: SchemaGeneratorResult | null;
  isGenerating: boolean;
  onRegenerate: () => void;
  onSelectSchema: (id: string) => void;
  onRemoveSchema: (id: string) => void;
  settings: SchemaGeneratorSettings;
  onSettingsChange: (settings: Partial<SchemaGeneratorSettings>) => void;
  getJsonLd: (schemaIds?: string[]) => string;
  getHtmlScript: (schemaIds?: string[]) => string;
}

export function SchemaMarkupPanel({
  isOpen,
  onClose,
  result,
  isGenerating,
  onRegenerate,
  onSelectSchema,
  onRemoveSchema,
  settings,
  onSettingsChange,
  getJsonLd,
  getHtmlScript
}: SchemaMarkupPanelProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [filterType, setFilterType] = useState<SchemaType | 'all'>('all');
  const [filterPriority, setFilterPriority] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [copied, setCopied] = useState(false);

  const handleCopyAll = async () => {
    const script = getHtmlScript();
    await navigator.clipboard.writeText(script);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExport = () => {
    const script = getHtmlScript();
    const blob = new Blob([script], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'schema-markup.html';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-xl">
        <SheetHeader>
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2">
              <Code2 className="h-5 w-5" />
              Schema Markup Generator
            </SheetTitle>
          </div>
        </SheetHeader>

        <div className="mt-6 flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onRegenerate}
            disabled={isGenerating}
            className="gap-2"
          >
            <RefreshCw className={cn('h-4 w-4', isGenerating && 'animate-spin')} />
            Regenerate
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyAll}
            disabled={!result}
            className="gap-2"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            Copy All
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
            <TabsTrigger value="schemas" className="gap-1 text-xs">
              <FileJson className="h-3 w-3" />
              Schemas
            </TabsTrigger>
            <TabsTrigger value="recommendations" className="gap-1 text-xs">
              <Sparkles className="h-3 w-3" />
              Tips
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
                    Add content to generate schema markup
                  </p>
                </div>
              ) : (
                <>
                  <TabsContent value="overview" className="mt-0">
                    <OverviewTab result={result} analysis={result.analysis} />
                  </TabsContent>

                  <TabsContent value="schemas" className="mt-0">
                    <SchemasTab
                      schemas={result.generatedSchemas}
                      onSelect={onSelectSchema}
                      onRemove={onRemoveSchema}
                      filterType={filterType}
                      onFilterChange={setFilterType}
                    />
                  </TabsContent>

                  <TabsContent value="recommendations" className="mt-0">
                    <RecommendationsTab
                      recommendations={result.recommendations}
                      filterPriority={filterPriority}
                      onFilterChange={setFilterPriority}
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

export default SchemaMarkupPanel;

