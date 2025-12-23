// =============================================================================
// USE COMPETITOR ANALYSIS HOOK - Live SERP Analysis State Management
// =============================================================================
// Industry-standard competitor analysis hook with real-time gap detection
// Production-ready state management for competitor comparison
// =============================================================================

'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import {
  analyzeContentGaps,
  compareWithCompetitors,
  extractCommonPatterns,
  calculateFeatureFrequency,
  calculateContentMetrics,
  extractHeadingsFromHTML,
  extractTermsFromContent,
  extractEntitiesFromContent,
  buildOutlineStructure,
  countHeadingsByLevel
} from '@/src/features/ai-writer/utils/tools/competitor-analysis';

import type {
  SERPAnalysis,
  SERPCompetitor,
  ContentGapAnalysis,
  CompetitorComparison,
  LiveAnalysisState,
  AnalysisSettings,
  CompetitorSearchIntent,
  ContentMetrics,
  DEFAULT_ANALYSIS_SETTINGS
} from '@/src/features/ai-writer/types/tools/competitor-analysis.types';

// -----------------------------------------------------------------------------
// Default Settings
// -----------------------------------------------------------------------------

const DEFAULT_SETTINGS: AnalysisSettings = {
  competitorCount: 10,
  includeLocal: false,
  location: 'United States',
  language: 'en',
  device: 'desktop',
  freshness: 'any'
};

// -----------------------------------------------------------------------------
// ID Generation Utility
// -----------------------------------------------------------------------------

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

// -----------------------------------------------------------------------------
// Hook Interface
// -----------------------------------------------------------------------------

interface UseCompetitorAnalysisOptions {
  keyword?: string;
  content?: string;
  autoAnalyze?: boolean;
  debounceMs?: number;
}

interface UseCompetitorAnalysisReturn {
  // State
  state: LiveAnalysisState;
  
  // Analysis results
  serpAnalysis: SERPAnalysis | null;
  contentGaps: ContentGapAnalysis | null;
  comparison: CompetitorComparison | null;
  
  // Status
  isAnalyzing: boolean;
  progress: number;
  currentStep: string;
  error: string | null;
  
  // Actions
  analyze: () => Promise<void>;
  refresh: () => Promise<void>;
  updateContent: (content: string) => void;
  updateKeyword: (keyword: string) => void;
  updateSettings: (settings: Partial<AnalysisSettings>) => void;
  selectCompetitors: (ids: string[]) => void;
  clearAnalysis: () => void;
  
  // Derived data
  missingTopicsCount: number;
  gapScore: number;
  contentScore: number;
  estimatedPosition: number;
}

// -----------------------------------------------------------------------------
// Main Hook
// -----------------------------------------------------------------------------

