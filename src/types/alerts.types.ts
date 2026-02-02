/**
 * Alert System Types
 * @description Types for multi-channel alert system
 */

// ============================================
// Alert Channel Types
// ============================================

export type AlertChannel = 'email' | 'slack' | 'webhook' | 'discord' | 'telegram' | 'whatsapp' | 'sms';
export type AlertPriority = 'critical' | 'high' | 'medium' | 'low';
export type AlertStatus = 'pending' | 'sent' | 'failed' | 'delivered' | 'read';
export type AlertCategory = 'decay' | 'rank_drop' | 'rank_gain' | 'indexing' | 'error' | 'system';

// ============================================
// Alert Configuration Types
// ============================================

export interface EmailConfig {
  enabled: boolean;
  recipientEmail: string;
  senderName?: string;
}

export interface SlackConfig {
  enabled: boolean;
  webhookUrl: string;
  channel?: string;
  username?: string;
  iconEmoji?: string;
}

export interface WebhookConfig {
  enabled: boolean;
  url: string;
  headers?: Record<string, string>;
  method?: 'POST' | 'PUT';
  retries?: number;
}

export interface DiscordConfig {
  enabled: boolean;
  webhookUrl: string;
  username?: string;
  avatarUrl?: string;
}

export interface TelegramConfig {
  enabled: boolean;
  botToken: string;
  chatId: string;
}

export interface WhatsAppConfig {
  enabled: boolean;
  phoneNumber: string;
  accountSid: string;
  authToken: string;
}

export interface SMSConfig {
  enabled: boolean;
  phoneNumber: string;
  provider: 'twilio' | 'nexmo' | 'messagebird';
  accountSid: string;
  authToken: string;
}

export interface AlertChannelConfigs {
  email?: EmailConfig;
  slack?: SlackConfig;
  webhook?: WebhookConfig;
  discord?: DiscordConfig;
  telegram?: TelegramConfig;
  whatsapp?: WhatsAppConfig;
  sms?: SMSConfig;
}

// ============================================
// User Alert Preferences
// ============================================

export interface UserAlertPreferences {
  id: string;
  userId: string;
  
  // Global settings
  isEnabled: boolean;
  timezone: string;
  
  // Quiet hours
  quietHours: {
    enabled: boolean;
    start: string; // HH:mm
    end: string; // HH:mm
  };
  
  // Channel configurations
  channels: AlertChannelConfigs;
  
  // Category preferences
  categories: {
    decay: {
      enabled: boolean;
      minPriority: AlertPriority;
      channels: AlertChannel[];
    };
    rank_drop: {
      enabled: boolean;
      minPriority: AlertPriority;
      channels: AlertChannel[];
    };
    rank_gain: {
      enabled: boolean;
      minPriority: AlertPriority;
      channels: AlertChannel[];
    };
    indexing: {
      enabled: boolean;
      minPriority: AlertPriority;
      channels: AlertChannel[];
    };
    error: {
      enabled: boolean;
      minPriority: AlertPriority;
      channels: AlertChannel[];
    };
    system: {
      enabled: boolean;
      minPriority: AlertPriority;
      channels: AlertChannel[];
    };
  };
  
  // Digest settings
  digest: {
    enabled: boolean;
    frequency: 'daily' | 'weekly' | 'monthly';
    dayOfWeek?: number; // 0-6 for weekly
    dayOfMonth?: number; // 1-31 for monthly
    time: string; // HH:mm
    channels: AlertChannel[];
  };
  
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// Alert Types
// ============================================

export interface Alert {
  id: string;
  userId: string;
  category: AlertCategory;
  priority: AlertPriority;
  title: string;
  message: string;
  data: Record<string, unknown>; // Category-specific data
  
  // Delivery status
  channels: AlertChannel[];
  deliveryStatus: {
    [K in AlertChannel]?: {
      status: AlertStatus;
      sentAt?: Date;
      deliveredAt?: Date;
      readAt?: Date;
      error?: string;
    };
  };
  
  // Metadata
  url?: string; // Related URL if applicable
  isRead: boolean;
  readAt?: Date;
  
  createdAt: Date;
  expiresAt?: Date;
}

// ============================================
// Alert Payload Types (for sending)
// ============================================

export interface AlertPayload {
  userId: string;
  category: AlertCategory;
  priority: AlertPriority;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  url?: string;
  channels?: AlertChannel[]; // Override user preferences
}

export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
  tags?: string[];
}

