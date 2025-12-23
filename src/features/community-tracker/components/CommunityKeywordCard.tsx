/**
 * Community Keyword Card Component (Refactored)
 * Main wrapper that delegates to platform-specific views
 */

import { RedditKeywordView } from "./keyword-card/RedditKeywordView"
import { QuoraKeywordView } from "./keyword-card/QuoraKeywordView"
import type { CommunityKeyword } from "../types"

interface CommunityKeywordCardProps {
  keyword: CommunityKeyword
  platform: "reddit" | "quora"
  onDeleteKeyword?: (keywordId: string) => void
}

export function CommunityKeywordCard({ keyword, platform, onDeleteKeyword }: CommunityKeywordCardProps) {
  if (platform === "reddit") {
    return <RedditKeywordView keyword={keyword} onDelete={onDeleteKeyword} />
  }
  
  return <QuoraKeywordView keyword={keyword} onDelete={onDeleteKeyword} />
}

// Keyword List
export function CommunityKeywordList({ 
  keywords, 
  platform,
  onDeleteKeyword,
}: { 
  keywords: CommunityKeyword[]
  platform: "reddit" | "quora"
  onDeleteKeyword?: (keywordId: string) => void
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
      {keywords.map((keyword) => (
        <CommunityKeywordCard 
          key={keyword.id} 
          keyword={keyword} 
          platform={platform} 
          onDeleteKeyword={onDeleteKeyword}
        />
      ))}
    </div>
  )
}
