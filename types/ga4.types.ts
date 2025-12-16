/**
 * Google Analytics 4 Types
 * @description Types for GA4 API integration
 */

// ============================================
// GA4 API Response Types
// ============================================

export interface GA4Property {
  propertyId: string;
  displayName: string;
  websiteUrl: string | null;
  timeZone: string;
  currencyCode: string;
}

export interface GA4DimensionValue {
  value: string;
}

export interface GA4MetricValue {
  value: string;
}

export interface GA4Row {
  dimensionValues: GA4DimensionValue[];
  metricValues: GA4MetricValue[];
}

export interface GA4RunReportResponse {
  rows?: GA4Row[];
  rowCount?: number;
  metadata?: GA4ResponseMetadata;
  propertyQuota?: GA4PropertyQuota;
}

export interface GA4ResponseMetadata {
  currencyCode: string;
  timeZone: string;
}

export interface GA4PropertyQuota {
  tokensPerDay?: { consumed: number; remaining: number };
  tokensPerHour?: { consumed: number; remaining: number };
  concurrentRequests?: { consumed: number; remaining: number };
}

// ============================================
// GA4 Query Types
// ============================================

export interface GA4Dimension {
  name: string;
}

export interface GA4Metric {
  name: string;
}

export interface GA4DateRange {
  startDate: string;
  endDate: string;
}

export interface GA4Filter {
  fieldName: string;
  stringFilter?: {
    matchType: 'EXACT' | 'BEGINS_WITH' | 'ENDS_WITH' | 'CONTAINS' | 'FULL_REGEXP' | 'PARTIAL_REGEXP';
    value: string;
    caseSensitive?: boolean;
  };
  numericFilter?: {
    operation: 'EQUAL' | 'LESS_THAN' | 'LESS_THAN_OR_EQUAL' | 'GREATER_THAN' | 'GREATER_THAN_OR_EQUAL';
    value: { int64Value?: string; doubleValue?: number };
  };
}

export interface GA4FilterExpression {
  filter?: GA4Filter;
  andGroup?: { expressions: GA4FilterExpression[] };
  orGroup?: { expressions: GA4FilterExpression[] };
  notExpression?: GA4FilterExpression;
}

export interface GA4OrderBy {
  dimension?: { dimensionName: string; orderType?: 'ALPHANUMERIC' | 'CASE_INSENSITIVE_ALPHANUMERIC' | 'NUMERIC' };
  metric?: { metricName: string };
  desc?: boolean;
}

export interface GA4RunReportRequest {
  dateRanges: GA4DateRange[];
  dimensions?: GA4Dimension[];
  metrics: GA4Metric[];
  dimensionFilter?: GA4FilterExpression;
  metricFilter?: GA4FilterExpression;
  orderBys?: GA4OrderBy[];
  limit?: string;
  offset?: string;
  keepEmptyRows?: boolean;
}

// ============================================
// Processed Data Types
// ============================================

export interface GA4PageViewData {
  pagePath: string;
  pageTitle: string;
  views: number;
  users: number;
  sessions: number;
  avgEngagementTime: number;
  bounceRate: number;
  date: string;
}

export interface GA4TrafficSourceData {
  source: string;
  medium: string;
  campaign: string | null;
  users: number;
  sessions: number;
  conversions: number;
}

export interface GA4ComparisonData {
  pagePath: string;
  currentViews: number;
  previousViews: number;
  currentUsers: number;
  previousUsers: number;
  currentSessions: number;
  previousSessions: number;
  currentAvgEngagement: number;
  previousAvgEngagement: number;
  viewsChange: number;
  usersChange: number;
  sessionsChange: number;
  engagementChange: number;
}

// ============================================
// Integration Types
// ============================================

export interface GA4Integration {
  id: string;
  userId: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
  selectedPropertyId: string | null;
  properties: GA4Property[];
  createdAt: Date;
  updatedAt: Date;
}

export interface GA4OAuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
  scope: string;
}

export interface GA4ConnectionStatus {
  isConnected: boolean;
  selectedPropertyId: string | null;
  selectedPropertyName: string | null;
  lastSyncAt: Date | null;
  properties: GA4Property[];
}

// ============================================
// Cached Data Types
// ============================================

export interface GA4CachedData {
  id: string;
  userId: string;
  propertyId: string;
  pagePath: string;
  pageTitle: string | null;
  views: number;
  users: number;
  sessions: number;
  avgEngagementTime: number;
  bounceRate: number;
  date: string;
  createdAt: Date;
}

export interface GA4SyncJob {
  id: string;
  userId: string;
  propertyId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startDate: string;
  endDate: string;
  rowsProcessed: number;
  error: string | null;
  startedAt: Date | null;
  completedAt: Date | null;
  createdAt: Date;
}
