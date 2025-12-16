/**
 * Google Analytics 4 Client
 * @description Client for GA4 Data API
 */

import { GOOGLE_API_ENDPOINTS, DEFAULT_GA4_QUERY, formatDateForAPI, getComparisonDateRanges } from './config';
import type {
  GA4Property,
  GA4RunReportRequest,
  GA4RunReportResponse,
  GA4PageViewData,
  GA4TrafficSourceData,
  GA4ComparisonData,
} from '@/types/ga4.types';

// ============================================
// GA4 Client Class
// ============================================

export class GoogleAnalytics4Client {
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  /**
   * Make authenticated request to GA4 API
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
      throw new Error(`GA4 API Error: ${error.error?.message || error.error || response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get list of GA4 properties the user has access to
   */
  async getProperties(): Promise<GA4Property[]> {
    // First get accounts
    const accountsData = await this.request<{ accounts?: { name: string; displayName: string }[] }>(
      GOOGLE_API_ENDPOINTS.GA4_ACCOUNTS
    );

    if (!accountsData.accounts?.length) {
      return [];
    }

    // Get properties for each account
    const allProperties: GA4Property[] = [];

    for (const account of accountsData.accounts) {
      const accountId = account.name.split('/')[1];
      const propertiesUrl = `${GOOGLE_API_ENDPOINTS.GA4_ADMIN}/properties?filter=parent:accounts/${accountId}`;
      
      const propertiesData = await this.request<{
        properties?: {
          name: string;
          displayName: string;
          timeZone: string;
          currencyCode: string;
        }[];
      }>(propertiesUrl);

      if (propertiesData.properties) {
        allProperties.push(
          ...propertiesData.properties.map((p) => ({
            propertyId: p.name.split('/')[1],
            displayName: p.displayName,
            websiteUrl: null,
            timeZone: p.timeZone,
            currencyCode: p.currencyCode,
          }))
        );
      }
    }

    return allProperties;
  }

  /**
   * Run a report query
   */
  async runReport(propertyId: string, request: GA4RunReportRequest): Promise<GA4RunReportResponse> {
    const url = GOOGLE_API_ENDPOINTS.GA4_RUN_REPORT(propertyId);

    return this.request<GA4RunReportResponse>(url, {
      method: 'POST',
      body: JSON.stringify({
        ...DEFAULT_GA4_QUERY,
        ...request,
      }),
    });
  }

  /**
   * Get page views data
   */
  async getPageViews(
    propertyId: string,
    startDate: string,
    endDate: string,
    limit: number = 1000
  ): Promise<GA4PageViewData[]> {
    const response = await this.runReport(propertyId, {
      dateRanges: [{ startDate, endDate }],
      dimensions: [
        { name: 'pagePath' },
        { name: 'pageTitle' },
        { name: 'date' },
      ],
      metrics: [
        { name: 'screenPageViews' },
        { name: 'activeUsers' },
        { name: 'sessions' },
        { name: 'averageSessionDuration' },
        { name: 'bounceRate' },
      ],
      limit: String(limit),
    });

    if (!response.rows) {
      return [];
    }

    return response.rows.map((row) => ({
      pagePath: row.dimensionValues[0]?.value || '',
      pageTitle: row.dimensionValues[1]?.value || '',
      date: row.dimensionValues[2]?.value || '',
      views: parseInt(row.metricValues[0]?.value || '0', 10),
      users: parseInt(row.metricValues[1]?.value || '0', 10),
      sessions: parseInt(row.metricValues[2]?.value || '0', 10),
      avgEngagementTime: parseFloat(row.metricValues[3]?.value || '0'),
      bounceRate: parseFloat(row.metricValues[4]?.value || '0'),
    }));
  }

