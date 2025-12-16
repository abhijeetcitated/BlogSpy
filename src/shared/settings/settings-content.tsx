"use client"

import { useState } from "react"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import type { SettingsTab, NotificationSettings } from "./types"
import { DEFAULT_NOTIFICATIONS } from "./constants"
import {
  SettingsTabs,
  GeneralTab,
  BillingTab,
  ApiKeysTab,
  NotificationsTab,
} from "./components"
import { IntegrationsTab, AlertPreferencesTab } from "@/src/features/integrations/shared"

export function SettingsContent() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("general")
  const [notifications, setNotifications] = useState<NotificationSettings>(DEFAULT_NOTIFICATIONS)

  const handleNotificationChange = (key: keyof NotificationSettings, value: boolean) => {
    setNotifications((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <div className="flex-1 p-6 bg-slate-950">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-semibold text-slate-100">Settings</h1>
          <p className="text-sm text-slate-400 mt-1">Manage your account settings and preferences</p>
        </div>

        {/* Tabbed Interface */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as SettingsTab)} className="space-y-6">
          <SettingsTabs activeTab={activeTab} onTabChange={setActiveTab} />

          <TabsContent value="general">
            <GeneralTab />
          </TabsContent>

          <TabsContent value="billing">
            <BillingTab />
          </TabsContent>

          <TabsContent value="api">
            <ApiKeysTab />
          </TabsContent>

          <TabsContent value="notifications">
            <NotificationsTab
              notifications={notifications}
              onNotificationChange={handleNotificationChange}
            />
          </TabsContent>

          <TabsContent value="integrations">
            <IntegrationsTab />
          </TabsContent>

          <TabsContent value="alerts">
            <AlertPreferencesTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
