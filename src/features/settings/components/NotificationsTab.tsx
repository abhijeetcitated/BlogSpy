"use client"

import { useEffect, useOptimistic, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Mail, Bell, TrendingUp, TrendingDown, Users, Megaphone } from "lucide-react"
import { useAction } from "next-safe-action/hooks"
import { toast } from "sonner"
import type { NotificationSettings } from "../types"
import { DEFAULT_NOTIFICATIONS, NOTIFICATION_OPTIONS } from "../constants"
import {
  getNotificationSettings,
  updateNotificationSetting,
} from "@/features/settings/actions/update-notifications"

const SECTION_CONFIG = [
  {
    key: "reports",
    title: "Reports & Summaries",
    description: "Periodic performance reports",
    icon: Mail,
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
  },
  {
    key: "rankalerts",
    title: "Ranking Alerts",
    description: "Track your keyword positions",
    icon: TrendingUp,
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
  },
  {
    key: "decayalerts",
    title: "Content Decay Alerts",
    description: "Monitor content performance",
    icon: TrendingDown,
    color: "text-amber-400",
    bgColor: "bg-amber-500/10",
  },
  {
    key: "competitoralerts",
    title: "Competitor Alerts",
    description: "Stay ahead of competition",
    icon: Users,
    color: "text-purple-400",
    bgColor: "bg-purple-500/10",
    badge: "Pro",
  },
  {
    key: "other",
    title: "Other Notifications",
    description: "Updates and marketing",
    icon: Megaphone,
    color: "text-muted-foreground",
    bgColor: "bg-muted/30",
  },
] as const

const BRAND_GOLD_CLASS = "data-[state=checked]:bg-[#FFD700] data-[state=checked]:text-black"

export function NotificationsTab() {
  const router = useRouter()
  const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_NOTIFICATIONS)
  const [billingTier, setBillingTier] = useState("free")
  const [isLoading, setIsLoading] = useState(true)
  const [isPending, startTransition] = useTransition()
  const [optimisticSettings, setOptimisticSettings] = useOptimistic(
    settings,
    (_current, next: NotificationSettings) => next
  )
  const { executeAsync: executeGetSettings } = useAction(getNotificationSettings)
  const { executeAsync: executeUpdateSetting } = useAction(updateNotificationSetting)

  useEffect(() => {
    let isMounted = true
    const loadSettings = async () => {
      setIsLoading(true)
      try {
        const result = await executeGetSettings({})
        const serverError =
          typeof result?.serverError === "string" ? result.serverError : undefined
        if (serverError) {
          toast.error(serverError)
          return
        }
        if (result?.data?.settings && isMounted) {
          setSettings(result.data.settings)
          setBillingTier(result.data.billingTier ?? "free")
        }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to load notifications.")
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadSettings()
    return () => {
      isMounted = false
    }
  }, [executeGetSettings])

  const buildNextSettings = (
    current: NotificationSettings,
    key: keyof NotificationSettings,
    value: boolean
  ) => {
    const next = { ...current, [key]: value }
    if (key === "unsubscribeall" && value) {
      next.weeklyreport = false
      next.rankalerts = false
      next.decayalerts = false
      next.competitoralerts = false
      next.productupdates = false
    }
    if (key !== "unsubscribeall" && value) {
      next.unsubscribeall = false
    }
    return next
  }

  const handleToggle = (key: keyof NotificationSettings, value: boolean) => {
    if (key === "competitoralerts" && value && billingTier === "free") {
      toast.error("Upgrade Required")
      router.push("/pricing")
      return
    }

    const previous = optimisticSettings
    const nextSettings = buildNextSettings(optimisticSettings, key, value)
    startTransition(async () => {
      setOptimisticSettings(nextSettings)
      try {
        const result = await executeUpdateSetting({ key, value })
        const serverError =
          typeof result?.serverError === "string" ? result.serverError : undefined
        if (serverError) {
          if (serverError === "Upgrade Required") {
            toast.error(serverError)
            router.push("/pricing")
            setSettings(previous)
            setOptimisticSettings(previous)
            return
          }
          throw new Error(serverError)
        }
        if (!result?.data?.settings) {
          throw new Error("Failed to update notification settings.")
        }
        setSettings(result.data.settings)
        toast.success("Preferences updated")
      } catch (error) {
        setSettings(previous)
        setOptimisticSettings(previous)
        toast.error(error instanceof Error ? error.message : "Failed to save notification settings.")
      }
    })
  }

  const masterDisabled = optimisticSettings.unsubscribeall

  return (
    <div className="space-y-6">
      {/* Email Notification Header */}
      <Card className="bg-linear-to-r from-blue-500/10 to-cyan-500/10 border-blue-500/20">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <Bell className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <p className="text-foreground font-medium">Email Notifications</p>
              <p className="text-sm text-muted-foreground">
                All alerts are sent to your registered email address
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Sections */}
      {SECTION_CONFIG.map((section) => {
        const options = NOTIFICATION_OPTIONS[section.key as keyof typeof NOTIFICATION_OPTIONS]
        const SectionIcon = section.icon
        
        return (
          <Card key={section.key} className="bg-card/50 border-border">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className={`h-8 w-8 rounded-lg ${section.bgColor} flex items-center justify-center`}>
                  <SectionIcon className={`h-4 w-4 ${section.color}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-foreground text-base">{section.title}</CardTitle>
                    {"badge" in section && section.badge && (
                      <Badge variant="outline" className="border-purple-500/30 text-purple-400 bg-purple-500/10 text-xs">
                        {section.badge}
                      </Badge>
                    )}
                  </div>
                  <CardDescription className="text-muted-foreground text-sm">
                    {section.description}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-1 pt-0">
              {options.map((option) => (
                <div
                  key={option.id}
                  className={`flex items-center justify-between p-3 rounded-lg hover:bg-accent/30 transition-colors ${
                    masterDisabled ? "opacity-50" : ""
                  }`}
                >
                  <div className="space-y-0.5 flex-1 mr-4">
                    <Label htmlFor={option.id} className="text-foreground font-medium cursor-pointer">
                      {option.label}
                    </Label>
                    <p className="text-sm text-muted-foreground">{option.description}</p>
                  </div>
                  {isLoading ? (
                    <Skeleton className="h-8 w-12 rounded-full" />
                  ) : (
                    <Switch
                      id={option.id}
                      checked={optimisticSettings[option.id as keyof NotificationSettings]}
                      disabled={isLoading || isPending || masterDisabled}
                      onCheckedChange={(checked) =>
                        handleToggle(option.id as keyof NotificationSettings, checked)
                      }
                      className={BRAND_GOLD_CLASS}
                    />
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )
      })}

      {/* Unsubscribe All */}
      <Card className="bg-card/50 border-border">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-foreground font-medium">Unsubscribe from all</p>
              <p className="text-sm text-muted-foreground">
                Turn off all email notifications (you'll still receive critical account alerts)
              </p>
            </div>
            {isLoading ? (
              <Skeleton className="h-8 w-12 rounded-full" />
            ) : (
              <Switch
                checked={optimisticSettings.unsubscribeall}
                disabled={isLoading || isPending}
                onCheckedChange={(checked) => handleToggle("unsubscribeall", checked)}
                className="data-[state=checked]:bg-red-500"
              />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
