'use client';

// =============================================================================
// AUTO-OPTIMIZE HOOK - Production Level
// =============================================================================
// State management for one-click content optimization
// =============================================================================

import { useState, useCallback, useMemo, useEffect } from 'react';
import {
  OptimizationAnalysis,
  OptimizationAction,
  OptimizationSettings,
  OptimizationCategory,
  OptimizationPriority,
  DEFAULT_OPTIMIZATION_SETTINGS
} from '@/src/features/ai-writer/types/tools/auto-optimize.types';
import {
  analyzeForOptimization,
  applyOptimizationAction,
  applyBatchOptimizations,
  exportOptimizationReport
} from '@/src/features/ai-writer/utils/tools/auto-optimize';

// =============================================================================
// HOOK INTERFACE
// =============================================================================

interface UseAutoOptimizeReturn {
  // Analysis state
  analysis: OptimizationAnalysis | null;
  isAnalyzing: boolean;
  error: string | null;
  
  // Batch processing
  isBatchRunning: boolean;
  batchProgress: number;
  
  // Selection state
  selectedActions: Set<string>;
  appliedActions: Set<string>;
  skippedActions: Set<string>;
  
  // Settings
  settings: OptimizationSettings;
  
  // Computed values
  overallScore: number;
  projectedScore: number;
  totalActions: number;
  pendingActions: number;
  criticalCount: number;
  highCount: number;
  actionsByCategory: Record<OptimizationCategory, OptimizationAction[]>;
  filteredActions: OptimizationAction[];
  
  // Actions
  analyze: () => Promise<void>;
  applyAction: (action: OptimizationAction) => Promise<boolean>;
  applySelected: () => Promise<void>;
  applyAll: () => Promise<void>;
  skipAction: (actionId: string) => void;
  selectAction: (actionId: string) => void;
  deselectAction: (actionId: string) => void;
  selectAll: () => void;
  deselectAll: () => void;
  updateSettings: (updates: Partial<OptimizationSettings>) => void;
  exportReport: () => void;
  clearAnalysis: () => void;
  undoLastAction: () => void;
}

// =============================================================================
// HOOK IMPLEMENTATION
// =============================================================================

