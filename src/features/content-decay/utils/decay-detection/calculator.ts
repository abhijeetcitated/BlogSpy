/**
 * Decay Detection Algorithm
 * @description Core algorithm for calculating content decay scores
 */

import type {
  DecayLevel,
  DecayTrend,
  DecayAnalysisInput,
  DecayAnalysisResult,
  DecayRecommendation,
  DecayDetectionConfig,
} from '@/types/decay-detection.types';

import { DEFAULT_DECAY_CONFIG } from '@/types/decay-detection.types';

// ============================================
// Decay Calculator Class
// ============================================

export class DecayCalculator {
  private config: DecayDetectionConfig;

  constructor(config: Partial<DecayDetectionConfig> = {}) {
    this.config = {
      weights: { ...DEFAULT_DECAY_CONFIG.weights, ...config.weights },
      thresholds: { ...DEFAULT_DECAY_CONFIG.thresholds, ...config.thresholds },
      comparisonPeriod: { ...DEFAULT_DECAY_CONFIG.comparisonPeriod, ...config.comparisonPeriod },
      minimumData: { ...DEFAULT_DECAY_CONFIG.minimumData, ...config.minimumData },
    };
  }

  /**
   * Calculate percentage change
   */
  private calculatePercentageChange(current: number, previous: number): number {
    if (previous === 0) {
      return current > 0 ? 100 : 0;
    }
    return ((current - previous) / previous) * 100;
  }

