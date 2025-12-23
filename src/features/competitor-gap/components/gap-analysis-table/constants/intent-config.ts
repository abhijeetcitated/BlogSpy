import { DollarSign, BookOpen, ShoppingCart, Compass } from "lucide-react"
import type { Intent } from "../../../types"

export const INTENT_CONFIG = {
  commercial: { 
    icon: "commercial", 
    label: "Commercial", 
    bg: "bg-amber-500/10 dark:bg-amber-500/15", 
    text: "text-amber-600 dark:text-amber-400",
    border: "border-amber-500/30"
  },
  informational: { 
    icon: "info", 
    label: "Info", 
    bg: "bg-blue-500/10 dark:bg-blue-500/15", 
    text: "text-blue-600 dark:text-blue-400",
    border: "border-blue-500/30"
  },
  transactional: { 
    icon: "transact", 
    label: "Transact", 
    bg: "bg-green-500/10 dark:bg-green-500/15", 
    text: "text-green-600 dark:text-green-400",
    border: "border-green-500/30"
  },
  navigational: { 
    icon: "navigate", 
    label: "Navigate", 
    bg: "bg-purple-500/10 dark:bg-purple-500/15", 
    text: "text-purple-600 dark:text-purple-400",
    border: "border-purple-500/30"
  },
} as const

export const INTENT_ICONS = {
  commercial: DollarSign,
  informational: BookOpen,
  transactional: ShoppingCart,
  navigational: Compass,
} as const
