/**
 * Social Keyword Card - Main Component
 * Routes to platform-specific cards based on platform prop
 */

"use client"

import { memo } from "react"
import { PinterestKeywordCard } from "./PinterestKeywordCard"
import { TwitterKeywordCard } from "./TwitterKeywordCard"
import { InstagramKeywordCard } from "./InstagramKeywordCard"
import type { SocialKeyword, SocialPlatform } from "../../types"

interface SocialKeywordCardProps {
  keyword: SocialKeyword
  platform: SocialPlatform
  onDelete?: (keywordId: string) => void
  onViewDetails?: (keyword: SocialKeyword) => void
}

export const SocialKeywordCard = memo(function SocialKeywordCard({ 
  keyword, 
  platform, 
  onDelete, 
  onViewDetails 
}: SocialKeywordCardProps) {
  // Route to platform-specific card
  switch (platform) {
    case "pinterest":
      return (
        <PinterestKeywordCard 
          keyword={keyword} 
          onDelete={onDelete} 
          onViewDetails={onViewDetails} 
        />
      )
    case "twitter":
      return (
        <TwitterKeywordCard 
          keyword={keyword} 
          onDelete={onDelete} 
          onViewDetails={onViewDetails} 
        />
      )
    case "instagram":
      return (
        <InstagramKeywordCard 
          keyword={keyword} 
          onDelete={onDelete} 
          onViewDetails={onViewDetails} 
        />
      )
    default:
      return null
  }
})