export interface SlackPayload {
  webhookUrl: string;
  text: string;
  blocks?: SlackBlock[];
  attachments?: SlackAttachment[];
  channel?: string;
  username?: string;
  icon_emoji?: string;
}

export interface SlackBlock {
  type: 'section' | 'divider' | 'header' | 'context' | 'actions';
  text?: {
    type: 'mrkdwn' | 'plain_text';
    text: string;
  };
  fields?: {
    type: 'mrkdwn' | 'plain_text';
    text: string;
  }[];
  accessory?: Record<string, unknown>;
  elements?: Record<string, unknown>[];
}

export interface SlackAttachment {
  color?: string;
  title?: string;
  title_link?: string;
  text?: string;
  fields?: {
    title: string;
    value: string;
    short?: boolean;
  }[];
  footer?: string;
  ts?: number;
}

export interface WebhookPayload {
  url: string;
  method: 'POST' | 'PUT';
  headers: Record<string, string>;
  body: Record<string, unknown>;
}

export interface DiscordPayload {
  webhookUrl: string;
  content?: string;
  username?: string;
  avatar_url?: string;
  embeds?: DiscordEmbed[];
}

export interface DiscordEmbed {
  title?: string;
  description?: string;
  url?: string;
  color?: number;
  fields?: {
    name: string;
    value: string;
    inline?: boolean;
  }[];
  footer?: {
    text: string;
    icon_url?: string;
  };
  timestamp?: string;
}

// ============================================
// Alert Log Types
// ============================================

export interface AlertLog {
  id: string;
  alertId: string;
  userId: string;
  channel: AlertChannel;
  status: AlertStatus;
  payload: string; // JSON stringified payload
  response?: string; // JSON stringified response
  error?: string;
  attemptCount: number;
  sentAt?: Date;
  deliveredAt?: Date;
  createdAt: Date;
}

// ============================================
// Alert Queue Types
// ============================================

export interface AlertQueueItem {
  id: string;
  alertId: string;
  userId: string;
  channel: AlertChannel;
  payload: Record<string, unknown>;
  priority: number; // Lower = higher priority
  scheduledFor: Date;
  attempts: number;
  maxAttempts: number;
  lastAttemptAt?: Date;
  nextRetryAt?: Date;
  createdAt: Date;
}

// ============================================
// Alert Template Types
// ============================================

export interface AlertTemplate {
  id: string;
  name: string;
  category: AlertCategory;
  channel: AlertChannel;
  subject?: string; // For email
  template: string; // Handlebars/Mustache template
  variables: string[]; // List of required variables
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// Alert Statistics Types
// ============================================

export interface AlertStatistics {
  userId: string;
  period: {
    start: Date;
    end: Date;
  };
  total: number;
  byCategory: Record<AlertCategory, number>;
  byPriority: Record<AlertPriority, number>;
  byChannel: Record<AlertChannel, number>;
  byStatus: Record<AlertStatus, number>;
  deliveryRate: number; // Percentage
  readRate: number; // Percentage
}

// ============================================
// Default Preferences
// ============================================

export const DEFAULT_ALERT_PREFERENCES: Omit<UserAlertPreferences, 'id' | 'userId' | 'createdAt' | 'updatedAt'> = {
  isEnabled: true,
  timezone: 'Asia/Kolkata',
  quietHours: {
    enabled: false,
    start: '22:00',
    end: '08:00',
  },
  channels: {},
  categories: {
    decay: {
      enabled: true,
      minPriority: 'medium',
      channels: ['email'],
    },
    rank_drop: {
      enabled: true,
      minPriority: 'high',
      channels: ['email'],
    },
    rank_gain: {
      enabled: true,
      minPriority: 'low',
      channels: ['email'],
    },
    indexing: {
      enabled: true,
      minPriority: 'high',
      channels: ['email'],
    },
    error: {
      enabled: true,
      minPriority: 'high',
      channels: ['email'],
    },
    system: {
      enabled: true,
      minPriority: 'medium',
      channels: ['email'],
    },
  },
  digest: {
    enabled: false,
    frequency: 'weekly',
    dayOfWeek: 1, // Monday
    time: '09:00',
    channels: ['email'],
  },
};
