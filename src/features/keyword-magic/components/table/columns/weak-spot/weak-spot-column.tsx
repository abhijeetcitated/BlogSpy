"use client"

// ============================================
// WEAK SPOT COLUMN - Competitive weak spot indicator
// ============================================

import { cn } from "@/lib/utils"
import { Target, Zap, Shield, AlertTriangle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

type WeakSpotLevel = "high" | "medium" | "low" | "none"

interface WeakSpotColumnProps {
  level: WeakSpotLevel
  score?: number
  reasons?: string[]
  showIcon?: boolean
  className?: string
}

const weakSpotConfig: Record<WeakSpotLevel, {
  label: string
  description: string
  icon: typeof Target
  color: string
  bgColor: string
}> = {
  high: {
    label: "High",
    description: "Great opportunity - competitors are weak",
    icon: Target,
    color: "text-green-600",
    bgColor: "bg-green-500/10 border-green-500/20",
  },
  medium: {
    label: "Medium",
    description: "Some opportunity - moderate competition",
    icon: Zap,
    color: "text-yellow-600",
    bgColor: "bg-yellow-500/10 border-yellow-500/20",
  },
  low: {
    label: "Low",
    description: "Limited opportunity - strong competition",
    icon: Shield,
    color: "text-orange-600",
    bgColor: "bg-orange-500/10 border-orange-500/20",
  },
  none: {
    label: "None",
    description: "No weak spots detected",
    icon: AlertTriangle,
    color: "text-red-600",
    bgColor: "bg-red-500/10 border-red-500/20",
  },
}

export function WeakSpotColumn({
  level,
  score,
  reasons,
  showIcon = true,
  className,
}: WeakSpotColumnProps) {
  const config = weakSpotConfig[level]
  const Icon = config.icon

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge
          variant="outline"
          className={cn(
            "h-6 gap-1",
            config.bgColor,
            config.color,
            className
          )}
        >
          {showIcon && <Icon className="h-3 w-3" />}
          {config.label}
          {score !== undefined && (
            <span className="text-xs opacity-70">({score})</span>
          )}
        </Badge>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs">
        <p className="font-medium">{config.description}</p>
        {reasons && reasons.length > 0 && (
          <ul className="mt-1 text-xs text-muted-foreground list-disc list-inside">
            {reasons.map((reason, i) => (
              <li key={i}>{reason}</li>
            ))}
          </ul>
        )}
      </TooltipContent>
    </Tooltip>
  )
}
