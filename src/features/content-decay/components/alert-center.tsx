// ============================================
// CONTENT DECAY - Alert Center Component
// ============================================

import {
  BellRing,
  Mail,
  MessageSquare,
  Bell,
  Clock,
  Shield,
  Zap,
  TrendingDown,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { DecayAlert, AlertPreferences } from "../types"
import {
  CHANNEL_BUTTON_STYLES,
  PREF_BUTTON_STYLES,
} from "../constants"
import { ChannelButton, PrefButton, AlertItem, AlertsEmptyState } from "./alert-center-parts"

interface AlertCenterProps {
  alerts: DecayAlert[]
  alertPrefs: AlertPreferences
  showAlertPanel: boolean
  unreadCount: number
  onTogglePanel: () => void
  onTogglePref: (key: keyof AlertPreferences) => void
  onDismissAlert: (alertId: string) => void
  onMarkActioned: (alertId: string) => void
  onViewArticle: (alertId: string, articleId: string) => void
}

export function AlertCenter({
  alerts,
  alertPrefs,
  showAlertPanel,
  unreadCount,
  onTogglePanel,
  onTogglePref,
  onDismissAlert,
  onMarkActioned,
  onViewArticle,
}: AlertCenterProps) {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center justify-between p-3 sm:p-4 cursor-pointer hover:bg-muted/30 transition-colors"
        onClick={onTogglePanel}
      >
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="relative">
            <BellRing className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-red-500 text-[8px] sm:text-[10px] font-bold text-white flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-semibold text-foreground">
              Decay Alert Center
            </h2>
            <p className="text-[10px] sm:text-xs text-muted-foreground">
              {unreadCount} unread alerts
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden xs:flex items-center gap-1.5 sm:gap-2">
            {alertPrefs.email && <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground" />}
            {alertPrefs.slack && <MessageSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground" />}
            {alertPrefs.whatsapp && <MessageSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />}
            {alertPrefs.push && <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground" />}
          </div>
          <TrendingDown
            className={cn(
              "w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground transition-transform",
              showAlertPanel && "rotate-180"
            )}
          />
        </div>
      </div>

      {/* Expanded Panel */}
      {showAlertPanel && (
        <div className="border-t border-border">
          {/* Alert Preferences */}
          <div className="p-3 sm:p-4 bg-muted/20 border-b border-border">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
              <span className="text-xs sm:text-sm font-medium text-foreground">Alert Channels</span>
              <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                <ChannelButton
                  isActive={alertPrefs.email}
                  onClick={() => onTogglePref("email")}
                  icon={Mail}
                  label="Email"
                  styles={CHANNEL_BUTTON_STYLES.email}
                />
                <ChannelButton
                  isActive={alertPrefs.slack}
                  onClick={() => onTogglePref("slack")}
                  icon={MessageSquare}
                  label="Slack"
                  styles={CHANNEL_BUTTON_STYLES.slack}
                />
                <ChannelButton
                  isActive={alertPrefs.whatsapp}
                  onClick={() => onTogglePref("whatsapp")}
                  icon={MessageSquare}
                  label="WhatsApp"
                  styles={CHANNEL_BUTTON_STYLES.whatsapp}
                />
                <ChannelButton
                  isActive={alertPrefs.push}
                  onClick={() => onTogglePref("push")}
                  icon={Bell}
                  label="Push"
                  styles={CHANNEL_BUTTON_STYLES.push}
                />
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2 sm:mt-3">
              <PrefButton
                isActive={alertPrefs.criticalOnly}
                onClick={() => onTogglePref("criticalOnly")}
                icon={Shield}
                label="Critical Only"
                styles={PREF_BUTTON_STYLES.criticalOnly}
              />
              <PrefButton
                isActive={alertPrefs.dailyDigest}
                onClick={() => onTogglePref("dailyDigest")}
                icon={Clock}
                label="Daily Digest"
                styles={PREF_BUTTON_STYLES.dailyDigest}
              />
              <PrefButton
                isActive={alertPrefs.instantAlerts}
                onClick={() => onTogglePref("instantAlerts")}
                icon={Zap}
                label="Instant Alerts"
                styles={PREF_BUTTON_STYLES.instantAlerts}
              />
            </div>
          </div>

          {/* Alert List */}
          <div className="max-h-[250px] sm:max-h-[300px] overflow-y-auto divide-y divide-border">
            {alerts.length === 0 ? (
              <AlertsEmptyState />
            ) : (
              alerts.map((alert) => (
                <AlertItem
                  key={alert.id}
                  alert={alert}
                  onDismiss={() => onDismissAlert(alert.id)}
                  onMarkActioned={() => onMarkActioned(alert.id)}
                  onViewArticle={
                    alert.articleId
                      ? () => onViewArticle(alert.id, alert.articleId!)
                      : undefined
                  }
                />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
