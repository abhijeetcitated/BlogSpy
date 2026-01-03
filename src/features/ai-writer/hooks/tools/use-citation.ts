'use client';

// =============================================================================
// USE CITATION HOOK - Production Level
// =============================================================================
// State management for citation analysis and suggestions
// =============================================================================

import { useState, useCallback, useMemo } from 'react';
import {
  CitationAnalysis,
  CitableClaim,
  CitationSource,
  CitationSettings,
  CitationPriority,
  ClaimType,
  Citation,
  DEFAULT_CITATION_SETTINGS
} from '@/src/features/ai-writer/types/tools/citation.types';
import {
  analyzeCitations,
  generateCitation,
  exportCitationReport
} from '@/src/features/ai-writer/utils/tools/citation';

// =============================================================================
// TYPES
// =============================================================================

interface UseCitationOptions {
  onCitationInsert?: (citation: Citation) => void;
}

interface UseCitationReturn {
  // State
  analysis: CitationAnalysis | null;
  isAnalyzing: boolean;
  settings: CitationSettings;
  
  // Computed
  score: number;
  uncitedClaims: CitableClaim[];
  citedClaims: CitableClaim[];
  criticalUncited: CitableClaim[];
  topSources: CitationSource[];
  issueCount: number;
  
  // Actions
  analyze: (content: string) => void;
  applyCitation: (claim: CitableClaim, source: CitationSource) => void;
  skipClaim: (claimId: string) => void;
  undoCitation: (claimId: string) => void;
  updateSettings: (settings: Partial<CitationSettings>) => void;
  resetAnalysis: () => void;
  exportReport: () => string;
  
  // Filtering
  filterByPriority: (priority: CitationPriority) => CitableClaim[];
  filterByType: (type: ClaimType) => CitableClaim[];
  searchClaims: (query: string) => CitableClaim[];
}

// =============================================================================
// HOOK IMPLEMENTATION
// =============================================================================

export function useCitation(
  options: UseCitationOptions = {}
): UseCitationReturn {
  const { onCitationInsert } = options;

  // State
  const [analysis, setAnalysis] = useState<CitationAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [settings, setSettings] = useState<CitationSettings>(DEFAULT_CITATION_SETTINGS);
  const [appliedCitations, setAppliedCitations] = useState<Map<string, Citation>>(new Map());

  // Analyze content
  const analyze = useCallback((content: string) => {
    setIsAnalyzing(true);
    
    // Simulate async analysis
    setTimeout(() => {
      const result = analyzeCitations(content, settings);
      setAnalysis(result);
      setAppliedCitations(new Map());
      setIsAnalyzing(false);
    }, 800);
  }, [settings]);

  // Apply citation
  const applyCitation = useCallback((claim: CitableClaim, source: CitationSource) => {
    const citation = generateCitation(claim, source, settings.defaultStyle);
    
    // Update applied citations
    setAppliedCitations(prev => {
      const next = new Map(prev);
      next.set(claim.id, citation);
      return next;
    });
    
    // Update analysis
    setAnalysis(prev => {
      if (!prev) return prev;
      
      return {
        ...prev,
        claims: prev.claims.map(c => 
          c.id === claim.id 
            ? { ...c, status: 'cited' as const }
            : c
        ),
        uncitedClaims: prev.uncitedClaims - 1,
        metrics: {
          ...prev.metrics,
          citedClaims: prev.metrics.citedClaims + 1,
          uncitedClaims: prev.metrics.uncitedClaims - 1,
          citationCoverage: Math.round(((prev.metrics.citedClaims + 1) / prev.metrics.totalClaims) * 100)
        }
      };
    });
    
    // Trigger insert callback
    if (onCitationInsert) {
      onCitationInsert(citation);
    }
  }, [settings, onCitationInsert]);

  // Skip claim
  const skipClaim = useCallback((claimId: string) => {
    setAnalysis(prev => {
      if (!prev) return prev;
      
      return {
        ...prev,
        claims: prev.claims.map(c => 
          c.id === claimId 
            ? { ...c, status: 'skipped' as const }
            : c
        )
      };
    });
  }, []);

  // Undo citation
  const undoCitation = useCallback((claimId: string) => {
    setAppliedCitations(prev => {
      const next = new Map(prev);
      next.delete(claimId);
      return next;
    });
    
    setAnalysis(prev => {
      if (!prev) return prev;
      
      return {
        ...prev,
        claims: prev.claims.map(c => 
          c.id === claimId 
            ? { ...c, status: 'uncited' as const }
            : c
        ),
        uncitedClaims: prev.uncitedClaims + 1,
        metrics: {
          ...prev.metrics,
          citedClaims: prev.metrics.citedClaims - 1,
          uncitedClaims: prev.metrics.uncitedClaims + 1,
          citationCoverage: Math.round(((prev.metrics.citedClaims - 1) / prev.metrics.totalClaims) * 100)
        }
      };
    });
  }, []);

  // Update settings
  const updateSettings = useCallback((newSettings: Partial<CitationSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  // Reset analysis
  const resetAnalysis = useCallback(() => {
    setAnalysis(null);
    setAppliedCitations(new Map());
  }, []);

  // Export report
  const exportReport = useCallback((): string => {
    if (!analysis) return '';
    return exportCitationReport(analysis);
  }, [analysis]);

  // Filter by priority
  const filterByPriority = useCallback((priority: CitationPriority): CitableClaim[] => {
    if (!analysis) return [];
    return analysis.claims.filter(c => c.citationPriority === priority);
  }, [analysis]);

  // Filter by type
  const filterByType = useCallback((type: ClaimType): CitableClaim[] => {
    if (!analysis) return [];
    return analysis.claims.filter(c => c.type === type);
  }, [analysis]);

  // Search claims
  const searchClaims = useCallback((query: string): CitableClaim[] => {
    if (!analysis) return [];
    const lowerQuery = query.toLowerCase();
    return analysis.claims.filter(c => 
      c.text.toLowerCase().includes(lowerQuery)
    );
  }, [analysis]);

  // Computed values
  const score = useMemo(() => {
    return analysis?.metrics.overallScore || 0;
  }, [analysis]);

  const uncitedClaims = useMemo(() => {
    return analysis?.claims.filter(c => c.status === 'uncited') || [];
  }, [analysis]);

  const citedClaims = useMemo(() => {
    return analysis?.claims.filter(c => c.status === 'cited') || [];
  }, [analysis]);

  const criticalUncited = useMemo(() => {
    return analysis?.claims.filter(
      c => c.citationPriority === 'critical' && c.status === 'uncited'
    ) || [];
  }, [analysis]);

  const topSources = useMemo(() => {
    return analysis?.topSources || [];
  }, [analysis]);

  const issueCount = useMemo(() => {
    return analysis?.issues.length || 0;
  }, [analysis]);

  return {
    // State
    analysis,
    isAnalyzing,
    settings,
    
    // Computed
    score,
    uncitedClaims,
    citedClaims,
    criticalUncited,
    topSources,
    issueCount,
    
    // Actions
    analyze,
    applyCitation,
    skipClaim,
    undoCitation,
    updateSettings,
    resetAnalysis,
    exportReport,
    
    // Filtering
    filterByPriority,
    filterByType,
    searchClaims
  };
}

export default useCitation;

