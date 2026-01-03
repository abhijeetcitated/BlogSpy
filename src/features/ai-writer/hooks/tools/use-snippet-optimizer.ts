/**
 * useSnippetOptimizer Hook
 * 
 * Production-grade React hook for featured snippet optimization
 */

'use client';

import { useState, useCallback, useMemo } from 'react';
import {
  SnippetType,
  SnippetQuality,
  OptimizationImpact,
  SnippetOptimizerResult,
  SnippetCandidate,
  SnippetIssue,
  SnippetOptimization,
  SnippetRecommendation,
  SnippetMetrics,
  SnippetOptimizerSettings,
  SnippetExportOptions,
  UseSnippetOptimizerOptions,
  UseSnippetOptimizerReturn,
  DEFAULT_SNIPPET_SETTINGS
} from '@/src/features/ai-writer/types/tools/snippet-optimizer.types';
import {
  analyzeForSnippets,
  exportSnippetReport
} from '@/src/features/ai-writer/utils/tools/snippet-optimizer';

export function useSnippetOptimizer(
  options: UseSnippetOptimizerOptions = {}
): UseSnippetOptimizerReturn {
  const {
    settings: initialSettings = {},
    onComplete,
    onError
  } = options;

  // ==========================================================================
  // STATE
  // ==========================================================================

  const [result, setResult] = useState<SnippetOptimizerResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [content, setContent] = useState<string>('');
  const [settings, setSettings] = useState<SnippetOptimizerSettings>({
    ...DEFAULT_SNIPPET_SETTINGS,
    ...initialSettings
  });
  const [dismissedOptimizations, setDismissedOptimizations] = useState<Set<string>>(new Set());

  // ==========================================================================
  // DERIVED STATE
  // ==========================================================================

  const metrics = useMemo<SnippetMetrics | null>(() => {
    return result?.metrics || null;
  }, [result]);

  const candidates = useMemo<SnippetCandidate[]>(() => {
    return result?.candidates || [];
  }, [result]);

  const issues = useMemo<SnippetIssue[]>(() => {
    return result?.issues || [];
  }, [result]);

  const optimizations = useMemo<SnippetOptimization[]>(() => {
    const all = result?.optimizations || [];
    return all.filter(o => !dismissedOptimizations.has(o.id));
  }, [result, dismissedOptimizations]);

  const recommendations = useMemo<SnippetRecommendation[]>(() => {
    return result?.recommendations || [];
  }, [result]);

  // ==========================================================================
  // CORE FUNCTIONS
  // ==========================================================================

  const analyze = useCallback(async (
    inputContent: string,
    targetQuery?: string
  ): Promise<void> => {
    if (!inputContent.trim()) {
      setError(new Error('Content is required'));
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setContent(inputContent);

    try {
      // Simulate async processing
      await new Promise(resolve => setTimeout(resolve, 150));

      const analyzerSettings: SnippetOptimizerSettings = {
        ...settings,
        targetQuery: targetQuery || settings.targetQuery
      };

      const analyzerResult = analyzeForSnippets(inputContent, analyzerSettings);
      setResult(analyzerResult);
      onComplete?.(analyzerResult);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Analysis failed');
      setError(error);
      onError?.(error);
    } finally {
      setIsAnalyzing(false);
    }
  }, [settings, onComplete, onError]);

  const reanalyze = useCallback(async (): Promise<void> => {
    if (content) {
      setDismissedOptimizations(new Set());
      await analyze(content, settings.targetQuery);
    }
  }, [content, settings.targetQuery, analyze]);

  // ==========================================================================
  // CANDIDATE FUNCTIONS
  // ==========================================================================

  const getCandidatesByType = useCallback((type: SnippetType): SnippetCandidate[] => {
    return candidates.filter(c => c.type === type);
  }, [candidates]);

  const getCandidatesByQuality = useCallback((quality: SnippetQuality): SnippetCandidate[] => {
    return candidates.filter(c => c.quality === quality);
  }, [candidates]);

  const optimizeCandidate = useCallback((candidateId: string): string | null => {
    const candidate = candidates.find(c => c.id === candidateId);
    return candidate?.optimizedVersion || null;
  }, [candidates]);

  const getOptimizedContent = useCallback((): string => {
    return result?.optimizedContent || content;
  }, [result, content]);

  // ==========================================================================
  // FILTER FUNCTIONS
  // ==========================================================================

  const filterIssues = useCallback((
    severity?: 'error' | 'warning' | 'info'
  ): SnippetIssue[] => {
    if (!severity) return issues;
    return issues.filter(i => i.severity === severity);
  }, [issues]);

  const filterOptimizations = useCallback((
    priority?: OptimizationImpact
  ): SnippetOptimization[] => {
    if (!priority) return optimizations;
    return optimizations.filter(o => o.priority === priority);
  }, [optimizations]);

  // ==========================================================================
  // OPTIMIZATION ACTIONS
  // ==========================================================================

  const applyOptimization = useCallback((optimizationId: string): void => {
    const optimization = optimizations.find(o => o.id === optimizationId);
    if (!optimization || !optimization.suggestedContent || !result) return;

    const { currentContent, suggestedContent } = optimization;
    if (!currentContent) return;

    const newContent = content.replace(currentContent, suggestedContent);
    setContent(newContent);

    // Re-analyze with new content
    analyze(newContent, settings.targetQuery);
  }, [optimizations, result, content, settings.targetQuery, analyze]);

  const dismissOptimization = useCallback((optimizationId: string): void => {
    setDismissedOptimizations(prev => new Set(prev).add(optimizationId));
  }, []);

  // ==========================================================================
  // EXPORT
  // ==========================================================================

  const exportReport = useCallback((exportOptions: SnippetExportOptions): string => {
    if (!result) return '';
    return exportSnippetReport(result, exportOptions);
  }, [result]);

  // ==========================================================================
  // SETTINGS
  // ==========================================================================

  const updateSettings = useCallback((newSettings: Partial<SnippetOptimizerSettings>): void => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  // ==========================================================================
  // RETURN
  // ==========================================================================

  return {
    result,
    isAnalyzing,
    error,

    metrics,
    candidates,
    issues,
    optimizations,
    recommendations,

    analyze,
    reanalyze,

    getCandidatesByType,
    getCandidatesByQuality,

    optimizeCandidate,
    getOptimizedContent,

    filterIssues,
    filterOptimizations,

    applyOptimization,
    dismissOptimization,

    exportReport,

    settings,
    updateSettings
  };
}

export default useSnippetOptimizer;

