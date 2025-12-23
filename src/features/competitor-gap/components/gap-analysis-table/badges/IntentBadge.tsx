"use client"

import { cn } from "@/lib/utils"
import { INTENT_CONFIG, INTENT_ICONS } from "../constants/intent-config"
import type { Intent } from "../../../types"

interface IntentBadgeProps {
  intent: Intent
}

export function IntentBadge({ intent }: IntentBadgeProps) {
  const config = INTENT_CONFIG[intent]
  const Icon = INTENT_ICONS[intent]
  
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border",
      config.bg, config.text, config.border
    )}>
      <Icon className="w-3 h-3" />
      <span>{config.label}</span>
    </span>
  )
}
