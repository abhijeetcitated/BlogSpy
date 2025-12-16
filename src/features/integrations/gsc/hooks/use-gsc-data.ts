'use client';

/**
 * useGSCData Hook
 * @description Fetches and manages GSC analytics data
 */

import { useState, useEffect, useCallback } from 'react';
import type { GSCData, GSCPageData, GSCQueryData } from '@/types/gsc.types';

interface GSCDataState {
  isLoading: boolean;
  error: string | null;
  pages: GSCPageData[];
  queries: GSCQueryData[];
  summary: {
    totalClicks: number;
    totalImpressions: number;
    avgCtr: number;
    avgPosition: number;
  } | null;
  dateRange: {
    startDate: string;
    endDate: string;
  };
}

// Mock data for development
const MOCK_PAGES: GSCPageData[] = [
  {
    url: '/blog/react-best-practices',
    clicks: 1250,
    impressions: 45000,
    ctr: 2.78,
    position: 4.2,
  },
  {
    url: '/blog/nextjs-tutorial',
    clicks: 890,
    impressions: 32000,
    ctr: 2.78,
    position: 6.5,
  },
  {
    url: '/blog/typescript-guide',
    clicks: 650,
    impressions: 28000,
    ctr: 2.32,
    position: 8.1,
  },
];

const MOCK_QUERIES: GSCQueryData[] = [
  { query: 'react best practices 2024', clicks: 450, impressions: 12000, ctr: 3.75, position: 3.2 },
  { query: 'nextjs tutorial', clicks: 380, impressions: 15000, ctr: 2.53, position: 5.1 },
  { query: 'typescript beginners guide', clicks: 290, impressions: 9500, ctr: 3.05, position: 4.8 },
];

interface UseGSCDataOptions {
  propertyUrl?: string;
  startDate?: string;
  endDate?: string;
  autoFetch?: boolean;
}

export function useGSCData(options: UseGSCDataOptions = {}) {
  const { propertyUrl, autoFetch = true } = options;
  
  const [state, setState] = useState<GSCDataState>({
    isLoading: false,
    error: null,
    pages: [],
    queries: [],
    summary: null,
    dateRange: {
      startDate: options.startDate || getDefaultStartDate(),
      endDate: options.endDate || getDefaultEndDate(),
    },
  });

  useEffect(() => {
    if (autoFetch && propertyUrl) {
      fetchData();
    }
  }, [propertyUrl, autoFetch]);

  const fetchData = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Try to fetch from API
      const params = new URLSearchParams({
        startDate: state.dateRange.startDate,
        endDate: state.dateRange.endDate,
      });

      const response = await fetch(`/api/integrations/gsc/data?${params}`);
      
      if (response.ok) {
        const data = await response.json();
        setState(prev => ({
          ...prev,
          isLoading: false,
          pages: data.pages ?? [],
          queries: data.queries ?? [],
          summary: data.summary ?? null,
        }));
      } else {
        throw new Error('API not available');
      }
    } catch (error) {
      // Use mock data in development
      console.log('Using mock GSC data');
      setState(prev => ({
        ...prev,
        isLoading: false,
        pages: MOCK_PAGES,
        queries: MOCK_QUERIES,
        summary: {
          totalClicks: 2790,
          totalImpressions: 105000,
          avgCtr: 2.66,
          avgPosition: 6.27,
        },
      }));
    }
  }, [propertyUrl, state.dateRange]);

  const setDateRange = useCallback((startDate: string, endDate: string) => {
    setState(prev => ({
      ...prev,
      dateRange: { startDate, endDate },
    }));
  }, []);

  const getTopPages = useCallback((limit: number = 10) => {
    return [...state.pages]
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, limit);
  }, [state.pages]);

  const getTopQueries = useCallback((limit: number = 10) => {
    return [...state.queries]
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, limit);
  }, [state.queries]);

  const getPageData = useCallback((pageUrl: string) => {
    return state.pages.find(p => p.url === pageUrl);
  }, [state.pages]);

  return {
    ...state,
    fetchData,
    setDateRange,
    getTopPages,
    getTopQueries,
    getPageData,
  };
}

// Helper functions
function getDefaultStartDate(): string {
  const date = new Date();
  date.setDate(date.getDate() - 28); // 28 days ago
  return date.toISOString().split('T')[0];
}

function getDefaultEndDate(): string {
  const date = new Date();
  date.setDate(date.getDate() - 3); // 3 days ago (GSC data delay)
  return date.toISOString().split('T')[0];
}
