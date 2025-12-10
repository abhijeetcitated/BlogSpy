// Project Types

export interface Project {
  id: string;
  name: string;
  domain: string;
  userId: string;
  keywords: string[];
  competitors: Competitor[];
  settings: ProjectSettings;
  createdAt: Date;
  updatedAt: Date;
}

export interface Competitor {
  id: string;
  domain: string;
  name?: string;
  isActive: boolean;
}

export interface ProjectSettings {
  trackingFrequency: TrackingFrequency;
  location: string;
  language: string;
  device: DeviceType;
  notifications: boolean;
}

export type TrackingFrequency = 'daily' | 'weekly' | 'monthly';
export type DeviceType = 'desktop' | 'mobile' | 'both';

export interface Ranking {
  id: string;
  keywordId: string;
  keyword: string;
  projectId: string;
  position: number;
  previousPosition?: number;
  change: number;
  url: string;
  date: Date;
  searchEngine: SearchEngine;
  device: DeviceType;
}

export type SearchEngine = 'google' | 'bing' | 'yahoo';

export interface RankingHistory {
  keyword: string;
  history: RankingDataPoint[];
}

export interface RankingDataPoint {
  date: Date;
  position: number;
  url: string;
}

export interface ContentDecay {
  id: string;
  url: string;
  title: string;
  keyword: string;
  currentPosition: number;
  previousPosition: number;
  decayPercentage: number;
  lastUpdated: Date;
  suggestedActions: string[];
}

export interface GapAnalysis {
  yourKeywords: string[];
  competitorKeywords: string[];
  sharedKeywords: string[];
  opportunities: GapOpportunity[];
}

export interface GapOpportunity {
  keyword: string;
  volume: number;
  difficulty: number;
  competitorRanking: number;
  potential: 'high' | 'medium' | 'low';
}

export interface ContentRoadmap {
  id: string;
  projectId: string;
  items: RoadmapItem[];
  createdAt: Date;
}

export interface RoadmapItem {
  id: string;
  title: string;
  keyword: string;
  priority: Priority;
  status: ContentStatus;
  dueDate?: Date;
  assignee?: string;
  notes?: string;
}

export type Priority = 'high' | 'medium' | 'low';
export type ContentStatus = 'idea' | 'planned' | 'in_progress' | 'review' | 'published';
