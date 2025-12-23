"use client"

/**
 * Reddit Keyword View Component
 * Reddit-specific keyword card UI
 */

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { CheckCircle, Copy, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { useState } from "react"
import { KeywordActions } from "./KeywordActions"
import { RedditStats } from "./PlatformStats"
import { COMMUNITY_INTENT_COLORS } from "../../constants"
import type { CommunityKeyword } from "../../types"

interface RedditKeywordViewProps {
  keyword: CommunityKeyword
  onDelete?: (keywordId: string) => void
}

export function RedditKeywordView({ keyword, onDelete }: RedditKeywordViewProps) {
  const [copiedKeyword, setCopiedKeyword] = useState(false)
  const redditData = keyword.platforms.reddit
  const intentConfig = COMMUNITY_INTENT_COLORS[keyword.communityIntent]

  if (!redditData) return null

  const handleCopyKeyword = async () => {
    try {
      await navigator.clipboard.writeText(keyword.keyword)
      setCopiedKeyword(true)
      toast.success("Keyword copied!", { description: keyword.keyword })
      setTimeout(() => setCopiedKeyword(false), 2000)
    } catch {
      toast.error("Failed to copy")
    }
  }

  const handleCopyHashtag = async () => {
    const hashtag = "#" + keyword.keyword.replace(/\s+/g, "").toLowerCase()
    try {
      await navigator.clipboard.writeText(hashtag)
      toast.success("Hashtag copied!", { description: hashtag })
    } catch {
      toast.error("Failed to copy")
    }
  }

  const handleCopySubreddits = async () => {
    try {
      await navigator.clipboard.writeText(redditData.subreddits.join(", "))
      toast.success("Subreddits copied!", { description: redditData.subreddits.join(", ") })
    } catch {
      toast.error("Failed to copy")
    }
  }

  const handleOpenOnPlatform = () => {
    const query = encodeURIComponent(keyword.keyword)
    window.open(`https://www.reddit.com/search/?q=${query}`, "_blank")
  }

  return (
    <Card className="bg-card border-border hover:border-orange-500/30 transition-all group">
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={handleCopyKeyword}
                      className="font-semibold text-foreground text-sm sm:text-base hover:text-orange-500 transition-colors flex items-center gap-1.5 group/copy"
                    >
                      {keyword.keyword}
                      {copiedKeyword ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 opacity-0 group-hover/copy:opacity-100 transition-opacity text-muted-foreground" />
                      )}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent><p>Click to copy keyword</p></TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <Badge variant="secondary" className={cn("text-[10px] font-medium border-0", intentConfig.bg, intentConfig.text)}>
                {intentConfig.label}
              </Badge>
              {redditData.hasOurContent && (
                <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] border-0">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Our Content
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">{keyword.searchVolume.toLocaleString()} monthly searches</p>
          </div>
          
          <div className="flex items-center gap-1 sm:gap-2 shrink-0 ml-1 sm:ml-2">
            <KeywordActions
              keyword={keyword.keyword}
              keywordId={keyword.id}
              platform="reddit"
              subreddits={redditData.subreddits}
              onCopyKeyword={handleCopyKeyword}
              onCopyHashtag={handleCopyHashtag}
              onCopySubreddits={handleCopySubreddits}
              onOpenPlatform={handleOpenOnPlatform}
              onDelete={onDelete}
            />

            {redditData.position ? (
              <div className={cn(
                "w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center text-sm sm:text-base font-bold",
                redditData.position <= 3 
                  ? "bg-linear-to-br from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/25" 
                  : redditData.position <= 10 
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20" 
                    : "bg-muted text-muted-foreground"
              )}>
                #{redditData.position}
              </div>
            ) : (
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground text-sm">—</div>
            )}
          </div>
        </div>

        <RedditStats
          avgUpvotes={redditData.avgUpvotes}
          totalMentions={redditData.totalMentions}
          subredditCount={redditData.subreddits.length}
        />

        {redditData.subreddits.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2.5">
            {redditData.subreddits.slice(0, 3).map((sub) => (
              <TooltipProvider key={sub}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(sub)
                        toast.success(`Copied: ${sub}`)
                      }}
                      className="text-[10px] px-2 py-1 rounded-md bg-orange-500/10 text-orange-600 dark:text-orange-400 font-medium hover:bg-orange-500/20 transition-colors"
                    >
                      {sub}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent><p>Click to copy</p></TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
