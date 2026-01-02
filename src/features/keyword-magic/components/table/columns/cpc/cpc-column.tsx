"use client"

// ============================================
// CPC COLUMN - Cost per click display
// ============================================

import { cn } from "@/lib/utils"
import { DollarSign } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface CpcColumnProps {
  cpc: number
  currency?: string
  showIcon?: boolean
  className?: string
}

const getCpcLevel = (cpc: number): { label: string; color: string } => {
  if (cpc <= 0.5) return { label: "Low", color: "text-green-600" }
  if (cpc <= 2) return { label: "Medium", color: "text-yellow-600" }
  if (cpc <= 5) return { label: "High", color: "text-orange-600" }
  return { label: "Very High", color: "text-red-600" }
}

export function CpcColumn({
  cpc,
  currency = "$",
  showIcon = false,
  className,
}: CpcColumnProps) {
  const { label, color } = getCpcLevel(cpc)

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className={cn("flex items-center gap-1", className)}>
          {showIcon && <DollarSign className="h-3 w-3 text-muted-foreground" />}
          <span className={cn("font-medium tabular-nums", color)}>
            {currency}{cpc.toFixed(2)}
          </span>
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <p>Cost Per Click: {currency}{cpc.toFixed(2)}</p>
        <p className="text-muted-foreground">{label} competition</p>
      </TooltipContent>
    </Tooltip>
  )
}
