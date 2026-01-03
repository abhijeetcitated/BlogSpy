"use client"

import { useState } from "react"
import { 
  Upload, Trash2, AlertTriangle, Loader2, Globe, Calendar, Languages, 
  Mail, Lock, Eye, EyeOff, Check, X, Shield, Smartphone, Monitor,
  MapPin, Clock
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useProfile } from "@/hooks/use-user"

const TIMEZONES = [
  { value: "Asia/Kolkata", label: "India Standard Time (IST)" },
  { value: "America/New_York", label: "Eastern Time (ET)" },
  { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
  { value: "America/Chicago", label: "Central Time (CT)" },
  { value: "Europe/London", label: "Greenwich Mean Time (GMT)" },
  { value: "Europe/Paris", label: "Central European Time (CET)" },
  { value: "Asia/Tokyo", label: "Japan Standard Time (JST)" },
  { value: "Asia/Singapore", label: "Singapore Time (SGT)" },
  { value: "Australia/Sydney", label: "Australian Eastern Time (AET)" },
  { value: "UTC", label: "Coordinated Universal Time (UTC)" },
]

const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "hi", label: "Hindi" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "pt", label: "Portuguese" },
  { value: "ja", label: "Japanese" },
  { value: "zh", label: "Chinese" },
]

const DATE_FORMATS = [
  { value: "MM/DD/YYYY", label: "MM/DD/YYYY (12/26/2025)" },
  { value: "DD/MM/YYYY", label: "DD/MM/YYYY (26/12/2025)" },
  { value: "YYYY-MM-DD", label: "YYYY-MM-DD (2025-12-26)" },
  { value: "DD MMM YYYY", label: "DD MMM YYYY (26 Dec 2025)" },
  { value: "MMM DD, YYYY", label: "MMM DD, YYYY (Dec 26, 2025)" },
]

// Mock active sessions data
const MOCK_SESSIONS = [
  {
    id: "1",
    device: "Chrome on Windows",
    deviceType: "desktop",
    location: "Mumbai, India",
    ip: "192.168.1.***",
    lastActive: "Now",
    isCurrent: true,
  },
  {
    id: "2", 
    device: "Safari on iPhone",
    deviceType: "mobile",
    location: "Delhi, India",
    ip: "103.45.67.***",
    lastActive: "2 hours ago",
    isCurrent: false,
  },
  {
    id: "3",
    device: "Firefox on MacOS",
    deviceType: "desktop",
    location: "Bangalore, India",
    ip: "49.207.12.***",
    lastActive: "3 days ago",
    isCurrent: false,
  },
]

// Mock login history data
const MOCK_LOGIN_HISTORY = [
  {
    id: "1",
    device: "Chrome on Windows",
    location: "Mumbai, India",
    ip: "192.168.1.105",
    time: "Dec 26, 2025 10:30 AM",
    status: "success",
  },
  {
    id: "2",
    device: "Safari on iPhone",
    location: "Delhi, India",
    ip: "103.45.67.89",
    time: "Dec 25, 2025 3:15 PM",
    status: "success",
  },
  {
    id: "3",
    device: "Unknown Device",
    location: "Lagos, Nigeria",
    ip: "154.120.45.78",
    time: "Dec 24, 2025 11:45 PM",
    status: "failed",
  },
  {
    id: "4",
    device: "Firefox on MacOS",
    location: "Bangalore, India",
    ip: "49.207.12.34",
    time: "Dec 23, 2025 9:00 AM",
    status: "success",
  },
  {
    id: "5",
    device: "Chrome on Android",
    location: "Moscow, Russia",
    ip: "95.173.45.89",
    time: "Dec 22, 2025 6:30 AM",
    status: "blocked",
  },
]

