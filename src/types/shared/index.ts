/**
 * Shared Types - Single Source of Truth
 * 
 * This module contains common types used across multiple features.
 * Import from '@/types/shared' to use these types.
 */

// ============================================
// SORTING TYPES
// ============================================

/**
 * Sort direction - universal across all features
 */
export type SortDirection = 'asc' | 'desc';

/**
 * Base sort field type - extend this for feature-specific sort fields
 * @example
 * type MyFeatureSortField = BaseSortField<'keyword' | 'volume' | 'rank'>;
 */
export type BaseSortField<T extends string = string> = T | null;

/**
 * Common sort fields used across multiple features
 */
export type CommonSortField = 
  | 'keyword' 
  | 'volume' 
  | 'kd' 
  | 'cpc' 
  | 'trend' 
  | 'date'
  | 'rank'
  | 'change'
  | null;

/**
 * Generic sort state
 */
export interface SortState<TField extends string = string> {
  field: TField | null;
  direction: SortDirection;
}

// ============================================
// COUNTRY TYPES
// ============================================

/**
 * Country - standard structure for all features
 */
export interface Country {
  code: string;
  name: string;
  flag: string;
}

/**
 * Country with interest score (for geo-targeting features)
 */
export interface CountryInterest extends Country {
  interest: number;
  score?: number;
}

// ============================================
// FILTER TYPES
// ============================================

/**
 * Base filter state - extend for feature-specific filters
 */
export interface BaseFilterState {
  searchQuery: string;
  sortDirection: SortDirection;
}

/**
 * Common filter state with range filters
 */
export interface CommonFilterState extends BaseFilterState {
  volumeRange: [number, number];
  kdRange: [number, number];
  cpcRange: [number, number];
  selectedIntents: string[];
  includeTerms: string[];
  excludeTerms: string[];
}

/**
 * Default shared filter state alias.
 */
export type FilterState = CommonFilterState;

/**
 * Pagination state
 */
export interface PaginationState {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

// ============================================
// API RESPONSE TYPES
// ============================================

/**
 * Standard API response wrapper
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Paginated API response
 */
export interface PaginatedResponse<T = unknown> extends ApiResponse<T[]> {
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/**
 * API error response
 */
export interface ApiError {
  error: string;
  message?: string;
  code?: string;
  status?: number;
}

// ============================================
// COMMON DATA TYPES
// ============================================

/**
 * Time range options for filters
 */
export type TimeRange = '24h' | '7d' | '30d' | '90d' | '12m' | 'all';

/**
 * Trend direction - simple version (up/down/stable)
 */
export type SimpleTrendDirection = 'up' | 'down' | 'stable';

/**
 * Trend direction - detailed version (for keyword/content features)
 */
export type TrendDirection = 
  | 'rising' 
  | 'growing' 
  | 'stable' 
  | 'declining' 
  | 'falling';

/**
 * Search intent types
 */
export type SearchIntent = 
  | 'informational' 
  | 'commercial' 
  | 'transactional' 
  | 'navigational';

/**
 * Difficulty level
 */
export interface DifficultyLevel {
  label: string;
  range: string;
  min: number;
  max: number;
  color: string;
}

/**
 * Date range
 */
export interface DateRange {
  from: Date | null;
  to: Date | null;
}

// ============================================
// UTILITY TYPES
// ============================================

/**
 * Make all properties optional except specified keys
 */
export type PartialExcept<T, K extends keyof T> = Partial<T> & Pick<T, K>;

/**
 * Extract non-null values from type
 */
export type NonNullableFields<T> = {
  [P in keyof T]: NonNullable<T[P]>;
};

/**
 * ID type for entities
 */
export type EntityId = string;

/**
 * Timestamp fields common to entities
 */
export interface TimestampFields {
  createdAt: Date | string;
  updatedAt: Date | string;
}
