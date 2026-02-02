"use client"

import { useEffect, useMemo, useState } from "react"
import { Loader2, Globe, Calendar, Mail } from "lucide-react"
import { format } from "date-fns"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useAction } from "next-safe-action/hooks"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { useController, useForm } from "react-hook-form"
import { useAuth } from "@/contexts/auth-context"
import { useProfile, useUser } from "@/hooks/use-user"
import { initiateEmailChange, updateProfileName } from "@/features/settings/actions/profile-actions"
import { updatePreferences } from "@/features/settings/actions/update-preferences"
import { AccountSecurityCard } from "@/features/settings/components/AccountSecurityCard"
import { DangerZone } from "@/features/settings/components/DangerZone"
import { TIMEZONES, getTimezoneLabel } from "@/lib/timezones"

const TIMEZONE_ALIASES: Record<string, string> = {
  IST: "Asia/Kolkata",
  "Asia/Calcutta": "Asia/Kolkata",
}

function normalizeTimezone(value?: string): string | null {
  if (!value) return null
  const trimmed = value.trim()
  if (!trimmed) return null
  const alias = TIMEZONE_ALIASES[trimmed]
  const candidate = alias ?? trimmed
  try {
    Intl.DateTimeFormat("en-US", { timeZone: candidate }).format(new Date())
  } catch {
    return null
  }
  return candidate
}

const DATE_FORMAT_PATTERNS = [
  { value: "MM/DD/YYYY", pattern: "MM/dd/yyyy" },
  { value: "DD/MM/YYYY", pattern: "dd/MM/yyyy" },
  { value: "YYYY-MM-DD", pattern: "yyyy-MM-dd" },
  { value: "DD MMM YYYY", pattern: "dd MMM yyyy" },
  { value: "MMM DD, YYYY", pattern: "MMM dd, yyyy" },
] as const

// Dynamic date formats with real-time preview
const getDateFormats = () => {
  const today = new Date()
  return DATE_FORMAT_PATTERNS.map((df) => ({
    value: df.value,
    label: `${df.value} (${format(today, df.pattern)})`,
  }))
}

type DateFormatValue = (typeof DATE_FORMAT_PATTERNS)[number]["value"]

type PreferencesFormValues = {
  timezone: string
  dateFormat: DateFormatValue
}

