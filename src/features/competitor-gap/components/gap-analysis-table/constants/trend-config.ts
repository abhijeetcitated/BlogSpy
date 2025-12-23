import { Rocket, ArrowUpRight, Minus, ArrowDownRight, TrendingDown } from "lucide-react"

export const TREND_CONFIG = {
  rising: { 
    icon: Rocket, 
    label: "Trending Up", 
    color: "text-emerald-600 dark:text-emerald-400", 
    bg: "bg-emerald-500/10 dark:bg-emerald-500/15",
    border: "border-emerald-500/30"
  },
  growing: { 
    icon: ArrowUpRight, 
    label: "Growing", 
    color: "text-green-600 dark:text-green-400", 
    bg: "bg-green-500/10 dark:bg-green-500/15",
    border: "border-green-500/30"
  },
  stable: { 
    icon: Minus, 
    label: "Stable", 
    color: "text-slate-600 dark:text-slate-400", 
    bg: "bg-slate-500/10 dark:bg-slate-500/15",
    border: "border-slate-500/30"
  },
  declining: { 
    icon: ArrowDownRight, 
    label: "Declining", 
    color: "text-orange-600 dark:text-orange-400", 
    bg: "bg-orange-500/10 dark:bg-orange-500/15",
    border: "border-orange-500/30"
  },
  falling: { 
    icon: TrendingDown, 
    label: "Dropping Fast", 
    color: "text-red-600 dark:text-red-400", 
    bg: "bg-red-500/10 dark:bg-red-500/15",
    border: "border-red-500/30"
  },
} as const
