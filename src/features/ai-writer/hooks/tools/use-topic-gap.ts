/**
 * Topic Gap Analysis Hook
 * 
 * React hook for managing topic gap analysis
 */

'use client';

import { useState, useCallback, useMemo } from 'react';
import {
  Topic,
  TopicType,
  ContentGap,
  GapStatus,
  GapSeverity,
  TopicCluster,
  TopicGapAnalysis,
  TopicGapMetrics,
  TopicGapSummary,
  TopicRecommendation,
  QuickWin,
  TopicGapSettings,
  TopicGapFilterState,
  TopicGapSortOption,
  TopicGapExportFormat,
  GapSummary,
  DEFAULT_TOPIC_GAP_SETTINGS,
  GAP_SEVERITY_WEIGHTS
} from '@/src/features/ai-writer/types/tools/topic-gap.types';
import {
  analyzeTopicGaps,
  exportTopicGapReport
} from '@/src/features/ai-writer/utils/tools/topic-gap';

// =============================================================================
// TYPES
// =============================================================================

interface UseTopicGapOptions {
  initialSettings?: Partial<TopicGapSettings>;
  keyword?: string;
}

interface UseTopicGapReturn {
  // State
  analysis: TopicGapAnalysis | null;
  isAnalyzing: boolean;
  settings: TopicGapSettings;
  
  // Direct access
  metrics: TopicGapMetrics | null;
  topics: Topic[];
  gaps: ContentGap[];
  clusters: TopicCluster[];
  recommendations: TopicRecommendation[];
  quickWins: QuickWin[];
  summary: TopicGapSummary | null;
  gapSummary: GapSummary | null;
  
  // Computed
  score: number;
  totalTopics: number;
  topicsCovered: number;
  topicsMissing: number;
  totalGaps: number;
  criticalGaps: number;
  
  // Gaps by severity
  criticalGapsList: ContentGap[];
  highGapsList: ContentGap[];
  mediumGapsList: ContentGap[];
  lowGapsList: ContentGap[];
  
  // Gaps by status
  missingGaps: ContentGap[];
  undercoveredGaps: ContentGap[];
  
  // Actions
  analyze: (content: string, keyword?: string) => void;
  updateSettings: (settings: Partial<TopicGapSettings>) => void;
  addCompetitorUrl: (url: string) => void;
  removeCompetitorUrl: (url: string) => void;
  exportReport: (format?: TopicGapExportFormat) => string | null;
  clearAnalysis: () => void;
  
  // Filtering
  filterGaps: (filter: Partial<TopicGapFilterState>) => ContentGap[];
  sortGaps: (gaps: ContentGap[], sortBy: TopicGapSortOption) => ContentGap[];
  searchTopics: (query: string) => Topic[];
}

// =============================================================================
// HOOK
// =============================================================================

