/**
 * ============================================
 * CREDIT BALANCE WIDGET
 * ============================================
 * 
 * Compact credit balance display component
 * For use in headers, sidebars, and cards
 * 
 * @version 1.0.0
 * @lastUpdated 2025-12-15
 */

"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { Zap, TrendingUp, Plus, ChevronDown } from "lucide-react"
import { formatPrice } from "../config/pricing.config"
import type { CreditBalance } from "../types/credit.types"

interface CreditBalanceWidgetProps {
  balance: CreditBalance | null
  isLoading?: boolean
  onBuyCredits?: () => void
  variant?: "default" | "compact" | "badge"
  showBuyButton?: boolean
  className?: string
}

export function CreditBalanceWidget({
  balance,
  isLoading = false,
  onBuyCredits,
  variant = "default",
  showBuyButton = true,
  className,
}: CreditBalanceWidgetProps) {
  const [isOpen, setIsOpen] = useState(false)

  const availableCredits = balance?.availableCredits || 0
  const bonusCredits = balance?.bonusCredits || 0
  const usedCredits = balance?.usedCredits || 0
  const totalCredits = balance?.totalCredits || 0

  // Compact badge variant
  if (variant === "badge") {
    return (
      <Badge
        variant="secondary"
        className={cn(
          "gap-1.5 cursor-pointer hover:bg-muted transition-colors",
          availableCredits < 10 && "bg-amber-500/20 text-amber-500 hover:bg-amber-500/30",
          className
        )}
        onClick={onBuyCredits}
      >
        <Zap className="h-3 w-3" />
        {isLoading ? "..." : availableCredits.toLocaleString("en-IN")}
        {showBuyButton && <Plus className="h-3 w-3 ml-1" />}
      </Badge>
    )
  }

  // Compact inline variant
  if (variant === "compact") {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <div className="flex items-center gap-1 text-sm">
          <Zap className="h-4 w-4 text-pink-500" />
          <span className="font-medium text-foreground">
            {isLoading ? "..." : availableCredits.toLocaleString("en-IN")}
          </span>
          <span className="text-muted-foreground text-xs">credits</span>
        </div>
        {showBuyButton && onBuyCredits && (
          <Button
            onClick={onBuyCredits}
            size="sm"
            variant="outline"
            className="h-7 text-xs gap-1"
          >
            <Plus className="h-3 w-3" />
            Buy
          </Button>
        )}
      </div>
    )
  }

  // Default popover variant
  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "gap-2 h-9",
            availableCredits < 10 && "border-amber-500/50 text-amber-500",
            className
          )}
        >
          <Zap className="h-4 w-4 text-pink-500" />
          <span className="font-medium">
            {isLoading ? "..." : availableCredits.toLocaleString("en-IN")}
          </span>
          <span className="text-muted-foreground text-xs hidden sm:inline">credits</span>
          <ChevronDown className="h-3 w-3 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3" align="end">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-pink-500/10">
                <Zap className="h-4 w-4 text-pink-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Credit Balance</p>
                <p className="text-[10px] text-muted-foreground">Social Tracker</p>
              </div>
            </div>
          </div>

          {/* Balance Details */}
          <div className="space-y-2 p-2 rounded-lg bg-muted/50">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Available</span>
              <span className="font-bold text-foreground">
                {availableCredits.toLocaleString("en-IN")}
              </span>
            </div>
            {bonusCredits > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Bonus</span>
                <span className="font-medium text-emerald-500">
                  +{bonusCredits.toLocaleString("en-IN")}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between text-sm pt-1 border-t border-border">
              <span className="text-muted-foreground">Used</span>
              <span className="text-muted-foreground">
                {usedCredits.toLocaleString("en-IN")}
              </span>
            </div>
          </div>

          {/* Low Balance Warning */}
          {availableCredits < 10 && (
            <div className="flex items-center gap-2 p-2 rounded-lg bg-amber-500/10 text-xs">
              <TrendingUp className="h-3.5 w-3.5 text-amber-500" />
              <span className="text-amber-500">Low balance! Buy credits to continue tracking.</span>
            </div>
          )}

          {/* Buy Button */}
          {showBuyButton && onBuyCredits && (
            <Button
              onClick={() => {
                setIsOpen(false)
                onBuyCredits()
              }}
              className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white"
              size="sm"
            >
              <Plus className="h-4 w-4 mr-1" />
              Buy More Credits
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