export function useAutoOptimize(
  content: string,
  onContentChange: (content: string) => void
): UseAutoOptimizeReturn {
  // Analysis state
  const [analysis, setAnalysis] = useState<OptimizationAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Batch processing state
  const [isBatchRunning, setIsBatchRunning] = useState(false);
  const [batchProgress, setBatchProgress] = useState(0);
  
  // Selection state
  const [selectedActions, setSelectedActions] = useState<Set<string>>(new Set());
  const [appliedActions, setAppliedActions] = useState<Set<string>>(new Set());
  const [skippedActions, setSkippedActions] = useState<Set<string>>(new Set());
  
  // Settings
  const [settings, setSettings] = useState<OptimizationSettings>(DEFAULT_OPTIMIZATION_SETTINGS);
  
  // History for undo
  const [contentHistory, setContentHistory] = useState<string[]>([]);

  // =============================================================================
  // COMPUTED VALUES
  // =============================================================================

  const overallScore = useMemo(() => {
    return analysis?.scoreBefore.overall || 0;
  }, [analysis]);

  const projectedScore = useMemo(() => {
    return analysis?.scoreAfter.overall || 0;
  }, [analysis]);

  const totalActions = useMemo(() => {
    if (!analysis) return 0;
    return analysis.actions.filter(
      a => !appliedActions.has(a.id) && !skippedActions.has(a.id)
    ).length;
  }, [analysis, appliedActions, skippedActions]);

  const pendingActions = useMemo(() => {
    if (!analysis) return 0;
    return analysis.actions.filter(
      a => a.status === 'pending' && !appliedActions.has(a.id) && !skippedActions.has(a.id)
    ).length;
  }, [analysis, appliedActions, skippedActions]);

  const criticalCount = useMemo(() => {
    if (!analysis) return 0;
    return analysis.actions.filter(
      a => a.priority === 'critical' && !appliedActions.has(a.id) && !skippedActions.has(a.id)
    ).length;
  }, [analysis, appliedActions, skippedActions]);

  const highCount = useMemo(() => {
    if (!analysis) return 0;
    return analysis.actions.filter(
      a => a.priority === 'high' && !appliedActions.has(a.id) && !skippedActions.has(a.id)
    ).length;
  }, [analysis, appliedActions, skippedActions]);

  const actionsByCategory = useMemo(() => {
    const grouped: Record<OptimizationCategory, OptimizationAction[]> = {
      'readability': [],
      'seo': [],
      'engagement': [],
      'structure': [],
      'grammar': [],
      'style': [],
      'accessibility': []
    };

    if (!analysis) return grouped;

    for (const action of analysis.actions) {
      if (!appliedActions.has(action.id) && !skippedActions.has(action.id)) {
        grouped[action.category].push(action);
      }
    }

    return grouped;
  }, [analysis, appliedActions, skippedActions]);

  const filteredActions = useMemo(() => {
    if (!analysis) return [];
    return analysis.actions.filter(
      a => !appliedActions.has(a.id) && !skippedActions.has(a.id)
    );
  }, [analysis, appliedActions, skippedActions]);

  // =============================================================================
  // ANALYSIS
  // =============================================================================

  const analyze = useCallback(async () => {
    if (!content) {
      setError('No content to analyze');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      // Simulate async analysis (in production, this might call an API)
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const result = analyzeForOptimization(content, settings);
      setAnalysis(result);
      
      // Reset selection state
      setSelectedActions(new Set());
      setAppliedActions(new Set());
      setSkippedActions(new Set());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  }, [content, settings]);

  // =============================================================================
  // ACTION APPLICATION
  // =============================================================================

  const applyAction = useCallback(async (action: OptimizationAction): Promise<boolean> => {
    if (!analysis) return false;

    try {
      // Save current content for undo
      setContentHistory(prev => [...prev.slice(-10), content]);

      const result = applyOptimizationAction(content, action);
      
      if (result.success) {
        onContentChange(result.newContent);
        setAppliedActions(prev => new Set([...prev, action.id]));
        setSelectedActions(prev => {
          const next = new Set(prev);
          next.delete(action.id);
          return next;
        });
        return true;
      } else {
        setError(result.error || 'Failed to apply action');
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to apply action');
      return false;
    }
  }, [analysis, content, onContentChange]);

  const applySelected = useCallback(async () => {
    if (!analysis || selectedActions.size === 0) return;

    setIsBatchRunning(true);
    setBatchProgress(0);

    const actionsToApply = analysis.actions.filter(a => selectedActions.has(a.id));
    let currentContent = content;
    const total = actionsToApply.length;
    const applied: string[] = [];

    // Save for undo
    setContentHistory(prev => [...prev.slice(-10), content]);

    for (let i = 0; i < actionsToApply.length; i++) {
      const action = actionsToApply[i];
      const result = applyOptimizationAction(currentContent, action);
      
      if (result.success) {
        currentContent = result.newContent;
        applied.push(action.id);
      }
      
      setBatchProgress(((i + 1) / total) * 100);
      // Small delay to prevent UI freeze
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    onContentChange(currentContent);
    setAppliedActions(prev => new Set([...prev, ...applied]));
    setSelectedActions(new Set());
    setIsBatchRunning(false);
  }, [analysis, selectedActions, content, onContentChange]);

  const applyAll = useCallback(async () => {
    if (!analysis) return;

    const allPendingIds = analysis.actions
      .filter(a => !appliedActions.has(a.id) && !skippedActions.has(a.id))
      .map(a => a.id);
    
    setSelectedActions(new Set(allPendingIds));
    
    // Use setTimeout to let state update before running batch
    setTimeout(() => {
      applySelected();
    }, 0);
  }, [analysis, appliedActions, skippedActions, applySelected]);

  // =============================================================================
  // SELECTION MANAGEMENT
  // =============================================================================

  const skipAction = useCallback((actionId: string) => {
    setSkippedActions(prev => new Set([...prev, actionId]));
    setSelectedActions(prev => {
      const next = new Set(prev);
      next.delete(actionId);
      return next;
    });
  }, []);

  const selectAction = useCallback((actionId: string) => {
    setSelectedActions(prev => new Set([...prev, actionId]));
  }, []);

  const deselectAction = useCallback((actionId: string) => {
    setSelectedActions(prev => {
      const next = new Set(prev);
      next.delete(actionId);
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    if (!analysis) return;
    
    const allPendingIds = analysis.actions
      .filter(a => !appliedActions.has(a.id) && !skippedActions.has(a.id))
      .map(a => a.id);
    
    setSelectedActions(new Set(allPendingIds));
  }, [analysis, appliedActions, skippedActions]);

  const deselectAll = useCallback(() => {
    setSelectedActions(new Set());
  }, []);

  // =============================================================================
  // SETTINGS
  // =============================================================================

  const updateSettings = useCallback((updates: Partial<OptimizationSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  }, []);

  // =============================================================================
  // EXPORT
  // =============================================================================

  const exportReport = useCallback(() => {
    if (!analysis) return;

    const report = exportOptimizationReport(analysis);
    
    // Create and download file
    const blob = new Blob([report], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `optimization-report-${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [analysis]);

  // =============================================================================
  // UTILITIES
  // =============================================================================

  const clearAnalysis = useCallback(() => {
    setAnalysis(null);
    setSelectedActions(new Set());
    setAppliedActions(new Set());
    setSkippedActions(new Set());
    setError(null);
  }, []);

  const undoLastAction = useCallback(() => {
    if (contentHistory.length === 0) return;

    const previousContent = contentHistory[contentHistory.length - 1];
    setContentHistory(prev => prev.slice(0, -1));
    onContentChange(previousContent);
    
    // Remove last applied action
    setAppliedActions(prev => {
      const arr = Array.from(prev);
      if (arr.length > 0) {
        arr.pop();
        return new Set(arr);
      }
      return prev;
    });
  }, [contentHistory, onContentChange]);

  // =============================================================================
  // AUTO-ANALYZE ON SETTINGS CHANGE (debounced)
  // =============================================================================

  useEffect(() => {
    // Re-analyze when settings change (if we already have an analysis)
    if (analysis && content) {
      const timeout = setTimeout(() => {
        analyze();
      }, 1000);
      return () => clearTimeout(timeout);
    }
  }, [settings]); // Only depend on settings, not analyze function

  // =============================================================================
  // RETURN
  // =============================================================================

  return {
    // Analysis state
    analysis,
    isAnalyzing,
    error,
    
    // Batch processing
    isBatchRunning,
    batchProgress,
    
    // Selection state
    selectedActions,
    appliedActions,
    skippedActions,
    
    // Settings
    settings,
    
    // Computed values
    overallScore,
    projectedScore,
    totalActions,
    pendingActions,
    criticalCount,
    highCount,
    actionsByCategory,
    filteredActions,
    
    // Actions
    analyze,
    applyAction,
    applySelected,
    applyAll,
    skipAction,
    selectAction,
    deselectAction,
    selectAll,
    deselectAll,
    updateSettings,
    exportReport,
    clearAnalysis,
    undoLastAction
  };
}

export default useAutoOptimize;

