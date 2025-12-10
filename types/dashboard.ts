// ============================================
// BLOGSPY DASHBOARD TYPE DEFINITIONS
// ============================================
// All TypeScript types for the dashboard
// These types ensure type safety across the app
// ============================================

// ============ KEYWORD TYPES ============
export interface Keyword {
  id: string;
  keyword: string;
  volume: number;
  kd: number; // Keyword Difficulty (0-100)
  cpc: number;
  trend: "up" | "down" | "stable";
  trendData?: number[];
  intent?: "informational" | "commercial" | "transactional" | "navigational";
  position?: number;
  url?: string;
  change?: number;
  serp?: SerpFeature[];
}

export interface KeywordGroup {
  id: string;
  name: string;
  keywords: Keyword[];
  avgVolume: number;
  avgKd: number;
}

// ============ SERP TYPES ============
export type SerpFeature = 
  | "featured_snippet"
  | "people_also_ask"
  | "local_pack"
  | "image_pack"
  | "video"
  | "knowledge_panel"
  | "shopping"
  | "news"
  | "reviews"
  | "sitelinks";

export interface SerpAnalysis {
  keyword: string;
  features: SerpFeature[];
  topResults: SerpResult[];
  difficulty: number;
}

export interface SerpResult {
  position: number;
  url: string;
  title: string;
  domain: string;
  snippet: string;
}

// ============ CONTENT TYPES ============
export interface ContentItem {
  id: string;
  title: string;
  url: string;
  status: "published" | "draft" | "scheduled" | "decaying";
  publishDate: string;
  lastUpdated?: string;
  traffic?: number;
  trafficChange?: number;
  keywords?: string[];
  score?: number;
}

export interface ContentDecay {
  id: string;
  title: string;
  url: string;
  currentTraffic: number;
  peakTraffic: number;
  decayPercentage: number;
  lastUpdated: string;
  suggestedActions: string[];
}

export interface ContentRoadmapItem {
  id: string;
  title: string;
  targetKeyword: string;
  status: "idea" | "research" | "writing" | "review" | "published";
  priority: "high" | "medium" | "low";
  dueDate?: string;
  assignee?: string;
  estimatedTraffic?: number;
}

// ============ COMPETITOR TYPES ============
export interface Competitor {
  id: string;
  domain: string;
  name?: string;
  visibility: number;
  visibilityChange?: number;
  keywords: number;
  traffic: number;
  commonKeywords?: number;
  gaps?: number;
}

export interface CompetitorGap {
  keyword: string;
  volume: number;
  difficulty: number;
  yourPosition: number | null;
  competitorPositions: {
    domain: string;
    position: number;
  }[];
  opportunity: "high" | "medium" | "low";
}

// ============ TOPIC CLUSTER TYPES ============
export interface TopicCluster {
  id: string;
  pillarTopic: string;
  pillarUrl?: string;
  subtopics: Subtopic[];
  totalVolume: number;
  avgDifficulty: number;
  coverage: number; // percentage of subtopics covered
}

export interface Subtopic {
  id: string;
  topic: string;
  keyword: string;
  volume: number;
  difficulty: number;
  status: "not_started" | "in_progress" | "published" | "linked";
  url?: string;
}

export interface ClusterNode {
  id: string;
  label: string;
  type: "pillar" | "subtopic";
  volume?: number;
  status?: string;
}

export interface ClusterEdge {
  source: string;
  target: string;
}

// ============ RANK TRACKING TYPES ============
export interface RankingData {
  id: string;
  keyword: string;
  currentPosition: number;
  previousPosition: number;
  change: number;
  url: string;
  volume: number;
  lastChecked: string;
  history?: RankHistory[];
}

export interface RankHistory {
  date: string;
  position: number;
}

export interface RankingOverview {
  totalKeywords: number;
  avgPosition: number;
  top3: number;
  top10: number;
  top100: number;
  improved: number;
  declined: number;
  noChange: number;
}

// ============ TREND TYPES ============
export interface TrendingTopic {
  id: string;
  topic: string;
  keyword: string;
  volume: number;
  growth: number; // percentage
  growthData: number[];
  category?: string;
  relatedKeywords?: string[];
  region?: string;
}

export interface TrendData {
  date: string;
  value: number;
}

// ============ ON-PAGE SEO TYPES ============
export interface OnPageAnalysis {
  url: string;
  overallScore: number;
  title: TitleAnalysis;
  meta: MetaAnalysis;
  headings: HeadingAnalysis;
  content: ContentAnalysis;
  images: ImageAnalysis;
  links: LinkAnalysis;
  technical: TechnicalAnalysis;
}

export interface TitleAnalysis {
  text: string;
  length: number;
  score: number;
  issues: string[];
  suggestions: string[];
}

export interface MetaAnalysis {
  description: string;
  length: number;
  score: number;
  issues: string[];
  suggestions: string[];
}

export interface HeadingAnalysis {
  h1Count: number;
  h2Count: number;
  h3Count: number;
  structure: string[];
  score: number;
  issues: string[];
}

export interface ContentAnalysis {
  wordCount: number;
  readabilityScore: number;
  keywordDensity: number;
  score: number;
  issues: string[];
}

export interface ImageAnalysis {
  totalImages: number;
  missingAlt: number;
  score: number;
  issues: string[];
}

export interface LinkAnalysis {
  internalLinks: number;
  externalLinks: number;
  brokenLinks: number;
  score: number;
  issues: string[];
}

export interface TechnicalAnalysis {
  loadTime: number;
  mobileOptimized: boolean;
  httpsEnabled: boolean;
  score: number;
  issues: string[];
}

// ============ SNIPPET TYPES ============
export interface FeaturedSnippet {
  id: string;
  keyword: string;
  type: "paragraph" | "list" | "table" | "video";
  currentOwner: string;
  yourPosition: number;
  volume: number;
  opportunity: number; // 0-100 score
  suggestedContent?: string;
}

// ============ AI WRITER TYPES ============
export interface AIWriterConfig {
  tone: "professional" | "casual" | "friendly" | "authoritative";
  length: "short" | "medium" | "long";
  targetKeyword: string;
  secondaryKeywords: string[];
  outline?: string[];
}

export interface AIGeneratedContent {
  id: string;
  title: string;
  content: string;
  targetKeyword: string;
  seoScore: number;
  readabilityScore: number;
  wordCount: number;
  createdAt: string;
}

// ============ DASHBOARD STATS TYPES ============
export interface DashboardStats {
  totalKeywords: number;
  keywordsChange: number;
  avgPosition: number;
  positionChange: number;
  totalTraffic: number;
  trafficChange: number;
  contentScore: number;
  scoreChange: number;
}

export interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  href: string;
  color?: string;
}

export interface RecentActivity {
  id: string;
  type: "rank_change" | "content_published" | "keyword_added" | "alert" | "competitor";
  title: string;
  description: string;
  timestamp: string;
  href?: string;
  metadata?: Record<string, unknown>;
}

// ============ USER & CREDITS TYPES ============
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  plan: "free" | "pro" | "agency";
  credits: number;
  maxCredits: number;
}

export interface CreditUsage {
  feature: string;
  credits: number;
  timestamp: string;
}

// ============ FILTER & PAGINATION TYPES ============
export interface FilterOptions {
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  minVolume?: number;
  maxVolume?: number;
  minKd?: number;
  maxKd?: number;
  intent?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
}

export interface PaginationOptions {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationOptions;
}

// ============ API RESPONSE TYPES ============
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}
