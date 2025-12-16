// ============================================
// RANK TRACKER - Notification Center Component
// ============================================

"use client"

import { Bell, MessageCircle, X } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface NotificationCenterProps {
  isOpen: boolean
  onClose: () => void
  whatsappEnabled: boolean
  whatsappNumber: string
  onWhatsappToggle: (enabled: boolean) => void
  onWhatsappNumberChange: (number: string) => void
}

/**
 * Notification settings panel
 */
export function NotificationCenter({
  isOpen,
  onClose,
  whatsappEnabled,
  whatsappNumber,
  onWhatsappToggle,
  onWhatsappNumberChange,
}: NotificationCenterProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative bg-card border border-border rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-violet-500/20">
              <Bell className="w-5 h-5 text-violet-400" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">
              Notification Settings
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* WhatsApp Alert Settings */}
        <div className="space-y-4">
          <div className="bg-muted/50 rounded-xl p-4 border border-border">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <MessageCircle className="w-5 h-5 text-emerald-500" />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    WhatsApp Alerts
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Get notified on ranking changes
                  </p>
                </div>
              </div>
              <Switch
                checked={whatsappEnabled}
                onCheckedChange={onWhatsappToggle}
              />
            </div>

            {whatsappEnabled && (
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">Phone Number</label>
                <Input
                  placeholder="+1 234 567 8900"
                  value={whatsappNumber}
                  onChange={(e) => onWhatsappNumberChange(e.target.value)}
                  className="bg-background/50 border-border text-foreground placeholder:text-muted-foreground/60"
                />
              </div>
            )}
          </div>

          {/* Alert Triggers */}
          <div className="bg-muted/50 rounded-xl p-4 border border-border">
            <p className="text-sm font-medium text-foreground mb-3">
              Alert me when:
            </p>
            <div className="space-y-2 text-sm text-muted-foreground">
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked className="rounded" />
                <span>Keyword enters Top 10</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked className="rounded" />
                <span>Keyword drops more than 5 positions</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" className="rounded" />
                <span>Keyword exits Top 100</span>
              </label>
            </div>
          </div>

          {/* Save Button */}
          <Button className="w-full bg-violet-600 hover:bg-violet-700 text-white">
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  )
}
