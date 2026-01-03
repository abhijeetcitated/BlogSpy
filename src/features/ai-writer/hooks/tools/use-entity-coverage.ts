/**
 * Entity Coverage Hook
 * 
 * React hook for managing entity coverage analysis:
 * - Extract and analyze entities from content
 * - Track entity relationships and clusters
 * - Identify coverage gaps
 * - Generate recommendations
 */

'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import {
  Entity,
  EntityType,
  EntityStatus,
  EntityImportance,
  EntityRelationship,
  EntityCluster,
  EntityGap,
  EntityRecommendation,
  EntitySuggestion,
  EntityCoverageAnalysis,
  EntityCoverageMetrics,
  EntityCoverageSettings,
  EntityCoverageSummary,
  EntityScoreBreakdown,
  EntityFilterState,
  EntitySortOption,
  DEFAULT_ENTITY_COVERAGE_SETTINGS,
  EntityExportFormat
} from '@/src/features/ai-writer/types/tools/entity-coverage.types';
import {
  analyzeEntityCoverage,
  exportEntityReport,
  getEntityHighlights
} from '@/src/features/ai-writer/utils/tools/entity-coverage';

// =============================================================================
// TYPES
// =============================================================================

interface UseEntityCoverageOptions {
  initialSettings?: Partial<EntityCoverageSettings>;
  autoAnalyze?: boolean;
  keyword?: string;
}

interface UseEntityCoverageReturn {
  // State
  analysis: EntityCoverageAnalysis | null;
  isAnalyzing: boolean;
  settings: EntityCoverageSettings;
  
  // Direct access
  metrics: EntityCoverageMetrics | null;
  entities: Entity[];
  relationships: EntityRelationship[];
  clusters: EntityCluster[];
  gaps: EntityGap[];
  recommendations: EntityRecommendation[];
  suggestions: EntitySuggestion[];
  summary: EntityCoverageSummary | null;
  scoreBreakdown: EntityScoreBreakdown | null;
  
  // Computed
  score: number;
  totalEntities: number;
  coveredCount: number;
  missingCount: number;
  criticalCount: number;
  
  // Entities by status
  coveredEntities: Entity[];
  mentionedEntities: Entity[];
  missingEntities: Entity[];
  overusedEntities: Entity[];
  
  // Entities by importance
  criticalEntities: Entity[];
  highImportanceEntities: Entity[];
  
  // Entities by type
  getEntitiesByType: (type: EntityType) => Entity[];
  
  // Highlighting
  highlights: Array<{
    text: string;
    type: EntityType;
    status: EntityStatus;
    positions: Array<{ start: number; end: number; line: number }>;
  }>;
  
  // Actions
  analyze: (content: string, keyword?: string) => void;
  updateSettings: (settings: Partial<EntityCoverageSettings>) => void;
  addCustomEntity: (entity: string) => void;
  removeCustomEntity: (entity: string) => void;
  exportReport: (format?: EntityExportFormat) => string | null;
  clearAnalysis: () => void;
  
  // Filtering
  filterEntities: (filter: Partial<EntityFilterState>) => Entity[];
  sortEntities: (entities: Entity[], sortBy: EntitySortOption) => Entity[];
  searchEntities: (query: string) => Entity[];
}

// =============================================================================
// HOOK
// =============================================================================

/**
 * Hook for entity coverage analysis
 */
