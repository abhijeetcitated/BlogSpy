// ============================================
// KEYWORD DETAILS DRAWER - Commerce Tab (Robust)
// ============================================
// Displays commerce/e-commerce opportunities for the keyword
// Features:
// - State machine: idle → loading → success/error
// - Server action integration with error handling
// - Retry functionality
// - Credit-based loading UI
// ============================================

"use client"

import * as React from "react"
import { 
  ShoppingCart, 
  DollarSign, 
  Package, 
  Star, 
  Loader2, 
  RefreshCw,
  AlertTriangle,
  Lock,
  Zap
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

import type { Keyword, AmazonData, AmazonProduct, DrawerDataState } from "../../types"
import { generateMockCommerceOpportunity } from "@/lib/commerce-opportunity-calculator"
import { fetchAmazonData } from "../../actions/fetch-drawer-data"

// ============================================
// TYPES
// ============================================

interface CommerceTabProps {
  keyword: Keyword
}

// ============================================
// SUB-COMPONENTS
// ============================================

/** Locked state - prompts user to load Amazon data */
function LockedState({ 
  onLoad, 
  isLoading 
}: { 
  onLoad: () => void
  isLoading: boolean 
}) {
  return (
    <Card className="relative overflow-hidden bg-linear-to-br from-orange-500/5 to-yellow-500/5 border-orange-500/20">
      {/* Blur overlay */}
      <div className="absolute inset-0 backdrop-blur-[2px] bg-background/30 z-10" />
      
      <CardContent className="relative z-20 p-8 text-center">
        <div className="h-16 w-16 rounded-full bg-orange-500/10 flex items-center justify-center mx-auto mb-4">
          <Lock className="h-8 w-8 text-orange-500" />
        </div>
        <CardTitle className="text-lg mb-2">Amazon Product Data</CardTitle>
        <CardDescription className="mb-6 max-w-xs mx-auto">
          Load real-time Amazon product data to discover affiliate opportunities and product gaps.
        </CardDescription>
        <Button
          onClick={onLoad}
          disabled={isLoading}
          size="lg"
          className="bg-linear-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4" />
              Load Amazon Data
              <Badge variant="secondary" className="ml-2 bg-white/20 text-white text-xs">
                <Zap className="h-3 w-3 mr-1" />1 Credit
              </Badge>
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}

/** Loading skeleton */
function LoadingState() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-48 w-full" />
    </div>
  )
}

/** Error state with retry */
function ErrorState({ 
  error, 
  isRetryable, 
  onRetry 
}: { 
  error: string
  isRetryable: boolean
  onRetry: () => void 
}) {
  return (
    <Alert variant="destructive" className="border-red-500/50 bg-red-500/5">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Failed to load Amazon data</AlertTitle>
      <AlertDescription className="mt-2">
        <p className="text-sm mb-3">{error}</p>
        {isRetryable && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="gap-2 border-red-500/30 hover:bg-red-500/10"
          >
            <RefreshCw className="h-3 w-3" />
            Try Again
          </Button>
        )}
      </AlertDescription>
    </Alert>
  )
}

