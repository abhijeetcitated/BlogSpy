"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Search, TrendingUp, Sparkles } from "lucide-react"

interface EmptyStateProps {
  type: "no-keywords" | "no-results" | "error"
  searchQuery?: string
  onAddKeyword?: () => void
  onRetry?: () => void
}

export function SocialTrackerEmptyState({ type, searchQuery, onAddKeyword, onRetry }: EmptyStateProps) {
  if (type === "no-keywords") {
    return (
      <Card className="bg-card border-border border-dashed">
        <CardContent className="p-8 sm:p-12 text-center">
          <div className="mx-auto w-16 h-16 mb-4 rounded-full bg-pink-500/10 flex items-center justify-center">
            <TrendingUp className="h-8 w-8 text-pink-500" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Start Tracking Social Keywords
          </h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-6">
            Add keywords to track your visibility across Pinterest, X, and Instagram. 
            Monitor rankings, impressions, and engagement in one place.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              onClick={onAddKeyword}
              className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Keyword
            </Button>
          </div>
          
          {/* Tips Section */}
          <div className="mt-8 pt-6 border-t border-border">
            <p className="text-xs text-muted-foreground mb-3 flex items-center justify-center gap-1">
              <Sparkles className="h-3 w-3" />
              Pro Tips
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-xs font-medium text-foreground mb-1">Pinterest</p>
                <p className="text-[10px] text-muted-foreground">Great for visual content, DIY, recipes, and lifestyle</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-xs font-medium text-foreground mb-1">X (Twitter)</p>
                <p className="text-[10px] text-muted-foreground">Best for news, trends, B2B, and tech topics</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-xs font-medium text-foreground mb-1">Instagram</p>
                <p className="text-[10px] text-muted-foreground">Ideal for lifestyle, products, and visual storytelling</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (type === "no-results") {
    return (
      <Card className="bg-card border-border">
        <CardContent className="p-8 text-center">
          <div className="mx-auto w-12 h-12 mb-4 rounded-full bg-muted flex items-center justify-center">
            <Search className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-base font-medium text-foreground mb-1">
            No keywords found
          </h3>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto">
            No keywords match &quot;{searchQuery}&quot;. Try a different search term or add a new keyword.
          </p>
        </CardContent>
      </Card>
    )
  }

  if (type === "error") {
    return (
      <Card className="bg-card border-red-500/20">
        <CardContent className="p-8 text-center">
          <div className="mx-auto w-12 h-12 mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
            <span className="text-2xl">⚠️</span>
          </div>
          <h3 className="text-base font-medium text-foreground mb-1">
            Failed to load data
          </h3>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto mb-4">
            There was an error loading your keywords. Please try again.
          </p>
          <Button variant="outline" onClick={onRetry}>
            Try Again
          </Button>
        </CardContent>
      </Card>
    )
  }

  return null
}
