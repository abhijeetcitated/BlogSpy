// @ts-nocheck
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Decay Detection Service
 * @description Service layer for content decay detection with database operations
 * 
 * NOTE: @ts-nocheck is temporary until real Supabase client is installed
 */

import { createClient } from '@/lib/supabase/server';
import { decayCalculator, trendAnalyzer } from '@/lib/decay-detection';
import { gscService } from './gsc.service';
import { ga4Service } from './ga4.service';
import type {
  DecayScore,
  DecayLevel,
  DecayAnalysisInput,
  DecayAnalysisResult,
  DecayAlert,
  DecayAlertPreferences,
  DecayBatchJob,
  DecayBatchResult,
  DecayHistoryEntry,
  DecayTrendAnalysis,
} from '@/types/decay-detection.types';

// ============================================
// Decay Detection Service Class
// ============================================

export class DecayDetectionService {
  /**
   * Get or create Supabase client for server-side operations
   */
  private async getSupabase() {
    return await createClient();
  }

  /**
   * Get decay scores for a user
   */
  async getDecayScores(
    userId: string,
    options?: {
      level?: DecayLevel;
      limit?: number;
      offset?: number;
    }
  ): Promise<{ scores: DecayScore[]; total: number }> {
    const supabase = await this.getSupabase();
    
    let query = supabase
      .from('decay_scores')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('overall_score', { ascending: true });

    if (options?.level) {
      query = query.eq('level', options.level);
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }

    const { data, error, count } = await query;

    if (error) {
      throw new Error(`Failed to get decay scores: ${error.message}`);
    }

    const scores: DecayScore[] = (data || []).map((d) => ({
      id: d.id,
      userId: d.user_id,
      url: d.url,
      title: d.title,
      overallScore: d.overall_score,
      level: d.level,
      trend: d.trend,
      trafficDecay: d.traffic_decay,
      positionDecay: d.position_decay,
      ctrDecay: d.ctr_decay,
      engagementDecay: d.engagement_decay,
      comparisonPeriod: d.comparison_period,
      calculatedAt: new Date(d.calculated_at),
      createdAt: new Date(d.created_at),
      updatedAt: new Date(d.updated_at),
    }));

    return { scores, total: count || 0 };
  }

  /**
   * Get decay score for a specific URL
   */
  async getDecayScoreByUrl(userId: string, url: string): Promise<DecayScore | null> {
    const supabase = await this.getSupabase();
    
    const { data, error } = await supabase
      .from('decay_scores')
      .select('*')
      .eq('user_id', userId)
      .eq('url', url)
      .single();

    if (error || !data) {
      return null;
    }

    return {
      id: data.id,
      userId: data.user_id,
      url: data.url,
      title: data.title,
      overallScore: data.overall_score,
      level: data.level,
      trend: data.trend,
      trafficDecay: data.traffic_decay,
      positionDecay: data.position_decay,
      ctrDecay: data.ctr_decay,
      engagementDecay: data.engagement_decay,
      comparisonPeriod: data.comparison_period,
      calculatedAt: new Date(data.calculated_at),
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  /**
   * Save or update decay score
   */
  async saveDecayScore(
    userId: string,
    result: DecayAnalysisResult,
    comparisonPeriod: { current: { start: string; end: string }; previous: { start: string; end: string } }
  ): Promise<DecayScore> {
    const supabase = await this.getSupabase();
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from('decay_scores')
      .upsert(
        {
          user_id: userId,
          url: result.url,
          title: result.title,
          overall_score: result.overallScore,
          level: result.level,
          trend: result.trend,
          traffic_decay: result.factors.trafficDecay.value,
          position_decay: result.factors.positionDecay.value,
          ctr_decay: result.factors.ctrDecay.value,
          engagement_decay: result.factors.engagementDecay.value,
          comparison_period: comparisonPeriod,
          calculated_at: now,
          updated_at: now,
        },
        {
          onConflict: 'user_id,url',
        }
      )
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to save decay score: ${error.message}`);
    }

    // Save to history
    await this.addToHistory(data.id, result.overallScore, result.level);

    return {
      id: data.id,
      userId: data.user_id,
      url: data.url,
      title: data.title,
      overallScore: data.overall_score,
      level: data.level,
      trend: data.trend,
      trafficDecay: data.traffic_decay,
      positionDecay: data.position_decay,
      ctrDecay: data.ctr_decay,
      engagementDecay: data.engagement_decay,
      comparisonPeriod: data.comparison_period,
      calculatedAt: new Date(data.calculated_at),
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  /**
   * Add entry to decay history
   */
  private async addToHistory(decayScoreId: string, score: number, level: DecayLevel): Promise<void> {
    const supabase = await this.getSupabase();

    await supabase.from('decay_history').insert({
      decay_score_id: decayScoreId,
      score,
      level,
      recorded_at: new Date().toISOString(),
    });
  }

  /**
   * Get decay history for a score
   */
  async getDecayHistory(decayScoreId: string, limit: number = 30): Promise<DecayHistoryEntry[]> {
    const supabase = await this.getSupabase();

    const { data, error } = await supabase
      .from('decay_history')
      .select('*')
      .eq('decay_score_id', decayScoreId)
      .order('recorded_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to get decay history: ${error.message}`);
    }

    return (data || []).map((d) => ({
      id: d.id,
      decayScoreId: d.decay_score_id,
      score: d.score,
      level: d.level,
      recordedAt: new Date(d.recorded_at),
    }));
  }

