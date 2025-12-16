"use client"

import { useState, useCallback } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import {
  Bell,
  Loader2,
  TrendingUp,
  TrendingDown,
  Newspaper,
  Mail,
} from "lucide-react"
import type { NewsKeyword, NewsPlatform } from "../types"

// ============================================
// INTERFACES
// ============================================

export interface KeywordAlert {
  keywordId: string
  keyword: string
  enabled: boolean
  conditions: {
    positionChange: boolean
    positionThreshold: number // Alert if position drops below this
    topStoryEntry: boolean
    topStoryExit: boolean
    newArticles: boolean
    impressionDrop: boolean
    impressionDropThreshold: number // Percentage drop
  }
  notifications: {
    email: boolean
    push: boolean
    inApp: boolean
  }
}

interface SetAlertDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  keyword: NewsKeyword | null
  platform: NewsPlatform
  existingAlert?: KeywordAlert | null
  onSaveAlert: (alert: KeywordAlert) => Promise<boolean>
}

// ============================================
// DEFAULT ALERT CONFIG
// ============================================

const createDefaultAlert = (keyword: NewsKeyword): KeywordAlert => ({
  keywordId: keyword.id,
  keyword: keyword.keyword,
  enabled: true,
  conditions: {
    positionChange: true,
    positionThreshold: 10,
    topStoryEntry: true,
    topStoryExit: true,
    newArticles: false,
    impressionDrop: true,
    impressionDropThreshold: 20,
  },
  notifications: {
    email: true,
    push: false,
    inApp: true,
  },
})

// ============================================
// COMPONENT
// ============================================

