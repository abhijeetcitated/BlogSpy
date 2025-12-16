/**
 * Google Search Console Client
 * @description Client for Google Search Console API
 */

import { GOOGLE_API_ENDPOINTS, DEFAULT_GSC_QUERY, formatDateForAPI, getComparisonDateRanges } from './config';
import type {
  GSCProperty,
  GSCSearchAnalyticsQuery,
  GSCSearchAnalyticsResponse,
  GSCSearchAnalyticsRow,
  GSCPageData,
  GSCKeywordData,
  GSCComparisonData,
} from '@/types/gsc.types';

// ============================================
// GSC Client Class
// ============================================

export class GoogleSearchConsoleClient {
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  /**
   * Make authenticated request to GSC API
   */
  private async request<T>(url: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error(`GSC API Error: ${error.error?.message || error.error || response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get list of verified properties (sites)
   */
  async getProperties(): Promise<GSCProperty[]> {
    const data = await this.request<{ siteEntry?: GSCProperty[] }>(GOOGLE_API_ENDPOINTS.GSC_SITES);
    return data.siteEntry || [];
  }

  /**
   * Query search analytics data
   */
  async querySearchAnalytics(
    siteUrl: string,
    query: GSCSearchAnalyticsQuery
  ): Promise<GSCSearchAnalyticsResponse> {
    const url = GOOGLE_API_ENDPOINTS.GSC_SEARCH_ANALYTICS(siteUrl);
    
    return this.request<GSCSearchAnalyticsResponse>(url, {
      method: 'POST',
      body: JSON.stringify({
        ...DEFAULT_GSC_QUERY,
        ...query,
      }),
    });
  }

  /**
   * Get page performance data
   */
  async getPagePerformance(
    siteUrl: string,
    startDate: string,
    endDate: string,
    rowLimit: number = 1000
  ): Promise<GSCPageData[]> {
    const response = await this.querySearchAnalytics(siteUrl, {
      startDate,
      endDate,
      dimensions: ['page', 'date'],
      rowLimit,
    });

    if (!response.rows) {
      return [];
    }

    return response.rows.map((row: GSCSearchAnalyticsRow) => ({
      url: row.keys[0],
      date: row.keys[1],
      clicks: row.clicks,
      impressions: row.impressions,
      ctr: row.ctr,
      position: row.position,
    }));
  }

  /**
   * Get keyword performance data
   */
  async getKeywordPerformance(
    siteUrl: string,
    startDate: string,
    endDate: string,
    rowLimit: number = 1000
  ): Promise<GSCKeywordData[]> {
    const response = await this.querySearchAnalytics(siteUrl, {
      startDate,
      endDate,
      dimensions: ['query', 'page', 'date'],
      rowLimit,
    });

    if (!response.rows) {
      return [];
    }

    return response.rows.map((row: GSCSearchAnalyticsRow) => ({
      keyword: row.keys[0],
      url: row.keys[1],
      date: row.keys[2],
      clicks: row.clicks,
      impressions: row.impressions,
      ctr: row.ctr,
      position: row.position,
    }));
  }

  /**
   * Get aggregated page data (no date dimension)
   */
  async getAggregatedPageData(
    siteUrl: string,
    startDate: string,
    endDate: string,
    rowLimit: number = 1000
  ): Promise<Omit<GSCPageData, 'date'>[]> {
    const response = await this.querySearchAnalytics(siteUrl, {
      startDate,
      endDate,
      dimensions: ['page'],
      rowLimit,
    });

    if (!response.rows) {
      return [];
    }

    return response.rows.map((row: GSCSearchAnalyticsRow) => ({
      url: row.keys[0],
      clicks: row.clicks,
      impressions: row.impressions,
      ctr: row.ctr,
      position: row.position,
    }));
  }

  /**
   * Get comparison data between two periods
   */
  async getComparisonData(
    siteUrl: string,
    currentDays: number = 30,
    previousDays: number = 30
  ): Promise<GSCComparisonData[]> {
    const { current, previous } = getComparisonDateRanges(currentDays, previousDays);

    // Fetch both periods in parallel
    const [currentData, previousData] = await Promise.all([
      this.getAggregatedPageData(siteUrl, current.start, current.end),
      this.getAggregatedPageData(siteUrl, previous.start, previous.end),
    ]);

    // Create map of previous data
    const previousMap = new Map(previousData.map((d) => [d.url, d]));

    // Merge and calculate changes
    return currentData.map((curr) => {
      const prev = previousMap.get(curr.url) || {
        clicks: 0,
        impressions: 0,
        ctr: 0,
        position: 0,
      };

      return {
        url: curr.url,
        keyword: '', // Will be filled if querying by keyword
        currentClicks: curr.clicks,
        previousClicks: prev.clicks,
        currentImpressions: curr.impressions,
        previousImpressions: prev.impressions,
        currentPosition: curr.position,
        previousPosition: prev.position,
        currentCtr: curr.ctr,
        previousCtr: prev.ctr,
        clicksChange: prev.clicks > 0 ? ((curr.clicks - prev.clicks) / prev.clicks) * 100 : 0,
        impressionsChange: prev.impressions > 0 ? ((curr.impressions - prev.impressions) / prev.impressions) * 100 : 0,
        positionChange: prev.position - curr.position, // Positive = improvement
        ctrChange: prev.ctr > 0 ? ((curr.ctr - prev.ctr) / prev.ctr) * 100 : 0,
      };
    });
  }

  /**
   * Get top declining pages
   */
  async getTopDecliningPages(
    siteUrl: string,
    limit: number = 20,
    currentDays: number = 30,
    previousDays: number = 30
  ): Promise<GSCComparisonData[]> {
    const data = await this.getComparisonData(siteUrl, currentDays, previousDays);

    // Sort by clicks decline (most negative first)
    return data
      .filter((d) => d.clicksChange < 0) // Only declining
      .sort((a, b) => a.clicksChange - b.clicksChange)
      .slice(0, limit);
  }

  /**
   * Get sitemaps for a site
   */
  async getSitemaps(siteUrl: string): Promise<unknown[]> {
    const url = GOOGLE_API_ENDPOINTS.GSC_SITEMAPS(siteUrl);
    const data = await this.request<{ sitemap?: unknown[] }>(url);
    return data.sitemap || [];
  }
}

// ============================================
// Factory Function
// ============================================

export function createGSCClient(accessToken: string): GoogleSearchConsoleClient {
  return new GoogleSearchConsoleClient(accessToken);
}
