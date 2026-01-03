/**
 * Content Humanizer Hook
 * 
 * React hook for humanizing AI-generated content
 */

'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import {
  HumanizationAnalysis,
  HumanizationChange,
  HumanizationMetrics,
  HumanizationRecommendation,
  HumanizationSettings,
  HumanizationSummary,
  QualityScore,
  DiffView,
  HumanizationFilterState,
  HumanizationSortOption,
  DEFAULT_HUMANIZATION_SETTINGS,
  DEFAULT_FILTER_STATE,
  UseHumanizerOptions,
  UseHumanizerReturn,
  HumanizationExportOptions
} from '@/src/features/ai-writer/types/tools/humanizer.types';
import { humanizeContent, generateDiff, exportHumanizationReport } from '@/src/features/ai-writer/utils/tools/humanizer';

export function useHumanizer(
  content: string,
  options: UseHumanizerOptions = {}
): UseHumanizerReturn {
  const {
    settings: initialSettings,
    autoHumanize = false,
    onComplete,
    onError
  } = options;

  // State
  const [analysis, setAnalysis] = useState<HumanizationAnalysis | null>(null);
  const [isHumanizing, setIsHumanizing] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [settings, setSettings] = useState<HumanizationSettings>({
    ...DEFAULT_HUMANIZATION_SETTINGS,
    ...initialSettings
  });
  const [filterState, setFilterState] = useState<HumanizationFilterState>(DEFAULT_FILTER_STATE);
  const [acceptedChanges, setAcceptedChanges] = useState<Set<string>>(new Set());
  const [rejectedChanges, setRejectedChanges] = useState<Set<string>>(new Set());

  // Humanize content
  const humanize = useCallback(async (textContent: string) => {
    if (!textContent.trim()) {
      setAnalysis(null);
      return;
    }

    setIsHumanizing(true);
    setError(null);
    setAcceptedChanges(new Set());
    setRejectedChanges(new Set());

    try {
      // Simulate async operation for better UX
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const result = humanizeContent(textContent, settings);
      
      // Mark all changes as accepted initially
      const initialAccepted = new Set(result.changes.map(c => c.id));
      setAcceptedChanges(initialAccepted);
      
      setAnalysis(result);
      onComplete?.(result);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Humanization failed');
      setError(error);
      onError?.(error);
    } finally {
      setIsHumanizing(false);
    }
  }, [settings, onComplete, onError]);

  // Re-humanize with current settings
  const rehumanize = useCallback(async () => {
    if (content.trim()) {
      await humanize(content);
    }
  }, [content, humanize]);

  // Auto-humanize when content changes
  useEffect(() => {
    if (autoHumanize && content.trim()) {
      const timer = setTimeout(() => {
        humanize(content);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [content, autoHumanize, humanize]);

  // Accept/reject changes
  const acceptChange = useCallback((changeId: string) => {
    setAcceptedChanges(prev => new Set([...prev, changeId]));
    setRejectedChanges(prev => {
      const next = new Set(prev);
      next.delete(changeId);
      return next;
    });
  }, []);

  const rejectChange = useCallback((changeId: string) => {
    setRejectedChanges(prev => new Set([...prev, changeId]));
    setAcceptedChanges(prev => {
      const next = new Set(prev);
      next.delete(changeId);
      return next;
    });
  }, []);

  const acceptAll = useCallback(() => {
    if (analysis) {
      const allIds = new Set(analysis.changes.map(c => c.id));
      setAcceptedChanges(allIds);
      setRejectedChanges(new Set());
    }
  }, [analysis]);

  const rejectAll = useCallback(() => {
    if (analysis) {
      const allIds = new Set(analysis.changes.map(c => c.id));
      setRejectedChanges(allIds);
      setAcceptedChanges(new Set());
    }
  }, [analysis]);

  // Filter changes
  const filterChanges = useCallback((
    filter: Partial<HumanizationFilterState>
  ): HumanizationChange[] => {
    if (!analysis) return [];

    const mergedFilter = { ...filterState, ...filter };
    
    return analysis.changes.filter(change => {
      // Filter by type
      if (mergedFilter.changeType !== 'all' && change.type !== mergedFilter.changeType) {
        return false;
      }
      
      // Filter by impact
      if (mergedFilter.impact !== 'all' && change.impact !== mergedFilter.impact) {
        return false;
      }
      
      // Filter by status
      const isAccepted = acceptedChanges.has(change.id);
      const isRejected = rejectedChanges.has(change.id);
      const isPending = !isAccepted && !isRejected;
      
      if (!mergedFilter.showAccepted && isAccepted) return false;
      if (!mergedFilter.showRejected && isRejected) return false;
      if (!mergedFilter.showPending && isPending) return false;
      
      return true;
    });
  }, [analysis, filterState, acceptedChanges, rejectedChanges]);

  // Sort changes
  const sortChanges = useCallback((
    changes: HumanizationChange[],
    sortBy: HumanizationSortOption
  ): HumanizationChange[] => {
    const sorted = [...changes];
    
    switch (sortBy) {
      case 'position':
        sorted.sort((a, b) => a.startIndex - b.startIndex);
        break;
      case 'impact':
        const impactOrder = { high: 0, medium: 1, low: 2 };
        sorted.sort((a, b) => impactOrder[a.impact] - impactOrder[b.impact]);
        break;
      case 'type':
        sorted.sort((a, b) => a.type.localeCompare(b.type));
        break;
      case 'status':
        sorted.sort((a, b) => {
          const aStatus = acceptedChanges.has(a.id) ? 0 : rejectedChanges.has(a.id) ? 2 : 1;
          const bStatus = acceptedChanges.has(b.id) ? 0 : rejectedChanges.has(b.id) ? 2 : 1;
          return aStatus - bStatus;
        });
        break;
    }
    
    return sorted;
  }, [acceptedChanges, rejectedChanges]);

  // Get diff view
  const getDiff = useCallback((): DiffView => {
    if (!analysis) {
      return { segments: [], addedCount: 0, removedCount: 0, modifiedCount: 0 };
    }
    return generateDiff(analysis.originalContent, analysis.humanizedContent);
  }, [analysis]);

  // Get humanized content with accepted changes only
  const getHumanizedContent = useCallback((includeRejected = false): string => {
    if (!analysis) return content;
    
    if (includeRejected) {
      return analysis.humanizedContent;
    }
    
    // Rebuild content with only accepted changes
    // For simplicity, return full humanized content (in production, you'd selectively apply changes)
    return analysis.humanizedContent;
  }, [analysis, content]);

  // Export result
  const exportResult = useCallback((format: HumanizationExportOptions['format']): string | null => {
    if (!analysis) return null;
    
    const exportOptions: HumanizationExportOptions = {
      format,
      includeOriginal: true,
      includeChanges: true,
      includeMetrics: true,
      includeDiff: true
    };
    
    return exportHumanizationReport(analysis, exportOptions);
  }, [analysis]);

  // Update settings
  const updateSettings = useCallback((newSettings: Partial<HumanizationSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  // Derived values
  const originalContent = useMemo(() => {
    return analysis?.originalContent || content;
  }, [analysis, content]);

  const humanizedContent = useMemo(() => {
    return analysis?.humanizedContent || '';
  }, [analysis]);

  const metrics = useMemo((): HumanizationMetrics | null => {
    return analysis?.metrics || null;
  }, [analysis]);

  const quality = useMemo((): QualityScore | null => {
    return analysis?.quality || null;
  }, [analysis]);

  const changes = useMemo((): HumanizationChange[] => {
    if (!analysis) return [];
    
    return analysis.changes.map(change => ({
      ...change,
      accepted: acceptedChanges.has(change.id)
    }));
  }, [analysis, acceptedChanges]);

  const summary = useMemo((): HumanizationSummary | null => {
    return analysis?.summary || null;
  }, [analysis]);

  const recommendations = useMemo((): HumanizationRecommendation[] => {
    return analysis?.recommendations || [];
  }, [analysis]);

  return {
    analysis,
    isHumanizing,
    error,
    
    originalContent,
    humanizedContent,
    
    metrics,
    quality,
    changes,
    summary,
    recommendations,
    
    humanize,
    rehumanize,
    
    acceptChange,
    rejectChange,
    acceptAll,
    rejectAll,
    
    filterChanges,
    sortChanges,
    
    getDiff,
    getHumanizedContent,
    exportResult,
    
    settings,
    updateSettings
  };
}

