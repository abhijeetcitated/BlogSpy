// =============================================================================
// CONTENT BRIEF PANEL - Comprehensive Brief Display UI
// =============================================================================
// Industry-standard content brief UI like Surfer SEO, Frase, Clearscope
// Beautiful panel with tabbed sections, copy-to-editor, and export options
// =============================================================================

'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';
import {
  FileText,
  List,
  Tags,
  HelpCircle,
  Users,
  BookOpen,
  ChevronDown,
  ChevronRight,
  Copy,
  Check,
  Download,
  RefreshCw,
  Target,
  TrendingUp,
  TrendingDown,
  Minus,
  ExternalLink,
  Star,
  Clock,
  BarChart,
  Zap,
  AlertCircle,
  Info,
  Sparkles,
} from 'lucide-react';

import type {
  ContentBrief,
  BriefTab,
  ContentBriefPanelState,
  OutlineSection,
  PrimaryTerm,
  SecondaryTerm,
  CompetitorInsight,
  BriefPAAQuestion,
  ContentGuidelines,
  SearchIntent,
  DifficultyLevel,
} from '@/src/features/ai-writer/types/tools/content-brief.types';

import {
  BRIEF_TABS,
  INTENT_LABELS,
  DIFFICULTY_COLORS,
} from '@/src/features/ai-writer/types/tools/content-brief.types';

// -----------------------------------------------------------------------------
// Props Interface
// -----------------------------------------------------------------------------

interface ContentBriefPanelProps {
  brief: ContentBrief | null;
  isGenerating?: boolean;
  generationProgress?: number;
  onCopyToEditor?: (content: string) => void;
  onExport?: (format: 'pdf' | 'docx' | 'markdown') => void;
  onRegenerate?: () => void;
  className?: string;
}

// -----------------------------------------------------------------------------
// Main Component
// -----------------------------------------------------------------------------

