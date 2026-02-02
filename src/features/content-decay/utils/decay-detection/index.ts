/**
 * Decay Detection Library
 * @description Exports for content decay detection system
 */

export * from './calculator';
export * from './trend-analyzer';

// Re-export types
export type {
  DecayLevel,
  DecayTrend,
  DecayScore,
  DecayAnalysisInput,
  DecayAnalysisResult,
  DecayRecommendation,
  DecayDetectionConfig,
  DecayAlert,
  DecayAlertPreferences,
  DecayBatchJob,
  DecayBatchResult,
  DecayHistoryEntry,
  DecayTrendAnalysis,
} from '@/types/decay-detection.types';
