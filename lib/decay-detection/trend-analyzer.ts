/**
 * Decay Trend Analyzer
 * @description Analyze historical decay trends and make predictions
 */

import type {
  DecayLevel,
  DecayTrend,
  DecayScore,
  DecayHistoryEntry,
  DecayTrendAnalysis,
} from '@/types/decay-detection.types';

// ============================================
// Trend Analyzer Class
// ============================================

export class TrendAnalyzer {
  /**
   * Calculate linear regression for prediction
   */
  private linearRegression(data: { x: number; y: number }[]): { slope: number; intercept: number } {
    const n = data.length;
    if (n === 0) return { slope: 0, intercept: 0 };

    const sumX = data.reduce((sum, d) => sum + d.x, 0);
    const sumY = data.reduce((sum, d) => sum + d.y, 0);
    const sumXY = data.reduce((sum, d) => sum + d.x * d.y, 0);
    const sumXX = data.reduce((sum, d) => sum + d.x * d.x, 0);

    const denominator = n * sumXX - sumX * sumX;
    if (denominator === 0) return { slope: 0, intercept: sumY / n };

    const slope = (n * sumXY - sumX * sumY) / denominator;
    const intercept = (sumY - slope * sumX) / n;

    return { slope, intercept };
  }

  /**
   * Get decay level from score
   */
  private getDecayLevel(score: number): DecayLevel {
    if (score < 20) return 'critical';
    if (score < 40) return 'high';
    if (score < 60) return 'medium';
    if (score < 80) return 'low';
    return 'healthy';
  }

  /**
   * Analyze trend from history
   */
  analyzeTrend(
    currentScore: DecayScore,
    history: DecayHistoryEntry[]
  ): DecayTrendAnalysis {
    // Sort history by date
    const sortedHistory = [...history].sort(
      (a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime()
    );

    // Build history array for trend
    const historyData = sortedHistory.map((h) => ({
      date: h.recordedAt.toISOString().split('T')[0],
      score: h.score,
      level: h.level,
    }));

    // Add current score
    historyData.push({
      date: currentScore.calculatedAt.toISOString().split('T')[0],
      score: currentScore.overallScore,
      level: currentScore.level,
    });

    // Calculate trend using linear regression
    const regressionData = historyData.map((h, i) => ({
      x: i,
      y: h.score,
    }));
    
    const { slope, intercept } = this.linearRegression(regressionData);

    // Determine trend direction
    let trendDirection: 'up' | 'down' | 'stable';
    let trend: DecayTrend;
    
    if (slope > 1) {
      trendDirection = 'up';
      trend = 'improving';
    } else if (slope < -1) {
      trendDirection = 'down';
      trend = 'declining';
    } else {
      trendDirection = 'stable';
      trend = 'stable';
    }

    // Calculate trend percentage (weekly rate of change)
    const trendPercentage = Math.round(slope * 7 * 10) / 10;

    // Predict future scores
    const currentIndex = historyData.length - 1;
    const nextWeekScore = Math.max(0, Math.min(100, intercept + slope * (currentIndex + 7)));
    const nextMonthScore = Math.max(0, Math.min(100, intercept + slope * (currentIndex + 30)));

    // Estimate if/when it will become critical
    let willBecomeCritical = false;
    let estimatedCriticalDate: string | null = null;

    if (currentScore.overallScore > 20 && slope < 0) {
      // Calculate days until score reaches 20 (critical threshold)
      const daysUntilCritical = (20 - currentScore.overallScore) / slope;
      
      if (daysUntilCritical > 0 && daysUntilCritical < 180) {
        willBecomeCritical = true;
        const criticalDate = new Date();
        criticalDate.setDate(criticalDate.getDate() + Math.ceil(daysUntilCritical));
        estimatedCriticalDate = criticalDate.toISOString().split('T')[0];
      }
    }

    return {
      url: currentScore.url,
      title: currentScore.title,
      currentScore: currentScore.overallScore,
      currentLevel: currentScore.level,
      history: historyData,
      trend,
      trendDirection,
      trendPercentage,
      prediction: {
        nextWeekScore: Math.round(nextWeekScore * 10) / 10,
        nextMonthScore: Math.round(nextMonthScore * 10) / 10,
        willBecomeCritical,
        estimatedCriticalDate,
      },
    };
  }

  /**
   * Identify pages that need immediate attention
   */
  findUrgentPages(analyses: DecayTrendAnalysis[]): DecayTrendAnalysis[] {
    return analyses.filter((a) => {
      // Already critical
      if (a.currentLevel === 'critical') return true;
      
      // Will become critical soon
      if (a.prediction.willBecomeCritical && a.prediction.estimatedCriticalDate) {
        const criticalDate = new Date(a.prediction.estimatedCriticalDate);
        const daysUntil = Math.ceil(
          (criticalDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        );
        return daysUntil <= 30; // Will be critical within 30 days
      }
      
      // Declining rapidly
      if (a.trendPercentage < -5) return true;
      
      return false;
    }).sort((a, b) => {
      // Sort by urgency
      if (a.currentLevel === 'critical' && b.currentLevel !== 'critical') return -1;
      if (b.currentLevel === 'critical' && a.currentLevel !== 'critical') return 1;
      return a.currentScore - b.currentScore;
    });
  }

  /**
   * Calculate velocity of decay
   */
  calculateDecayVelocity(history: DecayHistoryEntry[]): {
    dailyRate: number;
    weeklyRate: number;
    monthlyRate: number;
    accelerating: boolean;
  } {
    if (history.length < 2) {
      return {
        dailyRate: 0,
        weeklyRate: 0,
        monthlyRate: 0,
        accelerating: false,
      };
    }

    // Sort by date
    const sorted = [...history].sort(
      (a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime()
    );

    // Calculate rate between first and last
    const firstScore = sorted[0].score;
    const lastScore = sorted[sorted.length - 1].score;
    const totalDays =
      (new Date(sorted[sorted.length - 1].recordedAt).getTime() -
        new Date(sorted[0].recordedAt).getTime()) /
      (1000 * 60 * 60 * 24);

    if (totalDays === 0) {
      return {
        dailyRate: 0,
        weeklyRate: 0,
        monthlyRate: 0,
        accelerating: false,
      };
    }

    const dailyRate = (lastScore - firstScore) / totalDays;

    // Check if accelerating (compare recent rate vs overall rate)
    let accelerating = false;
    if (sorted.length >= 4) {
      const midIndex = Math.floor(sorted.length / 2);
      const recentRate =
        (sorted[sorted.length - 1].score - sorted[midIndex].score) /
        ((new Date(sorted[sorted.length - 1].recordedAt).getTime() -
          new Date(sorted[midIndex].recordedAt).getTime()) /
          (1000 * 60 * 60 * 24));
      
      accelerating = recentRate < dailyRate;
    }

    return {
      dailyRate: Math.round(dailyRate * 100) / 100,
      weeklyRate: Math.round(dailyRate * 7 * 100) / 100,
      monthlyRate: Math.round(dailyRate * 30 * 100) / 100,
      accelerating,
    };
  }
}

// ============================================
// Singleton Instance
// ============================================

export const trendAnalyzer = new TrendAnalyzer();
