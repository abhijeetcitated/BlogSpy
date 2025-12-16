"use client"

import { User, CreditCard, Key, Bell } from "lucide-react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { SettingsTab } from "../types"
import { SETTINGS_TABS } from "../constants"

interface SettingsTabsProps {
  activeTab: SettingsTab
  onTabChange: (tab: SettingsTab) => void
}

const ICONS = { User, CreditCard, Key, Bell }

export function SettingsTabs({ activeTab, onTabChange }: SettingsTabsProps) {
  return (
    <TabsList className="bg-slate-900/50 border border-slate-800 p-1 h-auto">
      {SETTINGS_TABS.map((tab) => {
        const Icon = tab.icon
        return (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            onClick={() => onTabChange(tab.value)}
            className="gap-2 data-[state=active]:bg-slate-800 data-[state=active]:text-slate-100 text-slate-400"
          >
            <Icon className="h-4 w-4" />
            {tab.label}
          </TabsTrigger>
        )
      })}
    </TabsList>
  )
}
