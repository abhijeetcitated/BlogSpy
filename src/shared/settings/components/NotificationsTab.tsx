"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Mail, Bell, TrendingUp, TrendingDown, Users, Megaphone } from "lucide-react"
import type { NotificationSettings } from "../types"
import { NOTIFICATION_OPTIONS } from "../constants"

interface NotificationsTabProps {
  notifications: NotificationSettings
  onNotificationChange: (key: keyof NotificationSettings, value: boolean) => void
}

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
    key: "rankAlerts",
    title: "Ranking Alerts",
    description: "Track your keyword positions",
    icon: TrendingUp,
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
  },
  {
    key: "decayAlerts",
    title: "Content Decay Alerts",
    description: "Monitor content performance",
    icon: TrendingDown,
    color: "text-amber-400",
    bgColor: "bg-amber-500/10",
  },
  {
    key: "competitorAlerts",
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

export function NotificationsTab({ notifications, onNotificationChange }: NotificationsTabProps) {
  return (
    <div className="space-y-6">
      {/* Email Notification Header */}
      <Card className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border-blue-500/20">
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
                    {section.badge && (
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
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-accent/30 transition-colors"
                >
                  <div className="space-y-0.5 flex-1 mr-4">
                    <Label htmlFor={option.id} className="text-foreground font-medium cursor-pointer">
                      {option.label}
                    </Label>
                    <p className="text-sm text-muted-foreground">{option.description}</p>
                  </div>
                  <Switch
                    id={option.id}
                    checked={notifications[option.id as keyof NotificationSettings]}
                    onCheckedChange={(checked) =>
                      onNotificationChange(option.id as keyof NotificationSettings, checked)
                    }
                    className="data-[state=checked]:bg-emerald-500"
                  />
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
            <Switch className="data-[state=checked]:bg-red-500" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
