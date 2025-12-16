// ============================================
// CONTENT DECAY - Recovered Section Component
// ============================================

import { CheckCircle2, TrendingUp } from "lucide-react"
import type { RecoveredArticle } from "../types"

interface RecoveredSectionProps {
  articles: RecoveredArticle[]
}

export function RecoveredSection({ articles }: RecoveredSectionProps) {
  return (
    <div className="p-3 sm:p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 to-emerald-500/5 dark:from-emerald-950/30 dark:to-emerald-950/10 border border-emerald-500/20 dark:border-emerald-900/30 overflow-hidden">
      <div className="flex items-center gap-2 mb-2 sm:mb-3">
        <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
        <h2 className="font-semibold text-sm sm:text-base text-emerald-600 dark:text-emerald-400">Recently Revived</h2>
      </div>
      {/* Grid layout for better tablet/desktop distribution */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
        {articles.map((article) => (
          <div key={article.id} className="flex items-center gap-2 min-w-0">
            <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <span className="text-foreground text-xs sm:text-sm truncate flex-1 min-w-0">{article.title}</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-medium text-xs sm:text-sm shrink-0">
              {article.trafficGain}
            </span>
            <span className="text-muted-foreground text-[10px] sm:text-xs shrink-0">
              {article.daysAgo}d ago
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
