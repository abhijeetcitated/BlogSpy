"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  ExternalLink, 
  Clock, 
  Quote,
  Users,
  MoreVertical,
  Flag,
  CheckCircle,
  Wrench,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { AICitation } from "../types"
import { AI_PLATFORMS, CITATION_TYPES, PlatformIcons } from "../constants"
import { formatRelativeTime } from "../utils"

interface CitationCardProps {
  citation: AICitation
  isDemoMode?: boolean
  onDemoActionClick?: () => void
}

export function CitationCard({ citation, isDemoMode, onDemoActionClick }: CitationCardProps) {
  const router = useRouter()
  const [flagged, setFlagged] = useState(false)
  const platform = AI_PLATFORMS[citation.platform]
  const citationType = CITATION_TYPES[citation.citationType]

  // Sentiment dot color
  const getSentimentDot = () => {
    switch (citation.sentiment) {
      case 'positive':
        return <span className="w-2 h-2 rounded-full bg-emerald-500" title="Positive" />
      case 'negative':
        return <span className="w-2 h-2 rounded-full bg-red-500" title="Negative" />
      default:
        return <span className="w-2 h-2 rounded-full bg-gray-400" title="Neutral" />
    }
  }

  return (
    <Card className="bg-card border-border hover:border-muted-foreground/30 transition-colors">
      <CardContent className="p-3 sm:p-4">
        <div className="flex flex-col gap-2.5 sm:gap-3">
          {/* Header */}
          <div className="flex items-start justify-between gap-2 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Platform Icon */}
              <div className="p-1.5 sm:p-2 shrink-0">
                <span className={`${platform.color} [&>svg]:w-4 [&>svg]:h-4 sm:[&>svg]:w-5 sm:[&>svg]:h-5`}>
                  {PlatformIcons[citation.platform] && 
                    PlatformIcons[citation.platform]()}
                </span>
              </div>
              
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                  <span className={`text-sm sm:text-base font-medium ${platform.color}`}>
                    {platform.name}
                  </span>
                  <Badge 
                    variant="outline" 
                    className="text-[10px] sm:text-xs text-muted-foreground border-muted-foreground/30 px-1.5"
                  >
                    #{citation.position}
                  </Badge>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-muted-foreground mt-0.5">
                  <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3 shrink-0" />
                  <span className="truncate">{formatRelativeTime(citation.timestamp)}</span>
                </div>
              </div>
            </div>

            {/* Sentiment Dot + Citation Type Badge + Actions */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Sentiment Indicator Dot */}
              {getSentimentDot()}
              
              {/* Citation Type Badge */}
              <Badge 
                variant="outline"
                className={`shrink-0 text-[10px] sm:text-xs px-1.5 sm:px-2 ${
                  citation.sentiment === 'positive' 
                    ? "text-emerald-400 border-emerald-400/30"
                    : citation.sentiment === 'negative'
                    ? "text-red-400 border-red-400/30"
                    : "text-muted-foreground border-muted-foreground/30"
                }`}
              >
                <span className="hidden xs:inline">{citationType.icon}</span> {citationType.label}
              </Badge>

              {/* Actions Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <MoreVertical className="h-3.5 w-3.5 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem 
                    className="text-xs cursor-pointer"
                    onClick={isDemoMode ? onDemoActionClick : undefined}
                  >
                    <CheckCircle className="h-3.5 w-3.5 mr-2 text-emerald-500" />
                    Verify Accuracy (⚡ 1)
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="text-xs cursor-pointer"
                    onClick={() => window.open(citation.citedUrl, '_blank')}
                  >
                    <ExternalLink className="h-3.5 w-3.5 mr-2 text-blue-500" />
                    View Source
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="text-xs cursor-pointer"
                    onClick={isDemoMode ? onDemoActionClick : () => router.push('/dashboard/creation/schema-generator')}
                  >
                    <Wrench className="h-3.5 w-3.5 mr-2 text-violet-500" />
                    Fix / Update Schema
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={isDemoMode ? onDemoActionClick : () => setFlagged(!flagged)}
                    className="text-xs cursor-pointer text-amber-500 focus:text-amber-500"
                  >
                    <Flag className="h-3.5 w-3.5 mr-2" />
                    Flag as Hallucination
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Query */}
          <div className="bg-background/50 rounded-lg p-2.5 sm:p-3 border border-border">
            <p className="text-[10px] sm:text-xs text-muted-foreground mb-0.5 sm:mb-1">User Query:</p>
            <p className="text-xs sm:text-sm text-foreground font-medium line-clamp-2">
              "{citation.query}"
            </p>
          </div>

          {/* Context */}
          <div className="bg-muted/30 rounded-lg p-2.5 sm:p-3 border-l-2 border-primary/50">
            <div className="flex items-center gap-1 mb-0.5 sm:mb-1">
              <Quote className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-muted-foreground shrink-0" />
              <p className="text-[10px] sm:text-xs text-muted-foreground">AI Response:</p>
            </div>
            <p className="text-xs sm:text-sm text-foreground/80 italic line-clamp-3 sm:line-clamp-none">
              {citation.context}
            </p>
          </div>

          {/* Footer */}
          <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-2 pt-2 border-t border-border">
            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
              <span className="text-[10px] sm:text-xs text-muted-foreground shrink-0">Cited:</span>
              <a 
                href={citation.citedUrl}
                className="text-[10px] sm:text-xs text-primary hover:underline flex items-center gap-1 truncate"
              >
                <span className="truncate">{citation.citedTitle}</span>
                <ExternalLink className="h-2.5 w-2.5 sm:h-3 sm:w-3 shrink-0" />
              </a>
            </div>

            {citation.competitors.length > 0 && (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Users className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-muted-foreground shrink-0" />
                <span className="text-[10px] sm:text-xs text-muted-foreground truncate">
                  Also: {citation.competitors.slice(0, 2).join(", ")}
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