export function ContentBriefPanel({
  brief,
  isGenerating = false,
  generationProgress = 0,
  onCopyToEditor,
  onExport,
  onRegenerate,
  className = ''
}: ContentBriefPanelProps) {
  const [activeTab, setActiveTab] = useState<BriefTab>('overview');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  
  // Copy to clipboard helper
  const handleCopy = useCallback(async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }, []);
  
  // Copy section to editor
  const handleCopyToEditor = useCallback((content: string) => {
    onCopyToEditor?.(content);
  }, [onCopyToEditor]);
  
  // Toggle section expansion
  const toggleSection = useCallback((sectionId: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  }, []);
  
  // Loading state
  if (isGenerating) {
    return (
      <div className={`p-6 ${className}`}>
        <div className="text-center space-y-4">
          <Sparkles className="h-12 w-12 mx-auto text-primary animate-pulse" />
          <h3 className="text-lg font-semibold">Generating Content Brief</h3>
          <p className="text-sm text-muted-foreground">
            Analyzing competitors and building your brief...
          </p>
          <Progress value={generationProgress} className="w-64 mx-auto" />
          <p className="text-xs text-muted-foreground">{generationProgress}% complete</p>
        </div>
      </div>
    );
  }
  
  // No brief state
  if (!brief) {
    return (
      <div className={`p-6 text-center ${className}`}>
        <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Content Brief</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Enter a keyword to generate a comprehensive content brief
        </p>
      </div>
    );
  }
  
  return (
    <TooltipProvider>
      <div className={`flex flex-col h-full ${className}`}>
        {/* Header */}
        <div className="px-4 py-3 border-b bg-muted/30">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="font-semibold flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Content Brief
              </h3>
              <p className="text-xs text-muted-foreground">
                Keyword: <span className="font-medium">{brief.keyword}</span>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={onRegenerate}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onExport?.('markdown')}
              >
                <Download className="h-4 w-4 mr-1" />
                Export
              </Button>
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1">
              <Target className="h-3 w-3 text-muted-foreground" />
              <span>{brief.guidelines.wordCount.recommended.toLocaleString()} words</span>
            </div>
            <div className="flex items-center gap-1">
              <BarChart className="h-3 w-3 text-muted-foreground" />
              <span>{brief.metrics.overallScore}/100</span>
            </div>
            <Badge variant={getDifficultyVariant(brief.overview.difficulty)} className="text-[10px]">
              {brief.overview.difficulty}
            </Badge>
          </div>
        </div>
        
        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as BriefTab)} className="flex-1 flex flex-col">
          <TabsList className="mx-4 mt-2 grid grid-cols-6 h-8">
            {(Object.entries(BRIEF_TABS) as [BriefTab, { label: string; icon: string }][]).map(([key, { label }]) => (
              <TabsTrigger key={key} value={key} className="text-xs">
                {label}
              </TabsTrigger>
            ))}
          </TabsList>
          
          <ScrollArea className="flex-1">
            <div className="p-4">
              <TabsContent value="overview" className="mt-0">
                <OverviewTab brief={brief} onCopy={handleCopy} copiedId={copiedId} />
              </TabsContent>
              
              <TabsContent value="outline" className="mt-0">
                <OutlineTab
                  outline={brief.outline}
                  onCopyToEditor={handleCopyToEditor}
                  expandedSections={expandedSections}
                  toggleSection={toggleSection}
                />
              </TabsContent>
              
              <TabsContent value="terms" className="mt-0">
                <TermsTab terms={brief.terms} />
              </TabsContent>
              
              <TabsContent value="questions" className="mt-0">
                <QuestionsTab questions={brief.questions} onCopyToEditor={handleCopyToEditor} />
              </TabsContent>
              
              <TabsContent value="competitors" className="mt-0">
                <CompetitorsTab competitors={brief.competitors} />
              </TabsContent>
              
              <TabsContent value="guidelines" className="mt-0">
                <GuidelinesTab guidelines={brief.guidelines} />
              </TabsContent>
            </div>
          </ScrollArea>
        </Tabs>
      </div>
    </TooltipProvider>
  );
}

// -----------------------------------------------------------------------------
// Overview Tab
// -----------------------------------------------------------------------------

interface OverviewTabProps {
  brief: ContentBrief;
  onCopy: (text: string, id: string) => void;
  copiedId: string | null;
}

