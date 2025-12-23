"use client"

/**
 * Quora Keyword View Component
 * Quora-specific keyword card UI
 */

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { CheckCircle, Copy, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { useState } from "react"
import { KeywordActions } from "./KeywordActions"
import { QuoraStats } from "./PlatformStats"
import { COMMUNITY_INTENT_COLORS } from "../../constants"
import type { CommunityKeyword } from "../../types"

interface QuoraKeywordViewProps {
  keyword: CommunityKeyword
  onDelete?: (keywordId: string) => void
}

export function QuoraKeywordView({ keyword, onDelete }: QuoraKeywordViewProps) {
  const [copiedKeyword, setCopiedKeyword] = useState(false)
  const quoraData = keyword.platforms.quora
  const intentConfig = COMMUNITY_INTENT_COLORS[keyword.communityIntent]

  if (!quoraData) return null

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

  const handleOpenOnPlatform = () => {
    const query = encodeURIComponent(keyword.keyword)
    window.open(`https://www.quora.com/search?q=${query}`, "_blank")
  }

  const totalUpvotes = quoraData.topAnswers.reduce((s, a) => s + a.upvotes, 0)

  return (
    <Card className="bg-card border-border hover:border-red-500/30 transition-all group">
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-start justify-between mb-2.5 sm:mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
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
                  <TooltipContent><p>Click to copy keyword</p></TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <Badge variant="secondary" className={cn("text-[10px] font-medium border-0", intentConfig.bg, intentConfig.text)}>
                {intentConfig.label}
              </Badge>
              {quoraData.hasOurContent && (
                <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] border-0">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Our Answer
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">{keyword.searchVolume.toLocaleString()} monthly searches</p>
          </div>
          
          <div className="flex items-center gap-1 sm:gap-2 shrink-0 ml-1 sm:ml-2">
            <KeywordActions
              keyword={keyword.keyword}
              keywordId={keyword.id}
              platform="quora"
              onCopyKeyword={handleCopyKeyword}
              onCopyHashtag={handleCopyHashtag}
              onOpenPlatform={handleOpenOnPlatform}
              onDelete={onDelete}
            />

            {quoraData.position ? (
              <div className={cn(
                "w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center text-sm sm:text-base font-bold",
                quoraData.position <= 3 
                  ? "bg-linear-to-br from-red-500 to-rose-600 text-white shadow-lg shadow-red-500/25" 
                  : quoraData.position <= 10 
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20" 
                    : "bg-muted text-muted-foreground"
              )}>
                #{quoraData.position}
              </div>
            ) : (
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground text-sm">—</div>
            )}
          </div>
        </div>

        <QuoraStats
          avgViews={quoraData.avgViews}
          totalUpvotes={totalUpvotes}
          totalQuestions={quoraData.totalQuestions}
        />
      </CardContent>
    </Card>
  )
}
