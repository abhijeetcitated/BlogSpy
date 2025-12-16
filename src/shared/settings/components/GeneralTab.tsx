"use client"

import { Upload, Trash2, AlertTriangle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function GeneralTab() {
  return (
    <div className="space-y-6">
      {/* Profile Card */}
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
              <Label htmlFor="fullName" className="text-slate-300">Full Name</Label>
              <Input
                id="fullName"
                defaultValue="John Doe"
                className="bg-slate-800/50 border-slate-700 text-slate-100 focus:border-emerald-500/50"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email" className="text-slate-300">Email Address</Label>
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
              <Label htmlFor="bio" className="text-slate-300">Bio</Label>
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
    </div>
  )
}
