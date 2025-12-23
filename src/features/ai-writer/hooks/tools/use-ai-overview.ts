/**
 * AI Overview Visibility Hook
 * 
 * React hook for analyzing content visibility in AI search overviews
 */

'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import {
  AIOverviewAnalysis,
  AIOverviewFactor,
  AIOverviewMetrics,
  AIOverviewOptimization,
  AIOverviewSummary,
  AIOverviewSettings,
  SnippetCandidate,
  AIOverviewFilterState,
  AIOverviewSortOption,
  DEFAULT_AI_OVERVIEW_SETTINGS,
  DEFAULT_FILTER_STATE,
  UseAIOverviewOptions,
  UseAIOverviewReturn,
  FactorCategory,
  AIOverviewExportOptions
} from '@/src/features/ai-writer/types/tools/ai-overview.types';
import { analyzeAIOverview, exportAIOverviewReport } from '@/src/features/ai-writer/utils/tools/ai-overview';

export function useAIOverview(
  content: string,
  options: UseAIOverviewOptions = {}
): UseAIOverviewReturn {
  const {
    settings: initialSettings,
    autoAnalyze = false,
    onComplete,
    onError
  } = options;

  // State
  const [analysis, setAnalysis] = useState<AIOverviewAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [settings, setSettings] = useState<AIOverviewSettings>({
    ...DEFAULT_AI_OVERVIEW_SETTINGS,
    ...initialSettings
  });

  // Analyze content
  const analyze = useCallback(async (textContent: string, query: string) => {
    if (!textContent.trim() || !query.trim()) {
      setAnalysis(null);
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      // Simulate async operation
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const result = analyzeAIOverview(textContent, query, settings);
      setAnalysis(result);
      onComplete?.(result);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Analysis failed');
      setError(error);
      onError?.(error);
    } finally {
      setIsAnalyzing(false);
    }
  }, [settings, onComplete, onError]);

  // Re-analyze with current settings
  const reanalyze = useCallback(async () => {
    if (content.trim() && settings.targetQuery.trim()) {
      await analyze(content, settings.targetQuery);
    }
  }, [content, settings.targetQuery, analyze]);

  // Auto-analyze when content or query changes
  useEffect(() => {
    if (autoAnalyze && content.trim() && settings.targetQuery.trim()) {
      const timer = setTimeout(() => {
        analyze(content, settings.targetQuery);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [content, settings.targetQuery, autoAnalyze, analyze]);

  // Filter factors
  const filterFactors = useCallback((
    filter: Partial<AIOverviewFilterState>
  ): AIOverviewFactor[] => {
    if (!analysis) return [];

    const mergedFilter = { ...DEFAULT_FILTER_STATE, ...filter };
    
    return analysis.factors.filter(factor => {
      if (mergedFilter.category !== 'all' && factor.category !== mergedFilter.category) {
        return false;
      }
      
      if (mergedFilter.status !== 'all' && factor.status !== mergedFilter.status) {
        return false;
      }
      
      return true;
    });
  }, [analysis]);

  // Sort factors
  const sortFactors = useCallback((
    factors: AIOverviewFactor[],
    sortBy: AIOverviewSortOption
  ): AIOverviewFactor[] => {
    const sorted = [...factors];
    
    switch (sortBy) {
      case 'score':
        sorted.sort((a, b) => b.score - a.score);
        break;
      case 'category':
        sorted.sort((a, b) => a.category.localeCompare(b.category));
        break;
      case 'status':
        const statusOrder = { fail: 0, warning: 1, pass: 2 };
        sorted.sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);
        break;
    }
    
    return sorted;
  }, []);

  // Filter optimizations
  const filterOptimizations = useCallback((
    filter: Partial<AIOverviewFilterState>
  ): AIOverviewOptimization[] => {
    if (!analysis) return [];

    const mergedFilter = { ...DEFAULT_FILTER_STATE, ...filter };
    
    return analysis.optimizations.filter(opt => {
      if (mergedFilter.category !== 'all' && opt.category !== mergedFilter.category) {
        return false;
      }
      
      if (mergedFilter.priority !== 'all' && opt.priority !== mergedFilter.priority) {
        return false;
      }
      
      return true;
    });
  }, [analysis]);

  // Sort optimizations
  const sortOptimizations = useCallback((
    optimizations: AIOverviewOptimization[],
    sortBy: AIOverviewSortOption
  ): AIOverviewOptimization[] => {
    const sorted = [...optimizations];
    
    switch (sortBy) {
      case 'impact':
        const impactOrder = { high: 0, medium: 1, low: 2 };
        sorted.sort((a, b) => impactOrder[a.impact] - impactOrder[b.impact]);
        break;
      case 'effort':
        const effortOrder = { low: 0, medium: 1, high: 2 };
        sorted.sort((a, b) => effortOrder[a.effort] - effortOrder[b.effort]);
        break;
      case 'category':
        sorted.sort((a, b) => a.category.localeCompare(b.category));
        break;
    }
    
    return sorted;
  }, []);

  // Get optimized snippet
  const getOptimizedSnippet = useCallback((candidateId: string): string | null => {
    if (!analysis) return null;
    
    const candidate = analysis.snippetCandidates.find(c => c.id === candidateId);
    return candidate?.optimizedVersion || candidate?.text || null;
  }, [analysis]);

  // Export report
  const exportReport = useCallback((format: AIOverviewExportOptions['format']): string | null => {
    if (!analysis) return null;
    
    const exportOptions: AIOverviewExportOptions = {
      format,
      includeAnalysis: true,
      includeOptimizations: true,
      includeSnippets: true,
      includeCompetitors: false
    };
    
    return exportAIOverviewReport(analysis, exportOptions);
  }, [analysis]);

  // Update settings
  const updateSettings = useCallback((newSettings: Partial<AIOverviewSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  // Derived values
  const metrics = useMemo((): AIOverviewMetrics | null => {
    if (!analysis) return null;
    
    return {
      overallScore: analysis.overallScore,
      categoryScores: {
        structure: analysis.structure.hasDefinition ? 80 : 40,
        authority: analysis.authority.citationCount * 10,
        relevance: analysis.relevance.queryMatch,
        freshness: analysis.freshness.freshnessScore,
        engagement: analysis.engagement.readabilityScore
      },
      passedFactors: analysis.factors.filter(f => f.status === 'pass').length,
      warningFactors: analysis.factors.filter(f => f.status === 'warning').length,
      failedFactors: analysis.factors.filter(f => f.status === 'fail').length,
      snippetCandidateCount: analysis.snippetCandidates.length,
      bestCandidateConfidence: analysis.bestCandidate?.confidence || 0,
      structureScore: analysis.factors.filter(f => f.category === 'structure').reduce((s, f) => s + f.score, 0) / 3,
      authorityScore: analysis.factors.filter(f => f.category === 'authority').reduce((s, f) => s + f.score, 0) / 2,
      relevanceScore: analysis.factors.filter(f => f.category === 'relevance').reduce((s, f) => s + f.score, 0) / 2,
      freshnessScore: analysis.factors.filter(f => f.category === 'freshness').reduce((s, f) => s + f.score, 0),
      engagementScore: analysis.factors.filter(f => f.category === 'engagement').reduce((s, f) => s + f.score, 0),
      wordCount: analysis.content.split(/\s+/).length,
      sentenceCount: analysis.content.split(/[.!?]+/).length,
      paragraphCount: analysis.content.split(/\n\n+/).length
    };
  }, [analysis]);

  const factors = useMemo((): AIOverviewFactor[] => {
    return analysis?.factors || [];
  }, [analysis]);

  const snippetCandidates = useMemo((): SnippetCandidate[] => {
    return analysis?.snippetCandidates || [];
  }, [analysis]);

  const optimizations = useMemo((): AIOverviewOptimization[] => {
    return analysis?.optimizations || [];
  }, [analysis]);

  const summary = useMemo((): AIOverviewSummary | null => {
    return analysis?.summary || null;
  }, [analysis]);

  return {
    analysis,
    isAnalyzing,
    error,
    
    metrics,
    factors,
    snippetCandidates,
    optimizations,
    summary,
    
    analyze,
    reanalyze,
    
    filterFactors,
    sortFactors,
    
    filterOptimizations,
    sortOptimizations,
    
    getOptimizedSnippet,
    exportReport,
    
    settings,
    updateSettings
  };
}

