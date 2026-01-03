'use client';

// =============================================================================
// USE PAA HOOK - Production Level
// State management for People Also Ask integration
// =============================================================================

import { useState, useCallback, useMemo } from 'react';
import {
  PAAData,
  PAAQuestion,
  PAAState,
  LoadingStage,
  PAAFetchOptions,
  PAAFilters,
  PAATab,
  PAALocation,
  DEFAULT_PAA_OPTIONS,
  DEFAULT_PAA_FILTERS
} from '@/src/features/ai-writer/types/tools/paa.types';
import {
  generatePAAData,
  filterQuestions,
  sortQuestions,
  getCoverageAnalysis,
  identifyOpportunities,
  analyzeContentCoverage,
  exportToMarkdown,
  exportToCSV,
  exportToJSON,
  calculatePAAStatistics
} from '@/src/features/ai-writer/utils/tools/paa';

// =============================================================================
// HOOK INTERFACE
// =============================================================================

interface UsePAAOptions {
  initialTab?: PAATab;
  autoAnalyze?: boolean;
}

interface UsePAAReturn {
  // Data
  data: PAAData | null;
  questions: PAAQuestion[];
  filteredQuestions: PAAQuestion[];
  coverageAnalysis: ReturnType<typeof getCoverageAnalysis>;
  opportunities: ReturnType<typeof identifyOpportunities>;
  statistics: ReturnType<typeof calculatePAAStatistics> | null;

  // Loading state
  isLoading: boolean;
  loadingStage: LoadingStage;
  progress: number;
  error: string | null;

  // UI state
  activeTab: PAATab;
  setActiveTab: (tab: PAATab) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filters: PAAFilters;
  setFilters: (filters: PAAFilters) => void;
  sortBy: 'relevance' | 'position' | 'difficulty' | 'volume';
  setSortBy: (sort: 'relevance' | 'position' | 'difficulty' | 'volume') => void;

  // Selection
  selectedQuestions: Set<string>;
  toggleSelectQuestion: (id: string) => void;
  selectAllQuestions: () => void;
  clearSelection: () => void;

  // Expansion
  expandedQuestions: Set<string>;
  toggleExpandQuestion: (id: string) => void;
  expandAllQuestions: () => void;
  collapseAllQuestions: () => void;

  // Actions
  fetchPAAData: (
    keyword: string,
    content: string,
    options?: Partial<PAAFetchOptions>
  ) => Promise<void>;
  refreshCoverage: (content: string) => void;
  clearData: () => void;

  // Export
  exportData: (format: 'markdown' | 'csv' | 'json', selectedOnly?: boolean) => string;
  downloadExport: (format: 'markdown' | 'csv' | 'json', filename: string, selectedOnly?: boolean) => void;

  // Utilities
  getQuestionById: (id: string) => PAAQuestion | undefined;
  getQuestionsByType: (type: string) => PAAQuestion[];
  getUncoveredQuestions: () => PAAQuestion[];
  getOpportunityQuestions: () => PAAQuestion[];
}

// =============================================================================
// HOOK IMPLEMENTATION
// =============================================================================

