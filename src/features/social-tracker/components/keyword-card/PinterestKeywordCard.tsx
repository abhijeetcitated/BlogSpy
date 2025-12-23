/**
 * Pinterest Keyword Card Component
 */

"use client"

import { memo, useState, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { 
  Repeat, 
  Eye,
  Bookmark,
  CheckCircle,
  Copy
} from "lucide-react"
import { KeywordCardActionMenu } from "./KeywordCardActionMenu"
import { PositionBadge } from "./KeywordCardShared"
import { SOCIAL_INTENT_COLORS } from "../../constants"
import type { SocialKeyword } from "../../types"

interface PinterestKeywordCardProps {
  keyword: SocialKeyword
  onDelete?: (keywordId: string) => void
  onViewDetails?: (keyword: SocialKeyword) => void
}

export const PinterestKeywordCard = memo(function PinterestKeywordCard({ 
  keyword, 
  onDelete, 
  onViewDetails 
}: PinterestKeywordCardProps) {
  const [copiedKeyword, setCopiedKeyword] = useState(false)
  
  const intentConfig = SOCIAL_INTENT_COLORS[keyword.socialIntent]
  const data = keyword.platforms.pinterest
  
  if (!data) return null

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

  const handleViewDetails = useCallback(() => {
    onViewDetails?.(keyword)
  }, [keyword, onViewDetails])

  const handleDelete = useCallback(() => {
    onDelete?.(keyword.id)
  }, [keyword.id, onDelete])

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
            <PositionBadge position={data.position} />
            <KeywordCardActionMenu
              copiedKeyword={copiedKeyword}
              copiedHashtags={false}
              showHashtagsOption={false}
              onCopyKeyword={handleCopyKeyword}
              onCopyHashtags={() => {}}
              onViewDetails={handleViewDetails}
              onDelete={handleDelete}
            />
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
})
