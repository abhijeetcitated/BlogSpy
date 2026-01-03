'use client';

// =============================================================================
// USE READABILITY HOOK - Production Level
// State management for readability analysis
// =============================================================================

import { useState, useCallback, useMemo, useEffect } from 'react';
import {
  ReadabilityAnalysis,
  ReadabilityState,
  ReadabilityConfig,
  ReadabilityTab,
  TargetAudience,
  ContentTypeStandard,
  HighlightType,
  ReadabilityHighlight,
  ReadabilityIssue,
  ReadabilityRecommendation,
  DEFAULT_READABILITY_CONFIG
} from '@/src/features/ai-writer/types/tools/readability.types';
import {
  analyzeReadability,
  extractPlainText,
  generateHighlights,
  exportReadabilityReport
} from '@/src/features/ai-writer/utils/tools/readability';

// =============================================================================
// HOOK INTERFACE
// =============================================================================

interface UseReadabilityOptions {
  autoAnalyze?: boolean;
  debounceMs?: number;
  initialConfig?: Partial<ReadabilityConfig>;
}

interface UseReadabilityReturn {
  // Analysis Results
  analysis: ReadabilityAnalysis | null;
  isAnalyzing: boolean;
  error: string | null;
  
  // Scores (shortcuts)
  overallScore: number;
  fleschScore: number;
  gradeLevel: number;
  readingTime: { minutes: number; seconds: number };
  
  // Issues & Recommendations
  issues: ReadabilityIssue[];
  criticalIssues: ReadabilityIssue[];
  recommendations: ReadabilityRecommendation[];
  
  // Highlights
  highlights: ReadabilityHighlight[];
  highlightsEnabled: boolean;
  enabledHighlightTypes: Set<HighlightType>;
  
  // Configuration
  config: ReadabilityConfig;
  targetAudience: TargetAudience;
  contentType: ContentTypeStandard;
  
  // UI State
  activeTab: ReadabilityTab;
  expandedSections: Set<string>;
  
  // Actions
  analyze: (content: string) => void;
  setTargetAudience: (audience: TargetAudience) => void;
  setContentType: (type: ContentTypeStandard) => void;
  setActiveTab: (tab: ReadabilityTab) => void;
  toggleSection: (section: string) => void;
  toggleHighlights: (enabled: boolean) => void;
  toggleHighlightType: (type: HighlightType) => void;
  exportReport: () => string | null;
  clearAnalysis: () => void;
  
  // Comparison helpers
  isOnTarget: boolean;
  targetDifference: number;
  industryComparison: 'above' | 'below' | 'average' | null;
}

// =============================================================================
// HOOK IMPLEMENTATION
// =============================================================================

