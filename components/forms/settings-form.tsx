"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { 
  User, 
  Mail, 
  Lock, 
  Bell, 
  Globe, 
  Palette,
  CreditCard,
  Shield,
  Loader2,
  Check,
  Eye,
  EyeOff,
  Save
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface SettingsFormProps {
  initialData?: UserSettings
  onSave: (data: UserSettings) => void | Promise<void>
  isLoading?: boolean
  className?: string
}

interface UserSettings {
  profile: {
    name: string
    email: string
    avatar?: string
  }
  preferences: {
    language: string
    timezone: string
    theme: "light" | "dark" | "system"
  }
  notifications: {
    email: boolean
    rankChanges: boolean
    weeklyReport: boolean
    contentDecay: boolean
    newFeatures: boolean
  }
  security: {
    twoFactor: boolean
  }
}

const defaultSettings: UserSettings = {
  profile: {
    name: "",
    email: "",
  },
  preferences: {
    language: "en",
    timezone: "UTC",
    theme: "dark",
  },
  notifications: {
    email: true,
    rankChanges: true,
    weeklyReport: true,
    contentDecay: true,
    newFeatures: false,
  },
  security: {
    twoFactor: false,
  },
}

const timezones = [
  { value: "UTC", label: "UTC" },
  { value: "America/New_York", label: "Eastern Time (ET)" },
  { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
  { value: "Europe/London", label: "London (GMT)" },
  { value: "Europe/Paris", label: "Paris (CET)" },
  { value: "Asia/Tokyo", label: "Tokyo (JST)" },
  { value: "Asia/Kolkata", label: "India (IST)" },
]

const languages = [
  { value: "en", label: "English" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "ja", label: "Japanese" },
  { value: "hi", label: "Hindi" },
]

export function SettingsForm({
  initialData = defaultSettings,
  onSave,
  isLoading = false,
  className,
}: SettingsFormProps) {
  const [settings, setSettings] = useState<UserSettings>(initialData)
  const [showPassword, setShowPassword] = useState(false)
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
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

  return (
    <div className={cn("space-y-6", className)}>
      {/* Profile Settings */}
      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-emerald-400" />
            <CardTitle className="text-white">Profile</CardTitle>
          </div>
          <CardDescription>Manage your personal information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Full Name</label>
              <Input
                value={settings.profile.name}
                onChange={(e) => updateProfile("name", e.target.value)}
                placeholder="John Doe"
                className="bg-slate-800/50 border-slate-700 text-white"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Email</label>
              <Input
                type="email"
                value={settings.profile.email}
                onChange={(e) => updateProfile("email", e.target.value)}
                placeholder="john@example.com"
                className="bg-slate-800/50 border-slate-700 text-white"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-cyan-400" />
            <CardTitle className="text-white">Preferences</CardTitle>
          </div>
          <CardDescription>Customize your experience</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Language</label>
              <Select
                value={settings.preferences.language}
                onValueChange={(value) => updatePreferences("language", value)}
              >
                <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-800">
                  {languages.map((lang) => (
                    <SelectItem key={lang.value} value={lang.value} className="text-slate-300">
                      {lang.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Timezone</label>
              <Select
                value={settings.preferences.timezone}
                onValueChange={(value) => updatePreferences("timezone", value)}
              >
                <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-800">
                  {timezones.map((tz) => (
                    <SelectItem key={tz.value} value={tz.value} className="text-slate-300">
                      {tz.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Theme</label>
              <Select
                value={settings.preferences.theme}
                onValueChange={(value) => updatePreferences("theme", value as "light" | "dark" | "system")}
              >
                <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-800">
                  <SelectItem value="light" className="text-slate-300">Light</SelectItem>
                  <SelectItem value="dark" className="text-slate-300">Dark</SelectItem>
                  <SelectItem value="system" className="text-slate-300">System</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-purple-400" />
            <CardTitle className="text-white">Notifications</CardTitle>
          </div>
          <CardDescription>Choose what updates you receive</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { key: "email" as const, label: "Email notifications", description: "Receive updates via email" },
            { key: "rankChanges" as const, label: "Rank changes", description: "Alert when rankings change significantly" },
            { key: "weeklyReport" as const, label: "Weekly report", description: "Get a summary every week" },
            { key: "contentDecay" as const, label: "Content decay alerts", description: "Notify when content is losing traffic" },
            { key: "newFeatures" as const, label: "New features", description: "Learn about new BlogSpy features" },
          ].map((notification) => (
            <div key={notification.key} className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium text-white">{notification.label}</p>
                <p className="text-xs text-slate-500">{notification.description}</p>
              </div>
              <Switch
                checked={settings.notifications[notification.key]}
                onCheckedChange={(checked) => updateNotification(notification.key, checked)}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Security */}
      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-orange-400" />
            <CardTitle className="text-white">Security</CardTitle>
          </div>
          <CardDescription>Protect your account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium text-white">Two-factor authentication</p>
              <p className="text-xs text-slate-500">Add an extra layer of security</p>
            </div>
            <Switch
              checked={settings.security.twoFactor}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, security: { ...settings.security, twoFactor: checked } })
              }
            />
          </div>

          <div className="pt-4 border-t border-slate-800">
            <p className="text-sm font-medium text-white mb-3">Change Password</p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs text-slate-500">New Password</label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="bg-slate-800/50 border-slate-700 text-white pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs text-slate-500">Confirm Password</label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="bg-slate-800/50 border-slate-700 text-white"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={isLoading}
          className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white"
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
