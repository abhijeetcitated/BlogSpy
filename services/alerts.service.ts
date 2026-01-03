import 'server-only';

// @ts-nocheck
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Alert Service
 * @description Service layer for managing alerts and user preferences
 * 
 * NOTE: @ts-nocheck is temporary until real Supabase client is installed
 */

import { createClient } from '@/lib/supabase/server';
import { alertDispatcher } from '@/lib/alerts';
import type {
  Alert,
  AlertPayload,
  AlertChannel,
  AlertCategory,
  AlertPriority,
  AlertStatus,
  UserAlertPreferences,
  AlertLog,
  AlertStatistics,
} from '@/types/alerts.types';
import { DEFAULT_ALERT_PREFERENCES } from '@/types/alerts.types';
import type { DecayScore } from '@/types/decay-detection.types';

// ============================================
// Alert Service Class
// ============================================

export class AlertService {
  /**
   * Get or create Supabase client for server-side operations
   */
  private async getSupabase() {
    return await createClient();
  }

  /**
   * Get user alert preferences
   */
  async getPreferences(userId: string): Promise<UserAlertPreferences> {
    const supabase = await this.getSupabase();
    
    const { data, error } = await supabase
      .from('user_alert_preferences')
      .select('*')
      .eq('user_id', userId)
      .single() as { data: Record<string, unknown> | null; error: unknown };

    if (error || !data) {
      // Return default preferences
      return {
        id: '',
        userId,
        ...DEFAULT_ALERT_PREFERENCES,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }

    return {
      id: data.id as string,
      userId: data.user_id as string,
      isEnabled: data.is_enabled as boolean,
      timezone: data.timezone as string,
      quietHours: data.quiet_hours as UserAlertPreferences['quietHours'],
      channels: data.channels as UserAlertPreferences['channels'],
      categories: data.categories as UserAlertPreferences['categories'],
      digest: data.digest as UserAlertPreferences['digest'],
      createdAt: new Date(data.created_at as string),
      updatedAt: new Date(data.updated_at as string),
    };
  }

  /**
   * Save or update user alert preferences
   */
  async savePreferences(
    userId: string,
    preferences: Partial<Omit<UserAlertPreferences, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>
  ): Promise<UserAlertPreferences> {
    const supabase = await this.getSupabase();
    const now = new Date().toISOString();

    const existingPrefs = await this.getPreferences(userId);
    const mergedPrefs = {
      ...existingPrefs,
      ...preferences,
      channels: { ...existingPrefs.channels, ...preferences.channels },
      categories: { ...existingPrefs.categories, ...preferences.categories },
      quietHours: { ...existingPrefs.quietHours, ...preferences.quietHours },
      digest: { ...existingPrefs.digest, ...preferences.digest },
    };

    const { data, error } = await supabase
      .from('user_alert_preferences')
      .upsert(
        {
          user_id: userId,
          is_enabled: mergedPrefs.isEnabled,
          timezone: mergedPrefs.timezone,
          quiet_hours: mergedPrefs.quietHours,
          channels: mergedPrefs.channels,
          categories: mergedPrefs.categories,
          digest: mergedPrefs.digest,
          updated_at: now,
        },
        {
          onConflict: 'user_id',
        }
      )
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to save alert preferences: ${error.message}`);
    }

    return {
      id: data.id,
      userId: data.user_id,
      isEnabled: data.is_enabled,
      timezone: data.timezone,
      quietHours: data.quiet_hours,
      channels: data.channels,
      categories: data.categories,
      digest: data.digest,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  /**
   * Create an alert
   */
  async createAlert(payload: AlertPayload): Promise<Alert> {
    const supabase = await this.getSupabase();
    const now = new Date();

    // Get user preferences to determine channels
    const preferences = await this.getPreferences(payload.userId);
    
    let channels = payload.channels;
    if (!channels) {
      const categoryPrefs = preferences.categories[payload.category as keyof typeof preferences.categories];
      channels = categoryPrefs?.channels || ['email'];
    }

    const { data, error } = await supabase
      .from('alerts')
      .insert({
        user_id: payload.userId,
        category: payload.category,
        priority: payload.priority,
        title: payload.title,
        message: payload.message,
        data: payload.data || {},
        channels,
        delivery_status: {},
        url: payload.url,
        is_read: false,
        created_at: now.toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create alert: ${error.message}`);
    }