export function useReadability(options: UseReadabilityOptions = {}): UseReadabilityReturn {
  const {
    autoAnalyze = true,
    debounceMs = 500,
    initialConfig = {}
  } = options;
  
  // State
  const [analysis, setAnalysis] = useState<ReadabilityAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastContent, setLastContent] = useState<string>('');
  
  // Configuration state
  const [config, setConfig] = useState<ReadabilityConfig>({
    ...DEFAULT_READABILITY_CONFIG,
    ...initialConfig
  });
  
  // UI state
  const [activeTab, setActiveTab] = useState<ReadabilityTab>('overview');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['scores']));
  const [highlightsEnabled, setHighlightsEnabled] = useState(false);
  const [enabledHighlightTypes, setEnabledHighlightTypes] = useState<Set<HighlightType>>(
    new Set(['long-sentence', 'complex-word', 'passive-voice', 'adverb'])
  );
  
  // Debounce timer ref
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);
  
  // Main analysis function
  const analyze = useCallback((content: string) => {
    // Clear previous timer
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    
    // Check minimum content length
    if (!content || content.length < 50) {
      setAnalysis(null);
      setError(null);
      return;
    }
    
    // Skip if content hasn't changed
    const plainContent = extractPlainText(content);
    if (plainContent === lastContent && analysis) {
      return;
    }
    
    setIsAnalyzing(true);
    setError(null);
    
    // Debounce the analysis
    const timer = setTimeout(() => {
      try {
        const result = analyzeReadability(content, config);
        setAnalysis(result);
        setLastContent(plainContent);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Analysis failed');
        setAnalysis(null);
      } finally {
        setIsAnalyzing(false);
      }
    }, debounceMs);
    
    setDebounceTimer(timer);
  }, [config, debounceMs, lastContent, analysis, debounceTimer]);
  
  // Configuration setters
  const setTargetAudience = useCallback((audience: TargetAudience) => {
    setConfig(prev => ({ ...prev, targetAudience: audience }));
  }, []);
  
  const setContentType = useCallback((type: ContentTypeStandard) => {
    setConfig(prev => ({ ...prev, contentType: type }));
  }, []);
  
  // UI toggles
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
  
  const toggleHighlights = useCallback((enabled: boolean) => {
    setHighlightsEnabled(enabled);
    setConfig(prev => ({ ...prev, enableHighlighting: enabled }));
  }, []);
  
  const toggleHighlightType = useCallback((type: HighlightType) => {
    setEnabledHighlightTypes(prev => {
      const next = new Set(prev);
      if (next.has(type)) {
        next.delete(type);
      } else {
        next.add(type);
      }
      setConfig(prevConfig => ({ 
        ...prevConfig, 
        highlightTypes: Array.from(next) 
      }));
      return next;
    });
  }, []);
  
  // Export function
  const exportReport = useCallback((): string | null => {
    if (!analysis) return null;
    return exportReadabilityReport(analysis);
  }, [analysis]);
  
  // Clear function
  const clearAnalysis = useCallback(() => {
    setAnalysis(null);
    setError(null);
    setLastContent('');
  }, []);
  
  // Generate highlights
  const highlights = useMemo(() => {
    if (!highlightsEnabled || !lastContent) return [];
    return generateHighlights(lastContent, Array.from(enabledHighlightTypes));
  }, [highlightsEnabled, lastContent, enabledHighlightTypes]);
  
  // Computed values
  const overallScore = analysis?.overallScore ?? 0;
  const fleschScore = analysis?.fleschReadingEase.score ?? 0;
  const gradeLevel = analysis?.averageGradeLevel ?? 0;
  const readingTime = analysis?.readingTime ?? { minutes: 0, seconds: 0 };
  
  const issues = analysis?.issues ?? [];
  const criticalIssues = issues.filter(i => i.severity === 'critical');
  const recommendations = analysis?.recommendations ?? [];
  
  const isOnTarget = analysis?.targetComparison.isOnTarget ?? true;
  const targetDifference = analysis?.targetComparison.difference ?? 0;
  const industryComparison = analysis?.industryBenchmark.comparison ?? null;
  
  // Re-analyze when config changes
  useEffect(() => {
    if (autoAnalyze && lastContent) {
      const plainText = extractPlainText(lastContent);
      if (plainText.length >= 50) {
        try {
          const result = analyzeReadability(lastContent, config);
          setAnalysis(result);
        } catch (err) {
          // Silent error on re-analysis
        }
      }
    }
  }, [config, autoAnalyze, lastContent]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [debounceTimer]);
  
  return {
    // Analysis Results
    analysis,
    isAnalyzing,
    error,
    
    // Scores
    overallScore,
    fleschScore,
    gradeLevel,
    readingTime,
    
    // Issues & Recommendations
    issues,
    criticalIssues,
    recommendations,
    
    // Highlights
    highlights,
    highlightsEnabled,
    enabledHighlightTypes,
    
    // Configuration
    config,
    targetAudience: config.targetAudience,
    contentType: config.contentType,
    
    // UI State
    activeTab,
    expandedSections,
    
    // Actions
    analyze,
    setTargetAudience,
    setContentType,
    setActiveTab,
    toggleSection,
    toggleHighlights,
    toggleHighlightType,
    exportReport,
    clearAnalysis,
    
    // Comparison helpers
    isOnTarget,
    targetDifference,
    industryComparison
  };
}

// =============================================================================
// EXPORT DEFAULT
// =============================================================================

export default useReadability;

