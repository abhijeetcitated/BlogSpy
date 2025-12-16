"use client"

import { useState } from "react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

import type { TrendAlertSettings } from "../types"
import { BellIcon, CheckIcon, MailIcon, PhoneIcon, SlackIcon } from "./icons"

interface TrendAlertButtonProps {
  keyword: string
  className?: string
}

export function TrendAlertButton({ keyword, className }: TrendAlertButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  
  // Alert settings state
  const [settings, setSettings] = useState<TrendAlertSettings>({
    keyword,
    velocityIncrease: true,
    breakoutQuery: true,
    competitorPublish: false,
    notifyVia: {
      email: true,
      push: false,
      slack: false,
    },
  })

  const handleSave = () => {
    // In real app, this would save to backend
    console.log("Alert saved:", settings)
    setIsSaved(true)
    setTimeout(() => {
      setIsOpen(false)
      // Reset after close animation
      setTimeout(() => setIsSaved(false), 300)
    }, 1000)
  }

  const toggleSetting = (key: keyof Omit<TrendAlertSettings, "keyword" | "notifyVia">) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const toggleNotifyVia = (key: keyof TrendAlertSettings["notifyVia"]) => {
    setSettings((prev) => ({
      ...prev,
      notifyVia: { ...prev.notifyVia, [key]: !prev.notifyVia[key] },
    }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "h-8 sm:h-9 gap-1.5 sm:gap-2 text-xs sm:text-sm border-amber-500/30 text-amber-400 hover:bg-amber-500/10 hover:text-amber-300 active:bg-amber-500/20",
            className
          )}
        >
          <BellIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          <span className="hidden sm:inline">Set Alert</span>
          <span className="sm:hidden">Alert</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-[400px] bg-card border-border rounded-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <BellIcon className="h-5 w-5 text-amber-400" />
            Alert Settings
          </DialogTitle>
        </DialogHeader>

        {isSaved ? (
          // Success State
          <div className="py-8 flex flex-col items-center justify-center">
            <div className="h-12 w-12 rounded-full bg-emerald-500/20 flex items-center justify-center mb-3">
              <CheckIcon className="h-6 w-6 text-emerald-400" />
            </div>
            <p className="text-sm font-medium text-foreground">Alert Saved!</p>
            <p className="text-xs text-muted-foreground mt-1">
              We&apos;ll notify you when &quot;{keyword}&quot; trends
            </p>
          </div>
        ) : (
          // Form State
          <div className="space-y-5 py-2">
            {/* Keyword Display */}
            <div className="px-3 py-2 bg-muted/50 rounded-lg border border-border/50">
              <p className="text-xs text-muted-foreground">Tracking keyword</p>
              <p className="text-sm font-semibold text-foreground">&quot;{keyword}&quot;</p>
            </div>

            {/* Notify When */}
            <div className="space-y-3">
              <p className="text-sm font-medium text-foreground">Notify me when:</p>
              
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="velocity"
                    checked={settings.velocityIncrease}
                    onCheckedChange={() => toggleSetting("velocityIncrease")}
                  />
                  <Label htmlFor="velocity" className="text-sm text-muted-foreground cursor-pointer">
                    Trend velocity increases 20%+
                  </Label>
                </div>

                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="breakout"
                    checked={settings.breakoutQuery}
                    onCheckedChange={() => toggleSetting("breakoutQuery")}
                  />
                  <Label htmlFor="breakout" className="text-sm text-muted-foreground cursor-pointer">
                    New breakout query appears
                  </Label>
                </div>

                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="competitor"
                    checked={settings.competitorPublish}
                    onCheckedChange={() => toggleSetting("competitorPublish")}
                  />
                  <Label htmlFor="competitor" className="text-sm text-muted-foreground cursor-pointer">
                    Competitor publishes content
                  </Label>
                </div>
              </div>
            </div>

            {/* Notify Via */}
            <div className="space-y-3">
              <p className="text-sm font-medium text-foreground">Notify via:</p>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleNotifyVia("email")}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg border transition-all text-sm",
                    settings.notifyVia.email
                      ? "bg-amber-500/20 border-amber-500/50 text-amber-400"
                      : "bg-muted/30 border-border/50 text-muted-foreground hover:border-muted-foreground/50"
                  )}
                >
                  <MailIcon className="h-4 w-4" />
                  Email
                </button>

                <button
                  onClick={() => toggleNotifyVia("push")}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg border transition-all text-sm",
                    settings.notifyVia.push
                      ? "bg-amber-500/20 border-amber-500/50 text-amber-400"
                      : "bg-muted/30 border-border/50 text-muted-foreground hover:border-muted-foreground/50"
                  )}
                >
                  <PhoneIcon className="h-4 w-4" />
                  Push
                </button>

                <button
                  onClick={() => toggleNotifyVia("slack")}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg border transition-all text-sm",
                    settings.notifyVia.slack
                      ? "bg-amber-500/20 border-amber-500/50 text-amber-400"
                      : "bg-muted/30 border-border/50 text-muted-foreground hover:border-muted-foreground/50"
                  )}
                >
                  <SlackIcon className="h-4 w-4" />
                  Slack
                </button>
              </div>
            </div>
          </div>
        )}

        {!isSaved && (
          <DialogFooter>
            <Button
              onClick={handleSave}
              className="w-full bg-linear-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-black font-semibold"
            >
              Save Alert
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}
