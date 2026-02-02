"use client"

import { useState, useEffect, useMemo } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { Loader2 } from "lucide-react"
import type { SettingsTab } from "../types"
import { SETTINGS_TABS } from "../constants"
import {
  SettingsTabs,
  GeneralTab,
  BillingTab,
  ApiKeysTab,
  UsageTab,
  NotificationsTab,
} from "."
import { IntegrationsTab, AlertPreferencesTab } from "@features/integrations/shared"
import { PAGE_PADDING, STACK_SPACING } from "@/styles"
import { useAuth } from "@/contexts/auth-context"

export function SettingsContent() {
  const router = useRouter()
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const searchParams = useSearchParams()
  const tabFromUrl = searchParams.get("tab") as SettingsTab | null
  const enabledTabs = useMemo(
    () => SETTINGS_TABS.filter((tab) => tab.enabled !== false).map((tab) => tab.value),
    []
  )
  const defaultTab = enabledTabs[0] ?? "general"
  const [activeTab, setActiveTab] = useState<SettingsTab>(
    tabFromUrl && enabledTabs.includes(tabFromUrl) ? tabFromUrl : defaultTab
  )

  // Redirect to login if not authenticated (after auth loading is complete)
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login")
    }
  }, [authLoading, isAuthenticated, router])

  // Sync tab with URL params
  useEffect(() => {
    if (tabFromUrl && enabledTabs.includes(tabFromUrl)) {
      setActiveTab(tabFromUrl)
      return
    }
    if (tabFromUrl && !enabledTabs.includes(tabFromUrl)) {
      setActiveTab(defaultTab)
    }
  }, [defaultTab, enabledTabs, tabFromUrl])


  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  // Don't render settings if not authenticated
  if (!isAuthenticated) {
    return null
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

          {enabledTabs.includes("api") && (
            <TabsContent value="api">
              <ApiKeysTab />
            </TabsContent>
          )}

          <TabsContent value="usage">
            <UsageTab />
          </TabsContent>

          <TabsContent value="notifications">
            <NotificationsTab />
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