  /**
   * Get aggregated page data (no date dimension)
   */
  async getAggregatedPageData(
    propertyId: string,
    startDate: string,
    endDate: string,
    limit: number = 1000
  ): Promise<Omit<GA4PageViewData, 'date'>[]> {
    const response = await this.runReport(propertyId, {
      dateRanges: [{ startDate, endDate }],
      dimensions: [
        { name: 'pagePath' },
        { name: 'pageTitle' },
      ],
      metrics: [
        { name: 'screenPageViews' },
        { name: 'activeUsers' },
        { name: 'sessions' },
        { name: 'averageSessionDuration' },
        { name: 'bounceRate' },
      ],
      limit: String(limit),
    });

    if (!response.rows) {
      return [];
    }

    return response.rows.map((row) => ({
      pagePath: row.dimensionValues[0]?.value || '',
      pageTitle: row.dimensionValues[1]?.value || '',
      views: parseInt(row.metricValues[0]?.value || '0', 10),
      users: parseInt(row.metricValues[1]?.value || '0', 10),
      sessions: parseInt(row.metricValues[2]?.value || '0', 10),
      avgEngagementTime: parseFloat(row.metricValues[3]?.value || '0'),
      bounceRate: parseFloat(row.metricValues[4]?.value || '0'),
    }));
  }

  /**
   * Get traffic source data
   */
  async getTrafficSources(
    propertyId: string,
    startDate: string,
    endDate: string,
    limit: number = 100
  ): Promise<GA4TrafficSourceData[]> {
    const response = await this.runReport(propertyId, {
      dateRanges: [{ startDate, endDate }],
      dimensions: [
        { name: 'sessionSource' },
        { name: 'sessionMedium' },
        { name: 'sessionCampaignName' },
      ],
      metrics: [
        { name: 'activeUsers' },
        { name: 'sessions' },
        { name: 'conversions' },
      ],
      limit: String(limit),
    });

    if (!response.rows) {
      return [];
    }

    return response.rows.map((row) => ({
      source: row.dimensionValues[0]?.value || '(direct)',
      medium: row.dimensionValues[1]?.value || '(none)',
      campaign: row.dimensionValues[2]?.value || null,
      users: parseInt(row.metricValues[0]?.value || '0', 10),
      sessions: parseInt(row.metricValues[1]?.value || '0', 10),
      conversions: parseInt(row.metricValues[2]?.value || '0', 10),
    }));
  }

  /**
   * Get comparison data between two periods
   */
  async getComparisonData(
    propertyId: string,
    currentDays: number = 30,
    previousDays: number = 30
  ): Promise<GA4ComparisonData[]> {
    const { current, previous } = getComparisonDateRanges(currentDays, previousDays);

    // Fetch both periods in parallel
    const [currentData, previousData] = await Promise.all([
      this.getAggregatedPageData(propertyId, current.start, current.end),
      this.getAggregatedPageData(propertyId, previous.start, previous.end),
    ]);

    // Create map of previous data
    const previousMap = new Map(previousData.map((d) => [d.pagePath, d]));

    // Merge and calculate changes
    return currentData.map((curr) => {
      const prev = previousMap.get(curr.pagePath) || {
        views: 0,
        users: 0,
        sessions: 0,
        avgEngagementTime: 0,
        bounceRate: 0,
      };

      return {
        pagePath: curr.pagePath,
        currentViews: curr.views,
        previousViews: prev.views,
        currentUsers: curr.users,
        previousUsers: prev.users,
        currentSessions: curr.sessions,
        previousSessions: prev.sessions,
        currentAvgEngagement: curr.avgEngagementTime,
        previousAvgEngagement: prev.avgEngagementTime,
        viewsChange: prev.views > 0 ? ((curr.views - prev.views) / prev.views) * 100 : 0,
        usersChange: prev.users > 0 ? ((curr.users - prev.users) / prev.users) * 100 : 0,
        sessionsChange: prev.sessions > 0 ? ((curr.sessions - prev.sessions) / prev.sessions) * 100 : 0,
        engagementChange: prev.avgEngagementTime > 0
          ? ((curr.avgEngagementTime - prev.avgEngagementTime) / prev.avgEngagementTime) * 100
          : 0,
      };
    });
  }

  /**
   * Get top declining pages by views
   */
  async getTopDecliningPages(
    propertyId: string,
    limit: number = 20,
    currentDays: number = 30,
    previousDays: number = 30
  ): Promise<GA4ComparisonData[]> {
    const data = await this.getComparisonData(propertyId, currentDays, previousDays);

    // Sort by views decline (most negative first)
    return data
      .filter((d) => d.viewsChange < 0)
      .sort((a, b) => a.viewsChange - b.viewsChange)
      .slice(0, limit);
  }
}

// ============================================
// Factory Function
// ============================================

export function createGA4Client(accessToken: string): GoogleAnalytics4Client {
  return new GoogleAnalytics4Client(accessToken);
}
