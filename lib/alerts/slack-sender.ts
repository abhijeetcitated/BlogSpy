/**
 * Slack Alert Sender
 * @description Send alerts to Slack via webhooks
 */

import type { SlackPayload, SlackBlock, SlackAttachment } from '@/types/alerts.types';

// ============================================
// Types
// ============================================

export interface DecayAlertSlackData {
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

// ============================================
// Slack Message Builders
// ============================================

export function buildDecayAlertSlackMessage(data: DecayAlertSlackData): {
  text: string;
  blocks: SlackBlock[];
  attachments: SlackAttachment[];
} {
  const levelEmojis = {
    critical: '🚨',
    high: '⚠️',
    medium: '📊',
    low: 'ℹ️',
  };

  const levelColors = {
    critical: '#ef4444',
    high: '#f97316',
    medium: '#eab308',
    low: '#3b82f6',
  };

  const scoreChange = data.score - data.previousScore;
  const scoreChangeText = scoreChange < 0 
    ? `↓ ${Math.abs(scoreChange).toFixed(1)} points` 
    : `↑ ${scoreChange.toFixed(1)} points`;

  const text = `${levelEmojis[data.level]} Content Decay Alert: ${data.title}`;

  const blocks: SlackBlock[] = [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: `${levelEmojis[data.level]} Content Decay Alert`,
      },
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*<${data.url}|${data.title}>*`,
      },
    },
    {
      type: 'section',
      fields: [
        {
          type: 'mrkdwn',
          text: `*Decay Score*\n${data.score}/100`,
        },
        {
          type: 'mrkdwn',
          text: `*Change*\n${scoreChangeText}`,
        },
        {
          type: 'mrkdwn',
          text: `*Severity*\n${data.level.toUpperCase()}`,
        },
        {
          type: 'mrkdwn',
          text: `*Status*\nNeeds Attention`,
        },
      ],
    },
    {
      type: 'divider',
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: '*📈 Key Metrics*',
      },
    },
    {
      type: 'section',
      fields: [
        {
          type: 'mrkdwn',
          text: `*Traffic*\n${data.factors.trafficChange > 0 ? '+' : ''}${data.factors.trafficChange.toFixed(1)}%`,
        },
        {
          type: 'mrkdwn',
          text: `*Position*\n${data.factors.positionChange > 0 ? '+' : ''}${data.factors.positionChange.toFixed(1)}`,
        },
        {
          type: 'mrkdwn',
          text: `*CTR*\n${data.factors.ctrChange > 0 ? '+' : ''}${data.factors.ctrChange.toFixed(1)}%`,
        },
      ],
    },
  ];

  // Add recommendations if any
  if (data.recommendations.length > 0) {
    blocks.push(
      {
        type: 'divider',
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*💡 Recommendations*\n${data.recommendations.map(r => `• ${r}`).join('\n')}`,
        },
      }
    );
  }

  // Add action button
  blocks.push({
    type: 'actions',
    elements: [
      {
        type: 'button',
        text: {
          type: 'plain_text',
          text: 'View in Dashboard',
        },
        url: data.dashboardUrl,
        style: 'primary',
      },
    ],
  } as unknown as SlackBlock);

  const attachments: SlackAttachment[] = [
    {
      color: levelColors[data.level],
      footer: 'BlogSpy Content Decay Alert',
      ts: Math.floor(Date.now() / 1000),
    },
  ];

  return { text, blocks, attachments };
}

// ============================================
// Slack Sender Class
// ============================================

export class SlackSender {
  /**
   * Send message to Slack webhook
   */
  async send(payload: SlackPayload): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(payload.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: payload.text,
          blocks: payload.blocks,
          attachments: payload.attachments,
          channel: payload.channel,
          username: payload.username || 'BlogSpy',
          icon_emoji: payload.icon_emoji || ':chart_with_downwards_trend:',
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        return { success: false, error };
      }

      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('[SlackSender] Error sending message:', errorMessage);
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Send decay alert to Slack
   */
  async sendDecayAlert(
    webhookUrl: string,
    data: DecayAlertSlackData
  ): Promise<{ success: boolean; error?: string }> {
    const { text, blocks, attachments } = buildDecayAlertSlackMessage(data);

    return this.send({
      webhookUrl,
      text,
      blocks,
      attachments,
    });
  }

  /**
   * Test webhook connection
   */
  async testConnection(webhookUrl: string): Promise<{ success: boolean; error?: string }> {
    return this.send({
      webhookUrl,
      text: '✅ BlogSpy Slack integration connected successfully!',
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: '*BlogSpy* is now connected to this channel.\n\nYou will receive content decay alerts and other notifications here.',
          },
        },
      ],
    });
  }
}

// ============================================
// Singleton Instance
// ============================================

export const slackSender = new SlackSender();