export function useCompetitorAnalysis({
  keyword: initialKeyword = '',
  content: initialContent = '',
  autoAnalyze = false,
  debounceMs = 500
}: UseCompetitorAnalysisOptions = {}): UseCompetitorAnalysisReturn {
  // State
  const [keyword, setKeyword] = useState(initialKeyword);
  const [content, setContent] = useState(initialContent);
  const [settings, setSettings] = useState<AnalysisSettings>(DEFAULT_SETTINGS);
  
  const [state, setState] = useState<LiveAnalysisState>({
    status: 'idle',
    progress: 0,
    currentStep: '',
    error: null,
    serpAnalysis: null,
    contentGaps: null,
    comparison: null,
    selectedCompetitors: [],
    settings: DEFAULT_SETTINGS
  });
  
  // Update progress helper
  const updateProgress = useCallback((progress: number, step: string) => {
    setState(prev => ({
      ...prev,
      progress,
      currentStep: step
    }));
  }, []);
  
  // Simulate SERP API call (in production, this would call DataForSEO or similar)
  const fetchSERPData = useCallback(async (searchKeyword: string): Promise<SERPCompetitor[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Generate mock competitor data based on keyword
    // In production, this would be real SERP data from an API
    const mockCompetitors: SERPCompetitor[] = [];
    const domains = [
      'example.com', 'guide.com', 'howto.com', 'learn.com', 'tips.com',
      'expert.com', 'pro.com', 'best.com', 'top.com', 'review.com'
    ];
    
    for (let i = 0; i < settings.competitorCount; i++) {
      const wordCount = 1500 + Math.floor(Math.random() * 2500);
      const headings = generateMockHeadings(searchKeyword, wordCount);
      
      mockCompetitors.push({
        id: generateId(),
        rank: i + 1,
        url: `https://www.${domains[i % domains.length]}/${searchKeyword.replace(/\s+/g, '-').toLowerCase()}`,
        domain: domains[i % domains.length],
        title: `${searchKeyword.charAt(0).toUpperCase() + searchKeyword.slice(1)} - Complete Guide ${2024}`,
        metaDescription: `Learn everything about ${searchKeyword}. Our comprehensive guide covers tips, strategies, and best practices.`,
        wordCount,
        headingCount: countHeadingsByLevel(headings),
        paragraphCount: Math.floor(wordCount / 100),
        imageCount: 3 + Math.floor(Math.random() * 10),
        videoCount: Math.random() > 0.7 ? 1 : 0,
        internalLinks: 5 + Math.floor(Math.random() * 15),
        externalLinks: 2 + Math.floor(Math.random() * 8),
        headings,
        outlineStructure: buildOutlineStructure(headings),
        hasFAQ: Math.random() > 0.4,
        hasTableOfContents: Math.random() > 0.3,
        hasSchema: Math.random() > 0.5,
        schemaTypes: ['Article', 'FAQPage', 'BreadcrumbList'].filter(() => Math.random() > 0.5),
        estimatedReadTime: Math.ceil(wordCount / 200),
        contentAge: null,
        lastUpdated: null,
        domainAuthority: 30 + Math.floor(Math.random() * 60),
        pageAuthority: 20 + Math.floor(Math.random() * 50),
        topTerms: generateMockTerms(searchKeyword),
        entities: generateMockEntities(searchKeyword),
        topicCoverage: 60 + Math.floor(Math.random() * 40)
      });
    }
    
    return mockCompetitors;
  }, [settings.competitorCount]);
  
  // Main analyze function
  const analyze = useCallback(async () => {
    if (!keyword.trim()) {
      setState(prev => ({
        ...prev,
        error: 'Please enter a keyword to analyze'
      }));
      return;
    }
    
    setState(prev => ({
      ...prev,
      status: 'analyzing',
      progress: 0,
      currentStep: 'Initializing analysis...',
      error: null
    }));
    
    try {
      // Step 1: Fetch SERP data
      updateProgress(10, 'Fetching SERP results...');
      const competitors = await fetchSERPData(keyword);
      
      // Step 2: Analyze competitors
      updateProgress(30, 'Analyzing competitor content...');
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Step 3: Extract common patterns
      updateProgress(50, 'Extracting common patterns...');
      const patterns = extractCommonPatterns(competitors);
      
      // Step 4: Calculate feature frequency
      updateProgress(60, 'Analyzing content features...');
      const featureFrequency = calculateFeatureFrequency(competitors);
      
      // Step 5: Build SERP analysis
      updateProgress(70, 'Building analysis...');
      const avgMetrics = calculateAverageMetricsFromCompetitors(competitors);
      
      const serpAnalysis: SERPAnalysis = {
        keyword,
        searchVolume: 1000 + Math.floor(Math.random() * 10000),
        difficulty: 30 + Math.floor(Math.random() * 60),
        intent: detectSearchIntent(keyword),
        competitors,
        averageMetrics: avgMetrics,
        topPerformerMetrics: competitors.length > 0 ? getCompetitorMetrics(competitors[0]) : avgMetrics,
        commonHeadings: patterns.headings,
        commonTerms: patterns.terms,
        commonEntities: patterns.entities,
        commonQuestions: patterns.questions,
        featureFrequency,
        analyzedAt: new Date().toISOString()
      };
      
      // Step 6: Analyze content gaps
      updateProgress(85, 'Detecting content gaps...');
      let contentGaps: ContentGapAnalysis | null = null;
      let comparison: CompetitorComparison | null = null;
      
      if (content.trim()) {
        contentGaps = analyzeContentGaps(content, competitors);
        comparison = compareWithCompetitors(content, competitors);
      }
      
      // Step 7: Complete
      updateProgress(100, 'Analysis complete!');
      
      setState(prev => ({
        ...prev,
        status: 'completed',
        progress: 100,
        currentStep: 'Analysis complete!',
        serpAnalysis,
        contentGaps,
        comparison,
        selectedCompetitors: competitors.slice(0, 5).map(c => c.id)
      }));
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        status: 'error',
        error: error instanceof Error ? error.message : 'Analysis failed'
      }));
    }
  }, [keyword, content, fetchSERPData, updateProgress]);
  
  // Refresh analysis
  const refresh = useCallback(async () => {
    await analyze();
  }, [analyze]);
  
  // Update content and recalculate gaps
  const updateContent = useCallback((newContent: string) => {
    setContent(newContent);
    
    // If we have SERP data, recalculate gaps
    if (state.serpAnalysis && newContent.trim()) {
      const contentGaps = analyzeContentGaps(newContent, state.serpAnalysis.competitors);
      const comparison = compareWithCompetitors(newContent, state.serpAnalysis.competitors);
      
      setState(prev => ({
        ...prev,
        contentGaps,
        comparison
      }));
    }
  }, [state.serpAnalysis]);
  
  // Update keyword
  const updateKeyword = useCallback((newKeyword: string) => {
    setKeyword(newKeyword);
  }, []);
  
  // Update settings
  const updateSettings = useCallback((newSettings: Partial<AnalysisSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);
  
  // Select competitors
  const selectCompetitors = useCallback((ids: string[]) => {
    setState(prev => ({
      ...prev,
      selectedCompetitors: ids
    }));
  }, []);
  
  // Clear analysis
  const clearAnalysis = useCallback(() => {
    setState({
      status: 'idle',
      progress: 0,
      currentStep: '',
      error: null,
      serpAnalysis: null,
      contentGaps: null,
      comparison: null,
      selectedCompetitors: [],
      settings: DEFAULT_SETTINGS
    });
  }, []);
  
  // Auto analyze when keyword changes
  useEffect(() => {
    if (autoAnalyze && keyword.trim()) {
      const timeoutId = setTimeout(() => {
        analyze();
      }, debounceMs);
      
      return () => clearTimeout(timeoutId);
    }
  }, [autoAnalyze, keyword, debounceMs, analyze]);
  
  // Derived data
  const derivedData = useMemo(() => ({
    missingTopicsCount: state.contentGaps?.missingTopics.length || 0,
    gapScore: state.contentGaps?.gapScore || 0,
    contentScore: state.comparison?.scores.overall || 0,
    estimatedPosition: state.comparison?.positionPrediction.estimatedPosition || 0
  }), [state.contentGaps, state.comparison]);
  
  return {
    state,
    serpAnalysis: state.serpAnalysis,
    contentGaps: state.contentGaps,
    comparison: state.comparison,
    isAnalyzing: state.status === 'analyzing',
    progress: state.progress,
    currentStep: state.currentStep,
    error: state.error,
    analyze,
    refresh,
    updateContent,
    updateKeyword,
    updateSettings,
    selectCompetitors,
    clearAnalysis,
    ...derivedData
  };
}