export function SetAlertDialog({
  open,
  onOpenChange,
  keyword,
  platform,
  existingAlert,
  onSaveAlert,
}: SetAlertDialogProps) {
  // Initialize state
  const [alert, setAlert] = useState<KeywordAlert | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Reset form when keyword changes
  useState(() => {
    if (keyword && open) {
      setAlert(existingAlert || createDefaultAlert(keyword))
    }
  })

  // Update condition
  const updateCondition = useCallback((key: keyof KeywordAlert["conditions"], value: boolean | number) => {
    setAlert(prev => prev ? {
      ...prev,
      conditions: { ...prev.conditions, [key]: value }
    } : null)
  }, [])

  // Update notification
  const updateNotification = useCallback((key: keyof KeywordAlert["notifications"], value: boolean) => {
    setAlert(prev => prev ? {
      ...prev,
      notifications: { ...prev.notifications, [key]: value }
    } : null)
  }, [])

  // Handle submit
  const handleSubmit = async () => {
    if (!alert || !keyword) return

    setIsSubmitting(true)

    try {
      const success = await onSaveAlert(alert)

      if (success) {
        toast.success("Alert saved successfully!", {
          description: `You'll be notified about changes for "${keyword.keyword}"`,
        })
        onOpenChange(false)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle close
  const handleClose = () => {
    if (!isSubmitting) {
      onOpenChange(false)
    }
  }

  // Early return if no keyword or alert
  if (!keyword) {
    return null
  }

  // Initialize alert if needed
  if (!alert && open) {
    setAlert(existingAlert || createDefaultAlert(keyword))
    return null
  }

  if (!alert) return null

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-500/10">
              <Bell className="w-4 h-4 text-amber-500" />
            </div>
            Set Alert for Keyword
          </DialogTitle>
          <DialogDescription>
            Get notified when "{keyword.keyword}" has significant changes.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* Enable/Disable Alert */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <div className="flex items-center gap-3">
              <Bell className={cn(
                "w-5 h-5",
                alert.enabled ? "text-amber-500" : "text-muted-foreground"
              )} />
              <div>
                <p className="font-medium text-sm">Alert Enabled</p>
                <p className="text-xs text-muted-foreground">
                  {alert.enabled ? "You'll receive notifications" : "No notifications"}
                </p>
              </div>
            </div>
            <Switch
              checked={alert.enabled}
              onCheckedChange={(checked) => setAlert(prev => prev ? { ...prev, enabled: checked } : null)}
            />
          </div>

          {/* Alert Conditions */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Alert Conditions</Label>

            {/* Position Change */}
            <div className="p-3 rounded-lg border border-border space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-red-500" />
                  <span className="text-sm">Position Drop Alert</span>
                </div>
                <Switch
                  checked={alert.conditions.positionChange}
                  onCheckedChange={(checked) => updateCondition("positionChange", checked)}
                />
              </div>
              {alert.conditions.positionChange && (
                <div className="flex items-center gap-2 pl-6">
                  <span className="text-xs text-muted-foreground">Alert if position drops below</span>
                  <Input
                    type="number"
                    min={1}
                    max={100}
                    value={alert.conditions.positionThreshold}
                    onChange={(e) => updateCondition("positionThreshold", parseInt(e.target.value) || 10)}
                    className="w-16 h-7 text-xs"
                  />
                </div>
              )}
            </div>

            {/* Top Story Alerts (Google News only) */}
            {platform === "google-news" && (
              <div className="p-3 rounded-lg border border-border space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                    <span className="text-sm">Top Story Entry</span>
                  </div>
                  <Switch
                    checked={alert.conditions.topStoryEntry}
                    onCheckedChange={(checked) => updateCondition("topStoryEntry", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="w-4 h-4 text-red-500" />
                    <span className="text-sm">Top Story Exit</span>
                  </div>
                  <Switch
                    checked={alert.conditions.topStoryExit}
                    onCheckedChange={(checked) => updateCondition("topStoryExit", checked)}
                  />
                </div>
              </div>
            )}

            {/* Impression Drop (Google Discover only) */}
            {platform === "google-discover" && (
              <div className="p-3 rounded-lg border border-border space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="w-4 h-4 text-purple-500" />
                    <span className="text-sm">Impression Drop Alert</span>
                  </div>
                  <Switch
                    checked={alert.conditions.impressionDrop}
                    onCheckedChange={(checked) => updateCondition("impressionDrop", checked)}
                  />
                </div>
                {alert.conditions.impressionDrop && (
                  <div className="flex items-center gap-2 pl-6">
                    <span className="text-xs text-muted-foreground">Alert if impressions drop by</span>
                    <Input
                      type="number"
                      min={5}
                      max={100}
                      value={alert.conditions.impressionDropThreshold}
                      onChange={(e) => updateCondition("impressionDropThreshold", parseInt(e.target.value) || 20)}
                      className="w-16 h-7 text-xs"
                    />
                    <span className="text-xs text-muted-foreground">%</span>
                  </div>
                )}
              </div>
            )}

            {/* New Articles Alert */}
            <div className="p-3 rounded-lg border border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Newspaper className="w-4 h-4 text-blue-500" />
                  <span className="text-sm">New Articles Detected</span>
                </div>
                <Switch
                  checked={alert.conditions.newArticles}
                  onCheckedChange={(checked) => updateCondition("newArticles", checked)}
                />
              </div>
            </div>
          </div>

          {/* Notification Methods */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Notification Methods</Label>
            <div className="grid grid-cols-3 gap-2">
              <Button
                type="button"
                variant={alert.notifications.email ? "secondary" : "outline"}
                size="sm"
                className="h-12 flex-col gap-1"
                onClick={() => updateNotification("email", !alert.notifications.email)}
              >
                <Mail className={cn(
                  "w-4 h-4",
                  alert.notifications.email ? "text-blue-500" : "text-muted-foreground"
                )} />
                <span className="text-xs">Email</span>
              </Button>
              <Button
                type="button"
                variant={alert.notifications.push ? "secondary" : "outline"}
                size="sm"
                className="h-12 flex-col gap-1"
                onClick={() => updateNotification("push", !alert.notifications.push)}
              >
                <Bell className={cn(
                  "w-4 h-4",
                  alert.notifications.push ? "text-amber-500" : "text-muted-foreground"
                )} />
                <span className="text-xs">Push</span>
              </Button>
              <Button
                type="button"
                variant={alert.notifications.inApp ? "secondary" : "outline"}
                size="sm"
                className="h-12 flex-col gap-1"
                onClick={() => updateNotification("inApp", !alert.notifications.inApp)}
              >
                <Newspaper className={cn(
                  "w-4 h-4",
                  alert.notifications.inApp ? "text-emerald-500" : "text-muted-foreground"
                )} />
                <span className="text-xs">In-App</span>
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-amber-500 hover:bg-amber-600"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Bell className="w-4 h-4 mr-2" />
                Save Alert
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
