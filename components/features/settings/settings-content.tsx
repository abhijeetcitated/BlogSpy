"use client"

import { useState } from "react"
import { User, CreditCard, Key, Bell, Copy, RefreshCw, Upload, Trash2, Check, AlertTriangle } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"

export function SettingsContent() {
  const [activeTab, setActiveTab] = useState("general")
  const [apiKeyCopied, setApiKeyCopied] = useState(false)
  const [notifications, setNotifications] = useState({
    weeklyReport: true,
    rankAlerts: true,
    decayAlerts: false,
  })

  const handleCopyApiKey = () => {
    navigator.clipboard.writeText("sk_live_abc123xyz789def456ghi")
    setApiKeyCopied(true)
    setTimeout(() => setApiKeyCopied(false), 2000)
  }

  return (
    <div className="flex-1 p-6 bg-slate-950">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-semibold text-slate-100">Settings</h1>
          <p className="text-sm text-slate-400 mt-1">Manage your account settings and preferences</p>
        </div>

        {/* Tabbed Interface */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-slate-900/50 border border-slate-800 p-1 h-auto">
            <TabsTrigger
              value="general"
              className="gap-2 data-[state=active]:bg-slate-800 data-[state=active]:text-slate-100 text-slate-400"
            >
              <User className="h-4 w-4" />
              General
            </TabsTrigger>
            <TabsTrigger
              value="billing"
              className="gap-2 data-[state=active]:bg-slate-800 data-[state=active]:text-slate-100 text-slate-400"
            >
              <CreditCard className="h-4 w-4" />
              Billing & Credits
            </TabsTrigger>
            <TabsTrigger
              value="api"
              className="gap-2 data-[state=active]:bg-slate-800 data-[state=active]:text-slate-100 text-slate-400"
            >
              <Key className="h-4 w-4" />
              API Keys
            </TabsTrigger>
            <TabsTrigger
              value="notifications"
              className="gap-2 data-[state=active]:bg-slate-800 data-[state=active]:text-slate-100 text-slate-400"
            >
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: General (Profile) */}
          <TabsContent value="general" className="space-y-6">
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="text-slate-100">Profile</CardTitle>
                <CardDescription className="text-slate-400">
                  Manage your personal information and profile settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar Section */}
                <div className="flex items-center gap-6">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src="/professional-headshot.png" />
                    <AvatarFallback className="bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 text-emerald-400 text-xl">
                      JD
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-slate-700 text-slate-300 hover:bg-slate-800 bg-transparent"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Change
                    </Button>
                    <Button variant="ghost" size="sm" className="text-slate-400 hover:text-red-400 hover:bg-red-500/10">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remove
                    </Button>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="fullName" className="text-slate-300">
                      Full Name
                    </Label>
                    <Input
                      id="fullName"
                      defaultValue="John Doe"
                      className="bg-slate-800/50 border-slate-700 text-slate-100 focus:border-emerald-500/50"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email" className="text-slate-300">
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      defaultValue="john@example.com"
                      disabled
                      className="bg-slate-800/30 border-slate-700 text-slate-500 cursor-not-allowed"
                    />
                    <p className="text-xs text-slate-500">Email cannot be changed. Contact support if needed.</p>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="bio" className="text-slate-300">
                      Bio
                    </Label>
                    <Textarea
                      id="bio"
                      placeholder="Tell us a bit about yourself..."
                      defaultValue="SEO specialist and content strategist with 5+ years of experience."
                      className="bg-slate-800/50 border-slate-700 text-slate-100 focus:border-emerald-500/50 min-h-[100px]"
                    />
                  </div>
                </div>

                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">Save Changes</Button>
              </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="bg-slate-900/50 border-red-500/30">
              <CardHeader>
                <CardTitle className="text-red-400 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Danger Zone
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Irreversible actions that affect your account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 rounded-lg border border-red-500/20 bg-red-500/5">
                  <div>
                    <p className="font-medium text-slate-200">Delete Account</p>
                    <p className="text-sm text-slate-400">Permanently delete your account and all associated data</p>
                  </div>
                  <Button variant="destructive" className="bg-red-600 hover:bg-red-700">
                    Delete Account
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 2: Billing & Credits */}
          <TabsContent value="billing" className="space-y-6">
            {/* Current Plan */}
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="text-slate-100">Current Plan</CardTitle>
                <CardDescription className="text-slate-400">Your subscription and billing details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
                      <CreditCard className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-100 text-lg">Pro Plan</p>
                      <p className="text-slate-400">$29/month • Billed monthly</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="border-slate-700 text-slate-300 hover:bg-slate-800 bg-transparent"
                  >
                    Manage Subscription
                  </Button>
                </div>

                {/* Usage Meter */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300 font-medium">Credits Usage</span>
                    <span className="text-slate-400 text-sm">Renews in 12 days</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">750 of 1,000 credits used</span>
                      <span className="text-emerald-400 font-medium">75%</span>
                    </div>
                    <div className="relative">
                      <Progress value={75} className="h-3 bg-slate-800" />
                      <div
                        className="absolute inset-0 h-3 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500"
                        style={{ width: "75%", opacity: 0.2 }}
                      />
                    </div>
                    <p className="text-xs text-slate-500">250 credits remaining this billing cycle</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Upgrade Callout */}
            <Card className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-500/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="font-semibold text-amber-300 text-lg">Need more credits?</p>
                    <p className="text-slate-400">
                      Upgrade to Agency Plan for <span className="text-amber-400 font-semibold">5,000 credits</span> per
                      month
                    </p>
                  </div>
                  <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white">
                    Upgrade to Agency
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 3: API Keys */}
          <TabsContent value="api" className="space-y-6">
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="text-slate-100">API Keys</CardTitle>
                <CardDescription className="text-slate-400">
                  Manage your API keys for programmatic access to BlogSpy
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 rounded-lg bg-slate-800/30 border border-slate-700 space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-slate-300">Live API Key</Label>
                    <span className="text-xs px-2 py-1 rounded bg-emerald-500/20 text-emerald-400">Active</span>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      readOnly
                      value="sk_live_••••••••••••••••••••••••"
                      className="bg-slate-900/50 border-slate-700 text-slate-400 font-mono text-sm"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleCopyApiKey}
                      className="border-slate-700 text-slate-300 hover:bg-slate-800 shrink-0 bg-transparent"
                    >
                      {apiKeyCopied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="border-slate-700 text-slate-300 hover:bg-slate-800 shrink-0 bg-transparent"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-slate-500">
                    Keep your API key secret. Do not share it or expose it in client-side code.
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-slate-800/30 border border-slate-700">
                  <div className="flex items-start gap-3">
                    <Key className="h-5 w-5 text-emerald-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-slate-300 font-medium">Bring Your Own Key</p>
                      <p className="text-sm text-slate-400 mt-1">
                        If you run out of credits, BlogSpy allows you to use your own OpenAI API key to continue using
                        AI features.
                      </p>
                      <Button variant="link" className="px-0 h-auto text-emerald-400 hover:text-emerald-300 mt-2">
                        Learn more about BYOK
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 4: Notifications */}
          <TabsContent value="notifications" className="space-y-6">
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="text-slate-100">Notification Preferences</CardTitle>
                <CardDescription className="text-slate-400">
                  Choose which notifications you want to receive
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-1">
                {/* Weekly SEO Report */}
                <div className="flex items-center justify-between p-4 rounded-lg hover:bg-slate-800/30 transition-colors">
                  <div className="space-y-0.5">
                    <Label htmlFor="weekly-report" className="text-slate-200 font-medium cursor-pointer">
                      Weekly SEO Report
                    </Label>
                    <p className="text-sm text-slate-400">
                      Receive a comprehensive SEO performance summary every Monday
                    </p>
                  </div>
                  <Switch
                    id="weekly-report"
                    checked={notifications.weeklyReport}
                    onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, weeklyReport: checked }))}
                    className="data-[state=checked]:bg-emerald-500"
                  />
                </div>

                {/* Rank Change Alerts */}
                <div className="flex items-center justify-between p-4 rounded-lg hover:bg-slate-800/30 transition-colors">
                  <div className="space-y-0.5">
                    <Label htmlFor="rank-alerts" className="text-slate-200 font-medium cursor-pointer">
                      Rank Change Alerts
                    </Label>
                    <p className="text-sm text-slate-400">Get notified when your keywords move into or out of Top 10</p>
                  </div>
                  <Switch
                    id="rank-alerts"
                    checked={notifications.rankAlerts}
                    onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, rankAlerts: checked }))}
                    className="data-[state=checked]:bg-emerald-500"
                  />
                </div>

                {/* Content Decay Alerts */}
                <div className="flex items-center justify-between p-4 rounded-lg hover:bg-slate-800/30 transition-colors">
                  <div className="space-y-0.5">
                    <Label htmlFor="decay-alerts" className="text-slate-200 font-medium cursor-pointer">
                      Content Decay Alerts
                    </Label>
                    <p className="text-sm text-slate-400">
                      Be alerted when your content starts losing traffic or rankings
                    </p>
                  </div>
                  <Switch
                    id="decay-alerts"
                    checked={notifications.decayAlerts}
                    onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, decayAlerts: checked }))}
                    className="data-[state=checked]:bg-emerald-500"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
