"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import type { NotificationSettings } from "../types"
import { NOTIFICATION_OPTIONS } from "../constants"

interface NotificationsTabProps {
  notifications: NotificationSettings
  onNotificationChange: (key: keyof NotificationSettings, value: boolean) => void
}

export function NotificationsTab({ notifications, onNotificationChange }: NotificationsTabProps) {
  return (
    <div className="space-y-6">
      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader>
          <CardTitle className="text-slate-100">Notification Preferences</CardTitle>
          <CardDescription className="text-slate-400">
            Choose which notifications you want to receive
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-1">
          {NOTIFICATION_OPTIONS.map((option) => (
            <div
              key={option.id}
              className="flex items-center justify-between p-4 rounded-lg hover:bg-slate-800/30 transition-colors"
            >
              <div className="space-y-0.5">
                <Label htmlFor={option.id} className="text-slate-200 font-medium cursor-pointer">
                  {option.label}
                </Label>
                <p className="text-sm text-slate-400">{option.description}</p>
              </div>
              <Switch
                id={option.id}
                checked={notifications[option.id as keyof NotificationSettings]}
                onCheckedChange={(checked) =>
                  onNotificationChange(option.id as keyof NotificationSettings, checked)
                }
                className="data-[state=checked]:bg-emerald-500"
              />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
