'use client';

/**
 * Alert Preferences Tab Component
 * @description Tab for settings page showing alert configuration
 */

import { useState, useCallback } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { 
  NotificationChannels, 
  AlertFilters, 
  AlertInfoCard, 
  AlertActions,
  type AlertPreferences 
} from './alert-preferences';

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

  const updatePreference = useCallback(<K extends keyof AlertPreferences>(
    key: K,
    value: AlertPreferences[K]
  ) => {
    setPreferences((prev) => ({ ...prev, [key]: value }));
    setSaveSuccess(false);
  }, []);

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

  const canSendTest = preferences.emailEnabled || preferences.slackEnabled || preferences.pushEnabled;

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
      <NotificationChannels
        preferences={preferences}
        userEmail={user?.email}
        onUpdate={updatePreference}
      />

      {/* Alert Filters */}
      <AlertFilters
        preferences={preferences}
        onUpdate={updatePreference}
      />

      {/* Info Card */}
      <AlertInfoCard />

      {/* Action Buttons */}
      <AlertActions
        isSaving={isSaving}
        isSendingTest={isSendingTest}
        saveSuccess={saveSuccess}
        canSendTest={canSendTest}
        onSave={savePreferences}
        onSendTest={sendTestAlert}
      />
    </div>
  );
}