/** Product card component */
function ProductCard({ product }: { product: AmazonProduct }) {
  const getAffiliateBadge = (potential: string) => {
    switch (potential) {
      case "high": return { color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20", label: "High" }
      case "medium": return { color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20", label: "Medium" }
      default: return { color: "bg-muted text-muted-foreground", label: "Low" }
    }
  }

  const badge = getAffiliateBadge(product.affiliatePotential)

  return (
    <div className="p-3 rounded-lg bg-muted/30 border border-border/50 space-y-2 hover:bg-muted/50 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <span className="text-sm font-medium line-clamp-2 flex-1">
          {product.title}
        </span>
        <Badge variant="outline" className={cn("shrink-0 text-xs", badge.color)}>
          {badge.label}
        </Badge>
      </div>
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span className="text-emerald-500 font-semibold">
          ${product.price.toFixed(2)}
        </span>
        <span className="flex items-center gap-1">
          <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
          {product.rating.toFixed(1)}
        </span>
        <span>{product.reviews.toLocaleString()} reviews</span>
        {product.isPrime && (
          <Badge variant="secondary" className="text-[10px] bg-blue-500/10 text-blue-500">
            Prime
          </Badge>
        )}
      </div>
    </div>
  )
}

// ============================================
// MAIN COMPONENT
// ============================================

export function CommerceTab({ keyword }: CommerceTabProps) {
  // ─────────────────────────────────────────
  // STATE MACHINE
  // ─────────────────────────────────────────
  const [state, setState] = React.useState<DrawerDataState>("idle")
  const [amazonData, setAmazonData] = React.useState<AmazonData | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [isRetryable, setIsRetryable] = React.useState(false)

  // ─────────────────────────────────────────
  // SAFETY CHECK
  // ─────────────────────────────────────────
  if (!keyword) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground text-sm">
        No keyword data available
      </div>
    )
  }

  // Get commerce opportunity score (always available from local calculation)
  const commerceData = generateMockCommerceOpportunity(keyword.id, keyword.keyword, keyword.intent)

  // ─────────────────────────────────────────
  // LOAD AMAZON DATA
  // ─────────────────────────────────────────
  const loadAmazonData = async () => {
    setState("loading")
    setError(null)

    try {
      const result = await fetchAmazonData({ 
        keyword: keyword.keyword,
        country: "US" 
      })

      // Check result structure
      if (result?.data?.success && result.data.data) {
        setAmazonData(result.data.data)
        setState("success")
      } else {
        // Handle structured error from server action
        const errorMsg = result?.data?.error || result?.serverError || "Failed to fetch Amazon data"
        setError(errorMsg)
        setIsRetryable(result?.data?.isRetryable ?? true)
        setState("error")
      }
    } catch (err) {
      // Handle unexpected errors (network, etc.)
      console.error("[CommerceTab] Unexpected error:", err)
      setError(err instanceof Error ? err.message : "An unexpected error occurred")
      setIsRetryable(true)
      setState("error")
    }
  }

  // ─────────────────────────────────────────
  // HELPER FUNCTIONS
  // ─────────────────────────────────────────
  const getScoreColor = (score: number) => {
    if (score >= 70) return "text-emerald-500"
    if (score >= 50) return "text-yellow-500"
    return "text-red-500"
  }

  const getCompetitionColor = (level: string) => {
    switch (level) {
      case "low": return "text-emerald-500 bg-emerald-500/10"
      case "medium": return "text-yellow-500 bg-yellow-500/10"
      case "high": return "text-red-500 bg-red-500/10"
      default: return "text-muted-foreground bg-muted"
    }
  }

  // ─────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Commerce Opportunity Score (Always visible) */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
            <ShoppingCart className="h-4 w-4" />
            Commerce Opportunity
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className={cn("text-3xl font-bold", getScoreColor(commerceData.score))}>
              {commerceData.score}%
            </span>
            <Badge 
              variant="secondary" 
              className={commerceData.score >= 70 ? "bg-emerald-500/10 text-emerald-500" : ""}
            >
              {commerceData.score >= 70 ? "High Opportunity" : commerceData.score >= 50 ? "Moderate" : "Low Opportunity"}
            </Badge>
          </div>
          <Progress value={commerceData.score} className="h-2" />
          <p className="text-xs text-muted-foreground">
            {keyword.intent.includes("T") || keyword.intent.includes("C")
              ? "This keyword shows strong commercial intent - great for affiliate content!"
              : "Consider adding product comparisons or reviews to monetize this keyword."}
          </p>
        </CardContent>
      </Card>

      {/* Intent Analysis (Always visible) */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Intent Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {(keyword.intent ?? []).map((intent) => {
              const isCommercial = intent === "C" || intent === "T"
              const intentLabels: Record<string, string> = {
                "I": "Informational",
                "C": "Commercial",
                "T": "Transactional",
                "N": "Navigational"
              }
              return (
                <Badge
                  key={intent}
                  variant={isCommercial ? "default" : "secondary"}
                  className={isCommercial ? "bg-primary" : ""}
                >
                  {intentLabels[intent] || intent}
                  {isCommercial && " 💰"}
                </Badge>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* ─────────────────────────────────────────
          STATE-BASED RENDERING
      ───────────────────────────────────────── */}
      
      {/* IDLE: Show locked state */}
      {state === "idle" && (
        <LockedState onLoad={loadAmazonData} isLoading={false} />
      )}

      {/* LOADING: Show skeletons */}
      {state === "loading" && <LoadingState />}

      {/* ERROR: Show error with retry */}
      {state === "error" && error && (
        <ErrorState 
          error={error} 
          isRetryable={isRetryable} 
          onRetry={loadAmazonData} 
        />
      )}

      {/* SUCCESS: Show Amazon data */}
      {state === "success" && amazonData && (
        <>
          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-3">
            <Card className="bg-card/50 border-border/50">
              <CardContent className="p-3 text-center">
                <DollarSign className="h-5 w-5 text-emerald-500 mx-auto mb-1" />
                <div className="text-lg font-bold">${amazonData.avgPrice.toFixed(2)}</div>
                <div className="text-xs text-muted-foreground">Avg Price</div>
              </CardContent>
            </Card>
            <Card className="bg-card/50 border-border/50">
              <CardContent className="p-3 text-center">
                <Star className="h-5 w-5 text-yellow-500 mx-auto mb-1" />
                <div className="text-lg font-bold">{amazonData.avgRating.toFixed(1)}</div>
                <div className="text-xs text-muted-foreground">Avg Rating</div>
              </CardContent>
            </Card>
            <Card className="bg-card/50 border-border/50">
              <CardContent className="p-3 text-center">
                <Package className="h-5 w-5 text-primary mx-auto mb-1" />
                <div className="text-lg font-bold">{amazonData.totalProducts}</div>
                <div className="text-xs text-muted-foreground">Products</div>
              </CardContent>
            </Card>
          </div>

          {/* Competition Level */}
          <Card className="bg-card/50 border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Amazon Competition</span>
                <Badge className={getCompetitionColor(amazonData.competitionLevel)}>
                  {amazonData.competitionLevel.charAt(0).toUpperCase() + amazonData.competitionLevel.slice(1)}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Top Products */}
          <Card className="bg-card/50 border-border/50">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Top Products
              </CardTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={loadAmazonData}
                className="gap-1 h-7 text-xs"
              >
                <RefreshCw className="h-3 w-3" />
                Refresh
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {amazonData.products.length > 0 ? (
                amazonData.products.map((product) => (
                  <ProductCard key={product.asin} product={product} />
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No products found for this keyword
                </p>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

export default CommerceTab
