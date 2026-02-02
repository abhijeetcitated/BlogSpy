/**
 * Email Alert Sender
 * @description Send email alerts using Resend
 */

import type { EmailPayload } from '@/types/alerts.types';

// ============================================
// Configuration
// ============================================

const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'alerts@blogspy.app';

// ============================================
// Email Templates
// ============================================

export interface DecayAlertEmailData {
  title: string;
  url: string;
  score: number;
  previousScore: number;
  level: 'critical' | 'high' | 'medium' | 'low';
  factors: {
    trafficChange: number;
    positionChange: number;
    ctrChange: number;
  };
  recommendations: string[];
  dashboardUrl: string;
}

export function generateDecayAlertEmail(data: DecayAlertEmailData): { subject: string; html: string } {
  const levelColors = {
    critical: '#ef4444',
    high: '#f97316',
    medium: '#eab308',
    low: '#3b82f6',
  };

  const levelLabels = {
    critical: '🚨 CRITICAL',
    high: '⚠️ High',
    medium: '📊 Medium',
    low: 'ℹ️ Low',
  };

  const subject = `[BlogSpy] ${levelLabels[data.level]} Content Decay Alert: ${data.title}`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Content Decay Alert</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f4f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <tr>
      <td>
        <!-- Header -->
        <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px 12px 0 0; padding: 32px;">
          <tr>
            <td align="center">
              <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">BlogSpy</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 14px;">Content Decay Alert</p>
            </td>
          </tr>
        </table>

        <!-- Content -->
        <table width="100%" cellpadding="0" cellspacing="0" style="background: white; padding: 32px; border-radius: 0 0 12px 12px;">
          <tr>
            <td>
              <!-- Alert Badge -->
              <div style="background-color: ${levelColors[data.level]}; color: white; padding: 8px 16px; border-radius: 20px; display: inline-block; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                ${levelLabels[data.level]}
              </div>

              <!-- Page Info -->
              <h2 style="color: #18181b; margin: 24px 0 8px 0; font-size: 20px; font-weight: 600;">${data.title}</h2>
              <p style="color: #71717a; margin: 0 0 24px 0; font-size: 14px; word-break: break-all;">
                <a href="${data.url}" style="color: #667eea; text-decoration: none;">${data.url}</a>
              </p>

              <!-- Score Card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background: #fafafa; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
                <tr>
                  <td align="center">
                    <p style="color: #71717a; margin: 0 0 8px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Decay Score</p>
                    <p style="color: ${levelColors[data.level]}; margin: 0; font-size: 48px; font-weight: 700;">${data.score}</p>
                    <p style="color: #71717a; margin: 8px 0 0 0; font-size: 14px;">
                      Previous: ${data.previousScore} 
                      <span style="color: ${data.score < data.previousScore ? '#ef4444' : '#22c55e'};">
                        (${data.score < data.previousScore ? '↓' : '↑'} ${Math.abs(data.score - data.previousScore).toFixed(1)} points)
                      </span>
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Metrics Grid -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
                <tr>
                  <td width="33%" style="padding: 12px; background: #f4f4f5; border-radius: 8px; text-align: center;">
                    <p style="color: #71717a; margin: 0 0 4px 0; font-size: 11px; text-transform: uppercase;">Traffic</p>
                    <p style="color: ${data.factors.trafficChange < 0 ? '#ef4444' : '#22c55e'}; margin: 0; font-size: 18px; font-weight: 600;">
                      ${data.factors.trafficChange > 0 ? '+' : ''}${data.factors.trafficChange.toFixed(1)}%
                    </p>
                  </td>
                  <td width="5"></td>
                  <td width="33%" style="padding: 12px; background: #f4f4f5; border-radius: 8px; text-align: center;">
                    <p style="color: #71717a; margin: 0 0 4px 0; font-size: 11px; text-transform: uppercase;">Position</p>
                    <p style="color: ${data.factors.positionChange > 0 ? '#ef4444' : '#22c55e'}; margin: 0; font-size: 18px; font-weight: 600;">
                      ${data.factors.positionChange > 0 ? '+' : ''}${data.factors.positionChange.toFixed(1)}
                    </p>
                  </td>
                  <td width="5"></td>
                  <td width="33%" style="padding: 12px; background: #f4f4f5; border-radius: 8px; text-align: center;">
                    <p style="color: #71717a; margin: 0 0 4px 0; font-size: 11px; text-transform: uppercase;">CTR</p>
                    <p style="color: ${data.factors.ctrChange < 0 ? '#ef4444' : '#22c55e'}; margin: 0; font-size: 18px; font-weight: 600;">
                      ${data.factors.ctrChange > 0 ? '+' : ''}${data.factors.ctrChange.toFixed(1)}%
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Recommendations -->
              ${data.recommendations.length > 0 ? `
              <div style="margin-bottom: 24px;">
                <h3 style="color: #18181b; margin: 0 0 12px 0; font-size: 14px; font-weight: 600;">💡 Recommendations</h3>
                <ul style="color: #52525b; margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.8;">
                  ${data.recommendations.map(r => `<li>${r}</li>`).join('')}
                </ul>
              </div>
              ` : ''}

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${data.dashboardUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 600;">
                      View in Dashboard →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <!-- Footer -->
        <table width="100%" cellpadding="0" cellspacing="0" style="padding: 24px;">
          <tr>
            <td align="center">
              <p style="color: #a1a1aa; margin: 0; font-size: 12px;">
                You're receiving this because you enabled content decay alerts.
                <br>
                <a href="${data.dashboardUrl}/settings/notifications" style="color: #667eea; text-decoration: none;">Manage notification preferences</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  return { subject, html };
}

// ============================================
// Email Sender Class
// ============================================

export class EmailSender {
  private apiKey: string;
  private fromEmail: string;

  constructor(apiKey?: string, fromEmail?: string) {
    this.apiKey = apiKey || RESEND_API_KEY;
    this.fromEmail = fromEmail || RESEND_FROM_EMAIL;
  }

  /**
   * Check if email sending is configured
   */
  isConfigured(): boolean {
    return Boolean(this.apiKey);
  }

  /**
   * Send an email via Resend API
   */
  async send(payload: EmailPayload): Promise<{ success: boolean; id?: string; error?: string }> {
    if (!this.isConfigured()) {
      console.warn('[EmailSender] Resend API key not configured');
      return { success: false, error: 'Email service not configured' };
    }

    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: this.fromEmail,
          to: payload.to,
          subject: payload.subject,
          html: payload.html,
          text: payload.text,
          reply_to: payload.replyTo,
          tags: payload.tags?.map(t => ({ name: 'category', value: t })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.message || 'Failed to send email' };
      }

      return { success: true, id: data.id };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('[EmailSender] Error sending email:', errorMessage);
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Send decay alert email
   */
  async sendDecayAlert(to: string, data: DecayAlertEmailData): Promise<{ success: boolean; id?: string; error?: string }> {
    const { subject, html } = generateDecayAlertEmail(data);
    
    return this.send({
      to,
      subject,
      html,
      tags: ['decay-alert', data.level],
    });
  }
}

// ============================================
// Singleton Instance
// ============================================

export const emailSender = new EmailSender();
