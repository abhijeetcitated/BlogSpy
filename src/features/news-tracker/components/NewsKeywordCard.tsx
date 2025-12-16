"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Star, 
  ExternalLink,
  Eye,
  MousePointer,
  Copy,
  MoreVertical,
  Trash2,
  RefreshCw,
  Bell,
  BellRing,
  Loader2,
} from "lucide-react"
import { NEWS_INTENT_COLORS } from "../constants"
import type { NewsKeyword } from "../types"
import type { KeywordAlert } from "./SetAlertDialog"

interface NewsKeywordCardProps {
  keyword: NewsKeyword
  platform: "google-news" | "google-discover"
  onRefresh?: (keywordId: string) => void
  onRemove?: (keywordId: string) => void
  onSetAlert?: (keywordId: string) => void
  isRefreshing?: boolean
  hasAlert?: boolean
}

// Google News mini icon
const GoogleNewsIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none">
    <circle cx="12" cy="12" r="10" fill="#4285F4"/>
    <rect x="7" y="8" width="10" height="2" rx="1" fill="white"/>
    <rect x="7" y="11" width="7" height="2" rx="1" fill="white"/>
    <rect x="7" y="14" width="10" height="2" rx="1" fill="white"/>
  </svg>
)

// Google Discover mini icon
const GoogleDiscoverIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none">
    <circle cx="12" cy="12" r="10" fill="#EA4335"/>
    <path d="M12 6l1.5 3.5 3.5 1.5-3.5 1.5L12 16l-1.5-3.5L7 11l3.5-1.5L12 6z" fill="white"/>
  </svg>
)

