"use client"

import { useState } from "react"
import { ErrorBoundary } from "@/components/common/error-boundary"
import { 
  STACK_SPACING, 
  RESPONSIVE_CLASSES,
  TEXT_SIZES,
  CARD_PADDING
} from "@/src/styles"
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
    <ErrorBoundary>
    <div className={STACK_SPACING.default}>
      {/* Header */}
      <div className={RESPONSIVE_CLASSES.pageHeader}>
        <div>
          <h1 className={`${TEXT_SIZES.sectionTitle} font-bold text-white`}>Settings</h1>
          <p className="text-slate-400 mt-1 text-sm sm:text-base">Manage your account settings and preferences</p>
        </div>
        <Button 
          onClick={handleSave} 
          disabled={isSaving}
          className="bg-emerald-600 hover:bg-emerald-700 w-full sm:w-auto"
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
      <Tabs value={activeTab} onValueChange={setActiveTab} className={STACK_SPACING.default}>
        <div className="overflow-x-auto -mx-3 sm:mx-0 px-3 sm:px-0">
          <TabsList className="bg-slate-800 p-1 inline-flex min-w-max sm:min-w-0">
            <TabsTrigger value="profile" className="data-[state=active]:bg-slate-700 text-xs sm:text-sm">
              <User className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
              <span className="hidden xs:inline">Profile</span>
              <span className="xs:hidden">👤</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="data-[state=active]:bg-slate-700 text-xs sm:text-sm">
              <Bell className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
              <span className="hidden xs:inline">Notifications</span>
              <span className="xs:hidden">🔔</span>
            </TabsTrigger>
            <TabsTrigger value="preferences" className="data-[state=active]:bg-slate-700 text-xs sm:text-sm">
              <Palette className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
              <span className="hidden xs:inline">Preferences</span>
              <span className="xs:hidden">🎨</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="data-[state=active]:bg-slate-700 text-xs sm:text-sm">
              <Shield className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
              <span className="hidden xs:inline">Security</span>
              <span className="xs:hidden">🔒</span>
            </TabsTrigger>
            <TabsTrigger value="api" className="data-[state=active]:bg-slate-700 text-xs sm:text-sm">
              <Key className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
              <span className="hidden xs:inline">API Keys</span>
              <span className="xs:hidden">🔑</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Profile Tab */}
        <TabsContent value="profile" className={STACK_SPACING.default}>
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-white text-base sm:text-lg">Profile Information</CardTitle>
              <CardDescription className="text-sm">Update your personal details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-4 sm:p-6 pt-0 sm:pt-0">
              {/* Avatar */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                <img 
                  src={mockUser.avatar} 
                  alt="Avatar" 
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-slate-700"
                />
                <div>
                  <Button variant="outline" size="sm" className="border-slate-600 text-xs sm:text-sm">
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
        <TabsContent value="notifications" className={STACK_SPACING.default}>
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-white text-base sm:text-lg">Email Notifications</CardTitle>
              <CardDescription className="text-sm">Choose what emails you want to receive</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6 pt-0 sm:pt-0">
              <div className="flex items-start sm:items-center justify-between gap-3 py-2">
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm sm:text-base">Rank Changes</p>
                  <p className="text-xs sm:text-sm text-slate-400">Get notified when your rankings change significantly</p>
                </div>
                <Switch 
                  checked={formData.emailNotifications}
                  onCheckedChange={(v) => updateFormData("emailNotifications", v)}
                />
              </div>
              
              <div className="flex items-start sm:items-center justify-between gap-3 py-2 border-t border-slate-700">
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm sm:text-base">Weekly Report</p>
                  <p className="text-xs sm:text-sm text-slate-400">Receive a weekly summary of your SEO performance</p>
                </div>
                <Switch 
                  checked={formData.weeklyReport}
                  onCheckedChange={(v) => updateFormData("weeklyReport", v)}
                />
              </div>
              
              <div className="flex items-start sm:items-center justify-between gap-3 py-2 border-t border-slate-700">
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm sm:text-base">Content Decay Alerts</p>
                  <p className="text-xs sm:text-sm text-slate-400">Get alerted when content starts losing traffic</p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="flex items-start sm:items-center justify-between gap-3 py-2 border-t border-slate-700">
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm sm:text-base">Marketing Emails</p>
                  <p className="text-xs sm:text-sm text-slate-400">Tips, product updates, and special offers</p>
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
        <TabsContent value="preferences" className={STACK_SPACING.default}>
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-white text-base sm:text-lg">Default Settings</CardTitle>
              <CardDescription className="text-sm">Configure your default preferences for searches</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-4 sm:p-6 pt-0 sm:pt-0">
              {/* Default Location */}
              <div className="space-y-2">
                <label className="text-xs sm:text-sm text-slate-300 flex items-center gap-2">
                  <Globe className="w-3 h-3 sm:w-4 sm:h-4" />
                  Default Location
                </label>
                <Select 
                  value={formData.defaultLocation}
                  onValueChange={(v) => updateFormData("defaultLocation", v)}
                >
                  <SelectTrigger className="bg-slate-900 border-slate-700 text-white text-sm">
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
                <label className="text-xs sm:text-sm text-slate-300">Default Language</label>
                <Select 
                  value={formData.defaultLanguage}
                  onValueChange={(v) => updateFormData("defaultLanguage", v)}
                >
                  <SelectTrigger className="bg-slate-900 border-slate-700 text-white text-sm">
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
                <label className="text-xs sm:text-sm text-slate-300 flex items-center gap-2">
                  <Palette className="w-3 h-3 sm:w-4 sm:h-4" />
                  Theme
                </label>
                <Select 
                  value={formData.theme}
                  onValueChange={(v) => updateFormData("theme", v)}
                >
                  <SelectTrigger className="bg-slate-900 border-slate-700 text-white text-sm">
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
        <TabsContent value="security" className={STACK_SPACING.default}>
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-white text-base sm:text-lg">Change Password</CardTitle>
              <CardDescription className="text-sm">Update your password to keep your account secure</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-4 sm:p-6 pt-0 sm:pt-0">
              <div className="space-y-2">
                <label className="text-xs sm:text-sm text-slate-300">Current Password</label>
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
                <label className="text-xs sm:text-sm text-slate-300">New Password</label>
                <Input 
                  type="password"
                  value={formData.newPassword}
                  onChange={(e) => updateFormData("newPassword", e.target.value)}
                  className="bg-slate-900 border-slate-700 text-white text-sm"
                  placeholder="Enter new password"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs sm:text-sm text-slate-300">Confirm New Password</label>
                <Input 
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => updateFormData("confirmPassword", e.target.value)}
                  className="bg-slate-900 border-slate-700 text-white text-sm"
                  placeholder="Confirm new password"
                />
              </div>

              <Button className="bg-emerald-600 hover:bg-emerald-700 w-full sm:w-auto text-sm">
                Update Password
              </Button>
            </CardContent>
          </Card>

          {/* Sessions */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-white text-base sm:text-lg">Active Sessions</CardTitle>
              <CardDescription className="text-sm">Manage your active sessions across devices</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-4 sm:p-6 pt-0 sm:pt-0">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 p-3 bg-slate-900/50 rounded-lg">
                <div>
                  <p className="text-white text-sm sm:text-base">Current Session</p>
                  <p className="text-xs sm:text-sm text-slate-400">Windows • Chrome • Mumbai, India</p>
                </div>
                <Badge className="bg-emerald-500/20 text-emerald-400 w-fit">Active</Badge>
              </div>
              <Button variant="outline" className="border-red-500/50 text-red-400 hover:bg-red-500/10 w-full sm:w-auto text-sm">
                Sign Out All Other Sessions
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* API Keys Tab */}
        <TabsContent value="api" className={STACK_SPACING.default}>
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-white text-base sm:text-lg">API Keys</CardTitle>
              <CardDescription className="text-sm">Manage API keys for programmatic access</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-4 sm:p-6 pt-0 sm:pt-0">
              {mockUser.plan === "enterprise" ? (
                <>
                  <div className="p-3 sm:p-4 bg-slate-900/50 rounded-lg space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <p className="text-white font-mono text-xs sm:text-sm truncate">sk_live_****************************</p>
                      <Button variant="ghost" size="sm" className="text-slate-400 w-fit">
                        Copy
                      </Button>
                    </div>
                    <p className="text-xs text-slate-400">Created: Dec 1, 2024 • Last used: 2 hours ago</p>
                  </div>
                  <Button className="bg-emerald-600 hover:bg-emerald-700 w-full sm:w-auto text-sm">
                    <Key className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                    Generate New API Key
                  </Button>
                </>
              ) : (
                <div className="text-center py-6 sm:py-8">
                  <Key className="w-10 h-10 sm:w-12 sm:h-12 text-slate-600 mx-auto mb-3 sm:mb-4" />
                  <p className="text-white font-medium text-sm sm:text-base">API Access is Enterprise Only</p>
                  <p className="text-xs sm:text-sm text-slate-400 mt-1 mb-4">
                    Upgrade to Enterprise to get API access
                  </p>
                  <Button className="bg-emerald-600 hover:bg-emerald-700 text-sm">
                    Upgrade to Enterprise
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
    </ErrorBoundary>
  )
}