// -----------------------------------------------------------------------------
// Helper Functions
// -----------------------------------------------------------------------------

/**
 * Generate mock headings based on keyword
 */
function generateMockHeadings(keyword: string, wordCount: number) {
  const headings: any[] = [];
  const keywordParts = keyword.split(' ');
  const mainTopic = keywordParts[0].charAt(0).toUpperCase() + keywordParts[0].slice(1);
  
  // H1
  headings.push({
    level: 1,
    text: `${keyword.charAt(0).toUpperCase() + keyword.slice(1)}: The Complete Guide`,
    position: 0,
    wordCount: Math.floor(wordCount * 0.1)
  });
  
  // Generate H2s and H3s
  const h2Topics = [
    `What is ${mainTopic}?`,
    `Benefits of ${mainTopic}`,
    `How to Use ${mainTopic}`,
    `${mainTopic} Best Practices`,
    `Common ${mainTopic} Mistakes`,
    `${mainTopic} Tools and Resources`,
    `${mainTopic} Tips for Beginners`,
    `Advanced ${mainTopic} Strategies`,
    `${mainTopic} Case Studies`,
    `Frequently Asked Questions`
  ];
  
  const numH2s = 4 + Math.floor(Math.random() * 4);
  let currentPosition = 500;
  
  for (let i = 0; i < numH2s && i < h2Topics.length; i++) {
    headings.push({
      level: 2,
      text: h2Topics[i],
      position: currentPosition,
      wordCount: Math.floor(wordCount / numH2s)
    });
    currentPosition += Math.floor(wordCount / numH2s);
    
    // Add some H3s under each H2
    if (Math.random() > 0.5) {
      const numH3s = 1 + Math.floor(Math.random() * 3);
      for (let j = 0; j < numH3s; j++) {
        headings.push({
          level: 3,
          text: `${h2Topics[i].replace('?', '')} - Part ${j + 1}`,
          position: currentPosition + j * 100,
          wordCount: Math.floor((wordCount / numH2s) / numH3s)
        });
      }
    }
  }
  
  return headings;
}