  /**
   * Analyze decay for all pages
   */
  async analyzeAllPages(userId: string): Promise<DecayBatchResult> {
    // Create batch job
    const job = await this.createBatchJob(userId);

    try {
      // Update job status to running
      await this.updateBatchJob(job.id, { status: 'running', startedAt: new Date() });

      // Get GSC comparison data
      const gscData = await gscService.getComparisonData(userId);

      // Try to get GA4 data (optional)
      let ga4Data: { pagePath: string; currentViews: number; previousViews: number; currentAvgEngagement: number; previousAvgEngagement: number }[] = [];
      try {
        ga4Data = await ga4Service.getComparisonData(userId);
      } catch {
        console.log('[DecayDetection] GA4 data not available, using GSC only');
      }

      // Create URL to GA4 data map
      const ga4Map = new Map(ga4Data.map((d) => [d.pagePath, d]));

      // Prepare analysis inputs
      const inputs: DecayAnalysisInput[] = gscData.map((gsc) => {
        const urlPath = new URL(gsc.url).pathname;
        const ga4 = ga4Map.get(urlPath);

        return {
          url: gsc.url,
          title: gsc.url, // Will be updated with actual title if available
          gscCurrent: {
            clicks: gsc.currentClicks,
            impressions: gsc.currentImpressions,
            ctr: gsc.currentCtr,
            position: gsc.currentPosition,
          },
          gscPrevious: {
            clicks: gsc.previousClicks,
            impressions: gsc.previousImpressions,
            ctr: gsc.previousCtr,
            position: gsc.previousPosition,
          },
          ga4Current: ga4
            ? {
                views: ga4.currentViews,
                users: 0,
                sessions: 0,
                avgEngagementTime: ga4.currentAvgEngagement,
                bounceRate: 0,
              }
            : undefined,
          ga4Previous: ga4
            ? {
                views: ga4.previousViews,
                users: 0,
                sessions: 0,
                avgEngagementTime: ga4.previousAvgEngagement,
                bounceRate: 0,
              }
            : undefined,
        };
      });

      // Analyze all pages
      const results = decayCalculator.analyzeMany(inputs);

      // Get comparison period
      const now = new Date();
      const currentEnd = new Date(now);
      currentEnd.setDate(currentEnd.getDate() - 2);
      const currentStart = new Date(currentEnd);
      currentStart.setDate(currentStart.getDate() - 30);
      const previousEnd = new Date(currentStart);
      previousEnd.setDate(previousEnd.getDate() - 1);
      const previousStart = new Date(previousEnd);
      previousStart.setDate(previousStart.getDate() - 30);

      const comparisonPeriod = {
        current: {
          start: currentStart.toISOString().split('T')[0],
          end: currentEnd.toISOString().split('T')[0],
        },
        previous: {
          start: previousStart.toISOString().split('T')[0],
          end: previousEnd.toISOString().split('T')[0],
        },
      };

      // Save all results
      let processedCount = 0;
      const summary = { healthy: 0, low: 0, medium: 0, high: 0, critical: 0 };
      const topDecaying: DecayScore[] = [];

      for (const result of results) {
        const score = await this.saveDecayScore(userId, result, comparisonPeriod);
        processedCount++;
        summary[result.level]++;

        // Track top decaying
        if (result.level === 'critical' || result.level === 'high') {
          topDecaying.push(score);
        }

        // Update job progress
        await this.updateBatchJob(job.id, { processedUrls: processedCount });
      }

      // Sort top decaying by score
      topDecaying.sort((a, b) => a.overallScore - b.overallScore);

      // Complete job
      await this.updateBatchJob(job.id, {
        status: 'completed',
        processedUrls: processedCount,
        decayingUrls: summary.critical + summary.high + summary.medium,
        completedAt: new Date(),
      });

      return {
        jobId: job.id,
        userId,
        totalUrls: inputs.length,
        processedUrls: processedCount,
        results: summary,
        topDecaying: topDecaying.slice(0, 10),
        completedAt: new Date(),
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      await this.updateBatchJob(job.id, {
        status: 'failed',
        error: errorMessage,
        completedAt: new Date(),
      });
      throw error;
    }
  }

  /**
   * Create batch job
   */
  private async createBatchJob(userId: string): Promise<DecayBatchJob> {
    const supabase = await this.getSupabase();

    const { data, error } = await supabase
      .from('decay_batch_jobs')
      .insert({
        user_id: userId,
        status: 'pending',
        total_urls: 0,
        processed_urls: 0,
        decaying_urls: 0,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create batch job: ${error.message}`);
    }

    return {
      id: data.id,
      userId: data.user_id,
      status: data.status,
      totalUrls: data.total_urls,
      processedUrls: data.processed_urls,
      decayingUrls: data.decaying_urls,
      error: data.error,
      startedAt: data.started_at ? new Date(data.started_at) : null,
      completedAt: data.completed_at ? new Date(data.completed_at) : null,
      createdAt: new Date(data.created_at),
    };
  }

  /**
   * Update batch job
   */
  private async updateBatchJob(
    jobId: string,
    update: Partial<{
      status: 'running' | 'completed' | 'failed';
      totalUrls: number;
      processedUrls: number;
      decayingUrls: number;
      error: string;
      startedAt: Date;
      completedAt: Date;
    }>
  ): Promise<void> {
    const supabase = await this.getSupabase();

    const { error } = await supabase
      .from('decay_batch_jobs')
      .update({
        ...(update.status && { status: update.status }),
        ...(update.totalUrls !== undefined && { total_urls: update.totalUrls }),
        ...(update.processedUrls !== undefined && { processed_urls: update.processedUrls }),
        ...(update.decayingUrls !== undefined && { decaying_urls: update.decayingUrls }),
        ...(update.error && { error: update.error }),
        ...(update.startedAt && { started_at: update.startedAt.toISOString() }),
        ...(update.completedAt && { completed_at: update.completedAt.toISOString() }),
      })
      .eq('id', jobId);

    if (error) {
      throw new Error(`Failed to update batch job: ${error.message}`);
    }
  }

  /**
   * Get summary statistics
   */
  async getSummary(userId: string): Promise<{
    total: number;
    byLevel: Record<DecayLevel, number>;
    averageScore: number;
    needsAttention: number;
  }> {
    const { scores, total } = await this.getDecayScores(userId);
    
    const byLevel: Record<DecayLevel, number> = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      healthy: 0,
    };

    let totalScore = 0;
    scores.forEach((s) => {
      byLevel[s.level]++;
      totalScore += s.overallScore;
    });

    return {
      total,
      byLevel,
      averageScore: total > 0 ? Math.round((totalScore / total) * 10) / 10 : 0,
      needsAttention: byLevel.critical + byLevel.high,
    };
  }

  /**
   * Get trend analysis for a URL
   */
  async getTrendAnalysis(userId: string, url: string): Promise<DecayTrendAnalysis | null> {
    const score = await this.getDecayScoreByUrl(userId, url);
    
    if (!score) {
      return null;
    }

    const history = await this.getDecayHistory(score.id);
    
    return trendAnalyzer.analyzeTrend(score, history);
  }
}

// ============================================
// Singleton Instance
// ============================================

export const decayDetectionService = new DecayDetectionService();
