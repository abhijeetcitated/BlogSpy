import { Globe, HelpCircle, Code, Newspaper, Youtube } from "lucide-react"
import type { ForumSource } from "../../../types"

export const SOURCE_CONFIG: Record<ForumSource, { 
  icon: typeof Globe
  label: string
  fullName: string
  color: string
  bg: string
  border: string 
}> = {
  reddit: { 
    icon: Globe, 
    label: "Reddit", 
    fullName: "Reddit Community",
    color: "text-orange-600 dark:text-orange-400", 
    bg: "bg-orange-500/10 dark:bg-orange-500/15",
    border: "border-orange-500/30"
  },
  quora: { 
    icon: HelpCircle, 
    label: "Quora", 
    fullName: "Quora Q&A",
    color: "text-red-600 dark:text-red-400", 
    bg: "bg-red-500/10 dark:bg-red-500/15",
    border: "border-red-500/30"
  },
  stackoverflow: { 
    icon: Code, 
    label: "Stack Overflow", 
    fullName: "Stack Overflow",
    color: "text-amber-600 dark:text-amber-400", 
    bg: "bg-amber-500/10 dark:bg-amber-500/15",
    border: "border-amber-500/30"
  },
  hackernews: { 
    icon: Newspaper, 
    label: "Hacker News", 
    fullName: "Hacker News",
    color: "text-orange-600 dark:text-orange-400", 
    bg: "bg-orange-500/10 dark:bg-orange-500/15",
    border: "border-orange-500/30"
  },
  youtube: { 
    icon: Youtube, 
    label: "YouTube", 
    fullName: "YouTube Comments",
    color: "text-red-600 dark:text-red-400", 
    bg: "bg-red-500/10 dark:bg-red-500/15",
    border: "border-red-500/30"
  },
}
