"use client"

import { cn } from "@/lib/utils"
import { type AIEntity, getEntityTypeLabel } from "@/types/ai-overview.types"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { CheckCircle } from "lucide-react"

// ============================================
// ENTITY CHIP
// ============================================

export interface EntityChipProps {
  entity: AIEntity
  className?: string
}

export function EntityChip({ entity, className }: EntityChipProps) {
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={cn(
            "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
            entity.isFromYourContent
              ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
              : "bg-muted text-foreground/80 border border-border",
            className
          )}>
            {entity.isFromYourContent && <CheckCircle className="h-3 w-3" />}
            {entity.name}
            <span className="text-[10px] opacity-70">×{entity.frequency}</span>
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-xs">
            <p className="font-medium">{entity.name}</p>
            <p className="text-muted-foreground">Type: {getEntityTypeLabel(entity.type)}</p>
            <p className="text-muted-foreground">Mentioned {entity.frequency}× in AI Overview</p>
            {entity.isFromYourContent ? (
              <p className="text-emerald-400">✓ Present in your content</p>
            ) : (
              <p className="text-amber-400">⚠️ Missing from your content</p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
