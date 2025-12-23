/**
 * Community Sidebar Component
 * Right sidebar with platform cost info, credit purchase, tips, and subreddits
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Lightbulb, Flame, ExternalLink } from "lucide-react"
import { CommunityCreditPurchaseCard } from "./CommunityCreditPurchaseCard"
import { COMMUNITY_TIPS, SEO_SUBREDDITS } from "../constants"
import type { CommunityPlatform } from "../types"

interface CommunitySidebarProps {
  activePlatform: CommunityPlatform
  currentCredits?: number
  onPurchase?: (packageId: string, credits: number, price: number) => void
}

export function CommunitySidebar({ activePlatform, currentCredits = 125, onPurchase }: CommunitySidebarProps) {
  const handleSubredditClick = (subreddit: string) => {
    const url = `https://reddit.com/${subreddit.replace("r/", "r/")}`
    window.open(url, "_blank")
  }

  return (
    <div className="lg:col-span-1 space-y-3 sm:space-y-4">
      {/* Platform API Cost Info */}
      <Card className="bg-card border-border overflow-hidden">
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-center gap-3">
            <div 
              className={`p-2.5 sm:p-3 rounded-xl ${activePlatform === "reddit" ? "bg-orange-500/10" : "bg-red-500/10"}`}
            >
              {activePlatform === "reddit" ? (
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500">
                  <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701z"/>
                </svg>
              ) : (
                <span className="text-base sm:text-lg font-bold text-red-600">Q</span>
              )}
            </div>
            <div className="flex-1">
              <p className="text-lg sm:text-xl font-bold text-foreground">
                1 <span className="text-sm font-normal text-muted-foreground">credit</span>
              </p>
              <p className="text-[10px] sm:text-xs text-muted-foreground">
                per keyword on {activePlatform === "reddit" ? "Reddit" : "Quora"}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] sm:text-xs text-muted-foreground">API Source</p>
              <p className="text-xs sm:text-sm font-medium text-foreground">
                {activePlatform === "reddit" ? "Apify" : "Crawlbase"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Credit Purchase Card */}
      <CommunityCreditPurchaseCard
        currentCredits={currentCredits}
        onPurchase={onPurchase}
      />

      {/* Tips */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2 sm:pb-3">
          <CardTitle className="text-xs sm:text-sm font-semibold text-foreground flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-500/10">
              <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
            </div>
            Community Tips
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2.5 pt-0">
          {COMMUNITY_TIPS.map((tip, i) => (
            <div key={i} className="flex items-start gap-2 text-xs">
              <span className="text-emerald-500 mt-0.5 shrink-0">✓</span>
              <span className="text-muted-foreground leading-relaxed">{tip}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Popular Subreddits */}
      {activePlatform === "reddit" && (
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-orange-500/10">
                <Flame className="w-3.5 h-3.5 text-orange-500" />
              </div>
              Popular Subreddits
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 pt-0">
            {SEO_SUBREDDITS.slice(0, 6).map((sub) => (
              <button
                key={sub}
                onClick={() => handleSubredditClick(sub)}
                className="flex items-center justify-between text-xs group cursor-pointer hover:bg-muted/50 rounded-md px-2 py-1.5 -mx-2 transition-colors w-full text-left"
              >
                <span className="text-orange-600 dark:text-orange-400 font-medium">{sub}</span>
                <ExternalLink className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
