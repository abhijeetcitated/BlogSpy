/**
 * AI Content Detector Hook
 * 
 * React hook for AI-generated content detection
 */

'use client';

import { useState, useCallback, useMemo } from 'react';
import {
  AIDetectionAnalysis,
  AIDetectionMetrics,
  AIDetectionSummary,
  AIDetectionRecommendation,
  AIDetectionSettings,
  SectionAnalysis,
  AIIndicator,
  AIDetectionFilterState,
  AIDetectionSortOption,
  HighlightedSection,
  UseAIDetectorOptions,
  UseAIDetectorReturn,
  DEFAULT_AI_DETECTION_SETTINGS,
  DEFAULT_FILTER_STATE
} from '@/src/features/ai-writer/types/tools/ai-detector.types';
import {
  analyzeAIContent,
  exportAIDetectionReport,
  getHighlightedSections
} from '@/src/features/ai-writer/utils/tools/ai-detector';

export function useAIDetector(
  options: UseAIDetectorOptions = {}
): UseAIDetectorReturn {
  const {
    settings: initialSettings,
    autoAnalyze = false,
    onAnalysisComplete,
    onError
  } = options;
  
  // State
  const [analysis, setAnalysis] = useState<AIDetectionAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [settings, setSettings] = useState<AIDetectionSettings>({
    ...DEFAULT_AI_DETECTION_SETTINGS,
    ...initialSettings
  });
  const [lastContent, setLastContent] = useState<string>('');
  
  // Derived state
  const metrics = useMemo(() => analysis?.metrics ?? null, [analysis]);
  const sections = useMemo(() => analysis?.sections ?? [], [analysis]);
  const indicators = useMemo(() => analysis?.indicators ?? [], [analysis]);
  const recommendations = useMemo(() => analysis?.recommendations ?? [], [analysis]);
  const summary = useMemo(() => analysis?.summary ?? null, [analysis]);
  
  // Analyze content
  const analyze = useCallback(async (content: string) => {
    if (!content.trim()) {
      setError(new Error('No content to analyze'));
      return;
    }
    
    setIsAnalyzing(true);
    setError(null);
    setLastContent(content);
    
    try {
      // Simulate async processing
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const result = analyzeAIContent(content, settings);
      setAnalysis(result);
      
      onAnalysisComplete?.(result);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Analysis failed');
      setError(error);
      onError?.(error);
    } finally {
      setIsAnalyzing(false);
    }
  }, [settings, onAnalysisComplete, onError]);
  
  // Reanalyze with same content
  const reanalyze = useCallback(async () => {
    if (lastContent) {
      await analyze(lastContent);
    }
  }, [lastContent, analyze]);
  
  // Filter sections
  const filterSections = useCallback((
    filter: Partial<AIDetectionFilterState>
  ): SectionAnalysis[] => {
    const state: AIDetectionFilterState = { ...DEFAULT_FILTER_STATE, ...filter };
    
    return sections.filter(section => {
      // Search
      if (state.search) {
        const search = state.search.toLowerCase();
        if (!section.text.toLowerCase().includes(search)) {
          return false;
        }
      }
      
      // Result
      if (state.result !== 'all' && section.result !== state.result) {
        return false;
      }
      
      // Confidence
      if (state.confidence !== 'all' && section.confidence !== state.confidence) {
        return false;
      }
      
      // Pattern
      if (state.pattern !== 'all' && !section.patterns.includes(state.pattern)) {
        return false;
      }
      
      // AI score range
      if (section.aiScore < state.minAIScore || section.aiScore > state.maxAIScore) {
        return false;
      }
      
      return true;
    });
  }, [sections]);
  
  // Sort sections
  const sortSections = useCallback((
    sectionList: SectionAnalysis[],
    sortBy: AIDetectionSortOption
  ): SectionAnalysis[] => {
    const sorted = [...sectionList];
    
    switch (sortBy) {
      case 'aiScore':
        sorted.sort((a, b) => b.aiScore - a.aiScore);
        break;
        
      case 'humanScore':
        sorted.sort((a, b) => b.humanScore - a.humanScore);
        break;
        
      case 'confidence':
        const confOrder = { high: 0, medium: 1, low: 2, very_low: 3 };
        sorted.sort((a, b) => confOrder[a.confidence] - confOrder[b.confidence]);
        break;
        
      case 'position':
        sorted.sort((a, b) => a.startIndex - b.startIndex);
        break;
        
      case 'wordCount':
        sorted.sort((a, b) => b.wordCount - a.wordCount);
        break;
    }
    
    return sorted;
  }, []);
  
  // Get highlighted content
  const getHighlightedContent = useCallback((): HighlightedSection[] => {
    if (!analysis) return [];
    return getHighlightedSections(analysis.content, sections);
  }, [analysis, sections]);
  
  // Export report
  const exportReport = useCallback((
    format: 'markdown' | 'html' | 'json'
  ): string | null => {
    if (!analysis) return null;
    return exportAIDetectionReport(analysis, format);
  }, [analysis]);
  
  // Update settings
  const updateSettings = useCallback((
    newSettings: Partial<AIDetectionSettings>
  ) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);
  
  return {
    analysis,
    isAnalyzing,
    error,
    metrics,
    sections,
    indicators,
    recommendations,
    summary,
    analyze,
    reanalyze,
    filterSections,
    sortSections,
    getHighlightedContent,
    exportReport,
    settings,
    updateSettings
  };
}

export default useAIDetector;

