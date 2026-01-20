"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  Bell, 
  Clock, 
  Sparkles, 
  TrendingUp, 
  Video, 
  Music2,
  CheckCircle2
} from "lucide-react"
import { cn } from "@/lib/utils"
import { TIKTOK_FEATURE_STATUS } from "../constants"

interface TikTokComingSoonProps {
  className?: string
}

export const TikTokComingSoon = ({ className }: TikTokComingSoonProps) => {
  const [email, setEmail] = useState("")
  const [isSubscribed, setIsSubscribed] = useState(false)

  const handleNotifyMe = () => {
    if (email) {
      // TODO: Integrate with email notification system
      setIsSubscribed(true)
      setTimeout(() => setIsSubscribed(false), 3000)
    }
  }

  const upcomingFeatures = [
    { icon: TrendingUp, label: "Trending Videos Analysis" },
    { icon: Video, label: "Video Performance Metrics" },
    { icon: Music2, label: "Sound & Hashtag Trends" },
    { icon: Sparkles, label: "Viral Content Detection" },
  ]

  return (
    <div className={cn("flex flex-col items-center justify-center py-12 px-4", className)}>
      <Card className="w-full max-w-2xl border-2 border-dashed border-pink-200 bg-gradient-to-br from-pink-50/50 to-purple-50/50 dark:from-pink-950/20 dark:to-purple-950/20 dark:border-pink-800">
        <CardHeader className="text-center pb-2">
          {/* TikTok Logo */}
          <div className="mx-auto mb-4 relative">
            <div className="w-20 h-20 rounded-2xl bg-black flex items-center justify-center shadow-lg">
              <svg viewBox="0 0 24 24" className="w-12 h-12" fill="none">
                <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" fill="#25F4EE"/>
                <path d="M16.37 2H12.9v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005.5 20.1a6.33 6.33 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52V6.8A4.83 4.83 0 0116.37 2z" fill="#FE2C55"/>
              </svg>
            </div>
            <Badge 
              variant="secondary" 
              className="absolute -top-2 -right-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white border-0 animate-pulse"
            >
              <Clock className="w-3 h-3 mr-1" />
              {TIKTOK_FEATURE_STATUS.label}
            </Badge>
          </div>
          
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
            TikTok Research
          </CardTitle>
          <p className="text-muted-foreground mt-2">
            {TIKTOK_FEATURE_STATUS.message}
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Upcoming Features */}
          <div className="grid grid-cols-2 gap-3">
            {upcomingFeatures.map((feature, index) => (
              <div 
                key={index}
                className="flex items-center gap-2 p-3 rounded-lg bg-white/50 dark:bg-gray-800/50 border border-pink-100 dark:border-pink-900"
              >
                <feature.icon className="w-5 h-5 text-pink-500" />
                <span className="text-sm font-medium">{feature.label}</span>
              </div>
            ))}
          </div>

          {/* Phase Badge */}
          <div className="flex items-center justify-center gap-2 py-2">
            <Badge variant="outline" className="bg-purple-50 dark:bg-purple-950 border-purple-200 dark:border-purple-800">
              <Sparkles className="w-3 h-3 mr-1 text-purple-500" />
              Phase {TIKTOK_FEATURE_STATUS.phase} Feature
            </Badge>
          </div>

          {/* Notify Me Section */}
          {TIKTOK_FEATURE_STATUS.notifyEnabled && (
            <div className="space-y-3 pt-4 border-t border-pink-100 dark:border-pink-900">
              <p className="text-sm text-center text-muted-foreground">
                Get notified when TikTok research goes live
              </p>
              
              {isSubscribed ? (
                <div className="flex items-center justify-center gap-2 py-3 text-green-600 dark:text-green-400">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="font-medium">You&apos;ll be notified!</span>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 border-pink-200 dark:border-pink-800 focus:ring-pink-500"
                  />
                  <Button 
                    onClick={handleNotifyMe}
                    className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white border-0"
                  >
                    <Bell className="w-4 h-4 mr-2" />
                    Notify Me
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Info Text */}
          <p className="text-xs text-center text-muted-foreground">
            YouTube research is fully available now. Use it to discover video opportunities!
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default TikTokComingSoon
