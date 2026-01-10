// ============================================
// KEYWORD DETAILS DRAWER - Commerce Tab (Redesigned)
// ============================================
// Product-focused UI with compact metrics and hero product grid
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
  Zap,
  ExternalLink,
  TrendingUp
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
import { useKeywordStore } from "../../store"

// ============================================
// TYPES
// ============================================

interface CommerceTabProps {
  keyword: Keyword
  onRefresh?: () => void
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
    <Card className="relative overflow-hidden bg-gradient-to-br from-orange-500/5 to-yellow-500/5 border-orange-500/20">
      <CardContent className="p-8 text-center">
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
          className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white gap-2"
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
      <Skeleton className="h-16 w-full" />
      <div className="grid grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-64 w-full" />
        ))}
      </div>
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

/** Compact Market Insight Bar */
function MarketInsightBar({ amazonData }: { amazonData: AmazonData }) {
  const getCompetitionColor = (level: string) => {
    switch (level) {
      case "low": return "text-emerald-500"
      case "medium": return "text-yellow-500"
      case "high": return "text-red-500"
      default: return "text-muted-foreground"
    }
  }

  return (
    <div className="flex items-center justify-between gap-4 p-4 rounded-lg bg-muted/30 border border-border/50">
      <div className="flex items-center gap-2">
        <DollarSign className="h-5 w-5 text-emerald-500" />
        <div>
          <div className="text-xs text-muted-foreground">Avg Price</div>
          <div className="text-lg font-bold">${amazonData.avgPrice.toFixed(2)}</div>
        </div>
      </div>
      
      <div className="h-8 w-px bg-border" />
      
      <div className="flex items-center gap-2">
        <Package className="h-5 w-5 text-primary" />
        <div>
          <div className="text-xs text-muted-foreground">Products</div>
          <div className="text-lg font-bold">{amazonData.totalProducts.toLocaleString()}</div>
        </div>
      </div>
      
      <div className="h-8 w-px bg-border" />
      
      <div className="flex items-center gap-2">
        <TrendingUp className="h-5 w-5 text-blue-500" />
        <div>
          <div className="text-xs text-muted-foreground">Competition</div>
          <div className={cn("text-lg font-bold", getCompetitionColor(amazonData.competitionLevel))}>
            {amazonData.competitionLevel.charAt(0).toUpperCase() + amazonData.competitionLevel.slice(1)}
          </div>
        </div>
      </div>
    </div>
  )
}

/** Product card component - redesigned */
function ProductCard({ product }: { product: AmazonProduct }) {
  const isBestSeller = product.reviews > 1000
  const [imageError, setImageError] = React.useState(false)

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow group">
      <CardContent className="p-0">
        {/* Product Image */}
        <div className="relative aspect-square bg-muted/30 flex items-center justify-center overflow-hidden">
          {!imageError ? (
            <img
              src={product.imageUrl}
              alt={product.title}
              className="w-full h-full object-contain p-4"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
              <Package className="h-12 w-12" />
              <span className="text-xs">No Image</span>
            </div>
          )}
          {isBestSeller && (
            <Badge className="absolute top-2 right-2 bg-orange-500 text-white border-none">
              <Star className="h-3 w-3 mr-1 fill-white" />
              Best Seller
            </Badge>
          )}
          {product.isPrime && (
            <Badge className="absolute top-2 left-2 bg-blue-500 text-white border-none text-xs">
              Prime
            </Badge>
          )}
        </div>

        {/* Product Details */}
        <div className="p-4 space-y-3">
          {/* Title */}
          <h4 className="text-sm font-medium line-clamp-2 min-h-[2.5rem]">
            {product.title}
          </h4>

          {/* Rating */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
              <span className="font-semibold text-foreground">{product.rating.toFixed(1)}</span>
            </div>
            <span>•</span>
            <span>{product.reviews.toLocaleString()} reviews</span>
          </div>

          {/* Price */}
          <div className="text-2xl font-bold text-emerald-500">
            ${product.price.toFixed(2)}
          </div>

          {/* Action Button - Amazon Brand Colors */}
          <Button
            className="w-full gap-2 bg-gradient-to-b from-[#f7dfa5] to-[#f0c14b] hover:from-[#f5d78e] hover:to-[#e7b53f] text-[#111] font-semibold border border-[#a88734] shadow-sm transition-all"
            asChild
          >
            <a href={product.productUrl} target="_blank" rel="noopener noreferrer">
              View on Amazon
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// ============================================
// MAIN COMPONENT
// ============================================

export function CommerceTab({ keyword, onRefresh }: CommerceTabProps) {
  // ─────────────────────────────────────────
  // STATE MACHINE
  // ─────────────────────────────────────────
  const [state, setState] = React.useState<DrawerDataState>("idle")
  const [amazonData, setAmazonData] = React.useState<AmazonData | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [isRetryable, setIsRetryable] = React.useState(false)

  // ─────────────────────────────────────────
  // CACHE ACCESS (Zustand)
  // ─────────────────────────────────────────
  const getCachedData = useKeywordStore((s) => s.getCachedData)
  const setDrawerCache = useKeywordStore((s) => s.setDrawerCache)

  // ─────────────────────────────────────────
  // CACHE CHECK ON MOUNT
  // ─────────────────────────────────────────
  React.useEffect(() => {
    if (!keyword?.keyword) return
    
    const cached = getCachedData(keyword.keyword, "commerce") as AmazonData | null
    if (cached) {
      setAmazonData(cached)
      setState("success")
    }
  }, [keyword?.keyword, getCachedData])

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
  // LOAD AMAZON DATA (with cache-first strategy)
  // ─────────────────────────────────────────
  const loadAmazonData = async () => {
    // 1. Check cache first (FREE)
    const cached = getCachedData(keyword.keyword, "commerce") as AmazonData | null
    if (cached) {
      setAmazonData(cached)
      setState("success")
      return // No API call needed
    }

    // 2. Cache miss → Call API (PAID - 1 credit)
    setState("loading")
    setError(null)

    try {
      const result = await fetchAmazonData({
        keyword: keyword.keyword,
        country: "US"
      })

      // Check result structure
      if (result?.data?.success && result.data.data) {
        // Store in cache for future use
        setDrawerCache(keyword.keyword, "commerce", result.data.data)
        setAmazonData(result.data.data)
        setState("success")
        onRefresh?.()
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
          {/* Market Insight Bar */}
          <MarketInsightBar amazonData={amazonData} />

          {/* Product Grid (2 columns) */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-muted-foreground">Top Products</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={loadAmazonData}
                className="gap-1 h-7 text-xs"
              >
                <RefreshCw className="h-3 w-3" />
                Refresh
              </Button>
            </div>
            
            {amazonData.products.length > 0 ? (
              <div className="grid grid-cols-2 gap-4">
                {amazonData.products.map((product) => (
                  <ProductCard key={product.asin} product={product} />
                ))}
              </div>
            ) : (
              <Card className="bg-muted/30 border-dashed">
                <CardContent className="p-8 text-center">
                  <Package className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">
                    No products found for this keyword
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default CommerceTab
