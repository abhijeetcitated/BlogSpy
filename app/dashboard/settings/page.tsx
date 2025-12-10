"use client"

import { useState } from "react"
import { 
  User, 
  Bell, 
  Palette, 
  Shield, 
  Globe, 
  Key,
  Save,
  Eye,
  EyeOff,
  Check
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

// Mock user data
const mockUser = {
  name: "Demo User",
  email: "demo@blogspy.io",
  avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=demo",
  plan: "pro",
  settings: {
    emailNotifications: true,
    weeklyReport: true,
    marketingEmails: false,
    theme: "dark",
    defaultLocation: "US",
    defaultLanguage: "en",
  }
}

const locations = [
  { value: "US", label: "🇺🇸 United States" },
  { value: "GB", label: "🇬🇧 United Kingdom" },
  { value: "CA", label: "🇨🇦 Canada" },
  { value: "AU", label: "🇦🇺 Australia" },
  { value: "DE", label: "🇩🇪 Germany" },
  { value: "FR", label: "🇫🇷 France" },
  { value: "IN", label: "🇮🇳 India" },
]

const languages = [
  { value: "en", label: "English" },
  { value: "es", label: "Spanish" },
  { value: "de", label: "German" },
  { value: "fr", label: "French" },
  { value: "pt", label: "Portuguese" },
]

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile")
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  
  // Form states
  const [formData, setFormData] = useState({
    name: mockUser.name,
    email: mockUser.email,
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    ...mockUser.settings
  })

  const handleSave = async () => {
    setIsSaving(true)
    // Mock save - will be replaced with real API
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const updateFormData = (key: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Settings</h1>
          <p className="text-slate-400 mt-1">Manage your account settings and preferences</p>
        </div>
        <Button 
          onClick={handleSave} 
          disabled={isSaving}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          {saved ? (
            <>
              <Check className="w-4 h-4 mr-2" />
              Saved!
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? "Saving..." : "Save Changes"}
            </>
          )}
        </Button>
      </div>

      {/* Settings Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-slate-800 p-1">
          <TabsTrigger value="profile" className="data-[state=active]:bg-slate-700">
            <User className="w-4 h-4 mr-2" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="notifications" className="data-[state=active]:bg-slate-700">
            <Bell className="w-4 h-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="preferences" className="data-[state=active]:bg-slate-700">
            <Palette className="w-4 h-4 mr-2" />
            Preferences
          </TabsTrigger>
          <TabsTrigger value="security" className="data-[state=active]:bg-slate-700">
            <Shield className="w-4 h-4 mr-2" />
            Security
          </TabsTrigger>
          <TabsTrigger value="api" className="data-[state=active]:bg-slate-700">
            <Key className="w-4 h-4 mr-2" />
            API Keys
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Profile Information</CardTitle>
              <CardDescription>Update your personal details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Avatar */}
              <div className="flex items-center gap-4">
                <img 
                  src={mockUser.avatar} 
                  alt="Avatar" 
                  className="w-16 h-16 rounded-full bg-slate-700"
                />
                <div>
                  <Button variant="outline" size="sm" className="border-slate-600">
                    Change Avatar
                  </Button>
                  <p className="text-xs text-slate-400 mt-1">JPG, PNG. Max 2MB</p>
                </div>
              </div>

              {/* Name */}
              <div className="space-y-2">
                <label className="text-sm text-slate-300">Full Name</label>
                <Input 
                  value={formData.name}
                  onChange={(e) => updateFormData("name", e.target.value)}
                  className="bg-slate-900 border-slate-700 text-white"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="text-sm text-slate-300">Email Address</label>
                <Input 
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateFormData("email", e.target.value)}
                  className="bg-slate-900 border-slate-700 text-white"
                />
                <p className="text-xs text-slate-400">Used for login and notifications</p>
              </div>

              {/* Plan Badge */}
              <div className="pt-4 border-t border-slate-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-300">Current Plan</p>
                    <p className="text-white font-medium capitalize">{mockUser.plan}</p>
                  </div>
                  <Badge className="bg-emerald-500/20 text-emerald-400">
                    Active
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Email Notifications</CardTitle>
              <CardDescription>Choose what emails you want to receive</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-white">Rank Changes</p>
                  <p className="text-sm text-slate-400">Get notified when your rankings change significantly</p>
                </div>
                <Switch 
                  checked={formData.emailNotifications}
                  onCheckedChange={(v) => updateFormData("emailNotifications", v)}
                />
              </div>
              
              <div className="flex items-center justify-between py-2 border-t border-slate-700">
                <div>
                  <p className="text-white">Weekly Report</p>
                  <p className="text-sm text-slate-400">Receive a weekly summary of your SEO performance</p>
                </div>
                <Switch 
                  checked={formData.weeklyReport}
                  onCheckedChange={(v) => updateFormData("weeklyReport", v)}
                />
              </div>
              
              <div className="flex items-center justify-between py-2 border-t border-slate-700">
                <div>
                  <p className="text-white">Content Decay Alerts</p>
                  <p className="text-sm text-slate-400">Get alerted when content starts losing traffic</p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="flex items-center justify-between py-2 border-t border-slate-700">
                <div>
                  <p className="text-white">Marketing Emails</p>
                  <p className="text-sm text-slate-400">Tips, product updates, and special offers</p>
                </div>
                <Switch 
                  checked={formData.marketingEmails}
                  onCheckedChange={(v) => updateFormData("marketingEmails", v)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preferences Tab */}
        <TabsContent value="preferences" className="space-y-6">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Default Settings</CardTitle>
              <CardDescription>Configure your default preferences for searches</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Default Location */}
              <div className="space-y-2">
                <label className="text-sm text-slate-300 flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  Default Location
                </label>
                <Select 
                  value={formData.defaultLocation}
                  onValueChange={(v) => updateFormData("defaultLocation", v)}
                >
                  <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {locations.map(loc => (
                      <SelectItem key={loc.value} value={loc.value}>
                        {loc.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Default Language */}
              <div className="space-y-2">
                <label className="text-sm text-slate-300">Default Language</label>
                <Select 
                  value={formData.defaultLanguage}
                  onValueChange={(v) => updateFormData("defaultLanguage", v)}
                >
                  <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {languages.map(lang => (
                      <SelectItem key={lang.value} value={lang.value}>
                        {lang.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Theme */}
              <div className="space-y-2">
                <label className="text-sm text-slate-300 flex items-center gap-2">
                  <Palette className="w-4 h-4" />
                  Theme
                </label>
                <Select 
                  value={formData.theme}
                  onValueChange={(v) => updateFormData("theme", v)}
                >
                  <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Change Password</CardTitle>
              <CardDescription>Update your password to keep your account secure</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm text-slate-300">Current Password</label>
                <div className="relative">
                  <Input 
                    type={showPassword ? "text" : "password"}
                    value={formData.currentPassword}
                    onChange={(e) => updateFormData("currentPassword", e.target.value)}
                    className="bg-slate-900 border-slate-700 text-white pr-10"
                    placeholder="Enter current password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-slate-300">New Password</label>
                <Input 
                  type="password"
                  value={formData.newPassword}
                  onChange={(e) => updateFormData("newPassword", e.target.value)}
                  className="bg-slate-900 border-slate-700 text-white"
                  placeholder="Enter new password"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-slate-300">Confirm New Password</label>
                <Input 
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => updateFormData("confirmPassword", e.target.value)}
                  className="bg-slate-900 border-slate-700 text-white"
                  placeholder="Confirm new password"
                />
              </div>

              <Button className="bg-emerald-600 hover:bg-emerald-700">
                Update Password
              </Button>
            </CardContent>
          </Card>

          {/* Sessions */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Active Sessions</CardTitle>
              <CardDescription>Manage your active sessions across devices</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
                <div>
                  <p className="text-white">Current Session</p>
                  <p className="text-sm text-slate-400">Windows • Chrome • Mumbai, India</p>
                </div>
                <Badge className="bg-emerald-500/20 text-emerald-400">Active</Badge>
              </div>
              <Button variant="outline" className="border-red-500/50 text-red-400 hover:bg-red-500/10">
                Sign Out All Other Sessions
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* API Keys Tab */}
        <TabsContent value="api" className="space-y-6">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">API Keys</CardTitle>
              <CardDescription>Manage API keys for programmatic access</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockUser.plan === "enterprise" ? (
                <>
                  <div className="p-4 bg-slate-900/50 rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-white font-mono text-sm">sk_live_****************************</p>
                      <Button variant="ghost" size="sm" className="text-slate-400">
                        Copy
                      </Button>
                    </div>
                    <p className="text-xs text-slate-400">Created: Dec 1, 2024 • Last used: 2 hours ago</p>
                  </div>
                  <Button className="bg-emerald-600 hover:bg-emerald-700">
                    <Key className="w-4 h-4 mr-2" />
                    Generate New API Key
                  </Button>
                </>
              ) : (
                <div className="text-center py-8">
                  <Key className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                  <p className="text-white font-medium">API Access is Enterprise Only</p>
                  <p className="text-sm text-slate-400 mt-1 mb-4">
                    Upgrade to Enterprise to get API access
                  </p>
                  <Button className="bg-emerald-600 hover:bg-emerald-700">
                    Upgrade to Enterprise
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
