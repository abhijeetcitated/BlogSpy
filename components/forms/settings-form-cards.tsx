// ============================================
// SETTINGS FORM - Card Components
// ============================================

"use client"

import { useState } from "react"
import { User, Globe, Bell, Shield, Eye, EyeOff } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { UserSettings } from "./settings-form-types"
import { timezones, languages, notificationOptions } from "./settings-form-types"

// ============================================
// PROFILE CARD
// ============================================

interface ProfileCardProps {
  settings: UserSettings
  onUpdate: (field: keyof UserSettings["profile"], value: string) => void
}

export function ProfileCard({ settings, onUpdate }: ProfileCardProps) {
  return (
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
              onChange={(e) => onUpdate("name", e.target.value)}
              placeholder="John Doe"
              className="bg-slate-800/50 border-slate-700 text-white"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Email</label>
            <Input
              type="email"
              value={settings.profile.email}
              onChange={(e) => onUpdate("email", e.target.value)}
              placeholder="john@example.com"
              className="bg-slate-800/50 border-slate-700 text-white"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ============================================
// PREFERENCES CARD
// ============================================

interface PreferencesCardProps {
  settings: UserSettings
  onUpdate: (field: keyof UserSettings["preferences"], value: string) => void
}

export function PreferencesCard({ settings, onUpdate }: PreferencesCardProps) {
  return (
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
              onValueChange={(value) => onUpdate("language", value)}
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
              onValueChange={(value) => onUpdate("timezone", value)}
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
              onValueChange={(value) => onUpdate("theme", value as "light" | "dark" | "system")}
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
  )
}

// ============================================
// NOTIFICATIONS CARD
// ============================================

interface NotificationsCardProps {
  settings: UserSettings
  onUpdate: (field: keyof UserSettings["notifications"], value: boolean) => void
}

export function NotificationsCard({ settings, onUpdate }: NotificationsCardProps) {
  return (
    <Card className="bg-slate-900/50 border-slate-800">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-purple-400" />
          <CardTitle className="text-white">Notifications</CardTitle>
        </div>
        <CardDescription>Choose what updates you receive</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {notificationOptions.map((notification) => (
          <div key={notification.key} className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium text-white">{notification.label}</p>
              <p className="text-xs text-slate-500">{notification.description}</p>
            </div>
            <Switch
              checked={settings.notifications[notification.key]}
              onCheckedChange={(checked) => onUpdate(notification.key, checked)}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

// ============================================
// SECURITY CARD
// ============================================

interface SecurityCardProps {
  settings: UserSettings
  onUpdateTwoFactor: (value: boolean) => void
}

export function SecurityCard({ settings, onUpdateTwoFactor }: SecurityCardProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  return (
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
            onCheckedChange={onUpdateTwoFactor}
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
  )
}
