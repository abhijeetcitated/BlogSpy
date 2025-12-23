/**
 * Plagiarism Checker Hook
 * 
 * React hook for plagiarism detection and analysis
 */

'use client';

import { useState, useCallback, useMemo } from 'react';
import {
  PlagiarismAnalysis,
  PlagiarismMetrics,
  PlagiarismMatch,
  PlagiarismSummary,
  PlagiarismRecommendation,
  PlagiarismSettings,
  PlagiarismFilterState,
  PlagiarismSortOption,
  MatchedSource,
  DocumentHighlight,
  ComparisonResult,
  UsePlagiarismOptions,
  UsePlagiarismReturn,
  DEFAULT_PLAGIARISM_SETTINGS,
  DEFAULT_FILTER_STATE
} from '@/src/features/ai-writer/types/tools/plagiarism.types';
import {
  analyzePlagiarism,
  exportPlagiarismReport,
  createHighlightedDocument,
  compareTexts as compareTextsUtil
} from '@/src/features/ai-writer/utils/tools/plagiarism';

export function usePlagiarism(
  options: UsePlagiarismOptions = {}
): UsePlagiarismReturn {
  const {
    settings: initialSettings,
    autoScan = false,
    onScanComplete,
    onError
  } = options;
  
  // State
  const [analysis, setAnalysis] = useState<PlagiarismAnalysis | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [settings, setSettings] = useState<PlagiarismSettings>({
    ...DEFAULT_PLAGIARISM_SETTINGS,
    ...initialSettings
  });
  const [excludedMatches, setExcludedMatches] = useState<Set<string>>(new Set());
  const [lastContent, setLastContent] = useState<string>('');
  
  // Derived state
  const metrics = useMemo(() => analysis?.metrics ?? null, [analysis]);
  
  const matches = useMemo(() => {
    if (!analysis) return [];
    return analysis.matches.filter(m => !excludedMatches.has(m.id));
  }, [analysis, excludedMatches]);
  
  const sources = useMemo(() => analysis?.sources ?? [], [analysis]);
  
  const recommendations = useMemo(() => analysis?.recommendations ?? [], [analysis]);
  
  const summary = useMemo(() => analysis?.summary ?? null, [analysis]);
  
  // Scan content
  const scan = useCallback(async (content: string) => {
    if (!content.trim()) {
      setError(new Error('No content to scan'));
      return;
    }
    
    setIsScanning(true);
    setError(null);
    setLastContent(content);
    
    try {
      // Simulate async operation (real API would be async)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const result = analyzePlagiarism(content, settings);
      setAnalysis(result);
      setExcludedMatches(new Set());
      
      onScanComplete?.(result);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Scan failed');
      setError(error);
      onError?.(error);
    } finally {
      setIsScanning(false);
    }
  }, [settings, onScanComplete, onError]);
  
  // Rescan with same content
  const rescan = useCallback(async () => {
    if (lastContent) {
      await scan(lastContent);
    }
  }, [lastContent, scan]);
  
  // Exclude match
  const excludeMatch = useCallback((matchId: string) => {
    setExcludedMatches(prev => new Set([...prev, matchId]));
  }, []);
  
  // Include match
  const includeMatch = useCallback((matchId: string) => {
    setExcludedMatches(prev => {
      const next = new Set(prev);
      next.delete(matchId);
      return next;
    });
  }, []);
  
  // Filter matches
  const filterMatches = useCallback((
    filter: Partial<PlagiarismFilterState>
  ): PlagiarismMatch[] => {
    const state: PlagiarismFilterState = { ...DEFAULT_FILTER_STATE, ...filter };
    
    return matches.filter(match => {
      // Search
      if (state.search) {
        const search = state.search.toLowerCase();
        if (!match.originalText.toLowerCase().includes(search) &&
            !match.source.domain.toLowerCase().includes(search)) {
          return false;
        }
      }
      
      // Severity
      if (state.severity !== 'all' && match.severity !== state.severity) {
        return false;
      }
      
      // Match type
      if (state.matchType !== 'all' && match.matchType !== state.matchType) {
        return false;
      }
      
      // Source type
      if (state.sourceType !== 'all' && match.source.sourceType !== state.sourceType) {
        return false;
      }
      
      // Min similarity
      if (match.similarity < state.minSimilarity) {
        return false;
      }
      
      // Quoted/Cited filters
      if (!state.showQuoted && match.isQuoted) {
        return false;
      }
      
      if (!state.showCited && match.hasCitation) {
        return false;
      }
      
      // Excluded
      if (!state.showExcluded && excludedMatches.has(match.id)) {
        return false;
      }
      
      return true;
    });
  }, [matches, excludedMatches]);
  
  // Sort matches
  const sortMatches = useCallback((
    matchList: PlagiarismMatch[],
    sortBy: PlagiarismSortOption
  ): PlagiarismMatch[] => {
    const sorted = [...matchList];
    
    switch (sortBy) {
      case 'severity':
        const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        sorted.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
        break;
        
      case 'similarity':
        sorted.sort((a, b) => b.similarity - a.similarity);
        break;
        
      case 'wordCount':
        sorted.sort((a, b) => b.wordCount - a.wordCount);
        break;
        
      case 'position':
        sorted.sort((a, b) => a.startIndex - b.startIndex);
        break;
        
      case 'source':
        sorted.sort((a, b) => a.source.domain.localeCompare(b.source.domain));
        break;
        
      case 'type':
        const typeOrder = { exact: 0, paraphrased: 1, similar: 2, common_phrase: 3 };
        sorted.sort((a, b) => typeOrder[a.matchType] - typeOrder[b.matchType]);
        break;
    }
    
    return sorted;
  }, []);
  
  // Export report
  const exportReport = useCallback((
    format: 'markdown' | 'html' | 'json' | 'txt'
  ): string | null => {
    if (!analysis) return null;
    return exportPlagiarismReport(analysis, format);
  }, [analysis]);
  
  // Get highlighted content
  const getHighlightedContent = useCallback((): DocumentHighlight | null => {
    if (!analysis) return null;
    return createHighlightedDocument(analysis.content, matches);
  }, [analysis, matches]);
  
  // Compare texts
  const compareTexts = useCallback((
    text1: string,
    text2: string
  ): ComparisonResult => {
    return compareTextsUtil(text1, text2);
  }, []);
  
  // Update settings
  const updateSettings = useCallback((
    newSettings: Partial<PlagiarismSettings>
  ) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);
  
  return {
    analysis,
    isScanning,
    error,
    metrics,
    matches,
    sources,
    recommendations,
    summary,
    scan,
    rescan,
    excludeMatch,
    includeMatch,
    filterMatches,
    sortMatches,
    exportReport,
    getHighlightedContent,
    compareTexts,
    settings,
    updateSettings
  };
}

export default usePlagiarism;