export function useEntityCoverage(
  options: UseEntityCoverageOptions = {}
): UseEntityCoverageReturn {
  const [analysis, setAnalysis] = useState<EntityCoverageAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [settings, setSettings] = useState<EntityCoverageSettings>({
    ...DEFAULT_ENTITY_COVERAGE_SETTINGS,
    ...options.initialSettings
  });
  
  // ==========================================================================
  // ANALYSIS
  // ==========================================================================
  
  const analyze = useCallback((content: string, keyword?: string) => {
    setIsAnalyzing(true);
    
    // Simulate async for smooth UI
    setTimeout(() => {
      try {
        const result = analyzeEntityCoverage(
          content,
          keyword || options.keyword || '',
          settings
        );
        setAnalysis(result);
      } catch (error) {
        console.error('Entity analysis failed:', error);
      } finally {
        setIsAnalyzing(false);
      }
    }, 200);
  }, [options.keyword, settings]);
  
  // ==========================================================================
  // SETTINGS
  // ==========================================================================
  
  const updateSettings = useCallback((newSettings: Partial<EntityCoverageSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);
  
  const addCustomEntity = useCallback((entity: string) => {
    setSettings(prev => ({
      ...prev,
      customEntities: [...prev.customEntities, entity]
    }));
  }, []);
  
  const removeCustomEntity = useCallback((entity: string) => {
    setSettings(prev => ({
      ...prev,
      customEntities: prev.customEntities.filter(e => e !== entity)
    }));
  }, []);
  
  // ==========================================================================
  // EXPORT
  // ==========================================================================
  
  const exportReport = useCallback((format: EntityExportFormat = 'markdown'): string | null => {
    if (!analysis) return null;
    return exportEntityReport(analysis, format);
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
  const entities = useMemo(() => analysis?.entities || [], [analysis]);
  const relationships = useMemo(() => analysis?.relationships || [], [analysis]);
  const clusters = useMemo(() => analysis?.clusters || [], [analysis]);
  const gaps = useMemo(() => analysis?.gaps || [], [analysis]);
  const recommendations = useMemo(() => analysis?.recommendations || [], [analysis]);
  const suggestions = useMemo(() => analysis?.suggestions || [], [analysis]);
  const summary = useMemo(() => analysis?.summary || null, [analysis]);
  const scoreBreakdown = useMemo(() => analysis?.scoreBreakdown || null, [analysis]);
  
  // ==========================================================================
  // COMPUTED VALUES
  // ==========================================================================
  
  const score = useMemo(() => analysis?.metrics.overallScore || 0, [analysis]);
  const totalEntities = useMemo(() => analysis?.entities.length || 0, [analysis]);
  
  const coveredCount = useMemo(() => 
    analysis?.metrics.entitiesByStatus.covered || 0, 
    [analysis]
  );
  
  const missingCount = useMemo(() => 
    analysis?.metrics.entitiesByStatus.missing || 0, 
    [analysis]
  );
  
  const criticalCount = useMemo(() => 
    analysis?.metrics.entitiesByImportance.critical || 0, 
    [analysis]
  );
  
  // ==========================================================================
  // ENTITIES BY STATUS
  // ==========================================================================
  
  const coveredEntities = useMemo(() => 
    entities.filter(e => e.status === 'covered'), 
    [entities]
  );
  
  const mentionedEntities = useMemo(() => 
    entities.filter(e => e.status === 'mentioned'), 
    [entities]
  );
  
  const missingEntities = useMemo(() => 
    entities.filter(e => e.status === 'missing'), 
    [entities]
  );
  
  const overusedEntities = useMemo(() => 
    entities.filter(e => e.status === 'overused'), 
    [entities]
  );
  
  // ==========================================================================
  // ENTITIES BY IMPORTANCE
  // ==========================================================================
  
  const criticalEntities = useMemo(() => 
    entities.filter(e => e.importance === 'critical'), 
    [entities]
  );
  
  const highImportanceEntities = useMemo(() => 
    entities.filter(e => e.importance === 'high'), 
    [entities]
  );
  
  // ==========================================================================
  // ENTITIES BY TYPE
  // ==========================================================================
  
  const getEntitiesByType = useCallback((type: EntityType): Entity[] => {
    return entities.filter(e => e.type === type);
  }, [entities]);
  
  // ==========================================================================
  // HIGHLIGHTING
  // ==========================================================================
  
  const highlights = useMemo(() => {
    if (!entities.length) return [];
    return getEntityHighlights(entities);
  }, [entities]);
  
  // ==========================================================================
  // FILTERING
  // ==========================================================================
  
  const filterEntities = useCallback((filter: Partial<EntityFilterState>): Entity[] => {
    let result = [...entities];
    
    // Filter by types
    if (filter.types && filter.types.length > 0) {
      result = result.filter(e => filter.types!.includes(e.type));
    }
    
    // Filter by status
    if (filter.status && filter.status !== 'all') {
      result = result.filter(e => e.status === filter.status);
    }
    
    // Filter by importance
    if (filter.importance && filter.importance !== 'all') {
      result = result.filter(e => e.importance === filter.importance);
    }
    
    // Filter by search
    if (filter.search) {
      const searchLower = filter.search.toLowerCase();
      result = result.filter(e => 
        e.text.toLowerCase().includes(searchLower) ||
        e.normalizedText.includes(searchLower)
      );
    }
    
    // Filter competitor only
    if (filter.showCompetitorOnly) {
      result = result.filter(e => e.isCompetitorEntity);
    }
    
    // Filter missing only
    if (filter.showMissingOnly) {
      result = result.filter(e => e.status === 'missing');
    }
    
    // Filter by min confidence
    if (filter.minConfidence) {
      result = result.filter(e => e.confidence >= filter.minConfidence!);
    }
    
    return result;
  }, [entities]);
  
  // ==========================================================================
  // SORTING
  // ==========================================================================
  
  const sortEntities = useCallback((entitiesToSort: Entity[], sortBy: EntitySortOption): Entity[] => {
    const sorted = [...entitiesToSort];
    
    switch (sortBy) {
      case 'alphabetical':
        return sorted.sort((a, b) => a.text.localeCompare(b.text));
        
      case 'count':
        return sorted.sort((a, b) => b.count - a.count);
        
      case 'confidence':
        return sorted.sort((a, b) => b.confidence - a.confidence);
        
      case 'importance':
        const importanceOrder: Record<EntityImportance, number> = {
          critical: 4, high: 3, medium: 2, low: 1
        };
        return sorted.sort((a, b) => 
          importanceOrder[b.importance] - importanceOrder[a.importance]
        );
        
      case 'type':
        return sorted.sort((a, b) => a.type.localeCompare(b.type));
        
      case 'relevance':
      default:
        return sorted.sort((a, b) => b.seoRelevance - a.seoRelevance);
    }
  }, []);
  
  // ==========================================================================
  // SEARCH
  // ==========================================================================
  
  const searchEntities = useCallback((query: string): Entity[] => {
    if (!query.trim()) return entities;
    
    const lowerQuery = query.toLowerCase();
    return entities.filter(e =>
      e.text.toLowerCase().includes(lowerQuery) ||
      e.normalizedText.includes(lowerQuery) ||
      e.type.includes(lowerQuery) ||
      e.description?.toLowerCase().includes(lowerQuery)
    );
  }, [entities]);
  
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
    entities,
    relationships,
    clusters,
    gaps,
    recommendations,
    suggestions,
    summary,
    scoreBreakdown,
    
    // Computed
    score,
    totalEntities,
    coveredCount,
    missingCount,
    criticalCount,
    
    // Entities by status
    coveredEntities,
    mentionedEntities,
    missingEntities,
    overusedEntities,
    
    // Entities by importance
    criticalEntities,
    highImportanceEntities,
    
    // Entities by type
    getEntitiesByType,
    
    // Highlighting
    highlights,
    
    // Actions
    analyze,
    updateSettings,
    addCustomEntity,
    removeCustomEntity,
    exportReport,
    clearAnalysis,
    
    // Filtering
    filterEntities,
    sortEntities,
    searchEntities
  };
}

export default useEntityCoverage;

