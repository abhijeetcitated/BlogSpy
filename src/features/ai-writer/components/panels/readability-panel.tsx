'use client';

// =============================================================================
// READABILITY ANALYZER PANEL - Production Level
// =============================================================================
// Industry-standard readability analysis UI like Hemingway, Grammarly, Yoast
// Complete visualization of all readability metrics
// =============================================================================

import React, { useState, useMemo, useCallback } from 'react';
import {
  BookOpen,
  GraduationCap,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Info,
  ChevronDown,
  ChevronRight,
  Target,
  TrendingUp,
  TrendingDown,
  Clock,
  Eye,
  EyeOff,
  FileText,
  Gauge,
  RefreshCw,
  Download,
  Users,
  Lightbulb,
  Highlighter,
  ArrowRight,
  Sparkles,
  type LucideIcon
} from 'lucide-react';

// UI Components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

// Types
import {
  ReadabilityAnalysis,
  ReadabilityGrade,
  ReadabilityTab,
  ReadabilityIssue,
  ReadabilityRecommendation,
  TargetAudience,
  ContentTypeStandard,
  HighlightType,
  FleschGrade,
  IssueSeverity,
  FLESCH_GRADES,
  AUDIENCE_TARGETS,
  CONTENT_TYPE_REQUIREMENTS,
  READABILITY_TABS,
  HIGHLIGHT_LABELS,
  HIGHLIGHT_COLORS,
  SEVERITY_COLORS,
  GRADE_COLORS
} from '@/src/features/ai-writer/types/tools/readability.types';

// Utilities
import {
  analyzeReadability,
  extractPlainText,
  generateHighlights,
  exportReadabilityReport
} from '@/src/features/ai-writer/utils/tools/readability';

// =============================================================================
// PROPS INTERFACE
// =============================================================================

interface ReadabilityPanelProps {
  content: string;
  targetAudience?: TargetAudience;
  contentType?: ContentTypeStandard;
  onAnalysisComplete?: (analysis: ReadabilityAnalysis) => void;
  onHighlightToggle?: (enabled: boolean, types: HighlightType[]) => void;
  className?: string;
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

function getGradeIcon(grade: ReadabilityGrade): LucideIcon {
  switch (grade) {
    case 'excellent': return CheckCircle;
    case 'good': return TrendingUp;
    case 'fair': return Target;
    case 'poor': return AlertTriangle;
    case 'very-poor': return TrendingDown;
    default: return Target;
  }
}

function getSeverityIcon(severity: IssueSeverity): LucideIcon {
  switch (severity) {
    case 'critical': return AlertTriangle;
    case 'warning': return Info;
    case 'suggestion': return Lightbulb;
    default: return Info;
  }
}

function formatTime(minutes: number, seconds: number): string {
  if (minutes === 0) return `${seconds}s`;
  if (seconds === 0) return `${minutes} min`;
  return `${minutes} min ${seconds}s`;
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function ReadabilityPanel({
  content,
  targetAudience = 'general',
  contentType = 'blog-post',
  onAnalysisComplete,
  onHighlightToggle,
  className = ''
}: ReadabilityPanelProps) {
  // State
  const [activeTab, setActiveTab] = useState<ReadabilityTab>('overview');
  const [selectedAudience, setSelectedAudience] = useState<TargetAudience>(targetAudience);
  const [selectedContentType, setSelectedContentType] = useState<ContentTypeStandard>(contentType);
  const [highlightsEnabled, setHighlightsEnabled] = useState(false);
  const [enabledHighlights, setEnabledHighlights] = useState<Set<HighlightType>>(
    new Set(['long-sentence', 'complex-word', 'passive-voice'])
  );
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['scores']));
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Analysis
  const analysis = useMemo(() => {
    if (!content || content.length < 50) return null;
    
    const result = analyzeReadability(content, {
      targetAudience: selectedAudience,
      contentType: selectedContentType,
      enableHighlighting: highlightsEnabled,
      highlightTypes: Array.from(enabledHighlights),
      strictMode: false
    });
    
    onAnalysisComplete?.(result);
    return result;
  }, [content, selectedAudience, selectedContentType]);
  