export function GeneralTab() {
  const router = useRouter()
  const { user } = useAuth()
  const { refreshProfile, isLoading } = useUser()
  const { profile, displayName, email, initials } = useProfile()
  const detectedTimezone = useMemo(() => {
    return (
      normalizeTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone) || "UTC"
    )
  }, [])

  // Robust auth provider detection - checks multiple sources
  const authProvider = useMemo(() => {
    // 1. First check our database profile
    if (profile?.auth_provider) {
      return profile.auth_provider
    }

    // 2. Check Supabase user.app_metadata.provider
    if (user && "app_metadata" in user) {
      const appMeta = user.app_metadata as { provider?: string; providers?: string[] } | undefined
      if (appMeta?.provider) {
        return appMeta.provider
      }
      // Some OAuth logins store in providers array
      if (appMeta?.providers && appMeta.providers.length > 0) {
        // If google is in providers, it's a google user
        if (appMeta.providers.includes("google")) {
          return "google"
        }
        return appMeta.providers[0]
      }
    }

    // 3. Check identities array (another Supabase location for provider info)
    if (user && "identities" in user) {
      const identities = (user as { identities?: Array<{ provider?: string }> }).identities
      if (identities && identities.length > 0 && identities[0]?.provider) {
        return identities[0].provider
      }
    }

    // 4. Fallback to email
    return "email"
  }, [profile?.auth_provider, user])

  const isGoogleProvider = authProvider === "google"
  const isEmailProvider = authProvider === "email"
  const [isSaving, setIsSaving] = useState(false)
  const [isSavingPreferences, setIsSavingPreferences] = useState(false)
  const [profileName, setProfileName] = useState("")
  const { control, reset: resetPreferences } = useForm<PreferencesFormValues>({
    defaultValues: {
      timezone: detectedTimezone,
      dateFormat: "DD/MM/YYYY",
    },
  })
  const { field: timezoneField } = useController({
    name: "timezone",
    control,
  })
  const { field: dateFormatField } = useController({
    name: "dateFormat",
    control,
  })

  const { executeAsync: executeUpdateProfileName } = useAction(updateProfileName)
  const { executeAsync: executeUpdatePreferences } = useAction(updatePreferences)
  const { executeAsync: executeEmailChange } = useAction(initiateEmailChange)

  // Email change state
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false)
  const [newEmail, setNewEmail] = useState("")
  const [emailPassword, setEmailPassword] = useState("")
  const [isEmailSaving, setIsEmailSaving] = useState(false)

  useEffect(() => {
    if (!profile) return
    const normalizedTimezone =
      normalizeTimezone(profile.timezone) || detectedTimezone
    const nextDateFormat = (profile.dateFormat ||
      "DD/MM/YYYY") as DateFormatValue

    setProfileName(profile.name || displayName)
    resetPreferences({
      timezone: normalizedTimezone,
      dateFormat: nextDateFormat,
    })
  }, [profile, displayName, detectedTimezone, resetPreferences])

  const timezoneOptions = useMemo(() => {
    // If current timezone is not in our curated list, add it
    if (timezoneField.value && !TIMEZONES.find(tz => tz.value === timezoneField.value)) {
      return [
        ...TIMEZONES,
        { value: timezoneField.value, label: `${timezoneField.value} (Detected)` }
      ]
    }
    return TIMEZONES
  }, [timezoneField.value])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const result = await executeUpdateProfileName({ fullName: profileName })
      const serverError =
        typeof result?.serverError === "string" ? result.serverError : undefined
      if (serverError) {
        toast.error(serverError)
        return
      }
      const validationMessage = result?.validationErrors?.fullName?._errors?.[0]
      if (validationMessage) {
        toast.error(validationMessage)
        return
      }
      if (!result?.data?.success) {
        toast.error("Failed to update profile.")
        return
      }
      toast.success("Profile updated successfully.")
      await refreshProfile()
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update profile.")
    } finally {
      setIsSaving(false)
    }
  }

  const handleSavePreferences = async () => {
    setIsSavingPreferences(true)
    try {
      const normalizedTimezone =
        normalizeTimezone(timezoneField.value) || detectedTimezone
      const nextDateFormat =
        (dateFormatField.value || "DD/MM/YYYY") as DateFormatValue
      const result = await executeUpdatePreferences({
        timezone: normalizedTimezone,
        dateFormat: nextDateFormat,
      })
      const serverError =
        typeof result?.serverError === "string" ? result.serverError : undefined
      if (serverError) {
        toast.error(serverError)
        return
      }
      if (!result?.data?.success) {
        toast.error("Failed to update preferences.")
        return
      }
      // Use returned values from server for confirmed state sync
      resetPreferences({
        timezone:
          normalizeTimezone(result.data?.timezone) || normalizedTimezone,
        dateFormat: (result.data?.dateFormat || nextDateFormat) as DateFormatValue,
      })
      toast.success("Preferences saved.")
      await refreshProfile()
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update preferences.")
    } finally {
      setIsSavingPreferences(false)
    }
  }

  // Email change handlers
  const handleEmailChange = async () => {
    setIsEmailSaving(true)
    try {
      const result = await executeEmailChange({
        newEmail,
        currentPassword: isGoogleProvider ? undefined : emailPassword,
      })
      const serverError =
        typeof result?.serverError === "string" ? result.serverError : undefined
      if (serverError) {
        toast.error(serverError)
        return
      }
      if (!result?.data?.success) {
        toast.error("Failed to start email change.")
        return
      }
      toast.success("Check your new email to confirm the change.")
      setIsEmailDialogOpen(false)
      setNewEmail("")
      setEmailPassword("")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to change email.")
    } finally {
      setIsEmailSaving(false)
    }
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

  if (!user) {
    return null
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
              <AvatarFallback className="bg-[#FFD700] text-black text-xl font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Form Fields */}
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="fullName" className="text-foreground">Full Name</Label>
              <Input
                id="fullName"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
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
                {isGoogleProvider ? (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          className="border-[#FFD700] text-[#FFD700] bg-transparent cursor-not-allowed opacity-50"
                          disabled
                        >
                          <Mail className="h-4 w-4 mr-2" />
                          Change
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Email address is managed by your Google account.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ) : (
                  <Dialog open={isEmailDialogOpen} onOpenChange={setIsEmailDialogOpen}>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="border-[#FFD700] text-[#FFD700] hover:bg-[#FFD700]/10 bg-transparent"
                      >
                        <Mail className="h-4 w-4 mr-2" />
                        Change
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-card border-border">
                      <DialogHeader>
                        <DialogTitle className="text-foreground">Change Email Address</DialogTitle>
                        <DialogDescription className="text-muted-foreground">
                          Enter your new email and current password. We&apos;ll send a confirmation link to your new email.
                        </DialogDescription>
                      </DialogHeader>

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

                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setIsEmailDialogOpen(false)
                            setNewEmail("")
                            setEmailPassword("")
                          }}
                          className="border-[#FFD700] text-[#FFD700] hover:bg-[#FFD700]/10"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleEmailChange}
                          disabled={isEmailSaving || !newEmail || !emailPassword}
                          className="bg-[#FFD700] text-black hover:bg-[#FFD700]/90"
                        >
                          {isEmailSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                          Send Verification Code
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
              {isGoogleProvider ? (
                <p className="text-xs text-muted-foreground">Email address is managed by your Google account</p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  {isGoogleProvider
                    ? "Email address is managed by your Google account."
                    : "A verification code will be sent to your new email"}
                </p>
              )}
            </div>
          </div>

          <Button
            className="bg-[#FFD700] text-black hover:bg-[#FFD700]/90"
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
            Customize your timezone and display settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Timezone */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="timezone" className="text-foreground flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                Timezone
              </Label>
              <Select value={timezoneField.value} onValueChange={timezoneField.onChange}>
                <SelectTrigger className="border-[#FFD700]/60 bg-input/50 text-foreground">
                  <SelectValue placeholder="Select timezone..." />
                </SelectTrigger>
                <SelectContent>
                  {timezoneOptions.map((tz) => (
                    <SelectItem key={tz.value} value={tz.value}>
                      {tz.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">Used for scheduling reports and displaying times</p>
            </div>

            {/* Date Format */}
            <div className="grid gap-2">
              <Label htmlFor="dateFormat" className="text-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                Date Format
              </Label>
              <Select
                value={dateFormatField.value}
                onValueChange={dateFormatField.onChange}
              >
                <SelectTrigger className="bg-input/50 border-border text-foreground">
                  <SelectValue placeholder="Select date format" />
                </SelectTrigger>
                <SelectContent>
                  {getDateFormats().map((df) => (
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
            className="bg-[#FFD700] text-black hover:bg-[#FFD700]/90"
            onClick={handleSavePreferences}
            disabled={isSavingPreferences}
          >
            {isSavingPreferences && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Save Preferences
          </Button>
        </CardContent>
      </Card>

      <AccountSecurityCard
        lastPasswordChange={profile?.lastPasswordChange ?? null}
        canChangePassword={isEmailProvider}
      />

      <DangerZone />
    </div>
  )
}
