"use client"

import { Button } from "@/components/ui/button"
import { SparklesIcon } from "@/components/icons/platform-icons"

interface EmptyStateProps {
  onGenerate: () => void
}

export function EmptyState({ onGenerate }: EmptyStateProps) {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center p-4 sm:p-6 md:p-8">
      <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full bg-linear-to-br from-violet-100 to-violet-50 dark:from-violet-500/20 dark:to-violet-500/10 flex items-center justify-center mb-4 sm:mb-5 md:mb-6">
        <svg viewBox="0 0 24 24" className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 fill-violet-600 dark:fill-violet-400">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm0-14c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
        </svg>
      </div>
      
      <h3 className="text-lg sm:text-xl font-semibold text-zinc-900 dark:text-white mb-2 sm:mb-3">
        Generate Topic Clusters
      </h3>
      
      <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 max-w-xs sm:max-w-sm mb-4 sm:mb-5 md:mb-6">
        Discover content cluster opportunities with our AI-powered knowledge graph. 
        Visualize keyword relationships and find content gaps.
      </p>
      
      <Button
        onClick={onGenerate}
        className="h-10 sm:h-11 px-4 sm:px-6 bg-violet-600 hover:bg-violet-700 dark:bg-violet-600 dark:hover:bg-violet-500 text-white shadow-lg shadow-violet-500/25 transition-all hover:shadow-violet-500/40 text-sm"
      >
        <SparklesIcon className="h-4 w-4 mr-2" />
        Generate Strategy
      </Button>
      
      <div className="mt-6 sm:mt-8 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-[10px] sm:text-xs text-zinc-500 dark:text-zinc-400">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-500" />
          <span>Easy</span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-amber-500" />
          <span>Medium</span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-red-500" />
          <span>Hard</span>
        </div>
      </div>
    </div>
  )
}
