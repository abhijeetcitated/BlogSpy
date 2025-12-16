"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { 
  ArrowUp, 
  MessageCircle, 
  Eye,
  CheckCircle,
  Users,
  Copy,
  Check,
  MoreVertical,
  Trash2,
  ExternalLink,
  Hash
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { COMMUNITY_INTENT_COLORS } from "../constants"
import type { CommunityKeyword } from "../types"

interface CommunityKeywordCardProps {
  keyword: CommunityKeyword
  platform: "reddit" | "quora"
}

export function CommunityKeywordCard({ keyword, platform }: CommunityKeywordCardProps) {
  const [copiedKeyword, setCopiedKeyword] = useState(false)
  const [copiedHashtag, setCopiedHashtag] = useState(false)
  
  const intentConfig = COMMUNITY_INTENT_COLORS[keyword.communityIntent]
  
  // Copy keyword to clipboard
  const handleCopyKeyword = async () => {
    try {
      await navigator.clipboard.writeText(keyword.keyword)
      setCopiedKeyword(true)
      toast.success("Keyword copied!", {
        description: keyword.keyword
      })
      setTimeout(() => setCopiedKeyword(false), 2000)
    } catch {
      toast.error("Failed to copy")
    }
  }

  // Copy as hashtag
  const handleCopyHashtag = async () => {
    const hashtag = "#" + keyword.keyword.replace(/\s+/g, "").toLowerCase()
    try {
      await navigator.clipboard.writeText(hashtag)
      setCopiedHashtag(true)
      toast.success("Hashtag copied!", {
        description: hashtag
      })
      setTimeout(() => setCopiedHashtag(false), 2000)
    } catch {
      toast.error("Failed to copy")
    }
  }

  // Copy subreddits
  const handleCopySubreddits = async (subreddits: string[]) => {
    try {
      await navigator.clipboard.writeText(subreddits.join(", "))
      toast.success("Subreddits copied!", {
        description: subreddits.join(", ")
      })
    } catch {
      toast.error("Failed to copy")
    }
  }

  // Open on platform
  const handleOpenOnPlatform = () => {
    const query = encodeURIComponent(keyword.keyword)
    const url = platform === "reddit"
      ? `https://www.reddit.com/search/?q=${query}`
      : `https://www.quora.com/search?q=${query}`
    window.open(url, "_blank")
  }
  
  if (platform === "reddit") {
    const redditData = keyword.platforms.reddit
    
    return (
      <Card className="bg-card border-border hover:border-orange-500/30 transition-all group">
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                {/* Keyword with copy button */}
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
                    <TooltipContent>
                      <p>Click to copy keyword</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <Badge variant="secondary" className={cn(
                  "text-[10px] font-medium border-0",
                  intentConfig.bg,
                  intentConfig.text
                )}>
                  {intentConfig.label}
                </Badge>
                {redditData?.hasOurContent && (
                  <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] border-0">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Our Content
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {keyword.searchVolume.toLocaleString()} monthly searches
              </p>
            </div>
            
            <div className="flex items-center gap-1 sm:gap-2 shrink-0 ml-1 sm:ml-2">
              {/* Action Menu - Always visible */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8 text-muted-foreground hover:text-foreground">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleCopyKeyword}>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Keyword
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleCopyHashtag}>
                    <Hash className="w-4 h-4 mr-2" />
                    Copy as Hashtag
                  </DropdownMenuItem>
                  {redditData?.subreddits && redditData.subreddits.length > 0 && (
                    <DropdownMenuItem onClick={() => handleCopySubreddits(redditData.subreddits)}>
                      <Users className="w-4 h-4 mr-2" />
                      Copy Subreddits
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleOpenOnPlatform}>
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Search on Reddit
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-500 focus:text-red-500">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Keyword
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Position Badge */}
              {redditData?.position ? (
                <div className="text-center">
                  <div className={cn(
                    "w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center text-sm sm:text-base font-bold",
                    redditData.position <= 3 
                      ? "bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/25" 
                      : redditData.position <= 10 
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20" 
                        : "bg-muted text-muted-foreground"
                  )}>
                    #{redditData.position}
                  </div>
                </div>
              ) : (
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground text-sm">
                  —
                </div>
              )}
            </div>
          </div>

          {/* Stats Row */}
          {redditData && (
            <div className="grid grid-cols-3 gap-1.5 sm:gap-2 mb-2.5 sm:mb-3">
              <div className="text-center p-1.5 sm:p-2 rounded-lg bg-muted/50">
                <ArrowUp className="w-3 h-3 sm:w-3.5 sm:h-3.5 mx-auto text-orange-500 mb-0.5 sm:mb-1" />
                <span className="text-[10px] sm:text-xs font-medium text-foreground">{redditData.avgUpvotes}</span>
                <span className="text-[9px] sm:text-[10px] text-muted-foreground block">Upvotes</span>
              </div>
              <div className="text-center p-1.5 sm:p-2 rounded-lg bg-muted/50">
                <MessageCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5 mx-auto text-blue-500 mb-0.5 sm:mb-1" />
                <span className="text-[10px] sm:text-xs font-medium text-foreground">{redditData.totalMentions}</span>
                <span className="text-[9px] sm:text-[10px] text-muted-foreground block">Mentions</span>
              </div>
              <div className="text-center p-1.5 sm:p-2 rounded-lg bg-muted/50">
                <Users className="w-3 h-3 sm:w-3.5 sm:h-3.5 mx-auto text-purple-500 mb-0.5 sm:mb-1" />
                <span className="text-[10px] sm:text-xs font-medium text-foreground">{redditData.subreddits.length}</span>
                <span className="text-[9px] sm:text-[10px] text-muted-foreground block">Subreddits</span>
              </div>
            </div>
          )}

          {/* Subreddits with copy */}
          {redditData?.subreddits && redditData.subreddits.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
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
                    <TooltipContent>
                      <p>Click to copy</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  // Quora View
  const quoraData = keyword.platforms.quora
  
  return (
    <Card className="bg-card border-border hover:border-red-500/30 transition-all group">
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-start justify-between mb-2.5 sm:mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              {/* Keyword with copy button */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={handleCopyKeyword}
                      className="font-semibold text-foreground text-sm sm:text-base hover:text-red-500 transition-colors flex items-center gap-1.5 group/copy"
                    >
                      {keyword.keyword}
                      {copiedKeyword ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 opacity-0 group-hover/copy:opacity-100 transition-opacity text-muted-foreground" />
                      )}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Click to copy keyword</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <Badge variant="secondary" className={cn(
                "text-[10px] font-medium border-0",
                intentConfig.bg,
                intentConfig.text
              )}>
                {intentConfig.label}
              </Badge>
              {quoraData?.hasOurContent && (
                <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] border-0">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Our Answer
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {keyword.searchVolume.toLocaleString()} monthly searches
            </p>
          </div>
          
          <div className="flex items-center gap-1 sm:gap-2 shrink-0 ml-1 sm:ml-2">
            {/* Action Menu - Always visible */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8 text-muted-foreground hover:text-foreground">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleCopyKeyword}>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Keyword
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleCopyHashtag}>
                  <Hash className="w-4 h-4 mr-2" />
                  Copy as Hashtag
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleOpenOnPlatform}>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Search on Quora
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-500 focus:text-red-500">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Keyword
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Position Badge */}
            {quoraData?.position ? (
              <div className="text-center">
                <div className={cn(
                  "w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center text-sm sm:text-base font-bold",
                  quoraData.position <= 3 
                    ? "bg-gradient-to-br from-red-500 to-rose-600 text-white shadow-lg shadow-red-500/25" 
                    : quoraData.position <= 10 
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20" 
                      : "bg-muted text-muted-foreground"
                )}>
                  #{quoraData.position}
                </div>
              </div>
            ) : (
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground text-sm">
                —
              </div>
            )}
          </div>
        </div>

        {/* Quora Stats */}
        {quoraData && (
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
            <div className="text-center p-1.5 sm:p-2 rounded-lg bg-muted/50">
              <Eye className="w-3 h-3 sm:w-3.5 sm:h-3.5 mx-auto text-purple-500 mb-0.5 sm:mb-1" />
              <span className="text-[10px] sm:text-xs font-medium text-foreground">
                {(quoraData.avgViews / 1000).toFixed(0)}K
              </span>
              <span className="text-[9px] sm:text-[10px] text-muted-foreground block">Views</span>
            </div>
            <div className="text-center p-1.5 sm:p-2 rounded-lg bg-muted/50">
              <ArrowUp className="w-3 h-3 sm:w-3.5 sm:h-3.5 mx-auto text-red-500 mb-0.5 sm:mb-1" />
              <span className="text-[10px] sm:text-xs font-medium text-foreground">
                {quoraData.topAnswers.reduce((s, a) => s + a.upvotes, 0)}
              </span>
              <span className="text-[9px] sm:text-[10px] text-muted-foreground block">Upvotes</span>
            </div>
            <div className="text-center p-1.5 sm:p-2 rounded-lg bg-muted/50">
              <MessageCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5 mx-auto text-blue-500 mb-0.5 sm:mb-1" />
              <span className="text-[10px] sm:text-xs font-medium text-foreground">{quoraData.totalQuestions}</span>
              <span className="text-[9px] sm:text-[10px] text-muted-foreground block">Questions</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Keyword List
export function CommunityKeywordList({ 
  keywords, 
  platform 
}: { 
  keywords: CommunityKeyword[]
  platform: "reddit" | "quora"
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
      {keywords.map((keyword) => (
        <CommunityKeywordCard key={keyword.id} keyword={keyword} platform={platform} />
      ))}
    </div>
  )
}