    return {
      id: data.id,
      userId: data.user_id,
      category: data.category,
      priority: data.priority,
      title: data.title,
      message: data.message,
      data: data.data,
      channels: data.channels,
      deliveryStatus: data.delivery_status,
      url: data.url,
      isRead: data.is_read,
      createdAt: new Date(data.created_at),
    };
  }

  /**
   * Send decay alert
   */
  async sendDecayAlert(
    userId: string,
    score: DecayScore,
    previousScore: number,
    recommendations: string[]
  ): Promise<void> {
    const preferences = await this.getPreferences(userId);

    // Map decay level to alert priority
    const levelToPriority: Record<string, AlertPriority> = {
      critical: 'critical',
      high: 'high',
      medium: 'medium',
      low: 'low',
      healthy: 'low',
    };

    // Create alert record
    const alert = await this.createAlert({
      userId,
      category: 'decay',
      priority: levelToPriority[score.level],
      title: `Content Decay Alert: ${score.title}`,
      message: `Your page "${score.title}" has a decay score of ${score.overallScore}/100 (${score.level})`,
      data: {
        url: score.url,
        score: score.overallScore,
        previousScore,
        level: score.level,
        factors: {
          trafficDecay: score.trafficDecay,
          positionDecay: score.positionDecay,
          ctrDecay: score.ctrDecay,
          engagementDecay: score.engagementDecay,
        },
      },
      url: score.url,
    });

    // Get dashboard URL
    const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/content-decay`;

    // Dispatch to all channels
    const result = await alertDispatcher.dispatchDecayAlert(alert.id, preferences, {
      url: score.url,
      title: score.title,
      score: score.overallScore,
      previousScore,
      level: score.level as 'critical' | 'high' | 'medium' | 'low',
      factors: {
        trafficChange: score.trafficDecay,
        positionChange: score.positionDecay,
        ctrChange: score.ctrDecay,
        engagementChange: score.engagementDecay,
      },
      recommendations,
      dashboardUrl,
    });

    // Update delivery status
    const supabase = await this.getSupabase();
    const deliveryStatus: Record<string, { status: AlertStatus; sentAt?: string; error?: string }> = {};

    for (const r of result.results) {
      deliveryStatus[r.channel] = {
        status: r.success ? 'sent' : 'failed',
        sentAt: r.success ? new Date().toISOString() : undefined,
        error: r.error,
      };

      // Log the delivery
      await this.logDelivery(alert.id, userId, r.channel, r.success, r.error);
    }

    await supabase
      .from('alerts')
      .update({ delivery_status: deliveryStatus })
      .eq('id', alert.id);
  }

  /**
   * Log alert delivery
   */
  private async logDelivery(
    alertId: string,
    userId: string,
    channel: AlertChannel,
    success: boolean,
    error?: string
  ): Promise<void> {
    const supabase = await this.getSupabase();

    await supabase.from('alert_logs').insert({
      alert_id: alertId,
      user_id: userId,
      channel,
      status: success ? 'sent' : 'failed',
      error,
      attempt_count: 1,
      sent_at: success ? new Date().toISOString() : null,
    });
  }

  /**
   * Get alerts for a user
   */
  async getAlerts(
    userId: string,
    options?: {
      category?: AlertCategory;
      isRead?: boolean;
      limit?: number;
      offset?: number;
    }
  ): Promise<{ alerts: Alert[]; total: number }> {
    const supabase = await this.getSupabase();

    let query = supabase
      .from('alerts')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (options?.category) {
      query = query.eq('category', options.category);
    }

    if (options?.isRead !== undefined) {
      query = query.eq('is_read', options.isRead);
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }

    const { data, error, count } = await query;

    if (error) {
      throw new Error(`Failed to get alerts: ${error.message}`);
    }

    const alerts: Alert[] = (data || []).map((d) => ({
      id: d.id,
      userId: d.user_id,
      category: d.category,
      priority: d.priority,
      title: d.title,
      message: d.message,
      data: d.data,
      channels: d.channels,
      deliveryStatus: d.delivery_status,
      url: d.url,
      isRead: d.is_read,
      readAt: d.read_at ? new Date(d.read_at) : undefined,
      createdAt: new Date(d.created_at),
      expiresAt: d.expires_at ? new Date(d.expires_at) : undefined,
    }));

    return { alerts, total: count || 0 };
  }

  /**
   * Mark alert as read
   */
  async markAsRead(alertId: string, userId: string): Promise<void> {
    const supabase = await this.getSupabase();

    const { error } = await supabase
      .from('alerts')
      .update({
        is_read: true,
        read_at: new Date().toISOString(),
      })
      .eq('id', alertId)
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Failed to mark alert as read: ${error.message}`);
    }
  }

  /**
   * Mark all alerts as read
   */
  async markAllAsRead(userId: string, category?: AlertCategory): Promise<void> {
    const supabase = await this.getSupabase();

    let query = supabase
      .from('alerts')
      .update({
        is_read: true,
        read_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (category) {
      query = query.eq('category', category);
    }

    const { error } = await query;

    if (error) {
      throw new Error(`Failed to mark alerts as read: ${error.message}`);
    }
  }

  /**
   * Get unread alert count
   */
  async getUnreadCount(userId: string): Promise<number> {
    const supabase = await this.getSupabase();

    const { count, error } = await supabase
      .from('alerts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) {
      throw new Error(`Failed to get unread count: ${error.message}`);
    }

    return count || 0;
  }

  /**
   * Get alert statistics
   */
  async getStatistics(userId: string, days: number = 30): Promise<AlertStatistics> {
    const supabase = await this.getSupabase();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
      .from('alerts')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', startDate.toISOString());

    if (error) {
      throw new Error(`Failed to get statistics: ${error.message}`);
    }

    const alerts = data || [];

    const byCategory: Record<AlertCategory, number> = {
      decay: 0,
      rank_drop: 0,
      rank_gain: 0,
      indexing: 0,
      error: 0,
      system: 0,
    };

    const byPriority: Record<AlertPriority, number> = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
    };

    const byChannel: Record<AlertChannel, number> = {
      email: 0,
      slack: 0,
      webhook: 0,
      discord: 0,
      telegram: 0,
      whatsapp: 0,
      sms: 0,
    };

    const byStatus: Record<AlertStatus, number> = {
      pending: 0,
      sent: 0,
      failed: 0,
      delivered: 0,
      read: 0,
    };

    let deliveredCount = 0;
    let readCount = 0;

    alerts.forEach((alert) => {
      byCategory[alert.category as AlertCategory]++;
      byPriority[alert.priority as AlertPriority]++;

      (alert.channels as AlertChannel[]).forEach((channel) => {
        byChannel[channel]++;
        
        const status = alert.delivery_status?.[channel]?.status;
        if (status) {
          byStatus[status as AlertStatus]++;
          if (status === 'sent' || status === 'delivered') deliveredCount++;
        }
      });

      if (alert.is_read) readCount++;
    });

    return {
      userId,
      period: {
        start: startDate,
        end: new Date(),
      },
      total: alerts.length,
      byCategory,
      byPriority,
      byChannel,
      byStatus,
      deliveryRate: alerts.length > 0 ? (deliveredCount / alerts.length) * 100 : 0,
      readRate: alerts.length > 0 ? (readCount / alerts.length) * 100 : 0,
    };
  }

  /**
   * Test channel configuration
   */
  async testChannel(userId: string, channel: AlertChannel): Promise<{ success: boolean; error?: string }> {
    const preferences = await this.getPreferences(userId);

    // Create test alert
    const testData = {
      url: 'https://example.com/test-page',
      title: 'Test Page - BlogSpy Alert Test',
      score: 45,
      previousScore: 65,
      level: 'medium' as const,
      factors: {
        trafficChange: -25,
        positionChange: 3,
        ctrChange: -15,
        engagementChange: -10,
      },
      recommendations: ['This is a test alert to verify your notification settings'],
      dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/content-decay`,
    };

    // Create temporary preferences with only the test channel enabled
    const testPreferences: UserAlertPreferences = {
      ...preferences,
      categories: {
        ...preferences.categories,
        decay: {
          enabled: true,
          minPriority: 'low',
          channels: [channel],
        },
      },
    };

    const result = await alertDispatcher.dispatchDecayAlert('test', testPreferences, testData);

    const channelResult = result.results.find((r) => r.channel === channel);
    
    return {
      success: channelResult?.success || false,
      error: channelResult?.error,
    };
  }
}

// ============================================
// Singleton Instance
// ============================================

export const alertsService = new AlertService();
