import { AlertCircle, Target, Crown, Zap } from "lucide-react"

export const GAP_CONFIG = {
  missing: { 
    icon: AlertCircle,
    label: "Missing", 
    bg: "bg-red-500/10 dark:bg-red-500/15", 
    text: "text-red-600 dark:text-red-400",
    border: "border-red-500/30"
  },
  weak: { 
    icon: Target,
    label: "Weak", 
    bg: "bg-yellow-500/10 dark:bg-yellow-500/15", 
    text: "text-yellow-600 dark:text-yellow-400",
    border: "border-yellow-500/30"
  },
  strong: { 
    icon: Crown,
    label: "Strong", 
    bg: "bg-emerald-500/10 dark:bg-emerald-500/15", 
    text: "text-emerald-600 dark:text-emerald-400",
    border: "border-emerald-500/30"
  },
  shared: { 
    icon: Zap,
    label: "Shared", 
    bg: "bg-blue-500/10 dark:bg-blue-500/15", 
    text: "text-blue-600 dark:text-blue-400",
    border: "border-blue-500/30"
  },
  all: { 
    icon: Zap,
    label: "All", 
    bg: "bg-muted", 
    text: "text-muted-foreground",
    border: "border-border"
  },
} as const
