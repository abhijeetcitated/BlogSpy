// Keyword Types

export interface Keyword {
  id: string;
  term: string;
  volume: number;
  difficulty: number;
  cpc: number;
  trend: TrendDirection;
  intent: SearchIntent;
  serp?: SerpFeature[];
  createdAt: Date;
  updatedAt: Date;
}

export type TrendDirection = 'up' | 'down' | 'stable';
export type SearchIntent = 'informational' | 'navigational' | 'commercial' | 'transactional';

export interface KeywordWithMetrics extends Keyword {
  clicks?: number;
  impressions?: number;
  ctr?: number;
  position?: number;
  trendData?: number[];
}

export interface KeywordResearch {
  seed: string;
  keywords: Keyword[];
  totalResults: number;
  filters: KeywordFilters;
}

export interface KeywordFilters {
  minVolume?: number;
  maxVolume?: number;
  minDifficulty?: number;
  maxDifficulty?: number;
  intent?: SearchIntent[];
  includeTerms?: string[];
  excludeTerms?: string[];
}

export interface SerpFeature {
  type: SerpFeatureType;
  position?: number;
}

export type SerpFeatureType = 
  | 'featured_snippet'
  | 'people_also_ask'
  | 'local_pack'
  | 'knowledge_panel'
  | 'video'
  | 'image'
  | 'shopping'
  | 'news'
  | 'reviews'
  | 'sitelinks';

export interface KeywordGroup {
  id: string;
  name: string;
  keywords: Keyword[];
  createdAt: Date;
}

export interface TopicCluster {
  id: string;
  pillarKeyword: Keyword;
  clusterKeywords: Keyword[];
  totalVolume: number;
  avgDifficulty: number;
}

export interface TrendingKeyword extends Keyword {
  growthRate: number;
  peakDate?: Date;
  relatedQueries: string[];
}
