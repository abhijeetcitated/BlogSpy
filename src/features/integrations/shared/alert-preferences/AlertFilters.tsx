'use client';

/**
 * Alert Filters Component
 * @description Critical only and daily digest settings
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { AlertTriangle, Calendar } from 'lucide-react';
import type { AlertPreferences } from './types';

interface AlertFiltersProps {
  preferences: AlertPreferences;
  onUpdate: <K extends keyof AlertPreferences>(key: K, value: AlertPreferences[K]) => void;
}

export function AlertFilters({ preferences, onUpdate }: AlertFiltersProps) {
  return (
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
            onCheckedChange={(checked) => onUpdate('criticalOnly', checked)}
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
              onCheckedChange={(checked) => onUpdate('dailyDigest', checked)}
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
                onChange={(e) => onUpdate('digestTime', e.target.value)}
                className="w-32 text-sm"
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