/**
 * Generate mock terms based on keyword
 */
function generateMockTerms(keyword: string) {
  const terms: any[] = [];
  const keywordParts = keyword.toLowerCase().split(' ');
  
  // Add keyword parts as terms
  for (const part of keywordParts) {
    if (part.length > 2) {
      terms.push({
        term: part,
        frequency: 10 + Math.floor(Math.random() * 20),
        density: 0.5 + Math.random() * 2,
        importance: 80 + Math.floor(Math.random() * 20),
        inHeadings: true,
        inFirstParagraph: true
      });
    }
  }
  
  // Add related terms
  const relatedTerms = [
    'guide', 'tips', 'strategies', 'best practices', 'examples',
    'tools', 'resources', 'benefits', 'advantages', 'how to',
    'step by step', 'tutorial', 'complete', 'ultimate', 'essential'
  ];
  
  for (const term of relatedTerms) {
    if (Math.random() > 0.5) {
      terms.push({
        term,
        frequency: 2 + Math.floor(Math.random() * 10),
        density: 0.1 + Math.random() * 0.5,
        importance: 30 + Math.floor(Math.random() * 40),
        inHeadings: Math.random() > 0.7,
        inFirstParagraph: Math.random() > 0.8
      });
    }
  }
  
  return terms.sort((a, b) => b.importance - a.importance).slice(0, 30);
}

/**
 * Generate mock entities based on keyword
 */
function generateMockEntities(keyword: string) {
  const entities: any[] = [];
  
  // Add some common entities
  const mockEntities = [
    { entity: 'Google', type: 'brand' },
    { entity: 'SEO', type: 'concept' },
    { entity: 'Content Marketing', type: 'concept' },
    { entity: 'WordPress', type: 'technology' },
    { entity: 'Analytics', type: 'technology' },
    { entity: 'Strategy', type: 'concept' }
  ];
  
  for (const entity of mockEntities) {
    if (Math.random() > 0.4) {
      entities.push({
        ...entity,
        frequency: 1 + Math.floor(Math.random() * 5),
        competitors: 3 + Math.floor(Math.random() * 7),
        importance: Math.random() > 0.7 ? 'critical' : Math.random() > 0.5 ? 'high' : 'medium'
      });
    }
  }
  
  return entities;
}

/**
 * Detect search intent from keyword
 */
