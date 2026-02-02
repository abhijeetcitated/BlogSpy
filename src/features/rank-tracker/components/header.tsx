// ============================================
// RANK TRACKER - Header Component
// ============================================

"use client"

import { RefreshCw, Plus, Bell, Download, Target, Monitor, Smartphone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { cn } from "@/lib/utils"
import { GoogleIcon, BingIcon } from "./platform-icons"
import type { SearchPlatform } from "../types/platforms"

export type DeviceType = "desktop" | "mobile"

interface RankTrackerHeaderProps {
  // State
  activePlatform: SearchPlatform
  deviceType: DeviceType
  lastUpdated?: string
  isRefreshing?: boolean

  // Actions
  onPlatformChange: (platform: SearchPlatform) => void
  onDeviceChange: (device: DeviceType) => void
  onRefresh: (platform: SearchPlatform, device: DeviceType) => void
  onAddKeywords: () => void
  onOpenNotifications: () => void
  onExport: () => void
}

/**
 * Header with Platform Tabs, Device Toggle, and Actions
 */
export function RankTrackerHeader({
  activePlatform,
  deviceType,
  lastUpdated,
  isRefreshing = false,
  onPlatformChange,
  onDeviceChange,
  onRefresh,
  onAddKeywords,
  onOpenNotifications,
  onExport,
}: RankTrackerHeaderProps) {
  return (
    <div className="flex flex-col space-y-4">
      {/* Top Row: Title & Main Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Left: Title & Platform Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-linear-to-br from-emerald-500 to-cyan-500 shadow-sm">
              <Target className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground leading-none">Rank Tracker</h1>
              <div className="flex items-center gap-2 mt-1.5">
                <p className="text-xs text-muted-foreground">
                  {lastUpdated ? `Updated ${lastUpdated}` : "Track your keyword rankings"}
                </p>
              </div>
            </div>
          </div>

          {/* Platform Tabs (Google | Bing) */}
          <div className="flex items-center p-1 bg-muted/50 rounded-lg border border-border/50">
            <button
              onClick={() => onPlatformChange("google")}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-all",
                activePlatform === "google"
                  ? "bg-background text-foreground shadow-sm ring-1 ring-black/5"
                  : "text-muted-foreground hover:text-foreground hover:bg-background/50"
              )}
            >
              <GoogleIcon size={14} />
              Google
            </button>
            <div className="w-px h-4 bg-border/50 mx-1" />
            <button
              onClick={() => onPlatformChange("bing")}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-all",
                activePlatform === "bing"
                  ? "bg-background text-foreground shadow-sm ring-1 ring-black/5"
                  : "text-muted-foreground hover:text-foreground hover:bg-background/50"
              )}
            >
              <BingIcon size={14} />
              Bing
            </button>
          </div>
        </div>

        {/* Right: Device Toggle & Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Action Buttons */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onRefresh(activePlatform, deviceType)}
            disabled={isRefreshing}
            className="h-9 border-border text-muted-foreground hover:bg-muted"
          >
            <RefreshCw className={cn("w-3.5 h-3.5 mr-2", isRefreshing && "animate-spin")} />
            Refresh
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onExport}
            className="h-9 border-border text-muted-foreground hover:bg-muted"
          >
            <Download className="w-3.5 h-3.5 mr-2" />
            Export
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onOpenNotifications}
            className="h-9 w-9 px-0 border-border text-muted-foreground hover:bg-muted"
          >
            <Bell className="w-4 h-4" />
          </Button>

          {/* Device Toggle */}
          <div className="mr-2 border-r border-border/50 pr-4">
            <ToggleGroup
              type="single"
              value={deviceType}
              onValueChange={(val: string) => val && onDeviceChange(val as DeviceType)}
              className="bg-muted/50 p-0.5 rounded-lg border border-border/50"
            >
              <ToggleGroupItem
                value="desktop"
                size="sm"
                className="h-7 px-2.5 data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-sm"
              >
                <Monitor className="w-3.5 h-3.5 mr-1.5" />
                Desktop
              </ToggleGroupItem>
              <ToggleGroupItem
                value="mobile"
                size="sm"
                className="h-7 px-2.5 data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-sm"
              >
                <Smartphone className="w-3.5 h-3.5 mr-1.5" />
                Mobile
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          <Button
            size="sm"
            onClick={onAddKeywords}
            className="h-9 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm hover:shadow-md transition-all"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Keywords
          </Button>
        </div>
      </div>
    </div>
  )
}