  // Highlights
  const highlights = useMemo(() => {
    if (!highlightsEnabled || !content) return [];
    const plainText = extractPlainText(content);
    return generateHighlights(plainText, Array.from(enabledHighlights));
  }, [content, highlightsEnabled, enabledHighlights]);
  
  // Handlers
  const handleRefresh = useCallback(() => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
    }, 500);
  }, []);
  
  const handleExport = useCallback(() => {
    if (!analysis) return;
    const report = exportReadabilityReport(analysis);
    const blob = new Blob([report], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'readability-report.md';
    a.click();
    URL.revokeObjectURL(url);
  }, [analysis]);
  
  const toggleHighlightType = useCallback((type: HighlightType) => {
    setEnabledHighlights(prev => {
      const next = new Set(prev);
      if (next.has(type)) {
        next.delete(type);
      } else {
        next.add(type);
      }
      onHighlightToggle?.(highlightsEnabled, Array.from(next));
      return next;
    });
  }, [highlightsEnabled, onHighlightToggle]);
  
  const toggleSection = useCallback((section: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  }, []);
  
  // Render empty state
  if (!content || content.length < 50) {
    return (
      <Card className={className}>
        <CardContent className="py-12 text-center">
          <BookOpen className="w-12 h-12 mx-auto text-muted-foreground opacity-50" />
          <h3 className="mt-4 font-medium">Start Writing</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Add at least 50 characters to see readability analysis
          </p>
        </CardContent>
      </Card>
    );
  }
  
  if (!analysis) return null;
  
  return (
    <TooltipProvider>
      <Card className={`${className} overflow-hidden`}>
        {/* Header */}
        <CardHeader className="pb-3 space-y-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              <CardTitle className="text-lg">Readability</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                disabled={isAnalyzing}
              >
                <RefreshCw className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleExport}
              >
                <Download className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <CardDescription className="mt-1">
            {analysis.words.total.toLocaleString()} words • {formatTime(analysis.readingTime.minutes, analysis.readingTime.seconds)} read
          </CardDescription>
        </CardHeader>
        
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as ReadabilityTab)}>
            {/* Tab List */}
            <div className="border-b px-4">
              <TabsList className="h-9 w-full justify-start bg-transparent p-0">
                {READABILITY_TABS.map(tab => (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className="relative h-9 rounded-none border-b-2 border-b-transparent data-[state=active]:border-b-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 text-xs"
                  >
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
            
            <ScrollArea className="h-[500px]">
              {/* Overview Tab */}
              <TabsContent value="overview" className="p-4 m-0 space-y-4">
                {/* Overall Score */}
                <OverallScoreCard analysis={analysis} />
                
                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-3">
                  <QuickStatCard
                    icon={GraduationCap}
                    label="Grade Level"
                    value={analysis.averageGradeLevel.toString()}
                    subtext={analysis.fleschKincaidGrade.interpretation}
                  />
                  <QuickStatCard
                    icon={Clock}
                    label="Read Time"
                    value={`${analysis.readingTime.minutes}m`}
                    subtext={`${analysis.words.total} words`}
                  />
                  <QuickStatCard
                    icon={Target}
                    label="Target"
                    value={analysis.targetComparison.isOnTarget ? 'On Target' : 'Off Target'}
                    subtext={AUDIENCE_TARGETS[selectedAudience].description}
                    isOnTarget={analysis.targetComparison.isOnTarget}
                  />
                </div>
                
                {/* Target Comparison Alert */}
                {!analysis.targetComparison.isOnTarget && (
                  <div className={`flex items-start gap-3 p-3 rounded-lg border ${
                    analysis.targetComparison.adjustment === 'simplify' 
                      ? 'bg-red-50 border-red-200 text-red-900' 
                      : 'bg-amber-50 border-amber-200 text-amber-900'
                  }`}>
                    <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                    <div>
                      <div className="font-medium text-sm">Reading Level Adjustment Needed</div>
                      <div className="text-sm mt-1 opacity-90">
                        {analysis.targetComparison.specificAdvice}
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Top Issues */}
                {analysis.issues.length > 0 && (
                  <div>
                    <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                      Top Issues ({analysis.issues.length})
                    </h4>
                    <div className="space-y-2">
                      {analysis.issues.slice(0, 3).map(issue => (
                        <IssueCard key={issue.id} issue={issue} compact />
                      ))}
                      {analysis.issues.length > 3 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full text-xs"
                          onClick={() => setActiveTab('issues')}
                        >
                          View all {analysis.issues.length} issues <ArrowRight className="w-3 h-3 ml-1" />
                        </Button>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Top Recommendations */}
                {analysis.recommendations.length > 0 && (
                  <div>
                    <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                      <Lightbulb className="w-4 h-4 text-blue-500" />
                      Recommendations
                    </h4>
                    <div className="space-y-2">
                      {analysis.recommendations.slice(0, 2).map(rec => (
                        <RecommendationCard key={rec.id} recommendation={rec} compact />
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>
              
              {/* Scores Tab */}
              <TabsContent value="scores" className="p-4 m-0 space-y-4">
                {/* Settings */}
                <div className="flex flex-wrap gap-3">
                  <div className="flex-1 min-w-[140px]">
                    <Label className="text-xs text-muted-foreground">Target Audience</Label>
                    <Select 
                      value={selectedAudience} 
                      onValueChange={(v) => setSelectedAudience(v as TargetAudience)}
                    >
                      <SelectTrigger className="h-8 mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(AUDIENCE_TARGETS).map(([key, target]) => (
                          <SelectItem key={key} value={key}>
                            {target.description}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex-1 min-w-[140px]">
                    <Label className="text-xs text-muted-foreground">Content Type</Label>
                    <Select
                      value={selectedContentType}
                      onValueChange={(v) => setSelectedContentType(v as ContentTypeStandard)}
                    >
                      <SelectTrigger className="h-8 mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(CONTENT_TYPE_REQUIREMENTS).map(([key, req]) => (
                          <SelectItem key={key} value={key}>
                            {key.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <Separator />
                
                {/* Flesch Reading Ease */}
                <Collapsible
                  open={expandedSections.has('flesch')}
                  onOpenChange={() => toggleSection('flesch')}
                >
                  <CollapsibleTrigger className="w-full">
                    <div className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-2">
                        {expandedSections.has('flesch') ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                        <span className="font-medium text-sm">Flesch Reading Ease</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {analysis.fleschReadingEase.score}
                        </Badge>
                        <Badge className={getFleschBadgeClass(analysis.fleschReadingEase.grade)}>
                          {analysis.fleschReadingEase.schoolLevel}
                        </Badge>
                      </div>
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pb-3">
                    <div className="ml-6 space-y-2">
                      <Progress value={analysis.fleschReadingEase.score} className="h-2" />
                      <p className="text-xs text-muted-foreground">
                        {analysis.fleschReadingEase.description}
                      </p>
                      <FleschScaleVisualization score={analysis.fleschReadingEase.score} />
                    </div>
                  </CollapsibleContent>
                </Collapsible>
                
                {/* All Metrics */}
                <div className="space-y-3">
                  <MetricRow
                    label="Flesch-Kincaid Grade"
                    value={analysis.fleschKincaidGrade.score}
                    interpretation={`Grade ${analysis.fleschKincaidGrade.gradeLevel}`}
                    tooltip="US school grade level required to understand text"
                  />
                  <MetricRow
                    label="Gunning Fog Index"
                    value={analysis.gunningFog.score}
                    interpretation={analysis.gunningFog.targetAudience}
                    tooltip="Years of formal education needed"
                  />
                  <MetricRow
                    label="SMOG Index"
                    value={analysis.smog.score}
                    interpretation={`Grade ${analysis.smog.gradeLevel}`}
                    tooltip="Simple Measure of Gobbledygook"
                  />
                  <MetricRow
                    label="Coleman-Liau Index"
                    value={analysis.colemanLiau.score}
                    interpretation={`Grade ${analysis.colemanLiau.gradeLevel}`}
                    tooltip="Based on character and word counts"
                  />
                  <MetricRow
                    label="Automated Readability"
                    value={analysis.ari.score}
                    interpretation={analysis.ari.ageRange}
                    tooltip="ARI based on characters per word"
                  />
                  <MetricRow
                    label="Dale-Chall Score"
                    value={analysis.daleChall.score}
                    interpretation={analysis.daleChall.gradeLevel}
                    tooltip="Based on difficult word percentage"
                  />
                </div>
                
                <Separator />
                
                {/* Content Statistics */}
                <div>
                  <h4 className="font-medium text-sm mb-3">Content Statistics</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <StatBox label="Sentences" value={analysis.sentences.total} />
                    <StatBox label="Avg Sentence Length" value={`${analysis.sentences.averageLength} words`} />
                    <StatBox label="Unique Words" value={analysis.words.unique} />
                    <StatBox label="Complex Words" value={analysis.words.complexWords} />
                    <StatBox label="Paragraphs" value={analysis.paragraphs.total} />
                    <StatBox label="Vocabulary Diversity" value={`${Math.round(analysis.words.vocabularyDiversity * 100)}%`} />
                  </div>
                </div>
                
                {/* Industry Benchmark */}
                <div className="p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Industry Benchmark</span>
                    <Badge variant={
                      analysis.industryBenchmark.comparison === 'above' ? 'default' :
                      analysis.industryBenchmark.comparison === 'below' ? 'destructive' : 'secondary'
                    }>
                      {analysis.industryBenchmark.comparison === 'above' ? 'Above Average' :
                       analysis.industryBenchmark.comparison === 'below' ? 'Below Average' : 'Average'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <div className="flex justify-between text-xs mb-1">
                        <span>Your Score</span>
                        <span>{analysis.industryBenchmark.yourScore}</span>
                      </div>
                      <Progress value={(analysis.industryBenchmark.yourScore / 100) * 100} className="h-1.5" />
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Avg: {analysis.industryBenchmark.averageScore}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Top {analysis.industryBenchmark.percentile}% for {selectedContentType.replace(/-/g, ' ')}
                  </p>
                </div>
              </TabsContent>
              
              {/* Issues Tab */}
              <TabsContent value="issues" className="p-4 m-0 space-y-3">
                {analysis.issues.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="w-12 h-12 mx-auto text-green-500 opacity-50" />
                    <h3 className="mt-4 font-medium">No Issues Found</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Your content has good readability!
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Issue Summary */}
                    <div className="flex gap-2">
                      {['critical', 'warning', 'suggestion'].map(severity => {
                        const count = analysis.issues.filter(i => i.severity === severity).length;
                        if (count === 0) return null;
                        return (
                          <Badge
                            key={severity}
                            variant="outline"
                            className={SEVERITY_COLORS[severity as IssueSeverity]}
                          >
                            {count} {severity}
                          </Badge>
                        );
                      })}
                    </div>
                    
                    {/* Issues List */}
                    <div className="space-y-3">
                      {analysis.issues.map(issue => (
                        <IssueCard key={issue.id} issue={issue} />
                      ))}
                    </div>
                  </>
                )}
                
                {/* Recommendations */}
                {analysis.recommendations.length > 0 && (
                  <>
                    <Separator className="my-4" />
                    <h4 className="font-medium text-sm flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-primary" />
                      Recommendations
                    </h4>
                    <div className="space-y-3">
                      {analysis.recommendations.map(rec => (
                        <RecommendationCard key={rec.id} recommendation={rec} />
                      ))}
                    </div>
                  </>
                )}
              </TabsContent>
              
              {/* Highlights Tab */}
              <TabsContent value="highlights" className="p-4 m-0 space-y-4">
                {/* Master Toggle */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Highlighter className="w-4 h-4" />
                    <span className="font-medium text-sm">Enable Highlights</span>
                  </div>
                  <Switch
                    checked={highlightsEnabled}
                    onCheckedChange={(checked) => {
                      setHighlightsEnabled(checked);
                      onHighlightToggle?.(checked, Array.from(enabledHighlights));
                    }}
                  />
                </div>
                
                <p className="text-xs text-muted-foreground">
                  Highlight issues directly in your content for easy identification
                </p>
                
                <Separator />
                
                {/* Highlight Types */}
                <div className="space-y-2">
                  {Object.entries(HIGHLIGHT_LABELS).map(([type, label]) => (
                    <div
                      key={type}
                      className={`flex items-center justify-between p-2 rounded-lg border ${
                        enabledHighlights.has(type as HighlightType) ? 'bg-muted/50' : ''
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded ${HIGHLIGHT_COLORS[type as HighlightType]}`} />
                        <span className="text-sm">{label}</span>
                      </div>
                      <Switch
                        checked={enabledHighlights.has(type as HighlightType)}
                        onCheckedChange={() => toggleHighlightType(type as HighlightType)}
                        disabled={!highlightsEnabled}
                      />
                    </div>
                  ))}
                </div>
                
                {/* Highlights Found */}
                {highlightsEnabled && highlights.length > 0 && (
                  <>
                    <Separator />
                    <div className="p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Highlights Found</span>
                        <Badge variant="secondary">{highlights.length}</Badge>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(HIGHLIGHT_LABELS).map(([type, label]) => {
                          const count = highlights.filter(h => h.type === type).length;
                          if (count === 0) return null;
                          return (
                            <Badge
                              key={type}
                              variant="outline"
                              className={HIGHLIGHT_COLORS[type as HighlightType]}
                            >
                              {label}: {count}
                            </Badge>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}
              </TabsContent>
              
              {/* Compare Tab */}
              <TabsContent value="compare" className="p-4 m-0 space-y-4">
                {/* Sentence Distribution */}
                <div>
                  <h4 className="font-medium text-sm mb-3">Sentence Length Distribution</h4>
                  <SentenceDistributionChart distribution={analysis.sentences.distribution as unknown as { [key: string]: number }} />
                </div>
                
                <Separator />
                
                {/* Word Analysis */}
                <div>
                  <h4 className="font-medium text-sm mb-3">Word Complexity</h4>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="p-3 rounded-lg bg-green-50 text-center">
                      <div className="text-lg font-bold text-green-700">{analysis.words.simpleWords}</div>
                      <div className="text-xs text-green-600">Simple</div>
                    </div>
                    <div className="p-3 rounded-lg bg-amber-50 text-center">
                      <div className="text-lg font-bold text-amber-700">
                        {analysis.words.total - analysis.words.simpleWords - analysis.words.complexWords}
                      </div>
                      <div className="text-xs text-amber-600">Medium</div>
                    </div>
                    <div className="p-3 rounded-lg bg-red-50 text-center">
                      <div className="text-lg font-bold text-red-700">{analysis.words.complexWords}</div>
                      <div className="text-xs text-red-600">Complex</div>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                {/* Most Common Words */}
                {analysis.words.wordFrequency.mostCommon.length > 0 && (
                  <div>
                    <h4 className="font-medium text-sm mb-3">Most Used Words</h4>
                    <div className="flex flex-wrap gap-2">
                      {analysis.words.wordFrequency.mostCommon.slice(0, 10).map((item, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {item.word} ({item.count})
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Overused Words Warning */}
                {analysis.words.wordFrequency.overused.length > 0 && (
                  <div className="flex items-start gap-3 p-3 rounded-lg border bg-amber-50 border-amber-200 text-amber-900">
                    <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                    <div>
                      <div className="font-medium text-sm">Overused Words</div>
                      <div className="text-sm mt-1 opacity-90">
                        Consider varying: {analysis.words.wordFrequency.overused.map(w => w.word).join(', ')}
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>
            </ScrollArea>
          </Tabs>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

function OverallScoreCard({ analysis }: { analysis: ReadabilityAnalysis }) {
  const GradeIcon = getGradeIcon(analysis.overallGrade);
  
  return (
    <div className={`p-4 rounded-lg ${GRADE_COLORS[analysis.overallGrade]}`}>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-3xl font-bold">{analysis.overallScore}</div>
          <div className="text-sm font-medium capitalize">{analysis.overallGrade.replace('-', ' ')}</div>
        </div>
        <div className="text-right">
          <GradeIcon className="w-8 h-8 ml-auto" />
          <div className="text-xs mt-1">Readability Score</div>
        </div>
      </div>
    </div>
  );
}

function QuickStatCard({
  icon: Icon,
  label,
  value,
  subtext,
  isOnTarget
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  subtext: string;
  isOnTarget?: boolean;
}) {
  return (
    <div className="p-3 rounded-lg border bg-card">
      <div className="flex items-center gap-2 mb-1">
        <Icon className={`w-4 h-4 ${
          isOnTarget === true ? 'text-green-500' : 
          isOnTarget === false ? 'text-amber-500' : 'text-muted-foreground'
        }`} />
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <div className="font-semibold">{value}</div>
      <div className="text-xs text-muted-foreground truncate">{subtext}</div>
    </div>
  );
}

function MetricRow({
  label,
  value,
  interpretation,
  tooltip
}: {
  label: string;
  value: number;
  interpretation: string;
  tooltip: string;
}) {
  return (
    <div className="flex items-center justify-between py-2 border-b last:border-0">
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="text-sm cursor-help">{label}</span>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">{tooltip}</p>
        </TooltipContent>
      </Tooltip>
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="font-mono">{value}</Badge>
        <span className="text-xs text-muted-foreground">{interpretation}</span>
      </div>
    </div>
  );
}

function StatBox({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="p-2 rounded border bg-card text-center">
      <div className="font-semibold">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

function IssueCard({ issue, compact = false }: { issue: ReadabilityIssue; compact?: boolean }) {
  const Icon = getSeverityIcon(issue.severity);
  
  return (
    <div className={`p-3 rounded-lg border ${SEVERITY_COLORS[issue.severity]}`}>
      <div className="flex items-start gap-2">
        <Icon className="w-4 h-4 mt-0.5 shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm">{issue.title}</div>
          {!compact && (
            <>
              <p className="text-xs mt-1">{issue.description}</p>
              {issue.originalText && (
                <div className="mt-2 p-2 rounded bg-background/50 text-xs font-mono truncate">
                  "{issue.originalText}"
                </div>
              )}
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs text-muted-foreground">{issue.metric}:</span>
                <Badge variant="outline" className="text-xs">{issue.currentValue}</Badge>
                <ArrowRight className="w-3 h-3" />
                <Badge variant="secondary" className="text-xs">{issue.targetValue}</Badge>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function RecommendationCard({ 
  recommendation, 
  compact = false 
}: { 
  recommendation: ReadabilityRecommendation; 
  compact?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  
  return (
    <div className="p-3 rounded-lg border bg-card">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-primary shrink-0" />
          <span className="font-medium text-sm">{recommendation.title}</span>
        </div>
        <Badge variant="outline" className="text-xs capitalize">{recommendation.priority}</Badge>
      </div>
      
      {!compact && (
        <>
          <p className="text-xs text-muted-foreground mt-2 ml-6">
            {recommendation.description}
          </p>
          
          {recommendation.examples && recommendation.examples.length > 0 && (
            <Collapsible open={expanded} onOpenChange={setExpanded}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="ml-6 mt-2 h-7 text-xs">
                  {expanded ? 'Hide' : 'Show'} Example
                  {expanded ? <ChevronDown className="w-3 h-3 ml-1" /> : <ChevronRight className="w-3 h-3 ml-1" />}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="ml-6 mt-2">
                {recommendation.examples.map((example, idx) => (
                  <div key={idx} className="space-y-1 p-2 rounded bg-muted/50">
                    <div className="text-xs">
                      <span className="text-red-500 line-through">"{example.before}"</span>
                    </div>
                    <div className="text-xs">
                      <span className="text-green-600">"{example.after}"</span>
                    </div>
                    <div className="text-xs text-muted-foreground italic">
                      {example.improvement}
                    </div>
                  </div>
                ))}
              </CollapsibleContent>
            </Collapsible>
          )}
          
          <div className="flex items-center gap-3 mt-2 ml-6">
            <span className="text-xs text-muted-foreground">
              Impact: <Badge variant="outline" className="text-xs ml-1">{recommendation.impact}</Badge>
            </span>
            <span className="text-xs text-muted-foreground">
              Effort: <Badge variant="outline" className="text-xs ml-1">{recommendation.effort}</Badge>
            </span>
            {recommendation.autoFix && (
              <Badge variant="secondary" className="text-xs">
                <Sparkles className="w-3 h-3 mr-1" />
                Auto-fix available
              </Badge>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function FleschScaleVisualization({ score }: { score: number }) {
  return (
    <div className="relative h-6 rounded-full overflow-hidden bg-linear-to-r from-red-500 via-yellow-500 to-green-500">
      <div
        className="absolute top-0 bottom-0 w-1 bg-white shadow-lg"
        style={{ left: `${score}%` }}
      />
      <div className="absolute inset-0 flex items-center justify-between px-2 text-xs text-white font-medium">
        <span>Difficult</span>
        <span>Easy</span>
      </div>
    </div>
  );
}

function SentenceDistributionChart({ distribution }: { distribution: { [key: string]: number } }) {
  const total = Object.values(distribution).reduce((a, b) => a + b, 0);
  if (total === 0) return null;
  
  const categories = [
    { key: '0-10', label: '≤10', color: 'bg-green-500' },
    { key: '11-15', label: '11-15', color: 'bg-emerald-500' },
    { key: '16-20', label: '16-20', color: 'bg-yellow-500' },
    { key: '21-25', label: '21-25', color: 'bg-orange-500' },
    { key: '26-30', label: '26-30', color: 'bg-red-400' },
    { key: '31+', label: '>30', color: 'bg-red-600' }
  ];
  
  return (
    <div className="space-y-2">
      {categories.map(cat => {
        const count = distribution[cat.key as keyof typeof distribution] || 0;
        const percentage = (count / total) * 100;
        
        return (
          <div key={cat.key} className="flex items-center gap-2">
            <span className="text-xs w-10">{cat.label}</span>
            <div className="flex-1 h-4 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full ${cat.color} transition-all`}
                style={{ width: `${percentage}%` }}
              />
            </div>
            <span className="text-xs w-8 text-right">{count}</span>
          </div>
        );
      })}
      <p className="text-xs text-muted-foreground text-center">
        Words per sentence
      </p>
    </div>
  );
}

function getFleschBadgeClass(grade: FleschGrade): string {
  switch (grade) {
    case 'very-easy':
    case 'easy':
      return 'bg-green-100 text-green-800';
    case 'fairly-easy':
    case 'standard':
      return 'bg-yellow-100 text-yellow-800';
    case 'fairly-hard':
    case 'hard':
      return 'bg-orange-100 text-orange-800';
    case 'very-hard':
      return 'bg-red-100 text-red-800';
    default:
      return '';
  }
}

// =============================================================================
// EXPORT
// =============================================================================

export default ReadabilityPanel;

