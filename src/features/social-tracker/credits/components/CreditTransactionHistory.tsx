/**
 * ============================================
 * CREDIT TRANSACTION HISTORY
 * ============================================
 * 
 * Displays credit transaction history
 * with filtering and pagination
 * 
 * @version 1.0.0
 * @lastUpdated 2025-12-15
 */

"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { 
  History, 
  ArrowUpRight, 
  ArrowDownRight, 
  Gift, 
  RefreshCw,
  CreditCard,
  Tag,
  AlertCircle,
  ChevronDown,
} from "lucide-react"
import { formatPrice } from "../config/pricing.config"
import type { CreditTransaction, CreditTransactionType } from "../types/credit.types"

// ============================================
// TRANSACTION ICON & COLOR
// ============================================

const getTransactionIcon = (type: CreditTransactionType) => {
  switch (type) {
    case "purchase":
      return { icon: CreditCard, color: "text-emerald-500", bg: "bg-emerald-500/10" }
    case "usage":
      return { icon: ArrowDownRight, color: "text-red-400", bg: "bg-red-500/10" }
    case "bonus":
      return { icon: Gift, color: "text-amber-500", bg: "bg-amber-500/10" }
    case "referral":
      return { icon: ArrowUpRight, color: "text-blue-500", bg: "bg-blue-500/10" }
    case "promo":
      return { icon: Tag, color: "text-purple-500", bg: "bg-purple-500/10" }
    case "refund":
      return { icon: RefreshCw, color: "text-cyan-500", bg: "bg-cyan-500/10" }
    default:
      return { icon: AlertCircle, color: "text-muted-foreground", bg: "bg-muted" }
  }
}

const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return "Just now"
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  
  return date.toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
  })
}

// ============================================
// COMPONENT PROPS
// ============================================

interface CreditTransactionHistoryProps {
  transactions: CreditTransaction[]
  isLoading?: boolean
  hasMore?: boolean
  onLoadMore?: () => void
  maxHeight?: number
  className?: string
}

// ============================================
// MAIN COMPONENT
// ============================================

export function CreditTransactionHistory({
  transactions,
  isLoading = false,
  hasMore = false,
  onLoadMore,
  maxHeight = 400,
  className,
}: CreditTransactionHistoryProps) {
  // Loading skeleton
  if (isLoading && transactions.length === 0) {
    return (
      <Card className={cn("border-muted", className)}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <History className="h-4 w-4 text-muted-foreground" />
            Transaction History
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-lg" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
              <Skeleton className="h-5 w-16" />
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  // Empty state
  if (transactions.length === 0) {
    return (
      <Card className={cn("border-muted", className)}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <History className="h-4 w-4 text-muted-foreground" />
            Transaction History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center">
            <History className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No transactions yet</p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              Purchase credits to get started
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn("border-muted", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <History className="h-4 w-4 text-muted-foreground" />
            Transaction History
          </CardTitle>
          <Badge variant="secondary" className="text-[10px]">
            {transactions.length} transactions
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-y-auto pr-1" style={{ maxHeight }}>
          <div className="space-y-2 pr-2">
            {transactions.map((transaction) => {
              const { icon: Icon, color, bg } = getTransactionIcon(transaction.type)
              const isPositive = transaction.amount > 0

              return (
                <div
                  key={transaction.id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  {/* Icon */}
                  <div className={cn("p-2 rounded-lg", bg)}>
                    <Icon className={cn("h-4 w-4", color)} />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {transaction.description}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-muted-foreground">
                        {formatRelativeTime(transaction.createdAt)}
                      </span>
                      {transaction.metadata.platform && (
                        <Badge variant="outline" className="text-[9px] h-4">
                          {transaction.metadata.platform}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Amount */}
                  <div className="text-right">
                    <span className={cn(
                      "text-sm font-bold tabular-nums",
                      isPositive ? "text-emerald-500" : "text-red-400"
                    )}>
                      {isPositive ? "+" : ""}{transaction.amount}
                    </span>
                    <p className="text-[10px] text-muted-foreground">
                      Balance: {transaction.balance}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Load More */}
        {hasMore && (
          <div className="pt-3 border-t border-border mt-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={onLoadMore}
              disabled={isLoading}
              className="w-full text-xs gap-1"
            >
              {isLoading ? (
                <>Loading...</>
              ) : (
                <>
                  <ChevronDown className="h-3 w-3" />
                  Load More
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
