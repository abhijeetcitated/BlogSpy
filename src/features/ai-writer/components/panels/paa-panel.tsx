'use client';

// =============================================================================
// PAA (PEOPLE ALSO ASK) PANEL - Production Level
// Google PAA Questions Integration like Surfer SEO, AlsoAsked, AnswerThePublic
// =============================================================================

import React, { useState, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
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
import {
  Search,
  RefreshCw,
  Filter,
  Download,
  Copy,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Sparkles,
  Target,
  TrendingUp,
  HelpCircle,
  Lightbulb,
  FileText,
  LayoutGrid,
  List,
  TreePine,
  Layers,
  Eye,
  Plus,
  Check
} from 'lucide-react';
import {
  PAAData,
  PAAQuestion,
  PAAQuestionGroup,
  PAACluster,
  PAATreeNode,
  PAATab,
  ViewMode,
  PAAFilters,
  CoverageStatus,
  PAADifficultyLevel,
  QuestionType,
  QuestionIntent,
  PAAOpportunity,
  CoverageAnalysis,
  PAALocation,
  PAA_TABS,
  PAA_LOCATIONS,
  QUESTION_TYPE_LABELS,
  QUESTION_TYPE_ICONS,
  PAA_INTENT_LABELS,
  PAA_INTENT_COLORS,
  PAA_DIFFICULTY_COLORS,
  COVERAGE_STATUS_COLORS,
  DEFAULT_PAA_FILTERS,
  LOADING_STAGE_MESSAGES
} from '@/src/features/ai-writer/types/tools/paa.types';
import {
  filterQuestions,
  sortQuestions,
  getCoverageAnalysis,
  identifyOpportunities,
  exportToMarkdown,
  exportToCSV
} from '@/src/features/ai-writer/utils/tools/paa';
import { usePAA } from '@/src/features/ai-writer/hooks/tools/use-paa';

// =============================================================================
// PROPS INTERFACE
// =============================================================================

interface PAAPanelProps {
  keyword: string;
  content: string;
  onInsertQuestion?: (question: string, answer?: string) => void;
  onInsertFAQSchema?: (questions: PAAQuestion[]) => void;
  className?: string;
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function PAAPanel({
  keyword,
  content,
  onInsertQuestion,
  onInsertFAQSchema,
  className = ''
}: PAAPanelProps) {
  // State
  const [activeTab, setActiveTab] = useState<PAATab>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<PAAFilters>(DEFAULT_PAA_FILTERS);
  const [selectedQuestions, setSelectedQuestions] = useState<Set<string>>(new Set());
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'relevance' | 'position' | 'difficulty' | 'volume'>('relevance');
  const [location, setLocation] = useState<PAALocation>(PAA_LOCATIONS[0]);

  // Hook
  const {
    data,
    isLoading,
    loadingStage,
    progress,
    error,
    fetchPAAData,
    clearData
  } = usePAA();

  // Computed values
  const allQuestions = useMemo(() => {
    if (!data) return [];
    return data.questions.flatMap(g => g.questions);
  }, [data]);

  const filteredQuestions = useMemo(() => {
    const filtered = filterQuestions(allQuestions, filters, searchQuery);
    return sortQuestions(filtered, sortBy);
  }, [allQuestions, filters, searchQuery, sortBy]);

  const coverageAnalysis = useMemo(() => {
    return getCoverageAnalysis(allQuestions);
  }, [allQuestions]);

  const opportunities = useMemo(() => {
    return identifyOpportunities(allQuestions, 10);
  }, [allQuestions]);

  // Handlers
  const handleFetch = useCallback(() => {
    fetchPAAData(keyword, content, { location });
  }, [fetchPAAData, keyword, content, location]);

  const handleToggleSelect = useCallback((questionId: string) => {
    setSelectedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    if (selectedQuestions.size === filteredQuestions.length) {
      setSelectedQuestions(new Set());
    } else {
      setSelectedQuestions(new Set(filteredQuestions.map(q => q.id)));
    }
  }, [filteredQuestions, selectedQuestions]);

  const handleToggleExpand = useCallback((questionId: string) => {
    setExpandedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  }, []);

  const handleExport = useCallback((format: 'markdown' | 'csv') => {
    const questionsToExport = selectedQuestions.size > 0
      ? filteredQuestions.filter(q => selectedQuestions.has(q.id))
      : filteredQuestions;

    const content = format === 'markdown'
      ? exportToMarkdown(questionsToExport)
      : exportToCSV(questionsToExport);

    const blob = new Blob([content], { type: format === 'markdown' ? 'text/markdown' : 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `paa-questions-${keyword.replace(/\s+/g, '-')}.${format === 'markdown' ? 'md' : 'csv'}`;
    a.click();
    URL.revokeObjectURL(url);
  }, [filteredQuestions, selectedQuestions, keyword]);

  const handleCopyQuestion = useCallback((question: string) => {
    navigator.clipboard.writeText(question);
  }, []);

  const handleInsertQuestion = useCallback((question: PAAQuestion) => {
    if (onInsertQuestion) {
      onInsertQuestion(question.question, question.answerSnippet);
    }
  }, [onInsertQuestion]);

  const handleInsertSelectedAsFAQ = useCallback(() => {
    if (onInsertFAQSchema && selectedQuestions.size > 0) {
      const selected = allQuestions.filter(q => selectedQuestions.has(q.id));
      onInsertFAQSchema(selected);
    }
  }, [onInsertFAQSchema, selectedQuestions, allQuestions]);

  // Render loading state
  if (isLoading) {
    return (
      <Card className={`${className}`}>
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <RefreshCw className="h-8 w-8 animate-spin text-primary" />
            <div className="text-center">
              <p className="font-medium">{LOADING_STAGE_MESSAGES[loadingStage]}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {progress}% complete
              </p>
            </div>
            <div className="w-full max-w-xs bg-secondary rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Render empty state
  if (!data) {
    return (
      <Card className={`${className}`}>
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <HelpCircle className="h-12 w-12 text-muted-foreground" />
            <div className="text-center">
              <h3 className="font-semibold text-lg">People Also Ask</h3>
              <p className="text-muted-foreground mt-1 max-w-sm">
                Discover what questions people are asking about "{keyword}" on Google
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Select
                value={location.countryCode}
                onValueChange={(code) => {
                  const loc = PAA_LOCATIONS.find(l => l.countryCode === code);
                  if (loc) setLocation(loc);
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  {PAA_LOCATIONS.map(loc => (
                    <SelectItem key={loc.countryCode} value={loc.countryCode}>
                      {loc.countryName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={handleFetch} disabled={!keyword}>
                <Search className="h-4 w-4 mr-2" />
                Fetch PAA Questions
              </Button>
            </div>
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-primary" />
              People Also Ask
              <Badge variant="secondary">{data.totalQuestions}</Badge>
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Questions for "{keyword}" • {location.countryName}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleFetch}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4" />
            </Button>
            <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
              <SelectTrigger className="w-[130px] h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">Relevance</SelectItem>
                <SelectItem value="position">Position</SelectItem>
                <SelectItem value="difficulty">Difficulty</SelectItem>
                <SelectItem value="volume">Volume</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Search and filters */}
        <div className="mt-3 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {showFilters && (
            <FilterPanel filters={filters} onFiltersChange={setFilters} />
          )}
        </div>

        {/* Coverage summary */}
        <CoverageSummary analysis={coverageAnalysis} />
      </CardHeader>

      <Separator />

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as PAATab)}>
        <div className="px-4 pt-3">
          <TabsList className="w-full grid grid-cols-6 h-9">
            {PAA_TABS.map(tab => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="text-xs"
              >
                <span className="mr-1">{tab.icon}</span>
                {tab.label.split(' ')[0]}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <CardContent className="p-4">
          {/* Selection toolbar */}
          {selectedQuestions.size > 0 && (
            <div className="flex items-center justify-between mb-4 p-2 bg-muted rounded-lg">
              <span className="text-sm">
                {selectedQuestions.size} question(s) selected
              </span>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="ghost" onClick={() => handleExport('markdown')}>
                  <Download className="h-4 w-4 mr-1" />
                  Export MD
                </Button>
                <Button size="sm" variant="ghost" onClick={() => handleExport('csv')}>
                  <Download className="h-4 w-4 mr-1" />
                  Export CSV
                </Button>
                {onInsertFAQSchema && (
                  <Button size="sm" variant="default" onClick={handleInsertSelectedAsFAQ}>
                    <FileText className="h-4 w-4 mr-1" />
                    Add as FAQ
                  </Button>
                )}
              </div>
            </div>
          )}

          <ScrollArea className="h-[500px]">
            <TabsContent value="all" className="mt-0">
              <AllQuestionsTab
                questions={filteredQuestions}
                selectedQuestions={selectedQuestions}
                expandedQuestions={expandedQuestions}
                onToggleSelect={handleToggleSelect}
                onToggleExpand={handleToggleExpand}
                onCopy={handleCopyQuestion}
                onInsert={handleInsertQuestion}
                onSelectAll={handleSelectAll}
              />
            </TabsContent>

            <TabsContent value="by-type" className="mt-0">
              <ByTypeTab
                groups={data.questions}
                selectedQuestions={selectedQuestions}
                onToggleSelect={handleToggleSelect}
                onCopy={handleCopyQuestion}
                onInsert={handleInsertQuestion}
              />
            </TabsContent>

            <TabsContent value="clusters" className="mt-0">
              <ClustersTab
                clusters={data.clusters}
                selectedQuestions={selectedQuestions}
                onToggleSelect={handleToggleSelect}
                onCopy={handleCopyQuestion}
                onInsert={handleInsertQuestion}
              />
            </TabsContent>

            <TabsContent value="tree" className="mt-0">
              <TreeTab
                tree={data.questionTree}
                expandedQuestions={expandedQuestions}
                onToggleExpand={handleToggleExpand}
                onCopy={handleCopyQuestion}
                onInsert={handleInsertQuestion}
              />
            </TabsContent>

            <TabsContent value="coverage" className="mt-0">
              <CoverageTab
                questions={allQuestions}
                analysis={coverageAnalysis}
                onCopy={handleCopyQuestion}
                onInsert={handleInsertQuestion}
              />
            </TabsContent>

            <TabsContent value="opportunities" className="mt-0">
              <OpportunitiesTab
                opportunities={opportunities}
                onCopy={handleCopyQuestion}
                onInsert={handleInsertQuestion}
              />
            </TabsContent>
          </ScrollArea>
        </CardContent>
      </Tabs>
    </Card>
  );
}

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

/**
 * Filter panel component
 */
function FilterPanel({
  filters,
  onFiltersChange
}: {
  filters: PAAFilters;
  onFiltersChange: (filters: PAAFilters) => void;
}) {
  const toggleType = (type: QuestionType) => {
    const newTypes = filters.types.includes(type)
      ? filters.types.filter(t => t !== type)
      : [...filters.types, type];
    onFiltersChange({ ...filters, types: newTypes });
  };

  const toggleCoverage = (status: CoverageStatus) => {
    const newStatus = filters.coverageStatus.includes(status)
      ? filters.coverageStatus.filter(s => s !== status)
      : [...filters.coverageStatus, status];
    onFiltersChange({ ...filters, coverageStatus: newStatus });
  };

  const toggleDifficulty = (level: PAADifficultyLevel) => {
    const newDiff = filters.difficulty.includes(level)
      ? filters.difficulty.filter(d => d !== level)
      : [...filters.difficulty, level];
    onFiltersChange({ ...filters, difficulty: newDiff });
  };

  return (
    <div className="space-y-3 p-3 bg-muted/50 rounded-lg">
      <div>
        <p className="text-xs font-medium mb-2">Question Type</p>
        <div className="flex flex-wrap gap-1">
          {(['what', 'how', 'why', 'when', 'comparison', 'list'] as QuestionType[]).map(type => (
            <Badge
              key={type}
              variant={filters.types.includes(type) ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => toggleType(type)}
            >
              {QUESTION_TYPE_ICONS[type]} {QUESTION_TYPE_LABELS[type]}
            </Badge>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs font-medium mb-2">Coverage Status</p>
        <div className="flex flex-wrap gap-1">
          {(['covered', 'partial', 'not-covered', 'opportunity'] as CoverageStatus[]).map(status => (
            <Badge
              key={status}
              variant={filters.coverageStatus.includes(status) ? 'default' : 'outline'}
              className="cursor-pointer capitalize"
              onClick={() => toggleCoverage(status)}
            >
              {status.replace('-', ' ')}
            </Badge>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs font-medium mb-2">Difficulty</p>
        <div className="flex flex-wrap gap-1">
          {(['easy', 'medium', 'hard', 'very-hard'] as PAADifficultyLevel[]).map(level => (
            <Badge
              key={level}
              variant={filters.difficulty.includes(level) ? 'default' : 'outline'}
              className="cursor-pointer capitalize"
              onClick={() => toggleDifficulty(level)}
            >
              {level.replace('-', ' ')}
            </Badge>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="featuredOnly"
            checked={filters.featuredOnly}
            onChange={(e) => onFiltersChange({ ...filters, featuredOnly: e.target.checked })}
            className="rounded"
          />
          <label htmlFor="featuredOnly" className="text-xs">Featured only</label>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onFiltersChange(DEFAULT_PAA_FILTERS)}
        >
          Clear filters
        </Button>
      </div>
    </div>
  );
}

/**
 * Coverage summary component
 */
function CoverageSummary({ analysis }: { analysis: CoverageAnalysis }) {
  return (
    <div className="grid grid-cols-4 gap-2 mt-3">
      <div className="text-center p-2 bg-green-50 dark:bg-green-950/30 rounded">
        <p className="text-lg font-bold text-green-600">{analysis.covered}</p>
        <p className="text-xs text-muted-foreground">Covered</p>
      </div>
      <div className="text-center p-2 bg-yellow-50 dark:bg-yellow-950/30 rounded">
        <p className="text-lg font-bold text-yellow-600">{analysis.partial}</p>
        <p className="text-xs text-muted-foreground">Partial</p>
      </div>
      <div className="text-center p-2 bg-gray-50 dark:bg-gray-950/30 rounded">
        <p className="text-lg font-bold text-gray-600">{analysis.notCovered}</p>
        <p className="text-xs text-muted-foreground">Not Covered</p>
      </div>
      <div className="text-center p-2 bg-orange-50 dark:bg-orange-950/30 rounded">
        <p className="text-lg font-bold text-orange-600">{analysis.opportunities}</p>
        <p className="text-xs text-muted-foreground">Opportunities</p>
      </div>
    </div>
  );
}

/**
 * Question card component
 */
function QuestionCard({
  question,
  isSelected,
  isExpanded,
  onToggleSelect,
  onToggleExpand,
  onCopy,
  onInsert,
  showCheckbox = true
}: {
  question: PAAQuestion;
  isSelected?: boolean;
  isExpanded?: boolean;
  onToggleSelect?: (id: string) => void;
  onToggleExpand?: (id: string) => void;
  onCopy: (q: string) => void;
  onInsert: (q: PAAQuestion) => void;
  showCheckbox?: boolean;
}) {
  const coverageColor = COVERAGE_STATUS_COLORS[question.coverageStatus];
  const difficultyColor = PAA_DIFFICULTY_COLORS[question.difficulty];
  const intentColor = PAA_INTENT_COLORS[question.intent];

  return (
    <div className={`border rounded-lg p-3 space-y-2 ${
      isSelected ? 'border-primary bg-primary/5' : ''
    }`}>
      <div className="flex items-start gap-2">
        {showCheckbox && onToggleSelect && (
          <button
            onClick={() => onToggleSelect(question.id)}
            className={`mt-1 h-4 w-4 rounded border flex items-center justify-center ${
              isSelected ? 'bg-primary border-primary text-white' : 'border-gray-300'
            }`}
          >
            {isSelected && <Check className="h-3 w-3" />}
          </button>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="font-medium text-sm leading-tight">
              {QUESTION_TYPE_ICONS[question.type]} {question.question}
            </p>
            <div className="flex items-center gap-1 shrink-0">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => onCopy(question.question)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Copy question</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => onInsert(question)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Insert to editor</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1 mt-2">
            <Badge variant="outline" className="text-xs">
              {PAA_INTENT_LABELS[question.intent]}
            </Badge>
            <Badge
              variant="outline"
              className={`text-xs capitalize ${
                difficultyColor === 'green' ? 'text-green-600 border-green-300' :
                difficultyColor === 'yellow' ? 'text-yellow-600 border-yellow-300' :
                difficultyColor === 'orange' ? 'text-orange-600 border-orange-300' :
                'text-red-600 border-red-300'
              }`}
            >
              {question.difficulty.replace('-', ' ')}
            </Badge>
            <Badge
              variant="outline"
              className={`text-xs capitalize ${
                coverageColor === 'green' ? 'text-green-600 border-green-300' :
                coverageColor === 'yellow' ? 'text-yellow-600 border-yellow-300' :
                coverageColor === 'orange' ? 'text-orange-600 border-orange-300' :
                'text-gray-600 border-gray-300'
              }`}
            >
              {question.coverageStatus.replace('-', ' ')}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {question.relevanceScore}% relevant
            </span>
            {question.searchVolume && (
              <span className="text-xs text-muted-foreground">
                • {question.searchVolume.toLocaleString()} vol
              </span>
            )}
          </div>

          {/* Expandable answer */}
          {question.answerSnippet && (
            <Collapsible
              open={isExpanded}
              onOpenChange={() => onToggleExpand?.(question.id)}
            >
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 px-2 mt-2">
                  {isExpanded ? (
                    <>
                      <ChevronDown className="h-3 w-3 mr-1" />
                      Hide answer
                    </>
                  ) : (
                    <>
                      <ChevronRight className="h-3 w-3 mr-1" />
                      Show answer
                    </>
                  )}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="mt-2 p-2 bg-muted/50 rounded text-sm">
                  <p className="text-muted-foreground">{question.answerSnippet}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <a
                      href={question.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline flex items-center"
                    >
                      {question.sourceDomain}
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * All questions tab
 */
function AllQuestionsTab({
  questions,
  selectedQuestions,
  expandedQuestions,
  onToggleSelect,
  onToggleExpand,
  onCopy,
  onInsert,
  onSelectAll
}: {
  questions: PAAQuestion[];
  selectedQuestions: Set<string>;
  expandedQuestions: Set<string>;
  onToggleSelect: (id: string) => void;
  onToggleExpand: (id: string) => void;
  onCopy: (q: string) => void;
  onInsert: (q: PAAQuestion) => void;
  onSelectAll: () => void;
}) {
  if (questions.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No questions match your filters
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={onSelectAll}>
          {selectedQuestions.size === questions.length ? 'Deselect All' : 'Select All'}
        </Button>
        <span className="text-sm text-muted-foreground">
          {questions.length} questions
        </span>
      </div>
      {questions.map(question => (
        <QuestionCard
          key={question.id}
          question={question}
          isSelected={selectedQuestions.has(question.id)}
          isExpanded={expandedQuestions.has(question.id)}
          onToggleSelect={onToggleSelect}
          onToggleExpand={onToggleExpand}
          onCopy={onCopy}
          onInsert={onInsert}
        />
      ))}
    </div>
  );
}

/**
 * By type tab
 */
function ByTypeTab({
  groups,
  selectedQuestions,
  onToggleSelect,
  onCopy,
  onInsert
}: {
  groups: PAAQuestionGroup[];
  selectedQuestions: Set<string>;
  onToggleSelect: (id: string) => void;
  onCopy: (q: string) => void;
  onInsert: (q: PAAQuestion) => void;
}) {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    new Set(groups.slice(0, 3).map(g => g.label))
  );

  const toggleGroup = (label: string) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(label)) {
        newSet.delete(label);
      } else {
        newSet.add(label);
      }
      return newSet;
    });
  };

  return (
    <div className="space-y-3">
      {groups.map(group => (
        <Collapsible
          key={group.label}
          open={expandedGroups.has(group.label)}
          onOpenChange={() => toggleGroup(group.label)}
        >
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg cursor-pointer hover:bg-muted">
              <div className="flex items-center gap-2">
                <span>{group.icon}</span>
                <span className="font-medium">{group.label}</span>
                <Badge variant="secondary">{group.questions.length}</Badge>
              </div>
              {expandedGroups.has(group.label) ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="space-y-2 mt-2 pl-4">
              {group.questions.map(question => (
                <QuestionCard
                  key={question.id}
                  question={question}
                  isSelected={selectedQuestions.has(question.id)}
                  onToggleSelect={onToggleSelect}
                  onCopy={onCopy}
                  onInsert={onInsert}
                />
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      ))}
    </div>
  );
}

/**
 * Clusters tab
 */
function ClustersTab({
  clusters,
  selectedQuestions,
  onToggleSelect,
  onCopy,
  onInsert
}: {
  clusters: PAACluster[];
  selectedQuestions: Set<string>;
  onToggleSelect: (id: string) => void;
  onCopy: (q: string) => void;
  onInsert: (q: PAAQuestion) => void;
}) {
  const [expandedClusters, setExpandedClusters] = useState<Set<string>>(
    new Set(clusters.slice(0, 2).map(c => c.id))
  );

  const toggleCluster = (id: string) => {
    setExpandedClusters(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  return (
    <div className="space-y-3">
      {clusters.map(cluster => (
        <Collapsible
          key={cluster.id}
          open={expandedClusters.has(cluster.id)}
          onOpenChange={() => toggleCluster(cluster.id)}
        >
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg cursor-pointer hover:bg-muted">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-primary" />
                <span className="font-medium">{cluster.topic}</span>
                <Badge variant="secondary">{cluster.size}</Badge>
                <span className="text-xs text-muted-foreground">
                  {cluster.relevanceScore}% relevance
                </span>
              </div>
              {expandedClusters.has(cluster.id) ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="space-y-2 mt-2 pl-4">
              {cluster.questions.map(question => (
                <QuestionCard
                  key={question.id}
                  question={question}
                  isSelected={selectedQuestions.has(question.id)}
                  onToggleSelect={onToggleSelect}
                  onCopy={onCopy}
                  onInsert={onInsert}
                />
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      ))}
    </div>
  );
}

/**
 * Tree tab
 */
function TreeTab({
  tree,
  expandedQuestions,
  onToggleExpand,
  onCopy,
  onInsert
}: {
  tree: PAATreeNode[];
  expandedQuestions: Set<string>;
  onToggleExpand: (id: string) => void;
  onCopy: (q: string) => void;
  onInsert: (q: PAAQuestion) => void;
}) {
  const renderNode = (node: PAATreeNode, depth: number = 0): React.ReactNode => {
    const hasChildren = node.children.length > 0;
    const isExpanded = expandedQuestions.has(node.question.id);

    return (
      <div key={node.question.id} style={{ marginLeft: depth * 16 }}>
        <div className="flex items-start gap-2 py-2">
          {hasChildren && (
            <button
              onClick={() => onToggleExpand(node.question.id)}
              className="mt-1 text-muted-foreground hover:text-foreground"
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
          )}
          {!hasChildren && <div className="w-4" />}
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">
                {QUESTION_TYPE_ICONS[node.question.type]} {node.question.question}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5"
                onClick={() => onCopy(node.question.question)}
              >
                <Copy className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5"
                onClick={() => onInsert(node.question)}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="text-xs">
                {node.question.relevanceScore}%
              </Badge>
              <span className="text-xs text-muted-foreground">
                Depth: {node.question.depth}
              </span>
            </div>
          </div>
        </div>
        {isExpanded && hasChildren && (
          <div className="border-l border-dashed ml-2 pl-2">
            {node.children.map(child => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2 mb-4">
        <TreePine className="h-4 w-4 text-primary" />
        <span className="font-medium">Question Hierarchy</span>
      </div>
      {tree.map(node => renderNode(node, 0))}
    </div>
  );
}

/**
 * Coverage tab
 */
function CoverageTab({
  questions,
  analysis,
  onCopy,
  onInsert
}: {
  questions: PAAQuestion[];
  analysis: CoverageAnalysis;
  onCopy: (q: string) => void;
  onInsert: (q: PAAQuestion) => void;
}) {
  const coveredQuestions = questions.filter(q => q.coverageStatus === 'covered');
  const partialQuestions = questions.filter(q => q.coverageStatus === 'partial');
  const uncoveredQuestions = questions.filter(q => q.coverageStatus === 'not-covered');
  const opportunityQuestions = questions.filter(q => q.coverageStatus === 'opportunity');

  return (
    <div className="space-y-6">
      {/* Coverage score */}
      <div className="p-4 bg-muted/50 rounded-lg text-center">
        <p className="text-3xl font-bold text-primary">{analysis.coveragePercentage}%</p>
        <p className="text-sm text-muted-foreground">Coverage Score</p>
      </div>

      {/* Covered */}
      {coveredQuestions.length > 0 && (
        <div>
          <h4 className="font-medium flex items-center gap-2 mb-3 text-green-600">
            <CheckCircle className="h-4 w-4" />
            Covered ({coveredQuestions.length})
          </h4>
          <div className="space-y-2">
            {coveredQuestions.slice(0, 5).map(q => (
              <QuestionCard
                key={q.id}
                question={q}
                showCheckbox={false}
                onCopy={onCopy}
                onInsert={onInsert}
              />
            ))}
          </div>
        </div>
      )}

      {/* Partial */}
      {partialQuestions.length > 0 && (
        <div>
          <h4 className="font-medium flex items-center gap-2 mb-3 text-yellow-600">
            <AlertCircle className="h-4 w-4" />
            Partially Covered ({partialQuestions.length})
          </h4>
          <div className="space-y-2">
            {partialQuestions.slice(0, 5).map(q => (
              <QuestionCard
                key={q.id}
                question={q}
                showCheckbox={false}
                onCopy={onCopy}
                onInsert={onInsert}
              />
            ))}
          </div>
        </div>
      )}

      {/* Opportunities */}
      {opportunityQuestions.length > 0 && (
        <div>
          <h4 className="font-medium flex items-center gap-2 mb-3 text-orange-600">
            <Lightbulb className="h-4 w-4" />
            Opportunities ({opportunityQuestions.length})
          </h4>
          <div className="space-y-2">
            {opportunityQuestions.slice(0, 5).map(q => (
              <QuestionCard
                key={q.id}
                question={q}
                showCheckbox={false}
                onCopy={onCopy}
                onInsert={onInsert}
              />
            ))}
          </div>
        </div>
      )}

      {/* Not Covered */}
      {uncoveredQuestions.length > 0 && (
        <div>
          <h4 className="font-medium flex items-center gap-2 mb-3 text-gray-600">
            <XCircle className="h-4 w-4" />
            Not Covered ({uncoveredQuestions.length})
          </h4>
          <div className="space-y-2">
            {uncoveredQuestions.slice(0, 5).map(q => (
              <QuestionCard
                key={q.id}
                question={q}
                showCheckbox={false}
                onCopy={onCopy}
                onInsert={onInsert}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Opportunities tab
 */
function OpportunitiesTab({
  opportunities,
  onCopy,
  onInsert
}: {
  opportunities: PAAOpportunity[];
  onCopy: (q: string) => void;
  onInsert: (q: PAAQuestion) => void;
}) {
  if (opportunities.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Target className="h-12 w-12 mx-auto mb-3 opacity-50" />
        <p>No opportunities found</p>
        <p className="text-sm">All high-value questions are already covered!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="h-4 w-4 text-primary" />
        <span className="font-medium">Top Opportunities</span>
        <span className="text-sm text-muted-foreground">
          (High-impact questions to address)
        </span>
      </div>

      {opportunities.map((opp, index) => (
        <div key={opp.question.id} className="border rounded-lg p-4 space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center h-6 w-6 rounded-full bg-primary/10 text-primary text-xs font-bold">
                {index + 1}
              </div>
              <div>
                <p className="font-medium">
                  {QUESTION_TYPE_ICONS[opp.question.type]} {opp.question.question}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {opp.reason}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-primary">{opp.score}</p>
              <p className="text-xs text-muted-foreground">Score</p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span>Format: {opp.recommendedFormat}</span>
              <span>~{opp.estimatedWordCount} words</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onCopy(opp.question.question)}
              >
                <Copy className="h-3 w-3 mr-1" />
                Copy
              </Button>
              <Button size="sm" onClick={() => onInsert(opp.question)}>
                <Plus className="h-3 w-3 mr-1" />
                Add Section
              </Button>
            </div>
          </div>

          {opp.suggestedSection && (
            <div className="bg-muted/50 p-2 rounded text-sm">
              <span className="text-muted-foreground">Suggested heading: </span>
              <span className="font-medium">{opp.suggestedSection}</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// =============================================================================
// EXPORTS
// =============================================================================

export default PAAPanel;