function OverviewTab({ brief, onCopy, copiedId }: OverviewTabProps) {
  const { overview, metrics } = brief;
  
  return (
    <div className="space-y-4">
      {/* Title & Meta */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Suggested Title</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-medium">{overview.title}</p>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => onCopy(overview.title, 'title')}
            >
              {copiedId === 'title' ? (
                <Check className="h-3 w-3 text-green-500" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </Button>
          </div>
          
          <div>
            <p className="text-xs text-muted-foreground mb-1">Meta Description</p>
            <div className="flex items-start justify-between gap-2">
              <p className="text-xs">{overview.metaDescription}</p>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => onCopy(overview.metaDescription, 'meta')}
              >
                {copiedId === 'meta' ? (
                  <Check className="h-3 w-3 text-green-500" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-3">
        <MetricCard
          label="Search Volume"
          value={overview.monthlySearchVolume.toLocaleString()}
          subtext="/month"
          icon={TrendingUp}
        />
        <MetricCard
          label="CPC"
          value={`$${overview.cpcEstimate.toFixed(2)}`}
          icon={Target}
        />
        <MetricCard
          label="Intent"
          value={INTENT_LABELS[overview.searchIntent]}
          icon={Zap}
        />
        <MetricCard
          label="Read Time"
          value={`${overview.estimatedReadTime} min`}
          icon={Clock}
        />
      </div>
      
      {/* Score Cards */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Brief Scores</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <ScoreBar label="Overall Score" score={metrics.overallScore} />
            <ScoreBar label="Competitiveness" score={metrics.competitivenessScore} />
            <ScoreBar label="Optimization Potential" score={metrics.optimizationPotential} />
          </div>
        </CardContent>
      </Card>
      
      {/* Content Type */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Recommended Content Type</p>
              <p className="font-medium">{formatContentType(overview.contentType)}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Target Audience</p>
              <p className="text-sm">{overview.targetAudience}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Outline Tab
// -----------------------------------------------------------------------------

interface OutlineTabProps {
  outline: ContentBrief['outline'];
  onCopyToEditor: (content: string) => void;
  expandedSections: Set<string>;
  toggleSection: (id: string) => void;
}

function OutlineTab({ outline, onCopyToEditor, expandedSections, toggleSection }: OutlineTabProps) {
  return (
    <div className="space-y-4">
      {/* Title */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Suggested Title</CardTitle>
            <Badge variant="secondary" className="text-[10px]">
              CTR Score: {outline.title.clickThroughScore}%
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="font-medium mb-2">{outline.title.primary}</p>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Alternatives:</p>
            {outline.title.alternatives.slice(0, 3).map((alt, i) => (
              <p key={i} className="text-xs text-muted-foreground">• {alt}</p>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Stats */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          Est. Word Count: <span className="font-medium text-foreground">{outline.estimatedWordCount.toLocaleString()}</span>
        </span>
        <span className="text-muted-foreground">
          Time to Write: <span className="font-medium text-foreground">{outline.estimatedTimeToWrite}h</span>
        </span>
      </div>
      
      {/* Sections */}
      <div className="space-y-2">
        {outline.sections.map((section) => (
          <OutlineSectionCard
            key={section.id}
            section={section}
            isExpanded={expandedSections.has(section.id)}
            onToggle={() => toggleSection(section.id)}
            onCopyToEditor={onCopyToEditor}
          />
        ))}
      </div>
      
      {/* Copy All Button */}
      <Button
        className="w-full"
        variant="outline"
        onClick={() => {
          const outlineText = outline.sections
            .map(s => `${'#'.repeat(s.level)} ${s.heading}`)
            .join('\n');
          onCopyToEditor(outlineText);
        }}
      >
        <Copy className="h-4 w-4 mr-2" />
        Copy Outline to Editor
      </Button>
    </div>
  );
}

interface OutlineSectionCardProps {
  section: OutlineSection;
  isExpanded: boolean;
  onToggle: () => void;
  onCopyToEditor: (content: string) => void;
}

function OutlineSectionCard({ section, isExpanded, onToggle, onCopyToEditor }: OutlineSectionCardProps) {
  const headingTag = `h${section.level}`;
  
  return (
    <div className="border rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-3 hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          {isExpanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
          <Badge variant="outline" className="text-[10px]">
            {headingTag.toUpperCase()}
          </Badge>
          <span className="text-sm font-medium">{section.heading}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">{section.wordCountTarget} words</span>
          <PriorityBadge priority={section.priority} />
        </div>
      </button>
      
      {isExpanded && (
        <div className="px-3 pb-3 space-y-2">
          <p className="text-xs text-muted-foreground">{section.suggestedContent}</p>
          
          {section.mustIncludeTerms.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground mb-1">Must Include:</p>
              <div className="flex flex-wrap gap-1">
                {section.mustIncludeTerms.map((term, i) => (
                  <Badge key={i} variant="secondary" className="text-[10px]">
                    {term}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-muted-foreground">
              {section.competitorCoverage}% of competitors cover this
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-xs"
              onClick={(e) => {
                e.stopPropagation();
                onCopyToEditor(`## ${section.heading}\n\n`);
              }}
            >
              <Copy className="h-3 w-3 mr-1" />
              Add to Editor
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// -----------------------------------------------------------------------------
// Terms Tab
// -----------------------------------------------------------------------------

interface TermsTabProps {
  terms: ContentBrief['terms'];
}

function TermsTab({ terms }: TermsTabProps) {
  return (
    <div className="space-y-4">
      {/* Primary Terms */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Star className="h-4 w-4 text-yellow-500" />
            Primary Terms
          </CardTitle>
          <CardDescription className="text-xs">
            Must include these terms for ranking potential
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {terms.primary.map((term, i) => (
              <TermRow key={i} term={term} isPrimary />
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Secondary Terms */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Secondary Terms</CardTitle>
          <CardDescription className="text-xs">
            Include these for topical depth
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {terms.secondary.slice(0, 10).map((term, i) => (
              <SecondaryTermRow key={i} term={term} />
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Semantic Groups */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Semantic Groups</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {terms.semanticGroups.map((group, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">{group.theme}</span>
                  <Badge
                    variant={
                      group.importance === 'essential'
                        ? 'default'
                        : group.importance === 'recommended'
                        ? 'secondary'
                        : 'outline'
                    }
                    className="text-[10px]"
                  >
                    {group.importance}
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-1">
                  {group.terms.map((term, j) => (
                    <Badge key={j} variant="outline" className="text-[10px]">
                      {term}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function TermRow({ term, isPrimary }: { term: PrimaryTerm; isPrimary?: boolean }) {
  const usage = term.currentCount / term.targetCount;
  
  return (
    <div className="flex items-center justify-between py-1">
      <div className="flex items-center gap-2">
        <span className="text-sm">{term.term}</span>
        {term.inTitle && (
          <Badge variant="outline" className="text-[10px]">Title</Badge>
        )}
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">
          {term.currentCount}/{term.targetCount}
        </span>
        <Progress value={Math.min(100, usage * 100)} className="w-16 h-1.5" />
      </div>
    </div>
  );
}

function SecondaryTermRow({ term }: { term: SecondaryTerm }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-sm">{term.term}</span>
      <span className="text-xs text-muted-foreground">
        {term.suggestedCount.min}-{term.suggestedCount.max}x
      </span>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Questions Tab
// -----------------------------------------------------------------------------

interface QuestionsTabProps {
  questions: ContentBrief['questions'];
  onCopyToEditor: (content: string) => void;
}

function QuestionsTab({ questions, onCopyToEditor }: QuestionsTabProps) {
  return (
    <div className="space-y-4">
      {/* PAA Questions */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <HelpCircle className="h-4 w-4" />
            People Also Ask
          </CardTitle>
          <CardDescription className="text-xs">
            Answer these questions in your content
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {questions.paaQuestions.map((paa, i) => (
              <PAAQuestionCard key={i} question={paa} onCopyToEditor={onCopyToEditor} />
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Suggested FAQ */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Suggested FAQ Section</CardTitle>
          <CardDescription className="text-xs">
            Include in your content for schema markup
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {questions.suggestedFAQ.map((faq, i) => (
              <div key={i} className="border rounded p-2">
                <p className="text-sm font-medium">{faq.question}</p>
                <p className="text-xs text-muted-foreground mt-1">{faq.answer}</p>
              </div>
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            className="w-full mt-3"
            onClick={() => {
              const faqText = questions.suggestedFAQ
                .map(f => `**Q: ${f.question}**\n\n${f.answer}`)
                .join('\n\n');
              onCopyToEditor(`## Frequently Asked Questions\n\n${faqText}`);
            }}
          >
            <Copy className="h-3 w-3 mr-2" />
            Add FAQ to Editor
          </Button>
        </CardContent>
      </Card>
      
      {/* Related Searches */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Related Searches</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {questions.relatedSearches.map((search, i) => (
              <Badge key={i} variant="outline" className="text-xs">
                {search.query}
                <span className="ml-1 text-muted-foreground">
                  {search.volume.toLocaleString()}
                </span>
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function PAAQuestionCard({ question, onCopyToEditor }: { question: BriefPAAQuestion; onCopyToEditor: (content: string) => void }) {
  return (
    <div className="border rounded p-3">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium">{question.question}</p>
        <Badge
          variant={question.competitorAnswered ? 'default' : 'destructive'}
          className="text-[10px] shrink-0"
        >
          {question.competitorAnswered ? 'Covered' : 'Gap'}
        </Badge>
      </div>
      <p className="text-xs text-muted-foreground mt-1">{question.suggestedAnswer}</p>
      <div className="flex items-center justify-between mt-2">
        <span className="text-xs text-muted-foreground">{question.wordCountTarget} words</span>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 text-xs"
          onClick={() => onCopyToEditor(`### ${question.question}\n\n`)}
        >
          <Copy className="h-3 w-3 mr-1" />
          Add
        </Button>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Competitors Tab
// -----------------------------------------------------------------------------

interface CompetitorsTabProps {
  competitors: CompetitorInsight[];
}

function CompetitorsTab({ competitors }: CompetitorsTabProps) {
  return (
    <div className="space-y-3">
      {competitors.slice(0, 10).map((comp, i) => (
        <CompetitorCard key={i} competitor={comp} />
      ))}
    </div>
  );
}

function CompetitorCard({ competitor }: { competitor: CompetitorInsight }) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <Card>
      <CardContent className="pt-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">#{competitor.rank}</Badge>
              <span className="text-sm font-medium truncate">{competitor.domain}</span>
            </div>
            <p className="text-xs text-muted-foreground truncate mt-1">
              {competitor.title}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-right">
              <p className="text-lg font-semibold">{competitor.contentScore}</p>
              <p className="text-xs text-muted-foreground">Score</p>
            </div>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" asChild>
              <a href={competitor.url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-4 gap-2 mt-3 text-center">
          <div>
            <p className="text-sm font-medium">{competitor.wordCount.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Words</p>
          </div>
          <div>
            <p className="text-sm font-medium">{competitor.headingCount}</p>
            <p className="text-xs text-muted-foreground">Headings</p>
          </div>
          <div>
            <p className="text-sm font-medium">{competitor.imageCount}</p>
            <p className="text-xs text-muted-foreground">Images</p>
          </div>
          <div>
            <p className="text-sm font-medium">{competitor.linkCount.internal + competitor.linkCount.external}</p>
            <p className="text-xs text-muted-foreground">Links</p>
          </div>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          className="w-full mt-2"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? 'Show Less' : 'Show More'}
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 ml-1" />
          ) : (
            <ChevronRight className="h-4 w-4 ml-1" />
          )}
        </Button>
        
        {isExpanded && (
          <div className="mt-3 space-y-2 border-t pt-3">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Top Terms:</p>
              <div className="flex flex-wrap gap-1">
                {competitor.topTerms.slice(0, 8).map((term, i) => (
                  <Badge key={i} variant="secondary" className="text-[10px]">
                    {term}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Top Headings:</p>
              {competitor.topHeadings.map((h, i) => (
                <p key={i} className="text-xs">• {h}</p>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// -----------------------------------------------------------------------------
// Guidelines Tab
// -----------------------------------------------------------------------------

interface GuidelinesTabProps {
  guidelines: ContentGuidelines;
}

function GuidelinesTab({ guidelines }: GuidelinesTabProps) {
  return (
    <div className="space-y-4">
      {/* Word Count */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Word Count Target</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between text-sm mb-2">
            <span>{guidelines.wordCount.minimum.toLocaleString()}</span>
            <span className="font-bold text-primary">{guidelines.wordCount.recommended.toLocaleString()}</span>
            <span>{guidelines.wordCount.maximum.toLocaleString()}</span>
          </div>
          <Progress value={50} className="h-2" />
          <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
            <span>Minimum</span>
            <span>Recommended</span>
            <span>Maximum</span>
          </div>
        </CardContent>
      </Card>
      
      {/* Structure */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Content Structure</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <GuidelineRow
              label="H2 Headings"
              value={`${guidelines.structure.h2Count.min}-${guidelines.structure.h2Count.max}`}
            />
            <GuidelineRow
              label="H3 Headings"
              value={`${guidelines.structure.h3Count.min}-${guidelines.structure.h3Count.max}`}
            />
            <GuidelineRow
              label="Lists"
              value={`${guidelines.structure.listCount}+`}
            />
            <GuidelineRow
              label="Tables"
              value={`${guidelines.structure.tableCount}+`}
            />
          </div>
        </CardContent>
      </Card>
      
      {/* Media */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Media Guidelines</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <GuidelineRow
              label="Images"
              value={`${guidelines.media.images.min}-${guidelines.media.images.recommended}`}
            />
            <GuidelineRow
              label="Videos"
              value={guidelines.media.videos.toString()}
            />
            <GuidelineRow
              label="Alt Text"
              value={guidelines.media.altTextRequired ? 'Required' : 'Optional'}
            />
          </div>
        </CardContent>
      </Card>
      
      {/* SEO */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">SEO Guidelines</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <GuidelineRow
              label="Title Length"
              value={`${guidelines.seo.titleLength.min}-${guidelines.seo.titleLength.max} chars`}
            />
            <GuidelineRow
              label="Meta Description"
              value={`${guidelines.seo.metaDescLength.min}-${guidelines.seo.metaDescLength.max} chars`}
            />
            <GuidelineRow
              label="URL Slug"
              value={guidelines.seo.urlSlug}
            />
            <GuidelineRow
              label="Schema Types"
              value={guidelines.seo.schemaType.join(', ')}
            />
          </div>
        </CardContent>
      </Card>
      
      {/* Tone */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Writing Style</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <GuidelineRow label="Voice" value={guidelines.tone.voice} />
            <GuidelineRow label="Perspective" value={guidelines.tone.perspective} />
            <GuidelineRow
              label="Target Reading Level"
              value={`Grade ${guidelines.readability.targetGrade}`}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function GuidelineRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Helper Components
// -----------------------------------------------------------------------------

interface MetricCardProps {
  label: string;
  value: string;
  subtext?: string;
  icon: React.ComponentType<{ className?: string }>;
}

function MetricCard({ label, value, subtext, icon: Icon }: MetricCardProps) {
  return (
    <Card>
      <CardContent className="pt-3 pb-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-lg font-semibold">
              {value}
              {subtext && <span className="text-xs text-muted-foreground">{subtext}</span>}
            </p>
          </div>
          <Icon className="h-5 w-5 text-muted-foreground" />
        </div>
      </CardContent>
    </Card>
  );
}

function ScoreBar({ label, score }: { label: string; score: number }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs">{label}</span>
        <span className="text-xs font-medium">{score}/100</span>
      </div>
      <Progress value={score} className="h-2" />
    </div>
  );
}

function PriorityBadge({ priority }: { priority: 'high' | 'medium' | 'low' }) {
  const variants: Record<string, 'default' | 'secondary' | 'outline'> = {
    high: 'default',
    medium: 'secondary',
    low: 'outline'
  };
  
  return (
    <Badge variant={variants[priority]} className="text-[10px]">
      {priority}
    </Badge>
  );
}

// -----------------------------------------------------------------------------
// Utility Functions
// -----------------------------------------------------------------------------

function getDifficultyVariant(difficulty: DifficultyLevel): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (difficulty) {
    case 'easy':
      return 'secondary';
    case 'medium':
      return 'outline';
    case 'hard':
      return 'default';
    case 'very-hard':
      return 'destructive';
  }
}

function formatContentType(type: string): string {
  return type
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// -----------------------------------------------------------------------------
// Export
// -----------------------------------------------------------------------------

export default ContentBriefPanel;

