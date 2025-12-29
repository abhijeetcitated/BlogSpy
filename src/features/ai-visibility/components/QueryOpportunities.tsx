"use client"

import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Target,
  ArrowUp,
  ArrowDown,
  ArrowUpRight,
  Zap,
  ShoppingCart,
  Brain,
  Plus,
} from "lucide-react"
import { QueryAnalysis } from "../types"
import { AI_PLATFORMS, PlatformIcons } from "../constants"

interface QueryOpportunitiesProps {
  queries: QueryAnalysis[]
  isDemoMode?: boolean
  onDemoActionClick?: () => void
}

// Detect intent based on query keywords
function detectIntent(query: string): 'buying' | 'learning' {
  const buyingKeywords = [
    'best', 'top', 'buy', 'price', 'pricing', 'cost', 'cheap', 'affordable',
    'vs', 'versus', 'compare', 'comparison', 'alternative', 'review', 'reviews',
    'recommend', 'should i', 'worth', 'deal', 'discount', 'coupon'
  ]
  const queryLower = query.toLowerCase()
  return buyingKeywords.some(kw => queryLower.includes(kw)) ? 'buying' : 'learning'
}

export function QueryOpportunities({ queries, isDemoMode, onDemoActionClick }: QueryOpportunitiesProps) {
  const router = useRouter()

  // Navigate to AI Writer with pre-filled context for optimization
  const handleOptimize = (query: string, intent: string) => {
    // Use URLSearchParams for clean encoding
    const params = new URLSearchParams({
      topic: query,                      // Pre-fill the topic input
      intent: intent.toLowerCase(),       // buying/learning intent
      source: 'ai_visibility',            // Track where user came from
      mode: 'seo_optimize'                // Trigger optimization mode in writer
    })

    router.push(`/dashboard/creation/ai-writer?${params.toString()}`)
  }

  const opportunityColors = {
    high: { text: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-400/30" },
    medium: { text: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-400/30" },
    low: { text: "text-muted-foreground", bg: "bg-muted/30", border: "border-muted-foreground/30" },
  }

  const intentConfig = {
    buying: {
      icon: ShoppingCart,
      label: "Buying",
      color: "text-amber-400",
      bgColor: "bg-amber-500/10",
      borderColor: "border-amber-400/30",
    },
    learning: {
      icon: Brain,
      label: "Learning",
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-400/30",
    },
  }

  // Empty State
  if (queries.length === 0) {
    return (
      <Card className="bg-card border-border">
        <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-sm sm:text-base font-semibold text-foreground flex items-center gap-2">
              <Zap className="h-4 w-4 text-amber-400 shrink-0" />
              <span className="truncate">Query Opportunities</span>
            </CardTitle>
            <Badge variant="outline" className="text-muted-foreground text-[10px] sm:text-xs whitespace-nowrap">
              0 queries
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="px-3 sm:px-6 pb-6 sm:pb-8">
          <div className="flex flex-col items-center justify-center py-8 sm:py-12 text-center">
            <div className="p-3 rounded-full bg-muted/50 mb-4">
              <Target className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">
              No keywords tracked yet
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm mb-6">
              Start tracking keywords to discover opportunities where your brand can appear in AI responses.
            </p>
            <Button 
              size="lg" 
              className="h-10 sm:h-11"
              onClick={isDemoMode ? onDemoActionClick : undefined}
            >
              <Plus className="h-4 w-4 mr-2" />
              Track your first Keyword (⚡ 1)
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-sm sm:text-base font-semibold text-foreground flex items-center gap-2">
            <Zap className="h-4 w-4 text-amber-400 shrink-0" />
            <span className="truncate">Query Opportunities</span>
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-muted-foreground text-[10px] sm:text-xs whitespace-nowrap">
              {queries.length} queries
            </Badge>
            <Button 
              size="sm" 
              className="h-7 sm:h-8 text-[10px] sm:text-xs bg-primary hover:bg-primary/90"
              onClick={isDemoMode ? onDemoActionClick : undefined}
            >
              <Plus className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1" />
              Track Keyword (⚡ 1)
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
        <div className="space-y-2">
          {queries.map((query, index) => {
            const colors = opportunityColors[query.opportunity]
            const positionDiff = query.competitorPosition - query.yourPosition
            const intent = detectIntent(query.query)
            const intentStyle = intentConfig[intent]
            const IntentIcon = intentStyle.icon
            
            return (
              <div 
                key={index}
                className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 p-2.5 sm:p-3 rounded-lg bg-background/50 hover:bg-muted/30 transition-colors"
              >
                {/* Query - Full width on mobile */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-xs sm:text-sm font-medium text-foreground line-clamp-2 sm:truncate">
                      "{query.query}"
                    </p>
                    {/* Agent Intent Badge */}
                    <Badge 
                      variant="outline" 
                      className={`${intentStyle.color} ${intentStyle.borderColor} ${intentStyle.bgColor} text-[9px] sm:text-[10px] px-1.5 py-0 h-4 shrink-0`}
                    >
                      <IntentIcon className="h-2.5 w-2.5 mr-0.5" />
                      {intentStyle.label}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] sm:text-xs text-muted-foreground">
                      Cited {query.frequency}x
                    </span>
                    <span className="text-[10px] sm:text-xs text-muted-foreground">•</span>
                    <div className="flex items-center gap-0.5 sm:gap-1">
                      {query.platforms.slice(0, 3).map((platform) => {
                        const IconRenderer = PlatformIcons[platform]
                        return (
                          <span key={platform} className={`${AI_PLATFORMS[platform].color} [&>svg]:w-3.5 [&>svg]:h-3.5 sm:[&>svg]:w-5 sm:[&>svg]:h-5`}>
                            {IconRenderer && IconRenderer()}
                          </span>
                        )
                      })}
                    </div>
                  </div>
                </div>

                {/* Stats row on mobile */}
                <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-4">
                  {/* Position */}
                  <div className="text-center sm:text-center">
                    <div className="flex items-center gap-0.5 sm:gap-1">
                      <span className="text-xs sm:text-sm font-semibold text-foreground">
                        #{query.yourPosition}
                      </span>
                      {positionDiff > 0 ? (
                        <ArrowUp className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-emerald-400" />
                      ) : positionDiff < 0 ? (
                        <ArrowDown className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-red-400" />
                      ) : null}
                    </div>
                    <span className="text-[10px] sm:text-xs text-muted-foreground">Your pos</span>
                  </div>

                  {/* Competitor - Hidden on very small screens */}
                  <div className="text-center hidden xs:block min-w-[60px] sm:min-w-20">
                    <p className="text-[10px] sm:text-xs font-medium text-muted-foreground truncate">
                      {query.topCompetitor}
                    </p>
                    <span className="text-[10px] sm:text-xs text-muted-foreground">
                      pos #{query.competitorPosition}
                    </span>
                  </div>

                  {/* Optimize Button */}
                  <Button 
                    size="sm" 
                    className="h-8 text-xs font-medium bg-amber-500 hover:bg-amber-600 text-black"
                    onClick={() => handleOptimize(query.query, intent)}
                  >
                    Optimize <ArrowUpRight className="ml-1 h-3 w-3" />
                  </Button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 mt-3 sm:mt-4 pt-2 sm:pt-3 border-t border-border">
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-400" />
            <span className="text-[10px] sm:text-xs text-muted-foreground">High</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-amber-400" />
            <span className="text-[10px] sm:text-xs text-muted-foreground">Medium</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-muted-foreground" />
            <span className="text-[10px] sm:text-xs text-muted-foreground">Low</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
