/**
 * Content Decay Detection Types
 * @description Types for decay detection algorithm
 */

// ============================================
// Decay Score Types
// ============================================

export type DecayLevel = 'critical' | 'high' | 'medium' | 'low' | 'healthy';
export type DecayTrend = 'declining' | 'stable' | 'improving';

export interface DecayScore {
  id: string;
  userId: string;
  url: string;
  title: string;
  overallScore: number; // 0-100 (100 = healthy, 0 = critical decay)
  level: DecayLevel;
  trend: DecayTrend;
  
  // Individual decay factors
  trafficDecay: number; // % change in traffic
  positionDecay: number; // % change in position (avg)
  ctrDecay: number; // % change in CTR
  engagementDecay: number; // % change in engagement time
  
  // Metadata
  comparisonPeriod: {
    current: { start: string; end: string };
    previous: { start: string; end: string };
  };
  
  // Timestamps
  calculatedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// Decay Analysis Types
// ============================================

export interface DecayAnalysisInput {
  url: string;
  title: string;
  
  // GSC Data
  gscCurrent: {
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
  };
  gscPrevious: {
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
  };
  
  // GA4 Data (optional)
  ga4Current?: {
    views: number;
    users: number;
    sessions: number;
    avgEngagementTime: number;
    bounceRate: number;
  };
  ga4Previous?: {
    views: number;
    users: number;
    sessions: number;
    avgEngagementTime: number;
    bounceRate: number;
  };
}

export interface DecayAnalysisResult {
  url: string;
  title: string;
  overallScore: number;
  level: DecayLevel;
  trend: DecayTrend;
  
  factors: {
    trafficDecay: {
      value: number;
      weight: number;
      contribution: number;
    };
    positionDecay: {
      value: number;
      weight: number;
      contribution: number;
    };
    ctrDecay: {
      value: number;
      weight: number;
      contribution: number;
    };
    engagementDecay: {
      value: number;
      weight: number;
      contribution: number;
    };
  };
  
  recommendations: DecayRecommendation[];
}

export interface DecayRecommendation {
  type: 'update_content' | 'improve_title' | 'add_internal_links' | 'update_meta' | 'refresh_data' | 'add_media' | 'check_competitors';
  priority: 'high' | 'medium' | 'low';
  message: string;
  estimatedImpact: string;
}

// ============================================
// Decay Alert Types
// ============================================

export interface DecayAlert {
  id: string;
  userId: string;
  decayScoreId: string;
  url: string;
  title: string;
  level: DecayLevel;
  score: number;
  previousScore: number;
  message: string;
  isRead: boolean;
  sentVia: ('email' | 'slack' | 'webhook')[];
  sentAt: Date | null;
  createdAt: Date;
}

export interface DecayAlertPreferences {
  id: string;
  userId: string;
  isEnabled: boolean;
  minLevel: DecayLevel; // Minimum level to trigger alert
  channels: {
    email: boolean;
    slack: boolean;
    webhook: boolean;
  };
  frequency: 'immediate' | 'daily' | 'weekly';
  quietHours: {
    enabled: boolean;
    start: string; // HH:mm
    end: string; // HH:mm
    timezone: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// Decay Batch Processing Types
// ============================================

export interface DecayBatchJob {
  id: string;
  userId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  totalUrls: number;
  processedUrls: number;
  decayingUrls: number;
  error: string | null;
  startedAt: Date | null;
  completedAt: Date | null;
  createdAt: Date;
}

export interface DecayBatchResult {
  jobId: string;
  userId: string;
  totalUrls: number;
  processedUrls: number;
  results: {
    healthy: number;
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  topDecaying: DecayScore[];
  completedAt: Date;
}

// ============================================
// Decay History Types
// ============================================

export interface DecayHistoryEntry {
  id: string;
  decayScoreId: string;
  score: number;
  level: DecayLevel;
  recordedAt: Date;
}

export interface DecayTrendAnalysis {
  url: string;
  title: string;
  currentScore: number;
  currentLevel: DecayLevel;
  history: {
    date: string;
    score: number;
    level: DecayLevel;
  }[];
  trend: DecayTrend;
  trendDirection: 'up' | 'down' | 'stable';
  trendPercentage: number;
  prediction: {
    nextWeekScore: number;
    nextMonthScore: number;
    willBecomeCritical: boolean;
    estimatedCriticalDate: string | null;
  };
}

// ============================================
// Configuration Types
// ============================================

export interface DecayDetectionConfig {
  // Scoring weights (must sum to 100)
  weights: {
    traffic: number; // Default: 35
    position: number; // Default: 30
    ctr: number; // Default: 20
    engagement: number; // Default: 15
  };
  
  // Thresholds for decay levels
  thresholds: {
    critical: number; // Score below this = critical (default: 20)
    high: number; // Score below this = high (default: 40)
    medium: number; // Score below this = medium (default: 60)
    low: number; // Score below this = low (default: 80)
    // Above low threshold = healthy
  };
  
  // Comparison periods
  comparisonPeriod: {
    currentDays: number; // Default: 30
    previousDays: number; // Default: 30
    gapDays: number; // Default: 0 (no gap between periods)
  };
  
  // Minimum data requirements
  minimumData: {
    impressions: number; // Default: 100
    clicks: number; // Default: 10
  };
}

export const DEFAULT_DECAY_CONFIG: DecayDetectionConfig = {
  weights: {
    traffic: 35,
    position: 30,
    ctr: 20,
    engagement: 15,
  },
  thresholds: {
    critical: 20,
    high: 40,
    medium: 60,
    low: 80,
  },
  comparisonPeriod: {
    currentDays: 30,
    previousDays: 30,
    gapDays: 0,
  },
  minimumData: {
    impressions: 100,
    clicks: 10,
  },
};