  /**
   * Normalize change to a 0-100 score
   * Positive change = higher score (healthier)
   * Negative change = lower score (decaying)
   */
  private normalizeChangeToScore(change: number, isPositiveBetter: boolean = true): number {
    // Cap extreme values at ±100%
    const cappedChange = Math.max(-100, Math.min(100, change));
    
    // Convert to 0-100 scale (50 = no change)
    let score: number;
    if (isPositiveBetter) {
      // For metrics where increase is good (clicks, impressions, CTR, engagement)
      score = 50 + (cappedChange / 2);
    } else {
      // For metrics where decrease is good (position - lower is better)
      score = 50 - (cappedChange / 2);
    }
    
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Get decay level from score
   */
  getDecayLevel(score: number): DecayLevel {
    if (score < this.config.thresholds.critical) return 'critical';
    if (score < this.config.thresholds.high) return 'high';
    if (score < this.config.thresholds.medium) return 'medium';
    if (score < this.config.thresholds.low) return 'low';
    return 'healthy';
  }

  /**
   * Determine trend based on score
   */
  getTrend(overallChange: number): DecayTrend {
    if (overallChange < -5) return 'declining';
    if (overallChange > 5) return 'improving';
    return 'stable';
  }

  /**
   * Generate recommendations based on decay factors
   */
  generateRecommendations(factors: DecayAnalysisResult['factors']): DecayRecommendation[] {
    const recommendations: DecayRecommendation[] = [];

    // Traffic decay recommendations
    if (factors.trafficDecay.value < -30) {
      recommendations.push({
        type: 'update_content',
        priority: 'high',
        message: 'Content refresh needed - traffic dropped significantly',
        estimatedImpact: 'Could recover 40-60% of lost traffic',
      });
    }

    // Position decay recommendations
    if (factors.positionDecay.value < -20) {
      recommendations.push({
        type: 'check_competitors',
        priority: 'high',
        message: 'Rankings dropped - analyze competitor content',
        estimatedImpact: 'Identify what competitors are doing differently',
      });
      
      recommendations.push({
        type: 'add_internal_links',
        priority: 'medium',
        message: 'Add internal links to boost page authority',
        estimatedImpact: 'Can improve rankings by 2-5 positions',
      });
    }

    // CTR decay recommendations
    if (factors.ctrDecay.value < -20) {
      recommendations.push({
        type: 'improve_title',
        priority: 'high',
        message: 'Update title and meta description to improve CTR',
        estimatedImpact: 'Could improve CTR by 15-30%',
      });
    }

    // Engagement decay recommendations
    if (factors.engagementDecay.value < -20) {
      recommendations.push({
        type: 'add_media',
        priority: 'medium',
        message: 'Add images, videos, or interactive elements',
        estimatedImpact: 'Can increase engagement time by 20-40%',
      });
      
      recommendations.push({
        type: 'refresh_data',
        priority: 'medium',
        message: 'Update statistics, dates, and outdated information',
        estimatedImpact: 'Improves content freshness signals',
      });
    }

    // General recommendations if overall score is low
    if (recommendations.length === 0) {
      recommendations.push({
        type: 'update_meta',
        priority: 'low',
        message: 'Review and optimize meta tags',
        estimatedImpact: 'Minor improvements to visibility',
      });
    }

    // Sort by priority
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

    return recommendations.slice(0, 5); // Return top 5 recommendations
  }

  /**
   * Check if data meets minimum requirements
   */
  hasMinimumData(input: DecayAnalysisInput): boolean {
    const totalImpressions = input.gscCurrent.impressions + input.gscPrevious.impressions;
    const totalClicks = input.gscCurrent.clicks + input.gscPrevious.clicks;

    return (
      totalImpressions >= this.config.minimumData.impressions &&
      totalClicks >= this.config.minimumData.clicks
    );
  }

  /**
   * Analyze decay for a single page
   */
  analyze(input: DecayAnalysisInput): DecayAnalysisResult {
    // Calculate traffic change (clicks)
    const trafficChange = this.calculatePercentageChange(
      input.gscCurrent.clicks,
      input.gscPrevious.clicks
    );
    const trafficScore = this.normalizeChangeToScore(trafficChange, true);

    // Calculate position change (lower is better, so invert)
    const positionChange = this.calculatePercentageChange(
      input.gscCurrent.position,
      input.gscPrevious.position
    );
    const positionScore = this.normalizeChangeToScore(positionChange, false);

    // Calculate CTR change
    const ctrChange = this.calculatePercentageChange(
      input.gscCurrent.ctr,
      input.gscPrevious.ctr
    );
    const ctrScore = this.normalizeChangeToScore(ctrChange, true);

    // Calculate engagement change (if GA4 data available)
    let engagementChange = 0;
    let engagementScore = 50; // Neutral if no data
    
    if (input.ga4Current && input.ga4Previous) {
      engagementChange = this.calculatePercentageChange(
        input.ga4Current.avgEngagementTime,
        input.ga4Previous.avgEngagementTime
      );
      engagementScore = this.normalizeChangeToScore(engagementChange, true);
    }

    // Calculate weighted overall score
    const overallScore =
      (trafficScore * this.config.weights.traffic +
        positionScore * this.config.weights.position +
        ctrScore * this.config.weights.ctr +
        engagementScore * this.config.weights.engagement) /
      100;

    // Build factors object
    const factors = {
      trafficDecay: {
        value: trafficChange,
        weight: this.config.weights.traffic,
        contribution: (trafficScore * this.config.weights.traffic) / 100,
      },
      positionDecay: {
        value: positionChange,
        weight: this.config.weights.position,
        contribution: (positionScore * this.config.weights.position) / 100,
      },
      ctrDecay: {
        value: ctrChange,
        weight: this.config.weights.ctr,
        contribution: (ctrScore * this.config.weights.ctr) / 100,
      },
      engagementDecay: {
        value: engagementChange,
        weight: this.config.weights.engagement,
        contribution: (engagementScore * this.config.weights.engagement) / 100,
      },
    };

    // Calculate overall change for trend
    const overallChange =
      (trafficChange * this.config.weights.traffic +
        positionChange * -1 * this.config.weights.position + // Invert position
        ctrChange * this.config.weights.ctr +
        engagementChange * this.config.weights.engagement) /
      100;

    return {
      url: input.url,
      title: input.title,
      overallScore: Math.round(overallScore * 10) / 10,
      level: this.getDecayLevel(overallScore),
      trend: this.getTrend(overallChange),
      factors,
      recommendations: this.generateRecommendations(factors),
    };
  }

  /**
   * Batch analyze multiple pages
   */
  analyzeMany(inputs: DecayAnalysisInput[]): DecayAnalysisResult[] {
    return inputs
      .filter((input) => this.hasMinimumData(input))
      .map((input) => this.analyze(input));
  }

  /**
   * Get summary statistics for batch results
   */
  getSummary(results: DecayAnalysisResult[]) {
    const byLevel = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      healthy: 0,
    };

    const byTrend = {
      declining: 0,
      stable: 0,
      improving: 0,
    };

    results.forEach((r) => {
      byLevel[r.level]++;
      byTrend[r.trend]++;
    });

    const avgScore = results.reduce((sum, r) => sum + r.overallScore, 0) / results.length || 0;

    return {
      total: results.length,
      averageScore: Math.round(avgScore * 10) / 10,
      byLevel,
      byTrend,
      needsAttention: byLevel.critical + byLevel.high,
    };
  }
}

// ============================================
// Singleton Instance
// ============================================

export const decayCalculator = new DecayCalculator();

// ============================================
// Helper Functions
// ============================================

export function createDecayCalculator(config?: Partial<DecayDetectionConfig>): DecayCalculator {
  return new DecayCalculator(config);
}
