'use client';

/**
 * Notification Channels Component
 * @description Email, Slack, and Push notification settings
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Mail, Bell, MessageSquare } from 'lucide-react';
import type { AlertPreferences } from './types';

interface NotificationChannelsProps {
  preferences: AlertPreferences;
  userEmail?: string;
  onUpdate: <K extends keyof AlertPreferences>(key: K, value: AlertPreferences[K]) => void;
}

export function NotificationChannels({ 
  preferences, 
  userEmail, 
  onUpdate 
}: NotificationChannelsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Bell className="h-4 w-4" />
          Notification Channels
        </CardTitle>
        <CardDescription>
          Choose how you want to receive alerts
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Email Notifications */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Mail className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <div className="font-medium text-sm">Email Notifications</div>
              <div className="text-xs text-muted-foreground">
                {userEmail || 'your-email@example.com'}
              </div>
            </div>
          </div>
          <Switch
            checked={preferences.emailEnabled}
            onCheckedChange={(checked) => onUpdate('emailEnabled', checked)}
          />
        </div>

        <Separator />

        {/* Slack Notifications */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <div className="font-medium text-sm">Slack Notifications</div>
                <div className="text-xs text-muted-foreground">
                  Get alerts in your Slack channel
                </div>
              </div>
            </div>
            <Switch
              checked={preferences.slackEnabled}
              onCheckedChange={(checked) => onUpdate('slackEnabled', checked)}
            />
          </div>

          {preferences.slackEnabled && (
            <div className="ml-13 pl-13 space-y-2">
              <Label htmlFor="slack-webhook" className="text-xs">
                Webhook URL
              </Label>
              <Input
                id="slack-webhook"
                type="url"
                placeholder="https://hooks.slack.com/services/..."
                value={preferences.slackWebhookUrl}
                onChange={(e) => onUpdate('slackWebhookUrl', e.target.value)}
                className="text-sm"
              />
              <p className="text-xs text-muted-foreground">
                <a 
                  href="https://api.slack.com/messaging/webhooks" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Learn how to create a webhook
                </a>
              </p>
            </div>
          )}
        </div>

        <Separator />

        {/* Push Notifications */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
              <Bell className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <div className="font-medium text-sm flex items-center gap-2">
                Push Notifications
                <Badge variant="secondary" className="text-xs">
                  Beta
                </Badge>
              </div>
              <div className="text-xs text-muted-foreground">
                Browser push notifications
              </div>
            </div>
          </div>
          <Switch
            checked={preferences.pushEnabled}
            onCheckedChange={(checked) => onUpdate('pushEnabled', checked)}
          />
        </div>
      </CardContent>
    </Card>
  );
}
