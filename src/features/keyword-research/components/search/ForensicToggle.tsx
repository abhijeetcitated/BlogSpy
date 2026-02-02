"use client"

import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { HelpCircle } from "lucide-react"
import { cn } from "@/lib/utils"

export interface ForensicToggleProps {
  enabled: boolean
  onEnabledChange: (next: boolean) => void
  depth: "top5" | "top10"
  onDepthChange: (next: "top5" | "top10") => void
  className?: string
}

export const ForensicToggle = ({
  enabled,
  onEnabledChange,
  depth,
  onDepthChange,
  className,
}: ForensicToggleProps) => {
  return (
    <div
      className={cn(
        "flex w-full items-center justify-between sm:w-auto sm:justify-start sm:gap-4",
        className
      )}
    >
      {/* Left Group: Toggle, Label, Tooltip */}
      <div className="flex items-center gap-2">
        <Switch
          id="forensic-toggle"
          className="h-6 w-11 sm:h-5 sm:w-9 data-[state=checked]:bg-[#FFD700] data-[state=unchecked]:bg-muted transition-all shrink-0"
          checked={enabled}
          onCheckedChange={onEnabledChange}
        />
        <Label
          htmlFor="forensic-toggle"
          className="text-xs font-bold cursor-pointer whitespace-nowrap"
        >
          FORENSIC INTEL SCAN
        </Label>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-flex items-center justify-center h-5 w-5 rounded-full hover:bg-muted/50 p-1">
              <HelpCircle className="h-3.5 w-3.5 text-muted-foreground/60" />
            </span>
          </TooltipTrigger>
          <TooltipContent side="bottom" align="start" className="max-w-xs">
            <p className="text-xs text-muted-foreground">
              Forensic Intel Scan: Performs a fresh SERP scan to calculate GEO Score, RTV, and detect Weak Spots. Each keyword in the selection costs 1 Forensic Credit.
            </p>
          </TooltipContent>
        </Tooltip>
      </div>

      {/* Right Group: Dropdown */}
      {enabled && (
        <div className="flex-shrink-0 ml-auto sm:ml-0">
          <Select value={depth} onValueChange={onDepthChange}>
            <SelectTrigger className="h-9 w-[90px] sm:w-[110px] bg-muted/30 border-border/50">
              <SelectValue placeholder="Top 5" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="top5">Top 5</SelectItem>
              <SelectItem value="top10">Top 10</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  )
}
