/**
 * Instagram Keyword Card Component
 */

"use client"

import { memo, useState, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { 
  Heart, 
  Bookmark,
  Hash,
  CheckCircle,
  Copy,
  Check
} from "lucide-react"
import { KeywordCardActionMenu } from "./KeywordCardActionMenu"
import { PositionBadge } from "./KeywordCardShared"
import { SOCIAL_INTENT_COLORS } from "../../constants"
import type { SocialKeyword } from "../../types"

interface InstagramKeywordCardProps {
  keyword: SocialKeyword
  onDelete?: (keywordId: string) => void
  onViewDetails?: (keyword: SocialKeyword) => void
}

export const InstagramKeywordCard = memo(function InstagramKeywordCard({ 
  keyword, 
  onDelete, 
  onViewDetails 
}: InstagramKeywordCardProps) {
  const [copiedKeyword, setCopiedKeyword] = useState(false)
  const [copiedHashtags, setCopiedHashtags] = useState(false)
  
  const intentConfig = SOCIAL_INTENT_COLORS[keyword.socialIntent]
  const data = keyword.platforms.instagram

  // Hooks must be called before any early returns
  const handleCopyKeyword = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(keyword.keyword)
      setCopiedKeyword(true)
      toast.success("Keyword copied!", { description: keyword.keyword })
      setTimeout(() => setCopiedKeyword(false), 2000)
    } catch {
      toast.error("Failed to copy")
    }
  }, [keyword.keyword])

  const handleCopyHashtags = useCallback(async () => {
    if (!data?.topHashtags?.length) return
    try {
      const hashtagsText = data.topHashtags.join(" ")
      await navigator.clipboard.writeText(hashtagsText)
      setCopiedHashtags(true)
      toast.success("Hashtags copied!", { description: hashtagsText })
      setTimeout(() => setCopiedHashtags(false), 2000)
    } catch {
      toast.error("Failed to copy")
    }
  }, [data])

  const handleCopySingleHashtag = useCallback(async (tag: string) => {
    try {
      await navigator.clipboard.writeText(tag)
      toast.success(`Copied: ${tag}`)
    } catch {
      toast.error("Failed to copy")
    }
  }, [])

  const handleViewDetails = useCallback(() => {
    onViewDetails?.(keyword)
  }, [keyword, onViewDetails])

  const handleDelete = useCallback(() => {
    onDelete?.(keyword.id)
  }, [keyword.id, onDelete])
  
  // Early return after all hooks
  if (!data) return null

  // Calculate total saves
  const totalSaves = data.topPosts.reduce((sum, post) => sum + post.saves, 0)

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
            <PositionBadge position={data.position} />
            <KeywordCardActionMenu
              copiedKeyword={copiedKeyword}
              copiedHashtags={copiedHashtags}
              showHashtagsOption={Boolean(data.topHashtags?.length)}
              onCopyKeyword={handleCopyKeyword}
              onCopyHashtags={handleCopyHashtags}
              onViewDetails={handleViewDetails}
              onDelete={handleDelete}
            />
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
            <span className="text-[10px] sm:text-xs font-medium text-foreground">{totalSaves}</span>
            <span className="text-[9px] sm:text-[10px] text-muted-foreground block">Saves</span>
          </div>
          <div className="text-center p-1.5 sm:p-2 rounded-lg bg-muted/50">
            <Hash className="w-3 h-3 sm:w-3.5 sm:h-3.5 mx-auto text-purple-500 mb-0.5 sm:mb-1" />
            <span className="text-[10px] sm:text-xs font-medium text-foreground">{data.topHashtags.length}</span>
            <span className="text-[9px] sm:text-[10px] text-muted-foreground block">Hashtags</span>
          </div>
        </div>

        {/* Hashtags */}
        {data.topHashtags.length > 0 && (
          <div className="flex flex-wrap gap-1 items-center">
            {data.topHashtags.slice(0, 4).map((tag) => (
              <button
                key={tag}
                onClick={() => handleCopySingleHashtag(tag)}
                className="text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded bg-pink-500/10 text-pink-500 hover:bg-pink-500/20 transition-colors cursor-pointer"
                title="Click to copy"
              >
                {tag}
              </button>
            ))}
            <button
              onClick={handleCopyHashtags}
              className="text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground hover:text-pink-500 hover:bg-pink-500/10 transition-colors flex items-center gap-0.5"
              title="Copy all hashtags"
            >
              {copiedHashtags ? <Check className="w-2.5 h-2.5" /> : <Copy className="w-2.5 h-2.5" />}
              Copy All
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  )
})
