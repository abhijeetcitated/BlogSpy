"use client"

// ============================================
// INTENT COLUMN - Search intent display
// ============================================

import { cn } from "@/lib/utils"
import { Info, ShoppingCart, FileText, Navigation } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

type IntentType = "informational" | "commercial" | "transactional" | "navigational"

interface IntentColumnProps {
  intent: IntentType | IntentType[]
  showIcon?: boolean
  showLabel?: boolean
  className?: string
}

const intentConfig: Record<IntentType, { 
  label: string
  shortLabel: string
  icon: typeof Info
  color: string
  bgColor: string
}> = {
  informational: {
    label: "Informational",
    shortLabel: "I",
    icon: Info,
    color: "text-blue-600",
    bgColor: "bg-blue-500/10 border-blue-500/20",
  },
  commercial: {
    label: "Commercial",
    shortLabel: "C",
    icon: ShoppingCart,
    color: "text-purple-600",
    bgColor: "bg-purple-500/10 border-purple-500/20",
  },
  transactional: {
    label: "Transactional",
    shortLabel: "T",
    icon: FileText,
    color: "text-green-600",
    bgColor: "bg-green-500/10 border-green-500/20",
  },
  navigational: {
    label: "Navigational",
    shortLabel: "N",
    icon: Navigation,
    color: "text-orange-600",
    bgColor: "bg-orange-500/10 border-orange-500/20",
  },
}

export function IntentColumn({
  intent,
  showIcon = true,
  showLabel = false,
  className,
}: IntentColumnProps) {
  const intents = Array.isArray(intent) ? intent : [intent]

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {intents.map((i) => {
        const config = intentConfig[i]
        const Icon = config.icon

        return (
          <Tooltip key={i}>
            <TooltipTrigger asChild>
              <Badge
                variant="outline"
                className={cn(
                  "h-6 px-1.5 font-medium",
                  config.bgColor,
                  config.color
                )}
              >
                {showIcon && <Icon className="h-3 w-3 mr-0.5" />}
                {showLabel ? config.label : config.shortLabel}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>{config.label}</TooltipContent>
          </Tooltip>
        )
      })}
    </div>
  )
}
