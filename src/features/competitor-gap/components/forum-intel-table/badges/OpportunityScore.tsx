"use client"

import { Star } from "lucide-react"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

interface OpportunityScoreProps {
  score: number
}

export function OpportunityScore({ score }: OpportunityScoreProps) {
  const starCount = Math.ceil(score / 20)
  
  const getConfig = () => {
    if (score >= 80) return { 
      color: "text-emerald-600 dark:text-emerald-400", 
      label: "Excellent",
      bg: "bg-emerald-500/10 dark:bg-emerald-500/15",
      border: "border-emerald-500/30"
    }
    if (score >= 60) return { 
      color: "text-green-600 dark:text-green-400", 
      label: "Good",
      bg: "bg-green-500/10 dark:bg-green-500/15",
      border: "border-green-500/30"
    }
    if (score >= 40) return { 
      color: "text-yellow-600 dark:text-yellow-400", 
      label: "Fair",
      bg: "bg-yellow-500/10 dark:bg-yellow-500/15",
      border: "border-yellow-500/30"
    }
    return { 
      color: "text-red-600 dark:text-red-400", 
      label: "Low",
      bg: "bg-red-500/10 dark:bg-red-500/15",
      border: "border-red-500/30"
    }
  }
  const config = getConfig()

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className={cn(
          "flex flex-col items-center gap-1 px-3 py-2 rounded-lg border cursor-default",
          config.bg, config.border
        )}>
          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={cn(
                  "w-3.5 h-3.5 transition-all",
                  star <= starCount
                    ? "text-amber-500 fill-amber-500"
                    : "text-muted-foreground/30"
                )}
              />
            ))}
          </div>
          <span className={cn("text-xs font-bold tabular-nums", config.color)}>
            {score}/100
          </span>
        </div>
      </TooltipTrigger>
      <TooltipContent className="text-xs">
        {config.label} opportunity
      </TooltipContent>
    </Tooltip>
  )
}
