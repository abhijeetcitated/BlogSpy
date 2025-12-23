'use client';

// =============================================================================
// USE INTERNAL LINKING HOOK - Production Level
// =============================================================================
// State management for internal linking suggestions
// =============================================================================

import { useState, useCallback, useMemo } from 'react';
import {
  InternalLinkingAnalysis,
  LinkSuggestion,
  InternalLinkingSettings,
  SitePage,
  LinkRelevance,
  DEFAULT_INTERNAL_LINKING_SETTINGS
} from '@/src/features/ai-writer/types/tools/internal-linking.types';
import {
  analyzeInternalLinking,
  exportLinkingReport
} from '@/src/features/ai-writer/utils/tools/internal-linking';

// =============================================================================
// TYPES
// =============================================================================

interface UseInternalLinkingOptions {
  sitePages?: SitePage[];
  contentKeywords?: string[];
  onLinkInsert?: (suggestion: LinkSuggestion) => void;
}

interface UseInternalLinkingReturn {
  // State
  analysis: InternalLinkingAnalysis | null;
  isAnalyzing: boolean;
  settings: InternalLinkingSettings;
  
  // Computed
  score: number;
  pendingSuggestions: LinkSuggestion[];
  appliedSuggestions: LinkSuggestion[];
  dismissedSuggestions: LinkSuggestion[];
  highRelevanceCount: number;
  issueCount: number;
  
  // Actions
  analyze: (content: string) => void;
  applySuggestion: (suggestion: LinkSuggestion) => void;
  dismissSuggestion: (suggestionId: string) => void;
  undoSuggestion: (suggestionId: string) => void;
  updateSettings: (settings: Partial<InternalLinkingSettings>) => void;
  resetAnalysis: () => void;
  exportReport: () => string;
  
  // Bulk actions
  applyAllHighRelevance: () => void;
  dismissAllLowRelevance: () => void;
  
  // Filtering
  filterSuggestionsByRelevance: (relevance: LinkRelevance) => LinkSuggestion[];
  filterSuggestionsByPage: (pageId: string) => LinkSuggestion[];
}

// =============================================================================
// MOCK SITE PAGES (for demo)
// =============================================================================

