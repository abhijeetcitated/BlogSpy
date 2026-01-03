// ============================================
// SETTINGS FORM - Main Component (Refactored)
// ============================================

"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Loader2, Check, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProfileCard, PreferencesCard, NotificationsCard, SecurityCard } from "./settings-form-cards"
import { defaultSettings, type UserSettings, type SettingsFormProps } from "./settings-form-types"

export function SettingsForm({
  initialData = defaultSettings,
  onSave,
  isLoading = false,
  className,
}: SettingsFormProps) {
  const [settings, setSettings] = useState<UserSettings>(initialData)
  const [saved, setSaved] = useState(false)

  const handleSave = async () => {
    await onSave(settings)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const updateProfile = (field: keyof UserSettings["profile"], value: string) => {
    setSettings({
      ...settings,
      profile: { ...settings.profile, [field]: value },
    })
  }

  const updatePreferences = (field: keyof UserSettings["preferences"], value: string) => {
    setSettings({
      ...settings,
      preferences: { ...settings.preferences, [field]: value },
    })
  }

  const updateNotification = (field: keyof UserSettings["notifications"], value: boolean) => {
    setSettings({
      ...settings,
      notifications: { ...settings.notifications, [field]: value },
    })
  }

  const updateTwoFactor = (value: boolean) => {
    setSettings({
      ...settings,
      security: { ...settings.security, twoFactor: value },
    })
  }

  return (
    <div className={cn("space-y-6", className)}>
      <ProfileCard settings={settings} onUpdate={updateProfile} />
      <PreferencesCard settings={settings} onUpdate={updatePreferences} />
      <NotificationsCard settings={settings} onUpdate={updateNotification} />
      <SecurityCard settings={settings} onUpdateTwoFactor={updateTwoFactor} />

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={isLoading}
          className="bg-linear-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : saved ? (
            <>
              <Check className="mr-2 h-4 w-4" />
              Saved!
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

// Re-export types for convenience
export type { UserSettings, SettingsFormProps } from "./settings-form-types"
