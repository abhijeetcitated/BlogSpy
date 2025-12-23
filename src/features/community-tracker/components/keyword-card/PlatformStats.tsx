/**
 * Platform Stats Component
 * Displays statistics for Reddit or Quora keywords
 */

import { ArrowUp, MessageCircle, Eye, Users } from "lucide-react"

interface RedditStatsProps {
  avgUpvotes: number
  totalMentions: number
  subredditCount: number
}

interface QuoraStatsProps {
  avgViews: number
  totalUpvotes: number
  totalQuestions: number
}

export function RedditStats({ avgUpvotes, totalMentions, subredditCount }: RedditStatsProps) {
  return (
    <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
      <div className="text-center p-1.5 sm:p-2 rounded-lg bg-muted/50">
        <ArrowUp className="w-3 h-3 sm:w-3.5 sm:h-3.5 mx-auto text-orange-500 mb-0.5 sm:mb-1" />
        <span className="text-[10px] sm:text-xs font-medium text-foreground">{avgUpvotes}</span>
        <span className="text-[9px] sm:text-[10px] text-muted-foreground block">Upvotes</span>
      </div>
      <div className="text-center p-1.5 sm:p-2 rounded-lg bg-muted/50">
        <MessageCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5 mx-auto text-blue-500 mb-0.5 sm:mb-1" />
        <span className="text-[10px] sm:text-xs font-medium text-foreground">{totalMentions}</span>
        <span className="text-[9px] sm:text-[10px] text-muted-foreground block">Mentions</span>
      </div>
      <div className="text-center p-1.5 sm:p-2 rounded-lg bg-muted/50">
        <Users className="w-3 h-3 sm:w-3.5 sm:h-3.5 mx-auto text-purple-500 mb-0.5 sm:mb-1" />
        <span className="text-[10px] sm:text-xs font-medium text-foreground">{subredditCount}</span>
        <span className="text-[9px] sm:text-[10px] text-muted-foreground block">Subreddits</span>
      </div>
    </div>
  )
}

export function QuoraStats({ avgViews, totalUpvotes, totalQuestions }: QuoraStatsProps) {
  return (
    <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
      <div className="text-center p-1.5 sm:p-2 rounded-lg bg-muted/50">
        <Eye className="w-3 h-3 sm:w-3.5 sm:h-3.5 mx-auto text-purple-500 mb-0.5 sm:mb-1" />
        <span className="text-[10px] sm:text-xs font-medium text-foreground">
          {(avgViews / 1000).toFixed(0)}K
        </span>
        <span className="text-[9px] sm:text-[10px] text-muted-foreground block">Views</span>
      </div>
      <div className="text-center p-1.5 sm:p-2 rounded-lg bg-muted/50">
        <ArrowUp className="w-3 h-3 sm:w-3.5 sm:h-3.5 mx-auto text-red-500 mb-0.5 sm:mb-1" />
        <span className="text-[10px] sm:text-xs font-medium text-foreground">{totalUpvotes}</span>
        <span className="text-[9px] sm:text-[10px] text-muted-foreground block">Upvotes</span>
      </div>
      <div className="text-center p-1.5 sm:p-2 rounded-lg bg-muted/50">
        <MessageCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5 mx-auto text-blue-500 mb-0.5 sm:mb-1" />
        <span className="text-[10px] sm:text-xs font-medium text-foreground">{totalQuestions}</span>
        <span className="text-[9px] sm:text-[10px] text-muted-foreground block">Questions</span>
      </div>
    </div>
  )
}
