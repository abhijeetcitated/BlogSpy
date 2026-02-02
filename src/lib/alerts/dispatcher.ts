/**
 * Alert Dispatcher
 * @description Central dispatcher for sending alerts across multiple channels
 */

import { emailSender, type DecayAlertEmailData } from './email-sender';
import { slackSender, type DecayAlertSlackData } from './slack-sender';
import { webhookSender } from './webhook-sender';
import type {
  AlertChannel,
  AlertPayload,
  UserAlertPreferences,
  Alert,
  AlertStatus,
} from '@/types/alerts.types';

// ============================================
// Types
// ============================================

export interface DispatchResult {
  channel: AlertChannel;
  success: boolean;
  error?: string;
  messageId?: string;
}

export interface AlertDispatchResult {
  alertId: string;
  results: DispatchResult[];
  successCount: number;
  failureCount: number;
}

// ============================================
// Alert Dispatcher Class
// ============================================

export class AlertDispatcher {
  /**
   * Check if we're in quiet hours
   */
  private isQuietHours(preferences: UserAlertPreferences): boolean {
    if (!preferences.quietHours.enabled) {
      return false;
    }

    const now = new Date();
    const timezone = preferences.timezone || 'UTC';
    
    // Get current time in user's timezone
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    
    const currentTime = formatter.format(now);
    const [startHour, startMin] = preferences.quietHours.start.split(':').map(Number);
    const [endHour, endMin] = preferences.quietHours.end.split(':').map(Number);
    const [currentHour, currentMin] = currentTime.split(':').map(Number);

    const currentMinutes = currentHour * 60 + currentMin;
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    // Handle overnight quiet hours (e.g., 22:00 to 08:00)
    if (startMinutes > endMinutes) {
      return currentMinutes >= startMinutes || currentMinutes <= endMinutes;
    }

    return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
  }

  /**
   * Get channels to use for a specific alert category
   */
  private getChannelsForCategory(
    preferences: UserAlertPreferences,
    category: string,
    priority: string
  ): AlertChannel[] {
    const categoryPrefs = preferences.categories[category as keyof typeof preferences.categories];
    
    if (!categoryPrefs?.enabled) {
      return [];
    }

    // Check priority threshold
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    const alertPriority = priorityOrder[priority as keyof typeof priorityOrder] ?? 3;
    const minPriority = priorityOrder[categoryPrefs.minPriority] ?? 2;

    if (alertPriority > minPriority) {
      return [];
    }

    return categoryPrefs.channels;
  }

  /**
   * Dispatch alert to email channel
   */
  private async dispatchEmail(
    preferences: UserAlertPreferences,
    data: DecayAlertEmailData
  ): Promise<DispatchResult> {
    const emailConfig = preferences.channels.email;
    
    if (!emailConfig?.enabled || !emailConfig.recipientEmail) {
      return { channel: 'email', success: false, error: 'Email not configured' };
    }

    const result = await emailSender.sendDecayAlert(emailConfig.recipientEmail, data);
    
    return {
      channel: 'email',
      success: result.success,
      error: result.error,
      messageId: result.id,
    };
  }

  /**
   * Dispatch alert to Slack channel
   */
  private async dispatchSlack(
    preferences: UserAlertPreferences,
    data: DecayAlertSlackData
  ): Promise<DispatchResult> {
    const slackConfig = preferences.channels.slack;
    
    if (!slackConfig?.enabled || !slackConfig.webhookUrl) {
      return { channel: 'slack', success: false, error: 'Slack not configured' };
    }

    const result = await slackSender.sendDecayAlert(slackConfig.webhookUrl, data);
    
    return {
      channel: 'slack',
      success: result.success,
      error: result.error,
    };
  }

  /**
   * Dispatch alert to webhook
   */
  private async dispatchWebhook(
    preferences: UserAlertPreferences,
    data: {
      url: string;
      title: string;
      score: number;
      previousScore: number;
      level: string;
      factors: {
        trafficChange: number;
        positionChange: number;
        ctrChange: number;
        engagementChange: number;
      };
      recommendations: string[];
    }
  ): Promise<DispatchResult> {
    const webhookConfig = preferences.channels.webhook;
    
    if (!webhookConfig?.enabled || !webhookConfig.url) {
      return { channel: 'webhook', success: false, error: 'Webhook not configured' };
    }

    const result = await webhookSender.sendDecayAlert(
      webhookConfig.url,
      data,
      webhookConfig.headers
    );
    
    return {
      channel: 'webhook',
      success: result.success,
      error: result.error,
    };
  }

  /**
   * Dispatch decay alert to all configured channels
   */
  async dispatchDecayAlert(
    alertId: string,
    preferences: UserAlertPreferences,
    data: {
      url: string;
      title: string;
      score: number;
      previousScore: number;
      level: 'critical' | 'high' | 'medium' | 'low';
      factors: {
        trafficChange: number;
        positionChange: number;
        ctrChange: number;
        engagementChange: number;
      };
      recommendations: string[];
      dashboardUrl: string;
    }
  ): Promise<AlertDispatchResult> {
    // Check if alerts are globally enabled
    if (!preferences.isEnabled) {
      return {
        alertId,
        results: [],
        successCount: 0,
        failureCount: 0,
      };
    }

    // Check quiet hours
    if (this.isQuietHours(preferences)) {
      console.log(`[AlertDispatcher] Skipping alert ${alertId} - quiet hours active`);
      return {
        alertId,
        results: [],
        successCount: 0,
        failureCount: 0,
      };
    }

    // Get channels for decay category
    const channels = this.getChannelsForCategory(preferences, 'decay', data.level);
    
    if (channels.length === 0) {
      return {
        alertId,
        results: [],
        successCount: 0,
        failureCount: 0,
      };
    }

    // Prepare data for each channel
    const emailData: DecayAlertEmailData = {
      title: data.title,
      url: data.url,
      score: data.score,
      previousScore: data.previousScore,
      level: data.level,
      factors: {
        trafficChange: data.factors.trafficChange,
        positionChange: data.factors.positionChange,
        ctrChange: data.factors.ctrChange,
      },
      recommendations: data.recommendations,
      dashboardUrl: data.dashboardUrl,
    };

    // Dispatch to all channels in parallel
    const results: DispatchResult[] = [];

    const dispatchPromises = channels.map(async (channel) => {
      switch (channel) {
        case 'email':
          return this.dispatchEmail(preferences, emailData);
        case 'slack':
          return this.dispatchSlack(preferences, emailData);
        case 'webhook':
          return this.dispatchWebhook(preferences, {
            ...data,
            level: data.level,
          });
        default:
          return { channel, success: false, error: `Channel ${channel} not supported` };
      }
    });

    const dispatchResults = await Promise.all(dispatchPromises);
    results.push(...dispatchResults);

    const successCount = results.filter((r) => r.success).length;
    const failureCount = results.filter((r) => !r.success).length;

    return {
      alertId,
      results,
      successCount,
      failureCount,
    };
  }
}

// ============================================
// Singleton Instance
// ============================================

export const alertDispatcher = new AlertDispatcher();