function detectSearchIntent(keyword: string): CompetitorSearchIntent {
  const lower = keyword.toLowerCase();
  
  if (lower.includes('buy') || lower.includes('price') || lower.includes('discount') || lower.includes('deal')) {
    return 'transactional';
  }
  if (lower.includes('best') || lower.includes('top') || lower.includes('review') || lower.includes('vs')) {
    return 'commercial';
  }
  if (lower.includes('near me') || lower.includes('location') || lower.includes('in ')) {
    return 'local';
  }
  if (lower.startsWith('how') || lower.startsWith('what') || lower.startsWith('why') || lower.includes('guide')) {
    return 'informational';
  }
  
  return 'informational';
}

/**
 * Calculate average metrics from competitors
 */
function calculateAverageMetricsFromCompetitors(competitors: SERPCompetitor[]): ContentMetrics {
  if (competitors.length === 0) {
    return {
      wordCount: 0,
      headingCount: { h1: 0, h2: 0, h3: 0, h4: 0, h5: 0, h6: 0, total: 0 },
      paragraphCount: 0,
      imageCount: 0,
      videoCount: 0,
      internalLinks: 0,
      externalLinks: 0,
      readingTime: 0,
      uniqueTerms: 0,
      entityCount: 0
    };
  }
  
  const sum = competitors.reduce((acc, c) => ({
    wordCount: acc.wordCount + c.wordCount,
    h1: acc.h1 + c.headingCount.h1,
    h2: acc.h2 + c.headingCount.h2,
    h3: acc.h3 + c.headingCount.h3,
    h4: acc.h4 + c.headingCount.h4,
    h5: acc.h5 + c.headingCount.h5,
    h6: acc.h6 + c.headingCount.h6,
    paragraphCount: acc.paragraphCount + c.paragraphCount,
    imageCount: acc.imageCount + c.imageCount,
    videoCount: acc.videoCount + c.videoCount,
    internalLinks: acc.internalLinks + c.internalLinks,
    externalLinks: acc.externalLinks + c.externalLinks,
    readingTime: acc.readingTime + c.estimatedReadTime,
    uniqueTerms: acc.uniqueTerms + c.topTerms.length,
    entityCount: acc.entityCount + c.entities.length
  }), {
    wordCount: 0, h1: 0, h2: 0, h3: 0, h4: 0, h5: 0, h6: 0,
    paragraphCount: 0, imageCount: 0, videoCount: 0,
    internalLinks: 0, externalLinks: 0, readingTime: 0,
    uniqueTerms: 0, entityCount: 0
  });
  
  const count = competitors.length;
  
  return {
    wordCount: Math.round(sum.wordCount / count),
    headingCount: {
      h1: Math.round(sum.h1 / count),
      h2: Math.round(sum.h2 / count),
      h3: Math.round(sum.h3 / count),
      h4: Math.round(sum.h4 / count),
      h5: Math.round(sum.h5 / count),
      h6: Math.round(sum.h6 / count),
      total: Math.round((sum.h1 + sum.h2 + sum.h3 + sum.h4 + sum.h5 + sum.h6) / count)
    },
    paragraphCount: Math.round(sum.paragraphCount / count),
    imageCount: Math.round(sum.imageCount / count),
    videoCount: Math.round(sum.videoCount / count),
    internalLinks: Math.round(sum.internalLinks / count),
    externalLinks: Math.round(sum.externalLinks / count),
    readingTime: Math.round(sum.readingTime / count),
    uniqueTerms: Math.round(sum.uniqueTerms / count),
    entityCount: Math.round(sum.entityCount / count)
  };
}

/**
 * Get metrics from a single competitor
 */
function getCompetitorMetrics(competitor: SERPCompetitor): ContentMetrics {
  return {
    wordCount: competitor.wordCount,
    headingCount: competitor.headingCount,
    paragraphCount: competitor.paragraphCount,
    imageCount: competitor.imageCount,
    videoCount: competitor.videoCount,
    internalLinks: competitor.internalLinks,
    externalLinks: competitor.externalLinks,
    readingTime: competitor.estimatedReadTime,
    uniqueTerms: competitor.topTerms.length,
    entityCount: competitor.entities.length
  };
}

// -----------------------------------------------------------------------------
// Export
// -----------------------------------------------------------------------------

export default useCompetitorAnalysis;

