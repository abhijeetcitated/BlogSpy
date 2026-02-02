/**
 * Webhook Alert Sender
 * @description Send alerts to custom webhook endpoints
 */

import type { WebhookPayload } from '@/types/alerts.types';

// ============================================
// Types
// ============================================

export interface WebhookAlertData {
  eventType: string;
  timestamp: string;
  data: Record<string, unknown>;
}

// ============================================
// Webhook Sender Class
// ============================================

export class WebhookSender {
  private defaultTimeout = 10000; // 10 seconds
  private maxRetries = 3;
  private retryDelay = 1000; // 1 second

  /**
   * Send webhook request with retries
   */
  async send(payload: WebhookPayload): Promise<{
    success: boolean;
    statusCode?: number;
    response?: unknown;
    error?: string;
  }> {
    let lastError: string | undefined;

    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.defaultTimeout);

        const response = await fetch(payload.url, {
          method: payload.method,
          headers: {
            'Content-Type': 'application/json',
            ...payload.headers,
          },
          body: JSON.stringify(payload.body),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        const responseData = await response.json().catch(() => null);

        if (response.ok) {
          return {
            success: true,
            statusCode: response.status,
            response: responseData,
          };
        }

        // Non-retryable error (4xx)
        if (response.status >= 400 && response.status < 500) {
          return {
            success: false,
            statusCode: response.status,
            response: responseData,
            error: `HTTP ${response.status}: ${response.statusText}`,
          };
        }

        // Retryable error (5xx)
        lastError = `HTTP ${response.status}: ${response.statusText}`;
      } catch (error) {
        if (error instanceof Error) {
          if (error.name === 'AbortError') {
            lastError = 'Request timeout';
          } else {
            lastError = error.message;
          }
        } else {
          lastError = 'Unknown error';
        }
      }

      // Wait before retry
      if (attempt < this.maxRetries - 1) {
        await new Promise((resolve) => setTimeout(resolve, this.retryDelay * (attempt + 1)));
      }
    }

    return { success: false, error: lastError };
  }

  /**
   * Send decay alert webhook
   */
  async sendDecayAlert(
    url: string,
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
    },
    headers?: Record<string, string>
  ): Promise<{ success: boolean; error?: string }> {
    return this.send({
      url,
      method: 'POST',
      headers: headers || {},
      body: {
        event: 'content.decay.detected',
        timestamp: new Date().toISOString(),
        data: {
          page: {
            url: data.url,
            title: data.title,
          },
          decay: {
            score: data.score,
            previousScore: data.previousScore,
            level: data.level,
            change: data.score - data.previousScore,
          },
          metrics: data.factors,
          recommendations: data.recommendations,
        },
      },
    });
  }

  /**
   * Test webhook endpoint
   */
  async testConnection(
    url: string,
    headers?: Record<string, string>
  ): Promise<{ success: boolean; latency?: number; error?: string }> {
    const startTime = Date.now();

    const result = await this.send({
      url,
      method: 'POST',
      headers: headers || {},
      body: {
        event: 'test.connection',
        timestamp: new Date().toISOString(),
        data: {
          message: 'BlogSpy webhook test',
          source: 'blogspy',
        },
      },
    });

    return {
      ...result,
      latency: Date.now() - startTime,
    };
  }

  /**
   * Validate webhook URL
   */
  isValidWebhookUrl(url: string): boolean {
    try {
      const parsed = new URL(url);
      return parsed.protocol === 'https:' || parsed.protocol === 'http:';
    } catch {
      return false;
    }
  }
}

// ============================================
// Singleton Instance
// ============================================

export const webhookSender = new WebhookSender();
