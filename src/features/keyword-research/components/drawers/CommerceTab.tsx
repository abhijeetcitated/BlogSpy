// ============================================
// KEYWORD DETAILS DRAWER - Commerce Tab
// ============================================
// Displays commerce/e-commerce opportunities for the keyword
// with "Load Amazon Data" functionality
// ============================================

"use client"

import * as React from "react"
import { ShoppingCart, DollarSign, Package, Star, Loader2, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"

import type { Keyword } from "../../types"
import { generateMockCommerceOpportunity } from "@/lib/commerce-opportunity-calculator"

// ============================================
// TYPES
// ============================================

interface CommerceTabProps {
  keyword: Keyword
}

interface AmazonProduct {
  asin: string
  title: string
  price: number
  rating: number
  reviews: number
  category: string
  affiliatePotential: "high" | "medium" | "low"
}

interface AmazonData {
  products: AmazonProduct[]
  avgPrice: number
  avgRating: number
  totalProducts: number
  competitionLevel: "high" | "medium" | "low"
}

// ============================================
// MOCK DATA GENERATOR
// ============================================

function generateMockAmazonData(keyword: string): AmazonData {
  const hash = keyword.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
  
  const products: AmazonProduct[] = Array.from({ length: 5 }, (_, i) => ({
    asin: `B0${hash.toString().slice(0, 2)}${String(i).padStart(6, "0")}`,
    title: `${keyword.charAt(0).toUpperCase() + keyword.slice(1)} - ${["Premium", "Professional", "Best Seller", "Top Rated", "Budget"][i]} Option`,
    price: Math.round((19.99 + (hash % 100) + i * 15) * 100) / 100,
    rating: Math.round((3.5 + ((hash + i) % 15) / 10) * 10) / 10,
    reviews: Math.floor(100 + (hash * (i + 1)) % 10000),
    category: ["Electronics", "Home & Kitchen", "Sports", "Office", "Health"][i % 5],
    affiliatePotential: i < 2 ? "high" : i < 4 ? "medium" : "low",
  }))

  const avgPrice = products.reduce((sum, p) => sum + p.price, 0) / products.length
  const avgRating = products.reduce((sum, p) => sum + p.rating, 0) / products.length

  return {
    products,
    avgPrice: Math.round(avgPrice * 100) / 100,
    avgRating: Math.round(avgRating * 10) / 10,
    totalProducts: Math.floor(50 + (hash % 500)),
    competitionLevel: hash % 3 === 0 ? "low" : hash % 3 === 1 ? "medium" : "high",
  }
}

// ============================================
// COMPONENT
// ============================================

export function CommerceTab({ keyword }: CommerceTabProps) {
  const [amazonData, setAmazonData] = React.useState<AmazonData | null>(null)
  const [isLoading, setIsLoading] = React.useState(false)
  const [hasLoaded, setHasLoaded] = React.useState(false)

  // Get commerce opportunity score
  const commerceData = generateMockCommerceOpportunity(keyword.id, keyword.keyword, keyword.intent)

  const loadAmazonData = async () => {
    setIsLoading(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setAmazonData(generateMockAmazonData(keyword.keyword))
    setIsLoading(false)
    setHasLoaded(true)
  }

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

  const getAffiliateBadge = (potential: string) => {
    switch (potential) {
      case "high": return { color: "bg-emerald-500/10 text-emerald-500", label: "High Potential" }
      case "medium": return { color: "bg-yellow-500/10 text-yellow-500", label: "Medium Potential" }
      default: return { color: "bg-muted text-muted-foreground", label: "Low Potential" }
    }
  }

  return (
    <div className="space-y-6">
      {/* Commerce Opportunity Score */}
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
            <Badge variant="secondary" className={commerceData.score >= 70 ? "bg-emerald-500/10 text-emerald-500" : ""}>
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

      {/* Intent Analysis */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Intent Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {keyword.intent.map((intent) => {
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

      {/* Load Amazon Data Button */}
      {!hasLoaded && (
        <Card className="bg-linear-to-br from-orange-500/10 to-yellow-500/10 border-orange-500/20">
          <CardContent className="p-6 text-center">
            <Package className="h-12 w-12 text-orange-500 mx-auto mb-4" />
            <CardTitle className="text-lg mb-2">Amazon Product Data</CardTitle>
            <CardDescription className="mb-4">
              Load real-time Amazon product data to discover affiliate opportunities for this keyword.
            </CardDescription>
            <Button
              onClick={loadAmazonData}
              disabled={isLoading}
              className="bg-orange-500 hover:bg-orange-600"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Load Amazon Data
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      )}

      {/* Amazon Data Results */}
      {amazonData && !isLoading && (
        <>
          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-3">
            <Card className="bg-card/50 border-border/50">
              <CardContent className="p-3 text-center">
                <DollarSign className="h-5 w-5 text-emerald-500 mx-auto mb-1" />
                <div className="text-lg font-bold">${amazonData.avgPrice}</div>
                <div className="text-xs text-muted-foreground">Avg Price</div>
              </CardContent>
            </Card>
            <Card className="bg-card/50 border-border/50">
              <CardContent className="p-3 text-center">
                <Star className="h-5 w-5 text-yellow-500 mx-auto mb-1" />
                <div className="text-lg font-bold">{amazonData.avgRating}</div>
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
              <Button variant="ghost" size="sm" onClick={loadAmazonData}>
                <RefreshCw className="h-3 w-3 mr-1" />
                Refresh
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {amazonData.products.map((product) => {
                const badge = getAffiliateBadge(product.affiliatePotential)
                return (
                  <div
                    key={product.asin}
                    className="p-3 rounded-lg bg-muted/30 border border-border/50 space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-sm font-medium line-clamp-2">{product.title}</span>
                      <Badge className={cn("shrink-0 text-xs", badge.color)}>
                        {badge.label}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="text-emerald-500 font-semibold">${product.price}</span>
                      <span className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                        {product.rating}
                      </span>
                      <span>{product.reviews.toLocaleString()} reviews</span>
                      <span className="text-primary">{product.category}</span>
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

export default CommerceTab