const MOCK_SITE_PAGES: SitePage[] = [
  {
    id: 'page-1',
    url: '/blog/seo-fundamentals',
    slug: 'seo-fundamentals',
    title: 'SEO Fundamentals: Complete Guide',
    primaryKeyword: 'SEO fundamentals',
    secondaryKeywords: ['search engine optimization', 'SEO basics', 'SEO guide'],
    category: 'SEO',
    tags: ['seo', 'beginners', 'guide'],
    isPillarContent: true,
    inboundLinks: 15,
    outboundLinks: 8,
    pageAuthority: 65,
    wordCount: 3500,
    lastUpdated: '2024-01-15',
    topicCluster: 'seo-basics'
  },
  {
    id: 'page-2',
    url: '/blog/keyword-research',
    slug: 'keyword-research',
    title: 'Keyword Research: Step-by-Step Process',
    primaryKeyword: 'keyword research',
    secondaryKeywords: ['find keywords', 'keyword analysis', 'keyword tools'],
    category: 'SEO',
    tags: ['keywords', 'research', 'tools'],
    isPillarContent: true,
    inboundLinks: 12,
    outboundLinks: 10,
    pageAuthority: 60,
    wordCount: 4200,
    lastUpdated: '2024-01-20',
    topicCluster: 'seo-basics'
  },
  {
    id: 'page-3',
    url: '/blog/on-page-seo',
    slug: 'on-page-seo',
    title: 'On-Page SEO Optimization Tips',
    primaryKeyword: 'on-page SEO',
    secondaryKeywords: ['meta tags', 'title optimization', 'content optimization'],
    category: 'SEO',
    tags: ['on-page', 'optimization', 'tips'],
    isPillarContent: false,
    inboundLinks: 8,
    outboundLinks: 6,
    pageAuthority: 55,
    wordCount: 2800,
    lastUpdated: '2024-02-01',
    topicCluster: 'seo-basics'
  },
  {
    id: 'page-4',
    url: '/blog/link-building-strategies',
    slug: 'link-building-strategies',
    title: 'Link Building Strategies That Work',
    primaryKeyword: 'link building',
    secondaryKeywords: ['backlinks', 'outreach', 'link acquisition'],
    category: 'SEO',
    tags: ['links', 'building', 'backlinks'],
    isPillarContent: true,
    inboundLinks: 10,
    outboundLinks: 12,
    pageAuthority: 58,
    wordCount: 3800,
    lastUpdated: '2024-01-25',
    topicCluster: 'link-building'
  },
  {
    id: 'page-5',
    url: '/blog/content-marketing',
    slug: 'content-marketing',
    title: 'Content Marketing Strategy Guide',
    primaryKeyword: 'content marketing',
    secondaryKeywords: ['content strategy', 'marketing', 'content creation'],
    category: 'Content',
    tags: ['content', 'marketing', 'strategy'],
    isPillarContent: true,
    inboundLinks: 14,
    outboundLinks: 9,
    pageAuthority: 62,
    wordCount: 4000,
    lastUpdated: '2024-02-05',
    topicCluster: 'content'
  },
  {
    id: 'page-6',
    url: '/blog/technical-seo',
    slug: 'technical-seo',
    title: 'Technical SEO: Complete Checklist',
    primaryKeyword: 'technical SEO',
    secondaryKeywords: ['site speed', 'crawlability', 'indexation'],
    category: 'SEO',
    tags: ['technical', 'seo', 'checklist'],
    isPillarContent: false,
    inboundLinks: 6,
    outboundLinks: 8,
    pageAuthority: 52,
    wordCount: 3200,
    lastUpdated: '2024-02-10',
    topicCluster: 'seo-basics'
  },
  {
    id: 'page-7',
    url: '/blog/local-seo',
    slug: 'local-seo',
    title: 'Local SEO: Rank in Your Area',
    primaryKeyword: 'local SEO',
    secondaryKeywords: ['Google My Business', 'local search', 'citations'],
    category: 'SEO',
    tags: ['local', 'seo', 'business'],
    isPillarContent: false,
    inboundLinks: 0, // Orphan page
    outboundLinks: 5,
    pageAuthority: 45,
    wordCount: 2500,
    lastUpdated: '2024-01-30',
    topicCluster: 'local-seo'
  },
  {
    id: 'page-8',
    url: '/blog/seo-tools',
    slug: 'seo-tools',
    title: 'Best SEO Tools for 2024',
    primaryKeyword: 'SEO tools',
    secondaryKeywords: ['SEO software', 'keyword tools', 'analytics tools'],
    category: 'Tools',
    tags: ['tools', 'software', 'seo'],
    isPillarContent: false,
    inboundLinks: 4,
    outboundLinks: 15,
    pageAuthority: 50,
    wordCount: 3000,
    lastUpdated: '2024-02-12',
    topicCluster: 'seo-basics'
  },
  {
    id: 'page-9',
    url: '/blog/mobile-seo',
    slug: 'mobile-seo',
    title: 'Mobile SEO Best Practices',
    primaryKeyword: 'mobile SEO',
    secondaryKeywords: ['mobile-first', 'responsive design', 'mobile optimization'],
    category: 'SEO',
    tags: ['mobile', 'seo', 'optimization'],
    isPillarContent: false,
    inboundLinks: 0, // Orphan page
    outboundLinks: 4,
    pageAuthority: 42,
    wordCount: 2200,
    lastUpdated: '2024-02-08',
    topicCluster: 'technical-seo'
  },
  {
    id: 'page-10',
    url: '/blog/ecommerce-seo',
    slug: 'ecommerce-seo',
    title: 'E-commerce SEO: Boost Your Store',
    primaryKeyword: 'ecommerce SEO',
    secondaryKeywords: ['product pages', 'category optimization', 'shopping SEO'],
    category: 'SEO',
    tags: ['ecommerce', 'seo', 'store'],
    isPillarContent: false,
    inboundLinks: 3,
    outboundLinks: 7,
    pageAuthority: 48,
    wordCount: 2900,
    lastUpdated: '2024-02-15',
    topicCluster: 'ecommerce'
  }
];

// =============================================================================
// HOOK IMPLEMENTATION
// =============================================================================

