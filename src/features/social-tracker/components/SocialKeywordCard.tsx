"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { 
  Heart, 
  Repeat, 
  Eye,
  Bookmark,
  MessageCircle,
  CheckCircle,
  TrendingUp,
  Hash,
  Trash2,
  MoreVertical,
  ExternalLink,
  Copy,
  Check
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SOCIAL_INTENT_COLORS } from "../constants"
import type { SocialKeyword, SocialPlatform } from "../types"

interface SocialKeywordCardProps {
  keyword: SocialKeyword
  platform: SocialPlatform
  onDelete?: (keywordId: string) => void
  onViewDetails?: (keyword: SocialKeyword) => void
}

export function SocialKeywordCard({ keyword, platform, onDelete, onViewDetails }: SocialKeywordCardProps) {
  const [copiedKeyword, setCopiedKeyword] = useState(false)
  const [copiedHashtags, setCopiedHashtags] = useState(false)
  
  const intentConfig = SOCIAL_INTENT_COLORS[keyword.socialIntent]
  const platformData = keyword.platforms[platform]
  
  if (!platformData) {
    return null
  }

  // Copy keyword to clipboard
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

  // Copy hashtags to clipboard (for Instagram)
  const handleCopyHashtags = async () => {
    if (platform === "instagram" && keyword.platforms.instagram?.topHashtags) {
      try {
        const hashtagsText = keyword.platforms.instagram.topHashtags.join(" ")
        await navigator.clipboard.writeText(hashtagsText)
        setCopiedHashtags(true)
        toast.success("Hashtags copied!", { description: hashtagsText })
        setTimeout(() => setCopiedHashtags(false), 2000)
      } catch {
        toast.error("Failed to copy")
      }
    }
  }

  const ActionMenu = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleCopyKeyword}>
          {copiedKeyword ? <Check className="h-4 w-4 mr-2 text-emerald-500" /> : <Copy className="h-4 w-4 mr-2" />}
          Copy Keyword
        </DropdownMenuItem>
        {platform === "instagram" && keyword.platforms.instagram?.topHashtags && (
          <DropdownMenuItem onClick={handleCopyHashtags}>
            {copiedHashtags ? <Check className="h-4 w-4 mr-2 text-emerald-500" /> : <Hash className="h-4 w-4 mr-2" />}
            Copy Hashtags
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => onViewDetails?.(keyword)}>
          <ExternalLink className="h-4 w-4 mr-2" />
          View Details
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => onDelete?.(keyword.id)}
          className="text-red-500 focus:text-red-500"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )

  const getPositionBadge = (position: number | null) => {
    if (!position) return null
    return (
      <div className={cn(
        "w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center text-sm sm:text-lg font-bold",
        position <= 3 ? "bg-amber-500/20 text-amber-500" :
        position <= 10 ? "bg-emerald-500/20 text-emerald-500" :
        "bg-muted text-muted-foreground"
      )}>
        #{position}
      </div>
    )
  }

  // Pinterest View
  if (platform === "pinterest") {
    const data = keyword.platforms.pinterest!
    return (
      <Card className="bg-card border-border hover:border-red-500/30 transition-all group">
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-start justify-between mb-2 sm:mb-3 gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2 mb-1 flex-wrap">
                <button 
                  onClick={handleCopyKeyword}
                  className="font-semibold text-foreground text-sm sm:text-base truncate hover:text-red-500 transition-colors flex items-center gap-1 group/copy"
                  title="Click to copy keyword"
                >
                  {keyword.keyword}
                  <Copy className="w-3 h-3 opacity-0 group-hover/copy:opacity-50 transition-opacity" />
                </button>
                <Badge className={cn(intentConfig.bg, intentConfig.text, "text-[9px] sm:text-[10px]")}>
                  {intentConfig.label}
                </Badge>
                {data.hasOurContent && (
                  <Badge className="bg-emerald-500/20 text-emerald-500 text-[9px] sm:text-[10px]">
                    <CheckCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 sm:mr-1" />
                    Our Pin
                  </Badge>
                )}
              </div>
              <p className="text-[10px] sm:text-xs text-muted-foreground">
                {keyword.searchVolume.toLocaleString()} monthly searches
              </p>
            </div>
            <div className="flex items-center gap-1">
              {getPositionBadge(data.position)}
              <ActionMenu />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-1.5 sm:gap-2 mb-2 sm:mb-3">
            <div className="text-center p-1.5 sm:p-2 rounded-lg bg-muted/50">
              <Repeat className="w-3 h-3 sm:w-3.5 sm:h-3.5 mx-auto text-red-500 mb-0.5 sm:mb-1" />
              <span className="text-[10px] sm:text-xs font-medium text-foreground">{data.avgRepins}</span>
              <span className="text-[9px] sm:text-[10px] text-muted-foreground block">Avg Repins</span>
            </div>
            <div className="text-center p-1.5 sm:p-2 rounded-lg bg-muted/50">
              <Eye className="w-3 h-3 sm:w-3.5 sm:h-3.5 mx-auto text-purple-500 mb-0.5 sm:mb-1" />
              <span className="text-[10px] sm:text-xs font-medium text-foreground">{data.totalPins}</span>
              <span className="text-[9px] sm:text-[10px] text-muted-foreground block">Total Pins</span>
            </div>
            <div className="text-center p-1.5 sm:p-2 rounded-lg bg-muted/50">
              <Bookmark className="w-3 h-3 sm:w-3.5 sm:h-3.5 mx-auto text-amber-500 mb-0.5 sm:mb-1" />
              <span className="text-[10px] sm:text-xs font-medium text-foreground">{data.topBoards.length}</span>
              <span className="text-[9px] sm:text-[10px] text-muted-foreground block">Boards</span>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Twitter View
  if (platform === "twitter") {
    const data = keyword.platforms.twitter!
    return (
      <Card className="bg-card border-border hover:border-blue-500/30 transition-all group">
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-start justify-between mb-2 sm:mb-3 gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2 mb-1 flex-wrap">
                <button 
                  onClick={handleCopyKeyword}
                  className="font-semibold text-foreground text-sm sm:text-base truncate hover:text-blue-500 transition-colors flex items-center gap-1 group/copy"
                  title="Click to copy keyword"
                >
                  {keyword.keyword}
                  <Copy className="w-3 h-3 opacity-0 group-hover/copy:opacity-50 transition-opacity" />
                </button>
                <Badge className={cn(intentConfig.bg, intentConfig.text, "text-[9px] sm:text-[10px]")}>
                  {intentConfig.label}
                </Badge>
                {data.trending && (
                  <Badge className="bg-blue-500/20 text-blue-500 text-[9px] sm:text-[10px]">
                    <TrendingUp className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 sm:mr-1" />
                    Trending
                  </Badge>
                )}
              </div>
              <p className="text-[10px] sm:text-xs text-muted-foreground">
                {keyword.searchVolume.toLocaleString()} monthly searches
              </p>
            </div>
            <div className="flex items-center gap-1">
              {getPositionBadge(data.position)}
              <ActionMenu />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-1.5 sm:gap-2 mb-2 sm:mb-3">
            <div className="text-center p-1.5 sm:p-2 rounded-lg bg-muted/50">
              <Heart className="w-3 h-3 sm:w-3.5 sm:h-3.5 mx-auto text-red-500 mb-0.5 sm:mb-1" />
              <span className="text-[10px] sm:text-xs font-medium text-foreground">{data.avgEngagement}</span>
              <span className="text-[9px] sm:text-[10px] text-muted-foreground block">Avg Likes</span>
            </div>
            <div className="text-center p-1.5 sm:p-2 rounded-lg bg-muted/50">
              <Repeat className="w-3 h-3 sm:w-3.5 sm:h-3.5 mx-auto text-emerald-500 mb-0.5 sm:mb-1" />
              <span className="text-[10px] sm:text-xs font-medium text-foreground">{data.totalTweets}</span>
              <span className="text-[9px] sm:text-[10px] text-muted-foreground block">Reposts</span>
            </div>
            <div className="text-center p-1.5 sm:p-2 rounded-lg bg-muted/50">
              <MessageCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5 mx-auto text-blue-500 mb-0.5 sm:mb-1" />
              <span className="text-[10px] sm:text-xs font-medium text-foreground">
                {data.topTweets.reduce((s, t) => s + t.replies, 0)}
              </span>
              <span className="text-[9px] sm:text-[10px] text-muted-foreground block">Replies</span>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Instagram View
  const data = keyword.platforms.instagram!
  return (
    <Card className="bg-card border-border hover:border-pink-500/30 transition-all group">
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-start justify-between mb-2 sm:mb-3 gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2 mb-1 flex-wrap">
              <button 
                onClick={handleCopyKeyword}
                className="font-semibold text-foreground text-sm sm:text-base truncate hover:text-pink-500 transition-colors flex items-center gap-1 group/copy"
                title="Click to copy keyword"
              >
                {keyword.keyword}
                <Copy className="w-3 h-3 opacity-0 group-hover/copy:opacity-50 transition-opacity" />
              </button>
              <Badge className={cn(intentConfig.bg, intentConfig.text, "text-[9px] sm:text-[10px]")}>
                {intentConfig.label}
              </Badge>
              {data.hasOurContent && (
                <Badge className="bg-emerald-500/20 text-emerald-500 text-[9px] sm:text-[10px]">
                  <CheckCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 sm:mr-1" />
                  Our Post
                </Badge>
              )}
            </div>
            <p className="text-[10px] sm:text-xs text-muted-foreground">
              {keyword.searchVolume.toLocaleString()} monthly searches
            </p>
          </div>
          <div className="flex items-center gap-1">
            {getPositionBadge(data.position)}
            <ActionMenu />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-1.5 sm:gap-2 mb-2 sm:mb-3">
          <div className="text-center p-1.5 sm:p-2 rounded-lg bg-muted/50">
            <Heart className="w-3 h-3 sm:w-3.5 sm:h-3.5 mx-auto text-pink-500 mb-0.5 sm:mb-1" />
            <span className="text-[10px] sm:text-xs font-medium text-foreground">{data.avgEngagement}</span>
            <span className="text-[9px] sm:text-[10px] text-muted-foreground block">Avg Likes</span>
          </div>
          <div className="text-center p-1.5 sm:p-2 rounded-lg bg-muted/50">
            <Bookmark className="w-3 h-3 sm:w-3.5 sm:h-3.5 mx-auto text-amber-500 mb-0.5 sm:mb-1" />
            <span className="text-[10px] sm:text-xs font-medium text-foreground">
              {data.topPosts.reduce((s, p) => s + p.saves, 0)}
            </span>
            <span className="text-[9px] sm:text-[10px] text-muted-foreground block">Saves</span>
          </div>
          <div className="text-center p-1.5 sm:p-2 rounded-lg bg-muted/50">
            <Hash className="w-3 h-3 sm:w-3.5 sm:h-3.5 mx-auto text-purple-500 mb-0.5 sm:mb-1" />
            <span className="text-[10px] sm:text-xs font-medium text-foreground">{data.topHashtags.length}</span>
            <span className="text-[9px] sm:text-[10px] text-muted-foreground block">Hashtags</span>
          </div>
        </div>

        {/* Hashtags */}
        <div className="flex flex-wrap gap-1 items-center">
          {data.topHashtags.slice(0, 4).map((tag) => (
            <button
              key={tag}
              onClick={() => {
                navigator.clipboard.writeText(tag)
                toast.success(`Copied: ${tag}`)
              }}
              className="text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded bg-pink-500/10 text-pink-500 hover:bg-pink-500/20 transition-colors cursor-pointer"
              title="Click to copy"
            >
              {tag}
            </button>
          ))}
          {data.topHashtags.length > 0 && (
            <button
              onClick={handleCopyHashtags}
              className="text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground hover:text-pink-500 hover:bg-pink-500/10 transition-colors flex items-center gap-0.5"
              title="Copy all hashtags"
            >
              {copiedHashtags ? <Check className="w-2.5 h-2.5" /> : <Copy className="w-2.5 h-2.5" />}
              Copy All
            </button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Keyword List
export function SocialKeywordList({ 
  keywords, 
  platform,
  onDelete,
  onViewDetails,
}: { 
  keywords: SocialKeyword[]
  platform: SocialPlatform
  onDelete?: (keywordId: string) => void
  onViewDetails?: (keyword: SocialKeyword) => void
}) {
  const filteredKeywords = keywords.filter(k => k.platforms[platform])
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
      {filteredKeywords.map((keyword) => (
        <SocialKeywordCard 
          key={keyword.id} 
          keyword={keyword} 
          platform={platform}
          onDelete={onDelete}
          onViewDetails={onViewDetails}
        />
      ))}
    </div>
  )
}
