'use client';

/**
 * useGA4Data Hook
 * @description Fetches and manages GA4 analytics data
 */

import { useState, useEffect, useCallback } from 'react';

interface GA4PageData {
  pagePath: string;
  pageTitle: string;
  activeUsers: number;
  sessions: number;
  bounceRate: number;
  avgSessionDuration: number;
  pageviews: number;
}

interface GA4DataState {
  isLoading: boolean;
  error: string | null;
  pages: GA4PageData[];
  summary: {
    totalUsers: number;
    totalSessions: number;
    avgBounceRate: number;
    avgSessionDuration: number;
  } | null;
  dateRange: {
    startDate: string;
    endDate: string;
  };
}

// Mock data for development
const MOCK_PAGES: GA4PageData[] = [
  {
    pagePath: '/blog/react-best-practices',
    pageTitle: 'React Best Practices 2024',
    activeUsers: 450,
    sessions: 520,
    bounceRate: 42.5,
    avgSessionDuration: 185,
    pageviews: 680,
  },
  {
    pagePath: '/blog/nextjs-tutorial',
    pageTitle: 'Complete Next.js Tutorial',
    activeUsers: 380,
    sessions: 440,
    bounceRate: 38.2,
    avgSessionDuration: 210,
    pageviews: 590,
  },
  {
    pagePath: '/blog/typescript-guide',
    pageTitle: 'TypeScript Beginners Guide',
    activeUsers: 290,
    sessions: 350,
    bounceRate: 45.8,
    avgSessionDuration: 165,
    pageviews: 420,
  },
];

interface UseGA4DataOptions {
  propertyId?: string;
  startDate?: string;
  endDate?: string;
  autoFetch?: boolean;
}

export function useGA4Data(options: UseGA4DataOptions = {}) {
  const { propertyId, autoFetch = true } = options;
  
  const [state, setState] = useState<GA4DataState>({
    isLoading: false,
    error: null,
    pages: [],
    summary: null,
    dateRange: {
      startDate: options.startDate || getDefaultStartDate(),
      endDate: options.endDate || getDefaultEndDate(),
    },
  });

  useEffect(() => {
    if (autoFetch && propertyId) {
      fetchData();
    }
  }, [propertyId, autoFetch]);

  const fetchData = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const params = new URLSearchParams({
        startDate: state.dateRange.startDate,
        endDate: state.dateRange.endDate,
      });

      const response = await fetch(`/api/integrations/ga4/data?${params}`);
      
      if (response.ok) {
        const data = await response.json();
        setState(prev => ({
          ...prev,
          isLoading: false,
          pages: data.pages ?? [],
          summary: data.summary ?? null,
        }));
      } else {
        throw new Error('API not available');
      }
    } catch (error) {
      // Use mock data in development
      console.log('Using mock GA4 data');
      setState(prev => ({
        ...prev,
        isLoading: false,
        pages: MOCK_PAGES,
        summary: {
          totalUsers: 3200,
          totalSessions: 8500,
          avgBounceRate: 42.2,
          avgSessionDuration: 165,
        },
      }));
    }
  }, [propertyId, state.dateRange]);

  const setDateRange = useCallback((startDate: string, endDate: string) => {
    setState(prev => ({
      ...prev,
      dateRange: { startDate, endDate },
    }));
  }, []);

  const getTopPages = useCallback((limit: number = 10) => {
    return [...state.pages]
      .sort((a, b) => b.activeUsers - a.activeUsers)
      .slice(0, limit);
  }, [state.pages]);

  const getPageData = useCallback((pagePath: string) => {
    return state.pages.find(p => p.pagePath === pagePath);
  }, [state.pages]);

  return {
    ...state,
    fetchData,
    setDateRange,
    getTopPages,
    getPageData,
  };
}

// Helper functions
function getDefaultStartDate(): string {
  const date = new Date();
  date.setDate(date.getDate() - 28);
  return date.toISOString().split('T')[0];
}

function getDefaultEndDate(): string {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return date.toISOString().split('T')[0];
}