export function useInternalLinking(
  options: UseInternalLinkingOptions = {}
): UseInternalLinkingReturn {
  const {
    sitePages = MOCK_SITE_PAGES,
    contentKeywords = [],
    onLinkInsert
  } = options;

  // State
  const [analysis, setAnalysis] = useState<InternalLinkingAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [settings, setSettings] = useState<InternalLinkingSettings>(DEFAULT_INTERNAL_LINKING_SETTINGS);
  const [suggestionStatuses, setSuggestionStatuses] = useState<Map<string, 'applied' | 'dismissed'>>(new Map());

  // Analyze content
  const analyze = useCallback((content: string) => {
    setIsAnalyzing(true);
    
    // Simulate async analysis
    setTimeout(() => {
      const result = analyzeInternalLinking(
        content,
        contentKeywords,
        sitePages,
        settings
      );
      
      setAnalysis(result);
      setSuggestionStatuses(new Map());
      setIsAnalyzing(false);
    }, 500);
  }, [contentKeywords, sitePages, settings]);

  // Apply suggestion
  const applySuggestion = useCallback((suggestion: LinkSuggestion) => {
    setSuggestionStatuses(prev => {
      const next = new Map(prev);
      next.set(suggestion.id, 'applied');
      return next;
    });
    
    // Update analysis
    setAnalysis(prev => {
      if (!prev) return prev;
      
      return {
        ...prev,
        suggestions: prev.suggestions.map(s => 
          s.id === suggestion.id 
            ? { ...s, status: 'applied' as const }
            : s
        )
      };
    });
    
    // Trigger insert callback
    if (onLinkInsert) {
      onLinkInsert(suggestion);
    }
  }, [onLinkInsert]);

  // Dismiss suggestion
  const dismissSuggestion = useCallback((suggestionId: string) => {
    setSuggestionStatuses(prev => {
      const next = new Map(prev);
      next.set(suggestionId, 'dismissed');
      return next;
    });
    
    setAnalysis(prev => {
      if (!prev) return prev;
      
      return {
        ...prev,
        suggestions: prev.suggestions.map(s => 
          s.id === suggestionId 
            ? { ...s, status: 'dismissed' as const }
            : s
        )
      };
    });
  }, []);

  // Undo suggestion
  const undoSuggestion = useCallback((suggestionId: string) => {
    setSuggestionStatuses(prev => {
      const next = new Map(prev);
      next.delete(suggestionId);
      return next;
    });
    
    setAnalysis(prev => {
      if (!prev) return prev;
      
      return {
        ...prev,
        suggestions: prev.suggestions.map(s => 
          s.id === suggestionId 
            ? { ...s, status: 'pending' as const }
            : s
        )
      };
    });
  }, []);

  // Update settings
  const updateSettings = useCallback((newSettings: Partial<InternalLinkingSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  // Reset analysis
  const resetAnalysis = useCallback(() => {
    setAnalysis(null);
    setSuggestionStatuses(new Map());
  }, []);

  // Export report
  const exportReport = useCallback((): string => {
    if (!analysis) return '';
    return exportLinkingReport(analysis);
  }, [analysis]);

  // Apply all high relevance
  const applyAllHighRelevance = useCallback(() => {
    if (!analysis) return;
    
    const highRelevance = analysis.suggestions.filter(
      s => s.relevance === 'high' && s.status === 'pending'
    );
    
    highRelevance.forEach(s => applySuggestion(s));
  }, [analysis, applySuggestion]);

  // Dismiss all low relevance
  const dismissAllLowRelevance = useCallback(() => {
    if (!analysis) return;
    
    const lowRelevance = analysis.suggestions.filter(
      s => s.relevance === 'low' && s.status === 'pending'
    );
    
    lowRelevance.forEach(s => dismissSuggestion(s.id));
  }, [analysis, dismissSuggestion]);

  // Filter by relevance
  const filterSuggestionsByRelevance = useCallback((relevance: LinkRelevance): LinkSuggestion[] => {
    if (!analysis) return [];
    return analysis.suggestions.filter(s => s.relevance === relevance);
  }, [analysis]);

  // Filter by page
  const filterSuggestionsByPage = useCallback((pageId: string): LinkSuggestion[] => {
    if (!analysis) return [];
    return analysis.suggestions.filter(s => s.targetPage.id === pageId);
  }, [analysis]);

  // Computed values
  const score = useMemo(() => {
    return analysis?.metrics.overallScore || 0;
  }, [analysis]);

  const pendingSuggestions = useMemo(() => {
    return analysis?.suggestions.filter(s => s.status === 'pending') || [];
  }, [analysis]);

  const appliedSuggestions = useMemo(() => {
    return analysis?.suggestions.filter(s => s.status === 'applied') || [];
  }, [analysis]);

  const dismissedSuggestions = useMemo(() => {
    return analysis?.suggestions.filter(s => s.status === 'dismissed') || [];
  }, [analysis]);

  const highRelevanceCount = useMemo(() => {
    return analysis?.highRelevanceSuggestions || 0;
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
    pendingSuggestions,
    appliedSuggestions,
    dismissedSuggestions,
    highRelevanceCount,
    issueCount,
    
    // Actions
    analyze,
    applySuggestion,
    dismissSuggestion,
    undoSuggestion,
    updateSettings,
    resetAnalysis,
    exportReport,
    
    // Bulk actions
    applyAllHighRelevance,
    dismissAllLowRelevance,
    
    // Filtering
    filterSuggestionsByRelevance,
    filterSuggestionsByPage
  };
}

export default useInternalLinking;

