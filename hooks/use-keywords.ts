'use client';

import { useState, useCallback } from 'react';
import type { Keyword, KeywordFilters, KeywordWithMetrics } from '@/types/keyword';

// Mock keyword data for demo
const MOCK_KEYWORDS: KeywordWithMetrics[] = [
  {
    id: '1',
    term: 'best seo tools 2024',
    volume: 12400,
    difficulty: 45,
    cpc: 4.50,
    trend: 'up',
    intent: 'commercial',
    trendData: [65, 70, 68, 75, 80, 85, 90],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    term: 'how to improve seo',
    volume: 8200,
    difficulty: 35,
    cpc: 2.80,
    trend: 'stable',
    intent: 'informational',
    trendData: [50, 52, 48, 51, 50, 53, 52],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '3',
    term: 'keyword research tool',
    volume: 6800,
    difficulty: 55,
    cpc: 5.20,
    trend: 'up',
    intent: 'commercial',
    trendData: [40, 45, 50, 55, 60, 62, 68],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '4',
    term: 'seo for beginners',
    volume: 14500,
    difficulty: 28,
    cpc: 1.90,
    trend: 'stable',
    intent: 'informational',
    trendData: [80, 78, 82, 79, 81, 80, 82],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '5',
    term: 'buy seo software',
    volume: 2400,
    difficulty: 62,
    cpc: 8.50,
    trend: 'up',
    intent: 'transactional',
    trendData: [20, 25, 30, 35, 40, 42, 48],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

interface UseKeywordsReturn {
  keywords: KeywordWithMetrics[];
  isLoading: boolean;
  error: string | null;
  searchKeywords: (seed: string, filters?: KeywordFilters) => Promise<void>;
  getKeywordDetails: (id: string) => KeywordWithMetrics | undefined;
  filterKeywords: (filters: KeywordFilters) => KeywordWithMetrics[];
  sortKeywords: (field: keyof Keyword, order: 'asc' | 'desc') => void;
}

export function useKeywords(): UseKeywordsReturn {
  const [keywords, setKeywords] = useState<KeywordWithMetrics[]>(MOCK_KEYWORDS);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchKeywords = useCallback(async (seed: string, filters?: KeywordFilters) => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800));

      // Generate mock results based on seed
      const mockResults: KeywordWithMetrics[] = [
        {
          id: `${Date.now()}-1`,
          term: seed,
          volume: Math.floor(Math.random() * 50000) + 1000,
          difficulty: Math.floor(Math.random() * 100),
          cpc: Number((Math.random() * 10).toFixed(2)),
          trend: ['up', 'down', 'stable'][Math.floor(Math.random() * 3)] as 'up' | 'down' | 'stable',
          intent: ['informational', 'commercial', 'transactional', 'navigational'][Math.floor(Math.random() * 4)] as Keyword['intent'],
          trendData: Array(7).fill(0).map(() => Math.floor(Math.random() * 100)),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: `${Date.now()}-2`,
          term: `best ${seed}`,
          volume: Math.floor(Math.random() * 30000) + 500,
          difficulty: Math.floor(Math.random() * 100),
          cpc: Number((Math.random() * 8).toFixed(2)),
          trend: ['up', 'down', 'stable'][Math.floor(Math.random() * 3)] as 'up' | 'down' | 'stable',
          intent: 'commercial',
          trendData: Array(7).fill(0).map(() => Math.floor(Math.random() * 100)),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: `${Date.now()}-3`,
          term: `how to ${seed}`,
          volume: Math.floor(Math.random() * 20000) + 200,
          difficulty: Math.floor(Math.random() * 60),
          cpc: Number((Math.random() * 5).toFixed(2)),
          trend: ['up', 'down', 'stable'][Math.floor(Math.random() * 3)] as 'up' | 'down' | 'stable',
          intent: 'informational',
          trendData: Array(7).fill(0).map(() => Math.floor(Math.random() * 100)),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        ...MOCK_KEYWORDS,
      ];

      // Apply filters if provided
      let filtered = mockResults;
      if (filters) {
        if (filters.minVolume !== undefined) {
          filtered = filtered.filter(k => k.volume >= filters.minVolume!);
        }
        if (filters.maxVolume !== undefined) {
          filtered = filtered.filter(k => k.volume <= filters.maxVolume!);
        }
        if (filters.minDifficulty !== undefined) {
          filtered = filtered.filter(k => k.difficulty >= filters.minDifficulty!);
        }
        if (filters.maxDifficulty !== undefined) {
          filtered = filtered.filter(k => k.difficulty <= filters.maxDifficulty!);
        }
        if (filters.intent && filters.intent.length > 0) {
          filtered = filtered.filter(k => filters.intent!.includes(k.intent));
        }
      }

      setKeywords(filtered);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search keywords');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getKeywordDetails = useCallback((id: string): KeywordWithMetrics | undefined => {
    return keywords.find(k => k.id === id);
  }, [keywords]);

  const filterKeywords = useCallback((filters: KeywordFilters): KeywordWithMetrics[] => {
    return keywords.filter(k => {
      if (filters.minVolume !== undefined && k.volume < filters.minVolume) return false;
      if (filters.maxVolume !== undefined && k.volume > filters.maxVolume) return false;
      if (filters.minDifficulty !== undefined && k.difficulty < filters.minDifficulty) return false;
      if (filters.maxDifficulty !== undefined && k.difficulty > filters.maxDifficulty) return false;
      if (filters.intent && filters.intent.length > 0 && !filters.intent.includes(k.intent)) return false;
      return true;
    });
  }, [keywords]);

  const sortKeywords = useCallback((field: keyof Keyword, order: 'asc' | 'desc') => {
    setKeywords(prev => {
      const sorted = [...prev].sort((a, b) => {
        const aVal = a[field];
        const bVal = b[field];
        
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return order === 'asc' ? aVal - bVal : bVal - aVal;
        }
        
        if (typeof aVal === 'string' && typeof bVal === 'string') {
          return order === 'asc' 
            ? aVal.localeCompare(bVal)
            : bVal.localeCompare(aVal);
        }
        
        return 0;
      });
      return sorted;
    });
  }, []);

  return {
    keywords,
    isLoading,
    error,
    searchKeywords,
    getKeywordDetails,
    filterKeywords,
    sortKeywords,
  };
}

// Hook for trending keywords
export function useTrendingKeywords() {
  const [trending, setTrending] = useState<KeywordWithMetrics[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchTrending = useCallback(async () => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setTrending(MOCK_KEYWORDS.filter(k => k.trend === 'up'));
    setIsLoading(false);
  }, []);

  return { trending, isLoading, fetchTrending };
}
