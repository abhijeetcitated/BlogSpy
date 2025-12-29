"use client"

import { TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { SettingsTab } from "../types"
import { SETTINGS_TABS } from "../constants"

interface SettingsTabsProps {
  activeTab: SettingsTab
  onTabChange: (tab: SettingsTab) => void
}

export function SettingsTabs({ activeTab, onTabChange }: SettingsTabsProps) {
  return (
    <TabsList className="bg-card/50 border border-border p-1 h-auto flex flex-wrap gap-1">
      {SETTINGS_TABS.map((tab) => {
        const Icon = tab.icon
        const isActive = activeTab === tab.value
        return (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            onClick={() => onTabChange(tab.value)}
            className={`gap-2 transition-all duration-200 ${
              isActive 
                ? `${tab.activeBg} ${tab.activeColor} border border-current/20` 
                : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
            }`}
          >
            <Icon className={`h-4 w-4 ${isActive ? tab.color : ""}`} />
            {tab.label}
          </TabsTrigger>
        )
      })}
    </TabsList>
  )
}
