/**
 * Alerts Library
 * @description Exports for multi-channel alert system
 */

// Senders
export * from './email-sender';
export * from './slack-sender';
export * from './webhook-sender';

// Dispatcher
export * from './dispatcher';

// Re-export types
export type {
  AlertChannel,
  AlertPriority,
  AlertStatus,
  AlertCategory,
  EmailConfig,
  SlackConfig,
  WebhookConfig,
  DiscordConfig,
  TelegramConfig,
  WhatsAppConfig,
  SMSConfig,
  AlertChannelConfigs,
  UserAlertPreferences,
  Alert,
  AlertPayload,
  EmailPayload,
  SlackPayload,
  SlackBlock,
  SlackAttachment,
  WebhookPayload,
  DiscordPayload,
  DiscordEmbed,
  AlertLog,
  AlertQueueItem,
  AlertTemplate,
  AlertStatistics,
} from '@/types/alerts.types';
