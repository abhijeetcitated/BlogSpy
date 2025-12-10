"use client"

import { cn } from "@/lib/utils"
import { 
  Search, 
  FileText, 
  BarChart3, 
  TrendingUp, 
  Inbox,
  Plus,
  FolderOpen,
  Database,
  AlertCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"

type EmptyStateType = 
  | "no-data"
  | "no-results"
  | "no-keywords"
  | "no-content"
  | "no-rankings"
  | "no-trends"
  | "error"
  | "custom"

interface EmptyStateProps {
  type?: EmptyStateType
  title?: string
  description?: string
  icon?: React.ReactNode
  action?: {
    label: string
    onClick: () => void
  }
  secondaryAction?: {
    label: string
    onClick: () => void
  }
  className?: string
}

const defaultContent: Record<EmptyStateType, { icon: React.ReactNode; title: string; description: string }> = {
  "no-data": {
    icon: <Database className="h-8 w-8" />,
    title: "No data available",
    description: "There's no data to display at the moment.",
  },
  "no-results": {
    icon: <Search className="h-8 w-8" />,
    title: "No results found",
    description: "Try adjusting your search or filters to find what you're looking for.",
  },
  "no-keywords": {
    icon: <Search className="h-8 w-8" />,
    title: "No keywords yet",
    description: "Start by adding keywords to track or searching for new opportunities.",
  },
  "no-content": {
    icon: <FileText className="h-8 w-8" />,
    title: "No content found",
    description: "Start creating content to see it appear here.",
  },
  "no-rankings": {
    icon: <BarChart3 className="h-8 w-8" />,
    title: "No rankings tracked",
    description: "Add keywords to start tracking your search rankings.",
  },
  "no-trends": {
    icon: <TrendingUp className="h-8 w-8" />,
    title: "No trends available",
    description: "Check back later for trending topics in your industry.",
  },
  "error": {
    icon: <AlertCircle className="h-8 w-8" />,
    title: "Something went wrong",
    description: "We couldn't load the data. Please try again.",
  },
  "custom": {
    icon: <Inbox className="h-8 w-8" />,
    title: "Empty",
    description: "Nothing to show here.",
  },
}

export function EmptyState({
  type = "no-data",
  title,
  description,
  icon,
  action,
  secondaryAction,
  className,
}: EmptyStateProps) {
  const content = defaultContent[type]

  return (
    <div className={cn(
      "flex flex-col items-center justify-center min-h-[300px] p-8 text-center",
      className
    )}>
      <div className="h-16 w-16 rounded-full bg-slate-800/50 flex items-center justify-center mb-6 text-slate-400">
        {icon || content.icon}
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">
        {title || content.title}
      </h3>
      <p className="text-sm text-slate-400 max-w-md mb-6">
        {description || content.description}
      </p>
      
      <div className="flex items-center gap-3">
        {action && (
          <Button 
            onClick={action.onClick}
            className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white"
          >
            <Plus className="mr-2 h-4 w-4" />
            {action.label}
          </Button>
        )}
        {secondaryAction && (
          <Button 
            variant="outline" 
            onClick={secondaryAction.onClick}
            className="border-slate-700 text-slate-300 hover:bg-slate-800"
          >
            {secondaryAction.label}
          </Button>
        )}
      </div>
    </div>
  )
}

// Empty state for search results
export function SearchEmptyState({ query, onClear }: { query: string; onClear?: () => void }) {
  return (
    <EmptyState
      type="no-results"
      title={`No results for "${query}"`}
      description="Try different keywords or remove some filters."
      action={onClear ? { label: "Clear search", onClick: onClear } : undefined}
    />
  )
}

// Empty state for folders/lists
export function FolderEmptyState({ 
  folderName, 
  onCreate 
}: { 
  folderName: string
  onCreate?: () => void 
}) {
  return (
    <EmptyState
      icon={<FolderOpen className="h-8 w-8" />}
      title={`${folderName} is empty`}
      description={`Add items to ${folderName.toLowerCase()} to see them here.`}
      action={onCreate ? { label: "Add item", onClick: onCreate } : undefined}
    />
  )
}
