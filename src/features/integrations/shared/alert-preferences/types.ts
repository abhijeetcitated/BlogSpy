/**
 * Alert Preferences Types
 */

export interface AlertPreferences {
  emailEnabled: boolean;
  slackEnabled: boolean;
  slackWebhookUrl: string;
  pushEnabled: boolean;
  criticalOnly: boolean;
  dailyDigest: boolean;
  digestTime: string;
}
