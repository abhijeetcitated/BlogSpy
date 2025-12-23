/**
 * Credit Promo Input Component
 * Promo code input with validation
 */

"use client"

import { memo } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Tag, X, Loader2 } from "lucide-react"

interface CreditPromoInputProps {
  promoCode: string
  promoValid: boolean | null
  promoMessage: string
  isValidating: boolean
  isLoading: boolean
  onPromoChange: (code: string) => void
  onValidate: () => void
  onClear: () => void
}

export const CreditPromoInput = memo(function CreditPromoInput({
  promoCode,
  promoValid,
  promoMessage,
  isValidating,
  isLoading,
  onPromoChange,
  onValidate,
  onClear,
}: CreditPromoInputProps) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-muted-foreground">Promo Code</p>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={promoCode}
            onChange={(e) => onPromoChange(e.target.value.toUpperCase())}
            placeholder="Enter code"
            className="pl-9 pr-8 h-9 text-sm uppercase"
            disabled={isLoading}
          />
          {promoCode && (
            <button
              onClick={onClear}
              className="absolute right-3 top-1/2 -translate-y-1/2"
              type="button"
            >
              <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
            </button>
          )}
        </div>
        <Button
          onClick={onValidate}
          disabled={!promoCode || isValidating || isLoading}
          variant="outline"
          size="sm"
          className="h-9"
        >
          {isValidating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Apply"
          )}
        </Button>
      </div>
      {promoMessage && (
        <p className={cn(
          "text-xs",
          promoValid ? "text-emerald-500" : "text-destructive"
        )}>
          {promoMessage}
        </p>
      )}
    </div>
  )
})
