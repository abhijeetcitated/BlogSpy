/**
 * E-E-A-T Analyzer Hook
 * 
 * React hook for managing E-E-A-T analysis state and operations:
 * - Run analysis on content
 * - Track scores and issues
 * - Apply recommendations
 * - Export reports
 */

'use client';

import { useState, useCallback, useMemo } from 'react';
import {
  EEATAnalysis,
  EEATSettings,
  EEATRecommendation,
  AuthorInfo,
  DEFAULT_EEAT_SETTINGS
} from '@/src/features/ai-writer/types/tools/eeat.types';
import { analyzeEEAT, exportEEATReport } from '@/src/features/ai-writer/utils/tools/eeat';

interface UseEEATOptions {
  initialSettings?: Partial<EEATSettings>;
  authorInfo?: AuthorInfo;
}

interface UseEEATReturn {
  // State
  analysis: EEATAnalysis | null;
  isAnalyzing: boolean;
  settings: EEATSettings;
  
  // Computed
  overallScore: number;
  overallGrade: string;
  expertiseScore: number;
  experienceScore: number;
  authorityScore: number;
  trustScore: number;
  criticalIssues: number;
  hasIssues: boolean;
  quickWins: EEATRecommendation[];
  
  // Actions
  analyze: (content: string, authorInfo?: AuthorInfo) => void;
  updateSettings: (settings: Partial<EEATSettings>) => void;
  updateAuthorInfo: (info: AuthorInfo) => void;
  exportReport: (format?: 'json' | 'csv' | 'markdown') => string | null;
  clearAnalysis: () => void;
  
  // Component-specific
  getComponentScore: (component: 'expertise' | 'experience' | 'authoritativeness' | 'trustworthiness') => number;
  getComponentGrade: (component: 'expertise' | 'experience' | 'authoritativeness' | 'trustworthiness') => string;
  getIssuesByComponent: (component: 'expertise' | 'experience' | 'authoritativeness' | 'trustworthiness') => EEATAnalysis['issues'];
  getRecommendationsByPriority: (priority: 'critical' | 'high' | 'medium' | 'low') => EEATRecommendation[];
}

/**
 * Hook for E-E-A-T analysis
 */
export function useEEAT(options: UseEEATOptions = {}): UseEEATReturn {
  const [analysis, setAnalysis] = useState<EEATAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [settings, setSettings] = useState<EEATSettings>({
    ...DEFAULT_EEAT_SETTINGS,
    ...options.initialSettings
  });
  const [authorInfo, setAuthorInfo] = useState<AuthorInfo>(options.authorInfo || {});
  
  // Analyze content
  const analyze = useCallback((content: string, newAuthorInfo?: AuthorInfo) => {
    setIsAnalyzing(true);
    
    // Simulate async analysis (in production, this might call an API)
    setTimeout(() => {
      try {
        const result = analyzeEEAT(content, newAuthorInfo || authorInfo, settings);
        setAnalysis(result);
        if (newAuthorInfo) {
          setAuthorInfo(newAuthorInfo);
        }
      } catch (error) {
        console.error('E-E-A-T analysis failed:', error);
      } finally {
        setIsAnalyzing(false);
      }
    }, 500);
  }, [authorInfo, settings]);
  
  // Update settings
  const updateSettings = useCallback((newSettings: Partial<EEATSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);
  
  // Update author info
  const updateAuthorInfo = useCallback((info: AuthorInfo) => {
    setAuthorInfo(info);
  }, []);
  
  // Export report
  const exportReport = useCallback((format: 'json' | 'csv' | 'markdown' = 'markdown'): string | null => {
    if (!analysis) return null;
    return exportEEATReport(analysis, format);
  }, [analysis]);
  
  // Clear analysis
  const clearAnalysis = useCallback(() => {
    setAnalysis(null);
  }, []);
  
  // Computed values
  const overallScore = useMemo(() => analysis?.metrics.overallScore || 0, [analysis]);
  const overallGrade = useMemo(() => analysis?.metrics.overallGrade || 'N/A', [analysis]);
  const expertiseScore = useMemo(() => analysis?.metrics.expertiseScore || 0, [analysis]);
  const experienceScore = useMemo(() => analysis?.metrics.experienceScore || 0, [analysis]);
  const authorityScore = useMemo(() => analysis?.metrics.authoritativenessScore || 0, [analysis]);
  const trustScore = useMemo(() => analysis?.metrics.trustworthinessScore || 0, [analysis]);
  const criticalIssues = useMemo(() => analysis?.metrics.criticalIssues || 0, [analysis]);
  const hasIssues = useMemo(() => (analysis?.issues.length || 0) > 0, [analysis]);
  const quickWins = useMemo(() => analysis?.quickWins || [], [analysis]);
  
  // Get component score
  const getComponentScore = useCallback((
    component: 'expertise' | 'experience' | 'authoritativeness' | 'trustworthiness'
  ): number => {
    if (!analysis) return 0;
    return analysis[component].score;
  }, [analysis]);
  
  // Get component grade
  const getComponentGrade = useCallback((
    component: 'expertise' | 'experience' | 'authoritativeness' | 'trustworthiness'
  ): string => {
    if (!analysis) return 'N/A';
    return analysis[component].grade;
  }, [analysis]);
  
  // Get issues by component
  const getIssuesByComponent = useCallback((
    component: 'expertise' | 'experience' | 'authoritativeness' | 'trustworthiness'
  ) => {
    if (!analysis) return [];
    return analysis.issues.filter(i => i.component === component);
  }, [analysis]);
  
  // Get recommendations by priority
  const getRecommendationsByPriority = useCallback((
    priority: 'critical' | 'high' | 'medium' | 'low'
  ): EEATRecommendation[] => {
    if (!analysis) return [];
    return analysis.recommendations.filter(r => r.priority === priority);
  }, [analysis]);
  
  return {
    // State
    analysis,
    isAnalyzing,
    settings,
    
    // Computed
    overallScore,
    overallGrade,
    expertiseScore,
    experienceScore,
    authorityScore,
    trustScore,
    criticalIssues,
    hasIssues,
    quickWins,
    
    // Actions
    analyze,
    updateSettings,
    updateAuthorInfo,
    exportReport,
    clearAnalysis,
    
    // Component-specific
    getComponentScore,
    getComponentGrade,
    getIssuesByComponent,
    getRecommendationsByPriority
  };
}

export default useEEAT;

