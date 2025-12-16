'use client';

/**
 * Alert Preferences Tab Component
 * @description Tab for settings page showing alert configuration
 */

import { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Mail, 
  Bell, 
  MessageSquare, 
  AlertTriangle, 
  Calendar,
  Send,
  Loader2,
  CheckCircle,
  Info
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

interface AlertPreferences {
  emailEnabled: boolean;
  slackEnabled: boolean;
  slackWebhookUrl: string;
  pushEnabled: boolean;
  criticalOnly: boolean;
  dailyDigest: boolean;
  digestTime: string;
}

export function AlertPreferencesTab() {
  const { user } = useAuth();
  
  const [preferences, setPreferences] = useState<AlertPreferences>({
    emailEnabled: true,
    slackEnabled: false,
    slackWebhookUrl: '',
    pushEnabled: false,
    criticalOnly: false,
    dailyDigest: true,
    digestTime: '09:00',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const updatePreference = <K extends keyof AlertPreferences>(
    key: K,
    value: AlertPreferences[K]
  ) => {
    setPreferences((prev) => ({ ...prev, [key]: value }));
    setSaveSuccess(false);
  };

  const savePreferences = useCallback(async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/alerts/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferences),
      });
      
      if (response.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (error) {
      console.error('Failed to save preferences:', error);
    } finally {
      setIsSaving(false);
    }
  }, [preferences]);

  const sendTestAlert = useCallback(async () => {
    setIsSendingTest(true);
    try {
      await fetch('/api/alerts/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channels: {
            email: preferences.emailEnabled,
            slack: preferences.slackEnabled,
            push: preferences.pushEnabled,
          },
        }),
      });
    } catch (error) {
      console.error('Failed to send test alert:', error);
    } finally {
      setIsSendingTest(false);
    }
  }, [preferences]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold">Alert Preferences</h3>
        <p className="text-sm text-muted-foreground">
          Configure how you want to be notified about content decay
        </p>
      </div>

      {/* Notification Channels */}
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
                  {user?.email || 'your-email@example.com'}
                </div>
              </div>
            </div>
            <Switch
              checked={preferences.emailEnabled}
              onCheckedChange={(checked) => updatePreference('emailEnabled', checked)}
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
                onCheckedChange={(checked) => updatePreference('slackEnabled', checked)}
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
                  onChange={(e) => updatePreference('slackWebhookUrl', e.target.value)}
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
              onCheckedChange={(checked) => updatePreference('pushEnabled', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Alert Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Alert Filters
          </CardTitle>
          <CardDescription>
            Control which alerts you receive
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Critical Only */}
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-sm">Critical Alerts Only</div>
              <div className="text-xs text-muted-foreground">
                Only receive alerts for severe content decay (&gt;30% drop)
              </div>
            </div>
            <Switch
              checked={preferences.criticalOnly}
              onCheckedChange={(checked) => updatePreference('criticalOnly', checked)}
            />
          </div>

          <Separator />

          {/* Daily Digest */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <div className="font-medium text-sm">Daily Digest</div>
                  <div className="text-xs text-muted-foreground">
                    Receive a summary of all changes daily
                  </div>
                </div>
              </div>
              <Switch
                checked={preferences.dailyDigest}
                onCheckedChange={(checked) => updatePreference('dailyDigest', checked)}
              />
            </div>

            {preferences.dailyDigest && (
              <div className="ml-13 space-y-2">
                <Label htmlFor="digest-time" className="text-xs">
                  Delivery Time
                </Label>
                <Input
                  id="digest-time"
                  type="time"
                  value={preferences.digestTime}
                  onChange={(e) => updatePreference('digestTime', e.target.value)}
                  className="w-32 text-sm"
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="bg-muted/50 border-muted">
        <CardContent className="pt-4">
          <div className="flex gap-3">
            <Info className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
            <div className="text-sm text-muted-foreground">
              <p className="font-medium text-foreground mb-1">How alerts work</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>Content is scanned every 6 hours for changes</li>
                <li>You&apos;ll be notified when traffic drops by 20% or more</li>
                <li>Position drops of 5+ spots also trigger alerts</li>
                <li>Critical alerts are sent for 30%+ traffic drops</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-4">
        <Button
          variant="outline"
          onClick={sendTestAlert}
          disabled={isSendingTest || (!preferences.emailEnabled && !preferences.slackEnabled && !preferences.pushEnabled)}
        >
          {isSendingTest ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              Send Test Alert
            </>
          )}
        </Button>

        <Button onClick={savePreferences} disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : saveSuccess ? (
            <>
              <CheckCircle className="mr-2 h-4 w-4" />
              Saved!
            </>
          ) : (
            'Save Preferences'
          )}
        </Button>
      </div>
    </div>
  );
}
