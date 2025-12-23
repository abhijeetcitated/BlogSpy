// ============================================
// RANK TRACKER - Alert Settings Modal
// ============================================

"use client"

import { useState, useCallback } from "react"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

export interface AlertSettingsState {
  rankDrops: boolean
  rankImprovements: boolean
  top3Entry: boolean
  top10Entry: boolean
  aiOverviewChanges: boolean
  emailNotifications: boolean
  slackIntegration: boolean
}

interface AlertSettingsModalProps {
  /** Whether the modal is open */
  isOpen: boolean
  /** Callback when modal is closed */
  onClose: () => void
  /** Current alert settings */
  settings: AlertSettingsState
  /** Callback when settings are saved */
  onSave: (settings: AlertSettingsState) => void
  /** Legacy props for backwards compatibility */
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onSettingsChange?: (settings: AlertSettingsState) => void
}

export function AlertSettingsModal({
  isOpen,
  onClose,
  settings: initialSettings,
  onSave,
  // Legacy props
  open,
  onOpenChange,
  onSettingsChange,
}: AlertSettingsModalProps) {
  // Support both new and legacy props
  const isModalOpen = isOpen ?? open ?? false
  const handleClose = onClose ?? (() => onOpenChange?.(false))
  
  // Local state for editing
  const [localSettings, setLocalSettings] = useState<AlertSettingsState>(initialSettings)

  const updateSetting = useCallback((key: keyof AlertSettingsState, value: boolean) => {
    const newSettings = { ...localSettings, [key]: value }
    setLocalSettings(newSettings)
    onSettingsChange?.(newSettings)
  }, [localSettings, onSettingsChange])

  const handleSave = useCallback(() => {
    onSave(localSettings)
  }, [onSave, localSettings])

  return (
    <Dialog open={isModalOpen} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="bg-card border-border text-foreground max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-emerald-400" />
            Alert Settings
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Configure which ranking changes trigger alerts
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          {/* Alert Triggers */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-foreground">Alert Triggers</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="rankDrops" className="text-sm text-muted-foreground">
                  Rank drops ({">"} 3 positions)
                </Label>
                <Switch
                  id="rankDrops"
                  checked={localSettings.rankDrops}
                  onCheckedChange={(checked) => updateSetting("rankDrops", checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="rankImprovements" className="text-sm text-muted-foreground">
                  Rank improvements ({">"} 3 positions)
                </Label>
                <Switch
                  id="rankImprovements"
                  checked={localSettings.rankImprovements}
                  onCheckedChange={(checked) => updateSetting("rankImprovements", checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="top3Entry" className="text-sm text-muted-foreground">
                  Entry into Top 3
                </Label>
                <Switch
                  id="top3Entry"
                  checked={localSettings.top3Entry}
                  onCheckedChange={(checked) => updateSetting("top3Entry", checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="top10Entry" className="text-sm text-muted-foreground">
                  Entry into Top 10
                </Label>
                <Switch
                  id="top10Entry"
                  checked={localSettings.top10Entry}
                  onCheckedChange={(checked) => updateSetting("top10Entry", checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="aiOverviewChanges" className="text-sm text-muted-foreground">
                  AI Overview changes
                </Label>
                <Switch
                  id="aiOverviewChanges"
                  checked={localSettings.aiOverviewChanges}
                  onCheckedChange={(checked) => updateSetting("aiOverviewChanges", checked)}
                />
              </div>
            </div>
          </div>

          {/* Notification Channels */}
          <div className="space-y-4 border-t border-border pt-4">
            <h4 className="text-sm font-medium text-foreground">Notification Channels</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="emailNotifications" className="text-sm text-muted-foreground">
                  Email notifications
                </Label>
                <Switch
                  id="emailNotifications"
                  checked={localSettings.emailNotifications}
                  onCheckedChange={(checked) => updateSetting("emailNotifications", checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="slackIntegration" className="text-sm text-muted-foreground flex items-center gap-2">
                  Slack integration
                  <span className="text-[10px] px-1.5 py-0.5 bg-amber-500/20 text-amber-400 rounded">Pro</span>
                </Label>
                <Switch
                  id="slackIntegration"
                  checked={localSettings.slackIntegration}
                  onCheckedChange={(checked) => updateSetting("slackIntegration", checked)}
                />
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            className="border-border text-muted-foreground hover:bg-muted"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="bg-emerald-500 hover:bg-emerald-600 text-white"
          >
            Save Settings
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