export function useTopicGap(options: UseTopicGapOptions = {}): UseTopicGapReturn {
  const [analysis, setAnalysis] = useState<TopicGapAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [settings, setSettings] = useState<TopicGapSettings>({
    ...DEFAULT_TOPIC_GAP_SETTINGS,
    ...options.initialSettings
  });
  
  // ==========================================================================
  // ANALYSIS
  // ==========================================================================
  
  const analyze = useCallback((content: string, keyword?: string) => {
    setIsAnalyzing(true);
    
    setTimeout(() => {
      try {
        const result = analyzeTopicGaps(
          content,
          keyword || options.keyword || '',
          settings
        );
        setAnalysis(result);
      } catch (error) {
        console.error('Topic gap analysis failed:', error);
      } finally {
        setIsAnalyzing(false);
      }
    }, 200);
  }, [options.keyword, settings]);
  
  // ==========================================================================
  // SETTINGS
  // ==========================================================================
  
  const updateSettings = useCallback((newSettings: Partial<TopicGapSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);
  
  const addCompetitorUrl = useCallback((url: string) => {
    setSettings(prev => ({
      ...prev,
      competitorUrls: [...prev.competitorUrls, url]
    }));
  }, []);
  
  const removeCompetitorUrl = useCallback((url: string) => {
    setSettings(prev => ({
      ...prev,
      competitorUrls: prev.competitorUrls.filter(u => u !== url)
    }));
  }, []);
  
  // ==========================================================================
  // EXPORT
  // ==========================================================================
  
  const exportReport = useCallback((format: TopicGapExportFormat = 'markdown'): string | null => {
    if (!analysis) return null;
    return exportTopicGapReport(analysis, format);
  }, [analysis]);
  
  // ==========================================================================
  // CLEAR
  // ==========================================================================
  
  const clearAnalysis = useCallback(() => {
    setAnalysis(null);
  }, []);
  
  // ==========================================================================
  // DIRECT ACCESS
  // ==========================================================================
  
  const metrics = useMemo(() => analysis?.metrics || null, [analysis]);
  const topics = useMemo(() => analysis?.topics || [], [analysis]);
  const gaps = useMemo(() => analysis?.gaps || [], [analysis]);
  const clusters = useMemo(() => analysis?.clusters || [], [analysis]);
  const recommendations = useMemo(() => analysis?.recommendations || [], [analysis]);
  const quickWins = useMemo(() => analysis?.quickWins || [], [analysis]);
  const summary = useMemo(() => analysis?.summary || null, [analysis]);
  const gapSummary = useMemo(() => analysis?.gapSummary || null, [analysis]);
  
  // ==========================================================================
  // COMPUTED
  // ==========================================================================
  
  const score = useMemo(() => metrics?.overallScore || 0, [metrics]);
  const totalTopics = useMemo(() => metrics?.totalTopics || 0, [metrics]);
  const topicsCovered = useMemo(() => metrics?.topicsCovered || 0, [metrics]);
  const topicsMissing = useMemo(() => metrics?.topicsMissing || 0, [metrics]);
  const totalGaps = useMemo(() => metrics?.totalGaps || 0, [metrics]);
  const criticalGaps = useMemo(() => metrics?.criticalGaps || 0, [metrics]);
  
  // ==========================================================================
  // GAPS BY SEVERITY
  // ==========================================================================
  
  const criticalGapsList = useMemo(() => 
    gaps.filter(g => g.severity === 'critical'), [gaps]);
  const highGapsList = useMemo(() => 
    gaps.filter(g => g.severity === 'high'), [gaps]);
  const mediumGapsList = useMemo(() => 
    gaps.filter(g => g.severity === 'medium'), [gaps]);
  const lowGapsList = useMemo(() => 
    gaps.filter(g => g.severity === 'low'), [gaps]);
  
  // ==========================================================================
  // GAPS BY STATUS
  // ==========================================================================
  
  const missingGaps = useMemo(() => 
    gaps.filter(g => g.status === 'missing'), [gaps]);
  const undercoveredGaps = useMemo(() => 
    gaps.filter(g => g.status === 'undercovered'), [gaps]);
  
  // ==========================================================================
  // FILTERING
  // ==========================================================================
  
  const filterGaps = useCallback((filter: Partial<TopicGapFilterState>): ContentGap[] => {
    let result = [...gaps];
    
    if (filter.type && filter.type !== 'all') {
      result = result.filter(g => g.type === filter.type);
    }
    
    if (filter.status && filter.status !== 'all') {
      result = result.filter(g => g.status === filter.status);
    }
    
    if (filter.severity && filter.severity !== 'all') {
      result = result.filter(g => g.severity === filter.severity);
    }
    
    if (filter.search) {
      const searchLower = filter.search.toLowerCase();
      result = result.filter(g => g.topic.toLowerCase().includes(searchLower));
    }
    
    if (filter.minOpportunity) {
      result = result.filter(g => g.opportunityScore >= filter.minOpportunity!);
    }
    
    if (filter.showMissingOnly) {
      result = result.filter(g => g.status === 'missing');
    }
    
    return result;
  }, [gaps]);
  
  // ==========================================================================
  // SORTING
  // ==========================================================================
  
  const sortGaps = useCallback((gapsToSort: ContentGap[], sortBy: TopicGapSortOption): ContentGap[] => {
    const sorted = [...gapsToSort];
    
    switch (sortBy) {
      case 'opportunity':
        return sorted.sort((a, b) => b.opportunityScore - a.opportunityScore);
        
      case 'severity':
        return sorted.sort((a, b) => 
          GAP_SEVERITY_WEIGHTS[b.severity] - GAP_SEVERITY_WEIGHTS[a.severity]
        );
        
      case 'alphabetical':
        return sorted.sort((a, b) => a.topic.localeCompare(b.topic));
        
      case 'searchVolume':
        return sorted.sort((a, b) => (b.searchVolume || 0) - (a.searchVolume || 0));
        
      case 'effort':
        const effortOrder = { low: 1, medium: 2, high: 3 };
        return sorted.sort((a, b) => effortOrder[a.effort] - effortOrder[b.effort]);
        
      case 'impact':
        const impactOrder = { high: 3, medium: 2, low: 1 };
        return sorted.sort((a, b) => impactOrder[b.impact] - impactOrder[a.impact]);
        
      default:
        return sorted;
    }
  }, []);
  
  // ==========================================================================
  // SEARCH
  // ==========================================================================
  
  const searchTopics = useCallback((query: string): Topic[] => {
    if (!query.trim()) return topics;
    
    const lowerQuery = query.toLowerCase();
    return topics.filter(t =>
      t.text.toLowerCase().includes(lowerQuery) ||
      t.normalizedText.includes(lowerQuery)
    );
  }, [topics]);
  
  // ==========================================================================
  // RETURN
  // ==========================================================================
  
  return {
    // State
    analysis,
    isAnalyzing,
    settings,
    
    // Direct access
    metrics,
    topics,
    gaps,
    clusters,
    recommendations,
    quickWins,
    summary,
    gapSummary,
    
    // Computed
    score,
    totalTopics,
    topicsCovered,
    topicsMissing,
    totalGaps,
    criticalGaps,
    
    // Gaps by severity
    criticalGapsList,
    highGapsList,
    mediumGapsList,
    lowGapsList,
    
    // Gaps by status
    missingGaps,
    undercoveredGaps,
    
    // Actions
    analyze,
    updateSettings,
    addCompetitorUrl,
    removeCompetitorUrl,
    exportReport,
    clearAnalysis,
    
    // Filtering
    filterGaps,
    sortGaps,
    searchTopics
  };
}

export default useTopicGap;

