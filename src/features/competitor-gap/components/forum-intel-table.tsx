"use client"

import { useCallback } from "react"
import { Users, Sparkles } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { Checkbox } from "@/components/ui/checkbox"
import type { ForumIntelPost, SortField, SortDirection, RelatedKeyword } from "../types"
import {
  SourceBadge,
  CompetitionBadge,
  OpportunityScore,
  EngagementDisplay,
  SortHeader,
  RelatedKeywordsButton,
  ActionsDropdown,
  BulkActionsBar,
} from "./forum-intel-table/index"

interface ForumIntelTableProps {
  posts: ForumIntelPost[]
  selectedRows: Set<string>
  sortField: SortField
  sortDirection: SortDirection
  onSort: (field: SortField) => void
  onSelectAll: (checked: boolean) => void
  onSelectRow: (id: string, checked: boolean) => void
  onWriteArticle?: (post: ForumIntelPost) => void
  onAddToCalendar?: (post: ForumIntelPost) => void
}

export function ForumIntelTable({
  posts,
  selectedRows,
  sortField,
  sortDirection,
  onSort,
  onSelectAll,
  onSelectRow,
  onWriteArticle,
  onAddToCalendar,
}: ForumIntelTableProps) {
  
  const allSelected = posts.length > 0 && selectedRows.size === posts.length

  const handleWrite = useCallback((post: ForumIntelPost) => {
    if (onWriteArticle) {
      onWriteArticle(post)
    } else {
      console.log("Write article for:", post.topic)
    }
  }, [onWriteArticle])

  const handleAddToCalendar = useCallback((post: ForumIntelPost) => {
    if (onAddToCalendar) {
      onAddToCalendar(post)
    } else {
      console.log("Add to calendar:", post.topic)
    }
  }, [onAddToCalendar])

  const copyAllKeywords = (keywords: RelatedKeyword[]) => {
    const text = keywords.map(k => k.keyword).join("\n")
    navigator.clipboard.writeText(text)
    toast.success("✓ Copied to Clipboard", {
      description: `${keywords.length} keywords copied`,
      duration: 2000,
    })
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden -mx-3 sm:-mx-4 md:-mx-6">
      <BulkActionsBar
        selectedCount={selectedRows.size}
        onClearSelection={() => onSelectAll(false)}
      />

      <div className="flex-1 overflow-auto">
        <div className="min-w-[800px]">
          <table className="w-full">
          <thead className="sticky top-0 z-10">
            <tr className="bg-background border-b border-border">
              <th className="w-12 pl-3 sm:pl-4 md:pl-6 pr-2 py-4">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={(checked) => onSelectAll(!!checked)}
                  className="border-emerald-500/50 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                />
              </th>
              <th className="px-4 py-4 text-left">
                <span className="text-xs font-semibold text-muted-foreground">Topic / Question</span>
              </th>
              <th className="w-28 px-4 py-4 text-center">
                <span className="text-xs font-semibold text-muted-foreground">Source</span>
              </th>
              <th className="w-32 px-4 py-4">
                <SortHeader
                  label="Engagement"
                  field="engagement"
                  currentField={sortField}
                  direction={sortDirection}
                  onSort={onSort}
                  className="justify-center"
                />
              </th>
              <th className="w-28 px-4 py-4 text-center">
                <span className="text-xs font-semibold text-muted-foreground">Competition</span>
              </th>
              <th className="w-28 px-4 py-4">
                <SortHeader
                  label="Opportunity"
                  field="opportunity"
                  currentField={sortField}
                  direction={sortDirection}
                  onSort={onSort}
                  className="justify-center"
                />
              </th>
              <th className="w-28 pl-4 pr-3 sm:pr-4 md:pr-6 py-4 text-center">
                <span className="text-xs font-semibold text-muted-foreground">Actions</span>
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-border">
            {posts.map((post) => (
              <tr
                key={post.id}
                className={cn(
                  "group transition-all duration-150",
                  selectedRows.has(post.id) 
                    ? "bg-emerald-500/5 dark:bg-emerald-500/10" 
                    : "hover:bg-muted/50"
                )}
              >
                <td className="pl-3 sm:pl-4 md:pl-6 pr-2 py-4">
                  <Checkbox
                    checked={selectedRows.has(post.id)}
                    onCheckedChange={(checked) => onSelectRow(post.id, !!checked)}
                    className="border-emerald-500/50 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                  />
                </td>

                <td className="px-4 py-4">
                  <div className="max-w-md">
                    <span className="text-sm font-medium text-foreground line-clamp-2">
                      {post.topic}
                    </span>
                    {post.opportunityLevel === "high" && (
                      <div className="flex items-center gap-1 mt-1.5 text-[10px] text-emerald-600 dark:text-emerald-400">
                        <Sparkles className="w-3 h-3" />
                        <span>High opportunity</span>
                      </div>
                    )}
                  </div>
                </td>

                <td className="px-4 py-4">
                  <div className="flex justify-center">
                    <SourceBadge source={post.source} subSource={post.subSource} />
                  </div>
                </td>

                <td className="px-4 py-4">
                  <div className="flex justify-center">
                    <EngagementDisplay upvotes={post.upvotes} comments={post.comments} />
                  </div>
                </td>

                <td className="px-4 py-4">
                  <div className="flex justify-center">
                    <CompetitionBadge 
                      level={post.competitionLevel} 
                      articles={post.existingArticles} 
                    />
                  </div>
                </td>

                <td className="px-4 py-4">
                  <div className="flex justify-center">
                    <OpportunityScore score={post.opportunityScore} />
                  </div>
                </td>

                <td className="pl-4 pr-3 sm:pr-4 md:pr-6 py-4">
                  <div className="flex items-center justify-center gap-1">
                    <RelatedKeywordsButton 
                      keywords={post.relatedKeywords}
                      onCopyAll={() => copyAllKeywords(post.relatedKeywords)}
                    />
                    <ActionsDropdown
                      post={post}
                      onWrite={() => handleWrite(post)}
                      onAddToCalendar={() => handleAddToCalendar(post)}
                      onViewSource={() => window.open(post.url, "_blank")}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>

        {posts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="p-4 rounded-2xl bg-muted border border-border mb-4">
              <Users className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-foreground text-sm font-medium">No forum discussions found</p>
            <p className="text-muted-foreground text-xs mt-1">Try searching for a different topic</p>
          </div>
        )}
      </div>
    </div>
  )
}
