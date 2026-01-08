"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import type { SettingsTab, NotificationSettings } from "./types"
import { DEFAULT_NOTIFICATIONS } from "./constants"
import {
  SettingsTabs,
  GeneralTab,
  BillingTab,
  ApiKeysTab,
  UsageTab,
  NotificationsTab,
} from "./components"
import { IntegrationsTab, AlertPreferencesTab } from "@/src/features/integrations/shared"
import { PAGE_PADDING, STACK_SPACING } from "@/src/styles"

export function SettingsContent() {
  const searchParams = useSearchParams()
  const tabFromUrl = searchParams.get("tab") as SettingsTab | null
  const [activeTab, setActiveTab] = useState<SettingsTab>(tabFromUrl || "general")
  const [notifications, setNotifications] = useState<NotificationSettings>(DEFAULT_NOTIFICATIONS)

  // Sync tab with URL params
  useEffect(() => {
    if (tabFromUrl && ["general", "billing", "api", "usage", "notifications", "integrations", "alerts"].includes(tabFromUrl)) {
      setActiveTab(tabFromUrl)
    }
  }, [tabFromUrl])

  const handleNotificationChange = (key: keyof NotificationSettings, value: boolean) => {
    setNotifications((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <div className={`flex-1 ${PAGE_PADDING.default} bg-background`}>
      <div className={`max-w-4xl mx-auto ${STACK_SPACING.default}`}>
        {/* Page Header */}
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-foreground">Settings</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">Manage your account settings and preferences</p>
        </div>

        {/* Tabbed Interface */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as SettingsTab)} className={STACK_SPACING.default}>
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

          <TabsContent value="usage">
            <UsageTab />
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