export function NewsKeywordCard({ 
  keyword, 
  platform,
  onRefresh,
  onRemove,
  onSetAlert,
  isRefreshing = false,
  hasAlert = false,
}: NewsKeywordCardProps) {
  const intentConfig = NEWS_INTENT_COLORS[keyword.newsIntent]
  const isThisRefreshing = isRefreshing
  
  const handleCopy = () => {
    navigator.clipboard.writeText(keyword.keyword)
    toast.success("Keyword copied!", { duration: 1500 })
  }
  
  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh(keyword.id)
    } else {
      toast.info("Refreshing keyword data...", { duration: 1500 })
    }
  }
  
  const handleSetAlert = () => {
    if (onSetAlert) {
      onSetAlert(keyword.id)
    } else {
      toast.success("Alert set for this keyword!", { duration: 2000 })
    }
  }
  
  const handleDelete = () => {
    if (onRemove) {
      onRemove(keyword.id)
    } else {
      toast.error("Keyword removed from tracking", { duration: 2000 })
    }
  }
  
  if (platform === "google-news") {
    const newsData = keyword.platforms["google-news"]
    
    return (
      <Card className="bg-card border-border hover:border-blue-500/30 transition-all group">
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h3 className="font-semibold text-foreground text-sm sm:text-base truncate">{keyword.keyword}</h3>
                <Badge className={cn(intentConfig.bg, intentConfig.text, "text-[10px] shrink-0")}>
                  {intentConfig.label}
                </Badge>
                {newsData?.isTopStory && (
                  <Badge className="bg-amber-500/20 text-amber-600 dark:text-amber-400 text-[10px] shrink-0">
                    <Star className="w-2.5 h-2.5 mr-0.5" />
                    Top Story
                  </Badge>
                )}
              </div>
              <p className="text-[10px] sm:text-xs text-muted-foreground">
                {keyword.searchVolume.toLocaleString()} monthly searches
              </p>
            </div>
            
            {/* Actions */}
            <div className="flex items-center gap-1 shrink-0">
              <Button 
                variant="ghost" 
                size="icon" 
                className="w-7 h-7 text-muted-foreground hover:text-foreground"
                onClick={handleCopy}
              >
                <Copy className="w-3.5 h-3.5" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="w-7 h-7 text-muted-foreground hover:text-foreground">
                    <MoreVertical className="w-3.5 h-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  <DropdownMenuItem onClick={handleRefresh} disabled={isThisRefreshing}>
                    {isThisRefreshing ? (
                      <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                    ) : (
                      <RefreshCw className="w-3.5 h-3.5 mr-2" />
                    )}
                    {isThisRefreshing ? "Refreshing..." : "Refresh Data"}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSetAlert}>
                    {hasAlert ? (
                      <BellRing className="w-3.5 h-3.5 mr-2 text-amber-500" />
                    ) : (
                      <Bell className="w-3.5 h-3.5 mr-2" />
                    )}
                    {hasAlert ? "Edit Alert" : "Set Alert"}
                  </DropdownMenuItem>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <DropdownMenuItem 
                        className="text-red-500"
                        onSelect={(e) => e.preventDefault()}
                      >
                        <Trash2 className="w-3.5 h-3.5 mr-2" />
                        Remove
                      </DropdownMenuItem>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Remove Keyword?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to stop tracking "{keyword.keyword}"? 
                          This action cannot be undone and all historical data will be lost.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={handleDelete}
                          className="bg-red-500 hover:bg-red-600"
                        >
                          Remove
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          {/* Position Badge & Stats */}
          <div className="flex items-center gap-3">
            {/* Position */}
            {newsData?.position ? (
              <div className="text-center shrink-0">
                <div className={cn(
                  "w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center text-base sm:text-lg font-bold",
                  newsData.position <= 3 ? "bg-amber-500/20 text-amber-600 dark:text-amber-400" :
                  newsData.position <= 10 ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400" :
                  "bg-muted text-muted-foreground"
                )}>
                  #{newsData.position}
                </div>
                {newsData.change !== 0 && (
                  <div className={cn(
                    "flex items-center justify-center gap-0.5 text-[10px] sm:text-xs mt-1",
                    newsData.change > 0 ? "text-emerald-500" : "text-red-500"
                  )}>
                    {newsData.change > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {Math.abs(newsData.change)}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center shrink-0">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
                  —
                </div>
              </div>
            )}

            {/* Top Articles */}
            {newsData?.articles && newsData.articles.length > 0 && (
              <div className="flex-1 min-w-0 space-y-1.5 pt-1 border-l border-border pl-3">
                <span className="text-[10px] text-muted-foreground">Top Sources:</span>
                {newsData.articles.slice(0, 2).map((article) => (
                  <div key={article.id} className="flex items-center gap-2 text-[10px] sm:text-xs">
                    <span className="text-muted-foreground">#{article.position}</span>
                    <span className="text-foreground truncate flex-1">{article.source}</span>
                    <span className="text-muted-foreground shrink-0">{article.publishDate}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  // Google Discover View
  const discoverData = keyword.platforms["google-discover"]
  
  return (
    <Card className="bg-card border-border hover:border-red-500/30 transition-all group">
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h3 className="font-semibold text-foreground text-sm sm:text-base truncate">{keyword.keyword}</h3>
              <Badge className={cn(intentConfig.bg, intentConfig.text, "text-[10px] shrink-0")}>
                {intentConfig.label}
              </Badge>
            </div>
            <p className="text-[10px] sm:text-xs text-muted-foreground">
              {keyword.searchVolume.toLocaleString()} monthly searches
            </p>
          </div>
          
          {/* Trend Badge & Actions */}
          <div className="flex items-center gap-1 shrink-0">
            {discoverData && (
              <div className={cn(
                "flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] sm:text-xs mr-1",
                discoverData.trend === "up" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" :
                discoverData.trend === "down" ? "bg-red-500/10 text-red-600 dark:text-red-400" :
                "bg-muted text-muted-foreground"
              )}>
                {discoverData.trend === "up" ? <TrendingUp className="w-3 h-3" /> :
                 discoverData.trend === "down" ? <TrendingDown className="w-3 h-3" /> :
                 <Minus className="w-3 h-3" />}
                {discoverData.trend}
              </div>
            )}
            <Button 
              variant="ghost" 
              size="icon" 
              className="w-7 h-7 text-muted-foreground hover:text-foreground"
              onClick={handleCopy}
            >
              <Copy className="w-3.5 h-3.5" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="w-7 h-7 text-muted-foreground hover:text-foreground">
                  <MoreVertical className="w-3.5 h-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem onClick={handleRefresh} disabled={isThisRefreshing}>
                  {isThisRefreshing ? (
                    <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="w-3.5 h-3.5 mr-2" />
                  )}
                  {isThisRefreshing ? "Refreshing..." : "Refresh Data"}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSetAlert}>
                  {hasAlert ? (
                    <BellRing className="w-3.5 h-3.5 mr-2 text-amber-500" />
                  ) : (
                    <Bell className="w-3.5 h-3.5 mr-2" />
                  )}
                  {hasAlert ? "Edit Alert" : "Set Alert"}
                </DropdownMenuItem>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem 
                      className="text-red-500"
                      onSelect={(e) => e.preventDefault()}
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-2" />
                      Remove
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Remove Keyword?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to stop tracking "{keyword.keyword}"? 
                        This action cannot be undone and all historical data will be lost.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={handleDelete}
                        className="bg-red-500 hover:bg-red-600"
                      >
                        Remove
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Discover Stats */}
        {discoverData ? (
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center p-2 rounded-lg bg-purple-500/10 dark:bg-purple-500/20">
              <Eye className="w-3.5 h-3.5 mx-auto text-purple-500 mb-1" />
              <span className="text-xs font-medium text-foreground">
                {(discoverData.impressions / 1000).toFixed(0)}K
              </span>
              <span className="text-[9px] sm:text-[10px] text-muted-foreground block">Impressions</span>
            </div>
            <div className="text-center p-2 rounded-lg bg-cyan-500/10 dark:bg-cyan-500/20">
              <MousePointer className="w-3.5 h-3.5 mx-auto text-cyan-500 mb-1" />
              <span className="text-xs font-medium text-foreground">
                {(discoverData.clicks / 1000).toFixed(1)}K
              </span>
              <span className="text-[9px] sm:text-[10px] text-muted-foreground block">Clicks</span>
            </div>
            <div className="text-center p-2 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/20">
              <TrendingUp className="w-3.5 h-3.5 mx-auto text-emerald-500 mb-1" />
              <span className="text-xs font-medium text-foreground">
                {discoverData.ctr.toFixed(1)}%
              </span>
              <span className="text-[9px] sm:text-[10px] text-muted-foreground block">CTR</span>
            </div>
          </div>
        ) : (
          <div className="text-center py-4 text-xs text-muted-foreground">
            Not appearing in Discover
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Keyword List
interface NewsKeywordListProps {
  keywords: NewsKeyword[]
  platform: "google-news" | "google-discover"
  onRefresh?: (keywordId: string) => void
  onRemove?: (keywordId: string) => void
  onSetAlert?: (keywordId: string) => void
  isRefreshing?: string | null
  alerts?: Map<string, KeywordAlert>
}

export function NewsKeywordList({ 
  keywords, 
  platform,
  onRefresh,
  onRemove,
  onSetAlert,
  isRefreshing,
  alerts,
}: NewsKeywordListProps) {
  if (keywords.length === 0) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="py-12 text-center">
          <div className="p-3 rounded-full bg-muted w-fit mx-auto mb-3">
            {platform === "google-news" ? (
              <GoogleNewsIcon className="w-6 h-6" />
            ) : (
              <GoogleDiscoverIcon className="w-6 h-6" />
            )}
          </div>
          <h3 className="font-medium text-foreground mb-1">No keywords found</h3>
          <p className="text-sm text-muted-foreground">
            {platform === "google-news" 
              ? "Add keywords to track their Google News rankings"
              : "Add keywords to monitor their Discover visibility"
            }
          </p>
        </CardContent>
      </Card>
    )
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
      {keywords.map((keyword) => (
        <NewsKeywordCard 
          key={keyword.id} 
          keyword={keyword} 
          platform={platform}
          onRefresh={onRefresh}
          onRemove={onRemove}
          onSetAlert={onSetAlert}
          isRefreshing={isRefreshing === keyword.id}
          hasAlert={alerts?.has(keyword.id)}
        />
      ))}
    </div>
  )
}