export function usePAA(options: UsePAAOptions = {}): UsePAAReturn {
  const { initialTab = 'all', autoAnalyze = true } = options;

  // State
  const [data, setData] = useState<PAAData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState<LoadingStage>('idle');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // UI State
  const [activeTab, setActiveTab] = useState<PAATab>(initialTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<PAAFilters>(DEFAULT_PAA_FILTERS);
  const [sortBy, setSortBy] = useState<'relevance' | 'position' | 'difficulty' | 'volume'>('relevance');

  // Selection state
  const [selectedQuestions, setSelectedQuestions] = useState<Set<string>>(new Set());
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set());

  // Computed: All questions flat list
  const questions = useMemo(() => {
    if (!data) return [];
    return data.questions.flatMap(g => g.questions);
  }, [data]);

  // Computed: Filtered and sorted questions
  const filteredQuestions = useMemo(() => {
    const filtered = filterQuestions(questions, filters, searchQuery);
    return sortQuestions(filtered, sortBy);
  }, [questions, filters, searchQuery, sortBy]);

  // Computed: Coverage analysis
  const coverageAnalysis = useMemo(() => {
    return getCoverageAnalysis(questions);
  }, [questions]);

  // Computed: Opportunities
  const opportunities = useMemo(() => {
    return identifyOpportunities(questions, 10);
  }, [questions]);

  // Computed: Statistics
  const statistics = useMemo(() => {
    if (!data) return null;
    return calculatePAAStatistics(data);
  }, [data]);

  // ==========================================================================
  // FETCH ACTION
  // ==========================================================================

  const fetchPAAData = useCallback(async (
    keyword: string,
    content: string,
    fetchOptions?: Partial<PAAFetchOptions>
  ) => {
    if (!keyword.trim()) {
      setError('Keyword is required');
      return;
    }

    setIsLoading(true);
    setError(null);
    setProgress(0);

    try {
      // Stage 1: Fetching SERP
      setLoadingStage('fetching-serp');
      setProgress(10);
      await simulateDelay(300);

      // Stage 2: Extracting PAA
      setLoadingStage('extracting-paa');
      setProgress(30);
      await simulateDelay(400);

      // Stage 3: Expanding questions
      setLoadingStage('expanding-questions');
      setProgress(50);
      await simulateDelay(300);

      // Stage 4: Clustering
      setLoadingStage('clustering');
      setProgress(70);
      await simulateDelay(300);

      // Stage 5: Analyzing
      setLoadingStage('analyzing');
      setProgress(85);
      await simulateDelay(200);

      // Generate PAA data (mock for demo)
      const paaData = generatePAAData(keyword, content, fetchOptions);

      setProgress(100);
      setLoadingStage('complete');
      setData(paaData);

      // Reset selection
      setSelectedQuestions(new Set());
      setExpandedQuestions(new Set());

    } catch (err) {
      setLoadingStage('error');
      setError(err instanceof Error ? err.message : 'Failed to fetch PAA data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ==========================================================================
  // REFRESH COVERAGE
  // ==========================================================================

  const refreshCoverage = useCallback((content: string) => {
    if (!data) return;

    const updatedQuestions = data.questions.map(group => ({
      ...group,
      questions: analyzeContentCoverage(group.questions, content)
    }));

    setData({
      ...data,
      questions: updatedQuestions
    });
  }, [data]);

  // ==========================================================================
  // CLEAR DATA
  // ==========================================================================

  const clearData = useCallback(() => {
    setData(null);
    setError(null);
    setLoadingStage('idle');
    setProgress(0);
    setSelectedQuestions(new Set());
    setExpandedQuestions(new Set());
    setSearchQuery('');
    setFilters(DEFAULT_PAA_FILTERS);
  }, []);

  // ==========================================================================
  // SELECTION HANDLERS
  // ==========================================================================

  const toggleSelectQuestion = useCallback((id: string) => {
    setSelectedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const selectAllQuestions = useCallback(() => {
    setSelectedQuestions(new Set(filteredQuestions.map(q => q.id)));
  }, [filteredQuestions]);

  const clearSelection = useCallback(() => {
    setSelectedQuestions(new Set());
  }, []);

  // ==========================================================================
  // EXPANSION HANDLERS
  // ==========================================================================

  const toggleExpandQuestion = useCallback((id: string) => {
    setExpandedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const expandAllQuestions = useCallback(() => {
    setExpandedQuestions(new Set(questions.map(q => q.id)));
  }, [questions]);

  const collapseAllQuestions = useCallback(() => {
    setExpandedQuestions(new Set());
  }, []);

  // ==========================================================================
  // EXPORT FUNCTIONS
  // ==========================================================================

  const exportData = useCallback((
    format: 'markdown' | 'csv' | 'json',
    selectedOnly: boolean = false
  ): string => {
    const questionsToExport = selectedOnly && selectedQuestions.size > 0
      ? questions.filter(q => selectedQuestions.has(q.id))
      : questions;

    switch (format) {
      case 'markdown':
        return exportToMarkdown(questionsToExport);
      case 'csv':
        return exportToCSV(questionsToExport);
      case 'json':
        return exportToJSON(questionsToExport);
      default:
        return '';
    }
  }, [questions, selectedQuestions]);

  const downloadExport = useCallback((
    format: 'markdown' | 'csv' | 'json',
    filename: string,
    selectedOnly: boolean = false
  ) => {
    const content = exportData(format, selectedOnly);
    const mimeTypes = {
      markdown: 'text/markdown',
      csv: 'text/csv',
      json: 'application/json'
    };
    const extensions = {
      markdown: 'md',
      csv: 'csv',
      json: 'json'
    };

    const blob = new Blob([content], { type: mimeTypes[format] });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.${extensions[format]}`;
    a.click();
    URL.revokeObjectURL(url);
  }, [exportData]);

  // ==========================================================================
  // UTILITY FUNCTIONS
  // ==========================================================================

  const getQuestionById = useCallback((id: string): PAAQuestion | undefined => {
    return questions.find(q => q.id === id);
  }, [questions]);

  const getQuestionsByType = useCallback((type: string): PAAQuestion[] => {
    return questions.filter(q => q.type === type);
  }, [questions]);

  const getUncoveredQuestions = useCallback((): PAAQuestion[] => {
    return questions.filter(q => q.coverageStatus === 'not-covered');
  }, [questions]);

  const getOpportunityQuestions = useCallback((): PAAQuestion[] => {
    return questions.filter(q => q.coverageStatus === 'opportunity');
  }, [questions]);

  // ==========================================================================
  // RETURN
  // ==========================================================================

  return {
    // Data
    data,
    questions,
    filteredQuestions,
    coverageAnalysis,
    opportunities,
    statistics,

    // Loading state
    isLoading,
    loadingStage,
    progress,
    error,

    // UI state
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    filters,
    setFilters,
    sortBy,
    setSortBy,

    // Selection
    selectedQuestions,
    toggleSelectQuestion,
    selectAllQuestions,
    clearSelection,

    // Expansion
    expandedQuestions,
    toggleExpandQuestion,
    expandAllQuestions,
    collapseAllQuestions,

    // Actions
    fetchPAAData,
    refreshCoverage,
    clearData,

    // Export
    exportData,
    downloadExport,

    // Utilities
    getQuestionById,
    getQuestionsByType,
    getUncoveredQuestions,
    getOpportunityQuestions
  };
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Simulate delay for loading stages
 */
function simulateDelay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// =============================================================================
// EXPORTS
// =============================================================================

export default usePAA;

