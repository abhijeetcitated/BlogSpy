/**
 * Google Search Console Types
 * @description Types for GSC API integration
 */

// ============================================
// GSC API Response Types
// ============================================

export interface GSCProperty {
  siteUrl: string;
  permissionLevel: 'siteOwner' | 'siteFullUser' | 'siteRestrictedUser' | 'siteUnverifiedUser';
}

export interface GSCSearchAnalyticsRow {
  keys: string[];
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export interface GSCSearchAnalyticsResponse {
  rows?: GSCSearchAnalyticsRow[];
  responseAggregationType?: string;
}

// ============================================
// GSC Query Types
// ============================================

export type GSCDimension = 'query' | 'page' | 'country' | 'device' | 'date' | 'searchAppearance';
export type GSCAggregationType = 'auto' | 'byPage' | 'byProperty';
export type GSCDataState = 'all' | 'final';

export interface GSCDimensionFilter {
  dimension: GSCDimension;
  operator: 'equals' | 'notEquals' | 'contains' | 'notContains' | 'includingRegex' | 'excludingRegex';
  expression: string;
}

export interface GSCDimensionFilterGroup {
  groupType: 'and';
  filters: GSCDimensionFilter[];
}

export interface GSCSearchAnalyticsQuery {
  startDate: string;
  endDate: string;
  dimensions?: GSCDimension[];
  dimensionFilterGroups?: GSCDimensionFilterGroup[];
  aggregationType?: GSCAggregationType;
  rowLimit?: number;
  startRow?: number;
  dataState?: GSCDataState;
}

// ============================================
// Processed Data Types
// ============================================

export interface GSCPageData {
  url: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
  date?: string;
}

export interface GSCKeywordData {
  keyword: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
  url: string;
  date: string;
}

// Alias for hook compatibility
export interface GSCQueryData {
  query: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export interface GSCData {
  pages: GSCPageData[];
  queries: GSCQueryData[];
  summary: {
    totalClicks: number;
    totalImpressions: number;
    avgCtr: number;
    avgPosition: number;
  };
}

export interface GSCComparisonData {
  url: string;
  keyword: string;
  currentClicks: number;
  previousClicks: number;
  currentImpressions: number;
  previousImpressions: number;
  currentPosition: number;
  previousPosition: number;
  currentCtr: number;
  previousCtr: number;
  clicksChange: number;
  impressionsChange: number;
  positionChange: number;
  ctrChange: number;
}

// ============================================
// Integration Types
// ============================================

export interface GSCIntegration {
  id: string;
  userId: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
  selectedProperty: string | null;
  properties: GSCProperty[];
  createdAt: Date;
  updatedAt: Date;
}

export interface GSCOAuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
  scope: string;
}

export interface GSCConnectionStatus {
  isConnected: boolean;
  selectedProperty: string | null;
  lastSyncAt: Date | null;
  properties: GSCProperty[];
}

// ============================================
// Cached Data Types
// ============================================

export interface GSCCachedData {
  id: string;
  userId: string;
  property: string;
  url: string;
  keyword: string | null;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
  date: string;
  createdAt: Date;
}

export interface GSCSyncJob {
  id: string;
  userId: string;
  property: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startDate: string;
  endDate: string;
  rowsProcessed: number;
  error: string | null;
  startedAt: Date | null;
  completedAt: Date | null;
  createdAt: Date;
}
