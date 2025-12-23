/**
 * Community Keyword Section Component
 * Main content area displaying filtered keywords
 */

import { CommunityKeywordList } from "./CommunityKeywordCard"
import type { CommunityKeyword, CommunityPlatform } from "../types"

interface CommunityKeywordSectionProps {
  keywords: CommunityKeyword[]
  platform: CommunityPlatform
  onDeleteKeyword?: (keywordId: string) => void
}

export function CommunityKeywordSection({ keywords, platform, onDeleteKeyword }: CommunityKeywordSectionProps) {
  return (
    <div className="lg:col-span-3 space-y-3 sm:space-y-4">
      <CommunityKeywordList keywords={keywords} platform={platform} onDeleteKeyword={onDeleteKeyword} />
    </div>
  )
}