export function GeneralTab() {
  const { profile, displayName, email, avatar, initials, isLoading, updateProfile } = useProfile()
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: displayName,
    bio: profile?.company || "",
    timezone: "Asia/Kolkata",
    language: "en",
    dateFormat: "DD/MM/YYYY",
  })

  // Email change state
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false)
  const [newEmail, setNewEmail] = useState("")
  const [emailPassword, setEmailPassword] = useState("")
  const [emailStep, setEmailStep] = useState<"input" | "verify">("input")
  const [verificationCode, setVerificationCode] = useState("")
  const [isEmailSaving, setIsEmailSaving] = useState(false)

  // Password change state
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  })
  const [isPasswordSaving, setIsPasswordSaving] = useState(false)

  // 2FA state
  const [is2FAEnabled, setIs2FAEnabled] = useState(false)
  const [is2FADialogOpen, setIs2FADialogOpen] = useState(false)
  const [twoFACode, setTwoFACode] = useState("")

  // Sessions state
  const [sessions, setSessions] = useState(MOCK_SESSIONS)

  const handleSave = async () => {
    setIsSaving(true)
    await updateProfile({ name: formData.name, company: formData.bio })
    setIsSaving(false)
  }

  // Email change handlers
  const handleEmailChange = async () => {
    if (emailStep === "input") {
      setIsEmailSaving(true)
      // Simulate sending verification code
      await new Promise(r => setTimeout(r, 1000))
      setEmailStep("verify")
      setIsEmailSaving(false)
    } else {
      setIsEmailSaving(true)
      // Simulate verification
      await new Promise(r => setTimeout(r, 1000))
      setIsEmailSaving(false)
      setIsEmailDialogOpen(false)
      // Reset state
      setEmailStep("input")
      setNewEmail("")
      setEmailPassword("")
      setVerificationCode("")
    }
  }

  // Password change handler
  const handlePasswordChange = async () => {
    setIsPasswordSaving(true)
    await new Promise(r => setTimeout(r, 1000))
    setIsPasswordSaving(false)
    setIsPasswordDialogOpen(false)
    setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" })
  }

  // Password validation
  const passwordValidation = {
    minLength: passwordData.newPassword.length >= 8,
    hasUppercase: /[A-Z]/.test(passwordData.newPassword),
    hasLowercase: /[a-z]/.test(passwordData.newPassword),
    hasNumber: /[0-9]/.test(passwordData.newPassword),
    hasSpecial: /[!@#$%^&*]/.test(passwordData.newPassword),
    matches: passwordData.newPassword === passwordData.confirmPassword && passwordData.confirmPassword.length > 0,
  }
  const isPasswordValid = Object.values(passwordValidation).every(Boolean)

  // Session handlers
  const handleRevokeSession = (sessionId: string) => {
    setSessions(prev => prev.filter(s => s.id !== sessionId))
  }

  const handleRevokeAllSessions = () => {
    setSessions(prev => prev.filter(s => s.isCurrent))
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card className="bg-card/50 border-border">
          <CardHeader>
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-4 w-64 mt-2" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-6">
              <Skeleton className="h-20 w-20 rounded-full" />
              <div className="flex gap-3">
                <Skeleton className="h-9 w-24" />
                <Skeleton className="h-9 w-24" />
              </div>
            </div>
            <div className="grid gap-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Profile Card */}
      <Card className="bg-card/50 border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Profile</CardTitle>
          <CardDescription className="text-muted-foreground">
            Manage your personal information and profile settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar Section */}
          <div className="flex items-center gap-6">
            <Avatar className="h-20 w-20">
              {avatar && <AvatarImage src={avatar} alt={displayName} />}
              <AvatarFallback className="bg-linear-to-br from-emerald-500/20 to-cyan-500/20 text-emerald-400 text-xl">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex gap-3">
              <Button
                variant="outline"
                size="sm"
                className="border-border text-muted-foreground hover:bg-accent bg-transparent"
              >
                <Upload className="h-4 w-4 mr-2" />
                Change
              </Button>
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-red-400 hover:bg-red-500/10">
                <Trash2 className="h-4 w-4 mr-2" />
                Remove
              </Button>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="fullName" className="text-foreground">Full Name</Label>
              <Input
                id="fullName"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="bg-input/50 border-border text-foreground focus:border-emerald-500/50"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email" className="text-foreground">Email Address</Label>
              <div className="flex gap-2">
                <Input
                  id="email"
                  type="email"
                  value={email}
                  disabled
                  className="bg-muted/30 border-border text-muted-foreground cursor-not-allowed flex-1"
                />
                <Dialog open={isEmailDialogOpen} onOpenChange={setIsEmailDialogOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="border-border text-muted-foreground hover:bg-accent bg-transparent"
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      Change
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-card border-border">
                    <DialogHeader>
                      <DialogTitle className="text-foreground">Change Email Address</DialogTitle>
                      <DialogDescription className="text-muted-foreground">
                        {emailStep === "input" 
                          ? "Enter your new email address and current password to continue" 
                          : "We've sent a verification code to your new email"
                        }
                      </DialogDescription>
                    </DialogHeader>
                    
                    {emailStep === "input" ? (
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label className="text-foreground">Current Email</Label>
                          <Input
                            value={email}
                            disabled
                            className="bg-muted/30 border-border text-muted-foreground"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-foreground">New Email Address</Label>
                          <Input
                            type="email"
                            placeholder="newemail@example.com"
                            value={newEmail}
                            onChange={(e) => setNewEmail(e.target.value)}
                            className="bg-input/50 border-border text-foreground"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-foreground">Current Password</Label>
                          <Input
                            type="password"
                            placeholder="Enter your password"
                            value={emailPassword}
                            onChange={(e) => setEmailPassword(e.target.value)}
                            className="bg-input/50 border-border text-foreground"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4 py-4">
                        <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                          <p className="text-sm text-emerald-400">
                            ✓ Verification code sent to <span className="font-medium">{newEmail}</span>
                          </p>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-foreground">Verification Code</Label>
                          <Input
                            placeholder="Enter 6-digit code"
                            value={verificationCode}
                            onChange={(e) => setVerificationCode(e.target.value)}
                            className="bg-input/50 border-border text-foreground text-center text-lg tracking-widest"
                            maxLength={6}
                          />
                        </div>
                        <Button 
                          variant="link" 
                          className="text-emerald-400 px-0 h-auto"
                          onClick={() => {/* Resend code */}}
                        >
                          Didn't receive code? Resend
                        </Button>
                      </div>
                    )}

                    <DialogFooter>
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setIsEmailDialogOpen(false)
                          setEmailStep("input")
                          setNewEmail("")
                          setEmailPassword("")
                          setVerificationCode("")
                        }}
                        className="border-border"
                      >
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleEmailChange}
                        disabled={
                          isEmailSaving || 
                          (emailStep === "input" && (!newEmail || !emailPassword)) ||
                          (emailStep === "verify" && verificationCode.length !== 6)
                        }
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        {isEmailSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        {emailStep === "input" ? "Send Verification Code" : "Verify & Update"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              <p className="text-xs text-muted-foreground">A verification code will be sent to your new email</p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="bio" className="text-foreground">Bio</Label>
              <Textarea
                id="bio"
                placeholder="Tell us a bit about yourself..."
                value={formData.bio}
                onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                className="bg-input/50 border-border text-foreground focus:border-emerald-500/50 min-h-[100px]"
              />
            </div>
          </div>

          <Button 
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Save Changes
          </Button>
        </CardContent>
      </Card>

      {/* Preferences Card */}
      <Card className="bg-card/50 border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Preferences</CardTitle>
          <CardDescription className="text-muted-foreground">
            Customize your timezone, language, and display settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Timezone */}
            <div className="grid gap-2">
              <Label htmlFor="timezone" className="text-foreground flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                Timezone
              </Label>
              <Select 
                value={formData.timezone} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, timezone: value }))}
              >
                <SelectTrigger className="bg-input/50 border-border text-foreground">
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent>
                  {TIMEZONES.map((tz) => (
                    <SelectItem key={tz.value} value={tz.value}>
                      {tz.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">Used for scheduling reports and displaying times</p>
            </div>

            {/* Language */}
            <div className="grid gap-2">
              <Label htmlFor="language" className="text-foreground flex items-center gap-2">
                <Languages className="h-4 w-4 text-muted-foreground" />
                Language
              </Label>
              <Select 
                value={formData.language} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, language: value }))}
              >
                <SelectTrigger className="bg-input/50 border-border text-foreground">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map((lang) => (
                    <SelectItem key={lang.value} value={lang.value}>
                      {lang.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">Interface language preference</p>
            </div>

            {/* Date Format */}
            <div className="grid gap-2 sm:col-span-2">
              <Label htmlFor="dateFormat" className="text-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                Date Format
              </Label>
              <Select 
                value={formData.dateFormat} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, dateFormat: value }))}
              >
                <SelectTrigger className="bg-input/50 border-border text-foreground">
                  <SelectValue placeholder="Select date format" />
                </SelectTrigger>
                <SelectContent>
                  {DATE_FORMATS.map((df) => (
                    <SelectItem key={df.value} value={df.value}>
                      {df.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">How dates appear throughout the app</p>
            </div>
          </div>

          <Button 
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Save Preferences
          </Button>
        </CardContent>
      </Card>

      {/* Security Card */}
      <Card className="bg-card/50 border-border">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <Shield className="h-5 w-5 text-emerald-400" />
            Account Security
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Manage your password, two-factor authentication, and active sessions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Password Section */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Lock className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-foreground font-medium">Password</p>
                <p className="text-sm text-muted-foreground">Last changed 30 days ago</p>
              </div>
            </div>
            <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  variant="outline"
                  className="border-border text-muted-foreground hover:bg-accent bg-transparent"
                >
                  Change Password
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border">
                <DialogHeader>
                  <DialogTitle className="text-foreground">Change Password</DialogTitle>
                  <DialogDescription className="text-muted-foreground">
                    Create a strong password that you don't use elsewhere
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                  {/* Current Password */}
                  <div className="space-y-2">
                    <Label className="text-foreground">Current Password</Label>
                    <div className="relative">
                      <Input
                        type={showPasswords.current ? "text" : "password"}
                        placeholder="Enter current password"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                        className="bg-input/50 border-border text-foreground pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                      >
                        {showPasswords.current ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* New Password */}
                  <div className="space-y-2">
                    <Label className="text-foreground">New Password</Label>
                    <div className="relative">
                      <Input
                        type={showPasswords.new ? "text" : "password"}
                        placeholder="Enter new password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                        className="bg-input/50 border-border text-foreground pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                      >
                        {showPasswords.new ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Password Requirements */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className={`flex items-center gap-1 ${passwordValidation.minLength ? "text-emerald-400" : "text-muted-foreground"}`}>
                      {passwordValidation.minLength ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                      At least 8 characters
                    </div>
                    <div className={`flex items-center gap-1 ${passwordValidation.hasUppercase ? "text-emerald-400" : "text-muted-foreground"}`}>
                      {passwordValidation.hasUppercase ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                      One uppercase letter
                    </div>
                    <div className={`flex items-center gap-1 ${passwordValidation.hasLowercase ? "text-emerald-400" : "text-muted-foreground"}`}>
                      {passwordValidation.hasLowercase ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                      One lowercase letter
                    </div>
                    <div className={`flex items-center gap-1 ${passwordValidation.hasNumber ? "text-emerald-400" : "text-muted-foreground"}`}>
                      {passwordValidation.hasNumber ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                      One number
                    </div>
                    <div className={`flex items-center gap-1 ${passwordValidation.hasSpecial ? "text-emerald-400" : "text-muted-foreground"}`}>
                      {passwordValidation.hasSpecial ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                      One special character
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-2">
                    <Label className="text-foreground">Confirm New Password</Label>
                    <div className="relative">
                      <Input
                        type={showPasswords.confirm ? "text" : "password"}
                        placeholder="Confirm new password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        className="bg-input/50 border-border text-foreground pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                      >
                        {showPasswords.confirm ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                    {passwordData.confirmPassword && (
                      <p className={`text-xs flex items-center gap-1 ${passwordValidation.matches ? "text-emerald-400" : "text-red-400"}`}>
                        {passwordValidation.matches ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                        {passwordValidation.matches ? "Passwords match" : "Passwords don't match"}
                      </p>
                    )}
                  </div>
                </div>

                <DialogFooter>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setIsPasswordDialogOpen(false)
                      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" })
                    }}
                    className="border-border"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handlePasswordChange}
                    disabled={isPasswordSaving || !isPasswordValid || !passwordData.currentPassword}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    {isPasswordSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Update Password
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Two-Factor Authentication */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border">
            <div className="flex items-center gap-3">
              <div className={`h-10 w-10 rounded-lg ${is2FAEnabled ? "bg-emerald-500/20" : "bg-amber-500/20"} flex items-center justify-center`}>
                <Smartphone className={`h-5 w-5 ${is2FAEnabled ? "text-emerald-400" : "text-amber-400"}`} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-foreground font-medium">Two-Factor Authentication</p>
                  <Badge 
                    variant="outline" 
                    className={is2FAEnabled 
                      ? "border-emerald-500/30 text-emerald-400 bg-emerald-500/10" 
                      : "border-amber-500/30 text-amber-400 bg-amber-500/10"
                    }
                  >
                    {is2FAEnabled ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {is2FAEnabled 
                    ? "Your account is protected with 2FA" 
                    : "Add an extra layer of security to your account"
                  }
                </p>
              </div>
            </div>
            <Dialog open={is2FADialogOpen} onOpenChange={setIs2FADialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  variant={is2FAEnabled ? "outline" : "default"}
                  className={is2FAEnabled 
                    ? "border-border text-muted-foreground hover:bg-accent bg-transparent" 
                    : "bg-emerald-600 hover:bg-emerald-700 text-white"
                  }
                >
                  {is2FAEnabled ? "Manage" : "Enable 2FA"}
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border">
                <DialogHeader>
                  <DialogTitle className="text-foreground">
                    {is2FAEnabled ? "Manage Two-Factor Authentication" : "Enable Two-Factor Authentication"}
                  </DialogTitle>
                  <DialogDescription className="text-muted-foreground">
                    {is2FAEnabled 
                      ? "Manage your 2FA settings or disable it" 
                      : "Scan the QR code with your authenticator app"
                    }
                  </DialogDescription>
                </DialogHeader>
                
                {!is2FAEnabled ? (
                  <div className="space-y-4 py-4">
                    {/* Mock QR Code */}
                    <div className="flex justify-center">
                      <div className="p-4 bg-white rounded-lg">
                        <div className="w-40 h-40 bg-gray-200 rounded flex items-center justify-center text-gray-500">
                          [QR Code]
                        </div>
                      </div>
                    </div>
                    <p className="text-center text-sm text-muted-foreground">
                      Scan this QR code with Google Authenticator, Authy, or similar app
                    </p>
                    <div className="space-y-2">
                      <Label className="text-foreground">Enter verification code</Label>
                      <Input
                        placeholder="Enter 6-digit code"
                        value={twoFACode}
                        onChange={(e) => setTwoFACode(e.target.value)}
                        className="bg-input/50 border-border text-foreground text-center text-lg tracking-widest"
                        maxLength={6}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 py-4">
                    <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                      <p className="text-sm text-emerald-400 font-medium">✓ 2FA is enabled</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Your account is protected with two-factor authentication
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Button variant="outline" className="w-full border-border">
                        View Backup Codes
                      </Button>
                      <Button variant="outline" className="w-full border-border text-red-400 hover:text-red-400 hover:bg-red-500/10">
                        Disable 2FA
                      </Button>
                    </div>
                  </div>
                )}

                <DialogFooter>
                  <Button 
                    variant="outline" 
                    onClick={() => setIs2FADialogOpen(false)}
                    className="border-border"
                  >
                    Cancel
                  </Button>
                  {!is2FAEnabled && (
                    <Button 
                      onClick={() => {
                        setIs2FAEnabled(true)
                        setIs2FADialogOpen(false)
                        setTwoFACode("")
                      }}
                      disabled={twoFACode.length !== 6}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      Verify & Enable
                    </Button>
                  )}
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Active Sessions */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-foreground font-medium">Active Sessions</p>
                <p className="text-sm text-muted-foreground">Devices currently logged into your account</p>
              </div>
              {sessions.filter(s => !s.isCurrent).length > 0 && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                    >
                      Revoke All
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-card border-border">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-foreground">Revoke all other sessions?</AlertDialogTitle>
                      <AlertDialogDescription className="text-muted-foreground">
                        This will log you out from all other devices. You'll stay logged in on this device.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="border-border">Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={handleRevokeAllSessions}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Revoke All
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>

            <div className="space-y-2">
              {sessions.map((session) => (
                <div 
                  key={session.id}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    session.isCurrent 
                      ? "bg-emerald-500/10 border-emerald-500/30" 
                      : "bg-muted/30 border-border"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`h-8 w-8 rounded-lg ${session.isCurrent ? "bg-emerald-500/20" : "bg-muted"} flex items-center justify-center`}>
                      {session.deviceType === "mobile" ? (
                        <Smartphone className={`h-4 w-4 ${session.isCurrent ? "text-emerald-400" : "text-muted-foreground"}`} />
                      ) : (
                        <Monitor className={`h-4 w-4 ${session.isCurrent ? "text-emerald-400" : "text-muted-foreground"}`} />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-foreground">{session.device}</p>
                        {session.isCurrent && (
                          <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 bg-emerald-500/10 text-xs">
                            Current
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {session.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {session.lastActive}
                        </span>
                      </div>
                    </div>
                  </div>
                  {!session.isCurrent && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleRevokeSession(session.id)}
                      className="text-red-400 hover:text-red-400 hover:bg-red-500/10"
                    >
                      Revoke
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Login History */}
      <Card className="bg-card/50 backdrop-blur-sm border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-400" />
                Login History
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Recent login attempts and security events
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-muted-foreground border-border">
              Last 30 days
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            {MOCK_LOGIN_HISTORY.map((login) => (
              <div 
                key={login.id}
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  login.status === "success" 
                    ? "bg-muted/30 border-border" 
                    : login.status === "failed"
                    ? "bg-amber-500/5 border-amber-500/30"
                    : "bg-red-500/5 border-red-500/30"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                    login.status === "success" 
                      ? "bg-emerald-500/20" 
                      : login.status === "failed"
                      ? "bg-amber-500/20"
                      : "bg-red-500/20"
                  }`}>
                    {login.status === "success" ? (
                      <Check className="h-4 w-4 text-emerald-400" />
                    ) : login.status === "failed" ? (
                      <AlertTriangle className="h-4 w-4 text-amber-400" />
                    ) : (
                      <Shield className="h-4 w-4 text-red-400" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-foreground">{login.device}</p>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${
                          login.status === "success" 
                            ? "border-emerald-500/30 text-emerald-400 bg-emerald-500/10"
                            : login.status === "failed"
                            ? "border-amber-500/30 text-amber-400 bg-amber-500/10"
                            : "border-red-500/30 text-red-400 bg-red-500/10"
                        }`}
                      >
                        {login.status === "success" ? "Successful" : login.status === "failed" ? "Failed" : "Blocked"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {login.location}
                      </span>
                      <span>IP: {login.ip}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {login.time}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Security Alerts Notice */}
          {MOCK_LOGIN_HISTORY.some(login => login.status !== "success") && (
            <div className="p-4 rounded-lg border border-amber-500/30 bg-amber-500/5">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-400">Suspicious Activity Detected</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    We detected login attempts from unusual locations. If you don&apos;t recognize these activities, 
                    we recommend changing your password and enabling two-factor authentication.
                  </p>
                  <div className="flex gap-2 mt-3">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
                      onClick={() => setIsPasswordDialogOpen(true)}
                    >
                      Change Password
                    </Button>
                    {!is2FAEnabled && (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                        onClick={() => setIs2FADialogOpen(true)}
                      >
                        Enable 2FA
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="bg-card/50 border-red-500/30">
        <CardHeader>
          <CardTitle className="text-red-400 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Danger Zone
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Irreversible actions that affect your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 rounded-lg border border-red-500/20 bg-red-500/5">
            <div>
              <p className="font-medium text-foreground">Delete Account</p>
              <p className="text-sm text-muted-foreground">Permanently delete your account and all associated data</p>
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
